'use client'

import React, { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const applySettings = () => {
    try {
      const cachedConfig = localStorage.getItem('vsb-portal-config')
      let theme = localStorage.getItem('vsb-portal-theme') || 'light'
      let accent = '#1455D9'

      if (cachedConfig) {
        try {
          const parsed = JSON.parse(cachedConfig)
          if (parsed.theme) theme = parsed.theme
          if (parsed.accentColor) accent = parsed.accentColor
        } catch {}
      }

      // Apply Theme Mode
      if (theme === 'dark' || theme === 'midnight') {
        document.documentElement.classList.add('midnight', 'dark')
      } else {
        document.documentElement.classList.remove('midnight', 'dark')
      }

      // Apply Accent Color
      if (accent) {
        document.documentElement.style.setProperty('--primary-accent', accent)
        document.documentElement.style.setProperty('--royal', accent)
        document.documentElement.style.setProperty('--bright', accent)
        document.documentElement.style.setProperty('--primary-accent-light', `${accent}25`)
      }
    } catch (e) {
      console.error('Theme initialization error:', e)
    }
  }

  useEffect(() => {
    applySettings()

    // Listen for real-time live events from Settings page
    const handleUpdate = () => {
      applySettings()
    }

    window.addEventListener('portal-config-updated', handleUpdate)
    window.addEventListener('portal-theme-changed', handleUpdate)

    return () => {
      window.removeEventListener('portal-config-updated', handleUpdate)
      window.removeEventListener('portal-theme-changed', handleUpdate)
    }
  }, [])

  return <>{children}</>
}
