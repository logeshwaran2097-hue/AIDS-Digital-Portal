import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cachedDbQuery } from '@/lib/dbCache'
import { PortalLayout } from '@/components/layout/PortalLayout'
import {
  HODAnnouncementsView,
  AnnouncementItem,
  TargetFacultyOption,
  TargetStudentOption,
} from './components/HODAnnouncementsView'

export const dynamic = 'force-dynamic'

export default async function HODAnnouncementsPage() {
  const session = await requireRoleSession(['hod'])

  const [
    user,
    announcementsFromDb,
    facultyFromDb,
    facultyUsers,
    studentsFromDb,
    studentUsers,
  ] = await cachedDbQuery(
    `hod_announcements_page_${session.userId}`,
    () => Promise.all([
      prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
      prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
      }).catch(() => []),
      prisma.faculty.findMany({
        orderBy: { facultyId: 'asc' },
      }).catch(() => []),
      prisma.user.findMany({
        where: { role: 'faculty' },
      }).catch(() => []),
      prisma.student.findMany({
        orderBy: { registerNumber: 'asc' },
      }).catch(() => []),
      prisma.user.findMany({
        where: { role: 'student' },
      }).catch(() => []),
    ]),
    8000,
    ['announcements', 'faculty', 'students', 'hod']
  )

  const facultyUserMap = new Map(facultyUsers.map((u) => [u.id, u]))
  const facultyList: TargetFacultyOption[] = facultyFromDb.map((f) => {
    const u = facultyUserMap.get(f.userId)
    return {
      id: f.id,
      facultyId: f.facultyId,
      name: u?.name || `Faculty ${f.facultyId}`,
      designation: f.designation,
    }
  })

  const studentUserMap = new Map(studentUsers.map((u) => [u.id, u]))
  const studentList: TargetStudentOption[] = studentsFromDb.map((s) => {
    const u = studentUserMap.get(s.userId)
    return {
      id: s.id,
      registerNumber: s.registerNumber,
      name: u?.name || `Student ${s.registerNumber}`,
    }
  })

  const hodName = user?.name || session.name || 'Head of Department'

  const mappedAnnouncements: AnnouncementItem[] = announcementsFromDb.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    category: a.category,
    target: a.target,
    targetYear: a.targetYear,
    targetSemester: a.targetSemester,
    createdByName: a.createdByName || hodName,
    isPublished: a.isPublished,
    createdAt: a.createdAt,
  }))

  return (
    <PortalLayout role="hod" userName={hodName}>
      <div className="py-2 animate-fade-in">
        <HODAnnouncementsView
          initialAnnouncements={mappedAnnouncements}
          facultyList={facultyList}
          studentList={studentList}
          hodName={hodName}
        />
      </div>
    </PortalLayout>
  )
}
