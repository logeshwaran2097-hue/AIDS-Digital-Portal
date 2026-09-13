import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { StudentNotificationsView } from './components/StudentNotificationsView'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const session = await requireRoleSession(['student'])

  const userReg = session.registerNumber || (session.email ? session.email.split('@')[0].toUpperCase() : '')
  const student = (await prisma.student.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (userReg ? await prisma.student.findUnique({ where: { registerNumber: userReg } }).catch(() => null) : null)

  const studentReg = student?.registerNumber || userReg
  const studentId = student?.id

  const notifications = await prisma.notification.findMany({
    where: {
      AND: [
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
            ...(session.userId ? [{ targetIds: { contains: session.userId } }] : []),
            ...(studentId ? [{ targetIds: { contains: studentId } }] : []),
            ...(studentReg ? [{ targetIds: { contains: studentReg } }] : []),
            ...(student?.year ? [{ target: `year_${student.year}` }] : []),
            ...(student?.year && student?.section ? [{ target: `year_${student.year}_${student.section.toLowerCase()}` }] : []),
          ],
        },
      ],
    },
    orderBy: { createdAt: 'desc' },
  })

  const identifiers = [session.userId, studentReg, session.email].filter(Boolean) as string[]
  const formattedNotifications = notifications.map((n) => {
    let readArray: string[] = []
    try {
      readArray = JSON.parse(n.readBy || '[]')
    } catch {
      readArray = []
    }
    const isRead = identifiers.some((id) => readArray.includes(id))
    return {
      id: n.id,
      title: n.title,
      message: n.message,
      createdByName: n.createdByName,
      createdAt: n.createdAt,
      isRead,
    }
  })

  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="student" userName={user?.name || session.name || 'Student'}>
      <div className="py-2 animate-fade-in">
        <StudentNotificationsView notifications={formattedNotifications} />
      </div>
    </PortalLayout>
  )
}
