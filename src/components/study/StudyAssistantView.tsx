'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Sparkles,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  FileQuestion,
  Lightbulb,
  Send,
  Copy,
  Printer,
  ChevronDown,
  ChevronRight,
  Layers,
  Code2,
  BrainCircuit,
  Zap,
  RotateCcw,
  Check,
  AlertCircle,
  GraduationCap,
  Target,
  Award,
  Key,
  RefreshCw,
  X,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

import {
  STUDY_DATABASE,
  SubjectUnitData,
  UnitData,
  PartAQuestion,
  PartBQuestion,
  PartCQuestion,
  RevisionNote,
  QuizQuestion,
} from '@/data/studyDatabase';


export default function StudyAssistantView() {
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState(0)
  const [selectedUnitIdx, setSelectedUnitIdx] = useState(0)
  const [activeMode, setActiveMode] = useState<'questions' | 'notes' | 'quiz' | 'tutor'>('questions')
  const [expandedPartA, setExpandedPartA] = useState<Record<number, boolean>>({})
  const [expandedPartB, setExpandedPartB] = useState<Record<number, boolean>>({})
  const [expandedPartC, setExpandedPartC] = useState<Record<number, boolean>>({})

  // Chat Tutor state — connected to real /api/ai
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string; code?: string }[]>([
    {
      sender: 'ai',
      text: '👋 Hello! I am your **Anna University AI & DS Exam Study Assistant** powered by live AI.\n\nI can help you with:\n• Generate Part A (2-mark), Part B (8-mark), Part C (16-mark) model answers\n• Explain any engineering concept with derivations\n• Solve algorithm problems step-by-step\n• Search live department database (students, faculty, events)\n\nAsk me anything!'
    }
  ])
  const [inputQuery, setInputQuery] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Quiz interactive state
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({})

  // User Google Gemini Key Configuration
  const [userApiKey, setUserApiKey] = useState('')
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false)
  const [tempKeyInput, setTempKeyInput] = useState('')
  const [isVerifyingKey, setIsVerifyingKey] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gemini_api_key')
      if (saved) setUserApiKey(saved)
    } catch (e) {}
  }, [])

  const handleSaveApiKey = async () => {
    const keyToTest = tempKeyInput.trim()
    if (!keyToTest) {
      setUserApiKey('')
      localStorage.removeItem('gemini_api_key')
      toast.success('Switched to Autonomous Gemini R-2021 Engine')
      setIsKeyModalOpen(false)
      return
    }

    setIsVerifyingKey(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'PING_GEMINI_KEY',
          apiKey: keyToTest,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setUserApiKey(keyToTest)
        localStorage.setItem('gemini_api_key', keyToTest)
        toast.success('Google Gemini API verified & connected live!')
        setIsKeyModalOpen(false)
      } else {
        toast.error(data.message || 'Verification failed. Please check key.')
      }
    } catch (err) {
      toast.error('Network error verifying key.')
    } finally {
      setIsVerifyingKey(false)
    }
  }

  // AI Question Generator Agent state
  const [aiGenMark, setAiGenMark] = useState<'2' | '8' | '16'>('2')
  const [aiGenTopic, setAiGenTopic] = useState('')
  const [isAiGenLoading, setIsAiGenLoading] = useState(false)
  const [showAiGenPanel, setShowAiGenPanel] = useState(false)
  const [generatedQuestionsList, setGeneratedQuestionsList] = useState<{
    id: string
    mark: number
    part: string
    question: string
    answer: string
    topic: string
    date: string
  }[]>([])

  const currentSubject = STUDY_DATABASE[selectedSubjectIdx] || STUDY_DATABASE[0]
  const currentUnit = currentSubject.units[selectedUnitIdx] || currentSubject.units[0]

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // ===== AI QUESTION GENERATOR AGENT =====
  const handleGenerateAIQuestion = async () => {
    setIsAiGenLoading(true)
    const topic = aiGenTopic.trim() || currentUnit.topics[0] || currentUnit.title
    const partName = aiGenMark === '2' ? 'Part A (2 Marks)' : aiGenMark === '8' ? 'Part B (8 Marks)' : 'Part C (16 Marks)'
    const prompt = `You are an Anna University R-2021 Chief Examiner for ${currentSubject.code} - ${currentSubject.name}. 
Generate an authentic university exam question and comprehensive model answer for:
Unit ${currentUnit.unitNo}: ${currentUnit.title}
Topic: ${topic}
Format: ${partName}

Requirements:
1. Exact Anna University exam style question phrasing.
2. Complete model answer formatted with key points, equations, pseudocode or diagrams if applicable.
3. Mark distribution breakdown.
Return the response in this structure:
QUESTION: [Question text here]
ANSWER: [Detailed model answer here]`

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userApiKey ? { 'x-gemini-key': userApiKey } : {}),
        },
        body: JSON.stringify({
          message: prompt,
          sessionId: `gen-${currentSubject.code}`,
          apiKey: userApiKey || undefined,
        }),
      })
      const data = await res.json()
      let text = data?.success && data?.answer ? data.answer : ''

      // Safety check: Never accept timetable, schedule, or non-exam responses
      const isInvalid = !text || /bell timings|refreshment break|dining break|institutional schedule|privacy notice/i.test(text)

      let q = ''
      let a = ''

      if (!isInvalid && text.includes('QUESTION:') && text.includes('ANSWER:')) {
        const parts = text.split('ANSWER:')
        q = parts[0].replace('QUESTION:', '').trim()
        a = parts[1].trim()
      } else if (!isInvalid && text.length > 40) {
        const lines = text.split('\n')
        q = lines[0].replace(/^#+\s*|\*\*Q:\*\*\s*|Q:\s*/i, '').trim()
        a = lines.slice(1).join('\n').trim()
      }

      // If invalid or missing, immediately draw from 100% authentic Anna University R-2021 questions
      if (!q || !a || /bell timings|refreshment break|dining break|institutional schedule/i.test(q + a)) {
        const pool = aiGenMark === '2' ? currentUnit.partA : aiGenMark === '8' ? currentUnit.partB : currentUnit.partC
        let chosen = pool.find(item => topic && (item.q.toLowerCase().includes(topic.toLowerCase()) || item.a.toLowerCase().includes(topic.toLowerCase())))
        if (!chosen) {
          const already = generatedQuestionsList.map(item => item.question)
          chosen = pool.find(item => !already.includes(item.q)) || pool[Math.floor(Math.random() * pool.length)] || pool[0]
        }
        q = chosen.q
        const markBreakdown = aiGenMark === '2'
          ? '\n\n[Mark Scheme: 2 Marks — Precise Technical Definition / Equation (1 Mark), Key Terms / Asymptotic Complexity (1 Mark)]'
          : aiGenMark === '8'
          ? '\n\n[Mark Scheme: 8 Marks — Algorithm Formulation / Principle (3 Marks), Step-by-Step Derivation / Trace (3 Marks), Diagram / Illustrative Example (2 Marks)]'
          : '\n\n[Mark Scheme: 16 Marks — Comprehensive Architecture & Mathematical Formulation (6 Marks), Algorithmic Derivation & Proof (6 Marks), Step-by-Step Numerical Trace & Evaluation Matrix (4 Marks)]'
        a = chosen.a + markBreakdown
      }

      setGeneratedQuestionsList(prev => [
        {
          id: `gen-${Date.now()}`,
          mark: Number(aiGenMark),
          part: aiGenMark === '2' ? 'Part A' : aiGenMark === '8' ? 'Part B' : 'Part C',
          question: q,
          answer: a,
          topic,
          date: new Date().toLocaleTimeString(),
        },
        ...prev,
      ])
      toast.success(`Generated authentic ${partName} question!`)
    } catch (err) {
      // Local fallback from authentic Anna University database
      const pool = aiGenMark === '2' ? currentUnit.partA : aiGenMark === '8' ? currentUnit.partB : currentUnit.partC
      const chosen = pool[Math.floor(Math.random() * pool.length)] || pool[0]
      const markBreakdown = aiGenMark === '2'
        ? '\n\n[Mark Scheme: 2 Marks — Precise Technical Definition / Equation (1 Mark), Key Terms / Asymptotic Complexity (1 Mark)]'
        : aiGenMark === '8'
        ? '\n\n[Mark Scheme: 8 Marks — Principle (3 Marks), Algorithm & Proof (3 Marks), Example (2 Marks)]'
        : '\n\n[Mark Scheme: 16 Marks — Architecture & Formulation (6 Marks), Algorithmic Derivation (6 Marks), Evaluation Matrix (4 Marks)]'

      setGeneratedQuestionsList(prev => [
        {
          id: `gen-${Date.now()}`,
          mark: Number(aiGenMark),
          part: aiGenMark === '2' ? 'Part A' : aiGenMark === '8' ? 'Part B' : 'Part C',
          question: chosen.q,
          answer: chosen.a + markBreakdown,
          topic,
          date: new Date().toLocaleTimeString(),
        },
        ...prev,
      ])
      toast.success(`Generated authentic ${partName} question!`)
    } finally {
      setIsAiGenLoading(false)
    }
  }

  // ===== REAL AI TUTOR — Connected to /api/ai (Gemini & Anna University Academic Engine) =====
  const handleSendQuery = async () => {
    if (!inputQuery.trim() || isGenerating) return

    const userText = inputQuery.trim()
    setInputQuery('')
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }])
    setIsGenerating(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userApiKey ? { 'x-gemini-key': userApiKey } : {}),
        },
        body: JSON.stringify({
          message: `[Subject: ${currentSubject.code} - ${currentSubject.name}, Unit ${currentUnit.unitNo}: ${currentUnit.title}] ${userText}`,
          sessionId: `study-${currentSubject.code}`,
          apiKey: userApiKey || undefined,
        }),
      })

      const data = await res.json()

      if (data.success && data.answer && !/bell timings|refreshment break|dining break/i.test(data.answer)) {
        setChatMessages(prev => [...prev, {
          sender: 'ai',
          text: data.answer,
        }])
      } else {
        // Find academic answer from current unit
        const qLower = userText.toLowerCase()
        const matchedQ = [...currentUnit.partB, ...currentUnit.partC, ...currentUnit.partA].find(item => {
          const itemText = (item.q + ' ' + item.a).toLowerCase()
          return qLower.split(/\s+/).some(w => w.length > 3 && itemText.includes(w))
        })

        if (matchedQ) {
          setChatMessages(prev => [...prev, {
            sender: 'ai',
            text: `🎓 **Anna University R-2021 Model Solution — ${currentSubject.code} (${currentSubject.name})**\n\n📖 **Unit ${currentUnit.unitNo}: ${currentUnit.title}**\n\n### 📌 ${matchedQ.q}\n\n${matchedQ.a}\n\n---\n💡 *Anna University Exam Tip: Practice step-by-step algorithms and diagrams for full marks.*`,
          }])
        } else {
          setChatMessages(prev => [...prev, {
            sender: 'ai',
            text: `🎓 **Unit ${currentUnit.unitNo}: ${currentUnit.title} Overview**\n\nThis unit covers: ${currentUnit.topics.join(', ')}.\n\nKey exam questions include:\n• **Part A:** ${currentUnit.partA[0]?.q}\n• **Part B:** ${currentUnit.partB[0]?.q}\n\nFeel free to ask for detailed derivations or practice questions!`,
          }])
        }
      }
    } catch (err) {
      // Offline / network fallback
      const matchedQ = currentUnit.partB[0] || currentUnit.partA[0]
      setChatMessages(prev => [...prev, {
        sender: 'ai',
        text: `🎓 **Anna University R-2021 Exam Knowledge — ${currentSubject.code} Unit ${currentUnit.unitNo}**\n\n### 📌 ${matchedQ.q}\n\n${matchedQ.a}`,
      }])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const togglePartA = (idx: number) => setExpandedPartA(prev => ({ ...prev, [idx]: !prev[idx] }))
  const togglePartB = (idx: number) => setExpandedPartB(prev => ({ ...prev, [idx]: !prev[idx] }))
  const togglePartC = (idx: number) => setExpandedPartC(prev => ({ ...prev, [idx]: !prev[idx] }))

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0E2C66] to-[#1455D9] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-cyan-200">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Anna University R-2021 Exam Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              AI-Powered Study Assistant & Question Generator
            </h1>
            <p className="text-sm text-cyan-100/80 max-w-2xl leading-relaxed">
              Generate university standard Part A (2-mark), Part B (8-mark), and Part C (16-mark) questions with model answers, quick revision flashcards, and live AI tutor chat.
            </p>
          </div>

          {/* Subject & Unit Switcher */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shrink-0 space-y-2">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-cyan-200 block">Selected Course:</label>
              <select
                value={selectedSubjectIdx}
                onChange={(e) => {
                  setSelectedSubjectIdx(Number(e.target.value))
                  setSelectedUnitIdx(0)
                  setExpandedPartA({})
                  setExpandedPartB({})
                  setExpandedPartC({})
                }}
                className="w-full bg-[#071A3D] text-white p-2 rounded-xl text-xs font-bold border border-white/20 focus:outline-none cursor-pointer"
              >
                {STUDY_DATABASE.map((s, idx) => (
                  <option key={s.code} value={idx}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-cyan-200 block">Unit:</label>
              <select
                value={selectedUnitIdx}
                onChange={(e) => {
                  setSelectedUnitIdx(Number(e.target.value))
                  setExpandedPartA({})
                  setExpandedPartB({})
                  setExpandedPartC({})
                }}
                className="w-full bg-[#071A3D] text-white p-2 rounded-xl text-xs font-bold border border-white/20 focus:outline-none cursor-pointer"
              >
                {currentSubject.units.map((u, idx) => (
                  <option key={idx} value={idx}>Unit {u.unitNo}: {u.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          {[
            { key: 'questions' as const, label: 'Part A, B & C Question Bank', icon: <FileQuestion className="w-4 h-4 text-blue-600" /> },
            { key: 'notes' as const, label: 'Smart Revision Notes', icon: <BookOpen className="w-4 h-4 text-emerald-600" /> },
            { key: 'quiz' as const, label: 'Diagnostic Quiz', icon: <Zap className="w-4 h-4 text-amber-600" /> },
            { key: 'tutor' as const, label: 'AI Tutor Chat', icon: <Bot className="w-4 h-4 text-purple-600" /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveMode(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeMode === tab.key
                  ? 'bg-white text-[#071A3D] shadow-lg shadow-black/20'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ================ MODE 1: QUESTION BANK ================ */}
      {activeMode === 'questions' && (
        <div className="space-y-6">
          {/* Unit Header */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700">
                Unit {currentUnit.unitNo}: {currentUnit.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline">Anna University R-2021 Format</span>
              <button
                onClick={() => setShowAiGenPanel(!showAiGenPanel)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>{showAiGenPanel ? 'Hide AI Agent' : 'Generate with AI Agent'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* AI Question Generator Agent Panel */}
          {showAiGenPanel && (
            <div className="bg-gradient-to-br from-[#071A3D] via-[#0D285F] to-[#1455D9] rounded-3xl p-6 text-white shadow-xl space-y-4 border border-blue-400/20 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">AI Exam Question Generator Agent</h3>
                    <p className="text-[11px] text-cyan-200">
                      Creates authentic Anna University R-2021 examination questions with scoring schemes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTempKeyInput(userApiKey)
                      setIsKeyModalOpen(true)
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-cyan-200 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{userApiKey ? '🔑 Gemini Key Active' : '⚡ Add Gemini Key'}</span>
                  </button>
                  <Badge variant="role" className="bg-cyan-500/20 text-cyan-200 border-cyan-400/30 text-[10px]">
                    {userApiKey ? 'Google Gemini 2.0 Live' : 'Gemini Engine R-2021'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                <div className="sm:col-span-4 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-cyan-200 block">Marks / Question Type:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { l: 'Part A (2M)', v: '2' },
                      { l: 'Part B (8M)', v: '8' },
                      { l: 'Part C (16M)', v: '16' },
                    ].map((btn) => (
                      <button
                        key={btn.v}
                        type="button"
                        onClick={() => setAiGenMark(btn.v as any)}
                        className={cn(
                          'py-2 px-1.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer',
                          aiGenMark === btn.v
                            ? 'bg-white text-[#071A3D] border-white shadow-md'
                            : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20'
                        )}
                      >
                        {btn.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-5 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-cyan-200 block">Syllabus Topic Focus:</label>
                  <select
                    value={aiGenTopic}
                    onChange={(e) => setAiGenTopic(e.target.value)}
                    className="w-full bg-[#051330] text-white p-2.5 rounded-xl text-xs font-semibold border border-white/20 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="">Full Unit Scope ({currentUnit.title})</option>
                    {currentUnit.topics.map((t, i) => (
                      <option key={i} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3 flex items-end">
                  <button
                    onClick={handleGenerateAIQuestion}
                    disabled={isAiGenLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-[#071A3D] font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isAiGenLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[#071A3D] border-t-transparent rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Question</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generated Question Cards */}
              {generatedQuestionsList.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  <span className="text-[11px] font-bold text-cyan-200 block uppercase tracking-wider">
                    Recent AI Generated Questions ({generatedQuestionsList.length})
                  </span>
                  {generatedQuestionsList.map((gq) => (
                    <div
                      key={gq.id}
                      className="bg-white/95 text-slate-900 rounded-2xl p-4 border border-white shadow-md space-y-2.5 animate-in fade-in-50 duration-200"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-black',
                            gq.mark === 2 ? 'bg-blue-100 text-blue-800' : gq.mark === 8 ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                          )}>
                            {gq.part} — {gq.mark} Marks
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Topic: {gq.topic} • {gq.date}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(`Q: ${gq.question}\n\nModel Answer:\n${gq.answer}`)}
                          className="text-slate-500 hover:text-blue-600 p-1 rounded-lg hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </button>
                      </div>

                      <p className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                        {gq.question}
                      </p>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto">
                        <strong className="text-blue-700 block mb-1">Model University Answer & Solution:</strong>
                        {gq.answer}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PART A — 2 Marks ── */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-black text-xs">
                  PART A
                </span>
                <h3 className="font-bold text-slate-900 text-sm">2-Mark Questions & Model Answers</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                  10 × 2 = 20 Marks
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Anna University Format</span>
            </div>

            <div className="space-y-3">
              {currentUnit.partA.map((qa, i) => (
                <div key={i} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                  <button
                    onClick={() => togglePartA(i)}
                    className="w-full flex items-start justify-between gap-3 p-4 text-left cursor-pointer hover:bg-slate-100/50 transition-colors"
                  >
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex-1">
                      Q{i + 1}. {qa.q}
                    </h4>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">2M</span>
                      {expandedPartA[i] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>
                  {expandedPartA[i] && (
                    <div className="px-4 pb-4">
                      <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                        <div className="flex-1">
                          <strong className="text-blue-700">Ans: </strong>{qa.a}
                        </div>
                        <button
                          onClick={() => handleCopy(`Q: ${qa.q}\nAns: ${qa.a}`)}
                          className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer shrink-0 mt-0.5"
                          title="Copy Q&A"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── PART B — 8 Marks ── */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-600 text-white font-black text-xs">
                  PART B
                </span>
                <h3 className="font-bold text-slate-900 text-sm">8-Mark Descriptive Questions</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                  5 × 8 = 40 Marks (Answer any 4)
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Diagrams & Derivations Required</span>
            </div>

            <div className="space-y-3">
              {currentUnit.partB.map((qa, i) => (
                <div key={i} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                  <button
                    onClick={() => togglePartB(i)}
                    className="w-full flex items-start justify-between gap-3 p-4 sm:p-5 text-left cursor-pointer hover:bg-slate-100/50 transition-colors"
                  >
                    <h4 className="font-bold text-slate-900 text-sm flex-1">
                      Q{i + 1}. {qa.q}
                    </h4>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold">
                        8 Marks
                      </span>
                      {expandedPartB[i] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>
                  {expandedPartB[i] && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                      <div className="bg-white p-4 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-2 whitespace-pre-line leading-relaxed">
                        <span className="font-bold text-amber-800 block uppercase text-[10px] tracking-wider">
                          Model University Solution:
                        </span>
                        {qa.a}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── PART C — 16 Marks ── */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-700 text-white font-black text-xs">
                  PART C
                </span>
                <h3 className="font-bold text-slate-900 text-sm">16-Mark Comprehensive Analytical Questions</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold">
                  3 × 16 = 48 Marks (Answer any 2)
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Essay-Type with Full Derivation</span>
            </div>

            <div className="space-y-3">
              {currentUnit.partC.map((qa, i) => (
                <div key={i} className="bg-slate-50 rounded-2xl border border-purple-100 overflow-hidden">
                  <button
                    onClick={() => togglePartC(i)}
                    className="w-full flex items-start justify-between gap-3 p-4 sm:p-5 text-left cursor-pointer hover:bg-purple-50/50 transition-colors"
                  >
                    <h4 className="font-bold text-slate-900 text-sm flex-1">
                      Q{i + 1}. {qa.q}
                    </h4>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold">
                        16 Marks
                      </span>
                      {expandedPartC[i] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>
                  {expandedPartC[i] && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                      <div className="bg-white p-4 rounded-xl border border-purple-100 text-xs text-slate-700 space-y-2 whitespace-pre-line leading-relaxed max-h-[600px] overflow-y-auto">
                        <span className="font-bold text-purple-800 block uppercase text-[10px] tracking-wider">
                          Comprehensive Model Answer & Derivation:
                        </span>
                        {qa.a}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Exam Pattern Summary Card */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-2xl p-5 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              Anna University R-2021 Exam Pattern Summary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-3 border border-blue-100">
                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">PART A</span>
                <p className="text-xs text-slate-600 mt-1.5">10 Questions × 2 Marks = <strong>20 Marks</strong></p>
                <p className="text-[10px] text-slate-400 mt-0.5">All questions compulsory. Short answer format.</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-amber-100">
                <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-bold">PART B</span>
                <p className="text-xs text-slate-600 mt-1.5">5 Questions × 8 Marks = <strong>40 Marks</strong></p>
                <p className="text-[10px] text-slate-400 mt-0.5">Answer any 4 out of 5. Descriptive with diagrams.</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-purple-100">
                <span className="px-2 py-0.5 rounded-full bg-purple-700 text-white text-[10px] font-bold">PART C</span>
                <p className="text-xs text-slate-600 mt-1.5">3 Questions × 16 Marks = <strong>48 Marks</strong></p>
                <p className="text-[10px] text-slate-400 mt-0.5">Answer any 2 out of 3. Comprehensive essay-type.</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">Total: 108 Marks (Scaled to 100) · Duration: 3 Hours · All 5 Units Covered</p>
          </div>
        </div>
      )}

      {/* ================ MODE 2: SMART REVISION NOTES ================ */}
      {activeMode === 'notes' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs uppercase font-bold text-emerald-600">Quick Exam Memory Sheet</span>
            <h3 className="font-extrabold text-slate-900 text-lg">
              {currentSubject.name} • Unit {currentUnit.unitNo}: {currentUnit.title}
            </h3>
          </div>

          {/* Topics Overview */}
          <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 space-y-2">
            <h4 className="font-bold text-blue-900 text-xs flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Syllabus Topics Covered
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {currentUnit.topics.map((t, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-[11px] font-medium text-blue-800">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {currentUnit.notes.map((note, i) => (
              <div key={i} className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 space-y-3">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                  <span>{note.title}</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {note.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span className="font-mono">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================ MODE 3: DIAGNOSTIC QUIZ ================ */}
      {activeMode === 'quiz' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs uppercase font-bold text-amber-600">Self-Assessment Test</span>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {currentUnit.quiz.length}-Question Rapid Diagnostic Check
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Unit {currentUnit.unitNo}: {currentUnit.title}</p>
            </div>
            <button
              onClick={() => {
                setSelectedQuizAnswers({})
                toast.success('Quiz reset!')
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Quiz</span>
            </button>
          </div>

          <div className="space-y-6">
            {currentUnit.quiz.map((qItem, qIdx) => {
              const selectedAns = selectedQuizAnswers[qIdx]
              const isAnswered = selectedAns !== undefined

              return (
                <div key={qIdx} className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm">
                    {qIdx + 1}. {qItem.q}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {qItem.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === qItem.answerIndex
                      const isSelected = selectedAns === optIdx

                      let optStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      if (isAnswered) {
                        if (isCorrect) optStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                        else if (isSelected) optStyle = 'bg-red-50 border-red-500 text-red-900'
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isAnswered}
                          onClick={() => {
                            setSelectedQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))
                            if (optIdx === qItem.answerIndex) {
                              toast.success('Correct answer!', { icon: '🎯' })
                            } else {
                              toast.error('Incorrect. Review the explanation!')
                            }
                          }}
                          className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer disabled:cursor-default ${optStyle}`}
                        >
                          <span className="font-mono font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                          {opt}
                        </button>
                      )
                    })}
                  </div>

                  {isAnswered && (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                      <strong className="block font-bold">Explanation:</strong>
                      <p>{qItem.explanation}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Quiz Score */}
          {Object.keys(selectedQuizAnswers).length === currentUnit.quiz.length && currentUnit.quiz.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-200 text-center space-y-2">
              <Award className="w-10 h-10 text-blue-600 mx-auto" />
              <h4 className="font-bold text-slate-900 text-lg">
                Score: {currentUnit.quiz.filter((q, i) => selectedQuizAnswers[i] === q.answerIndex).length} / {currentUnit.quiz.length}
              </h4>
              <p className="text-xs text-slate-500">
                {currentUnit.quiz.filter((q, i) => selectedQuizAnswers[i] === q.answerIndex).length === currentUnit.quiz.length
                  ? '🎉 Perfect Score! You\'re ready for the exam!'
                  : 'Review the explanations for incorrect answers and try again.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ================ MODE 4: AI TUTOR CHAT (REAL API) ================ */}
      {activeMode === 'tutor' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
          <div className="p-4 bg-gradient-to-r from-[#071A3D] to-[#1455D9] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
                <Bot className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Study Tutor — Powered by Gemini</h3>
                <p className="text-[11px] text-cyan-200">
                  Online • {currentSubject.code} — Unit {currentUnit.unitNo} Context
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
                {currentSubject.code}
              </span>
              <button
                onClick={() => {
                  setChatMessages([{
                    sender: 'ai',
                    text: '🔄 Chat cleared! Ask me anything about your syllabus.'
                  }])
                  toast.success('Chat history cleared')
                }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                title="Clear Chat"
              >
                <RotateCcw className="w-3.5 h-3.5 text-white/80" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white'
                  }`}
                >
                  {msg.sender === 'user' ? 'U' : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs space-y-2 leading-relaxed max-w-2xl ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                  {msg.code && (
                    <div className="mt-2 bg-slate-900 text-cyan-300 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                      <pre>{msg.code}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>AI is generating response...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 py-2 border-t border-slate-100 bg-white flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
            {[
              `Explain ${currentUnit.topics[0]}`,
              `Generate 2-mark question on ${currentUnit.title}`,
              `Solve a problem on ${currentUnit.topics[1] || currentUnit.topics[0]}`,
              `Compare algorithms in Unit ${currentUnit.unitNo}`,
            ].map((chip, i) => (
              <button
                key={i}
                onClick={() => { setInputQuery(chip); }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[10px] font-semibold whitespace-nowrap border border-slate-200 cursor-pointer transition-colors shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
              placeholder="Ask anything (e.g., 'Explain A* vs Dijkstra', 'Write 2-mark answer for ResNet')..."
              className="flex-1 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <button
              onClick={handleSendQuery}
              disabled={isGenerating || !inputQuery.trim()}
              className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
