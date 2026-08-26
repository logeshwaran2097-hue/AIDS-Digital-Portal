import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const passwordHash = await bcrypt.hash('nitr', 10)

    // 1. Seed Head of Department (HOD)
    const hodUser = await prisma.user.upsert({
      where: { email: 'hod.ai@vsb.edu.in' },
      update: { role: 'hod', status: 'active', name: 'Prof. Dr. V. Sundar', passwordHash, mustChangePassword: true },
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
      update: { userId: hodUser.id, designation: 'Professor & Head', qualification: 'Ph.D. (AI & DS)', experience: 18 },
      create: {
        userId: hodUser.id,
        facultyId: 'HOD001',
        department: 'Artificial Intelligence & Data Science',
        designation: 'Professor & Head',
        qualification: 'Ph.D. (AI & DS)',
        experience: 18,
        dateOfBirth: new Date('1978-05-15'),
      },
    })

    // 2. Seed Faculty Members (Class Advisors & Lab Handlers across 8 Semesters)
    const facultyData = [
      {
        name: 'Dr. S. Karthik',
        email: 'karthik.ai@vsb.edu.in',
        phone: '+91 98421 11223',
        designation: 'Professor',
        qualification: 'M.E., Ph.D.',
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
      },
      {
        name: 'Dr. M. Sowmya',
        email: 'sowmya.ai@vsb.edu.in',
        phone: '+91 98421 22334',
        designation: 'Associate Professor',
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
      },
      {
        name: 'Mr. S. Arun',
        email: 'arun.ai@vsb.edu.in',
        phone: '+91 98421 33445',
        designation: 'Assistant Professor',
        qualification: 'M.E. (CSE)',
        experience: 7,
        specialization: 'Data Structures & Algorithms',
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
      },
      {
        name: 'Mrs. R. Priya',
        email: 'priya.ai@vsb.edu.in',
        phone: '+91 98421 44556',
        designation: 'Assistant Professor',
        qualification: 'M.E. (AI & DS)',
        experience: 6,
        specialization: 'Communication Training & Natural Language Processing',
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
      },
    ]

    for (let i = 0; i < facultyData.length; i++) {
      const f = facultyData[i]
      const fid = `FAC${(i + 1).toString().padStart(3, '0')}`
      const u = await prisma.user.upsert({
        where: { email: f.email },
        update: { name: f.name, role: 'faculty', status: 'active', passwordHash, mustChangePassword: true },
        create: {
          email: f.email,
          name: f.name,
          phone: f.phone,
          role: 'faculty',
          status: 'active',
          passwordHash,
          mustChangePassword: true,
        },
      })

      await prisma.faculty.upsert({
        where: { facultyId: fid },
        update: {
          userId: u.id,
          designation: f.designation,
          qualification: f.qualification,
          experience: f.experience,
          specialization: f.specialization,
          subjects: JSON.stringify(f.subjects),
          subjectName: f.subjectName,
          classDay: f.classDay,
          classPeriod: f.classPeriod,
          classTime: f.classTime,
          advisorBatch: f.advisorBatch,
          advisorYear: f.advisorYear,
          advisorSem: f.advisorSem,
          advisorSec: f.advisorSec,
          facultyType: f.facultyType,
        },
        create: {
          userId: u.id,
          facultyId: fid,
          designation: f.designation,
          qualification: f.qualification,
          experience: f.experience,
          specialization: f.specialization,
          subjects: JSON.stringify(f.subjects),
          subjectName: f.subjectName,
          classDay: f.classDay,
          classPeriod: f.classPeriod,
          classTime: f.classTime,
          advisorBatch: f.advisorBatch,
          advisorYear: f.advisorYear,
          advisorSem: f.advisorSem,
          advisorSec: f.advisorSec,
          facultyType: f.facultyType,
          dateOfBirth: new Date('1985-03-20'),
        },
      })
    }

    // 3. Seed Sample Students across Semesters 1 to 8
    const sampleStudents = [
      { reg: '922522AD001', name: 'Aarav Sharma', email: '922522ad001@vsb.edu.in', year: 2, sem: 3, sec: 'A' },
      { reg: '922522AD002', name: 'Deepa Krishnan', email: '922522ad002@vsb.edu.in', year: 2, sem: 3, sec: 'A' },
      { reg: '922522AD003', name: 'Dinesh Kumar', email: '922522ad003@vsb.edu.in', year: 2, sem: 3, sec: 'A' },
      { reg: '922521AD015', name: 'Gowtham R', email: '922521ad015@vsb.edu.in', year: 3, sem: 5, sec: 'A' },
      { reg: '922521AD022', name: 'Harini V', email: '922521ad022@vsb.edu.in', year: 3, sem: 5, sec: 'A' },
      { reg: '922520AD008', name: 'Karthik S', email: '922520ad008@vsb.edu.in', year: 4, sem: 7, sec: 'A' },
      { reg: '922523AD005', name: 'Keerthana M', email: '922523ad005@vsb.edu.in', year: 1, sem: 1, sec: 'A' },
      { reg: '922522AD045', name: 'Logeshwaran S', email: '922522ad045@vsb.edu.in', year: 2, sem: 3, sec: 'A' },
    ]

    for (const s of sampleStudents) {
      const u = await prisma.user.upsert({
        where: { email: s.email },
        update: { name: s.name, role: 'student', status: 'active', passwordHash, mustChangePassword: true },
        create: {
          email: s.email,
          name: s.name,
          role: 'student',
          status: 'active',
          passwordHash,
          mustChangePassword: true,
        },
      })

      await prisma.student.upsert({
        where: { registerNumber: s.reg },
        update: { userId: u.id, year: s.year, semester: s.sem, section: s.sec },
        create: {
          userId: u.id,
          registerNumber: s.reg,
          department: 'Artificial Intelligence & Data Science',
          year: s.year,
          semester: s.sem,
          section: s.sec,
          dateOfBirth: new Date('2004-06-12'),
        },
      })
    }

    // 4. Seed Official Department Circulars
    const sampleNotices = [
      {
        title: 'Schedule for Anna University End-Semester Practical Examinations',
        content: 'All practical laboratory examinations for Odd Semesters (Sem 3, 5, 7) will commence from next Monday. Students must bring signed observation notebooks.',
        category: 'ACADEMIC',
        target: 'ALL',
        createdByName: 'Prof. Dr. V. Sundar (HOD)',
      },
      {
        title: 'Campus Placement Drive: AI Research & Data Analyst Roles',
        content: 'Tier-1 AI Solutions campus interview drive scheduled for 4th Year and 3rd Year students on Friday at 09:30 AM in Auditorium Hall.',
        category: 'PLACEMENT',
        target: 'year4',
        createdByName: 'Placement Directorate',
      },
      {
        title: 'National Level AI & Generative Intelligence Hackathon 2026',
        content: 'Registration is now live for the 36-hour National Level Hackathon. Cash prizes up to Rs. 1,00,000 for winning student prototype teams.',
        category: 'HACKATHON',
        target: 'students',
        createdByName: 'AI Association Coordinator',
      },
    ]

    for (const n of sampleNotices) {
      await prisma.announcement.create({
        data: {
          title: n.title,
          content: n.content,
          category: n.category,
          target: n.target,
          createdByName: n.createdByName,
          isPublished: true,
        },
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      message: 'Baseline academic data initialized with HOD, Faculty, Students (Semesters 1-8), and Notices!',
    })
  } catch (error) {
    console.error('Error seeding baseline data:', error)
    return NextResponse.json({ success: false, message: 'Failed to seed baseline data: ' + String(error) }, { status: 500 })
  }
}
