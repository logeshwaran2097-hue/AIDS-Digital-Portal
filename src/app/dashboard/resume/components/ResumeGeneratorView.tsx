'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  FileCheck
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
  showPhoto: boolean
  photoUrl: string

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

export function ResumeGeneratorView({
  initialProfile,
  initialProjects,
  initialAchievements,
}: ResumeGeneratorProps) {
  const [template, setTemplate] = useState<TemplateType>('modern')
  const [accentColor, setAccentColor] = useState(COLOR_THEMES[0])
  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'skills' | 'projects' | 'experience' | 'certifications' | 'settings'>('personal')
  const [zoomLevel, setZoomLevel] = useState<number>(100)
  const [copiedText, setCopiedText] = useState(false)
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false)

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
      summary: `Proactive and analytical B.Tech student in Artificial Intelligence and Data Science at V.S.B. Engineering College. Strong foundation in machine learning pipelines, deep learning frameworks, and data analytics with hands-on experience in building scalable intelligent web applications. Looking forward to leveraging core technical competencies to solve impactful engineering challenges.`,
      showPhoto: false,
      photoUrl: initialProfile.profileImage || '',

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

  // Pre-fill AIDS Sample
  const handleLoadSample = () => {
    const sample = buildDefaultData()
    saveDraft(sample)
    toast.success('Loaded comprehensive AI & DS professional resume sample!')
  }

  // Reset to original portal data
  const handleReset = () => {
    if (confirm('Reset resume to your college portal profile information? Custom typed items will be reinitialized.')) {
      const fresh = buildDefaultData()
      saveDraft(fresh)
      toast.success('Reset to portal profile successfully.')
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
      title: 'New Intelligent Project',
      domain: 'Artificial Intelligence',
      technologies: 'Python, Machine Learning, Web App',
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
      duration: 'Duration (e.g. June - Aug 2025)',
      location: 'Location',
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
      name: 'Professional Course / Certification',
      issuer: 'NPTEL / Coursera / AWS / IBM',
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
      event: 'College / National Event Name',
      award: 'Winner / Runner-up / Merit',
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

  return (
    <div className="space-y-6 pb-16">
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

      {/* Top Header & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-blue-800/40 no-print">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
              <Briefcase className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Student Resume Generator
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs py-0.5">
                ATS-Optimized
              </Badge>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-blue-200/80 max-w-2xl">
            Build, live-preview, and export professional placement-ready resumes tailored for Artificial Intelligence & Data Science engineering. Auto-synced with your college profile.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/30 flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Save PDF</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleCopyPlainText}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs sm:text-sm font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer"
          >
            {copiedText ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copiedText ? 'Copied ATS Text' : 'Copy Text'}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleLoadSample}
            className="bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border-blue-400/30 text-xs sm:text-sm font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="hidden sm:inline">AI & DS Sample</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="text-slate-300 hover:text-white hover:bg-white/10 text-xs font-medium flex items-center gap-1.5 px-2.5 py-2 rounded-xl cursor-pointer"
            title="Reset from portal profile"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>

          <button
            type="button"
            onClick={() => setIsMobilePreviewOpen(!isMobilePreviewOpen)}
            className="lg:hidden px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Eye className="h-4 w-4" />
            <span>{isMobilePreviewOpen ? 'Edit Form' : 'View Preview'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Interface: Left Form / Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ============================================================== */}
        {/* LEFT COLUMN: Editor Form (Hidden on mobile if preview toggled) */}
        {/* ============================================================== */}
        <div className={`lg:col-span-5 space-y-4 no-print ${isMobilePreviewOpen ? 'hidden lg:block' : 'block'}`}>
          
          {/* Template & Styling Toolbar */}
          <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
            <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Palette className="h-4 w-4 text-blue-600" />
                Template & Styling
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Auto-saved to device</span>
            </div>
            <CardContent className="p-4 space-y-3.5">
              {/* Template Selectors */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Resume Layout Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'modern', label: 'Modern ATS', desc: 'Single-column clean placement' },
                    { id: 'tech', label: 'Silicon Valley', desc: 'High-impact 2-column sidebar' },
                    { id: 'classic', label: 'Classic Ivy', desc: 'Timeless formal university' },
                    { id: 'minimal', label: 'Minimalist', desc: 'Clean lines & subtle accents' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTemplate(t.id as TemplateType)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        template === t.id
                          ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{t.label}</span>
                        {template === t.id && <Check className="h-3 w-3 text-blue-600" />}
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal block mt-0.5">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color Picker */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Accent Color Palette</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setAccentColor(theme)}
                      className={`h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        accentColor.id === theme.id ? 'ring-2 ring-offset-2 ring-slate-800 scale-110 shadow-sm' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: theme.hex }}
                      title={theme.name}
                    >
                      {accentColor.id === theme.id && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                  <span className="text-xs text-slate-500 font-medium ml-1">{accentColor.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'personal', label: 'Personal', icon: <User className="h-3.5 w-3.5" /> },
              { id: 'education', label: 'Education', icon: <GraduationCap className="h-3.5 w-3.5" /> },
              { id: 'skills', label: 'Skills', icon: <Code2 className="h-3.5 w-3.5" /> },
              { id: 'projects', label: 'Projects', icon: <FolderOpen className="h-3.5 w-3.5" /> },
              { id: 'experience', label: 'Internships', icon: <Briefcase className="h-3.5 w-3.5" /> },
              { id: 'certifications', label: 'Awards & Certs', icon: <Award className="h-3.5 w-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Form Content Cards */}
          <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4 sm:p-5">

              {/* TAB 1: PERSONAL DETAILS */}
              {activeTab === 'personal' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-blue-600" />
                    Personal & Contact Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={resumeData.fullName}
                        onChange={(e) => saveDraft({ ...resumeData, fullName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                        placeholder="e.g. John Doe"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Professional Title</label>
                      <input
                        type="text"
                        value={resumeData.professionalTitle}
                        onChange={(e) => saveDraft({ ...resumeData, professionalTitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                        placeholder="e.g. AI & Machine Learning Engineer"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={resumeData.email}
                        onChange={(e) => saveDraft({ ...resumeData, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                        placeholder="e.g. student@gmail.com"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={resumeData.phone}
                        onChange={(e) => saveDraft({ ...resumeData, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                        placeholder="e.g. +91 98765 43210"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Register Number</label>
                      <input
                        type="text"
                        value={resumeData.registerNumber}
                        onChange={(e) => saveDraft({ ...resumeData, registerNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                        placeholder="e.g. 922522243001"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Current Location</label>
                      <input
                        type="text"
                        value={resumeData.location}
                        onChange={(e) => saveDraft({ ...resumeData, location: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                        placeholder="e.g. Karur, Tamil Nadu, India"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">LinkedIn Profile</label>
                      <input
                        type="text"
                        value={resumeData.linkedIn}
                        onChange={(e) => saveDraft({ ...resumeData, linkedIn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                        placeholder="linkedin.com/in/username"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">GitHub Profile</label>
                      <input
                        type="text"
                        value={resumeData.gitHub}
                        onChange={(e) => saveDraft({ ...resumeData, gitHub: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                        placeholder="github.com/username"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">Career Objective / Summary</label>
                      <button
                        type="button"
                        onClick={() => {
                          saveDraft({
                            ...resumeData,
                            summary: `Dynamic B.Tech student in Artificial Intelligence and Data Science at V.S.B. Engineering College with a strong record in algorithmic programming, computer vision, and machine learning model deployment. Eager to contribute technical creativity and strong analytical capabilities to forward-thinking tech teams.`,
                          })
                          toast.success('Inserted AI-tailored career objective!')
                        }}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>AI Suggestion</span>
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={resumeData.summary}
                      onChange={(e) => saveDraft({ ...resumeData, summary: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-xs leading-relaxed font-normal"
                      placeholder="Write 2-4 sentences describing your professional drive, core tech strengths, and value proposition..."
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: EDUCATION */}
              {activeTab === 'education' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                    Academic Records & Qualifications
                  </h3>

                  {/* College */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span>Undergraduate Degree (Current)</span>
                      <Badge className="bg-blue-100 text-blue-800 border-none text-[10px]">Degree</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-slate-600 font-semibold block mb-0.5">College Institution</label>
                        <input
                          type="text"
                          value={resumeData.collegeName}
                          onChange={(e) => saveDraft({ ...resumeData, collegeName: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 font-semibold block mb-0.5">Degree & Branch</label>
                        <input
                          type="text"
                          value={resumeData.branch}
                          onChange={(e) => saveDraft({ ...resumeData, branch: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 font-semibold block mb-0.5">CGPA / Percentage</label>
                        <input
                          type="text"
                          value={resumeData.cgpa}
                          onChange={(e) => saveDraft({ ...resumeData, cgpa: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                          placeholder="e.g. 8.65 / 10.0"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 font-semibold block mb-0.5">Batch Years</label>
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
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span>Higher Secondary Certificate (Class 12th / HSC)</span>
                      <Badge className="bg-slate-200 text-slate-700 border-none text-[10px]">HSC</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-slate-600 font-semibold block mb-0.5">School Name</label>
                        <input
                          type="text"
                          value={resumeData.hscSchool}
                          onChange={(e) => saveDraft({ ...resumeData, hscSchool: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 font-semibold block mb-0.5">Board of Education</label>
                        <input
                          type="text"
                          value={resumeData.hscBoard}
                          onChange={(e) => saveDraft({ ...resumeData, hscBoard: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 font-semibold block mb-0.5">Score / Percentage</label>
                        <input
                          type="text"
                          value={resumeData.hscPercentage}
                          onChange={(e) => saveDraft({ ...resumeData, hscPercentage: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 font-semibold block mb-0.5">Passing Year</label>
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
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span>Secondary School Certificate (Class 10th / SSLC)</span>
                      <Badge className="bg-slate-200 text-slate-700 border-none text-[10px]">SSLC</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-slate-600 font-semibold block mb-0.5">School Name</label>
                        <input
                          type="text"
                          value={resumeData.sslcSchool}
                          onChange={(e) => saveDraft({ ...resumeData, sslcSchool: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 font-semibold block mb-0.5">Score / Percentage</label>
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

              {/* TAB 3: SKILLS */}
              {activeTab === 'skills' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Code2 className="h-4 w-4 text-blue-600" />
                    Technical Skills & Competencies
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Programming Languages</label>
                      <input
                        type="text"
                        value={resumeData.languages}
                        onChange={(e) => saveDraft({ ...resumeData, languages: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                        placeholder="Python, Java, C++, SQL, JavaScript..."
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">AI, Deep Learning & Vision</label>
                      <input
                        type="text"
                        value={resumeData.aiMlSkills}
                        onChange={(e) => saveDraft({ ...resumeData, aiMlSkills: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                        placeholder="PyTorch, TensorFlow, Scikit-Learn, OpenCV, NLP, HuggingFace..."
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Data Science & Web Technologies</label>
                      <input
                        type="text"
                        value={resumeData.webDataSkills}
                        onChange={(e) => saveDraft({ ...resumeData, webDataSkills: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                        placeholder="Pandas, NumPy, Next.js, React, Node.js, PostgreSQL..."
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Developer Tools & Cloud</label>
                      <input
                        type="text"
                        value={resumeData.toolsPlatforms}
                        onChange={(e) => saveDraft({ ...resumeData, toolsPlatforms: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                        placeholder="Git, GitHub, Docker, Postman, Linux, Vercel, Supabase..."
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Areas of Interest</label>
                      <input
                        type="text"
                        value={resumeData.areasOfInterest}
                        onChange={(e) => saveDraft({ ...resumeData, areasOfInterest: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                        placeholder="Deep Learning, Computer Vision, Predictive Analytics..."
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Soft Skills</label>
                      <input
                        type="text"
                        value={resumeData.softSkills}
                        onChange={(e) => saveDraft({ ...resumeData, softSkills: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                        placeholder="Problem Solving, Analytical Thinking, Team Collaboration..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PROJECTS */}
              {activeTab === 'projects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                      <FolderOpen className="h-4 w-4 text-blue-600" />
                      Key Projects ({resumeData.projects.length})
                    </h3>
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

                  <div className="space-y-3.5">
                    {resumeData.projects.map((proj, idx) => (
                      <div key={proj.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-900">Project #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeProject(proj.id)}
                            className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Remove project"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                            <label className="text-slate-600 font-semibold block mb-0.5">Domain / Category</label>
                            <input
                              type="text"
                              value={proj.domain}
                              onChange={(e) => updateProject(proj.id, 'domain', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                              placeholder="e.g. Computer Vision"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-slate-600 font-semibold block mb-0.5">Technologies Used</label>
                            <input
                              type="text"
                              value={proj.technologies}
                              onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                              placeholder="e.g. Python, PyTorch, FastAPI"
                            />
                          </div>
                          <div>
                            <label className="text-slate-600 font-semibold block mb-0.5">GitHub / Demo Link</label>
                            <input
                              type="text"
                              value={proj.link}
                              onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                              placeholder="github.com/..."
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-600 font-semibold block mb-0.5">Description & Impact</label>
                          <textarea
                            rows={3}
                            value={proj.description}
                            onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                            className="w-full p-2.5 bg-white rounded-lg border border-slate-200 font-normal leading-relaxed text-xs"
                            placeholder="Detail your engineering contribution, methodologies, algorithm, and quantifiable outcomes..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: EXPERIENCE */}
              {activeTab === 'experience' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                      Internships & Industry Experience
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      onClick={addExperience}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Experience</span>
                    </Button>
                  </div>

                  <div className="space-y-3.5">
                    {resumeData.experiences.map((exp, idx) => (
                      <div key={exp.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-900">Experience #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeExperience(exp.id)}
                            className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-slate-600 font-semibold block mb-0.5">Role / Designation</label>
                            <input
                              type="text"
                              value={exp.role}
                              onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-slate-600 font-semibold block mb-0.5">Organization / Company</label>
                            <input
                              type="text"
                              value={exp.organization}
                              onChange={(e) => updateExperience(exp.id, 'organization', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-slate-600 font-semibold block mb-0.5">Duration</label>
                            <input
                              type="text"
                              value={exp.duration}
                              onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                              placeholder="e.g. June 2025 - July 2025"
                            />
                          </div>
                          <div>
                            <label className="text-slate-600 font-semibold block mb-0.5">Location</label>
                            <input
                              type="text"
                              value={exp.location}
                              onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                              placeholder="e.g. Coimbatore, India"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-600 font-semibold block mb-0.5">Key Contributions & Learning</label>
                          <textarea
                            rows={3}
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            className="w-full p-2.5 bg-white rounded-lg border border-slate-200 font-normal leading-relaxed text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: CERTIFICATIONS & ACHIEVEMENTS */}
              {activeTab === 'certifications' && (
                <div className="space-y-6">
                  {/* Certifications */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                        <FileCheck className="h-4 w-4 text-blue-600" />
                        Certifications ({resumeData.certifications.length})
                      </h3>
                      <button
                        type="button"
                        onClick={addCert}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Cert</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {resumeData.certifications.map((c) => (
                        <div key={c.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-2 text-xs">
                          <input
                            type="text"
                            value={c.name}
                            onChange={(e) => updateCert(c.id, 'name', e.target.value)}
                            placeholder="Course / Certification Name"
                            className="flex-1 px-2 py-1 bg-white rounded border border-slate-200 font-medium"
                          />
                          <input
                            type="text"
                            value={c.issuer}
                            onChange={(e) => updateCert(c.id, 'issuer', e.target.value)}
                            placeholder="Issuer (e.g. NPTEL)"
                            className="w-28 px-2 py-1 bg-white rounded border border-slate-200 font-medium"
                          />
                          <input
                            type="text"
                            value={c.date}
                            onChange={(e) => updateCert(c.id, 'date', e.target.value)}
                            placeholder="Year"
                            className="w-16 px-2 py-1 bg-white rounded border border-slate-200 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => removeCert(c.id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-amber-500" />
                        Achievements & Honors ({resumeData.achievements.length})
                      </h3>
                      <button
                        type="button"
                        onClick={addAchievement}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Achievement</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {resumeData.achievements.map((a) => (
                        <div key={a.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-2 text-xs">
                          <input
                            type="text"
                            value={a.title}
                            onChange={(e) => updateAchievement(a.id, 'title', e.target.value)}
                            placeholder="Award / Contest Title"
                            className="flex-1 px-2 py-1 bg-white rounded border border-slate-200 font-medium"
                          />
                          <input
                            type="text"
                            value={a.event}
                            onChange={(e) => updateAchievement(a.id, 'event', e.target.value)}
                            placeholder="Event / Symposium"
                            className="w-32 px-2 py-1 bg-white rounded border border-slate-200 font-medium"
                          />
                          <input
                            type="text"
                            value={a.date}
                            onChange={(e) => updateAchievement(a.id, 'date', e.target.value)}
                            placeholder="Date"
                            className="w-20 px-2 py-1 bg-white rounded border border-slate-200 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => removeAchievement(a.id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: Realtime Live Document Sheet Preview             */}
        {/* ============================================================== */}
        <div className={`lg:col-span-7 space-y-4 ${isMobilePreviewOpen ? 'block' : 'hidden lg:block'}`}>
          
          {/* Zoom & Document Toolbar */}
          <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xs no-print">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-blue-600" />
                Live A4 Preview
              </span>
              <Badge className="bg-slate-100 text-slate-600 border-none text-[10px]">
                {template.toUpperCase()} Layout
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel(Math.max(70, zoomLevel - 10))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs font-bold text-slate-600 min-w-10 text-center">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel(Math.min(130, zoomLevel + 10))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <Button
                type="button"
                size="sm"
                onClick={handlePrint}
                className="ml-2 bg-slate-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export PDF</span>
              </Button>
            </div>
          </div>

          {/* Scalable Container for A4 Paper */}
          <div className="overflow-x-auto pb-8 flex justify-center bg-slate-100/70 p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-inner">
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
                
                {/* ========================================================= */}
                {/* TEMPLATE 1: MODERN ATS PROFESSIONAL                       */}
                {/* ========================================================= */}
                {template === 'modern' && (
                  <div className="space-y-5 text-[12.5px] leading-relaxed">
                    {/* Header */}
                    <div className="border-b-2 pb-4" style={{ borderColor: accentColor.hex }}>
                      <h1
                        className="text-2xl sm:text-3xl font-black tracking-tight"
                        style={{ color: accentColor.hex }}
                      >
                        {resumeData.fullName}
                      </h1>
                      <div className="text-sm font-semibold text-slate-700 mt-0.5">
                        {resumeData.professionalTitle}
                      </div>

                      {/* Contact Badges */}
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

                    {/* Summary */}
                    {resumeData.summary && (
                      <div>
                        <h2
                          className="text-xs font-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
                          style={{ color: accentColor.hex }}
                        >
                          Professional Summary
                        </h2>
                        <p className="text-slate-700 text-justify leading-relaxed">
                          {resumeData.summary}
                        </p>
                      </div>
                    )}

                    {/* Education */}
                    <div>
                      <h2
                        className="text-xs font-black uppercase tracking-wider mb-2"
                        style={{ color: accentColor.hex }}
                      >
                        Education
                      </h2>
                      <div className="space-y-2">
                        {/* College */}
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-slate-900">
                              {resumeData.collegeName}, {resumeData.collegeLocation}
                            </div>
                            <div className="text-slate-700 italic">
                              {resumeData.degree} - {resumeData.branch}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-slate-800">{resumeData.collegeYear}</div>
                            <div className="font-bold" style={{ color: accentColor.hex }}>
                              CGPA: {resumeData.cgpa}
                            </div>
                          </div>
                        </div>

                        {/* HSC & SSLC */}
                        <div className="flex justify-between text-slate-700 text-[11.5px] pt-1 border-t border-slate-100">
                          <div>
                            <span className="font-semibold">HSC (Class 12th):</span> {resumeData.hscSchool} ({resumeData.hscBoard})
                          </div>
                          <div className="font-bold">
                            {resumeData.hscPercentage} | {resumeData.hscYear}
                          </div>
                        </div>
                        <div className="flex justify-between text-slate-700 text-[11.5px]">
                          <div>
                            <span className="font-semibold">SSLC (Class 10th):</span> {resumeData.sslcSchool} ({resumeData.sslcBoard})
                          </div>
                          <div className="font-bold">
                            {resumeData.sslcPercentage} | {resumeData.sslcYear}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Technical Skills */}
                    <div>
                      <h2
                        className="text-xs font-black uppercase tracking-wider mb-2"
                        style={{ color: accentColor.hex }}
                      >
                        Technical Competencies
                      </h2>
                      <div className="space-y-1.5 text-[12px]">
                        {resumeData.languages && (
                          <div>
                            <span className="font-bold text-slate-900">Programming Languages: </span>
                            <span className="text-slate-700">{resumeData.languages}</span>
                          </div>
                        )}
                        {resumeData.aiMlSkills && (
                          <div>
                            <span className="font-bold text-slate-900">AI & Machine Learning: </span>
                            <span className="text-slate-700">{resumeData.aiMlSkills}</span>
                          </div>
                        )}
                        {resumeData.webDataSkills && (
                          <div>
                            <span className="font-bold text-slate-900">Data Analytics & Web Tech: </span>
                            <span className="text-slate-700">{resumeData.webDataSkills}</span>
                          </div>
                        )}
                        {resumeData.toolsPlatforms && (
                          <div>
                            <span className="font-bold text-slate-900">Tools, Platforms & DB: </span>
                            <span className="text-slate-700">{resumeData.toolsPlatforms}</span>
                          </div>
                        )}
                        {resumeData.areasOfInterest && (
                          <div>
                            <span className="font-bold text-slate-900">Areas of Interest: </span>
                            <span className="text-slate-700">{resumeData.areasOfInterest}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Projects */}
                    {resumeData.projects.length > 0 && (
                      <div>
                        <h2
                          className="text-xs font-black uppercase tracking-wider mb-2"
                          style={{ color: accentColor.hex }}
                        >
                          Key Technical Projects
                        </h2>
                        <div className="space-y-3">
                          {resumeData.projects.map((p) => (
                            <div key={p.id}>
                              <div className="flex justify-between items-baseline flex-wrap">
                                <div className="font-bold text-slate-900">
                                  {p.title}
                                  {p.domain && <span className="font-normal text-slate-500 ml-1.5 text-[11px]">| {p.domain}</span>}
                                </div>
                                {p.link && (
                                  <span className="text-[11px] font-semibold text-blue-700">
                                    {p.link}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11.5px] italic text-slate-600 mb-0.5">
                                <span className="font-medium">Tech Stack:</span> {p.technologies}
                              </div>
                              <p className="text-slate-700 text-justify text-[12px] leading-relaxed">
                                {p.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Internships & Experience */}
                    {resumeData.experiences.length > 0 && (
                      <div>
                        <h2
                          className="text-xs font-black uppercase tracking-wider mb-2"
                          style={{ color: accentColor.hex }}
                        >
                          Experience & Internships
                        </h2>
                        <div className="space-y-2.5">
                          {resumeData.experiences.map((exp) => (
                            <div key={exp.id}>
                              <div className="flex justify-between items-baseline">
                                <div className="font-bold text-slate-900">
                                  {exp.role} <span className="font-normal text-slate-600">at {exp.organization}</span>
                                </div>
                                <div className="text-[11px] font-semibold text-slate-600">
                                  {exp.duration} {exp.location && `| ${exp.location}`}
                                </div>
                              </div>
                              <p className="text-slate-700 text-[12px] leading-relaxed mt-0.5">
                                {exp.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications & Achievements in 2 compact columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
                      {resumeData.certifications.length > 0 && (
                        <div>
                          <h2
                            className="text-xs font-black uppercase tracking-wider mb-1.5"
                            style={{ color: accentColor.hex }}
                          >
                            Certifications
                          </h2>
                          <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11.5px]">
                            {resumeData.certifications.map((c) => (
                              <li key={c.id}>
                                <span className="font-semibold text-slate-900">{c.name}</span>
                                <span className="text-slate-500"> - {c.issuer} ({c.date})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {resumeData.achievements.length > 0 && (
                        <div>
                          <h2
                            className="text-xs font-black uppercase tracking-wider mb-1.5"
                            style={{ color: accentColor.hex }}
                          >
                            Honors & Achievements
                          </h2>
                          <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11.5px]">
                            {resumeData.achievements.map((a) => (
                              <li key={a.id}>
                                <span className="font-semibold text-slate-900">{a.title}</span>
                                <span className="text-slate-500"> - {a.event}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* TEMPLATE 2: SILICON VALLEY SPLIT (2 COLUMNS)              */}
                {/* ========================================================= */}
                {template === 'tech' && (
                  <div className="space-y-5 text-[12px]">
                    {/* Header Banner */}
                    <div
                      className="p-5 rounded-xl text-white flex justify-between items-center"
                      style={{ backgroundColor: accentColor.hex }}
                    >
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

                    {/* 2-Column Body */}
                    <div className="grid grid-cols-12 gap-5">
                      {/* Left Column (Skills, Education, Links) */}
                      <div className="col-span-4 space-y-4 border-r border-slate-200 pr-4">
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">
                            Links & Profiles
                          </h3>
                          <div className="space-y-1 text-[11px] text-slate-700 break-all">
                            {resumeData.linkedIn && <div><strong>LinkedIn:</strong> {resumeData.linkedIn}</div>}
                            {resumeData.gitHub && <div><strong>GitHub:</strong> {resumeData.gitHub}</div>}
                            {resumeData.registerNumber && <div><strong>Reg No:</strong> {resumeData.registerNumber}</div>}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">
                            Education
                          </h3>
                          <div className="space-y-2 text-[11px]">
                            <div>
                              <div className="font-bold text-slate-900">{resumeData.degree}</div>
                              <div className="text-slate-600">{resumeData.branch}</div>
                              <div className="text-slate-500">{resumeData.collegeName}</div>
                              <div className="font-bold text-blue-700">CGPA: {resumeData.cgpa}</div>
                              <div className="text-slate-400">{resumeData.collegeYear}</div>
                            </div>
                            <div className="pt-1 border-t border-slate-100">
                              <div className="font-bold text-slate-800">Class 12th (HSC)</div>
                              <div>{resumeData.hscSchool}</div>
                              <div className="font-semibold text-slate-700">{resumeData.hscPercentage} ({resumeData.hscYear})</div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">
                            Skills Matrix
                          </h3>
                          <div className="space-y-2 text-[11px]">
                            <div>
                              <span className="font-bold text-slate-900 block">Languages:</span>
                              <span className="text-slate-600">{resumeData.languages}</span>
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">AI & Deep Learning:</span>
                              <span className="text-slate-600">{resumeData.aiMlSkills}</span>
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">Data & Frameworks:</span>
                              <span className="text-slate-600">{resumeData.webDataSkills}</span>
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">Tools:</span>
                              <span className="text-slate-600">{resumeData.toolsPlatforms}</span>
                            </div>
                          </div>
                        </div>

                        {resumeData.certifications.length > 0 && (
                          <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">
                              Certificates
                            </h3>
                            <ul className="space-y-1.5 text-[11px] text-slate-700">
                              {resumeData.certifications.map((c) => (
                                <li key={c.id}>
                                  <strong>{c.name}</strong> - <span className="text-slate-500">{c.issuer}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Right Column (Summary, Projects, Experience, Achievements) */}
                      <div className="col-span-8 space-y-4">
                        {resumeData.summary && (
                          <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b pb-1 mb-1.5">
                              Professional Summary
                            </h3>
                            <p className="text-slate-700 text-justify leading-relaxed">
                              {resumeData.summary}
                            </p>
                          </div>
                        )}

                        {resumeData.projects.length > 0 && (
                          <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">
                              Featured Engineering Projects
                            </h3>
                            <div className="space-y-3">
                              {resumeData.projects.map((p) => (
                                <div key={p.id}>
                                  <div className="font-bold text-slate-900 flex justify-between items-baseline">
                                    <span>{p.title}</span>
                                    {p.link && <span className="text-[10.5px] font-normal text-blue-700">{p.link}</span>}
                                  </div>
                                  <div className="text-[11px] text-slate-500 italic mb-0.5">
                                    {p.technologies}
                                  </div>
                                  <p className="text-slate-700 text-[11.5px] leading-relaxed">
                                    {p.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {resumeData.experiences.length > 0 && (
                          <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">
                              Work & Internships
                            </h3>
                            <div className="space-y-2.5">
                              {resumeData.experiences.map((exp) => (
                                <div key={exp.id}>
                                  <div className="font-bold text-slate-900 flex justify-between">
                                    <span>{exp.role} - {exp.organization}</span>
                                    <span className="text-[11px] text-slate-500 font-normal">{exp.duration}</span>
                                  </div>
                                  <p className="text-slate-700 text-[11.5px] leading-relaxed mt-0.5">
                                    {exp.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {resumeData.achievements.length > 0 && (
                          <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">
                              Awards & Achievements
                            </h3>
                            <ul className="space-y-1 text-[11.5px] text-slate-700 list-disc list-inside">
                              {resumeData.achievements.map((a) => (
                                <li key={a.id}>
                                  <strong>{a.title}</strong> - {a.event} ({a.date})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* TEMPLATE 3: CLASSIC IVY LEAGUE / HARVARD FORMAL           */}
                {/* ========================================================= */}
                {template === 'classic' && (
                  <div className="space-y-4 text-[12px] leading-relaxed font-serif">
                    {/* Centered Classic Header */}
                    <div className="text-center border-b-2 border-slate-900 pb-3">
                      <h1 className="text-3xl font-bold tracking-wide uppercase text-slate-900">
                        {resumeData.fullName}
                      </h1>
                      <div className="text-[11.5px] text-slate-700 mt-1 flex justify-center items-center gap-3 flex-wrap">
                        <span>{resumeData.location}</span>
                        <span>•</span>
                        <span>{resumeData.phone}</span>
                        <span>•</span>
                        <span>{resumeData.email}</span>
                        {resumeData.gitHub && (
                          <>
                            <span>•</span>
                            <span>{resumeData.gitHub}</span>
                          </>
                        )}
                        {resumeData.linkedIn && (
                          <>
                            <span>•</span>
                            <span>{resumeData.linkedIn}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Education First (Classic Academic Style) */}
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                        Education
                      </h2>
                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                          <div>
                            <strong className="text-slate-900">{resumeData.collegeName}</strong>, {resumeData.collegeLocation}
                            <div className="italic text-slate-800">{resumeData.degree}, {resumeData.branch}</div>
                          </div>
                          <div className="text-right">
                            <div>{resumeData.collegeYear}</div>
                            <strong>CGPA: {resumeData.cgpa}</strong>
                          </div>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-700 italic">
                          <span>Class XII (HSC), {resumeData.hscSchool}</span>
                          <span>{resumeData.hscPercentage} | {resumeData.hscYear}</span>
                        </div>
                      </div>
                    </div>

                    {/* Technical Skills */}
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                        Technical Expertise
                      </h2>
                      <div className="space-y-1 text-[11.5px]">
                        <div><strong>Programming Languages:</strong> {resumeData.languages}</div>
                        <div><strong>AI, ML & Deep Learning:</strong> {resumeData.aiMlSkills}</div>
                        <div><strong>Data Science & Web:</strong> {resumeData.webDataSkills}</div>
                        <div><strong>Developer Tools:</strong> {resumeData.toolsPlatforms}</div>
                      </div>
                    </div>

                    {/* Projects */}
                    {resumeData.projects.length > 0 && (
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                          Academic & Technical Projects
                        </h2>
                        <div className="space-y-2.5">
                          {resumeData.projects.map((p) => (
                            <div key={p.id}>
                              <div className="flex justify-between items-baseline font-bold text-slate-900">
                                <span>{p.title}</span>
                                <span className="font-normal italic text-[11px] text-slate-600">{p.technologies}</span>
                              </div>
                              <p className="text-slate-800 text-justify text-[11.5px]">
                                {p.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {resumeData.experiences.length > 0 && (
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                          Experience & Internships
                        </h2>
                        <div className="space-y-2">
                          {resumeData.experiences.map((exp) => (
                            <div key={exp.id}>
                              <div className="flex justify-between font-bold text-slate-900">
                                <span>{exp.role}, {exp.organization}</span>
                                <span className="font-normal">{exp.duration}</span>
                              </div>
                              <p className="text-slate-800 text-[11.5px]">
                                {exp.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Honors & Certifications */}
                    <div className="grid grid-cols-2 gap-4">
                      {resumeData.achievements.length > 0 && (
                        <div>
                          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                            Achievements
                          </h2>
                          <ul className="list-disc list-inside space-y-1 text-[11px]">
                            {resumeData.achievements.map((a) => (
                              <li key={a.id}><strong>{a.title}</strong>, {a.event}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {resumeData.certifications.length > 0 && (
                        <div>
                          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                            Certifications
                          </h2>
                          <ul className="list-disc list-inside space-y-1 text-[11px]">
                            {resumeData.certifications.map((c) => (
                              <li key={c.id}><strong>{c.name}</strong>, {c.issuer}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* TEMPLATE 4: MINIMALIST CLEAN                              */}
                {/* ========================================================= */}
                {template === 'minimal' && (
                  <div className="space-y-4 text-[12px] leading-relaxed">
                    {/* Header */}
                    <div className="pb-3 border-b border-slate-200">
                      <div className="flex justify-between items-baseline flex-wrap">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                          {resumeData.fullName}
                        </h1>
                        <span className="font-semibold text-slate-500 text-xs">
                          {resumeData.professionalTitle}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex gap-3 flex-wrap">
                        <span>{resumeData.email}</span>
                        <span>•</span>
                        <span>{resumeData.phone}</span>
                        <span>•</span>
                        <span>{resumeData.location}</span>
                        {resumeData.gitHub && <><span>•</span><span>{resumeData.gitHub}</span></>}
                      </div>
                    </div>

                    {/* Summary */}
                    {resumeData.summary && (
                      <div>
                        <p className="text-slate-700 text-justify text-[11.5px]">
                          {resumeData.summary}
                        </p>
                      </div>
                    )}

                    {/* Education */}
                    <div>
                      <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                        Education
                      </h2>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <div>
                            <strong className="text-slate-900">{resumeData.degree} in {resumeData.branch}</strong>
                            <div className="text-slate-600 text-[11px]">{resumeData.collegeName}</div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-900">CGPA: {resumeData.cgpa}</span>
                            <div className="text-slate-500 text-[11px]">{resumeData.collegeYear}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                        Technical Skills
                      </h2>
                      <div className="text-[11.5px] space-y-1">
                        <div><strong>Languages:</strong> {resumeData.languages}</div>
                        <div><strong>AI & Machine Learning:</strong> {resumeData.aiMlSkills}</div>
                        <div><strong>Frameworks & Tools:</strong> {resumeData.webDataSkills}, {resumeData.toolsPlatforms}</div>
                      </div>
                    </div>

                    {/* Projects */}
                    {resumeData.projects.length > 0 && (
                      <div>
                        <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                          Projects
                        </h2>
                        <div className="space-y-2">
                          {resumeData.projects.map((p) => (
                            <div key={p.id} className="text-[11.5px]">
                              <div className="flex justify-between font-bold text-slate-900">
                                <span>{p.title}</span>
                                <span className="font-normal text-slate-500 text-[10.5px]">{p.technologies}</span>
                              </div>
                              <p className="text-slate-700 text-justify mt-0.5">{p.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {resumeData.experiences.length > 0 && (
                      <div>
                        <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                          Experience
                        </h2>
                        <div className="space-y-2">
                          {resumeData.experiences.map((exp) => (
                            <div key={exp.id} className="text-[11.5px]">
                              <div className="flex justify-between font-bold text-slate-900">
                                <span>{exp.role} - {exp.organization}</span>
                                <span className="font-normal text-slate-500">{exp.duration}</span>
                              </div>
                              <p className="text-slate-700 mt-0.5">{exp.description}</p>
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

      </div>
    </div>
  )
}
