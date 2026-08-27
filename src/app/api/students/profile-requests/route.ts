import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Fetch profile change requests
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const registerNumber = searchParams.get('registerNumber')
    const status = searchParams.get('status')

    const where: any = {}
    if (registerNumber) where.registerNumber = registerNumber.trim().toUpperCase()
    if (status && status !== 'ALL') where.status = status

    const requests = await (prisma as any).profileChangeRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const parsed = requests.map((r: any) => {
      let requested = {}
      let current = {}
      try {
        requested = JSON.parse(r.requestedData)
      } catch {}
      try {
        current = JSON.parse(r.currentData || '{}')
      } catch {}

      return {
        id: r.id,
        studentId: r.studentId,
        registerNumber: r.registerNumber,
        studentName: r.studentName,
        requestedData: requested,
        currentData: current,
        reason: r.reason,
        status: r.status,
        adminNotes: r.adminNotes,
        reviewedBy: r.reviewedBy,
        reviewedAt: r.reviewedAt,
        createdAt: r.createdAt,
      }
    })

    return NextResponse.json({ success: true, requests: parsed })
  } catch (error) {
    console.error('Error fetching profile change requests:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch change requests' }, { status: 500 })
  }
}

// POST: Student submits a profile change request
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { registerNumber, studentName, requestedData, currentData, reason } = body

    if (!registerNumber || !requestedData) {
      return NextResponse.json(
        { success: false, message: 'Register Number and Requested Changes are required' },
        { status: 400 }
      )
    }

    const regUpper = registerNumber.trim().toUpperCase()

    // Find student in database if available
    const student = await prisma.student.findUnique({ where: { registerNumber: regUpper } }).catch(() => null)

    const newRequest = await (prisma as any).profileChangeRequest.create({
      data: {
        studentId: student?.id || null,
        registerNumber: regUpper,
        studentName: studentName || 'Student',
        requestedData: typeof requestedData === 'string' ? requestedData : JSON.stringify(requestedData),
        currentData: typeof currentData === 'string' ? currentData : JSON.stringify(currentData || {}),
        reason: reason || 'Student requested profile update',
        status: 'pending',
      },
    })

    // Also push an institutional notification for admin
    await prisma.notification.create({
      data: {
        title: `📝 Profile Edit Request: ${studentName} (${regUpper})`,
        message: `Student submitted details for official approval. Reason: ${reason || 'Profile update requested'}`,
        target: 'admin',
        createdByName: studentName || 'Student',
        status: 'published',
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Profile change request submitted for Admin approval.',
      request: newRequest,
    })
  } catch (error) {
    console.error('Error creating profile change request:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit profile change request: ' + String(error) },
      { status: 500 }
    )
  }
}

// PATCH: Admin approves or rejects a request
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, action, adminNotes, reviewedBy = 'Department Administrator' } = body

    if (!id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid request or action' }, { status: 400 })
    }

    const existing = await (prisma as any).profileChangeRequest.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Request not found' }, { status: 404 })
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    // If approved, update student & user in database
    if (action === 'approve') {
      let requested: any = {}
      try {
        requested = JSON.parse(existing.requestedData)
      } catch {}

      const regUpper = existing.registerNumber

      let student = await prisma.student.findUnique({ where: { registerNumber: regUpper } }).catch(() => null)
      if (student) {
        // Update student record
        await prisma.student.update({
          where: { id: student.id },
          data: {
            ...(requested.department ? { department: requested.department } : {}),
            ...(requested.year ? { year: Number(requested.year) } : {}),
            ...(requested.semester ? { semester: Number(requested.semester) } : {}),
            ...(requested.section ? { section: requested.section } : {}),
            ...(requested.dateOfBirth ? { dateOfBirth: new Date(requested.dateOfBirth) } : {}),
          },
        }).catch(() => {})

        // Update user record
        await prisma.user.update({
          where: { id: student.userId },
          data: {
            ...(requested.name ? { name: requested.name } : {}),
            ...(requested.email ? { email: requested.email.toLowerCase() } : {}),
            ...(requested.phone ? { phone: requested.phone } : {}),
          },
        }).catch(() => {})
      }

      // Notify the student
      await prisma.notification.create({
        data: {
          title: '✅ Profile Change Approved by Admin',
          message: `Your requested profile updates have been officially verified and applied to department records.`,
          target: 'student',
          createdByName: reviewedBy,
          status: 'published',
        },
      }).catch(() => {})
    } else {
      // Rejection notification
      await prisma.notification.create({
        data: {
          title: '❌ Profile Change Request Declined',
          message: `Admin review note: ${adminNotes || 'Changes could not be verified with university records.'}`,
          target: 'student',
          createdByName: reviewedBy,
          status: 'published',
        },
      }).catch(() => {})
    }

    const updated = await (prisma as any).profileChangeRequest.update({
      where: { id },
      data: {
        status: newStatus,
        adminNotes: adminNotes || null,
        reviewedBy,
        reviewedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: `Profile request ${newStatus} successfully`,
      request: updated,
    })
  } catch (error) {
    console.error('Error reviewing profile change request:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process request: ' + String(error) },
      { status: 500 }
    )
  }
}

// DELETE: Cancel or remove a request
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing request ID' }, { status: 400 })
    }

    await (prisma as any).profileChangeRequest.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Request cancelled successfully' })
  } catch (error) {
    console.error('Error deleting profile change request:', error)
    return NextResponse.json({ success: false, message: 'Failed to cancel request' }, { status: 500 })
  }
}
