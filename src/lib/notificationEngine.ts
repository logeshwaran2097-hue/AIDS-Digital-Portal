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

export type NotificationSoundType = 'quantum' | 'bloom' | 'cyber' | 'marimba' | 'zen' | 'custom'

const SOUND_PREF_KEY = 'vsb_notif_sound_theme'
const CUSTOM_SOUND_URL_KEY = 'vsb_notif_custom_url'

export function getCustomSoundUrl(): string {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem(CUSTOM_SOUND_URL_KEY) || ''
  } catch {}
  return ''
}

export function setCustomSoundUrl(url: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CUSTOM_SOUND_URL_KEY, url)
  } catch {}
}

export function getSavedSoundTheme(): NotificationSoundType {
  if (typeof window === 'undefined') return 'quantum'
  try {
    const saved = localStorage.getItem(SOUND_PREF_KEY) as NotificationSoundType
    if (saved && ['quantum', 'bloom', 'cyber', 'marimba', 'zen', 'custom'].includes(saved)) {
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

// Shared AudioContext Singleton & User Interaction Unlock for Installed PWA / Apps
let sharedAudioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioContextClass) return null
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new AudioContextClass()
  }
  return sharedAudioContext
}

// Global user interaction listener to automatically unlock audio in installed app / PWA mode
if (typeof window !== 'undefined') {
  const unlockAudioOnGesture = () => {
    try {
      const ctx = getAudioContext()
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }
    } catch {}
  }
  window.addEventListener('pointerdown', unlockAudioOnGesture, { passive: true })
  window.addEventListener('click', unlockAudioOnGesture, { passive: true })
  window.addEventListener('keydown', unlockAudioOnGesture, { passive: true })
  window.addEventListener('touchstart', unlockAudioOnGesture, { passive: true })
}

/**
 * High-Fidelity Dual-Engine Notification Audio System
 * Uses HTML5 Audio with pre-rendered studio WAVs + Web Audio Synthesizer fallback
 * 100% audible in browsers, mobile phones, and installed standalone apps
 */
export function playNotificationChime(soundType?: NotificationSoundType) {
  try {
    if (typeof window === 'undefined') return
    const theme = soundType || getSavedSoundTheme()

    // ── 1. Primary Engine: High-Reliability HTML5 Audio ──
    // Works reliably in installed standalone apps, PWA windows, and mobile devices
    try {
      const soundFileUrl = theme === 'custom'
        ? (getCustomSoundUrl() || '/sounds/quantum.wav')
        : `/sounds/${theme}.wav`

      const audio = new Audio(soundFileUrl)
      audio.volume = 1.0
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.debug('HTML5 audio play blocked, falling back to Web Audio Synthesizer:', err)
          playWebAudioSynthesizer(theme)
        })
        return
      }
    } catch (e) {
      console.debug('HTML5 audio instantiation error, falling back:', e)
    }

    // ── 2. Secondary Engine: Web Audio Synthesizer ──
    playWebAudioSynthesizer(theme)
  } catch (err) {
    console.debug('Notification audio chime error:', err)
  }
}

