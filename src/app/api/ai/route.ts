import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse, checkApiUsageQuota, quotaExceededResponse } from '@/lib/rateLimit'
import { validateBody, aiQuerySchema } from '@/lib/validations/apiValidation'


// Universal Real-Time Database Query Engine (Strictly Database Grounded)

// Universal Real-Time Database Query Engine
import { STUDY_DATABASE, SubjectUnitData, UnitData } from '@/data/studyDatabase'

// =============================================================================
// ANNA UNIVERSITY R-2021 ACADEMIC INTELLIGENCE ENGINE (100% AUTHENTIC 15 UNITS)
// =============================================================================
function handleAcademicCurriculumQuery(rawQ: string): { answer: string; suggestions: string[] } | null {
  const q = rawQ.toLowerCase()

  const isChiefExaminer = /chief examiner|format:\s*part|generate an authentic university exam question|question generator/i.test(rawQ)
  const isPartQuery = /part\s*[abc]\s*\(\d+\s*marks?\)|part\s*[abc]/i.test(q)
  const hasCourseCode = /\b(al3391|ad3351|ad3501)\b/i.test(q)
  const isAcademicTopic = /\b(artificial intelligence|deep learning|design and analysis of algorithms|divide and conquer|dynamic programming|greedy|knapsack|master theorem|recurrence|a\*|bfs|dfs|heuristic|hill climbing|minimax|alpha-beta|csp|logic|bayes|hidden markov|viterbi|strips|pddl|decision tree|random forest|merge sort|quick sort|strassen|lcs|floyd-warshall|prim|kruskal|dijkstra|bellman-ford|max flow|ford-fulkerson|bipartite matching|n-queens|branch and bound|backtracking|p vs np|np-complete|perceptron|backpropagation|vanishing gradient|adam optimizer|cnn|lenet|alexnet|vgg|googlenet|resnet|skip connection|rnn|bptt|lstm|gru|transformer|attention|multi-head attention|bert|gpt|gan|vae)\b/i.test(q)

  if (!isChiefExaminer && !hasCourseCode && !isAcademicTopic && !isPartQuery && !q.includes('unit 1') && !q.includes('unit 2') && !q.includes('unit 3') && !q.includes('unit 4') && !q.includes('unit 5')) {
    return null
  }

  // Determine Target Subject
  let targetSubject: SubjectUnitData = STUDY_DATABASE[0] // AL3391 by default
  if (/ad3501|deep learning|neural network|cnn|lenet|alexnet|vgg|googlenet|resnet|rnn|lstm|gru|transformer|attention|bert|gpt|gan|vae|backpropagation|activation function/i.test(q)) {
    targetSubject = STUDY_DATABASE.find(s => s.code === 'AD3501') || targetSubject
  } else if (/ad3351|algorithm|daa|divide and conquer|dynamic programming|greedy|master theorem|recurrence|quick sort|merge sort|strassen|knapsack|lcs|floyd-warshall|prim|kruskal|dijkstra|bellman-ford|max flow|ford-fulkerson|matching|branch and bound|backtracking|np-complete/i.test(q)) {
    targetSubject = STUDY_DATABASE.find(s => s.code === 'AD3351') || targetSubject
  } else if (/al3391|artificial intelligence|intelligent agent|state space|a\*|heuristic|hill climbing|minimax|alpha-beta|csp|propositional logic|first-order logic|unification|bayes|markov|viterbi|strips|pddl|decision tree/i.test(q)) {
    targetSubject = STUDY_DATABASE.find(s => s.code === 'AL3391') || targetSubject
  }

  // Determine Target Unit
  let targetUnit: UnitData = targetSubject.units[0]
  const unitMatch = q.match(/unit\s*([1-5])/i)
  if (unitMatch && unitMatch[1]) {
    const uNo = parseInt(unitMatch[1], 10)
    const foundUnit = targetSubject.units.find(u => u.unitNo === uNo)
    if (foundUnit) targetUnit = foundUnit
  } else {
    for (const u of targetSubject.units) {
      if (u.topics.some(t => q.includes(t.toLowerCase()))) {
        targetUnit = u
        break
      }
    }
  }

  // Question Generator / Exam Blueprint Query
  if (isChiefExaminer || isPartQuery || q.includes('question:')) {
    let mark: 2 | 8 | 16 = 2
    if (/part\s*c|16\s*marks?/i.test(q)) {
      mark = 16
    } else if (/part\s*b|8\s*marks?/i.test(q)) {
      mark = 8
    }

    let topicText = ''
    const topicMatch = rawQ.match(/Topic:\s*([^\n\r]+)/i)
    if (topicMatch && topicMatch[1]) {
      topicText = topicMatch[1].trim()
    }

    if (mark === 2) {
      const candidates = targetUnit.partA
      let chosen = candidates[0]
      if (topicText && topicText.length > 2) {
        const matched = candidates.find(c => c.q.toLowerCase().includes(topicText.toLowerCase()) || c.a.toLowerCase().includes(topicText.toLowerCase()))
        if (matched) chosen = matched
      }
      if (!chosen && candidates.length > 0) {
        chosen = candidates[Math.floor(Math.random() * candidates.length)]
      }
      return {
        answer: 'QUESTION: ' + chosen.q + '\n\nANSWER: ' + chosen.a + '\n\n[Mark Scheme: 2 Marks — Precise Anna University Definition/Equation, Full Marks for exact technical keywords]',
        suggestions: [
          'Generate Part B (8M) question for ' + targetSubject.code + ' Unit ' + targetUnit.unitNo,
          'Generate Part C (16M) question for ' + targetSubject.code + ' Unit ' + targetUnit.unitNo,
          'Smart revision notes for Unit ' + targetUnit.unitNo,
        ],
      }
    } else if (mark === 8) {
      const candidates = targetUnit.partB
      let chosen = candidates[0]
      if (topicText && topicText.length > 2) {
        const matched = candidates.find(c => c.q.toLowerCase().includes(topicText.toLowerCase()) || c.a.toLowerCase().includes(topicText.toLowerCase()))
        if (matched) chosen = matched
      }
      if (!chosen && candidates.length > 0) {
        chosen = candidates[Math.floor(Math.random() * candidates.length)]
      }
      return {
        answer: 'QUESTION: ' + chosen.q + '\n\nANSWER: ' + chosen.a + '\n\n[Mark Scheme: 8 Marks — Principle/Algorithm (3 Marks), Step-by-Step Proof/Derivation (3 Marks), Diagram/Example (2 Marks)]',
        suggestions: [
          'Generate Part A (2M) question for ' + targetSubject.code + ' Unit ' + targetUnit.unitNo,
          'Generate Part C (16M) question for ' + targetSubject.code + ' Unit ' + targetUnit.unitNo,
          'Diagnostic Quiz for Unit ' + targetUnit.unitNo,
        ],
      }
    } else {
      const candidates = targetUnit.partC
      let chosen = candidates[0]
      if (topicText && topicText.length > 2) {
        const matched = candidates.find(c => c.q.toLowerCase().includes(topicText.toLowerCase()) || c.a.toLowerCase().includes(topicText.toLowerCase()))
        if (matched) chosen = matched
      }
      if (!chosen && candidates.length > 0) {
        chosen = candidates[Math.floor(Math.random() * candidates.length)]
      }
      return {
        answer: 'QUESTION: ' + chosen.q + '\n\nANSWER: ' + chosen.a + '\n\n[Mark Scheme: 16 Marks — Comprehensive Architecture/Formulation (6 Marks), Mathematical Proof/Derivation (6 Marks), Trace/Evaluation Matrix (4 Marks)]',
        suggestions: [
          'Generate Part A (2M) question for ' + targetSubject.code + ' Unit ' + targetUnit.unitNo,
          'Generate Part B (8M) question for ' + targetSubject.code + ' Unit ' + targetUnit.unitNo,
          'Smart revision notes for Unit ' + targetUnit.unitNo,
        ],
      }
    }
  }

  // Academic Explanation / Tutor Queries
  const allQuestions = [...targetUnit.partB, ...targetUnit.partC, ...targetUnit.partA]
  const cleanQ = q.replace(/\[subject:[^\]]+\]/gi, '').trim()
  const searchWords = cleanQ.split(/\s+/).filter(w => w.length > 2 && !['what', 'explain', 'tell', 'about', 'how', 'does', 'with', 'the', 'and', 'for', 'write'].includes(w))

  let bestMatch: { q: string; a: string } | null = null
  let bestScore = 0

  for (const item of allQuestions) {
    const itemText = (item.q + ' ' + item.a).toLowerCase()
    let score = 0
    for (const word of searchWords) {
      if (itemText.includes(word)) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = item
    }
  }

  if (bestMatch && bestScore >= 1) {
    return {
      answer: '🎓 **Anna University R-2021 Academic Intelligence — ' + targetSubject.code + ' (' + targetSubject.name + ')**\n\n' +
        '📖 **Unit ' + targetUnit.unitNo + ': ' + targetUnit.title + '**\n\n' +
        '### 📌 ' + bestMatch.q + '\n\n' +
        bestMatch.a + '\n\n' +
        '---\n' +
        '💡 *Anna University Examination Key: Emphasize clear definitions, bulleted principles, formulas, and step-by-step traces to secure full marks.*\n\n*You can practice real Part A (2M), Part B (8M), and Part C (16M) questions in the **AI Study Assistant**.*',
      suggestions: [
        'Part A (2M) question for Unit ' + targetUnit.unitNo,
        'Part B (8M) question for Unit ' + targetUnit.unitNo,
        'Part C (16M) question for Unit ' + targetUnit.unitNo,
      ],
    }
  }

  for (const note of targetUnit.notes) {
    if (searchWords.some(w => note.title.toLowerCase().includes(w))) {
      return {
        answer: '🎓 **Anna University R-2021 Revision Summary — ' + targetSubject.code + ' (' + targetSubject.name + ')**\n\n' +
          '📖 **Unit ' + targetUnit.unitNo + ': ' + targetUnit.title + '**\n\n' +
          '### 📝 ' + note.title + '\n\n' +
          note.points.map(p => '• ' + p).join('\n') +
          '\n\n*Review all 5 units in the **AI Study Assistant**.*',
        suggestions: [
          'Part A (2M) question for Unit ' + targetUnit.unitNo,
          'Part B (8M) question for Unit ' + targetUnit.unitNo,
        ],
      }
    }
  }

  return {
    answer: '🎓 **Anna University R-2021 Curriculum Scope — ' + targetSubject.code + ' (' + targetSubject.name + ')**\n\n' +
      '📖 **Unit ' + targetUnit.unitNo + ': ' + targetUnit.title + '**\n\n' +
      '**Syllabus Topics Covered:**\n' +
      targetUnit.topics.map(t => '• ' + t).join('\n') +
      '\n\n**Representative Exam Question:**\n' +
      '• **Part A (2M):** ' + targetUnit.partA[0]?.q + '\n' +
      '• **Part B (8M):** ' + targetUnit.partB[0]?.q + '\n' +
      '• **Part C (16M):** ' + targetUnit.partC[0]?.q + '\n\n' +
      '*Access complete model answers and diagnostic quizzes in the **AI Study Assistant**.*',
    suggestions: [
      'Part A (2M) question for Unit ' + targetUnit.unitNo,
      'Part B (8M) question for Unit ' + targetUnit.unitNo,
      'Part C (16M) question for Unit ' + targetUnit.unitNo,
    ],
  }
}


