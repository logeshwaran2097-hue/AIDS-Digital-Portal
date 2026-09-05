import { NextRequest, NextResponse } from 'next/server'
import { generateOTP, hashOTP } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { sendStudentVerificationEmail, generateOTPChallenge } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, name, registerNumber, facultyId, role } = await request.json()

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
      console.warn('Could not write OTP to database:', dbErr)
    }

    // 2. Generate HMAC Challenge (Ultra-fast 0ms stateless verification)
    const challenge = generateOTPChallenge(trimmedEmail, otp, 10)

    // 3. Dispatch Real Email via SMTP
    let displayName = name && name.trim() ? name.trim() : ''
    const identifier = (registerNumber || facultyId || '').trim().toUpperCase() || 'N/A'

    // If name is missing or placeholder, lookup real name from database
    if (!displayName || displayName.startsWith('Student (') || displayName.startsWith('Faculty (')) {
      try {
        if (facultyId) {
          const facRec = await prisma.faculty.findUnique({ where: { facultyId: facultyId.toUpperCase() } })
          if (facRec) {
            const u = await prisma.user.findUnique({ where: { id: facRec.userId } })
            if (u?.name) displayName = u.name
          }
          if (!displayName) {
            const hodRec = await prisma.hOD.findUnique({ where: { facultyId: facultyId.toUpperCase() } })
            if (hodRec) {
              const u = await prisma.user.findUnique({ where: { id: hodRec.userId } })
              if (u?.name) displayName = u.name
            }
          }
        } else if (registerNumber) {
          const studentRec = await prisma.student.findUnique({ where: { registerNumber: registerNumber.toUpperCase() } })
          if (studentRec) {
            const u = await prisma.user.findUnique({ where: { id: studentRec.userId } })
            if (u?.name) displayName = u.name
          }
        }
      } catch {}
    }

    if (!displayName) {
      displayName = role === 'hod' ? 'Head of Department' : role === 'advisor' ? 'Class Advisor' : role === 'faculty' ? 'Faculty Member' : 'Student'
    }

    console.log(`[VSB Onboarding] Dispatching OTP email to ${trimmedEmail} (${displayName}, ID: ${identifier}, OTP: ${otp})`)
    const emailResult = await sendStudentVerificationEmail(
      trimmedEmail,
      otp,
      displayName,
      identifier
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
