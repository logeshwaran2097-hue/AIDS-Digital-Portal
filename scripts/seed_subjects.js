const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const SUBJECTS_TO_SEED = []

async function main() {
  const currentAY = await prisma.academicYear.findFirst({ where: { isCurrent: true } })
  const academicYearId = currentAY ? currentAY.id : 'cmtmnsw30000apv1wxafyfv59'

  for (const s of SUBJECTS_TO_SEED) {
    await prisma.subject.upsert({
      where: {
        code_academicYearId: {
          code: s.code,
          academicYearId,
        },
      },
      update: {
        name: s.name,
        credits: s.credits,
        description: `Regulation 2021 curriculum course (Sem ${s.sem})`,
      },
      create: {
        code: s.code,
        name: s.name,
        credits: s.credits,
        description: `Regulation 2021 curriculum course (Sem ${s.sem})`,
        academicYearId,
      },
    })
  }
  const count = await prisma.subject.count()
  console.log(`Successfully seeded subjects! Total subjects in DB: ${count}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
