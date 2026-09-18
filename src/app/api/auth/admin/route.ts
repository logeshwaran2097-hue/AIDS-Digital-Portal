import { NextRequest, NextResponse } from 'next/server'
import { sendAdminOTP, verifyAdminOTP } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse, checkApiUsageQuota, quotaExceededResponse } from '@/lib/rateLimit'
import { logFailedLogin, safeErrorResponse } from '@/lib/securityLogger'
import { z } from 'zod'

const sendOTPSchema = z
  .object({
    email: z.string().email('Invalid email address'),
  })
  .strict()

const verifyOTPSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    challenge: z.string().optional(),
  })
  .strict()

export async function POST(request: NextRequest) {
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  try {
    const rawJson = await request.json()
    const email = rawJson?.email ? String(rawJson.email).trim().toLowerCase() : ''

    // Dual Rate Limit: 5 attempts per 15 min per IP and per account
    const rateLimit = await checkRateLimit(request, 5, 900, 'auth:admin', email)
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit)
    }

    if (rawJson?.otp) {
      const parsed = verifyOTPSchema.safeParse(rawJson)
      if (!parsed.success) {
        return NextResponse.json({ success: false, message: parsed.error.errors[0]?.message || 'Invalid input' }, { status: 400 })
      }
      const { email: verifiedEmail, otp } = parsed.data
      const challenge = request.cookies.get('otp-challenge')?.value || rawJson.challenge
      const result = await verifyAdminOTP(verifiedEmail, otp, challenge)

      if (!result.success || !result.user || !result.token) {
        await logFailedLogin({
          role: 'admin',
          identifier: verifiedEmail,
          ip: clientIp,
          userAgent,
          reason: result.message || 'Authentication failed',
        })

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
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      // Clean up the OTP challenge cookie
      response.cookies.delete('otp-challenge')

      return response
    } else {
      const parsed = sendOTPSchema.safeParse(rawJson)
      if (!parsed.success) {
        return NextResponse.json({ success: false, message: parsed.error.errors[0]?.message || 'Invalid email' }, { status: 400 })
      }
      const { email } = parsed.data

      // Check monthly email spending quota
      const quota = await checkApiUsageQuota('email', 1)
      if (!quota.allowed) {
        return quotaExceededResponse('email', quota.hardLimit, quota.period)
      }

      const result = await sendAdminOTP(email)

      if (!result.success) {
        return NextResponse.json(
          { success: false, message: result.message || 'Failed to dispatch OTP.' },
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
        { success: false, message: 'Invalid input data' },
        { status: 400 }
      )
    }
    return safeErrorResponse(error, 'An error occurred during authentication.', 500, {
      path: '/api/auth/admin',
      method: 'POST',
      ip: clientIp,
    })
  }
}