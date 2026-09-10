import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODProfileView, HODProfileData } from './components/HODProfileView'

export const dynamic = 'force-dynamic'

export default async function HODProfilePage() {
  const session = await requireRoleSession(['hod'])

  const [user, hodRecord, facultyCount, studentCount, settings, recentLogs] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
    prisma.hOD.findUnique({ where: { userId: session.userId } }).catch(() => null),
    prisma.faculty.count().catch(() => 12),
    prisma.student.count().catch(() => 4),
    prisma.systemSettings.findUnique({ where: { key: 'hod_profile_settings' } }).catch(() => null),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
  ])

  let extraData: any = {}
  if (settings?.value) {
    try {
      extraData = JSON.parse(settings.value)
    } catch {}
  }

  const profileData: HODProfileData = {
    id: session.userId,
    name: user?.name || session.name || 'Head of Department',
    email: user?.email || session.email || 'hod.aids@vsb.edu.in',
    phone: user?.phone || null,
    facultyId: hodRecord?.facultyId || 'HOD001',
    designation: hodRecord?.designation || 'Professor & Head',
    qualification: hodRecord?.qualification || 'Ph.D. (AI & Data Science)',
    experience: hodRecord?.experience !== undefined && hodRecord?.experience !== null ? hodRecord.experience : 15,
    department: 'Department of Artificial Intelligence & Data Science',
    officeLocation: extraData.officeLocation || 'Main Administrative Complex · Cabin HOD-101',
    officeHours: extraData.officeHours || '09:00 AM - 05:00 PM (Mon - Sat)',
    specializations: extraData.specializations || [
      'Deep Learning & Neural Networks',
      'Computer Vision & Edge AI',
      'Natural Language Processing',
      'Autonomous Systems & Robotics',
      'Big Data Analytics & Cloud MLOps',
    ],
    bio:
      extraData.bio ||
      'Leading the Department of Artificial Intelligence & Data Science with focus on research excellence, industry collaboration, and autonomous academic standards.',
    facultyCount,
    studentCount,
    recentLogs: recentLogs.map((l: any) => ({
      id: l.id,
      action: l.action,
      module: l.module,
      details: l.details,
      createdAt: l.createdAt
        ? new Date(l.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Recent',
      status: l.status || 'success',
    })),
  }

  return (
    <PortalLayout role="hod" userName={profileData.name}>
      <div className="py-2 animate-fade-in">
        <HODProfileView initialProfile={profileData} />
      </div>
    </PortalLayout>
  )
}
