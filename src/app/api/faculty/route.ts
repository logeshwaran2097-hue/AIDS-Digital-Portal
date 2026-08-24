import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, email, phone, designation, qualification, experience, specialization, subjects, role } = data

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
        status: 'active',
      },
    })

    await prisma.faculty.create({
      data: {
        userId: user.id,
        facultyId: email.split('@')[0].replace(/[0-9]/g, '') || 'AI999',
        dateOfBirth: new Date('1985-01-01'),
        designation: designation || 'Faculty',
        qualification: qualification || 'M.Tech / Ph.D.',
        experience: experience ? Number(experience) : 5,
        specialization: specialization || 'Computer Science',
        subjects: subjects || '[]',
      },
    })

    return NextResponse.json({
      success: true,
      user,
      message: 'Faculty created successfully',
    })
  } catch (error) {
    console.error('Create faculty error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create faculty' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'faculty' },
      orderBy: { name: 'asc' },
    })

    const details = await prisma.faculty.findMany()
    const detailMap = new Map(details.map((d: any) => [d.userId, d]))

    const result = users.map((u: any) => ({
      ...u,
      faculty: detailMap.get(u.id) || null,
    }))

    return NextResponse.json({ success: true, users: result })
  } catch (error) {
    console.error('Error fetching faculty:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch faculty' },
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

    const user = await prisma.user.findUnique({ where: { id } })
    if (user?.role === 'faculty') {
      await prisma.faculty.delete({ where: { userId: id } })
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: 'Faculty deleted successfully',
    })
  } catch (error) {
    console.error('Delete faculty error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete faculty' },
      { status: 500 }
    )
  }
}