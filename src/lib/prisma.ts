import { PrismaClient } from '@prisma/client'

// IPv4-capable Supabase connection pooler in ap-northeast-1 (Tokyo) for serverless / Vercel
const DEFAULT_POSTGRES_URL = 'postgresql://postgres.hiqwsermiypdnnkuzihw:dfghjkhgc4657689@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require'

function normalizeSupabaseUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl)
    // db.[ref].supabase.co is IPv6-only and fails on AWS Lambda / Vercel Serverless Functions.
    // Transparently rewrite to the IPv4-capable Supabase connection pooler:
    if (parsed.hostname.includes('db.hiqwsermiypdnnkuzihw.supabase.co') || (parsed.hostname.includes('.supabase.co') && !parsed.hostname.includes('.pooler.supabase.'))) {
      parsed.hostname = 'aws-0-ap-northeast-1.pooler.supabase.com'
      parsed.port = '5432'
      if (parsed.username === 'postgres') {
        parsed.username = 'postgres.hiqwsermiypdnnkuzihw'
      }
    }
    return parsed.toString()
  } catch {
    return rawUrl
  }
}

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:') || process.env.DATABASE_URL.includes('[YOUR-PASSWORD]') || process.env.DATABASE_URL.includes('db.hiqwsermiypdnnkuzihw.supabase.co')) {
  process.env.DATABASE_URL = DEFAULT_POSTGRES_URL
} else {
  process.env.DATABASE_URL = normalizeSupabaseUrl(process.env.DATABASE_URL)
}

if (!process.env.DIRECT_URL || process.env.DIRECT_URL.startsWith('file:') || process.env.DIRECT_URL.includes('[YOUR-PASSWORD]') || process.env.DIRECT_URL.includes('db.hiqwsermiypdnnkuzihw.supabase.co')) {
  process.env.DIRECT_URL = process.env.DATABASE_URL
} else {
  process.env.DIRECT_URL = normalizeSupabaseUrl(process.env.DIRECT_URL)
}

const globalForPrisma = globalThis as unknown as {
  basePrisma?: PrismaClient
  prisma?: PrismaClient
}

// Compute optimized connection pooling parameters for PostgreSQL (Supabase / Render)
function getOptimizedDatabaseUrl(): string {
  const rawUrl = process.env.DATABASE_URL || DEFAULT_POSTGRES_URL
  const url = normalizeSupabaseUrl(rawUrl)

  try {
    const parsed = new URL(url)
    if (!parsed.searchParams.has('sslmode')) {
      parsed.searchParams.set('sslmode', 'require')
    }
    // Connection limit of 10 matches Supabase free/standard tier safely without slot exhaustion
    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', '10')
    }
    // Pool timeout of 30s allows queued requests to smoothly wait rather than erroring out
    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', '30')
    }
    if (!parsed.searchParams.has('connect_timeout')) {
      parsed.searchParams.set('connect_timeout', '15')
    }
    // Cache up to 200 prepared SQL statements to eliminate query planning overhead on PostgreSQL
    if (!parsed.searchParams.has('statement_cache_size')) {
      parsed.searchParams.set('statement_cache_size', '200')
    }
    return parsed.toString()
  } catch {
    return url
  }
}

const optimizedUrl = getOptimizedDatabaseUrl()

const basePrisma =
  globalForPrisma.basePrisma ??
  new PrismaClient({
    datasources: { db: { url: optimizedUrl } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (!globalForPrisma.basePrisma) {
  globalForPrisma.basePrisma = basePrisma
  // Eager non-blocking connection warmup
  if (typeof window === 'undefined') {
    basePrisma.$connect().catch(() => {})
  }
}

export const prisma =
  globalForPrisma.prisma ??
  (basePrisma.$extends({
    query: {
      $allOperations({ model, operation, args, query }) {
        const executeWithRetry = async (attempt = 1): Promise<any> => {
          try {
            return await query(args)
          } catch (error) {
            const msg = String((error as any)?.message || error || '')
            const isTransient =
              msg.includes('closed the connection') ||
              msg.includes('Connection refused') ||
              msg.includes('Connection timed out') ||
              msg.includes("Can't reach database server") ||
              msg.includes('Timed out fetching a new connection') ||
              msg.includes('connection pool') ||
              msg.includes('remaining connection slots are reserved')

            if (isTransient && attempt <= 3) {
              console.warn(`[Prisma Retry] Reconnecting on transient error ${model}.${operation} (attempt ${attempt}):`, msg)
              await new Promise((r) => setTimeout(r, 300 * attempt))
              return executeWithRetry(attempt + 1)
            }
            throw error
          }
        }
        return executeWithRetry()
      },
    },
  }) as unknown as PrismaClient)

globalForPrisma.prisma = prisma

export default prisma