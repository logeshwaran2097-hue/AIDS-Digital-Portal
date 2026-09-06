import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cachedDbQuery, invalidateCache } from '@/lib/dbCache'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(request: Request) {
  try {
    const result = await cachedDbQuery(
      'all_faculty_records',
      async () => {
        const facultyRecords = await prisma.faculty.findMany({
          orderBy: { facultyId: 'asc' },
        })

        const userIds = facultyRecords.map((f) => f.userId)
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
        })
        const userMap = new Map(users.map((u) => [u.id, u]))

        return facultyRecords.map((f) => {
          const u = userMap.get(f.userId)
          let subjectsArr: string[] = []
          try {
            subjectsArr = JSON.parse(f.subjects || '[]')
          } catch {
            subjectsArr = []
          }

          return {
            id: f.id,
            userId: f.userId,
            facultyId: f.facultyId,
            name: u?.name || 'Faculty Member',
            email: u?.email || `${f.facultyId.toLowerCase()}@vsb.edu.in`,
            phone: u?.phone || '',
            designation: f.designation,
            qualification: f.qualification,
            experience: f.experience,
            specialization: f.specialization,
            subjects: subjectsArr,
            subjectName: f.subjectName || null,
            classDay: f.classDay || null,
            classPeriod: f.classPeriod || null,
            classTime: f.classTime || null,
            advisorBatch: f.advisorBatch || null,
            advisorYear: f.advisorYear || null,
            advisorSem: f.advisorSem || null,
            advisorSec: f.advisorSec || null,
            facultyType: f.facultyType || 'both',
            status: u?.status || 'active',
          }
        })
      },
      3000,
      ['faculty']
    )

    return NextResponse.json({
      success: true,
      faculty: result,
    })
  } catch (error) {
    console.error('Fetch faculty error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch faculty' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const {
      facultyId,
      name,
      email,
      phone,
      password,
      dateOfBirth,
      designation = 'Assistant Professor',
      qualification = 'M.E., Ph.D.',
      experience = 1,
      specialization = 'Artificial Intelligence',
      subjects = [],
      subjectName,
      classDay,
      classPeriod,
      classTime,
      advisorBatch,
      advisorYear,
      advisorSem,
      advisorSec,
      facultyType = 'both',
      status = 'active',
    } = data

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Faculty Name is required.' },
        { status: 400 }
      )
    }

    const fid = facultyId?.trim().toUpperCase() || 'FAC' + Math.floor(1000 + Math.random() * 9000)
    const institutionalEmail = (email && email.trim()) ? email.trim().toLowerCase() : `${fid.toLowerCase()}@vsb.edu.in`

    // Check if faculty or user already exists
    const existingFaculty = await prisma.faculty.findUnique({
      where: { facultyId: fid },
    }).catch(() => null)

    const existingUser = await prisma.user.findUnique({
      where: { email: institutionalEmail },
    }).catch(() => null)

    const isExisting = !!(existingFaculty || existingUser)

    // Only require password for brand new registrations
    if (!isExisting && !password?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Faculty Name and Temporary Password are required for new faculty.' },
        { status: 400 }
      )
    }

    // Determine password update
    let newPasswordHash: string | undefined = undefined
    if (password && password.trim()) {
      newPasswordHash = await bcrypt.hash(password.trim(), 10)
    } else if (!isExisting) {
      newPasswordHash = await bcrypt.hash('TempPass@2026', 10)
    }

    // User update data
    const userUpdateData: any = {
      name: name.trim(),
      phone: phone || null,
      role: 'faculty',
      status: status || 'active',
    }
    if (newPasswordHash) {
      userUpdateData.passwordHash = newPasswordHash
      userUpdateData.mustChangePassword = true
    }

    // Upsert User
    const user = await prisma.user.upsert({
      where: { email: institutionalEmail },
      update: userUpdateData,
      create: {
        email: institutionalEmail,
        name: name.trim(),
        phone: phone || null,
        role: 'faculty',
        status: status || 'active',
        passwordHash: newPasswordHash || await bcrypt.hash('TempPass@2026', 10),
        mustChangePassword: true,
        emailVerified: true,
      },
    })

    // Prepare subjects string
    const subjectsStr = typeof subjects === 'string' ? subjects : JSON.stringify(subjects)

    // Ensure advisor fields are ONLY saved if role is advisor or both
    const isAdvisorRole = facultyType === 'advisor' || facultyType === 'both'
    const cleanAdvisorBatch = isAdvisorRole ? (advisorBatch || null) : null
    const cleanAdvisorYear = isAdvisorRole && advisorYear ? Number(advisorYear) : null
    const cleanAdvisorSem = isAdvisorRole && advisorSem ? Number(advisorSem) : null
    const cleanAdvisorSec = isAdvisorRole ? (advisorSec || null) : null

    // Upsert Faculty
    const faculty = await prisma.faculty.upsert({
      where: { facultyId: fid },
      update: {
        userId: user.id,
        designation,
        qualification,
        experience: Number(experience) || 1,
        specialization,
        subjects: subjectsStr,
        subjectName: subjectName || null,
        classDay: classDay || null,
        classPeriod: classPeriod || null,
        classTime: classTime || null,
        advisorBatch: cleanAdvisorBatch,
        advisorYear: cleanAdvisorYear,
        advisorSem: cleanAdvisorSem,
        advisorSec: cleanAdvisorSec,
        facultyType: facultyType || 'both',
      },
      create: {
        userId: user.id,
        facultyId: fid,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('1990-01-01'),
        designation,
        qualification,
        experience: Number(experience) || 1,
        specialization,
        subjects: subjectsStr,
        subjectName: subjectName || null,
        classDay: classDay || null,
        classPeriod: classPeriod || null,
        classTime: classTime || null,
        advisorBatch: cleanAdvisorBatch,
        advisorYear: cleanAdvisorYear,
        advisorSem: cleanAdvisorSem,
        advisorSec: cleanAdvisorSec,
        facultyType: facultyType || 'both',
      },
    })

    let subjectsArr: string[] = []
    try {
      subjectsArr = JSON.parse(faculty.subjects)
    } catch {
      subjectsArr = []
    }

    // Broadcast real-time notification for Department Directorate & Students
    await prisma.notification.create({
      data: {
        title: `👨‍🏫 Faculty Directorate: ${name.trim()}`,
        message: `${designation} appointed. ${advisorYear && advisorSec ? `Assigned as Class Advisor for Year ${advisorYear} (Sec ${advisorSec}).` : `Specialization: ${specialization}.`}`,
        target: 'all',
        createdByName: 'Department Directorate',
        status: 'published',
        publishedAt: new Date(),
        readBy: '[]',
      },
    }).catch(() => {})

    invalidateCache('faculty')

    return NextResponse.json({
      success: true,
      faculty: {
        id: faculty.id,
        facultyId: faculty.facultyId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        designation: faculty.designation,
        qualification: faculty.qualification,
        experience: faculty.experience,
        specialization: faculty.specialization,
        subjects: subjectsArr,
        subjectName: faculty.subjectName,
        classDay: faculty.classDay,
        classPeriod: faculty.classPeriod,
        classTime: faculty.classTime,
        advisorBatch: faculty.advisorBatch,
        advisorYear: faculty.advisorYear,
        advisorSem: faculty.advisorSem,
        advisorSec: faculty.advisorSec,
        facultyType: faculty.facultyType,
        status: user.status,
      },
      message: 'Faculty registered successfully in database',
    })
  } catch (error) {
    console.error('Create faculty error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create faculty: ' + String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const clearAll = searchParams.get('clearAll')

    if (clearAll === 'true') {
      await prisma.faculty.deleteMany({})
      await prisma.user.deleteMany({ where: { role: 'faculty' } })
      invalidateCache('faculty')
      return NextResponse.json({ success: true, message: 'All faculty cleared successfully' })
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing faculty ID' },
        { status: 400 }
      )
    }

    let faculty = await prisma.faculty.findUnique({ where: { id } }).catch(() => null)
    if (!faculty) {
      faculty = await prisma.faculty.findFirst({ where: { userId: id } }).catch(() => null)
    }
    if (!faculty) {
      faculty = await prisma.faculty.findUnique({ where: { facultyId: id } }).catch(() => null)
    }

    if (faculty) {
      const userId = faculty.userId
      await prisma.faculty.delete({ where: { id: faculty.id } }).catch(() => null)
      await prisma.user.delete({ where: { id: userId } }).catch(() => null)
    } else {
      await prisma.user.delete({ where: { id: id } }).catch(() => null)
    }

    invalidateCache('faculty')

    return NextResponse.json({
      success: true,
      message: 'Faculty deleted successfully from database',
    })
  } catch (error) {
    console.error('Delete faculty error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete faculty' },
      { status: 500 }
    )
  }
}