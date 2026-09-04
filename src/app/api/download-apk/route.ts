import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'Digital-Portal-of-AI-and-DS.apk')
    if (!fs.existsSync(filePath)) {
      return new NextResponse('APK file not found', { status: 404 })
    }

    const fileBuffer = fs.readFileSync(filePath)
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="Digital-Portal-of-AI-and-DS.apk"',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    console.error('Error serving APK:', error)
    return new NextResponse('Failed to download APK', { status: 500 })
  }
}
