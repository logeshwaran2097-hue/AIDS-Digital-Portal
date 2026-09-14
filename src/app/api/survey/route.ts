import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    const body = await req.json()

    const { helpfulFeatures, eliminatesPaperwork, role, comments } = body

    if (!helpfulFeatures || !Array.isArray(helpfulFeatures)) {
      return NextResponse.json({ error: 'Helpful features list is required' }, { status: 400 })
    }

    // Record survey in AuditLog or system logs
    await prisma.auditLog.create({
      data: {
        userName: session?.name || 'Anonymous Student',
        action: 'SURVEY_SUBMISSION',
        module: 'QualityAssurance',
        status: 'success',
        details: JSON.stringify({
          survey: 'AI & DS Digital Portal Feedback & Usability Survey',
          helpfulFeatures,
          eliminatesPaperwork,
          role: role || session?.role || 'student',
          comments,
          submittedAt: new Date().toISOString()
        })
      }
    }).catch((err) => {
      console.warn('Could not record to AuditLog:', err)
    })

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback! Your survey response has been recorded successfully.'
    })
  } catch (error: any) {
    console.error('Survey error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
