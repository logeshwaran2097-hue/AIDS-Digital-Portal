import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODAcademicsView, SubjectItem } from './components/HODAcademicsView'

export const dynamic = 'force-dynamic'

export default async function HODAcademicsPage() {
  const session = await requireRoleSession(['hod'])

  const dbSubjects = await prisma.subject.findMany({
    orderBy: { code: 'asc' },
  }).catch(() => [])

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

    return {
      id: s.id,
      code: s.code,
      name: s.name,
      credits: s.credits,
      type: s.description?.toLowerCase().includes('laboratory') || s.description?.toLowerCase().includes('practical') ? 'Practical' : 'Theory',
      semester: sem,
      year: yearMap[yearNumber] || 'I Year',
      faculty: 'Department Faculty',
      unitsCompleted: 0,
      totalUnits: 5,
      syllabusAvailable: true,
    }
  })

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="py-2 animate-fade-in">
        <HODAcademicsView initialSubjects={mappedSubjects} />
      </div>
    </PortalLayout>
  )
}
