import path from 'path'
import crypto from 'crypto'

export interface FileValidationOptions {
  maxSizeBytes?: number
  allowedMimeTypes?: string[]
}

export interface FileValidationResult {
  valid: boolean
  error?: string
  detectedMime?: string
  detectedExtension?: string
  safeFileName?: string
}

// Magic bytes signatures for authorized educational file types
const MAGIC_SIGNATURES: Array<{
  mime: string
  ext: string
  check: (buf: Buffer) => boolean
}> = [
  // PDF: %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
  {
    mime: 'application/pdf',
    ext: 'pdf',
    check: (buf: Buffer) =>
      buf.length >= 5 &&
      buf[0] === 0x25 &&
      buf[1] === 0x50 &&
      buf[2] === 0x44 &&
      buf[3] === 0x46 &&
      buf[4] === 0x2d,
  },
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  {
    mime: 'image/png',
    ext: 'png',
    check: (buf: Buffer) =>
      buf.length >= 8 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a,
  },
  // JPEG: FF D8 FF
  {
    mime: 'image/jpeg',
    ext: 'jpg',
    check: (buf: Buffer) =>
      buf.length >= 3 &&
      buf[0] === 0xff &&
      buf[1] === 0xd8 &&
      buf[2] === 0xff,
  },
  // WEBP: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
  {
    mime: 'image/webp',
    ext: 'webp',
    check: (buf: Buffer) =>
      buf.length >= 12 &&
      buf[0] === 0x52 &&
      buf[1] === 0x49 &&
      buf[2] === 0x46 &&
      buf[3] === 0x46 &&
      buf[8] === 0x57 &&
      buf[9] === 0x45 &&
      buf[10] === 0x42 &&
      buf[11] === 0x50,
  },
  // DOCX / ZIP: 50 4B 03 04
  {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ext: 'docx',
    check: (buf: Buffer) =>
      buf.length >= 4 &&
      buf[0] === 0x50 &&
      buf[1] === 0x4b &&
      buf[2] === 0x03 &&
      buf[3] === 0x04,
  },
]

// HTML / script content detector to prevent SVG/HTML-based stored XSS
function containsDangerousHtml(buf: Buffer): boolean {
  const sample = buf.subarray(0, Math.min(buf.length, 4096)).toString('utf-8').toLowerCase()
  return (
    sample.includes('<html') ||
    sample.includes('<script') ||
    sample.includes('javascript:') ||
    sample.includes('<svg') ||
    sample.includes('onload=') ||
    sample.includes('onerror=')
  )
}

/**
 * Validates an uploaded file buffer against magic-byte signatures, size caps, and content safety.
 */
export function validateFileBuffer(
  buffer: Buffer,
  originalFileName: string,
  options: FileValidationOptions = {}
): FileValidationResult {
  const maxSizeBytes = options.maxSizeBytes || 10 * 1024 * 1024 // Default 10MB
  const allowedMimes = options.allowedMimeTypes || [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]

  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'Uploaded file is empty.' }
  }

  if (buffer.length > maxSizeBytes) {
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0)
    return {
      valid: false,
      error: `File size exceeds the maximum permitted limit of ${maxMb}MB.`,
    }
  }

  // Detect signature from buffer magic bytes
  const match = MAGIC_SIGNATURES.find((sig) => sig.check(buffer))
  if (!match) {
    return {
      valid: false,
      error:
        'Invalid or unrecognized file content. Only authentic PDF, Word (DOCX), PNG, JPEG, and WEBP files are allowed.',
    }
  }

  if (!allowedMimes.includes(match.mime)) {
    return {
      valid: false,
      error: `File type "${match.mime}" is not permitted for this upload.`,
    }
  }

  // Ensure file does not disguise HTML / scripts
  if (containsDangerousHtml(buffer)) {
    return {
      valid: false,
      error: 'Uploaded file contains prohibited HTML or script content.',
    }
  }

  // Generate safe randomized filename: sanitize base name, append timestamp and random hex
  const cleanBase = path
    .basename(originalFileName, path.extname(originalFileName))
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30)

  const randomHex = crypto.randomBytes(6).toString('hex')
  const safeFileName = `${cleanBase || 'doc'}_${Date.now()}_${randomHex}.${match.ext}`

  return {
    valid: true,
    detectedMime: match.mime,
    detectedExtension: match.ext,
    safeFileName,
  }
}
