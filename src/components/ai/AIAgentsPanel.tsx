'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import {
  Bot, Brain, Zap, Shield, Database, MessageSquare, TrendingUp,
  Activity, CheckCircle2, AlertCircle, Clock, Users, BookOpen,
  Calendar, Bell, RefreshCw, Settings, ChevronRight, Send,
  Sparkles, Target, BarChart2, Cpu, Globe, Lock, Play, Pause,
  Download, Upload, Filter, Search, X, ChevronDown, Layers
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface AgentStat {
  label: string
  value: string | number
  delta?: string
  trend?: 'up' | 'down' | 'neutral'
  color: string
  icon: React.ReactNode
}

interface AIAgent {
  id: string
  name: string
  role: string
  description: string
  status: 'active' | 'idle' | 'training' | 'offline'
  accuracy: number
  queriesHandled: number
  avgResponseMs: number
  knowledgeDomains: string[]
  lastActive: string
  icon: string
  color: string
}

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'bot'
  time: string
  agent?: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const AI_AGENTS: AIAgent[] = [
  {
    id: 'vsb-core',
    name: 'VSB Core Assistant',
    role: 'Primary Query Handler',
    description: 'Handles all student, faculty, and admin queries about academic schedules, subjects, attendance, and portal features with real-time database access.',
    status: 'active',
    accuracy: 97.4,
    queriesHandled: 12847,
    avgResponseMs: 42,
    knowledgeDomains: ['Academics', 'Attendance', 'Subjects', 'Schedule', 'Portal'],
    lastActive: 'Just now',
    icon: '🤖',
    color: '#1455D9',
  },
  {
    id: 'faculty-advisor',
    name: 'Faculty & Advisor AI',
    role: 'Advisor Intelligence',
    description: 'Specialized in faculty directory, class advisor allocations, OD applications, and attendance management for the faculty portal.',
    status: 'active',
    accuracy: 95.8,
    queriesHandled: 4231,
    avgResponseMs: 38,
    knowledgeDomains: ['Faculty', 'OD Management', 'Advisors', 'Attendance Verification'],
    lastActive: '2 min ago',
    icon: '👨‍🏫',
    color: '#059669',
  },
  {
    id: 'notification-ai',
    name: 'Notification Intelligence',
    role: 'Alert & Broadcast Engine',
    description: 'Monitors portal activity, auto-categorizes announcements, and intelligently routes departmental alerts to relevant recipients.',
    status: 'active',
    accuracy: 99.1,
    queriesHandled: 28640,
    avgResponseMs: 15,
    knowledgeDomains: ['Alerts', 'Announcements', 'Events', 'Broadcast'],
    lastActive: 'Just now',
    icon: '🔔',
    color: '#D97706',
  },
  {
    id: 'syllabus-parser',
    name: 'Syllabus & Curriculum AI',
    role: 'Curriculum Interpreter',
    description: 'Parses and understands question banks, study resources, and syllabus documents for the R2023 regulation curriculum.',
    status: 'idle',
    accuracy: 93.2,
    queriesHandled: 1890,
    avgResponseMs: 78,
    knowledgeDomains: ['Syllabus', 'Question Banks', 'Curriculum', 'R2023 Regulation'],
    lastActive: '15 min ago',
    icon: '📚',
    color: '#7C3AED',
  },
  {
    id: 'pass-security',
    name: 'Pass & Security AI',
    role: 'Access Control Monitor',
    description: 'Validates digital gate passes, hostel/bus pass approvals, and monitors access events with smart anomaly detection.',
    status: 'active',
    accuracy: 99.9,
    queriesHandled: 6723,
    avgResponseMs: 11,
    knowledgeDomains: ['Gate Pass', 'Bus Pass', 'Hostel', 'Security', 'Transport'],
    lastActive: '30 sec ago',
    icon: '🛡️',
    color: '#DC2626',
  },
  {
    id: 'analytics-engine',
    name: 'Analytics & Insights AI',
    role: 'Data Intelligence Engine',
    description: 'Generates departmental performance analytics, attendance trends, placement insights, and generates automated reports.',
    status: 'training',
    accuracy: 88.5,
    queriesHandled: 340,
    avgResponseMs: 210,
    knowledgeDomains: ['Analytics', 'Reports', 'Performance', 'Trends', 'Placement'],
    lastActive: '1 hr ago',
    icon: '📊',
    color: '#0891B2',
  },
]

