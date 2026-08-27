import { NextRequest, NextResponse } from 'next/server'
import { generateOTP, hashOTP } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { sendStudentVerificationEmail } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, name, registerNumber } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()
    const otp = generateOTP()
    const codeHash = hashOTP(otp)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // 1. Save OTP to Database
    try {
      await prisma.oTP.create({
        data: {
          email: trimmedEmail,
          codeHash,
          expiresAt,
        },
      })
    } catch (dbErr) {
      console.warn('Could not write student OTP to database:', dbErr)
    }

    // 2. Generate HMAC Challenge
    const challengePayload = `${trimmedEmail}:${otp}:${expiresAt.getTime()}`
    const crypto = require('crypto')
    const signature = crypto
      .createHmac('sha256', process.env.NEXTAUTH_SECRET || 'vsb-secret-onboarding-otp')
      .update(challengePayload)
      .digest('hex')
    const challenge = `${Buffer.from(challengePayload).toString('base64')}.${signature}`

    // 3. Dispatch Real Email via SMTP
    const studentDisplayName = name || 'Student'
    const studentRegNumber = registerNumber || 'N/A'

    console.log(`[VSB Onboarding] Dispatching real OTP email to ${trimmedEmail} (OTP: ${otp})`)
    const emailResult = await sendStudentVerificationEmail(
      trimmedEmail,
      otp,
      studentDisplayName,
      studentRegNumber
    )

    const response = NextResponse.json({
      success: true,
      message: `6-digit verification OTP has been sent directly to your email (${trimmedEmail})`,
      challenge,
      emailSent: emailResult?.success ?? true,
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
      { success: false, message: 'Failed to send OTP to email. Please try again.' },
      { status: 500 }
    )
  }
}
