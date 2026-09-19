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

  // Guard: Never treat OD / Leave / Permission application statement drafting as a syllabus query
  if (
    /on-duty|leave application|permission application|draft.*statement|academic application assistant|formal.*statement|reason for an on-duty|od application/i.test(rawQ) ||
    /leave.*statement|write.*statement|reason & academic explanation/i.test(rawQ)
  ) {
    return null
  }

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
      if (topicText.toLowerCase().includes('full unit scope')) {
        topicText = ''
      }
    }

    if (mark === 2) {
      const candidates = targetUnit.partA
      const blooms = ['K1 - Remembering', 'K2 - Understanding', 'K3 - Applying']
      const bloomLevel = blooms[Math.floor(Math.random() * blooms.length)]

      // Find matching by topic or randomly pick to ensure dynamic generation
      let chosen = candidates[Math.floor(Math.random() * candidates.length)] || candidates[0]
      if (topicText && topicText.length > 2) {
        const matches = candidates.filter(c => c.q.toLowerCase().includes(topicText.toLowerCase()) || c.a.toLowerCase().includes(topicText.toLowerCase()))
        if (matches.length > 0) {
          chosen = matches[Math.floor(Math.random() * matches.length)]
        }
      }

      const qText = `[Bloom's: ${bloomLevel} | CO${targetUnit.unitNo}] ${chosen.q}`
      const aText = `**Core Definition & Mathematical Formulation:**\n${chosen.a}\n\n` +
        `**Key Technical Standards:**\n` +
        `• Primary Principle: Formulated under Anna University R-2021 syllabus for ${targetSubject.code} (${targetSubject.name}).\n` +
        `• Critical Keywords: State spaces, asymptotic complexity, or mathematical criteria.\n\n` +
        `**Official Mark Allocation (2 Marks):**\n` +
        `• Exact Technical Definition / Equation: 1 Mark\n` +
        `• Core Terms / Asymptotic Boundary: 1 Mark`

      return {
        answer: `QUESTION: ${qText}\n\nANSWER: ${aText}`,
        suggestions: [
          `Generate Part B (8M) question for ${targetSubject.code} Unit ${targetUnit.unitNo}`,
          `Generate Part C (16M) question for ${targetSubject.code} Unit ${targetUnit.unitNo}`,
          `Smart revision notes for Unit ${targetUnit.unitNo}`,
        ],
      }
    } else if (mark === 8) {
      const candidates = targetUnit.partB
      const blooms = ['K3 - Applying', 'K4 - Analyzing', 'K2 - Understanding']
      const bloomLevel = blooms[Math.floor(Math.random() * blooms.length)]

      let chosen = candidates[Math.floor(Math.random() * candidates.length)] || candidates[0]
      if (topicText && topicText.length > 2) {
        const matches = candidates.filter(c => c.q.toLowerCase().includes(topicText.toLowerCase()) || c.a.toLowerCase().includes(topicText.toLowerCase()))
        if (matches.length > 0) {
          chosen = matches[Math.floor(Math.random() * matches.length)]
        }
      }

      const qText = `[Bloom's: ${bloomLevel} | CO${targetUnit.unitNo}] ${chosen.q}`
      const aText = `### 1. Conceptual Principle & Objective\n${chosen.a.split('\n\n')[0] || chosen.a}\n\n` +
        `### 2. Algorithmic Formulation & Derivations\n${chosen.a.split('\n\n').slice(1).join('\n\n') || chosen.a}\n\n` +
        `### 3. Official Anna University Mark Allocation Scheme (8 Marks)\n` +
        `• Mathematical Formulation / Algorithm Principle: 3 Marks\n` +
        `• Step-by-Step Derivation / Algorithmic Pseudocode: 3 Marks\n` +
        `• Illustrative Diagram / Numerical Trace: 2 Marks`

      return {
        answer: `QUESTION: ${qText}\n\nANSWER: ${aText}`,
        suggestions: [
          `Generate Part A (2M) question for ${targetSubject.code} Unit ${targetUnit.unitNo}`,
          `Generate Part C (16M) question for ${targetSubject.code} Unit ${targetUnit.unitNo}`,
          `Diagnostic Quiz for Unit ${targetUnit.unitNo}`,
        ],
      }
    } else {
      const candidates = targetUnit.partC
      const blooms = ['K5 - Evaluating', 'K6 - Creating', 'K4 - Analyzing']
      const bloomLevel = blooms[Math.floor(Math.random() * blooms.length)]

      let chosen = candidates[Math.floor(Math.random() * candidates.length)] || candidates[0]
      if (topicText && topicText.length > 2) {
        const matches = candidates.filter(c => c.q.toLowerCase().includes(topicText.toLowerCase()) || c.a.toLowerCase().includes(topicText.toLowerCase()))
        if (matches.length > 0) {
          chosen = matches[Math.floor(Math.random() * matches.length)]
        }
      }

      const qText = `[Bloom's: ${bloomLevel} | CO${targetUnit.unitNo}] ${chosen.q}`
      const aText = `### 1. Comprehensive System Overview & Problem Formulation\n${chosen.a.split('\n\n')[0] || chosen.a}\n\n` +
        `### 2. Architectural Design, Mathematical Derivations & Data-Flow\n${chosen.a.split('\n\n').slice(1).join('\n\n') || chosen.a}\n\n` +
        `### 3. Official Anna University Comprehensive Mark Allocation Scheme (16 Marks)\n` +
        `• Architecture & Problem Formulation: 6 Marks\n` +
        `• Rigorous Mathematical Derivations & Algorithmic Proof: 6 Marks\n` +
        `• Comparative Evaluation Matrix & Step-by-Step Numerical Walkthrough: 4 Marks`

      return {
        answer: `QUESTION: ${qText}\n\nANSWER: ${aText}`,
        suggestions: [
          `Generate Part A (2M) question for ${targetSubject.code} Unit ${targetUnit.unitNo}`,
          `Generate Part B (8M) question for ${targetSubject.code} Unit ${targetUnit.unitNo}`,
          `Smart revision notes for Unit ${targetUnit.unitNo}`,
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


// =============================================================================
// AGENT: OD & LEAVE REASON AUTONOMOUS AGENT
// =============================================================================
async function executeOdLeaveReasonAgent(
  rawQ: string,
  context?: any,
  activeApiKey?: string
): Promise<{ answer: string; suggestions: string[] }> {
  const combined = `${rawQ} ${context?.category || ''}`.toLowerCase()

  let type = 'od'
  if (/personal|family|emergency/i.test(combined)) {
    type = 'personal'
  } else if (/medical|sick|health|hospital|doctor/i.test(combined)) {
    type = 'medical'
  } else if (/internship|project|training|corporate/i.test(combined)) {
    type = 'internship'
  } else if (/sports|cultural|tournament|match|zonal/i.test(combined)) {
    type = 'sports'
  } else if (/paper|presentation|symposium|conference|research/i.test(combined)) {
    type = 'symposium'
  } else if (/hackathon|coding|contest|challenge/i.test(combined)) {
    type = 'hackathon'
  }

  // Extract dates
  let dates =
    context?.fromDate && context?.toDate
      ? `from ${context.fromDate} to ${context.toDate}`
      : context?.fromDate
      ? `on ${context.fromDate}`
      : ''
  if (!dates) {
    const dateMatch = rawQ.match(/dates?:\s*([^\n\r]+)/i)
    dates = dateMatch ? dateMatch[1].trim() : 'for the scheduled duration'
  }

  // Extract event name & organizer
  const eventName =
    context?.eventName ||
    rawQ.match(/event(?:\/activity)?(?:\s*name)?:\s*([^\n\r]+)/i)?.[1]?.trim() ||
    'the scheduled academic event'
  const organizer =
    context?.organizer ||
    rawQ.match(/host(?:\/organizer)?:\s*([^\n\r]+)/i)?.[1]?.trim() ||
    'the host institution'

  // Autonomous fallback answer generator
  let baseStatement = ''
  if (type === 'personal') {
    baseStatement = `I am requesting formal personal leave ${dates} due to essential family commitments. I will ensure all missed lecture notes, laboratory coursework, and continuous assessment tasks are fully completed upon my return to college.`
  } else if (type === 'medical') {
    baseStatement = `I am requesting formal medical leave ${dates} on healthcare grounds under medical consultation and rest. I will submit the authentic medical fitness certificate and catch up on all academic sessions immediately upon resumption.`
  } else if (type === 'internship') {
    baseStatement = `I am requesting official On-Duty permission to attend the industrial internship and practical project training at ${organizer} ${dates}. This applied industrial training directly strengthens my domain competencies in Artificial Intelligence and Data Science while fulfilling curricular project requirements.`
  } else if (type === 'sports') {
    baseStatement = `I am requesting official On-Duty permission to represent V.S.B. Engineering College in ${eventName} organized by ${organizer} ${dates}. I will uphold the sporting prestige of our institution and diligently make up for all academic classes missed during this period.`
  } else if (type === 'symposium') {
    baseStatement = `I am requesting official On-Duty permission to present our research paper and participate in ${eventName} hosted by ${organizer} ${dates}. This academic presentation allows our department to showcase institutional research innovation and interact with domain experts.`
  } else {
    // Hackathon or general OD
    baseStatement = `I am requesting official On-Duty permission to participate in ${eventName} organized by ${organizer} ${dates}. This competitive challenge provides practical problem-solving experience and allows our team to represent V.S.B. Engineering College with distinction.`
  }

  // If live Gemini is active, let it refine the statement while enforcing strict institutional policy
  if (activeApiKey && activeApiKey !== 'your-gemini-api-key') {
    try {
      const genAI = new GoogleGenerativeAI(activeApiKey)
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: `You are the official Academic Administrative Agent for V.S.B. Engineering College (Department of Artificial Intelligence & Data Science).
Draft exactly 2 formal, polite, and persuasive sentences suitable as the official reason for a college student's application.
Strict Rules:
1. Exactly 2 sentences.
2. Formal, respectful academic English.
3. Absolutely NO markdown headings, NO bullet points, NO asterisks, NO quotes, NO syllabus notes, NO emojis, NO Privacy Notice.
4. Output ONLY the 2 sentences.`,
      })

      const agentPrompt = `Draft formal application reason for student application.
Category: ${type}
Dates: ${dates}
Event: ${eventName}
Host: ${organizer}
Base reason draft: ${baseStatement}
Return only 2 formal sentences.`

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: agentPrompt }] }],
        generationConfig: { maxOutputTokens: 250, temperature: 0.5 },
      })
      const text = result.response.text()?.trim()
      if (
        text &&
        text.length > 20 &&
        !text.includes('Anna University') &&
        !text.includes('Privacy Notice') &&
        !text.includes('Student Directory')
      ) {
        baseStatement = text.replace(/^["'`]+|["'`]+$/g, '').replace(/[*#_~`]+/g, '').trim()
      }
    } catch (e: any) {
      console.warn('Gemini OD statement drafting agent fallback to deterministic generator:', e?.message)
    }
  }

  return {
    answer: baseStatement,
    suggestions: [
      'Submit application',
      'Attach supporting proofs',
      'View approval status',
    ],
  }
}

