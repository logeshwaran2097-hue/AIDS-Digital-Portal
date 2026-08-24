'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { getStatusColor, getRoleColor } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'status' | 'role'
  status?: string
  role?: string
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', status, role, children, ...props }, ref) => {
    let variantClass = ''
    
    if (variant === 'status' && status) {
      variantClass = getStatusColor(status)
    } else if (variant === 'role' && role) {
      variantClass = getRoleColor(role)
    } else {
      const variants: Record<string, string> = {
        default: 'bg-navy text-white',
        secondary: 'bg-royal text-white',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
      }
      variantClass = variants[variant] || variants.default
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          variantClass,
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)
Badge.displayName = 'Badge'

export { Badge }