import { NextRequest, NextResponse } from 'next/server'
import { checkEmailAvailability } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { validateBody, checkEmailSchema } from '@/lib/validations/apiValidation'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const rateLimit = await checkRateLimit(request, 10, 60, 'auth:check-email')
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit)
  }

  try {
    const rawJson = await request.json()
    const parsed = validateBody(checkEmailSchema, rawJson)
    if (!parsed.success) return parsed.response
    const { email, userId, registerNumber, facultyId } = parsed.data

    if (registerNumber && !email.trim().toLowerCase().endsWith('@gmail.com')) {
      return NextResponse.json({
        available: false,
        message: 'Only @gmail.com personal email addresses are permitted.',
      })
    }

    const result = await checkEmailAvailability(email, {
      userId,
      registerNumber,
      facultyId,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in check-email API route:', error)
    return NextResponse.json(
      { available: true, message: 'Could not verify email uniqueness.' },
      { status: 200 }
    )
  }
}

export async function GET(request: NextRequest) {
  const rateLimit = await checkRateLimit(request, 10, 60, 'auth:check-email')
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit)
  }

  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const userId = searchParams.get('userId') || undefined
    const registerNumber = searchParams.get('registerNumber') || undefined
    const facultyId = searchParams.get('facultyId') || undefined

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { available: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    const result = await checkEmailAvailability(email, {
      userId,
      registerNumber,
      facultyId,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in check-email GET API route:', error)
    return NextResponse.json(
      { available: true, message: 'Could not verify email uniqueness.' },
      { status: 200 }
    )
  }
}
