'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  BookOpen, FileQuestion, FolderOpen, Users, CalendarDays,
  Database, Trophy, Bot, Bell, Megaphone, ArrowRight, Clock, MapPin,
  GraduationCap, Award, FileText, Download, Search, Filter, ChevronLeft, ChevronRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'

interface ItemWithMeta {
  id: string
  title: string
  subtitle?: string
  description?: string
  date?: Date | string
  time?: string
  venue?: string
  category?: string
  status?: string
  type?: string
  icon?: string
  actions?: { label: string; href?: string; onClick?: () => void; variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'gold' | 'destructive' | 'cyan' }[]
}

interface ListViewProps {
  title: string
  description?: string
  items: ItemWithMeta[]
  loading?: boolean
  error?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
  filters?: { label: string; key: string; options: { value: string; label: string }[] }[]
  searchPlaceholder?: string
  searchKeys?: string[]
  onSearch?: (q: string) => void
  onFilter?: (key: string, value: string) => void
  headerAction?: React.ReactNode
  compact?: boolean
  viewMode?: 'grid' | 'list'
  defaultFilter?: string
}

const categoryColors: Record<string, string> = {
  workshop: 'bg-yellow-100 text-yellow-800',
  seminar: 'bg-blue-100 text-blue-800',
  hackathon: 'bg-purple-100 text-purple-800',
  symposium: 'bg-indigo-100 text-indigo-800',
  competition: 'bg-orange-100 text-orange-800',
  guest_lecture: 'bg-cyan-100 text-cyan-800',
  department_activity: 'bg-green-100 text-green-800',
  academic: 'bg-blue-100 text-blue-800',
  examination: 'bg-red-100 text-red-800',
  placement: 'bg-green-100 text-green-800',
  project: 'bg-purple-100 text-purple-800',
  general: 'bg-gray-100 text-gray-800',
}

export function ListView({
  title, description, items, loading, error, emptyTitle = 'No items available',
  emptyDescription, emptyIcon, filters, searchPlaceholder, searchKeys, onSearch,
  onFilter, headerAction, compact, viewMode = 'list', defaultFilter = ''
}: ListViewProps) {
  const [query, setQuery] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  const filtered = items.filter((item) => {
    if (searchKeys && query) {
      const haystack = [item.title, item.subtitle, item.description, item.category, item.type].filter(Boolean).join(' ').toLowerCase()
      if (!haystack.includes(query.toLowerCase())) return false
    }
    if (defaultFilter) {
      const v = (item.category || item.type || 'all').toLowerCase()
      const f = defaultFilter.toLowerCase()
      if (v !== f && f !== 'all') return false
    }
    for (const [key, value] of Object.entries(filterValues)) {
      if (!value || value === 'all') continue
      const entry = String((item as unknown as Record<string, string>)[key] || 'all').toLowerCase()
      if (entry !== value.toLowerCase()) return false
    }
    return true
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center text-2xl" aria-hidden="true">⚠️</div>
          <p className="font-semibold text-[#071A3D]">Something went wrong</p>
          <p className="text-sm text-gray-500">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#071A3D] tracking-tight">{title}</h1>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
        {headerAction}
      </div>

      {(searchPlaceholder || filters) && (
        <div className="flex flex-col md:flex-row gap-3">
          {searchPlaceholder && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-9"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  onSearch?.(e.target.value)
                }}
                aria-label={searchPlaceholder}
              />
            </div>
          )}
          {filters && (
            <div className="flex gap-2 flex-wrap">
              {filters.map((f) => (
                <div key={f.key} className="min-w-[160px]">
                  <select
                    aria-label={f.label}
                    value={filterValues[f.key] || 'all'}
                    onChange={(e) => {
                      setFilterValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                      onFilter?.(f.key, e.target.value)
                    }}
                    className="flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#071A3D] focus:outline-none focus:ring-2 focus:ring-[#1455D9] focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">{f.label}: All</option>
                    {f.options.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl text-gray-400" aria-hidden="true">
              {emptyIcon || '📌'}
            </div>
            <p className="font-semibold text-[#071A3D]">{emptyTitle}</p>
            <p className="text-sm text-gray-500">{emptyDescription || 'Try adjusting your filters or search.'}</p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5 space-y-3">
                {item.type && <Badge className="capitalize shrink-0" variant="secondary">{item.type.replace(/_/g, ' ')}</Badge>}
                <h3 className="font-semibold text-[#071A3D] leading-snug">{item.title}</h3>
                {item.subtitle && <p className="text-sm text-gray-500">{item.subtitle}</p>}
                {item.description && <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>}
                {(item.date || item.venue) && (
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {item.date && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDate(String(item.date))}{item.time ? ` · ${item.time}` : ''}</span>}
                    {item.venue && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {item.venue}</span>}
                  </div>
                )}
                {item.actions && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {item.actions.map((a, i) =>
                      a.href ? (
                        <Button key={i} variant={a.variant || 'default'} size="sm" asChild>
                          <Link href={a.href}>{a.label}</Link>
                        </Button>
                      ) : (
                        <Button key={i} variant={a.variant || 'default'} size="sm" onClick={a.onClick}>{a.label}</Button>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y divide-gray-100">
            {filtered.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                {item.type && <Badge className="shrink-0 capitalize" variant="secondary">{item.type.replace(/_/g, ' ')}</Badge>}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[#071A3D] truncate">{item.title}</p>
                  {item.subtitle && <p className="text-sm text-gray-500 truncate">{item.subtitle}</p>}
                  {item.description && <p className="text-sm text-gray-600 line-clamp-1">{item.description}</p>}
                </div>
                {item.date && <p className="text-xs text-gray-400 whitespace-nowrap">{formatDate(String(item.date))}</p>}
                {item.actions && (
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {item.actions.map((a, i) =>
                      a.href ? (
                        <Button key={i} variant={a.variant || 'outline'} size="sm" asChild>
                          <Link href={a.href}>{a.label}</Link>
                        </Button>
                      ) : (
                        <Button key={i} variant={a.variant || 'outline'} size="sm" onClick={a.onClick}>{a.label}</Button>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { categoryColors }
export type { ListViewProps, ItemWithMeta }