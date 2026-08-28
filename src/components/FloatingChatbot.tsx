'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { MessageSquare, X, Minimize2, Maximize2, Trash2, Send, Sparkles, Bot, Check, RefreshCw, Minus, Plus } from 'lucide-react'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'bot'
  time: string
  suggestions?: string[]
}

const QUICK_PROMPTS = [
  { icon: '📅', text: 'Academic calendar & working days' },
  { icon: '📚', text: 'Curricular subjects catalog' },
  { icon: '👨‍🏫', text: 'Faculty directorate' },
  { icon: '📋', text: 'Attendance regulations' },
  { icon: '🏛️', text: 'Institutional identity & accreditation' },
  { icon: '🛡️', text: 'Portal governance & administrators' },
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

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        text: "👋 Hi! I'm your V.S.B. AI & DS Portal Assistant.\n\nI provide real-time information directly from the live database about academic calendars, subjects, attendance rules, faculty directorate, and portal governance!",
        sender: 'bot',
        time: getTime(),
        suggestions: [
          'Academic calendar & working days',
          'Curricular subjects catalog',
          'Faculty directorate',
          'Attendance regulations',
        ],
      },
    ])
  }, [])

  // Auto-scroll on new messages or typing
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, isOpen, isMinimized])

  // Clear unread count when opening
  const handleToggle = () => {
    if (!isOpen) {
      setUnreadCount(0)
    }
    setIsOpen(!isOpen)
    setIsMinimized(false)
  }

  const sendMessage = useCallback(
    async (textToSend?: string) => {
      const query = (textToSend || input).trim()
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

        // Natural pause
        await new Promise((r) => setTimeout(r, 350 + Math.random() * 250))

        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          text:
            data.success && data.response?.answer
              ? data.response.answer
              : (data.answer || "I'm not sure about that. Could you rephrase your question?"),
          sender: 'bot',
          time: getTime(),
          suggestions: data.response?.suggestions || data.suggestions || [],
        }
        setMessages((prev) => [...prev, botMsg])
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            text: '⚠️ Network error. Please check your connection and try again.',
            sender: 'bot',
            time: getTime(),
          },
        ])
      } finally {
        setIsTyping(false)
        inputRef.current?.focus()
      }
    },
    [input, isTyping]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        text: 'Chat cleared! 🧹 How can I help you today?',
        sender: 'bot',
        time: getTime(),
        suggestions: ['Academic calendar & working days', 'Curricular subjects catalog', 'Faculty directorate'],
      },
    ])
  }

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={cn(
            'bg-white rounded-3xl shadow-2xl border border-indigo-100 flex flex-col overflow-hidden mb-4 transition-all duration-300 origin-bottom-right animate-in fade-in zoom-in-95 backdrop-blur-md',
            isMinimized
              ? 'w-80 h-16'
              : isMaximized
              ? 'w-[calc(100vw-2rem)] sm:w-[92vw] md:w-[780px] lg:w-[940px] h-[85vh] max-h-[88vh]'
              : 'w-[calc(100vw-2rem)] sm:w-[460px] h-[72vh] sm:h-[600px] max-h-[85vh]'
          )}
          style={{
            boxShadow: '0 25px 50px -12px rgba(10, 37, 92, 0.45), 0 0 35px rgba(20, 85, 217, 0.25)',
          }}
        >
          {/* Vibrant Modal Header */}
          <div className="bg-gradient-to-r from-[#071A3D] via-[#0D2F81] to-[#1455D9] px-5 py-4 flex items-center justify-between text-white shrink-0 shadow-md relative overflow-hidden">
            {/* Background Glow Accent */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1455D9] via-[#00D2FF] to-[#22C7E8] p-0.5 shadow-lg shadow-cyan-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-[#071A3D]/80 rounded-[14px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#00E5FF]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base tracking-wide text-white drop-shadow-xs">
                    AI Portal Assistant
                  </h3>
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-xs shadow-emerald-400" />
                  </span>
                </div>
                <p className="text-[11px] font-bold text-cyan-300 flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3 text-[#F4C430]" />
                  <span>Neural Knowledge Engine · Online</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 relative z-10">
              {!isMinimized && (
                <button
                  onClick={clearChat}
                  title="Clear conversation"
                  className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              {/* Minimize / Collapse to Title Bar */}
              <button
                onClick={() => {
                  setIsMinimized(!isMinimized)
                  if (!isMinimized) setIsMaximized(false)
                }}
                title={isMinimized ? 'Expand Window' : 'Minimize to bar'}
                className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              </button>

              {/* True Maximize / Full Size Toggle */}
              {!isMinimized && (
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  title={isMaximized ? 'Restore normal size' : 'Maximize to large window'}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              )}

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-2 text-white/80 hover:text-white hover:bg-rose-500/40 rounded-xl transition-all cursor-pointer active:scale-95 ml-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Body & Messages */}
          {!isMinimized && (
            <>
              <div
                className="flex-1 overflow-y-auto bg-gradient-to-b from-[#F3F7FD] via-[#F8FAFC] to-[#EEF4FF] p-4 sm:p-5 space-y-4 text-sm"
                style={{ scrollbarWidth: 'thin' }}
              >
                {/* Quick Prompts when starting */}
                {messages.length <= 1 && (
                  <div className="space-y-2.5 mb-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black text-[#1455D9] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#F4C430]" />
                        Suggested Instant Queries
                      </p>
                      <span className="text-[10px] font-bold text-gray-400">1-Tap Query</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {QUICK_PROMPTS.map((p) => (
                        <button
                          key={p.text}
                          onClick={() => sendMessage(p.text)}
                          className="flex items-center gap-2.5 p-2.5 bg-white hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 rounded-2xl border border-blue-100 hover:border-[#1455D9]/50 text-left transition-all text-xs font-semibold group cursor-pointer shadow-xs hover:shadow-md hover:scale-[1.02]"
                        >
                          <span className="text-lg group-hover:scale-115 transition-transform shrink-0 p-1 rounded-xl bg-blue-50">
                            {p.icon}
                          </span>
                          <span className="line-clamp-2 text-[11.5px] font-bold text-[#071A3D] leading-tight">
                            {p.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex gap-3 animate-fade-in',
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.sender === 'bot' && (
                      <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-[#071A3D] via-[#1455D9] to-[#00D2FF] p-0.5 shrink-0 mt-0.5 shadow-md shadow-blue-500/20">
                        <div className="w-full h-full bg-[#071A3D] rounded-[14px] flex items-center justify-center text-cyan-300">
                          <Bot className="w-4 h-4" />
                        </div>
                      </div>
                    )}

                    <div className={cn('max-w-[86%]', msg.sender === 'user' ? 'order-first' : '')}>
                      <div
                        className={cn(
                          'rounded-3xl px-4.5 py-3.5 text-xs sm:text-sm leading-relaxed transition-all',
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-[#1455D9] via-[#1A62F5] to-[#2563EB] text-white font-semibold rounded-tr-xs shadow-md shadow-blue-600/30'
                            : 'bg-white border border-blue-100 text-gray-900 rounded-tl-xs shadow-md shadow-blue-950/5'
                        )}
                      >
                        {msg.sender === 'bot' ? (
                          <FormattedMessage content={msg.text} />
                        ) : (
                          <p className="whitespace-pre-line font-semibold text-white drop-shadow-2xs">{msg.text}</p>
                        )}
                      </div>

                      <div
                        className={cn(
                          'text-[10px] font-bold mt-1 px-1.5 flex items-center gap-1',
                          msg.sender === 'user' ? 'justify-end text-blue-600' : 'justify-start text-gray-400'
                        )}
                      >
                        <span>{msg.time}</span>
                        {msg.sender === 'user' && <Check className="w-3 h-3 text-[#1455D9]" />}
                      </div>

                      {/* Suggestions under bot response */}
                      {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {msg.suggestions.map((s) => (
                            <button
                              key={s}
                              onClick={() => sendMessage(s)}
                              className="px-3 py-1.5 text-[11px] bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-[#1455D9] hover:to-[#2563EB] text-[#1455D9] hover:text-white rounded-xl transition-all font-bold border border-blue-200/90 shadow-2xs hover:shadow-md hover:scale-105 cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{s}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3 items-center animate-fade-in">
                    <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-[#071A3D] via-[#1455D9] to-[#00D2FF] p-0.5 shrink-0 shadow-md">
                      <div className="w-full h-full bg-[#071A3D] rounded-[14px] flex items-center justify-center text-cyan-300">
                        <Bot className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="bg-white border border-blue-100 rounded-3xl rounded-tl-xs px-4 py-3 shadow-md flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#1455D9] animate-bounce shadow-xs shadow-blue-500" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#00D2FF] animate-bounce shadow-xs shadow-cyan-500" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#F4C430] animate-bounce shadow-xs shadow-amber-500" style={{ animationDelay: '300ms' }} />
                      <span className="text-[11.5px] text-[#1455D9] ml-1 font-bold">AI Assistant thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3.5 bg-white border-t border-blue-100/80 flex items-center gap-2.5 shadow-lg">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about subjects, syllabus, attendance, faculty..."
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-[#071A3D] font-semibold focus:outline-none focus:ring-2 focus:ring-[#1455D9]/40 focus:border-[#1455D9] focus:bg-white placeholder:text-gray-400 transition-all shadow-inner"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className={cn(
                    'p-3 rounded-2xl text-white transition-all shadow-md cursor-pointer flex items-center justify-center',
                    input.trim() && !isTyping
                      ? 'bg-gradient-to-tr from-[#071A3D] via-[#1455D9] to-[#00D2FF] hover:scale-105 shadow-blue-600/40'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Toggle Button with Glowing Ring */}
      <button
        onClick={handleToggle}
        className="relative w-15 h-15 rounded-3xl bg-gradient-to-tr from-[#071A3D] via-[#1455D9] to-[#00D2FF] p-0.5 hover:scale-110 active:scale-95 transition-all text-white flex items-center justify-center shadow-2xl cursor-pointer group"
        style={{
          boxShadow: '0 10px 30px -5px rgba(20, 85, 217, 0.6), 0 0 20px rgba(0, 210, 255, 0.4)',
        }}
        aria-label="Open AI Assistant"
      >
        <div className="w-full h-full bg-[#071A3D] hover:bg-[#071A3D]/80 rounded-[22px] flex items-center justify-center transition-colors">
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <Bot className="w-7 h-7 text-[#00E5FF] group-hover:text-[#F4C430] transition-colors" />
              {/* Online Pulse Indicator */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#071A3D] shadow-xs" />
              </span>
            </>
          )}
        </div>
      </button>
    </div>
  )
}
