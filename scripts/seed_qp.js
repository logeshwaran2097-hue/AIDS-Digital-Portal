const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const ay = await prisma.academicYear.findFirst()
  if (!ay) {
    console.log('No AcademicYear found')
    return
  }

  const subjectsData = [
    { code: 'AD2301', name: 'Data Structures & Algorithm Analysis', credits: 4, sem: 3, year: 2 },
    { code: 'AD2302', name: 'Database Management Systems & Architecture', credits: 4, sem: 3, year: 2 },
    { code: 'AD2303', name: 'Artificial Intelligence Principles & Foundations', credits: 3, sem: 3, year: 2 },
    { code: 'MA2301', name: 'Discrete Mathematics & Graph Theory', credits: 4, sem: 3, year: 2 },
    { code: 'CS2304', name: 'Operating Systems & Concurrency', credits: 3, sem: 3, year: 2 },
    { code: 'AD2401', name: 'Machine Learning Techniques & Applications', credits: 4, sem: 4, year: 2 },
    { code: 'AD2402', name: 'Design & Analysis of Algorithms', credits: 4, sem: 4, year: 2 },
    { code: 'AD2501', name: 'Deep Learning & Neural Networks', credits: 4, sem: 5, year: 3 },
  ]

  const createdSubjects = []
  for (const s of subjectsData) {
    let sub = await prisma.subject.findFirst({
      where: { code: s.code, academicYearId: ay.id },
    })
    if (!sub) {
      sub = await prisma.subject.create({
        data: {
          code: s.code,
          name: s.name,
          credits: s.credits,
          academicYearId: ay.id,
          description: `Core curriculum course for Semester ${s.sem}`,
        },
      })
    }
    createdSubjects.push(sub)
  }

  console.log(`Created/found ${createdSubjects.length} subjects.`)

  const qpList = [
    {
      subjectCode: 'AD2301',
      examType: 'Internal Test 1 (IAT 1)',
      academicYear: '2025-2026',
      year: 2,
      semester: 3,
      section: 'A',
      fileName: 'AD2301_IAT1_2025.pdf',
      fileSize: 2450000,
    },
    {
      subjectCode: 'AD2301',
      examType: 'Internal Test 2 (IAT 2)',
      academicYear: '2025-2026',
      year: 2,
      semester: 3,
      section: 'A',
      fileName: 'AD2301_IAT2_2025.pdf',
      fileSize: 2680000,
    },
    {
      subjectCode: 'AD2301',
      examType: 'Model Examination',
      academicYear: '2024-2025',
      year: 2,
      semester: 3,
      section: 'A',
      fileName: 'AD2301_Model_Exam_2025.pdf',
      fileSize: 3120000,
    },
    {
      subjectCode: 'AD2301',
      examType: 'Anna University Examination (Nov/Dec)',
      academicYear: '2024-2025',
      year: 2,
      semester: 3,
      section: 'A',
      fileName: 'AD2301_AnnaUniv_NovDec2024.pdf',
      fileSize: 3840000,
    },
    {
      subjectCode: 'AD2302',
      examType: 'Internal Test 1 (IAT 1)',
      academicYear: '2025-2026',
      year: 2,
      semester: 3,
      section: 'A',
      fileName: 'AD2302_IAT1_2025.pdf',
      fileSize: 2150000,
    },
    {
      subjectCode: 'AD2302',
      examType: 'Internal Test 2 (IAT 2)',
      academicYear: '2025-2026',
      year: 2,
      semester: 3,
      section: 'A',
      fileName: 'AD2302_IAT2_2025.pdf',
      fileSize: 2340000,
    },
    {
      subjectCode: 'AD2303',
      examType: 'Internal Test 1 (IAT 1)',
      academicYear: '2025-2026',
      year: 2,
      semester: 3,
      section: 'A',
      fileName: 'AD2303_IAT1_2025.pdf',
      fileSize: 2520000,
    },
    {
      subjectCode: 'AD2303',
      examType: 'Model Examination',
      academicYear: '2024-2025',
      year: 2,
      semester: 3,
      section: 'A',
      fileName: 'AD2303_Model_2025.pdf',
      fileSize: 3410000,
    },
    {
      subjectCode: 'MA2301',
      examType: 'Internal Test 1 (IAT 1)',
      academicYear: '2025-2026',
      year: 2,
      semester: 3,
      section: 'A',
      fileName: 'MA2301_IAT1_2025.pdf',
      fileSize: 1980000,
    },
    {
      subjectCode: 'CS2304',
      examType: 'Anna University Examination (Nov/Dec)',
      academicYear: '2024-2025',
      year: 2,
      semester: 3,
      section: 'A',
      fileName: 'CS2304_AnnaUniv_NovDec2024.pdf',
      fileSize: 3200000,
    },
  ]

  for (const q of qpList) {
    const sub = createdSubjects.find((s) => s.code === q.subjectCode)
    if (!sub) continue

    await prisma.questionPaper.create({
      data: {
        subjectId: sub.id,
        examType: q.examType,
        academicYear: q.academicYear,
        year: q.year,
        semester: q.semester,
        section: q.section,
        fileName: q.fileName,
        fileType: 'application/pdf',
        fileSize: q.fileSize,
        fileUrl: `/uploads/${q.fileName}`,
        uploadedByName: 'Class Advisor Directorate',
        status: 'published',
      },
    })
  }

  const finalCount = await prisma.questionPaper.count()
  console.log(`Total question papers now in DB: ${finalCount}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
