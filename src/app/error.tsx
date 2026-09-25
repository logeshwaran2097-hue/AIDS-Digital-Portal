'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [dashboardUrl, setDashboardUrl] = React.useState('/dashboard')
  const [showDetails, setShowDetails] = React.useState(false)

  useEffect(() => {
    // Log sanitized error info
    console.error('[CLIENT_ERROR_BOUNDARY]', error?.message || 'Unknown runtime error', error)
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('portal_login_role') || ''
      const path = window.location.pathname
      if (role === 'admin' || path.includes('/admin')) {
        setDashboardUrl('/admin/dashboard')
      } else if (role === 'hod' || path.includes('/hod')) {
        setDashboardUrl('/hod-dashboard')
      } else if (role === 'faculty' || path.includes('/faculty')) {
        setDashboardUrl('/faculty-dashboard')
      } else {
        setDashboardUrl('/dashboard')
      }
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          An unexpected error occurred while loading this page. Our technical team has been notified.
        </p>

        {error?.message && (
          <div className="mb-6 text-left">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline mb-2 cursor-pointer"
            >
              {showDetails ? 'Hide Technical Details' : 'Show Technical Details'}
            </button>
            {showDetails && (
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-mono break-all max-h-40 overflow-y-auto">
                <p className="font-bold text-red-600 dark:text-red-400">{error.message}</p>
                {error.digest && <p className="text-slate-500 mt-1">Digest: {error.digest}</p>}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href={dashboardUrl}
            className="px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium text-sm transition-colors inline-block"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
