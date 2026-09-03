import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'json'

    // 1. Download raw SQLite database file directly
    if (type === 'sqlite') {
      const dbPath = path.join(process.cwd(), 'dev.db')
      if (!fs.existsSync(dbPath)) {
        return NextResponse.json({ error: 'Database file not found on disk' }, { status: 404 })
      }
      const fileBuffer = fs.readFileSync(dbPath)
      const dateStr = new Date().toISOString().split('T')[0]
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="VSB_AI_DS_Database_${dateStr}.db"`,
        },
      })
    }

    // 2. Full structured JSON backup of all tables
    const [
      users,
      students,
      faculties,
      hods,
      admins,
      subjects,
      resources,
      questionPapers,
      projects,
      events,
      announcements,
      achievements,
      auditLogs,
    ] = await Promise.all([
      prisma.user.findMany({ select: { id: true, email: true, name: true, phone: true, role: true, status: true, createdAt: true } }),
      prisma.student.findMany(),
      prisma.faculty.findMany(),
      prisma.hOD.findMany(),
      prisma.admin.findMany(),
      prisma.subject.findMany().catch(() => []),
      prisma.resource.findMany().catch(() => []),
      prisma.questionPaper.findMany().catch(() => []),
      prisma.project.findMany().catch(() => []),
      prisma.event.findMany().catch(() => []),
      prisma.announcement.findMany().catch(() => []),
      prisma.achievement.findMany().catch(() => []),
      prisma.auditLog.findMany({ take: 500, orderBy: { createdAt: 'desc' } }).catch(() => []),
    ])

    const backupPayload = {
      meta: {
        portal: 'V.S.B. AI & DS Digital Portal (Autonomous)',
        backupDate: new Date().toISOString(),
        exportedBy: session.name || session.email,
        version: '2.5.0-Enterprise-Full',
        counts: {
          users: users.length,
          students: students.length,
          faculties: faculties.length,
          hods: hods.length,
          admins: admins.length,
          subjects: subjects.length,
          resources: resources.length,
          questionPapers: questionPapers.length,
          projects: projects.length,
          events: events.length,
          announcements: announcements.length,
          achievements: achievements.length,
          auditLogs: auditLogs.length,
        },
      },
      data: {
        users,
        students,
        faculties,
        hods,
        admins,
        subjects,
        resources,
        questionPapers,
        projects,
        events,
        announcements,
        achievements,
        auditLogs,
      },
    }

    return NextResponse.json({
      success: true,
      backup: backupPayload,
    })
  } catch (error) {
    console.error('Database backup error:', error)
    return NextResponse.json({ error: 'Failed to generate database backup' }, { status: 500 })
  }
}
