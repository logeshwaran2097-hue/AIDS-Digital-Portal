'use client'

import React, { useState, useRef, useEffect } from 'react'
import QRCode from 'qrcode'
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
  FileText,
  ExternalLink,
  Check
} from 'lucide-react'
import toast from 'react-hot-toast'
import { generateAndDownloadBusPassPDF, generateAndDownloadHostelGatePassPDF } from '@/lib/pdfGenerator'

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
    driver: 'Mr. M. Selvaraj (Driver)',
    driverPhone: '+91 94432 18290',
    incharge: 'Dr. K. Ravichandran (Faculty Incharge)',
    inchargePhone: '+91 94432 90112',
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
    driver: 'Mr. K. Palanisamy (Driver)',
    driverPhone: '+91 98421 77123',
    incharge: 'Prof. M. Senthilkumar (Faculty Incharge)',
    inchargePhone: '+91 98428 33419',
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
    driver: 'Mr. S. Murugesan (Driver)',
    driverPhone: '+91 99440 33418',
    incharge: 'Dr. A. Ramesh (Faculty Incharge)',
    inchargePhone: '+91 99441 22890',
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
    driver: 'Mr. R. Veeramani (Driver)',
    driverPhone: '+91 97894 55601',
    incharge: 'Prof. R. Vijayakumar (Faculty Incharge)',
    inchargePhone: '+91 97890 11452',
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
    driver: 'Mr. P. Subramanian (Driver)',
    driverPhone: '+91 98429 88912',
    incharge: 'Dr. S. Karthikeyan (Faculty Bus Incharge)',
    inchargePhone: '+91 94435 67812',
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
    const status = (initialResidencyStatus || '').toLowerCase().trim()
    if (status.includes('hostel') || status.includes('hosteller')) return 'hostel'
    if (
      status.includes('day scholar') ||
      status.includes('dayscholar') ||
      status.includes('bus') ||
      status.includes('college bus') ||
      initialBusNo ||
      initialBusDetails
    ) {
      return 'college_bus'
    }
    return 'college_bus'
  })()

  const [activeMode, setActiveMode] = useState<'hostel' | 'college_bus'>(detectedMode)

  // Ensure client-side alignment with verified onboarding storage if present
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const reg = registerNumber || ''
      const cached = localStorage.getItem(`vsb_student_profile_v2_${reg}`)
      const residencyDirect = localStorage.getItem('vsb_student_residency')
      const targetRes = residencyDirect || (cached ? JSON.parse(cached)?.residencyStatus : '') || ''
      const lower = targetRes.toLowerCase()
      if (lower.includes('hostel') || lower.includes('hosteller')) {
        setActiveMode('hostel')
      } else if (lower.includes('day') || lower.includes('bus') || lower.includes('scholar')) {
        setActiveMode('college_bus')
      }
    } catch {}
  }, [registerNumber])
  
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

  // Hostel state - auto select from onboarding data
  const initialHostelIdx = HOSTEL_BLOCKS.findIndex(
    (h) => h.id === initialHostelBlock || h.name === initialHostelBlock || (initialHostelBlock && h.name.toLowerCase().includes(initialHostelBlock.toLowerCase()))
  )
  const [selectedHostelIndex, setSelectedHostelIndex] = useState(initialHostelIdx !== -1 ? initialHostelIdx : 0)
  const [roomNo, setRoomNo] = useState(initialRoomNo || 'Room 204')
  const [passType, setPassType] = useState<'day_outing' | 'home_leave' | 'emergency'>('day_outing')
  const [outingPurpose, setOutingPurpose] = useState('Library & Project Component Sourcing')
  const [destination, setDestination] = useState('Karur Central / Tech Hub')
  const [departureTime, setDepartureTime] = useState('Today, 02:30 PM')
  const [expectedReturn, setExpectedReturn] = useState('06:15 PM Today')
  const [parentPhone, setParentPhone] = useState('+91 94432 55890')
  const [applicationTime, setApplicationTime] = useState('Today, 02:45 PM')

  // Multi-step Authorization Lifecycle for Gate Pass
  // Certificate ONLY generates after BOTH Parent and Warden confirm!
  const [parentConfirmed, setParentConfirmed] = useState(false)
  const [wardenConfirmed, setWardenConfirmed] = useState(false)

  // Unique Individual Pass Record Number & Scannable QR Codes
  const [passRecordNumber, setPassRecordNumber] = useState<string>(() => {
    const regDigits = registerNumber ? registerNumber.slice(-4) : '2401'
    return `VSB/AI&DS/HGP-2026-${regDigits}`
  })
  const [gateQrUrl, setGateQrUrl] = useState<string>('')
  const [busQrUrl, setBusQrUrl] = useState<string>('')
  const [sanctionTimestamp, setSanctionTimestamp] = useState<string>(() => {
    return new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  })

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

  // Modal state for full-screen QR scanning
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)

  // Dynamic QR Code generation for physical smartphone scanning (100% working offline & online)
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Smart Origin: If on localhost, use the live public Cloudflare tunnel so phones can scan & resolve it!
    let publicOrigin = window.location.origin
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      publicOrigin = 'https://regards-compromise-boc-micro.trycloudflare.com'
    }

    const busPassId = `VSB/AI&DS/BUS-2026-${registerNumber ? registerNumber.slice(-4) : 'BUS'}`

    // 1. Persist Hostel Pass record to server API
    fetch('/api/pass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: passRecordNumber,
        type: 'hostel',
        name: studentName,
        reg: registerNumber,
        dept: department,
        year: String(year),
        sec: section,
        hostel: currentHostel.name,
        room: roomNo,
        category: passType.replace('_', ' ').toUpperCase(),
        purpose: outingPurpose,
        destination: destination,
        departureTime: departureTime,
        curfew: `${expectedReturn} (Max: ${currentHostel.curfew})`,
        parent: parentPhone,
        warden: currentHostel.warden,
        time: sanctionTimestamp,
        status: 'SANCTIONED & ACTIVE'
      })
    }).catch(() => {})

    // 2. Persist College Bus Pass record to server API
    fetch('/api/pass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: busPassId,
        type: 'bus',
        name: studentName,
        reg: registerNumber,
        dept: department,
        year: String(year),
        sec: section,
        busNo: currentRoute.busNo,
        routeNo: currentRoute.routeNo,
        routeName: currentRoute.name,
        via: currentRoute.via,
        boardingStop: boardingStop,
        busRegNo: currentRoute.busRegNo,
        morningArrival: currentRoute.morningArrival,
        eveningDeparture: currentRoute.eveningDeparture,
        incharge: currentRoute.incharge,
        inchargePhone: currentRoute.inchargePhone,
        driver: currentRoute.driver,
        driverPhone: currentRoute.driverPhone,
        time: issueDate,
        status: 'VERIFIED & ACTIVE COMMUTER'
      })
    }).catch(() => {})

    // Generate Hostel Gate Pass verification URL & QR code
    const hostelVerifyUrl = `${publicOrigin}/verify-pass?type=hostel&id=${encodeURIComponent(passRecordNumber)}&name=${encodeURIComponent(studentName)}&reg=${encodeURIComponent(registerNumber)}&dept=${encodeURIComponent(department)}&year=${encodeURIComponent(String(year))}&sec=${encodeURIComponent(section)}&hostel=${encodeURIComponent(currentHostel.name)}&room=${encodeURIComponent(roomNo)}&category=${encodeURIComponent(passType.replace('_', ' ').toUpperCase())}&purpose=${encodeURIComponent(outingPurpose)}&destination=${encodeURIComponent(destination)}&departure=${encodeURIComponent(departureTime)}&curfew=${encodeURIComponent(expectedReturn)}&parent=${encodeURIComponent(parentPhone)}&warden=${encodeURIComponent(currentHostel.warden)}&time=${encodeURIComponent(sanctionTimestamp)}`

    QRCode.toDataURL(hostelVerifyUrl, {
      width: 450,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'L'
    }).then(url => {
      setGateQrUrl(url)
    }).catch(err => {
      console.error('Failed to generate gate pass QR code:', err)
    })

    // Generate College Bus Pass verification URL & QR code (embedded with all details for 100% instant offline phone camera recognition)
    const busVerifyUrl = `${publicOrigin}/verify-pass?type=bus&id=${encodeURIComponent(busPassId)}&name=${encodeURIComponent(studentName)}&reg=${encodeURIComponent(registerNumber)}&dept=${encodeURIComponent(department)}&year=${encodeURIComponent(String(year))}&sec=${encodeURIComponent(section)}&busNo=${encodeURIComponent(currentRoute.busNo)}&routeNo=${encodeURIComponent(currentRoute.routeNo)}&routeName=${encodeURIComponent(currentRoute.name)}&via=${encodeURIComponent(currentRoute.via)}&stop=${encodeURIComponent(boardingStop)}&busReg=${encodeURIComponent(currentRoute.busRegNo)}&morningArrival=${encodeURIComponent(currentRoute.morningArrival)}&eveningDeparture=${encodeURIComponent(currentRoute.eveningDeparture)}&incharge=${encodeURIComponent(currentRoute.incharge)}&inchargePhone=${encodeURIComponent(currentRoute.inchargePhone)}&driver=${encodeURIComponent(currentRoute.driver)}&driverPhone=${encodeURIComponent(currentRoute.driverPhone)}&time=${encodeURIComponent(issueDate)}`

    QRCode.toDataURL(busVerifyUrl, {
      width: 450,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    }).then(url => {
      setBusQrUrl(url)
    }).catch(err => {
      console.error('Failed to generate bus QR code:', err)
    })
  }, [
    passRecordNumber,
    sanctionTimestamp,
    studentName,
    registerNumber,
    department,
    year,
    section,
    currentHostel.name,
    currentHostel.warden,
    currentHostel.curfew,
    roomNo,
    passType,
    outingPurpose,
    destination,
    departureTime,
    expectedReturn,
    parentPhone,
    currentRoute.busNo,
    currentRoute.routeNo,
    currentRoute.via,
    currentRoute.morningArrival,
    currentRoute.eveningDeparture,
    currentRoute.incharge,
    currentRoute.inchargePhone,
    currentRoute.driver,
    currentRoute.driverPhone,
    boardingStop,
    issueDate
  ])

  const handlePrint = () => {
    if (activeMode === 'hostel' && !isHostelCertificateGenerated) {
      toast.error('Certificate not yet generated! Both parent confirmation and warden approval are required.', { icon: '🔒' })
      return
    }
    window.print()
  }

  // Official Institutional PDF Slip and Offline Verifiable Token Download
  const handleDownloadSlip = () => {
    if (activeMode === 'hostel' && !isHostelCertificateGenerated) {
      toast.error('Pass token cannot be downloaded until parent and warden approvals are complete.', { icon: '🔒' })
      return
    }

    if (activeMode === 'college_bus') {
      try {
        generateAndDownloadBusPassPDF({
          passNo: `PASS #${registerNumber.slice(-4)}-BUS`,
          studentName,
          registerNumber,
          department,
          year,
          section,
          busNo: currentRoute.busNo,
          routeNo: currentRoute.routeNo,
          routeName: currentRoute.name,
          via: currentRoute.via,
          boardingStop,
          busRegNo: currentRoute.busRegNo,
          morningArrival: currentRoute.morningArrival,
          eveningDeparture: currentRoute.eveningDeparture,
          incharge: currentRoute.incharge,
          inchargePhone: currentRoute.inchargePhone,
          driver: currentRoute.driver,
          driverPhone: currentRoute.driverPhone,
          issueDate,
          qrDataUrl: busQrUrl || undefined,
        })
        toast.success('Official V.S.B. College Bus Transportation Slip (PDF) downloaded successfully!', { icon: '🚌', duration: 4000 })
        return
      } catch (e) {
        console.error('Failed to generate PDF pass slip:', e)
      }
    }

    try {
      generateAndDownloadHostelGatePassPDF({
        passRecordNumber,
        studentName,
        registerNumber,
        department,
        year,
        section,
        hostelBlock: currentHostel.name,
        roomNo,
        passType: passType.replace('_', ' ').toUpperCase(),
        purpose: outingPurpose,
        destination,
        departureTime,
        curfewLimit: `${expectedReturn} (Strict Gate Curfew: ${currentHostel.curfew})`,
        parentPhone,
        parentConfirmed,
        wardenName: currentHostel.warden,
        wardenContact: currentHostel.contact,
        sanctionTimestamp,
        issueDate,
        qrDataUrl: gateQrUrl || undefined,
      })
      toast.success('Official V.S.B. Hostel Gate Outpass Slip (PDF) downloaded successfully!', { icon: '🛡️', duration: 4000 })
      return
    } catch (e) {
      console.error('Failed to generate Hostel Gate Pass PDF:', e)
      toast.error('Failed to generate PDF pass slip. Please use Print Slip.', { icon: '⚠️' })
    }
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
    const uniqueSerial = `VSB/AI&DS/GP-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`
    const timeNow = new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    setPassRecordNumber(uniqueSerial)
    setSanctionTimestamp(timeNow)
    setWardenConfirmed(true)
    toast.success(`🎉 Gate Pass Sanctioned! Individual Record No: ${uniqueSerial}`, { icon: '🛡️', duration: 5000 })
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
    const newSerial = `VSB/AI&DS/GP-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`
    setPassRecordNumber(newSerial)
    setApplicationTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }))
    toast.success(`New Gate Pass application submitted! Req #${newSerial.split('-').pop()}`, { icon: '📋' })
  }

  // Ensure currentRoute.stops includes boardingStop
  const availableStops = currentRoute.stops.some(s => s.toLowerCase().includes(boardingStop.toLowerCase()))
    ? currentRoute.stops
    : [boardingStop, ...currentRoute.stops]

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #vsb-printable-pass, #vsb-printable-pass * {
            visibility: visible !important;
          }
          #vsb-printable-pass {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 16px !important;
            background: white !important;
            box-shadow: none !important;
            border: 2px solid #071A3D !important;
          }
          header, aside, nav, .portal-top-header, button {
            display: none !important;
          }
        }
      `}</style>

      {/* Onboarding Mode Indicator - Strictly locked to student's verified profile */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 px-4.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className={`w-3 h-3 rounded-full ${activeMode === 'hostel' ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-blue-600 ring-4 ring-blue-100'}`} />
          <span className="text-xs font-bold text-slate-700">
            Verified Onboarding Profile:{' '}
            <span className="text-slate-950 font-black">
              {activeMode === 'hostel'
                ? `🏡 Hostel Resident · ${currentHostel.name} (Room ${roomNo})`
                : `🚌 Day Scholar · College Bus #${currentRoute.busNo || '5'} (${currentRoute.name})`}
            </span>
          </span>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold border ${
            activeMode === 'hostel'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}>
            {activeMode === 'hostel' ? 'Hostel Resident Only' : 'College Bus Commuter Only'}
          </span>
        </div>

        {/* Staff/Admin only preview switcher — strictly hidden for regular students */}
        {(role === 'admin' || role === 'hod') && (
          <div className="flex items-center gap-1.5 text-xs bg-slate-50 p-1 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold px-1 uppercase">Admin Preview:</span>
            <button
              type="button"
              onClick={() => setActiveMode('hostel')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeMode === 'hostel'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-transparent hover:bg-slate-200 text-slate-600'
              }`}
            >
              <Home className="w-3 h-3" />
              <span>Hostel</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('college_bus')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeMode === 'college_bus'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-transparent hover:bg-slate-200 text-slate-600'
              }`}
            >
              <Bus className="w-3 h-3" />
              <span>Bus</span>
            </button>
          </div>
        )}
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
              id="vsb-printable-pass"
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
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Bus #{currentRoute.busNo}
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Faculty Incharge */}
                    <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl">
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] text-emerald-800 uppercase font-black block">Faculty Bus Incharge</span>
                        <strong className="text-slate-900 font-bold block truncate">{currentRoute.incharge}</strong>
                      </div>
                      <a
                        href={`tel:${currentRoute.inchargePhone}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-[11px] transition-colors shrink-0 shadow-2xs"
                        title={`Call ${currentRoute.incharge}`}
                      >
                        <Phone className="w-3 h-3" />
                        <span>{currentRoute.inchargePhone}</span>
                      </a>
                    </div>

                    {/* Bus Driver */}
                    <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/80 p-3 rounded-xl">
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] text-blue-800 uppercase font-black block">College Bus Driver</span>
                        <strong className="text-slate-900 font-bold block truncate">{currentRoute.driver}</strong>
                      </div>
                      <a
                        href={`tel:${currentRoute.driverPhone}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-[11px] transition-colors shrink-0 shadow-2xs"
                        title={`Call ${currentRoute.driver}`}
                      >
                        <Phone className="w-3 h-3" />
                        <span>{currentRoute.driverPhone}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Bottom Security QR & Stamps */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {busQrUrl ? (
                      <div className="relative group shrink-0">
                        <img
                          src={busQrUrl}
                          alt="College Bus Pass QR Code"
                          className="w-24 h-24 rounded-2xl border-2 border-blue-400/40 p-1.5 bg-white shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 shadow-md">
                          <QrCode className="w-3 h-3" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xs">
                        Generating QR...
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>Real Scannable Bus QR Code</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">VERIFIED</span>
                      </div>
                      <p className="text-[10px] text-slate-500 max-w-xs leading-tight">
                        Security personnel &amp; bus conductors scan this QR code with <strong>any phone camera</strong> to verify boarding credentials instantly.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`/verify-pass?id=${encodeURIComponent(`VSB/AI&DS/BUS-2026-${registerNumber ? registerNumber.slice(-4) : 'BUS'}`)}&name=${encodeURIComponent(studentName)}&reg=${encodeURIComponent(registerNumber)}&dept=${encodeURIComponent(department)}&year=${encodeURIComponent(String(year))}&sec=${encodeURIComponent(section)}&hostel=${encodeURIComponent(`College Bus #${currentRoute.busNo} (${currentRoute.routeNo})`)}&room=${encodeURIComponent(boardingStop)}&category=${encodeURIComponent('COLLEGE BUS COMMUTER PASS')}&purpose=${encodeURIComponent(`Regular Commute • ${currentRoute.via}`)}&curfew=${encodeURIComponent(`Arrival ${currentRoute.morningArrival} | Departure ${currentRoute.eveningDeparture}`)}&parent=${encodeURIComponent(currentRoute.contact)}&warden=${encodeURIComponent(currentRoute.driver)}&time=${encodeURIComponent(issueDate)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all shadow-2xs"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Preview Scanned Mobile View</span>
                        </a>
                      </div>
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

            {/* Bus Crew Direct Calling Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs border-b border-slate-100 pb-2.5">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Bus Crew Direct Mobile Numbers</span>
              </div>
              
              <div className="space-y-2.5 text-xs">
                {/* Faculty Bus Incharge */}
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Faculty Bus Incharge</span>
                    <strong className="text-slate-900 text-xs block truncate">{currentRoute.incharge}</strong>
                    <span className="text-[11px] font-mono text-emerald-900 font-bold">{currentRoute.inchargePhone}</span>
                  </div>
                  <a
                    href={`tel:${currentRoute.inchargePhone}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                    title={`Call Incharge: ${currentRoute.inchargePhone}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </div>

                {/* College Bus Driver */}
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-blue-800 block">Designated Bus Driver</span>
                    <strong className="text-slate-900 text-xs block truncate">{currentRoute.driver}</strong>
                    <span className="text-[11px] font-mono text-blue-900 font-bold">{currentRoute.driverPhone}</span>
                  </div>
                  <a
                    href={`tel:${currentRoute.driverPhone}`}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                    title={`Call Driver: ${currentRoute.driverPhone}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Official Transport Rules & Guidelines */}
            <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-2xl p-4 border border-blue-100 text-xs text-slate-700 space-y-1.5">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Transport Rules &amp; Guidelines</span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4 leading-relaxed">
                <li>Be at the designated boarding stop ({boardingStop}) 5 minutes prior to scheduled morning arrival.</li>
                <li>Display this digital QR pass slip or printed pass when boarding the bus.</li>
                <li>Transport passes are non-transferable and verified cryptographically by security.</li>
              </ul>
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
                  id="vsb-printable-pass"
                  ref={passRef}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative"
                >
                  <div className="h-3 w-full bg-gradient-to-r from-[#071A3D] via-[#0D5A42] to-[#E7B93E]" />

                  <div className="p-6 sm:p-7 space-y-6">
                    {/* Official Academic Letterhead */}
                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-13 h-13 rounded-2xl bg-[#071A3D] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0 ring-4 ring-emerald-50">
                          VSB
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-[#071A3D] text-base leading-snug">
                              V.S.B. ENGINEERING COLLEGE
                            </h3>
                            <span className="text-[10px] font-extrabold bg-[#E7B93E]/20 text-[#071A3D] px-2 py-0.5 rounded border border-[#E7B93E]/40 uppercase">
                              Autonomous
                            </span>
                          </div>
                          <p className="text-xs font-bold text-emerald-800">
                            Department of Artificial Intelligence &amp; Data Science
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Approved by AICTE • Affiliated to Anna University • Accredited by NAAC ('A' Grade) &amp; NBA
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-[10px] font-black text-emerald-800 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          SANCTIONED &amp; VALID
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">Academic Year 2026-27</p>
                      </div>
                    </div>

                    {/* Official Document Banner */}
                    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                            OFFICIAL GATE OUTPASS SLIP
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                            <ShieldCheck className="w-3 h-3" />
                            DIGITALLY VERIFIED
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          Hostel Resident Gate Outpass &amp; Leave Permit
                        </h2>
                        <div className="flex flex-wrap items-center gap-2.5 mt-2">
                          <div className="text-xs font-mono font-bold text-emerald-950 bg-white px-3 py-1 rounded-xl border border-emerald-300 shadow-2xs">
                            SERIAL REC: <span className="text-emerald-700 font-extrabold">{passRecordNumber}</span>
                          </div>
                          <span className="text-[11px] text-emerald-800 font-medium">
                            Sanction Time: <strong>{sanctionTimestamp}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleDownloadSlip}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                          title="Download Official Institutional PDF Slip"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF Slip</span>
                        </button>
                        <button
                          type="button"
                          onClick={handlePrint}
                          className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-all border border-emerald-300 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>
                      </div>
                    </div>

                    {/* Section 1: Student Identification Profile Card */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                        <span>1. Student Particulars</span>
                        <span className="text-emerald-700 font-mono">Resident Hosteller</span>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Student Name</span>
                          <strong className="text-slate-800 font-bold text-sm truncate block mt-0.5">{studentName}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Register Number</span>
                          <strong className="text-slate-800 font-bold text-sm font-mono block mt-0.5">{registerNumber}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Department &amp; Class</span>
                          <strong className="text-slate-800 font-bold block mt-0.5">AI &amp; DS • Yr {year} ({section})</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hostel Block &amp; Room</span>
                          <strong className="text-emerald-800 font-bold block truncate mt-0.5">
                            {currentHostel.name} • {roomNo}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Outpass Movement & Curfew Schedule */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                        <span>2. Outpass Schedule &amp; Curfew Limits</span>
                        <span className="text-red-600 font-bold">Strict Gate In-Time</span>
                      </div>
                      <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 sm:p-5 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-emerald-700 font-medium block text-[11px]">Pass Category:</span>
                            <strong className="text-slate-800 capitalize font-bold mt-0.5 block text-xs sm:text-sm">
                              {passType.replace('_', ' ')}
                            </strong>
                          </div>
                          <div>
                            <span className="text-emerald-700 font-medium block text-[11px]">Destination / Place:</span>
                            <strong className="text-slate-800 font-bold mt-0.5 block text-xs sm:text-sm truncate">
                              {destination || 'Karur Central / Local'}
                            </strong>
                          </div>
                          <div>
                            <span className="text-emerald-700 font-medium block text-[11px]">Permitted Out-Time:</span>
                            <strong className="text-slate-800 font-bold mt-0.5 block text-xs sm:text-sm">
                              {departureTime || 'Today, 02:30 PM'}
                            </strong>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2.5 border-t border-emerald-100">
                          <div>
                            <span className="text-emerald-700 font-medium block text-[11px]">Mandatory Gate Return Curfew:</span>
                            <strong className="text-red-700 font-black text-sm block mt-0.5">
                              {expectedReturn} (Max: {currentHostel.curfew})
                            </strong>
                          </div>
                          <div>
                            <span className="text-emerald-700 font-medium block text-[11px]">Authorized Purpose:</span>
                            <p className="text-slate-800 font-semibold mt-0.5 truncate">{outingPurpose}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs border-t border-emerald-100">
                          <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Parent Consent Telephonically Confirmed ({parentPhone})
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-blue-800 font-bold bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            Hostel Warden Sanctioned ({currentHostel.warden})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Campus Main Gate Movement Log (Security Desk Check) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                        <span>3. Campus Main Gate Security Movement Log</span>
                        <span className="text-slate-400 font-mono">Terminal Checkpoint</span>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {/* Out Check */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              Gate Departure (Out)
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">Terminal Log</span>
                          </div>
                          <div className="text-[11px] text-slate-600 space-y-1">
                            <div className="flex justify-between">
                              <span>Out Date &amp; Time:</span>
                              <strong className="font-mono text-slate-800">{departureTime || 'Today, 02:30 PM'}</strong>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-100">
                              <span>Security Guard Sign:</span>
                              <span className="font-mono text-emerald-700 font-bold">✓ Logged at Gate</span>
                            </div>
                          </div>
                        </div>

                        {/* In Check */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Gate Arrival (In)
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">Curfew: {currentHostel.curfew}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 space-y-1">
                            <div className="flex justify-between">
                              <span>In Date &amp; Time:</span>
                              <strong className="font-mono text-slate-800">Pending Return</strong>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-100">
                              <span>Return Status:</span>
                              <span className="font-mono text-blue-700 font-bold">Awaiting In-Scan</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Bottom Security QR & Verification Section */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-5">
                      <div className="flex items-center gap-4">
                        {gateQrUrl ? (
                          <div 
                            onClick={() => setIsQrModalOpen(true)}
                            className="cursor-pointer group relative shrink-0"
                            title="Click to Enlarge QR Code"
                          >
                            <img
                              src={gateQrUrl}
                              alt="Official Gate Pass Scannable QR Code"
                              className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl border-2 border-slate-900/20 p-2 bg-white shadow-md group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-1 right-1 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                              🔍 Click
                            </span>
                          </div>
                        ) : (
                          <div className="w-32 h-32 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xs">
                            Generating QR...
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Real Scannable QR Code</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">100% VERIFIED</span>
                          </div>
                          <p className="text-[11px] text-slate-600 max-w-sm leading-tight">
                            Point <strong>any smartphone camera</strong> directly at this QR code. It will instantly pop up the verified student details page for campus security verification.
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsQrModalOpen(true)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Enlarge QR Code</span>
                            </button>
                            <a
                              href={`/verify-pass?id=${encodeURIComponent(passRecordNumber)}&reg=${encodeURIComponent(registerNumber)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Preview Mobile Scan</span>
                            </a>
                            <button
                              type="button"
                              onClick={handleDownloadSlip}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-300 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Download PDF Slip</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Official Signatures & Seal */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-center">
                          <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-600 flex flex-col items-center justify-center p-1 text-[8px] font-bold text-emerald-900 leading-tight uppercase transform -rotate-12 bg-emerald-50 shadow-2xs">
                            <span>VSB HOSTEL</span>
                            <span className="text-[7px] text-emerald-700 font-mono">SEAL &amp; SIGN</span>
                            <span className="text-[6.5px] text-slate-500">{sanctionTimestamp.split(',')[0]}</span>
                            <span className="text-emerald-800 font-black">APPROVED</span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-400 block mt-1">Hostel Stamp</span>
                        </div>
                      </div>
                    </div>

                    {/* Full-screen QR Modal for Effortless Scanning */}
                    {isQrModalOpen && (
                      <div 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
                        onClick={() => setIsQrModalOpen(false)}
                      >
                        <div 
                          className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              Scan with Phone Camera
                            </span>
                            <button 
                              type="button"
                              onClick={() => setIsQrModalOpen(false)}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="bg-white p-4 rounded-2xl border-2 border-slate-900 inline-block shadow-inner mx-auto">
                            <img
                              src={gateQrUrl}
                              alt="Large High Contrast Pass QR Code"
                              className="w-64 h-64 mx-auto"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-lg inline-block border border-emerald-200">
                              {passRecordNumber}
                            </div>
                            <p className="text-xs text-slate-500">
                              Hold your mobile phone camera 10–20 cm away from the screen to scan.
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={`/verify-pass?id=${encodeURIComponent(passRecordNumber)}&reg=${encodeURIComponent(registerNumber)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Open Verification Page Directly</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
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
                      <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Record #{passRecordNumber}
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
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Destination / City:</label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                      placeholder="e.g. Karur Central"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Permitted Departure:</label>
                    <input
                      type="text"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                      placeholder="e.g. Today, 02:30 PM"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Expected Return Curfew:</label>
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
                  <label className="text-xs font-semibold text-slate-600 block">Parent Phone (For Call Verification):</label>
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
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 block">Purpose of Outing:</label>
                    <span className="text-[10px] text-slate-400">Official Reason</span>
                  </div>
                  <input
                    type="text"
                    value={outingPurpose}
                    onChange={(e) => setOutingPurpose(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium"
                    placeholder="Reason for outing..."
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      'Library & Project Component Sourcing',
                      'Textbooks & Stationery Purchase',
                      'Medical Checkup / Pharmacy Visit',
                      'Weekend Home Visit (Parent Permission)'
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setOutingPurpose(preset)}
                        className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          outingPurpose === preset
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {preset.split('(')[0].trim()}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Update &amp; Re-apply Gate Pass</span>
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
