import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyOTP } from '@/lib/utils'
import { verifyOTPChallenge } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { validateBody, verifyOnboardingOtpSchema } from '@/lib/validations/apiValidation'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const rawJson = await request.json()
    const parsed = validateBody(verifyOnboardingOtpSchema, rawJson)
    if (!parsed.success) return parsed.response

    const { email, otp, challenge } = parsed.data
    const normalizedEmail = email.trim().toLowerCase()
    const trimmedOtp = otp.trim()

    // Dual Rate Limit: 5 verification attempts per 10 min per IP and per email
    const rateLimit = await checkRateLimit(request, 5, 600, 'otp:verify-onboarding', normalizedEmail)
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit)
    }

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
