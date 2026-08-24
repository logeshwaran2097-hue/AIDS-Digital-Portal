import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
        date: new Date(body.date || '2026-09-15'),
        time: body.time || '09:00 AM - 04:30 PM',
        venue: body.venue || 'Main Auditorium',
        createdByName: body.createdByName || 'Dr. S. Karthik',
        status: 'published',
        isPublished: true,
      },
    })
    return NextResponse.json({ success: true, event }, { status: 201 })
  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create event' }, { status: 500 })
  }
}
