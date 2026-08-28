'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Bot, Sparkles, Send, Trash2, Plus, Check, Zap } from 'lucide-react'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'bot'
  time: string
  suggestions?: string[]
}

const QUICK_PROMPTS = [
  { icon: '📚', text: 'What subjects are offered?' },
  { icon: '📊', text: 'What is the placement rate?' },
  { icon: '👨‍🏫', text: 'Tell me about faculty' },
  { icon: '🔬', text: 'Research areas available' },
  { icon: '🏛️', text: 'Labs and facilities' },
  { icon: '📝', text: 'Question paper types' },
]

function getTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

// Clean and crisp text renderer that parses markdown bold and bullets correctly
function FormattedMessage({ content }: { content: string }) {
  const lines = content.split('\n')

  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={idx} className="h-1" />

        // Check if line is a bullet item
        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('* ')
        const textToFormat = isBullet ? trimmed.replace(/^[•\-\*]\s*/, '') : trimmed

        // Format bold text **text** -> <strong>text</strong>
        const parts = textToFormat.split(/(\*\*.*?\*\*)/g)
        const renderedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-[#071A3D]">
                {part.slice(2, -2)}
              </strong>
            )
          }
          return part
        })

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5 text-gray-700">
              <span className="text-[#1455D9] font-black text-xs leading-none mt-1">•</span>
              <div className="flex-1">{renderedLine}</div>
            </div>
          )
        }

        return <p key={idx} className="text-gray-800">{renderedLine}</p>
      })}
    </div>
  )
}

