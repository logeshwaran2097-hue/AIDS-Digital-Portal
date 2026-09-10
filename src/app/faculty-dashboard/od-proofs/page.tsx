import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdvisorODProofsView } from './components/AdvisorODProofsView'

export const dynamic = 'force-dynamic'

export default async function FacultyODProofsPage() {
  const session = await requireRoleSession(['faculty'])

  const [user, faculty] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.faculty.findUnique({ where: { userId: session.userId } }),
  ])

  const isAdvisor = faculty?.facultyType === 'advisor' || faculty?.facultyType === 'both'
  const advisorYear = faculty?.advisorYear || 2
  const advisorSec = faculty?.advisorSec || 'B'
  const advisorBatch = faculty?.advisorBatch || `Year ${advisorYear} · Sec ${advisorSec}`

  // Fetch all OD proofs for students in advisor's class cohort
  let classProofs = await prisma.oDProof.findMany({
    where: {
      year: advisorYear,
      section: advisorSec,
    },
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])



  const roleBadgeLabel = isAdvisor ? 'Class Advisor' : 'Faculty Member'

  return (
    <PortalLayout
      role="faculty"
      userName={user?.name || session.name || 'Faculty'}
      userEmail={user?.email || session.email}
      roleBadgeLabel={roleBadgeLabel}
      isAdvisor={isAdvisor}
    >
      <div className="py-2 animate-fade-in">
        <AdvisorODProofsView
          initialProofs={classProofs.map((p) => ({
            ...p,
            geoTimestamp: p.geoTimestamp ? p.geoTimestamp.toISOString() : null,
            verifiedAt: p.verifiedAt ? p.verifiedAt.toISOString() : null,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
          }))}
          advisorJurisdiction={{
            year: advisorYear,
            section: advisorSec,
            batch: advisorBatch,
            advisorName: user?.name || session.name || 'Class Advisor',
          }}
        />
      </div>
    </PortalLayout>
  )
}
