import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { invalidateCache } from '@/lib/dbCache'
import { dispatchWebPushNotification } from '@/lib/pushNotifier'
import { validateBody, createNotificationSchema, patchNotificationSchema } from '@/lib/validations/apiValidation'
import { getNotificationPayloadForSession } from '@/lib/serverNotificationQuery'
import { notificationBus } from '@/lib/notificationBus'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const since = searchParams.get('since')
    const limit = parseInt(searchParams.get('limit') || '30', 10)

    const session = await getSession()
    const payload = await getNotificationPayloadForSession(session, limit, since)
    return NextResponse.json(payload)
  } catch (error) {
    console.error('Notifications GET API error:', error)
    return NextResponse.json({ success: true, notifications: [], timestamp: new Date().toISOString() })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'faculty' && session.role !== 'hod' && session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Faculty, HOD, or Admin role required.' }, { status: 403 })
    }

    const rawBody = await request.json().catch(() => ({}))
    const validation = validateBody(createNotificationSchema, rawBody)
    if (!validation.success) {
      return validation.response
    }
    const body = validation.data
    const { title, message, target = 'all', targetIds = [], createdByName, link } = body

    const issuerName = session.name || createdByName || 'Administrator'

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

    invalidateCache('notifications')
    notificationBus.emit('change')

    // Dispatch real mobile push notifications to subscribed phones & browsers
    dispatchWebPushNotification({
      title: notification.title,
      message: notification.message,
      url: link || '/dashboard/notifications',
      tag: `vsb-notif-${notification.id}`,
      targetRole: notification.target === 'students' ? 'student' : notification.target,
    }).catch((err) => console.error('Background web push error:', err))

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
    return NextResponse.json({ success: false, message: 'Failed to create notification' }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    const userId = session?.userId
    const userReg = session?.registerNumber || (session?.email ? session.email.split('@')[0].toUpperCase() : '')
    const userEmail = session?.email || ''
    const identifiers = [userId, userReg, userEmail].filter(Boolean) as string[]

    if (identifiers.length === 0) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const rawBody = await request.json().catch(() => ({}))
    const validation = validateBody(patchNotificationSchema, rawBody)
    if (!validation.success) {
      return validation.response
    }
    const body = validation.data
    const { notificationId, markAllRead } = body

    if (markAllRead) {
      const allNotifs = await prisma.notification.findMany({
        where: { status: 'published' },
        select: { id: true, readBy: true },
      })

      for (const n of allNotifs) {
        let readArr: string[] = []
        try {
          readArr = JSON.parse(n.readBy || '[]')
        } catch {
          readArr = []
        }
        let updated = false
        for (const id of identifiers) {
          if (!readArr.includes(id)) {
            readArr.push(id)
            updated = true
          }
        }
        if (updated) {
          await prisma.notification.update({
            where: { id: n.id },
            data: { readBy: JSON.stringify(readArr) },
          })
        }
      }

      invalidateCache('notifications')
      notificationBus.emit('change')
      return NextResponse.json({ success: true, message: 'All notifications marked as read' })
    } else if (notificationId) {
      const n = await prisma.notification.findUnique({
        where: { id: notificationId },
        select: { id: true, readBy: true },
      })
      if (n) {
        let readArr: string[] = []
        try {
          readArr = JSON.parse(n.readBy || '[]')
        } catch {
          readArr = []
        }
        let updated = false
        for (const id of identifiers) {
          if (!readArr.includes(id)) {
            readArr.push(id)
            updated = true
          }
        }
        if (updated) {
          await prisma.notification.update({
            where: { id: notificationId },
            data: { readBy: JSON.stringify(readArr) },
          })
        }
      }
      invalidateCache('notifications')
      notificationBus.emit('change')
      return NextResponse.json({ success: true, message: 'Notification marked as read' })
    }

    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Error updating notification read status:', error)
    return NextResponse.json({ success: false, message: 'Failed to update read status' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin' && session.role !== 'hod')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin or HOD role required.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const clearAll = searchParams.get('clearAll')

    if (clearAll === 'true') {
      await prisma.notification.deleteMany({})
      invalidateCache('notifications')
      notificationBus.emit('change')
      return NextResponse.json({ success: true, message: 'All notifications cleared' })
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing notification ID' }, { status: 400 })
    }

    await prisma.notification.delete({ where: { id } })
    invalidateCache('notifications')
    notificationBus.emit('change')
    return NextResponse.json({ success: true, message: 'Notification deleted successfully' })
  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete notification' }, { status: 400 })
  }
}
