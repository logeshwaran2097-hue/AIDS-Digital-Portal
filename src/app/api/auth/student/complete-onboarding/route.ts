import { NextRequest, NextResponse } from 'next/server'
import { getSession, createToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyOTP } from '@/lib/utils'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'student') {
      return NextResponse.json({ success: false, message: 'Unauthorized. Please login first.' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, dateOfBirth, email, otp, newPassword } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'A valid email address is required.' }, { status: 400 })
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ success: false, message: 'New password must be at least 6 characters long.' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const trimmedOtp = otp ? otp.trim() : ''

    // Verify OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email: normalizedEmail,
        expiresAt: { gt: new Date() },
        used: false,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otpRecord || !verifyOTP(trimmedOtp, otpRecord.codeHash)) {
      return NextResponse.json({ success: false, message: 'Invalid or expired OTP. Please verify OTP first.' }, { status: 400 })
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { used: true },
    })

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword.trim(), 10)

    // Update User
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: name ? name.trim() : session.name,
        email: normalizedEmail,
        phone: phone ? phone.trim() : undefined,
        emailVerified: true,
        mustChangePassword: false,
        passwordHash,
        updatedAt: new Date(),
      },
    })

    // Update Student
    if (dateOfBirth) {
      await prisma.student.update({
        where: { userId: session.userId },
        data: {
          dateOfBirth: new Date(dateOfBirth),
        },
      }).catch(() => {})
    }

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userName: updatedUser.name,
        action: 'onboarding_complete',
        module: 'student_portal',
        details: `Student ${session.registerNumber || updatedUser.name} completed first-time email verification and password change.`,
        status: 'success',
      },
    }).catch(() => {})

    // Re-issue JWT token with updated email and verified credentials
    const newToken = await createToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: 'student',
      name: updatedUser.name,
      registerNumber: session.registerNumber,
    })

    const response = NextResponse.json({
      success: true,
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        emailVerified: true,
        mustChangePassword: false,
      },
      message: 'Onboarding complete! Your credentials and email have been saved.',
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
    console.error('Error completing student onboarding:', error)
    return NextResponse.json({ success: false, message: 'Failed to complete setup: ' + String(error) }, { status: 500 })
  }
}
