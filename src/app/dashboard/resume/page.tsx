import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { ResumeGeneratorView } from './components/ResumeGeneratorView'

export const dynamic = 'force-dynamic'

export default async function ResumeGeneratorPage() {
  const session = await requireRoleSession(['student'])

  // Fetch student, user, projects, achievements from database
  let [user, student, dbProjects, dbAchievements] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
    prisma.student.findUnique({ where: { userId: session.userId } }).catch(() => null),
    prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    }).catch(() => []),
    prisma.achievement.findMany({
      where: {
        OR: [
          { recipientName: session.name },
          { status: 'published' },
        ],
      },
      orderBy: { date: 'desc' },
      take: 10,
    }).catch(() => []),
  ])

  if (!student && session.registerNumber) {
    student = await prisma.student.findUnique({
      where: { registerNumber: session.registerNumber.trim().toUpperCase() },
    }).catch(() => null)
  }

  const realName = user?.name || session.name || 'Student'
  const realEmail = user?.email && !user.email.endsWith('@student.vsb.edu.in')
    ? user.email
    : (session.email && !session.email.endsWith('@student.vsb.edu.in') ? session.email : '')
  const realPhone = user?.phone || ''
  const realRegNo = student?.registerNumber || session.registerNumber || ''
  const studentYear = student?.year || 2
  const studentSem = student?.semester || 4
  const studentSection = student?.section || 'A'
  const studentCgpa = student?.cgpa !== null && student?.cgpa !== undefined ? String(student.cgpa) : ''
  const studentDepartment = student?.department || 'Artificial Intelligence & Data Science'
  const studentAddress = student?.address || 'Karur, Tamil Nadu, India'

  // Estimate batch
  const startYear = 2026 - (studentYear - 1) - 1 // e.g. Year 2 in 2026 started in 2024
  const endYear = startYear + 4
  const batchRange = `${startYear} - ${endYear}`

  const initialProfile = {
    fullName: realName,
    registerNumber: realRegNo,
    email: realEmail,
    phone: realPhone,
    address: studentAddress,
    department: studentDepartment,
    year: studentYear,
    semester: studentSem,
    section: studentSection,
    cgpa: studentCgpa,
    batchRange: batchRange,
    profileImage: user?.profileImage || null,
  }

  const initialProjects = (dbProjects || []).map((p: any) => ({
    title: p.title || 'Academic Project',
    domain: p.domain || 'AI & Machine Learning',
    technologies: Array.isArray(p.technologies) 
      ? p.technologies.join(', ') 
      : (typeof p.technologies === 'string' ? p.technologies : 'Python, PyTorch, Scikit-Learn'),
    description: p.description || p.problemStatement || 'Engineered an end-to-end intelligent solution with evaluated metrics and deployed user interface.',
    githubUrl: p.githubUrl || '',
    dataset: p.dataset || '',
  }))

  const initialAchievements = (dbAchievements || []).map((a: any) => ({
    title: a.title || 'Technical Achievement',
    category: a.category || 'Hackathon & Competitions',
    awardName: a.awardName || 'Participant & Contributor',
    eventName: a.eventName || 'National Level Symposium / Hackathon',
    date: a.date ? (typeof a.date === 'string' ? a.date : a.date.toISOString().split('T')[0]) : '',
  }))

  return (
    <PortalLayout
      role="student"
      userName={realName}
      userEmail={realEmail}
      profileImage={user?.profileImage || null}
    >
      <div className="py-2 animate-fade-in">
        <ResumeGeneratorView
          initialProfile={initialProfile}
          initialProjects={initialProjects}
          initialAchievements={initialAchievements}
        />
      </div>
    </PortalLayout>
  )
}
