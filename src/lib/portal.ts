import { redirect } from 'next/navigation'
import { getSession, JWTPayload } from '@/lib/auth'

export const allowedRoles: Record<string, string[]> = {
  student: ['student'],
  faculty: ['faculty'],
  hod: ['hod'],
  admin: ['admin'],
}

export async function getPortalSession(): Promise<JWTPayload> {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

export function logoutPath(): string {
  return '/api/auth/logout'
}