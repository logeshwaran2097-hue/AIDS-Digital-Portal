import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODSettingsView } from './components/HODSettingsView'
import { prisma } from '@/lib/prisma'
import { DEFAULT_HOD_SETTINGS } from '@/app/api/hod/settings/route'

export const dynamic = 'force-dynamic'

export default async function HODSettingsPage() {
  const session = await requireRoleSession(['hod'])

  // Fetch initial settings from DB
  let initialSettings = { ...DEFAULT_HOD_SETTINGS }
  try {
    const saved = await prisma.systemSettings.findUnique({
      where: { key: 'hod_department_settings' },
    })
    if (saved?.value) {
      initialSettings = { ...initialSettings, ...JSON.parse(saved.value) }
    }
  } catch (error) {
    console.error('Error loading initial HOD department settings:', error)
  }

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="py-2 animate-fade-in">
        <HODSettingsView initialSettings={initialSettings} />
      </div>
    </PortalLayout>
  )
}
