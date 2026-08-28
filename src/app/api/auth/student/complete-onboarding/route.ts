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
    const { name, phone, dateOfBirth, email, otp, newPassword, skipEmailVerification } = body

    // ─────────────────────────────────────────────────────────────────────
    // FAST PATH: Student confirms details only — no email/OTP/password required
    // ─────────────────────────────────────────────────────────────────────
    if (skipEmailVerification) {
      const updatedUser = await prisma.user.update({
        where: { id: session.userId },
        data: {
          name: name ? name.trim() : session.name,
          phone: phone ? phone.trim() : undefined,
          mustChangePassword: false,
          updatedAt: new Date(),
        },
      }).catch(() => null)

      // Update DOB in Student record if corrected
      if (dateOfBirth) {
        await prisma.student.update({
          where: { userId: session.userId },
          data: { dateOfBirth: new Date(dateOfBirth) },
        }).catch(() => {})
      }

      // Audit log
      await prisma.auditLog.create({
        data: {
          userName: updatedUser?.name || session.name || 'Student',
          action: 'onboarding_details_confirmed',
          module: 'student_portal',
          details: `Student ${session.registerNumber || name} confirmed their details and entered the portal.`,
          status: 'success',
        },
      }).catch(() => {})

      // Re-issue token so mustChangePassword is false
      const newToken = await createToken({
        userId: session.userId,
        email: session.email,
        role: 'student',
        name: updatedUser?.name || session.name,
        registerNumber: session.registerNumber,
      })

      const response = NextResponse.json({
        success: true,
        user: {
          name: updatedUser?.name || session.name,
          email: updatedUser?.email || session.email,
          phone: updatedUser?.phone || phone || '',
          emailVerified: updatedUser?.emailVerified ?? false,
          mustChangePassword: false,
        },
        message: 'Details confirmed! Welcome to your student portal.',
      })

      response.cookies.set('auth-token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })

      return response
    }

    // ─────────────────────────────────────────────────────────────────────
    // FULL PATH: Email OTP verification + password change (legacy flow)
    // ─────────────────────────────────────────────────────────────────────
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

    // Update Student DOB
    if (dateOfBirth) {
      await prisma.student.update({
        where: { userId: session.userId },
        data: { dateOfBirth: new Date(dateOfBirth) },
      }).catch(() => {})
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userName: updatedUser.name,
        action: 'onboarding_complete',
        module: 'student_portal',
        details: `Student ${session.registerNumber || updatedUser.name} completed first-time email verification and password change.`,
        status: 'success',
      },
    }).catch(() => {})

    // Re-issue JWT token
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
