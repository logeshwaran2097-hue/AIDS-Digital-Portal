import { prisma } from '@/lib/prisma'

export async function getStudentData(userId: string) {
  const student = await prisma.student.findUnique({ where: { userId } })
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!student || !user) return null

  const [announcements, events, resources, achievements, questionPapers, projects, faculty, notifications, subjects] =
    await Promise.all([
      prisma.announcement.findMany({ where: { isPublished: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.event.findMany({ where: { isPublished: true }, orderBy: { date: 'asc' }, take: 5 }),
      prisma.resource.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
      prisma.achievement.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
      prisma.questionPaper.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.project.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.user.findMany({ where: { role: 'faculty' }, select: { id: true, name: true, email: true, profileImage: true } }),
      prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.subject.findMany({ where: { yearId: { equals: null } }, take: 1 }).catch(() => []),
    ])


  const semesters = await prisma.semester.findMany({
    where: { number: student.semester },
    select: { id: true },
  })
  const semesterIds = semesters.map((s) => s.id)

  const mySubjects = await prisma.subject.findMany({
    where: { semesterId: { in: semesterIds } },
    take: 10,
    orderBy: { code: 'asc' },
  })

  return {
    user,
    student,
    announcements,
    events,
    resources,
    achievements,
    questionPapers,
    projects,
    faculty,
    notifications,
    subjects: mySubjects,
  }
}

export async function getFacultyData(userId: string) {
  const faculty = await prisma.faculty.findUnique({ where: { userId } })
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!faculty || !user) return null

  const subjectCodes = JSON.parse(faculty.subjects || '[]') as string[]
  const [subjects, students, resources, questionPapers, projects, events, announcements, notifications] =
    await Promise.all([
      prisma.subject.findMany({ where: { code: { in: subjectCodes } } }),
      prisma.student.findMany({ take: 20, orderBy: { registerNumber: 'asc' } }),
      prisma.resource.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.questionPaper.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.project.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.event.findMany({ where: { isPublished: true }, orderBy: { date: 'asc' }, take: 10 }),
      prisma.announcement.findMany({ where: { isPublished: true }, orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    ])

  return { user, faculty, subjects, students, resources, questionPapers, projects, events, announcements, notifications }
}

export async function getHODData(userId: string) {
  const hod = await prisma.hOD.findUnique({ where: { userId } })
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!hod || !user) return null

  const [
    studentCount, facultyCount, subjectCount, projectCount,
    resourceCount, questionPaperCount, upcomingEvents, pendingResources,
    pendingQuestionPapers, pendingApapers, achievements, faculty, students,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.faculty.count(),
    prisma.subject.count(),
    prisma.project.count(),
    prisma.resource.count(),
    prisma.questionPaper.count(),
    prisma.event.count({ where: { isPublished: true, date: { gte: new Date() } } }),
    prisma.resource.count({ where: { status: 'pending' } }),
    prisma.questionPaper.count({ where: { status: 'pending' } }),
    prisma.achievement.count({ where: { status: 'pending' } }),
    prisma.achievement.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    prisma.user.findMany({ where: { role: 'faculty' }, select: { id: true, name: true, email: true, profileImage: true } }),
    prisma.student.findMany({ orderBy: { registerNumber: 'asc' }, take: 30 }),
  ])

  return {
    user, hod, studentCount, facultyCount, subjectCount, projectCount,
    resourceCount, questionPaperCount, upcomingEvents,
    pendingApprovals: pendingResources + pendingQuestionPapers + pendingApapers,
    achievements, faculty, students,
  }
}

export async function getAdminData() {
  const [
    studentCount, facultyCount, hodCount, adminCount,
    subjectCount, resourceCount, questionPaperCount, projectCount,
    eventCount, announcementCount, achievementCount, recentLogs,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.faculty.count(),
    prisma.hOD.count(),
    prisma.admin.count(),
    prisma.subject.count(),
    prisma.resource.count(),
    prisma.questionPaper.count(),
    prisma.project.count(),
    prisma.event.count(),
    prisma.announcement.count(),
    prisma.achievement.count(),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
  ])

  return {
    studentCount, facultyCount, hodCount, adminCount,
    subjectCount, resourceCount, questionPaperCount, projectCount,
    eventCount, announcementCount, achievementCount, recentLogs,
  }
}

export async function getPortalCounts(userId: string, role: string) {
  if (role === 'admin') return getAdminData()
  if (role === 'hod') {
    const d = await getHODData(userId)
    return d
  }
  if (role === 'faculty') {
    const d = await getFacultyData(userId)
    return d
  }
  return getStudentData(userId)
}