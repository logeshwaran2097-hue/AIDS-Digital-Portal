import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// Setting key prefix for tracking responses: `form_tracker_${announcementId}`
// Stored as JSON: Array<{ studentId: string; registerNumber: string; studentName: string; completedAt: string }>

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const announcementId = searchParams.get('announcementId')
    const batchYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined
    const batchSection = searchParams.get('section') || undefined

    if (!announcementId) {
      return NextResponse.json({ success: false, message: 'Missing announcementId' }, { status: 400 })
    }

    // 1. Fetch completion records from SystemSettings
    const settingKey = `form_tracker_${announcementId}`
    const settingRecord = await prisma.systemSettings.findUnique({
      where: { key: settingKey },
    }).catch(() => null)

    let completedList: Array<{
      studentId: string
      registerNumber: string
      studentName: string
      completedAt: string
    }> = []

    if (settingRecord?.value) {
      try {
        completedList = JSON.parse(settingRecord.value)
      } catch {
        completedList = []
      }
    }

    // 2. Fetch target student cohort from database
    const studentFilter: any = {}
    if (batchYear) studentFilter.year = batchYear
    if (batchSection) studentFilter.section = batchSection

    const allCohortStudents = await prisma.student.findMany({
      where: studentFilter,
      orderBy: { registerNumber: 'asc' },
    }).catch(() => [])

    const userIds = allCohortStudents.map((s) => s.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
    }).catch(() => [])
    const userMap = new Map(users.map((u) => [u.id, u]))

    const completedRegSet = new Set(completedList.map((c) => c.registerNumber.toUpperCase()))

    const completedStudents: any[] = []
    const pendingStudents: any[] = []

    for (const student of allCohortStudents) {
      const user = userMap.get(student.userId)
      const reg = student.registerNumber.toUpperCase()
      const studentObj = {
        id: student.id,
        userId: student.userId,
        registerNumber: student.registerNumber,
        name: user?.name || student.registerNumber,
        email: user?.email || '',
        phone: user?.phone || '',
        parentPhone: student.parentPhone || '',
        year: student.year,
        section: student.section,
        attendance: student.attendance || '0%',
      }

      if (completedRegSet.has(reg)) {
        const comp = completedList.find((c) => c.registerNumber.toUpperCase() === reg)
        completedStudents.push({
          ...studentObj,
          completedAt: comp?.completedAt || 'Recently',
        })
      } else {
        pendingStudents.push(studentObj)
      }
    }

    return NextResponse.json({
      success: true,
      announcementId,
      totalCount: allCohortStudents.length,
      completedCount: completedStudents.length,
      pendingCount: pendingStudents.length,
      completedStudents,
      pendingStudents,
    })
  } catch (error) {
    console.error('Form tracker GET error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch form completion status' }, { status: 500 })
  }
}

// Student marks form as completed or auto-detect on clicking form
export async function POST(request: Request) {
  try {
    const session = await getSession()
    const body = await request.json()
    const { announcementId, studentId, registerNumber, studentName } = body

    if (!announcementId) {
      return NextResponse.json({ success: false, message: 'Missing announcementId' }, { status: 400 })
    }

    // Determine student info from session if student, or from request body
    let finalReg = registerNumber
    let finalName = studentName
    let finalStudentId = studentId

    if (session && session.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: session.userId },
      }).catch(() => null)
      if (student) {
        finalReg = student.registerNumber
        finalStudentId = student.id
        finalName = session.name || student.registerNumber
      }
    }

    if (!finalReg) {
      return NextResponse.json({ success: false, message: 'Could not identify student' }, { status: 400 })
    }

    const settingKey = `form_tracker_${announcementId}`
    const existing = await prisma.systemSettings.findUnique({
      where: { key: settingKey },
    }).catch(() => null)

    let list: Array<{
      studentId: string
      registerNumber: string
      studentName: string
      completedAt: string
    }> = []

    if (existing?.value) {
      try {
        list = JSON.parse(existing.value)
      } catch {
        list = []
      }
    }

    const regUpper = finalReg.toUpperCase()
    const alreadyCompleted = list.some((i) => i.registerNumber.toUpperCase() === regUpper)

    if (!alreadyCompleted) {
      list.push({
        studentId: finalStudentId || '',
        registerNumber: finalReg,
        studentName: finalName || finalReg,
        completedAt: new Date().toISOString(),
      })

      await prisma.systemSettings.upsert({
        where: { key: settingKey },
        create: {
          key: settingKey,
          value: JSON.stringify(list),
          description: `Form Tracker for Announcement ${announcementId}`,
          isPublic: false,
        },
        update: {
          value: JSON.stringify(list),
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Form response status recorded successfully',
      alreadyCompleted,
      totalCompleted: list.length,
    })
  } catch (error) {
    console.error('Form tracker POST error:', error)
    return NextResponse.json({ success: false, message: 'Failed to record form status' }, { status: 500 })
  }
}
