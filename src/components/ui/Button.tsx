'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer select-none',
  {
    variants: {
      variant: {
        default: 'bg-[#071A3D] text-white shadow-xs hover:bg-[#0B2559] focus-visible:ring-[#071A3D]',
        destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs focus-visible:ring-rose-600',
        outline: 'border border-slate-300 bg-white text-[#071A3D] hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-slate-400 shadow-2xs',
        secondary: 'bg-[#1455D9] text-white shadow-xs hover:bg-[#1E60E6] focus-visible:ring-blue-600',
        gold: 'bg-[#F4C430] text-[#071A3D] font-extrabold shadow-xs hover:bg-[#E5B520] focus-visible:ring-amber-400',
        ghost: 'bg-transparent text-[#071A3D] hover:bg-slate-100 focus-visible:ring-slate-300',
        link: 'bg-transparent text-[#1455D9] underline-offset-4 hover:underline focus-visible:ring-blue-600 p-0 h-auto font-semibold',
        cyan: 'bg-[#06B6D4] text-[#071A3D] font-bold shadow-xs hover:bg-[#0891B2] focus-visible:ring-cyan-500',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-xl px-7 text-sm sm:text-base',
        xl: 'h-12 rounded-xl px-9 text-base sm:text-lg',
        icon: 'h-10 w-10 rounded-xl',
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