const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function removeAllMockData() {
  console.log('=====================================================')
  console.log('Purging All Mock & Seeded Data from Live Database...')
  console.log('Preserving Admin user account and system settings.')
  console.log('=====================================================')

  // 1. Attendance, Mentorship & OD Proofs
  const delAttRec = await prisma.attendanceRecord.deleteMany({})
  console.log(`✓ Deleted Attendance Records: ${delAttRec.count}`)

  const delAttSess = await prisma.attendanceSession.deleteMany({})
  console.log(`✓ Deleted Attendance Sessions: ${delAttSess.count}`)

  const delClassAdvisor = await prisma.classAdvisor.deleteMany({})
  console.log(`✓ Deleted Class Advisors: ${delClassAdvisor.count}`)

  const delODProofs = await prisma.oDProof.deleteMany({})
  console.log(`✓ Deleted OD Proofs: ${delODProofs.count}`)

  const delProfileReq = await prisma.profileChangeRequest.deleteMany({})
  console.log(`✓ Deleted Profile Requests: ${delProfileReq.count}`)

  // 2. Academic Roles & Staff
  const delFaculty = await prisma.faculty.deleteMany({})
  console.log(`✓ Deleted Faculty Members: ${delFaculty.count}`)

  const delHOD = await prisma.hOD.deleteMany({})
  console.log(`✓ Deleted Head of Department: ${delHOD.count}`)

  const delStudents = await prisma.student.deleteMany({})
  console.log(`✓ Deleted Students: ${delStudents.count}`)

  // 3. Academic Resources & Curriculum
  const delResources = await prisma.resource.deleteMany({})
  console.log(`✓ Deleted Resources: ${delResources.count}`)

  const delNotes = await prisma.note.deleteMany({})
  console.log(`✓ Deleted Notes: ${delNotes.count}`)

  const delLabManuals = await prisma.labManual.deleteMany({})
  console.log(`✓ Deleted Lab Manuals: ${delLabManuals.count}`)

  const delImportantQ = await prisma.importantQuestion.deleteMany({})
  console.log(`✓ Deleted Important Questions: ${delImportantQ.count}`)

  const delQuestionPapers = await prisma.questionPaper.deleteMany({})
  console.log(`✓ Deleted Question Papers: ${delQuestionPapers.count}`)

  const delProjects = await prisma.project.deleteMany({})
  console.log(`✓ Deleted Projects: ${delProjects.count}`)

  const delEvents = await prisma.event.deleteMany({})
  console.log(`✓ Deleted Events: ${delEvents.count}`)

  const delAnnouncements = await prisma.announcement.deleteMany({})
  console.log(`✓ Deleted Announcements: ${delAnnouncements.count}`)

  const delNotifications = await prisma.notification.deleteMany({})
  console.log(`✓ Deleted Notifications: ${delNotifications.count}`)

  const delAchievements = await prisma.achievement.deleteMany({})
  console.log(`✓ Deleted Achievements: ${delAchievements.count}`)

  const delFiles = await prisma.fileRecord.deleteMany({})
  console.log(`✓ Deleted File Records: ${delFiles.count}`)

  // 4. Verification & Audit Logs
  const delOTP = await prisma.oTP.deleteMany({})
  console.log(`✓ Deleted OTP Tokens: ${delOTP.count}`)

  const delAuditLogs = await prisma.auditLog.deleteMany({})
  console.log(`✓ Deleted Audit Logs: ${delAuditLogs.count}`)

  // 5. Delete all non-admin user accounts (students, faculty, hod)
  const delUsers = await prisma.user.deleteMany({
    where: {
      role: { not: 'admin' },
    },
  })
  console.log(`✓ Deleted Non-Admin User Accounts: ${delUsers.count}`)

  // 6. Verify preserved records
  const remainingAdmins = await prisma.admin.findMany()
  const remainingAdminUsers = await prisma.user.findMany({ where: { role: 'admin' } })
  const remainingFaculty = await prisma.faculty.count()
  const remainingHOD = await prisma.hOD.count()
  const remainingStudents = await prisma.student.count()

  console.log('\n=====================================================')
  console.log('Database Status After Mock Data Cleanup:')
  console.log(`- Faculty: ${remainingFaculty} (0 expected)`)
  console.log(`- HOD: ${remainingHOD} (0 expected)`)
  console.log(`- Students: ${remainingStudents} (0 expected)`)
  console.log(`- Admin Users Preserved: ${remainingAdminUsers.length}`)
  remainingAdminUsers.forEach((u) => console.log(`  * ${u.email} (${u.name})`))
  console.log(`- Admin Profiles Preserved: ${remainingAdmins.length}`)
  console.log('=====================================================')
}

removeAllMockData()
  .catch((e) => {
    console.error('Cleanup Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
