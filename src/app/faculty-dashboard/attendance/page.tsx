import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { GovernmentAttendanceSystem } from './components/GovernmentAttendanceSystem'

export const dynamic = 'force-dynamic'

interface AttendancePageProps {
  searchParams?: {
    mode?: string
    role?: string
  }
}

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const session = await requireRoleSession(['faculty'])

  const cookieStore = cookies()
  const rawLoginRole = searchParams?.role || cookieStore.get('portal_login_role')?.value || 'faculty'

  const faculty = (await prisma.faculty.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (session.facultyId ? await prisma.faculty.findUnique({ where: { facultyId: session.facultyId } }).catch(() => null) : null)

  const isAdvisor =
    faculty?.facultyType === 'advisor' ||
    faculty?.facultyType === 'both' ||
    Boolean(faculty?.advisorBatch || (faculty?.advisorYear && faculty?.advisorSec))

  // If user explicitly logged in as Advisor or faculty is configured as advisor, effective role is advisor
  const effectiveRole = (rawLoginRole === 'advisor' || faculty?.facultyType === 'advisor' || isAdvisor) ? 'advisor' : 'faculty'

  const roleBadgeLabel = (effectiveRole === 'advisor' || isAdvisor)
    ? 'Class Advisor'
    : faculty?.facultyType === 'lab_faculty'
    ? 'Lab Handler'
    : 'Faculty Member'

  // If searchParams explicitly specifies mode, respect it.
  // When logged in as faculty -> default to 'subject' (Faculty Attendance)
  // When logged in as advisor -> default to 'morning' (Advisor Attendance)
  const initialMode: 'morning' | 'subject' =
    searchParams?.mode === 'morning'
      ? (isAdvisor ? 'morning' : 'subject')
      : searchParams?.mode === 'subject'
      ? 'subject'
      : effectiveRole === 'advisor'
      ? 'morning'
      : 'subject'

  return (
    <PortalLayout
      role="faculty"
      userName={session.name || (effectiveRole === 'advisor' ? 'Class Advisor' : 'Faculty Member')}
      userEmail={session.email}
      roleBadgeLabel={roleBadgeLabel}
      isAdvisor={isAdvisor}
    >
      <div className="py-2 animate-fade-in">
        <GovernmentAttendanceSystem
          initialMode={initialMode}
          loginRole={effectiveRole}
          isAdvisorServer={isAdvisor}
        />
      </div>
    </PortalLayout>
  )
}

