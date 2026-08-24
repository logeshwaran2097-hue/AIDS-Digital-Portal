import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminStudentsView, StudentRecord } from './components/AdminStudentsView'

export const dynamic = 'force-dynamic'

const FALLBACK_STUDENTS: StudentRecord[] = [
  { id: 's1', registerNumber: '23AD001', name: 'K. Aishwarya', email: '23ad001@vsb.edu.in', phone: '+91 98765 43210', dateOfBirth: '2004-05-15', year: 3, semester: 5, section: 'A', status: 'active' },
  { id: 's2', registerNumber: '23AD002', name: 'S. Gokul', email: '23ad002@vsb.edu.in', phone: '+91 98765 43211', dateOfBirth: '2004-08-20', year: 3, semester: 5, section: 'A', status: 'active' },
  { id: 's3', registerNumber: '23AD003', name: 'M. Harish', email: '23ad003@vsb.edu.in', phone: '+91 98765 43212', dateOfBirth: '2004-11-12', year: 3, semester: 5, section: 'A', status: 'active' },
  { id: 's4', registerNumber: '23AD004', name: 'V. Divya', email: '23ad004@vsb.edu.in', phone: '+91 98765 43213', dateOfBirth: '2004-03-05', year: 3, semester: 5, section: 'B', status: 'active' },
]

export default async function AdminStudentsPage() {
  const session = await requireRoleSession(['admin'])

  const dbStudents = await prisma.student.findMany({
    orderBy: { registerNumber: 'asc' },
  }).catch(() => [])

  const userIds = dbStudents.map((s) => s.userId)
  const dbUsers = await prisma.user.findMany({
    where: { id: { in: userIds } },
  }).catch(() => [])

  const userMap = new Map(dbUsers.map((u) => [u.id, u]))

  const studentsList: StudentRecord[] = dbStudents.length > 0 ? dbStudents.map((s) => {
    const user = userMap.get(s.userId)
    return {
      id: s.id,
      registerNumber: s.registerNumber,
      name: user?.name || s.registerNumber,
      email: user?.email || `${s.registerNumber.toLowerCase()}@vsb.edu.in`,
      phone: user?.phone || '+91 98765 43210',
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.toISOString().split('T')[0] : null,
      year: s.year,
      semester: s.semester,
      section: s.section,
      status: user?.status || 'active',
    }
  }) : FALLBACK_STUDENTS

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminStudentsView initialStudents={studentsList} />
      </div>
    </PortalLayout>
  )
}
