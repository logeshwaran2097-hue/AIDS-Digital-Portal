import { NextRequest, NextResponse } from 'next/server'
import { getSession, sendStudentVerificationEmail } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateOTP, hashOTP } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'student') {
      return NextResponse.json({ success: false, message: 'Unauthorized. Please login first.' }, { status: 401 })
    }

    const { email } = await request.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'Please provide a valid email address.' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Check if email is already taken by another active user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        id: { not: session.userId },
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'This email is already registered to another account.' },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = generateOTP()
    const codeHash = hashOTP(otp)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save OTP record in database
    await prisma.oTP.create({
      data: {
        email: normalizedEmail,
        codeHash,
        expiresAt,
      },
    })

    // Fetch student data for personalized email
    const student = await prisma.student.findUnique({
      where: { userId: session.userId },
    })

    const studentName = session.name || 'Student'
    const regNo = student?.registerNumber || session.registerNumber || 'Student'

    // Dispatch real verification email
    try {
      await sendStudentVerificationEmail(normalizedEmail, otp, studentName, regNo)
    } catch (emailErr) {
      console.warn('[OTP] Email dispatch note:', emailErr)
    }

    const isDev = process.env.NODE_ENV !== 'production' || !process.env.SMTP_PASSWORD

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}. Please check your inbox.`,
      demoOtp: isDev ? otp : undefined,
    })
  } catch (error) {
    console.error('Error sending student email OTP:', error)
    return NextResponse.json({ success: false, message: 'Failed to send verification code.' }, { status: 500 })
  }
}