async function getDynamicKnowledgeBase(query: string, session?: any): Promise<{ answer: string; suggestions: string[] }> {
  const rawQ = query.trim()
  const q = rawQ.toLowerCase()

  try {
    // -------------------------------------------------------------------------
    // 1. LIVE STUDENT LOOKUP (Search by Register Number, Name, Year/Sem)
    // -------------------------------------------------------------------------
    if (
      q.includes('student') ||
      q.includes('register') ||
      q.includes('reg') ||
      /\d{4,}/.test(q) || // contains number like 922522AD001
      q.includes('roster')
    ) {
      const isStaff = session && (session.role === 'faculty' || session.role === 'hod' || session.role === 'admin' || session.role === 'super_admin')
      if (!isStaff) {
        const userReg = session?.registerNumber?.toLowerCase()
        if (!userReg || !q.includes(userReg)) {
          return {
            answer: `🔒 **Student Directory Privacy Notice:**\n\nStudent directory listings and contact information are restricted to authorized Faculty and Administrators to protect student privacy.\n\n*You can view your personal academic and attendance records directly on your dashboard.*`,
            suggestions: ['Faculty directorate?', 'HOD leadership?', 'Academic calendar?'],
          }
        }
      }
      // Find matching students in live SQLite DB
      const cleanKeywords = q.replace(/student|who is|details of|about|find|search|is|the|tell me/gi, '').trim()

      const students = await prisma.student.findMany({
        where: cleanKeywords.length > 1
          ? {
              OR: [
                { registerNumber: { contains: cleanKeywords } },
                { section: { contains: cleanKeywords } },
              ],
            }
          : undefined,
        take: 10,
      })

      // Also search users
      const studentUsers = await prisma.user.findMany({
        where: {
          role: 'student',
          ...(cleanKeywords.length > 1 ? { name: { contains: cleanKeywords } } : {}),
        },
        take: 10,
      })

      if (students.length > 0 || studentUsers.length > 0) {
        // Collect detailed info
        const allStudentDetails = []
        for (const s of students) {
          const u = await prisma.user.findUnique({ where: { id: s.userId } }).catch(() => null)
          allStudentDetails.push(
            `• **${s.registerNumber}** — ${u?.name || 'Student'} | Year ${s.year} (Sem ${s.semester}) · Sec ${s.section} | Email: ${u?.email || 'N/A'}`
          )
        }

        if (allStudentDetails.length > 0) {
          return {
            answer: `🎓 **Live Database Student Records (${allStudentDetails.length} found):**\n\n${allStudentDetails.join('\n')}\n\n*Manage and view complete student records in **Students Roster**.*`,
            suggestions: ['Faculty directorate?', 'HOD leadership?', 'Academic calendar?'],
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // 2. LIVE FACULTY LOOKUP (Search by Faculty ID, Name, Subject, Advisor)
    // -------------------------------------------------------------------------
    if (
      q.includes('faculty') ||
      q.includes('teacher') ||
      q.includes('professor') ||
      q.includes('mentor') ||
      q.includes('advisor') ||
      q.includes('handler') ||
      q.includes('dr.') ||
      q.includes('mr.') ||
      q.includes('mrs.') ||
      q.includes('fac')
    ) {
      const cleanKeywords = q.replace(/faculty|teacher|professor|advisor|who is|details of|about|find|dr\.|mr\.|mrs\./gi, '').trim()

      const facultyList = await prisma.faculty.findMany({
        take: 15,
      })
      const facultyUsers = await prisma.user.findMany({
        where: { role: 'faculty' },
        take: 15,
      })

      if (facultyList.length > 0 || facultyUsers.length > 0) {
        const matchingFaculty = []

        for (const f of facultyList) {
          const u = facultyUsers.find((user) => user.id === f.userId)
          const name = u?.name || 'Faculty'
          const email = u?.email || 'N/A'

          const subjectName = (f as any).subjectName || ''
          const advisorBatch = (f as any).advisorBatch || ''

          if (
            cleanKeywords.length === 0 ||
            name.toLowerCase().includes(cleanKeywords) ||
            f.facultyId.toLowerCase().includes(cleanKeywords) ||
            f.specialization.toLowerCase().includes(cleanKeywords) ||
            (subjectName && subjectName.toLowerCase().includes(cleanKeywords)) ||
            (advisorBatch && advisorBatch.toLowerCase().includes(cleanKeywords))
          ) {
            matchingFaculty.push(
              `• **${name}** (${f.facultyId}) — ${f.designation}\n  - **Specialization:** ${f.specialization}\n  - **Handling Course:** ${subjectName || 'Assigned Subjects'}\n  - **Class Advisor:** ${advisorBatch || 'General Staff'}\n  - **Contact:** ${email}`
            )
          }
        }

        if (matchingFaculty.length > 0) {
          return {
            answer: `👨‍🏫 **Live Faculty Directorate Records (${matchingFaculty.length} staff):**\n\n${matchingFaculty.join('\n\n')}\n\n*Full profiles and schedules can be viewed under **Faculty Directorate**.*`,
            suggestions: ['HOD leadership?', 'Labs for 2nd year?', 'Daily bell timings?'],
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // 3. LIVE HOD LOOKUP (Head of Department)
    // -------------------------------------------------------------------------
    if (q.includes('hod') || q.includes('head') || q.includes('leadership') || q.includes('department head')) {
      const hodRecords = await prisma.hOD.findMany()
      const hodUsers = await prisma.user.findMany({ where: { role: 'hod' } })

      if (hodRecords.length > 0 || hodUsers.length > 0) {
        const hodDetails = []
        for (const h of hodRecords) {
          const u = hodUsers.find((user) => user.id === h.userId)
          hodDetails.push(
            `• **${u?.name || 'Head of Department'}** (${h.facultyId})\n  - **Designation:** ${h.designation || 'Head of Department'}\n  - **Qualification:** ${h.qualification || 'Not Specified'}${h.experience ? ` (${h.experience} Years Exp)` : ''}\n  - **Department:** ${h.department || 'Artificial Intelligence & Data Science'}\n  - **Email:** ${u?.email || 'N/A'}\n  - **Phone:** ${u?.phone || 'N/A'}`
          )
        }

        return {
          answer: `👑 **Head of Department (HOD) — Live Record:**\n\n${hodDetails.join('\n\n')}\n\n*Main Office: Administrative Block - Department of AI & DS.*`,
          suggestions: ['Faculty directorate?', 'Who are the administrators?', 'Academic calendar?'],
        }
      }
    }

    // -------------------------------------------------------------------------
    // 4. LIVE ANNOUNCEMENTS / CIRCULARS LOOKUP
    // -------------------------------------------------------------------------
    if (
      q.includes('announcement') ||
      q.includes('circular') ||
      q.includes('notice') ||
      q.includes('news') ||
      q.includes('broadcast') ||
      q.includes('update')
    ) {
      const announcements = await prisma.announcement.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })

      if (announcements.length > 0) {
        const list = announcements.map(
          (a, i) =>
            `${i + 1}. **[${a.category}] ${a.title}**\n   Target: *${a.target}* | Authorized: *${a.createdByName}*\n   ${a.content}`
        )

        return {
          answer: `📢 **Latest Official Department Circulars (${announcements.length} active notices):**\n\n${list.join('\n\n')}\n\n*Download official circular PDFs in the **Announcements** section.*`,
          suggestions: ['Academic calendar?', 'Labs for 2nd year?', 'Daily bell timings?'],
        }
      }
    }

    // -------------------------------------------------------------------------
    // 5. LIVE EVENTS & HACKATHONS LOOKUP
    // -------------------------------------------------------------------------
    if (
      q.includes('event') ||
      q.includes('hackathon') ||
      q.includes('symposium') ||
      q.includes('workshop') ||
      q.includes('seminar')
    ) {
      const events = await prisma.event.findMany({
        orderBy: { date: 'asc' },
        take: 6,
      })

      if (events.length > 0) {
        const list = events.map(
          (e, i) =>
            `• **${e.name}** (${e.category || 'Technical'})\n  - Date: ${new Date(e.date).toLocaleDateString()} | Venue: ${e.venue}\n  - ${e.description}`
        )

        return {
          answer: `🎉 **Scheduled Department Events & Symposia (${events.length} programs):**\n\n${list.join('\n\n')}\n\n*Register directly under **Events & Symposia**!*`,
          suggestions: ['Academic calendar?', 'Capstone projects?', 'Labs for 2nd year?'],
        }
      }
    }

    // -------------------------------------------------------------------------
    // 6. LIVE CAPSTONE PROJECTS LOOKUP
    // -------------------------------------------------------------------------
    if (q.includes('project') || q.includes('capstone') || q.includes('mini project') || q.includes('prototype')) {
      const projects = await prisma.project.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
      })

      if (projects.length > 0) {
        const list = projects.map(
          (p) =>
            `• **${p.title}**\n  - Domain: ${p.domain} | Status: *${p.status}*\n  - Guide: ${p.guideName || 'Faculty Guide'}\n  - ${p.description}`
        )

        return {
          answer: `🚀 **Active Department Capstone Projects (${projects.length} teams):**\n\n${list.join('\n\n')}\n\n*Submit project reports and code repositories under **Capstone Projects**.*`,
          suggestions: ['Submit project?', 'Faculty directorate?', 'Study resources?'],
        }
      }
    }

    // -------------------------------------------------------------------------
    // 7. LIVE STUDY RESOURCES & E-BOOKS LOOKUP
    // -------------------------------------------------------------------------
    if (q.includes('resource') || q.includes('book') || q.includes('notes') || q.includes('material') || q.includes('pdf')) {
      const resources = await prisma.resource.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
      })

      if (resources.length > 0) {
        const list = resources.map(
          (r) => `• **${r.name}** (${r.fileType}) · Subject ID: *${r.subjectId || 'General AI & DS'}*`
        )

        return {
          answer: `📚 **Live Digital Study Resources (${resources.length} files available):**\n\n${list.join('\n')}\n\n*Instant 1-click downloads are available under **Study Resources**.*`,
          suggestions: ['Question papers?', 'Labs for 2nd year?', 'Daily bell timings?'],
        }
      }
    }

    // -------------------------------------------------------------------------
    // 8. LIVE QUESTION PAPERS BANK LOOKUP
    // -------------------------------------------------------------------------
    if (q.includes('question') || q.includes('paper') || q.includes('exam') || q.includes('iat') || q.includes('model')) {
      const papers = await prisma.questionPaper.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
      })

      if (papers.length > 0) {
        const list = papers.map(
          (p) => `• **${p.fileName}** — ${p.examType} | Year ${p.year} (Sem ${p.semester})`
        )

        return {
          answer: `📝 **Examination Question Papers Bank (${papers.length} sets uploaded):**\n\n${list.join('\n')}\n\n*Download full question sets under **Question Papers**.*`,
          suggestions: ['Study resources?', 'Academic calendar?', 'Labs for 2nd year?'],
        }
      }
    }

    // -------------------------------------------------------------------------
    // 9. SPECIFIC LABS / PRACTICALS (Strictly queried from database)
    // -------------------------------------------------------------------------
    const isLabQuery = q.includes('lab') || q.includes('practical') || q.includes('workshop') || q.includes('training')

    if (isLabQuery) {
      const dbSubjects = await prisma.subject.findMany({
        orderBy: { code: 'asc' },
      })

      if (dbSubjects.length > 0) {
        const list = dbSubjects.map(
          (s) => `• **${s.code}** - ${s.name} (${s.credits} Credits)`
        )
        return {
          answer: `🔬 **Department of AI & DS — Registered Laboratories & Courses (${dbSubjects.length} courses):**\n\n${list.join('\n')}\n\n💡 *All courses are registered and maintained directly by the System Administrator in the database.*`,
          suggestions: ['Faculty directorate?', 'Daily bell timings?', 'Study resources?'],
        }
      } else {
        return {
          answer: `🔬 **Department of AI & DS — Laboratory Courses:**\n\nNo laboratory or practical courses have been registered yet by the Administrator in the database.\n\nOnce the Administrator adds curricular courses via the **Admin Academics Command Center**, they will be automatically queried and displayed here in real time.`,
          suggestions: ['Daily bell timings?', 'Class Advisor lookup?', 'Student directory?'],
        }
      }
    }

    // -------------------------------------------------------------------------
    // 10. DAILY SCHEDULE, TIMETABLE & BELL TIMINGS (8 PERIODS)
    // -------------------------------------------------------------------------
    const isScheduleQuery = /\b(bell timings?|class timings?|period timings?|daily schedule|timetable|lunch break|tea break|college hours|working hours|daily periods?)\b/i.test(q)
    if (isScheduleQuery && !q.includes('exam') && !q.includes('question') && !q.includes('unit') && !q.includes('mark') && !q.includes('syllabus')) {
      return {
        answer: `⏰ **Official Institutional Bell Timings & 8-Period Daily Schedule:**

**Morning Academic Session:**
• **Period 1:** 09:15 AM - 10:00 AM (45 mins · Morning Theory)
• **Period 2:** 10:00 AM - 10:45 AM (45 mins · Morning Theory)
• ☕ **First Refreshment Break:** 10:45 AM - 11:00 AM (15 mins)
• **Period 3:** 11:00 AM - 11:45 AM (45 mins · Mid-Morning Core)
• **Period 4:** 11:45 AM - 12:30 PM (45 mins · Mid-Morning Core)

🍱 **Lunch Dining Break:** 12:30 PM - 01:20 PM (50 mins)

**Afternoon Academic Session:**
• **Period 5:** 01:20 PM - 02:05 PM (45 mins · Afternoon Theory / Lab)
• **Period 6:** 02:05 PM - 02:50 PM (45 mins · Afternoon Theory / Lab)
• 🍵 **Evening Tea Break:** 02:50 PM - 03:05 PM (15 mins)
• **Period 7:** 03:05 PM - 03:50 PM (45 mins · Soft Skills / Training)
• **Period 8:** 03:50 PM - 04:30 PM (40 mins · Aptitude / Mentorship)

🔬 **Laboratory Blocks:**
• **Forenoon Lab (FN):** 09:15 AM - 12:30 PM (Periods 1 to 4)
• **Afternoon Lab (AN):** 01:20 PM - 04:30 PM (Periods 5 to 8)`,
        suggestions: ['Labs for 2nd year?', 'Labs for 3rd year?', 'Attendance criteria?'],
      }
    }

    // -------------------------------------------------------------------------
    // 11. GENERAL / FUZZY DATABASE SEARCH
    // -------------------------------------------------------------------------
    const keywords = q.split(/\s+/).filter((w) => w.length > 2)
    if (keywords.length > 0) {
      const searchTerms = keywords.join(' ')

      const [matchedUsers, matchedAnnouncements, matchedEvents, matchedProjects] = await Promise.all([
        prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: searchTerms } },
              { email: { contains: searchTerms } },
            ],
          },
          take: 5,
        }).catch(() => []),
        prisma.announcement.findMany({
          where: {
            OR: [
              { title: { contains: searchTerms } },
              { content: { contains: searchTerms } },
            ],
          },
          take: 3,
        }).catch(() => []),
        prisma.event.findMany({
          where: {
            OR: [
              { name: { contains: searchTerms } },
              { description: { contains: searchTerms } },
            ],
          },
          take: 3,
        }).catch(() => []),
        prisma.project.findMany({
          where: {
            OR: [
              { title: { contains: searchTerms } },
              { domain: { contains: searchTerms } },
            ],
          },
          take: 3,
        }).catch(() => []),
      ])

      const searchResults: string[] = []

      if (matchedUsers.length > 0) {
        searchResults.push(`**Users & Directorate Matches:**\n` + matchedUsers.map((u) => `• **${u.name}** (${u.role.toUpperCase()}) — ${u.email}`).join('\n'))
      }
      if (matchedAnnouncements.length > 0) {
        searchResults.push(`**Circulars Matches:**\n` + matchedAnnouncements.map((a) => `• **${a.title}** (${a.category}) — ${a.content.slice(0, 100)}...`).join('\n'))
      }
      if (matchedEvents.length > 0) {
        searchResults.push(`**Events Matches:**\n` + matchedEvents.map((e) => `• **${e.name}** at ${e.venue} (${new Date(e.date).toLocaleDateString()})`).join('\n'))
      }
      if (matchedProjects.length > 0) {
        searchResults.push(`**Capstone Project Matches:**\n` + matchedProjects.map((p) => `• **${p.title}** (${p.domain}) — Status: ${p.status}`).join('\n'))
      }

      if (searchResults.length > 0) {
        return {
          answer: `🔍 **Live Database Search Results for "${rawQ}":**\n\n${searchResults.join('\n\n')}`,
          suggestions: ['Labs for 2nd year?', 'Faculty directorate?', 'Academic calendar?'],
        }
      }
    }

    // -------------------------------------------------------------------------
    // 12. ATTENDANCE REGULATIONS & POLICIES
    // -------------------------------------------------------------------------
    if (q.includes('attend') || q.includes('leave') || q.includes('od') || q.includes('condonation') || q.includes('percent')) {
      return {
        answer: `📋 **Institutional Attendance Regulations:**\n\n• **Mandatory Minimum Attendance:** 75% for Anna University & Autonomous Exam Eligibility\n• **Condonation Range:** 65% - 74% (Permitted only with valid medical proof & HOD approval)\n• **Daily Periods:** Attendance marked across 8 periods daily (FN & AN)\n• **Critical Shortage Alert:** Dispatched via In-App Bell and SMS when attendance drops below 75%\n• **On-Duty (OD):** Symposium and project OD requests can be submitted via student portal.`,
        suggestions: ['Daily bell timings?', 'Student dashboard?', 'Academic calendar?'],
      }
    }

    // -------------------------------------------------------------------------
    // 13. WORKING DAYS / ACADEMIC CALENDAR
    // -------------------------------------------------------------------------
    if (q.includes('calendar') || q.includes('working day') || q.includes('regulation') || q.includes('term')) {
      return {
        answer: `📅 **Academic Calendar & Working Days:**\n\n• **Academic Regulation:** Regulation 2021 (Autonomous)\n• **Active Term:** Even Semester (January - May 2026)\n• **Total Prescribed Working Days:** 90 Days Total\n• **Monthly Breakdown:** January (18 Days), February (20 Days), March (22 Days), April (20 Days), May (10 Days)\n• **Internal Assessments:** IAT-1 in February 2026, IAT-2 in April 2026\n• **University End-Semester Examinations:** May 2026`,
        suggestions: ['Attendance criteria?', 'Daily bell timings?', 'Labs for 2nd year?'],
      }
    }

    // -------------------------------------------------------------------------
    // 14. INSTITUTIONAL IDENTITY / ADDRESS / CONTACT
    // -------------------------------------------------------------------------
    if (q.includes('college') || q.includes('address') || q.includes('contact') || q.includes('phone') || q.includes('location') || q.includes('vsb')) {
      return {
        answer: `🏛️ **V.S.B. Engineering College (Autonomous)**\n\n• **Department:** Department of Artificial Intelligence & Data Science (AI & DS)\n• **Affiliation:** Anna University, Chennai | Approved by AICTE\n• **Accreditation:** NAAC 'A' Grade & NBA Tier-1 Accredited\n• **Location:** NH-67, Covai Road, Karur - 639 111, Tamil Nadu, India\n• **Administrative Contact:** admin@vsb.edu.in | +91 4324 290144`,
        suggestions: ['Who are the administrators?', 'Academic calendar?', 'Daily bell timings?'],
      }
    }
  } catch (err) {
    console.error('Error querying database for AI knowledge:', err)
  }

  // ---------------------------------------------------------------------------
  // 15. DEFAULT WELCOME / OVERVIEW
  // ---------------------------------------------------------------------------
  return {
    answer: `👋 Welcome to the **V.S.B. AI & DS Portal Assistant**!

I provide real-time information directly from the live institutional database:
• 🎓 **Live Student Records & Class Rosters**
• 👨‍🏫 **Faculty Directorate & Class Advisors**
• 👑 **Head of Department (HOD) Leadership**
• 📢 **Official Circulars & Broadcast Notices**
• 🔬 **8 Semesters Practical Laboratories & Timetables**
• ⏰ **8 Periods Daily Bell Timings (09:15 AM - 04:30 PM)**
• 📚 **Curricular Subjects & Syllabus (Regulation 2021)**
• 📅 **Events, Symposia & Academic Calendar**
• 📋 **Attendance Regulations (75% Minimum)**

How can I help you today?`,
    suggestions: ['Labs for 2nd year?', 'Labs for 3rd year?', 'Daily bell timings?', 'Academic calendar?'],
  }
}

