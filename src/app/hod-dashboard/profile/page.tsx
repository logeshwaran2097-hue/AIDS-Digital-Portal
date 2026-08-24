import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { User, Mail, Phone, Building2, Award, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'

export const dynamic = 'force-dynamic'

export default async function HODProfilePage() {
  const session = await getSession()
  if (!session || session.role !== 'hod') redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const hodRecord = await prisma.hOD.findUnique({ where: { userId: session.userId } })

  return (
    <PortalLayout role="hod" userName={user?.name || 'Head of Department'}>
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        {/* Header Profile Banner */}
        <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 text-center sm:text-left">
            <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border-2 border-[#F4C430] flex items-center justify-center text-4xl font-extrabold text-[#F4C430] shadow-xl shrink-0">
              {user?.name?.charAt(0) || 'H'}
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="px-3 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
                  Head of Department
                </span>
                <span className="text-xs text-gray-300">· HOD001</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.name || 'Prof. Dr. V. Sundar'}</h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-1">
                Department of Artificial Intelligence &amp; Data Science · V.S.B. Engineering College
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details Cards */}
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="rounded-3xl border-gray-200">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Personal &amp; Contact Details</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
                  <span className="text-gray-500">Official Email:</span>
                  <span className="font-bold text-[#071A3D] font-mono">{user?.email || 'hod.ai@vsb.edu.in'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
                  <span className="text-gray-500">Contact Number:</span>
                  <span className="font-bold text-[#071A3D]">{user?.phone || '+91 94432 12345'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
                  <span className="text-gray-500">Faculty / Employee ID:</span>
                  <span className="font-bold text-[#1455D9] font-mono">HOD001</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
                  <span className="text-gray-500">Account Status:</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                    Active · Executive Admin
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-gray-200">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Academic Credentials</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
                  <span className="text-gray-500">Designation:</span>
                  <span className="font-bold text-[#071A3D]">{hodRecord?.designation || 'Professor & Head'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
                  <span className="text-gray-500">Qualification:</span>
                  <span className="font-bold text-[#1455D9]">{hodRecord?.qualification || 'Ph.D. (Data Science & AI)'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
                  <span className="text-gray-500">Total Experience:</span>
                  <span className="font-bold text-purple-700">{hodRecord?.experience || 21} Years Teaching &amp; Research</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
                  <span className="text-gray-500">Department:</span>
                  <span className="font-bold text-[#071A3D]">AI &amp; Data Science</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  )
}
