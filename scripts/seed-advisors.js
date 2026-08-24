const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const faculty1 = await prisma.faculty.findUnique({ where: { facultyId: 'AI001' } });
  const faculty2 = await prisma.faculty.findUnique({ where: { facultyId: 'AI002' } });
  
  console.log('Faculty AI001:', faculty1 ? faculty1.id : 'NOT FOUND');
  console.log('Faculty AI002:', faculty2 ? faculty2.id : 'NOT FOUND');
  
  if (faculty1) {
    await prisma.classAdvisor.upsert({
      where: { year_section_semester_academicYear: { year: 2, section: 'A', semester: 3, academicYear: '2025-2026' }},
      update: { facultyId: faculty1.id, facultyName: 'Dr. S. Karthik' },
      create: { facultyId: faculty1.id, facultyName: 'Dr. S. Karthik', year: 2, section: 'A', semester: 3, academicYear: '2025-2026' }
    });
    console.log('Created advisor: AI001 -> Year 2 Sec A');
  }
  
  if (faculty2) {
    await prisma.classAdvisor.upsert({
      where: { year_section_semester_academicYear: { year: 2, section: 'B', semester: 3, academicYear: '2025-2026' }},
      update: { facultyId: faculty2.id, facultyName: 'Mrs. R. Priya' },
      create: { facultyId: faculty2.id, facultyName: 'Mrs. R. Priya', year: 2, section: 'B', semester: 3, academicYear: '2025-2026' }
    });
    console.log('Created advisor: AI002 -> Year 2 Sec B');
  }
  
  const students = await prisma.student.count();
  const advisors = await prisma.classAdvisor.count();
  console.log('Students in DB:', students, '| Advisors in DB:', advisors);
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
