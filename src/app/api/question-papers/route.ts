import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const file = data.get('file') as File
    const title = data.get('title') as string
    const description = data.get('description') as string | null
    const subjectId = data.get('subjectId') as string
    const examType = data.get('examType') as string
    const academicYear = data.get('academicYear') as string
    const year = data.get('year') ? Number(data.get('year')) : undefined
    const semester = data.get('semester') ? Number(data.get('semester')) : undefined
    const section = data.get('section') as string | null
    const classPercentage = data.get('classPercentage') ? Number(data.get('classPercentage')) : undefined
    const studentsAppeared = data.get('studentsAppeared') ? Number(data.get('studentsAppeared')) : undefined
    const studentsPassed = data.get('studentsPassed') ? Number(data.get('studentsPassed')) : undefined

    if (!file || !title || !subjectId || !examType) {
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

    const questionPaper = await prisma.questionPaper.create({
      data: {
        subjectId: subjectId,
        examType: examType,
        academicYear: academicYear || '',
        year: year || 0,
        semester: semester || 0,
        section: section,
        classPercentage: classPercentage,
        studentsAppeared: studentsAppeared,
        studentsPassed: studentsPassed,
        fileName: fileName,
        fileType: fileType,
        fileSize: fileSize,
        fileUrl: `/uploads/${fileName}`,
        status: 'pending',
      },
    })

    return NextResponse.json({
      success: true,
      questionPaper,
      message: 'Question paper uploaded successfully, pending approval',
    })
  } catch (error) {
    console.error('Question paper upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to upload question paper' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, questionPapers })
  } catch (error) {
    console.error('Error fetching question papers:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch question papers' },
      { status: 500 }
    )
  }
}