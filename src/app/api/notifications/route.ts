import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const since = searchParams.get('since')
    const limit = parseInt(searchParams.get('limit') || '30', 10)

    const session = await getSession()
    const userRole = role || session?.role || 'student'
    const userId = session?.userId

    const where: any = {}

    // Target audience filtering
    if (userRole === 'student') {
      where.OR = [
        { target: 'all' },
        { target: 'ALL' },
        { target: 'students' },
        { target: 'student' },
        { target: { contains: 'student' } },
        ...(userId ? [{ targetIds: { contains: userId } }] : []),
      ]
    } else if (userRole === 'faculty') {
      where.OR = [
        { target: 'all' },
        { target: 'ALL' },
        { target: 'faculty' },
        { target: { contains: 'faculty' } },
        ...(userId ? [{ targetIds: { contains: userId } }] : []),
      ]
    } else if (userRole === 'hod') {
      where.OR = [
        { target: 'all' },
        { target: 'ALL' },
        { target: 'hod' },
        { target: 'faculty' },
        { target: { contains: 'hod' } },
      ]
    }

    if (since) {
      where.createdAt = {
        gt: new Date(since),
      }
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({
      success: true,
      notifications: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        target: n.target,
        createdByName: n.createdByName || 'Administrator',
        status: n.status,
        createdAt: n.createdAt,
        readBy: (() => {
          try {
            return JSON.parse(n.readBy || '[]')
          } catch {
            return []
          }
        })(),
      })),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Notifications GET API error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, message, target = 'all', targetIds = [], createdByName, link } = body

    if (!title || !message) {
      return NextResponse.json({ success: false, message: 'Title and message are required' }, { status: 400 })
    }

    const session = await getSession()
    const issuerName = createdByName || session?.name || 'Administrator'

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        target: target.toLowerCase(),
        targetIds: typeof targetIds === 'string' ? targetIds : JSON.stringify(targetIds),
        createdByName: issuerName,
        status: 'published',
        publishedAt: new Date(),
        readBy: '[]',
      },
    })

    return NextResponse.json(
      {
        success: true,
        notification: {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          target: notification.target,
          createdByName: notification.createdByName,
          status: notification.status,
          createdAt: notification.createdAt,
          link: link || '/dashboard/notifications',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Notifications POST API error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create notification' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const clearAll = searchParams.get('clearAll')

    if (clearAll === 'true') {
      await prisma.notification.deleteMany({})
      return NextResponse.json({ success: true, message: 'All notifications cleared' })
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing notification ID' }, { status: 400 })
    }

    await prisma.notification.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Notification deleted successfully' })
  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete notification' }, { status: 500 })
  }
}
