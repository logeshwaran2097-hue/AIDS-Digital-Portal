import { NextResponse } from 'next/server'
import { getDepartmentClassAttendance } from '@/lib/attendanceService'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const today = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const result = await getDepartmentClassAttendance(today)

    return NextResponse.json(
      {
        success: true,
        classes: result,
        date: today,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching HOD class attendance:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch attendance records',
      },
      { status: 500 }
    )
  }
}
