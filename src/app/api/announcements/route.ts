import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cachedDbQuery, invalidateCache } from '@/lib/dbCache'

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

    const cacheKey = `announcements_${category || 'ALL'}`
    const announcements = await cachedDbQuery(
      cacheKey,
      () =>
        prisma.announcement.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        }),
      4000,
      ['announcements']
    )

    return NextResponse.json({ success: true, announcements })
  } catch (error) {
    console.error('Announcements API error:', error)
    return NextResponse.json({ success: true, announcements: [] })
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
        attachmentUrl: body.attachmentUrl || null,
        createdByName: body.createdByName || 'Administrator',
        isPublished: true,
      },
    })

    // Instantly invalidate announcements cache for immediate freshness
    invalidateCache('announcements')
    invalidateCache('notifications')

    const author = body.createdByName || 'Department Directorate'

    // Automatically broadcast notification for students
    await prisma.notification.create({
      data: {
        title: `📢 Announcement: ${body.title}`,
        message: `${body.content ? body.content.substring(0, 140) : 'New departmental notice'}. Category: ${body.category || 'General'}. Published by ${author}.`,
        target: 'all',
        createdByName: author,
        status: 'published',
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, announcement }, { status: 201 })
  } catch (error) {
    console.error('Announcements API error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create announcement' }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, content, category, target, attachmentUrl } = body

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing announcement ID' }, { status: 400 })
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(category !== undefined && { category }),
        ...(target !== undefined && { target }),
        ...(attachmentUrl !== undefined && { attachmentUrl: attachmentUrl || null }),
      },
    })

    // Instantly invalidate announcements cache for immediate freshness
    invalidateCache('announcements')

    return NextResponse.json({ success: true, announcement: updated })
  } catch (error) {
    console.error('Update announcement error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update announcement' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const clearAll = searchParams.get('clearAll')

    if (clearAll === 'true') {
      await prisma.announcement.deleteMany({})
      invalidateCache('announcements')
      return NextResponse.json({ success: true, message: 'All announcements cleared' })
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing announcement ID' }, { status: 400 })
    }

    await prisma.announcement.delete({ where: { id } })

    // Instantly invalidate announcements cache for immediate freshness
    invalidateCache('announcements')

    return NextResponse.json({ success: true, message: 'Announcement deleted successfully' })
  } catch (error) {
    console.error('Delete announcement error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete announcement' }, { status: 400 })
  }
}
