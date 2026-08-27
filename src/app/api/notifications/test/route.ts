import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const title = body.title || '🔔 Real-Time Mobile Alert'
    const message =
      body.message ||
      `Live alert received at ${new Date().toLocaleTimeString()} — Department of AI & DS, V.S.B. Engineering College.`
    const target = body.target || 'all'

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        target,
        createdByName: 'V.S.B. Real-Time Push Dispatcher',
        status: 'published',
        publishedAt: new Date(),
        readBy: '[]',
      },
    })

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        target: notification.target,
        createdByName: notification.createdByName,
        createdAt: notification.createdAt,
      },
    })
  } catch (error) {
    console.error('Test notification dispatch error:', error)
    return NextResponse.json({ success: false, message: 'Failed to dispatch test alert' }, { status: 500 })
  }
}
