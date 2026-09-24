import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { YEAR_TO_DEFAULT_BATCH, getDefaultBatchForYear, getSemesterForYear } from '@/lib/academicBatch'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Only administrators can perform batch synchronization.' },
        { status: 403 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { targetYear, syncSemesters = false, forceAll = false } = body

    // Fetch students
    const where: any = {}
    if (targetYear && targetYear !== 'ALL') {
      where.year = Number(targetYear)
    }

    const students = await prisma.student.findMany({
      where,
      select: {
        id: true,
        registerNumber: true,
        year: true,
        semester: true,
        batch: true,
      },
    })

    let updatedCount = 0
    const updates: Promise<any>[] = []

    for (const student of students) {
      const year = Math.min(4, Math.max(1, student.year || 1))
      const expectedBatch = getDefaultBatchForYear(year)
      const expectedSem = syncSemesters ? getSemesterForYear(year, student.semester) : student.semester

      const batchNeedsUpdate = forceAll || !student.batch || student.batch.trim() === '' || (syncSemesters && student.batch !== expectedBatch)
      const semNeedsUpdate = syncSemesters && student.semester !== expectedSem

      if (batchNeedsUpdate || semNeedsUpdate) {
        updates.push(
          prisma.student.update({
            where: { id: student.id },
            data: {
              ...(batchNeedsUpdate ? { batch: expectedBatch } : {}),
              ...(semNeedsUpdate ? { semester: expectedSem } : {}),
            },
          })
        )
        updatedCount++
      }
    }

    // Run in parallel chunks of 25
    for (let i = 0; i < updates.length; i += 25) {
      await Promise.all(updates.slice(i, i + 25))
    }

    revalidatePath('/admin/students')
    revalidatePath('/dashboard/profile')

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${updatedCount} student records to their official batch schedule.`,
      updatedCount,
      totalChecked: students.length,
      defaultSchedule: YEAR_TO_DEFAULT_BATCH,
    })
  } catch (error: any) {
    console.error('Error during batch sync:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to synchronize student batches' },
      { status: 500 }
    )
  }
}
