import { NextRequest, NextResponse } from 'next/server'
import { authenticateFaculty } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'
import { z } from 'zod'

const loginSchema = z.object({
  facultyId: z.string().trim().max(50).optional(),
  email: z.string().trim().max(100).optional(),
  name: z.string().trim().max(100).optional(),
  password: z.string().min(1, 'Password is required').max(128).optional(),
  dateOfBirth: z.string().trim().max(30).optional(),
  role: z.string().trim().max(50).optional(),
  loginAsRole: z.string().trim().max(50).optional(),
}).refine((data) => data.facultyId || data.email || data.name, {
  message: 'Faculty Email ID or Name is required',
}).refine((data) => data.password || data.dateOfBirth, {
  message: 'Password or Date of Birth is required',
})

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // 1. Sliding-window rate limit (5 attempts per min per IP)
  const rateLimitRes = rateLimit(request, 'auth')
  if (rateLimitRes) return rateLimitRes

  try {
    const body = await request.json()
    const { facultyId, email, name, password, dateOfBirth, role, loginAsRole } = loginSchema.parse(body)
    const identifier = (facultyId || email || name || '').trim()
    const passwordOrDob = (password || dateOfBirth || '').trim()
    const targetRole = (loginAsRole || role || 'faculty') === 'advisor' ? 'advisor' : 'faculty'

    const result = await authenticateFaculty(identifier, passwordOrDob, targetRole)

    if (!result.success || !result.user || !result.token) {
      return NextResponse.json(
        { success: false, message: result.message || 'Authentication failed' },
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
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    response.cookies.set('portal_login_role', effectiveRole, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }
    console.error('Faculty login error:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    )
  }
}