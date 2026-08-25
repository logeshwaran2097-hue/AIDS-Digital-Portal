import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const hodRecords = await prisma.hOD.findMany()
    const userIds = hodRecords.map((h) => h.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
    })
    const userMap = new Map(users.map((u) => [u.id, u]))

    const result = hodRecords.map((h) => {
      const u = userMap.get(h.userId)
      return {
        id: h.id,
        userId: h.userId,
        facultyId: h.facultyId,
        name: u?.name || 'Head of Department',
        email: u?.email || `${h.facultyId.toLowerCase()}@vsb.edu.in`,
        phone: u?.phone || '',
        dateOfBirth: h.dateOfBirth ? h.dateOfBirth.toISOString().split('T')[0] : null,
        department: h.department,
        designation: h.designation,
        qualification: h.qualification,
        experience: h.experience,
        status: u?.status || 'active',
      }
    })

    return NextResponse.json({ success: true, hod: result })
  } catch (error) {
    console.error('Error fetching HOD:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch HOD' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const {
      facultyId = 'HOD001',
      name,
      email,
      phone,
      department = 'Artificial Intelligence & Data Science',
      designation = 'Professor & Head',
      qualification = 'Ph.D.',
      experience = 15,
      dateOfBirth,
      status = 'active',
    } = data

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Name and Email are required' },
        { status: 400 }
      )
    }

    const fid = facultyId?.trim().toUpperCase() || 'HOD001'

    // Upsert User
    const user = await prisma.user.upsert({
      where: { email: email.trim().toLowerCase() },
      update: {
        name: name.trim(),
        phone: phone || null,
        role: 'hod',
        status: status || 'active',
      },
      create: {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        phone: phone || null,
        role: 'hod',
        status: status || 'active',
      },
    })

    // Upsert HOD
    const hod = await prisma.hOD.upsert({
      where: { facultyId: fid },
      update: {
        userId: user.id,
        department,
        designation,
        qualification,
        experience: Number(experience) || 10,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('1980-01-01'),
      },
      create: {
        userId: user.id,
        facultyId: fid,
        department,
        designation,
        qualification,
        experience: Number(experience) || 10,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('1980-01-01'),
      },
    })

    return NextResponse.json({
      success: true,
      hod: {
        id: hod.id,
        facultyId: hod.facultyId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: hod.department,
        status: user.status,
      },
      message: 'HOD details saved successfully in database',
    })
  } catch (error) {
    console.error('Create HOD error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to save HOD: ' + String(error) },
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
      await prisma.hOD.deleteMany({})
      await prisma.user.deleteMany({ where: { role: 'hod' } })
      return NextResponse.json({ success: true, message: 'All HOD records cleared successfully' })
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing HOD ID' }, { status: 400 })
    }

    let hod = await prisma.hOD.findUnique({ where: { id } }).catch(() => null)
    if (!hod) {
      hod = await prisma.hOD.findFirst({ where: { userId: id } }).catch(() => null)
    }

    if (hod) {
      const userId = hod.userId
      await prisma.hOD.delete({ where: { id: hod.id } }).catch(() => null)
      await prisma.user.delete({ where: { id: userId } }).catch(() => null)
    } else {
      await prisma.user.delete({ where: { id } }).catch(() => null)
    }

    return NextResponse.json({ success: true, message: 'HOD record deleted successfully' })
  } catch (error) {
    console.error('Delete HOD error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete HOD' }, { status: 500 })
  }
}
