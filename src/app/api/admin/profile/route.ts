import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        profileImage: true,
        lastLogin: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, profile: user })
  } catch (error) {
    console.error('Error fetching admin profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, profileImage } = body

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        profileImage: profileImage || undefined,
      },
    })

    // Log the profile update in AuditLog
    await prisma.auditLog.create({
      data: {
        userName: updatedUser.name,
        action: 'UPDATE_PROFILE',
        module: 'auth',
        details: `Super Administrator updated profile details (Email: ${updatedUser.email}, Phone: ${updatedUser.phone})`,
        status: 'SUCCESS',
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Profile updated in database successfully!',
      profile: updatedUser,
    })
  } catch (error) {
    console.error('Error updating admin profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
