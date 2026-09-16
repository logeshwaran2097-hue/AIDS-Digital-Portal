const fs = require('fs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('--- Filtering Database to ONLY the 63 Vercel Students ---')

  const raw = fs.readFileSync('C:/Users/loges/.gemini/antigravity-ide/brain/8cc53c67-3a3b-4612-adce-64728dcf35e2/.system_generated/steps/411/content.md', 'utf8')
  const vercelData = JSON.parse(raw.split('---')[1].trim())
  const targetRegs = vercelData.students.map(s => s.registerNumber)

  console.log(`Targeting strictly the ${targetRegs.length} students (${targetRegs[0]} to ${targetRegs[targetRegs.length - 1]}).`)

  // 1. Find all students that are NOT in targetRegs
  const studentsToDelete = await prisma.student.findMany({
    where: {
      registerNumber: { notIn: targetRegs }
    },
    select: { id: true, userId: true, registerNumber: true }
  })

  console.log(`Found ${studentsToDelete.length} students outside the 63 target list to remove.`)

  const userIdsToDelete = studentsToDelete.map(s => s.userId).filter(Boolean)

  // 2. Delete the extra student records
  const deletedStudents = await prisma.student.deleteMany({
    where: {
      registerNumber: { notIn: targetRegs }
    }
  })
  console.log(`Deleted ${deletedStudents.count} student records from database.`)

  // 3. Delete extra student user accounts (only role='student')
  if (userIdsToDelete.length > 0) {
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: { in: userIdsToDelete },
        role: 'student'
      }
    })
    console.log(`Cleaned up ${deletedUsers.count} associated student user accounts.`)
  }

  // 4. Verify count
  const remainingCount = await prisma.student.count()
  console.log(`\n🎉 Success! Total Student records in Database is now exactly: ${remainingCount}`)
}

main()
  .catch((e) => {
    console.error('Error filtering students:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
