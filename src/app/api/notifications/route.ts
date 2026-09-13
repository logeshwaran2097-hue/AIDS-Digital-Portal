import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { cachedDbQuery, invalidateCache } from '@/lib/dbCache'

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
      const userReg = session?.registerNumber || (session?.email ? session.email.split('@')[0].toUpperCase() : '')
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
      const isRead = userId ? readArray.includes(userId) : false
      return {
        ...n,
        isRead,
        readArray,
      }
    })

    const unreadNotifications = notificationsWithReadStatus.filter((n) => !n.isRead)

    // Aggregate menu-specific notification counts (focused on unread items)
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

    // Categorize unread notifications across all portal menu domains
    unreadNotifications.forEach((n) => {
      const combined = `${n.title || ''} ${n.message || ''}`.toLowerCase()
      if (combined.includes('announcement') || combined.includes('circular') || combined.includes('notice')) {
        menuCounts['announcements'] = (menuCounts['announcements'] || 0) + 1
      }
      if (combined.includes('event') || combined.includes('symposium') || combined.includes('hackathon') || combined.includes('workshop')) {
        menuCounts['events'] = (menuCounts['events'] || 0) + 1
      }
      if (combined.includes('project') || combined.includes('capstone') || combined.includes('milestone')) {
        menuCounts['projects'] = (menuCounts['projects'] || 0) + 1
      }
      if (combined.includes('question') || combined.includes('iat') || combined.includes('exam') || combined.includes('test paper')) {
        menuCounts['questions'] = (menuCounts['questions'] || 0) + 1
        menuCounts['question-papers'] = (menuCounts['question-papers'] || 0) + 1
      }
      if (combined.includes('achievement') || combined.includes('winner') || combined.includes('award') || combined.includes('trophy') || combined.includes('prize')) {
        menuCounts['achievements'] = (menuCounts['achievements'] || 0) + 1
      }
      if (combined.includes('attendance') || combined.includes('roll call') || combined.includes('condonation') || combined.includes('absent') || combined.includes('unlock')) {
        menuCounts['attendance'] = (menuCounts['attendance'] || 0) + 1
      }
      if (combined.includes('proof') || combined.includes('certificate') || combined.includes('geo-photo')) {
        menuCounts['od-proofs'] = (menuCounts['od-proofs'] || 0) + 1
      }
      if (combined.includes('od') || combined.includes('on-duty') || combined.includes('leave') || combined.includes('permission') || combined.includes('sanction')) {
        menuCounts['od-applications'] = (menuCounts['od-applications'] || 0) + 1
      }
      if (combined.includes('resource') || combined.includes('study material') || combined.includes('notes') || combined.includes('lab manual') || combined.includes('manual')) {
        menuCounts['resources'] = (menuCounts['resources'] || 0) + 1
        menuCounts['study'] = (menuCounts['study'] || 0) + 1
      }
      if (combined.includes('subject') || combined.includes('syllabus') || combined.includes('curriculum') || combined.includes('academic')) {
        menuCounts['subjects'] = (menuCounts['subjects'] || 0) + 1
        menuCounts['academics'] = (menuCounts['academics'] || 0) + 1
      }
      if (combined.includes('student') || combined.includes('enroll') || combined.includes('admission') || combined.includes('profile change')) {
        menuCounts['students'] = (menuCounts['students'] || 0) + 1
      }
      if (combined.includes('faculty') || combined.includes('staff') || combined.includes('advisor')) {
        menuCounts['faculty'] = (menuCounts['faculty'] || 0) + 1
      }
      if (combined.includes('report') || combined.includes('analytics') || combined.includes('audit')) {
        menuCounts['reports'] = (menuCounts['reports'] || 0) + 1
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
