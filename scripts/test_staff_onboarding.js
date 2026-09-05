const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testStaffOnboarding() {
  console.log('Testing Staff Onboarding Data & Logic...\n')

  // 1. Verify Faculty seeded account
  const facultyUser = await prisma.user.findFirst({
    where: { email: 'karthik.ai@vsb.edu.in' },
  })
  const facultyRec = facultyUser ? await prisma.faculty.findUnique({ where: { userId: facultyUser.id } }) : null

  console.log('Faculty User:', {
    name: facultyUser?.name,
    email: facultyUser?.email,
    role: facultyUser?.role,
    mustChangePassword: facultyUser?.mustChangePassword,
    facultyId: facultyRec?.facultyId,
    subjects: facultyRec?.subjects,
  })

  // 2. Verify Advisor seeded account
  const advisorUser = await prisma.user.findFirst({
    where: { email: 'priya.ai@vsb.edu.in' },
  })
  const advisorRec = advisorUser ? await prisma.faculty.findUnique({ where: { userId: advisorUser.id } }) : null

  console.log('\nAdvisor User:', {
    name: advisorUser?.name,
    email: advisorUser?.email,
    role: advisorUser?.role,
    mustChangePassword: advisorUser?.mustChangePassword,
    facultyId: advisorRec?.facultyId,
    advisorBatch: advisorRec?.advisorBatch,
  })

  // 3. Verify HOD seeded account
  const hodUser = await prisma.user.findFirst({
    where: { email: 'hod.ai@vsb.edu.in' },
  })
  const hodRec = hodUser ? await prisma.hOD.findUnique({ where: { userId: hodUser.id } }) : null

  console.log('\nHOD User:', {
    name: hodUser?.name,
    email: hodUser?.email,
    role: hodUser?.role,
    mustChangePassword: hodUser?.mustChangePassword,
    facultyId: hodRec?.facultyId,
    designation: hodRec?.designation,
    department: hodRec?.department,
  })

  // 4. Test password check with default password 'nitr'
  const isFacultyPassValid = await bcrypt.compare('nitr', facultyUser.passwordHash)
  const isAdvisorPassValid = await bcrypt.compare('nitr', advisorUser.passwordHash)
  const isHodPassValid = await bcrypt.compare('nitr', hodUser.passwordHash)

  console.log('\nPassword checks (nitr):', {
    faculty: isFacultyPassValid,
    advisor: isAdvisorPassValid,
    hod: isHodPassValid,
  })

  if (facultyUser.mustChangePassword && advisorUser.mustChangePassword && hodUser.mustChangePassword) {
    console.log('\n✅ All roles have mustChangePassword = true and are ready for onboarding!')
  } else {
    console.warn('\n⚠️ Some users do not have mustChangePassword set!')
  }

  // 5. Simulate Onboarding Completion Logic
  console.log('\nSimulating profile completion & password change...')
  const newPass = 'StaffSecurePass@123'
  const newHash = await bcrypt.hash(newPass, 10)

  await prisma.user.update({
    where: { id: facultyUser.id },
    data: {
      passwordHash: newHash,
      mustChangePassword: false,
    },
  })

  const updatedFaculty = await prisma.user.findUnique({ where: { id: facultyUser.id } })
  console.log('Updated Faculty mustChangePassword:', updatedFaculty.mustChangePassword)
  const isNewPassValid = await bcrypt.compare(newPass, updatedFaculty.passwordHash)
  console.log('Can authenticate with new password:', isNewPassValid)

  // Reset back to onboarding test state
  await prisma.user.update({
    where: { id: facultyUser.id },
    data: {
      passwordHash: facultyUser.passwordHash,
      mustChangePassword: true,
    },
  })
  console.log('✓ Reset faculty back to mustChangePassword: true for interactive testing')
}

testStaffOnboarding()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
