import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = {}
    if (category && category !== 'ALL') {
      where.category = category
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, announcements })
  } catch (error) {
    console.error('Announcements API error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch announcements' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const announcement = await prisma.announcement.create({
      data: {
        title: body.title,
        content: body.content || '',
        category: body.category || 'Academic',
        target: body.target || 'All Students',
        createdByName: body.createdByName || 'Administrator',
        isPublished: true,
      },
    })
    return NextResponse.json({ success: true, announcement }, { status: 201 })
  } catch (error) {
    console.error('Announcements API error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create announcement' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const clearAll = searchParams.get('clearAll')

    if (clearAll === 'true') {
      await prisma.announcement.deleteMany({})
      return NextResponse.json({ success: true, message: 'All announcements cleared' })
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing announcement ID' }, { status: 400 })
    }

    await prisma.announcement.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Announcement deleted successfully' })
  } catch (error) {
    console.error('Delete announcement error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete announcement' }, { status: 500 })
  }
}
