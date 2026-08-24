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
        content: body.content,
        category: body.category || 'Academic',
        target: body.target || 'All Students',
        createdByName: body.createdByName || 'Dr. S. Karthik',
        isPublished: true,
      },
    })
    return NextResponse.json({ success: true, announcement }, { status: 201 })
  } catch (error) {
    console.error('Announcements API error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create announcement' }, { status: 500 })
  }
}
