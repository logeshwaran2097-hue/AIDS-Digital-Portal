import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized session' }, { status: 401 })
    }

    const key = `faculty_settings_${session.userId}`
    const record = await prisma.systemSettings.findUnique({
      where: { key },
    }).catch(() => null)

    let preferences: any = {}
    if (record?.value) {
      try {
        preferences = JSON.parse(record.value)
      } catch {}
    }

    return NextResponse.json({ success: true, preferences })
  } catch (error) {
    console.error('Faculty settings GET error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized session' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'SAVE_PREFERENCES') {
      const { preferences } = body
      const key = `faculty_settings_${session.userId}`

      await prisma.systemSettings.upsert({
        where: { key },
        create: {
          key,
          value: JSON.stringify(preferences || {}),
          description: `Preferences for faculty ${session.userId}`,
          isPublic: false,
        },
        update: {
          value: JSON.stringify(preferences || {}),
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Settings and policy thresholds saved in real time to database!',
      })
    }

    if (action === 'CHANGE_PASSWORD') {
      const { currentPassword, newPassword } = body
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, message: 'Please provide both current and new password' },
          { status: 400 }
        )
      }

      if (newPassword.trim().length < 6) {
        return NextResponse.json(
          { success: false, message: 'New password must be at least 6 characters long' },
          { status: 400 }
        )
      }

      const user = await prisma.user.findUnique({ where: { id: session.userId } })
      if (!user) {
        return NextResponse.json({ success: false, message: 'User record not found' }, { status: 404 })
      }

      // Check current password if user has passwordHash
      if (user.passwordHash) {
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)
        if (!isMatch) {
          return NextResponse.json(
            { success: false, message: 'Current password is incorrect. Please try again.' },
            { status: 400 }
          )
        }
      }

      const newHash = await bcrypt.hash(newPassword.trim(), 10)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newHash,
          mustChangePassword: false,
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Password successfully updated and secured!',
      })
    }

    if (action === 'UPDATE_PROFILE') {
      const { phone, specialization } = body
      if (phone !== undefined) {
        await prisma.user.update({
          where: { id: session.userId },
          data: {
            phone: phone ? phone.trim() : null,
            updatedAt: new Date(),
          },
        })
      }

      if (specialization !== undefined) {
        await prisma.faculty.updateMany({
          where: { userId: session.userId },
          data: {
            specialization: specialization ? specialization.trim() : '',
          },
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Profile information updated successfully!',
      })
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Faculty settings error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error saving settings: ' + String(error) },
      { status: 500 }
    )
  }
}
