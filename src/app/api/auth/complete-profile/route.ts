import { NextRequest, NextResponse } from 'next/server'
import { getSession, createToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please login first.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      phone,
      email,
      dateOfBirth,
      newPassword,
      qualification,
      specialization,
      experience,
    } = body

    // 1. Password validation (if provided)
    let passwordHash: string | undefined = undefined
    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        return NextResponse.json(
          { success: false, message: 'New password must be at least 6 characters long.' },
          { status: 400 }
        )
      }
      passwordHash = await bcrypt.hash(newPassword.trim(), 10)
    }

    const normalizedEmail = email && email.trim() ? email.trim().toLowerCase() : undefined

    // 2. Update User Record
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(name && name.trim() ? { name: name.trim() } : {}),
        ...(normalizedEmail ? { email: normalizedEmail } : {}),
        ...(phone !== undefined ? { phone: phone.trim() || null } : {}),
        ...(passwordHash ? { passwordHash, mustChangePassword: false } : { mustChangePassword: false }),
        emailVerified: true,
        updatedAt: new Date(),
      },
    })

    // 3. Update Student Record if user is student
    if (session.role === 'student') {
      await prisma.student.update({
        where: { userId: session.userId },
        data: {
          ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
        },
      }).catch(() => {})
    }

    // 4. Update Faculty Record if user is faculty
    if (session.role === 'faculty') {
      await prisma.faculty.update({
        where: { userId: session.userId },
        data: {
          ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
          ...(qualification && qualification.trim() ? { qualification: qualification.trim() } : {}),
          ...(specialization && specialization.trim() ? { specialization: specialization.trim() } : {}),
          ...(experience !== undefined && experience !== '' ? { experience: Number(experience) || 1 } : {}),
        },
      }).catch(() => {})
    }

    // 5. Update HOD Record if user is hod
    if (session.role === 'hod') {
      await prisma.hOD.update({
        where: { userId: session.userId },
        data: {
          ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
          ...(qualification && qualification.trim() ? { qualification: qualification.trim() } : {}),
          ...(experience !== undefined && experience !== '' ? { experience: Number(experience) || 1 } : {}),
        },
      }).catch(() => {})
    }

    // 5. Audit Log
    await prisma.auditLog.create({
      data: {
        userName: updatedUser.name,
        action: 'profile_complete',
        module: 'auth',
        details: `${session.role.toUpperCase()} ${session.registerNumber || session.facultyId || updatedUser.name} completed initial profile setup and password change.`,
        status: 'success',
      },
    }).catch(() => {})

    // 6. Re-issue JWT token with updated email, name, etc.
    const newToken = await createToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: session.role,
      name: updatedUser.name,
      registerNumber: session.registerNumber,
      facultyId: session.facultyId,
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: session.role,
        registerNumber: session.registerNumber,
        facultyId: session.facultyId,
        mustChangePassword: false,
      },
      message: 'Profile and secure password saved successfully!',
    })

    response.cookies.set('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Error completing profile setup:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to complete profile: ' + String(error) },
      { status: 500 }
    )
  }
}
