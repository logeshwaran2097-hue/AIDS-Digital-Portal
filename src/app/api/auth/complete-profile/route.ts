import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getSession, createToken, verifyOTPChallenge } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { verifyOTP, parseSafeDateOfBirth } from '@/lib/utils'
import { invalidateCache } from '@/lib/dbCache'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { validateBody, completeProfileSchema } from '@/lib/validations/apiValidation'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const rawBody = await request.json().catch(() => ({}))
    const validation = validateBody(completeProfileSchema, rawBody)
    if (!validation.success) {
      return validation.response
    }
    const body = validation.data
    const userIdentifier = session?.userId || session?.email || body?.email || body?.registerNumber || ''

    // Dual Rate Limit: 5 attempts per 15 min per IP and per user
    const rateLimit = await checkRateLimit(request, 5, 900, 'auth:complete-profile', userIdentifier)
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit)
    }
    const {
      userId: bodyUserId,
      registerNumber: bodyRegNumber,
      facultyId: bodyFacultyId,
      role: bodyRole,
      name,
      phone,
      parentPhone,
      isParentWhatsapp,
      email,
      dateOfBirth,
      department,
      year,
      semester,
      section,
      advisorName,
      bloodGroup,
      residencyStatus,
      hostelBlock,
      roomNo,
      busNo,
      boardingPoint,
      profileImage,
      address,
      busDetails,
      newPassword,
      qualification,
      specialization,
      experience,
      correctionRemarks,
      staffId,
      emailOtp,
      challenge,
    } = body

    // 1. Resolve Target User ID & Role
    // If authenticated, target user MUST strictly be the session user (preventing IDOR)
    let targetUserId = session ? session.userId : bodyUserId
    let targetRole = session ? session.role : (bodyRole || 'student')
    let targetRegNumber = (session?.registerNumber || (!session ? bodyRegNumber : '') || '').trim().toUpperCase()
    let targetFacultyId = (session?.facultyId || (!session ? bodyFacultyId : '') || '').trim().toUpperCase()

    // If unauthenticated, require an OTP or cryptographic challenge
    if (!session && !emailOtp && !body.otp && !challenge) {
      return NextResponse.json(
        { success: false, message: 'Authentication required. Active session or verified OTP challenge is required.' },
        { status: 401 }
      )
    }

    // 2. Lookup existing user record
    let user = targetUserId ? await prisma.user.findUnique({ where: { id: targetUserId } }) : null

    // If not found by ID and unauthenticated, look up by registerNumber (for students)
    if (!user && targetRegNumber && !session) {
      const studentRec = await prisma.student.findUnique({
        where: { registerNumber: targetRegNumber },
      })
      if (studentRec) {
        user = await prisma.user.findUnique({ where: { id: studentRec.userId } })
        targetUserId = studentRec.userId
      }
    }

    // If not found by ID, look up by facultyId (for faculty / hod)
    if (!user && targetFacultyId) {
      const facultyRec = await prisma.faculty.findUnique({
        where: { facultyId: targetFacultyId },
      })
      if (facultyRec) {
        user = await prisma.user.findUnique({ where: { id: facultyRec.userId } })
        targetUserId = facultyRec.userId
      } else {
        const hodRec = await prisma.hOD.findUnique({
          where: { facultyId: targetFacultyId },
        })
        if (hodRec) {
          user = await prisma.user.findUnique({ where: { id: hodRec.userId } })
          targetUserId = hodRec.userId
          targetRole = 'hod'
        }
      }
    }

    // If still not found, search by email
    const normalizedEmail = email && email.trim() ? email.trim().toLowerCase() : undefined
    if (!user && normalizedEmail) {
      user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
      if (user) {
        targetUserId = user.id
        targetRole = user.role
      }
    }

    // If user record still does not exist, reject - only admin can register users
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Account not found. Students, Advisors, Faculty, and HOD can only be registered by an Administrator.' },
        { status: 404 }
      )
    }

    // Check if new email is already in use by another user
    if (normalizedEmail && user && normalizedEmail !== user.email) {
      const existingUserWithEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } })
      if (existingUserWithEmail && existingUserWithEmail.id !== targetUserId) {
        // Check what profiles are attached to existingUserWithEmail
        const [linkedStudent, linkedFaculty, linkedHod, linkedAdmin] = await Promise.all([
          prisma.student.findUnique({ where: { userId: existingUserWithEmail.id } }).catch(() => null),
          prisma.faculty.findUnique({ where: { userId: existingUserWithEmail.id } }).catch(() => null),
          prisma.hOD.findUnique({ where: { userId: existingUserWithEmail.id } }).catch(() => null),
          prisma.admin.findUnique({ where: { userId: existingUserWithEmail.id } }).catch(() => null),
        ])

        const isSameStudent = Boolean(linkedStudent && targetRegNumber && linkedStudent.registerNumber.toUpperCase() === targetRegNumber.toUpperCase())
        const isOrphan = !linkedStudent && !linkedFaculty && !linkedHod && !linkedAdmin

        if (isSameStudent || isOrphan) {
          // If it's an orphaned placeholder user or the same student's duplicate account,
          // release the email by renaming or deleting the orphan
          try {
            await prisma.user.update({
              where: { id: existingUserWithEmail.id },
              data: { email: `released_${Date.now()}_${existingUserWithEmail.email}` }
            })
            if (isOrphan) {
              await prisma.user.delete({ where: { id: existingUserWithEmail.id } }).catch(() => {})
            }
          } catch (cleanErr) {
            console.warn('Could not release duplicate email record:', cleanErr)
          }
        } else {
          return NextResponse.json(
            { success: false, message: `The email address ${normalizedEmail} is already linked to another account. Please use your unique personal or official email.` },
            { status: 400 }
          )
        }
      }
    }

    // OTP verification (Mandatory if unauthenticated, optional if logged in)
    const submittedOtp = (emailOtp || body.otp || '').trim()
    if (!session && !submittedOtp && !challenge) {
      return NextResponse.json(
        { success: false, message: 'Authentication required. Active session or verified OTP is required.' },
        { status: 401 }
      )
    }

    if (submittedOtp || (!session && challenge)) {
      const otpRecord = await prisma.oTP.findFirst({
        where: {
          email: normalizedEmail || user.email,
          expiresAt: { gt: new Date() },
          used: false,
        },
        orderBy: { createdAt: 'desc' },
      })
      const isValidChallenge = Boolean(challenge && verifyOTPChallenge(challenge, normalizedEmail || user.email, submittedOtp))
      const isDbOtpValid = otpRecord
        ? (verifyOTP(submittedOtp, otpRecord.codeHash) || (await bcrypt.compare(submittedOtp, otpRecord.codeHash).catch(() => false)))
        : false

      if (!isValidChallenge && !isDbOtpValid) {
        return NextResponse.json(
          { success: false, message: 'Invalid or expired OTP code. Please enter the correct code.' },
          { status: 400 }
        )
      }
      if (otpRecord) {
        await prisma.oTP.update({
          where: { id: otpRecord.id },
          data: { used: true },
        }).catch(() => {})
      }
    }

    // 3. Password validation & hashing
    let passwordHash: string | undefined = undefined
    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        return NextResponse.json(
          { success: false, message: 'New password must be at least 6 characters long.' },
          { status: 400 }
        )
      }
      passwordHash = await bcrypt.hash(newPassword.trim(), 10)
    }

    // 4. Update User Record safely
    let updatedUser
    try {
      updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: {
          ...(name && name.trim() ? { name: name.trim() } : {}),
          ...(normalizedEmail ? { email: normalizedEmail } : {}),
          ...(phone !== undefined ? { phone: phone.trim() || null } : {}),
          ...(body.profileImage ? { profileImage: body.profileImage } : {}),
          ...(passwordHash ? { passwordHash, mustChangePassword: false } : { mustChangePassword: false }),
          emailVerified: true,
          updatedAt: new Date(),
        },
      })
    } catch (err: any) {
      if (err?.code === 'P2002' || String(err?.message || '').includes('Unique constraint')) {
        try {
          const collider = normalizedEmail ? await prisma.user.findUnique({ where: { email: normalizedEmail } }) : null
          if (collider && collider.id !== targetUserId) {
            await prisma.user.update({
              where: { id: collider.id },
              data: { email: `conflicted_${Date.now()}_${collider.email}` }
            }).catch(() => {})
          }
          updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: {
              ...(name && name.trim() ? { name: name.trim() } : {}),
              ...(normalizedEmail ? { email: normalizedEmail } : {}),
              ...(phone !== undefined ? { phone: phone.trim() || null } : {}),
              ...(body.profileImage ? { profileImage: body.profileImage } : {}),
              ...(passwordHash ? { passwordHash, mustChangePassword: false } : { mustChangePassword: false }),
              emailVerified: true,
              updatedAt: new Date(),
            },
          })
        } catch {
          // Last resort fallback: save without changing email if still constrained
          updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: {
              ...(name && name.trim() ? { name: name.trim() } : {}),
              ...(phone !== undefined ? { phone: phone.trim() || null } : {}),
              ...(body.profileImage ? { profileImage: body.profileImage } : {}),
              ...(passwordHash ? { passwordHash, mustChangePassword: false } : { mustChangePassword: false }),
              emailVerified: true,
              updatedAt: new Date(),
            },
          })
        }
      } else {
        throw err
      }
    }

    const parsedDob = parseSafeDateOfBirth(dateOfBirth)

    // 5. Update Profile Record based on role
    if (targetRole === 'student' || targetRegNumber) {
      const studentRec = await prisma.student.findFirst({
        where: { OR: [{ userId: targetUserId }, { registerNumber: targetRegNumber }] },
      })

      const studentDob = parsedDob || studentRec?.dateOfBirth || null
      const parsedYear = year ? (typeof year === 'string' && year.includes('Year') ? parseInt(year.replace(/\D/g, '')) || (studentRec?.year ?? 1) : Number(year) || (studentRec?.year ?? 1)) : (studentRec?.year ?? 1)
      const parsedSem = semester ? (typeof semester === 'string' && semester.includes('Semester') ? parseInt(semester.replace(/\D/g, '')) || (studentRec?.semester ?? 1) : Number(semester) || (studentRec?.semester ?? 1)) : (studentRec?.semester ?? 1)
      const parsedSection = section ? section.replace('Section ', '').trim() : (studentRec?.section || 'A')

      if (studentRec) {
        await prisma.student.update({
          where: { id: studentRec.id },
          data: {
            userId: targetUserId,
            ...(studentDob ? { dateOfBirth: studentDob } : {}),
            department: department || studentRec.department || 'Artificial Intelligence & Data Science',
            year: parsedYear,
            semester: parsedSem,
            section: parsedSection,
            ...(parentPhone !== undefined ? { parentPhone: parentPhone ? parentPhone.trim() : null } : {}),
            ...(isParentWhatsapp !== undefined ? { isParentWhatsapp: Boolean(isParentWhatsapp) } : {}),
            ...(bloodGroup !== undefined && bloodGroup !== '' ? { bloodGroup } : {}),
            ...(residencyStatus !== undefined && residencyStatus !== '' ? { residencyStatus } : {}),
            ...(residencyStatus && residencyStatus.toLowerCase().includes('hostel')
              ? {
                  hostelBlock: hostelBlock !== undefined ? hostelBlock : studentRec.hostelBlock,
                  roomNo: roomNo !== undefined ? roomNo : studentRec.roomNo,
                  busNo: null,
                  boardingPoint: null,
                  busDetails: null,
                }
              : residencyStatus && (residencyStatus.toLowerCase().includes('day scholar') || residencyStatus.toLowerCase().includes('dayscholar'))
              ? {
                  hostelBlock: null,
                  roomNo: null,
                  busNo: busNo !== undefined ? busNo : studentRec.busNo,
                  boardingPoint: boardingPoint !== undefined ? boardingPoint : studentRec.boardingPoint,
                  busDetails: busDetails !== undefined && busDetails !== '' ? busDetails.trim() : studentRec.busDetails,
                }
              : {
                  ...(hostelBlock !== undefined ? { hostelBlock } : {}),
                  ...(roomNo !== undefined ? { roomNo } : {}),
                  ...(busNo !== undefined ? { busNo } : {}),
                  ...(boardingPoint !== undefined ? { boardingPoint } : {}),
                  ...(busDetails !== undefined && busDetails !== '' ? { busDetails: busDetails.trim() } : {}),
                }),
            ...(address !== undefined && address !== '' ? { address: address.trim() } : {}),
            ...(advisorName !== undefined && advisorName !== '' ? { advisorName: advisorName.trim() } : {}),
          } as any,
        }).catch((err) => console.warn('Student update warning:', err))

        if (studentRec.userId !== targetUserId) {
          await prisma.user.update({
            where: { id: studentRec.userId },
            data: { mustChangePassword: false },
          }).catch(() => {})
        }
      } else {
        return NextResponse.json(
          { success: false, message: 'Student profile not found. Students can only be added by an Administrator.' },
          { status: 404 }
        )
      }
    } else if (targetRole === 'faculty' || targetRole === 'advisor') {
      const facultyRec = await prisma.faculty.findFirst({
        where: { OR: [{ userId: targetUserId }, { facultyId: targetFacultyId }] },
      })

      const userEnteredStaffId = staffId && typeof staffId === 'string' && staffId.trim() ? staffId.trim().toUpperCase() : undefined

      if (facultyRec) {
        await prisma.faculty.update({
          where: { id: facultyRec.id },
          data: {
            ...(userEnteredStaffId ? { facultyId: userEnteredStaffId } : {}),
            ...(qualification ? { qualification: qualification.trim() } : {}),
            ...(specialization ? { specialization: specialization.trim() } : {}),
            ...(experience !== undefined ? { experience: Number(experience) || facultyRec.experience } : {}),
            ...(parsedDob ? { dateOfBirth: parsedDob } : {}),
            ...(body.advisorBatch !== undefined ? { advisorBatch: body.advisorBatch } : {}),
            ...(body.advisorYear !== undefined ? { advisorYear: Number(body.advisorYear) || null } : {}),
            ...(body.advisorSem !== undefined ? { advisorSem: Number(body.advisorSem) || null } : {}),
            ...(body.advisorSec !== undefined ? { advisorSec: body.advisorSec } : {}),
            ...(body.classPeriod !== undefined ? { classPeriod: body.classPeriod } : {}),
          },
        }).catch((err) => console.warn('Faculty update warning:', err))
      } else {
        return NextResponse.json(
          { success: false, message: 'Faculty profile not found. Faculty and Advisors can only be added by an Administrator.' },
          { status: 404 }
        )
      }
    } else if (targetRole === 'hod') {
      const hodRec = await prisma.hOD.findFirst({
        where: { OR: [{ userId: targetUserId }, { facultyId: targetFacultyId }] },
      })

      const userEnteredStaffId = staffId && typeof staffId === 'string' && staffId.trim() ? staffId.trim().toUpperCase() : undefined

      if (hodRec) {
        await prisma.hOD.update({
          where: { id: hodRec.id },
          data: {
            ...(userEnteredStaffId ? { facultyId: userEnteredStaffId } : {}),
            ...(department ? { department: department.trim() } : {}),
            ...(qualification ? { qualification: qualification.trim() } : {}),
            ...(experience !== undefined ? { experience: Number(experience) || hodRec.experience } : {}),
            ...(parsedDob ? { dateOfBirth: parsedDob } : {}),
          },
        }).catch((err) => console.warn('HOD update warning:', err))
      } else {
        return NextResponse.json(
          { success: false, message: 'HOD profile not found. Head of Department can only be appointed by an Administrator.' },
          { status: 404 }
        )
      }
    }

    // 6. If correction requested, create audit log for admin
    if (correctionRemarks && correctionRemarks.trim()) {
      const moduleName = targetRole === 'student' ? 'student_onboarding' : `${targetRole}_onboarding`
      const idLabel = targetRole === 'student' ? targetRegNumber : targetFacultyId || updatedUser.email
      await prisma.auditLog.create({
        data: {
          userName: updatedUser.name,
          action: 'correction_request',
          module: moduleName,
          details: `${targetRole.toUpperCase()} ${updatedUser.name} (${idLabel}) requested data corrections: "${correctionRemarks.trim()}"`,
          status: 'pending_review',
        },
      }).catch(() => {})
    }

    // 7. Reissue updated JWT session token
    const token = await createToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role as any,
      registerNumber: targetRegNumber || undefined,
      facultyId: targetFacultyId || undefined,
    })

    const response = NextResponse.json({
      success: true,
      message: 'Profile details and permanent password updated successfully.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        mustChangePassword: false,
      },
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })

    // Invalidate dashboard caches to ensure updated profile loads fresh without onboarding popups
    try {
      invalidateCache('auth')
      invalidateCache(updatedUser.id)
      revalidatePath('/dashboard')
      revalidatePath('/dashboard/profile')
      revalidatePath('/faculty-dashboard')
      revalidatePath('/hod-dashboard')
      revalidatePath('/admin/students')
    } catch {}

    return response
  } catch (error) {
    console.error('Complete profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to complete profile. Please try again.' },
      { status: 500 }
    )
  }
}
