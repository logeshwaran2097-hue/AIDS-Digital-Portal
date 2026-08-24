'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/portal/states'
import { formatDate } from '@/lib/utils'
import { FolderOpen, MapPin, Clock, Users } from 'lucide-react'

interface Item {
  id: string
  title: string
  subtitle?: string
  description?: string
  date?: Date
  type?: string
  viewOnly?: boolean
}

export default function Viewer({
  title, description, emptyTitle, emptyDescription, items,
}: {
  title: string
  description?: string
  emptyTitle: string
  emptyDescription?: string
  items: Item[]
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#071A3D] tracking-tight">{title}</h1>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      {items.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} icon="📁" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-5 space-y-3">
                {item.type && <Badge className="bg-[#1455D9] text-white capitalize">{item.type}</Badge>}
                <h3 className="font-semibold text-[#071A3D] leading-snug">{item.title}</h3>
                {item.subtitle && <p className="text-sm text-gray-500">{item.subtitle}</p>}
                {item.description && <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>}
                {item.date && <p className="text-xs text-gray-400">{formatDate(item.date)}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}