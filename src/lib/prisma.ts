import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Handle SQLite on Vercel Serverless environment (where only /tmp is writable)
if (process.env.VERCEL) {
  try {
    const tmpDbPath = path.join('/tmp', 'dev.db')
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
      ]
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          fs.copyFileSync(candidate, tmpDbPath)
          break
        }
      }
    }
    process.env.DATABASE_URL = `file:${tmpDbPath}`
  } catch (err) {
    console.error('Failed to configure /tmp database for Vercel:', err)
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma