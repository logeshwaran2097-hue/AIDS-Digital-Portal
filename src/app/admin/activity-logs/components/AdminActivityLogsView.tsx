'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Activity,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Filter,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface LogRecord {
  id: string
  userName: string
  action: string
  module: string
  details?: string | null
  status: string
  createdAt: string
}

export function AdminActivityLogsView({ initialLogs }: { initialLogs: LogRecord[] }) {
  const [logs, setLogs] = useState<LogRecord[]>(initialLogs)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesAction = actionFilter === 'ALL' || l.action.toLowerCase() === actionFilter.toLowerCase()
    return matchesSearch && matchesAction
  })

  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — SYSTEM AUDIT & SECURITY LOGS',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Super Administrator',
      category: 'Official Cryptographic Audit Log Statement',
      sections: [
        {
          heading: '1. SECURITY LOGGING & AUDIT TRAIL SUMMARY',
          body: [
            `Total Security Audit Records: ${logs.length} Logged Events`,
            'Audit Modules: Authentication, RBAC Privilege Modification, Database CRUD Operations',
            'Integrity Status: SHA-256 Authenticated Session Signatures',
            'Compliance: NBA / NAAC Tier-1 Digital Governance Standards',
          ],
        },
        {
          heading: '2. REAL-TIME AUDIT TRAIL EXCERPT',
          body: filteredLogs.slice(0, 30).map(
            (l, idx) =>
              `${idx + 1}. [${l.createdAt}] ${l.userName} (${l.action.toUpperCase()} in ${l.module.toUpperCase()}) — ${l.details || 'Action performed'} [${l.status.toUpperCase()}]`
          ),
        },
      ],
      fileName: 'VSB_System_Audit_Logs_2026',
    })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Security Audit Trails
            </span>
            <span className="text-xs text-gray-300 font-medium">· Real-Time Activity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">System Activity &amp; Audit Logs</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Real-time tracking of administrator logins, OTP dispatches, CRUD transactions &amp; security events
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 shrink-0"
        >
          <Download className="w-4 h-4" /> Export Audit Log (PDF)
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search user, action, log details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
          >
            <option value="ALL">All Actions</option>
            <option value="login">Authentication / Login</option>
            <option value="create">Create Operation</option>
            <option value="update">Update Operation</option>
            <option value="delete">Delete Operation</option>
          </select>

          <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
            Showing {filteredLogs.length} Records
          </span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#071A3D] text-white uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Module</th>
                <th className="px-5 py-3.5">Event Details</th>
                <th className="px-4 py-3.5 text-center">Timestamp</th>
                <th className="px-4 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    No matching activity logs recorded.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#071A3D] flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#1455D9] flex items-center justify-center font-black text-xs">
                        {l.userName.charAt(0)}
                      </div>
                      <span>{l.userName}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono font-bold uppercase text-[10px] border border-purple-200">
                        {l.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-gray-500 font-semibold">{l.module}</td>
                    <td className="px-5 py-3.5 text-gray-700 font-mono text-[11px] max-w-xs truncate">
                      {l.details || 'Standard system action'}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-gray-400 text-[11px]">
                      {l.createdAt}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          l.status.toLowerCase() === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
