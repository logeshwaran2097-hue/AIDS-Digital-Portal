import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '100', 10), 10), 500)
    const action = searchParams.get('action')
    const moduleFilter = searchParams.get('module')
    const status = searchParams.get('status')
    const search = searchParams.get('q')?.trim()

    const where: any = {}
    if (action && action !== 'ALL') {
      where.action = { equals: action, mode: 'insensitive' }
    }
    if (moduleFilter && moduleFilter !== 'ALL') {
      where.module = { equals: moduleFilter, mode: 'insensitive' }
    }
    if (status && status !== 'ALL') {
      if (status === 'SUCCESS') where.status = { equals: 'success', mode: 'insensitive' }
      else if (status === 'FAILED') where.status = { not: 'success' }
    }
    if (search) {
      where.OR = [
        { userName: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { module: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
      ]
    }

    const logs = await prisma.auditLog.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        userName: true,
        action: true,
        module: true,
        details: true,
        status: true,
        createdAt: true,
        ipAddress: true,
      },
    })

    const formatted = logs.map((l) => ({
      id: l.id,
      userName: l.userName || 'System User',
      action: l.action,
      module: l.module,
      details: l.details,
      status: l.status,
      createdAt: l.createdAt
        ? l.createdAt.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
      ipAddress: l.ipAddress || undefined,
    }))

    return NextResponse.json(
      {
        success: true,
        logs: formatted,
        count: formatted.length,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const logId = searchParams.get('id')
    const clearAll = searchParams.get('all') === 'true'

    if (clearAll) {
      await prisma.auditLog.deleteMany({})
      return NextResponse.json({ success: true, message: 'All audit logs cleared successfully.' })
    }

    if (logId) {
      await prisma.auditLog.delete({
        where: { id: logId },
      })
      return NextResponse.json({ success: true, message: 'Audit log deleted successfully.' })
    }

    return NextResponse.json({ error: 'Invalid delete parameters.' }, { status: 400 })
  } catch (error) {
    console.error('Error deleting activity log:', error)
    return NextResponse.json({ error: 'Failed to delete activity log' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 401 })
    }

    const body = await request.json()
    const { ids } = body

    if (Array.isArray(ids) && ids.length > 0) {
      await prisma.auditLog.deleteMany({
        where: {
          id: { in: ids },
        },
      })
      return NextResponse.json({ success: true, message: `${ids.length} logs deleted successfully.` })
    }

    return NextResponse.json({ error: 'No log IDs provided for deletion.' }, { status: 400 })
  } catch (error) {
    console.error('Error in bulk delete activity logs:', error)
    return NextResponse.json({ error: 'Failed to perform bulk delete' }, { status: 500 })
  }
}
