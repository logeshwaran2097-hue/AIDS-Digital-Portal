const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('--- Starting Student Records Restoration ---')

  // 1. Load Vercel students
  let vercelStudents = []
  try {
    const rawVercel = fs.readFileSync('C:/Users/loges/.gemini/antigravity-ide/brain/8cc53c67-3a3b-4612-adce-64728dcf35e2/.system_generated/steps/411/content.md', 'utf8')
    const jsonStr = rawVercel.split('---')[1].trim()
    const parsed = JSON.parse(jsonStr)
    vercelStudents = parsed.students || []
    console.log(`Loaded ${vercelStudents.length} students from Vercel source.`)
  } catch (err) {
    console.error('Error loading vercel file, trying direct fetch:', err.message)
    const res = await fetch('https://aids-digital-portal-9jjjxt3s7-logeshwaran.vercel.app/api/students')
    const json = await res.json()
    vercelStudents = json.students || []
    console.log(`Fetched ${vercelStudents.length} students directly from Vercel API.`)
  }

  // 2. Load backup students & users
  let backupStudents = []
  let backupUsers = []
  try {
    const backupData = JSON.parse(fs.readFileSync('prisma/students_backup.json', 'utf8'))
    backupStudents = backupData.students || []
    backupUsers = backupData.users || []
    console.log(`Loaded ${backupStudents.length} students and ${backupUsers.length} users from backup.`)
  } catch (err) {
    console.warn('Could not read backup file:', err.message)
  }

  const defaultPasswordHash = await bcrypt.hash('Student@123', 10)
  const backupUserMap = new Map(backupUsers.map(u => [u.id, u]))

  let restoredCount = 0

  // 3. Process Vercel students first (Priority 1)
  const processedRegs = new Set()

  for (const s of vercelStudents) {
    if (!s.registerNumber) continue
    processedRegs.add(s.registerNumber)

    const email = s.email && s.email.includes('@')
      ? s.email.trim().toLowerCase()
      : `${s.registerNumber}@student.vsb.edu.in`

    // Check if user already exists
    let existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          ...(s.userId ? [{ id: s.userId }] : [])
        ]
      }
    })

    if (!existingUser) {
      existingUser = await prisma.user.create({
        data: {
          id: s.userId || undefined,
          email: email,
          name: s.name || s.registerNumber,
          phone: s.phone || null,
          role: 'student',
          status: s.status || 'active',
          passwordHash: defaultPasswordHash,
          emailVerified: true
        }
      })
    } else {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: s.name || existingUser.name,
          phone: s.phone || existingUser.phone,
          status: s.status || existingUser.status
        }
      })
    }

    const dob = s.dateOfBirth ? new Date(s.dateOfBirth) : new Date('2004-01-01T00:00:00.000Z')

    // Upsert Student
    await prisma.student.upsert({
      where: { registerNumber: s.registerNumber },
      create: {
        id: s.id || undefined,
        userId: existingUser.id,
        registerNumber: s.registerNumber,
        dateOfBirth: isNaN(dob.getTime()) ? new Date('2004-01-01T00:00:00.000Z') : dob,
        department: s.department || 'Artificial Intelligence & Data Science',
        year: Number(s.year) || 2,
        semester: Number(s.semester) || 3,
        section: s.section || 'B',
        batch: s.batch || '25-29',
        advisorName: s.advisorName || '',
        parentPhone: s.parentPhone || null,
        isParentWhatsapp: false,
        bloodGroup: s.bloodGroup || null,
        residencyStatus: s.residencyStatus || null,
        busNo: s.busNo || null,
        boardingPoint: s.boardingPoint || null,
        busDetails: s.busDetails || null,
        hostelBlock: s.hostelBlock || null,
        roomNo: s.roomNo || null,
        address: s.address || null,
        cgpa: s.cgpa ? Number(s.cgpa) : null,
        attendance: s.attendance || null
      },
      update: {
        userId: existingUser.id,
        department: s.department || 'Artificial Intelligence & Data Science',
        year: Number(s.year) || 2,
        semester: Number(s.semester) || 3,
        section: s.section || 'B',
        batch: s.batch || '25-29',
        advisorName: s.advisorName || '',
        parentPhone: s.parentPhone || null,
        bloodGroup: s.bloodGroup || null,
        residencyStatus: s.residencyStatus || null,
        busNo: s.busNo || null,
        boardingPoint: s.boardingPoint || null,
        busDetails: s.busDetails || null,
        hostelBlock: s.hostelBlock || null,
        roomNo: s.roomNo || null,
        address: s.address || null,
        cgpa: s.cgpa ? Number(s.cgpa) : null,
        attendance: s.attendance || null
      }
    })

    restoredCount++
  }

  console.log(`Successfully restored ${restoredCount} students from Vercel records!`)

  // 4. Restore remaining students from backup (Priority 2, no duplicates)
  let backupRestoredCount = 0
  for (const s of backupStudents) {
    if (!s.registerNumber || processedRegs.has(s.registerNumber)) continue
    processedRegs.add(s.registerNumber)

    const u = backupUserMap.get(s.userId)
    const email = u?.email && u.email.includes('@')
      ? u.email.trim().toLowerCase()
      : `${s.registerNumber}@student.vsb.edu.in`

    let existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          ...(s.userId ? [{ id: s.userId }] : [])
        ]
      }
    })

    if (!existingUser) {
      existingUser = await prisma.user.create({
        data: {
          id: s.userId || undefined,
          email: email,
          name: u?.name || s.registerNumber,
          phone: u?.phone || null,
          role: 'student',
          status: u?.status || 'active',
          passwordHash: u?.passwordHash || defaultPasswordHash,
          emailVerified: true
        }
      })
    }

    const dob = s.dateOfBirth ? new Date(s.dateOfBirth) : new Date('2004-01-01T00:00:00.000Z')

    await prisma.student.upsert({
      where: { registerNumber: s.registerNumber },
      create: {
        id: s.id || undefined,
        userId: existingUser.id,
        registerNumber: s.registerNumber,
        dateOfBirth: isNaN(dob.getTime()) ? new Date('2004-01-01T00:00:00.000Z') : dob,
        department: s.department || 'Artificial Intelligence & Data Science',
        year: Number(s.year) || 2,
        semester: Number(s.semester) || 4,
        section: s.section || 'A',
        batch: s.batch || '2024-2028',
        advisorName: s.advisorName || '',
        parentPhone: s.parentPhone || null,
        isParentWhatsapp: s.isParentWhatsapp || false,
        bloodGroup: s.bloodGroup || null,
        residencyStatus: s.residencyStatus || null,
        busNo: s.busNo || null,
        boardingPoint: s.boardingPoint || null,
        busDetails: s.busDetails || null,
        hostelBlock: s.hostelBlock || null,
        roomNo: s.roomNo || null,
        address: s.address || null,
        cgpa: s.cgpa ? Number(s.cgpa) : null,
        attendance: s.attendance || null
      },
      update: {
        userId: existingUser.id,
        department: s.department || 'Artificial Intelligence & Data Science',
        year: Number(s.year) || 2,
        semester: Number(s.semester) || 4,
        section: s.section || 'A',
        batch: s.batch || '2024-2028',
        advisorName: s.advisorName || '',
        parentPhone: s.parentPhone || null,
        bloodGroup: s.bloodGroup || null,
        residencyStatus: s.residencyStatus || null,
        busNo: s.busNo || null,
        boardingPoint: s.boardingPoint || null,
        busDetails: s.busDetails || null,
        hostelBlock: s.hostelBlock || null,
        roomNo: s.roomNo || null,
        address: s.address || null,
        cgpa: s.cgpa ? Number(s.cgpa) : null,
        attendance: s.attendance || null
      }
    })

    backupRestoredCount++
  }

  console.log(`Successfully restored ${backupRestoredCount} additional students from backup.`)
  
  const finalCount = await prisma.student.count()
  console.log(`\n🎉 ALL DONE! Total Student records in Database: ${finalCount}`)
}

main()
  .catch((e) => {
    console.error('Fatal error during restoration:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
