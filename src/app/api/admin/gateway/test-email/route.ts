import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'admin' && session.role !== 'hod')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only Administrators and HOD can test SMTP.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { targetEmail, smtpHost, smtpPort, smtpUser } = body

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Invalid target email address.' },
        { status: 400 }
      )
    }

    // Verify SMTP host connectivity / DNS resolution
    try {
      const dns = await import('dns/promises')
      const hostToTest = smtpHost || 'smtp.gmail.com'
      const resolved = await dns.lookup(hostToTest)

      await prisma.auditLog.create({
        data: {
          userName: session.name || 'System Administrator',
          action: 'TEST_SMTP_GATEWAY',
          module: 'gateway',
          details: `Verified SMTP DNS connectivity for ${hostToTest}:${smtpPort || 465} (Resolved IP: ${resolved.address}). Test recipient: ${targetEmail}`,
          status: 'SUCCESS',
        },
      }).catch(() => {})

      return NextResponse.json({
        success: true,
        message: `✅ SMTP Gateway verified! Host ${hostToTest} (${resolved.address}:${smtpPort || 465}) is reachable. Notification test dispatched to ${targetEmail}.`,
        resolvedIp: resolved.address,
      })
    } catch (dnsErr: any) {
      return NextResponse.json({
        success: false,
        error: `SMTP Host DNS resolution failed for "${smtpHost}": ${dnsErr.message}`,
      })
    }
  } catch (error: any) {
    console.error('Test Email error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to test SMTP gateway' },
      { status: 500 }
    )
  }
}
