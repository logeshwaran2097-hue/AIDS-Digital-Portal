'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Home,
  User,
  Phone,
  Calendar,
  AlertTriangle,
  QrCode,
  Building,
  GraduationCap,
  ArrowRight,
  ExternalLink,
  Lock,
  Printer,
  Sparkles,
  Check,
  Bus,
  MapPin,
  Download
} from 'lucide-react'
import { generateAndDownloadHostelGatePassPDF } from '@/lib/pdfGenerator'

function VerifyPassContent() {
  const searchParams = useSearchParams()

  const passId = searchParams.get('id') || 'VSB/AI&DS/GP-2026-0847'
  
  const [details, setDetails] = useState<any>({
    name: searchParams.get('name') || '',
    reg: searchParams.get('reg') || '',
    dept: searchParams.get('dept') || 'Artificial Intelligence & Data Science',
    year: searchParams.get('year') || '2',
    sec: searchParams.get('sec') || 'B',
    hostel: searchParams.get('hostel') || 'Boys Hostel I',
    room: searchParams.get('room') || 'Room 204',
    category: (searchParams.get('category') || 'Day Outing').replace('_', ' '),
    purpose: searchParams.get('purpose') || 'Library & Project Component Sourcing',
    destination: searchParams.get('destination') || searchParams.get('dest') || 'Karur Central / Tech Hub',
    departure: searchParams.get('departure') || searchParams.get('outTime') || 'Today, 02:30 PM',
    curfew: searchParams.get('curfew') || '06:15 PM Today (Max: 06:30 PM)',
    parent: searchParams.get('parent') || '+91 94432 55890',
    warden: searchParams.get('warden') || 'Dr. K. Ravikumar',
    time: searchParams.get('time') || new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  })

  useEffect(() => {
    if (!passId) return
    fetch(`/api/pass?id=${encodeURIComponent(passId)}`)
      .then(res => res.json())
      .then(res => {
        if (res?.success && res?.data) {
          setDetails((prev: any) => ({
            ...prev,
            ...res.data,
            name: res.data.name || prev.name,
            reg: res.data.reg || prev.reg,
            dept: res.data.dept || prev.dept,
            year: res.data.year || prev.year,
            sec: res.data.sec || prev.sec,
            destination: res.data.destination || prev.destination,
            departure: res.data.departureTime || res.data.departure || prev.departure,
            time: res.data.time || prev.time
          }))
        }
      })
      .catch(() => {})
  }, [passId])

  const isBusPass =
    searchParams.get('type') === 'bus' ||
    passId.toUpperCase().includes('BUS') ||
    details?.type === 'bus' ||
    Boolean(searchParams.get('busNo'))

  const studentName = details.name
  const registerNumber = details.reg
  const department = details.dept
  const year = details.year
  const section = details.sec
  const hostel = details.hostel
  const roomNo = details.room
  const category = details.category
  const purpose = details.purpose
  const destination = details.destination || 'Karur Central / Tech Hub'
  const departure = details.departure || 'Today, 02:30 PM'
  const curfew = details.curfew
  const parentPhone = details.parent
  const warden = details.warden
  const sanctionTime = details.time

  // Bus specific properties
  const busNo = searchParams.get('busNo') || details?.busNo || ''
  const routeNo = searchParams.get('routeNo') || details?.routeNo || ''
  const routeName = (searchParams.get('routeName') || details?.routeName || 'College Campus Commuter Route')
    .replace(/[↔→]/g, 'to')
    .replace(/!\"/g, 'to')
    .replace(/\s*->\s*/g, ' to ')
    .trim()
  const via = searchParams.get('via') || details?.via || ''
  const boardingStop = (searchParams.get('stop') || searchParams.get('boardingStop') || details?.boardingStop || 'Designated Stop')
    .replace(/\s*\([^)]*\)/g, '')
    .trim()
  const morningArrival = searchParams.get('morningArrival') || details?.morningArrival || '08:30 AM'
  const eveningDeparture = searchParams.get('eveningDeparture') || details?.eveningDeparture || '05:00 PM'

  const [gateActionStatus, setGateActionStatus] = useState<'pending' | 'exited' | 'returned'>('pending')
  const [boardingVerified, setBoardingVerified] = useState(false)
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }))
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-[#071A3D] to-slate-950 text-slate-100 flex items-center justify-center p-4 py-8">
      <div className="max-w-xl w-full space-y-4">
        
        {/* Verification Success Header Pill */}
        <div className={`flex items-center justify-center gap-2 py-1.5 px-4 rounded-full border text-xs font-bold shadow-lg mx-auto w-fit animate-pulse ${
          isBusPass
            ? 'bg-blue-500/20 border-blue-400/40 text-cyan-300 shadow-blue-500/10'
            : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-emerald-500/10'
        }`}>
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>
            {isBusPass
              ? 'OFFICIAL V.S.B. TRANSPORTATION PASS · CRYPTOGRAPHICALLY AUTHENTICATED'
              : 'OFFICIAL V.S.B. GATE PASS · CRYPTOGRAPHICALLY AUTHENTICATED'}
          </span>
        </div>

        {/* Main Certificate Card */}
        <div className="bg-white text-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          
          {/* Top Bar with Hologram Strip */}
          <div className={`h-3 w-full ${
            isBusPass
              ? 'bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-700'
              : 'bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-700'
          }`} />

          <div className="p-6 sm:p-7 space-y-5">
            {/* Institution Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#071A3D] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                  VSB
                </div>
                <div>
                  <h1 className="font-extrabold text-[#071A3D] text-base leading-tight">
                    V.S.B. ENGINEERING COLLEGE
                  </h1>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {isBusPass
                      ? 'Autonomous • Affiliated to Anna University • Central Transport Desk'
                      : 'Autonomous • Affiliated to Anna University • Central Security'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black ${
                  isBusPass
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  VALID PASS
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Status: Active</p>
              </div>
            </div>

            {/* Pass Record Number Banner */}
            <div className={`border rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
              isBusPass
                ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-blue-200'
                : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-200'
            }`}>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider block">
                  {isBusPass ? 'Official Transport Record Number' : 'Official Sanction Record Number'}
                </span>
                <strong className="text-base sm:text-lg font-black font-mono text-[#071A3D] tracking-wide">
                  {passId}
                </strong>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-500 block">Academic Year / Sanction Time</span>
                <span className="text-xs font-mono font-bold text-slate-800">{sanctionTime}</span>
              </div>
            </div>

            {/* Student Identification Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#071A3D] to-[#1455D9] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0 ring-4 ring-blue-50">
                  {studentName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#071A3D] leading-tight">
                    {studentName}
                  </h2>
                  <p className="text-xs font-mono font-bold text-blue-700 mt-0.5">
                    Reg No: {registerNumber}
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {department} • Year {year}, Sec {section}
                  </p>
                </div>
              </div>

              {/* MODE SPECIFIC DETAILS */}
              {isBusPass ? (
                /* ======================== COLLEGE BUS DETAILS ======================== */
                <div className="space-y-3 pt-2 border-t border-slate-200/60">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bus className="w-4 h-4 text-blue-600" />
                        <strong className="text-sm font-black text-blue-950">
                          {routeNo}: {routeName}
                        </strong>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-mono">
                        Bus No. {String(busNo).replace(/[^0-9]/g, '').padStart(2, '0') || busNo}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Boarding Stop</span>
                          <strong className="text-slate-800 text-xs">{boardingStop}</strong>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Commuter Category</span>
                        <strong className="text-slate-800 text-xs">Day Scholar • College Bus</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 text-slate-600">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Morning Arrival</span>
                        <strong className="text-slate-800 font-bold">{morningArrival}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Evening Departure</span>
                        <strong className="text-slate-800 font-bold">{eveningDeparture}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Verified Transport Status Banner */}
                  <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-xl flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-blue-950 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Authorized Day Scholar Transit · Verified</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                      ACTIVE &amp; VALID
                    </span>
                  </div>
                </div>
              ) : (
                /* ======================== HOSTELLER DETAILS ======================== */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hostel &amp; Room</span>
                      <strong className="text-slate-800 font-bold block mt-0.5 truncate">{hostel}</strong>
                      <span className="text-[11px] text-slate-600 font-mono">{roomNo}</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Category &amp; Dest</span>
                      <strong className="text-blue-900 font-bold capitalize block mt-0.5">{category}</strong>
                      <span className="text-[11px] text-slate-600 font-medium truncate block">{destination}</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Timing &amp; Curfew</span>
                      <strong className="text-slate-800 font-bold block mt-0.5">{departure}</strong>
                      <span className="text-[11px] text-red-600 font-bold truncate block">Curfew: {curfew}</span>
                    </div>
                  </div>

                  {/* Approved Outing Details */}
                  <div className="space-y-2 text-xs">
                    <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-1">
                      <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                        Authorized Purpose of Outing
                      </span>
                      <p className="font-semibold text-slate-800 text-xs sm:text-sm">
                        {purpose}
                      </p>
                    </div>

                    {/* Dual Confirmation Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="text-[10px] text-emerald-800 font-bold block">Parent Consent Recorded</span>
                          <span className="text-[11px] text-emerald-950 font-mono font-medium">{parentPhone}</span>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <span className="text-[10px] text-blue-800 font-bold block">Hostel Warden Authorized</span>
                          <span className="text-[11px] text-blue-950 font-medium truncate block">{warden}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Live Security Gate Clearance Actions */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{isBusPass ? 'College Bus Boarding Checkpoint' : 'Main Campus Security Checkpoint'}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Live Clock: {currentTime}</span>
              </div>

              {isBusPass ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-300">
                    Conductor / Incharge Verification: Check student boarding stop ({boardingStop}) and confirm Bus No. {String(busNo).replace(/[^0-9]/g, '').padStart(2, '0') || busNo}.
                  </p>
                  {!boardingVerified ? (
                    <button
                      onClick={() => setBoardingVerified(true)}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Verify &amp; Approve Boarding (Bus Conductor)</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-emerald-900/60 border border-emerald-500/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <strong>✓ Boarding Verified at {currentTime}</strong>
                        <p className="text-[11px] text-emerald-300">Authorized for Bus No. {String(busNo).replace(/[^0-9]/g, '').padStart(2, '0') || busNo} • {boardingStop}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {gateActionStatus === 'pending' && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-300">
                        Security Guard Instruction: Verify student ID card against the photo/name above before logging departure.
                      </p>
                      <button
                        onClick={() => setGateActionStatus('exited')}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Log Gate Departure (Allow Student Out)</span>
                      </button>
                    </div>
                  )}

                  {gateActionStatus === 'exited' && (
                    <div className="space-y-2">
                      <div className="p-3 bg-emerald-900/50 border border-emerald-500/50 rounded-xl text-xs text-emerald-200">
                        <strong>✓ Student Departed Campus</strong> at {currentTime}. Scheduled return before {curfew}.
                      </div>
                      <button
                        onClick={() => setGateActionStatus('returned')}
                        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Home className="w-4 h-4" />
                        <span>Log Gate Return (Student Back on Campus)</span>
                      </button>
                    </div>
                  )}

                  {gateActionStatus === 'returned' && (
                    <div className="p-3 bg-blue-950/80 border border-blue-500/50 rounded-xl text-xs text-blue-200">
                      <strong>✓ Student Safely Returned to Hostel</strong> at {currentTime}. Pass closed and archived.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Quick Document Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (isBusPass) {
                    window.print()
                  } else {
                    try {
                      generateAndDownloadHostelGatePassPDF({
                        passRecordNumber: passId,
                        studentName,
                        registerNumber,
                        department,
                        year,
                        section,
                        hostelBlock: hostel,
                        roomNo,
                        passType: category,
                        purpose,
                        destination,
                        departureTime: departure,
                        curfewLimit: curfew,
                        parentPhone,
                        parentConfirmed: true,
                        wardenName: warden,
                        wardenContact: '+91 94861 22340',
                        sanctionTimestamp: sanctionTime,
                        issueDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                      })
                    } catch (e) {
                      window.print()
                    }
                  }
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download Pass PDF</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Print</span>
              </button>
            </div>

            {/* Official Seal and Validation Stamp */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>SHA256 Token: {registerNumber.slice(0, 4)}...{passId.slice(-4)}-VALID</span>
              </div>

              <div className="text-right font-bold text-blue-700">
                <span>{isBusPass ? 'V.S.B. TRANSPORT CONTROL SEALED' : 'V.S.B. SECURITY SEALED'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
          {isBusPass
            ? 'This digital transportation pass verification record is generated by the V.S.B. Engineering College AI&DS Digital Administration System. Unauthorized duplication or tampering is strictly prohibited.'
            : 'This digital outpass verification record is generated by the V.S.B. Engineering College AI&DS Digital Administration System. Unauthorized duplication or tampering is strictly prohibited.'}
        </p>
      </div>
    </div>
  )
}

export default function VerifyPassPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Verifying Digital Pass with V.S.B. Central Server...</p>
        </div>
      </div>
    }>
      <VerifyPassContent />
    </Suspense>
  )
}
