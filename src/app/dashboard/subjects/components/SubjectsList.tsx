'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#071A3D] tracking-tight">My Subjects</h1>
        <p className="text-sm text-gray-600 mt-1">All subjects for the current semester</p>
      </div>

      {subjects.length === 0 ? (
        <EmptyState title="No subjects available" description="Subjects will appear once published by the department." icon="📚" />
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((s) => (
            <Card key={s.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge className="bg-[#1455D9] text-white">{s.code}</Badge>
                  <Badge className="bg-[#F4C430] text-[#071A3D]">{s.credits} credits</Badge>
                </div>
                <h3 className="font-semibold text-[#071A3D]">{s.name}</h3>
                {s.description && <p className="text-sm text-gray-600 line-clamp-2">{s.description}</p>}
                <Link
                  href="/dashboard/study"
                  className="inline-flex items-center gap-1.5 text-sm text-[#1455D9] hover:underline font-medium"
                >
                  <BookOpen className="h-4 w-4" /> Study material
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}