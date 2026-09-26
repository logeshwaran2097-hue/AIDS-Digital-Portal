import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { parseSafeDateOfBirth, isPlaceholderEmail } from '@/lib/utils'
import { getSession } from '@/lib/auth'
import { validateBody, adminCreateStudentSchema, studentSelfUpdateSchema, adminUpdateStudentSchema } from '@/lib/validations/apiValidation'
import { invalidateDbCache } from '@/lib/dbCache'
import { getDefaultBatchForYear, getSemesterForYear } from '@/lib/academicBatch'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please log in to view student records.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const semester = searchParams.get('semester')
    const section = searchParams.get('section')

    const where: any = {}
    if (year && year !== 'ALL') where.year = Number(year)
    if (semester && semester !== 'ALL') where.semester = Number(semester)
    if (section && section !== 'ALL') where.section = section

    const isUnfiltered = (!year || year === 'ALL') && (!semester || semester === 'ALL') && (!section || section === 'ALL')

    if (isUnfiltered) {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT 
          s.id,
          s."userId",
          s."registerNumber",
          s."dateOfBirth",
          s.department,
          s.year,
          s.semester,
          s.section,
          s.batch,
          s."advisorName",
          s."parentPhone",
          s."isParentWhatsapp",
          s."bloodGroup",
          s."residencyStatus",
          s."hostelBlock",
          s."roomNo",
          s."busNo",
          s."boardingPoint",
          s.address,
          s."busDetails",
          s.cgpa,
          s.attendance,
          u.name as user_name,
          u.email as user_email,
          u.phone as user_phone,
          u.status as user_status,
          u."lastLogin" as user_last_login,
          u."emailVerified" as user_email_verified,
          u."profileImage" as user_profile_image
        FROM "Student" s
        LEFT JOIN "User" u ON s."userId" = u.id
        ORDER BY s."registerNumber" ASC
      `

      const result = rows.map((s) => {
        const rawEmail = s.user_email || ''
        const displayEmail = isPlaceholderEmail(rawEmail, s.registerNumber) ? '' : rawEmail
        // A student is ACTIVE ONLY if they have authenticated and logged into the website
        const hasLoggedInWebsite = Boolean(s.user_last_login) && s.user_status?.toLowerCase() === 'active'
        const effectiveStatus = hasLoggedInWebsite ? 'active' : 'inactive'

        return {
          id: s.id,
          userId: s.userId,
          registerNumber: s.registerNumber,
          name: s.user_name || s.registerNumber,
          email: displayEmail,
          phone: s.user_phone || '',
          parentPhone: s.parentPhone || '',
          dateOfBirth: s.dateOfBirth && new Date(s.dateOfBirth).toISOString().split('T')[0] !== '2004-01-01' ? new Date(s.dateOfBirth).toISOString().split('T')[0] : null,
          department: s.department || 'Artificial Intelligence & Data Science',
          year: s.year,
          semester: s.semester,
          batch: s.batch || getDefaultBatchForYear(s.year),
          section: s.section,
          advisorName: s.advisorName || '',
          status: effectiveStatus,
          bloodGroup: s.bloodGroup,
          residencyStatus: s.residencyStatus,
          busNo: s.busNo || null,
          boardingPoint: s.boardingPoint || null,
          busDetails: s.busDetails || null,
          hostelBlock: s.hostelBlock || null,
          roomNo: s.roomNo || null,
          address: s.address || null,
          cgpa: s.cgpa,
          attendance: s.attendance,
          profileImage: s.user_profile_image || null,
        }
      })

      return NextResponse.json({ success: true, students: result })
    }

    const [students, advisors] = await Promise.all([
      prisma.student.findMany({
        where,
        orderBy: { registerNumber: 'asc' },
      }),
      prisma.faculty.findMany({
        where: {
          advisorYear: { not: null },
        },
      }).catch(() => []),
    ])

    const userIds = students.map((s) => s.userId)
    const facultyUserIds = advisors.map((a) => a.userId)
    const allUserIds = Array.from(new Set([...userIds, ...facultyUserIds]))

    const users = await prisma.user.findMany({
      where: { id: { in: allUserIds } },
    })
    const userMap = new Map(users.map((u) => [u.id, u]))

    const advisorMap = new Map<string, string>()
    advisors.forEach((a) => {
      const u = userMap.get(a.userId)
      const name = u?.name || a.facultyId
      if (a.advisorYear) {
        if (a.advisorSec && a.advisorSec !== 'ALL') {
          advisorMap.set(`${a.advisorYear}-${a.advisorSec.toUpperCase()}`, name)
        }
        if (!advisorMap.has(`${a.advisorYear}-ALL`)) {
          advisorMap.set(`${a.advisorYear}-ALL`, name)
        }
      }
    })

    const studentsToBackfill: string[] = []

    const result = students.map((s) => {
      const u = userMap.get(s.userId)
      const rawEmail = u?.email || ''
      const displayEmail = isPlaceholderEmail(rawEmail, s.registerNumber) ? '' : rawEmail
      // A student is ACTIVE ONLY if they have authenticated and logged into the website
      const hasLoggedInWebsite = Boolean(u?.lastLogin) && u?.status?.toLowerCase() === 'active'
      const effectiveStatus = hasLoggedInWebsite ? 'active' : 'inactive'
      const secKey = (s.section || 'A').toUpperCase()
      const resolvedAdvisor =
        (s as any).advisorName ||
        advisorMap.get(`${s.year}-${secKey}`) ||
        advisorMap.get(`${s.year}-ALL`) ||
        ''

      if (!(s as any).advisorName && resolvedAdvisor) {
        studentsToBackfill.push(s.id)
      }

      return {
        id: s.id,
        userId: s.userId,
        registerNumber: s.registerNumber,
        name: u?.name || s.registerNumber,
        email: displayEmail,
        phone: u?.phone || '',
        parentPhone: (s as any).parentPhone || '',
        dateOfBirth: s.dateOfBirth && s.dateOfBirth.toISOString().split('T')[0] !== '2004-01-01' ? s.dateOfBirth.toISOString().split('T')[0] : null,
        department: s.department || 'Artificial Intelligence & Data Science',
        year: s.year,
        semester: s.semester,
        batch: (s as any).batch || getDefaultBatchForYear(s.year),
        section: s.section,
        advisorName: resolvedAdvisor,
        status: effectiveStatus,
        bloodGroup: (s as any).bloodGroup,
        residencyStatus: (s as any).residencyStatus,
        busNo: s.busNo || null,
        boardingPoint: s.boardingPoint || null,
        busDetails: s.busDetails || null,
        hostelBlock: s.hostelBlock || null,
        roomNo: s.roomNo || null,
        address: s.address || null,
        cgpa: (s as any).cgpa,
        attendance: (s as any).attendance,
        profileImage: (u as any)?.profileImage || null,
      }
    })

    return NextResponse.json({ success: true, students: result })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch students', students: [] },
      { status: 200 }
    )
  }
}

function formatDatabaseError(error: any, fallbackMessage: string, regNumber?: string): string {
  if (!error) return fallbackMessage
  const code = error?.code
  const msg = String(error?.message || '')

  if (code === 'P2002') {
    const target = Array.isArray(error?.meta?.target)
      ? error.meta.target.join(', ')
      : String(error?.meta?.target || '')
    if (target.includes('registerNumber') || msg.includes('registerNumber')) {
      return regNumber
        ? `Register Number "${regNumber}" is already registered in the system. Please verify or use a different register number.`
        : 'This Register Number is already registered in the system. Please use a unique register number.'
    }
    if (target.includes('email') || msg.includes('email')) {
      return 'The email address is already registered to another user account. Please use a unique email address.'
    }
    return 'A student record with these unique details already exists in the system.'
  }

  if (
    code === 'P2024' ||
    msg.includes('Timed out fetching a new connection') ||
    msg.includes('connection pool') ||
    msg.includes('Connection timed out') ||
    msg.includes('remaining connection slots are reserved') ||
    msg.includes('EMAXCONNSESSION') ||
    msg.includes('max clients reached') ||
    msg.includes('pool_size')
  ) {
    return 'The database connection pool is temporarily busy. Your form input is safely preserved—please submit again.'
  }

  if (msg.includes("Can't reach database server") || msg.includes('Connection refused') || msg.includes('closed the connection')) {
    return 'Database service is temporarily busy. Please check your network and try again in a few moments.'
  }

  const clean = msg
    .replace(/PrismaClient\w+Error:\s*/gi, '')
    .replace(/Invalid `.*?` invocation:\s*/gi, '')
    .replace(/(\r\n|\n|\r)/gm, ' ')
    .trim()

  return clean && clean.length > 0 && clean.length < 160 ? clean : fallbackMessage
}

export async function POST(request: Request) {
  let data: any = {}
  try {
    const session = await getSession()
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Only administrators can create student records.' },
        { status: 403 }
      )
    }

    const rawJson = await request.json()
    const parsed = validateBody(adminCreateStudentSchema, rawJson)
    if (!parsed.success) return parsed.response
    data = parsed.data
    const {
      registerNumber,
      name,
      email,
      password,
      phone,
      parentPhone,
      dateOfBirth,
      department = 'Artificial Intelligence & Data Science',
      year = 1,
      semester = 1,
      batch,
      section = 'A',
      advisorName,
      status = 'active',
      bloodGroup,
      residencyStatus,
      busNo,
      boardingPoint,
      busDetails,
      hostelBlock,
      roomNo,
      address,
      cgpa,
      attendance,
    } = data

    if (!registerNumber || !name || !password?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Register Number, Full Name, and Temporary Password are required.' },
        { status: 400 }
      )
    }

    const regUpper = registerNumber.trim().toUpperCase()

    // 1. Check if a student with this Register Number already exists in the database
    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [
          { registerNumber: regUpper },
          { registerNumber: registerNumber.trim() },
          { registerNumber: regUpper.toLowerCase() },
        ],
      },
    })

    if (existingStudent) {
      const existingUser = await prisma.user.findUnique({
        where: { id: existingStudent.userId },
        select: { name: true, email: true },
      }).catch(() => null)

      const studentName = existingUser?.name ? ` for student "${existingUser.name}"` : ''
      const classInfo = ` (Year ${existingStudent.year}, Section ${existingStudent.section})`

      return NextResponse.json(
        {
          success: false,
          message: `Register Number "${regUpper}" is already registered in the database${studentName}${classInfo}. Please verify the register number or edit the existing record.`,
        },
        { status: 409 }
      )
    }

    const isEmailCustom = Boolean(email?.trim())
    const finalEmail = isEmailCustom ? email.trim().toLowerCase() : `${regUpper.toLowerCase()}@vsb.student.edu`

    if (isEmailCustom && !finalEmail.endsWith('@gmail.com')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Personal email address must end with @gmail.com.',
        },
        { status: 400 }
      )
    }

    if (isEmailCustom) {
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email: finalEmail },
        select: { name: true, role: true },
      }).catch(() => null)

      if (existingUserWithEmail) {
        return NextResponse.json(
          {
            success: false,
            message: `Email address "${finalEmail}" is already registered to ${existingUserWithEmail.name || 'another account'}. Please provide a unique personal email.`,
          },
          { status: 409 }
        )
      }
    }

    // Hash admin-typed temporary password
    const initialPassword = password.trim()
    const passwordHash = await bcrypt.hash(initialPassword, 10)

    // Upsert User with explicit Name and Password
    const user = await prisma.user.upsert({
      where: { email: finalEmail },
      update: {
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        role: 'student',
        status: status || 'active',
        passwordHash,
        emailVerified: isEmailCustom,
        mustChangePassword: true,
      },
      create: {
        email: finalEmail,
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        role: 'student',
        status: status || 'active',
        passwordHash,
        emailVerified: isEmailCustom,
        mustChangePassword: true,
      },
    })

    // Create Student record or attach to existing orphaned user
    const studentByUserId = await prisma.student.findUnique({
      where: { userId: user.id },
    })

    let student: any = null
    if (studentByUserId) {
      student = await prisma.student.update({
        where: { id: studentByUserId.id },
        data: {
          registerNumber: regUpper,
          department: department || studentByUserId.department,
          year: Number(year) || studentByUserId.year,
          semester: Number(semester) || studentByUserId.semester,
          batch: batch ? String(batch).trim() : (studentByUserId as any).batch,
          section: section || studentByUserId.section,
          advisorName: advisorName ? String(advisorName).trim() : (studentByUserId as any).advisorName,
          parentPhone: parentPhone ? String(parentPhone).trim() : (studentByUserId as any).parentPhone,
          dateOfBirth: parseSafeDateOfBirth(dateOfBirth, studentByUserId.dateOfBirth),
          bloodGroup: bloodGroup !== undefined ? bloodGroup : (studentByUserId as any).bloodGroup,
          residencyStatus: residencyStatus !== undefined ? residencyStatus : (studentByUserId as any).residencyStatus,
          cgpa: cgpa !== undefined && cgpa !== '' && cgpa !== null && !isNaN(parseFloat(String(cgpa))) ? parseFloat(String(cgpa)) : (studentByUserId as any).cgpa,
          attendance: attendance !== undefined && attendance !== '' ? String(attendance) : (studentByUserId as any).attendance,
        } as any,
      })
    } else {
      student = await prisma.student.create({
        data: {
          userId: user.id,
          registerNumber: regUpper,
          dateOfBirth: parseSafeDateOfBirth(dateOfBirth, new Date('2004-01-01')),
          department: department || 'Artificial Intelligence & Data Science',
          year: Number(year) || 1,
          semester: Number(semester) || 1,
          batch: (batch && String(batch).trim()) ? String(batch).trim() : getDefaultBatchForYear(year),
          section: section || 'A',
          advisorName: advisorName ? String(advisorName).trim() : null,
          parentPhone: parentPhone ? String(parentPhone).trim() : null,
          bloodGroup: bloodGroup || null,
          residencyStatus: residencyStatus || null,
          busNo: (residencyStatus && String(residencyStatus).toLowerCase().includes('hostel')) ? null : (busNo ? String(busNo).trim() : null),
          boardingPoint: (residencyStatus && String(residencyStatus).toLowerCase().includes('hostel')) ? null : (boardingPoint ? String(boardingPoint).trim() : null),
          busDetails: (residencyStatus && String(residencyStatus).toLowerCase().includes('hostel')) ? null : (busDetails ? String(busDetails).trim() : null),
          hostelBlock: (residencyStatus && (String(residencyStatus).toLowerCase().includes('day scholar') || String(residencyStatus).toLowerCase().includes('dayscholar'))) ? null : (hostelBlock ? String(hostelBlock).trim() : null),
          roomNo: (residencyStatus && (String(residencyStatus).toLowerCase().includes('day scholar') || String(residencyStatus).toLowerCase().includes('dayscholar'))) ? null : (roomNo ? String(roomNo).trim() : null),
          address: address ? String(address).trim() : null,
          cgpa: cgpa ? parseFloat(String(cgpa)) : null,
          attendance: attendance ? String(attendance) : null,
        } as any,
      })
    }

    // Broadcast real-time enrollment notification
    await prisma.notification.create({
      data: {
        title: `🎓 Student Enrolled: ${name.trim()} (${regUpper})`,
        message: `Registered into Year ${year} (Section ${section}) · ${department}. Advisor: ${advisorName || 'Assigned'}.`,
        target: 'admin',
        createdByName: 'Department Directorate',
        status: 'published',
        publishedAt: new Date(),
        readBy: '[]',
      },
    }).catch(() => {})

    revalidatePath('/admin/students')
    revalidatePath('/admin/dashboard')

    return NextResponse.json({
      success: true,
      message: `Student "${name.trim()}" (${regUpper}) registered successfully in database`,
      student: {
        id: student.id,
        userId: user.id,
        registerNumber: student.registerNumber,
        name: user.name,
        email: isEmailCustom ? user.email : '',
        phone: user.phone || '',
        parentPhone: (student as any).parentPhone || '',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString().split('T')[0] : null,
        department: student.department,
        year: student.year,
        semester: student.semester,
        batch: (student as any).batch || '',
        section: student.section,
        advisorName: (student as any).advisorName || '',
        status: user.status,
        bloodGroup: (student as any).bloodGroup,
        residencyStatus: (student as any).residencyStatus,
        busNo: (student as any).busNo || null,
        boardingPoint: (student as any).boardingPoint || null,
        busDetails: (student as any).busDetails || null,
        hostelBlock: (student as any).hostelBlock || null,
        roomNo: (student as any).roomNo || null,
        address: (student as any).address || null,
        cgpa: (student as any).cgpa,
        attendance: (student as any).attendance,
      },
      user: {
        id: user.id,
        name: user.name,
        email: isEmailCustom ? user.email : '',
        phone: user.phone || '',
      },
    })
  } catch (error: any) {
    console.error('Error creating student:', error)
    const friendlyMessage = formatDatabaseError(error, 'Failed to create student record. Please try again.', data?.registerNumber)
    const isConflict = error?.code === 'P2002'
    return NextResponse.json(
      { success: false, message: friendlyMessage },
      { status: isConflict ? 409 : 400 }
    )
  }
}

export async function PUT(request: Request) {
  let data: any = {}
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Authentication required.' },
        { status: 401 }
      )
    }

    const rawJson = await request.json()
    const isAdmin = session.role === 'admin' || session.role === 'super_admin'
    const isStudent = session.role === 'student'

    if (!isAdmin && !isStudent) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. You do not have permission to modify student records.' },
        { status: 403 }
      )
    }

    if (isStudent) {
      const parsed = validateBody(studentSelfUpdateSchema, rawJson)
      if (!parsed.success) return parsed.response
      data = parsed.data
    } else {
      const parsed = validateBody(adminUpdateStudentSchema, rawJson)
      if (!parsed.success) return parsed.response
      data = parsed.data
    }

    const {
      id,
      userId: passedUserId,
      registerNumber,
      name,
      email,
      password,
      phone,
      parentPhone,
      dateOfBirth,
      department,
      year,
      semester,
      batch,
      section,
      advisorName,
      status,
      bloodGroup,
      residencyStatus,
      cgpa,
      attendance,
    } = data

    const regUpper = registerNumber ? String(registerNumber).trim().toUpperCase() : null

    // Comprehensive student search
    let student: any = null

    if (id) {
      student = await prisma.student.findUnique({ where: { id } }).catch(() => null)
      if (!student) {
        student = await prisma.student.findFirst({ where: { userId: id } }).catch(() => null)
      }
    }

    if (!student && regUpper) {
      student = await prisma.student.findUnique({ where: { registerNumber: regUpper } }).catch(() => null)
    }

    if (!student && passedUserId) {
      student = await prisma.student.findUnique({ where: { userId: passedUserId } }).catch(() => null)
    }

    if (!student && id && id.length > 3) {
      student = await prisma.student.findUnique({ where: { registerNumber: String(id).trim().toUpperCase() } }).catch(() => null)
    }

    const isOwner = isStudent && (
      (student && (student.userId === session.userId || student.registerNumber === session.registerNumber)) ||
      (!student && session.registerNumber && (!regUpper || session.registerNumber === regUpper))
    )

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. You cannot modify another student\'s records.' },
        { status: 403 }
      )
    }

    if (!student && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Only administrators can register new student records.' },
        { status: 403 }
      )
    }

    let passwordHash: string | undefined = undefined
    if (password && password.trim()) {
      passwordHash = await bcrypt.hash(password.trim(), 10)
    }

    const isEmailCustom = Boolean(email?.trim())
    if (isEmailCustom && !isAdmin && !email.trim().toLowerCase().endsWith('@gmail.com')) {
      return NextResponse.json({
        success: false,
        message: 'Only @gmail.com email addresses are permitted for student personal emails.',
      }, { status: 400 })
    }

    // If student record exists, update both Student and User
    if (student) {
      if (regUpper && regUpper !== student.registerNumber) {
        const clash = await prisma.student.findUnique({
          where: { registerNumber: regUpper },
        }).catch(() => null)
        if (clash && clash.id !== student.id) {
          return NextResponse.json(
            {
              success: false,
              message: `Register Number "${regUpper}" is already assigned to another student in the system.`,
            },
            { status: 409 }
          )
        }
      }

      const targetEmail = isEmailCustom ? email.trim().toLowerCase() : undefined

      if (targetEmail) {
        const emailClash = await prisma.user.findFirst({
          where: {
            email: targetEmail,
            NOT: { id: student.userId },
          },
        }).catch(() => null)
        if (emailClash) {
          return NextResponse.json(
            {
              success: false,
              message: `Email address "${targetEmail}" is already registered to another user (${emailClash.name}).`,
            },
            { status: 409 }
          )
        }
      }

      const parsedDob = dateOfBirth ? parseSafeDateOfBirth(dateOfBirth) : null

      const [updatedStudent, updatedUser] = await prisma.$transaction([
        prisma.student.update({
          where: { id: student.id },
          data: {
            ...(isAdmin && regUpper ? { registerNumber: regUpper } : {}),
            ...(isAdmin && department ? { department: department.trim() } : {}),
            ...(isAdmin && year !== undefined ? { year: Number(year) } : {}),
            ...(isAdmin && semester !== undefined ? { semester: Number(semester) } : {}),
            ...(isAdmin && batch !== undefined && String(batch).trim() !== ''
              ? { batch: String(batch).trim() }
              : (isAdmin && year !== undefined && !batch)
              ? { batch: getDefaultBatchForYear(Number(year)) }
              : {}),
            ...(isAdmin && section !== undefined ? { section: section.trim() } : {}),
            ...(isAdmin && advisorName !== undefined ? { advisorName: String(advisorName).trim() } : {}),
            ...(parentPhone !== undefined ? { parentPhone: parentPhone ? String(parentPhone).trim() : null } : {}),
            ...(parsedDob ? { dateOfBirth: parsedDob } : {}),
            ...(bloodGroup !== undefined ? { bloodGroup } : {}),
            ...(residencyStatus !== undefined ? { residencyStatus } : {}),
            ...(residencyStatus && String(residencyStatus).toLowerCase().includes('hostel')
              ? {
                  hostelBlock: data.hostelBlock !== undefined ? data.hostelBlock : student.hostelBlock,
                  roomNo: data.roomNo !== undefined ? data.roomNo : student.roomNo,
                  busNo: null,
                  boardingPoint: null,
                  busDetails: null,
                }
              : residencyStatus && (String(residencyStatus).toLowerCase().includes('day scholar') || String(residencyStatus).toLowerCase().includes('dayscholar'))
              ? {
                  hostelBlock: null,
                  roomNo: null,
                  busNo: data.busNo !== undefined ? data.busNo : student.busNo,
                  boardingPoint: data.boardingPoint !== undefined ? data.boardingPoint : student.boardingPoint,
                  busDetails: data.busDetails !== undefined ? data.busDetails : student.busDetails,
                }
              : {
                  ...(data.hostelBlock !== undefined ? { hostelBlock: data.hostelBlock } : {}),
                  ...(data.roomNo !== undefined ? { roomNo: data.roomNo } : {}),
                  ...(data.busNo !== undefined ? { busNo: data.busNo } : {}),
                  ...(data.boardingPoint !== undefined ? { boardingPoint: data.boardingPoint } : {}),
                  ...(data.busDetails !== undefined ? { busDetails: data.busDetails } : {}),
                }),
            ...(data.address !== undefined ? { address: data.address } : {}),
            ...(isAdmin && cgpa !== undefined ? { cgpa: cgpa !== '' && cgpa !== null && !isNaN(parseFloat(String(cgpa))) ? parseFloat(String(cgpa)) : null } : {}),
            ...(isAdmin && attendance !== undefined ? { attendance: attendance !== '' ? String(attendance) : null } : {}),
          } as any,
        }),
        prisma.user.update({
          where: { id: student.userId },
          data: {
            ...(name ? { name: name.trim() } : {}),
            ...(email && email.trim() ? { email: targetEmail, emailVerified: isEmailCustom } : {}),
            ...(phone !== undefined ? { phone: phone ? phone.trim() : null } : {}),
            ...(data.profileImage !== undefined ? { profileImage: data.profileImage } : {}),
            ...(isAdmin && status ? { status } : {}),
            ...(passwordHash ? { passwordHash, mustChangePassword: true } : {}),
          },
        }),
      ])

      revalidatePath('/admin/students')
      revalidatePath('/admin/dashboard')
      revalidatePath('/dashboard/profile')
      revalidatePath('/dashboard')

      invalidateDbCache('auth')
      if (student?.userId) {
        invalidateDbCache(`user_${student.userId}`)
      }

      return NextResponse.json({
        success: true,
        message: 'Student profile updated successfully in database',
        student: {
          id: updatedStudent.id,
          userId: updatedStudent.userId,
          registerNumber: updatedStudent.registerNumber,
          name: updatedUser.name,
          email: isEmailCustom ? updatedUser.email : '',
          phone: updatedUser.phone || '',
          parentPhone: (updatedStudent as any).parentPhone || '',
          dateOfBirth: updatedStudent.dateOfBirth ? updatedStudent.dateOfBirth.toISOString().split('T')[0] : null,
          department: updatedStudent.department,
          year: updatedStudent.year,
          semester: updatedStudent.semester,
          batch: (updatedStudent as any).batch || '',
          section: updatedStudent.section,
          advisorName: (updatedStudent as any).advisorName || '',
          status: updatedUser.status,
          bloodGroup: updatedStudent.bloodGroup,
          residencyStatus: updatedStudent.residencyStatus,
          busNo: updatedStudent.busNo || null,
          boardingPoint: updatedStudent.boardingPoint || null,
          busDetails: updatedStudent.busDetails || null,
          hostelBlock: updatedStudent.hostelBlock || null,
          roomNo: updatedStudent.roomNo || null,
          address: updatedStudent.address || null,
          cgpa: updatedStudent.cgpa,
          attendance: updatedStudent.attendance,
          profileImage: updatedUser.profileImage || null,
        },
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: isEmailCustom ? updatedUser.email : '',
          phone: updatedUser.phone || '',
          profileImage: updatedUser.profileImage || null,
        },
      })
    }

    if (!isEmailCustom) {
      return NextResponse.json(
        { success: false, message: 'A valid @gmail.com email is required for creating a new student.' },
        { status: 400 }
      )
    }

    const finalRegNo = regUpper || id || `REG${Date.now()}`
    const finalEmail = email.trim().toLowerCase()
    const defaultPassHash = passwordHash || await bcrypt.hash('Student@123', 10)

    const user = await prisma.user.upsert({
      where: { email: finalEmail },
      update: {
        name: name ? name.trim() : finalRegNo,
        phone: phone ? phone.trim() : null,
        role: 'student',
        status: status || 'active',
        emailVerified: isEmailCustom,
        ...(passwordHash ? { passwordHash, mustChangePassword: true } : {}),
      },
      create: {
        email: finalEmail,
        name: name ? name.trim() : finalRegNo,
        phone: phone ? phone.trim() : null,
        role: 'student',
        status: status || 'active',
        passwordHash: defaultPassHash,
        emailVerified: isEmailCustom,
        mustChangePassword: true,
      },
    })

    const newStudent = await prisma.student.upsert({
      where: { registerNumber: finalRegNo },
      update: {
        userId: user.id,
        ...(dateOfBirth !== undefined ? { dateOfBirth: parseSafeDateOfBirth(dateOfBirth) } : {}),
        department: department || 'Artificial Intelligence & Data Science',
        year: Number(year) || 1,
        semester: Number(semester) || 1,
        batch: batch ? String(batch).trim() : null,
        section: section || 'A',
        advisorName: advisorName ? String(advisorName).trim() : null,
        parentPhone: parentPhone ? String(parentPhone).trim() : null,
        ...(bloodGroup !== undefined ? { bloodGroup } : {}),
        ...(residencyStatus !== undefined ? { residencyStatus } : {}),
        ...(cgpa !== undefined ? { cgpa: cgpa !== '' && cgpa !== null && !isNaN(parseFloat(String(cgpa))) ? parseFloat(String(cgpa)) : null } : {}),
        ...(attendance !== undefined ? { attendance: attendance !== '' ? String(attendance) : null } : {}),
      } as any,
      create: {
        userId: user.id,
        registerNumber: finalRegNo,
        dateOfBirth: parseSafeDateOfBirth(dateOfBirth, new Date('2000-01-01')),
        department: department || 'Artificial Intelligence & Data Science',
        year: Number(year) || 1,
        semester: Number(semester) || 1,
        batch: batch ? String(batch).trim() : null,
        section: section || 'A',
        advisorName: advisorName ? String(advisorName).trim() : null,
        parentPhone: parentPhone ? String(parentPhone).trim() : null,
        ...(bloodGroup !== undefined ? { bloodGroup } : {}),
        ...(residencyStatus !== undefined ? { residencyStatus } : {}),
        ...(cgpa !== undefined ? { cgpa: cgpa !== '' && cgpa !== null && !isNaN(parseFloat(String(cgpa))) ? parseFloat(String(cgpa)) : null } : {}),
        ...(attendance !== undefined ? { attendance: attendance !== '' ? String(attendance) : null } : {}),
      } as any,
    })

    revalidatePath('/admin/students')
    revalidatePath('/admin/dashboard')

    return NextResponse.json({
      success: true,
      message: 'Student record saved successfully in database',
      student: {
        id: newStudent.id,
        userId: user.id,
        registerNumber: newStudent.registerNumber,
        name: user.name,
        email: isEmailCustom ? user.email : '',
        phone: user.phone || '',
        parentPhone: (newStudent as any).parentPhone || '',
        dateOfBirth: newStudent.dateOfBirth ? newStudent.dateOfBirth.toISOString().split('T')[0] : null,
        department: newStudent.department,
        year: newStudent.year,
        semester: newStudent.semester,
        batch: (newStudent as any).batch || '',
        section: newStudent.section,
        advisorName: (newStudent as any).advisorName || '',
        status: user.status,
        bloodGroup: (newStudent as any).bloodGroup,
        residencyStatus: (newStudent as any).residencyStatus,
        busNo: (newStudent as any).busNo || null,
        boardingPoint: (newStudent as any).boardingPoint || null,
        busDetails: (newStudent as any).busDetails || null,
        hostelBlock: (newStudent as any).hostelBlock || null,
        roomNo: (newStudent as any).roomNo || null,
        address: (newStudent as any).address || null,
        cgpa: (newStudent as any).cgpa,
        attendance: (newStudent as any).attendance,
      },
      user: {
        id: user.id,
        name: user.name,
        email: isEmailCustom ? user.email : '',
        phone: user.phone || '',
      },
    })
  } catch (error: any) {
    console.error('Update student error:', error)
    const friendlyMessage = formatDatabaseError(error, 'Failed to update student record. Please try again.', data?.registerNumber)
    return NextResponse.json({ success: false, message: friendlyMessage }, { status: error?.code === 'P2002' ? 409 : 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Only administrators can delete student records.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const clearAll = searchParams.get('clearAll')

    if (clearAll === 'true') {
      await prisma.student.deleteMany({})
      await prisma.user.deleteMany({ where: { role: 'student' } })
      revalidatePath('/admin/students')
      revalidatePath('/admin/dashboard')
      return NextResponse.json({ success: true, message: 'All students cleared successfully' })
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing student ID' },
        { status: 400 }
      )
    }

    const trimmedId = id.trim()
    const regUpper = trimmedId.toUpperCase()

    // 1. Find all student records that match ID, userId, or registerNumber
    const matchedStudents = await prisma.student.findMany({
      where: {
        OR: [
          { id: trimmedId },
          { userId: trimmedId },
          { registerNumber: regUpper },
          { registerNumber: trimmedId },
          { registerNumber: regUpper.toLowerCase() },
        ],
      },
    })

    const userIdsToDelete = new Set<string>()
    const studentIdsToDelete = new Set<string>()

    matchedStudents.forEach((s) => {
      studentIdsToDelete.add(s.id)
      if (s.userId) userIdsToDelete.add(s.userId)
    })

    // Also check if any User matches by id, email prefix, or name
    const matchedUsers = await prisma.user.findMany({
      where: {
        OR: [
          { id: trimmedId },
          { email: `${regUpper.toLowerCase()}@student.vsb.edu.in` },
          { email: `${trimmedId.toLowerCase()}@student.vsb.edu.in` },
        ],
      },
    })

    matchedUsers.forEach((u) => {
      userIdsToDelete.add(u.id)
    })

    // Delete Student records
    if (studentIdsToDelete.size > 0) {
      await prisma.student.deleteMany({
        where: { id: { in: Array.from(studentIdsToDelete) } },
      })
    } else if (regUpper) {
      await prisma.student.deleteMany({
        where: { registerNumber: regUpper },
      }).catch(() => {})
    }

    // Delete User records
    if (userIdsToDelete.size > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: Array.from(userIdsToDelete) } },
      })
    }

    // Invalidate caches
    revalidatePath('/admin/students')
    revalidatePath('/admin/dashboard')
    revalidatePath('/dashboard')

    return NextResponse.json({
      success: true,
      message: 'Student record instantly deleted from database',
    })
  } catch (error: any) {
    console.error('Delete student error:', error)
    const friendlyMessage = formatDatabaseError(error, 'Failed to delete student record. Please try again.')
    return NextResponse.json(
      { success: false, message: friendlyMessage },
      { status: 400 }
    )
  }
}