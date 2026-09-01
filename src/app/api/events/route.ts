import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = {}
    if (category && category !== 'ALL') {
      where.category = category
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ success: true, events })
  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const event = await prisma.event.create({
      data: {
        name: body.name,
        description: body.description || '',
        category: body.category || 'Workshop',
        date: body.date ? new Date(body.date) : new Date(),
        time: body.time || '09:00 AM - 04:30 PM',
        venue: body.venue || 'Main Auditorium',
        createdByName: body.createdByName || body.organizer || 'Administrator',
        registrationInfo: body.targetSemester || body.registrationInfo || 'ALL',
        registrationUrl: body.registrationUrl?.trim() || null,
        status: 'published',
        isPublished: true,
      },
    })

    const author = body.createdByName || body.organizer || 'Department Directorate'
    
    // Automatically broadcast notification for students
    await prisma.notification.create({
      data: {
        title: `📅 New Event: ${body.name}`,
        message: `${body.category || 'Event'} scheduled on ${body.date ? new Date(body.date).toLocaleDateString('en-GB') : 'Upcoming'} at ${body.venue || 'Campus'}. Published by ${author}.`,
        target: 'all',
        createdByName: author,
        status: 'published',
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, event }, { status: 201 })
  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create event' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const clearAll = searchParams.get('clearAll')

    if (clearAll === 'true') {
      await prisma.event.deleteMany({})
      return NextResponse.json({ success: true, message: 'All events cleared' })
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing event ID' }, { status: 400 })
    }

    await prisma.event.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete event' }, { status: 500 })
  }
}
