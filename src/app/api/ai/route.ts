import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Department context for the AI
const SYSTEM_PROMPT = `You are the official AI Chatbot Assistant for V.S.B. Engineering College's Artificial Intelligence & Data Science Department, located in Karur, Tamil Nadu, India.
Your name is "V.S.B. AI & DS Assistant".

DEPARTMENT INFO:
- College: V.S.B. Engineering College (Autonomous), Karur, Tamil Nadu - 639 111
- Department: Artificial Intelligence & Data Science (AI & DS)
- Program: B.Tech (Regulation 2021 Autonomous)
- Established: 1995 | Department Established: 2020
- Placement Rate: 85%+ with 8 LPA Highest Package

FACULTY:
- Dr. S. Karthik - Professor (Ph.D. CS, 18 yrs exp, Machine Learning & Deep Learning, Room 201)
- Dr. M. Sowmya - Associate Professor (Ph.D. Math, 12 yrs exp, Discrete Math & Optimization, Room 204)
- Mr. S. Arun - Assistant Professor (M.Tech IT, 8 yrs exp, Operating Systems & Cloud, Room 105)
- Mrs. R. Priya - Assistant Professor (M.E. CSE, 6 yrs exp, Database Systems & Data Mining, Room 108)

CORE SUBJECTS:
- AD2301: Data Structures & Algorithms
- AD2302: Database Management Systems
- AD2303: Discrete Mathematics
- AD2304: Operating Systems
- AD2305: Machine Learning Foundations
- AD2306: Artificial Intelligence & Expert Systems
- AD2307: Data Science Tools & Laboratory

EVENTS:
- National Level AI & Machine Learning Hackathon 2026 (Aug 15 - 1 Lakh Cash Prize)
- Hands-on Workshop: Deep Learning with PyTorch & Transformers (Sep 22)
- Guest Lecture: Scalable Cloud Architecture for Big Data (Oct 05)

RULES:
1. Always be helpful, friendly, and professional.
2. Keep answers concise, cleanly formatted with bullet points and bold highlights.
3. Respond to student queries accurately.`

