import { PrismaClient } from '@prisma/client'

// Default PostgreSQL fallback connection for serverless / production if unset
const DEFAULT_POSTGRES_URL = 'postgresql://aifactorytwin_user:JxcJgNvRKl3rZDnLCXtBJ0kKu1Q3KLXd@dpg-da16l6dbedkc73c6dqug-a.oregon-postgres.render.com:5432/vsb_aids_portal?sslmode=require'

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')) {
  process.env.DATABASE_URL = DEFAULT_POSTGRES_URL
}
if (!process.env.DIRECT_URL || process.env.DIRECT_URL.startsWith('file:')) {
  process.env.DIRECT_URL = process.env.DATABASE_URL
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Compute optimized connection pooling parameters for PostgreSQL (Supabase / Render)
function getOptimizedDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || DEFAULT_POSTGRES_URL

  // Ensure high-concurrency pool limits and connection timeouts are tuned
  try {
    const parsed = new URL(url)
    // Connection limit of 10 allows parallel queries (e.g. Promise.all) within requests
    // to execute concurrently without queuing behind a single connection bottleneck
    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', '10')
    }
    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', '15')
    }
    if (!parsed.searchParams.has('connect_timeout')) {
      parsed.searchParams.set('connect_timeout', '10')
    }
    // Cache up to 100 prepared SQL statements to eliminate query planning overhead on PostgreSQL
    if (!parsed.searchParams.has('statement_cache_size')) {
      parsed.searchParams.set('statement_cache_size', '100')
    }
    return parsed.toString()
  } catch {
    return url
  }
}

const optimizedUrl = getOptimizedDatabaseUrl()

const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: optimizedUrl } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

export const prisma = basePrisma.$extends({
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
            msg.includes("Can't reach database server")

          if (isTransient && attempt <= 2) {
            console.warn(`[Prisma Retry] Reconnecting on transient error ${model}.${operation} (attempt ${attempt}):`, msg)
            await new Promise((r) => setTimeout(r, 500 * attempt))
            return executeWithRetry(attempt + 1)
          }
          throw error
        }
      }
      return executeWithRetry()
    },
  },
}) as unknown as PrismaClient

// Cache basePrisma on globalThis in both dev and production serverless containers
globalForPrisma.prisma = basePrisma

export default prisma