'use client'

/**
 * Enterprise Real-Time Notification & Mobile Push Engine
 * Provides Web Audio synth chime, Vibration API, Web Push & Browser Notifications
 */

export interface RealtimeNotificationPayload {
  id: string
  title: string
  message: string
  target?: string
  createdByName?: string | null
  type?: 'info' | 'success' | 'warning' | 'alert' | 'approval'
  link?: string
  createdAt?: string | Date
}

// Play pleasant notification audio chime using Web Audio API (no external asset required)
export function playNotificationChime() {
  try {
    if (typeof window === 'undefined') return
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const now = ctx.currentTime

    // First tone (E5 ~ 659.25Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(659.25, now)
    gain1.gain.setValueAtTime(0, now)
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.04)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.35)

    // Second chime tone (A5 ~ 880Hz)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(880, now + 0.12)
    gain2.gain.setValueAtTime(0, now + 0.12)
    gain2.gain.linearRampToValueAtTime(0.22, now + 0.16)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.12)
    osc2.stop(now + 0.6)
  } catch (err) {
    console.debug('Notification audio chime error:', err)
  }
}

// Trigger mobile device vibration
export function triggerDeviceVibration(pattern: number[] = [150, 80, 150]) {
  try {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  } catch {}
}

// Request Browser & Mobile notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied'
  }

  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch {
    return Notification.permission
  }
}

// Check current notification permission
export function getNotificationPermissionStatus(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied'
  }
  return Notification.permission
}

// Dispatch native system / mobile push notification
export async function dispatchNativeNotification(payload: RealtimeNotificationPayload) {
  if (typeof window === 'undefined') return

  // Play sound & vibrate
  playNotificationChime()
  triggerDeviceVibration([200, 100, 200])

  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return
  }

  const title = payload.title || 'V.S.B. AI & DS Notification'
  const options: NotificationOptions = {
    body: payload.message,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: payload.link || '/dashboard/notifications', id: payload.id },
    tag: `vsb-notif-${payload.id || Date.now()}`,
  }

  // Try service worker notification first (best for mobile and background tabs)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      if (registration && registration.showNotification) {
        await registration.showNotification(title, options)
        return
      }
    } catch {}
  }

  // Fallback to standard Notification API
  try {
    const notif = new Notification(title, options)
    notif.onclick = () => {
      window.focus()
      if (payload.link) {
        window.location.href = payload.link
      }
      notif.close()
    }
  } catch {}
}
