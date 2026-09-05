const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('--- Seeding Onboarding Data for Advisor, Faculty, and HOD ---')
  const tempPassword = 'nitr'
  const passwordHash = await bcrypt.hash(tempPassword, 10)

  // 1. Seed Head of Department (HOD)
  console.log('1. Seeding HOD...')
  const hodUser = await prisma.user.upsert({
    where: { email: 'hod.ai@vsb.edu.in' },
    update: {
      role: 'hod',
      status: 'active',
      name: 'Prof. Dr. V. Sundar',
      passwordHash,
      mustChangePassword: true,
      phone: '+91 94431 87654',
    },
    create: {
      email: 'hod.ai@vsb.edu.in',
      name: 'Prof. Dr. V. Sundar',
      phone: '+91 94431 87654',
      role: 'hod',
      status: 'active',
      passwordHash,
      mustChangePassword: true,
    },
  })

  await prisma.hOD.upsert({
    where: { facultyId: 'HOD001' },
    update: {
      userId: hodUser.id,
      department: 'Artificial Intelligence & Data Science',
      designation: 'Professor & Head of Department',
      qualification: 'Ph.D. (AI & DS), M.Tech (CSE)',
      experience: 18,
      dateOfBirth: new Date('1978-05-15'),
    },
    create: {
      userId: hodUser.id,
      facultyId: 'HOD001',
      department: 'Artificial Intelligence & Data Science',
      designation: 'Professor & Head of Department',
      qualification: 'Ph.D. (AI & DS), M.Tech (CSE)',
      experience: 18,
      dateOfBirth: new Date('1978-05-15'),
    },
  })
  console.log('✓ HOD Seeded: Prof. Dr. V. Sundar (HOD001 / hod.ai@vsb.edu.in)')

  // 2. Seed Class Advisors & Faculty
  const staffMembers = [
    // --- CLASS ADVISORS ---
    {
      fid: 'FAC001',
      name: 'Dr. S. Karthik',
      email: 'karthik.ai@vsb.edu.in',
      phone: '+91 98421 11223',
      designation: 'Professor & Class Advisor',
      qualification: 'M.E., Ph.D. (Information & Comm.)',
      experience: 14,
      specialization: 'Deep Learning & Cloud Computing',
      subjectName: 'Object Oriented Programming Laboratory',
      subjects: ['AD2311', 'AD2511'],
      advisorBatch: 'Year II - Sem 3 - Sec A',
      advisorYear: 2,
      advisorSem: 3,
      advisorSec: 'A',
      facultyType: 'both',
      classDay: 'Tue, Fri',
      classPeriod: 'Lab Session (AN)',
      classTime: '01:20 PM - 04:30 PM',
      dob: '1985-03-20',
    },
    {
      fid: 'FAC002',
      name: 'Mrs. R. Priya',
      email: 'priya.ai@vsb.edu.in',
      phone: '+91 98421 44556',
      designation: 'Assistant Professor & Class Advisor',
      qualification: 'M.E. (AI & DS), (Ph.D.)',
      experience: 6,
      specialization: 'Natural Language Processing & Soft Skills',
      subjectName: 'Communication Training & Soft Skills',
      subjects: ['AD2515', 'AD2611'],
      advisorBatch: 'Year I - Sem 1 - Sec A',
      advisorYear: 1,
      advisorSem: 1,
      advisorSec: 'A',
      facultyType: 'both',
      classDay: 'Tue',
      classPeriod: 'Period 7, Period 8',
      classTime: '03:05 PM - 03:50 PM, 03:50 PM - 04:30 PM',
      dob: '1990-07-12',
    },
    {
      fid: 'FAC003',
      name: 'Mr. S. Arun',
      email: 'arun.ai@vsb.edu.in',
      phone: '+91 98421 33445',
      designation: 'Assistant Professor & Class Advisor',
      qualification: 'M.E. (Computer Science)',
      experience: 7,
      specialization: 'Data Structures & Distributed Systems',
      subjectName: 'Data Structures & Algorithms Laboratory',
      subjects: ['AD2313', 'AD2514'],
      advisorBatch: 'Year II - Sem 3 - Sec B',
      advisorYear: 2,
      advisorSem: 3,
      advisorSec: 'B',
      facultyType: 'both',
      classDay: 'Fri',
      classPeriod: 'Lab Session (AN)',
      classTime: '01:20 PM - 04:30 PM',
      dob: '1988-11-25',
    },
    {
      fid: 'FAC004',
      name: 'Dr. M. Sowmya',
      email: 'sowmya.ai@vsb.edu.in',
      phone: '+91 98421 22334',
      designation: 'Associate Professor & Class Advisor',
      qualification: 'M.Tech., Ph.D.',
      experience: 11,
      specialization: 'Big Data & Database Architectures',
      subjectName: 'Database Management Systems Laboratory',
      subjects: ['AD2312', 'AD2513'],
      advisorBatch: 'Year III - Sem 5 - Sec A',
      advisorYear: 3,
      advisorSem: 5,
      advisorSec: 'A',
      facultyType: 'both',
      classDay: 'Thu',
      classPeriod: 'Lab Session (FN)',
      classTime: '09:15 AM - 12:30 PM',
      dob: '1983-09-18',
    },
    {
      fid: 'FAC005',
      name: 'Dr. K. Meenakshi',
      email: 'meenakshi.ai@vsb.edu.in',
      phone: '+91 98421 55667',
      designation: 'Associate Professor & Class Advisor',
      qualification: 'M.Tech., Ph.D.',
      experience: 13,
      specialization: 'Computer Vision & Autonomous Systems',
      subjectName: 'Computer Vision & Pattern Recognition',
      subjects: ['AD2711', 'AD2712'],
      advisorBatch: 'Year IV - Sem 7 - Sec A',
      advisorYear: 4,
      advisorSem: 7,
      advisorSec: 'A',
      facultyType: 'both',
      classDay: 'Mon, Wed',
      classPeriod: 'Period 3, Period 4',
      classTime: '10:45 AM - 12:30 PM',
      dob: '1982-04-14',
    },
    // --- TEACHING FACULTY (Course & Lab Incharges) ---
    {
      fid: 'FAC006',
      name: 'Prof. N. Rajesh',
      email: 'rajesh.ai@vsb.edu.in',
      phone: '+91 98421 66778',
      designation: 'Assistant Professor',
      qualification: 'M.Tech (CSE)',
      experience: 8,
      specialization: 'Machine Learning & Neural Networks',
      subjectName: 'Machine Learning Applications',
      subjects: ['AD2401', 'AD2411'],
      advisorBatch: null,
      advisorYear: null,
      advisorSem: null,
      advisorSec: null,
      facultyType: 'teaching',
      classDay: 'Wed, Fri',
      classPeriod: 'Period 2',
      classTime: '09:55 AM - 10:40 AM',
      dob: '1991-08-22',
    },
    {
      fid: 'FAC007',
      name: 'Dr. B. Anitha',
      email: 'anitha.ai@vsb.edu.in',
      phone: '+91 98421 77889',
      designation: 'Associate Professor',
      qualification: 'M.E., Ph.D.',
      experience: 10,
      specialization: 'Data Mining & Predictive Analytics',
      subjectName: 'Data Analytics & Visualization',
      subjects: ['AD2402', 'AD2412'],
      advisorBatch: null,
      advisorYear: null,
      advisorSem: null,
      advisorSec: null,
      facultyType: 'teaching',
      classDay: 'Mon, Thu',
      classPeriod: 'Period 5',
      classTime: '01:20 PM - 02:05 PM',
      dob: '1986-12-05',
    },
    {
      fid: 'FAC008',
      name: 'Mr. P. Venkatesh',
      email: 'venkatesh.ai@vsb.edu.in',
      phone: '+91 98421 88990',
      designation: 'Assistant Professor & Lab Incharge',
      qualification: 'M.E. (Software Engg)',
      experience: 5,
      specialization: 'Full Stack Development & Cloud DevOps',
      subjectName: 'Web & Cloud Platforms Laboratory',
      subjects: ['AD2501', 'AD2512'],
      advisorBatch: null,
      advisorYear: null,
      advisorSem: null,
      advisorSec: null,
      facultyType: 'teaching',
      classDay: 'Tue, Thu',
      classPeriod: 'Lab Session (AN)',
      classTime: '01:20 PM - 04:30 PM',
      dob: '1992-02-17',
    },
  ]

  console.log(`2. Seeding ${staffMembers.length} Faculty & Advisor Members...`)
  for (const s of staffMembers) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        name: s.name,
        role: 'faculty',
        status: 'active',
        passwordHash,
        mustChangePassword: true,
        phone: s.phone,
      },
      create: {
        email: s.email,
        name: s.name,
        phone: s.phone,
        role: 'faculty',
        status: 'active',
        passwordHash,
        mustChangePassword: true,
      },
    })

    await prisma.faculty.upsert({
      where: { facultyId: s.fid },
      update: {
        userId: user.id,
        designation: s.designation,
        qualification: s.qualification,
        experience: s.experience,
        specialization: s.specialization,
        subjects: JSON.stringify(s.subjects),
        subjectName: s.subjectName,
        classDay: s.classDay,
        classPeriod: s.classPeriod,
        classTime: s.classTime,
        advisorBatch: s.advisorBatch,
        advisorYear: s.advisorYear,
        advisorSem: s.advisorSem,
        advisorSec: s.advisorSec,
        facultyType: s.facultyType,
        dateOfBirth: new Date(s.dob),
      },
      create: {
        userId: user.id,
        facultyId: s.fid,
        designation: s.designation,
        qualification: s.qualification,
        experience: s.experience,
        specialization: s.specialization,
        subjects: JSON.stringify(s.subjects),
        subjectName: s.subjectName,
        classDay: s.classDay,
        classPeriod: s.classPeriod,
        classTime: s.classTime,
        advisorBatch: s.advisorBatch,
        advisorYear: s.advisorYear,
        advisorSem: s.advisorSem,
        advisorSec: s.advisorSec,
        facultyType: s.facultyType,
        dateOfBirth: new Date(s.dob),
      },
    })

    const roleTag = s.advisorBatch ? `[Advisor - ${s.advisorBatch}]` : '[Faculty]'
    console.log(`✓ ${roleTag} ${s.name} (${s.fid} / ${s.email})`)
  }

  console.log('\n--- Onboarding Staff Seeding Completed Successfully! ---')
}

main()
  .catch((e) => {
    console.error('Error seeding onboarding data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