const KNOWLEDGE_MODULES = [
  { name: 'Academic Calendar 2024-25', status: 'loaded', size: '24 KB', updated: 'Sep 15' },
  { name: 'R2023 Curriculum Subjects', status: 'loaded', size: '128 KB', updated: 'Sep 10' },
  { name: 'Faculty Directorate', status: 'loaded', size: '45 KB', updated: 'Sep 20' },
  { name: 'Attendance Regulations', status: 'loaded', size: '18 KB', updated: 'Aug 28' },
  { name: 'Portal Governance & Rules', status: 'loaded', size: '32 KB', updated: 'Sep 1' },
  { name: 'Gate Pass & Bus Pass SOP', status: 'loaded', size: '22 KB', updated: 'Sep 5' },
  { name: 'OD Application Policy', status: 'loaded', size: '15 KB', updated: 'Sep 3' },
  { name: 'Hostel Regulations', status: 'loaded', size: '19 KB', updated: 'Aug 20' },
  { name: 'Question Bank R2023 Sem 1', status: 'loaded', size: '380 KB', updated: 'Sep 12' },
  { name: 'Question Bank R2023 Sem 2', status: 'loaded', size: '420 KB', updated: 'Sep 12' },
  { name: 'Placement Statistics 2024', status: 'loaded', size: '56 KB', updated: 'Sep 18' },
  { name: 'Department Announcements', status: 'syncing', size: 'Live', updated: 'Now' },
  { name: 'Student Performance Data', status: 'syncing', size: 'Live', updated: 'Now' },
  { name: 'Notification History', status: 'syncing', size: 'Live', updated: 'Now' },
]

const QUICK_PROMPTS = [
  'How many active students are enrolled?',
  'What is the current attendance threshold?',
  'List all AI & DS faculty members',
  'Show upcoming college events',
  'What are OD application procedures?',
  'Explain the R2023 curriculum structure',
]

function getTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AIAgent['status'] }) {
  const config = {
    active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    idle: { label: 'Idle', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
    training: { label: 'Training', color: 'bg-violet-100 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
    offline: { label: 'Offline', color: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400' },
  }[status]

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border', config.color)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot, status === 'active' && 'animate-pulse')} />
      {config.label}
    </span>
  )
}

// ─── Agent Card ───────────────────────────────────────────────────────────────

function AgentCard({ agent, isSelected, onSelect }: {
  agent: AIAgent
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left p-4 rounded-2xl border transition-all duration-200 group cursor-pointer',
        isSelected
          ? 'border-[#1455D9] bg-[#1455D9]/5 ring-2 ring-[#1455D9]/20 shadow-md'
          : 'border-gray-200 bg-white hover:border-[#1455D9]/50 hover:shadow-md hover:bg-blue-50/30'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Agent Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm"
          style={{ backgroundColor: agent.color + '18', border: `1.5px solid ${agent.color}30` }}
        >
          {agent.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-black text-[#071A3D] leading-tight">{agent.name}</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-0.5">{agent.role}</p>
            </div>
            <StatusBadge status={agent.status} />
          </div>

          {/* Mini Stats */}
          <div className="flex items-center gap-3 mt-2.5">
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
              <Target className="w-3 h-3 text-[#1455D9]" />
              <span>{agent.accuracy}%</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>{agent.avgResponseMs}ms</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
              <MessageSquare className="w-3 h-3 text-emerald-500" />
              <span>{agent.queriesHandled.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

// ─── Agent Detail Panel ──────────────────────────────────────────────────────

function AgentDetailPanel({ agent }: { agent: AIAgent }) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#071A3D] to-[#1455D9] text-white">
        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-3xl shadow-inner">
          {agent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-black leading-tight">{agent.name}</h3>
            <StatusBadge status={agent.status} />
          </div>
          <p className="text-blue-200 text-xs font-semibold mt-0.5">{agent.role}</p>
          <p className="text-blue-100/80 text-[11px] mt-1.5 leading-relaxed">{agent.description}</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Accuracy', value: `${agent.accuracy}%`, icon: <Target className="w-4 h-4" />, color: 'text-[#1455D9]', bg: 'bg-blue-50' },
          { label: 'Avg Response', value: `${agent.avgResponseMs}ms`, icon: <Zap className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Queries Handled', value: agent.queriesHandled.toLocaleString(), icon: <MessageSquare className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((m) => (
          <div key={m.label} className={cn('rounded-xl p-3.5 border border-gray-100 text-center', m.bg)}>
            <div className={cn('flex justify-center mb-1', m.color)}>{m.icon}</div>
            <p className={cn('text-lg font-black', m.color)}>{m.value}</p>
            <p className="text-[10px] font-semibold text-gray-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Accuracy Progress Bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-black text-[#071A3D]">Accuracy Score</p>
          <p className="text-xs font-black text-[#1455D9]">{agent.accuracy}%</p>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#1455D9] to-[#22C7E8] transition-all duration-700"
            style={{ width: `${agent.accuracy}%` }}
          />
        </div>
      </div>

      {/* Knowledge Domains */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <p className="text-xs font-black text-[#071A3D] mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#1455D9]" />
          Knowledge Domains
        </p>
        <div className="flex flex-wrap gap-2">
          {agent.knowledgeDomains.map((d) => (
            <span key={d} className="px-2.5 py-1 rounded-lg bg-[#1455D9]/8 text-[#1455D9] text-[11px] font-bold border border-[#1455D9]/15">
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Last Active */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <Clock className="w-3.5 h-3.5" />
          Last Active
        </div>
        <span className="text-xs font-black text-[#071A3D]">{agent.lastActive}</span>
      </div>
    </div>
  )
}

// ─── Live Chat Panel ──────────────────────────────────────────────────────────

function LiveChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: '👋 Hello Admin! I\'m your AI Portal Assistant.\n\nI have real-time access to the database — ask me anything about students, faculty, attendance, OD applications, notifications, and portal governance.',
      sender: 'bot',
      time: getTime(),
      agent: 'VSB Core Assistant',
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeAgent, setActiveAgent] = useState('VSB Core Assistant')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = useCallback(async (text?: string) => {
    const query = (text || input).trim()
    if (!query || isTyping) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      text: query,
      sender: 'user',
      time: getTime(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch(`/api/ai?q=${encodeURIComponent(query)}`, { cache: 'no-store' })
      const data = await res.json()

      await new Promise((r) => setTimeout(r, 300 + Math.random() * 200))

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        text: data.success && data.response?.answer
          ? data.response.answer
          : (data.answer || "I couldn't find that information. Please try rephrasing."),
        sender: 'bot',
        time: getTime(),
        agent: activeAgent,
      }
      setMessages((prev) => [...prev, botMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, text: '⚠️ Network error. Please try again.', sender: 'bot', time: getTime() },
      ])
    } finally {
      setIsTyping(false)
      inputRef.current?.focus()
    }
  }, [input, isTyping, activeAgent])

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      {/* Agent Selector */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-100 shrink-0 overflow-x-auto">
        {AI_AGENTS.filter((a) => a.status === 'active').map((a) => (
          <button
            key={a.id}
            onClick={() => setActiveAgent(a.name)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer border',
              activeAgent === a.name
                ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#1455D9]/50'
            )}
          >
            <span>{a.icon}</span>
            <span className="hidden sm:inline">{a.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin' }}>
        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="space-y-2 mb-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Admin Quick Queries</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-gray-200 text-left hover:border-[#1455D9]/50 hover:bg-blue-50/40 transition-all text-xs text-gray-700 font-medium cursor-pointer shadow-sm"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#1455D9] shrink-0" />
                  <span className="line-clamp-1">{p}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex gap-2.5', msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.sender === 'bot' && (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#1455D9] to-[#22C7E8] flex items-center justify-center shrink-0 mt-0.5 text-white shadow-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div className={cn('max-w-[84%]', msg.sender === 'user' ? 'order-first' : '')}>
              {msg.sender === 'bot' && msg.agent && (
                <p className="text-[9px] font-bold text-gray-400 mb-0.5 pl-1">{msg.agent}</p>
              )}
              <div className={cn(
                'rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs',
                msg.sender === 'user'
                  ? 'bg-[#1455D9] text-white rounded-tr-xs'
                  : 'bg-white border border-gray-200/80 text-gray-800 rounded-tl-xs whitespace-pre-line'
              )}>
                {msg.text}
              </div>
              <p className={cn('text-[10px] text-gray-400 mt-0.5 px-1', msg.sender === 'user' ? 'text-right' : '')}>{msg.time}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#1455D9] to-[#22C7E8] flex items-center justify-center shrink-0 text-white">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1455D9] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1455D9] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1455D9] animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-[10px] text-gray-400 ml-1">AI thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
          placeholder="Ask the AI agents anything about the portal..."
          className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-[#071A3D] focus:outline-none focus:ring-2 focus:ring-[#1455D9]/20 focus:bg-white placeholder:text-gray-400 transition-all font-medium"
          disabled={isTyping}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || isTyping}
          className={cn(
            'p-2.5 rounded-2xl text-white transition-all shadow-xs cursor-pointer',
            input.trim() && !isTyping
              ? 'bg-[#1455D9] hover:bg-[#0e44b5] hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function AIAgentsPanel() {
  const [selectedAgent, setSelectedAgent] = useState<AIAgent>(AI_AGENTS[0])
  const [activeTab, setActiveTab] = useState<'agents' | 'chat' | 'knowledge' | 'analytics'>('agents')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const totalQueries = AI_AGENTS.reduce((a, b) => a + b.queriesHandled, 0)
  const activeAgents = AI_AGENTS.filter((a) => a.status === 'active').length
  const avgAccuracy = (AI_AGENTS.reduce((a, b) => a + b.accuracy, 0) / AI_AGENTS.length).toFixed(1)
  const avgResponse = Math.round(AI_AGENTS.reduce((a, b) => a + b.avgResponseMs, 0) / AI_AGENTS.length)

  const stats: AgentStat[] = [
    {
      label: 'Active Agents',
      value: `${activeAgents}/${AI_AGENTS.length}`,
      delta: '100% uptime',
      trend: 'up',
      color: 'text-emerald-600',
      icon: <Bot className="w-5 h-5" />,
    },
    {
      label: 'Total Queries',
      value: totalQueries.toLocaleString(),
      delta: '+245 today',
      trend: 'up',
      color: 'text-[#1455D9]',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      label: 'Avg Accuracy',
      value: `${avgAccuracy}%`,
      delta: '+1.2% vs last week',
      trend: 'up',
      color: 'text-violet-600',
      icon: <Target className="w-5 h-5" />,
    },
    {
      label: 'Avg Response',
      value: `${avgResponse}ms`,
      delta: 'Ultra fast',
      trend: 'up',
      color: 'text-amber-600',
      icon: <Zap className="w-5 h-5" />,
    },
  ]

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsRefreshing(false)
  }

  const tabs = [
    { id: 'agents', label: 'AI Agents', icon: <Bot className="w-4 h-4" /> },
    { id: 'chat', label: 'Live Chat', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'knowledge', label: 'Knowledge Base', icon: <Database className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
  ] as const

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#071A3D] to-[#1455D9] flex items-center justify-center shadow-md">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#071A3D] leading-tight">AI Agents Control Center</h1>
              <p className="text-xs text-gray-500 font-semibold">Monitor, manage, and interact with all portal AI intelligence systems</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            All Systems Online
          </span>
          <button
            onClick={handleRefresh}
            className={cn('p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-[#1455D9] hover:border-[#1455D9]/40 transition-all cursor-pointer', isRefreshing && 'animate-spin text-[#1455D9]')}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className={cn('p-2 rounded-xl bg-gray-50', s.color)}>{s.icon}</div>
              {s.trend === 'up' && (
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  ↑
                </span>
              )}
            </div>
            <p className={cn('text-xl sm:text-2xl font-black mt-1', s.color)}>{s.value}</p>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">{s.label}</p>
            {s.delta && <p className="text-[10px] font-bold text-gray-400 mt-1">{s.delta}</p>}
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-fit overflow-x-auto max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
              activeTab === tab.id
                ? 'bg-white text-[#071A3D] shadow-sm'
                : 'text-gray-500 hover:text-[#071A3D]'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'agents' && (
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Agent List */}
          <div className="lg:col-span-2 space-y-2">
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
              {AI_AGENTS.length} AI Agents Deployed
            </p>
            {AI_AGENTS.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isSelected={selectedAgent.id === agent.id}
                onSelect={() => setSelectedAgent(agent)}
              />
            ))}
          </div>

          {/* Agent Detail */}
          <div className="lg:col-span-3">
            <AgentDetailPanel agent={selectedAgent} />
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm" style={{ minHeight: 600 }}>
          <div className="bg-gradient-to-r from-[#071A3D] to-[#1455D9] p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm">Live AI Agent Chat</h3>
              <p className="text-[10px] text-blue-200 font-semibold">Real-time database access · Select an agent above</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-300 font-bold">LIVE</span>
            </div>
          </div>
          <LiveChatPanel />
        </div>
      )}

      {activeTab === 'knowledge' && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-black text-[#071A3D] text-base">Knowledge Base Modules</h3>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">{KNOWLEDGE_MODULES.length} modules loaded · Live database sync active</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sync Active
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {KNOWLEDGE_MODULES.map((mod, i) => (
              <div key={mod.name} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/60 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black',
                    mod.status === 'loaded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  )}>
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#071A3D] truncate">{mod.name}</p>
                    <p className="text-[10px] text-gray-400 font-semibold">{mod.size} · Updated {mod.updated}</p>
                  </div>
                </div>
                <span className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border shrink-0',
                  mod.status === 'loaded'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : 'bg-amber-100 text-amber-700 border-amber-200'
                )}>
                  {mod.status === 'syncing' ? (
                    <><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />Syncing</>
                  ) : (
                    <><CheckCircle2 className="w-3 h-3" />Loaded</>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Agent Performance Table */}
          <div className="sm:col-span-2 bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-black text-[#071A3D] text-base">Agent Performance Overview</h3>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">Ranked by total queries handled</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {['Agent', 'Status', 'Accuracy', 'Avg Speed', 'Queries', 'Domains'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[11px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...AI_AGENTS].sort((a, b) => b.queriesHandled - a.queriesHandled).map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{agent.icon}</span>
                          <div>
                            <p className="font-bold text-[#071A3D] text-xs leading-tight">{agent.name}</p>
                            <p className="text-[10px] text-gray-400 font-semibold">{agent.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={agent.status} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#1455D9] to-[#22C7E8] rounded-full" style={{ width: `${agent.accuracy}%` }} />
                          </div>
                          <span className="text-xs font-black text-[#1455D9]">{agent.accuracy}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('text-xs font-black', agent.avgResponseMs < 50 ? 'text-emerald-600' : agent.avgResponseMs < 100 ? 'text-amber-600' : 'text-red-500')}>
                          {agent.avgResponseMs}ms
                        </span>
                      </td>
                      <td className="px-5 py-3.5"><span className="text-xs font-black text-[#071A3D]">{agent.queriesHandled.toLocaleString()}</span></td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] font-bold text-gray-500">{agent.knowledgeDomains.length} domains</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-black text-[#071A3D] text-base mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#1455D9]" />
              System Health
            </h3>
            <div className="space-y-3">
              {[
                { label: 'API Gateway', value: 99.9, color: 'from-emerald-400 to-emerald-600' },
                { label: 'Database Connection', value: 98.4, color: 'from-[#1455D9] to-[#22C7E8]' },
                { label: 'Knowledge Sync', value: 100, color: 'from-violet-400 to-violet-600' },
                { label: 'Push Notifications', value: 97.2, color: 'from-amber-400 to-amber-600' },
                { label: 'AI Response Engine', value: 99.5, color: 'from-[#1455D9] to-[#22C7E8]' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-gray-600">{item.label}</span>
                    <span className="font-black text-emerald-600">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full bg-gradient-to-r', item.color)} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Query Breakdown */}
          <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-black text-[#071A3D] text-base mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#1455D9]" />
              Query Distribution
            </h3>
            <div className="space-y-3">
              {[
                { domain: 'Academics & Subjects', count: 8420, percent: 31 },
                { domain: 'Attendance & OD', count: 6230, percent: 23 },
                { domain: 'Notifications & Alerts', count: 5890, percent: 22 },
                { domain: 'Faculty & Advisors', count: 4100, percent: 15 },
                { domain: 'Pass & Security', count: 2410, percent: 9 },
              ].map((item) => (
                <div key={item.domain}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-gray-600 truncate">{item.domain}</span>
                    <span className="font-black text-[#071A3D] shrink-0 ml-2">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#1455D9] to-[#22C7E8]"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
