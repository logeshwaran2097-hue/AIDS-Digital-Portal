import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { sendPushToSubscription, dispatchWebPushNotification } from '@/lib/pushNotifier'
import { validateBody, pushTestSchema } from '@/lib/validations/apiValidation'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const rawBody = await request.json().catch(() => ({}))
    const validation = validateBody(pushTestSchema, rawBody)
    if (!validation.success) {
      return validation.response
    }
    const body = validation.data
    const { endpoint, delaySeconds = 0, title, message } = body

    const notifTitle = title || '🔔 Digital Portal of AI&DS'
    const notifMessage = message || 'Official Announcement: Real Mobile Push Notifications are now active on your device!'

    // If a delay is requested, wait to allow user to lock phone or switch apps
    if (delaySeconds > 0 && delaySeconds <= 15) {
      await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000))
    }

    if (endpoint) {
      const sub = await (prisma as any).pushSubscription.findUnique({
        where: { endpoint },
      })

      if (sub) {
        const result = await sendPushToSubscription(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          {
            title: notifTitle,
            body: notifMessage,
            icon: '/app-logo.png',
            badge: '/notification-badge.png',
            tag: `test-push-${Date.now()}`,
            data: {
              url: '/dashboard/notifications',
              timestamp: Date.now(),
            },
            actions: [
              { action: 'open', title: 'Open Portal' },
            ],
          }
        )

        return NextResponse.json({
          success: result.success,
          message: result.success
            ? 'Test push notification sent successfully to your device!'
            : `Delivery failed: ${result.reason}`,
          result,
        })
      }
    }

    // Fallback: dispatch to current user or active devices
    const userRegNo = session?.registerNumber
    const userId = session?.userId
    const userRole = session?.role || 'student'

    const dispatchRes = await dispatchWebPushNotification({
      title: notifTitle,
      message: notifMessage,
      url: '/dashboard/notifications',
      targetUserId: userId,
      targetRegNo: userRegNo,
      targetRole: userRole,
    })

    return NextResponse.json({
      success: dispatchRes.sent > 0,
      message: dispatchRes.sent > 0
        ? `Sent test notification to ${dispatchRes.sent} subscribed device(s)!`
        : 'No subscribed devices found. Please enable push notifications on this device first.',
      details: dispatchRes,
    })
  } catch (error: any) {
    console.error('Push test error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to dispatch test push' },
      { status: 500 }
    )
  }
}
