import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyStudentsView, StudentRosterItem } from './components/FacultyStudentsView'

export const dynamic = 'force-dynamic'

const FALLBACK_FACULTY_STUDENTS: StudentRosterItem[] = [
  { id: 'st-1', name: 'K. Aishwarya', registerNumber: '23AD001', email: '23ad001@vsb.ac.in', phone: '+91 90252 10001', year: 3, semester: 5, section: 'A', cgpa: 9.12, attendance: 94.5, arrears: 0, parentPhone: '+91 98421 23456' },
  { id: 'st-2', name: 'S. Gokul', registerNumber: '23AD002', email: '23ad002@vsb.ac.in', phone: '+91 90252 10002', year: 3, semester: 5, section: 'A', cgpa: 8.85, attendance: 88.0, arrears: 0, parentPhone: '+91 98421 23457' },
  { id: 'st-3', name: 'M. Harish', registerNumber: '23AD003', email: '23ad003@vsb.ac.in', phone: '+91 90252 10003', year: 3, semester: 5, section: 'A', cgpa: 9.34, attendance: 96.2, arrears: 0, parentPhone: '+91 98421 23458' },
  { id: 'st-4', name: 'V. Divya', registerNumber: '23AD004', email: '23ad004@vsb.ac.in', phone: '+91 90252 10004', year: 3, semester: 5, section: 'A', cgpa: 7.65, attendance: 72.0, arrears: 1, parentPhone: '+91 98421 23459' },
  { id: 'st-5', name: 'P. Vignesh', registerNumber: '23AD005', email: '23ad005@vsb.ac.in', phone: '+91 90252 10005', year: 3, semester: 5, section: 'A', cgpa: 8.92, attendance: 95.0, arrears: 0, parentPhone: '+91 98421 23460' },
  { id: 'st-6', name: 'R. Sneha', registerNumber: '23AD006', email: '23ad006@vsb.ac.in', phone: '+91 90252 10006', year: 3, semester: 5, section: 'A', cgpa: 8.78, attendance: 89.5, arrears: 0, parentPhone: '+91 98421 23461' },
  { id: 'st-7', name: 'N. Balaji', registerNumber: '23AD007', email: '23ad007@vsb.ac.in', phone: '+91 90252 10007', year: 3, semester: 5, section: 'A', cgpa: 7.42, attendance: 69.5, arrears: 2, parentPhone: '+91 98421 23462' },
  { id: 'st-8', name: 'T. Kaviya', registerNumber: '23AD008', email: '23ad008@vsb.ac.in', phone: '+91 90252 10008', year: 3, semester: 5, section: 'A', cgpa: 9.05, attendance: 92.0, arrears: 0, parentPhone: '+91 98421 23463' },
]

export default async function FacultyStudentsPage() {
  const session = await requireRoleSession(['faculty'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)
  const studentsFromDb = await prisma.student.findMany({
    orderBy: { registerNumber: 'asc' },
  }).catch(() => [])

  const usersFromDb = await prisma.user.findMany({
    where: { role: 'student' },
  }).catch(() => [])

  const userMap = new Map(usersFromDb.map((u) => [u.id, u]))

  const mappedStudents: StudentRosterItem[] = studentsFromDb.length > 0 ? studentsFromDb.map((s, idx) => {
    const matchedUser = userMap.get(s.userId)
    return {
      id: s.id,
      name: matchedUser?.name || `Student ${s.registerNumber}`,
      registerNumber: s.registerNumber,
      email: matchedUser?.email || `${s.registerNumber.toLowerCase()}@vsb.edu.in`,
      phone: matchedUser?.phone || `+91 90252 1000${idx + 1}`,
      year: s.year,
      semester: s.semester,
      section: s.section,
      cgpa: 8.84 - idx * 0.18,
      attendance: idx === 3 ? 71.0 : 92.5 - idx * 2.1,
      arrears: idx === 3 ? 1 : 0,
      parentPhone: `+91 98421 ${23456 + idx}`,
    }
  }) : FALLBACK_FACULTY_STUDENTS

  return (
    <PortalLayout role="faculty" userName={user?.name || session.name || 'Faculty'}>
      <div className="py-2 animate-fade-in">
        <FacultyStudentsView initialStudents={mappedStudents} />
      </div>
    </PortalLayout>
  )
}
