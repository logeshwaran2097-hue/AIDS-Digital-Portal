const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function test() {
  const regNumber = '922524AD999'
  const studentName = 'Priya Dharshini R'
  const tempPass = 'Student@2026'

  console.log('1. Creating student via Admin flow...')
  const passwordHash = await bcrypt.hash(tempPass, 10)
  const finalEmail = `${regNumber.toLowerCase()}@student.vsb.edu.in`

  const user = await prisma.user.upsert({
    where: { email: finalEmail },
    update: {
      name: studentName,
      passwordHash,
      role: 'student',
      status: 'active',
      mustChangePassword: true,
    },
    create: {
      email: finalEmail,
      name: studentName,
      passwordHash,
      role: 'student',
      status: 'active',
      mustChangePassword: true,
    },
  })

  const student = await prisma.student.upsert({
    where: { registerNumber: regNumber },
    update: {
      userId: user.id,
      department: 'Artificial Intelligence & Data Science',
      year: 2,
      semester: 4,
      section: 'A',
      dateOfBirth: new Date('2005-04-12'),
    },
    create: {
      userId: user.id,
      registerNumber: regNumber,
      department: 'Artificial Intelligence & Data Science',
      year: 2,
      semester: 4,
      section: 'A',
      dateOfBirth: new Date('2005-04-12'),
    },
  })

  console.log('✓ Student created with User ID:', user.id, 'Name:', user.name)

  console.log('2. Verifying password matching on login...')
  const isMatch = await bcrypt.compare(tempPass, user.passwordHash)
  console.log('✓ Password match test:', isMatch ? 'SUCCESS' : 'FAILED')

  console.log('3. Checking lookup by register number...')
  const foundStudent = await prisma.student.findUnique({
    where: { registerNumber: regNumber },
  })
  const foundUser = await prisma.user.findUnique({
    where: { id: foundStudent.userId },
  })
  console.log('✓ Found student name:', foundUser.name, 'Register Number:', foundStudent.registerNumber)

  // Cleanup test record
  await prisma.student.deleteMany({ where: { registerNumber: regNumber } })
  await prisma.user.deleteMany({ where: { email: finalEmail } })
  console.log('✓ Cleanup complete')
}

test().catch(console.error).finally(() => prisma.$disconnect())
