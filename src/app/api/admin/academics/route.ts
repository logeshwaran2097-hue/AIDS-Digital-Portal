import { NextResponse } from 'next/server'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateBody, adminAcademicsSchema } from '@/lib/validations/apiValidation'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const semParam = searchParams.get('semester')

    const dbSubjects = await prisma.subject.findMany({
      orderBy: { code: 'asc' },
    })

    const subjects = dbSubjects.map((s) => {
      let sem = 1
      let category = 'Professional Core (PC)'
      let facultyInCharge = ''
      let courseType: 'Theory' | 'Laboratory' | 'Theory cum Laboratory' = 'Theory'
      let exactCredits = Number(s.credits)

      if (s.description && s.description.startsWith('{')) {
        try {
          const meta = JSON.parse(s.description)
          if (meta.semester) sem = Number(meta.semester)
          if (meta.category) category = meta.category
          if (meta.facultyInCharge) facultyInCharge = meta.facultyInCharge
          if (meta.courseType) courseType = meta.courseType
          if (meta.exactCredits !== undefined) exactCredits = Number(meta.exactCredits)
        } catch {}
      } else {
        const match = s.code.match(/[A-Za-z]+[0-9]([1-8])/)
        sem = match ? parseInt(match[1], 10) : 1
      }

      return {
        id: s.id,
        code: s.code,
        name: s.name,
        credits: exactCredits,
        category,
        facultyInCharge,
        courseType,
        semester: sem,
        year: Math.ceil(sem / 2),
        description: s.description,
      }
    })

    const filtered = semParam && semParam !== 'ALL'
      ? subjects.filter((s) => s.semester === Number(semParam))
      : subjects

    return NextResponse.json({ success: true, subjects: filtered })
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
    const rawBody = await request.json().catch(() => ({}))
    const validation = validateBody(adminAcademicsSchema, rawBody)
    if (!validation.success) {
      return validation.response
    }
    const body = validation.data
    const {
      code,
      name,
      credits = 4,
      courseType = 'Theory',
      category = 'Professional Core (PC)',
      facultyInCharge = '',
      description = '',
      semester = 1,
    } = body

    const currentYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true },
    })
    const academicYearId = currentYear?.id || 'cmtmnsw30000apv1wxafyfv59'

    const metaDescription = JSON.stringify({
      semester: Number(semester),
      category,
      facultyInCharge,
      courseType,
      exactCredits: Number(credits),
      notes: description,
    })

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
        credits: Math.round(Number(credits)),
        description: metaDescription,
      },
      create: {
        code: code.toUpperCase().trim(),
        name: name.trim(),
        credits: Math.round(Number(credits)),
        description: metaDescription,
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
      subject: {
        id: subject.id,
        code: subject.code,
        name: subject.name,
        credits: Number(credits),
        courseType,
        category,
        facultyInCharge,
        semester: Number(semester),
        description: metaDescription,
      },
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

export async function PUT(request: Request) {
  try {
    const session = await requireRoleSession(['admin', 'hod'])
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json({ success: false, message: 'Subject ID is required for update' }, { status: 400 })
    }

    const {
      id,
      code,
      name,
      credits = 4,
      courseType = 'Theory',
      category = 'Professional Core (PC)',
      facultyInCharge = '',
      description = '',
      semester = 1,
    } = body

    const metaDescription = JSON.stringify({
      semester: Number(semester),
      category,
      facultyInCharge,
      courseType,
      exactCredits: Number(credits),
      notes: description,
    })

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        code: code.toUpperCase().trim(),
        name: name.trim(),
        credits: Math.round(Number(credits)),
        description: metaDescription,
      },
    })

    await prisma.auditLog.create({
      data: {
        userName: session.name || 'System Administrator',
        action: 'UPDATE_SUBJECT',
        module: 'Curriculum',
        details: `Updated course: ${subject.code} - ${subject.name}`,
        status: 'success',
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      subject: {
        id: subject.id,
        code: subject.code,
        name: subject.name,
        credits: Number(credits),
        courseType,
        category,
        facultyInCharge,
        semester: Number(semester),
        description: metaDescription,
      },
      message: `Course ${subject.code} updated successfully`,
    })
  } catch (error: any) {
    console.error('Update subject error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update subject' },
      { status: 500 }
    )
  }
}

