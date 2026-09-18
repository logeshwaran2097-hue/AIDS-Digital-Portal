import { NextRequest, NextResponse } from 'next/server'
import { authenticateFaculty } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { logFailedLogin, safeErrorResponse } from '@/lib/securityLogger'
import { z } from 'zod'

const loginSchema = z
  .object({
    facultyId: z.string().max(50).optional(),
    email: z.string().email().optional(),
    name: z.string().max(100).optional(),
    password: z.string().max(100).optional(),
    dateOfBirth: z.string().max(30).optional(),
    role: z.string().max(30).optional(),
    loginAsRole: z.string().max(30).optional(),
  })
  .strict()
  .refine((data) => data.facultyId || data.email || data.name, {
    message: 'Faculty Email ID or Name is required',
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
    const { facultyId, email, name, password, dateOfBirth, role, loginAsRole } = parsed.data
    const identifier = (facultyId || email || name || '').trim()
    const passwordOrDob = password || dateOfBirth || ''
    const targetRole = (loginAsRole || role || 'faculty') === 'advisor' ? 'advisor' : 'faculty'

    // Dual Rate Limit: 5 attempts per 15 min per IP and per account
    const rateLimit = await checkRateLimit(request, 5, 900, 'auth:faculty', identifier)
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit)
    }

    const result = await authenticateFaculty(identifier, passwordOrDob, targetRole)

    if (!result.success || !result.user || !result.token) {
      await logFailedLogin({
        role: targetRole,
        identifier,
        ip: clientIp,
        userAgent,
        reason: result.message || 'Invalid Faculty Email, Name, or Password',
      })

      return NextResponse.json(
        { success: false, message: result.message || 'Invalid Faculty Email, Name, or Password.' },
        { status: 401 }
      )
    }

    const hasAdvisorBatch = Boolean(
      result.faculty?.facultyType === 'advisor' ||
      result.faculty?.facultyType === 'both' ||
      result.faculty?.advisorBatch ||
      result.faculty?.advisorYear
    )

    // Only set advisor mode if explicitly logging in as advisor and has advisor privileges
    const effectiveRole = (targetRole === 'advisor' && hasAdvisorBatch) ? 'advisor' : 'faculty'
    const isAdvisor = effectiveRole === 'advisor'

    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone || '',
        role: 'faculty',
        effectiveRole,
        isAdvisor,
        facultyId: result.faculty?.facultyId,
        designation: result.faculty?.designation,
        qualification: result.faculty?.qualification,
        experience: result.faculty?.experience,
        specialization: result.faculty?.specialization,
        advisorBatch: result.faculty?.advisorBatch || null,
        advisorYear: result.faculty?.advisorYear || null,
        advisorSem: result.faculty?.advisorSem || null,
        advisorSec: result.faculty?.advisorSec || null,
        subjects: result.faculty?.subjects || '[]',
        subjectName: result.faculty?.subjectName || null,
        facultyType: result.faculty?.facultyType || (hasAdvisorBatch ? 'advisor' : 'subject_handler'),
        dateOfBirth: result.faculty?.dateOfBirth ? result.faculty.dateOfBirth.toISOString().split('T')[0] : null,
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

    response.cookies.set('portal_login_role', effectiveRole, {
      httpOnly: false,
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
      path: '/api/auth/faculty',
      method: 'POST',
      ip: clientIp,
    })
  }
}