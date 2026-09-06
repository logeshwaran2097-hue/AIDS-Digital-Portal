'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react'
import { EmptyState } from '@/components/portal/states'

interface Subject {
  id: string
  code: string
  name: string
  credits: number
  description: string | null
}

export default function SubjectsList({ subjects }: { subjects: Subject[] }) {
  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-[#071A3D] tracking-tight">Curriculum &amp; Course Subjects</h1>
          <p className="text-xs text-gray-500 mt-1">Official subjects registered for your current academic semester</p>
        </div>
        <span className="text-xs font-bold text-[#1455D9] px-3 py-1 bg-blue-50 border border-blue-200 rounded-xl self-start sm:self-auto">
          {subjects.length} Enrolled Courses
        </span>
      </div>

      {subjects.length === 0 ? (
        <EmptyState title="No subjects available" description="Subjects will appear once published by the department." icon="📚" />
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((s) => (
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
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}