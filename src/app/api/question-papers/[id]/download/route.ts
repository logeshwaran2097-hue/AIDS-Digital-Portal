import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const paper = await prisma.questionPaper.findUnique({
      where: { id: params.id },
      select: { fileUrl: true },
    })

    if (!paper || !paper.fileUrl) {
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, fileUrl: paper.fileUrl })
  } catch (error) {
    console.error('Error fetching question paper file:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch document' },
      { status: 500 }
    )
  }
}
