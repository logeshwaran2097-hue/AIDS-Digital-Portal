'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { MessageSquare, X, Minimize2, Maximize2, Trash2, Send, Sparkles, Bot, Check, RefreshCw } from 'lucide-react'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'bot'
  time: string
  suggestions?: string[]
}

const QUICK_PROMPTS = [
  { icon: '📅', text: 'Upcoming events & hackathons' },
  { icon: '📚', text: 'What subjects are offered?' },
  { icon: '📊', text: 'Placement statistics' },
  { icon: '👨‍🏫', text: 'Faculty details' },
  { icon: '📝', text: 'Question papers' },
  { icon: '🚀', text: 'Student projects' },
]

function getTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

// Clean and crisp text renderer that parses markdown bold and bullets correctly
function FormattedMessage({ content }: { content: string }) {
  const lines = content.split('\n')

  return (
    <div className="space-y-1.5 text-xs leading-relaxed">
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
              <span className="text-[#1455D9] font-black text-xs leading-none mt-0.5">•</span>
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
        text: "👋 Hi! I'm your V.S.B. AI & DS Assistant.\n\nAsk me anything about subjects, syllabus, exams, faculty, placements, or events!",
        sender: 'bot',
        time: getTime(),
        suggestions: [
          'Upcoming events & hackathons',
          'What subjects are offered?',
          'Placement statistics',
          'Faculty details',
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
        suggestions: ['Upcoming events & hackathons', 'What subjects are offered?', 'Placement statistics'],
      },
    ])
  }

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={cn(
            'bg-white rounded-3xl shadow-2xl border border-gray-200/90 flex flex-col overflow-hidden mb-4 transition-all duration-300 origin-bottom-right animate-in fade-in zoom-in-95',
            isMinimized ? 'w-80 h-14' : 'w-[calc(100vw-2rem)] sm:w-[420px] h-[70vh] sm:h-[570px] max-h-[85vh]'
          )}
          style={{
            boxShadow: '0 20px 40px -15px rgba(7, 26, 61, 0.35), 0 0 20px rgba(34, 199, 232, 0.2)',
          }}
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] px-5 py-3.5 flex items-center justify-between text-white shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] border border-white/30 flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm leading-tight">AI &amp; DS Assistant</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-[#22C7E8] font-semibold">Online · V.S.B. Knowledge Base</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!isMinimized && (
                <button
                  onClick={clearChat}
                  title="Clear conversation"
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Body & Messages */}
          {!isMinimized && (
            <>
              <div
                className="flex-1 overflow-y-auto bg-[#f8fafd] p-4 space-y-3.5 text-sm"
                style={{ scrollbarWidth: 'thin' }}
              >
                {/* Quick Prompts when starting */}
                {messages.length <= 1 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      Popular Questions
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {QUICK_PROMPTS.map((p) => (
                        <button
                          key={p.text}
                          onClick={() => sendMessage(p.text)}
                          className="flex items-center gap-2 p-2 bg-white rounded-2xl border border-gray-200 text-left hover:border-[#1455D9]/50 hover:bg-[#1455D9]/5 transition-all text-xs text-gray-700 font-medium group cursor-pointer shadow-2xs"
                        >
                          <span className="text-base group-hover:scale-110 transition-transform shrink-0">
                            {p.icon}
                          </span>
                          <span className="line-clamp-1 text-[11px] font-bold text-[#071A3D]">{p.text}</span>
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
                      'flex gap-2.5',
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.sender === 'bot' && (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#1455D9] to-[#22C7E8] flex items-center justify-center shrink-0 mt-0.5 shadow-xs text-white">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className={cn('max-w-[84%]', msg.sender === 'user' ? 'order-first' : '')}>
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs',
                          msg.sender === 'user'
                            ? 'bg-[#1455D9] text-white rounded-tr-xs'
                            : 'bg-white border border-gray-200/80 text-gray-800 rounded-tl-xs'
                        )}
                      >
                        {msg.sender === 'bot' ? (
                          <FormattedMessage content={msg.text} />
                        ) : (
                          <p className="whitespace-pre-line font-medium">{msg.text}</p>
                        )}
                      </div>

                      <div
                        className={cn(
                          'text-[10px] text-gray-400 mt-1 px-1',
                          msg.sender === 'user' ? 'text-right' : 'text-left'
                        )}
                      >
                        {msg.time}
                      </div>

                      {/* Suggestions under bot response */}
                      {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {msg.suggestions.map((s) => (
                            <button
                              key={s}
                              onClick={() => sendMessage(s)}
                              className="px-2.5 py-1 text-[10.5px] bg-[#1455D9]/10 text-[#1455D9] rounded-xl hover:bg-[#1455D9]/20 transition-colors font-bold border border-[#1455D9]/20 cursor-pointer"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-2 items-center">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#1455D9] to-[#22C7E8] flex items-center justify-center text-white shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1455D9] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1455D9] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1455D9] animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-[11px] text-gray-400 ml-1 font-medium">Assistant thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about events, subjects, exams, faculty..."
                  className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-[#071A3D] focus:outline-none focus:ring-2 focus:ring-[#1455D9]/20 focus:bg-white placeholder:text-gray-400 transition-all font-medium"
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
            </>
          )}
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={handleToggle}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#071A3D] to-[#1455D9] hover:scale-105 transition-all text-white flex items-center justify-center shadow-xl border-2 border-white/20 relative group cursor-pointer"
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <Bot className="w-6 h-6 text-[#F4C430]" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
          </>
        )}
      </button>
    </div>
  )
}