function playWebAudioSynthesizer(theme: NotificationSoundType) {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const now = Math.max(ctx.currentTime, 0.05) + 0.02

    // Studio-grade Master Chain: Dynamics Compressor + Master Gain (Higher, audible volume)
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.setValueAtTime(-12, now)
    compressor.knee.setValueAtTime(24, now)
    compressor.ratio.setValueAtTime(4, now)
    compressor.attack.setValueAtTime(0.002, now)
    compressor.release.setValueAtTime(0.2, now)
    compressor.connect(ctx.destination)

    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0.85, now)
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
    const playSubBody = (freq: number = 95, duration: number = 0.16, gainLevel: number = 0.5) => {
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

      // Primary Glass/Crystal Fundamental
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(freq, startTime)
      osc1.frequency.exponentialRampToValueAtTime(freq * 1.008, startTime + 0.03)
      osc1.frequency.exponentialRampToValueAtTime(freq, startTime + duration)

      gain1.gain.setValueAtTime(0.0001, startTime)
      gain1.gain.linearRampToValueAtTime(gainLevel, startTime + 0.012)
      gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

      osc1.connect(gain1)
      gain1.connect(dest)
      osc1.start(startTime)
      osc1.stop(startTime + duration + 0.05)

      // Shimmer Overtone
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      const filter2 = ctx.createBiquadFilter()

      filter2.type = 'bandpass'
      filter2.frequency.setValueAtTime(freq * 2.76, startTime)
      filter2.Q.setValueAtTime(4.5, startTime)

      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(freq * 2.01, startTime)

      gain2.gain.setValueAtTime(0.0001, startTime)
      gain2.gain.linearRampToValueAtTime(gainLevel * 0.45 * brightness, startTime + 0.01)
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
        gain3.gain.linearRampToValueAtTime(gainLevel * 0.25 * brightness, startTime + 0.008)
        gain3.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.45)

        osc3.connect(gain3)
        gain3.connect(dest)
        osc3.start(startTime)
        osc3.stop(startTime + duration * 0.45 + 0.05)
      }
    }

    if (theme === 'quantum') {
      playSubBody(115, 0.18, 0.4)
      playCrystalVoice(659.25, now, 0.55, 0.6, -0.3, 1.0)
      playCrystalVoice(830.61, now + 0.06, 0.65, 0.65, 0.25, 1.1)
      playCrystalVoice(987.77, now + 0.12, 0.75, 0.7, -0.15, 1.2)
      playCrystalVoice(1318.51, now + 0.18, 0.95, 0.75, 0.35, 1.3)
      playCrystalVoice(1661.22, now + 0.23, 1.10, 0.5, 0.0, 1.4)
    } else if (theme === 'bloom') {
      playSubBody(90, 0.25, 0.45)
      playCrystalVoice(523.25, now, 0.65, 0.55, -0.2, 0.7)
      playCrystalVoice(659.25, now + 0.07, 0.75, 0.6, 0.1, 0.9)
      playCrystalVoice(783.99, now + 0.14, 0.85, 0.7, -0.1, 1.1)
      playCrystalVoice(1046.50, now + 0.21, 1.15, 0.75, 0.3, 1.3)
    } else if (theme === 'cyber') {
      playSubBody(140, 0.12, 0.5)
      playCrystalVoice(932.33, now, 0.25, 0.65, -0.3, 1.2)
      playCrystalVoice(1396.91, now + 0.09, 0.55, 0.75, 0.3, 1.5)
      playCrystalVoice(1864.66, now + 0.13, 0.7, 0.6, 0.0, 1.6)
    } else if (theme === 'marimba') {
      playSubBody(100, 0.15, 0.4)
      playCrystalVoice(587.33, now, 0.45, 0.65, -0.15, 0.5)
      playCrystalVoice(739.99, now + 0.05, 0.5, 0.65, 0.15, 0.6)
      playCrystalVoice(880.00, now + 0.10, 0.6, 0.7, -0.2, 0.7)
      playCrystalVoice(1174.66, now + 0.15, 0.8, 0.75, 0.2, 0.8)
    } else if (theme === 'zen') {
      playSubBody(80, 0.3, 0.35)
      playCrystalVoice(440.00, now, 0.85, 0.5, -0.1, 0.5)
      playCrystalVoice(659.25, now + 0.12, 1.05, 0.6, 0.1, 0.7)
      playCrystalVoice(880.00, now + 0.24, 1.3, 0.55, 0.0, 0.8)
    }
  } catch (err) {
    console.debug('Web audio synth error:', err)
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
export async function dispatchNativeNotification(payload: RealtimeNotificationPayload): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const origin = window.location.origin
  const title = payload.title || 'Digital Portal of AI&DS'
  const notifTag = payload.id ? `vsb-notif-${payload.id}` : `vsb-portal-${Date.now()}`
  const notifUrl = payload.link || '/dashboard/notifications'

  // Check if native notifications are supported and granted by the OS/browser
  const hasPermission = 'Notification' in window && Notification.permission === 'granted'

  if (hasPermission) {
    let shown = false

    // Engine 1: Dedicated Service Worker Controller PostMessage (100% reliable on Android PWA/WebAPK)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NATIVE_NOTIFICATION',
          title,
          options: {
            body: payload.message,
            icon: `${origin}/app-logo.png`,
            badge: `${origin}/notification-badge.png`,
            tag: notifTag,
            data: { url: notifUrl, id: payload.id },
          }
        })
        shown = true
      } catch (err) {
        console.debug('[Notification] Controller postMessage note:', err)
      }
    }

    // Engine 2: Direct Service Worker Registration showNotification
    if (!shown && 'serviceWorker' in navigator) {
      try {
        let reg = await navigator.serviceWorker.getRegistration()
        if (!reg) {
          reg = await Promise.race([
            navigator.serviceWorker.ready,
            new Promise<any>((_, reject) => setTimeout(() => reject('timeout'), 2000))
          ])
        }

        if (reg && reg.showNotification) {
          await reg.showNotification(title, {
            body: payload.message,
            icon: origin ? `${origin}/app-logo.png` : '/app-logo.png',
            badge: origin ? `${origin}/notification-badge.png` : '/notification-badge.png',
            timestamp: Date.now(),
            data: { url: notifUrl, id: payload.id },
            tag: notifTag,
            renotify: true,
          } as any)
          shown = true
        }
      } catch (err) {
        console.debug('[Notification] ServiceWorker registration showNotification note:', err)
      }
    }

    // Engine 3: Desktop browser Notification constructor fallback
    if (!shown) {
      try {
        const notif = new Notification(title, {
          body: payload.message,
          icon: origin ? `${origin}/app-logo.png` : '/app-logo.png',
          tag: notifTag,
          data: { url: notifUrl, id: payload.id },
        })

        notif.onclick = () => {
          window.focus()
          if (payload.link) {
            window.location.href = payload.link
          }
          notif.close()
        }
        shown = true
      } catch {
        // Notification constructor blocked on mobile Android Chrome
      }
    }

    if (shown) {
      playNotificationChime()
      triggerDeviceVibration([150, 80, 150])
      return true
    }
  }

  // System notification could not be shown natively (permission not granted or blocked)
  return false
}

