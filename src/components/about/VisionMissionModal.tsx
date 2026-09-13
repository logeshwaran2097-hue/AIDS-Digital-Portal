'use client'

import * as React from 'react'
import { useState } from 'react'
import {
  X,
  Target,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Lightbulb,
  Cpu,
  Layers,
} from 'lucide-react'
import { ACADEMIC_FRAMEWORK } from '@/lib/visionMission'

interface VisionMissionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function VisionMissionModal({ isOpen, onClose }: VisionMissionModalProps) {
  const [activeTab, setActiveTab] = useState<'dept' | 'peo_pso' | 'pos' | 'institute'>('dept')
  const [searchPO, setSearchPO] = useState('')

  if (!isOpen) return null

  const filteredPOs = ACADEMIC_FRAMEWORK.department.pos.filter(
    (po) =>
      po.name.toLowerCase().includes(searchPO.toLowerCase()) ||
      po.code.toLowerCase().includes(searchPO.toLowerCase()) ||
      po.statement.toLowerCase().includes(searchPO.toLowerCase()) ||
      po.attribute.toLowerCase().includes(searchPO.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#030B1C]/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#071A3D] via-[#0D3B82] to-[#1557C0] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Vision, Mission &amp; Academic Framework
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-[#071A3D]">
                  NBA Tier-1
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium">
                Department of Artificial Intelligence &amp; Data Science · V.S.B. Engineering College
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL TABS */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 sm:px-6 overflow-x-auto shrink-0 gap-2 py-2">
          <button
            type="button"
            onClick={() => setActiveTab('dept')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'dept'
                ? 'bg-[#1557C0] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#071A3D] hover:bg-slate-200/60'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Department Vision &amp; Mission</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('peo_pso')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'peo_pso'
                ? 'bg-[#1557C0] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#071A3D] hover:bg-slate-200/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>PEOs &amp; PSOs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'pos'
                ? 'bg-[#1557C0] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#071A3D] hover:bg-slate-200/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Program Outcomes (PO 1–11)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('institute')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'institute'
                ? 'bg-[#1557C0] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#071A3D] hover:bg-slate-200/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Institute Vision &amp; Mission</span>
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* TAB 1: DEPARTMENT VISION & MISSION */}
          {activeTab === 'dept' && (
            <div className="space-y-6 animate-fade-in">
              {/* Vision Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white border-2 border-blue-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                    <span>Vision of the Department</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">AI &amp; Data Science</span>
                </div>
                <p className="text-sm sm:text-base text-[#071A3D] font-extrabold leading-relaxed italic">
                  &ldquo;{ACADEMIC_FRAMEWORK.department.vision}&rdquo;
                </p>
              </div>

              {/* Mission Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-[#071A3D] uppercase tracking-wider">
                    Mission Directives (M1 – M4)
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                    4 Core Directives
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ACADEMIC_FRAMEWORK.department.missions.map((m) => (
                    <div
                      key={m.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-[#1557C0] font-black text-xs font-mono">
                            {m.id}
                          </span>
                          <span className="text-[10px] font-extrabold uppercase text-slate-400">
                            {m.category}
                          </span>
                        </div>
                        <h5 className="text-xs font-black text-[#071A3D] mb-1.5">{m.title}</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">{m.statement}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-bold text-[#1557C0]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>NBA Criteria 1.1 Compliant</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PEOS & PSOS */}
          {activeTab === 'peo_pso' && (
            <div className="space-y-6 animate-fade-in">
              {/* PEOs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-[#071A3D] uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#1557C0]" />
                    <span>Programme Educational Objectives (PEOs)</span>
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500">Graduation Criteria</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ACADEMIC_FRAMEWORK.department.peos.map((peo) => (
                    <div
                      key={peo.id}
                      className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-200/60">
                          <span className="px-2 py-0.5 rounded bg-[#1557C0] text-white font-mono font-black text-xs">
                            {peo.id}
                          </span>
                          <span className="text-[10px] font-black uppercase text-[#1557C0]">{peo.title}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">{peo.statement}</p>
                      </div>
                      <div className="mt-3 pt-2 text-[10px] font-bold text-[#1557C0]">{peo.tag}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PSOs */}
              <div className="space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Program Specific Outcomes (PSOs)</span>
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500">Domain Competencies</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ACADEMIC_FRAMEWORK.department.psos.map((pso) => (
                    <div
                      key={pso.id}
                      className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-200/60">
                          <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-mono font-black text-xs">
                            {pso.id}
                          </span>
                          <span className="text-[10px] font-black uppercase text-emerald-800">{pso.title}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">{pso.statement}</p>
                      </div>
                      <div className="mt-3 pt-2 text-[10px] font-bold text-emerald-700">{pso.tag}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROGRAM OUTCOMES (PO 1-11) */}
          {activeTab === 'pos' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-[#071A3D] uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#1557C0]" />
                    <span>Program Outcomes (POs: PO1 – PO11)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Washington Accord Graduate Attributes (WK1 – WK9)
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Filter POs by keyword or code..."
                  value={searchPO}
                  onChange={(e) => setSearchPO(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-64"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredPOs.map((po) => (
                  <div
                    key={po.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-blue-50/30 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-xs text-[#1557C0]">{po.code}: {po.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#1557C0]">
                        {po.attribute}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{po.statement}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: INSTITUTE VISION & MISSION */}
          {activeTab === 'institute' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Vision of the Institute</span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 uppercase">
                    Autonomous · Est. 2002
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic font-medium">
                  &ldquo;{ACADEMIC_FRAMEWORK.institution.vision}&rdquo;
                </p>
                <div className="text-xs font-bold text-[#1557C0] pt-1">
                  V.S.B. Engineering College (Autonomous), Karur
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-50 text-cyan-900 border border-cyan-200 text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Mission of the Institute</span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 uppercase">
                    Institutional Practice
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic font-medium">
                  &ldquo;{ACADEMIC_FRAMEWORK.institution.mission}&rdquo;
                </p>
                <div className="text-xs font-bold text-cyan-700 pt-1">
                  Holistic Student Personality Development
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <span className="text-slate-500 font-medium text-[11px]">
            Academic Regulation &amp; Quality Manual · Department of AI &amp; DS
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#071A3D] hover:bg-[#1557C0] text-white font-black transition-all cursor-pointer shadow-xs"
          >
            Close Framework
          </button>
        </div>
      </div>
    </div>
  )
}
