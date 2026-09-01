import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    const year = searchParams.get('year')

    const where: any = {}
    if (domain && domain !== 'ALL') {
      where.domain = domain
    }
    if (year && year !== 'ALL') {
      where.year = Number(year)
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, projects })
  } catch (error) {
    console.error('Projects API error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
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
        status: body.status || 'Approved & Active',
        guideName: body.guideName || 'Dr. S. Karthik (Associate Professor)',
        guideEmail: body.guideEmail || null,
        teamMembers: body.teamMembers || 'B.Tech AI & DS Team',
      },
    })
    // Automatically broadcast real-time notification
    await prisma.notification.create({
      data: {
        title: `🚀 New Capstone Project: ${body.title}`,
        message: `Project proposal submitted in ${body.domain || 'AI & DS'} (Year ${body.year || 4}) by ${body.teamMembers || 'Student Team'}. Guide: ${body.guideName || 'Faculty'}.`,
        target: 'all',
        createdByName: body.teamMembers || 'Project Team',
        status: 'published',
        publishedAt: new Date(),
        readBy: '[]',
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, project }, { status: 201 })
  } catch (error) {
    console.error('Projects API error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create project' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    if (!body.id) {
      return NextResponse.json({ success: false, message: 'Missing project ID' }, { status: 400 })
    }

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
        documentation: body.documentation !== undefined ? body.documentation : undefined,
        domain: body.domain !== undefined ? body.domain : undefined,
        year: body.year !== undefined ? Number(body.year) : undefined,
        status: body.status !== undefined ? body.status : undefined,
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
    return NextResponse.json({ success: false, message: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const clearAll = searchParams.get('clearAll')

    if (clearAll === 'true') {
      await prisma.project.deleteMany({})
      return NextResponse.json({ success: true, message: 'All projects deleted successfully' })
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing project ID' }, { status: 400 })
    }

    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete project' }, { status: 500 })
  }
}
