'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  BookOpen,
  FileText,
  Upload,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Code2,
  FileQuestion,
  Search,
  Plus,
  ArrowRight,
  UserCheck,
  Check,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

interface CourseSubject {
  code: string
  name: string
  regulation: string
  credits: number
  year: number
  semester: number
  section: string
  enrolledStudents: number
  hoursTaught: number
  attendanceRate: string
  units: {
    unit: string
    title: string
    hours: number
    topics: string[]
    status: 'Completed' | 'In-Progress'
  }[]
  notes: {
    unit: string
    title: string
    fileName: string
    fileSize: string
    uploadedDate: string
  }[]
  labs: {
    expNo: number
    title: string
    tools: string
    guideFile: string
  }[]
  questions: {
    type: '2_mark' | '16_mark'
    q: string
    bloom: string
  }[]
}

const COURSES_DATA: CourseSubject[] = [
  {
    code: 'AD2305',
    name: 'Machine Learning Foundations',
    regulation: 'Regulation 2021 (Autonomous)',
    credits: 4,
    year: 2,
    semester: 3,
    section: 'A',
    enrolledStudents: 68,
    hoursTaught: 37,
    attendanceRate: '97.3%',
    units: [
      {
        unit: 'Unit I',
        title: 'Introduction & Supervised Learning Paradigms',
        hours: 9,
        topics: ['Machine Learning Taxonomy', 'Linear & Polynomial Regression', 'Logistic Regression & Sigmoid Function', 'Cost Function Optimization & Gradient Descent', 'Regularization (L1 Lasso, L2 Ridge)'],
        status: 'Completed',
      },
      {
        unit: 'Unit II',
        title: 'Probabilistic Classifiers & Decision Trees',
        hours: 9,
        topics: ['Bayes Theorem & Maximum A Posteriori (MAP)', 'Naive Bayes Classifier (Gaussian & Multinomial)', 'Information Gain & Entropy (ID3, C4.5, CART)', 'Pruning Strategies & Overfitting Mitigation', 'Random Forests & Ensemble Bootstrapping'],
        status: 'Completed',
      },
      {
        unit: 'Unit III',
        title: 'Support Vector Machines & Kernel Methods',
        hours: 9,
        topics: ['Maximum Margin Hyperplanes', 'Soft Margin Optimization & Slack Variables', 'Linear & Non-Linear Kernels (Polynomial, RBF, Sigmoid)', 'Mercer Theorem & Dual Formulation', 'Support Vector Regression (SVR)'],
        status: 'Completed',
      },
      {
        unit: 'Unit IV',
        title: 'Unsupervised Learning & Dimensionality Reduction',
        hours: 9,
        topics: ['K-Means & K-Medoids Clustering', 'Hierarchical Clustering (Agglomerative & Divisive)', 'Gaussian Mixture Models & Expectation Maximization', 'Principal Component Analysis (PCA)', 't-SNE for High-Dimensional Visualization'],
        status: 'Completed',
      },
      {
        unit: 'Unit V',
        title: 'Neural Networks & Deep Learning Foundations',
        hours: 9,
        topics: ['Biological to Artificial Neurons (Perceptrons)', 'Multi-Layer Perceptron (MLP) Architectures', 'Activation Functions (ReLU, GELU, Softmax)', 'Backpropagation & Chain Rule Derivation', 'Optimization Algorithms (SGD, RMSProp, Adam)'],
        status: 'In-Progress',
      },
    ],
    notes: [
      { unit: 'Unit I', title: 'Linear Regression & Cost Optimization Notes', fileName: 'AD2305_Unit1_Supervised_Learning.pdf', fileSize: '3.8 MB', uploadedDate: '12/08/2026' },
      { unit: 'Unit II', title: 'Naive Bayes & Decision Tree Derivations', fileName: 'AD2305_Unit2_DecisionTrees_Ensembles.pdf', fileSize: '4.2 MB', uploadedDate: '18/08/2026' },
      { unit: 'Unit III', title: 'Support Vector Machine Optimization Notes', fileName: 'AD2305_Unit3_SVM_Kernels.pdf', fileSize: '5.1 MB', uploadedDate: '22/08/2026' },
    ],
    labs: [
      { expNo: 1, title: 'Implement Multiple Linear Regression from Scratch with NumPy', tools: 'Python, NumPy, Matplotlib', guideFile: 'AD2305_LabExp1.pdf' },
      { expNo: 2, title: 'Build Naive Bayes Classifier for Medical Diagnostic Prediction', tools: 'Scikit-Learn, Pandas', guideFile: 'AD2305_LabExp2.pdf' },
      { expNo: 3, title: 'Non-Linear Decision Boundary Classification with SVM Kernels', tools: 'Python, Scikit-Learn', guideFile: 'AD2305_LabExp3.pdf' },
    ],
    questions: [
      { type: '2_mark', q: 'Define bias-variance tradeoff and its impact on model generalization.', bloom: 'K2 (Understand)' },
      { type: '2_mark', q: 'State the mathematical formulation of L2 Ridge Regularization.', bloom: 'K1 (Remember)' },
      { type: '16_mark', q: 'Derive the complete backpropagation gradient equations for a 3-layer neural network with cross-entropy loss function.', bloom: 'K4 (Analyze)' },
    ],
  },
  {
    code: 'AD2301',
    name: 'Data Structures & Algorithms',
    regulation: 'Regulation 2021 (Autonomous)',
    credits: 4,
    year: 2,
    semester: 3,
    section: 'A',
    enrolledStudents: 68,
    hoursTaught: 38,
    attendanceRate: '94.7%',
    units: [
      {
        unit: 'Unit I',
        title: 'Linear Data Structures - Lists',
        hours: 9,
        topics: ['Abstract Data Types (ADTs)', 'Dynamic Array Vectors', 'Singly Linked Lists', 'Doubly & Circular Linked Lists', 'Polynomial Representation'],
        status: 'Completed',
      },
      {
        unit: 'Unit II',
        title: 'Stacks and Queues ADT',
        hours: 9,
        topics: ['Stack Array & Linked Representations', 'Infix to Postfix Conversion', 'Arithmetic Expression Evaluation', 'Circular & Double-Ended Queues (Deque)', 'Priority Queues'],
        status: 'Completed',
      },
      {
        unit: 'Unit III',
        title: 'Non-Linear Data Structures - Trees',
        hours: 9,
        topics: ['Binary Trees & Tree Traversals', 'Binary Search Trees (BST)', 'AVL Self-Balancing Trees', 'Binary Min/Max Heaps', 'B-Trees & B+ Trees'],
        status: 'Completed',
      },
      {
        unit: 'Unit IV',
        title: 'Non-Linear Data Structures - Graphs',
        hours: 9,
        topics: ['Graph Adjacency Matrix & Lists', 'Breadth First Search (BFS) & DFS', 'Topological Sorting for DAGs', 'Dijkstra Shortest Path', 'Prim & Kruskal MST'],
        status: 'Completed',
      },
      {
        unit: 'Unit V',
        title: 'Searching, Sorting & Hashing',
        hours: 9,
        topics: ['Quick Sort & Merge Sort', 'Heap Sort & Counting Sort', 'Hash Tables & Hash Functions', 'Collision Resolution Policies', 'Dynamic Rehashing'],
        status: 'Completed',
      },
    ],
    notes: [
      { unit: 'Unit I', title: 'Complete Linked List ADT Operations', fileName: 'AD2301_Unit1_Linked_Lists.pdf', fileSize: '3.4 MB', uploadedDate: '10/08/2026' },
      { unit: 'Unit III', title: 'AVL Trees & Self Balancing Rotations', fileName: 'AD2301_Unit3_AVL_Trees.pdf', fileSize: '4.8 MB', uploadedDate: '19/08/2026' },
    ],
    labs: [
      { expNo: 1, title: 'Array Vector & Singly Linked List ADT Implementation in C++', tools: 'GCC, C++', guideFile: 'AD2301_LabExp1.pdf' },
      { expNo: 2, title: 'Infix to Postfix Conversion and Evaluation using Stack ADT', tools: 'C++', guideFile: 'AD2301_LabExp2.pdf' },
    ],
    questions: [
      { type: '2_mark', q: 'State the four rotation cases required for AVL Tree balance restoration.', bloom: 'K1 (Remember)' },
      { type: '16_mark', q: 'Explain Dijkstra algorithm with a 6-node weighted graph example and trace shortest path step-by-step.', bloom: 'K3 (Apply)' },
    ],
  },
  {
    code: 'AD2307',
    name: 'Data Science Tools & Laboratory',
    regulation: 'Regulation 2021 (Autonomous)',
    credits: 2,
    year: 2,
    semester: 3,
    section: 'A',
    enrolledStudents: 68,
    hoursTaught: 18,
    attendanceRate: '100.0%',
    units: [
      {
        unit: 'Unit I',
        title: 'Exploratory Data Analysis with Pandas & NumPy',
        hours: 6,
        topics: ['Data Wrangling & Cleaning', 'Handling Missing Values & Outliers', 'Data Aggregation & GroupBy', 'Feature Normalization & Scaling'],
        status: 'Completed',
      },
      {
        unit: 'Unit II',
        title: 'Statistical Visualization & Dashboarding',
        hours: 6,
        topics: ['Matplotlib & Seaborn Visuals', 'Correlation Heatmaps & Boxplots', 'Interactive Dashboards with Plotly & Streamlit'],
        status: 'Completed',
      },
      {
        unit: 'Unit III',
        title: 'End-to-End Data Science Pipeline',
        hours: 6,
        topics: ['Model Training Pipeline with Scikit-Learn', 'Cross-Validation & Hyperparameter Tuning', 'Model Deployment via FastAPI'],
        status: 'In-Progress',
      },
    ],
    notes: [
      { unit: 'Unit I', title: 'Pandas & NumPy Cheat Sheet & Reference Lab Guide', fileName: 'AD2307_DataScience_Manual.pdf', fileSize: '6.2 MB', uploadedDate: '15/08/2026' },
    ],
    labs: [
      { expNo: 1, title: 'EDA on Titanic & Boston Housing Datasets with Seaborn', tools: 'Python, Jupyter, Pandas', guideFile: 'AD2307_LabExp1.pdf' },
      { expNo: 2, title: 'End-to-End Predictive Pipeline Deployment with Streamlit', tools: 'Streamlit, Scikit-Learn', guideFile: 'AD2307_LabExp2.pdf' },
    ],
    questions: [
      { type: '2_mark', q: 'Differentiate between Min-Max Scaling and Standard Z-score Normalization.', bloom: 'K2 (Understand)' },
      { type: '16_mark', q: 'Design an end-to-end data ingestion and EDA pipeline for customer churn analysis with interactive charts.', bloom: 'K4 (Analyze)' },
    ],
  },
]

