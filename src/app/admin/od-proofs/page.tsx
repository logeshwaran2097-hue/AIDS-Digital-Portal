import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminODProofsView, AdminODProofItem } from './components/AdminODProofsView'

export const dynamic = 'force-dynamic'

export default async function AdminODProofsPage() {
  const session = await requireRoleSession(['admin'])

  const [user, dbProofs, faculties, facultyUsers, students, studentUsers] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
    prisma.oDProof.findMany({
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
    prisma.faculty.findMany({
      where: {
        advisorYear: { not: null },
        advisorSec: { not: null },
      },
    }).catch(() => []),
    prisma.user.findMany({
      where: { role: 'faculty' },
      select: { id: true, name: true },
    }).catch(() => []),
    prisma.student.findMany().catch(() => []),
    prisma.user.findMany({
      where: { role: 'student' },
      select: { id: true, name: true, phone: true },
    }).catch(() => []),
  ])

  const facultyUserMap = new Map<string, string>(facultyUsers.map((u: any) => [u.id, u.name]))
  const studentUserMap = new Map<string, any>(studentUsers.map((u: any) => [u.id, u]))

  // Map: "year-sec" -> Advisor Name
  const advisorMap = new Map<string, string>()
  faculties.forEach((f: any) => {
    if (f.advisorYear && f.advisorSec) {
      const uName = facultyUserMap.get(f.userId)
      const advisorName = uName
        ? (uName.toLowerCase().startsWith('dr') || uName.toLowerCase().startsWith('prof') ? uName : `Prof. ${uName}`)
        : 'Class Advisor'
      advisorMap.set(`${f.advisorYear}-${f.advisorSec.toUpperCase()}`, advisorName)
    }
  })

  // Map: registerNumber -> Student data
  const studentMap = new Map<string, any>()
  students.forEach((s: any) => {
    if (s.registerNumber) {
      const u = studentUserMap.get(s.userId)
      studentMap.set(s.registerNumber.toUpperCase(), {
        ...s,
        phone: u?.phone || null,
      })
    }
  })

  const initialProofs: AdminODProofItem[] = dbProofs.map((p: any) => {
    const studentInfo = studentMap.get((p.registerNumber || '').toUpperCase())
    const assignedAdvisor =
      advisorMap.get(`${p.year}-${(p.section || 'A').toUpperCase()}`) || studentInfo?.advisorName || 'Class Advisor'

    return {
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
      assignedAdvisor,
      studentPhone: studentInfo?.phone || null,
      parentPhone: studentInfo?.parentPhone || null,
      residencyType: studentInfo?.residencyStatus || null,
      busRoute: studentInfo?.busNo || null,
      hostelRoom: studentInfo?.roomNo
        ? `${studentInfo?.hostelBlock ? `${studentInfo.hostelBlock} - ` : ''}Room ${studentInfo.roomNo}`
        : null,
      cgpa: studentInfo?.cgpa || null,
      createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString(),
    }
  })

  return (
    <PortalLayout role="admin" userName={user?.name || session.name || 'System Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminODProofsView
          initialProofs={initialProofs}
          adminName={user?.name || session.name || 'System Administrator'}
        />
      </div>
    </PortalLayout>
  )
}
