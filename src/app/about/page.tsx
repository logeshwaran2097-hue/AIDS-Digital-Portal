import type { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AboutPortalView } from '@/components/about/AboutPortalView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About Department & Portal | Department of AI & DS | V.S.B. Engineering College',
  description:
    'Institutional digital academic governance portal of the Department of Artificial Intelligence & Data Science at V.S.B. Engineering College (Autonomous), Karur. Accreditation, curriculum, and system architecture.',
}

export default async function PublicAboutPage() {
  const session = await getSession()

  if (session && session.role) {
    return (
      <PortalLayout role={session.role as any} userName={session.name || 'User'}>
        <AboutPortalView role={session.role as any} />
      </PortalLayout>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <AboutPortalView role="public" />
      </div>
    </div>
  )
}
