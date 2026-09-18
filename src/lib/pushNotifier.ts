import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || 'mailto:admin@vsbaids.edu.in'

let isVapidConfigured = false

function ensureVapidConfig() {
  if (isVapidConfigured) return true
  if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    try {
      webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
      isVapidConfigured = true
      return true
    } catch (e) {
      console.error('Failed to configure VAPID details for web-push:', e)
      return false
    }
  }
  return false
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: {
    url?: string
    id?: string
    timestamp?: number
    [key: string]: any
  }
  actions?: Array<{ action: string; title: string }>
}

export interface DispatchPushOptions {
  title: string
  message: string
  url?: string
  tag?: string
  targetRole?: string
  targetUserId?: string
  targetRegNo?: string
  actions?: Array<{ action: string; title: string }>
}

/**
 * Dispatch real mobile push notification to a single PushSubscription record
 */
export async function sendPushToSubscription(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: PushNotificationPayload
) {
  if (!ensureVapidConfig()) {
    console.warn('Web Push VAPID is not configured. Skipping push delivery.')
    return { success: false, reason: 'vapid_unconfigured' }
  }

  const pushSubscription = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  }

  try {
    const stringifiedPayload = JSON.stringify(payload)
    await webpush.sendNotification(pushSubscription, stringifiedPayload, {
      TTL: 86400, // 24 hours delivery window
      urgency: 'high',
    })
    return { success: true }
  } catch (error: any) {
    // Check for expired or invalidated push subscriptions (HTTP 404 or 410)
    if (error.statusCode === 404 || error.statusCode === 410) {
      try {
        await (prisma as any).pushSubscription.deleteMany({
          where: { endpoint: sub.endpoint },
        })
        console.info(`Pruned expired push subscription endpoint: ${sub.endpoint.slice(0, 30)}...`)
      } catch {}
      return { success: false, reason: 'subscription_expired' }
    }
    console.error('Web Push delivery error:', error?.message || error)
    return { success: false, reason: error?.message || 'unknown_error' }
  }
}

/**
 * Dispatch real mobile push notifications to target subscribers in Postgres
 */
export async function dispatchWebPushNotification(options: DispatchPushOptions) {
  if (!ensureVapidConfig()) {
    return { sent: 0, failed: 0, reason: 'vapid_not_configured' }
  }

  try {
    const where: any = {}

    if (options.targetUserId) {
      where.userId = options.targetUserId
    } else if (options.targetRegNo) {
      where.regNo = options.targetRegNo.toUpperCase()
    } else if (options.targetRole && options.targetRole !== 'all' && options.targetRole !== 'ALL') {
      where.role = options.targetRole
    }

    const subscriptions = await (prisma as any).pushSubscription.findMany({
      where,
      select: {
        endpoint: true,
        p256dh: true,
        auth: true,
      },
    })

    if (subscriptions.length === 0) {
      return { sent: 0, failed: 0, reason: 'no_subscribers_found' }
    }

    const payload: PushNotificationPayload = {
      title: options.title || 'Digital Portal of AI&DS',
      body: options.message,
      icon: '/college-emblem.png',
      badge: '/notification-badge.png',
      tag: options.tag || `portal-${Date.now()}`,
      data: {
        url: options.url || '/dashboard/notifications',
        timestamp: Date.now(),
      },
      actions: options.actions || [
        { action: 'open', title: 'Open Portal' },
      ],
    }

    const results = await Promise.allSettled(
      subscriptions.map((sub: any) => sendPushToSubscription(sub, payload))
    )

    let sent = 0
    let failed = 0

    results.forEach((r) => {
      if (r.status === 'fulfilled' && r.value.success) {
        sent++
      } else {
        failed++
      }
    })

    return { sent, failed, total: subscriptions.length }
  } catch (error) {
    console.error('Failed to dispatch web push notifications:', error)
    return { sent: 0, failed: 0, error: String(error) }
  }
}
