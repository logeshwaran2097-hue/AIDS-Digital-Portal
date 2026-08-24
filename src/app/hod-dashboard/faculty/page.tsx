import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { Users, Mail, Phone, BookOpen, GraduationCap, Award } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HODFacultyPage() {
  const session = await requireRoleSession(['hod'])

  const [facultyMembers, users] = await Promise.all([
    prisma.faculty.findMany({ orderBy: { facultyId: 'asc' } }).catch(() => []),
    prisma.user.findMany({ where: { role: 'faculty' }, select: { id: true, name: true, email: true, phone: true } }).catch(() => []),
  ])

  const userMap = new Map<string, any>(users.map((u: any) => [u.id, u]))

  const facultyList = facultyMembers.map((f: any) => {
    const u: any = userMap.get(f.userId)
    return {
      id: f.id,
      facultyId: f.facultyId,
      name: u?.name || f.facultyId,
      email: u?.email || `${f.facultyId.toLowerCase()}@vsb.ac.in`,
      phone: u?.phone || '+91 98840 12345',
      designation: f.designation || 'Assistant Professor',
      qualification: f.qualification || 'M.Tech',
      experience: f.experience || 5,
      specialization: f.specialization || 'AI & Data Science',
    }
  })

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
                Staff Roster
              </span>
            </div>
            <h1 className="text-2xl font-black">Faculty Directory &amp; Workload</h1>
            <p className="text-xs text-gray-300 mt-1">
              Department of Artificial Intelligence &amp; Data Science · Teaching Staff
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <p className="text-xs font-bold text-gray-500">Total Faculty</p>
            <p className="text-2xl font-black text-[#071A3D] mt-1">{facultyList.length}</p>
            <p className="text-[10px] text-green-600 mt-0.5">● Database Active</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <p className="text-xs font-bold text-gray-500">Department</p>
            <p className="text-2xl font-black text-[#1455D9] mt-1">AI &amp; DS</p>
          </div>
        </div>

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facultyList.length > 0 ? (
            facultyList.map((f: any) => (
              <div key={f.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#071A3D]">{f.name}</h3>
                    <p className="text-xs font-semibold text-[#1455D9]">{f.designation}</p>
                    <p className="text-[10px] font-mono text-gray-400 mt-0.5">{f.facultyId}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1455D9] text-[10px] font-bold">
                    {f.experience} Yrs Exp
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{f.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{f.specialization}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate font-mono text-[11px]">{f.email}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-400 font-medium bg-white rounded-2xl border border-gray-200">
              No faculty members registered in the database.
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  )
}
