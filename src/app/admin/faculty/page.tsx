import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminFacultyView, FacultyRecord } from './components/AdminFacultyView'

export const dynamic = 'force-dynamic'

const FALLBACK_FACULTY: FacultyRecord[] = [
  { id: 'f1', facultyId: 'FAC-001', name: 'Dr. S. Karthik', email: 'karthik.ai@vsb.edu.in', phone: '+91 98421 12345', designation: 'Professor & Lead AI', qualification: 'Ph.D. (IIT Madras)', experience: 14, specialization: 'Deep Learning & NLP', subjects: 'Machine Learning, Deep Learning', status: 'active' },
  { id: 'f2', facultyId: 'FAC-002', name: 'Mrs. R. Priya', email: 'priya.ai@vsb.edu.in', phone: '+91 98421 12346', designation: 'Assistant Professor (Sr. Gr)', qualification: 'M.E., (Ph.D.)', experience: 9, specialization: 'Machine Learning & Data Mining', subjects: 'Data Analytics, Python Programming', status: 'active' },
  { id: 'f3', facultyId: 'FAC-003', name: 'Mr. S. Arun', email: 'arun.ai@vsb.edu.in', phone: '+91 98421 12347', designation: 'Assistant Professor', qualification: 'M.Tech (AI)', experience: 6, specialization: 'Computer Vision & Edge AI', subjects: 'Computer Vision, Edge AI', status: 'active' },
  { id: 'f4', facultyId: 'FAC-004', name: 'Dr. M. Sowmya', email: 'sowmya.ai@vsb.edu.in', phone: '+91 98421 12348', designation: 'Associate Professor', qualification: 'Ph.D. (Anna University)', experience: 12, specialization: 'Big Data & Cloud Analytics', subjects: 'Cloud Computing, Big Data', status: 'active' },
]

export default async function AdminFacultyPage() {
  const session = await requireRoleSession(['admin'])

  const dbFaculty = await prisma.faculty.findMany({
    orderBy: { facultyId: 'asc' },
  }).catch(() => [])

  const userIds = dbFaculty.map((f) => f.userId)
  const dbUsers = await prisma.user.findMany({
    where: { id: { in: userIds } },
  }).catch(() => [])

  const userMap = new Map(dbUsers.map((u) => [u.id, u]))

  const facultyList: FacultyRecord[] = dbFaculty.length > 0 ? dbFaculty.map((f: any) => {
    const user = userMap.get(f.userId)
    const dobString = f.dateOfBirth ? (typeof f.dateOfBirth === 'string' ? f.dateOfBirth : f.dateOfBirth.toISOString().split('T')[0]) : null
    return {
      id: f.id,
      facultyId: f.facultyId,
      name: user?.name || f.facultyId,
      email: user?.email || `${f.facultyId.toLowerCase()}@vsb.edu.in`,
      phone: user?.phone || '+91 98421 12345',
      dateOfBirth: dobString,
      designation: f.designation || 'Assistant Professor',
      qualification: f.qualification || 'M.Tech / Ph.D.',
      experience: f.experience || 5,
      specialization: f.specialization || 'Artificial Intelligence',
      subjects: f.subjects || 'AI & DS Core Subjects',
      status: user?.status || 'active',
    }
  }) : FALLBACK_FACULTY

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminFacultyView initialFaculty={facultyList} />
      </div>
    </PortalLayout>
  )
}
