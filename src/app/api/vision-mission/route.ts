import { NextResponse } from 'next/server'
import { ACADEMIC_FRAMEWORK } from '@/lib/visionMission'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: ACADEMIC_FRAMEWORK,
  })
}
