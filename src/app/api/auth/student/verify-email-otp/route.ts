import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyOTP } from '@/lib/utils'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { validateBody, studentVerifyEmailOtpSchema } from '@/lib/validations/apiValidation'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'student') {
      return NextResponse.json({ success: false, message: 'Unauthorized. Please login first.' }, { status: 401 })
    }

    const rawBody = await request.json().catch(() => ({}))
    const validation = validateBody(studentVerifyEmailOtpSchema, rawBody)
    if (!validation.success) {
      return validation.response
    }
    const { email, otp } = validation.data

    const normalizedEmail = email.trim().toLowerCase()
    const trimmedOtp = otp.trim()

    // Dual Rate Limit: 5 verification attempts per 10 min per IP and per email
    const rateLimit = await checkRateLimit(request, 5, 600, 'otp:student-verify-email', normalizedEmail)
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit)
    }

    // Find the latest valid unused OTP for this email
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

    // Mark OTP as used immediately (single-use enforcement)
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { used: true },
    }).catch((err) => {
      console.warn('Could not mark student OTP as used:', err)
    })

    return NextResponse.json({
      success: true,
      message: 'Email successfully verified!',
    })
  } catch (error) {
    console.error('Error verifying student email OTP:', error)
    return NextResponse.json({ success: false, message: 'Verification error occurred.' }, { status: 500 })
  }
}
