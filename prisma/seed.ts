import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create settings
  const settings = [
    { key: 'college_name', value: 'V.S.B. Engineering College', isPublic: true },
    { key: 'department_name', value: 'Artificial Intelligence & Data Science', isPublic: true },
    { key: 'college_location', value: 'Karur, Tamil Nadu, India', isPublic: true },
    { key: 'portal_name', value: 'V.S.B. AI & DS Digital Portal', isPublic: true },
    { key: 'academic_year', value: '2025-2026', isPublic: true },
    { key: 'current_year', value: '2', isPublic: false },
    { key: 'current_semester', value: '3', isPublic: false },
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
      role:'admin',
      status:'active',
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
      status:'active',
    },
  })

  // Academic year
  const academicYear = await prisma.academicYear.upsert({
    where: { name: '2025-2026' },
    update: { isCurrent: true },
    create: {
      name: '2025-2026',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2026-06-30'),
      isCurrent: true,
    },
  })

  // Years (2 years for Year-1 and Year-2)
  const year1 = await prisma.year.upsert({
    where: { name_academicYearId: { name: 'Year 1', academicYearId: academicYear.id } },
    update: {},
    create: { name: 'Year 1', academicYearId: academicYear.id },
  })
  const year2 = await prisma.year.upsert({
    where: { name_academicYearId: { name: 'Year 2', academicYearId: academicYear.id } },
    update: {},
    create: { name: 'Year 2', academicYearId: academicYear.id },
  })

  const sem1 = await prisma.semester.upsert({
    where: { number_yearId: { number: 1, yearId: year1.id } },
    update: {},
    create: { name: 'Semester 1', number: 1, yearId: year1.id },
  })
  const sem2 = await prisma.semester.upsert({
    where: { number_yearId: { number: 2, yearId: year1.id } },
    update: {},
    create: { name: 'Semester 2', number: 2, yearId: year1.id },
  })
  const sem3 = await prisma.semester.upsert({
    where: { number_yearId: { number: 3, yearId: year2.id } },
    update: {},
    create: { name: 'Semester 3', number: 3, yearId: year2.id },
  })
  const sem = await prisma.semester.upsert({
    where: { number_yearId: { number: 4, yearId: year2.id } },
    update: {},
    create: { name: 'Semester 4', number: 4, yearId: year2.id },
  })

  // Subjects
  const subjectsData = [
    { code: 'AD2301', name: 'Data Structures', credits: 4, yearId: year2.id, semesterId: sem3.id, academicYearId: academicYear.id },
    { code: 'AD2302', name: 'Database Management Systems', credits: 4, yearId: year2.id, semesterId: sem3.id, academicYearId: academicYear.id },
    { code: 'AD2303', name: 'Discrete Mathematics', credits: 3, yearId: year2.id, semesterId: sem3.id, academicYearId: academicYear.id },
    { code: 'AD2304', name: 'Operating Systems', credits: 3, yearId: year2.id, semesterId: sem3.id, academicYearId: academicYear.id },
    { code: 'AD2305', name: 'Machine Learning Foundations', credits: 4, yearId: year2.id, semesterId: sem3.id, academicYearId: academicYear.id },
    { code: 'AD2306', name: 'Python Programming Lab', credits: 2, yearId: year2.id, semesterId: sem3.id, academicYearId: academicYear.id },
    { code: 'AD2307', name: 'Data Science Tools', credits: 2, yearId: year2.id, semesterId: sem3.id, academicYearId: academicYear.id },
  ]

  for (const s of subjectsData) {
    await prisma.subject.upsert({
      where: { code_academicYearId: { code: s.code, academicYearId: s.academicYearId } },
      update: { name: s.name, credits: s.credits },
      create: s,
    })
  }

  // Faculty members
  const facultyData = [
    {
      name: 'Dr. S. Karthik',
      email: 'karthik.ai@vsb.edu.in',
      facultyId: 'AI001',
      dob: '1978-04-12',
      phone: '+91 98840 12345',
      designation: 'Professor',
      qualification: 'Ph.D. (Computer Science)',
      experience: 18,
      specialization: 'Machine Learning, Deep Learning',
      subjects: ['AD2301', 'AD2305'],
    },
    {
      name: 'Mrs. R. Priya',
      email: 'priya.ai@vsb.edu.in',
      facultyId: 'AI002',
      dob: '1999-09-23',
      phone: '+91 97751 23456',
      designation: 'Assistant Professor',
      qualification: 'M.E. (Computer Science and Engineering)',
      experience: 6,
      specialization: 'Database Systems, Data Mining',
      subjects: ['AD2302', 'AD2307'],
    },
    {
      name: 'Mr. S. Arun',
      email: 'arun.ai@vsb.edu.in',
      facultyId: 'AI003',
      dob: '1992-01-30',
      designation: 'Assistant Professor',
      qualification: 'M.Tech. (Information Technology)',
      experience: 8,
      specialization: 'Operating Systems, Distributed Systems',
      subjects: ['AD2304'],
    },
    {
      name: 'Dr. M. Sowmya',
      email: 'sowmya.ai@vsb.edu.in',
      facultyId: 'AI004',
      dob: '1996-11-05',
      designation: 'Associate Professor',
      qualification: 'Ph.D. (Mathematics)',
      experience: 12,
      specialization: 'Discrete Mathematics, Optimization',
      subjects: ['AD2303'],
    },
  ]

  const facultyIds: string[] = []
  for (const f of facultyData) {
    const user = await prisma.user.upsert({
      where: { email: f.email },
      update: { name: f.name, phone: f.phone },
      create: {
        email: f.email,
        name: f.name,
        phone: f.phone,
        role: 'faculty',
        status:'active',
      },
    })
    const faculty = await prisma.faculty.upsert({
      where: { facultyId: f.facultyId },
      update: {
        designation: f.designation,
        qualification: f.qualification,
        experience: Number(f.experience),
        specialization: f.specialization,
        subjects: JSON.stringify(f.subjects),
      },
      create: {
        userId: user.id,
        facultyId: f.facultyId,
        dateOfBirth: new Date(f.dob),
        designation: f.designation,
        qualification: f.qualification,
        experience: Number(f.experience),
        specialization: f.specialization,
        subjects: JSON.stringify(f.subjects),
      },
    })
    facultyIds.push(faculty.id)
  }

  // HOD
  const hodUser = await prisma.user.upsert({
    where: { email: 'hod.ai@vsb.edu.in' },
    update: { name: 'Prof. Dr. V. Sundar', phone: '+91 94431 87654' },
    create: {
      email: 'hod.ai@vsb.edu.in',
      name: 'Prof. Dr. V. Sundar',
      phone: '+91 94431 87654',
      role: 'hod',
      status:'active',
    },
  })
  await prisma.hOD.upsert({
    where: { facultyId: 'HOD001' },
    update: {
      department: 'AI & DS',
      designation: 'Professor & Head',
      qualification: 'Ph.D. (Data Science)',
      experience: 21,
    },
    create: {
      userId: hodUser.id,
      facultyId: 'HOD001',
      dateOfBirth: new Date('1993-09-05'),
      department: 'AI & DS',
      designation: 'Professor & Head',
      qualification: 'Ph.D. (Data Science)',
      experience: 21,
    },
  })

  // Students
  const studentData = [
    { name: 'K. Aishwarya', reg: '23AD001', email: '23ad001@vsb.edu.in', dob: '2005-07-15', dept: 'AI & DS', year: 2, sem: 3, section: 'A', phone: '+91 90252 10001' },
    { name: 'S. Mohammed Irfan', reg: '23AD002', email: '23ad002@vsb.edu.in', dob: '2005-01-25', dept: 'AI & DS', year: 2, sem: 3, section: 'A', phone: '+91 90252 10002' },
    { name: 'R. Tharika', reg: '23AD003', email: '23ad003@vsb.edu.in', dob: '2005-03-08', dept: 'AI & DS', year: 2, sem: 3, section: 'A', phone: '+91 90252 10003' },
    { name: 'S. Manikandan', reg: '23AD004', email: '23ad004@vsb.edu.in', dob: '2004-12-09', dept: 'AI & DS', year: 2, sem: 3, section: 'B', phone: '+91 90252 10004' },
    { name: 'K. Varsha', reg: '23AD005', email: '23ad005@vsb.edu.in', dob: '2005-11-20', dept: 'AI & DS', year: 2, sem: 3, section: 'B', phone: '+91 90252 10005' },
    { name: 'M. Kiruthika', reg: '23AD006', email: '23ad006@vsb.edu.in', dob: '2005-04-19', dept: 'AI & DS', year: 2, sem: 3, section: 'B', phone: '+91 90252 10006' },
    { name: 'A. Lakshman', reg: '23AD007', email: '23ad007@vsb.edu.in', dob: '2005-08-17', dept: 'AI & DS', year: 2, sem: 3, section: 'C', phone: '+91 90252 10007' },
    { name: 'R. Divya', reg: '23AD008', email: '23ad008@vsb.edu.in', dob: '2005-06-21', dept: 'AI & DS', year: 2, sem: 3, section: 'C', phone: '+91 90252 10008' },
  ]

  const studentUserIds: string[] = []
  for (const s of studentData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: { name: s.name, phone: s.phone },
      create: {
        email: s.email,
        name: s.name,
        phone: s.phone,
        role: 'student',
        status:'active',
      },
    })
    const student = await prisma.student.upsert({
      where: { registerNumber: s.reg },
      update: { semester: s.sem, year: s.year, section: s.section },
      create: {
        userId: user.id,
        registerNumber: s.reg,
        dateOfBirth: new Date(s.dob),
        department: s.dept,
        year: s.year,
        semester: s.sem,
        section: s.section,
      },
    })
    studentUserIds.push(student.id)
  }

  console.log('Seeded.users:', await prisma.user.count())
  console.log('Seeded.students:', await prisma.student.count())
  console.log('Seeded.faculty:', await prisma.faculty.count())
  console.log('Seeded.subjects:', await prisma.subject.count())
  console.log('Seed complete!')
}

main()
  .then(() => process.exit())
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })