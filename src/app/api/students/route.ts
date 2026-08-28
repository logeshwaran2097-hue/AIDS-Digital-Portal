import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const semester = searchParams.get('semester')
    const section = searchParams.get('section')

    const where: any = {}
    if (year && year !== 'ALL') where.year = Number(year)
    if (semester && semester !== 'ALL') where.semester = Number(semester)
    if (section && section !== 'ALL') where.section = section

    const students = await prisma.student.findMany({
      where,
      orderBy: { registerNumber: 'asc' },
    })

    const userIds = students.map((s) => s.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
    })
    const userMap = new Map(users.map((u) => [u.id, u]))

    const defaultBatches: Record<number, string> = {
      1: '2025 - 2029',
      2: '2024 - 2028',
      3: '2023 - 2027',
      4: '2022 - 2026',
    }

    const defaultAdvisors: Record<number, string> = {
      1: 'Dr. R. Ramanathan (Professor · AI & DS)',
      2: 'Dr. S. Karthik (Professor · AI & DS)',
      3: 'Dr. M. Sowmya (Associate Professor)',
      4: 'Dr. K. Meenakshi (Associate Professor)',
    }

    const result = students.map((s) => {
      const u = userMap.get(s.userId)
      return {
        id: s.id,
        userId: s.userId,
        registerNumber: s.registerNumber,
        name: u?.name || s.registerNumber,
        email: u?.email || `${s.registerNumber.toLowerCase()}@student.vsb.edu.in`,
        phone: u?.phone || '',
        dateOfBirth: s.dateOfBirth ? s.dateOfBirth.toISOString().split('T')[0] : null,
        department: s.department || 'Artificial Intelligence & Data Science',
        year: s.year,
        semester: s.semester,
        batch: (s as any).batch || defaultBatches[s.year] || '2024 - 2028',
        section: s.section,
        advisorName: (s as any).advisorName || defaultAdvisors[s.year] || 'Dr. S. Karthik (Professor · AI & DS)',
        status: u?.status || 'active',
      }
    })

    return NextResponse.json({ success: true, students: result })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const {
      registerNumber,
      name,
      email,
      password,
      phone,
      dateOfBirth,
      department = 'Artificial Intelligence & Data Science',
      year = 2,
      semester = 4,
      batch,
      section = 'A',
      advisorName = 'Dr. S. Karthik (Professor · AI & DS)',
      status = 'active',
    } = data

    if (!registerNumber || !name || !password?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Register Number, Full Name, and Temporary Password are required.' },
        { status: 400 }
      )
    }

    const regUpper = registerNumber.trim().toUpperCase()

    // Check if student with same registerNumber already exists
    const existingStudent = await prisma.student.findUnique({
      where: { registerNumber: regUpper },
    })

    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: `Student with Register No. ${regUpper} already exists` },
        { status: 400 }
      )
    }

    // Prepare institutional or provisional email
    const finalEmail = email?.trim()
      ? email.trim().toLowerCase()
      : `${regUpper.toLowerCase()}@student.vsb.edu.in`
    const isEmailCustom = Boolean(email?.trim())

    // Hash admin-typed temporary password
    const initialPassword = password.trim()
    const passwordHash = await bcrypt.hash(initialPassword, 10)

    // Upsert User
    const user = await prisma.user.upsert({
      where: { email: finalEmail },
      update: {
        name: name.trim(),
        phone: phone || null,
        role: 'student',
        status: status || 'active',
        passwordHash,
        emailVerified: isEmailCustom,
        mustChangePassword: true,
      },
      create: {
        email: finalEmail,
        name: name.trim(),
        phone: phone || null,
        role: 'student',
        status: status || 'active',
        passwordHash,
        emailVerified: isEmailCustom,
        mustChangePassword: true,
      },
    })

    const computedBatch = batch?.trim() || (Number(year) === 1 ? '2025 - 2029' : Number(year) === 2 ? '2024 - 2028' : Number(year) === 3 ? '2023 - 2027' : '2022 - 2026')

    // Create Student
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        registerNumber: regUpper,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('2006-08-15'),
        department: department || 'Artificial Intelligence & Data Science',
        year: Number(year) || 2,
        semester: Number(semester) || 4,
        batch: computedBatch,
        section: section || 'A',
        advisorName: advisorName?.trim() || 'Dr. S. Karthik (Professor · AI & DS)',
      } as any,
    })

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        userId: user.id,
        registerNumber: student.registerNumber,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString().split('T')[0] : null,
        department: student.department,
        year: student.year,
        semester: student.semester,
        batch: (student as any).batch || computedBatch,
        section: student.section,
        advisorName: (student as any).advisorName || advisorName,
        status: user.status,
      },
      message: 'Student registered successfully in database',
    })
  } catch (error) {
    console.error('Create student error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create student: ' + String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const {
      id,
      userId: passedUserId,
      registerNumber,
      name,
      email,
      password,
      phone,
      dateOfBirth,
      department,
      year,
      semester,
      batch,
      section,
      advisorName,
      status,
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

    let passwordHash: string | undefined = undefined
    if (password && password.trim()) {
      passwordHash = await bcrypt.hash(password.trim(), 10)
    }

    // If student record exists, update both Student and User
    if (student) {
      const computedBatch = batch !== undefined ? batch : (student.batch || (Number(year || student.year) === 1 ? '2025 - 2029' : Number(year || student.year) === 2 ? '2024 - 2028' : Number(year || student.year) === 3 ? '2023 - 2027' : '2022 - 2026'))

      const updatedStudent = await prisma.student.update({
        where: { id: student.id },
        data: {
          ...(regUpper ? { registerNumber: regUpper } : {}),
          ...(department ? { department: department.trim() } : {}),
          ...(year !== undefined ? { year: Number(year) } : {}),
          ...(semester !== undefined ? { semester: Number(semester) } : {}),
          ...(batch !== undefined ? { batch: String(batch).trim() } : {}),
          ...(section !== undefined ? { section: section.trim() } : {}),
          ...(advisorName !== undefined ? { advisorName: String(advisorName).trim() } : {}),
          ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
        } as any,
      })

      const updatedUser = await prisma.user.update({
        where: { id: student.userId },
        data: {
          ...(name ? { name: name.trim() } : {}),
          ...(email ? { email: email.trim().toLowerCase() } : {}),
          ...(phone !== undefined ? { phone: phone ? phone.trim() : null } : {}),
          ...(status ? { status } : {}),
          ...(passwordHash ? { passwordHash, mustChangePassword: true } : {}),
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Student profile updated successfully in database',
        student: {
          id: updatedStudent.id,
          userId: updatedStudent.userId,
          registerNumber: updatedStudent.registerNumber,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          dateOfBirth: updatedStudent.dateOfBirth ? updatedStudent.dateOfBirth.toISOString().split('T')[0] : null,
          department: updatedStudent.department,
          year: updatedStudent.year,
          semester: updatedStudent.semester,
          batch: (updatedStudent as any).batch || computedBatch,
          section: updatedStudent.section,
          advisorName: (updatedStudent as any).advisorName || advisorName || 'Dr. S. Karthik (Professor · AI & DS)',
          status: updatedUser.status,
        },
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
        },
      })
    }

    // Fallback: If student record was not yet in DB, create/upsert it seamlessly
    const finalRegNo = regUpper || id || `REG${Date.now()}`
    const finalEmail = email?.trim() ? email.trim().toLowerCase() : `${finalRegNo.toLowerCase()}@student.vsb.edu.in`
    const defaultPassHash = passwordHash || await bcrypt.hash('Student@123', 10)

    const user = await prisma.user.upsert({
      where: { email: finalEmail },
      update: {
        name: name ? name.trim() : finalRegNo,
        phone: phone ? phone.trim() : null,
        role: 'student',
        status: status || 'active',
        ...(passwordHash ? { passwordHash, mustChangePassword: true } : {}),
      },
      create: {
        email: finalEmail,
        name: name ? name.trim() : finalRegNo,
        phone: phone ? phone.trim() : null,
        role: 'student',
        status: status || 'active',
        passwordHash: defaultPassHash,
        emailVerified: true,
        mustChangePassword: true,
      },
    })

    const computedBatch = batch?.trim() || (Number(year || 2) === 1 ? '2025 - 2029' : Number(year || 2) === 2 ? '2024 - 2028' : Number(year || 2) === 3 ? '2023 - 2027' : '2022 - 2026')

    const newStudent = await prisma.student.upsert({
      where: { registerNumber: finalRegNo },
      update: {
        department: department || 'Artificial Intelligence & Data Science',
        year: Number(year) || 2,
        semester: Number(semester) || 4,
        batch: computedBatch,
        section: section || 'A',
        advisorName: advisorName?.trim() || 'Dr. S. Karthik (Professor · AI & DS)',
        ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
      } as any,
      create: {
        userId: user.id,
        registerNumber: finalRegNo,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('2006-08-15'),
        department: department || 'Artificial Intelligence & Data Science',
        year: Number(year) || 2,
        semester: Number(semester) || 4,
        batch: computedBatch,
        section: section || 'A',
        advisorName: advisorName?.trim() || 'Dr. S. Karthik (Professor · AI & DS)',
      } as any,
    })

    return NextResponse.json({
      success: true,
      message: 'Student record saved successfully in database',
      student: {
        id: newStudent.id,
        userId: user.id,
        registerNumber: newStudent.registerNumber,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: newStudent.dateOfBirth ? newStudent.dateOfBirth.toISOString().split('T')[0] : null,
        department: newStudent.department,
        year: newStudent.year,
        semester: newStudent.semester,
        batch: (newStudent as any).batch || computedBatch,
        section: newStudent.section,
        advisorName: (newStudent as any).advisorName || advisorName,
        status: user.status,
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    })
  } catch (error) {
    console.error('Update student error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update student: ' + String(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const clearAll = searchParams.get('clearAll')

    if (clearAll === 'true') {
      await prisma.student.deleteMany({})
      await prisma.user.deleteMany({ where: { role: 'student' } })
      return NextResponse.json({ success: true, message: 'All students cleared successfully' })
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing student ID' },
        { status: 400 }
      )
    }

    // Find student by student.id or userId or registerNumber
    let student = await prisma.student.findUnique({ where: { id } }).catch(() => null)
    if (!student) {
      student = await prisma.student.findFirst({ where: { userId: id } }).catch(() => null)
    }
    if (!student) {
      student = await prisma.student.findUnique({ where: { registerNumber: id } }).catch(() => null)
    }

    if (student) {
      const userId = student.userId
      await prisma.student.delete({ where: { id: student.id } }).catch(() => null)
      await prisma.user.delete({ where: { id: userId } }).catch(() => null)
    } else {
      // Direct user delete
      await prisma.user.delete({ where: { id } }).catch(() => null)
    }

    return NextResponse.json({
      success: true,
      message: 'Student record deleted successfully from database',
    })
  } catch (error) {
    console.error('Delete student error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete student' },
      { status: 500 }
    )
  }
}