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

export type NotificationSoundType = 'quantum' | 'bloom' | 'cyber' | 'marimba' | 'zen'

const SOUND_PREF_KEY = 'vsb_notif_sound_theme'

export function getSavedSoundTheme(): NotificationSoundType {
  if (typeof window === 'undefined') return 'quantum'
  try {
    const saved = localStorage.getItem(SOUND_PREF_KEY) as NotificationSoundType
    if (saved && ['quantum', 'bloom', 'cyber', 'marimba', 'zen'].includes(saved)) {
      return saved
    }
  } catch {}
  return 'quantum'
}

export function setSavedSoundTheme(theme: NotificationSoundType) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SOUND_PREF_KEY, theme)
  } catch {}
}

/**
 * High-Fidelity Acoustic & Harmonic Web Audio Synthesizer
 * Produces signature, unmistakable, bespoke audio notifications
 */
export function playNotificationChime(soundType?: NotificationSoundType) {
  try {
    if (typeof window === 'undefined') return
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const theme = soundType || getSavedSoundTheme()
    const now = ctx.currentTime

    // Studio-grade Master Chain: Dynamics Compressor + High-Shelf / Low-Cut EQ
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.setValueAtTime(-20, now)
    compressor.knee.setValueAtTime(24, now)
    compressor.ratio.setValueAtTime(8, now)
    compressor.attack.setValueAtTime(0.002, now)
    compressor.release.setValueAtTime(0.2, now)
    compressor.connect(ctx.destination)

    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0.45, now)
    masterGain.connect(compressor)

    // Spatial Panner Helper
    const createPanner = (panValue: number) => {
      if (ctx.createStereoPanner) {
        const panner = ctx.createStereoPanner()
        panner.pan.setValueAtTime(Math.max(-1, Math.min(1, panValue)), now)
        panner.connect(masterGain)
        return panner
      }
      return masterGain
    }

    // Sub-Bass Body Generator (tactile acoustic punch)
    const playSubBody = (freq: number = 95, duration: number = 0.16, gainLevel: number = 0.3) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(160, now)

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)
      osc.frequency.exponentialRampToValueAtTime(45, now + duration)

      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(gainLevel, now + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(masterGain)

      osc.start(now)
      osc.stop(now + duration + 0.05)
    }

    // Rich Crystalline Harmonic Voice
    const playCrystalVoice = (
      freq: number,
      startTime: number,
      duration: number,
      gainLevel: number,
      pan: number = 0,
      brightness: number = 1.0
    ) => {
      const dest = createPanner(pan)

      // Primary Glass/Crystal Fundamental (Sine with soft attack)
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(freq, startTime)
      // Micro pitch-bend for organic humanized feel
      osc1.frequency.exponentialRampToValueAtTime(freq * 1.008, startTime + 0.03)
      osc1.frequency.exponentialRampToValueAtTime(freq, startTime + duration)

      gain1.gain.setValueAtTime(0.0001, startTime)
      gain1.gain.linearRampToValueAtTime(gainLevel, startTime + 0.012)
      gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

      osc1.connect(gain1)
      gain1.connect(dest)
      osc1.start(startTime)
      osc1.stop(startTime + duration + 0.05)

      // Shimmer Overtone (Triangle harmonic)
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      const filter2 = ctx.createBiquadFilter()

      filter2.type = 'bandpass'
      filter2.frequency.setValueAtTime(freq * 2.76, startTime)
      filter2.Q.setValueAtTime(4.5, startTime)

      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(freq * 2.01, startTime)

      gain2.gain.setValueAtTime(0.0001, startTime)
      gain2.gain.linearRampToValueAtTime(gainLevel * 0.35 * brightness, startTime + 0.01)
      gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.7)

      osc2.connect(filter2)
      filter2.connect(gain2)
      gain2.connect(dest)
      osc2.start(startTime)
      osc2.stop(startTime + duration * 0.7 + 0.05)

      // Sparkling High-Register Bell Harmonic
      if (brightness > 0.6) {
        const osc3 = ctx.createOscillator()
        const gain3 = ctx.createGain()
        osc3.type = 'sine'
        osc3.frequency.setValueAtTime(freq * 4.04, startTime)

        gain3.gain.setValueAtTime(0.0001, startTime)
        gain3.gain.linearRampToValueAtTime(gainLevel * 0.15 * brightness, startTime + 0.008)
        gain3.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.45)

        osc3.connect(gain3)
        gain3.connect(dest)
        osc3.start(startTime)
        osc3.stop(startTime + duration * 0.45 + 0.05)
      }
    }

    if (theme === 'quantum') {
      // 🌟 SIGNATURE UNIQUE "Quantum Prism" - Spatial Holographic Chime
      playSubBody(115, 0.18, 0.28)
      // Spatial Pentatonic Chord Cascade with Glass Sparkle
      playCrystalVoice(659.25, now, 0.55, 0.45, -0.3, 1.0)       // E5
      playCrystalVoice(830.61, now + 0.06, 0.65, 0.50, 0.25, 1.1)  // G#5
      playCrystalVoice(987.77, now + 0.12, 0.75, 0.55, -0.15, 1.2) // B5
      playCrystalVoice(1318.51, now + 0.18, 0.95, 0.60, 0.35, 1.3) // E6 (Climax Sparkle)
      playCrystalVoice(1661.22, now + 0.23, 1.10, 0.40, 0.0, 1.4)  // G#6 (Ethereal Tail)

      // Ambient Echo Refraction
      setTimeout(() => {
        try {
          if (ctx.state !== 'closed') {
            playCrystalVoice(1318.51, ctx.currentTime, 0.4, 0.15, -0.2, 0.8)
            playCrystalVoice(1661.22, ctx.currentTime + 0.05, 0.5, 0.12, 0.2, 0.9)
          }
        } catch {}
      }, 260)
    } else if (theme === 'bloom') {
      // 🌸 "Neural Bloom" - Warm Futuristic Harmonic Swell
      playSubBody(90, 0.25, 0.35)
      playCrystalVoice(523.25, now, 0.65, 0.4, -0.2, 0.7)        // C5
      playCrystalVoice(659.25, now + 0.07, 0.75, 0.48, 0.1, 0.9)  // E5
      playCrystalVoice(783.99, now + 0.14, 0.85, 0.55, -0.1, 1.1) // G5
      playCrystalVoice(1046.50, now + 0.21, 1.15, 0.6, 0.3, 1.3)  // C6
    } else if (theme === 'cyber') {
      // ⚡ "Cyber Pulse" - Sleek Tech Double-Pulse
      playSubBody(140, 0.12, 0.4)
      playCrystalVoice(932.33, now, 0.25, 0.55, -0.3, 1.2)        // Bb5
      playCrystalVoice(1396.91, now + 0.09, 0.55, 0.65, 0.3, 1.5) // F6
      playCrystalVoice(1864.66, now + 0.13, 0.7, 0.45, 0.0, 1.6)  // Bb6
    } else if (theme === 'marimba') {
      // 🪵 "Glass Marimba" - Organic Warmth & Wooden Crystal Resonance
      playSubBody(100, 0.15, 0.3)
      playCrystalVoice(587.33, now, 0.45, 0.55, -0.15, 0.5)       // D5
      playCrystalVoice(739.99, now + 0.05, 0.5, 0.52, 0.15, 0.6)  // F#5
      playCrystalVoice(880.00, now + 0.10, 0.6, 0.58, -0.2, 0.7)  // A5
      playCrystalVoice(1174.66, now + 0.15, 0.8, 0.6, 0.2, 0.8)   // D6
    } else if (theme === 'zen') {
      // 🌊 "Zen Ripple" - Peaceful Harmonic Water Droplet
      playSubBody(80, 0.3, 0.2)
      playCrystalVoice(440.00, now, 0.85, 0.35, -0.1, 0.5)        // A4
      playCrystalVoice(659.25, now + 0.12, 1.05, 0.45, 0.1, 0.7)  // E5
      playCrystalVoice(880.00, now + 0.24, 1.3, 0.4, 0.0, 0.8)    // A5
    }
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
