import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getStudentData } from '@/lib/data'
import { PortalLayout } from '@/components/layout/PortalLayout'
import StudentDashboard from './components/StudentDashboard'

export const dynamic = 'force-dynamic'

export default async function StudentDashboardPage() {
  const session = await getSession()
  if (!session || session.role !== 'student') redirect('/login')

  const data = await getStudentData(session.userId)
  if (!data) redirect('/login')

  return (
    <PortalLayout role="student" userName={data.user.name}>
      <StudentDashboard data={data} />
    </PortalLayout>
  )
}