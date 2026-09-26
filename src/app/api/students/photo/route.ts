import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import precompiledStudents from '@/data/studentDirectory.json'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const regNo = searchParams.get('regNo')?.trim().toUpperCase()

    if (!regNo) {
      return new NextResponse('Missing regNo parameter', { status: 400 })
    }

    // 1. Look up student in database for uploaded profile photo
    let profileImage: string | null = null
    let studentName = 'Student'

    try {
      const student = await prisma.student.findUnique({
        where: { registerNumber: regNo },
        select: { userId: true },
      })

      if (student?.userId) {
        const u = await prisma.user.findUnique({
          where: { id: student.userId },
          select: { name: true, profileImage: true },
        })
        if (u?.profileImage) {
          profileImage = u.profileImage
        }
        if (u?.name) {
          studentName = u.name
        }
      }
    } catch {
      // In-memory fallback if DB connection fails
      const fallback = (precompiledStudents as any[]).find(
        (s) => s.registerNumber?.toUpperCase() === regNo
      )
      if (fallback?.user?.name) {
        studentName = fallback.user.name
      }
    }

    // 2. If student uploaded a base64 profile image, decode and stream binary
    if (profileImage && profileImage.startsWith('data:image/')) {
      const matches = profileImage.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/)
      if (matches) {
        const contentType = matches[1]
        const buffer = Buffer.from(matches[2], 'base64')
        return new NextResponse(new Uint8Array(buffer), {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Length': buffer.length.toString(),
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
          },
        })
      }
    } else if (profileImage && (profileImage.startsWith('http://') || profileImage.startsWith('https://'))) {
      // Direct redirect to cloud CDN URL
      return NextResponse.redirect(profileImage)
    }

    // 3. Fallback: High-resolution official V.S.B. student avatar PNG (Meta WhatsApp compatible)
    const fallbackPngUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&size=512&background=071A3D&color=fff&bold=true&font-size=0.45`
    return NextResponse.redirect(fallbackPngUrl)
  } catch (error) {
    console.error('[Student Photo API] Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
