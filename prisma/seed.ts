import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Initializing database settings and administrator...')

  // Create system settings
  const settings = [
    { key: 'college_name', value: 'V.S.B. Engineering College', isPublic: true },
    { key: 'department_name', value: 'Artificial Intelligence & Data Science', isPublic: true },
    { key: 'college_location', value: 'Karur, Tamil Nadu, India', isPublic: true },
    { key: 'portal_name', value: 'V.S.B. AI & DS Digital Portal', isPublic: true },
    { key: 'academic_year', value: '2025-2026', isPublic: true },
    { key: 'current_year', value: '2', isPublic: false },
    { key: 'current_semester', value: '4', isPublic: false },
    { key: 'maintenance_mode', value: 'false', isPublic: false },
  ]
  for (const s of settings) {
    await prisma.systemSettings.upsert({
      where: { key: s.key },
      update: { value: s.value, isPublic: s.isPublic },
      create: s,
    })
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'lonelyboy44y@gmail.com'

  // Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'System Administrator',
      phone: '+91 98765 43210',
      role: 'admin',
      status: 'active',
    },
  })

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { status: 'active' },
    create: {
      userId: adminUser.id,
      name: 'System Administrator',
      email: adminEmail,
      role: 'super_admin',
      status: 'active',
    },
  })

  // Academic year
  await prisma.academicYear.upsert({
    where: { name: '2025-2026' },
    update: { isCurrent: true },
    create: {
      name: '2025-2026',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2026-06-30'),
      isCurrent: true,
    },
  })

  console.log('Database initialized cleanly without mock data!')
}

main()
  .then(() => process.exit())
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })