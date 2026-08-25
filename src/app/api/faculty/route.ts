import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const facultyRecords = await prisma.faculty.findMany({
      orderBy: { facultyId: 'asc' },
    })

    const userIds = facultyRecords.map((f) => f.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
    })
    const userMap = new Map(users.map((u) => [u.id, u]))

    const result = facultyRecords.map((f) => {
      const u = userMap.get(f.userId)
      let subjectsArr: string[] = []
      try {
        subjectsArr = JSON.parse(f.subjects || '[]')
      } catch {
        subjectsArr = []
      }

      return {
        id: f.id,
        userId: f.userId,
        facultyId: f.facultyId,
        name: u?.name || 'Faculty Member',
        email: u?.email || `${f.facultyId.toLowerCase()}@vsb.edu.in`,
        phone: u?.phone || '',
        designation: f.designation,
        qualification: f.qualification,
        experience: f.experience,
        specialization: f.specialization,
        subjects: subjectsArr,
        status: u?.status || 'active',
      }
    })

    return NextResponse.json({ success: true, faculty: result })
  } catch (error) {
    console.error('Error fetching faculty:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch faculty' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const {
      facultyId,
      name,
      email,
      phone,
      designation = 'Assistant Professor',
      qualification = 'M.E. / M.Tech / Ph.D.',
      experience = 5,
      specialization = 'Artificial Intelligence',
      subjects = [],
      status = 'active',
    } = data

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Name and Email are required' },
        { status: 400 }
      )
    }

    const fid = facultyId?.trim().toUpperCase() || 'FAC' + Math.floor(100 + Math.random() * 900)

    // Upsert User
    const user = await prisma.user.upsert({
      where: { email: email.trim().toLowerCase() },
      update: {
        name: name.trim(),
        phone: phone || null,
        role: 'faculty',
        status: status || 'active',
      },
      create: {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        phone: phone || null,
        role: 'faculty',
        status: status || 'active',
      },
    })

    // Upsert Faculty
    const faculty = await prisma.faculty.upsert({
      where: { facultyId: fid },
      update: {
        userId: user.id,
        designation,
        qualification,
        experience: Number(experience) || 1,
        specialization,
        subjects: typeof subjects === 'string' ? subjects : JSON.stringify(subjects),
      },
      create: {
        userId: user.id,
        facultyId: fid,
        dateOfBirth: new Date('1990-01-01'),
        designation,
        qualification,
        experience: Number(experience) || 1,
        specialization,
        subjects: typeof subjects === 'string' ? subjects : JSON.stringify(subjects),
      },
    })

    return NextResponse.json({
      success: true,
      faculty: {
        id: faculty.id,
        facultyId: faculty.facultyId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        designation: faculty.designation,
        qualification: faculty.qualification,
        experience: faculty.experience,
        specialization: faculty.specialization,
        status: user.status,
      },
      message: 'Faculty registered successfully in database',
    })
  } catch (error) {
    console.error('Create faculty error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create faculty: ' + String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const clearAll = searchParams.get('clearAll')

    if (clearAll === 'true') {
      await prisma.faculty.deleteMany({})
      await prisma.user.deleteMany({ where: { role: 'faculty' } })
      return NextResponse.json({ success: true, message: 'All faculty cleared successfully' })
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing faculty ID' },
        { status: 400 }
      )
    }

    let faculty = await prisma.faculty.findUnique({ where: { id } }).catch(() => null)
    if (!faculty) {
      faculty = await prisma.faculty.findFirst({ where: { userId: id } }).catch(() => null)
    }
    if (!faculty) {
      faculty = await prisma.faculty.findUnique({ where: { facultyId: id } }).catch(() => null)
    }

    if (faculty) {
      const userId = faculty.userId
      await prisma.faculty.delete({ where: { id: faculty.id } }).catch(() => null)
      await prisma.user.delete({ where: { id: userId } }).catch(() => null)
    } else {
      await prisma.user.delete({ where: { id } }).catch(() => null)
    }

    return NextResponse.json({
      success: true,
      message: 'Faculty deleted successfully from database',
    })
  } catch (error) {
    console.error('Delete faculty error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete faculty' },
      { status: 500 }
    )
  }
}