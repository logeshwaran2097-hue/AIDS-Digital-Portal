import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { StudentODProofsView } from './components/StudentODProofsView'
import { syncSanctionedODsForStudent } from '@/lib/odSync'

export const dynamic = 'force-dynamic'

export default async function StudentODProofsPage() {
  const session = await requireRoleSession(['student'])

  const user = (await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)) || {
    id: session.userId,
    name: session.name || 'Student',
    email: session.email || '',
    role: 'student',
    status: 'active',
  }

  const userReg = session.registerNumber || (session.email ? session.email.split('@')[0].toUpperCase() : '')

  const student = (await prisma.student.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (userReg ? await prisma.student.findUnique({ where: { registerNumber: userReg } }).catch(() => null) : null) || {
      id: 'student-default',
      userId: session.userId,
      registerNumber: userReg || '922521104001',
      dateOfBirth: null,
      department: 'Artificial Intelligence & Data Science',
      year: 2,
      semester: 3,
      section: 'B',
      batch: '2024-2028',
    }

  // Auto-sync any sanctioned ODs from HOD/Advisor approvals
  const proofs = await syncSanctionedODsForStudent(student.registerNumber, student)

  return (
    <PortalLayout
      role="student"
      userName={user.name || 'Student'}
      userEmail={user.email}
    >
      <div className="py-2 animate-fade-in">
        <StudentODProofsView
          initialProofs={proofs.map((p) => ({
            ...p,
            geoTimestamp: p.geoTimestamp ? p.geoTimestamp.toISOString() : null,
            verifiedAt: p.verifiedAt ? p.verifiedAt.toISOString() : null,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
          }))}
          studentInfo={{
            name: user.name,
            registerNumber: student.registerNumber,
            year: student.year,
            section: student.section,
            semester: student.semester,
            batch: student.batch || '2024-2028',
          }}
        />
      </div>
    </PortalLayout>
  )
}
