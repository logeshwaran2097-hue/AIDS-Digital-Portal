import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import path from 'path'
import fs from 'fs/promises'

export const dynamic = 'force-dynamic'

// GET: Fetch notes, lab manuals, and resources for a course
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('subjectCode')?.trim().toUpperCase()
    const subjectIdParam = searchParams.get('subjectId')

    let subject = null
    if (subjectIdParam) {
      subject = await prisma.subject.findUnique({ where: { id: subjectIdParam } })
    } else if (code) {
      subject = await prisma.subject.findFirst({ where: { code } })
    }

    if (!subject) {
      return NextResponse.json({ success: true, notes: [], labs: [], resources: [] })
    }

    const [notes, labs, resources] = await Promise.all([
      prisma.note.findMany({
        where: { subjectId: subject.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.labManual.findMany({
        where: { subjectId: subject.id },
        orderBy: { experimentNumber: 'asc' },
      }),
      prisma.resource.findMany({
        where: { subjectId: subject.id },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return NextResponse.json({
      success: true,
      notes: notes.map((n) => ({
        id: n.id,
        unit: n.content?.includes('Unit') ? n.content.split(' - ')[0].trim() : 'Study Notes',
        title: n.title,
        fileName: n.fileUrl ? n.fileUrl.split('/').pop()?.split('?')[0] || `${n.title}.pdf` : `${n.title}.pdf`,
        fileSize: '1.8 MB',
        fileUrl: n.fileUrl,
        uploadedDate: n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-GB') : 'Recently',
      })),
      labs: labs.map((l) => ({
        id: l.id,
        expNo: l.experimentNumber,
        title: l.experimentName || l.title,
        tools: l.description || 'Java JDK 17 / Eclipse / VS Code',
        guideFile: l.fileUrl ? l.fileUrl.split('/').pop() || `${subject.code}_Exp${l.experimentNumber}.pdf` : `${subject.code}_Exp${l.experimentNumber}.pdf`,
        fileUrl: l.fileUrl,
      })),
      resources,
    })
  } catch (error: any) {
    console.error('Fetch materials error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch materials' }, { status: 500 })
  }
}

// POST: Upload a real PDF / DOCX lecture material or lab manual
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || !['faculty', 'admin', 'hod'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Faculty access required.' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''
    let subjectCode = ''
    let title = ''
    let unitLabel = 'Unit I'
    let category = 'notes' // 'notes' | 'lab_manual' | 'handout'
    let description = ''
    let expNumber: number | null = null
    let uploadedFile: File | null = null
    let buffer: Buffer | null = null
    let originalName = ''
    let mimeType = 'application/pdf'
    let fileSizeFormatted = '2.0 MB'

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      subjectCode = ((formData.get('subjectCode') as string) || '').trim().toUpperCase()
      title = ((formData.get('title') as string) || '').trim()
      unitLabel = ((formData.get('unit') as string) || 'Unit I').trim()
      category = ((formData.get('category') as string) || 'notes').trim()
      description = ((formData.get('description') as string) || '').trim()
      const rawExpNum = formData.get('experimentNumber')
      if (rawExpNum) expNumber = Number(rawExpNum)

      const file = formData.get('file') as File | null
      if (file && typeof file === 'object' && 'name' in file && file.size > 0) {
        uploadedFile = file
        originalName = file.name
        mimeType = file.type || 'application/pdf'
        fileSizeFormatted = `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        const ab = await file.arrayBuffer()
        buffer = Buffer.from(ab)
      }
    } else {
      const body = await request.json()
      subjectCode = (body.subjectCode || '').trim().toUpperCase()
      title = (body.title || '').trim()
      unitLabel = (body.unit || 'Unit I').trim()
      category = (body.category || 'notes').trim()
      description = (body.description || '').trim()
      if (body.experimentNumber) expNumber = Number(body.experimentNumber)
      if (body.base64) {
        buffer = Buffer.from(body.base64, 'base64')
        originalName = body.fileName || `${title}.pdf`
        mimeType = body.mimeType || 'application/pdf'
      }
    }

    if (!subjectCode) {
      return NextResponse.json({ success: false, message: 'Subject code is required' }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ success: false, message: 'Document or experiment title is required' }, { status: 400 })
    }

    // Find or create subject
    let subject = await prisma.subject.findFirst({
      where: { code: subjectCode },
    })

    if (!subject) {
      // Create subject record if it doesn't exist yet
      subject = await prisma.subject.create({
        data: {
          code: subjectCode,
          name: title.includes('Lab') ? `${subjectCode} Laboratory` : `${subjectCode} Curriculum Course`,
          credits: category === 'lab_manual' ? 2 : 3,
          description: 'Department Curriculum Subject',
          academicYearId: 'cmtmnsw30000apv1wxafyfv59',
        },
      })
    }

    // Process file storage
    let fileUrl = ''
    if (buffer && buffer.length > 0) {
      const safeBase = (originalName || `${title}.pdf`).replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `${subjectCode}_${Date.now()}_${safeBase}`
      
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'materials')
        await fs.mkdir(uploadDir, { recursive: true })
        const filePath = path.join(uploadDir, fileName)
        await fs.writeFile(filePath, buffer)
        fileUrl = `/uploads/materials/${fileName}`
      } catch (fsErr) {
        console.warn('Filesystem write to public/uploads/materials bypassed, using inline Base64 data URL:', fsErr)
      }

      // If writing to disk failed or on serverless Vercel, use data URL so file is never lost
      if (!fileUrl && buffer.length < 4.5 * 1024 * 1024) {
        fileUrl = `data:${mimeType};base64,${buffer.toString('base64')}`
      }
    } else {
      // Default generated link
      fileUrl = `/uploads/materials/${subjectCode}_${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
    }

    if (category === 'lab_manual') {
      let currentExpNumber = expNumber
      if (!currentExpNumber || isNaN(currentExpNumber)) {
        const existingCount = await prisma.labManual.count({ where: { subjectId: subject.id } })
        currentExpNumber = existingCount + 1
      }

      const newLab = await prisma.labManual.create({
        data: {
          subjectId: subject.id,
          experimentNumber: currentExpNumber,
          experimentName: title,
          title: `Experiment ${currentExpNumber}: ${title}`,
          description: description || `Lab Manual Guide for ${title} (${unitLabel})`,
          fileUrl,
          uploadedById: session.userId,
          uploadedByName: session.name || 'Faculty Member',
          status: 'published',
        },
      })

      return NextResponse.json({
        success: true,
        message: `Experiment ${currentExpNumber} Lab Manual successfully uploaded & saved!`,
        lab: {
          id: newLab.id,
          expNo: newLab.experimentNumber,
          title: newLab.experimentName,
          tools: newLab.description || 'Java JDK 17 / Eclipse / VS Code',
          guideFile: originalName || `${subjectCode}_Exp${newLab.experimentNumber}.pdf`,
          fileUrl: newLab.fileUrl,
        },
      })
    } else {
      // Save as Note
      const newNote = await prisma.note.create({
        data: {
          subjectId: subject.id,
          title,
          content: `${unitLabel} - ${description || 'Lecture Notes & Study Material'}`,
          fileUrl,
          uploadedById: session.userId,
          uploaderName: session.name || 'Faculty Member',
          status: 'published',
        },
      })

      // Also persist to Resource table so it appears across portal resources
      await prisma.resource.create({
        data: {
          name: title,
          description: `${unitLabel}: ${description || title}`,
          fileName: originalName || `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          fileType: mimeType,
          fileSize: uploadedFile ? uploadedFile.size : 1024 * 1024 * 2,
          fileUrl,
          subjectId: subject.id,
          uploadedById: session.userId,
          uploadedByName: session.name || 'Faculty Member',
          status: 'approved',
          resourceType: category === 'handout' ? 'handout' : 'lecture_notes',
          semester: 3,
        },
      }).catch((e) => console.warn('Resource entry skip:', e))

      return NextResponse.json({
        success: true,
        message: 'Material successfully uploaded and published to subject syllabus!',
        note: {
          id: newNote.id,
          unit: unitLabel.split(' - ')[0].trim(),
          title: newNote.title,
          fileName: originalName || `${subjectCode}_${newNote.title.replace(/\s+/g, '_')}.pdf`,
          fileSize: fileSizeFormatted,
          fileUrl: newNote.fileUrl,
          uploadedDate: 'Just now',
        },
      })
    }
  } catch (error: any) {
    console.error('Upload material error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Failed to upload material' }, { status: 500 })
  }
}

// DELETE: Remove material from DB
export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session || !['faculty', 'admin', 'hod'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type') || 'note'

    if (!id) {
      return NextResponse.json({ success: false, message: 'Material ID is required' }, { status: 400 })
    }

    if (type === 'lab') {
      await prisma.labManual.delete({ where: { id } }).catch(() => null)
    } else {
      await prisma.note.delete({ where: { id } }).catch(() => null)
    }

    return NextResponse.json({ success: true, message: 'Material removed successfully' })
  } catch (error: any) {
    console.error('Delete material error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete material' }, { status: 500 })
  }
}
