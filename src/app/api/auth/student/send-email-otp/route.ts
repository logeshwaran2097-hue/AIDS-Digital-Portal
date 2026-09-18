import { NextRequest, NextResponse } from 'next/server'
import { getSession, sendStudentVerificationEmail, checkEmailAvailability } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateOTP, hashOTP } from '@/lib/utils'
import { checkRateLimit, rateLimitResponse, checkApiUsageQuota, quotaExceededResponse } from '@/lib/rateLimit'
import { validateBody, studentSendEmailOtpSchema } from '@/lib/validations/apiValidation'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'student') {
      return NextResponse.json({ success: false, message: 'Unauthorized. Please login first.' }, { status: 401 })
    }

    const rawBody = await request.json().catch(() => ({}))
    const validation = validateBody(studentSendEmailOtpSchema, rawBody)
    if (!validation.success) {
      return validation.response
    }
    const { email } = validation.data

    const normalizedEmail = email.trim().toLowerCase()

    // Dual Rate Limit: 3 requests per 10 min per IP and per email
    const rateLimit = await checkRateLimit(request, 3, 600, 'otp:student-send-email', normalizedEmail)
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit)
    }

    // Check monthly email spending quota
    const quota = await checkApiUsageQuota('email', 1)
    if (!quota.allowed) {
      return quotaExceededResponse('email', quota.hardLimit, quota.period)
    }

    if (!normalizedEmail.endsWith('@gmail.com')) {
      return NextResponse.json(
        { success: false, message: 'Only @gmail.com personal email addresses are allowed (e.g. name@gmail.com).' },
        { status: 400 }
      )
    }

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

    // Generate random 6-digit OTP, expires in 10 minutes (single-use)
    const otp = generateOTP()
    const codeHash = hashOTP(otp)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Save OTP record in database
    await prisma.oTP.create({
      data: {
        email: normalizedEmail,
        codeHash,
        expiresAt,
        used: false,
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

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}. Please check your inbox.`,
    })
  } catch (error) {
    console.error('Error sending student email OTP:', error)
    return NextResponse.json({ success: false, message: 'Failed to send verification code.' }, { status: 500 })
  }
}
