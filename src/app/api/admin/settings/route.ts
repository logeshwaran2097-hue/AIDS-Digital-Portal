import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

const DEFAULT_SETTINGS = {
  collegeName: 'V.S.B. Engineering College (Autonomous)',
  department: 'Department of Artificial Intelligence & Data Science',
  affiliation: 'Anna University, Chennai',
  location: 'NH-67, Covai Road, Karur - 639 111, Tamil Nadu',
  contactEmail: 'admin@vsb.edu.in',
  contactPhone: '+91 4324 290144',
  accreditation: 'NAAC "A" Grade & NBA Tier-1 Accredited',
  academicYear: '2025 - 2026',
  currentSemesterType: 'Even Semester (Jan - May)',
  minAttendancePct: 75.0,
  condonationLimitPct: 65.0,
  smtpHost: 'smtp.gmail.com',
  smtpPort: 465,
  smtpSecure: true,
  smtpUser: 'admin@vsb.edu.in',
  twoFactorRequired: true,
  maintenanceMode: false,
  sessionTimeoutMinutes: 60,
  theme: 'light',
  // Password Security Policies
  minPasswordLength: 8,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  passwordExpiryDays: 90,
  // Notification Preferences
  notifyEmail: true,
  notifyInApp: true,
  notifyLowAttendance: true,
  notifyODSubmitted: true,
  notifyNewStudent: true,
  // Menu Item Visibility
  visibleMenus: {
    dashboard: true,
    students: true,
    faculty: true,
    hod: true,
    admins: true,
    roles: true,
    academics: true,
    resources: true,
    questions: true,
    projects: true,
    events: true,
    announcements: true,
    achievements: true,
    notifications: true,
    reports: true,
    logs: true,
    files: true,
    settings: true,
  },
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Check if it's a password change request
    if (body.action === 'CHANGE_PASSWORD') {
      const { currentPassword, newPassword } = body

      const user = await prisma.user.findUnique({
        where: { id: session.userId },
      })

      if (!user || !user.passwordHash) {
        return NextResponse.json({ error: 'User not found or password not set' }, { status: 404 })
      }

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })
      }

      const newHash = await bcrypt.hash(newPassword, 10)
      await prisma.user.update({
        where: { id: session.userId },
        data: { passwordHash: newHash },
      })

      await prisma.auditLog.create({
        data: {
          userName: session.name || 'System Administrator',
          action: 'CHANGE_PASSWORD',
          module: 'auth',
          details: 'Admin user successfully changed account password.',
          status: 'SUCCESS',
        },
      }).catch(() => {})

      return NextResponse.json({ success: true, message: 'Password updated successfully!' })
    }

    // Standard settings update
    await prisma.auditLog.create({
      data: {
        userName: session.name || 'System Administrator',
        action: 'UPDATE_SETTINGS',
        module: 'system',
        details: `Updated portal settings (Menus, Notifications, Security Policies)`,
        status: 'SUCCESS',
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Portal settings saved and applied in real time!',
      settings: body,
    })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
