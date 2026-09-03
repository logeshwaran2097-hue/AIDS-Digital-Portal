const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Ensure essential environment variables exist during build on Vercel
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db'
}
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'your-super-secret-key-change-in-production-min-32-chars'
}
if (!process.env.ADMIN_EMAIL) {
  process.env.ADMIN_EMAIL = 'lonelyboy44y@gmail.com'
}

console.log('[BUILD] 🚀 Starting VSB AI & DS Portal build pipeline...')
console.log(`[BUILD] Environment: ${process.env.NODE_ENV || 'production'}`)
console.log(`[BUILD] Database URL: ${process.env.DATABASE_URL}`)

try {
  // Sync dev.db across root and prisma directory
  const rootDb = path.join(process.cwd(), 'dev.db')
  const prismaDb = path.join(process.cwd(), 'prisma', 'dev.db')
  if (fs.existsSync(prismaDb) && !fs.existsSync(rootDb)) {
    fs.copyFileSync(prismaDb, rootDb)
  } else if (fs.existsSync(rootDb) && !fs.existsSync(prismaDb)) {
    fs.copyFileSync(rootDb, prismaDb)
  }

  console.log('[BUILD] [1/3] Running prisma generate...')
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env })

  console.log('[BUILD] [2/3] Running prisma db push...')
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit', env: process.env })

  console.log('[BUILD] [3/3] Running next build...')
  execSync('npx cross-env NODE_OPTIONS="--max-old-space-size=4096" next build', { stdio: 'inherit', env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' } })

  console.log('[BUILD] ✅ All build steps completed successfully!')
} catch (error) {
  console.error('[BUILD] ❌ Build execution failed:', error)
  process.exit(1)
}
