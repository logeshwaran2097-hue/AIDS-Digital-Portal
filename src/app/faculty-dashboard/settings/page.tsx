import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultySettingsView } from './components/FacultySettingsView'

export const dynamic = 'force-dynamic'

export default async function FacultySettingsPage() {
  const session = await requireRoleSession(['faculty'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const faculty = await prisma.faculty.findUnique({ where: { userId: session.userId } })

  const isAdvisor =
    faculty?.facultyType === 'advisor' ||
    faculty?.facultyType === 'both'

  const roleBadgeLabel = isAdvisor
    ? 'Class Advisor'
    : faculty?.facultyType === 'lab_faculty'
    ? 'Lab Handler'
    : 'Faculty Member'

  let advisorStudentCount = 0
  if (isAdvisor && faculty?.advisorYear && faculty?.advisorSec) {
    advisorStudentCount = await prisma.student.count({
      where: {
        year: faculty.advisorYear,
        section: faculty.advisorSec,
      },
    })
  }

  return (
    <PortalLayout
      role="faculty"
      userName={user?.name || session.name || 'Faculty'}
      userEmail={user?.email || session.email}
      roleBadgeLabel={roleBadgeLabel}
      isAdvisor={isAdvisor}
    >
      <div className="py-2 animate-fade-in">
        <FacultySettingsView
          userName={user?.name || session.name || 'Faculty Member'}
          userEmail={user?.email || ''}
          userPhone={user?.phone || ''}
          facultyId={faculty?.facultyId || session.facultyId || 'FACULTY'}
          designation={faculty?.designation || 'Faculty Member'}
          qualification={faculty?.qualification || ''}
          experience={faculty?.experience || 0}
          specialization={faculty?.specialization || ''}
          isAdvisor={isAdvisor}
          advisorBatch={
            faculty?.advisorBatch ||
            (faculty?.advisorYear
              ? `Year ${faculty.advisorYear} - Sem ${faculty.advisorSem || 3} - Sec ${faculty.advisorSec || 'A'}`
              : 'AI & DS Department')
          }
          advisorYear={faculty?.advisorYear || 2}
          advisorSem={faculty?.advisorSem || 3}
          advisorSec={faculty?.advisorSec || 'A'}
          facultyType={faculty?.facultyType || 'both'}
          studentCount={advisorStudentCount}
          lastLogin={user?.lastLogin ? user.lastLogin.toISOString() : null}
        />
      </div>
    </PortalLayout>
  )
}
