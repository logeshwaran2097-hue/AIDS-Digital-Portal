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
        <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {displaySubjects.map((s) => (
            <Link
              key={s.id}
              href="/dashboard/study"
              className="block group focus:outline-none"
              title={`View ${s.name} Study Materials`}
            >
              <Card className="rounded-lg border border-[#E5E7EB] hover:border-[#003399]/40 shadow-xs hover:shadow-sm transition-colors bg-white cursor-pointer h-full flex flex-col justify-between">
                <CardContent className="p-4 space-y-2.5 flex flex-col justify-between h-full">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#003399] text-white font-mono font-bold text-xs">
                        {s.code}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                        {s.credits} Credits
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-[#1F2937] group-hover:text-[#003399] transition-colors leading-snug">
                      {s.name}
                    </h3>

                    {s.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {s.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-[#E5E7EB] space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[#003399] font-semibold">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-[#003399]" /> Lecture Notes &amp; Syllabus
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
                        VIEW <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-gray-500 border-t border-dashed border-gray-200">
                      <span className="inline-flex items-center gap-1 text-gray-600 font-medium">
                        <Sparkles className="w-3 h-3 text-amber-500" /> R2023 CO Assessment
                      </span>
                      <Link
                        href="/dashboard/gpa-calculator"
                        className="text-[#003399] hover:underline font-bold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Marks Calculator &rarr;
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Bottom Information Card for R2023 Assessment Matrix */}
      <div className="bg-white rounded-lg p-4 border border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#002266] text-[#FFD700] flex items-center justify-center font-bold text-xs shrink-0 border border-[#001B4D]">
            R23
          </div>
          <div>
            <strong className="text-gray-900 block font-bold">R2023 Assessment Regulations: Theory (40/60) · Lab (60/40) · Theory cum Lab (50/50)</strong>
            <span className="text-gray-500 text-[11px]">Continuous internal assessments (CAT-1, CAT-2, Model, Assignments) are computed automatically.</span>
          </div>
        </div>
        <Link
          href="/dashboard/gpa-calculator"
          className="px-3.5 py-1.5 rounded-md bg-[#003399] hover:bg-[#002266] text-white font-bold shrink-0 transition-colors uppercase tracking-wider text-xs"
        >
          OPEN MARKS CALCULATOR
        </Link>
      </div>
    </div>
  )
}