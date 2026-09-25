'use client'

import React, { useState, useEffect } from 'react'
import { StaffOnboardingModal } from '@/components/auth/StaffOnboardingModal'
import { ShieldCheck, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface HODOnboardingWrapperProps {
  initialMustChangePassword: boolean
  hodData: {
    name: string
    email: string
    phone?: string
    facultyId: string
    designation?: string
    qualification?: string
    experience?: number
    department?: string
  }
}

export function HODOnboardingWrapper({
  initialMustChangePassword,
  hodData,
}: HODOnboardingWrapperProps) {
  const searchParams = useSearchParams()
  const hodKey = hodData.facultyId || hodData.email || 'hod'
  const [isOpen, setIsOpen] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Has HOD completed their real profile in the database?
    const hasCompletedDbProfile = Boolean(
      hodData.qualification &&
      hodData.qualification.trim().length > 0 &&
      hodData.phone &&
      hodData.phone.trim().length > 0
    )

    const isMarkedDone =
      localStorage.getItem(`vsb_staff_onboarding_done_${hodKey}`) === 'true' ||
      sessionStorage.getItem(`vsb_staff_onboarding_done_${hodKey}`) === 'true'

    setIsCompleted(Boolean(isMarkedDone && hasCompletedDbProfile))

    // Only launch if explicitly triggered via query param: ?onboarding=1 or ?onboarding=true
    const queryTrigger = searchParams?.get('onboarding')
    if (queryTrigger === '1' || queryTrigger === 'true' || queryTrigger === 'hod') {
      setIsOpen(true)
    }
  }, [hodKey, searchParams, hodData.qualification, hodData.phone])

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('open-hod-onboarding', handleOpen)
    return () => window.removeEventListener('open-hod-onboarding', handleOpen)
  }, [])

  return (
    <>
      {/* Interactive HOD Onboarding Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 border border-blue-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1455D9] to-[#0A2A5E] text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-[#F4C430]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-800">HOD Appointment &amp; Security Onboarding</span>
              {isCompleted ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified &amp; Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold animate-pulse">
                  Verification Available
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Review official appointment records, configure permanent security credentials, and manage qualifications.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1455D9] to-[#0A2A5E] hover:from-[#0D44B8] hover:to-[#071A3D] text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F4C430]" />
          <span>{isCompleted ? 'Review HOD Onboarding' : 'Launch HOD Onboarding'}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>

      <StaffOnboardingModal
        isOpen={isOpen}
        role="hod"
        onClose={() => {
          setIsOpen(false)
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(`vsb_staff_onboarding_dismissed_${hodKey}`, 'true')
          }
        }}
        initialData={{
          name: hodData.name,
          email: hodData.email,
          phone: hodData.phone || '',
          facultyId: hodData.facultyId,
          designation: hodData.designation || 'Professor & Head of Department',
          qualification: hodData.qualification || '',
          experience: hodData.experience ?? 0,
          department: hodData.department || 'Artificial Intelligence & Data Science',
        }}
        onComplete={() => {
          setIsOpen(false)
          setIsCompleted(true)
          if (typeof window !== 'undefined') {
            localStorage.setItem(`vsb_staff_onboarding_done_${hodKey}`, 'true')
            sessionStorage.setItem(`vsb_staff_onboarding_done_${hodKey}`, 'true')
            sessionStorage.removeItem(`vsb_staff_onboarding_dismissed_${hodKey}`)
            window.location.reload()
          }
        }}
      />
    </>
  )
}
