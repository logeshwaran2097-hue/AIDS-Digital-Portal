import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import {
  HODAnnouncementsView,
  AnnouncementItem,
  TargetFacultyOption,
  TargetStudentOption,
} from './components/HODAnnouncementsView'

export const dynamic = 'force-dynamic'

export default async function HODAnnouncementsPage() {
  const session = await getSession()
  if (!session || session.role !== 'hod') redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })

  const announcementsFromDb = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
  })

  // Fetch Faculty List
  const facultyFromDb = await prisma.faculty.findMany({
    orderBy: { facultyId: 'asc' },
  })
  const facultyUsers = await prisma.user.findMany({
    where: { role: 'faculty' },
  })
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

  // Fetch Student List
  const studentsFromDb = await prisma.student.findMany({
    orderBy: { registerNumber: 'asc' },
  })
  const studentUsers = await prisma.user.findMany({
    where: { role: 'student' },
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

  const mappedAnnouncements: AnnouncementItem[] = announcementsFromDb.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    category: a.category,
    target: a.target,
    targetYear: a.targetYear,
    targetSemester: a.targetSemester,
    createdByName: a.createdByName || 'Prof. Dr. V. Sundar (HOD)',
    isPublished: a.isPublished,
    createdAt: a.createdAt,
  }))

  return (
    <PortalLayout role="hod" userName={user?.name || 'Head of Department'}>
      <div className="py-2 animate-fade-in">
        <HODAnnouncementsView
          initialAnnouncements={mappedAnnouncements}
          facultyList={facultyList}
          studentList={studentList}
        />
      </div>
    </PortalLayout>
  )
}
