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

// Play unique, signature crystal AI harmonic chime using Web Audio API
export function playNotificationChime(soundType: 'crystal' | 'modern' | 'soft' = 'crystal') {
  try {
    if (typeof window === 'undefined') return
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const now = ctx.currentTime

    // Master Volume Gain & Dynamics Compressor for studio-grade warmth
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.setValueAtTime(-24, now)
    compressor.knee.setValueAtTime(30, now)
    compressor.ratio.setValueAtTime(12, now)
    compressor.attack.setValueAtTime(0.003, now)
    compressor.release.setValueAtTime(0.25, now)
    compressor.connect(ctx.destination)

    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0.35, now)
    masterGain.connect(compressor)

    // Helper: Play a crystal acoustic note with harmonics and smooth envelope
    const playHarmonicNote = (freq: number, startTime: number, duration: number, gainLevel: number) => {
      // Fundamental Sine
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, startTime)

      // Pitch glide for extra modern character
      osc.frequency.exponentialRampToValueAtTime(freq * 1.005, startTime + 0.05)
      osc.frequency.exponentialRampToValueAtTime(freq, startTime + duration)

      gain.gain.setValueAtTime(0.0001, startTime)
      gain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

      osc.connect(gain)
      gain.connect(masterGain)
      osc.start(startTime)
      osc.stop(startTime + duration + 0.05)

      // 2nd Harmonic Overtone (shimmer)
      const overtone = ctx.createOscillator()
      const overtoneGain = ctx.createGain()
      overtone.type = 'triangle'
      overtone.frequency.setValueAtTime(freq * 2.02, startTime)

      overtoneGain.gain.setValueAtTime(0.0001, startTime)
      overtoneGain.gain.linearRampToValueAtTime(gainLevel * 0.28, startTime + 0.015)
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.6)

      overtone.connect(overtoneGain)
      overtoneGain.connect(masterGain)
      overtone.start(startTime)
      overtone.stop(startTime + duration * 0.6 + 0.05)
    }

    // 🎵 Unique Signature VSB Polyphonic Chime:
    // Tone 1: Warm Foundation Chord (Eb5 ~ 622Hz)
    playHarmonicNote(622.25, now, 0.45, 0.4)
    // Tone 2: Harmonic Rise (Ab5 ~ 830.6Hz)
    playHarmonicNote(830.61, now + 0.08, 0.55, 0.5)
    // Tone 3: Bright Spark (C6 ~ 1046.5Hz)
    playHarmonicNote(1046.50, now + 0.16, 0.75, 0.6)
    // Tone 4: Signature Crystal Sparkle (Eb6 ~ 1244.5Hz)
    playHarmonicNote(1244.51, now + 0.24, 0.95, 0.45)
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
