import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

const roles = [
  {
    role: 'student',
    title: 'Student Portal',
    badge: 'Academic Dashboard',
    desc: 'Access attendance, courses, study resources, question papers & internal marks.',
    icon: '🎓',
    color: 'from-blue-600 to-indigo-700',
    border: 'border-blue-500/30',
    link: '/api/auth/quick-login?role=student',
    sublinks: [
      { name: 'Dashboard', href: '/api/auth/quick-login?role=student&redirect=/dashboard' },
      { name: 'Attendance', href: '/api/auth/quick-login?role=student&redirect=/dashboard/attendance' },
      { name: 'Subjects', href: '/api/auth/quick-login?role=student&redirect=/dashboard/subjects' },
      { name: 'Question Papers', href: '/api/auth/quick-login?role=student&redirect=/dashboard/question-papers' },
      { name: 'Projects', href: '/api/auth/quick-login?role=student&redirect=/dashboard/projects' },
    ]
  },
  {
    role: 'faculty',
    title: 'Faculty Portal',
    badge: 'Teaching & Content',
    desc: 'Take hourly attendance, upload lecture materials, submit question papers & monitor students.',
    icon: '📚',
    color: 'from-cyan-600 to-blue-700',
    border: 'border-cyan-500/30',
    link: '/api/auth/quick-login?role=faculty',
    sublinks: [
      { name: 'Dashboard', href: '/api/auth/quick-login?role=faculty&redirect=/faculty-dashboard' },
      { name: 'Attendance Register', href: '/api/auth/quick-login?role=faculty&redirect=/faculty-dashboard/attendance' },
      { name: 'My Subjects', href: '/api/auth/quick-login?role=faculty&redirect=/faculty-dashboard/subjects' },
      { name: 'Students Roster', href: '/api/auth/quick-login?role=faculty&redirect=/faculty-dashboard/students' },
      { name: 'Resources Upload', href: '/api/auth/quick-login?role=faculty&redirect=/faculty-dashboard/resources' },
    ]
  },
  {
    role: 'hod',
    title: 'HOD Portal',
    badge: 'Department Head',
    desc: 'Executive department overview, approve question papers, manage staff workloads & audits.',
    icon: '🏛️',
    color: 'from-amber-600 to-orange-700',
    border: 'border-amber-500/30',
    link: '/api/auth/quick-login?role=hod',
    sublinks: [
      { name: 'Executive Dashboard', href: '/api/auth/quick-login?role=hod&redirect=/hod-dashboard' },
      { name: 'Faculty Staff', href: '/api/auth/quick-login?role=hod&redirect=/hod-dashboard/faculty' },
      { name: 'Student Roll', href: '/api/auth/quick-login?role=hod&redirect=/hod-dashboard/students' },
      { name: 'Academics', href: '/api/auth/quick-login?role=hod&redirect=/hod-dashboard/academics' },
      { name: 'Question Papers', href: '/api/auth/quick-login?role=hod&redirect=/hod-dashboard/question-papers' },
    ]
  },
  {
    role: 'admin',
    title: 'System Admin Portal',
    badge: 'Super Administrator',
    desc: 'System settings, user accounts, activity logs, file management and role permissions.',
    icon: '⚙️',
    color: 'from-purple-700 to-slate-900',
    border: 'border-purple-500/30',
    link: '/api/auth/quick-login?role=admin',
    sublinks: [
      { name: 'Admin Dashboard', href: '/api/auth/quick-login?role=admin&redirect=/admin/dashboard' },
      { name: 'Students Manager', href: '/api/auth/quick-login?role=admin&redirect=/admin/students' },
      { name: 'Faculty Manager', href: '/api/auth/quick-login?role=admin&redirect=/admin/faculty' },
      { name: 'Activity Logs', href: '/api/auth/quick-login?role=admin&redirect=/admin/activity-logs' },
      { name: 'System Settings', href: '/api/auth/quick-login?role=admin&redirect=/admin/settings' },
    ]
  },
]

export default function QuickLoginPage() {
  return (
    <div className="min-h-screen bg-[#071A3D] text-white p-4 sm:p-8 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center justify-center p-2 rounded-full bg-white shadow-xl ring-4 ring-white/20 mb-2">
            <Image
              src="/college-emblem.png"
              alt="V.S.B. Engineering College Emblem"
              width={64}
              height={64}
              className="rounded-full object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            V.S.B. Engineering College · AI &amp; DS Portal
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
            1-Click Direct Role Launcher — Instant authenticated access for testing &amp; demoing all portal roles.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((item) => (
            <div
              key={item.role}
              className="rounded-3xl bg-white/5 border border-white/10 hover:border-white/25 backdrop-blur-md p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <h2 className="text-xl font-bold text-white">{item.title}</h2>
                      <span className="inline-block text-[11px] font-bold text-[#F4C430] uppercase tracking-wider">
                        {item.badge}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {item.desc}
                </p>

                <div className="pt-2">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Quick Direct Menu Jump:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.sublinks.map((sub) => (
                      <a
                        key={sub.name}
                        href={sub.href}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-200 transition-colors"
                      >
                        {sub.name} →
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-white/10">
                <a
                  href={item.link}
                  className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${item.color} text-white font-bold text-sm text-center flex items-center justify-center gap-2 shadow-lg transition-all hover:brightness-110`}
                >
                  <span>Launch {item.title}</span>
                  <span>🚀</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 pt-8 pb-2">
        <p>V.S.B. Engineering College · Department of Artificial Intelligence &amp; Data Science</p>
      </div>
    </div>
  )
}
