import { NextRequest, NextResponse } from 'next/server'
import { checkEmailAvailability } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userId, registerNumber, facultyId } = body || {}

    if (!email || typeof email !== 'string' || !email.includes('@')) {
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
    console.error('Error in check-email API route:', error)
    return NextResponse.json(
      { available: true, message: 'Could not verify email uniqueness.' },
      { status: 200 }
    )
  }
}

export async function GET(request: NextRequest) {
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
