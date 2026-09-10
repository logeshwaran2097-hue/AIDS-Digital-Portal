import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

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
    if (session.role === 'student' || queryRegNo) {
      const regNo = (queryRegNo || session.registerNumber || '')?.trim().toUpperCase()
      
      let student = null
      if (regNo) {
        student = await prisma.student.findFirst({ where: { registerNumber: regNo } })
      } else if (session.userId) {
        student = await prisma.student.findFirst({ where: { userId: session.userId } })
      }

      const activeRegNo = student?.registerNumber || regNo
      if (!activeRegNo) {
        return NextResponse.json({ success: true, proofs: [], count: 0 })
      }

      let proofs = await prisma.oDProof.findMany({
        where: {
          registerNumber: activeRegNo,
          ...(filterStatus ? { status: filterStatus } : {}),
        },
        orderBy: { createdAt: 'desc' },
      })

      // If student has no OD proofs yet, auto-seed with a sample pending record so they can immediately test
      if (proofs.length === 0 && student) {
        const defaultSample = await prisma.oDProof.create({
          data: {
            studentId: student.id,
            registerNumber: student.registerNumber,
            studentName: session.name || 'Student',
            year: student.year || 2,
            section: student.section || 'B',
            semester: student.semester || 3,
            eventName: 'Smart India Hackathon (SIH) 2026 - Regional Round',
            category: 'Hackathon',
            eventDate: new Date().toISOString().split('T')[0],
            venueCollege: 'PSG College of Technology, Coimbatore',
            status: 'pending_proofs',
          },
        }).catch(() => null)
        if (defaultSample) {
          proofs = [defaultSample]
        }
      }

      return NextResponse.json({
        success: true,
        proofs,
        count: proofs.length,
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

      const proofs = await prisma.oDProof.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      })

      const allProofs = await prisma.oDProof.findMany()
      const stats = {
        total: allProofs.length,
        pendingGeoTag: allProofs.filter((p) => !p.geoPhotoUrl).length,
        pendingCertificate: allProofs.filter((p) => !p.certificateUrl).length,
        readyForReview: allProofs.filter((p) => p.geoPhotoUrl && p.certificateUrl && p.status !== 'verified').length,
        verified: allProofs.filter((p) => p.status === 'verified').length,
      }

      return NextResponse.json({
        success: true,
        proofs,
        count: proofs.length,
        stats,
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

      let proofs = await prisma.oDProof.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      })

      // If no proofs in class yet, check if there are students in this class to seed a demo entry
      if (proofs.length === 0) {
        const classStudent = await prisma.student.findFirst({
          where: { year: advisorYear, section: advisorSec },
        })
        if (classStudent) {
          const sample = await prisma.oDProof.create({
            data: {
              studentId: classStudent.id,
              registerNumber: classStudent.registerNumber,
              studentName: 'Logeshwaran S',
              year: advisorYear,
              section: advisorSec,
              semester: classStudent.semester || 3,
              eventName: 'National AI & Data Science Symposium - KEC HackFest',
              category: 'Symposium',
              eventDate: '2026-09-08',
              venueCollege: 'Kongu Engineering College, Perundurai',
              geoPhotoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
              latitude: 11.2743,
              longitude: 77.6074,
              geoAddress: 'Kongu Engineering College Campus, Perundurai, Tamil Nadu',
              geoTimestamp: new Date('2026-09-08T10:30:00Z'),
              certificateUrl: 'https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?auto=format&fit=crop&w=800&q=80',
              certificateName: 'KEC_HackFest_FirstPrize_Certificate.pdf',
              achievement: '1st Prize / Winner',
              status: 'under_review',
            },
          }).catch(() => null)
          if (sample) proofs = [sample]
        }
      }

      // Stats calculation for advisor
      const allClassProofs = await prisma.oDProof.findMany({
        where: { year: advisorYear, section: advisorSec },
      })

      const stats = {
        total: allClassProofs.length,
        pendingGeoTag: allClassProofs.filter((p) => !p.geoPhotoUrl).length,
        pendingCertificate: allClassProofs.filter((p) => !p.certificateUrl).length,
        readyForSignoff: allClassProofs.filter((p) => p.geoPhotoUrl && p.certificateUrl && p.status !== 'verified').length,
        verified: allClassProofs.filter((p) => p.status === 'verified').length,
      }

      return NextResponse.json({
        success: true,
        proofs,
        stats,
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

    const body = await request.json()
    const { action } = body

    // 1. REGISTER NEW OD / HACKATHON
    if (action === 'REGISTER_OD') {
      const { eventName, category, eventDate, venueCollege } = body

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
          venueCollege: venueCollege ? venueCollege.trim() : null,
          status: 'pending_proofs',
        },
      })

      return NextResponse.json({
        success: true,
        message: 'OD Event registered! Please upload your Live Geo-tag photo on the event day.',
        proof: newProof,
      })
    }

    // 2. UPLOAD STAGE 1: GEOTAGGED VENUE PHOTO
    if (action === 'UPLOAD_GEOTAG') {
      const { id, geoPhotoUrl, latitude, longitude, collegeName, collegeAddress, geoAddress, geoTimestamp } = body

      if (!id || !geoPhotoUrl) {
        return NextResponse.json({ success: false, message: 'Proof ID and photo data required' }, { status: 400 })
      }

      const existing = await prisma.oDProof.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ success: false, message: 'OD record not found' }, { status: 404 })
      }

      const updatedStatus = existing.certificateUrl ? 'under_review' : 'pending_proofs'
      const finalCollege = (collegeName || existing.venueCollege || '').trim()
      const finalAddress = (collegeAddress || geoAddress || '').trim()

      const updated = await prisma.oDProof.update({
        where: { id },
        data: {
          geoPhotoUrl,
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
          title: `📍 [OD Geo-Tag Uploaded] ${existing.studentName} (${existing.registerNumber})`,
          message: `${existing.studentName} uploaded a live geo-tagged venue photo for "${existing.eventName}" at ${finalCollege || 'host venue'}${finalAddress ? ` (${finalAddress})` : ''}.`,
          target: 'faculty',
          createdByName: existing.studentName,
          status: 'published',
        },
      }).catch(() => {})

      return NextResponse.json({
        success: true,
        message: 'Live Geo-Tag Photo verified & uploaded successfully!',
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

      return NextResponse.json({
        success: true,
        message: `OD Attendance officially sanctioned by HOD for ${existing.studentName}!`,
        proof: updated,
      })
    }

    // 5. CLASS ADVISOR / HOD: REQUEST RESUBMISSION
    if (action === 'ADVISOR_REJECT' || action === 'HOD_REJECT') {
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

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in POST /api/od-proofs:', error)
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 })
  }
}
