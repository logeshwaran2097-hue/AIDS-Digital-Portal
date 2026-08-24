import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await requireRoleSession(['admin'])
  redirect('/admin/dashboard')
}
