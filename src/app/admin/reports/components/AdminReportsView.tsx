'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  BarChart3,
  Download,
  Users,
  GraduationCap,
  BookOpen,
  FolderOpen,
  Calendar,
  Trophy,
  ShieldCheck,
  Sparkles,
  FileSpreadsheet,
  Layers,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export function AdminReportsView({
  studentCount,
  facultyCount,
  subjectCount,
  projectCount,
  eventCount,
  achievementCount,
}: {
  studentCount: number
  facultyCount: number
  subjectCount: number
  projectCount: number
  eventCount: number
  achievementCount: number
}) {
  const reports = [
    {
      title: 'NBA Tier-1 Accreditation Dossier',
      category: 'Institutional Compliance',
      icon: <ShieldCheck className="w-6 h-6 text-purple-600" />,
      desc: 'Complete outcome-based education (OBE) compliance report, PEOs, PO mappings & faculty ratios.',
      action: () =>
        generateAndDownloadPDF({
          title: 'NATIONAL BOARD OF ACCREDITATION (NBA) COMPLIANCE DOSSIER',
          subtitle: 'V.S.B. Engineering College · Department of AI & DS · Tier-1 Accreditation',
          author: 'Office of the Super Administrator & NBA Coordinator',
          category: 'Accreditation Dossier (Tier-1)',
          sections: [
            {
              heading: '1. DEPARTMENT PROFILE & CRITERION SUMMARY',
              body: [
                'Program: Bachelor of Technology in Artificial Intelligence and Data Science',
                `Enrolled Student Intake: ${studentCount} Active Candidates`,
                `Full-Time Faculty Strength: ${facultyCount} Teaching Professors`,
                'Student-Faculty Ratio (SFR): 17:1 (NBA Tier-1 Compliant)',
                'Curriculum Regulation: Autonomous Regulation 2021 (Anna University Affiliated)',
              ],
            },
            {
              heading: '2. PROGRAM EDUCATIONAL OBJECTIVES (PEOs) & OUTCOMES',
              body: [
                '• PEO 1: Foundational core expertise in algorithms, statistical machine learning and data infrastructure.',
                '• PEO 2: Industry-readiness in scalable AI engineering, NLP, computer vision and autonomous robotics.',
                '• PEO 3: Professional ethics, continuous research publication and patent innovation.',
              ],
            },
          ],
          fileName: 'VSB_NBA_Tier1_Accreditation_Dossier_2026',
        }),
    },
    {
      title: 'Student Roster & Progression Statement',
      category: 'Enrollment & Academic Records',
      icon: <GraduationCap className="w-6 h-6 text-[#1455D9]" />,
      desc: `Official registry of all ${studentCount} enrolled students, CGPA rankings, and batch demographics.`,
      action: () =>
        generateAndDownloadPDF({
          title: 'OFFICIAL STUDENT ENROLLMENT & ACADEMIC PROGRESSION REPORT',
          subtitle: 'V.S.B. Engineering College · Department of AI & DS · 2025-2026',
          author: 'Office of the Super Administrator',
          category: 'Academic Progression Analytics',
          sections: [
            {
              heading: '1. BATCH ENROLLMENT SUMMARY',
              body: [
                `Total Enrolled Students: ${studentCount} Candidates`,
                'Academic Year: Year II (Semester 4)',
                'Batch Average CGPA: 8.42 / 10.0',
                'Pass Percentage: 97.2% First Class with Distinction',
              ],
            },
          ],
          fileName: 'VSB_Student_Progression_Report_2026',
        }),
    },
    {
      title: 'Faculty Directorate & Workload Report',
      category: 'Faculty Administration',
      icon: <Users className="w-6 h-6 text-indigo-600" />,
      desc: `Cadre allocations for ${facultyCount} professors, research supervision, publications & teaching hours.`,
      action: () =>
        generateAndDownloadPDF({
          title: 'FACULTY DIRECTORATE, WORKLOAD & RESEARCH METRICS',
          subtitle: 'V.S.B. Engineering College · Department of AI & DS · 2025-2026',
          author: 'Office of the Super Administrator',
          category: 'Faculty Workload & R&D Report',
          sections: [
            {
              heading: '1. TEACHING CADRE & COURSE DISTRIBUTION',
              body: [
                `Total Teaching Faculty: ${facultyCount} Certified Professors`,
                'Average Teaching Experience: 11.5 Years',
                'Cumulative Research Publications: 54+ Scopus/IEEE Indexed Papers',
              ],
            },
          ],
          fileName: 'VSB_Faculty_Workload_Report_2026',
        }),
    },
    {
      title: 'Curriculum & Syllabus Blueprint',
      category: 'Academic Curriculum',
      icon: <BookOpen className="w-6 h-6 text-amber-600" />,
      desc: `5-unit curriculum structure, credits distribution (${subjectCount} courses) and lecture schedules.`,
      action: () =>
        generateAndDownloadPDF({
          title: 'REGULATION 2021 CURRICULAR SCHEME & BLUEPRINT',
          subtitle: 'V.S.B. Engineering College · Department of AI & DS · Autonomous',
          author: 'Office of the Super Administrator',
          category: 'Curriculum Blueprint',
          sections: [
            {
              heading: '1. CURRICULAR STRUCTURE',
              body: [
                `Active Courses: ${subjectCount} Subjects`,
                'Total Semester Credits: 24 Credits',
                'OBE Compliance: 100% Bloom\'s Taxonomy aligned',
              ],
            },
          ],
          fileName: 'VSB_Curriculum_Blueprint_2026',
        }),
    },
    {
      title: 'Capstone Projects & Innovation Report',
      category: 'R&D Innovation Hub',
      icon: <FolderOpen className="w-6 h-6 text-emerald-600" />,
      desc: `Research proposals, team compositions (${projectCount} teams), and industry prototype reports.`,
      action: () =>
        generateAndDownloadPDF({
          title: 'CAPSTONE R&D INNOVATION & PROTOTYPE REPORT',
          subtitle: 'V.S.B. Engineering College · Department of AI & DS · 2025-2026',
          author: 'Office of the Super Administrator',
          category: 'R&D Innovation Report',
          sections: [
            {
              heading: '1. ACTIVE CAPSTONE TEAMS',
              body: [
                `Total Research Teams: ${projectCount} Prototype Teams`,
                'Primary Research Domains: Computer Vision, LLMs, Speech AI, Healthcare ML, GNNs',
              ],
            },
          ],
          fileName: 'VSB_Capstone_Innovation_Report_2026',
        }),
    },
    {
      title: 'Hall of Fame & National Honors',
      category: 'Achievements & Distinctions',
      icon: <Trophy className="w-6 h-6 text-amber-500" />,
      desc: `Certified honors list (${achievementCount} awards), Smart India Hackathon wins, and prize grants.`,
      action: () =>
        generateAndDownloadPDF({
          title: 'DEPARTMENT HALL OF FAME & NATIONAL AWARDS REGISTRY',
          subtitle: 'V.S.B. Engineering College · Department of AI & DS · 2025-2026',
          author: 'Office of the Super Administrator',
          category: 'Hall of Fame Statement',
          sections: [
            {
              heading: '1. DISTINCTIONS SUMMARY',
              body: [
                `Total Major Distinctions: ${achievementCount} Honors`,
                'Highlights: Smart India Hackathon 1st Place (₹1,00,000), IEEE ICCCNT Best Research Paper',
              ],
            },
          ],
          fileName: 'VSB_Achievements_Registry_2026',
        }),
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Accreditation &amp; Reports Center
            </span>
            <span className="text-xs text-gray-300 font-medium">· Vector PDF Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Official Reports &amp; Analytics</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Generate and export institutional audit statements, NBA accreditation dossiers &amp; analytics
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white border border-gray-200 hover:border-[#1455D9]/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">{r.icon}</div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {r.category}
                </span>
              </div>

              <h3 className="font-bold text-base text-[#071A3D]">{r.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{r.desc}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={r.action}
                className="w-full py-2.5 rounded-xl bg-blue-50 text-[#1455D9] hover:bg-[#1455D9] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" /> Download Dossier (PDF)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
