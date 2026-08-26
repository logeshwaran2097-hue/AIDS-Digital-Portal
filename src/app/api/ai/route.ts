import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'

export const ALL_SEMESTERS_LABS = {
  1: [
    { code: 'GE2111', name: 'Problem Solving and Python Programming Laboratory', session: 'AN (01:20 PM - 04:30 PM)', year: 1, sem: 1 },
    { code: 'BS2112', name: 'Physics and Chemistry Laboratory', session: 'FN (09:15 AM - 12:30 PM)', year: 1, sem: 1 },
    { code: 'GE2113', name: 'Engineering Graphics & CAD Laboratory', session: 'AN (01:20 PM - 04:30 PM)', year: 1, sem: 1 },
  ],
  2: [
    { code: 'CS2211', name: 'C Programming and Data Structures Laboratory', session: 'FN (09:15 AM - 12:30 PM)', year: 1, sem: 2 },
    { code: 'EE2212', name: 'Basic Electrical & Electronics Engineering Laboratory', session: 'AN (01:20 PM - 04:30 PM)', year: 1, sem: 2 },
    { code: 'GE2213', name: 'Workshop Practice Laboratory', session: 'AN (01:20 PM - 04:30 PM)', year: 1, sem: 2 },
  ],
  3: [
    { code: 'AD2311', name: 'Object Oriented Programming Laboratory', session: 'AN (01:20 PM - 04:30 PM)', year: 2, sem: 3 },
    { code: 'AD2312', name: 'Database Management Systems Laboratory', session: 'FN (09:15 AM - 12:30 PM)', year: 2, sem: 3 },
    { code: 'AD2313', name: 'Data Structures and Algorithms Laboratory', session: 'AN (01:20 PM - 04:30 PM)', year: 2, sem: 3 },
  ],
  4: [
    { code: 'AD2411', name: 'Machine Learning Laboratory', session: 'FN (09:15 AM - 12:30 PM)', year: 2, sem: 4 },
    { code: 'AD2412', name: 'Operating Systems Laboratory', session: 'AN (01:20 PM - 04:30 PM)', year: 2, sem: 4 },
    { code: 'AD2413', name: 'Java & Web Technologies Laboratory', session: 'AN (01:20 PM - 04:30 PM)', year: 2, sem: 4 },
  ],
  5: [
    { code: 'AD2511', name: 'Cloud Services & Management Laboratory', session: 'FN (09:15 AM - 12:30 PM)', year: 3, sem: 5 },
    { code: 'AD2512', name: 'Big Data Analytics Laboratory', session: 'AN (01:20 PM - 04:30 PM)', year: 3, sem: 5 },
    { code: 'AD2513', name: 'Deep Learning Laboratory', session: 'AN (01:20 PM - 04:30 PM)', year: 3, sem: 5 },
    { code: 'AD2514', name: 'Business Analytics Laboratory', session: 'FN (09:15 AM - 12:30 PM)', year: 3, sem: 5 },
    { code: 'AD2515', name: 'Communication Training', session: 'Period 7 & 8 (03:05 PM - 04:30 PM)', year: 3, sem: 5 },
    { code: 'AD2516', name: 'Aptitude & Soft Skills Training', session: 'Period 7 & 8 (03:05 PM - 04:30 PM)', year: 3, sem: 5 },
    { code: 'AD2517', name: 'Web Development Laboratory', session: 'AN (01:20 PM - 04:30 PM)', year: 3, sem: 5 },
  ],
  6: [
    { code: 'AD2611', name: 'Natural Language Processing Laboratory', session: 'FN (09:15 AM - 12:30 PM)', year: 3, sem: 6 },
    { code: 'AD2612', name: 'Computer Vision & Image Processing Laboratory', session: 'AN (01:20 PM - 04:30 PM)', year: 3, sem: 6 },
    { code: 'AD2613', name: 'Mobile Application Development Laboratory', session: 'AN (01:20 PM - 04:30 PM)', year: 3, sem: 6 },
    { code: 'AD2614', name: 'Mini Project & Product Development', session: 'FN & AN Full Day Block', year: 3, sem: 6 },
  ],
  7: [
    { code: 'AD2711', name: 'Project Work Phase I (Capstone Research)', session: 'Full Day Lab Block', year: 4, sem: 7 },
    { code: 'AD2712', name: 'Placement and Training (Corporate Readiness)', session: 'AN (01:20 PM - 04:30 PM)', year: 4, sem: 7 },
  ],
  8: [
    { code: 'AD2811', name: 'Project Work Phase II (Capstone Final Implementation)', session: 'Dedicated Project Block', year: 4, sem: 8 },
    { code: 'AD2812', name: 'Industrial Internship & Comprehensive Viva', session: 'Industry / Autonomous Evaluation', year: 4, sem: 8 },
  ],
}

