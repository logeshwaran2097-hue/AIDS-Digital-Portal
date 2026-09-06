import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyQuestionPapersView, FacultyQPItem } from './components/FacultyQuestionPapersView'

export const dynamic = 'force-dynamic'

export default async function FacultyQuestionPapersPage() {
  const session = await requireRoleSession(['faculty'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const faculty = await prisma.faculty.findUnique({ where: { userId: session.userId } })
  const facultyName = user?.name || session.name || 'Faculty Member'
  const isAdvisor =
    faculty?.facultyType === 'advisor' ||
    Boolean(faculty?.advisorBatch) ||
    faculty?.facultyType === 'both'

  const DEFAULT_DEPARTMENT_SUBJECTS = [
    { id: 'sub-ad3301', code: 'AD3301', name: 'Design and Analysis of Algorithms' },
    { id: 'sub-ad3391', code: 'AD3391', name: 'Database Design and Management' },
    { id: 'sub-cs3351', code: 'CS3351', name: 'Digital Principles and Computer Organization' },
    { id: 'sub-ad3491', code: 'AD3491', name: 'Fundamentals of Data Science' },
    { id: 'sub-al3452', code: 'AL3452', name: 'Operating Systems' },
    { id: 'sub-ma3354', code: 'MA3354', name: 'Discrete Mathematics' },
    { id: 'sub-ad3311', code: 'AD3311', name: 'Artificial Intelligence Laboratory' },
  ]

  const dbSubjects = await prisma.subject.findMany({
    orderBy: { code: 'asc' },
    select: { id: true, code: true, name: true },
  }).catch(() => [])

  const subjects = dbSubjects.length > 0 ? dbSubjects : DEFAULT_DEPARTMENT_SUBJECTS
  const subjectMap = new Map(subjects.map((s) => [s.id, s]))

  const papersFromDb = await prisma.questionPaper.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  const DEFAULT_PAPERS: FacultyQPItem[] = [
    {
      id: 'qp-ad3301-iat1',
      subjectId: 'sub-ad3301',
      subjectCode: 'AD3301',
      subjectName: 'Design and Analysis of Algorithms',
      examType: 'Internal Test 1 (IAT 1)',
      academicYear: '2025-2026',
      year: faculty?.advisorYear || 2,
      semester: faculty?.advisorSem || 3,
      fileName: 'AD3301_IAT1_QP_2025-2026.pdf',
      fileSize: 2450000,
      uploadedByName: facultyName,
      createdAt: new Date(),
    },
    {
      id: 'qp-ad3391-iat2',
      subjectId: 'sub-ad3391',
      subjectCode: 'AD3391',
      subjectName: 'Database Design and Management',
      examType: 'Internal Test 2 (IAT 2)',
      academicYear: '2025-2026',
      year: faculty?.advisorYear || 2,
      semester: faculty?.advisorSem || 3,
      fileName: 'AD3391_IAT2_QP_2025-2026.pdf',
      fileSize: 2800000,
      uploadedByName: facultyName,
      createdAt: new Date(),
    },
    {
      id: 'qp-cs3351-model',
      subjectId: 'sub-cs3351',
      subjectCode: 'CS3351',
      subjectName: 'Digital Principles and Computer Organization',
      examType: 'Model Examination',
      academicYear: '2025-2026',
      year: faculty?.advisorYear || 2,
      semester: faculty?.advisorSem || 3,
      fileName: 'CS3351_Model_Exam_QP_2025-2026.pdf',
      fileSize: 3100000,
      uploadedByName: facultyName,
      createdAt: new Date(),
    },
    {
      id: 'qp-ad3491-univ',
      subjectId: 'sub-ad3491',
      subjectCode: 'AD3491',
      subjectName: 'Fundamentals of Data Science',
      examType: 'Anna University Examination (Nov/Dec)',
      academicYear: '2024-2025',
      year: faculty?.advisorYear || 2,
      semester: faculty?.advisorSem || 3,
      fileName: 'AD3491_NovDec2024_Univ_QP.pdf',
      fileSize: 3600000,
      uploadedByName: 'COE Controller',
      createdAt: new Date(),
    },
  ]

  const mappedPapers: FacultyQPItem[] =
    papersFromDb.length > 0
      ? papersFromDb.map((p) => {
          const s = subjectMap.get(p.subjectId) || subjects.find((sub) => sub.code === p.subjectId)
          return {
            id: p.id,
            subjectId: p.subjectId,
            subjectCode: s?.code || p.subjectId || 'N/A',
            subjectName: s?.name || p.fileName || 'Course Subject',
            examType: p.examType,
            academicYear: p.academicYear,
            year: p.year,
            semester: p.semester,
            fileName: p.fileName,
            fileSize: p.fileSize,
            uploadedByName: p.uploadedByName || facultyName,
            createdAt: p.createdAt,
          }
        })
      : DEFAULT_PAPERS

  return (
    <PortalLayout role="faculty" userName={facultyName}>
      <div className="py-2 animate-fade-in">
        <FacultyQuestionPapersView
          initialPapers={mappedPapers}
          subjects={subjects}
          facultyName={facultyName}
          isAdvisor={isAdvisor}
          advisorBatch={
            faculty?.advisorBatch ||
            (faculty?.advisorYear
              ? `Year ${faculty.advisorYear} - Sem ${faculty.advisorSem || 3} - Sec ${faculty.advisorSec || 'A'}`
              : 'AI & DS Dept')
          }
          advisorYear={faculty?.advisorYear || 2}
          advisorSem={faculty?.advisorSem || 3}
          advisorSec={faculty?.advisorSec || 'A'}
        />
      </div>
    </PortalLayout>
  )
}
