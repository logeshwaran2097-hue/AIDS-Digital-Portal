import { NextRequest, NextResponse } from 'next/server'
import { authenticateStudent } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { logFailedLogin, safeErrorResponse } from '@/lib/securityLogger'
import { z } from 'zod'

const loginSchema = z
  .object({
    registerNumber: z.string().max(30).optional(),
    email: z.string().email().optional(),
    password: z.string().max(100).optional(),
    dateOfBirth: z.string().max(30).optional(),
  })
  .strict()
  .refine((data) => data.registerNumber || data.email, {
    message: 'Register Number or Email ID is required',
  })

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

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
    const { registerNumber, email, password, dateOfBirth } = parsed.data
    const identifier = (registerNumber || email || '').trim()
    const passwordOrDob = password || dateOfBirth || ''

    // Dual Rate Limit: 5 attempts per 15 min per IP and per account
    const rateLimit = await checkRateLimit(request, 5, 900, 'auth:student', identifier)
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit)
    }

    const result = await authenticateStudent(identifier, passwordOrDob)

    if (!result.success || !result.user || !result.token) {
      await logFailedLogin({
        role: 'student',
        identifier,
        ip: clientIp,
        userAgent,
        reason: result.message || 'Invalid Register Number, Email, or Password',
      })

      return NextResponse.json(
        { success: false, message: result.message || 'Invalid Register Number, Email, or Password.' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone || '',
        role: 'student',
        registerNumber: result.student?.registerNumber,
        department: result.student?.department,
        year: result.student?.year,
        semester: result.student?.semester,
        section: result.student?.section,
        batch: (result.student as any)?.batch || null,
        advisorName: (result.student as any)?.advisorName || null,
        parentPhone: (result.student as any)?.parentPhone || null,
        bloodGroup: (result.student as any)?.bloodGroup || null,
        residencyStatus: (result.student as any)?.residencyStatus || null,
        address: (result.student as any)?.address || null,
        busDetails: (result.student as any)?.busDetails || null,
        dateOfBirth: result.student?.dateOfBirth ? result.student.dateOfBirth.toISOString().split('T')[0] : null,
        mustChangePassword: result.user.mustChangePassword ?? false,
      },
    })

    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid input data' },
        { status: 400 }
      )
    }
    return safeErrorResponse(error, 'An error occurred during authentication.', 500, {
      path: '/api/auth/student',
      method: 'POST',
      ip: clientIp,
    })
  }
}