// Universal Real-Time Database Query Engine
async function getDynamicKnowledgeBase(query: string): Promise<{ answer: string; suggestions: string[] }> {
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
            `• **${u?.name || 'Prof. Dr. V. Sundar'}** (${h.facultyId})\n  - **Designation:** ${h.designation}\n  - **Qualification:** ${h.qualification} (${h.experience} Years Exp)\n  - **Department:** ${h.department}\n  - **Email:** ${u?.email || 'hod.ai@vsb.edu.in'}\n  - **Phone:** ${u?.phone || '+91 94431 87654'}`
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
    // 9. SPECIFIC LABS / PRACTICALS (2nd Year, 3rd Year, 4th Year, 1st Year, All Semesters)
    // -------------------------------------------------------------------------
    const isLabQuery = q.includes('lab') || q.includes('practical') || q.includes('workshop') || q.includes('training')

    if (isLabQuery) {
      // 2nd Year / Sem 3 & 4
      if (q.includes('2nd') || q.includes('2') || q.includes('second') || q.includes('sophomore') || q.includes('sem 3') || q.includes('sem 4') || q.includes('semester 3') || q.includes('semester 4')) {
        return {
          answer: `🔬 **Official Laboratories for 2nd Year (AI & DS):**

**Semester 3 (Odd Semester):**
• **AD2311** - Object Oriented Programming Laboratory (OOP Lab) · *Session: AN (01:20 PM - 04:30 PM)*
• **AD2312** - Database Management Systems Laboratory (DBMS Lab) · *Session: FN (09:15 AM - 12:30 PM)*
• **AD2313** - Data Structures and Algorithms Laboratory (DSA Lab) · *Session: AN (01:20 PM - 04:30 PM)*

**Semester 4 (Even Semester):**
• **AD2411** - Machine Learning Laboratory · *Session: FN (09:15 AM - 12:30 PM)*
• **AD2412** - Operating Systems Laboratory · *Session: AN (01:20 PM - 04:30 PM)*
• **AD2413** - Java & Web Technologies Laboratory · *Session: AN (01:20 PM - 04:30 PM)*

💡 *Each laboratory session runs as a dedicated multi-period block (FN: 09:15 AM - 12:30 PM | AN: 01:20 PM - 04:30 PM).*`,
          suggestions: ['Labs for 3rd year?', 'Labs for 4th year?', 'Official timetable timings?'],
        }
      }

      // 3rd Year / Sem 5 & 6
      if (q.includes('3rd') || q.includes('3') || q.includes('third') || q.includes('junior') || q.includes('sem 5') || q.includes('sem 6') || q.includes('semester 5') || q.includes('semester 6')) {
        return {
          answer: `🔬 **Official Laboratories for 3rd Year (AI & DS):**

**Semester 5 (Odd Semester):**
• **AD2511** - Cloud Services & Management Laboratory
• **AD2512** - Big Data Analytics Laboratory
• **AD2513** - Deep Learning Laboratory
• **AD2514** - Business Analytics Laboratory
• **AD2515** - Communication Training (Period 7 & 8 · 03:05 PM - 04:30 PM)
• **AD2516** - Aptitude & Soft Skills Training (Period 7 & 8 · 03:05 PM - 04:30 PM)
• **AD2517** - Web Development Laboratory

**Semester 6 (Even Semester):**
• **AD2611** - Natural Language Processing Laboratory
• **AD2612** - Computer Vision & Image Processing Laboratory
• **AD2613** - Mobile Application Development Laboratory
• **AD2614** - Mini Project & Product Development

💡 *Afternoon practical blocks are scheduled from 01:20 PM to 04:30 PM.*`,
          suggestions: ['Labs for 2nd year?', 'Labs for 4th year?', 'Timetable schedule?'],
        }
      }

      // 4th Year / Sem 7 & 8
      if (q.includes('4th') || q.includes('4') || q.includes('fourth') || q.includes('senior') || q.includes('final') || q.includes('sem 7') || q.includes('sem 8') || q.includes('semester 7') || q.includes('semester 8')) {
        return {
          answer: `🔬 **Official Laboratories & Project Work for 4th Year (AI & DS):**

**Semester 7 (Odd Semester):**
• **AD2711** - Project Work Phase I (Capstone Research)
• **AD2712** - Placement and Training (Corporate Readiness · 01:20 PM - 04:30 PM)

**Semester 8 (Even Semester):**
• **AD2811** - Project Work Phase II (Capstone Final Implementation)
• **AD2812** - Industrial Internship & Comprehensive Viva Voce`,
          suggestions: ['Labs for 3rd year?', 'Labs for 2nd year?', 'Faculty directorate?'],
        }
      }

      // 1st Year / Sem 1 & 2
      if (q.includes('1st') || q.includes('1') || q.includes('first') || q.includes('freshman') || q.includes('sem 1') || q.includes('sem 2') || q.includes('semester 1') || q.includes('semester 2')) {
        return {
          answer: `🔬 **Official Laboratories for 1st Year (AI & DS):**

**Semester 1 (Odd Semester):**
• **GE2111** - Problem Solving & Python Programming Laboratory
• **BS2112** - Physics & Chemistry Laboratory
• **GE2113** - Engineering Graphics & CAD Laboratory

**Semester 2 (Even Semester):**
• **CS2211** - C Programming & Data Structures Laboratory
• **EE2212** - Basic Electrical & Electronics Engineering Laboratory
• **GE2213** - Workshop Practice Laboratory`,
          suggestions: ['Labs for 2nd year?', 'Labs for 3rd year?', 'Daily bell timings?'],
        }
      }

      // All 8 Semesters Overview
      return {
        answer: `🔬 **Department of AI & DS — All 8 Semesters Practical Laboratories Overview:**

• **Year 1 (Sem 1 & 2):** Python Programming Lab, Physics/Chem Lab, CAD Graphics Lab, C Programming & Data Structures Lab, BEE Lab, Workshop Lab.
• **Year 2 (Sem 3 & 4):** OOP Lab, DBMS Lab, DSA Lab, Machine Learning Lab, Operating Systems Lab, Java & Web Lab.
• **Year 3 (Sem 5 & 6):** Cloud Services Lab, Big Data Lab, Deep Learning Lab, Business Analytics Lab, Communication Training, Aptitude, Web Dev Lab, NLP Lab, Computer Vision Lab, Mobile App Lab, Mini Project.
• **Year 4 (Sem 7 & 8):** Project Work Phase I, Placement & Training, Project Work Phase II, Industrial Internship.

💡 *Timing: Forenoon Lab (09:15 AM - 12:30 PM) · Afternoon Lab (01:20 PM - 04:30 PM).*`,
        suggestions: ['Labs for 2nd year?', 'Labs for 3rd year?', 'Daily bell timings?'],
      }
    }

    // -------------------------------------------------------------------------
    // 10. DAILY SCHEDULE, TIMETABLE & BELL TIMINGS (8 PERIODS)
    // -------------------------------------------------------------------------
    if (
      q.includes('timetable') ||
      q.includes('timing') ||
      q.includes('period') ||
      q.includes('bell') ||
      q.includes('schedule') ||
      q.includes('break') ||
      q.includes('lunch') ||
      q.includes('hour') ||
      q.includes('1.20') ||
      q.includes('4.30') ||
      q.includes('9.15')
    ) {
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
      const result = await getDynamicKnowledgeBase(query)
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