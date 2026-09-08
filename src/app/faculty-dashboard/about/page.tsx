import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AboutPortalView } from '@/components/about/AboutPortalView'

export const dynamic = 'force-dynamic'

export default async function FacultyAboutPage() {
  const session = await requireRoleSession(['faculty'])

  const faculty = await prisma.faculty.findUnique({ where: { userId: session.userId } }).catch(() => null)
  const isAdvisor = faculty?.facultyType === 'advisor' || faculty?.facultyType === 'both'
  const roleBadgeLabel = isAdvisor
    ? 'Class Advisor'
    : faculty?.facultyType === 'lab_faculty'
    ? 'Lab Handler'
    : 'Faculty Member'

  return (
    <PortalLayout
      role="faculty"
      userName={session.name || 'Faculty Member'}
      userEmail={session.email}
      roleBadgeLabel={roleBadgeLabel}
      isAdvisor={isAdvisor}
    >
      <AboutPortalView role="faculty" />
    </PortalLayout>
  )
}
