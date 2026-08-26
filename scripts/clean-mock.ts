import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Cleaning all mock/sample data from database ---')

  const res = await prisma.resource.deleteMany({})
  console.log(`Deleted ${res.count} mock resources / e-books`)

  const qp = await prisma.questionPaper.deleteMany({})
  console.log(`Deleted ${qp.count} mock question papers`)

  const proj = await prisma.project.deleteMany({})
  console.log(`Deleted ${proj.count} mock projects`)

  const ev = await prisma.event.deleteMany({})
  console.log(`Deleted ${ev.count} mock events`)

  const ann = await prisma.announcement.deleteMany({})
  console.log(`Deleted ${ann.count} mock announcements`)

  const ach = await prisma.achievement.deleteMany({})
  console.log(`Deleted ${ach.count} mock achievements`)

  const notif = await prisma.notification.deleteMany({})
  console.log(`Deleted ${notif.count} mock notifications`)

  const files = await prisma.fileRecord.deleteMany({})
  console.log(`Deleted ${files.count} mock file records`)

  const notes = await prisma.note.deleteMany({})
  console.log(`Deleted ${notes.count} mock notes`)

  const lm = await prisma.labManual.deleteMany({})
  console.log(`Deleted ${lm.count} mock lab manuals`)

  const iq = await prisma.importantQuestion.deleteMany({})
  console.log(`Deleted ${iq.count} mock important questions`)

  const ar = await prisma.attendanceRecord.deleteMany({})
  console.log(`Deleted ${ar.count} mock attendance records`)

  const as = await prisma.attendanceSession.deleteMany({})
  console.log(`Deleted ${as.count} mock attendance sessions`)

  const ca = await prisma.classAdvisor.deleteMany({})
  console.log(`Deleted ${ca.count} mock class advisors`)

  const students = await prisma.student.deleteMany({})
  const studentUsers = await prisma.user.deleteMany({ where: { role: 'student' } })
  console.log(`Deleted ${students.count} students and ${studentUsers.count} student user accounts`)

  const faculty = await prisma.faculty.deleteMany({})
  const facultyUsers = await prisma.user.deleteMany({ where: { role: 'faculty' } })
  console.log(`Deleted ${faculty.count} faculty and ${facultyUsers.count} faculty user accounts`)

  const hods = await prisma.hOD.deleteMany({})
  const hodUsers = await prisma.user.deleteMany({ where: { role: 'hod' } })
  console.log(`Deleted ${hods.count} HODs and ${hodUsers.count} HOD user accounts`)

  console.log('\n--- All mock data successfully removed! Only Admin accounts & system settings remain. ---')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Error cleaning mock data:', e)
    process.exit(1)
  })
