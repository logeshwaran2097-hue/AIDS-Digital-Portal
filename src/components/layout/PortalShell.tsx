'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const studentNav = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Study Details', href: '/dashboard/study' },
  { name: 'Subjects', href: '/dashboard/subjects' },
  { name: 'Question Papers', href: '/dashboard/question-papers' },
  { name: 'Projects', href: '/dashboard/projects' },
  { name: 'Faculty', href: '/dashboard/faculty' },
  { name: 'Events', href: '/dashboard/events' },
  { name: 'Announcements', href: '/dashboard/announcements' },
  { name: 'Achievements', href: '/dashboard/achievements' },
  { name: 'Resources', href: '/dashboard/resources' },
  { name: 'AI Assistant', href: '/dashboard/ai' },
  { name: 'Notifications', href: '/dashboard/notifications' },
  { name: 'Profile', href: '/dashboard/profile' },
]

const facultyNav = [
  { name: 'Dashboard', href: '/faculty-dashboard' },
  { name: 'My Subjects', href: '/faculty-dashboard/subjects' },
  { name: 'Students', href: '/faculty-dashboard/students' },
  { name: 'Resources', href: '/faculty-dashboard/resources' },
  { name: 'Question Papers', href: '/faculty-dashboard/question-papers' },
  { name: 'Projects', href: '/faculty-dashboard/projects' },
  { name: 'Events', href: '/faculty-dashboard/events' },
  { name: 'Announcements', href: '/faculty-dashboard/announcements' },
  { name: 'Notifications', href: '/faculty-dashboard/notifications' },
  { name: 'Profile', href: '/faculty-dashboard/profile' },
  { name: 'Settings', href: '/faculty-dashboard/settings' },
]

const hodNav = [
  { name: 'Dashboard', href: '/hod-dashboard' },
  { name: 'Students', href: '/hod-dashboard/students' },
  { name: 'Faculty', href: '/hod-dashboard/faculty' },
  { name: 'Academics', href: '/hod-dashboard/academics' },
  { name: 'Study Resources', href: '/hod-dashboard/resources' },
  { name: 'Question Papers', href: '/hod-dashboard/question-papers' },
  { name: 'Projects', href: '/hod-dashboard/projects' },
  { name: 'Events', href: '/hod-dashboard/events' },
  { name: 'Announcements', href: '/hod-dashboard/announcements' },
  { name: 'Achievements', href: '/hod-dashboard/achievements' },
  { name: 'Reports', href: '/hod-dashboard/reports' },
  { name: 'AI Assistant', href: '/hod-dashboard/ai' },
  { name: 'Notifications', href: '/hod-dashboard/notifications' },
  { name: 'Profile', href: '/hod-dashboard/profile' },
  { name: 'Settings', href: '/hod-dashboard/settings' },
]

const adminNav = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Students', href: '/admin/students' },
  { name: 'Faculty', href: '/admin/faculty' },
  { name: 'HOD', href: '/admin/hod' },
  { name: 'Admins', href: '/admin/admins' },
  { name: 'Roles & Permissions', href: '/admin/roles' },
  { name: 'Academics', href: '/admin/academics' },
  { name: 'Study Resources', href: '/admin/resources' },
  { name: 'Question Papers', href: '/admin/question-papers' },
  { name: 'Projects', href: '/admin/projects' },
  { name: 'Events', href: '/admin/events' },
  { name: 'Announcements', href: '/admin/announcements' },
  { name: 'Achievements', href: '/admin/achievements' },
  { name: 'Notifications', href: '/admin/notifications' },
  { name: 'AI Assistant', href: '/admin/ai' },
  { name: 'Reports', href: '/admin/reports' },
  { name: 'Activity Logs', href: '/admin/activity-logs' },
  { name: 'File Management', href: '/admin/files' },
  { name: 'System Settings', href: '/admin/settings' },
  { name: 'Profile', href: '/admin/profile' },
]

