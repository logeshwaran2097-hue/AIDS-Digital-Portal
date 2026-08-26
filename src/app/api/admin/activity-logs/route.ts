import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
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
    if (!session || session.role !== 'admin') {
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
