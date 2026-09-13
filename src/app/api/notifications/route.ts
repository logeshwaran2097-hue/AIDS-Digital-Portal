import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { cachedDbQuery, invalidateCache } from '@/lib/dbCache'
import { categorizeNotification } from '@/lib/notificationClassifier'

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
    const userReg = session?.registerNumber || (session?.email ? session.email.split('@')[0].toUpperCase() : '')
    const userEmail = session?.email || ''
    const identifiers = [userId, userReg, userEmail].filter(Boolean) as string[]

    const where: any = {}

    // Target audience filtering
    if (userRole === 'student') {
      const student = (userId ? await prisma.student.findUnique({ where: { userId } }).catch(() => null) : null) ||
        (userReg ? await prisma.student.findUnique({ where: { registerNumber: userReg } }).catch(() => null) : null)

      const studentReg = student?.registerNumber || userReg
      const studentId = student?.id

      where.AND = [
        // Strictly exclude internal administrative & faculty-only notifications from students
        {
          NOT: [
            { target: 'faculty' },
            { target: 'hod' },
            { target: 'admin' },
            { title: { contains: 'Attendance Locked' } },
            { title: { contains: 'Attendance Unlock' } },
            { title: { contains: 'Attendance Approval' } },
            { title: { contains: 'Faculty Directorate' } },
            { title: { contains: 'Student Enrolled' } },
          ],
        },
        // Only include notifications meant for this student or student body
        {
          OR: [
            { target: 'students' },
            { target: 'student' },
            { target: 'all' },
            { target: 'ALL' },
            ...(userId ? [{ targetIds: { contains: userId } }] : []),
            ...(studentId ? [{ targetIds: { contains: studentId } }] : []),
            ...(studentReg ? [{ targetIds: { contains: studentReg } }] : []),
            ...(student?.year ? [{ target: `year_${student.year}` }] : []),
            ...(student?.year && student?.section ? [{ target: `year_${student.year}_${student.section.toLowerCase()}` }] : []),
          ],
        },
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

    const cacheKey = `notifs_${userRole}_${userId || 'anon'}_${since || 'all'}_${limit}`
    const notifications = await cachedDbQuery(
      cacheKey,
      () =>
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
        }),
      3000,
      ['notifications']
    )

    // Determine if notification is read by the current user
    const notificationsWithReadStatus = notifications.map((n) => {
      let readArray: string[] = []
      try {
        readArray = JSON.parse(n.readBy || '[]')
      } catch {
        readArray = []
      }
      const isRead = identifiers.length > 0 && identifiers.some((id) => readArray.includes(id))
      return {
        ...n,
        isRead,
        readArray,
      }
    })

    const unreadNotifications = notificationsWithReadStatus.filter((n) => !n.isRead)

    // Aggregate menu-specific notification counts strictly for genuine unread items
    const menuCounts: Record<string, number> = {
      notifications: unreadNotifications.length,
    }

    // Check for pending OD items based on role
    try {
      let pendingODCount = 0
      if (userRole === 'admin') {
        pendingODCount = await prisma.auditLog.count({
          where: {
            action: 'OD_APPLICATION_SUBMITTED',
            status: { in: ['pending_advisor_approval', 'pending_hod_approval'] },
          },
        }).catch(() => 0)
      } else if (userRole === 'hod') {
        pendingODCount = await prisma.auditLog.count({
          where: {
            action: 'OD_APPLICATION_SUBMITTED',
            status: 'pending_hod_approval',
          },
        }).catch(() => 0)
      } else if (userRole === 'faculty') {
        pendingODCount = await prisma.auditLog.count({
          where: {
            action: 'OD_APPLICATION_SUBMITTED',
            status: 'pending_advisor_approval',
          },
        }).catch(() => 0)
      }
      if (pendingODCount > 0) {
        menuCounts['od-applications'] = (menuCounts['od-applications'] || 0) + pendingODCount
      }
    } catch {}

    // Check for pending OD proofs
    try {
      let pendingProofCount = 0
      if (userRole === 'admin' || userRole === 'hod' || userRole === 'faculty') {
        pendingProofCount = await prisma.oDProof.count({
          where: {
            status: 'under_review',
          },
        }).catch(() => 0)
      }
      if (pendingProofCount > 0) {
        menuCounts['od-proofs'] = (menuCounts['od-proofs'] || 0) + pendingProofCount
      }
    } catch {}

    // Check for pending attendance unlock requests
    try {
      if (userRole === 'hod' || userRole === 'admin') {
        const pendingUnlocks = await prisma.auditLog.count({
          where: {
            action: 'ATTENDANCE_UNLOCK_REQUEST',
            status: 'PENDING',
          },
        }).catch(() => 0)
        if (pendingUnlocks > 0) {
          menuCounts['attendance'] = (menuCounts['attendance'] || 0) + pendingUnlocks
        }
      }
    } catch {}

    // Categorize unread notifications exclusively across portal menu domains
    unreadNotifications.forEach((n) => {
      const category = categorizeNotification(n.title, n.message)
      if (category) {
        menuCounts[category] = (menuCounts[category] || 0) + 1
      }
    })

    return NextResponse.json({
      success: true,
      menuCounts,
      notifications: notificationsWithReadStatus.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        target: n.target,
        createdByName: n.createdByName || 'Administrator',
        status: n.status,
        createdAt: n.createdAt,
        isRead: n.isRead,
        readBy: n.readArray,
      })),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Notifications GET API error:', error)
    return NextResponse.json({ success: true, notifications: [], timestamp: new Date().toISOString() })
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

    invalidateCache('notifications')

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

    const body = await request.json().catch(() => ({}))
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
    invalidateCache('notifications')
    return NextResponse.json({ success: true, message: 'Notification deleted successfully' })
  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete notification' }, { status: 400 })
  }
}
