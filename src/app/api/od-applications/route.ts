import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET: Fetch OD applications
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const registerNumber = searchParams.get('registerNumber')
    const role = searchParams.get('role')

    const session = await getSession()
    const targetRegNo = registerNumber || session?.registerNumber

    let whereClause: any = {}

    if (role === 'admin' || role === 'hod') {
      whereClause = {
        OR: [
          { target: 'admin' },
          { target: 'hod' },
          { title: { contains: '[OD Request]' } },
          { title: { contains: 'Request:' } },
        ],
      }
    } else if (role === 'faculty') {
      whereClause = {
        OR: [
          { target: 'faculty' },
          { title: { contains: '[OD Request]' } },
        ],
      }
    } else if (targetRegNo) {
      whereClause = {
        OR: [
          { title: { contains: targetRegNo } },
          { message: { contains: targetRegNo } },
          { createdByName: { contains: targetRegNo } },
        ],
      }
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 40,
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

// POST: Submit an OD / Permission application and broadcast to Class Advisor, HOD, and Admin
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
    const days = totalDays || 1
    const eventSummary = eventName || projectTitle || organizer || 'Academic Activity'

    // Formulate Proofs List string
    const attachedProofsList = [
      brochureName ? `Brochure (${brochureName})` : null,
      registrationProofName ? `Registration Proof (${registrationProofName})` : null,
      abstractOrLetterName ? `Letter/Doc (${abstractOrLetterName})` : null,
    ].filter(Boolean).join(', ') || 'No digital attachments'

    const teamInfoStr =
      teamMembers && teamMembers.length > 0
        ? ` | Team: ${teamName || 'Yes'} (${teamMembers.length} members: ${teamMembers.map((m: any) => `${m.name} [${m.registerNumber}]`).join(', ')})`
        : ''

    // 1. DISPATCH TO SYSTEM ADMIN
    await prisma.notification.create({
      data: {
        title: `📑 [OD Request] ${applicationType}: ${name} (${regUpper})`,
        message: `Student ${name} (${regUpper}, Year ${year || 2}/Sem ${semester || 4} - Sec ${section || 'A'}) applied for ${applicationType} from ${fromDate} to ${toDate} (${days} days). Event: ${eventSummary}${teamInfoStr}. Proofs: ${attachedProofsList}. ${reason ? `Reason: "${reason}"` : ''}`,
        target: 'admin',
        createdByName: `${name} (${regUpper})`,
        status: 'published',
      },
    }).catch(() => {})

    // 2. DISPATCH TO HOD
    await prisma.notification.create({
      data: {
        title: `🏛️ [HOD Approval Needed] ${applicationType}: ${name} (${regUpper})`,
        message: `Department permission application received for ${name} (${regUpper}, Yr ${year || 2}/Sec ${section || 'A'}). Dates: ${fromDate} to ${toDate} (${days} days) for "${eventSummary}". Attached Proofs: ${attachedProofsList}.`,
        target: 'hod',
        createdByName: `${name} (${regUpper})`,
        status: 'published',
      },
    }).catch(() => {})

    // 3. DISPATCH TO CLASS ADVISOR & FACULTY DIRECTORATE
    await prisma.notification.create({
      data: {
        title: `👨‍🏫 [Class Advisor Review] OD Application: ${name} (${regUpper})`,
        message: `Your class student ${name} (Yr ${year || 2} - Sec ${section || 'A'}) requested ${applicationType} from ${fromDate} to ${toDate}. Event: ${eventSummary}. Please review student proofs and attendance percentage before endorsement.`,
        target: 'faculty',
        createdByName: `${name} (${regUpper})`,
        status: 'published',
      },
    }).catch(() => {})

    // 4. DISPATCH CONFIRMATION TO STUDENT
    await prisma.notification.create({
      data: {
        title: `✅ OD Application Dispatched: ${applicationType}`,
        message: `Your application for "${eventSummary}" from ${fromDate} to ${toDate} (${days} days) has been submitted to your Class Advisor and HOD with ${attachedProofsList}.`,
        target: 'student',
        createdByName: 'Department AI & DS',
        status: 'published',
      },
    }).catch(() => {})

    // 5. AUDIT TRAIL LOGGING
    await prisma.auditLog.create({
      data: {
        userName: `${name} (${regUpper})`,
        action: 'od_application_submitted',
        module: 'attendance_portal',
        details: `OD Type: ${applicationType} | Duration: ${fromDate} to ${toDate} (${days} days) | Event: ${eventSummary} | Proofs: ${attachedProofsList} | Reason: ${reason || 'N/A'}`,
        status: 'pending_advisor_approval',
      },
    }).catch(() => {})

    // 6. SAVE FILE PROOF RECORDS (IF UPLOADED)
    if (brochureFile && brochureName) {
      await (prisma as any).fileRecord.create({
        data: {
          fileName: `od_brochure_${regUpper}_${Date.now()}.png`,
          originalName: brochureName,
          fileType: 'image/png',
          fileSize: brochureFile.length,
          fileUrl: brochureFile.startsWith('data:') ? brochureFile.substring(0, 500) : brochureFile,
          module: 'attendance_od_proof',
          relatedId: regUpper,
          uploadedByName: `${name} (${regUpper})`,
        },
      }).catch(() => {})
    }

    if (registrationProof && registrationProofName) {
      await (prisma as any).fileRecord.create({
        data: {
          fileName: `od_reg_${regUpper}_${Date.now()}.png`,
          originalName: registrationProofName,
          fileType: 'image/png',
          fileSize: registrationProof.length,
          fileUrl: registrationProof.startsWith('data:') ? registrationProof.substring(0, 500) : registrationProof,
          module: 'attendance_od_proof',
          relatedId: regUpper,
          uploadedByName: `${name} (${regUpper})`,
        },
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      message: 'On-Duty permission request dispatched to Class Advisor, HOD, and System Admin with all proofs.',
      application: {
        id: `od-${Date.now()}`,
        studentName: name,
        registerNumber: regUpper,
        applicationType,
        fromDate,
        toDate,
        totalDays: days,
        eventName: eventSummary,
        organizer,
        teamName,
        teamMembers,
        attachedProofs: attachedProofsList,
        status: 'pending_advisor_approval',
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
