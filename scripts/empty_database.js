const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function emptyDatabase() {
  console.log('--- Starting Database Cleanup ---')

  // 1. Attendance & Class relations
  const delAttendanceRec = await prisma.attendanceRecord.deleteMany({})
  console.log(`Deleted Attendance Records: ${delAttendanceRec.count}`)

  const delAttendanceSess = await prisma.attendanceSession.deleteMany({})
  console.log(`Deleted Attendance Sessions: ${delAttendanceSess.count}`)

  const delClassAdvisor = await prisma.classAdvisor.deleteMany({})
  console.log(`Deleted Class Advisors: ${delClassAdvisor.count}`)

  const delProfileReq = await prisma.profileChangeRequest.deleteMany({})
  console.log(`Deleted Profile Change Requests: ${delProfileReq.count}`)

  // 2. Academic / Department Content
  const delFaculty = await prisma.faculty.deleteMany({})
  console.log(`Deleted Faculty Records: ${delFaculty.count}`)

  const delHOD = await prisma.hOD.deleteMany({})
  console.log(`Deleted HOD Records: ${delHOD.count}`)

  const delStudent = await prisma.student.deleteMany({})
  console.log(`Deleted Student Records: ${delStudent.count}`)

  const delResource = await prisma.resource.deleteMany({})
  console.log(`Deleted Resources: ${delResource.count}`)

  const delNote = await prisma.note.deleteMany({})
  console.log(`Deleted Notes: ${delNote.count}`)

  const delLabManual = await prisma.labManual.deleteMany({})
  console.log(`Deleted Lab Manuals: ${delLabManual.count}`)

  const delImportantQ = await prisma.importantQuestion.deleteMany({})
  console.log(`Deleted Important Questions: ${delImportantQ.count}`)

  const delQuestionPaper = await prisma.questionPaper.deleteMany({})
  console.log(`Deleted Question Papers: ${delQuestionPaper.count}`)

  const delProject = await prisma.project.deleteMany({})
  console.log(`Deleted Projects: ${delProject.count}`)

  const delEvent = await prisma.event.deleteMany({})
  console.log(`Deleted Events: ${delEvent.count}`)

  const delAnnouncement = await prisma.announcement.deleteMany({})
  console.log(`Deleted Announcements: ${delAnnouncement.count}`)

  const delNotification = await prisma.notification.deleteMany({})
  console.log(`Deleted Notifications: ${delNotification.count}`)

  const delAchievement = await prisma.achievement.deleteMany({})
  console.log(`Deleted Achievements: ${delAchievement.count}`)

  const delFileRecord = await prisma.fileRecord.deleteMany({})
  console.log(`Deleted File Records: ${delFileRecord.count}`)

  // 3. System Logs & Tokens
  const delOTP = await prisma.oTP.deleteMany({})
  console.log(`Deleted OTPs: ${delOTP.count}`)

  const delAuditLog = await prisma.auditLog.deleteMany({})
  console.log(`Deleted Audit Logs: ${delAuditLog.count}`)

  // 4. Users (Delete all non-admin users: faculty, hod, student)
  const delUsers = await prisma.user.deleteMany({
    where: {
      role: { not: 'admin' },
    },
  })
  console.log(`Deleted Non-Admin Users: ${delUsers.count}`)

  console.log('\n--- Verifying Current Counts ---')
  const [
    facultyCount,
    hodCount,
    studentCount,
    userCount,
    adminCount,
    attendanceCount,
  ] = await Promise.all([
    prisma.faculty.count(),
    prisma.hOD.count(),
    prisma.student.count(),
    prisma.user.count(),
    prisma.admin.count(),
    prisma.attendanceRecord.count(),
  ])

  console.log({
    facultyRemaining: facultyCount,
    hodRemaining: hodCount,
    studentsRemaining: studentCount,
    attendanceRecordsRemaining: attendanceCount,
    usersRemaining: userCount,
    adminsPreserved: adminCount,
  })

  console.log('\n✓ Database successfully cleared and ready!')
}

emptyDatabase()
  .catch((err) => {
    console.error('Error cleaning database:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
