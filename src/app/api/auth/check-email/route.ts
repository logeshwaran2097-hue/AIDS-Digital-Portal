import { NextRequest, NextResponse } from 'next/server'
import { checkEmailAvailability } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { validateBody, checkEmailSchema } from '@/lib/validations/apiValidation'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Generous limit for campus network where multiple students share public IP
  const rateLimit = await checkRateLimit(request, 300, 60, 'auth:check-email')
  if (!rateLimit.allowed) {
    return NextResponse.json({ available: true })
  }

  try {
    const rawJson = await request.json()
    const parsed = validateBody(checkEmailSchema, rawJson)
    if (!parsed.success) {
      return NextResponse.json({ available: true })
    }
    const { email, userId, registerNumber, facultyId } = parsed.data

    const normalized = (email || '').trim().toLowerCase()
    if (!normalized || !normalized.includes('@') || !normalized.includes('.')) {
      return NextResponse.json({ available: true })
    }

    // If student has entered a full domain that is not gmail
    if (registerNumber && normalized.includes('@')) {
      const domain = normalized.split('@')[1] || ''
      if (domain.includes('.') && domain !== 'gmail.com') {
        return NextResponse.json({
          available: false,
          message: 'Students must provide a personal @gmail.com address (e.g. name@gmail.com).',
        })
      }
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
