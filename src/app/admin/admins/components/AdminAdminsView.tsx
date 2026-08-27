'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import {
  ShieldCheck,
  Lock,
  UserPlus,
  Edit2,
  Trash2,
  Download,
  Plus,
  X,
  Mail,
  Key,
  Shield,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

export interface AdminUserRecord {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt?: string
}

export function AdminAdminsView({ initialAdmins }: { initialAdmins: AdminUserRecord[] }) {
  const [admins, setAdmins] = useState<AdminUserRecord[]>(initialAdmins)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'super_admin',
    status: 'active',
  })

  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'V.S.B. ENGINEERING COLLEGE (AUTONOMOUS)',
      subtitle: 'System Super Administrators Access Matrix',
      author: 'Security Directorate',
      category: 'System Operators Inventory',
      sections: [
        {
          heading: 'CERTIFIED SUPER ADMINISTRATOR ACCOUNTS',
          body: admins.map(
            (a, i) => `${i + 1}. ${a.name} (${a.email}) · Role: ${a.role.toUpperCase()} · Status: ${a.status.toUpperCase()}`
          ),
        },
      ],
      fileName: 'VSB_Super_Admins_Directory_2026',
    })
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      toast.error('Please fill in Name and Email')
      return
    }

    const newAdmin: AdminUserRecord = {
      id: 'adm_' + Date.now(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
      createdAt: new Date().toISOString().split('T')[0],
    }

    setAdmins([...admins, newAdmin])
    setIsAddModalOpen(false)
    setFormData({
      name: '',
      email: '',
      role: 'super_admin',
      status: 'active',
    })
    toast.success('Administrator record created in system!')
  }

  const handleDelete = (id: string) => {
    if (admins.length <= 1) {
      toast.warning('Cannot delete the last remaining Super Administrator account.')
      return
    }
    setAdmins(admins.filter((a) => a.id !== id))
    toast.success('Administrator access revoked.')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              System Operators &amp; Root Access
            </span>
            <span className="text-xs text-gray-300 font-medium">· Tier-0 Security</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">System Administrators Directory</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Manage certified administrator accounts, 2FA OTP credentials &amp; permissions
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Access List (PDF)
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Add Super Admin
          </button>
        </div>
      </div>

      {/* Admin Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {admins.map((a) => (
          <div
            key={a.id}
            className="p-6 rounded-3xl bg-white border border-gray-200 hover:border-[#1455D9]/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-[#1455D9] text-white flex items-center justify-center font-black text-lg shadow-md">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#071A3D]">{a.name}</h3>
                    <p className="text-xs text-[#1455D9] font-bold font-mono">{a.email}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 text-[10px] font-black uppercase border border-purple-200">
                  {a.role}
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Security Access:</span>
                  <span className="font-bold text-green-700">Root &amp; Database Full Access</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">2FA Protocol:</span>
                  <span className="font-bold text-[#071A3D]">Email SMTP OTP Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Status:</span>
                  <span className="font-bold text-green-700 uppercase">{a.status}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-mono">Created: {a.createdAt}</span>
              <button
                onClick={() => handleDelete(a.id)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                title="Revoke Admin Access"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD ADMIN */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Add New Super Admin</h3>
                <p className="text-xs text-gray-500">Tier-0 Root Privileges</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. System Administrator"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Admin Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@vsb.edu.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Role Permission</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                >
                  <option value="super_admin">Super Administrator (Full Root Access)</option>
                  <option value="moderator">Moderator (Read &amp; Audit Logs)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
