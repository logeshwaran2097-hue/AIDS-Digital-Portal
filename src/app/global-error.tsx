'use client'

import React, { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GLOBAL_ERROR_BOUNDARY]', error?.message || 'Critical application error')
  }, [error])

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans p-4">
        <div className="max-w-md w-full text-center p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
          <h2 className="text-2xl font-bold mb-2">Application Error</h2>
          <p className="text-sm text-slate-400 mb-6">
            A critical system error occurred. Please refresh or try again shortly.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  )
}