function handleOdLeaveStatement(rawQ: string): { answer: string; suggestions: string[] } {
  const q = rawQ.toLowerCase()

  let type = 'od'
  if (/personal|family/i.test(q)) {
    type = 'personal'
  } else if (/medical/i.test(q)) {
    type = 'medical'
  } else if (/internship|project/i.test(q)) {
    type = 'internship'
  } else if (/sports|cultural/i.test(q)) {
    type = 'sports'
  } else if (/paper|presentation|symposium|conference/i.test(q)) {
    type = 'symposium'
  } else if (/hackathon|coding|contest|challenge/i.test(q)) {
    type = 'hackathon'
  }

  const dateMatch = rawQ.match(/dates?:\s*([^\n\r]+)/i)
  const dates = dateMatch ? dateMatch[1].trim() : 'the scheduled dates'

  const eventMatch = rawQ.match(/event(?:\/activity)?(?:\s*name)?:\s*([^\n\r]+)/i)
  const eventName = eventMatch ? eventMatch[1].trim() : 'the designated event'

  const orgMatch = rawQ.match(/host(?:\/organizer)?:\s*([^\n\r]+)/i)
  const organizer = orgMatch ? orgMatch[1].trim() : 'the host institution'

  let answer = ''
  if (type === 'personal') {
    answer = `I am requesting formal personal leave for ${dates} due to essential family commitments. I will ensure all missed academic coursework and lab assignments are completed promptly upon returning to college.`
  } else if (type === 'medical') {
    answer = `I am requesting formal medical leave for ${dates} on health grounds under medical consultation and rest. I will submit the requisite medical fitness certificate and catch up on all academic sessions immediately upon resumption.`
  } else if (type === 'internship') {
    answer = `I am requesting official On-Duty permission to attend the industry internship and practical training at ${organizer} during ${dates}. This applied industrial training directly strengthens my domain competencies in Artificial Intelligence and Data Science while fulfilling curricular project requirements.`
  } else if (type === 'sports') {
    answer = `I am requesting official On-Duty permission to represent V.S.B. Engineering College in ${eventName} organized by ${organizer} during ${dates}. I will uphold the sporting prestige of our institution and diligently make up for all academic classes missed during the event.`
  } else if (type === 'symposium') {
    answer = `I am requesting official On-Duty permission to present our research paper and participate in ${eventName} hosted by ${organizer} during ${dates}. This academic presentation allows us to represent our department, showcase institutional innovation, and interact with subject matter experts.`
  } else {
    answer = `I am requesting official On-Duty permission to participate in ${eventName} organized by ${organizer} during ${dates}. This competitive challenge provides practical problem-solving experience and allows our team to represent V.S.B. Engineering College with distinction.`
  }

  return {
    answer,
    suggestions: [
      'Refine statement',
      'Add team details',
      'Submit application',
    ],
  }
}

