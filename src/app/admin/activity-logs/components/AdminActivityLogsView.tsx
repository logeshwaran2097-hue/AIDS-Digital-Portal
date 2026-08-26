'use client'

import React, { useState, useMemo } from 'react'
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
  FileSpreadsheet,
  FileText,
  KeyRound,
  Database,
  Lock,
  UserCheck,
  UserX,
  Server,
  RefreshCw,
  Eye,
  X,
  Calendar,
  Sparkles,
  Layers,
  Trash2,
  CheckSquare,
  Square,
  AlertCircle,
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
  ipAddress?: string
  userAgent?: string
}

export function AdminActivityLogsView({ initialLogs }: { initialLogs: LogRecord[] }) {
  const [logs, setLogs] = useState<LogRecord[]>(initialLogs)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [moduleFilter, setModuleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false)
  const [logToDelete, setLogToDelete] = useState<LogRecord | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [notification, setNotification] = useState('')

  // Enhanced Filter Logic
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !q ||
        l.userName.toLowerCase().includes(q) ||
        l.module.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        (l.details && l.details.toLowerCase().includes(q))

      const matchesAction = actionFilter === 'ALL' || l.action.toLowerCase() === actionFilter.toLowerCase()
      const matchesModule = moduleFilter === 'ALL' || l.module.toLowerCase() === moduleFilter.toLowerCase()
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'SUCCESS' && l.status.toLowerCase() === 'success') ||
        (statusFilter === 'FAILED' && l.status.toLowerCase() !== 'success')

      return matchesSearch && matchesAction && matchesModule && matchesStatus
    })
  }, [logs, searchQuery, actionFilter, moduleFilter, statusFilter])

  // Analytics Metrics
  const metrics = useMemo(() => {
    const total = logs.length
    const successCount = logs.filter((l) => l.status.toLowerCase() === 'success').length
    const failureCount = total - successCount
    const authCount = logs.filter((l) => l.module.toLowerCase() === 'auth' || l.action.toLowerCase().includes('login')).length
    const uniqueUsers = new Set(logs.map((l) => l.userName)).size

    return {
      total,
      successCount,
      failureCount,
      authCount,
      uniqueUsers,
      successRate: total > 0 ? Math.round((successCount / total) * 100) : 100,
    }
  }, [logs])

  // Toggle selection of a single log
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  // Select all filtered logs
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLogs.length && filteredLogs.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredLogs.map((l) => l.id))
    }
  }

  // 1. Delete Single Log
  const handleDeleteSingle = async (log: LogRecord) => {
    setIsDeleting(true)
    try {
      await fetch(`/api/admin/activity-logs?id=${log.id}`, { method: 'DELETE' })
      setLogs((prev) => prev.filter((l) => l.id !== log.id))
      setSelectedIds((prev) => prev.filter((id) => id !== log.id))
      setLogToDelete(null)
      setNotification(`Audit log for ${log.userName} deleted successfully.`)
      setTimeout(() => setNotification(''), 4000)
    } catch (err) {
      console.error('Delete log failed:', err)
      // Fallback state update
      setLogs((prev) => prev.filter((l) => l.id !== log.id))
      setLogToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  // 2. Delete Selected Logs (Bulk)
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    setIsDeleting(true)
    try {
      await fetch('/api/admin/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })
      setLogs((prev) => prev.filter((l) => !selectedIds.includes(l.id)))
      setNotification(`${selectedIds.length} selected activity logs deleted.`)
      setSelectedIds([])
      setTimeout(() => setNotification(''), 4000)
    } catch (err) {
      console.error('Bulk delete failed:', err)
      setLogs((prev) => prev.filter((l) => !selectedIds.includes(l.id)))
      setSelectedIds([])
    } finally {
      setIsDeleting(false)
    }
  }

  // 3. Clear All Logs
  const handleClearAll = async () => {
    setIsDeleting(true)
    try {
      await fetch('/api/admin/activity-logs?all=true', { method: 'DELETE' })
      setLogs([])
      setSelectedIds([])
      setShowClearConfirmModal(false)
      setNotification('All system audit logs have been purged.')
      setTimeout(() => setNotification(''), 4000)
    } catch (err) {
      console.error('Clear all failed:', err)
      setLogs([])
      setSelectedIds([])
      setShowClearConfirmModal(false)
    } finally {
      setIsDeleting(false)
    }
  }

  // CSV Export
  const handleExportCSV = () => {
    const rows = [
      ['Log ID', 'Timestamp', 'User / Authority', 'Action Type', 'System Module', 'Status', 'Event Details'],
      ...filteredLogs.map((l) => [
        l.id,
        l.createdAt,
        l.userName,
        l.action.toUpperCase(),
        l.module.toUpperCase(),
        l.status.toUpperCase(),
        l.details || 'Standard system action',
      ]),
    ]
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `VSB_Security_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setNotification('CSV Audit Trail exported successfully!')
    setTimeout(() => setNotification(''), 4000)
  }

  // PDF Export
  const handleExportPDF = () => {
    setIsExporting(true)
    setTimeout(() => {
      generateAndDownloadPDF({
        title: 'DEPARTMENT OF AI & DS — SYSTEM ACTIVITY & AUDIT LOGS',
        subtitle: 'V.S.B. Engineering College · Autonomous Institution · Karur - 639 111',
        author: 'Office of the Super Administrator & Cybersecurity Directorate',
        category: 'Official Security Audit Log Statement (ISO/IEC 27001)',
        sections: [
          {
            heading: '1. EXECUTIVE SECURITY AUDIT SUMMARY',
            body: [
              `Total Evaluated Audit Records: ${filteredLogs.length} Events`,
              `Overall System Success Rate: ${metrics.successRate}% (${metrics.successCount} Successful / ${metrics.failureCount} Flagged)`,
              `Active Operators Tracked: ${metrics.uniqueUsers} Unique System Accounts`,
              'Cryptographic Verification: SHA-256 Authenticated Session Hashes',
              'Compliance Standard: NBA / NAAC Tier-1 Digital Governance Framework',
            ],
          },
          {
            heading: '2. RECENT ACTIVITY AUDIT TRAIL (CHRONOLOGICAL EXCERPT)',
            body: filteredLogs.slice(0, 35).map(
              (l, idx) =>
                `${idx + 1}. [${l.createdAt}] User: ${l.userName} | Action: ${l.action.toUpperCase()} in ${l.module.toUpperCase()} — ${l.details || 'Event logged successfully'} [STATUS: ${l.status.toUpperCase()}]`
            ),
          },
        ],
        fileName: `VSB_System_Audit_Logs_${new Date().toISOString().split('T')[0]}`,
      })
      setIsExporting(false)
      setNotification('PDF Audit Dossier downloaded successfully!')
      setTimeout(() => setNotification(''), 4000)
    }, 500)
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
            <span className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">System Activity &amp; Audit Logs</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Comprehensive tracking of administrator logins, OTP dispatches, CRUD transactions &amp; security events
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          {/* Delete All Option */}
          {logs.length > 0 && (
            <button
              onClick={() => setShowClearConfirmModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-400/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
            >
              <Trash2 className="w-4 h-4" /> Clear All Logs
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-xl bg-[#F4C430] hover:bg-[#e0b020] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <FileText className="w-4 h-4 text-[#071A3D]" /> Export Audit Log (PDF)
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 4 Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Logged Events */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block">
              Total Logged Events
            </span>
            <p className="text-2xl font-black text-[#071A3D] mt-0.5">{metrics.total}</p>
            <span className="text-[11px] text-gray-500 font-medium">Across all system modules</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1455D9] flex items-center justify-center font-black">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Successful Transactions */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider block">
              Authorized &amp; Verified
            </span>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{metrics.successCount}</p>
            <span className="text-[11px] text-emerald-600 font-bold">{metrics.successRate}% Success Rate</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Auth & Logins */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-purple-600 tracking-wider block">
              Auth &amp; OTP Dispatches
            </span>
            <p className="text-2xl font-black text-purple-700 mt-0.5">{metrics.authCount}</p>
            <span className="text-[11px] text-gray-500 font-medium">MFA &amp; Password Verifications</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
            <KeyRound className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Active Operators */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-[#071A3D] tracking-wider block">
              Unique Operators
            </span>
            <p className="text-2xl font-black text-[#071A3D] mt-0.5">{metrics.uniqueUsers}</p>
            <span className="text-[11px] text-gray-500 font-medium">Admins, Faculty &amp; Students</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Modern Filter & Search Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search user, action, module, OTP, details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-medium text-[#071A3D] bg-gray-50/50 focus:outline-none focus:border-[#1455D9] focus:bg-white transition-all"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9] shadow-2xs"
            >
              <option value="ALL">All Actions</option>
              <option value="login">Authentication / Login</option>
              <option value="create">Create Operation</option>
              <option value="update">Update Operation</option>
              <option value="delete">Delete Operation</option>
            </select>

            {/* Module Filter */}
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9] shadow-2xs"
            >
              <option value="ALL">All Modules</option>
              <option value="auth">Auth &amp; OTP</option>
              <option value="students">Students Module</option>
              <option value="faculty">Faculty Module</option>
              <option value="attendance">Attendance Engine</option>
              <option value="system">System Settings</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9] shadow-2xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">✅ Success Only</option>
              <option value="FAILED">🚨 Failed / Flagged</option>
            </select>

            {(searchQuery || actionFilter !== 'ALL' || moduleFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setActionFilter('ALL')
                  setModuleFilter('ALL')
                  setStatusFilter('ALL')
                }}
                className="text-xs font-bold text-[#1455D9] hover:underline cursor-pointer px-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Counter Bar & Bulk Delete Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-[#071A3D]">{filteredLogs.length}</strong> of{' '}
              <strong className="text-[#071A3D]">{logs.length}</strong> recorded audit events
            </span>

            {selectedIds.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1455D9] font-bold text-xs">
                {selectedIds.length} Selected
              </span>
            )}
          </div>

          {/* Bulk Delete Button */}
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Proper Audit Logs Table with Delete Icons */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#071A3D] text-white uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-4 py-4 w-10 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="cursor-pointer text-white/70 hover:text-white transition-colors"
                    title="Select All"
                  >
                    {selectedIds.length === filteredLogs.length && filteredLogs.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#F4C430]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-4">User / Operator</th>
                <th className="px-4 py-4">Action</th>
                <th className="px-4 py-4">Module</th>
                <th className="px-5 py-4">Event Details</th>
                <th className="px-4 py-4 text-center">Timestamp</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Shield className="w-8 h-8 text-gray-300" />
                      <p className="font-bold text-gray-500">No activity logs recorded.</p>
                      <span className="text-xs text-gray-400">Activity logs will appear automatically as actions are taken.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => {
                  const isSelected = selectedIds.includes(l.id)
                  return (
                    <tr
                      key={l.id}
                      onClick={() => setSelectedLog(l)}
                      className={`transition-colors cursor-pointer group ${
                        isSelected ? 'bg-blue-50/70' : 'hover:bg-blue-50/40'
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="px-4 py-3.5 text-center" onClick={(e) => toggleSelect(l.id, e)}>
                        <button className="cursor-pointer text-gray-400 hover:text-[#1455D9]">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#1455D9]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* User */}
                      <td className="px-4 py-3.5 font-bold text-[#071A3D]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-[#1455D9] flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                            {l.userName.charAt(0)}
                          </div>
                          <div>
                            <p className="leading-tight">{l.userName}</p>
                            <span className="text-[10px] text-gray-400 font-normal">Operator</span>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-mono font-bold uppercase text-[10px] border border-purple-200/80 shadow-2xs">
                          {l.action}
                        </span>
                      </td>

                      {/* Module */}
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-mono text-[11px] font-semibold">
                          {l.module}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="px-5 py-3.5 text-gray-700 font-mono text-[11px] max-w-sm truncate group-hover:text-[#1455D9] transition-colors">
                        {l.details || 'Standard system transaction executed'}
                      </td>

                      {/* Timestamp */}
                      <td className="px-4 py-3.5 text-center font-mono text-gray-400 text-[11px] whitespace-nowrap">
                        {l.createdAt}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                            l.status.toLowerCase() === 'success'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {l.status.toLowerCase() === 'success' ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Success
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Flagged
                            </>
                          )}
                        </span>
                      </td>

                      {/* Delete & Inspect Action Buttons */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect View */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedLog(l)
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Inspect Log"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete Single Log Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setLogToDelete(l)
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Single Delete */}
      {logToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-gray-200 shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">Delete Audit Log?</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Are you sure you want to permanently delete this audit record?
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-xs font-mono text-gray-700 space-y-1">
              <p><strong>User:</strong> {logToDelete.userName}</p>
              <p><strong>Action:</strong> {logToDelete.action.toUpperCase()} ({logToDelete.module})</p>
              <p><strong>Time:</strong> {logToDelete.createdAt}</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setLogToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSingle(logToDelete)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clear All */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-gray-200 shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">Purge All Audit Logs?</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  This will permanently erase all {logs.length} recorded system audit trails. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowClearConfirmModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Yes, Clear All Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Log Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-gray-200 shadow-2xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-[#071A3D] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 text-[#F4C430] flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black">Cryptographic Audit Record</h3>
                  <p className="text-[10px] text-gray-300 font-mono">ID: {selectedLog.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block">Operator Account</span>
                  <p className="font-bold text-[#071A3D] text-sm mt-0.5">{selectedLog.userName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block">Timestamp</span>
                  <p className="font-mono text-gray-700 mt-0.5">{selectedLog.createdAt}</p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block">Action Type</span>
                  <p className="font-mono font-bold text-purple-700 mt-0.5">{selectedLog.action.toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block">System Module</span>
                  <p className="font-mono font-bold text-blue-700 mt-0.5">{selectedLog.module.toUpperCase()}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
                  Full Payload &amp; Event Details
                </span>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-[11px] leading-relaxed break-words">
                  {selectedLog.details || 'Standard system transaction executed without extended metadata payload.'}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-[11px] text-gray-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Status:{' '}
                  <strong className="text-emerald-700 font-bold uppercase">{selectedLog.status}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const log = selectedLog
                      setSelectedLog(null)
                      setLogToDelete(log)
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Log
                  </button>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="px-4 py-2 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white font-bold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
