import { jsPDF } from 'jspdf'
import { VSB_LOGO_BASE64 } from './logoBase64'

export interface PDFDocOptions {
  title: string
  subtitle?: string
  subjectCode?: string
  author?: string
  category?: string
  content?: string
  sections?: { heading: string; body: string[] }[]
  fileName?: string
}

export function generateAndDownloadPDF(options: PDFDocOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // 1. Header Banner (32mm height)
  doc.setFillColor(7, 26, 61) // #071A3D
  doc.rect(0, 0, pageWidth, 32, 'F')

  doc.setFillColor(20, 85, 217) // #1455D9 Accent Stripe
  doc.rect(0, 32, pageWidth, 2.5, 'F')

  doc.setFillColor(244, 196, 48) // Gold Accent Stripe
  doc.rect(0, 34.5, pageWidth, 1, 'F')

  // Embed Official VSB Logo on Left
  try {
    doc.addImage(VSB_LOGO_BASE64, 'PNG', 12, 4.5, 23, 23)
  } catch (e) {
    console.error('Failed to embed logo in PDF:', e)
  }

  // College Name & Department Typography
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13.5)
  doc.text('V.S.B. ENGINEERING COLLEGE (AUTONOMOUS)', (pageWidth + 15) / 2, 12, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(244, 196, 48) // Gold
  doc.text('DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE', (pageWidth + 15) / 2, 18.5, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(215, 230, 255)
  doc.text('Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai · Karur - 639 111', (pageWidth + 15) / 2, 24.5, { align: 'center' })

  doc.setFontSize(7)
  doc.setTextColor(180, 205, 240)
  doc.text('Accredited by NAAC with "A" Grade · NBA Accredited Programs', (pageWidth + 15) / 2, 29, { align: 'center' })

  // 2. Document Title Section
  let currentY = 44
  doc.setTextColor(7, 26, 61)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(options.title, 15, currentY)
  currentY += 5.5

  if (options.subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(80, 90, 105)
    doc.text(options.subtitle, 15, currentY)
    currentY += 6.5
  }

  // Metadata Pill Box
  doc.setFillColor(244, 247, 253)
  doc.roundedRect(15, currentY, pageWidth - 30, 8.5, 2, 2, 'F')
  doc.setDrawColor(215, 225, 245)
  doc.setLineWidth(0.3)
  doc.roundedRect(15, currentY, pageWidth - 30, 8.5, 2, 2, 'S')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(20, 85, 217)

  const metaItems: string[] = []
  if (options.subjectCode) metaItems.push(`Course: ${options.subjectCode}`)
  if (options.category) metaItems.push(`Category: ${options.category}`)
  if (options.author) metaItems.push(`Authority: ${options.author}`)
  metaItems.push(`Date: ${new Date().toLocaleDateString('en-GB')}`)

  doc.text(metaItems.join('   ·   '), 19, currentY + 5.8)
  currentY += 13

  // 3. Structured Sections & Professional Body Content
  if (options.sections && options.sections.length > 0) {
    for (const sec of options.sections) {
      if (currentY > pageHeight - 42) {
        doc.addPage()
        currentY = 22
      }

      // Section Card Banner with Blue Left Accent Tab
      doc.setFillColor(243, 246, 252)
      doc.roundedRect(15, currentY - 4.5, pageWidth - 30, 8, 1.5, 1.5, 'F')
      doc.setFillColor(20, 85, 217)
      doc.rect(15, currentY - 4.5, 3, 8, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(7, 26, 61)
      doc.text(sec.heading, 21, currentY + 1)
      currentY += 8.5

      for (const rawLine of sec.body) {
        if (currentY > pageHeight - 25) {
          doc.addPage()
          currentY = 22
        }

        // Clean line string and remove any existing leading bullets
        const cleanLine = rawLine.replace(/^[•\-\*]\s*/, '').trim()

        // Draw bullet dot at fixed X=18
        doc.setFillColor(20, 85, 217)
        doc.circle(19, currentY - 1, 0.8, 'F')

        // Check for Label: Value pattern
        const colonIdx = cleanLine.indexOf(':')
        if (colonIdx > 0 && colonIdx < 35) {
          const label = cleanLine.slice(0, colonIdx + 1).trim()
          const val = cleanLine.slice(colonIdx + 1).trim()

          doc.setFont('helvetica', 'bold')
          doc.setFontSize(9)
          doc.setTextColor(50, 60, 80)
          doc.text(label, 23, currentY)

          const labelWidth = doc.getTextWidth(`${label} `)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(20, 30, 45)

          const splitVal = doc.splitTextToSize(val, pageWidth - 23 - labelWidth - 16)
          doc.text(splitVal, 23 + labelWidth, currentY)
          currentY += Math.max(1, splitVal.length) * 4.8
        } else {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(9)
          doc.setTextColor(30, 40, 55)

          const splitText = doc.splitTextToSize(cleanLine, pageWidth - 39)
          doc.text(splitText, 23, currentY)
          currentY += splitText.length * 4.8
        }
      }
      currentY += 3
    }
  } else if (options.content) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(30, 40, 55)
    const splitContent = doc.splitTextToSize(options.content, pageWidth - 32)

    for (let i = 0; i < splitContent.length; i++) {
      if (currentY > pageHeight - 22) {
        doc.addPage()
        currentY = 22
      }
      doc.text(splitContent[i], 16, currentY)
      currentY += 4.8
    }
  }

  // 4. Official Signatures & Seal Block on Final Page
  const finalY = Math.max(currentY + 4, pageHeight - 34)

  doc.setDrawColor(215, 225, 240)
  doc.setLineWidth(0.3)
  doc.line(15, finalY, pageWidth - 15, finalY)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)

  doc.text('Faculty Class Advisor', 25, finalY + 6)
  doc.text('Head of Department (AI & DS)', pageWidth / 2, finalY + 6, { align: 'center' })
  doc.text('Controller of Examinations (Autonomous)', pageWidth - 25, finalY + 6, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(120, 130, 145)
  doc.text('Verified Academic Copy', 25, finalY + 10)
  doc.text('V.S.B. Engineering College', pageWidth / 2, finalY + 10, { align: 'center' })
  doc.text('Authorized Institutional Seal', pageWidth - 25, finalY + 10, { align: 'right' })

  // 5. Global Clean Page Footers
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFillColor(248, 250, 253)
    doc.rect(0, pageHeight - 9, pageWidth, 9, 'F')
    doc.setDrawColor(220, 228, 240)
    doc.line(0, pageHeight - 9, pageWidth, pageHeight - 9)

    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 110, 125)
    doc.text('V.S.B. AI & DS Digital Portal · Official Academic Documentation System', 15, pageHeight - 3.5)
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 15, pageHeight - 3.5, { align: 'right' })
  }

  const safeFileName = (options.fileName || options.title)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')

  doc.save(`${safeFileName}.pdf`)
}

