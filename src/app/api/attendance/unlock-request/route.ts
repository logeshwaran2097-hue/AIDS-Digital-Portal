import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { cachedDbQuery, invalidateCache } from '@/lib/dbCache'

export const dynamic = 'force-dynamic'

export interface AttendanceUnlockRequest {
  id: string
  sessionId?: string
  year: number
  section: string
  semester: number
  academicYear?: string
  sessionType: string // 'morning' | 'subject'
  subjectCode?: string
  subjectName?: string
  hour?: string
  date: string
  reason: string
  facultyId: string
  facultyName: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewNote?: string
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

const SETTINGS_KEY = 'attendance_unlock_requests'

async function getUnlockRequests(): Promise<AttendanceUnlockRequest[]> {
  return cachedDbQuery(
    'attendance_unlock_requests',
    async () => {
      try {
        const record = await (prisma as any).systemSettings?.findUnique?.({
          where: { key: SETTINGS_KEY },
        })
        if (record?.value) {
          return JSON.parse(record.value)
        }
      } catch (err) {
        console.error('Error fetching unlock requests from systemSettings:', err)
      }
      return []
    },
    3000,
    ['attendance']
  )
}

async function saveUnlockRequests(requests: AttendanceUnlockRequest[]) {
  try {
    await (prisma as any).systemSettings?.upsert?.({
      where: { key: SETTINGS_KEY },
      create: {
        key: SETTINGS_KEY,
        value: JSON.stringify(requests),
        description: 'Attendance unlock permission requests queue',
        isPublic: false,
      },
      update: {
        value: JSON.stringify(requests),
      },
    })
  } catch (err) {
    console.error('Error saving unlock requests to systemSettings:', err)
  } finally {
    // Instantly invalidate attendance and notification caches
    invalidateCache('attendance')
    invalidateCache('notifications')
  }
}

// GET: Fetch unlock requests (for HOD or specific class/session status)
export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const section = searchParams.get('section')
    const date = searchParams.get('date')
    const sessionType = searchParams.get('sessionType')
    const subjectCode = searchParams.get('subjectCode')
    const hour = searchParams.get('hour')
    const sessionId = searchParams.get('sessionId')
    const pendingOnly = searchParams.get('pendingOnly') === 'true'

    const allRequests = await getUnlockRequests()

    // Filter by specific session if params provided
    if (sessionId || (year && section && date)) {
      const match = allRequests.find((r) => {
        if (sessionId && r.sessionId === sessionId) return true
        const sameClass =
          r.year === parseInt(year || '0') &&
          r.section?.toUpperCase() === section?.toUpperCase() &&
          r.date === date &&
          r.sessionType === (sessionType || 'morning')
        if (!sameClass) return false
        if (sessionType === 'subject') {
          return r.subjectCode === (subjectCode || '') && (r.hour || '') === (hour || '')
        }
        return true
      })

      return NextResponse.json({
        success: true,
        request: match || null,
      })
    }

    // Otherwise return list for HOD dashboard
    let filtered = allRequests
    if (pendingOnly) {
      filtered = filtered.filter((r) => r.status === 'PENDING')
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      success: true,
      requests: filtered,
      pendingCount: allRequests.filter((r) => r.status === 'PENDING').length,
    })
  } catch (error) {
    console.error('Unlock requests GET error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve unlock requests' }, { status: 500 })
  }
}

