import { NextResponse } from 'next/server'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { code: 'asc' },
    })

    return NextResponse.json({ success: true, subjects })
  } catch (error: any) {
    console.error('Fetch subjects error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch subjects', error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRoleSession(['admin', 'hod'])
    const body = await request.json()

    const { code, name, credits = 4, category = 'Professional Core (PC)', description = '', semester = 1 } = body

    if (!code || !name) {
      return NextResponse.json(
        { success: false, message: 'Course Code and Course Name are required' },
        { status: 400 }
      )
    }

    const currentYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true },
    })
    const academicYearId = currentYear?.id || 'cmtmnsw30000apv1wxafyfv59'

    // Upsert or create subject
    const subject = await prisma.subject.upsert({
      where: {
        code_academicYearId: {
          code: code.toUpperCase().trim(),
          academicYearId,
        },
      },
      update: {
        name: name.trim(),
        credits: Number(credits),
        description: description || `Regulation 2021 curriculum course (Sem ${semester}) - ${category}`,
      },
      create: {
        code: code.toUpperCase().trim(),
        name: name.trim(),
        credits: Number(credits),
        description: description || `Regulation 2021 curriculum course (Sem ${semester}) - ${category}`,
        academicYearId,
      },
    })

    // Log action to audit log
    await prisma.auditLog.create({
      data: {
        userName: session.name || 'System Administrator',
        action: 'CREATE_SUBJECT',
        module: 'Curriculum',
        details: `Added new curricular course: ${subject.code} - ${subject.name}`,
        status: 'success',
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      subject,
      message: `Course ${subject.code} saved successfully`,
    })
  } catch (error: any) {
    console.error('Create subject error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to save subject' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireRoleSession(['admin', 'hod'])
    const { searchParams } = new URL(request.url)
    const clearAll = searchParams.get('all') === 'true'
    const id = searchParams.get('id')
    if (clearAll) {
      await prisma.unit.deleteMany({}).catch(() => {})
      await prisma.syllabus.deleteMany({}).catch(() => {})
      const del = await prisma.subject.deleteMany({}).catch(() => ({ count: 0 }))
      return NextResponse.json({
        success: true,
        message: `All ${del.count} courses cleared successfully from database`,
      })
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Subject ID is required' },
        { status: 400 }
      )
    }

    const subject = await prisma.subject.delete({
      where: { id },
    }).catch(() => null)

    if (subject) {
      await prisma.auditLog.create({
        data: {
          userName: session.name || 'System Administrator',
          action: 'DELETE_SUBJECT',
          module: 'Curriculum',
          details: `Removed course: ${subject.code} - ${subject.name}`,
          status: 'success',
        },
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      message: 'Course removed from curriculum successfully',
    })
  } catch (error: any) {
    console.error('Delete subject error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to remove subject' },
      { status: 500 }
    )
  }
}
