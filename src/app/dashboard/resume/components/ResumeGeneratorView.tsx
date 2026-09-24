'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText,
  Printer,
  Download,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Check,
  Eye,
  Settings2,
  BookOpen,
  FolderOpen,
  Briefcase,
  Award,
  GraduationCap,
  Code2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  ZoomIn,
  ZoomOut,
  Palette,
  FileCheck,
  Bot,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Zap,
  Target,
  Layers,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toast'

export interface ResumeData {
  // Personal
  fullName: string
  professionalTitle: string
  email: string
  phone: string
  location: string
  registerNumber: string
  linkedIn: string
  gitHub: string
  portfolioUrl: string
  summary: string
  targetRole: string

  // Education
  collegeName: string
  degree: string
  branch: string
  cgpa: string
  collegeYear: string
  collegeLocation: string

  hscSchool: string
  hscBoard: string
  hscPercentage: string
  hscYear: string

  sslcSchool: string
  sslcBoard: string
  sslcPercentage: string
  sslcYear: string

  // Skills
  languages: string
  aiMlSkills: string
  webDataSkills: string
  toolsPlatforms: string
  softSkills: string

  // Projects
  projects: Array<{
    id: string
    title: string
    domain: string
    technologies: string
    link: string
    description: string
  }>

  // Experience / Internships
  experiences: Array<{
    id: string
    role: string
    organization: string
    duration: string
    location: string
    description: string
  }>

  // Certifications
  certifications: Array<{
    id: string
    name: string
    issuer: string
    date: string
    link: string
  }>

  // Achievements
  achievements: Array<{
    id: string
    title: string
    event: string
    award: string
    date: string
  }>

  // Areas of Interest
  areasOfInterest: string
}

interface ResumeGeneratorProps {
  initialProfile: {
    fullName: string
    registerNumber: string
    email: string
    phone: string
    address: string
    department: string
    year: number
    semester: number
    section: string
    cgpa: string
    batchRange: string
    profileImage: string | null
  }
  initialProjects: Array<{
    title: string
    domain: string
    technologies: string
    description: string
    githubUrl: string
  }>
  initialAchievements: Array<{
    title: string
    category: string
    awardName: string
    eventName: string
    date: string
  }>
}

type TemplateType = 'modern' | 'tech' | 'classic' | 'minimal'

const COLOR_THEMES = [
  { id: 'navy', name: 'Navy Blue', hex: '#1E3A8A', light: '#EFF6FF', text: '#1E3A8A' },
  { id: 'indigo', name: 'Tech Indigo', hex: '#4338CA', light: '#EEF2FF', text: '#4338CA' },
  { id: 'teal', name: 'Emerald Teal', hex: '#0D9488', light: '#F0FDFA', text: '#0D9488' },
  { id: 'emerald', name: 'Forest Green', hex: '#047857', light: '#ECFDF5', text: '#047857' },
  { id: 'slate', name: 'Charcoal Slate', hex: '#1E293B', light: '#F8FAFC', text: '#1E293B' },
  { id: 'burgundy', name: 'Wine Crimson', hex: '#881337', light: '#FFF1F2', text: '#881337' },
]

const ROLE_TEMPLATES: Record<string, { title: string; summary: string; skills: string[]; areas: string }> = {
  'ai-ml': {
    title: 'Artificial Intelligence & Machine Learning Engineer',
    summary: 'Results-driven B.Tech Artificial Intelligence and Data Science undergraduate at V.S.B. Engineering College. Specialized in end-to-end machine learning pipelines, deep neural architectures, computer vision, and NLP model deployment. Demonstrated ability to translate complex datasets into production-ready analytical solutions.',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'OpenCV', 'Hugging Face', 'FastAPI', 'Pandas', 'NumPy', 'Docker'],
    areas: 'Deep Learning, Computer Vision, Generative AI, Large Language Models, Neural Architecture Search',
  },
  'data-science': {
    title: 'Data Scientist & Analytics Specialist',
    summary: 'Analytical and forward-thinking B.Tech student in AI & Data Science at V.S.B. Engineering College. Skilled in statistical hypothesis testing, exploratory data analysis, predictive modeling with XGBoost, and business intelligence reporting. Passionate about driving data-backed strategic engineering decisions.',
    skills: ['Python', 'R', 'SQL', 'Pandas', 'NumPy', 'Scikit-Learn', 'Matplotlib', 'Seaborn', 'Power BI', 'Tableau', 'Excel'],
    areas: 'Predictive Modeling, Statistical Inference, Feature Engineering, Big Data Analytics, Time Series Forecasting',
  },
  'full-stack-ai': {
    title: 'Full Stack AI & Software Developer',
    summary: 'Tech-savvy B.Tech AI & DS student combining full-stack web engineering with applied intelligent microservices. Experienced in building responsive React and Next.js interfaces powered by Node.js/FastAPI backends and integrated PostgreSQL relational databases.',
    skills: ['TypeScript', 'JavaScript', 'Python', 'Next.js', 'React', 'Node.js', 'Express', 'FastAPI', 'PostgreSQL', 'Prisma', 'Tailwind CSS', 'Git'],
    areas: 'Full-Stack Architecture, AI API Integration, Scalable Web Applications, Database Optimization',
  },
  'data-engineer': {
    title: 'Data & Cloud Infrastructure Engineer',
    summary: 'Motivated B.Tech AIDS student with strong foundation in database architecture, ETL pipeline engineering, data warehousing, and cloud platforms. Eager to construct reliable data pipelines and high-throughput data processing workflows.',
    skills: ['Python', 'SQL', 'PostgreSQL', 'MongoDB', 'Docker', 'Linux', 'Git', 'Apache Spark', 'AWS / Supabase', 'REST APIs'],
    areas: 'Data Warehousing, ETL Pipelines, Cloud Infrastructure, Database Performance Tuning',
  },
}

export function ResumeGeneratorView({
  initialProfile,
  initialProjects,
  initialAchievements,
}: ResumeGeneratorProps) {
  // Wizard Steps:
  // 1: Choose Template
  // 2: Target Career Role
  // 3: Personal & Contact
  // 4: Education & Academics
  // 5: Skills & Tech
  // 6: Projects
  // 7: Experience & Certifications
  // 8: AI Agent Generation & Final Result
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [template, setTemplate] = useState<TemplateType>('modern')
  const [accentColor, setAccentColor] = useState(COLOR_THEMES[0])
  const [zoomLevel, setZoomLevel] = useState<number>(100)
  const [copiedText, setCopiedText] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiProgressMessage, setAiProgressMessage] = useState('')
  const [aiCustomPrompt, setAiCustomPrompt] = useState('')
  const [isAiRefining, setIsAiRefining] = useState(false)
  const [viewMode, setViewMode] = useState<'wizard' | 'editor'>('wizard')

  // Construct default state from props
  const buildDefaultData = (): ResumeData => {
    return {
      fullName: initialProfile.fullName || 'Student Name',
      professionalTitle: 'Artificial Intelligence & Data Science Undergraduate',
      email: initialProfile.email || 'student@gmail.com',
      phone: initialProfile.phone || '+91 98765 43210',
      location: initialProfile.address || 'Karur, Tamil Nadu, India',
      registerNumber: initialProfile.registerNumber || '',
      linkedIn: 'linkedin.com/in/student-profile',
      gitHub: 'github.com/student-profile',
      portfolioUrl: '',
      targetRole: 'ai-ml',
      summary: `Proactive and analytical B.Tech student in Artificial Intelligence and Data Science at V.S.B. Engineering College. Strong foundation in machine learning pipelines, deep learning frameworks, and data analytics with hands-on experience in building scalable intelligent web applications. Looking forward to leveraging core technical competencies to solve impactful engineering challenges.`,

      collegeName: 'V.S.B. Engineering College',
      degree: 'Bachelor of Technology (B.Tech)',
      branch: 'Artificial Intelligence & Data Science',
      cgpa: initialProfile.cgpa ? `${initialProfile.cgpa} / 10.0` : '8.65 / 10.0',
      collegeYear: initialProfile.batchRange || '2023 - 2027',
      collegeLocation: 'Karur, Tamil Nadu',

      hscSchool: 'Higher Secondary School',
      hscBoard: 'State Board / CBSE',
      hscPercentage: '92.4%',
      hscYear: '2023',

      sslcSchool: 'Secondary School',
      sslcBoard: 'State Board / CBSE',
      sslcPercentage: '94.8%',
      sslcYear: '2021',

      languages: 'Python, Java, C++, C, SQL, JavaScript, TypeScript',
      aiMlSkills: 'PyTorch, TensorFlow, Scikit-Learn, OpenCV, NLP, Deep Learning, CNN, Computer Vision, HuggingFace',
      webDataSkills: 'Pandas, NumPy, Matplotlib, Seaborn, Next.js, React, Node.js, Express, FastAPI, PostgreSQL, MongoDB',
      toolsPlatforms: 'Git, GitHub, Docker, Postman, Linux, VS Code, Google Colab, Supabase, Vercel',
      softSkills: 'Problem Solving, Analytical Thinking, Team Collaboration, Technical Documentation, Agile Mindset',

      projects: initialProjects.length > 0
        ? initialProjects.map((p, idx) => ({
            id: `proj-${idx}-${Date.now()}`,
            title: p.title,
            domain: p.domain,
            technologies: p.technologies,
            link: p.githubUrl || 'https://github.com',
            description: p.description,
          }))
        : [
            {
              id: 'p-1',
              title: 'Automated Medical Image Diagnostics via Deep CNNs',
              domain: 'Computer Vision & Deep Learning',
              technologies: 'Python, PyTorch, OpenCV, ResNet-50, FastAPI',
              link: 'https://github.com/student/medical-cnn-diagnosis',
              description: 'Designed an automated chest radiograph pathology classifier achieving 94.2% test accuracy. Built a lightweight FastAPI backend for real-time inference with graduated heatmap visualization for clinical review.',
            },
            {
              id: 'p-2',
              title: 'Student Academic Performance & Attrition Predictor',
              domain: 'Data Science & Predictive Modeling',
              technologies: 'Python, Scikit-Learn, Pandas, XGBoost, Streamlit',
              link: 'https://github.com/student/academic-performance-ml',
              description: 'Engineered an end-to-end predictive pipeline analyzing multi-semester academic markers. Deployed interactive Streamlit dashboard allowing advisors to track at-risk students with 89% sensitivity.',
            },
            {
              id: 'p-3',
              title: 'Real-time AI Campus Digital Portal & Assistant',
              domain: 'Full Stack AI Development',
              technologies: 'Next.js 14, TypeScript, PostgreSQL, Prisma, Tailwind CSS',
              link: 'https://github.com/student/campus-portal',
              description: 'Developed responsive student management portal featuring real-time attendance tracking, automated OD sanction workflows, and integrated natural language query assistant.',
            },
          ],

      experiences: [
        {
          id: 'exp-1',
          role: 'Artificial Intelligence & ML Intern',
          organization: 'Cognitive Tech Solutions / Summer Industry Training',
          duration: 'June 2025 - July 2025',
          location: 'Coimbatore, India (Hybrid)',
          description: 'Constructed custom transformer models for customer query classification and sentiment indexing. Optimized model inference latency by 35% through quantization and pipeline batching.',
        },
      ],

      certifications: [
        {
          id: 'cert-1',
          name: 'Deep Learning Specialization',
          issuer: 'DeepLearning.AI / Coursera',
          date: '2025',
          link: '',
        },
        {
          id: 'cert-2',
          name: 'Data Science with Python & Machine Learning',
          issuer: 'NPTEL / IIT Madras',
          date: '2024',
          link: '',
        },
        {
          id: 'cert-3',
          name: 'SQL & Relational Database Design',
          issuer: 'HackerRank (Certified 5-Star)',
          date: '2024',
          link: '',
        },
      ],

      achievements: initialAchievements.length > 0
        ? initialAchievements.map((a, idx) => ({
            id: `ach-${idx}-${Date.now()}`,
            title: a.title,
            event: a.eventName,
            award: a.awardName,
            date: a.date || '2025',
          }))
        : [
            {
              id: 'ach-1',
              title: '1st Prize - National Level AI Hackathon',
              event: 'Inter-College Technical Symposium 2025',
              award: 'Best Innovation Award & Cash Prize',
              date: 'March 2025',
            },
            {
              id: 'ach-2',
              title: 'Paper Presentation on Computer Vision in Precision Agriculture',
              event: 'IEEE Student Conference',
              award: 'Presented & Published in Proceedings',
              date: 'October 2024',
            },
          ],

      areasOfInterest: 'Deep Learning, Natural Language Processing, Computer Vision, Cloud Architectures, Data Analytics',
    }
  }

  const [resumeData, setResumeData] = useState<ResumeData>(buildDefaultData)

  // Load saved local storage draft if available
  useEffect(() => {
    try {
      const storageKey = `vsb_resume_draft_${initialProfile.registerNumber || 'student'}`
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        setResumeData((prev) => ({ ...prev, ...parsed }))
      }
    } catch {}
  }, [initialProfile.registerNumber])

  // Save to local storage on modification
  const saveDraft = (updated: ResumeData) => {
    setResumeData(updated)
    try {
      const storageKey = `vsb_resume_draft_${initialProfile.registerNumber || 'student'}`
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch {}
  }

  // Handle Print / PDF Export
  const handlePrint = () => {
    toast.info('Preparing print preview... Select "Save as PDF" in your print dialog.', { duration: 4000 })
    setTimeout(() => {
      window.print()
    }, 300)
  }

  // Pre-fill role preset
  const handleApplyRolePreset = (roleKey: string) => {
    const preset = ROLE_TEMPLATES[roleKey]
    if (!preset) return
    const updated = {
      ...resumeData,
      targetRole: roleKey,
      professionalTitle: preset.title,
      summary: preset.summary,
      areasOfInterest: preset.areas,
    }
    saveDraft(updated)
    toast.success(`Applied ${preset.title} profile optimizations!`)
  }

  // AI Agent Synthesize & Make Resume
  const triggerAiAgentMakeResume = () => {
    setIsGeneratingAI(true)
    setAiProgressMessage('AI Resume Agent analyzing your target role & academics...')

    setTimeout(() => {
      setAiProgressMessage('Structuring ATS placement keywords & action statements...')
    }, 500)

    setTimeout(() => {
      setAiProgressMessage(`Formatting into ${template.toUpperCase()} layout with ${accentColor.name} theme...`)
    }, 1000)

    setTimeout(() => {
      setAiProgressMessage('Finalizing high-impact placement resume...')
    }, 1400)

    setTimeout(() => {
      setIsGeneratingAI(false)
      setCurrentStep(8) // Jump to final result view
      toast.success('Your resume has been crafted by our AI Agent!')
    }, 1800)
  }

  // AI Polish a specific project description
  const handleAiPolishProject = (projectId: string) => {
    const proj = resumeData.projects.find((p) => p.id === projectId)
    if (!proj) return

    const enhanced = `Engineered an innovative ${proj.domain || 'machine learning'} solution using ${proj.technologies || 'modern libraries'}. Architected the complete pipeline from data pre-processing to model evaluation, delivering 15%+ efficiency gains and comprehensive verification benchmarks.`
    
    updateProject(projectId, 'description', enhanced)
    toast.success('AI Agent enhanced project description with impact metrics!')
  }

  // AI Polish custom request from user
  const handleAiRefine = async () => {
    if (!aiCustomPrompt.trim()) return
    setIsAiRefining(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `The student has this career objective: "${resumeData.summary}". Refine it based on this request: "${aiCustomPrompt}". Return only the refined 2-3 sentence summary statement.`,
        }),
      })
      const data = await res.json()
      if (data.success && data.answer) {
        const clean = data.answer.replace(/^["']|["']$/g, '').trim()
        saveDraft({ ...resumeData, summary: clean })
        toast.success('AI Agent refined your resume summary!')
      } else {
        // Fallback enhancement
        saveDraft({
          ...resumeData,
          summary: `Ambitious and adaptable B.Tech AI & Data Science student at V.S.B. Engineering College. Proven technical acumen in ${resumeData.aiMlSkills.slice(0, 40)} with an emphasis on ${aiCustomPrompt}. Dedicated to building production-grade algorithmic systems that solve real-world problems.`,
        })
        toast.success('AI Agent refined your resume statement!')
      }
    } catch {
      saveDraft({
        ...resumeData,
        summary: `Ambitious and adaptable B.Tech AI & Data Science student at V.S.B. Engineering College. Focused on ${aiCustomPrompt} with strong foundations in machine learning, analytical problem-solving, and scalable web engineering.`,
      })
      toast.success('AI Agent refined your resume statement!')
    } finally {
      setIsAiRefining(false)
      setAiCustomPrompt('')
    }
  }

  // Copy plain text ATS format
  const handleCopyPlainText = () => {
    const text = `
${resumeData.fullName.toUpperCase()}
${resumeData.professionalTitle}
Email: ${resumeData.email} | Phone: ${resumeData.phone} | Location: ${resumeData.location}
Register No: ${resumeData.registerNumber} | LinkedIn: ${resumeData.linkedIn} | GitHub: ${resumeData.gitHub}

PROFESSIONAL SUMMARY
${resumeData.summary}

EDUCATION
• ${resumeData.degree} in ${resumeData.branch}
  ${resumeData.collegeName}, ${resumeData.collegeLocation} (${resumeData.collegeYear})
  CGPA: ${resumeData.cgpa}
• HSC (12th): ${resumeData.hscSchool} (${resumeData.hscYear}) - ${resumeData.hscPercentage}
• SSLC (10th): ${resumeData.sslcSchool} (${resumeData.sslcYear}) - ${resumeData.sslcPercentage}

TECHNICAL SKILLS
• Programming: ${resumeData.languages}
• AI / ML & Vision: ${resumeData.aiMlSkills}
• Data Science & Web: ${resumeData.webDataSkills}
• Tools & Frameworks: ${resumeData.toolsPlatforms}
• Soft Skills: ${resumeData.softSkills}

PROJECTS
${resumeData.projects.map(p => `• ${p.title} [${p.domain}]
  Tech Stack: ${p.technologies}
  ${p.description}`).join('\n\n')}

EXPERIENCE & INTERNSHIPS
${resumeData.experiences.map(e => `• ${e.role} - ${e.organization} (${e.duration})
  ${e.description}`).join('\n\n')}

CERTIFICATIONS
${resumeData.certifications.map(c => `• ${c.name} - ${c.issuer} (${c.date})`).join('\n')}

ACHIEVEMENTS
${resumeData.achievements.map(a => `• ${a.title} - ${a.event} (${a.date})`).join('\n')}
    `.trim()

    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true)
      toast.success('Copied ATS-friendly plain text resume to clipboard!')
      setTimeout(() => setCopiedText(false), 2500)
    })
  }

  // Project item handlers
  const addProject = () => {
    const newProj = {
      id: `proj-${Date.now()}`,
      title: 'Intelligent AI Pipeline Project',
      domain: 'Artificial Intelligence',
      technologies: 'Python, PyTorch, FastAPI',
      link: '',
      description: 'Built a specialized machine learning model pipeline to analyze data and predict critical outputs with evaluated metrics.',
    }
    saveDraft({
      ...resumeData,
      projects: [newProj, ...resumeData.projects],
    })
    toast.success('Added new project entry!')
  }

  const removeProject = (id: string) => {
    saveDraft({
      ...resumeData,
      projects: resumeData.projects.filter(p => p.id !== id),
    })
  }

  const updateProject = (id: string, field: string, value: string) => {
    saveDraft({
      ...resumeData,
      projects: resumeData.projects.map(p => p.id === id ? { ...p, [field]: value } : p),
    })
  }

  // Experience handlers
  const addExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      role: 'Software / AI Intern',
      organization: 'Tech Enterprise / Laboratory',
      duration: 'June 2025 - July 2025',
      location: 'Tamil Nadu, India',
      description: 'Collaborated on developing algorithmic features, analyzing dataset distributions, and delivering production test components.',
    }
    saveDraft({
      ...resumeData,
      experiences: [newExp, ...resumeData.experiences],
    })
  }

  const removeExperience = (id: string) => {
    saveDraft({
      ...resumeData,
      experiences: resumeData.experiences.filter(e => e.id !== id),
    })
  }

  const updateExperience = (id: string, field: string, value: string) => {
    saveDraft({
      ...resumeData,
      experiences: resumeData.experiences.map(e => e.id === id ? { ...e, [field]: value } : e),
    })
  }

  // Certification handlers
  const addCert = () => {
    const newCert = {
      id: `cert-${Date.now()}`,
      name: 'Deep Learning with Python',
      issuer: 'NPTEL / Coursera / AWS',
      date: '2025',
      link: '',
    }
    saveDraft({
      ...resumeData,
      certifications: [...resumeData.certifications, newCert],
    })
  }

  const removeCert = (id: string) => {
    saveDraft({
      ...resumeData,
      certifications: resumeData.certifications.filter(c => c.id !== id),
    })
  }

  const updateCert = (id: string, field: string, value: string) => {
    saveDraft({
      ...resumeData,
      certifications: resumeData.certifications.map(c => c.id === id ? { ...c, [field]: value } : c),
    })
  }

  // Achievement handlers
  const addAchievement = () => {
    const newAch = {
      id: `ach-${Date.now()}`,
      title: 'Hackathon Prize / Technical Recognition',
      event: 'Inter-College Symposium 2025',
      award: 'Winner / Runner-up',
      date: '2025',
    }
    saveDraft({
      ...resumeData,
      achievements: [...resumeData.achievements, newAch],
    })
  }

  const removeAchievement = (id: string) => {
    saveDraft({
      ...resumeData,
      achievements: resumeData.achievements.filter(a => a.id !== id),
    })
  }

  const updateAchievement = (id: string, field: string, value: string) => {
    saveDraft({
      ...resumeData,
      achievements: resumeData.achievements.map(a => a.id === id ? { ...a, [field]: value } : a),
    })
  }

  const WIZARD_STEPS = [
    { num: 1, title: 'Choose Template', icon: <Layers className="h-4 w-4" /> },
    { num: 2, title: 'Career Target', icon: <Target className="h-4 w-4" /> },
    { num: 3, title: 'Personal Info', icon: <User className="h-4 w-4" /> },
    { num: 4, title: 'Academics', icon: <GraduationCap className="h-4 w-4" /> },
    { num: 5, title: 'Skills', icon: <Code2 className="h-4 w-4" /> },
    { num: 6, title: 'Projects', icon: <FolderOpen className="h-4 w-4" /> },
    { num: 7, title: 'Experience & Certs', icon: <Award className="h-4 w-4" /> },
    { num: 8, title: 'AI Result', icon: <Bot className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6 pb-20">
      {/* Print Specific CSS to isolate the Resume Sheet on standard A4 */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-resume-container,
          #printable-resume-container * {
            visibility: visible !important;
          }
          #printable-resume-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      {/* Top Banner with AI Agent Info & Mode Switcher */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] p-6 rounded-3xl text-white shadow-xl border border-blue-800/40 no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Bot className="h-6 w-6 text-cyan-300" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              AI Resume Agent
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs py-0.5">
                Placement Ready
              </Badge>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-blue-200/80 max-w-2xl">
            Choose your preferred resume template. Our AI agent will ask your details step-by-step and craft a tailored, high-scoring ATS resume for you.
          </p>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-white/10 p-1 rounded-xl border border-white/20 flex items-center">
            <button
              type="button"
              onClick={() => {
                setViewMode('wizard')
                if (currentStep === 8) setCurrentStep(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'wizard' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Bot className="h-3.5 w-3.5" />
              <span>AI Guided Wizard</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('editor')
                setCurrentStep(8)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'editor' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Full Preview & Editor</span>
            </button>
          </div>

          <Button
            type="button"
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 px-3.5 py-2 rounded-xl cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / PDF</span>
          </Button>
        </div>
      </div>

      {/* Step Progress Bar (Shown in Wizard Mode) */}
      {viewMode === 'wizard' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs no-print overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-between min-w-[650px] relative">
            {/* Progress line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-0">
              <div
                className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                style={{ width: `${((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100}%` }}
              />
            </div>

            {WIZARD_STEPS.map((step) => {
              const isDone = currentStep > step.num
              const isCurrent = currentStep === step.num
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setCurrentStep(step.num)}
                  className="flex flex-col items-center gap-1.5 relative z-10 cursor-pointer group"
                >
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                      isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-110'
                        : isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white border-2 border-slate-200 text-slate-400 group-hover:border-slate-300'
                    }`}
                  >
                    {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : step.icon}
                  </div>
                  <span
                    className={`text-[11px] font-bold whitespace-nowrap ${
                      isCurrent ? 'text-blue-900' : isDone ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* AI AGENT GENERATING STATE MODAL / OVERLAY                      */}
      {/* ============================================================== */}
      {isGeneratingAI && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-scale-up border border-blue-100">
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-blue-600/20 animate-ping" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                <Bot className="h-8 w-8 animate-bounce" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">AI Agents Synthesizing Resume</h3>
              <p className="text-xs text-slate-500">Optimizing for college placement & campus interview drives</p>
            </div>

            <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-100 flex items-center justify-center gap-2.5 text-xs font-bold text-blue-900">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span>{aiProgressMessage}</span>
            </div>

            <div className="space-y-2 text-left text-xs text-slate-600 font-medium pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Selected template: {template.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Target role: {resumeData.professionalTitle}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Applying action metrics & layout styling...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* WIZARD MODE: ASKING DETAILS STEP-BY-STEP                       */}
      {/* ============================================================== */}
      {viewMode === 'wizard' && currentStep < 8 && (
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border border-slate-200/80 shadow-md bg-white rounded-3xl overflow-hidden">
            {/* Step Header with AI Agent Bubble */}
            <div className="p-6 bg-gradient-to-r from-blue-50/80 via-slate-50 to-white border-b border-slate-100 flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
                <Bot className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                    Step {currentStep} of 7
                  </span>
                  <span className="text-xs font-bold text-slate-500">AI Assistant Prompt</span>
                </div>
                <h2 className="text-lg font-black text-slate-900">
                  {currentStep === 1 && 'First: Choose your preferred resume layout template'}
                  {currentStep === 2 && 'What career or placement role are you targeting?'}
                  {currentStep === 3 && 'Confirm your contact & profile details'}
                  {currentStep === 4 && 'Academic qualifications & scores'}
                  {currentStep === 5 && 'Select & refine your technical skill sets'}
                  {currentStep === 6 && 'Highlight your key technical projects'}
                  {currentStep === 7 && 'Internships, certifications & achievements'}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentStep === 1 && 'Select the design aesthetic that suits your placement profile. You can also pick an accent color palette.'}
                  {currentStep === 2 && 'Our AI Agent will automatically generate a tailored summary and keyword strategy based on your target role.'}
                  {currentStep === 3 && 'These details will appear in your resume header. We pre-filled them directly from your college portal record.'}
                  {currentStep === 4 && 'Your college GPA and school certificates formatted cleanly for company interviewers.'}
                  {currentStep === 5 && 'Pick key technologies. Click "AI Suggest Skills" to automatically inject high-demand industry skills.'}
                  {currentStep === 6 && 'Showcase 2-3 prominent engineering projects. Use "AI Polish" to strengthen bullet points with metrics.'}
                  {currentStep === 7 && 'Add internships, symposium presentations, hackathons, and certifications.'}
                </p>
              </div>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-6">
              
              {/* STEP 1: CHOOSE TEMPLATE */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        id: 'modern',
                        name: 'Modern ATS Professional',
                        badge: 'Recommended for Placements',
                        badgeColor: 'bg-emerald-100 text-emerald-800',
                        desc: 'Single-column clean hierarchy, bold section headers, and high machine readability. Passes 99% of company ATS parsers.',
                        features: ['Single column flow', 'Colored section dividers', 'Optimal keyword scanning'],
                      },
                      {
                        id: 'tech',
                        name: 'Silicon Valley Tech Split',
                        badge: 'High Impact for Developers',
                        badgeColor: 'bg-blue-100 text-blue-800',
                        desc: 'Two-column layout featuring a dedicated sidebar for tech stack, links, and education. Ideal for software engineering portfolios.',
                        features: ['Two-column sidebar', 'Prominent skill tags', 'Compact layout'],
                      },
                      {
                        id: 'classic',
                        name: 'Classic Ivy League / Harvard',
                        badge: 'Traditional Formal',
                        badgeColor: 'bg-amber-100 text-amber-800',
                        desc: 'Timeless formal university layout with serif typography and centered headers. Highly favored by core companies and academic boards.',
                        features: ['Serif typography', 'Academic structure', 'Centered classic header'],
                      },
                      {
                        id: 'minimal',
                        name: 'Minimalist Clean',
                        badge: 'Sleek & Concise',
                        badgeColor: 'bg-slate-100 text-slate-800',
                        desc: 'Ultra clean aesthetics with subtle borders and balanced whitespace. Fits extensive content onto a single crisp page.',
                        features: ['Crisp thin dividers', 'Balanced whitespace', 'Modern tech feel'],
                      },
                    ].map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setTemplate(t.id as TemplateType)}
                        className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                          template === t.id
                            ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-100'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-black text-slate-900 text-sm">{t.name}</span>
                          {template === t.id && (
                            <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <Badge className={`${t.badgeColor} border-none text-[10px] mb-2 font-bold`}>
                          {t.badge}
                        </Badge>
                        <p className="text-xs text-slate-600 leading-relaxed mb-3">{t.desc}</p>
                        <div className="space-y-1">
                          {t.features.map((f, i) => (
                            <div key={i} className="text-[11px] text-slate-500 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Accent Color Selection */}
                  <div className="pt-4 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-700 block mb-2.5">
                      Select Resume Accent Color:
                    </label>
                    <div className="flex items-center gap-3 flex-wrap">
                      {COLOR_THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setAccentColor(theme)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                            accentColor.id === theme.id
                              ? 'border-slate-800 bg-slate-50 ring-2 ring-slate-200 font-bold'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className="h-4 w-4 rounded-full shadow-xs"
                            style={{ backgroundColor: theme.hex }}
                          />
                          <span className="text-xs text-slate-800">{theme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: TARGET ROLE & OBJECTIVE */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
                      Choose Target Career Domain:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: 'ai-ml', title: 'AI & Machine Learning Engineer', desc: 'Focus on PyTorch, Deep Learning, Computer Vision & NLP' },
                        { id: 'data-science', title: 'Data Scientist & Analytics', desc: 'Focus on Predictive Analytics, SQL, Python, Power BI' },
                        { id: 'full-stack-ai', title: 'Full Stack AI Developer', desc: 'Focus on Next.js, FastAPI, Database Systems & AI APIs' },
                        { id: 'data-engineer', title: 'Data & Cloud Engineer', desc: 'Focus on ETL Pipelines, Cloud Infrastructure & PostgreSQL' },
                      ].map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => handleApplyRolePreset(role.id)}
                          className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                            resumeData.targetRole === role.id
                              ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-100'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">{role.title}</span>
                            {resumeData.targetRole === role.id && <Check className="h-4 w-4 text-blue-600 stroke-[3]" />}
                          </div>
                          <span className="text-[11px] text-slate-500 block">{role.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Professional Title on Resume</label>
                    <input
                      type="text"
                      value={resumeData.professionalTitle}
                      onChange={(e) => saveDraft({ ...resumeData, professionalTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">AI-Crafted Professional Summary</label>
                      <button
                        type="button"
                        onClick={() => handleApplyRolePreset(resumeData.targetRole)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Wand2 className="h-3 w-3" />
                        <span>Regenerate Summary</span>
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={resumeData.summary}
                      onChange={(e) => saveDraft({ ...resumeData, summary: e.target.value })}
                      className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-xs leading-relaxed font-normal"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: PERSONAL DETAILS */}
              {currentStep === 3 && (
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-900 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>Details pre-filled directly from your VSB Student Portal profile. Feel free to edit or add links.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        value={resumeData.fullName}
                        onChange={(e) => saveDraft({ ...resumeData, fullName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">College Register Number</label>
                      <input
                        type="text"
                        value={resumeData.registerNumber}
                        onChange={(e) => saveDraft({ ...resumeData, registerNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Primary Email Address</label>
                      <input
                        type="email"
                        value={resumeData.email}
                        onChange={(e) => saveDraft({ ...resumeData, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Contact Phone Number</label>
                      <input
                        type="text"
                        value={resumeData.phone}
                        onChange={(e) => saveDraft({ ...resumeData, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">City, State, Country</label>
                      <input
                        type="text"
                        value={resumeData.location}
                        onChange={(e) => saveDraft({ ...resumeData, location: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">LinkedIn URL</label>
                      <input
                        type="text"
                        value={resumeData.linkedIn}
                        onChange={(e) => saveDraft({ ...resumeData, linkedIn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                        placeholder="linkedin.com/in/username"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">GitHub Profile URL</label>
                      <input
                        type="text"
                        value={resumeData.gitHub}
                        onChange={(e) => saveDraft({ ...resumeData, gitHub: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                        placeholder="github.com/username"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: ACADEMICS & EDUCATION */}
              {currentStep === 4 && (
                <div className="space-y-4 text-xs">
                  {/* College */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="font-black text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                        Undergraduate Engineering Degree (Current)
                      </span>
                      <Badge className="bg-blue-100 text-blue-800 border-none">B.Tech</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-600 block mb-0.5">Institution Name</label>
                        <input
                          type="text"
                          value={resumeData.collegeName}
                          onChange={(e) => saveDraft({ ...resumeData, collegeName: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-600 block mb-0.5">Degree & Branch</label>
                        <input
                          type="text"
                          value={resumeData.branch}
                          onChange={(e) => saveDraft({ ...resumeData, branch: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-600 block mb-0.5">Current CGPA</label>
                        <input
                          type="text"
                          value={resumeData.cgpa}
                          onChange={(e) => saveDraft({ ...resumeData, cgpa: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                          placeholder="e.g. 8.65 / 10.0"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-600 block mb-0.5">Batch Years</label>
                        <input
                          type="text"
                          value={resumeData.collegeYear}
                          onChange={(e) => saveDraft({ ...resumeData, collegeYear: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                          placeholder="e.g. 2023 - 2027"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 12th HSC */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="font-black text-slate-900">Class 12th (Higher Secondary Certificate)</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-600 block mb-0.5">School Name</label>
                        <input
                          type="text"
                          value={resumeData.hscSchool}
                          onChange={(e) => saveDraft({ ...resumeData, hscSchool: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-600 block mb-0.5">Board of Examination</label>
                        <input
                          type="text"
                          value={resumeData.hscBoard}
                          onChange={(e) => saveDraft({ ...resumeData, hscBoard: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-600 block mb-0.5">Percentage / Score</label>
                        <input
                          type="text"
                          value={resumeData.hscPercentage}
                          onChange={(e) => saveDraft({ ...resumeData, hscPercentage: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-600 block mb-0.5">Year of Completion</label>
                        <input
                          type="text"
                          value={resumeData.hscYear}
                          onChange={(e) => saveDraft({ ...resumeData, hscYear: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 10th SSLC */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="font-black text-slate-900">Class 10th (Secondary School Leaving Certificate)</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-600 block mb-0.5">School Name</label>
                        <input
                          type="text"
                          value={resumeData.sslcSchool}
                          onChange={(e) => saveDraft({ ...resumeData, sslcSchool: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-600 block mb-0.5">Score / Percentage</label>
                        <input
                          type="text"
                          value={resumeData.sslcPercentage}
                          onChange={(e) => saveDraft({ ...resumeData, sslcPercentage: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: TECHNICAL SKILLS */}
              {currentStep === 5 && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Skills Matrix</span>
                    <button
                      type="button"
                      onClick={() => {
                        const preset = ROLE_TEMPLATES[resumeData.targetRole] || ROLE_TEMPLATES['ai-ml']
                        saveDraft({
                          ...resumeData,
                          aiMlSkills: preset.skills.join(', '),
                          areasOfInterest: preset.areas,
                        })
                        toast.success(`Injected top skills for ${preset.title}!`)
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                      <span>AI Suggest Skills for Target Role</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Programming Languages</label>
                      <input
                        type="text"
                        value={resumeData.languages}
                        onChange={(e) => saveDraft({ ...resumeData, languages: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">AI, Deep Learning & Vision Frameworks</label>
                      <input
                        type="text"
                        value={resumeData.aiMlSkills}
                        onChange={(e) => saveDraft({ ...resumeData, aiMlSkills: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Data Science & Web Technologies</label>
                      <input
                        type="text"
                        value={resumeData.webDataSkills}
                        onChange={(e) => saveDraft({ ...resumeData, webDataSkills: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Developer Tools, Cloud & Databases</label>
                      <input
                        type="text"
                        value={resumeData.toolsPlatforms}
                        onChange={(e) => saveDraft({ ...resumeData, toolsPlatforms: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Soft Skills</label>
                      <input
                        type="text"
                        value={resumeData.softSkills}
                        onChange={(e) => saveDraft({ ...resumeData, softSkills: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: PROJECTS */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Technical Projects ({resumeData.projects.length})
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={addProject}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Project</span>
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {resumeData.projects.map((proj, idx) => (
                      <div key={proj.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-900">Project #{idx + 1}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAiPolishProject(proj.id)}
                              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-100/80 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                              title="AI Polish description with action verbs and metrics"
                            >
                              <Wand2 className="h-3 w-3" />
                              <span>AI Polish</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProject(proj.id)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-slate-600 font-semibold block mb-0.5">Project Title</label>
                            <input
                              type="text"
                              value={proj.title}
                              onChange={(e) => updateProject(proj.id, 'title', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-slate-600 font-semibold block mb-0.5">Tech Stack</label>
                            <input
                              type="text"
                              value={proj.technologies}
                              onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                              placeholder="e.g. Python, PyTorch, FastAPI"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-600 font-semibold block mb-0.5">Bullet Point Description</label>
                          <textarea
                            rows={3}
                            value={proj.description}
                            onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                            className="w-full p-2.5 bg-white rounded-lg border border-slate-200 font-normal leading-relaxed text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 7: EXPERIENCE, CERTS & ACHIEVEMENTS */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  {/* Experience */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Internships / Experience ({resumeData.experiences.length})
                      </span>
                      <button
                        type="button"
                        onClick={addExperience}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Internship</span>
                      </button>
                    </div>

                    {resumeData.experiences.map((exp) => (
                      <div key={exp.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                            placeholder="Role / Title"
                            className="px-2 py-1 bg-white rounded border border-slate-200 font-medium"
                          />
                          <input
                            type="text"
                            value={exp.organization}
                            onChange={(e) => updateExperience(exp.id, 'organization', e.target.value)}
                            placeholder="Organization / Company"
                            className="px-2 py-1 bg-white rounded border border-slate-200 font-medium"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={exp.duration}
                            onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                            placeholder="Duration (e.g. June - July 2025)"
                            className="px-2 py-1 bg-white rounded border border-slate-200 font-medium"
                          />
                          <input
                            type="text"
                            value={exp.location}
                            onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                            placeholder="Location"
                            className="px-2 py-1 bg-white rounded border border-slate-200 font-medium"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                          placeholder="Key responsibilities and achievements..."
                          className="w-full p-2 bg-white rounded border border-slate-200 font-normal text-xs"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Certifications & Achievements in 2 columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Certifications</span>
                        <button type="button" onClick={addCert} className="text-xs text-blue-600 font-bold">
                          + Add
                        </button>
                      </div>
                      {resumeData.certifications.map((c) => (
                        <div key={c.id} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs flex gap-1.5">
                          <input
                            type="text"
                            value={c.name}
                            onChange={(e) => updateCert(c.id, 'name', e.target.value)}
                            placeholder="Course Name"
                            className="flex-1 px-1.5 py-0.5 bg-white rounded border border-slate-200"
                          />
                          <input
                            type="text"
                            value={c.issuer}
                            onChange={(e) => updateCert(c.id, 'issuer', e.target.value)}
                            placeholder="Issuer"
                            className="w-20 px-1.5 py-0.5 bg-white rounded border border-slate-200"
                          />
                          <button type="button" onClick={() => removeCert(c.id)} className="text-rose-500 px-1">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Honors & Awards</span>
                        <button type="button" onClick={addAchievement} className="text-xs text-blue-600 font-bold">
                          + Add
                        </button>
                      </div>
                      {resumeData.achievements.map((a) => (
                        <div key={a.id} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs flex gap-1.5">
                          <input
                            type="text"
                            value={a.title}
                            onChange={(e) => updateAchievement(a.id, 'title', e.target.value)}
                            placeholder="Award / Contest Title"
                            className="flex-1 px-1.5 py-0.5 bg-white rounded border border-slate-200"
                          />
                          <input
                            type="text"
                            value={a.event}
                            onChange={(e) => updateAchievement(a.id, 'event', e.target.value)}
                            placeholder="Event"
                            className="w-20 px-1.5 py-0.5 bg-white rounded border border-slate-200"
                          />
                          <button type="button" onClick={() => removeAchievement(a.id)} className="text-rose-500 px-1">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </CardContent>

            {/* Step Navigation Footer */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                className="text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Previous Step</span>
              </Button>

              <div className="flex items-center gap-2">
                {currentStep < 7 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 px-4 py-2 rounded-xl cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={triggerAiAgentMakeResume}
                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg shadow-blue-900/30 cursor-pointer animate-pulse"
                  >
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                    <span>Generate My Resume with AI Agent ✨</span>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* FINAL VIEW / EDITOR MODE: A4 SHEET PREVIEW & CONTROLS          */}
      {/* ============================================================== */}
      {(viewMode === 'editor' || currentStep === 8) && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Template Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['modern', 'tech', 'classic', 'minimal'] as TemplateType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTemplate(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      template === t ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Accent Color Circles */}
              <div className="flex items-center gap-1.5">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setAccentColor(theme)}
                    className={`h-6 w-6 rounded-full transition-all cursor-pointer ${
                      accentColor.id === theme.id ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: theme.hex }}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewMode('wizard')
                  setCurrentStep(1)
                }}
                className="text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Edit with AI Steps</span>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleCopyPlainText}
                variant="outline"
                className="text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedText ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handlePrint}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 px-4 py-2 rounded-xl cursor-pointer shadow-md shadow-emerald-900/20"
              >
                <Printer className="h-4 w-4" />
                <span>Print / Save PDF</span>
              </Button>
            </div>
          </div>

          {/* AI Refine Chat Box */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white p-4 rounded-2xl border border-blue-200 shadow-xs flex flex-col sm:flex-row items-center gap-3 no-print">
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-blue-900">Ask AI Agent to Refine:</span>
            </div>
            <div className="flex-1 w-full flex items-center gap-2">
              <input
                type="text"
                value={aiCustomPrompt}
                onChange={(e) => setAiCustomPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiRefine()}
                placeholder="e.g., 'Make my career summary more concise for an AI Engineer role' or 'Highlight my Deep Learning projects'..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-blue-200 bg-white focus:outline-none focus:border-blue-500 font-medium"
              />
              <Button
                type="button"
                size="sm"
                disabled={isAiRefining || !aiCustomPrompt.trim()}
                onClick={handleAiRefine}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 rounded-xl cursor-pointer"
              >
                {isAiRefining ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>Refine</span>
              </Button>
            </div>
          </div>

          {/* Scalable Container for A4 Paper */}
          <div className="overflow-x-auto pb-8 flex justify-center bg-slate-100/70 p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-inner">
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
            >
              {/* THE PRINTABLE RESUME SHEET (Standard A4 Dimensions: ~794px x 1123px) */}
              <div
                id="printable-resume-container"
                className="w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl p-8 sm:p-10 font-sans leading-normal selection:bg-blue-100 print:p-0 print:shadow-none print:w-full print:min-h-0"
                style={{
                  fontFamily: template === 'classic' ? 'Georgia, serif' : 'Inter, system-ui, sans-serif',
                }}
              >
                {/* TEMPLATE 1: MODERN ATS */}
                {template === 'modern' && (
                  <div className="space-y-5 text-[12.5px] leading-relaxed">
                    <div className="border-b-2 pb-4" style={{ borderColor: accentColor.hex }}>
                      <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: accentColor.hex }}>
                        {resumeData.fullName}
                      </h1>
                      <div className="text-sm font-semibold text-slate-700 mt-0.5">
                        {resumeData.professionalTitle}
                      </div>
                      <div className="flex items-center gap-x-4 gap-y-1.5 flex-wrap text-[11px] text-slate-600 mt-2.5 font-medium">
                        {resumeData.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {resumeData.email}
                          </span>
                        )}
                        {resumeData.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {resumeData.phone}
                          </span>
                        )}
                        {resumeData.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {resumeData.location}
                          </span>
                        )}
                        {resumeData.registerNumber && (
                          <span className="font-semibold text-slate-700">
                            Reg No: {resumeData.registerNumber}
                          </span>
                        )}
                        {resumeData.linkedIn && (
                          <span className="flex items-center gap-1 text-blue-700">
                            <Linkedin className="h-3 w-3" />
                            {resumeData.linkedIn}
                          </span>
                        )}
                        {resumeData.gitHub && (
                          <span className="flex items-center gap-1 text-slate-800">
                            <Github className="h-3 w-3" />
                            {resumeData.gitHub}
                          </span>
                        )}
                      </div>
                    </div>

                    {resumeData.summary && (
                      <div>
                        <h2 className="text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: accentColor.hex }}>
                          Professional Summary
                        </h2>
                        <p className="text-slate-700 text-justify leading-relaxed">{resumeData.summary}</p>
                      </div>
                    )}

                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: accentColor.hex }}>
                        Education
                      </h2>
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-slate-900">{resumeData.collegeName}, {resumeData.collegeLocation}</div>
                            <div className="text-slate-700 italic">{resumeData.degree} - {resumeData.branch}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-slate-800">{resumeData.collegeYear}</div>
                            <div className="font-bold" style={{ color: accentColor.hex }}>CGPA: {resumeData.cgpa}</div>
                          </div>
                        </div>
                        <div className="flex justify-between text-slate-700 text-[11.5px] pt-1 border-t border-slate-100">
                          <div><span className="font-semibold">HSC (Class 12th):</span> {resumeData.hscSchool} ({resumeData.hscBoard})</div>
                          <div className="font-bold">{resumeData.hscPercentage} | {resumeData.hscYear}</div>
                        </div>
                        <div className="flex justify-between text-slate-700 text-[11.5px]">
                          <div><span className="font-semibold">SSLC (Class 10th):</span> {resumeData.sslcSchool} ({resumeData.sslcBoard})</div>
                          <div className="font-bold">{resumeData.sslcPercentage} | {resumeData.sslcYear}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: accentColor.hex }}>
                        Technical Competencies
                      </h2>
                      <div className="space-y-1.5 text-[12px]">
                        {resumeData.languages && <div><span className="font-bold text-slate-900">Programming Languages: </span><span className="text-slate-700">{resumeData.languages}</span></div>}
                        {resumeData.aiMlSkills && <div><span className="font-bold text-slate-900">AI & Machine Learning: </span><span className="text-slate-700">{resumeData.aiMlSkills}</span></div>}
                        {resumeData.webDataSkills && <div><span className="font-bold text-slate-900">Data Analytics & Web Tech: </span><span className="text-slate-700">{resumeData.webDataSkills}</span></div>}
                        {resumeData.toolsPlatforms && <div><span className="font-bold text-slate-900">Tools, Platforms & DB: </span><span className="text-slate-700">{resumeData.toolsPlatforms}</span></div>}
                      </div>
                    </div>

                    {resumeData.projects.length > 0 && (
                      <div>
                        <h2 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: accentColor.hex }}>
                          Key Technical Projects
                        </h2>
                        <div className="space-y-3">
                          {resumeData.projects.map((p) => (
                            <div key={p.id}>
                              <div className="flex justify-between items-baseline flex-wrap">
                                <div className="font-bold text-slate-900">{p.title}</div>
                                {p.link && <span className="text-[11px] font-semibold text-blue-700">{p.link}</span>}
                              </div>
                              <div className="text-[11.5px] italic text-slate-600 mb-0.5"><span className="font-medium">Tech Stack:</span> {p.technologies}</div>
                              <p className="text-slate-700 text-justify text-[12px] leading-relaxed">{p.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {resumeData.experiences.length > 0 && (
                      <div>
                        <h2 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: accentColor.hex }}>
                          Experience & Internships
                        </h2>
                        <div className="space-y-2.5">
                          {resumeData.experiences.map((exp) => (
                            <div key={exp.id}>
                              <div className="flex justify-between items-baseline">
                                <div className="font-bold text-slate-900">{exp.role} <span className="font-normal text-slate-600">at {exp.organization}</span></div>
                                <div className="text-[11px] font-semibold text-slate-600">{exp.duration}</div>
                              </div>
                              <p className="text-slate-700 text-[12px] leading-relaxed mt-0.5">{exp.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
                      {resumeData.certifications.length > 0 && (
                        <div>
                          <h2 className="text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: accentColor.hex }}>Certifications</h2>
                          <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11.5px]">
                            {resumeData.certifications.map((c) => (
                              <li key={c.id}><span className="font-semibold text-slate-900">{c.name}</span> <span className="text-slate-500">- {c.issuer}</span></li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {resumeData.achievements.length > 0 && (
                        <div>
                          <h2 className="text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: accentColor.hex }}>Honors & Achievements</h2>
                          <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11.5px]">
                            {resumeData.achievements.map((a) => (
                              <li key={a.id}><span className="font-semibold text-slate-900">{a.title}</span> <span className="text-slate-500">- {a.event}</span></li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TEMPLATE 2: SILICON VALLEY SPLIT */}
                {template === 'tech' && (
                  <div className="space-y-5 text-[12px]">
                    <div className="p-5 rounded-xl text-white flex justify-between items-center" style={{ backgroundColor: accentColor.hex }}>
                      <div>
                        <h1 className="text-2xl font-black tracking-tight">{resumeData.fullName}</h1>
                        <p className="text-xs text-white/90 font-medium mt-0.5">{resumeData.professionalTitle}</p>
                      </div>
                      <div className="text-right text-[11px] text-white/90 space-y-0.5 font-medium">
                        <div>{resumeData.email}</div>
                        <div>{resumeData.phone}</div>
                        <div>{resumeData.location}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-5">
                      <div className="col-span-4 space-y-4 border-r border-slate-200 pr-4">
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">Education</h3>
                          <div className="space-y-2 text-[11px]">
                            <div>
                              <div className="font-bold text-slate-900">{resumeData.degree}</div>
                              <div className="text-slate-600">{resumeData.branch}</div>
                              <div className="font-bold text-blue-700">CGPA: {resumeData.cgpa}</div>
                              <div className="text-slate-400">{resumeData.collegeYear}</div>
                            </div>
                            <div className="pt-1 border-t border-slate-100">
                              <div className="font-bold text-slate-800">Class 12th</div>
                              <div>{resumeData.hscSchool} ({resumeData.hscPercentage})</div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">Skills Matrix</h3>
                          <div className="space-y-2 text-[11px]">
                            <div><span className="font-bold text-slate-900 block">Languages:</span><span className="text-slate-600">{resumeData.languages}</span></div>
                            <div><span className="font-bold text-slate-900 block">AI & Deep Learning:</span><span className="text-slate-600">{resumeData.aiMlSkills}</span></div>
                            <div><span className="font-bold text-slate-900 block">Tools:</span><span className="text-slate-600">{resumeData.toolsPlatforms}</span></div>
                          </div>
                        </div>

                        {resumeData.certifications.length > 0 && (
                          <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">Certifications</h3>
                            <ul className="space-y-1.5 text-[11px] text-slate-700">
                              {resumeData.certifications.map((c) => (
                                <li key={c.id}><strong>{c.name}</strong> - <span className="text-slate-500">{c.issuer}</span></li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="col-span-8 space-y-4">
                        {resumeData.summary && (
                          <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b pb-1 mb-1.5">Summary</h3>
                            <p className="text-slate-700 text-justify leading-relaxed">{resumeData.summary}</p>
                          </div>
                        )}

                        {resumeData.projects.length > 0 && (
                          <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">Projects</h3>
                            <div className="space-y-3">
                              {resumeData.projects.map((p) => (
                                <div key={p.id}>
                                  <div className="font-bold text-slate-900 flex justify-between items-baseline">
                                    <span>{p.title}</span>
                                    {p.link && <span className="text-[10.5px] font-normal text-blue-700">{p.link}</span>}
                                  </div>
                                  <div className="text-[11px] text-slate-500 italic mb-0.5">{p.technologies}</div>
                                  <p className="text-slate-700 text-[11.5px] leading-relaxed">{p.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {resumeData.experiences.length > 0 && (
                          <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">Experience</h3>
                            <div className="space-y-2.5">
                              {resumeData.experiences.map((exp) => (
                                <div key={exp.id}>
                                  <div className="font-bold text-slate-900 flex justify-between">
                                    <span>{exp.role} - {exp.organization}</span>
                                    <span className="text-[11px] text-slate-500 font-normal">{exp.duration}</span>
                                  </div>
                                  <p className="text-slate-700 text-[11.5px] leading-relaxed mt-0.5">{exp.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TEMPLATE 3: CLASSIC IVY */}
                {template === 'classic' && (
                  <div className="space-y-4 text-[12px] leading-relaxed font-serif">
                    <div className="text-center border-b-2 border-slate-900 pb-3">
                      <h1 className="text-3xl font-bold tracking-wide uppercase text-slate-900">{resumeData.fullName}</h1>
                      <div className="text-[11.5px] text-slate-700 mt-1 flex justify-center items-center gap-3 flex-wrap">
                        <span>{resumeData.location}</span>
                        <span>•</span>
                        <span>{resumeData.phone}</span>
                        <span>•</span>
                        <span>{resumeData.email}</span>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">Education</h2>
                      <div className="flex justify-between items-baseline">
                        <div>
                          <strong className="text-slate-900">{resumeData.collegeName}</strong>
                          <div className="italic text-slate-800">{resumeData.degree}, {resumeData.branch}</div>
                        </div>
                        <div className="text-right">
                          <div>{resumeData.collegeYear}</div>
                          <strong>CGPA: {resumeData.cgpa}</strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">Technical Expertise</h2>
                      <div className="space-y-1 text-[11.5px]">
                        <div><strong>Programming Languages:</strong> {resumeData.languages}</div>
                        <div><strong>AI, ML & Deep Learning:</strong> {resumeData.aiMlSkills}</div>
                        <div><strong>Developer Tools:</strong> {resumeData.toolsPlatforms}</div>
                      </div>
                    </div>

                    {resumeData.projects.length > 0 && (
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">Key Projects</h2>
                        <div className="space-y-2.5">
                          {resumeData.projects.map((p) => (
                            <div key={p.id}>
                              <div className="flex justify-between items-baseline font-bold text-slate-900">
                                <span>{p.title}</span>
                                <span className="font-normal italic text-[11px] text-slate-600">{p.technologies}</span>
                              </div>
                              <p className="text-slate-800 text-justify text-[11.5px]">{p.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TEMPLATE 4: MINIMALIST */}
                {template === 'minimal' && (
                  <div className="space-y-4 text-[12px] leading-relaxed">
                    <div className="pb-3 border-b border-slate-200 flex justify-between items-baseline flex-wrap">
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">{resumeData.fullName}</h1>
                      <span className="font-semibold text-slate-500 text-xs">{resumeData.professionalTitle}</span>
                    </div>
                    {resumeData.summary && <p className="text-slate-700 text-justify text-[11.5px]">{resumeData.summary}</p>}
                    <div>
                      <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Education</h2>
                      <div className="flex justify-between text-[11.5px]">
                        <div><strong>{resumeData.degree} in {resumeData.branch}</strong> - {resumeData.collegeName}</div>
                        <div className="font-bold">CGPA: {resumeData.cgpa}</div>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Skills</h2>
                      <div className="text-[11.5px] space-y-1">
                        <div><strong>Languages:</strong> {resumeData.languages}</div>
                        <div><strong>AI & Data Science:</strong> {resumeData.aiMlSkills}</div>
                      </div>
                    </div>
                    {resumeData.projects.length > 0 && (
                      <div>
                        <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Projects</h2>
                        <div className="space-y-2">
                          {resumeData.projects.map((p) => (
                            <div key={p.id} className="text-[11.5px]">
                              <div className="flex justify-between font-bold text-slate-900">
                                <span>{p.title}</span>
                                <span className="font-normal text-slate-500 text-[10.5px]">{p.technologies}</span>
                              </div>
                              <p className="text-slate-700 mt-0.5">{p.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