// Comprehensive Knowledge Base Fallback
function localFallback(query: string): { answer: string; suggestions: string[] } {
  const q = query.toLowerCase().trim()

  // 1. Events / Hackathons / Workshops
  if (q.includes('event') || q.includes('hackathon') || q.includes('workshop') || q.includes('seminar') || q.includes('symposium')) {
    return {
      answer: `📅 Upcoming Department Events & Hackathons:\n\n• National Level AI & ML Hackathon 2026 (Aug 15, 2026 - Main Auditorium, Cash Prize ₹1 Lakh)\n• Hands-on Workshop: Deep Learning with PyTorch & Transformers (Sep 22, 2026 - Data Analytics Center)\n• Guest Lecture: Scalable Cloud Architecture for Big Data (Oct 05, 2026 - Seminar Hall II)\n\nStudents can register directly under the **Events** tab in the student portal!`,
      suggestions: ['How to register for events?', 'What subjects are offered?', 'Faculty details?']
    }
  }

  // 2. Subjects / Courses / Syllabus
  if (q.includes('subject') || q.includes('course') || q.includes('syllabus') || q.includes('curriculum')) {
    return {
      answer: `📚 Core Academic Subjects (Regulation 2021):\n\n• AD2301 - Data Structures & Algorithms (4 Credits)\n• AD2302 - Database Management Systems (4 Credits)\n• AD2303 - Discrete Mathematics (4 Credits)\n• AD2304 - Operating Systems (3 Credits)\n• AD2305 - Machine Learning Foundations (4 Credits)\n• AD2306 - Artificial Intelligence & Expert Systems (3 Credits)\n• AD2307 - Data Science Tools & Laboratory (2 Credits)\n\nYou can view full unit-wise breakdowns and download complete course packs under **Study Details**!`,
      suggestions: ['Question papers?', 'Faculty details?', 'Lab facilities?']
    }
  }

  // 3. Placements / Jobs / Internships
  if (q.includes('placement') || q.includes('job') || q.includes('salary') || q.includes('package') || q.includes('recruit') || q.includes('career')) {
    return {
      answer: `📊 Placement Highlights & Statistics:\n\n• Placement Rate: 85%+ students placed\n• Highest Package: ₹8.5 LPA | Average Package: ₹4.8 LPA\n• Top Recruiters: TCS, Cognizant, Infosys, Zoho, Wipro, Kaar Technologies\n• Dedicated Training: Python, DSA, Mock Technical Interviews & Aptitude Bootcamps every Saturday\n• Internship assistance provided from III Year onwards`,
      suggestions: ['Placement interview cheatsheet?', 'What subjects are offered?', 'Department faculty?']
    }
  }

  // 4. Faculty / Teachers / Professors / HOD
  if (q.includes('faculty') || q.includes('teacher') || q.includes('professor') || q.includes('hod') || q.includes('mentor') || q.includes('advisor')) {
    return {
      answer: `👨‍🏫 AI & DS Department Faculty:\n\n• Dr. S. Karthik - Professor (Ph.D. CS, 18 yrs exp, ML/DL specialist - Room 201)\n• Dr. M. Sowmya - Assoc. Professor (Ph.D. Math, 12 yrs exp, Discrete Math - Room 204)\n• Mr. S. Arun - Asst. Professor (M.Tech IT, 8 yrs exp, OS & Cloud - Room 105)\n• Mrs. R. Priya - Asst. Professor (M.E. CSE, 6 yrs exp, DBMS & Data Mining - Room 108)\n\nFaculty office hours: Mon - Fri (03:30 PM - 04:30 PM). Connect via the **Faculty** directory!`,
      suggestions: ['Faculty office hours?', 'Research areas?', 'Labs and facilities?']
    }
  }

  // 5. Question Papers / Past Papers / IAT / Exams
  if (q.includes('question') || q.includes('paper') || q.includes('exam') || q.includes('iat') || q.includes('model') || q.includes('test')) {
    return {
      answer: `📝 Examination Question Paper Archive:\n\n• Internal Assessment Test 1 (IAT-1)\n• Internal Assessment Test 2 (IAT-2)\n• Model Examination Papers\n• Anna University Past 5-Year Question Banks\n\nAll verified question sets with Part-A (2 Marks) and Part-B (16 Marks) can be downloaded under **Question Papers**!`,
      suggestions: ['Important questions?', 'Subjects offered?', 'Placement stats?']
    }
  }

  // 6. Projects / Capstone / Mini Projects
  if (q.includes('project') || q.includes('capstone') || q.includes('mini') || q.includes('research')) {
    return {
      answer: `🚀 Department Projects & Research Repositories:\n\n• Autonomous Crop Disease Detection using Deep Transfer Learning (Computer Vision)\n• Smart Traffic Flow Optimization using Graph Neural Networks (Deep Learning)\n• Real-Time Tamil Speech-to-Text Conversion with Whisper ASR (NLP)\n• Decentralized Academic Credentials Verification via Ethereum (Blockchain)\n• Predictive Healthcare Analytics for Patient Readmission (Health AI)\n\nExplore source code and submit proposals under **Projects**!`,
      suggestions: ['Submit project proposal?', 'Faculty guides?', 'Lab facilities?']
    }
  }

  // 7. Resources / Books / Textbooks / Notes
  if (q.includes('resource') || q.includes('book') || q.includes('textbook') || q.includes('note') || q.includes('download') || q.includes('pdf')) {
    return {
      answer: `📚 Digital Library & Study Resources:\n\n• Data Structures in C++ (Mark Allen Weiss - 4th Ed) - 14.8 MB\n• Database System Concepts (Silberschatz Korth - 7th Ed) - 22.4 MB\n• Discrete Mathematics (Kenneth Rosen - 8th Ed) - 18.9 MB\n• Operating System Concepts (Silberschatz Dinosaur Ed) - 26.5 MB\n• Pattern Recognition & Machine Learning (Bishop) - 31.2 MB\n• AI & DS Placement Interview Prep Handbook (2026) - 8.0 MB\n\n1-click PDF downloads are live under the **Resources** menu!`,
      suggestions: ['Download course pack?', 'Question papers?', 'Subjects offered?']
    }
  }

  // 8. Attendance / Condonation / Leave / OD
  if (q.includes('attend') || q.includes('leave') || q.includes('od') || q.includes('condonation') || q.includes('percent')) {
    return {
      answer: `📋 Attendance Regulations & Policies:\n\n• Minimum Attendance Required: 75% for Anna University & Autonomous Exam Eligibility\n• Condonation Range: 65% - 74% (Requires Medical Certificate approval by HOD)\n• Automated Parent SMS: Dispatched at 05:00 PM for any unexcused absence\n• Current Batch Attendance: 92.5% (Compliant)\n\nTrack your attendance live on the **Dashboard**!`,
      suggestions: ['Student profile?', 'Faculty contact?', 'Subjects offered?']
    }
  }

  // 9. Achievements / Awards / Hackathon Winners
  if (q.includes('achieve') || q.includes('award') || q.includes('winner') || q.includes('prize') || q.includes('trophy')) {
    return {
      answer: `🏆 Department Hall of Fame & Achievements:\n\n• 1st Prize & Gold Trophy - Smart India Hackathon (SIH 2025) - Cash Prize ₹1 Lakh\n• Best Research Paper Award - IEEE ICCCNT 2025\n• 1st Rank Winner - National Level Code Marathon 2025\n\nView recipient photos and certificates under the **Achievements** tab!`,
      suggestions: ['Upcoming hackathons?', 'Student projects?', 'Placement stats?']
    }
  }

  // 10. Default Welcome / Help
  return {
    answer: `👋 Welcome to the **V.S.B. AI & DS Digital Portal Assistant**!\n\nI can help you with:\n• 📚 Course Syllabus & Notes (AD2301 - AD2307)\n• 📅 Upcoming Hackathons & Workshops\n• 👨‍🏫 Faculty Cabins & Office Hours\n• 📝 IAT & University Past Question Papers\n• 📊 Placement Records & 2026 Interview Kits\n• 🚀 Capstone Projects & Student Research\n\nWhat would you like to explore?`,
    suggestions: ['What subjects are offered?', 'Upcoming events & hackathons', 'Placement statistics', 'Faculty details']
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

    // If no API key or local testing, use enhanced local fallback
    if (!apiKey || apiKey === 'your-gemini-api-key') {
      const result = localFallback(query)
      return NextResponse.json({ success: true, ...result, source: 'local' })
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const sid = sessionId || 'default'
      if (!chatHistories.has(sid)) {
        chatHistories.set(sid, [])
      }
      const history = chatHistories.get(sid)!

      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      })

      const result = await chat.sendMessage(`${SYSTEM_PROMPT}\n\nUser question: ${query}`)
      const answer = result.response.text()

      history.push(
        { role: 'user', parts: [{ text: query }] },
        { role: 'model', parts: [{ text: answer }] }
      )
      if (history.length > 20) {
        history.splice(0, 2)
      }

      const suggestions = generateSuggestions(query)

      return NextResponse.json({
        success: true,
        answer,
        suggestions,
        source: 'gemini'
      })
    } catch (aiError: any) {
      console.error('Gemini API error:', aiError?.message || aiError)
      const result = localFallback(query)
      return NextResponse.json({ success: true, ...result, source: 'local-fallback' })
    }
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json({
      success: false,
      answer: 'Sorry, I encountered an error. Please try again.',
      suggestions: ['What subjects are offered?', 'Upcoming events?']
    })
  }
}

// Support GET for fast queries
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || searchParams.get('query') || ''

  const result = localFallback(query)
  return NextResponse.json({
    success: true,
    query,
    response: { answer: result.answer, suggestions: result.suggestions },
    source: 'local'
  })
}

function generateSuggestions(query: string): string[] {
  const q = query.toLowerCase()
  if (q.includes('subject') || q.includes('course')) return ['Faculty details?', 'Question papers?', 'Download course pack?']
  if (q.includes('placement') || q.includes('job')) return ['Highest salary package?', 'Top recruiters?', 'Placement interview kit?']
  if (q.includes('faculty')) return ['Faculty office hours?', 'Research specializations?', 'Subjects handled?']
  if (q.includes('event') || q.includes('hackathon')) return ['How to register?', 'Hackathon cash prizes?', 'Upcoming workshops?']
  if (q.includes('project')) return ['Project domains?', 'Submit proposal?', 'Faculty guides?']
  return ['What subjects are offered?', 'Upcoming events?', 'Placement statistics?', 'Faculty details?']
}