// Store chat histories in memory
const chatHistories = new Map<string, Array<{ role: string; parts: Array<{ text: string }> }>>()

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const userIdentifier = session?.userId || session?.email || ''

    // Dual Rate Limit: 15 queries per minute per IP, 60 queries per hour per user
    const rateLimit = await checkRateLimit(request, 15, 60, 'ai:query', userIdentifier)
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit)
    }

    const rawBody = await request.json().catch(() => ({}))
    const validation = validateBody(aiQuerySchema, rawBody)
    if (!validation.success) {
      return validation.response
    }
    const { message, sessionId } = validation.data
    const query = message.trim()

    const apiKey = process.env.GEMINI_API_KEY

    // If no API key or local testing, use live dynamic database knowledge
    if (!apiKey || apiKey === 'your-gemini-api-key') {
      const result = await getDynamicKnowledgeBase(query, session)
      return NextResponse.json({ success: true, ...result, source: 'database-live' })
    }

    // Check hard monthly spending budget/quota before calling Google Gemini
    const quota = await checkApiUsageQuota('gemini_ai', 1)
    if (!quota.allowed) {
      return quotaExceededResponse('gemini_ai', quota.hardLimit, quota.period)
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const sid = sessionId || 'default'
      if (!chatHistories.has(sid)) {
        chatHistories.set(sid, [])
      }
      const history = chatHistories.get(sid)!

      const dbKnowledge = await getDynamicKnowledgeBase(query, session)

      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: 600,
          temperature: 0.7,
        },
      })

      const promptWithDb = `You are the official V.S.B. AI & DS Portal Assistant.
Accurate live institutional curriculum and database context:
${dbKnowledge.answer}

User question: ${query}
Please respond clearly and accurately using the live context provided.`

      const result = await chat.sendMessage(promptWithDb)
      const answer = result.response.text()

      history.push(
        { role: 'user', parts: [{ text: query }] },
        { role: 'model', parts: [{ text: answer }] }
      )
      if (history.length > 20) {
        history.splice(0, 2)
      }

      return NextResponse.json({
        success: true,
        answer,
        suggestions: dbKnowledge.suggestions,
        source: 'gemini',
      })
    } catch (aiError: any) {
      console.error('Gemini API error:', aiError?.message || aiError)
      const result = await getDynamicKnowledgeBase(query, session)
      return NextResponse.json({ success: true, ...result, source: 'database-live' })
    }
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json({
      success: false,
      answer: 'Sorry, I encountered an error. Please try again.',
      suggestions: ['Academic calendar?', 'Who are the administrators?'],
    })
  }
}

export async function GET(request: Request) {
  // Query Rate Limit: 30 searches per minute per IP
  const rateLimit = await checkRateLimit(request, 30, 60, 'ai:search')
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit)
  }

  try {
    const session = await getSession()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || searchParams.get('query') || ''

    const result = await getDynamicKnowledgeBase(query, session)
    return NextResponse.json({
      success: true,
      query,
      answer: result.answer,
      suggestions: result.suggestions,
      response: {
        answer: result.answer,
        suggestions: result.suggestions,
      },
      source: 'database-live',
    })
  } catch (error) {
    console.error('GET /api/ai error:', error)
    return NextResponse.json({
      success: true,
      response: {
        answer: 'Welcome to the V.S.B. AI & DS Portal Assistant! How can I assist you with portal features, courses, or academic details?',
        suggestions: ['Labs for 2nd year?', 'Labs for 3rd year?', 'Daily bell timings?'],
      },
    })
  }
}