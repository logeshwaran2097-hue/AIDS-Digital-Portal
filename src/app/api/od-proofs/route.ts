import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { syncSanctionedODsForStudent, allocateSanctionedAttendance } from '@/lib/odSync'
import { cachedDbQuery, invalidateCache } from '@/lib/dbCache'
import { validateBody, odProofActionSchema } from '@/lib/validations/apiValidation'
import { generateDailyProofCheckpoints, parseDailyProofs } from '@/lib/dailyProofs'

export const dynamic = 'force-dynamic'

// GET: Fetch OD Proofs for student or class advisor
export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized session' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filterStatus = searchParams.get('status')
    const queryRegNo = searchParams.get('registerNumber')

    // 1. STUDENT VIEW
    if (session.role === 'student') {
      const activeRegNo = (session.registerNumber || '').trim().toUpperCase()
      
      let student = null
      if (activeRegNo) {
        student = await prisma.student.findFirst({ where: { registerNumber: activeRegNo } })
      } else if (session.userId) {
        student = await prisma.student.findFirst({ where: { userId: session.userId } })
      }

      if (!activeRegNo) {
        return NextResponse.json({ success: true, proofs: [], count: 0 })
      }

      const cacheKey = `student_proofs_${activeRegNo}_${filterStatus || 'ALL'}`
      const cachedData = await cachedDbQuery(
        cacheKey,
        async () => {
          // Auto-sync any sanctioned OD applications from Attendance/HOD approval into Event Proofs
          await syncSanctionedODsForStudent(activeRegNo, student)

          const proofs = await prisma.oDProof.findMany({
            where: {
              registerNumber: activeRegNo,
              ...(filterStatus && filterStatus !== 'ALL' ? { status: filterStatus } : {}),
            },
            orderBy: { createdAt: 'desc' },
          })

          const sanctionedProofs = proofs.filter(
            (p) => p.status === 'verified' || p.attendanceCredited || (p.advisorRemarks && p.advisorRemarks.toLowerCase().includes('sanction'))
          )

          return { proofs, sanctionedProofs }
        },
        4000,
        ['od_proofs', 'attendance']
      )

      return NextResponse.json({
        success: true,
        proofs: cachedData.proofs,
        count: cachedData.proofs.length,
        sanctionedCount: cachedData.sanctionedProofs.length,
        sanctionedProofs: cachedData.sanctionedProofs,
        student: {
          name: session.name,
          registerNumber: activeRegNo,
          year: student?.year || 2,
          section: student?.section || 'B',
          batch: student?.batch || '2024-2028',
        },
      })
    }

    // 2. FACULTY / CLASS ADVISOR VIEW
    // 2. HOD / SUPER ADMIN VIEW (Department-wide)
    if (session.role === 'hod' || session.role === 'admin') {
      const qYear = searchParams.get('year')
      const qSec = searchParams.get('section')
      const whereClause: any = {
        ...(qYear && qYear !== 'ALL' ? { year: Number(qYear) } : {}),
        ...(qSec && qSec !== 'ALL' ? { section: qSec.toUpperCase() } : {}),
        ...(filterStatus && filterStatus !== 'ALL' ? { status: filterStatus } : {}),
      }

      const cacheKey = `hod_proofs_${qYear || 'ALL'}_${qSec || 'ALL'}_${filterStatus || 'ALL'}`
      const hodData = await cachedDbQuery(
        cacheKey,
        async () => {
          const [proofs, allProofs] = await Promise.all([
            prisma.oDProof.findMany({
              where: whereClause,
              orderBy: { createdAt: 'desc' },
            }),
            prisma.oDProof.findMany(),
          ])

          const stats = {
            total: allProofs.length,
            pendingGeoTag: allProofs.filter((p) => !p.geoPhotoUrl).length,
            pendingCertificate: allProofs.filter((p) => !p.certificateUrl).length,
            readyForReview: allProofs.filter((p) => p.geoPhotoUrl && p.certificateUrl && p.status !== 'verified').length,
            verified: allProofs.filter((p) => p.status === 'verified').length,
          }

          return { proofs, stats }
        },
        4000,
        ['od_proofs']
      )

      return NextResponse.json({
        success: true,
        proofs: hodData.proofs,
        count: hodData.proofs.length,
        stats: hodData.stats,
        advisorJurisdiction: {
          year: 'ALL',
          section: 'ALL',
          batch: 'Department of AI & DS',
          advisorName: session.name || 'Head of Department',
        },
      })
    }

    // 3. FACULTY / CLASS ADVISOR VIEW
    if (session.role === 'faculty') {
      const faculty = await prisma.faculty.findFirst({
        where: { userId: session.userId },
      }).catch(() => null)

      const advisorYear = faculty?.advisorYear || 2
      const advisorSec = faculty?.advisorSec || 'B'

      const whereClause: any = {
        year: advisorYear,
        section: advisorSec,
        ...(filterStatus && filterStatus !== 'ALL' ? { status: filterStatus } : {}),
      }

      const cacheKey = `faculty_proofs_${advisorYear}_${advisorSec}_${filterStatus || 'ALL'}`
      const facultyData = await cachedDbQuery(
        cacheKey,
        async () => {
          const [proofs, allClassProofs] = await Promise.all([
            prisma.oDProof.findMany({
              where: whereClause,
              orderBy: { createdAt: 'desc' },
            }),
            prisma.oDProof.findMany({
              where: { year: advisorYear, section: advisorSec },
            }),
          ])

          const stats = {
            total: allClassProofs.length,
            pendingGeoTag: allClassProofs.filter((p) => !p.geoPhotoUrl).length,
            pendingCertificate: allClassProofs.filter((p) => !p.certificateUrl).length,
            readyForSignoff: allClassProofs.filter((p) => p.geoPhotoUrl && p.certificateUrl && p.status !== 'verified').length,
            verified: allClassProofs.filter((p) => p.status === 'verified').length,
          }

          return { proofs, stats }
        },
        4000,
        ['od_proofs']
      )

      return NextResponse.json({
        success: true,
        proofs: facultyData.proofs,
        count: facultyData.proofs.length,
        stats: facultyData.stats,
        advisorJurisdiction: {
          year: advisorYear,
          section: advisorSec,
          batch: faculty?.advisorBatch || `Year ${advisorYear} · Sec ${advisorSec}`,
        },
      })
    }

    return NextResponse.json({ success: false, message: 'Invalid role access' }, { status: 403 })
  } catch (error: any) {
    console.error('Error in GET /api/od-proofs:', error)
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 })
  }
}

