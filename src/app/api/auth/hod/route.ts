import { NextRequest, NextResponse } from 'next/server'
import { authenticateHOD } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { logFailedLogin, safeErrorResponse } from '@/lib/securityLogger'
import { z } from 'zod'

const loginSchema = z
  .object({
    facultyId: z.string().max(100).optional(),
    email: z.string().max(100).optional(),
    name: z.string().max(100).optional(),
    password: z.string().max(100).optional(),
    dateOfBirth: z.string().max(30).optional(),
  })
  .strict()
  .refine((data) => data.facultyId || data.email || data.name, {
    message: 'HOD Email ID, Name, or HOD ID is required',
  })

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.errors[0]?.message || 'Invalid login details' }, { status: 400 })
    }
    const { facultyId, email, name, password, dateOfBirth } = parsed.data
    const identifier = (facultyId || email || name || '').trim()
    const passwordOrDob = password || dateOfBirth || ''

    // Dual Rate Limit: 5 attempts per 15 min per IP and per account
    const rateLimit = await checkRateLimit(request, 5, 900, 'auth:hod', identifier)
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit)
    }

    const result = await authenticateHOD(identifier, passwordOrDob)

    if (!result.success || !result.user || !result.token) {
      await logFailedLogin({
        role: 'hod',
        identifier,
        ip: clientIp,
        userAgent,
        reason: result.message || 'Invalid HOD Email, Name, or Password',
      })

      return NextResponse.json(
        { success: false, message: result.message || 'Invalid HOD Email, Name, or Password.' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        role: 'hod',
        facultyId: result.hod?.facultyId,
        mustChangePassword: Boolean((result.user as any)?.mustChangePassword),
        qualification: result.hod?.qualification,
        experience: result.hod?.experience,
        department: result.hod?.department || 'Artificial Intelligence & Data Science',
        designation: result.hod?.designation || 'Professor & Head of Department',
        dateOfBirth: result.hod?.dateOfBirth ? result.hod.dateOfBirth.toISOString().split('T')[0] : null,
      },
    })

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    }

    response.cookies.set('auth-token', result.token, cookieOpts)
    response.cookies.set('auth-token-hod', result.token, cookieOpts)

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid input data' },
        { status: 400 }
      )
    }
    return safeErrorResponse(error, 'An error occurred during authentication.', 500, {
      path: '/api/auth/hod',
      method: 'POST',
      ip: clientIp,
    })
  }
}