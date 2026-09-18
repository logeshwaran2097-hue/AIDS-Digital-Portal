import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { clearAllDbCache } from '@/lib/dbCache'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { target = 'all' } = body

    let clearedInfo: Record<string, number> = {}

    if (target === 'all' || target === 'students') {
      const studentCount = await prisma.student.deleteMany({})
      const studentUsers = await prisma.user.deleteMany({
        where: { role: 'student' },
      })
      clearedInfo.students = studentCount.count
      clearedInfo.studentUsers = studentUsers.count
    }

    if (target === 'all' || target === 'faculty') {
      const facultyCount = await prisma.faculty.deleteMany({})
      const facultyUsers = await prisma.user.deleteMany({
        where: { role: 'faculty' },
      })
      clearedInfo.faculty = facultyCount.count
      clearedInfo.facultyUsers = facultyUsers.count
    }

    if (target === 'all' || target === 'hod') {
      const hodCount = await prisma.hOD.deleteMany({})
      const hodUsers = await prisma.user.deleteMany({
        where: { role: 'hod' },
      })
      clearedInfo.hod = hodCount.count
      clearedInfo.hodUsers = hodUsers.count
    }

    if (target === 'all' || target === 'advisors') {
      const ca = await prisma.classAdvisor.deleteMany({})
      clearedInfo.classAdvisors = ca.count
    }

    if (target === 'all' || target === 'attendance') {
      const ar = await prisma.attendanceRecord.deleteMany({})
      const as = await prisma.attendanceSession.deleteMany({})
      clearedInfo.attendanceRecords = ar.count
      clearedInfo.attendanceSessions = as.count
    }

    if (target === 'all' || target === 'od') {
      const odp = await prisma.oDProof.deleteMany({})
      clearedInfo.odProofs = odp.count
    }

    if (target === 'all' || target === 'announcements') {
      const annCount = await prisma.announcement.deleteMany({}).catch(() => ({ count: 0 }))
      clearedInfo.announcements = annCount.count
    }

    if (target === 'all' || target === 'events') {
      const evCount = await prisma.event.deleteMany({}).catch(() => ({ count: 0 }))
      clearedInfo.events = evCount.count
    }

    if (target === 'all' || target === 'projects') {
      const projCount = await prisma.project.deleteMany({}).catch(() => ({ count: 0 }))
      clearedInfo.projects = projCount.count
    }

    if (target === 'all' || target === 'resources') {
      const resCount = await prisma.resource.deleteMany({}).catch(() => ({ count: 0 }))
      const noteCount = await prisma.note.deleteMany({}).catch(() => ({ count: 0 }))
      const lmCount = await prisma.labManual.deleteMany({}).catch(() => ({ count: 0 }))
      clearedInfo.resources = resCount.count
      clearedInfo.notes = noteCount.count
      clearedInfo.labManuals = lmCount.count
    }

    if (target === 'all' || target === 'question-papers') {
      const qpCount = await prisma.questionPaper.deleteMany({}).catch(() => ({ count: 0 }))
      const iqCount = await prisma.importantQuestion.deleteMany({}).catch(() => ({ count: 0 }))
      clearedInfo.questionPapers = qpCount.count
      clearedInfo.importantQuestions = iqCount.count
    }

    if (target === 'all' || target === 'achievements') {
      const achCount = await prisma.achievement.deleteMany({}).catch(() => ({ count: 0 }))
      clearedInfo.achievements = achCount.count
    }

    if (target === 'all' || target === 'notifications') {
      const notifCount = await prisma.notification.deleteMany({}).catch(() => ({ count: 0 }))
      clearedInfo.notifications = notifCount.count
    }

    if (target === 'all' || target === 'subjects' || target === 'academics') {
      const unitCount = await prisma.unit.deleteMany({}).catch(() => ({ count: 0 }))
      const sylCount = await prisma.syllabus.deleteMany({}).catch(() => ({ count: 0 }))
      const subCount = await prisma.subject.deleteMany({}).catch(() => ({ count: 0 }))
      clearedInfo.units = unitCount.count
      clearedInfo.syllabi = sylCount.count
      clearedInfo.subjects = subCount.count
    }

    // Instantly wipe query cache so fresh data is loaded on the very next render
    clearAllDbCache()

    return NextResponse.json({
      success: true,
      message: 'All mock/sample data cleared successfully from database. Admin account is preserved.',
      cleared: clearedInfo,
    })
  } catch (error) {
    console.error('Error clearing mock data:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to clear mock data', error: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  return POST(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ target: 'all' }) }))
}
