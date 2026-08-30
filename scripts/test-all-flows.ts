import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { authenticateStudent, sendAdminOTP, verifyAdminOTP, createToken } from '../src/lib/auth'

const prisma = new PrismaClient()

async function runTests() {
  console.log('🧪 Starting End-to-End System Tests...')
  let testsPassed = 0
  let testsFailed = 0

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`)
      testsPassed++
    } else {
      console.error(`  ❌ FAIL: ${testName}`)
      testsFailed++
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Admin Account Verification
    // ----------------------------------------------------
    console.log('\n--- Test 1: Admin Account Verification ---')
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } })
    assert(!!adminUser, 'Admin user exists in database')
    assert(adminUser?.status === 'active', 'Admin user is active')

    // ----------------------------------------------------
    // TEST 2: Admin OTP Generation & Verification
    // ----------------------------------------------------
    console.log('\n--- Test 2: Admin OTP Challenge ---')
    const otpResult = await sendAdminOTP(adminUser!.email)
    assert(otpResult.success, 'Admin OTP dispatch generated successfully')
    assert(!!otpResult.challenge, 'Stateless OTP challenge created')

    // ----------------------------------------------------
    // TEST 3: Admin Registers Student with Temporary Password
    // ----------------------------------------------------
    console.log('\n--- Test 3: Admin Registers Student with Temp Password ---')
    const testRegNo = '21AD001'
    const testName = 'Logeshwaran R'
    const tempPassword = 'TempPassword@123'
    const permanentPassword = 'PermanentSecure@2026'

    // Clean up if existing
    await prisma.student.deleteMany({ where: { registerNumber: testRegNo } })
    await prisma.user.deleteMany({ where: { email: `${testRegNo.toLowerCase()}@student.vsb.edu.in` } })

    const tempPasswordHash = await bcrypt.hash(tempPassword, 10)
    const newStudentUser = await prisma.user.create({
      data: {
        name: testName,
        email: `${testRegNo.toLowerCase()}@student.vsb.edu.in`,
        role: 'student',
        status: 'active',
        passwordHash: tempPasswordHash,
        mustChangePassword: true,
      },
    })

    const newStudent = await prisma.student.create({
      data: {
        userId: newStudentUser.id,
        registerNumber: testRegNo,
        department: 'Artificial Intelligence & Data Science',
        year: 2,
        semester: 4,
        section: 'A',
        batch: '2022-2026',
        dateOfBirth: new Date('2004-05-15'),
      },
    })

    assert(!!newStudent && newStudent.registerNumber === testRegNo, 'Student record successfully created')
    assert(newStudentUser.mustChangePassword === true, 'Student flag mustChangePassword is true on initial registration')

    // ----------------------------------------------------
    // TEST 4: Student Logs In with Temporary Password
    // ----------------------------------------------------
    console.log('\n--- Test 4: Student First-Time Login with Temp Password ---')
    const loginResult1 = await authenticateStudent(testRegNo, tempPassword)
    assert(loginResult1.success === true, 'Student authentication succeeds with temp password')
    assert(loginResult1.user?.mustChangePassword === true, 'Student login returns mustChangePassword = true')
    assert(loginResult1.student?.department === 'Artificial Intelligence & Data Science', 'Student department correctly returned')
    assert(loginResult1.student?.year === 2, 'Student year correctly returned')
    assert(loginResult1.student?.semester === 4, 'Student semester correctly returned')

    // ----------------------------------------------------
    // TEST 5: Student Sets Permanent Password & Completes Onboarding
    // ----------------------------------------------------
    console.log('\n--- Test 5: Permanent Password Update & Profile Setup ---')
    const newPermanentHash = await bcrypt.hash(permanentPassword, 10)
    const updatedUser = await prisma.user.update({
      where: { id: newStudentUser.id },
      data: {
        passwordHash: newPermanentHash,
        mustChangePassword: false,
        phone: '9876543210',
      },
    })

    assert(updatedUser.mustChangePassword === false, 'mustChangePassword set to false after permanent password update')

    // ----------------------------------------------------
    // TEST 6: Student Logs In with NEW Permanent Password
    // ----------------------------------------------------
    console.log('\n--- Test 6: Student Login with Permanent Password ---')
    const loginResult2 = await authenticateStudent(testRegNo, permanentPassword)
    assert(loginResult2.success === true, 'Student login succeeds with new permanent password')
    assert(loginResult2.user?.mustChangePassword === false, 'Student login returns mustChangePassword = false')
    assert(!!loginResult2.token, 'Secure JWT session token generated')

    // ----------------------------------------------------
    // TEST 7: Old Temporary Password is Rejected
    // ----------------------------------------------------
    console.log('\n--- Test 7: Verify Old Temp Password is now Invalid ---')
    const loginResult3 = await authenticateStudent(testRegNo, tempPassword)
    assert(loginResult3.success === false, 'Old temporary password correctly rejected after password change')

    // ----------------------------------------------------
    // TEST 8: Session Token Generation & Verification
    // ----------------------------------------------------
    console.log('\n--- Test 8: Session Token Generation ---')
    const token = await createToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: 'student',
      registerNumber: testRegNo,
    })
    assert(typeof token === 'string' && token.length > 20, 'JWT token correctly generated')

    // ----------------------------------------------------
    // Clean up test student
    // ----------------------------------------------------
    await prisma.student.deleteMany({ where: { registerNumber: testRegNo } })
    await prisma.user.deleteMany({ where: { id: newStudentUser.id } })

  } catch (error) {
    console.error('Test execution error:', error)
    testsFailed++
  }

  console.log('\n=========================================')
  console.log(`📊 Test Summary: ${testsPassed} Passed, ${testsFailed} Failed`)
  console.log('=========================================')

  if (testsFailed > 0) {
    process.exit(1)
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test script crashed:', err)
    process.exit(1)
  })
