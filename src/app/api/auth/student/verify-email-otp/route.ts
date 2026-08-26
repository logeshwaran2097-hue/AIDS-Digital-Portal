import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyOTP } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'student') {
      return NextResponse.json({ success: false, message: 'Unauthorized. Please login first.' }, { status: 401 })
    }

    const { email, otp } = await request.json()
    if (!email || !otp || otp.trim().length !== 6) {
      return NextResponse.json({ success: false, message: 'Please enter the complete 6-digit OTP.' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const trimmedOtp = otp.trim()

    // Find the latest valid OTP for this email
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email: normalizedEmail,
        expiresAt: { gt: new Date() },
        used: false,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otpRecord || !verifyOTP(trimmedOtp, otpRecord.codeHash)) {
      return NextResponse.json({ success: false, message: 'Invalid or expired OTP code.' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Email successfully verified!',
    })
  } catch (error) {
    console.error('Error verifying student email OTP:', error)
    return NextResponse.json({ success: false, message: 'Verification error occurred.' }, { status: 500 })
  }
}
