import { NextRequest, NextResponse } from 'next/server'
import { sendAdminOTP, verifyAdminOTP } from '@/lib/auth'
import { z } from 'zod'

const sendOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (body.otp) {
      const { email, otp } = verifyOTPSchema.parse(body)
      const result = await verifyAdminOTP(email, otp)

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
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })

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

      return NextResponse.json({ success: true, message: result.message })
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