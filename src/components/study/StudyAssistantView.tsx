'use client'

import React, { useState } from 'react'
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
  Layers,
  Code2,
  BrainCircuit,
  Zap,
  RotateCcw
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SubjectUnitData {
  code: string
  name: string
  units: {
    unitNo: number
    title: string
    topics: string[]
    partA: { q: string; a: string }[]
    partB: { q: string; marks: number; solution: string }[]
    notes: { title: string; points: string[] }[]
    quiz: { q: string; options: string[]; answerIndex: number; explanation: string }[]
  }[]
}

const STUDY_DATABASE: SubjectUnitData[] = [
  {
    code: 'AL3391',
    name: 'Artificial Intelligence',
    units: [
      {
        unitNo: 1,
        title: 'Problem Solving & State Space Search',
        topics: ['State Space Representation', 'Breadth First Search', 'Depth First Search', 'Heuristic Search (A*)', 'Minimax & Alpha-Beta Pruning'],
        partA: [
          {
            q: 'Define Rational Agent in Artificial Intelligence.',
            a: 'A rational agent is an autonomous entity that perceives its environment through sensors, acts upon that environment through actuators, and always selects an action that maximizes its expected performance measure based on its percept sequence and built-in knowledge.'
          },
          {
            q: 'What is an admissible heuristic in A* search?',
            a: 'A heuristic function h(n) is admissible if it never overestimates the actual cost to reach the goal state from node n (i.e., h(n) <= h*(n), where h*(n) is the true optimal cost).'
          },
          {
            q: 'Distinguish between BFS and DFS in terms of completeness and space complexity.',
            a: 'BFS is always complete for finite branching factors with space complexity O(b^d). DFS is not complete in infinite-depth trees unless depth-limited, but has linear space complexity O(b*m).'
          }
        ],
        partB: [
          {
            q: 'Explain the A* Search algorithm with an illustrative graph example. Prove its optimality conditions.',
            marks: 16,
            solution: '1. Evaluation Function: f(n) = g(n) + h(n), where g(n) is actual path cost from start to n, and h(n) is estimated cost from n to goal.\n2. Optimality: When h(n) is admissible (in tree search) and consistent/monotonic (in graph search), A* is guaranteed to return the minimal cost path.\n3. Step-by-Step Traversal: Maintain OPEN priority queue sorted by f(n) and CLOSED set. Expand node with min f(n), compute f for successors, and terminate when goal is popped from OPEN.'
          },
          {
            q: 'Discuss Minimax algorithm with Alpha-Beta Pruning. How does pruning reduce branch evaluation?',
            marks: 13,
            solution: 'Alpha represents the best value for MAX along the path (initially -infinity). Beta represents the best value for MIN (initially +infinity). Pruning condition: If alpha >= beta, the current branch cannot influence the final decision and is pruned, reducing optimal time complexity from O(b^m) to O(b^(m/2)).'
          }
        ],
        notes: [
          {
            title: 'Search Complexity Comparison Table',
            points: [
              'BFS: Time O(b^d), Space O(b^d), Complete: Yes, Optimal: Yes (if uniform step cost)',
              'DFS: Time O(b^m), Space O(bm), Complete: No (cycles), Optimal: No',
              'Iterative Deepening (IDDFS): Time O(b^d), Space O(bd), Complete: Yes, Optimal: Yes',
              'A* Search: Time O(b^d), Space O(b^d), Complete: Yes, Optimal: Yes (if h is admissible)'
            ]
          }
        ],
        quiz: [
          {
            q: 'Which search algorithm uses the evaluation function f(n) = g(n) + h(n)?',
            options: ['Greedy Best-First Search', 'A* Search', 'Depth-First Search', 'Uniform Cost Search'],
            answerIndex: 1,
            explanation: 'A* uses f(n) = g(n) + h(n) balancing actual path cost g(n) and heuristic estimate h(n).'
          },
          {
            q: 'In Alpha-Beta pruning, when does a cutoff occur?',
            options: ['When alpha < beta', 'When alpha >= beta', 'When alpha == 0', 'When beta == infinity'],
            answerIndex: 1,
            explanation: 'Cutoff occurs whenever alpha >= beta, because the opposing player already has a better move.'
          }
        ]
      }
    ]
  },
  {
    code: 'AD3351',
    name: 'Design and Analysis of Algorithms',
    units: [
      {
        unitNo: 2,
        title: 'Divide and Conquer & Dynamic Programming',
        topics: ['Merge Sort', 'Quick Sort', '0/1 Knapsack Problem', 'Longest Common Subsequence (LCS)', 'Floyd-Warshall Algorithm'],
        partA: [
          {
            q: 'State the Master Theorem for solving recurrence relations.',
            a: 'For T(n) = aT(n/b) + f(n): If f(n) = O(n^(log_b(a) - e)), T(n) = Theta(n^log_b(a)). If f(n) = Theta(n^log_b(a)), T(n) = Theta(n^log_b(a) * log n). If f(n) = Omega(n^(log_b(a) + e)), T(n) = Theta(f(n)).'
          },
          {
            q: 'What is the Principle of Optimality in Dynamic Programming?',
            a: 'An optimal sequence of decisions has the property that whatever the initial state and decision are, the remaining decisions must constitute an optimal decision sequence with regard to the state resulting from the first decision.'
          }
        ],
        partB: [
          {
            q: 'Formulate the dynamic programming solution for the 0/1 Knapsack problem. Trace with capacity W=5, items w=[2,3,4], v=[3,4,5].',
            marks: 13,
            solution: 'Recurrence: V[i, w] = max(V[i-1, w], v[i] + V[i-1, w - w[i]]) if w >= w[i], else V[i-1, w]. Table dimensions: (n+1) x (W+1). Optimal value obtained is 7 with items 1 and 2.'
          }
        ],
        notes: [
          {
            title: 'Sorting Algorithms Complexities',
            points: [
              'Merge Sort: Best O(n log n), Worst O(n log n), Space O(n), Stable: Yes',
              'Quick Sort: Best O(n log n), Worst O(n^2), Space O(log n), Stable: No',
              'Heap Sort: Best O(n log n), Worst O(n log n), Space O(1), Stable: No'
            ]
          }
        ],
        quiz: [
          {
            q: 'What is the worst-case time complexity of Merge Sort?',
            options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'],
            answerIndex: 1,
            explanation: 'Merge sort always divides in half and merges in linear time, guaranteeing O(n log n) even in the worst case.'
          }
        ]
      }
    ]
  },
  {
    code: 'AD3501',
    name: 'Deep Learning',
    units: [
      {
        unitNo: 3,
        title: 'Convolutional Neural Networks (CNNs) & Architectures',
        topics: ['Convolution Operation', 'Pooling Layers', 'ResNet & Skip Connections', 'Vanishing Gradient Problem', 'VGG & Inception'],
        partA: [
          {
            q: 'Why do Skip / Residual Connections solve the vanishing gradient problem in ResNet?',
            a: 'Residual connections provide an identity shortcut F(x) + x, allowing gradients during backpropagation to flow directly backward without attenuation, preventing gradients from vanishing even in 152+ layer networks.'
          },
          {
            q: 'Differentiate between valid padding and same padding in CNNs.',
            a: 'Valid padding applies no zero-padding, reducing spatial dimensions: (W - K + 1). Same padding pads with zeros so output spatial dimensions match the input dimensions: (W - K + 2P)/S + 1 = W.'
          }
        ],
        partB: [
          {
            q: 'Explain the architecture of ResNet with mathematical justification of residual blocks and backpropagation gradient flow.',
            marks: 16,
            solution: '1. Problem: Degradation problem where deeper networks saturate and degrade accuracy.\n2. Formulation: Instead of fitting H(x), let F(x) = H(x) - x, so H(x) = F(x) + x.\n3. Gradient Flow: dL/dx = (dL/dH) * (dF/dx + 1). The +1 term ensures gradients never vanish regardless of weight vanishing.'
          }
        ],
        notes: [
          {
            title: 'Activation Functions Summary',
            points: [
              'ReLU: f(x) = max(0, x), solves vanishing gradient for positive values, computationally efficient.',
              'LeakyReLU: f(x) = max(0.01x, x), prevents dying ReLU problem.',
              'Softmax: Exponentiates and normalizes to produce multi-class probability distribution summing to 1.'
            ]
          }
        ],
        quiz: [
          {
            q: 'What is the primary function of a Max Pooling layer in a CNN?',
            options: ['Increase parameters', 'Reduce spatial dimensions and introduce translation invariance', 'Compute gradients', 'Prevent zero padding'],
            answerIndex: 1,
            explanation: 'Pooling downsamples feature map width and height, reducing memory and computation while providing spatial translation invariance.'
          }
        ]
      }
    ]
  }
]

