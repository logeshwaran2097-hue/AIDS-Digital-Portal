import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyOTP } from '@/lib/utils'
import { verifyOTPChallenge } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, 5, 60, 'otp:verify-onboarding')
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit)
  }

  try {
    const body = await request.json()
    const { email, otp, challenge } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'A valid email address is required.' }, { status: 400 })
    }

    if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      return NextResponse.json({ success: false, message: 'Please enter a 6-digit OTP.' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const trimmedOtp = otp.trim()

    let isVerified = false

    // 1. HMAC Challenge verification (cryptographically verified)
    const activeChallenge = challenge || request.cookies.get('onboarding-challenge')?.value
    if (activeChallenge && verifyOTPChallenge(activeChallenge, normalizedEmail, trimmedOtp)) {
      isVerified = true
    }

    // 2. Database OTP verification with single-use marking
    if (!isVerified) {
      const otpRecord = await prisma.oTP.findFirst({
        where: {
          email: normalizedEmail,
          expiresAt: { gt: new Date() },
          used: false,
        },
        orderBy: { createdAt: 'desc' },
      })

      if (otpRecord) {
        const isValid =
          verifyOTP(trimmedOtp, otpRecord.codeHash) ||
          (await bcrypt.compare(trimmedOtp, otpRecord.codeHash).catch(() => false))

        if (isValid) {
          isVerified = true
          await prisma.oTP.update({
            where: { id: otpRecord.id },
            data: { used: true },
          }).catch(() => {})
        }
      }
    }

    if (isVerified) {
      const response = NextResponse.json({
        success: true,
        verified: true,
        message: 'OTP verified successfully.',
      })
      response.cookies.delete('onboarding-challenge')
      return response
    }

    return NextResponse.json(
      { success: false, message: 'Invalid or expired OTP code. Please check and try again.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error verifying onboarding OTP:', error)
    return NextResponse.json(
      { success: false, message: 'Server error verifying OTP.' },
      { status: 500 }
    )
  }
}
