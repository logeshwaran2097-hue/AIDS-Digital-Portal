import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { Users, Download } from 'lucide-react'

export const dynamic = 'force-dynamic'

const FALLBACK_STUDENTS = [
  { id: 's1', registerNumber: '23AD001', name: 'K. Aishwarya', email: '23ad001@vsb.ac.in', year: 3, semester: 5, section: 'A' },
  { id: 's2', registerNumber: '23AD002', name: 'S. Gokul', email: '23ad002@vsb.ac.in', year: 3, semester: 5, section: 'A' },
  { id: 's3', registerNumber: '23AD003', name: 'M. Harish', email: '23ad003@vsb.ac.in', year: 3, semester: 5, section: 'A' },
  { id: 's4', registerNumber: '23AD004', name: 'V. Divya', email: '23ad004@vsb.ac.in', year: 3, semester: 5, section: 'B' },
  { id: 's5', registerNumber: '23AD005', name: 'P. Vignesh', email: '23ad005@vsb.ac.in', year: 3, semester: 5, section: 'B' },
  { id: 's6', registerNumber: '23AD006', name: 'R. Sneha', email: '23ad006@vsb.ac.in', year: 3, semester: 5, section: 'B' },
]

export default async function HODStudentsPage() {
  const session = await requireRoleSession(['hod'])

  const [students, users] = await Promise.all([
    prisma.student.findMany({ orderBy: { registerNumber: 'asc' } }).catch(() => []),
    prisma.user.findMany({ where: { role: 'student' }, select: { id: true, name: true, email: true, phone: true } }).catch(() => []),
  ])

  const userMap = new Map<string, any>(users.map((u: any) => [u.id, u]))

  const studentList = students.length > 0 ? students.map((s: any) => {
    const u: any = userMap.get(s.userId)
    return {
      id: s.id,
      registerNumber: s.registerNumber,
      name: u?.name || 'Student',
      email: u?.email || `${s.registerNumber.toLowerCase()}@vsb.ac.in`,
      year: s.year,
      semester: s.semester,
      section: s.section,
    }
  }) : FALLBACK_STUDENTS

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
                Student Directory
              </span>
            </div>
            <h1 className="text-2xl font-black">Student Enrollment &amp; Records</h1>
            <p className="text-xs text-gray-300 mt-1">
              B.Tech Artificial Intelligence &amp; Data Science · Active Batches (2022 - 2026)
            </p>
          </div>

          <button
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Download className="w-4 h-4" /> Export Student List
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <p className="text-xs font-bold text-gray-500">Total Enrolled</p>
            <p className="text-2xl font-black text-[#071A3D] mt-1">{studentList.length}</p>
            <p className="text-[10px] text-green-600 mt-0.5">● 100% Active</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <p className="text-xs font-bold text-gray-500">I Year (2025)</p>
            <p className="text-2xl font-black text-[#1455D9] mt-1">60</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Section A &amp; B</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <p className="text-xs font-bold text-gray-500">II Year (2024)</p>
            <p className="text-2xl font-black text-purple-600 mt-1">60</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Section A &amp; B</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <p className="text-xs font-bold text-gray-500">III Year (2023)</p>
            <p className="text-2xl font-black text-[#F4C430] mt-1">60</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Section A &amp; B</p>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1455D9]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#071A3D]">Department Student Roll</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#071A3D] text-white">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Reg. No.</th>
                  <th className="py-3.5 px-4 font-bold">Student Name</th>
                  <th className="py-3.5 px-4 font-bold">Email</th>
                  <th className="py-3.5 px-3 font-bold text-center">Year</th>
                  <th className="py-3.5 px-3 font-bold text-center">Semester</th>
                  <th className="py-3.5 px-3 font-bold text-center">Section</th>
                  <th className="py-3.5 px-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {studentList.map((s: any) => (
                  <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1455D9]">{s.registerNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-[#071A3D]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#1455D9] text-white flex items-center justify-center font-bold text-[10px]">
                          {s.name?.charAt(0) || 'S'}
                        </div>
                        <span>{s.name || 'Student'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono">{s.email}</td>
                    <td className="py-3.5 px-3 text-center font-bold">{s.year}</td>
                    <td className="py-3.5 px-3 text-center">{s.semester}</td>
                    <td className="py-3.5 px-3 text-center font-bold">{s.section}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                        Active Enrolled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
