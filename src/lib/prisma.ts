import { PrismaClient } from '@prisma/client'

// IPv4-capable Supabase connection pooler in ap-northeast-1 (Tokyo) for serverless / Vercel
// Port 6543 = Transaction Mode (multiplexed for serverless, eliminates EMAXCONNSESSION 15-client limit)
// Port 5432 = Session Mode (reserved for DIRECT_URL migrations/schema push)
const DEFAULT_POSTGRES_URL = 'postgresql://postgres.hiqwsermiypdnnkuzihw:dfghjkhgc4657689@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1'
const DEFAULT_DIRECT_URL = 'postgresql://postgres.hiqwsermiypdnnkuzihw:dfghjkhgc4657689@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require'

function normalizeSupabaseUrl(rawUrl: string, isDirect = false): string {
  try {
    const parsed = new URL(rawUrl)
    // db.[ref].supabase.co is IPv6-only and fails on AWS Lambda / Vercel Serverless Functions.
    // Transparently rewrite to the IPv4-capable Supabase connection pooler:
    if (parsed.hostname.includes('db.hiqwsermiypdnnkuzihw.supabase.co') || (parsed.hostname.includes('.supabase.co') && !parsed.hostname.includes('.pooler.supabase.'))) {
      parsed.hostname = 'aws-0-ap-northeast-1.pooler.supabase.com'
      if (parsed.username === 'postgres') {
        parsed.username = 'postgres.hiqwsermiypdnnkuzihw'
      }
    }

    if (parsed.hostname.includes('.pooler.supabase.')) {
      if (isDirect) {
        // Direct / Migration connections use session mode (port 5432)
        parsed.port = '5432'
        parsed.searchParams.delete('pgbouncer')
      } else {
        // Runtime serverless queries MUST use Transaction mode (port 6543) with pgbouncer=true.
        // Port 5432 is Session mode which has a strict 15-client limit (EMAXCONNSESSION).
        parsed.port = '6543'
        parsed.searchParams.set('pgbouncer', 'true')
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
  process.env.DATABASE_URL = normalizeSupabaseUrl(process.env.DATABASE_URL, false)
}

if (!process.env.DIRECT_URL || process.env.DIRECT_URL.startsWith('file:') || process.env.DIRECT_URL.includes('[YOUR-PASSWORD]') || process.env.DIRECT_URL.includes('db.hiqwsermiypdnnkuzihw.supabase.co')) {
  process.env.DIRECT_URL = DEFAULT_DIRECT_URL
} else {
  process.env.DIRECT_URL = normalizeSupabaseUrl(process.env.DIRECT_URL, true)
}

const globalForPrisma = globalThis as unknown as {
  basePrisma?: PrismaClient
  prisma?: PrismaClient
}

// Compute optimized connection pooling parameters for PostgreSQL (Supabase / Render)
function getOptimizedDatabaseUrl(): string {
  const rawUrl = process.env.DATABASE_URL || DEFAULT_POSTGRES_URL
  const url = normalizeSupabaseUrl(rawUrl, false)

  try {
    const parsed = new URL(url)
    if (!parsed.searchParams.has('sslmode')) {
      parsed.searchParams.set('sslmode', 'require')
    }
    // Transaction Mode pooler requires pgbouncer=true
    parsed.searchParams.set('pgbouncer', 'true')
    // Connection limit of 5 per serverless instance allows concurrent Promise.all queries without queue delays
    parsed.searchParams.set('connection_limit', '5')
    // Pool timeout of 15s allows queued requests to smoothly wait rather than erroring out
    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', '15')
    }
    if (!parsed.searchParams.has('connect_timeout')) {
      parsed.searchParams.set('connect_timeout', '10')
    }
    // Disable prepared statement cache for transaction mode pooler (PgBouncer/Supavisor)
    parsed.searchParams.set('statement_cache_size', '0')
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
              msg.includes('remaining connection slots are reserved') ||
              msg.includes('EMAXCONNSESSION') ||
              msg.includes('max clients reached') ||
              msg.includes('pool_size')

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