export function AIChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showQuickPrompts, setShowQuickPrompts] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Welcome message
  useEffect(() => {
    setMessages([{
      id: 'welcome',
      text: "Hello! 👋 I'm the V.S.B. AI & DS Portal Intelligence Assistant.\n\nI can help you with comprehensive institutional intelligence across curricula, semester subjects, faculty directorate, placements, research laboratories, and institutional governance.\n\nWhat would you like to explore today?",
      sender: 'bot',
      time: getTime(),
      suggestions: ['What subjects are offered?', 'Placement statistics', 'Faculty directorate', 'Department labs'],
    }])
  }, [])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = useCallback(async (text?: string) => {
    const query = (text || input).trim()
    if (!query || isTyping) return

    setShowQuickPrompts(false)
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      text: query,
      sender: 'user',
      time: getTime(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch(`/api/ai?q=${encodeURIComponent(query)}`, { cache: 'no-store' })
      const data = await res.json()

      // Simulate slight delay for natural feel
      await new Promise(r => setTimeout(r, 350 + Math.random() * 300))

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        text: data.success && data.response?.answer
          ? data.response.answer
          : "I'm not sure about that. Could you rephrase your question?",
        sender: 'bot',
        time: getTime(),
        suggestions: data.response?.suggestions || [],
      }
      setMessages(prev => [...prev, botMsg])
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        text: '⚠️ Network error. Please check your connection and try again.',
        sender: 'bot',
        time: getTime(),
      }])
    } finally {
      setIsTyping(false)
      inputRef.current?.focus()
    }
  }, [input, isTyping])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([{
      id: 'welcome-new',
      text: "Chat cleared! 🔄 How can I assist you with department queries today?",
      sender: 'bot',
      time: getTime(),
      suggestions: ['What subjects are offered?', 'Placement statistics', 'Faculty info'],
    }])
    setShowQuickPrompts(true)
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-indigo-100" style={{ height: 'calc(100vh - 180px)', minHeight: '520px', boxShadow: '0 25px 60px -15px rgba(7, 26, 61, 0.3)' }}>
      {/* Vibrant Chat Header */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0D2F81] to-[#1455D9] px-6 py-4 flex items-center justify-between shadow-md relative overflow-hidden text-white">
        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1455D9] via-[#00D2FF] to-[#22C7E8] p-0.5 shadow-lg shadow-cyan-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#071A3D] rounded-[14px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#00E5FF]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-black text-lg tracking-wide drop-shadow-xs">AI &amp; DS Neural Engine</h2>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-xs shadow-emerald-400" />
              </span>
            </div>
            <p className="text-[#00E5FF] text-xs font-bold flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F4C430]" />
              <span>Real-Time Institutional Knowledge Base · Active</span>
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="relative z-10 text-white/80 hover:text-white text-xs px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          title="Clear chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#F3F7FD] via-[#F8FAFC] to-[#EEF4FF] border-x border-gray-200 px-5 py-6 space-y-4" style={{ scrollbarWidth: 'thin' }}>
        {/* Quick Prompts */}
        {showQuickPrompts && messages.length <= 1 && (
          <div className="space-y-2.5 mb-5 animate-fade-in">
            <p className="text-[11px] font-black text-[#1455D9] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#F4C430]" />
              Frequently Inquired Topics
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p.text}
                  onClick={() => sendMessage(p.text)}
                  className="flex items-center gap-2.5 px-3.5 py-3 bg-white rounded-2xl border border-blue-100 text-left hover:border-[#1455D9]/50 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 hover:shadow-md transition-all group cursor-pointer shadow-2xs hover:scale-[1.02]"
                >
                  <span className="text-xl group-hover:scale-115 transition-transform p-1.5 rounded-xl bg-blue-50 shrink-0">{p.icon}</span>
                  <span className="text-xs text-[#071A3D] group-hover:text-[#1455D9] font-bold leading-tight">{p.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex gap-3 animate-fade-in', msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
            {/* Bot Avatar */}
            {msg.sender === 'bot' && (
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#071A3D] via-[#1455D9] to-[#00D2FF] p-0.5 shrink-0 shadow-md shadow-blue-500/20 mt-0.5">
                <div className="w-full h-full bg-[#071A3D] rounded-[14px] flex items-center justify-center text-cyan-300">
                  <Bot className="w-4.5 h-4.5" />
                </div>
              </div>
            )}

            <div className={cn('max-w-[82%]', msg.sender === 'user' ? 'order-first' : '')}>
              <div className={cn(
                'rounded-3xl px-5 py-4 shadow-md transition-all',
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-[#1455D9] via-[#1A62F5] to-[#2563EB] text-white font-semibold rounded-tr-xs shadow-blue-600/30'
                  : 'bg-white border border-blue-100 text-gray-900 rounded-tl-xs shadow-blue-950/5'
              )}>
                {msg.sender === 'bot' ? (
                  <FormattedMessage content={msg.text} />
                ) : (
                  <p className="text-sm whitespace-pre-line font-semibold text-white leading-relaxed">{msg.text}</p>
                )}
              </div>

              {/* Time & status */}
              <div className={cn('text-[10px] font-bold mt-1 px-1.5 flex items-center gap-1', msg.sender === 'user' ? 'justify-end text-blue-600' : 'text-gray-400')}>
                <span>{msg.time}</span>
                {msg.sender === 'user' && <Check className="w-3 h-3 text-[#1455D9]" />}
              </div>

              {/* Suggestion Chips */}
              {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {msg.suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="px-3.5 py-1.5 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-[#1455D9] hover:to-[#2563EB] text-[#1455D9] hover:text-white rounded-xl transition-all font-bold border border-blue-200/90 shadow-2xs hover:shadow-md hover:scale-105 cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Avatar */}
            {msg.sender === 'user' && (
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#1455D9] to-[#2563EB] p-0.5 shrink-0 shadow-md shadow-blue-600/30 flex items-center justify-center text-white text-xs font-black mt-0.5">
                You
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#071A3D] via-[#1455D9] to-[#00D2FF] p-0.5 shrink-0 shadow-md shadow-blue-500/20">
              <div className="w-full h-full bg-[#071A3D] rounded-[14px] flex items-center justify-center text-cyan-300">
                <Bot className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="bg-white border border-blue-100 rounded-3xl rounded-tl-xs px-5 py-3.5 shadow-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1455D9] animate-bounce shadow-xs shadow-blue-500" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#00D2FF] animate-bounce shadow-xs shadow-cyan-500" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#F4C430] animate-bounce shadow-xs shadow-amber-500" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-[#1455D9] ml-1 font-bold">Neural Engine analyzing query...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-blue-100 px-5 py-4 shadow-xl">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about subjects, syllabus, exams, faculty, placements..."
            className="flex-1 px-4.5 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-[#071A3D] font-semibold focus:outline-none focus:ring-2 focus:ring-[#1455D9]/40 focus:border-[#1455D9] focus:bg-white placeholder:text-gray-400 transition-all shadow-inner"
            disabled={isTyping}
            autoComplete="off"
          />
          <button
            onClick={() => sendMessage()}
            disabled={isTyping || !input.trim()}
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md cursor-pointer',
              input.trim() && !isTyping
                ? 'bg-gradient-to-tr from-[#071A3D] via-[#1455D9] to-[#00D2FF] text-white hover:scale-105 shadow-blue-600/40'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[11px] font-bold text-gray-400 text-center mt-2.5">
          V.S.B. AI &amp; DS Chatbot — Powered by Institutional Knowledge Base
        </p>
      </div>
    </div>
  )
}
