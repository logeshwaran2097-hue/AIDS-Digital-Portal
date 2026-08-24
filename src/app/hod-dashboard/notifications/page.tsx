import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { Bell, Send, CheckCircle2, AlertTriangle, FileQuestion, Sparkles, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'

export const dynamic = 'force-dynamic'

export default async function HODNotificationsPage() {
  const session = await getSession()
  if (!session || session.role !== 'hod') redirect('/login')

  const alerts = [
    {
      id: '1',
      title: 'Question Paper Approval Pending',
      desc: 'Dr. S. Karthik uploaded AD2301 (Machine Learning) IAT-1 paper for HOD approval.',
      time: '10 min ago',
      type: 'approval',
      badge: 'Action Required',
      color: 'bg-amber-100 text-amber-800',
    },
    {
      id: '2',
      title: 'Attendance Defaulter Warning (<75%)',
      desc: '3 students in Semester 5 (Section A) have attendance below the 75% university norm.',
      time: '1 hour ago',
      type: 'alert',
      badge: 'Academic Alert',
      color: 'bg-red-100 text-red-800',
    },
    {
      id: '3',
      title: 'Faculty Course Allocation',
      desc: 'All 7 curriculum courses for Odd Semester 2025-26 successfully mapped to faculty.',
      time: '3 hours ago',
      type: 'success',
      badge: 'Completed',
      color: 'bg-green-100 text-green-800',
    },
    {
      id: '4',
      title: 'National AI Hackathon 2026',
      desc: 'Department sponsored hackathon event scheduled for next month. Registrations live.',
      time: 'Yesterday',
      type: 'info',
      badge: 'Event',
      color: 'bg-blue-100 text-blue-800',
    },
  ]

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
                Communications
              </span>
            </div>
            <h1 className="text-2xl font-black">Department Notifications &amp; Broadcasts</h1>
            <p className="text-xs text-gray-300 mt-1">
              System alerts, urgent circulars, leave approvals and examination intimations
            </p>
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="space-y-3">
          {alerts.map((al) => (
            <Card key={al.id} className="rounded-3xl border-gray-200 hover:shadow-md transition-all">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="mt-1 shrink-0">
                  {al.type === 'approval' && (
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <FileQuestion className="w-5 h-5" />
                    </div>
                  )}
                  {al.type === 'alert' && (
                    <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  )}
                  {al.type === 'success' && (
                    <div className="w-10 h-10 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  {al.type === 'info' && (
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#1455D9] flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm text-[#071A3D]">{al.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${al.color}`}>
                      {al.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{al.desc}</p>
                  <span className="text-[10px] text-gray-400 font-semibold mt-2 block">{al.time}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PortalLayout>
  )
}
