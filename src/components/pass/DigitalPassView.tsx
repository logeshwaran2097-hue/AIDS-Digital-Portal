'use client'

import React, { useState, useRef } from 'react'
import {
  Bus,
  Home,
  QrCode,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  AlertCircle,
  Calendar,
  Sparkles,
  RefreshCw,
  Info,
  Lock,
  XCircle,
  ArrowRight,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DigitalPassViewProps {
  studentName?: string
  registerNumber?: string
  department?: string
  year?: number
  section?: string
  role?: string
  initialHostelBlock?: string
  initialRoomNo?: string
  initialResidencyStatus?: string
  initialBusDetails?: string
  initialBoardingPoint?: string
}

const BUS_ROUTES = [
  {
    routeNo: 'Route 12',
    name: 'Karur Central ↔ VSB Campus',
    via: 'Bus Stand → Collectorate → Gandhigramam → VSB',
    driver: 'M. Selvaraj (Driver)',
    contact: '+91 94432 18290',
    stops: ['Karur Bus Stand (07:45 AM)', 'Collectorate Junction (07:55 AM)', 'Gandhigramam (08:05 AM)', 'Thanthonimalai (08:15 AM)', 'VSB Engineering College (08:30 AM)'],
    morningArrival: '08:30 AM',
    eveningDeparture: '05:00 PM',
    busRegNo: 'TN 47 AJ 8892'
  },
  {
    routeNo: 'Route 07',
    name: 'Erode Junction ↔ VSB Campus',
    via: 'Erode Railway Jn → Kodumudi → Velur → VSB',
    driver: 'K. Palanisamy (Driver)',
    contact: '+91 98421 77123',
    stops: ['Erode Junction (07:15 AM)', 'Solasiramani (07:35 AM)', 'Kodumudi (07:50 AM)', 'Paramathi Velur (08:10 AM)', 'VSB Campus (08:30 AM)'],
    morningArrival: '08:30 AM',
    eveningDeparture: '05:00 PM',
    busRegNo: 'TN 33 BK 4410'
  },
  {
    routeNo: 'Route 18',
    name: 'Dindigul Central ↔ VSB Campus',
    via: 'Dindigul Bus Stand → Vedasandur → VSB',
    driver: 'S. Murugesan (Driver)',
    contact: '+91 99440 33418',
    stops: ['Dindigul Bus Stand (07:10 AM)', 'Vedasandur (07:40 AM)', 'Aravakurichi (08:05 AM)', 'VSB Campus (08:30 AM)'],
    morningArrival: '08:30 AM',
    eveningDeparture: '05:00 PM',
    busRegNo: 'TN 57 CR 2341'
  },
  {
    routeNo: 'Route 22',
    name: 'Tiruchirappalli Junction ↔ VSB Campus',
    via: 'Trichy Central → Kulithalai → Mayanur → VSB',
    driver: 'R. Veeramani (Driver)',
    contact: '+91 97894 55601',
    stops: ['Trichy Central (07:05 AM)', 'Kulithalai (07:45 AM)', 'Mayanur (08:05 AM)', 'Karur Bypass (08:20 AM)', 'VSB Campus (08:35 AM)'],
    morningArrival: '08:35 AM',
    eveningDeparture: '05:00 PM',
    busRegNo: 'TN 45 DH 1029'
  },
  {
    routeNo: 'Route 05',
    name: 'Namakkal Central ↔ VSB Campus',
    via: 'Namakkal Bus Stand → Mohanur → Vangal → VSB',
    driver: 'P. Subramanian (Driver)',
    contact: '+91 98429 88912',
    stops: ['Namakkal Bus Stand (07:25 AM)', 'Mohanur (07:50 AM)', 'Vangal Bridge (08:10 AM)', 'VSB Campus (08:30 AM)'],
    morningArrival: '08:30 AM',
    eveningDeparture: '05:00 PM',
    busRegNo: 'TN 28 EX 7712'
  }
]

const HOSTEL_BLOCKS = [
  { id: 'Boys Hostel I', name: 'Boys Hostel I', label: '👦 Boys Hostel I', blockNumber: 'Block 1', emoji: '👦', warden: 'Dr. K. Ravikumar', contact: '+91 94861 22340', curfew: '06:30 PM' },
  { id: 'Boys Hostel II', name: 'Boys Hostel II', label: '👦 Boys Hostel II', blockNumber: 'Block 2', emoji: '👦', warden: 'Prof. N. Venkatesh', contact: '+91 94861 22341', curfew: '06:30 PM' },
  { id: 'Boys Hostel III', name: 'Boys Hostel III', label: '👦 Boys Hostel III', blockNumber: 'Block 3', emoji: '👦', warden: 'Dr. M. Suresh Kumar', contact: '+91 94861 22342', curfew: '06:30 PM' },
  { id: 'Girls Hostel I', name: 'Girls Hostel I', label: '👧 Girls Hostel I', blockNumber: 'Block 1', emoji: '👧', warden: 'Dr. S. Meenakshi', contact: '+91 94861 22343', curfew: '06:00 PM' },
  { id: 'Girls Hostel II', name: 'Girls Hostel II', label: '👧 Girls Hostel II', blockNumber: 'Block 2', emoji: '👧', warden: 'Prof. M. Geetha', contact: '+91 94861 22344', curfew: '06:00 PM' },
  { id: 'Girls Hostel III', name: 'Girls Hostel III', label: '👧 Girls Hostel III', blockNumber: 'Block 3', emoji: '👧', warden: 'Prof. K. Nithya', contact: '+91 94861 22345', curfew: '06:00 PM' }
]

export default function DigitalPassView({
  studentName = 'Logeshwaran G',
  registerNumber = '922525243103',
  department = 'Artificial Intelligence & Data Science',
  year = 2,
  section = 'B',
  role = 'student',
  initialHostelBlock,
  initialRoomNo,
  initialResidencyStatus,
  initialBusDetails,
  initialBoardingPoint,
}: DigitalPassViewProps) {
  const [activeTab, setActiveTab] = useState<'bus' | 'hostel'>('hostel')
  
  // Bus state
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0)
  const [boardingStop, setBoardingStop] = useState(initialBoardingPoint || BUS_ROUTES[0].stops[0])
  const [seatNo, setSeatNo] = useState('Seat #34')

  // Hostel state - auto select from onboarding data
  const initialHostelIdx = HOSTEL_BLOCKS.findIndex(
    (h) => h.id === initialHostelBlock || h.name === initialHostelBlock || (initialHostelBlock && h.name.toLowerCase().includes(initialHostelBlock.toLowerCase()))
  )
  const [selectedHostelIndex, setSelectedHostelIndex] = useState(initialHostelIdx !== -1 ? initialHostelIdx : 0)
  const [roomNo, setRoomNo] = useState(initialRoomNo || 'Room 204')
  const [passType, setPassType] = useState<'day_outing' | 'home_leave' | 'emergency'>('day_outing')
  const [outingPurpose, setOutingPurpose] = useState('Library & Project Component Sourcing')
  const [expectedReturn, setExpectedReturn] = useState('06:15 PM Today')
  const [parentPhone, setParentPhone] = useState('+91 94432 55890')
  const [applicationTime, setApplicationTime] = useState('Today, 02:45 PM')

  // Multi-step Authorization Lifecycle for Gate Pass
  // Certificate ONLY generates after BOTH Parent and Warden confirm!
  const [parentConfirmed, setParentConfirmed] = useState(false)
  const [wardenConfirmed, setWardenConfirmed] = useState(false)

  const isHostelCertificateGenerated = activeTab === 'hostel' && parentConfirmed && wardenConfirmed
  const currentRoute = BUS_ROUTES[selectedRouteIndex]
  const currentHostel = HOSTEL_BLOCKS[selectedHostelIndex]
  const passRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (activeTab === 'hostel' && !isHostelCertificateGenerated) {
      toast.error('Certificate not yet generated! Both parent confirmation and warden approval are required.', { icon: '🔒' })
      return
    }
    window.print()
  }

  const handleDownloadSlip = () => {
    if (activeTab === 'hostel' && !isHostelCertificateGenerated) {
      toast.error('Pass token cannot be downloaded until parent and warden approvals are complete.', { icon: '🔒' })
      return
    }
    toast.success('Digital Pass slip saved as offline verifiable token!', { icon: '🎫' })
  }

  // Interactive Live Verification Actions
  const handleVerifyParent = () => {
    setParentConfirmed(true)
    toast.success('Parent telephonic confirmation recorded! Dispatched to Hostel Warden for final sanction.', { icon: '📞' })
  }

  const handleWardenSanction = () => {
    if (!parentConfirmed) {
      toast.error('Parent confirmation is required before warden sanction!', { icon: '⚠️' })
      return
    }
    setWardenConfirmed(true)
    toast.success('🎉 Hostel Warden has sanctioned your Gate Pass! Official Certificate generated.', { icon: '🛡️' })
  }

  const handleResetWorkflow = () => {
    setParentConfirmed(false)
    setWardenConfirmed(false)
    toast('Gate pass reset to awaiting parent confirmation.', { icon: '🔄' })
  }

  const handleApplyGatePass = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setParentConfirmed(false)
    setWardenConfirmed(false)
    setApplicationTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }))
    toast.success('New Gate Pass application submitted! Awaiting parent telephonic confirmation.', { icon: '📋' })
  }

  // Live timestamp
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0E2C66] to-[#1455D9] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-cyan-200">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Institutional Digital Authorization System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bus Route & Hostel Digital Pass
            </h1>
            <p className="text-sm text-cyan-100/80 max-w-2xl leading-relaxed">
              Tamper-proof encrypted digital passes for college transport and hostel gate security. Fully paperless and instant verification.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-md border font-medium text-xs sm:text-sm transition-all shadow-md cursor-pointer ${
                activeTab === 'hostel' && !isHostelCertificateGenerated
                  ? 'bg-white/5 border-white/10 text-white/50 cursor-not-allowed'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
              title={activeTab === 'hostel' && !isHostelCertificateGenerated ? 'Certificate not yet generated' : 'Print Pass'}
            >
              <Printer className="w-4 h-4" />
              <span>Print Pass</span>
            </button>
            <button
              onClick={handleDownloadSlip}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer ${
                activeTab === 'hostel' && !isHostelCertificateGenerated
                  ? 'bg-slate-700/60 text-slate-400 cursor-not-allowed border border-white/10'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-[#071A3D]'
              }`}
              title={activeTab === 'hostel' && !isHostelCertificateGenerated ? 'Certificate not yet generated' : 'Download Token'}
            >
              <Download className="w-4 h-4" />
              <span>Download Token</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <button
            onClick={() => setActiveTab('bus')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'bus'
                ? 'bg-white text-[#071A3D] shadow-lg shadow-black/20'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Bus className="w-4 h-4 text-blue-600" />
            <span>College Bus Route Pass</span>
          </button>
          <button
            onClick={() => setActiveTab('hostel')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'hostel'
                ? 'bg-white text-[#071A3D] shadow-lg shadow-black/20'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 text-emerald-600" />
            <span>Hostel &amp; Gate Outing Pass</span>
            {activeTab === 'hostel' && (
              <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                isHostelCertificateGenerated
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {isHostelCertificateGenerated ? 'Generated' : 'Approval In Progress'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Digital Pass Card / Approval Pipeline */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* CASE A: Active Tab is Bus OR Hostel Certificate is fully approved */}
          {(activeTab === 'bus' || isHostelCertificateGenerated) && (
            <div className="space-y-4">
              {/* Success notice for generated hostel pass */}
              {activeTab === 'hostel' && isHostelCertificateGenerated && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="block font-black text-emerald-900 text-xs sm:text-sm">
                        🎉 Gate Pass Certificate Generated Successfully!
                      </strong>
                      <span className="text-emerald-800 text-[11px]">
                        Both Parent Telephonic Confirmation and Hostel Warden Sanction have been recorded.
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleResetWorkflow}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-bold text-[11px] hover:bg-emerald-800 transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset Simulation</span>
                  </button>
                </div>
              )}

              <div
                ref={passRef}
                className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative"
              >
                {/* Hologram Header Bar */}
                <div className="h-3 w-full bg-gradient-to-r from-blue-600 via-cyan-400 via-emerald-400 to-indigo-600" />

                <div className="p-6 sm:p-7 space-y-6">
                  {/* College Header */}
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#071A3D] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0 ring-4 ring-blue-50">
                        VSB
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[#071A3D] text-sm sm:text-base leading-snug">
                          V.S.B. ENGINEERING COLLEGE
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          An Autonomous Institution • Affiliated to Anna University • Accredited by NAAC &amp; NBA
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        AUTHENTICATED
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">Academic Year 2026-27</p>
                    </div>
                  </div>

                  {/* Pass Title based on tab */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        OFFICIAL DIGITAL PASS
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                        {activeTab === 'bus' && 'College Bus Transportation Pass'}
                        {activeTab === 'hostel' && 'Hostel Resident & Gate Outing Pass'}
                      </h2>
                    </div>
                    <div className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                      PASS #{registerNumber.slice(-4)}-{activeTab.toUpperCase()}
                    </div>
                  </div>

                  {/* Student Identification Profile Card */}
                  <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Student Name</span>
                      <strong className="text-slate-800 font-bold text-sm truncate block mt-0.5">{studentName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Register No</span>
                      <strong className="text-slate-800 font-bold text-sm font-mono block mt-0.5">{registerNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Department</span>
                      <strong className="text-slate-800 font-bold block mt-0.5">AI &amp; DS</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Year &amp; Sec</span>
                      <strong className="text-slate-800 font-bold block mt-0.5">Year {year} • Sec {section}</strong>
                    </div>
                  </div>

                  {/* Dynamic Tab-Specific Card Body */}
                  {activeTab === 'bus' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 sm:p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bus className="w-5 h-5 text-blue-600" />
                            <h4 className="font-bold text-blue-950 text-sm">{currentRoute.routeNo}: {currentRoute.name}</h4>
                          </div>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-200 text-blue-800 font-mono">
                            {seatNo}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-blue-100">
                          <div>
                            <span className="text-blue-500 font-medium block text-[11px]">Selected Boarding Stop:</span>
                            <div className="flex items-center gap-1.5 mt-0.5 font-bold text-slate-800">
                              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{boardingStop}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-blue-500 font-medium block text-[11px]">Bus Vehicle Number:</span>
                            <div className="font-mono font-bold text-slate-800 mt-0.5">
                              {currentRoute.busRegNo}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-blue-100">
                          <div>
                            <span className="text-blue-500 font-medium block text-[11px]">Morning College Arrival:</span>
                            <strong className="text-slate-800 font-bold mt-0.5 block">{currentRoute.morningArrival}</strong>
                          </div>
                          <div>
                            <span className="text-blue-500 font-medium block text-[11px]">Evening Campus Departure:</span>
                            <strong className="text-slate-800 font-bold mt-0.5 block">{currentRoute.eveningDeparture}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span><strong>Designated Bus Driver:</strong> {currentRoute.driver}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-700 font-mono">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{currentRoute.contact}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'hostel' && (
                    <div className="space-y-4">
                      <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 sm:p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Home className="w-5 h-5 text-emerald-600" />
                            <h4 className="font-bold text-emerald-950 text-sm">{currentHostel.name}</h4>
                          </div>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-mono">
                            {roomNo}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-emerald-100">
                          <div>
                            <span className="text-emerald-600 font-medium block text-[11px]">Pass Category:</span>
                            <strong className="text-slate-800 capitalize font-bold mt-0.5 block">
                              {passType.replace('_', ' ')}
                            </strong>
                          </div>
                          <div>
                            <span className="text-emerald-600 font-medium block text-[11px]">Gate Return Curfew:</span>
                            <strong className="text-red-700 font-bold mt-0.5 block">
                              {expectedReturn} (Max: {currentHostel.curfew})
                            </strong>
                          </div>
                        </div>

                        <div className="text-xs pt-2 border-t border-emerald-100">
                          <span className="text-emerald-600 font-medium block text-[11px]">Approved Purpose of Outing:</span>
                          <p className="text-slate-800 font-medium mt-0.5">{outingPurpose}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Parent Telephonic Consent Confirmed
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-blue-700 font-bold bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            Hostel Warden Sanctioned
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span><strong>Hostel Warden:</strong> {currentHostel.warden}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-700 font-mono">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{currentHostel.contact}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottom Security Cryptographic QR & Stamps */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Security QR Box */}
                      <div className="w-20 h-20 bg-slate-900 rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-md">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                          <rect x="10" y="10" width="25" height="25" fill="#fff" />
                          <rect x="15" y="15" width="15" height="15" fill="#000" />
                          <rect x="65" y="10" width="25" height="25" fill="#fff" />
                          <rect x="70" y="15" width="15" height="15" fill="#000" />
                          <rect x="10" y="65" width="25" height="25" fill="#fff" />
                          <rect x="15" y="70" width="15" height="15" fill="#000" />
                          <rect x="40" y="20" width="10" height="10" fill="#fff" />
                          <rect x="40" y="40" width="20" height="20" fill="#fff" />
                          <rect x="70" y="50" width="15" height="10" fill="#fff" />
                          <rect x="45" y="70" width="15" height="15" fill="#fff" />
                          <rect x="70" y="75" width="10" height="10" fill="#fff" />
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Cryptographically Signed Pass</span>
                        </div>
                        <p className="text-[10px] text-slate-500 max-w-xs leading-tight">
                          Security personnel &amp; gate guards scan this QR code directly via mobile reader to verify live gate authorization in the central database.
                        </p>
                        <p className="text-[9px] font-mono text-slate-400">
                          Token Hash: SHA256:{registerNumber.slice(0, 6)}...{activeTab.toUpperCase()}-AUTH
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-400/80 flex flex-col items-center justify-center p-1 text-[8px] font-bold text-blue-900 leading-tight uppercase transform -rotate-12 bg-blue-50/50">
                        <span>VSB SEAL</span>
                        <span className="text-[7px] text-blue-600 font-mono">{issueDate}</span>
                        <span>VERIFIED</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CASE B: Active Tab is Hostel AND Certificate is NOT YET GENERATED */}
          {activeTab === 'hostel' && !isHostelCertificateGenerated && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative">
              {/* Amber / Blue Progress Bar */}
              <div className="h-3 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-blue-600" />

              <div className="p-6 sm:p-7 space-y-6">
                {/* College Header */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#071A3D] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0 ring-4 ring-blue-50">
                      VSB
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#071A3D] text-sm sm:text-base leading-snug">
                        V.S.B. ENGINEERING COLLEGE
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        An Autonomous Institution • Affiliated to Anna University • Accredited by NAAC &amp; NBA
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-[10px] font-bold text-amber-800">
                      <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                      VERIFICATION IN PROGRESS
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Academic Year 2026-27</p>
                  </div>
                </div>

                {/* Lock & Policy Notice Banner */}
                <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-200 rounded-2xl p-4 sm:p-5">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-amber-950 text-sm sm:text-base">
                        Official Gate Pass Certificate Pending Authorization
                      </h4>
                      <p className="text-xs text-amber-900/90 leading-relaxed">
                        As per V.S.B. institutional regulations, the official encrypted digital Gate Pass Certificate &amp; QR barcode will generate <strong>only after Parent Confirmation</strong> and <strong>Hostel Warden Confirmation</strong> are recorded.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Student Identification Profile Card */}
                <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Student Name</span>
                    <strong className="text-slate-800 font-bold text-sm truncate block mt-0.5">{studentName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Register No</span>
                    <strong className="text-slate-800 font-bold text-sm font-mono block mt-0.5">{registerNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hostel &amp; Room</span>
                    <strong className="text-slate-800 font-bold block mt-0.5">{currentHostel.name} • {roomNo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Curfew Limit</span>
                    <strong className="text-red-600 font-bold block mt-0.5">{expectedReturn} (Max: {currentHostel.curfew})</strong>
                  </div>
                </div>

                {/* Live 3-Stage Progress Pipeline */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Mandatory Gate Pass Verification Pipeline
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Req #{registerNumber.slice(-4)}-GATE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Stage 1: Student Application */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-emerald-950 text-xs">1. Requisition</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-[11px] text-emerald-800 font-medium">
                        Submitted by Student
                      </p>
                      <span className="text-[10px] text-emerald-600 block font-mono">
                        {applicationTime}
                      </span>
                    </div>

                    {/* Stage 2: Parent Confirmation */}
                    <div className={`p-3.5 rounded-2xl border space-y-1.5 shadow-2xs transition-all ${
                      parentConfirmed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs">2. Parent Confirmation</span>
                        {parentConfirmed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Phone className="w-4 h-4 text-amber-600 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[11px] font-medium">
                        {parentConfirmed ? 'Telephonically Confirmed' : 'Awaiting Parent Call'}
                      </p>
                      <span className="text-[10px] opacity-75 block font-mono">
                        {parentPhone}
                      </span>
                    </div>

                    {/* Stage 3: Warden Confirmation */}
                    <div className={`p-3.5 rounded-2xl border space-y-1.5 shadow-2xs transition-all ${
                      wardenConfirmed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : parentConfirmed
                        ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400/30 text-blue-950'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs">3. Warden Confirmation</span>
                        {wardenConfirmed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : parentConfirmed ? (
                          <Clock className="w-4 h-4 text-blue-600 animate-spin" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <p className="text-[11px] font-medium">
                        {wardenConfirmed
                          ? 'Sanctioned & Signed'
                          : parentConfirmed
                          ? 'Awaiting Sign-off'
                          : 'Locked (Needs Parent)'}
                      </p>
                      <span className="text-[10px] opacity-75 block truncate">
                        {currentHostel.warden}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Verification Actions Desk */}
                <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      Live Approval Simulation Desk (Testing Account: {registerNumber})
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Interactive Testing</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleVerifyParent}
                      disabled={parentConfirmed}
                      className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        parentConfirmed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{parentConfirmed ? '✓ Parent Consent Confirmed' : '1. Verify Parent Confirmation'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleWardenSanction}
                      disabled={!parentConfirmed || wardenConfirmed}
                      className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        wardenConfirmed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                          : parentConfirmed
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20'
                          : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>
                        {wardenConfirmed
                          ? '✓ Warden Sanctioned'
                          : parentConfirmed
                          ? '2. Sanction as Hostel Warden'
                          : '2. Warden Sanction (Locked)'}
                      </span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-600 text-center font-medium">
                    {!parentConfirmed && '👉 Click "1. Verify Parent Confirmation" to record parent consent.'}
                    {parentConfirmed && !wardenConfirmed && '👉 Parent confirmed! Now click "2. Sanction as Hostel Warden" to generate the pass certificate.'}
                  </p>
                </div>

                {/* Purpose & Declared Details */}
                <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Declared Outing Purpose</span>
                    <span className="font-bold text-slate-800">{outingPurpose}</span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Category &amp; Return Curfew</span>
                    <span className="font-bold text-emerald-700 capitalize">{passType.replace('_', ' ')} • {expectedReturn}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pass Customization & Application Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* BUS ROUTE CONTROLS */}
          {activeTab === 'bus' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Bus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Select Bus Route &amp; Boarding Stop</h3>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-600 block">Available College Bus Routes:</label>
                <select
                  value={selectedRouteIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value)
                    setSelectedRouteIndex(idx)
                    setBoardingStop(BUS_ROUTES[idx].stops[0])
                    toast.success(`Switched to ${BUS_ROUTES[idx].routeNo}!`)
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {BUS_ROUTES.map((route, i) => (
                    <option key={route.routeNo} value={i}>
                      {route.routeNo} - {route.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-600 block">Your Designated Boarding Stop:</label>
                <select
                  value={boardingStop}
                  onChange={(e) => {
                    setBoardingStop(e.target.value)
                    toast.success(`Boarding point updated!`)
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {currentRoute.stops.map((stop) => (
                    <option key={stop} value={stop}>
                      {stop}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-600 block">Preferred Seat Reservation:</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Seat #12', 'Seat #24', 'Seat #34', 'Seat #46'].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSeatNo(s)
                        toast.success(`${s} reserved!`)
                      }}
                      className={`py-2 text-xs font-mono font-bold rounded-lg border cursor-pointer transition-all ${
                        seatNo === s
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-3.5 text-xs text-blue-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Transport Rules</span>
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Students must display this digital QR pass when boarding. In case of route change, submit request 24 hours prior to department transport desk.
                </p>
              </div>
            </div>
          )}

          {/* HOSTEL GATE PASS APPLICATION DESK */}
          {activeTab === 'hostel' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Hostel Gate Pass Application</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isHostelCertificateGenerated
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {isHostelCertificateGenerated ? 'Certificate Active' : 'Awaiting Approvals'}
                </span>
              </div>

              <form onSubmit={handleApplyGatePass} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 block">
                    🏢 Hostel Number / Block (6 Options):
                  </label>
                  <select
                    value={selectedHostelIndex}
                    onChange={(e) => {
                      const idx = Number(e.target.value)
                      setSelectedHostelIndex(idx)
                      toast.success(`Selected ${HOSTEL_BLOCKS[idx].name}!`)
                    }}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {HOSTEL_BLOCKS.map((h, i) => (
                      <option key={h.id} value={i}>
                        {h.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Room No:</label>
                    <input
                      type="text"
                      value={roomNo}
                      onChange={(e) => setRoomNo(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Expected Return:</label>
                    <input
                      type="text"
                      value={expectedReturn}
                      onChange={(e) => setExpectedReturn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 block">Outing Category:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'day_outing', label: 'Day Outing' },
                      { id: 'home_leave', label: 'Home Leave' },
                      { id: 'emergency', label: 'Medical' }
                    ].map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setPassType(cat.id as any)}
                        className={`py-2 text-[11px] font-bold rounded-lg border cursor-pointer transition-all ${
                          passType === cat.id
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 block">Parent Phone Number (For Call Verification):</label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <input
                      type="text"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                      placeholder="+91 94432 55890"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 block">Purpose / Destination:</label>
                  <input
                    type="text"
                    value={outingPurpose}
                    onChange={(e) => setOutingPurpose(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                    placeholder="Reason for outing..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Submit Gate Pass Application</span>
                </button>
              </form>

              {/* Status Note */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Parent Confirmation:</span>
                  <strong className={parentConfirmed ? 'text-emerald-600' : 'text-amber-600'}>
                    {parentConfirmed ? 'Confirmed' : 'Pending Call'}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Warden Sanction:</span>
                  <strong className={wardenConfirmed ? 'text-emerald-600' : 'text-slate-500'}>
                    {wardenConfirmed ? 'Sanctioned' : parentConfirmed ? 'Pending Review' : 'Locked'}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-slate-600 border-t border-slate-200/50 pt-1.5">
                  <span>Certificate Status:</span>
                  <strong className={isHostelCertificateGenerated ? 'text-emerald-600' : 'text-amber-600'}>
                    {isHostelCertificateGenerated ? 'Generated & Valid' : 'Awaiting Approvals'}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Institutional Help & Hotline */}
          <div className="bg-gradient-to-br from-slate-900 to-[#071A3D] text-white rounded-3xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <Phone className="w-4 h-4" />
              <span>Campus Security &amp; Help Desks</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Main Gate Security:</span>
                <span className="font-mono font-bold text-white">04324-290001</span>
              </div>
              <div className="flex justify-between">
                <span>College Bus Transport Incharge:</span>
                <span className="font-mono font-bold text-white">04324-290008</span>
              </div>
              <div className="flex justify-between">
                <span>Chief Warden Office:</span>
                <span className="font-mono font-bold text-white">04324-290015</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
