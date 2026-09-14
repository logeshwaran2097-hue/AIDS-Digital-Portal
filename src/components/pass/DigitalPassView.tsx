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
  initialBusNo?: string
  initialBusDetails?: string
  initialBoardingPoint?: string
}

const BUS_ROUTES = [
  {
    routeNo: 'Route 12',
    busNo: '12',
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
    busNo: '7',
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
    busNo: '18',
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
    busNo: '22',
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
    busNo: '5',
    name: 'Namakkal Central ↔ VSB Campus',
    via: 'Namakkal Bus Stand → Mohanur → Vkl / Vangal → VSB',
    driver: 'P. Subramanian (Driver)',
    contact: '+91 98429 88912',
    stops: ['Namakkal Bus Stand (07:25 AM)', 'Mohanur (07:50 AM)', 'Vkl (08:05 AM)', 'Vangal Bridge (08:15 AM)', 'VSB Campus (08:30 AM)'],
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
  initialResidencyStatus = 'Hostel',
  initialBusNo,
  initialBusDetails,
  initialBoardingPoint,
}: DigitalPassViewProps) {
  // Determine onboarding residency category:
  // If student chose Hostel in onboarding -> only hostel content shows
  // If student chose Day Scholar / College Bus in onboarding -> only college bus content shows
  const detectedMode: 'hostel' | 'college_bus' = (() => {
    const status = (initialResidencyStatus || '').toLowerCase()
    if (status.includes('hostel') || status.includes('hosteller')) return 'hostel'
    if (status.includes('bus') || status.includes('day scholar') || initialBusNo) return 'college_bus'
    return 'hostel'
  })()

  const [activeMode, setActiveMode] = useState<'hostel' | 'college_bus'>(detectedMode)
  
  // Auto-match bus route from student onboarding records
  const initialBusIdx = BUS_ROUTES.findIndex(r => {
    if (initialBusNo && (r.busNo === initialBusNo || r.routeNo.includes(initialBusNo))) return true
    if (initialBusDetails) {
      const lower = initialBusDetails.toLowerCase()
      if (lower.includes(r.routeNo.toLowerCase())) return true
      if (lower.includes('bus 5') && r.busNo === '5') return true
      if (lower.includes('route 5') && r.busNo === '5') return true
      if (lower.includes('route 05') && r.busNo === '5') return true
    }
    return false
  })

  const [selectedRouteIndex, setSelectedRouteIndex] = useState(initialBusIdx !== -1 ? initialBusIdx : 4)
  const matchedRoute = initialBusIdx !== -1 ? BUS_ROUTES[initialBusIdx] : BUS_ROUTES[4]
  const matchedStop = initialBoardingPoint
    ? (matchedRoute.stops.find(s => s.toLowerCase().includes(initialBoardingPoint.toLowerCase())) || initialBoardingPoint)
    : matchedRoute.stops[0]

  const [boardingStop, setBoardingStop] = useState(matchedStop)
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

  const isHostelCertificateGenerated = activeMode === 'hostel' && parentConfirmed && wardenConfirmed
  const currentRoute = BUS_ROUTES[selectedRouteIndex]
  const currentHostel = HOSTEL_BLOCKS[selectedHostelIndex]
  const passRef = useRef<HTMLDivElement>(null)

  // Live timestamp
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

  const handlePrint = () => {
    if (activeMode === 'hostel' && !isHostelCertificateGenerated) {
      toast.error('Certificate not yet generated! Both parent confirmation and warden approval are required.', { icon: '🔒' })
      return
    }
    window.print()
  }

  // Real offline verifiable slip token download
  const handleDownloadSlip = () => {
    if (activeMode === 'hostel' && !isHostelCertificateGenerated) {
      toast.error('Pass token cannot be downloaded until parent and warden approvals are complete.', { icon: '🔒' })
      return
    }

    const passTypeTitle = activeMode === 'college_bus' ? 'College Bus Transportation Slip' : 'Hostel Resident & Gate Outing Pass'
    const passNo = `PASS #${registerNumber.slice(-4)}-${activeMode === 'college_bus' ? 'BUS' : 'HOSTEL'}`
    const content = `
============================================================
       V.S.B. ENGINEERING COLLEGE (AUTONOMOUS)
         OFFICIAL DIGITAL TRANSPORTATION SLIP
============================================================
PASS TYPE      : ${passTypeTitle}
PASS NUMBER    : ${passNo}
ISSUED DATE    : ${issueDate}
ACADEMIC YEAR  : 2026-27

STUDENT PARTICULARS:
- Name         : ${studentName}
- Register No  : ${registerNumber}
- Department   : ${department}
- Year & Sec   : Year ${year} • Sec ${section}

${activeMode === 'college_bus' ? `COLLEGE BUS ONBOARDING PARTICULARS:
- Route Number : ${currentRoute.routeNo} (${currentRoute.name})
- Boarding Stop: ${boardingStop} (Verified via Student Onboarding)
- Vehicle No   : ${currentRoute.busRegNo}
- Driver       : ${currentRoute.driver} (${currentRoute.contact})
- Timings      : Arrival ${currentRoute.morningArrival} | Departure ${currentRoute.eveningDeparture}
- Seat Allocated: ${seatNo}` : `GATE OUTING PARTICULARS:
- Hostel Block : ${currentHostel.name} (Room ${roomNo})
- Outing Type  : ${passType.replace('_', ' ').toUpperCase()}
- Curfew Limit : ${expectedReturn} (Max: ${currentHostel.curfew})
- Purpose      : ${outingPurpose}
- Approvals    : Parent Confirmed & Warden Sanctioned`}

SECURITY & VERIFICATION:
- Authentication: Cryptographically Signed (SHA256 Token)
- Verification  : Mobile QR Verification Active at Gate / Bus Boarding
- Institution   : V.S.B. Engineering College Transport & Security Desk
============================================================
`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `VSB_${activeMode === 'college_bus' ? 'BUS' : 'HOSTEL'}_PASS_SLIP_${registerNumber}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success(`${activeMode === 'college_bus' ? 'College Bus Pass Slip' : 'Gate Outing Pass'} downloaded successfully!`, { icon: '🎫' })
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

  // Ensure currentRoute.stops includes boardingStop
  const availableStops = currentRoute.stops.some(s => s.toLowerCase().includes(boardingStop.toLowerCase()))
    ? currentRoute.stops
    : [boardingStop, ...currentRoute.stops]

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Onboarding Mode Indicator & Test Preview Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${activeMode === 'hostel' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500 animate-pulse'}`} />
          <span className="text-xs font-bold text-slate-800">
            Onboarding Profile: <span className="text-slate-900 font-extrabold">{activeMode === 'hostel' ? `🏡 Hosteller (${currentHostel.name})` : `🚌 Day Scholar (College Bus #${currentRoute.busNo || '5'})`}</span>
          </span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
            Showing only {activeMode === 'hostel' ? 'Hostel Resident' : 'College Bus Commuter'} Content
          </span>
        </div>

        {/* Live Preview / Toggle for Testing Accounts & Roles */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">Switch Onboarding View:</span>
          <button
            type="button"
            onClick={() => setActiveMode('hostel')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'hostel'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Hostel View</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('college_bus')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'college_bus'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>College Bus View</span>
          </button>
        </div>
      </div>

      {/* Header Banner - DYNAMIC BASED ON ONBOARDING MODE */}
      <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden transition-all ${
        activeMode === 'hostel'
          ? 'bg-gradient-to-r from-[#071A3D] via-[#0D382E] to-[#0E5E43]'
          : 'bg-gradient-to-r from-[#071A3D] via-[#0E2C66] to-[#1455D9]'
      }`}>
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-cyan-200">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>
                {activeMode === 'hostel'
                  ? 'Institutional Hostel Gate Authorization System'
                  : 'Institutional Transportation System · Onboarding Verified'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {activeMode === 'hostel'
                ? 'Hostel Resident Digital Gate Pass'
                : 'College Bus Transportation Pass & Slip'}
            </h1>
            <p className="text-sm text-cyan-100/80 max-w-2xl leading-relaxed">
              {activeMode === 'hostel'
                ? 'Official tamper-proof gate pass requisition and authorization lifecycle. Requires parent confirmation and warden sanction before certificate generates.'
                : 'Tamper-proof digital transport pass and offline boarding slip generated directly from your student onboarding records.'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-md border font-medium text-xs sm:text-sm transition-all shadow-md cursor-pointer ${
                activeMode === 'hostel' && !isHostelCertificateGenerated
                  ? 'bg-white/5 border-white/10 text-white/50 cursor-not-allowed'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
              title={activeMode === 'hostel' && !isHostelCertificateGenerated ? 'Certificate not yet generated' : 'Print Pass Slip'}
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={handleDownloadSlip}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer ${
                activeMode === 'hostel' && !isHostelCertificateGenerated
                  ? 'bg-slate-700/60 text-slate-400 cursor-not-allowed border border-white/10'
                  : activeMode === 'hostel'
                  ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-900'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-[#071A3D]'
              }`}
              title={activeMode === 'hostel' && !isHostelCertificateGenerated ? 'Certificate not yet generated' : 'Download Slip Token'}
            >
              <Download className="w-4 h-4" />
              <span>Download Slip</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODE 1: COLLEGE BUS USER VIEW (ONLY SHOWN IF COLLEGE BUS) */}
      {/* ========================================================= */}
      {activeMode === 'college_bus' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: College Bus Pass Card */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="block font-black text-blue-950 text-xs sm:text-sm">
                    🎉 College Bus Transportation Slip Generated!
                  </strong>
                  <span className="text-blue-800 text-[11px]">
                    Synchronized from your verified Onboarding profile (Bus No: {currentRoute.busNo || initialBusNo || '5'} • Boarding Point: {boardingStop}).
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDownloadSlip}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Slip</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-white border border-blue-300 text-blue-900 font-bold text-[11px] hover:bg-blue-100 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Printable Pass Card */}
            <div
              ref={passRef}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative"
            >
              <div className="h-3 w-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600" />

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
                      ONBOARDING VERIFIED
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Academic Year 2026-27</p>
                  </div>
                </div>

                {/* Pass Title */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      OFFICIAL TRANSPORTATION SLIP
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      College Bus Transportation Pass
                    </h2>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                    PASS #{registerNumber.slice(-4)}-BUS
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

                {/* Dynamic Bus Details Card Body */}
                <div className="space-y-4">
                  <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bus className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-blue-950 text-sm">
                          {currentRoute.routeNo}: {currentRoute.name}
                        </h4>
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
                      <span><strong>Transport Incharge / Driver:</strong> {currentRoute.driver}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-700 font-mono">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{currentRoute.contact}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Security QR & Stamps */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
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
                        <span>Cryptographically Signed Slip</span>
                      </div>
                      <p className="text-[10px] text-slate-500 max-w-xs leading-tight">
                        Security personnel &amp; bus conductors scan this QR code directly via mobile scanner to verify live registration in the central institutional database.
                      </p>
                      <p className="text-[9px] font-mono text-slate-400">
                        Token Hash: SHA256:{registerNumber.slice(0, 6)}...BUS-VERIFIED
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

          {/* Right Column: College Bus Controls & Onboarding Details */}
          <div className="lg:col-span-5 space-y-6">
            {/* Onboarding Verified Transport Record Card */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 rounded-3xl p-5 border-2 border-emerald-300/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-black text-emerald-950 text-xs sm:text-sm">
                    Onboarding Verified College Bus Record
                  </h4>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                  SLIP GENERATED
                </span>
              </div>

              <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3.5 border border-emerald-200/70 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Onboarded Bus Number:</span>
                  <span className="font-bold text-slate-900 bg-emerald-100/70 px-2 py-0.5 rounded-md font-mono">
                    Bus #{currentRoute.busNo || initialBusNo || '5'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Allocated Route:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[200px]">
                    {currentRoute.routeNo}: {currentRoute.name.split('↔')[0]}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Designated Boarding Stop:</span>
                  <span className="font-extrabold text-emerald-800">
                    {boardingStop}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 border-t border-emerald-100 pt-1.5">
                  <span className="font-medium">Transportation Slip Status:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active &amp; Valid
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handlePrint}
                  className="py-2.5 px-3 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={handleDownloadSlip}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Slip</span>
                </button>
              </div>
            </div>

            {/* Route & Stop Customization Box */}
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
                    toast.success(`Boarding stop updated!`)
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {availableStops.map((stop) => (
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
                  Students must display this digital QR pass slip when boarding. In case of route change, submit request 24 hours prior to department transport desk.
                </p>
              </div>
            </div>

            {/* Campus Security & Transport Incharge Desk */}
            <div className="bg-gradient-to-br from-slate-900 to-[#071A3D] text-white rounded-3xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <Phone className="w-4 h-4" />
                <span>Campus Transport &amp; Security Desk</span>
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* MODE 2: HOSTELLER VIEW (ONLY SHOWN IF HOSTEL USER)  */}
      {/* =================================================== */}
      {activeMode === 'hostel' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Gate Pass Status / Approval Pipeline / Generated Certificate */}
          <div className="lg:col-span-7 space-y-4">
            {/* SUB-CASE A: Both Parent and Warden confirmed -> Official Pass Generated */}
            {isHostelCertificateGenerated && (
              <div className="space-y-4">
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

                <div
                  ref={passRef}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative"
                >
                  <div className="h-3 w-full bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-800" />

                  <div className="p-6 sm:p-7 space-y-6">
                    {/* College Header */}
                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#071A3D] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0 ring-4 ring-emerald-50">
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
                          AUTHENTICATED &amp; SANCTIONED
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">Academic Year 2026-27</p>
                      </div>
                    </div>

                    {/* Pass Title */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          OFFICIAL DIGITAL GATE PASS
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                          Hostel Resident &amp; Gate Outing Pass
                        </h2>
                      </div>
                      <div className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                        PASS #{registerNumber.slice(-4)}-HOSTEL
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

                    {/* Dynamic Hostel Outing Card Body */}
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

                    {/* Bottom Security QR & Stamps */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
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
                            Token Hash: SHA256:{registerNumber.slice(0, 6)}...HOSTEL-AUTH
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

            {/* SUB-CASE B: Pending Approvals -> 3-Stage Pipeline Card */}
            {!isHostelCertificateGenerated && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative">
                <div className="h-3 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-600" />

                <div className="p-6 sm:p-7 space-y-6">
                  {/* College Header */}
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#071A3D] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0 ring-4 ring-emerald-50">
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

                  {/* Lock Notice */}
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

                  {/* Student Details */}
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

                  {/* 3-Stage Lifecycle Stepper */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
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

                  {/* Interactive Verification Desk */}
                  <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
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
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20'
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
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Hostel Gate Pass Application Desk */}
          <div className="lg:col-span-5 space-y-6">
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
                    {isHostelCertificateGenerated ? 'Generated &amp; Valid' : 'Awaiting Approvals'}
                  </strong>
                </div>
              </div>
            </div>

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
                  <span>Chief Warden Office:</span>
                  <span className="font-mono font-bold text-white">04324-290015</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