export function downloadStudentCardPDF(student: {
  name: string
  registerNumber: string
  department: string
  year: number
  semester: number
  section: string
  email: string
  phone: string
  dob: string
  cgpa: string
  attendance: string
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [105, 155],
  })

  const width = 105
  const height = 155

  // Header Background
  doc.setFillColor(7, 26, 61)
  doc.rect(0, 0, width, 40, 'F')

  doc.setFillColor(244, 196, 48) // Gold Accent
  doc.rect(0, 40, width, 2, 'F')

  // Embed Logo in ID Card Header
  try {
    doc.addImage(VSB_LOGO_BASE64, 'PNG', 6, 6, 20, 20)
  } catch (e) {
    console.error('Failed to embed logo in student card:', e)
  }

  // Header Text
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.text('V.S.B. ENGINEERING COLLEGE', 30, 13)

  doc.setFontSize(7)
  doc.setTextColor(244, 196, 48)
  doc.text('AUTONOMOUS INSTITUTION · KARUR', 30, 19)

  doc.setFontSize(7.5)
  doc.setTextColor(200, 220, 255)
  doc.text('STUDENT DIGITAL ACADEMIC CARD', 30, 26)

  doc.setFontSize(6.5)
  doc.setTextColor(255, 255, 255)
  doc.text('ACADEMIC YEAR: 2025 - 2026', 30, 32)

  // Photo Avatar Box
  doc.setFillColor(240, 244, 252)
  doc.roundedRect(width / 2 - 14, 46, 28, 28, 3, 3, 'F')
  doc.setDrawColor(20, 85, 217)
  doc.setLineWidth(1)
  doc.roundedRect(width / 2 - 14, 46, 28, 28, 3, 3, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(7, 26, 61)
  doc.text(student.name.charAt(0) || 'K', width / 2, 63, { align: 'center' })

  // Name & Reg No
  doc.setFontSize(11.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(student.name, width / 2, 80, { align: 'center' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(20, 85, 217)
  doc.text(`REG NO: ${student.registerNumber}`, width / 2, 86, { align: 'center' })

  // Details Table
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(8, 90, width - 16, 48, 2, 2, 'F')
  doc.setDrawColor(230, 235, 245)
  doc.roundedRect(8, 90, width - 16, 48, 2, 2, 'S')

  const items = [
    ['PROGRAM:', 'B.Tech AI & DS (Regulation 2021)'],
    ['YEAR & SEM:', `Year ${student.year} / Sem ${student.semester} (Sec ${student.section})`],
    ['COLLEGE EMAIL:', student.email],
    ['PHONE:', student.phone],
    ['DATE OF BIRTH:', student.dob],
    ['CGPA / ATTEND:', `${student.cgpa} CGPA  |  ${student.attendance} Attendance`],
  ]

  let rowY = 97
  for (const [k, v] of items) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(100, 110, 125)
    doc.text(k, 11, rowY)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(7, 26, 61)
    doc.text(v, 36, rowY)
    rowY += 6.8
  }

  // Footer Signature Bar
  doc.setFillColor(7, 26, 61)
  doc.rect(0, height - 13, width, 13, 'F')

  doc.setFontSize(6.5)
  doc.setTextColor(244, 196, 48)
  doc.text('PRINCIPAL / REGISTRAR SIGNATURE', 12, height - 6)

  doc.setTextColor(255, 255, 255)
  doc.text('HOD - AI & DS', width - 12, height - 6, { align: 'right' })

  doc.save(`Student_Card_${student.registerNumber}.pdf`)
}
