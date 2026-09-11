import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { ODApplicationsDashboardView } from '@/components/od/ODApplicationsDashboardView'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'My OD & Leave Applications | V.S.B. AI & DS Portal',
  description: 'Student On-Duty (OD) and leave requisition tracking and verification dossier.',
}

export default async function StudentODApplicationsPage() {
  const session = await requireRoleSession(['student'])

  const student = session.registerNumber
    ? await prisma.student.findFirst({
        where: { registerNumber: session.registerNumber },
      }).catch(() => null)
    : null

  return (
    <PortalLayout
      role="student"
      userName={session.name || 'Student'}
      userEmail={session.email}
      roleBadgeLabel="Student"
    >
      <div className="py-2 animate-fade-in">
        <ODApplicationsDashboardView
          viewRole="student"
          advisorClassInfo={
            student
              ? {
                  year: student.year,
                  section: student.section,
                  batch: student.batch || '2025-2029',
                }
              : null
          }
        />
      </div>
    </PortalLayout>
  )
}
