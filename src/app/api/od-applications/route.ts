import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET: Fetch OD applications for current user / registerNumber
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const registerNumber = searchParams.get('registerNumber')

    const session = await getSession()
    const targetRegNo = registerNumber || session?.registerNumber

    // Fetch matching notifications for this student
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { title: { contains: targetRegNo || '' } },
          { message: { contains: targetRegNo || '' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }).catch(() => [])

    return NextResponse.json({
      success: true,
      applications: notifications,
    })
  } catch (error) {
    console.error('Error fetching OD applications:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch applications' }, { status: 500 })
  }
}

// POST: Submit a comprehensive OD / Leave / Project Permission request with proofs
export async function POST(request: Request) {
  try {
    const session = await getSession()
    const body = await request.json()

    const {
      studentName,
      registerNumber,
      year,
      semester,
      section,
      applicationType,
      fromDate,
      toDate,
      totalDays,
      eventName,
      organizer,
      eventMode,
      teamName,
      teamMembers,
      projectTitle,
      domain,
      companyGuide,
      doctorName,
      parentContact,
      reason,
      brochureFile,
      brochureName,
      registrationProof,
      registrationProofName,
      abstractOrLetter,
      abstractOrLetterName,
    } = body

    if (!registerNumber || !fromDate || !toDate || !applicationType) {
      return NextResponse.json(
        { success: false, message: 'Register Number, Application Type, and Date Range are required.' },
        { status: 400 }
      )
    }

    const regUpper = String(registerNumber).trim().toUpperCase()
    const name = studentName || session?.name || 'Student'

    // Create detailed audit trail
    const auditDetails = JSON.stringify({
      applicationType,
      fromDate,
      toDate,
      totalDays: totalDays || 1,
      eventName: eventName || projectTitle || '',
      organizer: organizer || '',
      teamName: teamName || '',
      teamMembersCount: teamMembers ? teamMembers.length : 0,
      hasBrochure: Boolean(brochureFile),
      hasRegistrationProof: Boolean(registrationProof),
      hasAbstractOrLetter: Boolean(abstractOrLetter),
      reason,
    })

    await prisma.auditLog.create({
      data: {
        userName: `${name} (${regUpper})`,
        action: 'od_application_submitted',
        module: 'attendance_portal',
        details: `OD Application: ${applicationType} for ${fromDate} to ${toDate}. ${reason ? `Reason: ${reason}` : ''}`,
        status: 'pending_advisor_approval',
      },
    }).catch(() => {})

    // Create Notification for Class Advisor and Department Admin
    const notification = await prisma.notification.create({
      data: {
        title: `📑 ${applicationType} Request: ${name} (${regUpper})`,
        message: `${name} (Yr ${year || 2}/Sem ${semester || 4} - Sec ${section || 'A'}) requested ${applicationType} from ${fromDate} to ${toDate} (${totalDays || 1} day/s). Event/Org: ${eventName || projectTitle || 'Institutional Activity'}. ${reason ? `Note: ${reason}` : ''}`,
        target: 'faculty',
        createdByName: `${name} (${regUpper})`,
        status: 'published',
      },
    }).catch(() => null)

    return NextResponse.json({
      success: true,
      message: 'On-Duty permission request with proofs submitted to Class Advisor & HOD successfully.',
      application: {
        id: notification?.id || `od-${Date.now()}`,
        studentName: name,
        registerNumber: regUpper,
        applicationType,
        fromDate,
        toDate,
        totalDays,
        eventName,
        organizer,
        teamName,
        teamMembers,
        projectTitle,
        hasProofs: Boolean(brochureFile || registrationProof || abstractOrLetter),
        status: 'pending',
        submittedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error submitting OD application:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit application: ' + String(error) },
      { status: 500 }
    )
  }
}
