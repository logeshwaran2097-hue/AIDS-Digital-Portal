import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

interface BulkStudentInput {
  registerNumber: string
  name: string
  email?: string
  password?: string
  phone?: string
  parentPhone?: string
  dateOfBirth?: string
  department?: string
  year?: number | string
  semester?: number | string
  batch?: string
  section?: string
  advisorName?: string
  bloodGroup?: string
  residencyStatus?: string
  cgpa?: number | string
  attendance?: string
  status?: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { students, defaultPassword = 'Student@123' } = body

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide an array of student records.' },
        { status: 400 }
      )
    }

    // Pre-calculate hash for default password to make 1000 imports fast
    const defaultPasswordHash = await bcrypt.hash(defaultPassword, 10)
    const customHashCache = new Map<string, string>()

    let createdCount = 0
    let updatedCount = 0
    const errors: string[] = []

    // Process in batches of 50 for optimal database performance
    const chunkSize = 50
    for (let i = 0; i < students.length; i += chunkSize) {
      const chunk: BulkStudentInput[] = students.slice(i, i + chunkSize)

      await Promise.all(
        chunk.map(async (st, index) => {
          const rowNum = i + index + 1
          try {
            if (!st.registerNumber || !st.name) {
              errors.push(`Row ${rowNum}: Missing Register Number or Name`)
              return
            }

            const regUpper = String(st.registerNumber).trim().toUpperCase()
            const studentName = String(st.name).trim()

            const isEmailCustom = Boolean(st.email && String(st.email).trim())
            const finalEmail = isEmailCustom
              ? String(st.email).trim().toLowerCase()
              : `${regUpper.toLowerCase()}@student.vsb.edu.in`

            let passwordHash = defaultPasswordHash
            if (st.password && st.password.trim() && st.password.trim() !== defaultPassword) {
              const passKey = st.password.trim()
              if (!customHashCache.has(passKey)) {
                customHashCache.set(passKey, await bcrypt.hash(passKey, 10))
              }
              passwordHash = customHashCache.get(passKey)!
            }

            const parsedYear = Number(st.year) || 1
            const parsedSem = Number(st.semester) || (parsedYear * 2 - 1)
            const section = st.section ? String(st.section).trim().toUpperCase() : 'A'
            const department = st.department || 'Artificial Intelligence & Data Science'
            const batch = st.batch ? String(st.batch).trim() : `${2026 - parsedYear + 1}-${2030 - parsedYear + 1}`

            let dob = new Date('2004-01-01')
            if (st.dateOfBirth) {
              const parsedDate = new Date(st.dateOfBirth)
              if (!isNaN(parsedDate.getTime())) {
                dob = parsedDate
              }
            }

            const existingStudent = await prisma.student.findFirst({
              where: {
                OR: [
                  { registerNumber: regUpper },
                  { registerNumber: String(st.registerNumber).trim() },
                  { registerNumber: regUpper.toLowerCase() },
                ],
              },
            })

            if (existingStudent) {
              // Update existing user & student
              await prisma.user.upsert({
                where: { id: existingStudent.userId },
                update: {
                  name: studentName,
                  phone: st.phone ? String(st.phone).trim() : undefined,
                  status: st.status || 'active',
                  passwordHash,
                },
                create: {
                  id: existingStudent.userId,
                  email: finalEmail,
                  name: studentName,
                  phone: st.phone ? String(st.phone).trim() : null,
                  role: 'student',
                  status: st.status || 'active',
                  passwordHash,
                  emailVerified: isEmailCustom,
                },
              })

              await prisma.student.update({
                where: { id: existingStudent.id },
                data: {
                  registerNumber: regUpper,
                  dateOfBirth: dob,
                  department,
                  year: parsedYear,
                  semester: parsedSem,
                  batch,
                  section,
                  advisorName: st.advisorName ? String(st.advisorName).trim() : (existingStudent as any).advisorName,
                  parentPhone: st.parentPhone ? String(st.parentPhone).trim() : (existingStudent as any).parentPhone,
                  bloodGroup: st.bloodGroup ? String(st.bloodGroup).trim() : (existingStudent as any).bloodGroup,
                  residencyStatus: st.residencyStatus ? String(st.residencyStatus).trim() : (existingStudent as any).residencyStatus,
                  cgpa: st.cgpa !== undefined && st.cgpa !== '' && !isNaN(parseFloat(String(st.cgpa))) ? parseFloat(String(st.cgpa)) : (existingStudent as any).cgpa,
                  attendance: st.attendance !== undefined && st.attendance !== '' ? String(st.attendance) : (existingStudent as any).attendance,
                } as any,
              })

              updatedCount++
            } else {
              // Create brand new User & Student
              const user = await prisma.user.upsert({
                where: { email: finalEmail },
                update: {
                  name: studentName,
                  phone: st.phone ? String(st.phone).trim() : null,
                  role: 'student',
                  status: st.status || 'active',
                  passwordHash,
                },
                create: {
                  email: finalEmail,
                  name: studentName,
                  phone: st.phone ? String(st.phone).trim() : null,
                  role: 'student',
                  status: st.status || 'active',
                  passwordHash,
                  emailVerified: isEmailCustom,
                  mustChangePassword: true,
                },
              })

              const existingStudentByUserId = await prisma.student.findUnique({
                where: { userId: user.id },
              })

              if (existingStudentByUserId) {
                await prisma.student.update({
                  where: { id: existingStudentByUserId.id },
                  data: {
                    registerNumber: regUpper,
                    dateOfBirth: dob,
                    department,
                    year: parsedYear,
                    semester: parsedSem,
                    batch,
                    section,
                    advisorName: st.advisorName ? String(st.advisorName).trim() : (existingStudentByUserId as any).advisorName,
                    parentPhone: st.parentPhone ? String(st.parentPhone).trim() : (existingStudentByUserId as any).parentPhone,
                  } as any,
                })
              } else {
                await prisma.student.create({
                  data: {
                    userId: user.id,
                    registerNumber: regUpper,
                    dateOfBirth: dob,
                    department,
                    year: parsedYear,
                    semester: parsedSem,
                    batch,
                    section,
                    advisorName: st.advisorName ? String(st.advisorName).trim() : null,
                    parentPhone: st.parentPhone ? String(st.parentPhone).trim() : null,
                    bloodGroup: st.bloodGroup ? String(st.bloodGroup).trim() : 'O+',
                    residencyStatus: st.residencyStatus ? String(st.residencyStatus).trim() : 'Day Scholar',
                    cgpa: st.cgpa !== undefined && st.cgpa !== '' && !isNaN(parseFloat(String(st.cgpa))) ? parseFloat(String(st.cgpa)) : 8.0,
                    attendance: st.attendance !== undefined && st.attendance !== '' ? String(st.attendance) : '90%',
                  } as any,
                })
              }

              createdCount++
            }
          } catch (err: any) {
            errors.push(`Row ${rowNum} (${st.registerNumber || 'Unknown'}): ${err?.message || 'Database error'}`)
          }
        })
      )
    }

    revalidatePath('/admin/students')
    revalidatePath('/admin/dashboard')

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${createdCount + updatedCount} students (${createdCount} added, ${updatedCount} updated).`,
      createdCount,
      updatedCount,
      errors: errors.slice(0, 10),
      totalErrors: errors.length,
    })
  } catch (error: any) {
    console.error('Error in bulk student upload:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to process bulk student upload' },
      { status: 500 }
    )
  }
}
