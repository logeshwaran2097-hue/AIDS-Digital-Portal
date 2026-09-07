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
    // In serverless, each container handles 1 request at a time.
    // Setting connection_limit to 1 avoids overloading Render's free tier RAM limit.
    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', process.env.VERCEL ? '1' : '5')
    }
    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', '20')
    }
    if (!parsed.searchParams.has('connect_timeout')) {
      parsed.searchParams.set('connect_timeout', '20')
    }
    if (!parsed.searchParams.has('statement_cache_size')) {
      parsed.searchParams.set('statement_cache_size', '50')
    }
    return parsed.toString()
  } catch {
    return url
  }
}

const optimizedUrl = getOptimizedDatabaseUrl()

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: optimizedUrl } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

// Cache prisma on globalThis in both dev and production serverless containers
globalForPrisma.prisma = prisma

export default prisma