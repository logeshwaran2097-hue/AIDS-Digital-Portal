import { NextRequest, NextResponse } from 'next/server'
import { sendAdminOTP, verifyAdminOTP } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'
import { z } from 'zod'

const sendOTPSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(150),
})

const verifyOTPSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(150),
  otp: z.string().trim().regex(/^\d{6}$/, 'OTP must be exactly 6 numeric digits'),
  challenge: z.string().trim().optional(),
})

export async function POST(request: NextRequest) {
  // 1. Sliding-window rate limit (5 attempts per min per IP)
  const rateLimitRes = rateLimit(request, 'auth')
  if (rateLimitRes) return rateLimitRes

  try {
    const body = await request.json()
    
    if (body.otp) {
      const { email, otp } = verifyOTPSchema.parse(body)
      const challenge = request.cookies.get('otp-challenge')?.value || body.challenge
      const result = await verifyAdminOTP(email, otp, challenge)

      if (!result.success || !result.user || !result.token) {
        return NextResponse.json(
          { success: false, message: result.message || 'Authentication failed' },
          { status: 401 }
        )
      }

      const response = NextResponse.json({
        success: true,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: 'admin',
        },
      })

      response.cookies.set('auth-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })

      // Clean up the OTP challenge cookie
      response.cookies.delete('otp-challenge')

      return response
    } else {
      const { email } = sendOTPSchema.parse(body)
      const result = await sendAdminOTP(email)

      if (!result.success) {
        return NextResponse.json(
          { success: false, message: result.message },
          { status: 401 }
        )
      }

      const response = NextResponse.json({ 
        success: true, 
        message: result.message,
        challenge: result.challenge,
      })

      if (result.challenge) {
        response.cookies.set('otp-challenge', result.challenge, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 15, // 15 minutes
          path: '/',
        })
      }

      return response
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }
    console.error('Admin auth error:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred during authentication' },
      { status: 500 }
    )
  }
}