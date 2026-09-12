'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  MessageCircle,
  Phone,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  ChevronDown,
  Edit2,
  X,
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

export function normalizeIndianPhoneNumber(raw: string | null | undefined): string {
  if (!raw) return '6381366088'
  let num = raw.replace(/\D/g, '')
  if (num.startsWith('91') && num.length >= 12) num = num.slice(2)
  if (num.startsWith('0') && num.length >= 11) num = num.slice(1)
  return num.length >= 10 ? num.slice(-10) : num
}

export function formatIndianPhoneForWhatsApp(raw: string | null | undefined): string {
  const digits = normalizeIndianPhoneNumber(raw)
  return `91${digits}`
}

interface ParentWhatsAppButtonProps {
  parentPhone: string | null | undefined
  studentName: string
  registerNumber?: string
  eventName?: string
  fromDate?: string
  toDate?: string
  customMessage?: string
  size?: 'sm' | 'md'
  showCallButton?: boolean
  allowEdit?: boolean
  onPhoneChange?: (newPhone: string) => void
}

export function ParentWhatsAppButton({
  parentPhone,
  studentName,
  registerNumber,
  eventName,
  fromDate,
  toDate,
  customMessage,
  size = 'md',
  showCallButton = true,
  allowEdit = true,
  onPhoneChange,
}: ParentWhatsAppButtonProps) {
  const [currentPhone, setCurrentPhone] = useState(parentPhone || '6381366088')
  const [isEditing, setIsEditing] = useState(false)
  const [tempPhone, setTempPhone] = useState(currentPhone)
  const [isOpenDropdown, setIsOpenDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (parentPhone) {
      setCurrentPhone(parentPhone)
      setTempPhone(parentPhone)
    }
  }, [parentPhone])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenDropdown(false)
      }
    }
    if (isOpenDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpenDropdown])

  const formattedDigits = normalizeIndianPhoneNumber(currentPhone)
  const waTargetNumber = formatIndianPhoneForWhatsApp(currentPhone)

  const verificationMessage =
    customMessage ||
    `Dear Parent, regarding the On-Duty (OD) / Leave application submitted by ${studentName}${
      registerNumber ? ` (${registerNumber})` : ''
    }${eventName ? ` for "${eventName}"` : ''}${
      fromDate && toDate ? ` from ${fromDate} to ${toDate}` : ''
    }. Please verify with V.S.B. Engineering College AI & DS Class Advisor.`

  const encodedMsg = encodeURIComponent(verificationMessage)

  // Direct actions
  const openWhatsAppWeb = () => {
    setIsOpenDropdown(false)
    const url = `https://web.whatsapp.com/send?phone=${waTargetNumber}&text=${encodedMsg}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const openWhatsAppApp = () => {
    setIsOpenDropdown(false)
    // Universal protocol that opens native WhatsApp client
    window.location.href = `whatsapp://send?phone=${waTargetNumber}&text=${encodedMsg}`
  }

  const openUniversalWhatsApp = () => {
    setIsOpenDropdown(false)
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    if (isMobile) {
      window.open(`https://api.whatsapp.com/send?phone=${waTargetNumber}&text=${encodedMsg}`, '_blank')
    } else {
      // Direct WhatsApp Web without wa.me intermediate redirect to prevent "Starting chat" infinite hang
      window.open(`https://web.whatsapp.com/send?phone=${waTargetNumber}&text=${encodedMsg}`, '_blank', 'noopener,noreferrer')
    }
  }

  const copyMessageAndNumber = async () => {
    setIsOpenDropdown(false)
    const textToCopy = `Parent Phone: +91 ${formattedDigits}\n\nMessage:\n${verificationMessage}`
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = textToCopy
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopied(true)
      toast.success('Parent contact and message copied to clipboard!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Failed to copy text.')
    }
  }

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = tempPhone.replace(/\D/g, '')
    if (clean.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number.')
      return
    }
    const finalPhone = clean.slice(-10)
    setCurrentPhone(finalPhone)
    setIsEditing(false)
    if (onPhoneChange) onPhoneChange(finalPhone)
    toast.success(`Parent WhatsApp contact updated to: ${finalPhone}`)
  }

  return (
    <div className="inline-flex items-center gap-2 flex-wrap text-xs">
      {/* Phone Number Display / Inline Edit */}
      {allowEdit && isEditing ? (
        <form onSubmit={handleSavePhone} className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-blue-300 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 pl-1.5">+91</span>
          <input
            type="tel"
            maxLength={13}
            value={tempPhone}
            onChange={(e) => setTempPhone(e.target.value)}
            placeholder="10-digit mobile"
            className="w-28 px-1.5 py-0.5 text-xs font-mono font-bold text-[#071A3D] focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setTempPhone(currentPhone)
              setIsEditing(false)
            }}
            className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </form>
      ) : (
        showCallButton && (
          <div className="flex items-center gap-1">
            <a
              href={`tel:+91${formattedDigits}`}
              title="Click to dial parent"
              className={cn(
                'rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer',
                size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs'
              )}
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono">{formattedDigits}</span>
            </a>
            {allowEdit && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                title="Edit Parent Phone Number"
                className="p-1 rounded-lg text-gray-400 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )
      )}

      {/* WhatsApp Button with Direct Launch + Robust Options Dropdown */}
      <div className="relative inline-flex items-center shadow-2xs rounded-xl" ref={dropdownRef}>
        {/* Main WhatsApp Button: 1-Click Smart Launch */}
        <button
          type="button"
          onClick={openUniversalWhatsApp}
          title="Open WhatsApp chat with parent"
          className={cn(
            'rounded-l-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]',
            size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
          )}
        >
          <MessageCircle className={cn(size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
          <span>WhatsApp</span>
        </button>

        {/* Dropdown Chevron Trigger for Alternative Launch Options */}
        <button
          type="button"
          onClick={() => setIsOpenDropdown(!isOpenDropdown)}
          title="More WhatsApp options (WhatsApp Web, Desktop App, Copy Message)"
          className={cn(
            'rounded-r-xl border-l border-emerald-400/50 bg-emerald-600 hover:bg-emerald-700 text-white px-1.5 flex items-center justify-center transition-colors cursor-pointer',
            size === 'sm' ? 'py-1' : 'py-1.5'
          )}
        >
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Dropdown Menu (Guaranteed working options if WhatsApp Web is spinning/stuck) */}
        {isOpenDropdown && (
          <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 z-50 animate-in fade-in-50 zoom-in-95 space-y-0.5">
            <div className="px-2.5 py-1 text-[10px] font-black uppercase text-gray-400 tracking-wider border-b border-gray-100 mb-1">
              WhatsApp Launch Modes
            </div>

            {/* Option 1: Direct WhatsApp Web */}
            <button
              type="button"
              onClick={openWhatsAppWeb}
              className="w-full px-2.5 py-2 text-left rounded-xl hover:bg-emerald-50 text-gray-800 hover:text-emerald-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold leading-tight">WhatsApp Web</div>
                <div className="text-[10px] text-gray-400 font-normal">Direct browser chat tab</div>
              </div>
            </button>

            {/* Option 2: WhatsApp Desktop / Native App */}
            <button
              type="button"
              onClick={openWhatsAppApp}
              className="w-full px-2.5 py-2 text-left rounded-xl hover:bg-emerald-50 text-gray-800 hover:text-emerald-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold leading-tight">WhatsApp Desktop App</div>
                <div className="text-[10px] text-gray-400 font-normal">Opens Windows / Mobile app</div>
              </div>
            </button>

            {/* Option 3: Copy Full Message & Contact (Instant fallback if web is slow) */}
            <button
              type="button"
              onClick={copyMessageAndNumber}
              className="w-full px-2.5 py-2 text-left rounded-xl hover:bg-slate-50 text-gray-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </div>
              <div className="min-w-0">
                <div className="font-bold leading-tight">{copied ? 'Copied!' : 'Copy Message & Phone'}</div>
                <div className="text-[10px] text-gray-400 font-normal">Paste into existing chat</div>
              </div>
            </button>

            {/* Option 4: Change Parent Phone Number */}
            {allowEdit && (
              <button
                type="button"
                onClick={() => {
                  setIsOpenDropdown(false)
                  setIsEditing(true)
                }}
                className="w-full px-2.5 py-2 text-left rounded-xl hover:bg-amber-50 text-gray-800 hover:text-amber-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer border-t border-gray-100 mt-1"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Edit2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold leading-tight">Change Parent Number</div>
                  <div className="text-[10px] text-gray-400 font-normal">Use alternate WhatsApp contact</div>
                </div>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
