import { NextRequest, NextResponse } from 'next/server'
import { authenticateHOD } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  facultyId: z.string().min(1, 'Faculty ID is required'),
  password: z.string().optional(),
  dateOfBirth: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { facultyId, password, dateOfBirth } = loginSchema.parse(body)
    const passwordOrDob = password || dateOfBirth || ''

    const result = await authenticateHOD(facultyId, passwordOrDob)

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
    console.error('HOD login error:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    )
  }
}