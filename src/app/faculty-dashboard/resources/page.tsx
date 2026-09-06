import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyResourcesView, ResourceItem } from './components/FacultyResourcesView'

export const dynamic = 'force-dynamic'

export default async function FacultyResourcesPage() {
  const session = await requireRoleSession(['faculty'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const facultyName = user?.name || session.name || 'Faculty Member'

  const faculty = await prisma.faculty.findFirst({
    where: { userId: session.userId },
  })

  const isAdvisor = faculty?.facultyType === 'advisor'
  const advisorBatch = faculty?.advisorBatch || (isAdvisor ? 'Year II - Sem 3 - Sec A' : null)
  const advisorSem = faculty?.advisorSem || (isAdvisor ? 3 : null)

  const [resourcesFromDb, subjectsFromDb] = await Promise.all([
    prisma.resource.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subject.findMany({
      orderBy: { code: 'asc' },
      select: { id: true, code: true, name: true },
    }),
  ])

  const mappedResources: ResourceItem[] = resourcesFromDb.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    fileName: r.fileName,
    fileSize: r.fileSize,
    fileUrl: r.fileUrl,
    resourceType: r.resourceType,
    subjectId: r.subjectId,
    semester: r.semester,
    academicYear: r.academicYear,
    uploadedByName: r.uploadedByName || facultyName,
    createdAt: r.createdAt,
  }))

  const mappedSubjects = subjectsFromDb.map((s) => {
    // Determine semester from code (e.g. AD2301 -> 3, AD2401 -> 4, AD2501 -> 5)
    const match = s.code.match(/[A-Za-z]+[0-9]([1-8])/)
    const sem = match ? parseInt(match[1], 10) : 3
    return {
      id: s.id,
      code: s.code,
      name: s.name,
      semester: sem,
    }
  })

  return (
    <PortalLayout role="faculty" userName={facultyName}>
      <div className="py-2 animate-fade-in">
        <FacultyResourcesView
          initialResources={mappedResources}
          facultyName={facultyName}
          isAdvisor={isAdvisor}
          advisorBatch={advisorBatch}
          advisorSem={advisorSem}
          subjects={mappedSubjects}
        />
      </div>
    </PortalLayout>
  )
}
