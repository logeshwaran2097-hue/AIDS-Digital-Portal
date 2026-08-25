import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning all mock students, faculty, and HODs from database...')
  
  const s = await prisma.student.deleteMany({})
  const u1 = await prisma.user.deleteMany({ where: { role: 'student' } })
  
  const f = await prisma.faculty.deleteMany({})
  const u2 = await prisma.user.deleteMany({ where: { role: 'faculty' } })
  
  const h = await prisma.hOD.deleteMany({})
  const u3 = await prisma.user.deleteMany({ where: { role: 'hod' } })
  
  console.log(`Deleted ${s.count} student records, ${u1.count} student users`)
  console.log(`Deleted ${f.count} faculty records, ${u2.count} faculty users`)
  console.log(`Deleted ${h.count} HOD records, ${u3.count} HOD users`)
  console.log('Database mock data cleaned successfully!')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Error cleaning mock data:', e)
    process.exit(1)
  })
