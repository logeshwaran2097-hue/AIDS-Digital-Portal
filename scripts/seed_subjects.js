const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const SUBJECTS_TO_SEED = [
  { code: 'AD3301', name: 'Design and Analysis of Algorithms', credits: 4, sem: 3 },
  { code: 'AD3391', name: 'Database Design and Management', credits: 3, sem: 3 },
  { code: 'CS3351', name: 'Digital Principles and Computer Organization', credits: 4, sem: 3 },
  { code: 'AD3491', name: 'Fundamentals of Data Science', credits: 3, sem: 4 },
  { code: 'AL3452', name: 'Operating Systems', credits: 3, sem: 4 },
  { code: 'AD3501', name: 'Deep Learning', credits: 3, sem: 5 },
  { code: 'CW3551', name: 'Cloud Computing', credits: 3, sem: 5 },
  { code: 'AD3701', name: 'Natural Language Processing', credits: 3, sem: 7 },
  { code: 'AD2301', name: 'Data Structures and Algorithm Design', credits: 3, sem: 3 },
  { code: 'AD2302', name: 'Database Management Systems', credits: 3, sem: 3 },
  { code: 'AD2303', name: 'Object Oriented Programming with Java/C++', credits: 3, sem: 3 },
  { code: 'AD2304', name: 'Artificial Intelligence Principles & Tech', credits: 3, sem: 3 },
  { code: 'MA2301', name: 'Discrete Mathematics & Graph Theory', credits: 4, sem: 3 },
  { code: 'AD2501', name: 'Deep Learning Architectures & Neural Nets', credits: 3, sem: 5 },
  { code: 'AD2502', name: 'Big Data Technologies & Ecosystems', credits: 3, sem: 5 },
  { code: 'AD2503', name: 'Cloud Computing Architecture and DevOps', credits: 3, sem: 5 },
  { code: 'AD2504', name: 'Software Engineering and Agile Methodologies', credits: 3, sem: 5 },
  { code: 'AD2701', name: 'Reinforcement Learning and Robotics', credits: 3, sem: 7 },
  { code: 'AD2702', name: 'Edge AI and IoT Analytics', credits: 3, sem: 7 },
  { code: 'AD2703', name: 'Business Intelligence and Data Mining', credits: 3, sem: 7 },
  { code: 'AD2704', name: 'Professional Ethics & AI Governance', credits: 2, sem: 7 },
]

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
