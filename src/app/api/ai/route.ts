import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'

// Dynamic Knowledge Base Query Engine using real database records
async function getDynamicKnowledgeBase(query: string): Promise<{ answer: string; suggestions: string[] }> {
  const q = query.toLowerCase().trim()

  try {
    // 1. Subjects / Courses / Syllabus
    if (q.includes('subject') || q.includes('course') || q.includes('syllabus') || q.includes('curriculum')) {
      const subjects = await prisma.subject.findMany({
        take: 20,
        orderBy: { code: 'asc' },
      })

      if (subjects.length === 0) {
        return {
          answer: `📚 Academic Subjects Catalog:\n\nThere are currently **0 active curricular subjects** registered in the database catalog.\n\nAdministrators and faculty can add new academic courses under the **Academics & Courses** portal section.`,
          suggestions: ['Faculty details?', 'Academic calendar?', 'Portal settings?'],
        }
      }

      const list = subjects
        .map((s) => `• **${s.code}** - ${s.name} (${s.credits} Credits)`)
        .join('\n')

      return {
        answer: `📚 Core Academic Subjects (${subjects.length} registered):\n\n${list}\n\nYou can download complete course packs and syllabi under **Study Details**!`,
        suggestions: ['Faculty details?', 'Question papers?', 'Study resources?'],
      }
    }

    // 2. Faculty / Teachers / Directorate
    if (q.includes('faculty') || q.includes('teacher') || q.includes('professor') || q.includes('mentor') || q.includes('advisor')) {
      const facultyMembers = await prisma.faculty.findMany({
        take: 20,
      })
      const facultyUsers = await prisma.user.findMany({
        where: { role: 'faculty' },
        select: { name: true, email: true, phone: true },
      })

      if (facultyMembers.length === 0 && facultyUsers.length === 0) {
        return {
          answer: `👨‍🏫 Faculty Directorate:\n\nThere are currently **0 faculty members** registered in the directorate database.\n\nNew faculty profiles can be enrolled and assigned under **Faculty Directorate**.`,
          suggestions: ['Who are the administrators?', 'HOD leadership?', 'Academic calendar?'],
        }
      }

      const list = (facultyUsers.length > 0 ? facultyUsers : facultyMembers)
        .map((f: any) => `• **${f.name || 'Faculty Member'}** - ${f.designation || 'Faculty'} (${f.email || 'Dept of AI & DS'})`)
        .join('\n')

      return {
        answer: `👨‍🏫 AI & DS Department Faculty Directorate:\n\n${list}\n\nConnect directly with staff via the **Faculty Directorate** directory!`,
        suggestions: ['HOD leadership?', 'Subjects offered?', 'Office hours?'],
      }
    }

    // 3. HOD / Leadership
    if (q.includes('hod') || q.includes('head') || q.includes('leadership') || q.includes('department head')) {
      const hodUsers = await prisma.user.findMany({
        where: { role: 'hod' },
        select: { name: true, email: true, phone: true },
      })

      if (hodUsers.length === 0) {
        return {
          answer: `🏛️ HOD Leadership:\n\nNo Department HOD profile is currently registered in the database.\n\nHOD leadership roles can be designated under **HOD Leadership**.`,
          suggestions: ['Who are the administrators?', 'Faculty directorate?', 'Academic calendar?'],
        }
      }

      const list = hodUsers
        .map((h) => `• **${h.name}** - Head of Department (${h.email})`)
        .join('\n')

      return {
        answer: `🏛️ Department Leadership:\n\n${list}\n\nOffice: Main Administrative Block - AI & DS Department`,
        suggestions: ['Faculty directorate?', 'Who are the administrators?', 'Academic calendar?'],
      }
    }

    // 4. Administrators / Governance
    if (q.includes('admin') || q.includes('administrator') || q.includes('super admin') || q.includes('governance')) {
      const adminUsers = await prisma.user.findMany({
        where: { role: 'admin' },
        select: { name: true, email: true },
      })

      const list = adminUsers
        .map((a) => `• **${a.name}** (${a.email}) - Tier-0 Root Super Administrator`)
        .join('\n')

      return {
        answer: `🛡️ Portal Governance & Administration:\n\n${list || '• System Administrator (Tier-0 Super Admin)'}\n\nSuper Admin controls system settings, database management, and role-based permissions under **System Settings**.`,
        suggestions: ['System settings?', 'Faculty directorate?', 'Academic calendar?'],
      }
    }

    // 5. Events / Hackathons / Symposia
    if (q.includes('event') || q.includes('hackathon') || q.includes('workshop') || q.includes('symposium') || q.includes('seminar')) {
      const events = await prisma.event.findMany({
        take: 10,
        orderBy: { date: 'asc' },
      })

      if (events.length === 0) {
        return {
          answer: `📅 Events & Symposia:\n\nThere are currently **no upcoming events or symposia scheduled** in the portal database.\n\nFaculty and coordinators can schedule new events under **Events & Symposia**.`,
          suggestions: ['Academic calendar?', 'Student projects?', 'Study resources?'],
        }
      }

      const list = events
        .map((e) => `• **${e.name}** (${new Date(e.date).toLocaleDateString()}) - ${e.venue}`)
        .join('\n')

      return {
        answer: `📅 Scheduled Department Events:\n\n${list}\n\nStudents can register directly under the **Events & Symposia** tab!`,
        suggestions: ['How to register?', 'Student projects?', 'Academic calendar?'],
      }
    }

    // 6. Projects / Capstone Repositories
    if (q.includes('project') || q.includes('capstone') || q.includes('mini project') || q.includes('research')) {
      const projects = await prisma.project.findMany({
        take: 10,
      })

      if (projects.length === 0) {
        return {
          answer: `🚀 Capstone Projects Repository:\n\nThere are currently **0 student capstone projects** published in the database.\n\nStudents and faculty guides can submit proposals and code repositories under **Capstone Projects**.`,
          suggestions: ['Submit a project?', 'Faculty directorate?', 'Study resources?'],
        }
      }

      const list = projects
        .map((p) => `• **${p.title}** (${p.domain}) - Status: ${p.status}`)
        .join('\n')

      return {
        answer: `🚀 Department Capstone Projects:\n\n${list}\n\nExplore project documentation and source code under **Capstone Projects**!`,
        suggestions: ['Submit proposal?', 'Faculty guides?', 'Study resources?'],
      }
    }

    // 7. Question Papers / Past Papers / IAT
    if (q.includes('question') || q.includes('paper') || q.includes('exam') || q.includes('iat') || q.includes('test')) {
      const papers = await prisma.questionPaper.findMany({
        take: 10,
      })

      if (papers.length === 0) {
        return {
          answer: `📝 Examination Question Papers:\n\nThere are currently **0 question paper archives** uploaded in the database.\n\nFaculty can upload verified IAT-1, IAT-2, Model Exam, and Anna University question banks under **Question Papers**.`,
          suggestions: ['Academic calendar?', 'Study resources?', 'Attendance criteria?'],
        }
      }

      const list = papers
        .map((p) => `• **${p.fileName}** (${p.examType} - Year ${p.year})`)
        .join('\n')

      return {
        answer: `📝 Question Paper Archives:\n\n${list}\n\nDownload full question sets under **Question Papers**!`,
        suggestions: ['Study resources?', 'Academic calendar?', 'Subjects offered?'],
      }
    }

    // 8. Study Resources / Notes / Books
    if (q.includes('resource') || q.includes('book') || q.includes('note') || q.includes('download') || q.includes('pdf') || q.includes('material')) {
      const resources = await prisma.resource.findMany({
        take: 10,
      })

      if (resources.length === 0) {
        return {
          answer: `📚 Digital Study Resources:\n\nThere are currently **0 study resources or textbooks** uploaded in the database.\n\nLecture notes, question banks, and reference materials can be uploaded under **Study Resources**.`,
          suggestions: ['Question papers?', 'Academic calendar?', 'Subjects offered?'],
        }
      }

      const list = resources
        .map((r) => `• **${r.name}** (${r.fileType})`)
        .join('\n')

      return {
        answer: `📚 Available Study Resources:\n\n${list}\n\n1-click downloads are available under **Study Resources**!`,
        suggestions: ['Question papers?', 'Academic calendar?', 'Subjects offered?'],
      }
    }

    // 9. Attendance Regulations & Policies
    if (q.includes('attend') || q.includes('leave') || q.includes('od') || q.includes('condonation') || q.includes('percent')) {
      return {
        answer: `📋 Institutional Attendance Regulations:\n\n• **Mandatory Minimum Attendance:** 75% for Anna University & Autonomous Exam Eligibility\n• **Condonation Range:** 65% - 74% (Permitted only with medical certificate & HOD sanction)\n• **Critical Shortage Alert:** Dispatched via In-App Bell and SMS when attendance drops below 75%\n• **On-Duty (OD):** Symposium and medical OD requests can be submitted under student portal for advisor sanction.`,
        suggestions: ['Working days breakdown?', 'Student dashboard?', 'Academic calendar?'],
      }
    }

    // 10. Working Days / Academic Calendar / Regulation
    if (q.includes('calendar') || q.includes('working day') || q.includes('regulation') || q.includes('semester') || q.includes('term')) {
      return {
        answer: `📅 Academic Calendar & Working Days:\n\n• **Academic Regulation:** Regulation 2021 (Autonomous)\n• **Active Term:** Even Semester (January - May 2026)\n• **Total Prescribed Working Days:** 90 Days Total\n• **Monthly Breakdown:** January (18 Days), February (20 Days), March (22 Days), April (20 Days), May (10 Days)\n• **Internal Assessments:** IAT-1 in February 2026, IAT-2 in April 2026\n• **University End-Semester Examinations:** May 2026`,
        suggestions: ['Attendance criteria?', 'System settings?', 'Who are the administrators?'],
      }
    }

    // 11. Institutional Identity / Address / Contact
    if (q.includes('college') || q.includes('address') || q.includes('contact') || q.includes('phone') || q.includes('email') || q.includes('location') || q.includes('vsb')) {
      return {
        answer: `🏛️ **V.S.B. Engineering College (Autonomous)**\n\n• **Department:** Department of Artificial Intelligence & Data Science (AI & DS)\n• **Affiliation:** Anna University, Chennai | Approved by AICTE\n• **Accreditation:** NAAC 'A' Grade & NBA Tier-1 Accredited\n• **Location:** NH-67, Covai Road, Karur - 639 111, Tamil Nadu, India\n• **Administrative Contact:** admin@vsb.edu.in | +91 4324 290144`,
        suggestions: ['Who are the administrators?', 'Academic calendar?', 'Attendance criteria?'],
      }
    }
  } catch (err) {
    console.error('Error querying database for AI knowledge:', err)
  }

  // 12. Default Welcome / Overview
  return {
    answer: `👋 Welcome to the **V.S.B. AI & DS Portal Assistant**!\n\nI provide real-time information directly from the live institutional database:\n• 📚 Curricular Subjects & Syllabus\n• 👨‍🏫 Faculty Directorate & HOD Leadership\n• 📅 Events, Symposia & Academic Calendar\n• 📝 IAT & Semester Question Papers\n• 🚀 Capstone Projects & Research\n• 📋 Attendance Regulations (75% Minimum)\n• 🏛️ Institutional Profile & Accreditation\n\nHow can I help you today?`,
    suggestions: ['Academic calendar?', 'Who are the administrators?', 'Attendance criteria?', 'Institutional contact?'],
  }
}

