import { prisma } from '@/lib/prisma'
import { cachedDbQuery } from '@/lib/dbCache'
import { categorizeNotification } from '@/lib/notificationClassifier'

export interface NotificationPayloadItem {
  id: string
  title: string
  message: string
  target: string
  createdByName: string
  status: string
  createdAt: Date
  isRead: boolean
  readBy: string[]
}

export interface NotificationPayloadResult {
  success: boolean
  menuCounts: Record<string, number>
  notifications: NotificationPayloadItem[]
  unreadCount: number
  latestId: string | null
  timestamp: string
}

export async function getNotificationPayloadForSession(
  session: any,
  limit = 30,
  since?: string | null
): Promise<NotificationPayloadResult> {
  const userRole = session?.role || 'student'
  const userId = session?.userId
  const userReg =
    session?.registerNumber ||
    (session?.email ? session.email.split('@')[0].toUpperCase() : '')
  const userEmail = session?.email || ''
  const identifiers = [userId, userReg, userEmail].filter(Boolean) as string[]

  const where: any = {}

  // Target audience filtering
  if (userRole === 'student') {
    const student =
      (userId
        ? await prisma.student.findUnique({ where: { userId } }).catch(() => null)
        : null) ||
      (userReg
        ? await prisma.student
            .findUnique({ where: { registerNumber: userReg } })
            .catch(() => null)
        : null)

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
          ...(student?.year && student?.section
            ? [{ target: `year_${student.year}_${student.section.toLowerCase()}` }]
            : []),
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
  const rawNotifications = await cachedDbQuery(
    cacheKey,
    () =>
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    2000,
    ['notifications']
  )

  // Determine if notification is read by the current user
  const notificationsWithReadStatus = rawNotifications.map((n) => {
    let readArray: string[] = []
    try {
      readArray = JSON.parse(n.readBy || '[]')
    } catch {
      readArray = []
    }
    const isRead =
      identifiers.length > 0 && identifiers.some((id) => readArray.includes(id))
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

  const formattedNotifications: NotificationPayloadItem[] =
    notificationsWithReadStatus.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      target: n.target,
      createdByName: n.createdByName || 'Administrator',
      status: n.status,
      createdAt: n.createdAt,
      isRead: n.isRead,
      readBy: n.readArray,
    }))

  return {
    success: true,
    menuCounts,
    notifications: formattedNotifications,
    unreadCount: unreadNotifications.length,
    latestId: formattedNotifications[0]?.id || null,
    timestamp: new Date().toISOString(),
  }
}
