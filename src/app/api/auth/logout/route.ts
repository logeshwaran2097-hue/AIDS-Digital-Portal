import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { revokeSessionToken } from '@/lib/sessionRevocation'

function detectTargetRole(request: NextRequest): string | null {
  const queryRole = request.nextUrl.searchParams.get('role')?.toLowerCase()
  if (queryRole) return queryRole

  const headerRole = request.headers.get('x-portal-role')?.toLowerCase()
  if (headerRole) return headerRole

  const ref = (request.headers.get('referer') || '').toLowerCase()
  if (ref.includes('/admin')) return 'admin'
  if (ref.includes('/faculty-dashboard')) return 'faculty'
  if (ref.includes('/hod-dashboard')) return 'hod'
  if (ref.includes('/dashboard')) return 'student'

  return null
}

function getRoleCookieKey(role: string): string {
  const norm = role.toLowerCase()
  if (norm === 'admin' || norm === 'super_admin') return 'auth-token-admin'
  if (norm === 'student') return 'auth-token-student'
  if (norm === 'faculty' || norm === 'advisor') return 'auth-token-faculty'
  if (norm === 'hod') return 'auth-token-hod'
  return `auth-token-${norm}`
}

async function invalidateSession(request: NextRequest, targetRole: string | null) {
  try {
    const tokensToRevoke: string[] = []

    if (targetRole) {
      const roleKey = getRoleCookieKey(targetRole)
      const roleToken = request.cookies.get(roleKey)?.value
      if (roleToken) tokensToRevoke.push(roleToken)
    }

    const defaultToken = request.cookies.get('auth-token')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (defaultToken) {
      // If logging out a specific role, only revoke defaultToken if it belongs to that role
      if (targetRole) {
        const payload = await verifyToken(defaultToken)
        if (payload?.role?.toLowerCase() === targetRole.toLowerCase()) {
          tokensToRevoke.push(defaultToken)
        }
      } else {
        tokensToRevoke.push(defaultToken)
      }
    }

    for (const t of tokensToRevoke) {
      const payload = await verifyToken(t)
      if (payload && payload.jti) {
        const expMs = (payload as any).exp ? Number((payload as any).exp) * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000
        await revokeSessionToken(payload.jti, expMs)
      }
    }
  } catch (err) {
    console.warn('Session revocation error during logout:', err)
  }
}

function clearCookies(response: NextResponse, targetRole: string | null, clearAll: boolean) {
  const clearCookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
    path: '/',
  }

  if (targetRole && !clearAll) {
    const roleKey = getRoleCookieKey(targetRole)
    response.cookies.set(roleKey, '', clearCookieOpts)
    response.cookies.delete(roleKey)
    // Only delete default auth-token if it matches or as fallback
    response.cookies.set('auth-token', '', clearCookieOpts)
    response.cookies.delete('auth-token')
  } else {
    const allKeys = [
      'auth-token',
      'auth_token',
      '__Secure-auth-token',
      'auth-token-admin',
      'auth-token-student',
      'auth-token-faculty',
      'auth-token-hod',
    ]
    for (const k of allKeys) {
      response.cookies.set(k, '', clearCookieOpts)
      response.cookies.delete(k)
    }
  }

  response.cookies.set('otp-challenge', '', clearCookieOpts)
  response.cookies.delete('otp-challenge')
  response.cookies.set('portal_login_role', '', { ...clearCookieOpts, httpOnly: false })
  response.cookies.delete('portal_login_role')
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
}

export async function GET(request: NextRequest) {
  const clearAll = request.nextUrl.searchParams.get('all') === 'true'
  const targetRole = clearAll ? null : detectTargetRole(request)

  await invalidateSession(request, targetRole)

  const url = request.nextUrl.clone()
  url.pathname = '/login'
  const response = NextResponse.redirect(url)
  clearCookies(response, targetRole, clearAll)
  return response
}

export async function POST(request: NextRequest) {
  const clearAll = request.nextUrl.searchParams.get('all') === 'true'
  const targetRole = clearAll ? null : detectTargetRole(request)

  await invalidateSession(request, targetRole)

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' })
  clearCookies(response, targetRole, clearAll)
  return response
}