import { NextRequest, NextResponse } from 'next/server'
import { getSession, createToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyOTP } from '@/lib/utils'
import bcrypt from 'bcryptjs'

import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'student') {
      return NextResponse.json({ success: false, message: 'Unauthorized. Please login first.' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, parentPhone, dateOfBirth, email, otp, newPassword, skipEmailVerification } = body

    const isCustomEmail = email && !email.endsWith('@student.vsb.edu.in') && email.includes('@')

    // ─────────────────────────────────────────────────────────────────────
    // FAST PATH: Student confirms details only — no email/OTP/password required
    // ─────────────────────────────────────────────────────────────────────
    if (skipEmailVerification) {
      const userUpdateData: any = {
        name: name ? name.trim() : session.name,
        mustChangePassword: false,
        updatedAt: new Date(),
      }
      if (phone !== undefined) userUpdateData.phone = phone ? phone.trim() : null
      if (isCustomEmail) {
        userUpdateData.email = email.trim().toLowerCase()
        userUpdateData.emailVerified = true
      }

      const updatedUser = await prisma.user.update({
        where: { id: session.userId },
        data: userUpdateData,
      }).catch(() => null)

      // Update DOB and Parent Phone in Student record if provided
      const studentUpdateData: any = {}
      if (dateOfBirth) studentUpdateData.dateOfBirth = new Date(dateOfBirth)
      if (parentPhone !== undefined) studentUpdateData.parentPhone = parentPhone ? parentPhone.trim() : null

      if (Object.keys(studentUpdateData).length > 0) {
        let student = await prisma.student.update({
          where: { userId: session.userId },
          data: studentUpdateData,
        }).catch(() => null)

        if (!student && session.registerNumber) {
          await prisma.student.update({
            where: { registerNumber: session.registerNumber.trim().toUpperCase() },
            data: {
              ...studentUpdateData,
              userId: session.userId,
            },
          }).catch(() => {})
        }
      }

      // Invalidate admin cache so admin sees newly entered contact details immediately
      revalidatePath('/admin/students')
      revalidatePath('/admin/dashboard')
      revalidatePath('/dashboard')
      revalidatePath('/dashboard/profile')

      // Audit log
      await prisma.auditLog.create({
        data: {
          userName: updatedUser?.name || session.name || 'Student',
          action: 'onboarding_details_confirmed',
          module: 'student_portal',
          details: `Student ${session.registerNumber || name} confirmed their contact details and entered the portal.`,
          status: 'success',
        },
      }).catch(() => {})

      // Re-issue token so mustChangePassword is false
      const newToken = await createToken({
        userId: session.userId,
        email: updatedUser?.email || session.email,
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
    // FULL PATH: Email OTP verification (optional password change)
    // ─────────────────────────────────────────────────────────────────────
    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'A valid email address is required.' }, { status: 400 })
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

    const userUpdateData: any = {
      name: name ? name.trim() : session.name,
      email: normalizedEmail,
      phone: phone ? phone.trim() : undefined,
      emailVerified: true,
      mustChangePassword: false,
      updatedAt: new Date(),
    }

    // Hash new password if provided (for legacy flow)
    if (newPassword && newPassword.length >= 6) {
      userUpdateData.passwordHash = await bcrypt.hash(newPassword.trim(), 10)
    }

    // Update User
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: userUpdateData,
    })

    // Update Student DOB & Parent Phone
    const studentUpdateData: any = {}
    if (dateOfBirth) studentUpdateData.dateOfBirth = new Date(dateOfBirth)
    if (parentPhone) studentUpdateData.parentPhone = parentPhone.trim()

    if (Object.keys(studentUpdateData).length > 0) {
      await prisma.student.update({
        where: { userId: session.userId },
        data: studentUpdateData,
      }).catch(() => {})
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userName: updatedUser.name,
        action: 'onboarding_complete',
        module: 'student_portal',
        details: `Student ${session.registerNumber || updatedUser.name} completed first-time email verification.`,
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
      message: 'Onboarding complete! Your details have been saved.',
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
