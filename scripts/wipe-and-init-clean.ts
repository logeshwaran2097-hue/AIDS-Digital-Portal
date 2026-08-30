import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 [1/3] Erasing all existing data from database...')

  // Delete dependent & secondary records
  await prisma.attendanceRecord.deleteMany({})
  await prisma.attendanceSession.deleteMany({})
  await prisma.profileChangeRequest.deleteMany({})
  await prisma.note.deleteMany({})
  await prisma.labManual.deleteMany({})
  await prisma.importantQuestion.deleteMany({})
  await prisma.resource.deleteMany({})
  await prisma.questionPaper.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.event.deleteMany({})
  await prisma.announcement.deleteMany({})
  await prisma.achievement.deleteMany({})
  await prisma.notification.deleteMany({})
  await prisma.fileRecord.deleteMany({})
  await prisma.classAdvisor.deleteMany({})
  await prisma.auditLog.deleteMany({})
  await prisma.oTP.deleteMany({})

  // Delete entity profiles
  await prisma.student.deleteMany({})
  await prisma.faculty.deleteMany({})
  await prisma.hOD.deleteMany({})
  await prisma.admin.deleteMany({})

  // Delete all non-superadmin users
  await prisma.user.deleteMany({})

  console.log('✅ [2/3] All data successfully erased.')

  console.log('👤 [3/3] Initializing clean System Administrator account...')
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@vsb.edu.in').toLowerCase().trim()

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'System Administrator',
      role: 'admin',
      status: 'active',
      emailVerified: true,
      mustChangePassword: false,
    },
    create: {
      email: adminEmail,
      name: 'System Administrator',
      role: 'admin',
      status: 'active',
      emailVerified: true,
      mustChangePassword: false,
    },
  })

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      userId: adminUser.id,
      name: 'System Administrator',
      role: 'super_admin',
      status: 'active',
    },
    create: {
      userId: adminUser.id,
      email: adminEmail,
      name: 'System Administrator',
      role: 'super_admin',
      status: 'active',
    },
  })

  console.log(`🎉 Database is now completely clean and ready! Primary admin: ${adminEmail}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error wiping database:', err)
    process.exit(1)
  })
