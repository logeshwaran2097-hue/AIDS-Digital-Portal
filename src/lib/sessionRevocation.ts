import { prisma } from './prisma'

interface SessionRevocationStore {
  revokedJtis: Map<string, number> // jti -> expiresAt (timestamp)
}

const globalForRevocation = globalThis as unknown as {
  __sessionRevocationStore?: SessionRevocationStore
}

if (!globalForRevocation.__sessionRevocationStore) {
  globalForRevocation.__sessionRevocationStore = {
    revokedJtis: new Map(),
  }
}

const store = globalForRevocation.__sessionRevocationStore!

/**
 * Revokes a session token server-side by its jti or token hash until its expiration time.
 */
export async function revokeSessionToken(jti: string, expiresAtTimestamp: number): Promise<void> {
  if (!jti) return

  // 1. Add to fast memory set
  store.revokedJtis.set(jti, expiresAtTimestamp)

  // 2. Persist in database (using AuditLog or OTP with future expiry so it survives server restarts)
  try {
    await prisma.oTP.create({
      data: {
        email: 'revoked-session',
        codeHash: jti,
        expiresAt: new Date(expiresAtTimestamp),
        used: true,
      },
    })
  } catch (err) {
    // Non-fatal if DB write fails, memory cache is already active
    console.warn('[SessionRevocation] Error persisting token revocation:', err)
  }
}

/**
 * Checks if a session token / jti has been revoked server-side.
 */
export async function isSessionTokenRevoked(jti: string): Promise<boolean> {
  if (!jti) return false

  const now = Date.now()

  // 1. Check in-memory store
  const memExpiry = store.revokedJtis.get(jti)
  if (memExpiry) {
    if (now >= memExpiry) {
      store.revokedJtis.delete(jti)
      return false
    }
    return true
  }

  // 2. Check persistent database
  try {
    const record = await prisma.oTP.findFirst({
      where: {
        email: 'revoked-session',
        codeHash: jti,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, expiresAt: true },
    })

    if (record) {
      store.revokedJtis.set(jti, record.expiresAt.getTime())
      return true
    }
  } catch {
    // If DB is temporarily unreachable, fallback to memory state
  }

  return false
}
