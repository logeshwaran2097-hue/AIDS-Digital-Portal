import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { ODApplicationsDashboardView } from '@/components/od/ODApplicationsDashboardView'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Student OD & Leave Applications | V.S.B. AI & DS Portal',
  description: 'Official Class Advisor registry for student On-Duty (OD) and leave applications.',
}

export default async function FacultyODApplicationsPage() {
  const session = await requireRoleSession(['faculty'])

  const faculty =
    (await prisma.faculty.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (session.facultyId ? await prisma.faculty.findUnique({ where: { facultyId: session.facultyId } }).catch(() => null) : null)

  const isAdvisor =
    faculty?.facultyType === 'advisor' ||
    faculty?.facultyType === 'both' ||
    Boolean(faculty?.advisorBatch || (faculty?.advisorYear && faculty?.advisorSec))

  const advisorClassInfo = {
    year: faculty?.advisorYear || 2,
    section: faculty?.advisorSec || 'A',
    batch: faculty?.advisorBatch || '2025-2029',
  }

  return (
    <PortalLayout
      role="faculty"
      userName={session.name || 'Class Advisor'}
      userEmail={session.email}
      roleBadgeLabel={isAdvisor ? 'Class Advisor' : 'Faculty Member'}
      isAdvisor={isAdvisor}
    >
      <div className="py-2 animate-fade-in">
        <ODApplicationsDashboardView
          viewRole={isAdvisor ? 'advisor' : 'admin'}
          advisorClassInfo={advisorClassInfo}
        />
      </div>
    </PortalLayout>
  )
}