// Store chat histories in memory
const chatHistories = new Map<string, Array<{ role: string; parts: Array<{ text: string }> }>>()

export async function POST(request: Request) {
  try {
    const { message, sessionId } = await request.json()
    const query = (message || '').trim()

    if (!query) {
      return NextResponse.json({ success: false, answer: 'Please type a message.' })
    }

    const apiKey = process.env.GEMINI_API_KEY

    // If no API key or local testing, use live dynamic database knowledge
    if (!apiKey || apiKey === 'your-gemini-api-key') {
      const result = await getDynamicKnowledgeBase(query)
      return NextResponse.json({ success: true, ...result, source: 'database-live' })
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const sid = sessionId || 'default'
      if (!chatHistories.has(sid)) {
        chatHistories.set(sid, [])
      }
      const history = chatHistories.get(sid)!

      const dbKnowledge = await getDynamicKnowledgeBase(query)

      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      })

      const promptWithDb = `You are the official V.S.B. AI & DS Portal Assistant.
Accurate live database context:
${dbKnowledge.answer}

User question: ${query}
Please respond clearly and accurately using the live context.`

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
        source: 'gemini'
      })
    } catch (aiError: any) {
      console.error('Gemini API error:', aiError?.message || aiError)
      const result = await getDynamicKnowledgeBase(query)
      return NextResponse.json({ success: true, ...result, source: 'database-live' })
    }
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json({
      success: false,
      answer: 'Sorry, I encountered an error. Please try again.',
      suggestions: ['Academic calendar?', 'Who are the administrators?']
    })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || searchParams.get('query') || ''

    const result = await getDynamicKnowledgeBase(query)
    return NextResponse.json({
      success: true,
      query,
      answer: result.answer,
      suggestions: result.suggestions,
      response: {
        answer: result.answer,
        suggestions: result.suggestions
      },
      source: 'database-live'
    })
  } catch (error) {
    console.error('GET /api/ai error:', error)
    return NextResponse.json({
      success: true,
      response: {
        answer: 'Welcome to the V.S.B. AI & DS Portal Assistant! How can I assist you with portal features, courses, or academic details?',
        suggestions: ['Academic calendar & working days', 'Curricular subjects catalog', 'Faculty directorate']
      }
    })
  }
}

