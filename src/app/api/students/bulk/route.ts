import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { parseSafeDateOfBirth } from '@/lib/utils'
import { getSession } from '@/lib/auth'
import { validateBody, bulkStudentImportSchema } from '@/lib/validations/apiValidation'

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
    const session = await getSession()
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Only administrators can perform bulk student import.' },
        { status: 403 }
      )
    }

    const rawBody = await request.json().catch(() => ({}))
    const validation = validateBody(bulkStudentImportSchema, rawBody)
    if (!validation.success) {
      return validation.response
    }
    const body = validation.data
    const fallbackDefault = process.env.DEFAULT_STUDENT_TEMP_PASSWORD || 'Student@123'
    const {
      students,
      defaultPassword = fallbackDefault,
      year: topYear,
      semester: topSemester,
      batch: topBatch,
      section: topSection,
      department: topDepartment,
      residencyStatus: topResidencyStatus,
    } = body as any

    // Pre-calculate hash for default password to make 1000 imports fast
    const defaultPasswordHash = await bcrypt.hash(defaultPassword, 10)
    const customHashCache = new Map<string, string>()

    let createdCount = 0
    let updatedCount = 0
    const errors: string[] = []

    // Process in safe batches of 10 to stay safely within PostgreSQL connection limits
    const chunkSize = 10
    for (let i = 0; i < students.length; i += chunkSize) {
      const chunk: BulkStudentInput[] = students.slice(i, i + chunkSize) as any

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

            const rawEmail = st.email ? String(st.email).trim().toLowerCase() : ''
            let finalEmail = `${regUpper.toLowerCase()}@vsb.ac.in`
            let isEmailCustom = false

            if (rawEmail) {
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
                errors.push(`Row ${rowNum}: Invalid email format "${rawEmail}" for Register Number "${regUpper}".`)
                return
              }
              finalEmail = rawEmail
              isEmailCustom = true
            }

            let passwordHash = defaultPasswordHash
            if (st.password && st.password.trim() && st.password.trim() !== defaultPassword) {
              const passKey = st.password.trim()
              if (!customHashCache.has(passKey)) {
                customHashCache.set(passKey, await bcrypt.hash(passKey, 10))
              }
              passwordHash = customHashCache.get(passKey)!
            }

            const parsedYear = Number(st.year ?? topYear) || 1
            const parsedSem = Number(st.semester ?? topSemester) || (parsedYear * 2 - 1)
            const section = (st.section || topSection) ? String(st.section || topSection).trim().toUpperCase() : 'A'
            const department = st.department || topDepartment || 'Artificial Intelligence & Data Science'
            const batch = (st.batch || topBatch) ? String(st.batch || topBatch).trim() : `${2026 - parsedYear + 1}-${2030 - parsedYear + 1}`
            const residencyStatus = (st.residencyStatus || topResidencyStatus) ? String(st.residencyStatus || topResidencyStatus).trim() : 'Day Scholar'

            const dob = parseSafeDateOfBirth(st.dateOfBirth, new Date('2004-01-01'))!

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
                    bloodGroup: st.bloodGroup ? String(st.bloodGroup).trim() : ((existingStudentByUserId as any).bloodGroup || null),
                    residencyStatus,
                    advisorName: st.advisorName ? String(st.advisorName).trim() : (existingStudentByUserId as any).advisorName,
                    parentPhone: st.parentPhone ? String(st.parentPhone).trim() : (existingStudentByUserId as any).parentPhone,
                    cgpa: st.cgpa !== undefined && st.cgpa !== '' && !isNaN(parseFloat(String(st.cgpa))) ? parseFloat(String(st.cgpa)) : ((existingStudentByUserId as any).cgpa ?? null),
                    attendance: st.attendance !== undefined && st.attendance !== '' ? String(st.attendance) : ((existingStudentByUserId as any).attendance ?? null),
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
                    bloodGroup: st.bloodGroup ? String(st.bloodGroup).trim() : null,
                    residencyStatus,
                    cgpa: st.cgpa !== undefined && st.cgpa !== '' && !isNaN(parseFloat(String(st.cgpa))) ? parseFloat(String(st.cgpa)) : null,
                    attendance: st.attendance !== undefined && st.attendance !== '' ? String(st.attendance) : null,
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
      { status: 400 }
    )
  }
}
