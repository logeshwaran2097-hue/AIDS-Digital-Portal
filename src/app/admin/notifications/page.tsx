import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminNotificationsView, NotificationRecord } from './components/AdminNotificationsView'

export const dynamic = 'force-dynamic'

export default async function AdminNotificationsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const [dbNotifs, dbFaculty, dbStudents, dbUsers] = await prisma.$transaction([
    prisma.notification.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.faculty.findMany(),
    prisma.student.findMany(),
    prisma.user.findMany(),
  ])

  const userMap = new Map(dbUsers.map((u) => [u.id, u.name]))

  const facultyOptions = dbFaculty.map((f) => ({
    id: f.id,
    facultyId: f.facultyId,
    name: userMap.get(f.userId) || f.facultyId,
  }))

  const studentOptions = dbStudents.map((s) => ({
    id: s.id,
    registerNumber: s.registerNumber,
    name: userMap.get(s.userId) || s.registerNumber,
  }))

  const notifsList: NotificationRecord[] = dbNotifs.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    target: n.target,
    createdByName: n.createdByName || 'System Administrator',
    status: n.status || 'published',
    createdAt: n.createdAt.toISOString().split('T')[0],
  }))

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminNotificationsView
          initialNotifications={notifsList}
          facultyList={facultyOptions}
          studentList={studentOptions}
        />
      </div>
    </PortalLayout>
  )
}
