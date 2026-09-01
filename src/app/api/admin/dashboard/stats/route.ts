import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET() {
  try {
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

    return NextResponse.json(
      {
        success: true,
        data: {
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
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
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
