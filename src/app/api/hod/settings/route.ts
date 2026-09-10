import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const DEFAULT_HOD_SETTINGS = {
  attendanceThreshold: 75,
  showAttendanceBenchmark: true,
  academicTerm: '2025-2026 (Odd Semester)',
  regulation: 'R-2021 (Autonomous)',
  academicYear: '2025-2026',
  departmentCode: 'AI & DS',
  departmentName: 'Artificial Intelligence and Data Science',
  hodContactEmail: 'hod.aids@vsb.ac.in',
  smsDefaulters: true,
  emailQPUploads: true,
  weeklyDigest: true,
  autoLockRegister: true,
  odProofNotification: true,
  advisorApprovalRequired: true,
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'hod' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const saved = await prisma.systemSettings.findUnique({
      where: { key: 'hod_department_settings' },
    }).catch(() => null)

    let settings = { ...DEFAULT_HOD_SETTINGS }
    if (saved?.value) {
      try {
        const parsed = JSON.parse(saved.value)
        settings = { ...settings, ...parsed }
      } catch (err) {
        console.error('Failed to parse hod_department_settings JSON:', err)
      }
    }

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error('Error fetching HOD department settings:', error)
    return NextResponse.json({ error: 'Failed to fetch department settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'hod' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate and merge with defaults
    const updatedSettings = {
      attendanceThreshold: Number(body.attendanceThreshold) || 75,
      showAttendanceBenchmark: Boolean(body.showAttendanceBenchmark ?? true),
      academicTerm: String(body.academicTerm || '2025-2026 (Odd Semester)'),
      regulation: String(body.regulation || 'R-2021 (Autonomous)'),
      academicYear: String(body.academicYear || '2025-2026'),
      departmentCode: String(body.departmentCode || 'AI & DS'),
      departmentName: String(body.departmentName || 'Artificial Intelligence and Data Science'),
      hodContactEmail: String(body.hodContactEmail || 'hod.aids@vsb.ac.in'),
      smsDefaulters: Boolean(body.smsDefaulters ?? true),
      emailQPUploads: Boolean(body.emailQPUploads ?? true),
      weeklyDigest: Boolean(body.weeklyDigest ?? true),
      autoLockRegister: Boolean(body.autoLockRegister ?? true),
      odProofNotification: Boolean(body.odProofNotification ?? true),
      advisorApprovalRequired: Boolean(body.advisorApprovalRequired ?? true),
    }

    await prisma.systemSettings.upsert({
      where: { key: 'hod_department_settings' },
      update: {
        value: JSON.stringify(updatedSettings),
        updatedAt: new Date(),
      },
      create: {
        key: 'hod_department_settings',
        value: JSON.stringify(updatedSettings),
        description: 'V.S.B. AI & DS Department Configuration and Academic Policies',
        isPublic: false,
      },
    })

    // Log to Audit Trail
    await prisma.auditLog.create({
      data: {
        userName: session.name || 'Head of Department',
        action: 'UPDATE_DEPARTMENT_SETTINGS',
        module: 'hod_settings',
        details: `Updated department settings: Term ${updatedSettings.academicTerm}, Threshold ${updatedSettings.attendanceThreshold}%`,
        status: 'success',
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Department configuration saved successfully!',
      settings: updatedSettings,
    })
  } catch (error) {
    console.error('Error saving HOD department settings:', error)
    return NextResponse.json({ error: 'Failed to save department configuration' }, { status: 500 })
  }
}
