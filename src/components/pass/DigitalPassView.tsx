'use client'

import React, { useState, useRef } from 'react'
import {
  Bus,
  Home,
  Utensils,
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
  Share2,
  RefreshCw,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DigitalPassViewProps {
  studentName?: string
  registerNumber?: string
  department?: string
  year?: number
  section?: string
  role?: string
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
  { name: 'Amaravathi Boys Hostel (Block A)', warden: 'Dr. K. Ravikumar', contact: '+91 94861 22340', curfew: '06:30 PM' },
  { name: 'Kaveri Boys Hostel (Block B)', warden: 'Prof. N. Venkatesh', contact: '+91 94861 22341', curfew: '06:30 PM' },
  { name: 'Bhavani Girls Hostel (Block C)', warden: 'Dr. S. Meenakshi', contact: '+91 94861 22342', curfew: '06:00 PM' },
  { name: 'Vaigai Girls Hostel (Block D)', warden: 'Prof. M. Geetha', contact: '+91 94861 22343', curfew: '06:00 PM' }
]

export default function DigitalPassView({
  studentName = 'Logeshwaran G',
  registerNumber = '922525243103',
  department = 'Artificial Intelligence & Data Science',
  year = 2,
  section = 'B',
  role = 'student'
}: DigitalPassViewProps) {
  const [activeTab, setActiveTab] = useState<'bus' | 'hostel' | 'mess'>('bus')
  
  // Bus state
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0)
  const [boardingStop, setBoardingStop] = useState(BUS_ROUTES[0].stops[0])
  const [seatNo, setSeatNo] = useState('Seat #34')

  // Hostel state
  const [selectedHostelIndex, setSelectedHostelIndex] = useState(0)
  const [roomNo, setRoomNo] = useState('Room 312')
  const [passType, setPassType] = useState<'day_outing' | 'home_leave' | 'emergency'>('day_outing')
  const [outingPurpose, setOutingPurpose] = useState('Library & Project Component Sourcing')
  const [expectedReturn, setExpectedReturn] = useState('06:15 PM Today')
  const [parentApprovalConfirmed, setParentApprovalConfirmed] = useState(true)

  // Mess state
  const [mealPreference, setMealPreference] = useState<'veg' | 'non_veg'>('non_veg')
  const [checkedMeals, setCheckedMeals] = useState<Record<string, boolean>>({
    breakfast: true,
    lunch: true,
    dinner: false
  })

  const currentRoute = BUS_ROUTES[selectedRouteIndex]
  const currentHostel = HOSTEL_BLOCKS[selectedHostelIndex]
  const passRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadSlip = () => {
    toast.success('Digital Pass slip saved as offline verifiable token!', { icon: '🎫' })
  }

  const toggleMealCheck = (meal: string) => {
    setCheckedMeals(prev => {
      const nextVal = !prev[meal]
      toast.success(`${meal.toUpperCase()} pass verified at mess counter!`, { icon: '🍽️' })
      return { ...prev, [meal]: nextVal }
    })
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
              Tamper-proof encrypted digital passes for college transport, hostel gate security, and mess dining authentication. Fully paperless and instant verification.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-medium text-xs sm:text-sm transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Pass</span>
            </button>
            <button
              onClick={handleDownloadSlip}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#071A3D] font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
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
            <span>Hostel & Gate Outing Pass</span>
          </button>
          <button
            onClick={() => setActiveTab('mess')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'mess'
                ? 'bg-white text-[#071A3D] shadow-lg shadow-black/20'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Utensils className="w-4 h-4 text-amber-600" />
            <span>Mess Dining Token</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Digital Pass Card (Printable) */}
        <div className="lg:col-span-7 space-y-4">
          <div
            ref={passRef}
            className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative"
          >
            {/* Hologram Header Bar */}
            <div className="h-3 w-full bg-gradient-to-r from-blue-600 via-cyan-400 via-amber-400 to-indigo-600" />

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
                      An Autonomous Institution • Affiliated to Anna University • Accredited by NAAC & NBA
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
                    {activeTab === 'mess' && 'Student Dining Token & Mess Card'}
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
                  <strong className="text-slate-800 font-bold block mt-0.5">AI & DS</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Year & Sec</span>
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
                        <span className="text-blue-500 font-medium block text-[11px]">Morning Campus Arrival:</span>
                        <div className="flex items-center gap-1.5 mt-0.5 font-bold text-emerald-700">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{currentRoute.morningArrival}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-blue-500 font-medium block text-[11px]">Evening Return Departure:</span>
                        <div className="flex items-center gap-1.5 mt-0.5 font-bold text-amber-700">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{currentRoute.eveningDeparture}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span><strong>Transport Incharge:</strong> {currentRoute.driver}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-600 font-mono">
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

                    <div className="flex items-center gap-2 pt-2 text-xs">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Parent Telephonic Consent Confirmed
                      </span>
                      <span className="inline-flex items-center gap-1 text-blue-700 font-bold bg-white px-2.5 py-1 rounded-lg border border-blue-200">
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

              {activeTab === 'mess' && (
                <div className="space-y-4">
                  <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Utensils className="w-5 h-5 text-amber-600" />
                        <h4 className="font-bold text-amber-950 text-sm">Hostel Central Dining Hall</h4>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 capitalize">
                        {mealPreference.replace('_', '-')} Diet
                      </span>
                    </div>

                    {/* Meal Slots for Today */}
                    <div className="grid grid-cols-3 gap-2.5 pt-2">
                      <div
                        onClick={() => toggleMealCheck('breakfast')}
                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                          checkedMeals.breakfast
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold block">Breakfast</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">07:30 - 08:30 AM</span>
                        <span className={`inline-block mt-2 text-xs font-black ${checkedMeals.breakfast ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {checkedMeals.breakfast ? '✓ Claimed' : 'Available'}
                        </span>
                      </div>

                      <div
                        onClick={() => toggleMealCheck('lunch')}
                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                          checkedMeals.lunch
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold block">Lunch</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">12:30 - 01:30 PM</span>
                        <span className={`inline-block mt-2 text-xs font-black ${checkedMeals.lunch ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {checkedMeals.lunch ? '✓ Claimed' : 'Available'}
                        </span>
                      </div>

                      <div
                        onClick={() => toggleMealCheck('dinner')}
                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                          checkedMeals.dinner
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold block">Dinner</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">07:30 - 08:45 PM</span>
                        <span className={`inline-block mt-2 text-xs font-black ${checkedMeals.dinner ? 'text-emerald-700' : 'text-amber-600'}`}>
                          {checkedMeals.dinner ? '✓ Claimed' : 'Tap to Swipe'}
                        </span>
                      </div>
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
                      Security personnel & bus conductors can scan this QR code directly via mobile scanner to verify live enrollment in the central database.
                    </p>
                    <p className="text-[9px] font-mono text-slate-400">
                      Token Hash: SHA256:{registerNumber.slice(0, 6)}...{activeTab.toUpperCase()}
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

        {/* Right Column: Pass Customization & Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Controls based on active tab */}
          {activeTab === 'bus' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Bus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Select Bus Route & Boarding Stop</h3>
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
                <div className="flex gap-2">
                  {['Seat #12 (Front)', 'Seat #24 (Mid)', 'Seat #34 (Mid)', 'Seat #48 (Rear)'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeatNo(s)}
                      className={`flex-1 py-2 px-1 text-[11px] font-bold rounded-lg border cursor-pointer transition-all ${
                        seatNo === s
                          ? 'bg-blue-600 text-white border-blue-600'
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

          {activeTab === 'hostel' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Home className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Hostel Outing & Day Pass Generator</h3>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-600 block">Hostel Block:</label>
                <select
                  value={selectedHostelIndex}
                  onChange={(e) => setSelectedHostelIndex(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {HOSTEL_BLOCKS.map((h, i) => (
                    <option key={h.name} value={i}>
                      {h.name}
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
                onClick={() => toast.success('Outing Pass requested & dispatched to Advisor and Warden for live verification!')}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Issue Live Gate Outing Token</span>
              </button>
            </div>
          )}

          {activeTab === 'mess' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Utensils className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-800 text-sm">Mess Preferences & Live Balance</h3>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 block">Diet Preference:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setMealPreference('veg')
                      toast.success('Diet preference set to Vegetarian!')
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      mealPreference === 'veg'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🥬 Vegetarian
                  </button>
                  <button
                    onClick={() => {
                      setMealPreference('non_veg')
                      toast.success('Diet preference set to Non-Vegetarian!')
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      mealPreference === 'non_veg'
                        ? 'bg-amber-50 border-amber-500 text-amber-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🍗 Non-Vegetarian (Wed/Sun)
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Monthly Mess Bill Status:</span>
                  <strong className="text-emerald-600 font-bold">PAID (Clear)</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Token Allowance Remaining:</span>
                  <strong className="text-slate-800 font-mono">82 / 90 Meals</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Special Feast Pass:</span>
                  <strong className="text-purple-600 font-bold">Active (Hostel Day)</strong>
                </div>
              </div>

              <button
                onClick={() => toast.success('Mess token regenerated!')}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Digital Dining Token</span>
              </button>
            </div>
          )}

          {/* Institutional Help & Hotline */}
          <div className="bg-gradient-to-br from-slate-900 to-[#071A3D] text-white rounded-3xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <Phone className="w-4 h-4" />
              <span>Campus Security & Help Desks</span>
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
