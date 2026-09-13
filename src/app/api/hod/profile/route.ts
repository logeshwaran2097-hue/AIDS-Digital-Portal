import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'hod' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [user, hodRecord, settings] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.userId } }),
      prisma.hOD.findUnique({ where: { userId: session.userId } }),
      prisma.systemSettings.findUnique({ where: { key: 'hod_profile_settings' } }).catch(() => null),
    ])

    let extra = {}
    if (settings?.value) {
      try {
        extra = JSON.parse(settings.value)
      } catch {}
    }

    return NextResponse.json({
      success: true,
      profile: {
        user,
        hodRecord,
        extra,
      },
    })
  } catch (error) {
    console.error('Error fetching HOD profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'hod' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      phone,
      profileImage,
      designation,
      qualification,
      experience,
      officeLocation,
      officeHours,
      specializations,
      bio,
    } = body

    // 1. Update User
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        profileImage: profileImage || undefined,
      },
    })

    // 2. Update HOD record (Must be pre-appointed by Admin)
    const existingHod = await prisma.hOD.findUnique({ where: { userId: session.userId } })
    if (!existingHod) {
      return NextResponse.json(
        { success: false, message: 'HOD profile record not found. Head of Department must be appointed by an Administrator.' },
        { status: 404 }
      )
    }

    const updatedHod = await prisma.hOD.update({
      where: { userId: session.userId },
      data: {
        designation: designation || undefined,
        qualification: qualification || undefined,
        experience: experience !== undefined && experience !== '' ? Number(experience) : undefined,
      },
    })

    // 3. Save extended profile details in systemSettings
    const extraData = {
      officeLocation: officeLocation || '',
      officeHours: officeHours || '',
      specializations: Array.isArray(specializations) ? specializations : [],
      bio: bio || '',
      updatedAt: new Date().toISOString(),
    }

    await prisma.systemSettings.upsert({
      where: { key: 'hod_profile_settings' },
      update: { value: JSON.stringify(extraData) },
      create: { key: 'hod_profile_settings', value: JSON.stringify(extraData) },
    }).catch(() => {})

    // 4. Create Audit Log
    await prisma.auditLog.create({
      data: {
        userName: updatedUser.name,
        action: 'UPDATE_HOD_PROFILE',
        module: 'profile_management',
        details: `HOD ${updatedUser.name} updated their executive profile particulars.`,
        status: 'success',
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'HOD profile updated successfully!',
      profile: {
        user: updatedUser,
        hodRecord: updatedHod,
        extra: extraData,
      },
    })
  } catch (error: any) {
    console.error('Error updating HOD profile:', error)
    return NextResponse.json({ success: false, message: error.message || 'Failed to update profile' }, { status: 500 })
  }
}
