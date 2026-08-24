import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { getStudentData } from '@/lib/data'
import { PortalLayout } from '@/components/layout/PortalLayout'
import StudentDashboard from './components/StudentDashboard'

export const dynamic = 'force-dynamic'

export default async function StudentDashboardPage() {
  const session = await requireRoleSession(['student'])

  const data = await getStudentData(session.userId)

  return (
    <PortalLayout role="student" userName={data?.user?.name || session.name || 'Student'}>
      <StudentDashboard data={data as any} />
    </PortalLayout>
  )
}