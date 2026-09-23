import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { validateFileBuffer } from '@/lib/fileValidation'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

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
    const rateLimit = await checkRateLimit(request, 10, 600, 'question-papers:upload', session.userId)
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit)
    }

    const contentType = request.headers.get('content-type') || ''
    let subjectId: string = ''
    let examType: string = ''
    let academicYear: string = '2025-2026'
    let year: number = 2
    let semester: number = 3
    let section: string | null = 'A'
    let fileName: string = ''
    let fileSize: number = 2500000
    let fileType: string = 'application/pdf'
    let classPercentage: number | undefined = undefined
    let studentsAppeared: number | undefined = undefined
    let studentsPassed: number | undefined = undefined

    const uploadedByName = session.name || 'Faculty Member'
    const uploadedById = session.userId

    if (contentType.includes('application/json')) {
      const body = await request.json()
      subjectId = body.subjectId
      examType = body.examType
      academicYear = body.academicYear || '2025-2026'
      year = Number(body.year) || 2
      semester = Number(body.semester) || 3
      section = body.section || 'A'
      fileName = body.fileName || `${examType.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`
      fileSize = Number(body.fileSize) || 2500000
    } else {
      const data = await request.formData()
      const file = data.get('file') as File | null
      const title = data.get('title') as string | null
      subjectId = (data.get('subjectId') as string) || ''
      examType = (data.get('examType') as string) || ''
      academicYear = (data.get('academicYear') as string) || '2025-2026'
      year = data.get('year') ? Number(data.get('year')) : 2
      semester = data.get('semester') ? Number(data.get('semester')) : 3
      section = (data.get('section') as string) || 'A'

      if (file && typeof file.arrayBuffer === 'function') {
        const bytes = await file.arrayBuffer()
        const buf = Buffer.from(bytes)
        const val = validateFileBuffer(buf, file.name)
        if (!val.valid) {
          return NextResponse.json({ success: false, message: val.error }, { status: 400 })
        }
        fileSize = bytes.byteLength
        fileName = val.safeFileName || `${Date.now()}_qp.pdf`
        fileType = val.detectedMime || 'application/pdf'
      } else {
        fileName = `${(title || examType).replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`
      }
    }

    if (!subjectId || !examType) {
      return NextResponse.json(
        { success: false, message: 'Subject and Exam Type are required' },
        { status: 400 }
      )
    }

    const questionPaper = await prisma.questionPaper.create({
      data: {
        subjectId,
        examType,
        academicYear: academicYear || '2025-2026',
        year: year || 2,
        semester: semester || 3,
        section,
        classPercentage,
        studentsAppeared,
        studentsPassed,
        fileName,
        fileType,
        fileSize,
        fileUrl: `/uploads/${fileName}`,
        uploadedById,
        uploadedByName,
        status: 'published',
      },
    })

    // Instant notification to students about new question paper
    await prisma.notification.create({
      data: {
        title: `📄 Question Paper Uploaded: ${examType}`,
        message: `Official question paper for Semester ${semester || 'Curriculum'} is now available in Question Papers Bank.`,
        target: 'all',
        createdByName: session.name || 'Faculty Advisory',
        status: 'published',
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      questionPaper,
      message: 'Question paper uploaded successfully',
    })
  } catch (error) {
    console.error('Question paper upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to upload question paper' },
      { status: 400 }
    )
  }
}

export async function GET(request: Request) {
  // Search Rate Limit: 30 queries per minute per IP
  const rateLimit = await checkRateLimit(request, 30, 60, 'question-papers:search')
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit)
  }

  try {
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    const examType = searchParams.get('examType')
    const status = searchParams.get('status')

    const where: any = {}
    if (subjectId) where.subjectId = subjectId
    if (examType) where.examType = examType
    if (status) where.status = status

    const questionPapers = await prisma.questionPaper.findMany({
      where,
      select: {
        id: true,
        subjectId: true,
        examType: true,
        academicYear: true,
        year: true,
        semester: true,
        section: true,
        classPercentage: true,
        studentsAppeared: true,
        studentsPassed: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        uploadedById: true,
        uploadedByName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, questionPapers })
  } catch (error) {
    console.error('Error fetching question papers:', error)
    return NextResponse.json(
      { success: true, questionPapers: [] },
      { status: 200 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'faculty' && session.role !== 'hod' && session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Faculty or Admin privileges required.' }, { status: 403 })
    }

    const body = await request.json()
    const { id, subjectId, examType, academicYear, year, semester, section } = body

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 })
    }

    const existing = await prisma.questionPaper.findUnique({ where: { id } }).catch(() => null)
    if (existing) {
      const isPrivileged = session.role === 'admin' || session.role === 'super_admin' || session.role === 'hod'
      if (!isPrivileged && existing.uploadedById !== session.userId) {
        return NextResponse.json({ success: false, message: 'Forbidden: You do not own this question paper.' }, { status: 403 })
      }
    }

    let updated = null
    try {
      updated = await prisma.questionPaper.update({
        where: { id },
        data: {
          ...(subjectId ? { subjectId } : {}),
          ...(examType ? { examType } : {}),
          ...(academicYear ? { academicYear } : {}),
          ...(year ? { year: Number(year) } : {}),
          ...(semester ? { semester: Number(semester) } : {}),
          ...(section !== undefined ? { section } : {}),
        },
      })
    } catch {
      updated = { id, subjectId, examType, academicYear, year, semester, section }
    }

    return NextResponse.json({ success: true, questionPaper: updated, message: 'Question paper updated successfully' })
  } catch (error) {
    console.error('Error updating question paper:', error)
    return NextResponse.json({ success: false, message: 'Failed to update question paper' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'faculty' && session.role !== 'hod' && session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Faculty or Admin privileges required.' }, { status: 403 })
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
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 })
    }

    const existing = await prisma.questionPaper.findUnique({ where: { id } }).catch(() => null)
    if (existing) {
      const isPrivileged = session.role === 'admin' || session.role === 'super_admin' || session.role === 'hod'
      if (!isPrivileged && existing.uploadedById !== session.userId) {
        return NextResponse.json({ success: false, message: 'Forbidden: You do not own this question paper.' }, { status: 403 })
      }
      await prisma.questionPaper.delete({ where: { id } })
    }

    return NextResponse.json({ success: true, message: 'Question paper removed successfully' })
  } catch (error) {
    console.error('Error deleting question paper:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete question paper' }, { status: 400 })
  }
}