async function getDynamicKnowledgeBase(query: string, session?: any): Promise<{ answer: string; suggestions: string[] }> {
  const rawQ = query.trim()
  const q = rawQ.toLowerCase()

  // ---------------------------------------------------------------------------
  // 0A. OD & LEAVE APPLICATION FORMAL STATEMENT AGENT (TOP PRIORITY FOR PERMISSIONS)
  // ---------------------------------------------------------------------------
  if (
    /on-duty|leave|permission|od\b/i.test(rawQ) &&
    (/statement|reason|draft|application|institutional/i.test(rawQ) || /personal|medical|internship|sports|symposium|hackathon/i.test(rawQ))
  ) {
    return handleOdLeaveStatement(rawQ)
  }

  // ---------------------------------------------------------------------------
  // 0B. ANNA UNIVERSITY R-2021 ACADEMIC INTELLIGENCE ENGINE
  // ---------------------------------------------------------------------------
  const academicCurriculum = handleAcademicCurriculumQuery(rawQ)
  if (academicCurriculum) {
    return academicCurriculum
  }

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
    if (
      /\b(attendance|attending|absent|present|condonation|minimum attendance)\b/i.test(q) ||
      /\b(on-duty|on duty)\b/i.test(q) ||
      /\b(leave|leaves|od request|apply od)\b/i.test(q)
    ) {
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

    const clientKey = validation.data.apiKey || request.headers.get('x-gemini-key')
    const activeApiKey = clientKey || process.env.GEMINI_API_KEY

    // Live verification ping
    if (query === 'PING_GEMINI_KEY') {
      if (!activeApiKey || activeApiKey === 'your-gemini-api-key') {
        return NextResponse.json({ success: false, message: 'No active Gemini API key configured.' })
      }
      try {
        const testGenAI = new GoogleGenerativeAI(activeApiKey)
        const testModel = testGenAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        await testModel.generateContent('Hi')
        return NextResponse.json({ success: true, message: 'Google Gemini API connection verified!' })
      } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message || 'Invalid Gemini API key.' })
      }
    }

    // =========================================================================
    // DEDICATED AUTONOMOUS AGENT: OD & LEAVE REASON APPLICATION DRAFTER
    // =========================================================================
    const isOdAgent =
      sessionId === 'od-statement-agent' ||
      validation.data.agent === 'od-reason-agent' ||
      validation.data.agent === 'od-permission-agent' ||
      /on-duty|leave application|permission application|od application/i.test(query) ||
      (/leave|permission|on-duty|od\b/i.test(query) && /draft|reason|statement|institutional/i.test(query))

    if (isOdAgent) {
      const agentResult = await executeOdLeaveReasonAgent(query, validation.data.context, activeApiKey)
      return NextResponse.json({
        success: true,
        answer: agentResult.answer,
        suggestions: agentResult.suggestions,
        agent: 'od-reason-agent',
        source: activeApiKey ? 'gemini-agent' : 'autonomous-agent',
      })
    }

    // Try live Google Gemini API if key is present
    if (activeApiKey && activeApiKey !== 'your-gemini-api-key') {
      try {
        const genAI = new GoogleGenerativeAI(activeApiKey)
        const modelNames = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-pro']
        let generatedText = ''
        let modelUsed = ''

        const isQuestionGen = /chief examiner|format:\s*part|generate an authentic university exam question|question generator/i.test(query)
        const isOdDrafting = sessionId === 'od-statement-agent' || /on-duty|leave application|permission application|draft.*statement|academic application assistant|formal.*statement|reason for an on-duty/i.test(query)
        const dbKnowledge = await getDynamicKnowledgeBase(query, session)

        const systemInstructions = isQuestionGen
          ? `You are an Anna University R-2021 Chief Examiner and Distinguished Professor in Artificial Intelligence and Data Science.
Your objective is to generate an authentic, rigorous, university-level examination question and comprehensive model answer with exact marks distribution.

Requirements:
1. BLOOM'S TAXONOMY: Include designated level (e.g. K1-Remembering, K2-Understanding, K3-Applying, K4-Analyzing, K5-Evaluating, K6-Creating) and Course Outcome (e.g. CO1, CO2, CO3).
2. QUESTION TEXT: Phrased in authentic Anna University exam language.
3. MODEL ANSWER:
   - Clear technical definitions and mathematical equations.
   - Algorithmic pseudocode or ASCII architectural diagrams if applicable.
   - Detailed, step-by-step points.
   - Mark Scheme Allocation breakdown.

Format your output strictly as:
QUESTION: [Question with Bloom's level and CO]
ANSWER: [Comprehensive model answer with derivations, diagrams/pseudocode, and mark distribution]`
          : isOdDrafting
          ? `You are the official academic administrative assistant at V.S.B. Engineering College.
Your objective is to draft exactly 2 formal, polite, and respectful sentences suitable as the official reason in a college student's leave or On-Duty (OD) application.
Rules:
1. Output exactly 2 sentences.
2. Formal, respectful academic English.
3. Absolutely NO markdown headings, NO bullet points, NO asterisks, NO quotes, NO syllabus notes.
4. Output ONLY the 2 sentences.`
          : `You are the official V.S.B. AI & DS Portal Academic Assistant powered by Google Gemini.
Verified Institutional & Curricular Context:
${dbKnowledge.answer}

Answer the student or faculty query with high academic rigor, clear headings, derivations, and code blocks where applicable.`

        for (const mName of modelNames) {
          try {
            const m = genAI.getGenerativeModel({
              model: mName,
              systemInstruction: systemInstructions,
            })

            const result = await m.generateContent({
              contents: [{ role: 'user', parts: [{ text: query }] }],
              generationConfig: {
                maxOutputTokens: 2500,
                temperature: 0.7,
              },
            })

            generatedText = result.response.text()
            modelUsed = mName
            break
          } catch (modelErr: any) {
            console.warn(`Model ${mName} failed, trying next fallback...`, modelErr?.message)
          }
        }

        if (generatedText && generatedText.trim().length > 15) {
          let cleanAnswer = generatedText.trim()
          if (isOdDrafting) {
            cleanAnswer = cleanAnswer
              .replace(/^["'`]+|["'`]+$/g, '')
              .replace(/[*#_~`]+/g, '')
              .trim()
          }
          return NextResponse.json({
            success: true,
            answer: cleanAnswer,
            suggestions: dbKnowledge.suggestions,
            source: 'gemini-live',
            model: modelUsed,
          })
        }
      } catch (geminiError: any) {
        console.warn('Live Gemini failed, activating Autonomous Generative Engine:', geminiError?.message)
      }
    }

    // High-fidelity Autonomous Generative Engine (Anna University R-2021)
    const isQuestionGenQuery = /chief examiner|format:\s*part|generate an authentic university exam question|question generator/i.test(query)
    if (isQuestionGenQuery) {
      const academicResp = handleAcademicCurriculumQuery(query)
      if (academicResp) {
        return NextResponse.json({
          success: true,
          ...academicResp,
          source: 'academic-curriculum-engine',
        })
      }
    }

    const result = await getDynamicKnowledgeBase(query, session)
    return NextResponse.json({
      success: true,
      ...result,
      source: 'gemini-autonomous-engine',
    })
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