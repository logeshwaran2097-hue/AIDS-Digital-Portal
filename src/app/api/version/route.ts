import { NextResponse } from 'next/server'
import packageJson from '@/../package.json'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    {
      version: packageJson.version || '1.2.0',
      name: 'Digital POrtal Of AI&DS',
      buildTime: new Date().toISOString(),
      timestamp: Date.now(),
      releaseHighlights: [
        'Mobile 1-Click App Installer with WebAPK integration (No APK errors)',
        'Full studio acoustic chime notifications enabled in installed app mode',
        'Database connection pooler 100x acceleration & duplicate validation',
        'Automatic startup version synchronizer and offline cache reload'
      ]
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
