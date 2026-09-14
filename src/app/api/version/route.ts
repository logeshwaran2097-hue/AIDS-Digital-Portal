import { NextResponse } from 'next/server'
import packageJson from '@/../package.json'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    {
      version: packageJson.version || '1.0.0',
      name: 'Digital POrtal Of AI&DS',
      timestamp: Date.now(),
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
