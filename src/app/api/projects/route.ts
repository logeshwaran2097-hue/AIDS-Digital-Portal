import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { validateBody, createProjectSchema, updateProjectSchema } from '@/lib/validations/apiValidation'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    const year = searchParams.get('year')

    const where: any = {}
    if (domain && domain !== 'ALL') where.domain = domain
    if (year && year !== 'ALL') where.year = Number(year)

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      projects: projects.map((p) => ({
        ...p,
        technologies: (() => {
          try {
            return JSON.parse(p.technologies)
          } catch {
            return []
          }
        })(),
      })),
    })
  } catch (error) {
    console.error('Projects GET API error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const rawJson = await request.json()
    const parsed = validateBody(createProjectSchema, rawJson)
    if (!parsed.success) return parsed.response
    const body = parsed.data

    const isStudent = session.role === 'student'
    const teamAuthor = isStudent
      ? `${session.name || 'Student'} (${session.registerNumber || session.userId})`
      : (body.teamMembers || session.name || 'Project Team')

    // Students cannot self-assign approved status; defaults to 'Under Review'
    const projectStatus = isStudent ? 'Under Review' : (body.status || 'Approved & Active')

    const project = await prisma.project.create({
      data: {
        title: body.title,
        description: body.description || '',
        problemStatement: body.problemStatement || '',
        proposedSolution: body.proposedSolution || '',
        technologies: typeof body.technologies === 'object' ? JSON.stringify(body.technologies) : (body.technologies || '[]'),
        dataset: body.dataset || null,
        results: body.results || null,
        futureScope: body.futureScope || null,
        documentation: body.documentation || body.githubUrl || null,
        domain: body.domain || 'Computer Vision & Deep Learning',
        year: Number(body.year) || 4,
        status: projectStatus,
        guideName: body.guideName || 'Faculty Guide',
        guideEmail: body.guideEmail || null,
        teamMembers: body.teamMembers ? `${body.teamMembers} | Submitter: ${teamAuthor}` : teamAuthor,
      },
    })

    // Automatically broadcast real-time notification
    await prisma.notification.create({
      data: {
        title: `🚀 New Capstone Project: ${body.title}`,
        message: `Project proposal submitted in ${body.domain || 'AI & DS'} (Year ${body.year || 4}) by ${project.teamMembers}. Guide: ${body.guideName || 'Faculty'}.`,
        target: 'all',
        createdByName: project.teamMembers,
        status: 'published',
        publishedAt: new Date(),
        readBy: '[]',
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, project }, { status: 201 })
  } catch (error) {
    console.error('Projects API error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create project' }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const rawJson = await request.json()
    const parsed = validateBody(updateProjectSchema, rawJson)
    if (!parsed.success) return parsed.response
    const body = parsed.data

    const existing = await prisma.project.findUnique({ where: { id: body.id } })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 })
    }

    const isPrivileged = session.role === 'admin' || session.role === 'super_admin' || session.role === 'hod'
    const isGuide = session.role === 'faculty' && existing.guideName?.toLowerCase().includes(session.name?.toLowerCase() || '')
    const isTeamMember = existing.teamMembers?.toLowerCase().includes(session.name?.toLowerCase() || '') ||
      (session.registerNumber && existing.teamMembers?.includes(session.registerNumber))

    if (!isPrivileged && !isGuide && !isTeamMember) {
      return NextResponse.json({ success: false, message: 'Forbidden. You do not have permission to modify this project.' }, { status: 403 })
    }

    // Only privileged users or guide can change project approval status
    const allowedStatus = (isPrivileged || isGuide) ? body.status : undefined

    const project = await prisma.project.update({
      where: { id: body.id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        problemStatement: body.problemStatement !== undefined ? body.problemStatement : undefined,
        proposedSolution: body.proposedSolution !== undefined ? body.proposedSolution : undefined,
        technologies: body.technologies !== undefined ? (typeof body.technologies === 'object' ? JSON.stringify(body.technologies) : body.technologies) : undefined,
        dataset: body.dataset !== undefined ? body.dataset : undefined,
        results: body.results !== undefined ? body.results : undefined,
        futureScope: body.futureScope !== undefined ? body.futureScope : undefined,
        ...(allowedStatus ? { status: allowedStatus } : {}),
        documentation: body.documentation !== undefined ? body.documentation : undefined,
        domain: body.domain !== undefined ? body.domain : undefined,
        year: body.year !== undefined ? Number(body.year) : undefined,
        status: isPrivileged || isGuide ? (body.status !== undefined ? body.status : undefined) : undefined,
        guideName: body.guideName !== undefined ? body.guideName : undefined,
        guideEmail: body.guideEmail !== undefined ? body.guideEmail : undefined,
        teamMembers: body.teamMembers !== undefined ? body.teamMembers : undefined,
      },
    })

    // Automatically broadcast real-time notification on status/progress update
    await prisma.notification.create({
      data: {
        title: `🔄 Project Updated: ${project.title}`,
        message: `Project status is now "${project.status}" (${project.domain || 'AI & DS'}). Guide: ${project.guideName || 'Faculty'}.`,
        target: 'all',
        createdByName: project.guideName || 'Project Directorate',
        status: 'published',
        publishedAt: new Date(),
        readBy: '[]',
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, project })
  } catch (error) {
    console.error('Update project error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update project' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const clearAll = searchParams.get('clearAll')

    const isPrivileged = session.role === 'admin' || session.role === 'super_admin' || session.role === 'hod'

    if (clearAll === 'true') {
      if (!isPrivileged) {
        return NextResponse.json({ success: false, message: 'Unauthorized. Admin role required.' }, { status: 403 })
      }
      await prisma.project.deleteMany({})
      return NextResponse.json({ success: true, message: 'All projects deleted successfully' })
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing project ID' }, { status: 400 })
    }

    const existing = await prisma.project.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 })
    }

    const isTeamMember = existing.teamMembers?.toLowerCase().includes(session.name?.toLowerCase() || '') ||
      (session.registerNumber && existing.teamMembers?.includes(session.registerNumber))

    if (!isPrivileged && !isTeamMember) {
      return NextResponse.json({ success: false, message: 'Forbidden: You do not have permission to delete this project.' }, { status: 403 })
    }

    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete project' }, { status: 400 })
  }
}
