import { redirect } from 'next/navigation'
import { getSession, requireRoleSession, JWTPayload } from '@/lib/auth'

export const allowedRoles: Record<string, string[]> = {
  student: ['student', 'faculty', 'hod', 'admin', 'super_admin'],
  faculty: ['faculty', 'hod', 'admin', 'super_admin'],
  hod: ['hod', 'admin', 'super_admin'],
  admin: ['admin', 'super_admin'],
}

export async function getPortalSession(role: string = 'student'): Promise<JWTPayload> {
  const allowed = allowedRoles[role] || [role]
  return requireRoleSession(allowed)
}

export function logoutPath(): string {
  return '/api/auth/logout'
}