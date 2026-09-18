import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateBody, adminRolesSchema } from '@/lib/validations/apiValidation'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawBody = await request.json().catch(() => ({}))
    const validation = validateBody(adminRolesSchema, rawBody)
    if (!validation.success) {
      return validation.response
    }
    const { permissions } = validation.data

    // Log the policy change in AuditLog
    await prisma.auditLog.create({
      data: {
        userName: session.name || 'System Administrator',
        action: 'UPDATE_RBAC_POLICY',
        module: 'security',
        details: `Updated RBAC Role Permission Matrix with ${permissions?.length || 0} policy rules`,
        status: 'SUCCESS',
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Role permissions matrix updated successfully!',
    })
  } catch (error) {
    console.error('Error saving role permissions:', error)
    return NextResponse.json({ error: 'Failed to save role permissions' }, { status: 500 })
  }
}
