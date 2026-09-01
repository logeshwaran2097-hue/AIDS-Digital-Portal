import { NextRequest, NextResponse } from 'next/server'
import { authenticateStudent } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  registerNumber: z.string().min(1, 'Register Number is required'),
  password: z.string().optional(),
  dateOfBirth: z.string().optional(),
})

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { registerNumber, password, dateOfBirth } = loginSchema.parse(body)
    const passwordOrDob = password || dateOfBirth || ''

    const result = await authenticateStudent(registerNumber, passwordOrDob)

    if (!result.success || !result.user || !result.token) {
      return NextResponse.json(
        { success: false, message: result.message || 'Authentication failed' },
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
      maxAge: 60 * 60 * 24 * 7,
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
    console.error('Student login error:', error)
    return NextResponse.json(
      { success: false, message: 'Login error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}