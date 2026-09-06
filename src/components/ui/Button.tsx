'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-[#071A3D] via-[#0B2559] to-[#071A3D] text-white shadow-xs hover:shadow-md hover:brightness-110 focus-visible:ring-[#071A3D] border border-white/10',
        destructive: 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-700 hover:to-red-700 shadow-xs focus-visible:ring-red-600',
        outline: 'border border-slate-300/90 bg-white/90 backdrop-blur-xs text-[#071A3D] hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-slate-400 shadow-2xs',
        secondary: 'bg-gradient-to-r from-[#1455D9] to-[#2563EB] text-white shadow-[0_4px_16px_rgba(20,85,217,0.3)] hover:shadow-[0_6px_22px_rgba(20,85,217,0.45)] hover:brightness-105 focus-visible:ring-royal',
        gold: 'bg-gradient-to-r from-[#F4C430] via-[#F6CE50] to-[#E5B520] text-[#071A3D] font-extrabold shadow-[0_4px_14px_rgba(244,196,48,0.35)] hover:brightness-105 focus-visible:ring-gold',
        ghost: 'bg-transparent text-[#071A3D] hover:bg-slate-100/80 focus-visible:ring-slate-300',
        link: 'bg-transparent text-[#1455D9] underline-offset-4 hover:underline focus-visible:ring-royal',
        cyan: 'bg-gradient-to-r from-[#22C7E8] to-[#0EA5E9] text-[#071A3D] font-bold shadow-xs hover:brightness-105 focus-visible:ring-cyan',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-8 text-base',
        xl: 'h-12 rounded-xl px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }