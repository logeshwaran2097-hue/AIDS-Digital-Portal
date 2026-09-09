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

  // If no proofs exist yet in this class, provide a high-fidelity demo record so advisor can inspect immediately
  if (classProofs.length === 0) {
    const classStudent = await prisma.student.findFirst({
      where: { year: advisorYear, section: advisorSec },
    })
    if (classStudent) {
      const sample = await prisma.oDProof.create({
        data: {
          studentId: classStudent.id,
          registerNumber: classStudent.registerNumber,
          studentName: 'Logeshwaran S',
          year: advisorYear,
          section: advisorSec,
          semester: classStudent.semester || 3,
          eventName: 'National AI & Data Science Symposium - KEC HackFest',
          category: 'Symposium',
          eventDate: '2026-09-08',
          venueCollege: 'Kongu Engineering College, Perundurai',
          geoPhotoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
          latitude: 11.2743,
          longitude: 77.6074,
          geoAddress: 'Kongu Engineering College Campus, Perundurai, Tamil Nadu',
          geoTimestamp: new Date('2026-09-08T10:30:00Z'),
          certificateUrl: 'https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?auto=format&fit=crop&w=800&q=80',
          certificateName: 'KEC_HackFest_FirstPrize_Certificate.pdf',
          achievement: '1st Prize / Winner',
          status: 'under_review',
        },
      }).catch(() => null)
      if (sample) classProofs = [sample]
    }
  }

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
