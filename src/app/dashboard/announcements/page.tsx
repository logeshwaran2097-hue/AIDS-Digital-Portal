import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { StudentAnnouncementsClient, StudentAnnouncementItem } from './components/StudentAnnouncementsClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

function isAnnouncementForStudent(
  target: string | null | undefined,
  studentYear?: number | null,
  studentSection?: string | null,
  studentBatch?: string | null
) {
  if (!target) return true
  const t = target.toLowerCase().trim()

  // Memos exclusively for faculty/advisors are hidden from students
  if (t === 'all class advisors' || t === 'all faculty' || t === 'all faculty & staff') {
    return false
  }

  // Universal student broadcast
  if (t.includes('all student') || t === 'all' || t === 'general') {
    return true
  }

  // Check year matching
  const romanYears: Record<number, string[]> = {
    1: ['year i', 'year 1', 'first year', 'sem 1', 'sem 2'],
    2: ['year ii', 'year 2', 'second year', 'sem 3', 'sem 4'],
    3: ['year iii', 'year 3', 'third year', 'sem 5', 'sem 6'],
    4: ['year iv', 'year 4', 'final year', 'sem 7', 'sem 8'],
  }

  if (studentYear) {
    // Placement training eligibility
    if (t.includes('placement') && studentYear >= 3) {
      return true
    }

    const yearKeywords = romanYears[studentYear] || []
    const isMatchingYear = yearKeywords.some((kw) => t.includes(kw))

    if (isMatchingYear) {
      // Check if target specifies a specific section (e.g. Section A or Section B)
      const hasSectionA = t.includes('section a') || t.includes('sec a') || t.includes('- a')
      const hasSectionB = t.includes('section b') || t.includes('sec b') || t.includes('- b')

      // If no specific section is specified in target, the entire year is targeted!
      if (!hasSectionA && !hasSectionB) {
        return true
      }

      // If specific section is addressed, match student's section
      const sec = (studentSection || '').toLowerCase().trim()
      if (sec === 'a' && hasSectionA) return true
      if (sec === 'b' && hasSectionB) return true
      return false
    }
  }

  // Check batch match (e.g. 2024-2028 or 2023-2027)
  if (studentBatch && t.includes(studentBatch.toLowerCase())) {
    return true
  }

  return false
}

export default async function AnnouncementsPage() {
  const session = await requireRoleSession(['student'])

  const announcementsFromDb = await prisma.announcement.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
  })

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const student = await prisma.student.findUnique({ where: { userId: session.userId } }).catch(() => null)
  const studentReg = student?.registerNumber || session.registerNumber || (user?.email?.split('@')[0].toUpperCase()) || 'STUDENT'

  const relevantAnnouncements = announcementsFromDb.filter((item) =>
    isAnnouncementForStudent(item.target, student?.year, student?.section, student?.batch)
  )

  const mappedAnnouncements: StudentAnnouncementItem[] = relevantAnnouncements.map((item) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    category: item.category,
    target: item.target,
    attachmentUrl: item.attachmentUrl,
    createdByName: item.createdByName,
    createdAt: item.createdAt.toISOString(),
  }))

  return (
    <PortalLayout role="student" userName={user?.name || session.name || 'Student'}>
      <div className="space-y-6 animate-fade-in">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
                Official Bulletins
              </span>
              <span className="text-xs text-gray-300">· V.S.B. Engineering College</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Department Announcements &amp; Notices</h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">
              Examination circulars, survey forms, placement training updates, and technical notices
            </p>
          </div>

          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
            <p className="text-[10px] text-gray-300 uppercase font-bold">Total Notices</p>
            <p className="text-base font-black text-[#F4C430]">{mappedAnnouncements.length} Published</p>
          </div>
        </div>

        {/* Announcements Feed with Form Tracker Client */}
        <StudentAnnouncementsClient
          announcements={mappedAnnouncements}
          studentReg={studentReg}
          studentName={user?.name || session.name || studentReg}
        />
      </div>
    </PortalLayout>
  )
}
