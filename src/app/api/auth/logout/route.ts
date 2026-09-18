import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { revokeSessionToken } from '@/lib/sessionRevocation'

async function invalidateSession(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (token) {
      const payload = await verifyToken(token)
      if (payload && payload.jti) {
        await revokeSessionToken(payload.jti, payload.exp ? payload.exp * 1000 : undefined)
      }
    }
  } catch (err) {
    console.warn('Session revocation error during logout:', err)
  }
}

export async function GET(request: NextRequest) {
  await invalidateSession(request)

  const url = request.nextUrl.clone()
  url.pathname = '/login'
  const response = NextResponse.redirect(url)
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  response.cookies.set('otp-challenge', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  response.cookies.set('portal_login_role', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  response.cookies.delete('auth-token')
  response.cookies.delete('otp-challenge')
  response.cookies.delete('portal_login_role')
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  return response
}

export async function POST(request: NextRequest) {
  await invalidateSession(request)

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' })
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  response.cookies.set('otp-challenge', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  response.cookies.set('portal_login_role', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  response.cookies.delete('auth-token')
  response.cookies.delete('otp-challenge')
  response.cookies.delete('portal_login_role')
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  return response
}