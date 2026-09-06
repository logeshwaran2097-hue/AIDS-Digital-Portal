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
    const semester = searchParams.get('semester')

    const where: any = {}
    if (resourceType && resourceType !== 'ALL') {
      where.resourceType = resourceType
    }
    if (subjectId && subjectId !== 'ALL') {
      where.subjectId = subjectId
    }
    if (semester && semester !== 'ALL') {
      where.semester = Number(semester)
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
    const contentType = request.headers.get('content-type') || ''
    let title = ''
    let description = ''
    let subjectId: string | null = null
    let resourceType = 'textbook'
    let semester = 3
    let academicYear = '2025-2026'
    let fileName = ''
    let fileSize = 1024 * 1024 * 5 // default 5MB
    let fileType = 'application/pdf'
    let fileUrl = ''
    let uploadedByName = 'Faculty Member'
    let uploadedById = 'faculty'

    if (contentType.includes('application/json')) {
      const body = await request.json()
      title = body.title || body.name
      description = body.description || ''
      subjectId = body.subjectId || null
      resourceType = body.resourceType || 'textbook'
      semester = body.semester ? Number(body.semester) : 3
      academicYear = body.academicYear || '2025-2026'
      fileName = body.fileName || `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      fileSize = body.fileSize ? Number(body.fileSize) : 5242880
      fileType = body.fileType || 'application/pdf'
      fileUrl = body.fileUrl || `/uploads/resources/${fileName}`
      uploadedByName = body.uploadedByName || 'Faculty Member'
      uploadedById = body.uploadedById || 'faculty'
    } else {
      const data = await request.formData()
      const file = data.get('file') as File | null
      title = (data.get('title') as string) || ''
      description = (data.get('description') as string) || ''
      subjectId = (data.get('subjectId') as string) || null
      resourceType = (data.get('resourceType') as string) || 'textbook'
      semester = data.get('semester') ? Number(data.get('semester')) : 3
      academicYear = (data.get('academicYear') as string) || '2025-2026'
      uploadedByName = (data.get('uploadedByName') as string) || 'Faculty Member'
      uploadedById = (data.get('uploadedById') as string) || 'faculty'

      if (file && typeof file === 'object' && 'name' in file) {
        fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`
        fileSize = file.size || 1024 * 1024 * 2
        fileType = file.type || 'application/pdf'
        fileUrl = `/uploads/${fileName}`
      } else {
        fileName = `${Date.now()}-${title.replace(/[^a-zA-Z0-9.]/g, '-')}.pdf`
        fileSize = 1024 * 1024 * 4
        fileType = 'application/pdf'
        fileUrl = `/uploads/resources/${fileName}`
      }
    }

    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Resource title is required' },
        { status: 400 }
      )
    }

    // Store in database
    const resource = await prisma.resource.create({
      data: {
        name: title,
        description: description || '',
        fileName,
        fileType,
        fileSize,
        fileUrl,
        uploadedById,
        uploadedByName,
        subjectId,
        resourceType,
        semester,
        academicYear,
        status: 'published',
      },
    })

    // Notify students of newly uploaded academic study material
    await prisma.notification.create({
      data: {
        title: `📚 New Study Material: ${title}`,
        message: `${resourceType.replace(/_/g, ' ').toUpperCase()} uploaded for AI & DS students. Available in Study Resources.`,
        target: 'all',
        createdByName: uploadedByName,
        status: 'published',
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      resource,
      message: 'Resource published to digital library successfully',
    })
  } catch (error) {
    console.error('Resource upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to upload resource' },
      { status: 500 }
    )
  }
}