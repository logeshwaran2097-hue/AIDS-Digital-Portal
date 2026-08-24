'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

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
      text: "Hello! 👋 I'm the V.S.B. AI & DS Chatbot.\n\nI can help you with information about subjects, faculty, placements, research, events, and more.\n\nWhat would you like to know?",
      sender: 'bot',
      time: getTime(),
      suggestions: ['What subjects are offered?', 'Placement statistics', 'Faculty info', 'Department labs'],
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
      await new Promise(r => setTimeout(r, 400 + Math.random() * 600))

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
      text: "Chat cleared! 🔄 How can I help you?",
      sender: 'bot',
      time: getTime(),
      suggestions: ['What subjects are offered?', 'Placement statistics', 'Faculty info'],
    }])
    setShowQuickPrompts(true)
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 180px)', minHeight: '500px' }}>
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0d2f66] to-[#1455D9] rounded-t-2xl px-6 py-4 flex items-center gap-4 shadow-lg">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-[#22C7E8]/20 border border-[#22C7E8]/30 flex items-center justify-center shadow-inner">
            <span className="text-2xl">🤖</span>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[#071A3D]" />
        </div>
        <div className="flex-1">
          <h2 className="text-white font-bold text-lg tracking-tight">AI & DS Chatbot</h2>
          <p className="text-[#22C7E8] text-xs font-medium">● Online — Powered by Department Knowledge Base</p>
        </div>
        <button
          onClick={clearChat}
          className="text-white/60 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          title="Clear chat"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-[#f8f9fc] border-x border-gray-200 px-4 py-5 space-y-4" style={{ scrollbarWidth: 'thin' }}>
        {/* Quick Prompts */}
        {showQuickPrompts && messages.length <= 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.text}
                onClick={() => sendMessage(p.text)}
                className="flex items-center gap-2 px-3 py-3 bg-white rounded-xl border border-gray-200 text-left hover:border-[#22C7E8] hover:shadow-md transition-all group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{p.icon}</span>
                <span className="text-xs text-gray-600 group-hover:text-[#1455D9] font-medium leading-tight">{p.text}</span>
              </button>
            ))}
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex gap-3', msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
            {/* Bot Avatar */}
            {msg.sender === 'bot' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-[#22C7E8] to-[#1455D9] flex items-center justify-center shadow-sm mt-1">
                <span className="text-sm">🤖</span>
              </div>
            )}

            <div className={cn('max-w-[80%]', msg.sender === 'user' ? 'order-first' : '')}>
              <div className={cn(
                'rounded-2xl px-4 py-3 shadow-sm',
                msg.sender === 'user'
                  ? 'bg-[#1455D9] text-white rounded-tr-md'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-md'
              )}>
                <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
              </div>

              {/* Time */}
              <p className={cn('text-[10px] mt-1 px-1', msg.sender === 'user' ? 'text-right text-gray-400' : 'text-gray-400')}>
                {msg.time}
              </p>

              {/* Suggestion Chips */}
              {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {msg.suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="px-3 py-1.5 text-[11px] bg-[#22C7E8]/8 text-[#0d7a8f] rounded-full hover:bg-[#22C7E8]/20 transition-colors font-medium border border-[#22C7E8]/15"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Avatar */}
            {msg.sender === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#1455D9] flex items-center justify-center shadow-sm mt-1">
                <span className="text-white text-xs font-bold">You</span>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#22C7E8] to-[#1455D9] flex items-center justify-center shadow-sm">
              <span className="text-sm">🤖</span>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#22C7E8] animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.6s' }} />
                  <span className="w-2 h-2 rounded-full bg-[#22C7E8] animate-bounce" style={{ animationDelay: '150ms', animationDuration: '0.6s' }} />
                  <span className="w-2 h-2 rounded-full bg-[#22C7E8] animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.6s' }} />
                </div>
                <span className="text-xs text-gray-400 ml-2">Typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-b-2xl border border-gray-200 border-t-0 px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about AI & DS department..."
            className="flex-1 px-4 py-3 rounded-xl bg-[#f8f9fc] border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C7E8]/40 focus:border-[#22C7E8] placeholder:text-gray-400 transition-all"
            disabled={isTyping}
            autoComplete="off"
          />
          <button
            onClick={() => sendMessage()}
            disabled={isTyping || !input.trim()}
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-sm',
              input.trim() && !isTyping
                ? 'bg-[#22C7E8] text-white hover:bg-[#1ab3cc] hover:shadow-md active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
            aria-label="Send message"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-gray-300 text-center mt-2">V.S.B. AI & DS Chatbot — Powered by Department Knowledge Base</p>
      </div>
    </div>
  )
}
