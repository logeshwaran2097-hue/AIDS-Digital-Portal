import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    let extendedInfo: Record<string, unknown> = {}

    if (session.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: session.userId },
        select: {
          registerNumber: true,
          department: true,
          year: true,
          semester: true,
          section: true,
          dateOfBirth: true,
        },
      })
      extendedInfo = student || {}
    } else if (session.role === 'faculty') {
      const faculty = await prisma.faculty.findUnique({
        where: { userId: session.userId },
        select: {
          facultyId: true,
          designation: true,
          qualification: true,
          experience: true,
          specialization: true,
          subjects: true,
          dateOfBirth: true,
        },
      })
      extendedInfo = faculty || {}
    } else if (session.role === 'hod') {
      const hod = await prisma.hOD.findUnique({
        where: { userId: session.userId },
        select: {
          facultyId: true,
          department: true,
          designation: true,
          qualification: true,
          experience: true,
          dateOfBirth: true,
        },
      })
      extendedInfo = hod || {}
    } else if (session.role === 'admin') {
      const admin = await prisma.admin.findUnique({
        where: { userId: session.userId },
        select: {
          name: true,
          role: true,
        },
      })
      extendedInfo = admin || {}
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
        mustChangePassword: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        name: dbUser?.name || session.name,
        email: dbUser?.email || session.email,
        phone: dbUser?.phone || '',
        profileImage: dbUser?.profileImage || null,
        role: session.role,
        mustChangePassword: dbUser?.mustChangePassword ?? false,
        ...extendedInfo,
      },
    })
  } catch (error) {
    console.error('Get session error:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    )
  }
}