'use client'

import React, { useState, useEffect } from 'react'
import {
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Loader2,
  User,
  Calendar,
  BookOpen,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export interface AttendanceUnlockRequestItem {
  id: string
  sessionId?: string
  year: number
  section: string
  semester: number
  academicYear?: string
  sessionType: string
  subjectCode?: string
  subjectName?: string
  hour?: string
  date: string
  reason: string
  facultyId: string
  facultyName: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewNote?: string
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export function HODAttendanceApprovals() {
  const [requests, setRequests] = useState<AttendanceUnlockRequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectModalId, setRejectModalId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/attendance/unlock-request', { cache: 'no-store' })
      const data = await res.json()
      if (data.success && Array.isArray(data.requests)) {
        setRequests(data.requests)
      }
    } catch (err) {
      console.error('Failed to load unlock requests:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
    // Poll periodically for real-time requests
    const timer = setInterval(fetchRequests, 6000)
    return () => clearInterval(timer)
  }, [])

  const handleApprove = async (requestId: string) => {
    const prev = requests
    // Optimistic update (0ms UI latency)
    setRequests((cur) =>
      cur.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'APPROVED' as const,
              reviewedBy: 'Head of Department',
              reviewedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    )
    setActionSuccess('Attendance register unlocked! Advisor has been notified.')
    setTimeout(() => setActionSuccess(null), 4000)

    try {
      setProcessingId(requestId)
      const res = await fetch('/api/attendance/unlock-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE', requestId }),
      })
      const data = await res.json()
      if (!data.success) {
        setRequests(prev)
      } else {
        fetchRequests()
      }
    } catch (err) {
      console.error('Approve error:', err)
      setRequests(prev)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    const prev = requests
    const note = rejectReason.trim() || 'Request declined by HOD'
    // Optimistic update
    setRequests((cur) =>
      cur.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'REJECTED' as const,
              reviewNote: note,
              reviewedBy: 'Head of Department',
              reviewedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    )
    setActionSuccess('Unlock request declined.')
    setTimeout(() => setActionSuccess(null), 4000)
    setRejectModalId(null)
    setRejectReason('')

    try {
      setProcessingId(requestId)
      const res = await fetch('/api/attendance/unlock-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REJECT',
          requestId,
          reviewNote: note,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setRequests(prev)
      } else {
        fetchRequests()
      }
    } catch (err) {
      console.error('Reject error:', err)
      setRequests(prev)
    } finally {
      setProcessingId(null)
    }
  }

  const pendingRequests = requests.filter((r) => r.status === 'PENDING')
  const recentProcessed = requests.filter((r) => r.status !== 'PENDING').slice(0, 5)

  if (loading && requests.length === 0) {
    return (
      <div className="p-8 text-center bg-white/70 rounded-3xl border border-slate-200/80">
        <Loader2 className="w-6 h-6 animate-spin text-[#1455D9] mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">Checking attendance unlock requests...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-700 flex items-center justify-center font-black">
            <Lock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#071A3D] tracking-tight flex items-center gap-2">
              Attendance Unlock Requests
              {pendingRequests.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-black animate-pulse">
                  {pendingRequests.length} Pending
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              Advisors requesting official permission from HOD to make adjustments to locked attendance
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchRequests}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          title="Refresh requests"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Success Banner */}
      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Pending Requests Cards */}
      {pendingRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingRequests.map((req) => {
            const className = `Year ${req.year} - Sec ${req.section} (Sem ${req.semester})`
            const sessionTitle =
              req.sessionType === 'morning'
                ? 'Morning Roll Call'
                : `${req.subjectCode || 'Subject'}${req.hour ? ` (${req.hour})` : ''}`

            return (
              <Card
                key={req.id}
                className="rounded-3xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 shadow-lg hover:shadow-xl transition-all overflow-hidden"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                      <Lock className="w-3 h-3" />
                      Permission Requested
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(req.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Class & Session Header */}
                  <div>
                    <h3 className="font-extrabold text-base text-[#071A3D]">{className}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#1455D9]">
                        <BookOpen className="w-3.5 h-3.5" />
                        {sessionTitle}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {req.date}
                      </span>
                    </div>
                  </div>

                  {/* Advisor Details */}
                  <div className="p-2.5 rounded-2xl bg-white/90 border border-amber-200/60 text-xs flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#071A3D] text-[#F4C430] font-black flex items-center justify-center shrink-0 text-xs">
                      {req.facultyName?.charAt(0) || 'A'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#071A3D] truncate">{req.facultyName}</p>
                      <p className="text-[10px] text-slate-500">Class Advisor</p>
                    </div>
                  </div>

                  {/* Reason Stated */}
                  <div className="p-3 rounded-2xl bg-amber-100/50 border border-amber-200 text-xs space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                      Advisor&apos;s Justification / Reason:
                    </p>
                    <p className="font-semibold text-slate-800 leading-relaxed italic">
                      &ldquo;{req.reason}&rdquo;
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-amber-100">
                    <button
                      type="button"
                      onClick={() => handleApprove(req.id)}
                      disabled={processingId === req.id}
                      className="flex-1 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-black shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      {processingId === req.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Unlock className="w-4 h-4" />
                      )}
                      <span>Approve &amp; Unlock</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRejectModalId(req.id)}
                      disabled={processingId === req.id}
                      className="px-3.5 py-2.5 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="p-6 text-center bg-white/80 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto mb-2 shadow-2xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-[#071A3D]">No Pending Unlock Requests</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            All submitted attendance records are securely locked. Advisor permission requests will appear here instantly.
          </p>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#071A3D]">Decline Unlock Request</h3>
                <p className="text-xs text-slate-500">Provide an optional note to the advisor</p>
              </div>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for declining (e.g., cut-off deadline exceeded, official permission required from Principal)..."
              rows={3}
              className="w-full rounded-2xl border border-gray-300 p-3 text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectModalId(null)
                  setRejectReason('')
                }}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReject(rejectModalId)}
                disabled={processingId === rejectModalId}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