export function FacultySubjectsView() {
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'syllabus' | 'notes' | 'labs' | 'questions'>('syllabus')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const currentCourse = COURSES_DATA[selectedCourseIndex]

  const handleDownloadCoursePack = () => {
    const sections = currentCourse.units.map((u) => ({
      heading: `${u.unit.toUpperCase()}: ${u.title.toUpperCase()}`,
      body: u.topics.map((t) => `${t} (Completed: ${u.status === 'Completed' ? 'Yes' : 'In-Progress'})`),
    }))

    generateAndDownloadPDF({
      title: `${currentCourse.code} - ${currentCourse.name}`,
      subtitle: `${currentCourse.regulation} · Year ${currentCourse.year} Semester ${currentCourse.semester} · Credits: ${currentCourse.credits}`,
      subjectCode: currentCourse.code,
      author: 'Dr. S. Karthik (Course Faculty)',
      category: 'Official Course Pack & Lesson Plan',
      sections,
      fileName: `${currentCourse.code}_Faculty_Course_Pack`,
    })
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setUploadSuccess(true)
    setTimeout(() => {
      setUploadSuccess(false)
      setShowUploadModal(false)
    }, 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Curriculum &amp; Course Workspace
            </span>
            <span className="text-xs text-gray-300 font-medium">· Department of AI &amp; DS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">My Allocated Subjects &amp; Syllabus</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Department Course Curriculum · Manage lesson plans, lecture materials, lab manuals, and question banks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#22C7E8]" /> Upload Material (PDF)
          </button>
          <button
            onClick={handleDownloadCoursePack}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Download className="w-4 h-4" /> Download Course Pack
          </button>
        </div>
      </div>

      {/* Course Selection Ribbon */}
      <div className="grid gap-3 sm:grid-cols-3">
        {COURSES_DATA.map((course, idx) => {
          const isSelected = selectedCourseIndex === idx
          return (
            <button
              key={course.code}
              onClick={() => setSelectedCourseIndex(idx)}
              className={cn(
                'p-4 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden group',
                isSelected
                  ? 'bg-gradient-to-br from-[#071A3D] to-[#1455D9] text-white border-[#1455D9] shadow-lg scale-[1.02]'
                  : 'bg-white text-[#071A3D] border-gray-200 hover:border-[#1455D9]/40 hover:shadow-xs'
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-lg text-xs font-mono font-black',
                    isSelected ? 'bg-white/20 text-[#F4C430]' : 'bg-blue-50 text-[#1455D9]'
                  )}
                >
                  {course.code}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full',
                    isSelected ? 'bg-emerald-400/20 text-emerald-300' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {course.credits} Credits
                </span>
              </div>

              <h3 className="font-bold text-sm leading-snug line-clamp-1">{course.name}</h3>

              <div
                className={cn(
                  'mt-3 pt-2 border-t flex items-center justify-between text-[11px]',
                  isSelected ? 'border-white/15 text-gray-300' : 'border-gray-100 text-gray-400'
                )}
              >
                <span>{course.enrolledStudents} Enrolled</span>
                <span className={cn('font-bold', isSelected ? 'text-emerald-300' : 'text-green-700')}>
                  {course.attendanceRate} Attd.
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected Course Deep Management Center */}
      <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
        <CardContent className="p-6 space-y-6">
          {/* Course Banner Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-black text-[#1455D9] px-2 py-0.5 rounded-md bg-blue-50">
                  {currentCourse.code}
                </span>
                <span className="text-xs text-gray-400 font-semibold">{currentCourse.regulation}</span>
              </div>
              <h2 className="text-xl font-black text-[#071A3D]">{currentCourse.name}</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Year {currentCourse.year} · Semester {currentCourse.semester} · Section {currentCourse.section} · {currentCourse.hoursTaught} Periods Taught
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/faculty-dashboard/attendance"
                className="px-3.5 py-2 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <UserCheck className="w-4 h-4" /> Roll Call Attendance
              </Link>
            </div>
          </div>

          {/* Action Tabs Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-100 pb-2">
            {[
              { id: 'syllabus', label: '5-Unit Syllabus & Lessons', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'notes', label: 'Lecture Materials & PDFs', icon: <FileText className="w-4 h-4" /> },
              { id: 'labs', label: 'Laboratory Manuals', icon: <Code2 className="w-4 h-4" /> },
              { id: 'questions', label: 'Question Bank & Bloom\'s', icon: <FileQuestion className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer',
                  activeTab === tab.id
                    ? 'bg-[#071A3D] text-white shadow-xs'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-[#071A3D]'
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: 5-Unit Syllabus */}
          {activeTab === 'syllabus' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#071A3D]">Unit-Wise Detailed Lesson Plan</h3>
                <span className="text-xs text-green-700 font-bold bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  5 / 5 Units Structured (100%)
                </span>
              </div>

              <div className="space-y-3">
                {currentCourse.units.map((u, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#1455D9] font-bold text-xs">
                          {u.unit}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-[#071A3D]">{u.title}</h4>
                      </div>
                      <span className="text-xs text-gray-400 font-semibold">{u.hours} Teaching Hours</span>
                    </div>

                    <div className="grid gap-1.5 sm:grid-cols-2 pt-1 border-t border-gray-200/60">
                      {u.topics.map((t, tIdx) => (
                        <div key={tIdx} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="line-clamp-1">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Lecture Materials */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#071A3D]">Uploaded Notes &amp; Handouts</h3>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-3 py-1.5 bg-[#1455D9] text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-[#0e44b5]"
                >
                  <Plus className="w-3.5 h-3.5" /> Upload Material
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {currentCourse.notes.map((n, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">
                        {n.unit}
                      </span>
                      <p className="font-bold text-xs text-[#071A3D] truncate">{n.title}</p>
                      <p className="text-[10px] text-gray-400">{n.fileName} · {n.fileSize} · {n.uploadedDate}</p>
                    </div>

                    <button
                      onClick={handleDownloadCoursePack}
                      className="p-2 rounded-xl bg-blue-50 text-[#1455D9] hover:bg-[#1455D9] hover:text-white transition-all shrink-0 cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Laboratory Manuals */}
          {activeTab === 'labs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#071A3D]">Practical Experiments &amp; Lab Guidelines</h3>
                <span className="text-xs text-gray-400">Autonomous Laboratory Schedule</span>
              </div>

              <div className="space-y-3">
                {currentCourse.labs.map((l) => (
                  <div key={l.expNo} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black">
                        Experiment {l.expNo}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-[#071A3D]">{l.title}</h4>
                      <p className="text-[11px] text-gray-400 font-mono">Tools: {l.tools}</p>
                    </div>

                    <button
                      onClick={handleDownloadCoursePack}
                      className="px-3 py-1.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" /> Guide PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Question Bank & Bloom's Taxonomy */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#071A3D]">Important 2-Mark &amp; 16-Mark Question Archive</h3>
                <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  CO-PO Mapped
                </span>
              </div>

              <div className="space-y-3">
                {currentCourse.questions.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-md text-[10px] font-black',
                          q.type === '2_mark' ? 'bg-blue-50 text-[#1455D9]' : 'bg-purple-50 text-purple-700'
                        )}
                      >
                        {q.type === '2_mark' ? 'PART-A (2 Marks)' : 'PART-B (16 Marks)'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">{q.bloom}</span>
                    </div>
                    <p className="text-xs font-bold text-[#071A3D]">{q.q}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Material Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#071A3D]">Upload Lecture Material</h3>
                <p className="text-xs text-gray-500">Publish notes or lab guide for {currentCourse.code}</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="p-1 text-gray-400 hover:text-gray-700">✕</button>
            </div>

            {uploadSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#071A3D]">Material Published!</h4>
                <p className="text-xs text-gray-500">Students can now view and download this PDF in their portal.</p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Select Unit</label>
                  <select className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold">
                    <option>Unit I - Introduction &amp; Foundations</option>
                    <option>Unit II - Core Algorithms &amp; Models</option>
                    <option>Unit III - Advanced Paradigms &amp; Kernels</option>
                    <option>Unit IV - Unsupervised &amp; High Dimension</option>
                    <option>Unit V - Modern Frameworks &amp; Deep Networks</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Document Title</label>
                  <input type="text" placeholder="e.g. Unit 4 PCA & Dimensionality Notes" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" required />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">PDF File</label>
                  <input type="file" accept=".pdf" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold hover:bg-[#0e44b5]">Upload &amp; Publish</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
