import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Only configure SQLite /tmp for Vercel if DATABASE_URL starts with file: or is unset and not using PostgreSQL
if ((process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) && (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:'))) {
  try {
    const tmpDbPath = path.join('/tmp', 'dev.db')
    const needsCopy = !fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size === 0

    if (needsCopy) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
        path.join(__dirname, '..', '..', '..', 'prisma', 'dev.db'),
        path.join(__dirname, '..', 'prisma', 'dev.db'),
        path.join(__dirname, 'prisma', 'dev.db'),
        path.join(__dirname, 'dev.db'),
        path.join('/var/task', 'prisma', 'dev.db'),
        path.join('/var/task', 'dev.db'),
      ]
      for (const candidate of candidates) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).size > 0) {
          fs.copyFileSync(candidate, tmpDbPath)
          console.log(`[PRISMA] SQLite DB copied to /tmp/dev.db from: ${candidate}`)
          break
        }
      }
    }
    if (fs.existsSync(tmpDbPath)) {
      process.env.DATABASE_URL = `file:${tmpDbPath}`
    }
  } catch (err) {
    console.error('Failed to configure /tmp database for Vercel:', err)
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Compute optimized connection pooling parameters for PostgreSQL (Supabase / Render)
function getOptimizedDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url) return undefined
  if (url.startsWith('file:')) return url

  // Ensure high-concurrency pool limits and connection timeouts are tuned
  try {
    const parsed = new URL(url)
    // In serverless / high concurrency, 5-10 connections per worker avoids pool exhaustion
    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', process.env.VERCEL ? '5' : '10')
    }
    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', '10')
    }
    if (!parsed.searchParams.has('connect_timeout')) {
      parsed.searchParams.set('connect_timeout', '10')
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
    datasources: optimizedUrl ? { db: { url: optimizedUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

// Enable ultra-fast SQLite WAL mode & concurrency optimizations if on SQLite
if (process.env.DATABASE_URL?.startsWith('file:') || !process.env.DATABASE_URL) {
  try {
    prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;').catch(() => {})
    prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL;').catch(() => {})
    prisma.$queryRawUnsafe('PRAGMA busy_timeout = 10000;').catch(() => {})
    prisma.$queryRawUnsafe('PRAGMA temp_store = MEMORY;').catch(() => {})
    prisma.$queryRawUnsafe('PRAGMA cache_size = -64000;').catch(() => {})
    prisma.$queryRawUnsafe('PRAGMA mmap_size = 30000000000;').catch(() => {})
  } catch {}
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma