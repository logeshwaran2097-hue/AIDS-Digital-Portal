'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'
import {
  Megaphone,
  Calendar,
  User,
  Pin,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  FileCheck2,
} from 'lucide-react'

export interface StudentAnnouncementItem {
  id: string
  title: string
  content: string
  category: string
  target: string
  attachmentUrl?: string | null
  createdByName?: string | null
  createdAt: string
}

export function StudentAnnouncementsClient({
  announcements,
  studentReg,
  studentName,
}: {
  announcements: StudentAnnouncementItem[]
  studentReg: string
  studentName: string
}) {
  const [completedForms, setCompletedForms] = useState<Record<string, boolean>>({})
  const [markingId, setMarkingId] = useState<string | null>(null)

  // Fetch completion status for all announcements with attachmentUrl
  useEffect(() => {
    const formAnnouncements = announcements.filter((a) => a.attachmentUrl)
    formAnnouncements.forEach(async (a) => {
      try {
        const res = await fetch(`/api/announcements/form-tracker?announcementId=${a.id}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.success && Array.isArray(data.completedStudents)) {
          const isDone = data.completedStudents.some(
            (c: any) => c.registerNumber?.toUpperCase() === studentReg.toUpperCase()
          )
          if (isDone) {
            setCompletedForms((prev) => ({ ...prev, [a.id]: true }))
          }
        }
      } catch {}
    })
  }, [announcements, studentReg])

  const handleOpenAndTrackForm = async (announcementId: string, formUrl: string) => {
    // 1. Open form in new tab immediately
    window.open(formUrl, '_blank', 'noopener,noreferrer')

    // 2. Mark as completed in portal tracking system
    try {
      setMarkingId(announcementId)
      const res = await fetch('/api/announcements/form-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementId,
          registerNumber: studentReg,
          studentName,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCompletedForms((prev) => ({ ...prev, [announcementId]: true }))
      }
    } catch {} finally {
      setMarkingId(null)
    }
  }

  const handleToggleComplete = async (announcementId: string) => {
    try {
      setMarkingId(announcementId)
      const res = await fetch('/api/announcements/form-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementId,
          registerNumber: studentReg,
          studentName,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCompletedForms((prev) => ({ ...prev, [announcementId]: true }))
      }
    } catch {} finally {
      setMarkingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {announcements.length === 0 ? (
        <Card className="rounded-3xl border-gray-200 bg-white">
          <CardContent className="p-12 text-center space-y-3">
            <Megaphone className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-bold text-base text-[#071A3D]">No Bulletins Published Yet</h3>
            <p className="text-xs text-gray-400">Class advisor and department notices will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        announcements.map((item) => {
          const isExam = item.category === 'Examination'
          const isPlacement = item.category === 'Placement'
          const hasForm = Boolean(item.attachmentUrl)
          const isDone = Boolean(completedForms[item.id])

          return (
            <Card
              key={item.id}
              className={`rounded-3xl border transition-all bg-white overflow-hidden group hover:shadow-xl ${
                hasForm && !isDone
                  ? 'border-amber-300 ring-2 ring-amber-100 bg-gradient-to-br from-white via-amber-50/10 to-white'
                  : 'border-gray-200 hover:border-[#1455D9]/40'
              }`}
            >
              <CardContent className="p-6 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isExam
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : isPlacement
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-blue-50 text-[#1455D9] border-blue-200'
                      }`}
                    >
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {formatDate(item.createdAt)}
                    </span>
                    {hasForm && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        📝 Google Form / Survey Attached
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-[#1455D9] flex items-center gap-1">
                    <Pin className="w-3.5 h-3.5 text-[#F4C430]" /> Official Department Notice
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed mt-2 whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>

                {/* Google Form Link / Survey Tracker Card */}
                {hasForm && item.attachmentUrl && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-blue-50/80 border border-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">📋</span>
                        <h4 className="text-xs font-black text-[#071A3D]">Action Required: Form Response Required</h4>
                      </div>
                      <p className="text-[11px] text-gray-600 font-medium truncate max-w-md">
                        Please open the form and fill in your response for class advisor records.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isDone ? (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1.5 border border-emerald-300 shadow-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed
                          </span>
                          <a
                            href={item.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <span>Open Again</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenAndTrackForm(item.id, item.attachmentUrl!)}
                            disabled={markingId === item.id}
                            className="px-4 py-2 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-102 transition-all"
                          >
                            <span>Open Google Form</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleComplete(item.id)}
                            disabled={markingId === item.id}
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                            title="Mark as already completed"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" /> Mark Done
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium flex items-center gap-1.5 text-gray-700">
                    <User className="w-3.5 h-3.5 text-[#1455D9]" />
                    <span>Issued by: {item.createdByName || 'Class Advisor'}</span>
                  </span>

                  {hasForm ? (
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}
                    >
                      {isDone ? '✓ Response Recorded' : '⏳ Pending Your Response'}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                      Active Circular
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