export default function StudyAssistantView() {
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState(0)
  const [selectedUnitIdx, setSelectedUnitIdx] = useState(0)
  const [activeMode, setActiveMode] = useState<'questions' | 'notes' | 'quiz' | 'tutor'>('questions')
  
  // Chat Tutor state
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string; code?: string }[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your Anna University AI & DS Exam Study Assistant. Ask me to explain any engineering concept, generate 2-mark or 13-mark questions, or solve algorithm derivations!'
    }
  ])
  const [inputQuery, setInputQuery] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Quiz interactive state
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({})

  const currentSubject = STUDY_DATABASE[selectedSubjectIdx] || STUDY_DATABASE[0]
  const currentUnit = currentSubject.units[selectedUnitIdx] || currentSubject.units[0]

  const handleSendQuery = () => {
    if (!inputQuery.trim()) return

    const userText = inputQuery
    setInputQuery('')
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }])
    setIsGenerating(true)

    setTimeout(() => {
      let aiReply = ''
      let codeSnippet = ''

      if (userText.toLowerCase().includes('a*') || userText.toLowerCase().includes('search')) {
        aiReply = `### A* Search Algorithm Breakdown\nA* finds the shortest path using f(n) = g(n) + h(n).\n\n**Core Rules:**\n- **g(n):** Exact cost to reach node n from start.\n- **h(n):** Heuristic estimated cost to reach goal from n.\n- **Optimality:** Guaranteed if h(n) is admissible (never overestimates).\n\nHere is a Python implementation snippet:`
        codeSnippet = `import heapq

def a_star_search(graph, start, goal, h):
    open_set = []
    heapq.heappush(open_set, (h[start], 0, start, [start]))
    visited = set()

    while open_set:
        f, g, current, path = heapq.heappop(open_set)
        if current == goal:
            return path, g
        visited.add(current)
        for neighbor, weight in graph[current].items():
            if neighbor not in visited:
                new_g = g + weight
                heapq.heappush(open_set, (new_g + h[neighbor], new_g, neighbor, path + [neighbor]))
    return None`
      } else if (userText.toLowerCase().includes('sql') || userText.toLowerCase().includes('salary')) {
        aiReply = `### SQL Query: Finding 2nd Highest Salary\nIn Anna University Database examinations, use either subquery with MAX or DENSE_RANK() window function:`
        codeSnippet = `-- Method 1: Subquery
SELECT MAX(salary) AS SecondHighestSalary 
FROM Employee 
WHERE salary < (SELECT MAX(salary) FROM Employee);

-- Method 2: Window Function (Preferred for ties)
WITH RankedSalaries AS (
    SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rnk
    FROM Employee
)
SELECT salary FROM RankedSalaries WHERE rnk = 2 LIMIT 1;`
      } else {
        aiReply = `According to Anna University Regulation 2021 guidelines for **${currentSubject.name}**:\n\n1. **Key Concept Definition**: Focus on precise technical terminology in Part A.\n2. **Mathematical Formulation**: State all assumptions, objective functions, and constraints clearly.\n3. **Diagrams & Flowcharts**: Awarded 40% of marks in Part B/C questions.\n\nWould you like me to generate a tailored 13-mark model question for this topic?`
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: aiReply, code: codeSnippet }])
      setIsGenerating(false)
    }, 800)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

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
              Generate university standard 2-mark (Part A) and 13/16-mark (Part B/C) analytical exam questions with step-by-step solutions, quick revision flashcards, and live AI tutor chat.
            </p>
          </div>

          {/* Subject Switcher */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shrink-0 space-y-1">
            <label className="text-[10px] uppercase font-bold text-cyan-200 block">Selected Course:</label>
            <select
              value={selectedSubjectIdx}
              onChange={(e) => {
                setSelectedSubjectIdx(Number(e.target.value))
                setSelectedUnitIdx(0)
                toast.success('Subject loaded!')
              }}
              className="bg-[#071A3D] text-white p-2 rounded-xl text-xs font-bold border border-white/20 focus:outline-none"
            >
              {STUDY_DATABASE.map((s, idx) => (
                <option key={s.code} value={idx}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <button
            onClick={() => setActiveMode('questions')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeMode === 'questions'
                ? 'bg-white text-[#071A3D] shadow-lg shadow-black/20'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <FileQuestion className="w-4 h-4 text-blue-600" />
            <span>Part A & B Question Generator</span>
          </button>
          <button
            onClick={() => setActiveMode('notes')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeMode === 'notes'
                ? 'bg-white text-[#071A3D] shadow-lg shadow-black/20'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Smart Revision Notes</span>
          </button>
          <button
            onClick={() => setActiveMode('quiz')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeMode === 'quiz'
                ? 'bg-white text-[#071A3D] shadow-lg shadow-black/20'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Diagnostic Quiz</span>
          </button>
          <button
            onClick={() => setActiveMode('tutor')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeMode === 'tutor'
                ? 'bg-white text-[#071A3D] shadow-lg shadow-black/20'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-600" />
            <span>AI Tutor Chat</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Part A & B Question Generator */}
      {activeMode === 'questions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700">
                Unit {currentUnit.unitNo}: {currentUnit.title}
              </span>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Question Bank</span>
            </button>
          </div>

          {/* Part A Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                  PART A
                </span>
                <h3 className="font-bold text-slate-900 text-sm">2-Mark Questions & Model Answers</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Anna University Format</span>
            </div>

            <div className="space-y-4">
              {currentUnit.partA.map((qa, i) => (
                <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                      Q{i + 1}. {qa.q}
                    </h4>
                    <button
                      onClick={() => handleCopy(`${qa.q}\nAnswer: ${qa.a}`)}
                      className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
                      title="Copy Q&A"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                    <strong className="text-blue-700">Ans: </strong>{qa.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Part B Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-xs">
                  PART B / C
                </span>
                <h3 className="font-bold text-slate-900 text-sm">13 & 16-Mark Analytical Solutions</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Comprehensive Breakdown</span>
            </div>

            <div className="space-y-4">
              {currentUnit.partB.map((qa, i) => (
                <div key={i} className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-100 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Q{i + 1}. {qa.q}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold shrink-0">
                      {qa.marks} Marks
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-2 whitespace-pre-line leading-relaxed">
                    <span className="font-bold text-purple-800 block uppercase text-[10px] tracking-wider">
                      Model University Solution & Derivation:
                    </span>
                    {qa.solution}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Smart Revision Notes */}
      {activeMode === 'notes' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs uppercase font-bold text-emerald-600">Quick Exam Memory Sheet</span>
            <h3 className="font-extrabold text-slate-900 text-lg">
              {currentSubject.name} • Unit {currentUnit.unitNo}: {currentUnit.title}
            </h3>
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
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode 3: Diagnostic Quiz */}
      {activeMode === 'quiz' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs uppercase font-bold text-amber-600">Self-Assessment Test</span>
              <h3 className="font-extrabold text-slate-900 text-lg">
                5-Question Rapid Diagnostic Check
              </h3>
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
        </div>
      )}

      {/* Mode 4: AI Tutor Chat */}
      {activeMode === 'tutor' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 bg-gradient-to-r from-[#071A3D] to-[#1455D9] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
                <Bot className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Anna University AI Tutor</h3>
                <p className="text-[11px] text-cyan-200">Online • Specialized in R-2021 Syllabus</p>
              </div>
            </div>
            <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
              {currentSubject.code}
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
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
                  className={`p-4 rounded-2xl text-xs space-y-2 leading-relaxed ${
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
                <Bot className="w-4 h-4 animate-spin text-blue-600" />
                <span>AI Tutor is formulating university response...</span>
              </div>
            )}
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
