'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  autoFocus?: boolean
}

export function OTPInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  disabled,
  autoFocus = true,
}: OTPInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  const getDigits = () => {
    const arr = new Array(length).fill('')
    for (let i = 0; i < value.length && i < length; i++) {
      arr[i] = value[i] || ''
    }
    return arr
  }

  const digits = getDigits()

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value
    // Get last entered character or empty if deleted
    const char = rawVal.replace(/\D/g, '').slice(-1)

    const newDigits = [...digits]
    newDigits[index] = char
    const newCombined = newDigits.join('')

    onChange(newCombined)

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newCombined.length === length) {
      onComplete?.(newCombined)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        onChange(newDigits.join(''))
      } else {
        const newDigits = [...digits]
        newDigits[index] = ''
        onChange(newDigits.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    const cleanDigits = pasted.replace(/\D/g, '').slice(0, length)
    if (cleanDigits.length > 0) {
      onChange(cleanDigits)
      if (cleanDigits.length === length) {
        onComplete?.(cleanDigits)
      }
      const nextFocus = Math.min(cleanDigits.length, length - 1)
      inputRefs.current[nextFocus]?.focus()
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-2.5 my-2" role="group" aria-label="OTP input">
      {Array.from({ length }).map((_, index) => {
        const val = digits[index] || ''
        const isFilled = val !== ''

        return (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={val}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            className={cn(
              'h-12 w-11 sm:w-12 text-center text-2xl font-black rounded-xl border-2 transition-all duration-200 shadow-xs outline-none',
              isFilled
                ? 'border-[#1455D9] bg-blue-50/50 text-[#071A3D]'
                : 'border-gray-300 bg-white text-[#071A3D] hover:border-gray-400',
              'focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/20 focus:bg-white',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50'
            )}
            aria-label={`Digit ${index + 1}`}
          />
        )
      })}
    </div>
  )
}