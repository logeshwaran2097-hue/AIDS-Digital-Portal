import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      clearedInfo.resources = resCount.count
    }

    if (target === 'all' || target === 'question-papers') {
      const qpCount = await prisma.questionPaper.deleteMany({}).catch(() => ({ count: 0 }))
      clearedInfo.questionPapers = qpCount.count
    }

    if (target === 'all' || target === 'achievements') {
      const achCount = await prisma.achievement.deleteMany({}).catch(() => ({ count: 0 }))
      clearedInfo.achievements = achCount.count
    }

    if (target === 'all' || target === 'notifications') {
      const notifCount = await prisma.notification.deleteMany({}).catch(() => ({ count: 0 }))
      clearedInfo.notifications = notifCount.count
    }

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
