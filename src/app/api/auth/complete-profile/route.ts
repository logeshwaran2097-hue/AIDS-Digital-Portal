import { NextRequest, NextResponse } from 'next/server'
import { getSession, createToken, verifyOTPChallenge } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const body = await request.json()
    const {
      userId: bodyUserId,
      registerNumber: bodyRegNumber,
      facultyId: bodyFacultyId,
      role: bodyRole,
      name,
      phone,
      parentPhone,
      email,
      dateOfBirth,
      department,
      year,
      semester,
      section,
      advisorName,
      bloodGroup,
      address,
      busDetails,
      newPassword,
      qualification,
      specialization,
      experience,
      correctionRemarks,
      emailOtp,
      challenge,
    } = body

    // 1. Resolve Target User ID & Role
    let targetUserId = session?.userId || bodyUserId
    let targetRole = session?.role || bodyRole || 'student'
    let targetRegNumber = (session?.registerNumber || bodyRegNumber || '').trim().toUpperCase()
    let targetFacultyId = (session?.facultyId || bodyFacultyId || '').trim().toUpperCase()

    // 2. Lookup existing user record
    let user = targetUserId ? await prisma.user.findUnique({ where: { id: targetUserId } }) : null

    // If not found by ID, look up by registerNumber (for students)
    if (!user && targetRegNumber) {
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
      }
    }

    // If still not found, search by email
    const normalizedEmail = email && email.trim() ? email.trim().toLowerCase() : undefined
    if (!user && normalizedEmail) {
      user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
      if (user) targetUserId = user.id
    }

    // If user record still does not exist, provision a new user record
    if (!user) {
      const defaultEmail = normalizedEmail || `${(targetRegNumber || targetFacultyId || 'user').toLowerCase()}@vsb.edu.in`
      user = await prisma.user.create({
        data: {
          name: name && name.trim() ? name.trim() : (targetRegNumber || 'Student User'),
          email: defaultEmail,
          phone: phone ? phone.trim() : null,
          role: targetRole,
          status: 'active',
          mustChangePassword: false,
        },
      })
      targetUserId = user.id
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
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...(name && name.trim() ? { name: name.trim() } : {}),
        ...(normalizedEmail ? { email: normalizedEmail } : {}),
        ...(phone !== undefined ? { phone: phone.trim() || null } : {}),
        ...(passwordHash ? { passwordHash, mustChangePassword: false } : { mustChangePassword: false }),
        emailVerified: true,
        updatedAt: new Date(),
      },
    })

    // 5. Update Student Record if user is student
    if (targetRole === 'student' || targetRegNumber) {
      const studentRec = await prisma.student.findFirst({
        where: { OR: [{ userId: targetUserId }, { registerNumber: targetRegNumber }] },
      })

      const parsedDob = dateOfBirth ? new Date(dateOfBirth) : new Date('2006-08-15')
      const parsedYear = typeof year === 'string' && year.includes('Year') ? parseInt(year.replace(/\D/g, '')) || 2 : Number(year) || 2
      const parsedSem = typeof semester === 'string' && semester.includes('Semester') ? parseInt(semester.replace(/\D/g, '')) || 4 : Number(semester) || 4
      const parsedSection = section ? section.replace('Section ', '').trim() : 'A'

      if (studentRec) {
        await prisma.student.update({
          where: { id: studentRec.id },
          data: {
            dateOfBirth: parsedDob,
            department: department || studentRec.department || 'Artificial Intelligence & Data Science',
            year: parsedYear,
            semester: parsedSem,
            section: parsedSection,
            ...(parentPhone !== undefined ? { parentPhone: parentPhone ? parentPhone.trim() : null } : {}),
            ...(bloodGroup !== undefined && bloodGroup !== '' ? { bloodGroup } : {}),
            ...(address !== undefined && address !== '' ? { address: address.trim() } : {}),
            ...(busDetails !== undefined && busDetails !== '' ? { busDetails: busDetails.trim() } : {}),
          } as any,
        }).catch((err) => console.warn('Student update warning:', err))
      } else if (targetRegNumber) {
        await prisma.student.create({
          data: {
            userId: targetUserId,
            registerNumber: targetRegNumber,
            dateOfBirth: parsedDob,
            department: department || 'Artificial Intelligence & Data Science',
            year: parsedYear,
            semester: parsedSem,
            section: parsedSection,
            ...(parentPhone !== undefined && parentPhone ? { parentPhone: parentPhone.trim() } : {}),
            ...(bloodGroup !== undefined && bloodGroup !== '' ? { bloodGroup } : {}),
            ...(address !== undefined && address !== '' ? { address: address.trim() } : {}),
            ...(busDetails !== undefined && busDetails !== '' ? { busDetails: busDetails.trim() } : {}),
          } as any,
        }).catch((err) => console.warn('Student create warning:', err))
      }
    }

    // 6. If correction requested, create audit log for admin
    if (correctionRemarks && correctionRemarks.trim()) {
      await prisma.auditLog.create({
        data: {
          userName: updatedUser.name,
          action: 'correction_request',
          module: 'student_onboarding',
          details: `Student ${updatedUser.name} (${targetRegNumber}) requested data corrections: "${correctionRemarks.trim()}"`,
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

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error('Complete profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to complete profile: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