// POST: Actions for Uploading Geotag, Certificate, Registering OD, and Advisor Verification
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const rawBody = await request.json().catch(() => ({}))
    const validation = validateBody(odProofActionSchema, rawBody)
    if (!validation.success) {
      return validation.response
    }
    const body = validation.data
    const { action } = body

    // Instantly invalidate caches on any mutation so next reads reflect state immediately
    invalidateCache('od_proofs')
    invalidateCache('attendance')
    invalidateCache('student_data')

    // 1. REGISTER NEW OD / HACKATHON
    if (action === 'REGISTER_OD') {
      const { eventName, category, eventDate, venueCollege, durationFormat } = body as any

      if (!eventName || !eventDate) {
        return NextResponse.json({ success: false, message: 'Event Name and Date are required' }, { status: 400 })
      }

      let student = null
      if (session.role === 'student') {
        student = await prisma.student.findFirst({
          where: {
            OR: [
              { userId: session.userId },
              { registerNumber: session.registerNumber || '' },
            ],
          },
        })
      }

      const registerNumber = student?.registerNumber || session.registerNumber || '922521104001'
      const studentName = session.name || 'Student'
      const year = student?.year || 2
      const section = student?.section || 'B'
      const semester = student?.semester || 3

      const format = durationFormat || (category === 'Hackathon' ? '24 Hours (2 Days)' : 'Single Day (8 Hours)')
      const checkpoints = generateDailyProofCheckpoints(category || 'Hackathon', eventDate, format)
      const dailyProofs = JSON.stringify(checkpoints)

      const newProof = await prisma.oDProof.create({
        data: {
          studentId: student?.id || null,
          registerNumber,
          studentName,
          year,
          section,
          semester,
          eventName: eventName.trim(),
          category: category || 'Hackathon',
          eventDate,
          durationFormat: format,
          dailyProofs,
          venueCollege: venueCollege ? venueCollege.trim() : null,
          status: 'pending_proofs',
        },
      })

      return NextResponse.json({
        success: true,
        message: 'OD Event registered! Please upload your daily proof checkpoints as per the hackathon schedule.',
        proof: newProof,
      })
    }

    // 2. UPLOAD STAGE 1: GEOTAGGED VENUE & DAILY SPRINT PHOTO
    if (action === 'UPLOAD_GEOTAG') {
      const { id, geoPhotoUrl, latitude, longitude, collegeName, collegeAddress, geoAddress, geoTimestamp, dayNumber, caption } = body as any

      if (!id || !geoPhotoUrl) {
        return NextResponse.json({ success: false, message: 'Proof ID and photo data required' }, { status: 400 })
      }

      const existing = await prisma.oDProof.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ success: false, message: 'OD record not found' }, { status: 404 })
      }

      if (session.role === 'student' && session.registerNumber && existing.registerNumber.toUpperCase() !== session.registerNumber.toUpperCase()) {
        return NextResponse.json({ success: false, message: 'Forbidden: You cannot upload proofs for another student\'s OD record.' }, { status: 403 })
      }

      const finalCollege = (collegeName || existing.venueCollege || '').trim()
      const finalAddress = (collegeAddress || geoAddress || '').trim()
      const targetDay = Number(dayNumber) || 1

      // Update daily checkpoints array
      const currentDailyProofs = parseDailyProofs(existing)
      const updatedCheckpoints = currentDailyProofs.map((item) => {
        if (item.dayNumber === targetDay) {
          return {
            ...item,
            photoUrl: geoPhotoUrl,
            geoAddress: finalAddress || item.geoAddress || null,
            timestamp: geoTimestamp ? new Date(geoTimestamp).toISOString() : new Date().toISOString(),
            caption: caption || item.caption || null,
            status: 'submitted' as const,
          }
        }
        return item
      })

      // Check if all daily checkpoints are submitted
      const allDailySubmitted = updatedCheckpoints.every((item) => item.status === 'submitted' && Boolean(item.photoUrl))
      const updatedStatus = allDailySubmitted && existing.certificateUrl ? 'under_review' : 'pending_proofs'

      // Keep primary geoPhotoUrl pointing to day 1 or fallback
      const primaryPhoto = targetDay === 1 || !existing.geoPhotoUrl ? geoPhotoUrl : existing.geoPhotoUrl

      const updated = await prisma.oDProof.update({
        where: { id },
        data: {
          geoPhotoUrl: primaryPhoto,
          dailyProofs: JSON.stringify(updatedCheckpoints),
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          venueCollege: finalCollege || null,
          geoAddress: finalAddress || null,
          geoTimestamp: geoTimestamp ? new Date(geoTimestamp) : new Date(),
          status: updatedStatus,
        },
      })

      // Notify Class Advisor
      await prisma.notification.create({
        data: {
          title: `📍 [OD Day ${targetDay} Proof Uploaded] ${existing.studentName} (${existing.registerNumber})`,
          message: `${existing.studentName} uploaded Day ${targetDay} live geo-tag photo for "${existing.eventName}" (${existing.category})${caption ? `: "${caption}"` : ''}.`,
          target: 'faculty',
          createdByName: existing.studentName,
          status: 'published',
        },
      }).catch(() => {})

      return NextResponse.json({
        success: true,
        message: `Day ${targetDay} Geo-Tag Photo verified & uploaded successfully!`,
        proof: updated,
      })
    }

    // 3. UPLOAD STAGE 2: COMPLETION CERTIFICATE
    if (action === 'UPLOAD_CERTIFICATE') {
      const { id, certificateUrl, certificateName, achievement } = body

      if (!id || !certificateUrl) {
        return NextResponse.json({ success: false, message: 'Proof ID and certificate data required' }, { status: 400 })
      }

      const existing = await prisma.oDProof.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ success: false, message: 'OD record not found' }, { status: 404 })
      }

      if (session.role === 'student' && session.registerNumber && existing.registerNumber.toUpperCase() !== session.registerNumber.toUpperCase()) {
        return NextResponse.json({ success: false, message: 'Forbidden: You cannot upload certificates for another student\'s OD record.' }, { status: 403 })
      }

      const updated = await prisma.oDProof.update({
        where: { id },
        data: {
          certificateUrl,
          certificateName: certificateName || 'Event_Certificate.pdf',
          achievement: achievement || 'Participation',
          status: 'under_review',
        },
      })

      // Notify Class Advisor that dossier is ready
      await prisma.notification.create({
        data: {
          title: `🏆 [OD Certificate Uploaded] ${existing.studentName} (${existing.registerNumber})`,
          message: `${existing.studentName} has submitted their certificate (${achievement || 'Participation'}) for "${existing.eventName}". Dossier ready for Class Advisor sign-off.`,
          target: 'faculty',
          createdByName: existing.studentName,
          status: 'published',
        },
      }).catch(() => {})

      return NextResponse.json({
        success: true,
        message: 'Event certificate submitted! Your Class Advisor will review and grant OD attendance.',
        proof: updated,
      })
    }

    // 4. CLASS ADVISOR: VERIFY & ENDORSE OD ATTENDANCE
    if (action === 'ADVISOR_VERIFY') {
      if (session.role !== 'faculty' && session.role !== 'admin' && session.role !== 'super_admin' && session.role !== 'hod') {
        return NextResponse.json({ success: false, message: 'Forbidden: Faculty or Admin role required.' }, { status: 403 })
      }

      const { id, remarks } = body

      if (!id) {
        return NextResponse.json({ success: false, message: 'Proof ID required' }, { status: 400 })
      }

      const existing = await prisma.oDProof.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ success: false, message: 'OD record not found' }, { status: 404 })
      }

      const defaultRemark = 'Geo-tag and Certificate verified. Officially approved and endorsed by Class Advisor.'

      const updated = await prisma.oDProof.update({
        where: { id },
        data: {
          status: 'advisor_approved',
          advisorRemarks: remarks ? remarks.trim() : defaultRemark,
          verifiedByName: session.name || 'Class Advisor',
          verifiedAt: new Date(),
          attendanceCredited: true,
        },
      })

      // 1. Dispatch confirmation notification to student
      await prisma.notification.create({
        data: {
          title: `✅ [OD Approved by Class Advisor] ${existing.eventName}`,
          message: `Your Class Advisor (${session.name || 'Advisor'}) has verified your venue geo-tag and certificate. Your On-Duty attendance has been endorsed and credited.`,
          target: 'student',
          createdByName: session.name || 'Class Advisor',
          status: 'published',
        },
      }).catch(() => {})

      // 2. Audit Trail
      await prisma.auditLog.create({
        data: {
          userName: session.name || 'Class Advisor',
          action: 'od_proof_advisor_verified',
          module: 'attendance_portal',
          details: `Class Advisor ${session.name} approved and endorsed OD for ${existing.studentName} (${existing.registerNumber}). Event: ${existing.eventName}.`,
          status: 'success',
        },
      }).catch(() => {})

      return NextResponse.json({
        success: true,
        message: `OD Attendance approved by Class Advisor for ${existing.studentName}!`,
        proof: updated,
      })
    }

    // 5. HOD: EXECUTIVE SANCTION & FINAL VERIFY
    if (action === 'HOD_APPROVE') {
      if (session.role !== 'hod' && session.role !== 'admin' && session.role !== 'super_admin') {
        return NextResponse.json({ success: false, message: 'Forbidden: HOD or Admin authorization required.' }, { status: 403 })
      }

      const { id, remarks } = body

      if (!id) {
        return NextResponse.json({ success: false, message: 'Proof ID required' }, { status: 400 })
      }

      const existing = await prisma.oDProof.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ success: false, message: 'OD record not found' }, { status: 404 })
      }

      const defaultRemark = 'HOD Sanctioned: Evidence verified. Officially sanctioned for department On-Duty attendance credit.'

      const finalEndorser = existing.verifiedByName
        ? `${existing.verifiedByName} (Advisor) & ${session.name || 'HOD'} (HOD)`
        : (session.name || 'Head of Department')

      const updated = await prisma.oDProof.update({
        where: { id },
        data: {
          status: 'verified',
          advisorRemarks: remarks ? remarks.trim() : (existing.advisorRemarks || defaultRemark),
          verifiedByName: finalEndorser,
          verifiedAt: new Date(),
          attendanceCredited: true,
        },
      })

      // 1. Dispatch notification to student
      await prisma.notification.create({
        data: {
          title: `🏛️ [HOD Executive Sanction] ${existing.eventName}`,
          message: `Head of Department has officially sanctioned your On-Duty event request for "${existing.eventName}". Attendance credit finalized.`,
          target: 'student',
          createdByName: session.name || 'Head of Department',
          status: 'published',
        },
      }).catch(() => {})

      // 2. Audit Trail
      await prisma.auditLog.create({
        data: {
          userName: session.name || 'HOD',
          action: 'od_proof_hod_sanctioned',
          module: 'attendance_portal',
          details: `HOD granted executive sanction for ${existing.studentName} (${existing.registerNumber}). Event: ${existing.eventName}.`,
          status: 'success',
        },
      }).catch(() => {})

      // 3. Automatically allocate attendance on the days for this student
      await allocateSanctionedAttendance({
        registerNumber: existing.registerNumber,
        studentName: existing.studentName,
        fromDate: existing.eventDate,
        toDate: existing.eventDate,
        applicationType: existing.category,
        eventName: existing.eventName,
        sanctionedBy: session.name || 'Head of Department',
      }).catch((err) => {
        console.warn('[allocateSanctionedAttendance] error in od-proofs:', err)
      })

      return NextResponse.json({
        success: true,
        message: `OD Attendance officially sanctioned by HOD for ${existing.studentName}!`,
        proof: updated,
      })
    }

    // 5. CLASS ADVISOR / HOD: REQUEST RESUBMISSION
    if (action === 'ADVISOR_REJECT' || action === 'HOD_REJECT') {
      if (session.role !== 'faculty' && session.role !== 'hod' && session.role !== 'admin' && session.role !== 'super_admin') {
        return NextResponse.json({ success: false, message: 'Forbidden: Faculty or HOD authority required.' }, { status: 403 })
      }

      const { id, remarks } = body

      if (!id || !remarks) {
        return NextResponse.json({ success: false, message: 'Proof ID and explanation remarks required' }, { status: 400 })
      }

      const updated = await prisma.oDProof.update({
        where: { id },
        data: {
          status: 'resubmit_requested',
          advisorRemarks: remarks.trim(),
        },
      })

      await prisma.notification.create({
        data: {
          title: `⚠️ [OD Proof Clarification] ${updated.eventName}`,
          message: `Your Class Advisor requested clarification/re-upload for "${updated.eventName}". Reason: "${remarks.trim()}". Please update your proof.`,
          target: 'student',
          createdByName: session.name || 'Class Advisor',
          status: 'published',
        },
      }).catch(() => {})

      return NextResponse.json({
        success: true,
        message: 'Resubmission request sent to student.',
        proof: updated,
      })
    }

    // 6. SUPER ADMIN: EXECUTIVE OVERRIDE / SANCTION
    if (action === 'ADMIN_SANCTION' || action === 'ADMIN_APPROVE') {
      if (session.role !== 'admin' && session.role !== 'super_admin') {
        return NextResponse.json({ success: false, message: 'Admin authorization required' }, { status: 403 })
      }

      const { id, remarks } = body
      if (!id) {
        return NextResponse.json({ success: false, message: 'Proof ID required' }, { status: 400 })
      }

      const existing = await prisma.oDProof.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ success: false, message: 'OD record not found' }, { status: 404 })
      }

      const defaultRemark = 'Admin Sanctioned: Proof verified under central system jurisdiction. OD attendance officially credited.'
      const updated = await prisma.oDProof.update({
        where: { id },
        data: {
          status: 'verified',
          advisorRemarks: remarks ? remarks.trim() : (existing.advisorRemarks || defaultRemark),
          verifiedByName: `${session.name || 'Super Admin'} (Admin Jurisdiction)`,
          verifiedAt: new Date(),
          attendanceCredited: true,
        },
      })

      await prisma.notification.create({
        data: {
          title: `🛡️ [Admin Sanctioned] ${existing.eventName}`,
          message: `Super Administrator has officially approved and sanctioned your On-Duty event request for "${existing.eventName}". Attendance credit verified.`,
          target: 'student',
          createdByName: session.name || 'System Administrator',
          status: 'published',
        },
      }).catch(() => {})

      await prisma.auditLog.create({
        data: {
          userName: session.name || 'System Administrator',
          action: 'od_proof_admin_sanctioned',
          module: 'admin_portal',
          details: `Super Admin sanctioned OD for ${existing.studentName} (${existing.registerNumber}). Event: ${existing.eventName}.`,
          status: 'success',
        },
      }).catch(() => {})

      // 3. Automatically allocate attendance on the days for this student
      await allocateSanctionedAttendance({
        registerNumber: existing.registerNumber,
        studentName: existing.studentName,
        fromDate: existing.eventDate,
        toDate: existing.eventDate,
        applicationType: existing.category,
        eventName: existing.eventName,
        sanctionedBy: session.name || 'System Administrator',
      }).catch((err) => {
        console.warn('[allocateSanctionedAttendance] error in od-proofs admin sanction:', err)
      })

      return NextResponse.json({
        success: true,
        message: `OD Attendance officially sanctioned by Super Admin for ${existing.studentName}!`,
        proof: updated,
      })
    }

    // 7. SUPER ADMIN: REJECT / REQUEST RESUBMISSION
    if (action === 'ADMIN_REJECT') {
      if (session.role !== 'admin' && session.role !== 'super_admin') {
        return NextResponse.json({ success: false, message: 'Admin authorization required' }, { status: 403 })
      }

      const { id, remarks } = body
      if (!id || !remarks) {
        return NextResponse.json({ success: false, message: 'Proof ID and explanation remarks required' }, { status: 400 })
      }

      const updated = await prisma.oDProof.update({
        where: { id },
        data: {
          status: 'resubmit_requested',
          advisorRemarks: `[Admin Directive] ${remarks.trim()}`,
        },
      })

      await prisma.notification.create({
        data: {
          title: `⚠️ [Admin Notice: OD Proof Clarification] ${updated.eventName}`,
          message: `System Administrator requested clarification/re-upload for "${updated.eventName}". Reason: "${remarks.trim()}". Please update your proof.`,
          target: 'student',
          createdByName: session.name || 'System Administrator',
          status: 'published',
        },
      }).catch(() => {})

      return NextResponse.json({
        success: true,
        message: 'Clarification request sent to student.',
        proof: updated,
      })
    }

    // 8. SUPER ADMIN: DELETE RECORD
    if (action === 'ADMIN_DELETE') {
      if (session.role !== 'admin' && session.role !== 'super_admin') {
        return NextResponse.json({ success: false, message: 'Admin authorization required' }, { status: 403 })
      }

      const { id } = body
      if (!id) {
        return NextResponse.json({ success: false, message: 'Proof ID required' }, { status: 400 })
      }

      const deleted = await prisma.oDProof.delete({ where: { id } })

      await prisma.auditLog.create({
        data: {
          userName: session.name || 'System Administrator',
          action: 'od_proof_deleted',
          module: 'admin_portal',
          details: `Deleted OD Proof record ${id} for ${deleted.studentName} (${deleted.registerNumber}).`,
          status: 'success',
        },
      }).catch(() => {})

      return NextResponse.json({
        success: true,
        message: 'OD Proof record successfully deleted by administrator.',
      })
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in POST /api/od-proofs:', error)
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 })
  }
}

// DELETE: Delete an OD Proof (Admin Only)
export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, message: 'Proof ID required' }, { status: 400 })
    }

    const deleted = await prisma.oDProof.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        userName: session.name || 'System Administrator',
        action: 'od_proof_deleted',
        module: 'admin_portal',
        details: `Deleted OD Proof record ${id} for ${deleted.studentName} (${deleted.registerNumber}).`,
        status: 'success',
      },
    }).catch(() => {})

    invalidateCache('od_proofs')
    invalidateCache('attendance')
    invalidateCache('student_data')

    return NextResponse.json({
      success: true,
      message: 'OD Proof record successfully removed.',
    })
  } catch (error: any) {
    console.error('Error in DELETE /api/od-proofs:', error)
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 })
  }
}

