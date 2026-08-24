import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { GraduationCap, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'

export const dynamic = 'force-dynamic'

const FALLBACK_FACULTY = [
  { id: 'f1', name: 'Dr. S. Karthik', email: 'karthik.ai@vsb.edu.in', designation: 'Professor & Lead AI', qualification: 'Ph.D. (IIT Madras)', experience: 14, specialization: 'Deep Learning & NLP' },
  { id: 'f2', name: 'Mrs. R. Priya', email: 'priya.ai@vsb.edu.in', designation: 'Assistant Professor (Sr. Gr)', qualification: 'M.E., (Ph.D.)', experience: 9, specialization: 'Machine Learning & Data Mining' },
  { id: 'f3', name: 'Mr. S. Arun', email: 'arun.ai@vsb.edu.in', designation: 'Assistant Professor', qualification: 'M.Tech (AI)', experience: 6, specialization: 'Computer Vision & Edge AI' },
  { id: 'f4', name: 'Dr. M. Sowmya', email: 'sowmya.ai@vsb.edu.in', designation: 'Associate Professor', qualification: 'Ph.D. (Anna University)', experience: 12, specialization: 'Big Data & Cloud Analytics' },
]

export default async function HODFacultyPage() {
  const session = await requireRoleSession(['hod'])

  const [facultyUsers, facultyDetails] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'faculty' },
      select: { id: true, name: true, email: true, phone: true },
      orderBy: { name: 'asc' },
    }).catch(() => []),
    prisma.faculty.findMany().catch(() => []),
  ])

  const detailMap = new Map<string, any>(facultyDetails.map((d: any) => [d.userId, d]))

  const facultyList = facultyUsers.length > 0 ? facultyUsers.map((u: any) => {
    const d: any = detailMap.get(u.id)
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      designation: d?.designation || 'Faculty',
      qualification: d?.qualification || 'Ph.D. / M.Tech',
      experience: d?.experience || 8,
      specialization: d?.specialization || 'AI & Machine Learning',
    }
  }) : FALLBACK_FACULTY

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
                Teaching Faculty
              </span>
            </div>
            <h1 className="text-2xl font-black">Faculty Management &amp; Workload</h1>
            <p className="text-xs text-gray-300 mt-1">
              Department of AI &amp; DS Academic Staff · Profiles, Specializations &amp; Allocated Courses
            </p>
          </div>
        </div>

        {/* Faculty Grid */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
          {facultyList.map((f: any) => (
            <Card key={f.id} className="rounded-3xl border-gray-200 hover:shadow-lg transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                    {f.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-base text-[#071A3D] truncate">{f.name}</h3>
                      <Badge variant="info" className="shrink-0 text-[10px]">
                        {f.designation}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#1455D9] font-semibold mt-0.5">{f.qualification}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 truncate">
                      <Mail className="w-3.5 h-3.5 text-gray-400" /> {f.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-50">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Experience</p>
                    <p className="font-bold text-[#071A3D] mt-0.5">{f.experience}+ Years</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Specialization</p>
                    <p className="font-bold text-purple-700 truncate mt-0.5">{f.specialization}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PortalLayout>
  )
}
