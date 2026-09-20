import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminStudentsView, StudentRecord } from './components/AdminStudentsView'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function AdminStudentsPage() {
  const session = await requireRoleSession(['admin'])

  const [joinedRows, adminUser] = await Promise.all([
    prisma.$queryRaw<any[]>`
      SELECT 
        s.id,
        s."userId",
        s."registerNumber",
        s."dateOfBirth",
        s.department,
        s.year,
        s.semester,
        s.section,
        s.batch,
        s."advisorName",
        s."parentPhone",
        s."isParentWhatsapp",
        s."bloodGroup",
        s."residencyStatus",
        s."hostelBlock",
        s."roomNo",
        s."busNo",
        s."boardingPoint",
        s.address,
        s."busDetails",
        s.cgpa,
        s.attendance,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        u.status as user_status,
        u."lastLogin" as user_last_login,
        u."emailVerified" as user_email_verified
      FROM "Student" s
      LEFT JOIN "User" u ON s."userId" = u.id
      ORDER BY s."registerNumber" ASC
    `.catch(() => []),
    prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
  ])

  const studentsList: StudentRecord[] = joinedRows.map((s) => {
    const rawEmail = s.user_email || ''
    const cleanEmail = rawEmail.endsWith('@student.vsb.edu.in') ? '' : rawEmail
    const hasLoggedInWebsite = Boolean(
      (s.user_phone && s.user_phone.trim()) ||
      (rawEmail && !rawEmail.endsWith('@student.vsb.edu.in')) ||
      (s.user_email_verified && s.user_last_login)
    )
    const effectiveStatus = (s.user_status?.toLowerCase() === 'active' && hasLoggedInWebsite) ? 'active' : 'inactive'

    return {
      id: s.id,
      userId: s.userId,
      registerNumber: s.registerNumber,
      name: s.user_name || s.registerNumber,
      email: cleanEmail,
      phone: s.user_phone || '',
      parentPhone: s.parentPhone || '',
      dateOfBirth: s.dateOfBirth ? new Date(s.dateOfBirth).toISOString().split('T')[0] : null,
      year: s.year,
      semester: s.semester,
      batch: s.batch || '',
      section: s.section,
      advisorName: s.advisorName || '',
      status: effectiveStatus,
      bloodGroup: s.bloodGroup || null,
      residencyStatus: s.residencyStatus || null,
      busNo: s.busNo || null,
      boardingPoint: s.boardingPoint || null,
      busDetails: s.busDetails || null,
      hostelBlock: s.hostelBlock || null,
      roomNo: s.roomNo || null,
      address: s.address || null,
      cgpa: s.cgpa ? String(s.cgpa) : null,
      attendance: s.attendance ? String(s.attendance) : null,
    }
  })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminStudentsView initialStudents={studentsList} />
      </div>
    </PortalLayout>
  )
}
