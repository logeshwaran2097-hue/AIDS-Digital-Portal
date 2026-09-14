import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
  return NextResponse.json({
    success: true,
    publicKey,
    hasVapid: Boolean(publicKey && process.env.VAPID_PRIVATE_KEY),
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { endpoint, keys, role, regNo } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { success: false, message: 'Invalid push subscription payload' },
        { status: 400 }
      )
    }

    const session = await getSession().catch(() => null)
    const userRole = role || session?.role || 'student'
    const userRegNo = (regNo || session?.registerNumber || '').toUpperCase()
    const userId = session?.userId || null
    const userAgent = request.headers.get('user-agent') || null

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
