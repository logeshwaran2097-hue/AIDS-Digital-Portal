const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function run() {
  const attendanceSessions = await prisma.attendanceSession.count()
  const attendanceRecords = await prisma.attendanceRecord.count()
  const classAdvisors = await prisma.classAdvisor.count()
  const resources = await prisma.resource.count()
  const notes = await prisma.note.count()
  const questionPapers = await prisma.questionPaper.count()
  const projects = await prisma.project.count()
  const students = await prisma.student.count()
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } })

  console.log('Stats:', {
    attendanceSessions,
    attendanceRecords,
    classAdvisors,
    resources,
    notes,
    questionPapers,
    projects,
    students,
  })
  console.log('All Users:', users)
  
  await prisma.$disconnect()
}

run().catch(console.error)
