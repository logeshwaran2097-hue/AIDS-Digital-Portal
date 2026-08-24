import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')

    const where: any = {}
    if (domain && domain !== 'ALL') {
      where.domain = domain
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
        technologies: body.technologies || 'Python, PyTorch',
        domain: body.domain || 'Machine Learning',
        year: body.year || 3,
        status: body.status || 'Approved & Active',
        guideName: body.guideName || 'Dr. S. Karthik (Professor)',
        teamMembers: body.teamMembers || 'Student Team',
      },
    })
    return NextResponse.json({ success: true, project }, { status: 201 })
  } catch (error) {
    console.error('Projects API error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create project' }, { status: 500 })
  }
}
