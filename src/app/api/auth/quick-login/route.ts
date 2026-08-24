import { NextRequest, NextResponse } from 'next/server'
import { createToken, authenticateStudent, authenticateFaculty, authenticateHOD } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role') || 'student'
  const destination = searchParams.get('redirect')

  let token = ''
  let targetUrl = '/dashboard'

  if (role === 'student') {
    const student = await prisma.student.findFirst().catch(() => null)
    const user = student ? await prisma.user.findUnique({ where: { id: student.userId } }).catch(() => null) : null
    
    token = await createToken({
      userId: user?.id || 'student-1',
      email: user?.email || 'student@vsb.edu.in',
      role: 'student',
      name: user?.name || 'K. Aishwarya',
      registerNumber: student?.registerNumber || '23AD001',
    })
    targetUrl = destination || '/dashboard'
  } else if (role === 'faculty') {
    const faculty = await prisma.faculty.findFirst().catch(() => null)
    const user = faculty ? await prisma.user.findUnique({ where: { id: faculty.userId } }).catch(() => null) : null

    token = await createToken({
      userId: user?.id || 'faculty-1',
      email: user?.email || 'faculty@vsb.edu.in',
      role: 'faculty',
      name: user?.name || 'Dr. S. Karthik',
      facultyId: faculty?.facultyId || 'FAC-001',
    })
    targetUrl = destination || '/faculty-dashboard'
  } else if (role === 'hod') {
    const hod = await prisma.hOD.findFirst().catch(() => null)
    const user = hod ? await prisma.user.findUnique({ where: { id: hod.userId } }).catch(() => null) : null

    token = await createToken({
      userId: user?.id || 'hod-1',
      email: user?.email || 'hod.ai@vsb.edu.in',
      role: 'hod',
      name: user?.name || 'Prof. Dr. V. Sundar',
      facultyId: hod?.facultyId || 'HOD-001',
    })
    targetUrl = destination || '/hod-dashboard'
  } else if (role === 'admin') {
    const admin = await prisma.admin.findFirst().catch(() => null)
    const user = admin ? await prisma.user.findUnique({ where: { id: admin.userId } }).catch(() => null) : null

    token = await createToken({
      userId: user?.id || 'admin-1',
      email: admin?.email || user?.email || 'admin@vsb.edu.in',
      role: 'admin',
      name: admin?.name || user?.name || 'System Administrator',
    })
    targetUrl = destination || '/admin/dashboard'
  }

  const response = NextResponse.redirect(new URL(targetUrl, request.url))
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && !request.url.startsWith('http://localhost'),
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return response
}
