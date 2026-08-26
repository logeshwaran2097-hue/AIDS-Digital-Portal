import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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
      facultyId,
      name,
      email,
      phone,
      password = 'nitr',
      department = 'Artificial Intelligence & Data Science',
      designation = 'Professor & Head',
      qualification = 'Ph.D. (AI & Data Science)',
      experience = 15,
      dateOfBirth,
      specialization = 'Artificial Intelligence, Deep Learning & Autonomous Systems',
      status = 'active',
    } = data

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'HOD Full Name is required' },
        { status: 400 }
      )
    }

    // Auto-generate facultyId if not provided (remove requirement for admin to type fac id)
    let fid = facultyId?.trim().toUpperCase()
    if (!fid) {
      const existingCount = await prisma.hOD.count()
      fid = existingCount === 0 ? 'HOD001' : `HOD${(existingCount + 1).toString().padStart(3, '0')}`
    }

    // Auto-generate email if not provided
    let finalEmail = email?.trim().toLowerCase()
    if (!finalEmail) {
      const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '')
      finalEmail = `hod.${sanitized || fid.toLowerCase()}@vsb.edu.in`
    }

    // Hash temporary password (default 'nitr')
    const rawPassword = password?.trim() || 'nitr'
    const passwordHash = await bcrypt.hash(rawPassword, 10)

    // Upsert User
    const user = await (prisma.user as any).upsert({
      where: { email: finalEmail },
      update: {
        name: name.trim(),
        phone: phone?.trim() || null,
        role: 'hod',
        status: status || 'active',
        passwordHash,
        mustChangePassword: true,
      },
      create: {
        email: finalEmail,
        name: name.trim(),
        phone: phone?.trim() || null,
        role: 'hod',
        status: status || 'active',
        passwordHash,
        mustChangePassword: true,
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
        experience: Number(experience) || 15,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('1980-01-01'),
      },
      create: {
        userId: user.id,
        facultyId: fid,
        department,
        designation,
        qualification,
        experience: Number(experience) || 15,
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
        designation: hod.designation,
        qualification: hod.qualification,
        experience: hod.experience,
        dateOfBirth: hod.dateOfBirth ? hod.dateOfBirth.toISOString().split('T')[0] : null,
        status: user.status,
      },
      message: 'HOD details saved successfully with temporary password.',
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
      return NextResponse.json({ success: false, message: 'HOD ID is required' }, { status: 400 })
    }

    const hod = await prisma.hOD.findUnique({ where: { id } })
    if (hod) {
      await prisma.hOD.delete({ where: { id } })
      await prisma.user.delete({ where: { id: hod.userId } }).catch(() => {})
    }

    return NextResponse.json({ success: true, message: 'HOD deleted successfully' })
  } catch (error) {
    console.error('Delete HOD error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete HOD' },
      { status: 500 }
    )
  }
}
