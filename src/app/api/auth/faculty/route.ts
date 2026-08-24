import { NextRequest, NextResponse } from 'next/server'
import { authenticateFaculty } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  facultyId: z.string().min(1, 'Faculty ID is required'),
  dateOfBirth: z.string().min(1, 'Date of Birth is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { facultyId, dateOfBirth } = loginSchema.parse(body)

    const result = await authenticateFaculty(facultyId, dateOfBirth)

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
        role: 'faculty',
        facultyId: result.faculty?.facultyId,
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
    console.error('Faculty login error:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    )
  }
}