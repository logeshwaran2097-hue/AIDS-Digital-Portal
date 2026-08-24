import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminAnnouncementsView, AnnouncementRecord } from './components/AdminAnnouncementsView'

export const dynamic = 'force-dynamic'

export default async function AdminAnnouncementsPage() {
  const session = await requireRoleSession(['admin'])

  const [dbAnnouncements, dbFaculty, dbStudents, dbUsers] = await prisma.$transaction([
    prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } }),
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

  const announcementsList: AnnouncementRecord[] = dbAnnouncements.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    category: a.category,
    target: a.target,
    targetSpecific: null,
    createdByName: a.createdByName || 'System Administrator',
    isPublished: a.isPublished,
    createdAt: a.createdAt.toISOString().split('T')[0],
  }))

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminAnnouncementsView
          initialAnnouncements={announcementsList}
          facultyList={facultyOptions}
          studentList={studentOptions}
        />
      </div>
    </PortalLayout>
  )
}
