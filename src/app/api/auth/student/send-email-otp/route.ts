import { NextRequest, NextResponse } from 'next/server'
import { getSession, sendStudentVerificationEmail, checkEmailAvailability } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateOTP, hashOTP } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'student') {
      return NextResponse.json({ success: false, message: 'Unauthorized. Please login first.' }, { status: 401 })
    }

    const { email } = await request.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'Please provide a valid email address.' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Check if email is already linked to another active account
    const availability = await checkEmailAvailability(normalizedEmail, {
      userId: session.userId,
      registerNumber: session.registerNumber,
    })

    if (!availability.available) {
      return NextResponse.json(
        {
          success: false,
          message:
            availability.message ||
            `The email address ${normalizedEmail} is already linked to another account. Please use your unique personal or official email.`,
        },
        { status: 400 }
      )
    }


    // Generate 6-digit OTP
    const otp = generateOTP()
    const codeHash = hashOTP(otp)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save OTP record in database
    await prisma.oTP.create({
      data: {
        email: normalizedEmail,
        codeHash,
        expiresAt,
      },
    })

    // Fetch student data for personalized email
    const student = await prisma.student.findUnique({
      where: { userId: session.userId },
    })

    const studentName = session.name || 'Student'
    const regNo = student?.registerNumber || session.registerNumber || ''
    let advisorName = student?.advisorName || ''
    let subjectHandler = ''

    if (!advisorName && student?.year && student?.section) {
      try {
        const advFaculty = await prisma.faculty.findFirst({
          where: {
            advisorYear: student.year,
            advisorSec: { equals: student.section, mode: 'insensitive' },
          },
        })
        if (advFaculty) {
          const advUser = await prisma.user.findUnique({ where: { id: advFaculty.userId } })
          if (advUser?.name) advisorName = advUser.name
        }
      } catch {}
    }

    try {
      const subFaculty = await prisma.faculty.findFirst({
        where: {
          facultyType: { in: ['subject_handler', 'both'] },
          subjectName: { not: null },
        },
      })
      if (subFaculty) {
        const subUser = await prisma.user.findUnique({ where: { id: subFaculty.userId } })
        const course = subFaculty.subjectName || ''
        if (subUser?.name && course) {
          subjectHandler = `${subUser.name} (${course})`
        } else if (subUser?.name) {
          subjectHandler = subUser.name
        } else if (course) {
          subjectHandler = course
        }
      }
    } catch {}

    // Dispatch real verification email
    try {
      await sendStudentVerificationEmail({
        email: normalizedEmail,
        otp,
        name: studentName,
        role: 'student',
        registerNumber: regNo,
        department: student?.department || 'B.Tech Artificial Intelligence & Data Science',
        year: student?.year,
        semester: student?.semester,
        section: student?.section,
        advisorName,
        subjectHandlerName: subjectHandler,
      })
    } catch (emailErr) {
      console.warn('[OTP] Email dispatch note:', emailErr)
    }

    const isDev = process.env.NODE_ENV !== 'production' || !process.env.SMTP_PASSWORD

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}. Please check your inbox.`,
      demoOtp: isDev ? otp : undefined,
    })
  } catch (error) {
    console.error('Error sending student email OTP:', error)
    return NextResponse.json({ success: false, message: 'Failed to send verification code.' }, { status: 500 })
  }
}
