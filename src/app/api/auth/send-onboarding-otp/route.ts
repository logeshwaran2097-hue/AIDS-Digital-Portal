import { NextRequest, NextResponse } from 'next/server'
import { generateOTP, hashOTP } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { sendStudentVerificationEmail, generateOTPChallenge, checkEmailAvailability } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      name,
      userId,
      registerNumber,
      facultyId,
      role,
      subjectName,
      department,
      year,
      semester,
      section,
      advisorName,
      advisorYear,
      advisorSem,
      advisorSec,
      advisorBatch,
    } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()

    // Validate email uniqueness across active accounts before generating/sending OTP
    const availability = await checkEmailAvailability(trimmedEmail, {
      userId,
      registerNumber,
      facultyId,
    })

    if (!availability.available) {
      return NextResponse.json(
        {
          success: false,
          message:
            availability.message ||
            `The email address ${trimmedEmail} is already linked to another account. Please use your unique personal or official email.`,
        },
        { status: 400 }
      )
    }

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
    let displayName = name && typeof name === 'string' ? name.trim() : ''
    let resolvedRegNo = registerNumber ? String(registerNumber).trim().toUpperCase() : ''
    let resolvedFacultyId = facultyId ? String(facultyId).trim().toUpperCase() : ''
    let resolvedRole = role && typeof role === 'string' ? role.trim().toLowerCase() : ''
    let resolvedSubjectName = subjectName && typeof subjectName === 'string' ? subjectName.trim() : ''
    let resolvedDepartment = department && typeof department === 'string' ? department.trim() : 'B.Tech Artificial Intelligence & Data Science'
    
    // Student specifics
    let resolvedYear = year ? Number(year) : undefined
    let resolvedSem = semester ? Number(semester) : undefined
    let resolvedSec = section ? String(section).trim() : ''
    let resolvedAdvisorName = advisorName ? String(advisorName).trim() : ''
    let resolvedSubjectHandler = ''

    // Faculty specifics
    let resolvedAdvisorYear = advisorYear ? Number(advisorYear) : undefined
    let resolvedAdvisorSem = advisorSem ? Number(advisorSem) : undefined
    let resolvedAdvisorSec = advisorSec ? String(advisorSec).trim() : ''
    let resolvedAdvisorBatch = advisorBatch ? String(advisorBatch).trim() : ''

    // Deep lookup from database for maximum accuracy
    try {
      if (resolvedFacultyId) {
        const facRec = await prisma.faculty.findUnique({ where: { facultyId: resolvedFacultyId } })
        if (facRec) {
          const u = await prisma.user.findUnique({ where: { id: facRec.userId } })
          if (u?.name && (!displayName || displayName.startsWith('Faculty ('))) displayName = u.name
          if (!resolvedAdvisorYear && facRec.advisorYear) resolvedAdvisorYear = facRec.advisorYear
          if (!resolvedAdvisorSem && facRec.advisorSem) resolvedAdvisorSem = facRec.advisorSem
          if (!resolvedAdvisorSec && facRec.advisorSec) resolvedAdvisorSec = facRec.advisorSec
          if (!resolvedAdvisorBatch && facRec.advisorBatch) resolvedAdvisorBatch = facRec.advisorBatch

          if (!resolvedSubjectName) {
            if (facRec.subjectName) {
              resolvedSubjectName = facRec.subjectName
            } else if (facRec.subjects && facRec.subjects !== '[]') {
              try {
                const parsed = JSON.parse(facRec.subjects)
                resolvedSubjectName = Array.isArray(parsed) && parsed.length > 0 ? parsed.join(', ') : facRec.subjects
              } catch {
                resolvedSubjectName = facRec.subjects
              }
            }
          }

          if (!resolvedRole || resolvedRole === 'faculty') {
            resolvedRole = facRec.facultyType || ((resolvedAdvisorYear || resolvedAdvisorSec) && resolvedSubjectName ? 'both' : (resolvedAdvisorYear || resolvedAdvisorSec) ? 'advisor' : 'subject_handler')
          }
        }

        const hodRec = await prisma.hOD.findUnique({ where: { facultyId: resolvedFacultyId } })
        if (hodRec) {
          resolvedRole = 'hod'
          const u = await prisma.user.findUnique({ where: { id: hodRec.userId } })
          if (u?.name) displayName = u.name
          if (hodRec.department) resolvedDepartment = hodRec.department
        }
      } else if (resolvedRegNo) {
        resolvedRole = 'student'
        const studentRec = await prisma.student.findUnique({ where: { registerNumber: resolvedRegNo } })
        if (studentRec) {
          const u = await prisma.user.findUnique({ where: { id: studentRec.userId } })
          if (u?.name && (!displayName || displayName.startsWith('Student ('))) displayName = u.name
          if (studentRec.department) resolvedDepartment = studentRec.department
          if (!resolvedYear && studentRec.year) resolvedYear = studentRec.year
          if (!resolvedSem && studentRec.semester) resolvedSem = studentRec.semester
          if (!resolvedSec && studentRec.section) resolvedSec = studentRec.section
          if (!resolvedAdvisorName && studentRec.advisorName) resolvedAdvisorName = studentRec.advisorName
        }
      } else if (trimmedEmail) {
        const u = await prisma.user.findUnique({ where: { email: trimmedEmail } })
        if (u) {
          if (!displayName) displayName = u.name
          if (u.role === 'student') {
            resolvedRole = 'student'
            const studentRec = await prisma.student.findUnique({ where: { userId: u.id } })
            if (studentRec) {
              if (!resolvedRegNo) resolvedRegNo = studentRec.registerNumber
              if (studentRec.department) resolvedDepartment = studentRec.department
              if (!resolvedYear && studentRec.year) resolvedYear = studentRec.year
              if (!resolvedSem && studentRec.semester) resolvedSem = studentRec.semester
              if (!resolvedSec && studentRec.section) resolvedSec = studentRec.section
              if (!resolvedAdvisorName && studentRec.advisorName) resolvedAdvisorName = studentRec.advisorName
            }
          } else {
            const facRec = await prisma.faculty.findUnique({ where: { userId: u.id } })
            if (facRec) {
              if (!resolvedFacultyId) resolvedFacultyId = facRec.facultyId
              if (!resolvedAdvisorYear && facRec.advisorYear) resolvedAdvisorYear = facRec.advisorYear
              if (!resolvedAdvisorSem && facRec.advisorSem) resolvedAdvisorSem = facRec.advisorSem
              if (!resolvedAdvisorSec && facRec.advisorSec) resolvedAdvisorSec = facRec.advisorSec
              if (!resolvedAdvisorBatch && facRec.advisorBatch) resolvedAdvisorBatch = facRec.advisorBatch
              if (!resolvedSubjectName) {
                if (facRec.subjectName) {
                  resolvedSubjectName = facRec.subjectName
                } else if (facRec.subjects && facRec.subjects !== '[]') {
                  try {
                    const parsed = JSON.parse(facRec.subjects)
                    resolvedSubjectName = Array.isArray(parsed) && parsed.length > 0 ? parsed.join(', ') : facRec.subjects
                  } catch {
                    resolvedSubjectName = facRec.subjects
                  }
                }
              }
              if (!resolvedRole || resolvedRole === 'faculty') {
                resolvedRole = facRec.facultyType || ((resolvedAdvisorYear || resolvedAdvisorSec) && resolvedSubjectName ? 'both' : (resolvedAdvisorYear || resolvedAdvisorSec) ? 'advisor' : 'subject_handler')
              }
            }
          }
        }
      }

      // If student advisorName is still missing, lookup faculty advisor for this student's year and section
      if (resolvedRole === 'student' && !resolvedAdvisorName && resolvedYear && resolvedSec) {
        const advFaculty = await prisma.faculty.findFirst({
          where: {
            advisorYear: resolvedYear,
            advisorSec: { equals: resolvedSec, mode: 'insensitive' },
          },
        })
        if (advFaculty) {
          const advUser = await prisma.user.findUnique({ where: { id: advFaculty.userId } })
          if (advUser?.name) resolvedAdvisorName = advUser.name
        }
      }

      // If student, also resolve active subject handler in department
      if (resolvedRole === 'student') {
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
            resolvedSubjectHandler = `${subUser.name} (${course})`
          } else if (subUser?.name) {
            resolvedSubjectHandler = subUser.name
          } else if (course) {
            resolvedSubjectHandler = course
          }
        }
      }
    } catch (dbErr) {
      console.warn('Error during detailed user lookup in send-onboarding-otp:', dbErr)
    }

    if (!displayName) {
      displayName = resolvedRole === 'hod' ? 'Head of Department' : resolvedRole === 'advisor' ? 'Class Advisor' : resolvedRole === 'subject_handler' ? 'Subject Handler' : resolvedRole === 'faculty' ? 'Faculty Member' : 'Student'
    }

    console.log(`[VSB Onboarding] Dispatching OTP email to ${trimmedEmail} (Role: ${resolvedRole}, Name: ${displayName}, RegNo: ${resolvedRegNo}, FacultyId: ${resolvedFacultyId})`)
    const emailResult = await sendStudentVerificationEmail({
      email: trimmedEmail,
      otp,
      name: displayName,
      role: resolvedRole,
      registerNumber: resolvedRegNo,
      facultyId: resolvedFacultyId,
      department: resolvedDepartment,
      year: resolvedYear,
      semester: resolvedSem,
      section: resolvedSec,
      advisorName: resolvedAdvisorName,
      subjectHandlerName: resolvedSubjectHandler,
      advisorYear: resolvedAdvisorYear,
      advisorSem: resolvedAdvisorSem,
      advisorSec: resolvedAdvisorSec,
      advisorBatch: resolvedAdvisorBatch,
      subjectName: resolvedSubjectName,
    })

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
