import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { validateBody, pushSubscriptionSchema } from '@/lib/validations/apiValidation'

export const dynamic = 'force-dynamic'

const DEFAULT_VAPID_PUBLIC_KEY =
  'BNlsPMJCfW8xkIZijGtcDx-QOUQmri1eRmfxOiKV3d2VZz_29dWXsPtN5YNEAiwkBDDfFAxtdEe1XsWYwHrn_V4'

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY
  return NextResponse.json({
    success: true,
    publicKey,
    hasVapid: true,
  })
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const rawBody = await request.json().catch(() => ({}))
    const validation = validateBody(pushSubscriptionSchema, rawBody)
    if (!validation.success) {
      return validation.response
    }
    const body = validation.data
    const { endpoint, keys } = body

    const userRole = session.role || body.role || 'student'
    const userRegNo = (session.registerNumber || body.regNo || '').toUpperCase()
    const userId = session.userId || body.userId
    const userAgent = request.headers.get('user-agent') || body.userAgent || null

    const subscription = await (prisma as any).pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId,
        regNo: userRegNo || null,
        role: userRole,
        userAgent,
      },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId,
        regNo: userRegNo || null,
        role: userRole,
        userAgent,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Mobile push subscription registered successfully',
      id: subscription.id,
    })
  } catch (error: any) {
    console.error('Push subscribe error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to save push subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const endpointParam = searchParams.get('endpoint')
    let endpoint = endpointParam

    if (!endpoint) {
      const body = await request.json().catch(() => ({}))
      endpoint = body.endpoint
    }

    if (!endpoint) {
      return NextResponse.json(
        { success: false, message: 'Endpoint is required to unsubscribe' },
        { status: 400 }
      )
    }

    await (prisma as any).pushSubscription.deleteMany({
      where: { endpoint },
    })

    return NextResponse.json({
      success: true,
      message: 'Push subscription removed successfully',
    })
  } catch (error: any) {
    console.error('Push unsubscribe error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}
