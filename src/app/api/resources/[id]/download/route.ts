import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
      select: { fileUrl: true }
    })

    if (!resource || !resource.fileUrl) {
      return NextResponse.json({ success: false, message: 'File not found' }, { status: 404 })
    }

    return NextResponse.json(
      { success: true, fileUrl: resource.fileUrl },
      {
        headers: {
          'Cache-Control': 'private, max-age=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching file URL:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
