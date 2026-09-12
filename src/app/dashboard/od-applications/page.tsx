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

  const user = (await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)) || {
    id: session.userId,
    name: session.name || 'Student',
    email: session.email || '',
    profileImage: null,
  }

  const userReg = session.registerNumber || (session.email ? session.email.split('@')[0].toUpperCase() : '')

  const student = (await prisma.student.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (userReg ? await prisma.student.findUnique({ where: { registerNumber: userReg } }).catch(() => null) : null) || {
      id: 'student-default',
      userId: session.userId,
      registerNumber: userReg,
      year: 2,
      semester: 3,
      section: 'B',
      department: 'Artificial Intelligence & Data Science',
    }

  return (
    <PortalLayout
      role="student"
      userName={user.name || session.name || 'Student'}
      userEmail={user.email || session.email}
      profileImage={(user as any)?.profileImage}
      roleBadgeLabel="Student"
    >
      <div className="py-2 animate-fade-in">
        <ODApplicationsDashboardView
          viewRole="student"
          advisorClassInfo={{
            year: student.year,
            section: student.section,
            batch: (student as any).batch || '2025-2029',
          }}
          studentData={student}
          userName={user.name || session.name || 'Student'}
        />
      </div>
    </PortalLayout>
  )
}
