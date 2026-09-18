import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

let cachedStats: { data: any; timestamp: number } | null = null
const CACHE_TTL_MS = 15000 // 15 seconds fast in-memory cache

export async function GET() {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin' && session.role !== 'hod')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin or HOD role required.' }, { status: 403 })
    }
    const now = Date.now()
    if (cachedStats && now - cachedStats.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(
        { success: true, data: cachedStats.data, cached: true },
        {
          headers: {
            'Cache-Control': 'public, max-age=15, stale-while-revalidate=30',
          },
        }
      )
    }

    const [
      studentCount,
      facultyCount,
      hodCount,
      adminCount,
      subjectCount,
      resourceCount,
      questionPaperCount,
      projectCount,
      eventCount,
      announcementCount,
      achievementCount,
    ] = await Promise.all([
      prisma.student.count().catch(() => 0),
      prisma.faculty.count().catch(() => 0),
      prisma.hOD.count().catch(() => 0),
      prisma.admin.count().catch(() => 1),
      prisma.subject.count().catch(() => 0),
      prisma.resource.count().catch(() => 0),
      prisma.questionPaper.count().catch(() => 0),
      prisma.project.count().catch(() => 0),
      prisma.event.count().catch(() => 0),
      prisma.announcement.count().catch(() => 0),
      prisma.achievement.count().catch(() => 0),
    ])

    const data = {
      studentCount,
      facultyCount,
      hodCount,
      adminCount,
      subjectCount,
      resourceCount,
      questionPaperCount,
      projectCount,
      eventCount,
      announcementCount,
      achievementCount,
    }

    cachedStats = { data, timestamp: now }

    return NextResponse.json(
      { success: true, data, cached: false },
      {
        headers: {
          'Cache-Control': 'public, max-age=15, stale-while-revalidate=30',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
}
