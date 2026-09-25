'use client'

import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  Database,
  GraduationCap,
  FileQuestion,
  Calculator,
  Sparkles,
  Layers,
  ArrowRight,
  Download,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StudyNavigationHeaderProps {
  title?: string
  subtitle?: string
  badgeText?: string
  stats?: { label: string; value: string | number }[]
  actions?: ReactNode
}

const STUDY_PAGES = [
  {
    name: 'Study Details',
    description: 'Units, Notes & Lab Manuals',
    href: '/dashboard/study',
    icon: BookOpen,
  },
  {
    name: 'Study Resources',
    description: 'Textbooks & Guides',
    href: '/dashboard/resources',
    icon: Database,
  },
  {
    name: 'Curriculum Subjects',
    description: 'Enrolled Courses Scheme',
    href: '/dashboard/subjects',
    icon: GraduationCap,
  },
  {
    name: 'Question Papers',
    description: 'Solved Banks & Past Papers',
    href: '/dashboard/question-papers',
    icon: FileQuestion,
  },
  {
    name: 'GPA & Marksheets',
    description: 'R2023 SGPA / CGPA Suite',
    href: '/dashboard/gpa-calculator',
    icon: Calculator,
  },
  {
    name: 'AI Assistant',
    description: '2-Mark/16-Mark Q&A Tutor',
    href: '/dashboard/study-assistant',
    icon: Sparkles,
  },
]

export function StudyNavigationHeader({
  title,
  subtitle,
  badgeText = 'Department Academic Directorate',
  stats,
  actions,
}: StudyNavigationHeaderProps) {
  const pathname = usePathname()

  return (
    <div className="space-y-4 mb-6">
      {/* Top Institutional Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white p-6 sm:p-8 shadow-xl border border-white/10">
        {/* Subtle decorative background glowing blurs */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-cyan-200">
              <Sparkles className="w-3.5 h-3.5 text-[#F4C430]" />
              <span>{badgeText} · V.S.B. Autonomous</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              {title || 'Academic Study Center & Curricular Resources'}
            </h1>

            <p className="text-xs sm:text-sm text-cyan-100/80 leading-relaxed">
              {subtitle ||
                'Access official Regulation 2021/2023 syllabi, 5-unit lecture notes, laboratory manuals, reference e-books, question banks, and GPA calculators.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {stats && stats.length > 0 && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/15">
                {stats.map((s, idx) => (
                  <Fragment key={s.label}>
                    {idx > 0 && <div className="w-px h-8 bg-white/20" />}
                    <div className="px-3 text-center">
                      <span className="text-[10px] text-cyan-200 uppercase font-bold block">{s.label}</span>
                      <span className="text-base sm:text-lg font-black text-[#F4C430]">{s.value}</span>
                    </div>
                  </Fragment>
                ))}
              </div>
            )}

            {actions}
          </div>
        </div>

        {/* Global Navigation Bar across all Study & Resource Pages */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
            {STUDY_PAGES.map((page) => {
              const isActive = pathname === page.href || pathname.startsWith(page.href + '/')
              const Icon = page.icon
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className={cn(
                    'group flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border',
                    isActive
                      ? 'bg-white text-[#071A3D] shadow-md shadow-black/20 border-white ring-2 ring-white/30'
                      : 'bg-white/5 hover:bg-white/15 text-white/90 border-white/10 hover:border-white/25 hover:text-white'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-[#1455D9]' : 'text-cyan-300 group-hover:text-white'
                    )}
                  />
                  <div className="flex flex-col text-left">
                    <span className="leading-tight">{page.name}</span>
                    <span
                      className={cn(
                        'text-[10px] font-normal leading-none hidden sm:block mt-0.5',
                        isActive ? 'text-slate-500' : 'text-white/60'
                      )}
                    >
                      {page.description}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
