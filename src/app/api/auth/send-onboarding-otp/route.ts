import { NextRequest, NextResponse } from 'next/server'
import { generateOTP, hashOTP } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()
    const otp = generateOTP()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes
    const challengePayload = `${trimmedEmail}:${otp}:${expiresAt}`
    const crypto = require('crypto')
    const signature = crypto
      .createHmac('sha256', process.env.NEXTAUTH_SECRET || 'vsb-secret-onboarding-otp')
      .update(challengePayload)
      .digest('hex')
    const challenge = `${Buffer.from(challengePayload).toString('base64')}.${signature}`

    console.log(`[VSB Onboarding] OTP dispatched to ${trimmedEmail}: ${otp}`)

    const response = NextResponse.json({
      success: true,
      message: `6-digit verification OTP dispatched to ${trimmedEmail}`,
      challenge,
      // Provide demo OTP helper
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    })

    response.cookies.set('onboarding-challenge', challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Error sending onboarding OTP:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    )
  }
}
