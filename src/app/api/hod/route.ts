import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseSafeDateOfBirth } from '@/lib/utils'
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
      const rawEmail = u?.email || ''
      const isInternalFallback = rawEmail === `${h.facultyId.toLowerCase()}@vsb.edu.in` || rawEmail.startsWith('hod.' + (u?.name || '').toLowerCase().replace(/[^a-z0-9]/g, ''))
      const cleanEmail = isInternalFallback ? '' : rawEmail

      return {
        id: h.id,
        userId: h.userId,
        facultyId: h.facultyId,
        name: u?.name || '',
        email: cleanEmail,
        phone: u?.phone || '',
        dateOfBirth: h.dateOfBirth ? h.dateOfBirth.toISOString().split('T')[0] : null,
        department: h.department || '',
        designation: h.designation || '',
        qualification: h.qualification || '',
        experience: h.experience !== null && h.experience !== undefined ? h.experience : null,
        status: u?.status || 'active',
      }
    })

    return NextResponse.json({ success: true, hod: result })
  } catch (error) {
    console.error('Error fetching HOD:', error)
    return NextResponse.json(
      { success: true, hod: null },
      { status: 200 }
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
      password,
      department = '',
      designation = '',
      qualification = '',
      experience = null,
      dateOfBirth,
      specialization = '',
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
    const isNew = !fid
    if (isNew && (!password || !password.trim())) {
      return NextResponse.json(
        { success: false, message: 'Temporary Password is required for HOD appointment' },
        { status: 400 }
      )
    }

    if (!fid) {
      const existingCount = await prisma.hOD.count()
      fid = existingCount === 0 ? 'HOD001' : `HOD${(existingCount + 1).toString().padStart(3, '0')}`
    }

    // Keep provided email or clean institutional fallback
    let finalEmail = email?.trim().toLowerCase()
    if (!finalEmail) {
      finalEmail = `${fid.toLowerCase()}@vsb.edu.in`
    }

    // Hash temporary password if provided
    let passwordHash: string | undefined = undefined
    if (password && password.trim()) {
      passwordHash = await bcrypt.hash(password.trim(), 10)
    }

    // Check if HOD already exists
    const existingHOD = await prisma.hOD.findUnique({ where: { facultyId: fid } }).catch(() => null)

    let user: any = null
    if (existingHOD) {
      // Direct update of the existing linked user
      const userUpdate: any = {
        name: name.trim(),
        email: finalEmail,
        phone: phone?.trim() || null,
        role: 'hod',
        status: status || 'active',
      }
      if (passwordHash) {
        userUpdate.passwordHash = passwordHash
        userUpdate.mustChangePassword = false
      }
      user = await prisma.user.update({
        where: { id: existingHOD.userId },
        data: userUpdate,
      }).catch(async () => {
        // Fallback to upsert by email if userId missing
        return (prisma.user as any).upsert({
          where: { email: finalEmail },
          update: userUpdate,
          create: { ...userUpdate, passwordHash: passwordHash || '' },
        })
      })
    } else {
      // Upsert User for new appointment
      const userUpdate: any = {
        name: name.trim(),
        phone: phone?.trim() || null,
        role: 'hod',
        status: status || 'active',
      }
      if (passwordHash) {
        userUpdate.passwordHash = passwordHash
        userUpdate.mustChangePassword = false
      }

      const userCreate: any = {
        email: finalEmail,
        name: name.trim(),
        phone: phone?.trim() || null,
        role: 'hod',
        status: status || 'active',
        passwordHash: passwordHash || '',
        mustChangePassword: false,
      }

      user = await (prisma.user as any).upsert({
        where: { email: finalEmail },
        update: userUpdate,
        create: userCreate,
      })
    }

    const parsedExp = (experience !== null && experience !== undefined && experience !== '') ? (Number(experience) || 0) : 0
    const parsedHodDob = parseSafeDateOfBirth(dateOfBirth)
    const finalDepartment = department?.trim() || 'Artificial Intelligence & Data Science'

    // Upsert HOD without forced fake defaults
    const hod = await prisma.hOD.upsert({
      where: { facultyId: fid },
      update: {
        userId: user.id,
        department: finalDepartment,
        designation: designation || '',
        qualification: qualification || '',
        experience: parsedExp,
        ...(parsedHodDob ? { dateOfBirth: parsedHodDob } : {}),
      },
      create: {
        userId: user.id,
        facultyId: fid,
        department: finalDepartment,
        designation: designation || '',
        qualification: qualification || '',
        experience: parsedExp,
        dateOfBirth: parseSafeDateOfBirth(dateOfBirth, new Date('1980-01-01')),
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
      { status: 400 }
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
      { status: 400 }
    )
  }
}
