import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    const result = students.map((s) => {
      const u = userMap.get(s.userId)
      return {
        id: s.id,
        userId: s.userId,
        registerNumber: s.registerNumber,
        name: u?.name || s.registerNumber,
        email: u?.email || `${s.registerNumber.toLowerCase()}@vsb.edu.in`,
        phone: u?.phone || '',
        dateOfBirth: s.dateOfBirth ? s.dateOfBirth.toISOString().split('T')[0] : null,
        department: s.department,
        year: s.year,
        semester: s.semester,
        section: s.section,
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
      phone,
      dateOfBirth,
      department = 'Artificial Intelligence & Data Science',
      year = 2,
      semester = 4,
      section = 'A',
      status = 'active',
    } = data

    if (!registerNumber || !name || !email) {
      return NextResponse.json(
        { success: false, message: 'Register number, Name, and Email are required' },
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

    // Upsert User
    const user = await prisma.user.upsert({
      where: { email: email.trim().toLowerCase() },
      update: {
        name: name.trim(),
        phone: phone || null,
        role: 'student',
        status: status || 'active',
      },
      create: {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        phone: phone || null,
        role: 'student',
        status: status || 'active',
      },
    })

    // Create Student
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        registerNumber: regUpper,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('2005-01-01'),
        department: department || 'Artificial Intelligence & Data Science',
        year: Number(year) || 2,
        semester: Number(semester) || 4,
        section: section || 'A',
      },
    })

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        registerNumber: student.registerNumber,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString().split('T')[0] : null,
        year: student.year,
        semester: student.semester,
        section: student.section,
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
    const { id, name, email, phone, year, semester, section, status } = data

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing student ID' }, { status: 400 })
    }

    let student = await prisma.student.findUnique({ where: { id } })
    if (!student) {
      student = await prisma.student.findFirst({ where: { userId: id } })
    }

    if (!student) {
      return NextResponse.json({ success: false, message: 'Student record not found' }, { status: 404 })
    }

    // Update Student record
    await prisma.student.update({
      where: { id: student.id },
      data: {
        ...(year !== undefined ? { year: Number(year) } : {}),
        ...(semester !== undefined ? { semester: Number(semester) } : {}),
        ...(section !== undefined ? { section } : {}),
      },
    })

    // Update User record
    await prisma.user.update({
      where: { id: student.userId },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(email ? { email: email.trim().toLowerCase() } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(status ? { status } : {}),
      },
    })

    return NextResponse.json({ success: true, message: 'Student updated successfully' })
  } catch (error) {
    console.error('Update student error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update student' }, { status: 500 })
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