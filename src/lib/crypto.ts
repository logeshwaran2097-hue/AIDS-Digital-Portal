import crypto from 'crypto'

/**
 * =========================================================================
 * 🔐 RECOMMENDED SECURITY ARCHITECTURE
 * =========================================================================
 * 1. Network Communication  → HTTPS + TLS 1.3 (Enforced via HSTS & secure headers)
 * 2. Local / At-Rest Data   → AES-256-GCM (Authenticated symmetric encryption)
 * 3. Password Storage       → Argon2id / Scrypt (One-way salted memory-hard hashing)
 * =========================================================================
 */

const DEFAULT_ENCRYPTION_KEY = process.env.DATA_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || 'vsb-portal-aes-256-gcm-master-key-32b'

/**
 * Derives a 32-byte (256-bit) buffer key from the provided secret key using SHA-256
 */
function getDerivedKey(secret?: string): Buffer {
  const baseKey = secret || DEFAULT_ENCRYPTION_KEY
  return crypto.createHash('sha256').update(baseKey).digest()
}

/**
 * AES-256-GCM Encrypted Payload Structure
 */
export interface EncryptedPayload {
  iv: string         // Hex-encoded 12-byte initialization vector (nonce)
  authTag: string    // Hex-encoded 16-byte authentication tag
  cipherText: string // Hex-encoded encrypted data
  version: string    // Encryption scheme version tag
}

/**
 * 2. Sensitive Data Encryption → AES-256-GCM
 * Encrypts arbitrary sensitive text (tokens, sensitive records, PII) using AES-256-GCM
 * with a cryptographically secure unique 96-bit (12-byte) IV and 128-bit authentication tag.
 */
export function encryptAES256GCM(plainText: string, secret?: string): string {
  if (!plainText) return ''
  
  const key = getDerivedKey(secret)
  // 12 bytes IV is standard for GCM to prevent counter repetition
  const iv = crypto.randomBytes(12)
  
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  let cipherText = cipher.update(plainText, 'utf8', 'hex')
  cipherText += cipher.final('hex')
  
  const authTag = cipher.getAuthTag().toString('hex')
  
  const payload: EncryptedPayload = {
    iv: iv.toString('hex'),
    authTag,
    cipherText,
    version: 'aes-256-gcm-v1',
  }
  
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

/**
 * 2. Sensitive Data Decryption → AES-256-GCM
 * Decrypts and verifies authenticity of an AES-256-GCM encrypted payload.
 * Returns null if tampered with or corrupted.
 */
export function decryptAES256GCM(encryptedBase64: string, secret?: string): string | null {
  if (!encryptedBase64) return null
  
  try {
    const rawJson = Buffer.from(encryptedBase64, 'base64').toString('utf8')
    const payload: EncryptedPayload = JSON.parse(rawJson)
    
    if (!payload.iv || !payload.authTag || !payload.cipherText) {
      return null
    }
    
    const key = getDerivedKey(secret)
    const iv = Buffer.from(payload.iv, 'hex')
    const authTag = Buffer.from(payload.authTag, 'hex')
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)
    
    let plainText = decipher.update(payload.cipherText, 'hex', 'utf8')
    plainText += decipher.final('utf8')
    
    return plainText
  } catch (error) {
    console.error('AES-256-GCM Decryption failed / Authentication tag mismatch:', error)
    return null
  }
}

/**
 * 3. Password Hashing → Scrypt / Argon2id Grade One-Way Hashing
 * Hashes passwords using memory-hard scrypt (built into Node.js crypto standard)
 * formatted with salt and timing-safe verification.
 */
export async function hashPasswordScrypt(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex')
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err)
      resolve(`$scrypt$N=16384,r=8,p=1$${salt}$${derivedKey.toString('hex')}`)
    })
  })
}

/**
 * Verifies passwords against scrypt hashes in constant time.
 */
export async function verifyPasswordScrypt(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const parts = storedHash.split('$')
      if (parts.length < 5 || parts[1] !== 'scrypt') {
        return resolve(false)
      }
      const salt = parts[3]
      const originalKey = parts[4]
      
      crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
        if (err) return resolve(false)
        const keyBuffer = Buffer.from(originalKey, 'hex')
        if (keyBuffer.length !== derivedKey.length) return resolve(false)
        resolve(crypto.timingSafeEqual(keyBuffer, derivedKey))
      })
    } catch {
      resolve(false)
    }
  })
}

/**
 * Security Metadata Descriptor
 */
export const SECURITY_SPEC = {
  networkTransport: 'HTTPS with TLS 1.3',
  atRestEncryption: 'AES-256-GCM (12-byte IV, 16-byte Auth Tag)',
  passwordStandard: 'Argon2id / Scrypt (Salted, Memory-Hard, Non-Reversible)',
  badgeLabel: 'TLS 1.3 Secured',
} as const
