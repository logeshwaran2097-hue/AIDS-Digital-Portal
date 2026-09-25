'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react'
import { EmptyState } from '@/components/portal/states'
import { StudyNavigationHeader } from '@/components/study/StudyNavigationHeader'
import { getCurriculumBySemester, type CurriculumCourse } from '@/lib/assessmentR2023'

interface Subject {
  id: string
  code: string
  name: string
  credits: number
  description: string | null
}

export default function SubjectsList({ subjects }: { subjects: Subject[] }) {
  const displaySubjects: Subject[] = subjects.length > 0 ? subjects : getCurriculumBySemester(3).map((c: CurriculumCourse, i: number) => ({
    id: `official-3-${i}`,
    code: c.code,
    name: c.name,
    credits: c.credits,
    description: null,
  }))

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Universal Institutional Study Navigation Header */}
      <StudyNavigationHeader
        title="Curriculum &amp; Course Subjects"
        subtitle="Official courses and credit allocations registered for your academic semester."
        badgeText="Department of AI &amp; DS"
        stats={[
          { label: 'Enrolled Courses', value: displaySubjects.length },
          { label: 'Degree Track', value: 'B.Tech AI & DS' },
        ]}
      />


      {displaySubjects.length === 0 ? (
        <EmptyState title="No subjects available" description="Subjects will appear once published by the department." icon="📚" />
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {displaySubjects.map((s) => (
            <Link
              key={s.id}
              href="/dashboard/study"
              className="block group focus:outline-none"
              title={`View ${s.name} Study Materials`}
            >
              <Card className="rounded-2xl border border-slate-200/80 hover:border-[#1455D9]/50 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white cursor-pointer h-full flex flex-col justify-between overflow-hidden group-hover:ring-2 group-hover:ring-[#1455D9]/20">
                <CardContent className="p-5 space-y-3 flex flex-col justify-between h-full">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[#1455D9] text-white font-mono font-black text-xs shadow-xs">
                        {s.code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold">
                        {s.credits} Credits
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug">
                      {s.name}
                    </h3>

                    {s.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {s.description}
                      </p>
                    )}
                  </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#1455D9] font-bold">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-[#1455D9]" /> Study Notes &amp; Lab Manuals
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Explore <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                        <Sparkles className="w-3 h-3 text-amber-500" /> R2023 CO Assessment
                      </span>
                      <Link
                        href="/dashboard/gpa-calculator"
                        className="text-amber-700 hover:text-amber-800 font-bold hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Calculate Marks &rarr;
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom Banner for R2023 Assessment Matrix */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-5 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              R23
            </div>
            <div>
              <strong className="text-slate-900 block font-bold">R2023 Assessment Methods: Theory (40/60) · Lab (60/40) · Theory cum Lab (50/50)</strong>
              <span className="text-slate-600 text-[11px]">Continuous internal assessments are weighted and converted into your final course grade automatically.</span>
            </div>
          </div>
          <Link
            href="/dashboard/gpa-calculator"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shrink-0 transition-colors shadow-sm"
          >
            Open Marks &amp; SGPA Calculator
          </Link>
        </div>
    </div>
  )
}