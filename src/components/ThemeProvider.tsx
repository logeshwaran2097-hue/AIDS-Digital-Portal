'use client'

import React, { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('vsb-portal-theme') || 'system'
      if (savedTheme === 'midnight') {
        document.documentElement.classList.add('midnight')
      } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('midnight')
      } else {
        // System preference check
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          document.documentElement.classList.add('midnight')
        } else {
          document.documentElement.classList.remove('midnight')
        }
      }
    } catch (e) {
      console.error('Theme initialization error:', e)
    }
  }, [])

  return <>{children}</>
}
