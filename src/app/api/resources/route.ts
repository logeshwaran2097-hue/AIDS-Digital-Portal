import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cachedDbQuery, invalidateCache } from '@/lib/dbCache'
import { getSession } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { validateFileBuffer } from '@/lib/fileValidation'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(request: Request) {
  // Search Rate Limit: 30 queries per minute per IP
  const rateLimit = await checkRateLimit(request, 30, 60, 'resources:search')
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit)
  }

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

    const cacheKey = `resources_${resourceType || 'ALL'}_${subjectId || 'ALL'}_${semester || 'ALL'}`
    const resources = await cachedDbQuery(
      cacheKey,
      () =>
        prisma.resource.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        }),
      8000,
      ['resources']
    )

    return NextResponse.json({ success: true, resources })
  } catch (error) {
    console.error('Resource fetch error:', error)
    return NextResponse.json(
      { success: true, resources: [] },
      { status: 200 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'faculty' && session.role !== 'hod' && session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Faculty or Admin privileges required.' },
        { status: 403 }
      )
    }

    // Upload Rate Limit: 10 uploads per 10 minutes per user/IP
    const rateLimit = await checkRateLimit(request, 10, 600, 'resources:upload', session.userId)
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit)
    }

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

    // Identity strictly derived from verified session
    const uploadedById = session.userId
    const uploadedByName = session.name || 'Faculty Member'

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
    } else {
      const data = await request.formData()
      const file = data.get('file') as File | null
      title = (data.get('title') as string) || ''
      description = (data.get('description') as string) || ''
      subjectId = (data.get('subjectId') as string) || null
      resourceType = (data.get('resourceType') as string) || 'textbook'
      semester = data.get('semester') ? Number(data.get('semester')) : 3
      academicYear = (data.get('academicYear') as string) || '2025-2026'

      if (file && typeof file === 'object' && 'name' in file && typeof file.arrayBuffer === 'function') {
        const buf = Buffer.from(await file.arrayBuffer())
        const val = validateFileBuffer(buf, file.name)
        if (!val.valid) {
          return NextResponse.json({ success: false, message: val.error }, { status: 400 })
        }
        fileName = val.safeFileName || `${Date.now()}_doc.pdf`
        fileSize = buf.length
        fileType = val.detectedMime || 'application/pdf'
        
        try {
          const fs = require('fs/promises')
          const path = require('path')
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resources')
          await fs.mkdir(uploadDir, { recursive: true })
          const filePath = path.join(uploadDir, fileName)
          await fs.writeFile(filePath, buf)
          fileUrl = `/uploads/resources/${fileName}`
        } catch (e) {
          console.warn('File write failed, using base64 fallback')
        }

        if (!fileUrl && buf.length < 4.5 * 1024 * 1024) {
          fileUrl = `data:${fileType};base64,${buf.toString('base64')}`
        }
        if (!fileUrl) {
          fileUrl = `/uploads/resources/${fileName}` // Last resort
        }
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

    invalidateCache('resources')
    invalidateCache('student_data')

    return NextResponse.json({
      success: true,
      resource,
      message: 'Resource published to digital library successfully',
    })
  } catch (error) {
    console.error('Resource upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to upload resource' },
      { status: 400 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'faculty' && session.role !== 'hod' && session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Faculty or Admin privileges required.' },
        { status: 403 }
      )
    }

    const contentType = request.headers.get('content-type') || ''
    let id = ''
    let title = ''
    let description = ''
    let subjectId: string | null = null
    let resourceType = 'textbook'
    let semester = 3
    let fileName: string | undefined = undefined
    let fileSize: number | undefined = undefined
    let fileType: string | undefined = undefined
    let fileUrl: string | undefined = undefined

    if (contentType.includes('application/json')) {
      const body = await request.json()
      id = body.id
      title = body.title || body.name
      description = body.description || ''
      subjectId = body.subjectId || null
      resourceType = body.resourceType || 'textbook'
      semester = body.semester ? Number(body.semester) : 3
      if (body.fileName) fileName = body.fileName
      if (body.fileSize) fileSize = Number(body.fileSize)
      if (body.fileType) fileType = body.fileType
      if (body.fileUrl) fileUrl = body.fileUrl
    } else {
      const data = await request.formData()
      id = (data.get('id') as string) || ''
      title = (data.get('title') as string) || ''
      description = (data.get('description') as string) || ''
      subjectId = (data.get('subjectId') as string) || null
      resourceType = (data.get('resourceType') as string) || 'textbook'
      semester = data.get('semester') ? Number(data.get('semester')) : 3
      const file = data.get('file') as File | null
      if (file && typeof file === 'object' && 'name' in file && typeof file.arrayBuffer === 'function') {
        const buf = Buffer.from(await file.arrayBuffer())
        const val = validateFileBuffer(buf, file.name)
        if (!val.valid) {
          return NextResponse.json({ success: false, message: val.error }, { status: 400 })
        }
        fileName = val.safeFileName || `${Date.now()}_doc.pdf`
        fileSize = buf.length
        fileType = val.detectedMime || 'application/pdf'
        fileUrl = `/uploads/${fileName}`
      }
    }

    if (!id || !title) {
      return NextResponse.json(
        { success: false, message: 'Resource ID and Title are required' },
        { status: 400 }
      )
    }

    const existing = await prisma.resource.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Resource not found' }, { status: 404 })
    }

    const isPrivileged = session.role === 'admin' || session.role === 'super_admin' || session.role === 'hod'
    if (!isPrivileged && existing.uploadedById !== session.userId) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. You do not have permission to modify this resource.' },
        { status: 403 }
      )
    }

    const updated = await prisma.resource.update({
      where: { id },
      data: {
        name: title,
        description: description || '',
        subjectId,
        resourceType,
        semester,
        ...(fileName ? { fileName } : {}),
        ...(fileSize !== undefined ? { fileSize } : {}),
        ...(fileType ? { fileType } : {}),
        ...(fileUrl ? { fileUrl } : {}),
      },
    })

    invalidateCache('resources')
    invalidateCache('student_data')

    return NextResponse.json({
      success: true,
      resource: updated,
      message: 'Resource updated successfully',
    })
  } catch (error: any) {
    console.error('Resource update error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update resource' },
      { status: 400 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'faculty' && session.role !== 'hod' && session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Faculty or Admin privileges required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    let id = searchParams.get('id')
    if (!id) {
      try {
        const body = await request.json()
        id = body.id
      } catch {}
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Resource ID is required' },
        { status: 400 }
      )
    }

    const existing = await prisma.resource.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Resource not found' }, { status: 404 })
    }

    const isPrivileged = session.role === 'admin' || session.role === 'super_admin' || session.role === 'hod'
    if (!isPrivileged && existing.uploadedById !== session.userId) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. You do not have permission to delete this resource.' },
        { status: 403 }
      )
    }

    await prisma.resource.delete({
      where: { id },
    })

    invalidateCache('resources')
    invalidateCache('student_data')

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully',
    })
  } catch (error: any) {
    console.error('Resource delete error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete resource' },
      { status: 400 }
    )
  }
}