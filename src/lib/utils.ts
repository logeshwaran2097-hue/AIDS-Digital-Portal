import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, format: string = 'dd/MM/yyyy'): string {
  const d = new Date(date)
  return format
    .replace('dd', String(d.getDate()).padStart(2, '0'))
    .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
    .replace('yyyy', String(d.getFullYear()))
    .replace('HH', String(d.getHours()).padStart(2, '0'))
    .replace('mm', String(d.getMinutes()).padStart(2, '0'))
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(d)
}

export function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function hashOTP(otp: string): string {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(otp).digest('hex')
}

export function verifyOTP(otp: string, hash: string): boolean {
  return hashOTP(otp) === hash
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase()
}

export function isValidFileType(filename: string, allowedTypes: string[]): boolean {
  const ext = getFileExtension(filename)
  return allowedTypes.includes(ext)
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    student: 'Student',
    faculty: 'Faculty',
    hod: 'HOD',
    admin: 'Admin',
  }
  return labels[role] || role
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    draft: 'Draft',
    pending: 'Pending',
    approved: 'Approved',
    published: 'Published',
    archived: 'Archived',
    rejected: 'Rejected',
    proposed: 'Proposed',
    in_progress: 'In Progress',
    under_review: 'Under Review',
    completed: 'Completed',
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
    proposed: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    under_review: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    student: 'bg-blue-100 text-blue-800',
    faculty: 'bg-purple-100 text-purple-800',
    hod: 'bg-orange-100 text-orange-800',
    admin: 'bg-red-100 text-red-800',
  }
  return colors[role] || 'bg-gray-100 text-gray-800'
}

/**
 * Safely parses any date-of-birth representation into a valid Date object within realistic human ranges (1920 - 2050).
 * Prevents abnormal formats like "+092007-02-06", invalid strings, or out-of-range dates from crashing Prisma/Postgres.
 */
export function parseSafeDateOfBirth(input: any, defaultFallback: Date): Date
export function parseSafeDateOfBirth(input: any, defaultFallback?: Date | null): Date | null
export function parseSafeDateOfBirth(input: any, defaultFallback: Date | null = null): Date | null {
  if (!input) return defaultFallback

  if (input instanceof Date) {
    if (isNaN(input.getTime())) return defaultFallback
    const year = input.getUTCFullYear()
    if (year >= 1920 && year <= 2050) return input
    return defaultFallback
  }

  let str = String(input).trim()
  if (!str) return defaultFallback

  // Fix anomalous leading '+' or six-digit years like +092007-02-06
  if (str.startsWith('+')) {
    str = str.replace(/^\++/, '')
  }

  // Handle DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/)
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10)
    const month = parseInt(dmyMatch[2], 10) - 1
    let year = parseInt(dmyMatch[3], 10)
    if (year < 100) {
      year += year > 30 ? 1900 : 2000
    }
    if (year >= 1920 && year <= 2050 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const d = new Date(Date.UTC(year, month, day))
      if (!isNaN(d.getTime())) return d
    }
  }

  // Handle YYYY-MM-DD (including cases where year has accidental extra digits or zeros like 092007)
  const ymdMatch = str.match(/^(\d{4,6})[-/.](\d{1,2})[-/.](\d{1,2})/)
  if (ymdMatch) {
    let yearStr = ymdMatch[1]
    // If year has 6 digits like 092007, try to extract last 4 digits (2007)
    if (yearStr.length === 6) {
      const sub4 = yearStr.slice(-4)
      const num4 = parseInt(sub4, 10)
      if (num4 >= 1920 && num4 <= 2050) {
        yearStr = sub4
      }
    }
    const year = parseInt(yearStr, 10)
    const month = parseInt(ymdMatch[2], 10) - 1
    const day = parseInt(ymdMatch[3], 10)
    if (year >= 1920 && year <= 2050 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const d = new Date(Date.UTC(year, month, day))
      if (!isNaN(d.getTime())) return d
    }
  }

  // Fallback to standard Date constructor
  try {
    const d = new Date(str)
    if (!isNaN(d.getTime())) {
      const year = d.getUTCFullYear()
      if (year >= 1920 && year <= 2050) {
        return d
      }
      // If year is anomalously huge like 92007, check if last 4 digits form a valid year
      if (year > 2050) {
        const last4 = year % 10000
        if (last4 >= 1920 && last4 <= 2050) {
          d.setUTCFullYear(last4)
          return d
        }
      }
    }
  } catch {}

  return defaultFallback
}