'use client'

import React, { useState, useEffect } from 'react'
import { StaffOnboardingModal } from '@/components/auth/StaffOnboardingModal'

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
  const hodKey = hodData.facultyId || hodData.email || 'hod'
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isDone =
      localStorage.getItem(`vsb_staff_onboarding_done_${hodKey}`) === 'true' ||
      sessionStorage.getItem(`vsb_staff_onboarding_done_${hodKey}`) === 'true'

    if (!isDone && initialMustChangePassword) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [hodKey, initialMustChangePassword])

  return (
    <StaffOnboardingModal
      isOpen={isOpen}
      role="hod"
      onClose={() => {
        setIsOpen(false)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`vsb_staff_onboarding_done_${hodKey}`, 'true')
        }
      }}
      initialData={{
        name: hodData.name,
        email: hodData.email,
        phone: hodData.phone || '',
        facultyId: hodData.facultyId,
        designation: hodData.designation || 'Professor & Head of Department',
        qualification: hodData.qualification || 'Ph.D. (AI & DS), M.Tech (CSE)',
        experience: hodData.experience || 18,
        department: hodData.department || 'Artificial Intelligence & Data Science',
      }}
      onComplete={() => {
        setIsOpen(false)
        if (typeof window !== 'undefined') {
          localStorage.setItem(`vsb_staff_onboarding_done_${hodKey}`, 'true')
          sessionStorage.setItem(`vsb_staff_onboarding_done_${hodKey}`, 'true')
        }
      }}
    />
  )
}
