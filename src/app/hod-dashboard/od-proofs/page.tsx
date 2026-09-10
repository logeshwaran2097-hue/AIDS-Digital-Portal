import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODODProofsView, ODProofItem } from './components/HODODProofsView'

export const dynamic = 'force-dynamic'

export default async function HODODProofsPage() {
  const session = await requireRoleSession(['hod'])

  const [user, dbProofs] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
    prisma.oDProof.findMany({
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
  ])

  const initialProofs: ODProofItem[] = dbProofs.map((p: any) => ({
    id: p.id,
    studentId: p.studentId || null,
    registerNumber: p.registerNumber,
    studentName: p.studentName,
    year: p.year,
    section: p.section,
    semester: p.semester,
    odRequestId: p.odRequestId || null,
    eventName: p.eventName,
    category: p.category,
    eventDate: p.eventDate,
    venueCollege: p.venueCollege || null,
    geoPhotoUrl: p.geoPhotoUrl || null,
    latitude: p.latitude || null,
    longitude: p.longitude || null,
    geoAddress: p.geoAddress || null,
    geoTimestamp: p.geoTimestamp ? p.geoTimestamp.toISOString() : null,
    certificateUrl: p.certificateUrl || null,
    certificateName: p.certificateName || null,
    achievement: p.achievement || null,
    status: p.status,
    advisorRemarks: p.advisorRemarks || null,
    verifiedByName: p.verifiedByName || null,
    verifiedAt: p.verifiedAt ? p.verifiedAt.toISOString() : null,
    attendanceCredited: Boolean(p.attendanceCredited),
    createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString(),
  }))

  return (
    <PortalLayout role="hod" userName={user?.name || session.name || 'Head of Department'}>
      <div className="py-2 animate-fade-in">
        <HODODProofsView
          initialProofs={initialProofs}
          hodName={user?.name || session.name || 'Head of Department'}
        />
      </div>
    </PortalLayout>
  )
}
