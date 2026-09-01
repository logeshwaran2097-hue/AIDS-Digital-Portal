import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const resourceType = searchParams.get('type')
    const subjectId = searchParams.get('subjectId')

    const where: any = {}
    if (resourceType && resourceType !== 'ALL') {
      where.resourceType = resourceType
    }
    if (subjectId && subjectId !== 'ALL') {
      where.subjectId = subjectId
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, resources })
  } catch (error) {
    console.error('Resource fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const file = data.get('file') as File
    const title = data.get('title') as string
    const description = data.get('description') as string | null
    const subjectId = data.get('subjectId') as string
    const resourceType = data.get('resourceType') as string
    const semester = data.get('semester') ? Number(data.get('semester')) : undefined

    if (!file || !title || !subjectId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileSize = buffer.length
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`
    const fileType = file.type || 'application/octet-stream'

    // Store file info in database
    const resource = await prisma.resource.create({
      data: {
        name: title,
        description: description || '',
        fileName: fileName,
        fileType: fileType,
        fileSize: fileSize,
        fileUrl: `/uploads/${fileName}`,
        uploadedById: 'system',
        subjectId: subjectId,
        resourceType: resourceType || 'other',
        semester: semester,
        status: 'published',
        uploadedByName: 'Faculty',
      },
    })

    // Notify students of newly uploaded academic study material
    await prisma.notification.create({
      data: {
        title: `📚 New Study Material: ${title}`,
        message: `${resourceType ? resourceType.toUpperCase() : 'Notes'} uploaded for your course. Available in Study Resources.`,
        target: 'all',
        createdByName: 'Faculty Member',
        status: 'published',
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      resource,
      message: 'Resource uploaded successfully',
    })
  } catch (error) {
    console.error('Resource upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to upload resource' },
      { status: 500 }
    )
  }
}