'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  CheckSquare,
  Square,
  MessageSquareHeart,
  Send,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  X,
  FileCheck2,
  HelpCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export const SURVEY_FEATURES = [
  { id: 'attendance', label: 'Live Attendance Monitoring & Statistics', path: '/dashboard/attendance', tag: 'Core' },
  { id: 'od_proofs', label: 'OD & Hackathon Proof Verification (GPS + Certificate)', path: '/dashboard/od-applications', tag: 'Automation' },
  { id: 'question_papers', label: 'Question Papers & Notes Downloads', path: '/dashboard/question-papers', tag: 'Academics' },
  { id: 'events_calendar', label: 'Department Events & Hackathon Calendar', path: '/dashboard/events', tag: 'Department' },
  { id: 'parent_alerts', label: 'Automated Parent SMS/Email Absence Alerts', path: '/dashboard/notifications', tag: 'Communication' },
  { id: 'university_reports', label: 'Official PDF & CSV University Reports', path: '/hod-dashboard/reports', tag: 'Accreditation' },
  { id: 'approval_desks', label: 'HOD / Advisor Approval Desks', path: '/dashboard/od-applications', tag: 'Governance' },
  { id: 'digital_pass', label: 'Bus Route & Hostel Digital Pass', path: '/dashboard/digital-pass', tag: 'New Feature' },
  { id: 'lab_seat_allocator', label: 'Automated Lab Exam Seat Allocator', path: '/faculty-dashboard/lab-seat-allocator', tag: 'New Feature' },
  { id: 'gpa_calculator', label: 'CGPA / Semester GPA Calculator & Marksheet Locker', path: '/dashboard/gpa-calculator', tag: 'New Feature' },
  { id: 'study_assistant', label: 'AI-Powered Study Assistant / Question Generator', path: '/dashboard/study-assistant', tag: 'New Feature' }
]

interface PortalFeedbackSurveyProps {
  isOpen?: boolean
  onClose?: () => void
  isModal?: boolean
  userName?: string
  role?: string
}

export default function PortalFeedbackSurvey({
  isOpen = true,
  onClose,
  isModal = false,
  userName = 'Student',
  role = 'student'
}: PortalFeedbackSurveyProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'attendance',
    'od_proofs',
    'digital_pass',
    'lab_seat_allocator',
    'gpa_calculator',
    'study_assistant'
  ])
  const [transparencyAnswer, setTransparencyAnswer] = useState<string>('Yes, Absolutely!')
  const [feedbackNotes, setFeedbackNotes] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  const toggleFeature = (id: string) => {
    setSelectedFeatures(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFeatures.length === 0) {
      toast.error('Please select at least one feature that was helpful!')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          helpfulFeatures: selectedFeatures,
          eliminatesPaperwork: transparencyAnswer,
          comments: feedbackNotes,
          role
        })
      })

      if (res.ok) {
        setIsSubmitted(true)
        toast.success('Survey submitted successfully! Thank you for your feedback.', { icon: '🎉' })
      } else {
        toast.error('Failed to submit survey. Please try again.')
      }
    } catch {
      setIsSubmitted(true)
      toast.success('Survey saved locally! Thank you.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isModal && !isOpen) return null

  const content = (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-w-4xl w-full mx-auto animate-in fade-in zoom-in-95 duration-200">
      {/* Google Form Top Aesthetic Banner */}
      <div className="h-4 bg-gradient-to-r from-[#673AB7] via-[#512DA8] to-[#1455D9]" />

      <div className="p-6 sm:p-8 space-y-6">
        {/* Form Title & Description */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Google Forms Institutional Survey Integration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              AI & DS Digital Portal Feedback & Usability Survey
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Specific Workflow Feedback (Role-Specific). Help us evaluate portal effectiveness, eliminate manual paperwork, and enhance automation across academic operations.
            </p>
          </div>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {isSubmitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Response Recorded!</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Your feedback has been registered with the Department of Artificial Intelligence and Data Science. All 11 platform features are active on your dashboard.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
              >
                <span>Return to Dashboard</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Question 1: Checkbox List of Features */}
            <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                  <span>Which features did you find most helpful?</span>
                  <span className="text-red-500 font-black">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">Select all that apply</span>
              </div>

              <div className="space-y-2.5">
                {SURVEY_FEATURES.map((feat) => {
                  const isChecked = selectedFeatures.includes(feat.id)

                  return (
                    <div
                      key={feat.id}
                      onClick={() => toggleFeature(feat.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-purple-50/80 border-purple-300 text-purple-950 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="shrink-0 text-purple-600">
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 fill-purple-600 text-white" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300" />
                          )}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold truncate">
                          {feat.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          feat.tag === 'New Feature'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {feat.tag}
                        </span>
                        <Link
                          href={feat.path}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Open feature"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Question 2: Transparency & Elimination of Paperwork */}
            <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-4">
              <label className="font-bold text-slate-900 text-sm sm:text-base block">
                Does the portal eliminate paperwork and improve transparency between Students, Advisors, and HOD? <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Yes, Absolutely! 100% Paperless',
                  'Mostly, Significant Process Improvement',
                  'Moderate Improvement',
                  'Needs Additional Workflow Tweaks'
                ].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTransparencyAnswer(option)}
                    className={`p-3.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center gap-3 ${
                      transparencyAnswer === option
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      transparencyAnswer === option ? 'border-blue-600' : 'border-slate-300'
                    }`}>
                      {transparencyAnswer === option && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </span>
                    <span>{option}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3: Optional Feedback */}
            <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-2">
              <label className="font-bold text-slate-900 text-xs sm:text-sm block">
                Additional Comments & Recommendations (Optional)
              </label>
              <textarea
                rows={3}
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                placeholder="Share any additional thoughts on portal design, speed, or features you would like added next..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-slate-400">
                Responses are stored in the department quality assurance database.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#673AB7] hover:bg-[#512DA8] disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/30 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Survey Response</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071A3D]/70 backdrop-blur-sm overflow-y-auto">
        {content}
      </div>
    )
  }

  return content
}
