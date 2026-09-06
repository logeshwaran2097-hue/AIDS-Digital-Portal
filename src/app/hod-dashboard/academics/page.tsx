import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODAcademicsView, SubjectItem } from './components/HODAcademicsView'

export const dynamic = 'force-dynamic'

export default async function HODAcademicsPage() {
  const session = await requireRoleSession(['hod'])

  const [dbSubjects, dbFaculty, facultyUsers, dbUnits] = await Promise.all([
    prisma.subject.findMany({
      orderBy: { code: 'asc' },
    }).catch(() => []),
    prisma.faculty.findMany().catch(() => []),
    prisma.user.findMany({ where: { role: 'faculty' } }).catch(() => []),
    prisma.unit.findMany({ orderBy: { number: 'asc' } }).catch(() => []),
  ])

  const userMap = new Map(facultyUsers.map((u) => [u.id, u]))

  const facultyOptions = dbFaculty.map((f) => {
    const matchedUser = userMap.get(f.userId)
    return {
      facultyId: f.facultyId,
      name: matchedUser?.name || f.facultyId,
      designation: f.designation,
      email: matchedUser?.email || '',
    }
  })

  const mappedSubjects: SubjectItem[] = dbSubjects.map((s) => {
    const match = s.code.match(/[A-Za-z]+[0-9]([1-8])/)
    const sem = match ? parseInt(match[1], 10) : 1
    const yearNumber = Math.ceil(sem / 2)
    const yearMap: Record<number, string> = {
      1: 'I Year',
      2: 'II Year',
      3: 'III Year',
      4: 'IV Year',
    }

    const unitsForSub = dbUnits.filter((u) => u.subjectId === s.id)

    return {
      id: s.id,
      code: s.code,
      name: s.name,
      credits: s.credits,
      type: s.description?.toLowerCase().includes('laboratory') || s.description?.toLowerCase().includes('practical') ? 'Practical' : 'Theory',
      semester: sem,
      year: yearMap[yearNumber] || 'I Year',
      faculty: 'Department Faculty',
      unitsCompleted: unitsForSub.length,
      totalUnits: Math.max(5, unitsForSub.length),
      syllabusAvailable: true,
      units: unitsForSub.map((u) => {
        let topicsArr: string[] = []
        try { topicsArr = JSON.parse(u.topics || '[]') } catch { topicsArr = [u.topics] }
        return {
          unit: `Unit ${u.number}`,
          title: u.title,
          topics: topicsArr.join(', '),
        }
      }),
    }
  })

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="py-2 animate-fade-in">
        <HODAcademicsView initialSubjects={mappedSubjects} facultyOptions={facultyOptions} />
      </div>
    </PortalLayout>
  )
}
