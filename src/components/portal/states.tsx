'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { RefreshCcw } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-[#071A3D] tracking-tight">{title}</h1>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number | string
  icon?: React.ReactNode
  trend?: string
  trendType?: 'up' | 'down' | 'neutral'
  accent?: 'navy' | 'royal' | 'gold' | 'cyan'
}

const accentBg = {
  navy: 'bg-[#071A3D]',
  royal: 'bg-[#1455D9]',
  gold: 'bg-[#F4C430]',
  cyan: 'bg-[#22C7E8]',
}

const accentText = {
  navy: 'text-[#071A3D]',
  royal: 'text-[#1455D9]',
  gold: 'text-[#B8860B]',
  cyan: 'text-[#0E7490]',
}

export function StatCard({ label, value, icon, hint, hintType = 'neutral', accent = 'royal' }: StatCardProps & { hint?: string; hintType?: 'up' | 'down' | 'neutral' }) {
  return (
    <Card className="hover:shadow-md">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium">{label}</span>
          {icon && <span className={cn('h-8 w-8 rounded-lg', accentBg[accent], 'text-white flex items-center justify-center')}>{icon}</span>}
        </div>
        <p className="text-3xl font-bold text-[#071A3D]">{value}</p>
        {hint && (
          <p className={cn('text-xs font-medium', hintType === 'up' ? 'text-green-600' : hintType === 'down' ? 'text-red-600' : accentText[accent])}>
            {hint}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#1455D9]" aria-hidden="true" />
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  )
}

function Loader2({ className, ...p }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M12 2v4M12 10v4M12 18v-4M12 6l-2-2 4 4" />
    </svg>
  )
}

export function Loader({ className }: { className?: string }) {
  return (
    <svg className={cn('h-5 w-5 animate-spin text-[#1455D9]', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 12a8 8 0 018-8V0C5.373 0 .961 3.193 0 12h4zm2 5.291A7.962 30.5 7.5z" />
    </svg>
  )
}

export function EmptyState({
  title = 'Nothing here',
  description = 'No items are available right now.',
  icon,
  action,
}: {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl text-gray-400" aria-hidden="true">
          {icon || '📭'}
        </div>
        <p className="font-semibold text-[#071A3D]">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
        {action}
      </CardContent>
    </Card>
  )
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again.',
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center text-2xl" aria-hidden="true">
          ⚠️
        </div>
        <p className="font-semibold text-[#071A3D]">{title}</p>
        <p className="text-sm text-gray-500">{message}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function LoadingCard({ lines = 4 }: { lines?: number }) {
  return (
    <Card>
      <CardContent className="space-y-3 py-6">
        <Skeleton className="h-4 w-1/3" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}

export function SuccessState({ title = 'Success!', message }: { title?: string; message?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center text-2xl" aria-hidden="true">
          ✅
        </div>
        <p className="font-semibold text-[#071A3D]">{title}</p>
        {message && <p className="text-sm text-gray-500">{message}</p>}
      </CardContent>
    </Card>
  )
}