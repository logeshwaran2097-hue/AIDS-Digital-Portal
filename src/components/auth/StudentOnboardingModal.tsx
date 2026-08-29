'use client'

import React, { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

interface StudentOnboardingModalProps {
  isOpen: boolean
  onComplete: (updatedUser: any) => void
  initialData: {
    name: string
    email: string
    phone?: string
    registerNumber: string
    department: string
    year: number
    semester: number
    section: string
    dateOfBirth?: string
    advisorName?: string
    batch?: string
  }
}

export function StudentOnboardingModal({
  isOpen,
  onComplete,
  initialData,
}: StudentOnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirmAndEnter = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/student/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: initialData.name,
          skipEmailVerification: true,
        }),
      })
      const data = await res.json()
      setStep(2)
      toast.success('Details confirmed!')
      setTimeout(() => onComplete(res.ok && data.success ? data.user || {} : {}), 900)
    } catch {
      setStep(2)
      toast.success('Details confirmed!')
      setTimeout(() => onComplete({}), 900)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-gray-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#1455D9] to-[#22C7E8]" />

        {step === 1 && (
          <div className="p-6 space-y-5">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                First-Time Verification
              </p>
              <h2 className="text-lg font-bold text-gray-900">Check Your Details</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Verify the information below is correct before entering the portal.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                <span className="text-xs text-gray-500">Register No.</span>
                <span className="font-semibold text-gray-800 font-mono text-sm">{initialData.registerNumber}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs text-gray-500">Department</span>
                <span className="font-semibold text-gray-800 text-xs text-right max-w-[60%]">{initialData.department}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                <span className="text-xs text-gray-500">Year / Sem / Sec</span>
                <span className="font-semibold text-[#1455D9] text-xs">
                  Year {initialData.year} &middot; Sem {initialData.semester} &middot; Sec {initialData.section}
                </span>
              </div>
              {initialData.batch && (
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-gray-500">Batch</span>
                  <span className="font-semibold text-gray-800 text-xs">{initialData.batch}</span>
                </div>
              )}
              {initialData.advisorName && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                  <span className="text-xs text-gray-500">Class Advisor</span>
                  <span className="font-semibold text-gray-800 text-xs">{initialData.advisorName}</span>
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs text-gray-500">Name</span>
                <span className="font-semibold text-gray-800 text-xs">{initialData.name || '—'}</span>
              </div>
              {initialData.phone && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                  <span className="text-xs text-gray-500">Phone</span>
                  <span className="font-semibold text-gray-800 text-xs">{initialData.phone}</span>
                </div>
              )}
              {initialData.dateOfBirth && (
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-gray-500">Date of Birth</span>
                  <span className="font-semibold text-gray-800 text-xs">{initialData.dateOfBirth}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center">
              If anything looks wrong, contact your department coordinator.
            </p>

            <button
              type="button"
              onClick={handleConfirmAndEnter}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#1455D9] hover:bg-[#1044b5] disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {loading ? 'Confirming...' : 'All Correct — Enter Dashboard'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="font-bold text-gray-800">Details Confirmed!</p>
            <p className="text-xs text-gray-500">Opening your dashboard...</p>
            <div className="w-8 h-8 border-[3px] border-[#1455D9] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

      </div>
    </div>
  )
}
