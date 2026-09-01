import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Handle SQLite on Vercel Serverless environment (where only /tmp is writable)
if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
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

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: process.env.DATABASE_URL ? { db: { url: process.env.DATABASE_URL } } : undefined,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Enable ultra-fast SQLite WAL mode & concurrency optimizations
if (process.env.DATABASE_URL?.startsWith('file:') || !process.env.DATABASE_URL) {
  try {
    prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;').catch(() => {})
    prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL;').catch(() => {})
    prisma.$queryRawUnsafe('PRAGMA busy_timeout = 10000;').catch(() => {})
    prisma.$queryRawUnsafe('PRAGMA temp_store = MEMORY;').catch(() => {})
  } catch {}
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma