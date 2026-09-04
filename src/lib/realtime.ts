'use client'

import { createClient } from './client'
import { useEffect, useState } from 'react'

export type RealtimeEventCallback<T = any> = (payload: T) => void

export function subscribeToRealtimeChannel<T = any>(
  channelName: string,
  event: string,
  onData: RealtimeEventCallback<T>
) {
  try {
    const supabase = createClient()
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event }, (payload) => {
        if (payload?.payload) {
          onData(payload.payload)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  } catch (err) {
    console.debug('[REALTIME] Supabase channel fallback:', err)
    return () => {}
  }
}

export function useFastLiveSync<T>(
  fetchFn: () => Promise<T>,
  intervalMs = 1800,
  enabled = true
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!enabled) return

    let isMounted = true
    let timer: NodeJS.Timeout | null = null

    const execute = async () => {
      if (typeof document !== 'undefined' && document.hidden) {
        return
      }
      try {
        const res = await fetchFn()
        if (isMounted && res !== undefined) {
          setData(res)
          setIsLoading(false)
        }
      } catch {}
    }

    execute()
    timer = setInterval(execute, intervalMs)

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        execute()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      if (timer) clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [intervalMs, enabled])

  return { data, isLoading, mutate: setData }
}
