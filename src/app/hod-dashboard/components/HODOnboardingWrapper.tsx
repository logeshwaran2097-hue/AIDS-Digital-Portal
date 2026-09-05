'use client'

import React, { useState } from 'react'
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
  const [isOpen, setIsOpen] = useState(initialMustChangePassword)

  return (
    <StaffOnboardingModal
      isOpen={isOpen}
      role="hod"
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
      }}
    />
  )
}