// Interactive helper to trigger a real Android / Desktop system app notification
export async function testSystemAppNotification(): Promise<{ success: boolean; permission: NotificationPermission }> {
  if (typeof window === 'undefined') return { success: false, permission: 'denied' }

  let perm = getNotificationPermissionStatus()
  if (perm !== 'granted') {
    perm = await requestNotificationPermission()
  }

  if (perm === 'granted') {
    const success = await dispatchNativeNotification({
      id: `test-${Date.now()}`,
      title: 'Digital Portal of AI&DS',
      message: '🔔 Real App Notification Verified! Alerts are active in your phone status bar.',
      createdByName: 'V.S.B. System Admin',
      link: '/dashboard/notifications',
    })
    return { success, permission: perm }
  }

  return { success: false, permission: perm }
}

/**
 * Convert base64 url-safe string to Uint8Array for PushManager applicationServerKey
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Check if the current browser/device is subscribed to Web Push notifications
 */
export async function isPushSubscribed(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false
  }

  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    return !!sub
  } catch {
    return false
  }
}

/**
 * Get active push subscription object if available
 */
export async function getActivePushSubscription(): Promise<PushSubscription | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null
  }

  try {
    const reg = await navigator.serviceWorker.ready
    return await reg.pushManager.getSubscription()
  } catch {
    return null
  }
}

export const DEFAULT_VAPID_PUBLIC_KEY =
  'BNlsPMJCfW8xkIZijGtcDx-QOUQmri1eRmfxOiKV3d2VZz_29dWXsPtN5YNEAiwkBDDfFAxtdEe1XsWYwHrn_V4'

/**
 * Subscribe device to real mobile push notifications with VAPID key
 */
export async function subscribeUserToPush(
  role: string = 'student',
  regNo?: string
): Promise<{ success: boolean; message: string; permission: NotificationPermission }> {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Window not available', permission: 'denied' }
  }

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return {
      success: false,
      message: 'Push notifications are not supported in this browser.',
      permission: 'denied',
    }
  }

  const permission = await requestNotificationPermission()
  if (permission !== 'granted') {
    return {
      success: false,
      message: 'Notification permission was denied or dismissed.',
      permission,
    }
  }

  try {
    let vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY
    if (!vapidPublicKey) {
      try {
        // Fetch public key dynamically from API
        const res = await fetch('/api/push/subscribe')
        const data = await res.json()
        if (data.publicKey) {
          vapidPublicKey = data.publicKey
        }
      } catch {}
    }

    if (!vapidPublicKey) {
      vapidPublicKey = DEFAULT_VAPID_PUBLIC_KEY
    }

    const reg = await navigator.serviceWorker.ready
    let subscription = await reg.pushManager.getSubscription()

    if (!subscription) {
      const convertedKey = urlBase64ToUint8Array(vapidPublicKey)
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as unknown as BufferSource,
      })
    }

    const subJson = subscription.toJSON()

    // Send subscription to server
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: subJson.keys,
        role,
        regNo,
      }),
    })

    const result = await response.json()

    if (response.ok && result.success) {
      playNotificationChime()
      triggerDeviceVibration([150, 80, 150])
      return {
        success: true,
        message: 'Real mobile push notifications connected successfully!',
        permission,
      }
    } else {
      return {
        success: false,
        message: result.message || 'Server rejected push subscription.',
        permission,
      }
    }
  } catch (error: any) {
    console.error('Subscription error:', error)
    return {
      success: false,
      message: error?.message || 'Failed to subscribe to push notifications.',
      permission,
    }
  }
}

/**
 * Trigger an instant or delayed test push notification to verify lock screen / tray behavior
 */
export async function sendTestMobilePush(delaySeconds: number = 0): Promise<{ success: boolean; message: string }> {
  try {
    const sub = await getActivePushSubscription()
    const res = await fetch('/api/push/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: sub?.endpoint,
        delaySeconds,
        title: '🔔 Digital Portal of AI&DS',
        message: 'Official Alert: Real mobile push notifications are fully active on your phone!',
      }),
    })
    const data = await res.json()
    return { success: data.success, message: data.message }
  } catch (e: any) {
    return { success: false, message: e?.message || 'Failed to trigger test push' }
  }
}
