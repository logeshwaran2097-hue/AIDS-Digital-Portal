'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Zap, Volume2, Sparkles, Smartphone, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  playNotificationChime,
  triggerDeviceVibration,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  dispatchNativeNotification,
  getSavedSoundTheme,
  setSavedSoundTheme,
  getCustomSoundUrl,
  setCustomSoundUrl,
  NotificationSoundType,
} from '@/lib/notificationEngine'

const SOUND_OPTIONS: { id: NotificationSoundType; name: string; desc: string; icon: string; badge?: string }[] = [
  { id: 'quantum', name: 'Quantum Prism', desc: 'Signature crystal holographic chime with sub-bass depth', icon: '✨', badge: 'Default' },
  { id: 'bloom', name: 'Neural Bloom', desc: 'Futuristic warm harmonic ascending swell', icon: '🌸' },
  { id: 'cyber', name: 'Cyber Pulse', desc: 'Sleek ultra-clean high-tech laser accent', icon: '⚡' },
  { id: 'marimba', name: 'Glass Marimba', desc: 'Organic acoustic wooden-crystal chime', icon: '🪵' },
  { id: 'zen', name: 'Zen Ripple', desc: 'Peaceful soothing harmonic water droplet', icon: '🌊' },
  { id: 'custom', name: 'Custom Sound', desc: 'Paste a URL to your own audio file (.mp3, .wav)', icon: '🎵' },
]

export function NotificationSettingsUI({ role }: { role: 'student' | 'admin' | 'faculty' }) {
  const [pushStatus, setPushStatus] = useState<NotificationPermission>('default')
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [activeSound, setActiveSound] = useState<NotificationSoundType>('quantum')
  const [previewingSound, setPreviewingSound] = useState<string | null>(null)
  const [customUrl, setCustomUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPushStatus(getNotificationPermissionStatus())
      setActiveSound(getSavedSoundTheme())
      setCustomUrl(getCustomSoundUrl())
    }
  }, [])

  const handleSelectSound = (id: NotificationSoundType) => {
    setActiveSound(id)
    setSavedSoundTheme(id)
    setPreviewingSound(id)
    playNotificationChime(id)
    triggerDeviceVibration([80, 40, 80])
    setTimeout(() => setPreviewingSound(null), 800)
  }

  const handleEnablePush = async () => {
    const perm = await requestNotificationPermission()
    setPushStatus(perm)
    if (perm === 'granted') {
      playNotificationChime()
      triggerDeviceVibration([200, 100, 200])
      dispatchNativeNotification({
        id: 'welcome_' + Date.now(),
        title: '🔔 Mobile Notifications Enabled!',
        message: 'You are all set to receive real-time alerts.',
      })
    }
  }

  const handleTestAlert = async () => {
    setIsSendingTest(true)
    try {
      playNotificationChime()
      triggerDeviceVibration([200, 100, 200])

      await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '📱 Real-Time Mobile Push Test',
          message: `Department alert delivered at ${new Date().toLocaleTimeString()} with sound & vibration!`,
          target: role,
        }),
      })

      dispatchNativeNotification({
        id: 'test_' + role + '_' + Date.now(),
        title: '📱 Real-Time Mobile Push Test',
        message: `Department alert delivered at ${new Date().toLocaleTimeString()} with sound & vibration!`,
      })
    } catch {} finally {
      setIsSendingTest(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Real-Time Mobile Push Configuration Banner */}
      <div className="bg-white rounded-3xl p-5 border border-blue-200/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white flex items-center justify-center shrink-0 shadow-md">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#071A3D]">Real-Time Mobile Push &amp; Sound Alerts</h3>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-black uppercase',
                  pushStatus === 'granted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                )}
              >
                {pushStatus === 'granted' ? '● Connected' : '○ Permission Needed'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Receive native mobile push notifications, haptic vibrations, and audio chimes for immediate department updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          {pushStatus !== 'granted' ? (
            <button
              onClick={handleEnablePush}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-102"
            >
              <Bell className="w-4 h-4" /> Enable Mobile Push
            </button>
          ) : (
            <button
              onClick={handleTestAlert}
              disabled={isSendingTest}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-102 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" /> {isSendingTest ? 'Sending Alert...' : 'Test Mobile Notification'}
            </button>
          )}
        </div>
      </div>

      {/* Unique Notification Sound Engine Studio */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white flex items-center justify-center shadow-xs">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#071A3D] flex items-center gap-2">
                Acoustic Chime &amp; Sound Profile
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-[#1455D9] border border-blue-100">
                  Web Audio Synthesizer
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                Choose or test your unique studio-grade acoustic chime for instant circulars and alerts
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSelectSound(activeSound)}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#071A3D] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1455D9]" /> Audition Current Sound
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {SOUND_OPTIONS.map((opt) => {
            const isSelected = activeSound === opt.id
            const isPlaying = previewingSound === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectSound(opt.id)}
                className={cn(
                  'p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer group',
                  isSelected
                    ? 'border-[#1455D9] bg-gradient-to-b from-blue-50/80 to-white shadow-sm ring-2 ring-[#1455D9]/20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xl group-hover:scale-110 transition-transform">{opt.icon}</span>
                    {opt.badge && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-[#F4C430]/20 text-[#071A3D] border border-[#F4C430]/30">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && !opt.badge && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-[#1455D9] text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-xs text-[#071A3D] flex items-center gap-1">
                    {opt.name}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {opt.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className={cn('font-semibold flex items-center gap-1', isSelected ? 'text-[#1455D9]' : 'text-gray-400 group-hover:text-gray-600')}>
                    <Volume2 className={cn('w-3.5 h-3.5', isPlaying && 'animate-bounce text-[#22C7E8]')} />
                    {isPlaying ? 'Playing...' : isSelected ? 'Selected' : 'Play & Set'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {activeSound === 'custom' && (
          <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl animate-fade-in flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 w-full relative">
              <label className="block text-xs font-bold text-[#071A3D] mb-1">Upload Audio File (.mp3, .wav)</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                      alert('File is too large. Please select an audio file under 2MB.')
                      return
                    }
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      const dataUrl = reader.result as string
                      setCustomUrl(dataUrl)
                      setCustomSoundUrl(dataUrl)
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1455D9]/10 file:text-[#1455D9] hover:file:bg-[#1455D9]/20 transition-all cursor-pointer"
              />
              {customUrl && customUrl.startsWith('data:audio') && (
                <p className="mt-1.5 text-[10px] text-green-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Custom audio loaded successfully!
                </p>
              )}
            </div>
            <button
              onClick={() => handleSelectSound('custom')}
              className="mt-4 sm:mt-0 px-4 py-2 bg-[#1455D9] hover:bg-[#0f44b0] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 shrink-0"
            >
              <Volume2 className="w-4 h-4" /> Test Custom Sound
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
