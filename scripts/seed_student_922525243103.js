const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function seed() {
  const reg = '922525243103'
  console.log(`Setting up complete test environment for student: ${reg}...`)

  // 1. Ensure User & Student record
  let student = await prisma.student.findFirst({ where: { registerNumber: reg } })
  let user = student ? await prisma.user.findUnique({ where: { id: student.userId } }) : null

  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(reg, salt)

  if (!user) {
    const email = `${reg.toLowerCase()}@student.vsb.edu.in`
    user = await prisma.user.create({
      data: {
        email,
        name: 'Logeshwaran G',
        phone: '+91 94421 88920',
        role: 'student',
        status: 'active',
        passwordHash,
        mustChangePassword: false,
        emailVerified: true
      }
    })
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: 'Logeshwaran G',
        status: 'active',
        passwordHash, // Reset password to reg number so login always works seamlessly
        mustChangePassword: false,
        emailVerified: true
      }
    })
  }

  if (!student) {
    student = await prisma.student.create({
      data: {
        userId: user.id,
        registerNumber: reg,
        department: 'Artificial Intelligence & Data Science',
        year: 2,
        semester: 3,
        section: 'B',
        batch: '2023-2027',
        advisorName: 'Dr. K. Suresh',
        parentPhone: '+91 98421 77123',
        bloodGroup: 'O+',
        residencyStatus: 'Day Scholar',
        address: 'Karur, Tamil Nadu',
        busDetails: 'Route 12 - Karur Central',
        dateOfBirth: new Date('2004-06-15'),
        cgpa: 8.92
      }
    })
  } else {
    student = await prisma.student.update({
      where: { id: student.id },
      data: {
        department: 'Artificial Intelligence & Data Science',
        year: 2,
        semester: 3,
        section: 'B',
        batch: '2023-2027',
        advisorName: 'Dr. K. Suresh',
        parentPhone: '+91 98421 77123',
        residencyStatus: 'Hostel',
        hostelBlock: 'Boys Hostel I',
        roomNo: 'Room 204',
        cgpa: 8.92
      }
    })
  }

  console.log(`Student profile verified: ${student.registerNumber} (${user.name})`)

  // 2. Populate Attendance Sessions & Records
  const existingRecords = await prisma.attendanceRecord.count({
    where: {
      OR: [
        { studentId: student.id },
        { registerNumber: reg }
      ]
    }
  })

  if (existingRecords < 20) {
    console.log('Seeding 35 rich attendance records across subjects...')
    const subjects = [
      { code: 'AD3301', name: 'Data Exploration and Visualization' },
      { code: 'CS3351', name: 'Digital Principles and Computer Organization' },
      { code: 'AD3351', name: 'Design and Analysis of Algorithms' },
      { code: 'AD3381', name: 'Database Design and Management' },
      { code: 'AL3391', name: 'Artificial Intelligence' }
    ]

    const dates = [
      '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05',
      '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12'
    ]

    let sessionCount = 0
    for (let d = 0; d < dates.length; d++) {
      const dateStr = dates[d]
      for (let s = 0; s < subjects.length; s++) {
        const subj = subjects[s]
        const hourStr = `Hour ${s + 1} (09:${(s * 50).toString().padStart(2, '0')} - 10:00)`

        // Upsert session
        let session = await prisma.attendanceSession.findFirst({
          where: {
            sessionType: 'subject',
            subjectCode: subj.code,
            year: student.year,
            section: student.section,
            semester: student.semester,
            date: dateStr,
            hour: hourStr
          }
        })

        if (!session) {
          session = await prisma.attendanceSession.create({
            data: {
              sessionType: 'subject',
              subjectCode: subj.code,
              subjectName: subj.name,
              year: student.year,
              section: student.section,
              semester: student.semester,
              academicYear: '2025-2026',
              hour: hourStr,
              periodType: 'Theory',
              date: dateStr,
              takenByFacultyId: 'FAC-AI-01',
              takenByName: 'Dr. K. Suresh',
              isLocked: true
            }
          })
        }

        // Attendance status: mostly P, occasional OD or A
        let status = 'P'
        if (d === 3 && s === 2) status = 'OD'
        if (d === 4 && s === 1) status = 'OD'
        if (d === 7 && s === 4) status = 'A'

        await prisma.attendanceRecord.upsert({
          where: {
            sessionId_studentId: {
              sessionId: session.id,
              studentId: student.id
            }
          },
          update: {
            status,
            registerNumber: reg,
            studentName: user.name
          },
          create: {
            sessionId: session.id,
            studentId: student.id,
            registerNumber: reg,
            studentName: user.name,
            gender: 'M',
            status,
            remarks: status === 'OD' ? 'Smart India Hackathon Zonal Round OD' : ''
          }
        })
        sessionCount++
      }
    }
    console.log(`Successfully populated ${sessionCount} attendance records!`)
  } else {
    console.log(`Student already has ${existingRecords} attendance records.`)
  }

  // 3. Ensure an active On-Duty Application with Parent Confirmation
  const existingAudit = await prisma.auditLog.findFirst({
    where: {
      action: 'OD_APPLICATION_SUBMITTED',
      details: { contains: reg }
    }
  })

  if (!existingAudit) {
    console.log('Creating sample OD application with telephonic parent consent...')
    await prisma.auditLog.create({
      data: {
        userName: user.name,
        action: 'OD_APPLICATION_SUBMITTED',
        module: 'ODManagement',
        status: 'approved',
        details: JSON.stringify({
          applicationId: `OD-${Date.now()}`,
          registerNumber: reg,
          studentName: user.name,
          category: 'Hackathon / Technical Competition',
          eventTitle: 'Smart India Hackathon (SIH 2026) - National Finale',
          institution: 'IIT Madras Research Park, Chennai',
          fromDate: '2026-09-20',
          toDate: '2026-09-23',
          days: 4,
          parentConsentVerified: true,
          parentConsentConfirmedAt: new Date().toISOString(),
          advisorVerified: true,
          hodApproved: true,
          stages: {
            step1: 'Submitted',
            step2: 'Parent Consent Confirmed',
            step3: 'Advisor Endorsed',
            step4: 'HOD Sanctioned',
            step5: 'Roll Call Synced'
          }
        })
      }
    })
    console.log('OD application record created!')
  }

  console.log('ALL FEATURES READY AND CONFIGURED FOR 922525243103!')
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