const navMap: Record<string, { name: string; href: string }[]> = {
  student: studentNav.concat({ name: 'Live Local', href: '/dashboard/live-local' }),
  faculty: facultyNav.concat({ name: 'Live Local', href: '/dashboard/live-local' }),
  hod: hodNav.concat({ name: 'Live Local', href: '/dashboard/live-local' }),
  admin: adminNav.concat({ name: 'Live Local', href: '/dashboard/live-local' }),
}

const bottomNav: Record<string, { name: string; href: string }[]> = {
  student: [
    { name: 'Home', href: '/dashboard' },
    { name: 'Study', href: '/dashboard/study' },
    { name: 'Projects', href: '/dashboard/projects' },
    { name: 'Notifications', href: '/dashboard/notifications' },
    { name: 'Profile', href: '/dashboard/profile' },
  ],
  faculty: [
    { name: 'Home', href: '/faculty-dashboard' },
    { name: 'Subjects', href: '/faculty-dashboard/subjects' },
    { name: 'Resources', href: '/faculty-dashboard/resources' },
    { name: 'Notifications', href: '/faculty-dashboard/notifications' },
    { name: 'Profile', href: '/faculty-dashboard/profile' },
  ],
  hod: [
    { name: 'Home', href: '/hod-dashboard' },
    { name: 'Students', href: '/hod-dashboard/students' },
    { name: 'Reports', href: '/hod-dashboard/reports' },
    { name: 'Notifications', href: '/hod-dashboard/notifications' },
    { name: 'Profile', href: '/hod-dashboard/profile' },
  ],
  admin: [
    { name: 'Home', href: '/admin' },
    { name: 'Students', href: '/admin/students' },
    { name: 'Reports', href: '/admin/reports' },
    { name: 'Notifications', href: '/admin/notifications' },
    { name: 'Profile', href: '/admin/profile' },
  ],
}

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname()
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-navy text-white hidden lg:flex flex-col">
      <div className="flex items-center gap-3 p-5 border-b border-white/10">
        <Image src="/logo.svg" alt="V.S.B. Engineering College Logo" width={40} height={40} className="border-rounded-lg" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-white leading-tight">V.S.B. Engineering College</p>
          <p className="text-xs text-gold">AI &amp; DS Digital Portal</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1" aria-label="Main navigation">
        {navMap[role]?.map((item) => {
          const active = pathname === item.href || (item.href !== '/' + role.split('-')[0] && pathname.startsWith(item.href + '/'))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active ? 'bg-royal text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <span className="text-lg">•</span>
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <Link href="/api/auth/logout" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-white/10 hover:text-red-300 transition-all duration-200">
          <span className="text-lg">⏻</span>
          Logout
        </Link>
      </div>
    </aside>
  )
}

export function MainLayout({ children, role, userName }: { children: React.ReactNode; role: string; userName: string }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} />
      <main className={cn('flex-1 min-w-0', role !== 'guest' && 'md:pl-64')} id="main">
        {children}
      </main>
    </div>
  )
}

export function TopBar({ role, userName }: { role: string; userName: string }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex h-16 items-center gap-4 px-4">
        <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" aria-label="Open menu">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="College Logo" width={32} height={32} className="rounded-full" />
          <span className="hidden sm:inline text-sm font-semibold text-navy">V.S.B. AI &amp; DS Portal</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="text-sm font-medium text-navy hidden sm:inline">{userName}</div>
          <div className="h-8 w-8 rounded-full bg-royal text-white flex items-center justify-center text-xs font-bold">
            {userName.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}

export function BottomNav({ role }: { role: string }) {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 lg:hidden grid grid-cols-5" aria-label="Bottom navigation">
      {bottomNav[role]?.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors',
              active ? 'text-royal' : 'text-gray-500'
            )}
          >
            <span className="text-lg leading-none">{getIcon(item.name)}</span>
            <span>{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function getIcon(name: string): string {
  const icons: Record<string, string> = {
    'Home': '🏠',
    'Study': '📚',
    'Projects': '💼',
    'Notifications': '🔔',
    'Profile': '👤',
    'Subjects': '📖',
    'Resources': '📁',
    'Students': '🎓',
    'Reports': '📊',
  }
  return icons[name] || '•'
}