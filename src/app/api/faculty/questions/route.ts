import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { extractTextFromFile } from '@/lib/syllabusParser'
import { parseQuestionBankText, ParsedQuestion } from '@/lib/questionBankParser'

export const dynamic = 'force-dynamic'

// GET: Fetch questions for a specific subject
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = (searchParams.get('code') || searchParams.get('subjectCode') || '').trim().toUpperCase()

    if (!code) {
      return NextResponse.json({ success: false, message: 'Subject code is required' }, { status: 400 })
    }

    const subject = await prisma.subject.findFirst({
      where: { code },
    })

    if (!subject) {
      return NextResponse.json({ success: true, questions: [] })
    }

    const dbQuestions = await prisma.importantQuestion.findMany({
      where: { subjectId: subject.id },
      orderBy: { createdAt: 'desc' },
    })

    const questions = dbQuestions.map((q) => ({
      id: q.id,
      unit: q.unitId || 'Unit I',
      type: (q.marks && q.marks > 5 ? '16_mark' : '2_mark') as '2_mark' | '16_mark',
      marks: q.marks || 2,
      q: q.question,
      bloom: q.frequency || 'L2: Understand',
    }))

    return NextResponse.json({ success: true, questions })
  } catch (error: any) {
    console.error('Fetch questions error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

// POST: Upload Question Bank document (PDF/DOCX) or Add question manually
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''

    // 1. Multipart Form Upload (File: PDF, DOCX, TXT)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const subjectCode = (formData.get('subjectCode') as string || '').trim().toUpperCase()
      const file = formData.get('file') as File | null

      if (!subjectCode) {
        return NextResponse.json({ success: false, message: 'Subject code is required' }, { status: 400 })
      }

      if (!file) {
        return NextResponse.json({ success: false, message: 'Question Bank file is required' }, { status: 400 })
      }

      const subject = await prisma.subject.findFirst({
        where: { code: subjectCode },
      })

      if (!subject) {
        return NextResponse.json({ success: false, message: `Subject ${subjectCode} not found` }, { status: 404 })
      }

      const fileBuffer = Buffer.from(await file.arrayBuffer())
      const rawText = await extractTextFromFile(fileBuffer, file.type, file.name)
      const parsedQuestions = parseQuestionBankText(rawText)

      if (parsedQuestions.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'No questions could be extracted from this document. Please ensure questions are formatted with numbers or under Unit/Part headings.',
        }, { status: 422 })
      }

      const facultyUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)
      const authorName = facultyUser?.name || session.name || 'Faculty Subject Handler'

      // Save each parsed question to prisma.importantQuestion
      const createdRecords = await Promise.all(
        parsedQuestions.map((q) =>
          prisma.importantQuestion.create({
            data: {
              subjectId: subject.id,
              question: q.q,
              unitId: q.unit,
              marks: q.marks,
              frequency: q.bloom,
              uploadedById: session.userId,
              uploadedByName: authorName,
              status: 'published',
            },
          })
        )
      )

      const formattedQuestions = createdRecords.map((rec) => ({
        id: rec.id,
        unit: rec.unitId || 'Unit I',
        type: (rec.marks && rec.marks > 5 ? '16_mark' : '2_mark') as '2_mark' | '16_mark',
        marks: rec.marks || 2,
        q: rec.question,
        bloom: rec.frequency || 'L2: Understand',
      }))

      return NextResponse.json({
        success: true,
        message: `Successfully extracted and published ${parsedQuestions.length} questions from ${file.name}!`,
        questions: formattedQuestions,
        count: parsedQuestions.length,
      })
    }

    // 2. JSON Request (Manual Question Add or Template Load)
    const body = await request.json()
    const { action, subjectCode } = body

    if (!subjectCode) {
      return NextResponse.json({ success: false, message: 'Subject code is required' }, { status: 400 })
    }

    const subject = await prisma.subject.findFirst({
      where: { code: subjectCode.trim().toUpperCase() },
    })

    if (!subject) {
      return NextResponse.json({ success: false, message: `Subject ${subjectCode} not found` }, { status: 404 })
    }

    const facultyUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)
    const authorName = facultyUser?.name || session.name || 'Faculty Member'

    if (action === 'ADD_QUESTION') {
      const { question, marks, unit, bloom } = body
      if (!question || !question.trim()) {
        return NextResponse.json({ success: false, message: 'Question text is required' }, { status: 400 })
      }

      const numMarks = Number(marks) || 2

      const newQ = await prisma.importantQuestion.create({
        data: {
          subjectId: subject.id,
          question: question.trim(),
          unitId: unit || 'Unit I',
          marks: numMarks,
          frequency: bloom || (numMarks > 5 ? 'L3: Apply' : 'L2: Understand'),
          uploadedById: session.userId,
          uploadedByName: authorName,
          status: 'published',
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Question added successfully!',
        question: {
          id: newQ.id,
          unit: newQ.unitId || 'Unit I',
          type: numMarks > 5 ? '16_mark' : '2_mark',
          marks: numMarks,
          q: newQ.question,
          bloom: newQ.frequency || 'L2: Understand',
        },
      })
    }

    if (action === 'LOAD_TEMPLATE') {
      // Standard Anna University Autonomous Question Bank Template for this subject
      const templateQuestions: ParsedQuestion[] = [
        {
          unit: 'Unit I',
          type: '2_mark',
          marks: 2,
          q: 'Define algorithm and state its essential characteristics.',
          bloom: 'L1: Remember',
        },
        {
          unit: 'Unit I',
          type: '2_mark',
          marks: 2,
          q: 'Explain the asymptotic notations: Big-Oh, Big-Omega and Big-Theta.',
          bloom: 'L2: Understand',
        },
        {
          unit: 'Unit I',
          type: '16_mark',
          marks: 16,
          q: 'Explain mathematical analysis of non-recursive and recursive algorithms with suitable matrix multiplication and tower of hanoi examples.',
          bloom: 'L3: Apply',
        },
        {
          unit: 'Unit II',
          type: '2_mark',
          marks: 2,
          q: 'State the principle of Divide and Conquer technique with examples.',
          bloom: 'L1: Remember',
        },
        {
          unit: 'Unit II',
          type: '16_mark',
          marks: 16,
          q: 'Describe Quick Sort algorithm in detail. Trace with an array of 8 elements and compute its best and worst-case time complexity.',
          bloom: 'L4: Analyze',
        },
        {
          unit: 'Unit III',
          type: '2_mark',
          marks: 2,
          q: 'What is Dynamic Programming? How does it differ from Greedy technique?',
          bloom: 'L2: Understand',
        },
        {
          unit: 'Unit III',
          type: '16_mark',
          marks: 16,
          q: 'Solve the 0/1 Knapsack problem using Dynamic Programming for capacity W = 10 with item weights and values table.',
          bloom: 'L3: Apply',
        },
        {
          unit: 'Unit IV',
          type: '2_mark',
          marks: 2,
          q: 'Define state space tree in Backtracking with an example.',
          bloom: 'L1: Remember',
        },
        {
          unit: 'Unit IV',
          type: '16_mark',
          marks: 16,
          q: 'Explain the 8-Queens problem using Backtracking method. Draw the state space tree for 4-Queens.',
          bloom: 'L3: Apply',
        },
        {
          unit: 'Unit V',
          type: '2_mark',
          marks: 2,
          q: 'Differentiate between P, NP, and NP-Complete problems with examples.',
          bloom: 'L2: Understand',
        },
        {
          unit: 'Unit V',
          type: '16_mark',
          marks: 16,
          q: 'Discuss Branch and Bound technique. Solve the Travelling Salesperson Problem (TSP) using LC Branch and Bound.',
          bloom: 'L4: Analyze',
        },
      ]

      const created = await Promise.all(
        templateQuestions.map((q) =>
          prisma.importantQuestion.create({
            data: {
              subjectId: subject.id,
              question: q.q,
              unitId: q.unit,
              marks: q.marks,
              frequency: q.bloom,
              uploadedById: session.userId,
              uploadedByName: authorName,
              status: 'published',
            },
          })
        )
      )

      const formatted = created.map((rec) => ({
        id: rec.id,
        unit: rec.unitId || 'Unit I',
        type: (rec.marks && rec.marks > 5 ? '16_mark' : '2_mark') as '2_mark' | '16_mark',
        marks: rec.marks || 2,
        q: rec.question,
        bloom: rec.frequency || 'L2: Understand',
      }))

      return NextResponse.json({
        success: true,
        message: 'Anna University standard question bank template loaded successfully!',
        questions: formatted,
      })
    }

    if (action === 'CLEAR') {
      await prisma.importantQuestion.deleteMany({
        where: { subjectId: subject.id },
      })
      return NextResponse.json({
        success: true,
        message: 'Question bank cleared successfully!',
      })
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Question bank API error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove individual question
export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, message: 'Question ID is required' }, { status: 400 })
    }

    await prisma.importantQuestion.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Question deleted successfully' })
  } catch (error: any) {
    console.error('Delete question error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete question' },
      { status: 500 }
    )
  }
}
