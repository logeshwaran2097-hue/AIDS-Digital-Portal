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
      {/* Top Institutional Academic Header */}
      <div className="rounded-lg bg-[#002266] text-white p-5 sm:p-6 border border-[#001B4D] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-white/10 border border-white/20 text-[11px] font-bold text-[#FFD700]">
              <span>V.S.B. ENGINEERING COLLEGE · {badgeText}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
              {title || 'Academic Study Center & Curricular Resources'}
            </h1>

            <p className="text-xs text-blue-100/90 leading-relaxed">
              {subtitle ||
                'Access official Regulation 2021/2023 syllabi, 5-unit lecture notes, laboratory manuals, reference e-books, question banks, and GPA calculators.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {stats && stats.length > 0 && (
              <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg border border-white/15">
                {stats.map((s, idx) => (
                  <Fragment key={s.label}>
                    {idx > 0 && <div className="w-px h-7 bg-white/20" />}
                    <div className="px-2.5 text-center">
                      <span className="text-[10px] text-blue-200 uppercase font-semibold block">{s.label}</span>
                      <span className="text-sm sm:text-base font-bold text-[#FFD700]">{s.value}</span>
                    </div>
                  </Fragment>
                ))}
              </div>
            )}

            {actions}
          </div>
        </div>

        {/* Global Navigation Bar across all Study & Resource Pages */}
        <div className="mt-4 pt-3 border-t border-white/15">
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
            {STUDY_PAGES.map((page) => {
              const isActive = pathname === page.href || pathname.startsWith(page.href + '/')
              const Icon = page.icon
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className={cn(
                    'group flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shrink-0 cursor-pointer border',
                    isActive
                      ? 'bg-white text-[#003399] border-white shadow-xs font-bold'
                      : 'bg-white/10 hover:bg-white/20 text-white/90 border-white/10 hover:text-white'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-3.5 h-3.5 transition-colors',
                      isActive ? 'text-[#003399]' : 'text-[#FFD700]'
                    )}
                  />
                  <div className="flex flex-col text-left">
                    <span className="leading-tight">{page.name}</span>
                    <span
                      className={cn(
                        'text-[10px] font-normal leading-none hidden sm:block mt-0.5',
                        isActive ? 'text-gray-500' : 'text-blue-200'
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
