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
      parentPhone,
      email,
      dateOfBirth,
      newPassword,
      qualification,
      specialization,
      experience,
      correctionRemarks,
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

    // 2. Check for duplicate email across other accounts
    if (normalizedEmail) {
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      })

      if (existingUserWithEmail && existingUserWithEmail.id !== session.userId) {
        return NextResponse.json(
          {
            success: false,
            message: `The email address "${normalizedEmail}" is already linked to another account. Please provide your unique personal or institutional email.`,
          },
          { status: 400 }
        )
      }
    }

    // 3. Update User Record safely
    let updatedUser: any
    try {
      updatedUser = await prisma.user.update({
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
    } catch (err: any) {
      if (err?.code === 'P2002' || String(err).includes('Unique constraint')) {
        return NextResponse.json(
          {
            success: false,
            message: 'This email address is already in use by another user account. Please use a unique email address.',
          },
          { status: 400 }
        )
      }
      throw err
    }

    // 4. Update Student Record if user is student
    if (session.role === 'student') {
      await prisma.student.update({
        where: { userId: session.userId },
        data: {
          ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
        },
      }).catch(() => {})
    }

    // 5. If correction requested, create notification for admin
    if (correctionRemarks && correctionRemarks.trim()) {
      await prisma.notification.create({
        data: {
          userId: session.userId,
          title: `Profile Correction Request: ${session.registerNumber || updatedUser.name}`,
          message: `Student ${updatedUser.name} (${session.registerNumber}) requested data corrections: "${correctionRemarks.trim()}"`,
          type: 'correction_request',
          link: '/admin/students',
        },
      }).catch(() => {})
    }

    // 5. Update Faculty Record if user is faculty
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

    // 6. Update HOD Record if user is hod
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

    // 7. Audit Log
    await prisma.auditLog.create({
      data: {
        userName: updatedUser.name,
        action: 'profile_complete',
        module: 'auth',
        details: `${session.role.toUpperCase()} ${session.registerNumber || session.facultyId || updatedUser.name} completed initial profile setup and password change.`,
        status: 'success',
      },
    }).catch(() => {})

    // 8. Reissue updated JWT session token
    const token = await createToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role as any,
      registerNumber: session.registerNumber,
      facultyId: session.facultyId,
    })

    const response = NextResponse.json({
      success: true,
      message: 'Profile details and permanent password updated successfully.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        mustChangePassword: false,
      },
    })

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error('Complete profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to complete profile: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
