import { NextResponse } from 'next/server'
import { APP_VERSION, APP_RELEASE_HIGHLIGHTS } from '@/lib/version'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    {
      version: APP_VERSION,
      name: 'Digital Portal of AI & DS',
      buildTime: new Date().toISOString(),
      timestamp: Date.now(),
      releaseHighlights: APP_RELEASE_HIGHLIGHTS,
    },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  )
}
