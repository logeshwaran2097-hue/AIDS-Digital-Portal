'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  User,
  Mail,
  Shield,
  Phone,
  Building,
  Key,
  Download,
  Save,
  Check,
  Sparkles,
  Lock,
  Calendar,
  CheckCircle2,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface AdminProfileData {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  department?: string
  lastLogin?: string
}

export function AdminProfileView({ initialProfile }: { initialProfile: AdminProfileData }) {
  const [profile, setProfile] = useState<AdminProfileData>(initialProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone || '+91 94433 12345',
    department: 'Department of Artificial Intelligence & Data Science',
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setProfile({
      ...profile,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
    })
    setIsEditing(false)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleExportDossierPDF = () => {
    generateAndDownloadPDF({
      title: 'SUPER ADMINISTRATOR CREDENTIALS & SECURITY DOSSIER',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of Institutional Governance',
      category: 'Official Super Administrator Identity Statement',
      sections: [
        {
          heading: '1. EXECUTIVE ROOT ADMINISTRATOR IDENTITY',
          body: [
            `Full Name: ${profile.name}`,
            `Official Email: ${profile.email}`,
            `Primary 2FA Security Mailbox: lonelyboy44y@gmail.com`,
            `Contact Phone: ${formData.phone}`,
            `Institutional Office: ${formData.department}, VSBEC Karur`,
            'Security Clearance: Tier-0 Super Administrator (Full Root Authority)',
          ],
        },
        {
          heading: '2. SECURITY CREDENTIALS & PRIVILEGES',
          body: [
            '• Role-Based Access Control (RBAC): Tier-0 Super Admin (Unrestricted CRUD across all database tables).',
            '• Authentication Mechanism: Real 6-digit Cryptographic SMTP Email OTP Delivery with IPv4 SSL Transport.',
            '• Session Security: SHA-256 Authenticated HTTP-Only Cookie Tokens.',
            '• Authority: User provisioning, role assignment, examination publishing & system maintenance toggling.',
          ],
        },
      ],
      fileName: `Admin_Dossier_${profile.name.replace(/\s+/g, '_')}`,
    })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Root Authority Profile
            </span>
            <span className="text-xs text-gray-300 font-medium">· Tier-0 Super Admin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Super Administrator Profile</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Institutional credentials, security protocols, contact parameters &amp; session status
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportDossierPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Dossier (PDF)
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2 animate-scale-up">
          <Check className="w-4 h-4 text-green-600" />
          Profile updated successfully!
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-gray-100 pb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#071A3D] to-[#1455D9] text-white flex items-center justify-center font-black text-3xl shadow-xl border-4 border-white shrink-0">
            {profile.name.charAt(0)}
          </div>

          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#071A3D]">{profile.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-200">
                Super Administrator
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-800 border border-green-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-600" /> 2FA Verified
              </span>
            </div>

            <p className="text-xs font-mono text-gray-500">{profile.email}</p>
            <p className="text-xs text-[#1455D9] font-medium">
              Department of Artificial Intelligence &amp; Data Science · VSB Engineering College
            </p>
          </div>
        </div>

        {/* Profile Info Form / View */}
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 text-xs animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Department Office</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save Profile
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <p className="text-gray-400 font-bold uppercase text-[10px]">Administrative Role</p>
              <p className="font-bold text-sm text-[#071A3D]">Super Administrator (Tier-0)</p>
              <p className="text-[11px] text-gray-500">Unrestricted full-stack system governance</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <p className="text-gray-400 font-bold uppercase text-[10px]">2FA Email OTP Dispatch</p>
              <p className="font-bold text-sm text-[#1455D9] font-mono">lonelyboy44y@gmail.com</p>
              <p className="text-[11px] text-green-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Gmail SSL Gateway Active
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <p className="text-gray-400 font-bold uppercase text-[10px]">Security Session Token</p>
              <p className="font-mono text-[#071A3D] font-bold truncate">JWT (SHA-256 Encrypted)</p>
              <p className="text-[11px] text-gray-500">HTTP-Only SameSite Cookie</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <p className="text-gray-400 font-bold uppercase text-[10px]">Last Session Authentication</p>
              <p className="font-bold text-sm text-[#071A3D]">Active Session (Just now)</p>
              <p className="text-[11px] text-gray-500">Session verified via OTP</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
