import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({
      success: true,
      achievements: achievements.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        recipientType: a.recipientType,
        recipientName: a.recipientName,
        eventName: a.eventName,
        awardName: a.awardName,
        certificateUrl: a.certificateUrl,
        date: a.date.toISOString().split('T')[0],
        status: a.status,
      })),
    })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json({ success: false, achievements: [] }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description = '',
      category = 'Hackathon & Competitions',
      recipientType = session.role === 'faculty' ? 'faculty' : 'student',
      recipientName,
      eventName,
      awardName,
      certificateUrl,
      date,
    } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: 'Achievement title is required' }, { status: 400 })
    }

    const isPrivileged = session.role === 'admin' || session.role === 'hod'

    const created = await prisma.achievement.create({
      data: {
        title: title.trim(),
        description: (description || '').trim(),
        category: category || 'Hackathon & Competitions',
        recipientType: recipientType || (session.role === 'faculty' ? 'faculty' : 'student'),
        recipientName: recipientName?.trim() || session.name || 'AI & DS Student',
        eventName: eventName?.trim() || null,
        awardName: awardName?.trim() || null,
        certificateUrl: certificateUrl || null,
        date: date ? new Date(date) : new Date(),
        status: isPrivileged ? 'published' : 'pending',
        approvedByName: isPrivileged ? session.name : null,
      },
    })

    return NextResponse.json({ success: true, achievement: created })
  } catch (error) {
    console.error('Error creating achievement:', error)
    return NextResponse.json({ success: false, message: 'Failed to create achievement' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'admin' && session.role !== 'hod')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing achievement id' }, { status: 400 })
    }

    await prisma.achievement.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting achievement:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete achievement' }, { status: 500 })
  }
}
