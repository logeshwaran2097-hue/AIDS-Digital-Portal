import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, email, phone, role, department, year, semester, section, status } = data

    if (!name || !email || !role) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        role: role as 'student' | 'faculty' | 'hod' | 'admin',
        status: status || 'active',
      },
    })

    if (role === 'student') {
      await prisma.student.create({
        data: {
          userId: user.id,
          registerNumber: email.split('@')[0].toUpperCase(),
          dateOfBirth: new Date('2004-01-01'),
          department: department || 'Artificial Intelligence and Data Science',
          year: year || 1,
          semester: semester || 1,
          section: section || 'A',
        },
      })
    } else if (role === 'faculty') {
      await prisma.faculty.create({
        data: {
          userId: user.id,
          facultyId: email.split('@')[0].toUpperCase(),
          dateOfBirth: new Date('1985-01-01'),
          designation: 'Faculty',
          qualification: 'M.Tech / Ph.D.',
          experience: 5,
          specialization: 'Computer Science',
        },
      })
    } else if (role === 'hod') {
      await prisma.hOD.create({
        data: {
          userId: user.id,
          facultyId: 'HOD001',
          dateOfBirth: new Date('1993-09-05'),
          department: department || 'Artificial Intelligence and Data Science',
          designation: 'Professor & Head',
          qualification: 'Ph.D. (Data Science)',
          experience: 21,
        },
      })
    }

    return NextResponse.json({
      success: true,
      user,
      message: 'User created successfully',
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create user' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')

    const where: any = {}
    if (role) where.role = role
    if (status) where.status = status

    const users = await prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing ID' },
        { status: 400 }
      )
    }

    // Delete associated records based on user role
    const user = await prisma.user.findUnique({ where: { id } })
    if (user?.role === 'student') {
      await prisma.student.delete({ where: { userId: id } })
    } else if (user?.role === 'faculty') {
      await prisma.faculty.delete({ where: { userId: id } })
    } else if (user?.role === 'hod') {
      await prisma.hOD.delete({ where: { userId: id } })
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete user' },
      { status: 500 }
    )
  }
}