// POST: Advisor creates unlock request, or HOD approves/rejects
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    // ──────────────────────────────────────────────────────────────────────────
    // 1. Advisor asks permission to HOD to edit attendance
    // ──────────────────────────────────────────────────────────────────────────
    if (action === 'REQUEST') {
      const {
        sessionId,
        year,
        section,
        semester,
        academicYear = '2025-2026',
        sessionType = 'morning',
        subjectCode,
        subjectName,
        hour,
        date,
        reason,
      } = body

      if (!reason || !reason.trim()) {
        return NextResponse.json({ success: false, message: 'A reason for editing locked attendance is required' }, { status: 400 })
      }

      const allRequests = await getUnlockRequests()

      const className = `Year ${year} - Sec ${section} (Sem ${semester})`
      const sessionLabel = sessionType === 'morning' ? 'Morning Roll Call' : `${subjectCode || 'Subject'}${hour ? ` (${hour})` : ''}`

      const newRequest: AttendanceUnlockRequest = {
        id: `unlock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        sessionId: sessionId || undefined,
        year: parseInt(year),
        section: section?.toUpperCase() || 'A',
        semester: parseInt(semester || '1'),
        academicYear,
        sessionType,
        subjectCode: subjectCode || undefined,
        subjectName: subjectName || undefined,
        hour: hour || undefined,
        date,
        reason: reason.trim(),
        facultyId: session.userId,
        facultyName: session.name || 'Class Advisor',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Remove existing pending request for the exact same session if any
      const updatedRequests = allRequests.filter((r) => {
        const sameSession =
          r.year === newRequest.year &&
          r.section === newRequest.section &&
          r.date === newRequest.date &&
          r.sessionType === newRequest.sessionType &&
          (newRequest.sessionType !== 'subject' || (r.subjectCode === newRequest.subjectCode && r.hour === newRequest.hour))
        return !(sameSession && r.status === 'PENDING')
      })

      updatedRequests.unshift(newRequest)
      await saveUnlockRequests(updatedRequests)

      // Send High-Priority Immediate Notification to HOD
      try {
        await prisma.notification.create({
          data: {
            title: `🔓 Attendance Unlock Request: ${className}`,
            message: `${session.name || 'Class Advisor'} requested permission to make changes in locked attendance for ${className} · ${sessionLabel} (${date}). Reason: "${reason.trim()}".`,
            target: 'hod',
            createdByName: session.name || 'Class Advisor',
            status: 'published',
            publishedAt: new Date(),
            readBy: '[]',
          },
        })
      } catch (notifErr) {
        console.warn('Could not post notification to HOD for unlock request:', notifErr)
      }

      // Log Audit Event
      try {
        await prisma.auditLog.create({
          data: {
            userName: session.name || 'Class Advisor',
            action: 'ATTENDANCE_UNLOCK_REQUESTED',
            module: 'attendance',
            details: `Unlock requested by ${session.name} for ${className} ${sessionLabel} on ${date}. Reason: ${reason}`,
            status: 'success',
          },
        })
      } catch {}

      return NextResponse.json({
        success: true,
        message: 'Unlock request submitted to HOD successfully. You will be able to edit once approved.',
        request: newRequest,
      })
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. HOD Approves the unlock request
    // ──────────────────────────────────────────────────────────────────────────
    if (action === 'APPROVE') {
      const { requestId, reviewNote } = body
      if (!requestId) {
        return NextResponse.json({ success: false, message: 'Request ID is required' }, { status: 400 })
      }

      const allRequests = await getUnlockRequests()
      const targetReq = allRequests.find((r) => r.id === requestId)

      if (!targetReq) {
        return NextResponse.json({ success: false, message: 'Unlock request not found' }, { status: 404 })
      }

      targetReq.status = 'APPROVED'
      targetReq.reviewNote = reviewNote || 'Approved by HOD'
      targetReq.reviewedBy = session.name || 'Head of Department'
      targetReq.reviewedAt = new Date().toISOString()
      targetReq.updatedAt = new Date().toISOString()

      await saveUnlockRequests(allRequests)

      // Unlock the AttendanceSession in the database so the advisor can edit!
      try {
        const db = prisma as any
        if (db.attendanceSession) {
          const whereClause: any = {
            sessionType: targetReq.sessionType,
            year: targetReq.year,
            section: targetReq.section,
            date: targetReq.date,
          }
          if (targetReq.sessionType === 'subject' && targetReq.subjectCode) {
            whereClause.subjectCode = targetReq.subjectCode
            if (targetReq.hour) whereClause.hour = targetReq.hour
          }

          const existingSession = await db.attendanceSession.findFirst({ where: whereClause })
          if (existingSession) {
            await db.attendanceSession.update({
              where: { id: existingSession.id },
              data: { isLocked: false },
            })
          }
        }
      } catch (unlockErr) {
        console.warn('Could not unlock database attendanceSession:', unlockErr)
      }

      const className = `Year ${targetReq.year} - Sec ${targetReq.section}`
      const sessionLabel = targetReq.sessionType === 'morning' ? 'Morning Roll Call' : `${targetReq.subjectCode || 'Subject'}`

      // Send Notification to Faculty / Advisor
      try {
        await prisma.notification.create({
          data: {
            title: `✅ Attendance Register Unlocked by HOD: ${className}`,
            message: `HOD (${session.name || 'Head of Department'}) approved the unlock request for ${className} · ${sessionLabel} (${targetReq.date}). You can now make required adjustments and re-lock.`,
            target: 'faculty',
            createdByName: session.name || 'Head of Department',
            status: 'published',
            publishedAt: new Date(),
            readBy: '[]',
          },
        })
      } catch (notifErr) {
        console.warn('Could not post unlock approval notification:', notifErr)
      }

      // Log Audit Event
      try {
        await prisma.auditLog.create({
          data: {
            userName: session.name || 'HOD',
            action: 'ATTENDANCE_UNLOCK_APPROVED',
            module: 'attendance',
            details: `HOD ${session.name} approved attendance unlock for ${className} ${sessionLabel} on ${targetReq.date} requested by ${targetReq.facultyName}`,
            status: 'success',
          },
        })
      } catch {}

      return NextResponse.json({
        success: true,
        message: 'Attendance register unlocked successfully. Advisor has been notified.',
        request: targetReq,
      })
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. HOD Rejects the unlock request
    // ──────────────────────────────────────────────────────────────────────────
    if (action === 'REJECT') {
      const { requestId, reviewNote } = body
      if (!requestId) {
        return NextResponse.json({ success: false, message: 'Request ID is required' }, { status: 400 })
      }

      const allRequests = await getUnlockRequests()
      const targetReq = allRequests.find((r) => r.id === requestId)

      if (!targetReq) {
        return NextResponse.json({ success: false, message: 'Unlock request not found' }, { status: 404 })
      }

      targetReq.status = 'REJECTED'
      targetReq.reviewNote = reviewNote || 'Request declined by HOD'
      targetReq.reviewedBy = session.name || 'Head of Department'
      targetReq.reviewedAt = new Date().toISOString()
      targetReq.updatedAt = new Date().toISOString()

      await saveUnlockRequests(allRequests)

      const className = `Year ${targetReq.year} - Sec ${targetReq.section}`
      const sessionLabel = targetReq.sessionType === 'morning' ? 'Morning Roll Call' : `${targetReq.subjectCode || 'Subject'}`

      // Send Notification to Faculty / Advisor
      try {
        await prisma.notification.create({
          data: {
            title: `❌ Attendance Unlock Request Declined: ${className}`,
            message: `HOD (${session.name || 'Head of Department'}) declined the unlock request for ${className} · ${sessionLabel} (${targetReq.date}). Reason: ${reviewNote || 'Permission not granted.'}`,
            target: 'faculty',
            createdByName: session.name || 'Head of Department',
            status: 'published',
            publishedAt: new Date(),
            readBy: '[]',
          },
        })
      } catch (notifErr) {
        console.warn('Could not post unlock rejection notification:', notifErr)
      }

      // Log Audit Event
      try {
        await prisma.auditLog.create({
          data: {
            userName: session.name || 'HOD',
            action: 'ATTENDANCE_UNLOCK_REJECTED',
            module: 'attendance',
            details: `HOD ${session.name} rejected attendance unlock for ${className} ${sessionLabel} on ${targetReq.date}. Reason: ${reviewNote || 'None'}`,
            status: 'success',
          },
        })
      } catch {}

      return NextResponse.json({
        success: true,
        message: 'Unlock request declined.',
        request: targetReq,
      })
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Unlock request POST error:', error)
    return NextResponse.json({ success: false, message: 'Failed to process unlock request' }, { status: 500 })
  }
}
