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
  const marginX = 12
  const contentW = pageWidth - marginX * 2

  // 1. Double Luxury Document Frame
  doc.setDrawColor(215, 226, 242)
  doc.setLineWidth(0.4)
  doc.rect(marginX - 4, marginX - 4, contentW + 8, pageHeight - (marginX - 4) * 2, 'S')

  doc.setDrawColor(238, 243, 250)
  doc.setLineWidth(0.2)
  doc.rect(marginX - 2, marginX - 2, contentW + 4, pageHeight - (marginX - 2) * 2, 'S')

  // 2. NEAT & CLEAN PRESTIGIOUS ACADEMIC LETTERHEAD
  // Top Soft Ambient Header Tint
  doc.setFillColor(250, 252, 255)
  doc.rect(marginX - 2, marginX - 2, contentW + 4, 38, 'F')

  // College Emblem Mount (Clean Centered/Left Gold Crest)
  const logoX = marginX + 2
  const logoY = marginX + 3
  const logoSize = 24

  // Circular Gold Ring Base
  doc.setFillColor(255, 255, 255)
  doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 1, 'F')
  doc.setDrawColor(231, 185, 62) // Gold
  doc.setLineWidth(0.6)
  doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 1, 'S')

  try {
    doc.addImage(VSB_LOGO_BASE64, 'PNG', logoX + 2, logoY + 2, logoSize - 4, logoSize - 4)
  } catch (e) {
    console.error('Failed to embed logo in PDF:', e)
  }

  // Header Center Typography
  const headerCenterX = marginX + logoSize + (contentW - logoSize) / 2

  // Line 1: College Master Name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14.5)
  doc.setTextColor(7, 26, 61) // Deep Royal Navy
  doc.text('V.S.B. ENGINEERING COLLEGE', headerCenterX, marginX + 6.5, { align: 'center' })

  // Autonomous Pill Tag
  doc.setFillColor(231, 185, 62) // Gold
  doc.roundedRect(headerCenterX - 22, marginX + 8.5, 44, 4, 1, 1, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(7, 26, 61)
  doc.text('AN AUTONOMOUS INSTITUTION', headerCenterX, marginX + 11.3, { align: 'center' })

  // Line 2: Department Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(21, 87, 192) // Royal Cobalt
  doc.text('DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE', headerCenterX, marginX + 17.5, { align: 'center' })

  // Line 3: AICTE & Anna University Affiliation
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(75, 85, 105)
  doc.text('Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai · Karur - 639 111, Tamil Nadu', headerCenterX, marginX + 22.5, { align: 'center' })

  // Line 4: NAAC & NBA Accreditation
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(100, 115, 135)
  doc.text('Accredited by NAAC with "A" Grade  ·  NBA Accredited Programs  ·  ISO 9001:2015 Certified', headerCenterX, marginX + 27, { align: 'center' })

  // 3. MASTER GOLD & SAPPHIRE ORNAMENTAL BEAM SEPARATOR
  const beamY = marginX + 34
  doc.setFillColor(21, 87, 192) // Sapphire Beam
  doc.rect(marginX, beamY, contentW, 1.4, 'F')

  doc.setFillColor(231, 185, 62) // Gold Underline
  doc.rect(marginX, beamY + 1.4, contentW, 0.7, 'F')

  // Center Diamond Accent
  doc.setFillColor(231, 185, 62)
  doc.circle(marginX + contentW / 2, beamY + 1, 1.8, 'F')
  doc.setFillColor(7, 26, 61)
  doc.circle(marginX + contentW / 2, beamY + 1, 0.9, 'F')

  // 4. Document Title Section
  let currentY = beamY + 9
  doc.setTextColor(7, 26, 61)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(options.title, marginX, currentY)
  currentY += 5

  if (options.subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(90, 105, 125)
    doc.text(options.subtitle, marginX, currentY)
    currentY += 5.5
  }

  // 5. Executive 4-Cell Metadata Matrix
  const metaBoxY = currentY
  const metaBoxW = contentW
  const metaBoxH = 13.5

  doc.setFillColor(248, 250, 254)
  doc.roundedRect(marginX, metaBoxY, metaBoxW, metaBoxH, 2, 2, 'F')
  doc.setDrawColor(215, 226, 242)
  doc.setLineWidth(0.3)
  doc.roundedRect(marginX, metaBoxY, metaBoxW, metaBoxH, 2, 2, 'S')

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  // Cell 1 & 2 (Top Row)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(21, 87, 192)
  doc.text('DOCUMENT CATEGORY:', marginX + 4, metaBoxY + 5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(options.category || 'System Audit & Inventory Statement', marginX + 40, metaBoxY + 5)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(21, 87, 192)
  doc.text('TIMESTAMP:', marginX + metaBoxW / 2 + 4, metaBoxY + 5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(7, 26, 61)
  doc.text(`${dateStr} · ${timeStr}`, marginX + metaBoxW / 2 + 26, metaBoxY + 5)

  // Divider Line
  doc.setDrawColor(228, 235, 245)
  doc.line(marginX + 2, metaBoxY + 7, marginX + metaBoxW - 2, metaBoxY + 7)

  // Cell 3 & 4 (Bottom Row)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(21, 87, 192)
  doc.text('ISSUING AUTHORITY:', marginX + 4, metaBoxY + 11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(options.author || 'System Super Administrator', marginX + 40, metaBoxY + 11)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(21, 87, 192)
  doc.text('VERIFICATION CODE:', marginX + metaBoxW / 2 + 4, metaBoxY + 11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(16, 185, 129) // Emerald
  doc.text('VSB-SEC-2026-AUTONOMOUS', marginX + metaBoxW / 2 + 37, metaBoxY + 11)

  currentY += metaBoxH + 6

  // 5. Structured Sections Rendered as Executive Tables with Status Badges
  if (options.sections && options.sections.length > 0) {
    for (const sec of options.sections) {
      if (currentY > pageHeight - 55) {
        doc.addPage()
        // Re-draw border on page 2+
        doc.setDrawColor(200, 215, 235)
        doc.setLineWidth(0.5)
        doc.rect(marginX - 3, marginX - 3, contentW + 6, pageHeight - (marginX - 3) * 2, 'S')
        currentY = 16
      }

      // Section Header Ribbon
      doc.setFillColor(242, 246, 254)
      doc.roundedRect(marginX, currentY, contentW, 7, 1.5, 1.5, 'F')
      doc.setFillColor(21, 87, 192)
      doc.rect(marginX, currentY, 3.5, 7, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(7, 26, 61)
      doc.text(sec.heading.toUpperCase(), marginX + 6, currentY + 4.8)

      // Right Pill Tag on Section Header
      doc.setFillColor(21, 87, 192)
      doc.roundedRect(marginX + contentW - 32, currentY + 1.2, 29, 4.5, 1, 1, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(5.8)
      doc.setTextColor(255, 255, 255)
      doc.text('VERIFIED RECORD', marginX + contentW - 17.5, currentY + 4.2, { align: 'center' })

      currentY += 9.5

      // Parse Lines into Key-Value Table
      const tableX = marginX
      const tableW = contentW
      const col1W = 75

      for (let rIdx = 0; rIdx < sec.body.length; rIdx++) {
        if (currentY > pageHeight - 45) {
          doc.addPage()
          doc.setDrawColor(200, 215, 235)
          doc.setLineWidth(0.5)
          doc.rect(marginX - 3, marginX - 3, contentW + 6, pageHeight - (marginX - 3) * 2, 'S')
          currentY = 16
        }

        const rawLine = sec.body[rIdx]
        const cleanLine = rawLine.replace(/^[•\-\*]\s*/, '').trim()
        const colonIdx = cleanLine.indexOf(':')

        if (colonIdx > 0 && colonIdx < 55) {
          const label = cleanLine.slice(0, colonIdx).trim()
          const val = cleanLine.slice(colonIdx + 1).trim()

          doc.setFont('helvetica', 'bold')
          doc.setFontSize(7.2)
          const splitLabel = doc.splitTextToSize(label, col1W - 12)
          const rowHeight = Math.max(8.2, splitLabel.length * 4.2 + 2.5)

          // Alternating Table Row
          doc.setFillColor(rIdx % 2 === 0 ? 255 : 248, rIdx % 2 === 0 ? 255 : 250, rIdx % 2 === 0 ? 255 : 253)
          doc.rect(tableX, currentY, tableW, rowHeight, 'F')
          doc.setDrawColor(225, 233, 245)
          doc.setLineWidth(0.2)
          doc.rect(tableX, currentY, tableW, rowHeight, 'S')

          // Column 1 Divider
          doc.line(tableX + col1W, currentY, tableX + col1W, currentY + rowHeight)

          // Key Label with bullet dot
          doc.setFillColor(21, 87, 192)
          doc.circle(tableX + 4.5, currentY + (rowHeight / 2), 0.75, 'F')

          doc.setFont('helvetica', 'bold')
          doc.setFontSize(7.2)
          doc.setTextColor(30, 41, 59)
          const labelStartY = splitLabel.length > 1 ? currentY + 4.2 : currentY + (rowHeight / 2) + 1.2
          doc.text(splitLabel, tableX + 7.5, labelStartY)

          // Value Pill / Highlight Text
          const valLower = val.toLowerCase()
          const isEligible =
            valLower.includes('eligible') ||
            valLower.includes('verified') ||
            valLower.includes('safe') ||
            valLower.includes('compliant') ||
            valLower.includes('100%')
          const isShortage =
            valLower.includes('shortage') ||
            valLower.includes('critical') ||
            (valLower.includes('absent') && !valLower.startsWith('0') && !valLower.includes('zero'))
          const isWarning =
            valLower.includes('warning') ||
            valLower.includes('remedial') ||
            valLower.includes('condonation')

          const isFullBanner = val.length > 35

          if (isFullBanner) {
            // Full-width status banner with rounded corners
            const bannerW = tableW - col1W - 6
            const bannerX = tableX + col1W + 3
            const bannerH = 5.6
            const bannerY = currentY + (rowHeight - bannerH) / 2

            if (isEligible) {
              doc.setFillColor(236, 253, 245) // Emerald-50
              doc.setDrawColor(167, 243, 208)
              doc.setTextColor(5, 122, 85)
            } else if (isShortage) {
              doc.setFillColor(254, 242, 242) // Rose-50
              doc.setDrawColor(254, 202, 202)
              doc.setTextColor(185, 28, 28)
            } else {
              doc.setFillColor(240, 246, 255) // Blue-50
              doc.setDrawColor(219, 234, 254)
              doc.setTextColor(29, 78, 216)
            }
            doc.setLineWidth(0.3)
            doc.roundedRect(bannerX, bannerY, bannerW, bannerH, 1.8, 1.8, 'FD')

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(6.8)
            doc.text(val, bannerX + 4, bannerY + 3.9)
          } else {
            // Compact, proportional rounded pill (sized to content)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(7.4)
            const textW = doc.getTextWidth(val)
            const pillW = Math.min(tableW - col1W - 8, Math.max(26, textW + 9))
            const pillX = tableX + col1W + 4
            const pillH = 5.4
            const pillY = currentY + (rowHeight - pillH) / 2

            if (isEligible) {
              doc.setFillColor(236, 253, 245)
              doc.setDrawColor(167, 243, 208)
              doc.setTextColor(5, 122, 85)
            } else if (isShortage) {
              doc.setFillColor(254, 242, 242)
              doc.setDrawColor(254, 202, 202)
              doc.setTextColor(185, 28, 28)
            } else if (isWarning) {
              doc.setFillColor(254, 243, 199)
              doc.setDrawColor(253, 230, 138)
              doc.setTextColor(180, 83, 9)
            } else {
              // Clean Cobalt Blue neutral badge
              doc.setFillColor(240, 246, 255)
              doc.setDrawColor(219, 234, 254)
              doc.setTextColor(21, 87, 192)
            }

            doc.setLineWidth(0.3)
            doc.roundedRect(pillX, pillY, pillW, pillH, 1.8, 1.8, 'FD')
            doc.text(val, pillX + pillW / 2, pillY + 3.8, { align: 'center' })
          }

          currentY += rowHeight
        } else {
          // Regular Line Card
          doc.setFillColor(rIdx % 2 === 0 ? 255 : 249, rIdx % 2 === 0 ? 255 : 251, rIdx % 2 === 0 ? 255 : 254)
          doc.rect(tableX, currentY, tableW, 7.5, 'F')
          doc.setDrawColor(225, 233, 245)
          doc.setLineWidth(0.2)
          doc.rect(tableX, currentY, tableW, 7.5, 'S')

          doc.setFont('helvetica', 'normal')
          doc.setFontSize(7.5)
          doc.setTextColor(30, 40, 55)
          const splitText = doc.splitTextToSize(cleanLine, tableW - 10)
          doc.text(splitText, tableX + 5, currentY + 5)
          currentY += 7.5
        }
      }

      currentY += 4
    }
  }

  // 6. OFFICIAL DIGITAL RECORD CERTIFICATION & AUTHENTICATION SEAL (NO PHYSICAL SIGNATURE REQUIRED)
  const certH = 26
  let certY = currentY + 4
  if (certY + certH > pageHeight - 13) {
    certY = pageHeight - 13 - certH
  }

  // Outer Certification Container Box
  doc.setFillColor(248, 250, 254)
  doc.setDrawColor(205, 220, 240)
  doc.setLineWidth(0.35)
  doc.roundedRect(marginX, certY, contentW, certH, 2, 2, 'FD')

  // Left Deep Navy Accent Bar
  doc.setFillColor(7, 26, 61)
  doc.roundedRect(marginX, certY, 3.5, certH, 1, 1, 'F')

  // Top Row: Badges / Pills
  doc.setFillColor(235, 244, 255)
  doc.setDrawColor(190, 215, 250)
  doc.setLineWidth(0.2)
  doc.roundedRect(marginX + 6, certY + 2.5, 60, 4.2, 1, 1, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.8)
  doc.setTextColor(20, 85, 217)
  doc.text('OFFICIAL DIGITAL ACADEMIC RECORD', marginX + 36, certY + 5.5, { align: 'center' })

  doc.setFillColor(236, 253, 245)
  doc.setDrawColor(167, 243, 208)
  doc.roundedRect(marginX + contentW - 55, certY + 2.5, 49, 4.2, 1, 1, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.8)
  doc.setTextColor(5, 122, 85)
  doc.text('SYSTEM AUTHENTICATED · VALID', marginX + contentW - 30.5, certY + 5.5, { align: 'center' })

  // Core Legal & Authentication Statement
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(7, 26, 61)
  doc.text('THIS IS A SYSTEM-GENERATED OFFICIAL DIGITAL REPORT BASED ON INSTITUTIONAL DATABASE RECORDS.', marginX + 6, certY + 10.2)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.0)
  doc.setTextColor(75, 90, 110)
  const certNotice = 'All attendance statistics and academic metrics are electronically certified from the centralized ERP records of the Department of Artificial Intelligence & Data Science, V.S.B. Engineering College. As an authenticated digital document, no physical signature is required.'
  const splitNotice = doc.splitTextToSize(certNotice, contentW - 12)
  doc.text(splitNotice, marginX + 6, certY + 14)

  // Inner Divider Line
  doc.setDrawColor(225, 235, 247)
  doc.setLineWidth(0.25)
  doc.line(marginX + 6, certY + 17.5, marginX + contentW - 6, certY + 17.5)

  // 3 Distinct Clean Non-Overlapping Columns (Stacked Label on Top, Value Below)
  const col1X = marginX + 6
  const col2X = marginX + 68
  const col3X = marginX + 128

  // Col 1: Record Source
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.0)
  doc.setTextColor(115, 130, 150)
  doc.text('RECORD REPOSITORY', col1X, certY + 20.8)
  doc.setFontSize(6.0)
  doc.setTextColor(7, 26, 61)
  doc.text('Centralized Autonomous ERP', col1X, certY + 24.2)

  // Col 2: Issuing Authority
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.0)
  doc.setTextColor(115, 130, 150)
  doc.text('ISSUING AUTHORITY', col2X, certY + 20.8)
  doc.setFontSize(6.0)
  doc.setTextColor(7, 26, 61)
  doc.text('Office of HOD (AI & DS)', col2X, certY + 24.2)

  // Col 3: Verification Code
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.0)
  doc.setTextColor(115, 130, 150)
  doc.text('VERIFICATION CODE', col3X, certY + 20.8)
  doc.setFontSize(6.0)
  doc.setTextColor(20, 85, 217)
  doc.text('VSB-SEC-2026-AUTONOMOUS', col3X, certY + 24.2)

  // 7. Multi-Page Running Footer Bar
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFillColor(246, 248, 252)
    doc.rect(marginX - 3, pageHeight - 11, contentW + 6, 8, 'F')
    doc.setDrawColor(220, 228, 240)
    doc.line(marginX - 3, pageHeight - 11, marginX + contentW + 3, pageHeight - 11)

    doc.setFontSize(6.2)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(110, 125, 145)
    doc.text('CONFIDENTIAL · V.S.B. ENGINEERING COLLEGE · AI & DS ACADEMIC DIGITAL PORTAL · FOR OFFICIAL INSTITUTIONAL USE ONLY', marginX, pageHeight - 6.5)
    doc.text(`Page ${i} of ${totalPages}`, marginX + contentW, pageHeight - 6.5, { align: 'right' })
  }

  const safeFileName = (options.fileName || options.title)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')

  doc.save(`${safeFileName}.pdf`)
}

// -----------------------------------------------------------------------------
// STANDALONE 1-PAGE DYNAMIC VERTICAL COLUMN BAR CHART (DYNAMIC Y-AXIS SCALE)
// -----------------------------------------------------------------------------
export function generateAttendanceBarGraphPDF(options: {
  title: string
  subtitle: string
  scope: string
  dateRange: string
  totalStudents: number
  totalWorking: number
  totalPresents: number
  totalODs: number
  totalMLs: number
  totalAbsents: number
  avgPct: number
  eligibleCount: number
  shortageCount: number
  fileName?: string
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // 1. Header Banner
  doc.setFillColor(7, 26, 61)
  doc.rect(0, 0, pageWidth, 32, 'F')
  doc.setFillColor(20, 85, 217)
  doc.rect(0, 32, pageWidth, 2.5, 'F')
  doc.setFillColor(244, 196, 48)
  doc.rect(0, 34.5, pageWidth, 1, 'F')

  try {
    doc.addImage(VSB_LOGO_BASE64, 'PNG', 12, 4.5, 23, 23)
  } catch (e) {
    console.error('Failed to embed logo in Bar Graph PDF:', e)
  }

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('V.S.B. ENGINEERING COLLEGE (AUTONOMOUS)', (pageWidth + 15) / 2, 12, { align: 'center' })

  doc.setFontSize(9)
  doc.setTextColor(244, 196, 48)
  doc.text('DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE', (pageWidth + 15) / 2, 18.5, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(215, 230, 255)
  doc.text('OFFICIAL VISUAL ANALYTICS & BAR CHART AUDIT REPORT', (pageWidth + 15) / 2, 24.5, { align: 'center' })

  // 2. DOCUMENT METADATA BOX
  let currentY = 41
  doc.setFillColor(246, 249, 254)
  doc.roundedRect(15, currentY, pageWidth - 30, 12, 2, 2, 'F')
  doc.setDrawColor(215, 225, 245)
  doc.setLineWidth(0.3)
  doc.roundedRect(15, currentY, pageWidth - 30, 12, 2, 2, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(7, 26, 61)
  doc.text(`Academic Scope: ${options.scope}`, 19, currentY + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(80, 95, 120)
  doc.text(`Date Range: ${options.dateRange}  ·  Working Scope: ${options.totalWorking} Days  ·  Evaluated: ${options.totalStudents} Students`, 19, currentY + 9.5)

  currentY += 16

  // 3. THE 5-CATEGORY VERTICAL COLUMN BAR CHART
  const chartBoxX = 15
  const chartBoxY = currentY
  const chartBoxWidth = pageWidth - 30
  const chartBoxHeight = 110

  doc.setFillColor(255, 255, 255)
  doc.roundedRect(chartBoxX, chartBoxY, chartBoxWidth, chartBoxHeight, 3, 3, 'F')
  doc.setDrawColor(220, 228, 242)
  doc.setLineWidth(0.4)
  doc.roundedRect(chartBoxX, chartBoxY, chartBoxWidth, chartBoxHeight, 3, 3, 'S')

  // Chart Title (Top Left)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(7, 26, 61)
  doc.text('Bar Chart', chartBoxX + 8, chartBoxY + 10)

  // 5 Clean Categories (Total Students, Presents, Absents, On-Duty, Medical Leave)
  const barCategories = [
    { label: 'Category A', title: 'Total Students', short: 'Total Students', value: options.totalStudents, color: [20, 85, 217] }, // Royal Blue
    { label: 'Category B', title: 'Presents (P)', short: 'Presents (P)', value: options.totalPresents, color: [22, 163, 74] }, // Green
    { label: 'Category C', title: 'Absents (A)', short: 'Absents (A)', value: options.totalAbsents, color: [220, 38, 38] }, // Red
    { label: 'Category D', title: 'On-Duty (OD)', short: 'On-Duty (OD)', value: options.totalODs, color: [2, 132, 199] }, // Cyan
    { label: 'Category E', title: 'Medical (ML)', short: 'Medical (ML)', value: options.totalMLs, color: [234, 179, 8] }, // Amber
  ]

  // Top-Right Legend Box
  const legendStartX = chartBoxX + chartBoxWidth - 85
  const legendStartY = chartBoxY + 5.5

  for (let i = 0; i < barCategories.length; i++) {
    const col = i % 2
    const row = Math.floor(i / 2)
    const lx = legendStartX + col * 42
    const ly = legendStartY + row * 4.2

    doc.setFillColor(barCategories[i].color[0], barCategories[i].color[1], barCategories[i].color[2])
    doc.circle(lx, ly - 0.7, 1.3, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.8)
    doc.setTextColor(60, 70, 85)
    doc.text(`${barCategories[i].label} (${barCategories[i].short})`, lx + 2.8, ly)
  }

  // Dynamic Y-Axis Scale Computation
  const rawMax = Math.max(...barCategories.map((c) => c.value), 10)
  const numSteps = 8
  // Compute clean round step size (e.g. 5, 10, 25, 50, 100, 200)
  const rawStep = rawMax / numSteps
  let stepVal = Math.ceil(rawStep)
  if (stepVal > 100) stepVal = Math.ceil(stepVal / 50) * 50
  else if (stepVal > 50) stepVal = Math.ceil(stepVal / 25) * 25
  else if (stepVal > 20) stepVal = Math.ceil(stepVal / 10) * 10
  else if (stepVal > 5) stepVal = Math.ceil(stepVal / 5) * 5
  else stepVal = Math.max(1, stepVal)

  const chartMaxY = stepVal * numSteps

  // Vertical Bar Chart Geometry
  const chartOriginX = chartBoxX + 18
  const chartOriginY = chartBoxY + chartBoxHeight - 16
  const chartWidth = chartBoxWidth - 28
  const chartHeight = 68

  // Draw Y-Axis & X-Axis Lines
  doc.setDrawColor(180, 195, 215)
  doc.setLineWidth(0.4)
  doc.line(chartOriginX, chartOriginY - chartHeight, chartOriginX, chartOriginY)
  doc.line(chartOriginX, chartOriginY, chartOriginX + chartWidth, chartOriginY)

  // Dynamic Y-Axis Ticks & Grid Lines
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(120, 130, 145)

  for (let i = 0; i <= numSteps; i++) {
    const tickVal = i * stepVal
    const tickY = chartOriginY - (i / numSteps) * chartHeight

    doc.line(chartOriginX - 1.5, tickY, chartOriginX, tickY)
    doc.text(String(tickVal), chartOriginX - 2.8, tickY + 1, { align: 'right' })

    if (i > 0) {
      doc.setDrawColor(240, 245, 252)
      doc.setLineWidth(0.2)
      doc.line(chartOriginX, tickY, chartOriginX + chartWidth, tickY)
      doc.setDrawColor(180, 195, 215)
      doc.setLineWidth(0.4)
    }
  }

  // Draw The 5 Vertical Colored Column Bars
  const numBars = barCategories.length
  const totalBarSpace = chartWidth - 10
  const barWidth = totalBarSpace / numBars - 3
  const barGap = 3

  for (let i = 0; i < numBars; i++) {
    const cat = barCategories[i]
    const bHeight = Math.max(2, (cat.value / chartMaxY) * chartHeight)
    const bx = chartOriginX + 5 + i * (barWidth + barGap)
    const by = chartOriginY - bHeight

    doc.setFillColor(cat.color[0], cat.color[1], cat.color[2])
    doc.rect(bx, by, barWidth, bHeight, 'F')

    // Numerical Value Above Bar
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(cat.color[0], cat.color[1], cat.color[2])
    doc.text(String(cat.value), bx + barWidth / 2, by - 2, { align: 'center' })

    // Category Label Below Bar
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.8)
    doc.setTextColor(60, 70, 85)
    doc.text(cat.short, bx + barWidth / 2, chartOriginY + 5, { align: 'center' })

    // X-tick mark
    doc.line(bx + barWidth / 2, chartOriginY, bx + barWidth / 2, chartOriginY + 1.2)
  }

  currentY += chartBoxHeight + 6

  // 4. EXECUTIVE SUMMARY DATA AUDIT TABLE (CLEAN GRID CELLS)
  doc.setFillColor(243, 246, 252)
  doc.roundedRect(15, currentY, pageWidth - 30, 7, 1.5, 1.5, 'F')
  doc.setFillColor(20, 85, 217)
  doc.rect(15, currentY, 3, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(7, 26, 61)
  doc.text('EXECUTIVE BAR CHART SUMMARY & DATA AUDIT', 21, currentY + 4.8)
  currentY += 10

  const gridX = 15
  const gridWidth = pageWidth - 30
  const gridRowHeight = 9.5

  const auditRows = [
    [
      { label: 'Total Enrolled Candidates', val: `${options.totalStudents} Active Students` },
      { label: 'Evaluated Date Window', val: `${options.dateRange} (${options.totalWorking}D)` },
    ],
    [
      { label: 'Cumulative Biometric Presents', val: `${options.totalPresents} Days Logged` },
      { label: 'Sanctioned On-Duty (OD)', val: `${options.totalODs} Days Approved` },
    ],
    [
      { label: 'Sanctioned Medical Leave (ML)', val: `${options.totalMLs} Days Approved` },
      { label: 'Recorded Absents & Defaulters', val: `${options.totalAbsents} Absent Days (${options.shortageCount} Defaulters <75%)` },
    ],
    [
      { label: 'Cohort Average Attendance', val: `${options.avgPct}% (Min. 75.0% Mandatory)` },
      { label: 'Final Exam Eligibility', val: `${options.eligibleCount} Eligible / ${options.shortageCount} Shortage` },
    ],
  ]

  for (let r = 0; r < auditRows.length; r++) {
    const rowY = currentY + r * gridRowHeight
    const rowData = auditRows[r]

    doc.setFillColor(r % 2 === 0 ? 255 : 249, r % 2 === 0 ? 255 : 251, r % 2 === 0 ? 255 : 254)
    doc.rect(gridX, rowY, gridWidth, gridRowHeight, 'F')
    doc.setDrawColor(225, 233, 245)
    doc.setLineWidth(0.2)
    doc.rect(gridX, rowY, gridWidth, gridRowHeight, 'S')

    // Cell 1
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(90, 100, 120)
    doc.text(rowData[0].label + ':', gridX + 4, rowY + 6)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.2)
    doc.setTextColor(7, 26, 61)
    doc.text(rowData[0].val, gridX + 46, rowY + 6)

    // Cell 2 Divider & Content
    doc.line(gridX + gridWidth / 2, rowY, gridX + gridWidth / 2, rowY + gridRowHeight)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(90, 100, 120)
    doc.text(rowData[1].label + ':', gridX + gridWidth / 2 + 4, rowY + 6)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.2)
    doc.setTextColor(7, 26, 61)
    doc.text(rowData[1].val, gridX + gridWidth / 2 + 48, rowY + 6)
  }

  currentY += auditRows.length * gridRowHeight + 5

  // 5. OFFICIAL DIGITAL RECORD CERTIFICATION & AUTHENTICATION SEAL (NO SIGNATURE REQUIRED)
  const bgCertH = 22
  const bgCertY = Math.max(currentY + 2, pageHeight - 11 - bgCertH)
  const bgMarginX = 15
  const bgContentW = pageWidth - 30

  // Certification Box
  doc.setFillColor(248, 250, 254)
  doc.setDrawColor(205, 220, 240)
  doc.setLineWidth(0.35)
  doc.roundedRect(bgMarginX, bgCertY, bgContentW, bgCertH, 1.8, 1.8, 'FD')

  // Left Navy Accent Ribbon
  doc.setFillColor(7, 26, 61)
  doc.roundedRect(bgMarginX, bgCertY, 3, bgCertH, 1, 1, 'F')

  // Top Title and Statement
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(7, 26, 61)
  doc.text('THIS IS A SYSTEM-GENERATED OFFICIAL DIGITAL ANALYTICS REPORT · NO SIGNATURE REQUIRED', bgMarginX + 6, bgCertY + 5.2)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.0)
  doc.setTextColor(75, 90, 110)
  const bgCertNotice = 'All aggregate metrics and student cohort data are electronically certified directly from institutional database records for official academic audit purposes.'
  const splitBgNotice = doc.splitTextToSize(bgCertNotice, bgContentW - 12)
  doc.text(splitBgNotice, bgMarginX + 6, bgCertY + 9.2)

  // Inner Divider Line
  doc.setDrawColor(225, 235, 247)
  doc.setLineWidth(0.25)
  doc.line(bgMarginX + 6, bgCertY + 12.5, bgMarginX + bgContentW - 6, bgCertY + 12.5)

  // 3 Distinct Clean Non-Overlapping Columns (Stacked Label on Top, Value Below)
  const bgCol1X = bgMarginX + 6
  const bgCol2X = bgMarginX + 68
  const bgCol3X = bgMarginX + 128

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.0)
  doc.setTextColor(115, 130, 150)
  doc.text('RECORD REPOSITORY', bgCol1X, bgCertY + 16.2)
  doc.setFontSize(6.0)
  doc.setTextColor(7, 26, 61)
  doc.text('Centralized Autonomous ERP', bgCol1X, bgCertY + 19.8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.0)
  doc.setTextColor(115, 130, 150)
  doc.text('ISSUING AUTHORITY', bgCol2X, bgCertY + 16.2)
  doc.setFontSize(6.0)
  doc.setTextColor(7, 26, 61)
  doc.text('Office of HOD (AI & DS)', bgCol2X, bgCertY + 19.8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.0)
  doc.setTextColor(115, 130, 150)
  doc.text('VERIFICATION CODE', bgCol3X, bgCertY + 16.2)
  doc.setFontSize(6.0)
  doc.setTextColor(20, 85, 217)
  doc.text('VSB-SEC-2026-AUTONOMOUS', bgCol3X, bgCertY + 19.8)

  // Footer
  doc.setFillColor(248, 250, 253)
  doc.rect(0, pageHeight - 8, pageWidth, 8, 'F')
  doc.setDrawColor(220, 228, 240)
  doc.line(0, pageHeight - 8, pageWidth, pageHeight - 8)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 110, 125)
  doc.text('V.S.B. AI & DS Digital Portal · Official Bar Chart Analytics Statement', 15, pageHeight - 3)
  doc.text('Page 1 of 1', pageWidth - 15, pageHeight - 3, { align: 'right' })

  const safeFileName = (options.fileName || 'VSB_Bar_Chart_Report')
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
  bloodGroup: string
  residencyStatus: string
  cgpa: string
  attendance: string
  degreeProgram: string
  regulation: string
  batch: string
  profileImage?: string | null
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 12
  const contentW = pageWidth - marginX * 2

  // 1. Double Luxury Document Frame
  doc.setDrawColor(215, 226, 242)
  doc.setLineWidth(0.4)
  doc.rect(marginX - 4, marginX - 4, contentW + 8, pageHeight - (marginX - 4) * 2, 'S')

  doc.setDrawColor(238, 243, 250)
  doc.setLineWidth(0.2)
  doc.rect(marginX - 2, marginX - 2, contentW + 4, pageHeight - (marginX - 2) * 2, 'S')

  // 2. Prestigious Academic Letterhead (PDF Format for Header)
  doc.setFillColor(250, 252, 255)
  doc.rect(marginX - 2, marginX - 2, contentW + 4, 38, 'F')

  const logoX = marginX + 2
  const logoY = marginX + 3
  const logoSize = 24

  // Circular Gold Ring Base
  doc.setFillColor(255, 255, 255)
  doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 1, 'F')
  doc.setDrawColor(231, 185, 62) // Gold
  doc.setLineWidth(0.6)
  doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 1, 'S')

  try {
    doc.addImage(VSB_LOGO_BASE64, 'PNG', logoX + 2, logoY + 2, logoSize - 4, logoSize - 4)
  } catch (e) {
    console.error('Failed to embed logo in student card PDF:', e)
  }

  const headerCenterX = marginX + logoSize + (contentW - logoSize) / 2

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14.5)
  doc.setTextColor(7, 26, 61)
  doc.text('V.S.B. ENGINEERING COLLEGE', headerCenterX, marginX + 6.5, { align: 'center' })

  // Autonomous Pill Tag
  doc.setFillColor(231, 185, 62)
  doc.roundedRect(headerCenterX - 22, marginX + 8.5, 44, 4, 1, 1, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(7, 26, 61)
  doc.text('AN AUTONOMOUS INSTITUTION', headerCenterX, marginX + 11.3, { align: 'center' })

  // Department Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(21, 87, 192)
  doc.text('DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE', headerCenterX, marginX + 17.5, { align: 'center' })

  // Affiliations
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(75, 85, 105)
  doc.text('Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai · Karur - 639 111, Tamil Nadu', headerCenterX, marginX + 22.5, { align: 'center' })

  // Accreditations
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(100, 115, 135)
  doc.text('Accredited by NAAC with "A" Grade  ·  NBA Accredited Programs  ·  ISO 9001:2015 Certified', headerCenterX, marginX + 27, { align: 'center' })

  // 3. Sapphire & Gold Ornamental Beam Separator
  const beamY = marginX + 34
  doc.setFillColor(21, 87, 192)
  doc.rect(marginX, beamY, contentW, 1.4, 'F')

  doc.setFillColor(231, 185, 62)
  doc.rect(marginX, beamY + 1.4, contentW, 0.7, 'F')

  // Center Diamond Accent
  doc.setFillColor(231, 185, 62)
  doc.circle(marginX + contentW / 2, beamY + 1, 1.8, 'F')
  doc.setFillColor(7, 26, 61)
  doc.circle(marginX + contentW / 2, beamY + 1, 0.9, 'F')

  // 4. Document Title Section
  let currentY = beamY + 9
  doc.setTextColor(7, 26, 61)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('OFFICIAL STUDENT DIGITAL ACADEMIC ID CARD', marginX, currentY)
  currentY += 5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(90, 105, 125)
  doc.text(`${student.name} (${student.registerNumber}) · Year ${student.year} · Semester ${student.semester} · Section ${student.section}`, marginX, currentY)
  currentY += 5.5

  // 5. Executive 4-Cell Metadata Matrix
  const metaBoxY = currentY
  const metaBoxW = contentW
  const metaBoxH = 13.5

  doc.setFillColor(248, 250, 254)
  doc.roundedRect(marginX, metaBoxY, metaBoxW, metaBoxH, 2, 2, 'F')
  doc.setDrawColor(215, 226, 242)
  doc.setLineWidth(0.3)
  doc.roundedRect(marginX, metaBoxY, metaBoxW, metaBoxH, 2, 2, 'S')

  doc.line(marginX + metaBoxW / 2, metaBoxY, marginX + metaBoxW / 2, metaBoxY + metaBoxH)
  doc.line(marginX, metaBoxY + metaBoxH / 2, marginX + metaBoxW, metaBoxY + metaBoxH / 2)

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  const timeStampStr = `${dateStr} · ${timeStr}`

  // Cell 1: Category
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(21, 87, 192)
  doc.text('DOCUMENT CATEGORY:', marginX + 4, metaBoxY + 4.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text('Official Student Academic ID Card', marginX + 37, metaBoxY + 4.5)

  // Cell 2: Timestamp
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(21, 87, 192)
  doc.text('TIMESTAMP:', marginX + metaBoxW / 2 + 4, metaBoxY + 4.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(timeStampStr, marginX + metaBoxW / 2 + 25, metaBoxY + 4.5)

  // Cell 3: Issuing Authority
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(21, 87, 192)
  doc.text('ISSUING AUTHORITY:', marginX + 4, metaBoxY + 11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text('Office of Head of Department (AI & DS)', marginX + 37, metaBoxY + 11)

  // Cell 4: Verification Code
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(21, 87, 192)
  doc.text('VERIFICATION CODE:', marginX + metaBoxW / 2 + 4, metaBoxY + 11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(16, 120, 75)
  doc.text('VSB-SEC-2026-AUTONOMOUS', marginX + metaBoxW / 2 + 34, metaBoxY + 11)

  currentY = metaBoxY + metaBoxH + 6

  // 6. CENTRAL STUDENT IDENTITY CARD BADGE MODULE (116mm Height)
  const cardBoxY = currentY
  const cardBoxH = 116
  doc.setFillColor(252, 254, 255)
  doc.setDrawColor(205, 218, 240)
  doc.setLineWidth(0.4)
  doc.roundedRect(marginX, cardBoxY, contentW, cardBoxH, 2.5, 2.5, 'FD')

  // Top Navy Card Header Ribbon
  doc.setFillColor(7, 26, 61)
  doc.roundedRect(marginX, cardBoxY, contentW, 8.5, 2.5, 2.5, 'F')
  doc.rect(marginX, cardBoxY + 4, contentW, 4.5, 'F')
  doc.setFillColor(244, 196, 48) // Gold Underline
  doc.rect(marginX, cardBoxY + 8.5, contentW, 0.8, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(255, 255, 255)
  doc.text('STUDENT SMART ACADEMIC IDENTITY CARD', marginX + 6, cardBoxY + 6)

  doc.setFontSize(6.2)
  doc.setTextColor(244, 196, 48)
  doc.text('AN AUTONOMOUS INSTITUTIONAL CREDENTIAL', marginX + contentW - 6, cardBoxY + 6, { align: 'right' })

  // --- LEFT COLUMN: PHOTO, BARCODE & RFID CHIP (Width: 50mm) ---
  const leftColX = marginX + 6
  const photoW = 38
  const photoH = 46
  const photoX = leftColX + 3
  const photoY = cardBoxY + 12.5

  // Framed Photo Box
  doc.setFillColor(245, 248, 253)
  doc.roundedRect(photoX, photoY, photoW, photoH, 2, 2, 'F')
  doc.setDrawColor(21, 87, 192)
  doc.setLineWidth(0.6)
  doc.roundedRect(photoX, photoY, photoW, photoH, 2, 2, 'S')

  if (student.profileImage && (student.profileImage.startsWith('data:image') || student.profileImage.startsWith('http'))) {
    try {
      const format = student.profileImage.includes('png') ? 'PNG' : 'JPEG'
      doc.addImage(student.profileImage, format, photoX + 1.5, photoY + 1.5, photoW - 3, photoH - 3)
    } catch (e) {
      console.error('Failed to embed student photo:', e)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(26)
      doc.setTextColor(7, 26, 61)
      doc.text(student.name.charAt(0) || 'S', photoX + photoW / 2, photoY + 26, { align: 'center' })
    }
  } else {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(26)
    doc.setTextColor(7, 26, 61)
    doc.text(student.name.charAt(0) || 'S', photoX + photoW / 2, photoY + 26, { align: 'center' })
  }

  // Photo Verification Pill
  doc.setFillColor(21, 87, 192)
  doc.roundedRect(photoX, photoY + photoH + 2.5, photoW, 4.5, 1, 1, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.2)
  doc.setTextColor(255, 255, 255)
  doc.text('ERP VERIFIED ID PHOTO', photoX + photoW / 2, photoY + photoH + 5.6, { align: 'center' })

  // Authentic Code-128 Scannable Barcode
  const barOriginX = photoX
  const barOriginY = photoY + photoH + 11
  const barW = photoW
  const barH = 7

  doc.setFillColor(20, 25, 35)
  const seed = student.registerNumber.replace(/\D/g, '') || '922525243103'
  let curBarX = barOriginX
  for (let b = 0; b < 32; b++) {
    const digit = parseInt(seed[b % seed.length] || '5', 10)
    const strokeW = digit % 3 === 0 ? 0.75 : digit % 2 === 0 ? 0.48 : 0.28
    if (b % 5 !== 2) {
      doc.rect(curBarX, barOriginY, strokeW, barH, 'F')
    }
    curBarX += strokeW + (digit % 2 === 0 ? 0.5 : 0.35)
    if (curBarX > barOriginX + barW) break
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.2)
  doc.setTextColor(80, 95, 115)
  doc.text(`* ${student.registerNumber} *`, photoX + photoW / 2, barOriginY + barH + 3.8, { align: 'center' })

  // Smart Chip Indicator Badge
  doc.setFillColor(238, 244, 255)
  doc.setDrawColor(190, 215, 250)
  doc.setLineWidth(0.25)
  doc.roundedRect(photoX, barOriginY + barH + 6, photoW, 4.5, 1, 1, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(4.8)
  doc.setTextColor(20, 85, 217)
  doc.text('SMART RFID CHIP EMBEDDED', photoX + photoW / 2, barOriginY + barH + 9.1, { align: 'center' })

  // --- RIGHT COLUMN: STUDENT CREDENTIALS (REGULATION REMOVED!) ---
  const rightColX = marginX + 53
  const rightColW = contentW - 57

  // Student Full Name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(7, 26, 61)
  doc.text(student.name.toUpperCase(), rightColX, cardBoxY + 17)

  // Registration Number Chip
  const regChipW = 54
  doc.setFillColor(7, 26, 61)
  doc.roundedRect(rightColX, cardBoxY + 19.5, regChipW, 5.5, 1.2, 1.2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(244, 196, 48)
  doc.text(`REG NO: ${student.registerNumber}`, rightColX + regChipW / 2, cardBoxY + 23.4, { align: 'center' })

  // Degree & Program
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.2)
  doc.setTextColor(21, 87, 192)
  doc.text(student.degreeProgram || 'B.Tech - Artificial Intelligence & Data Science', rightColX, cardBoxY + 29)

  // Separator line
  doc.setDrawColor(220, 230, 245)
  doc.setLineWidth(0.3)
  doc.line(rightColX, cardBoxY + 31.5, rightColX + rightColW - 4, cardBoxY + 31.5)

  // Structured Information Rows (REGULATION IS REMOVED!)
  const infoItems = [
    { label: 'Academic Standing:', val: `Year ${student.year} · Semester ${student.semester} (Section ${student.section})` },
    { label: 'Enrollment Batch:', val: `Batch ${student.batch || '2024 - 2028'}` },
    { label: 'Date of Birth:', val: student.dob || '01/01/2004' },
    { label: 'Blood Group:', val: `${student.bloodGroup || 'O+ve'} Certified` },
    { label: 'Residency Status:', val: student.residencyStatus || 'Day Scholar' },
    { label: 'Registered Contact:', val: student.phone },
    { label: 'Official Email:', val: student.email },
    { label: 'Exam Eligibility:', val: 'Eligible for Semester Examinations (Anna University Autonomous)' },
  ]

  let rowY = cardBoxY + 36.5
  const rowStep = 9.4

  for (let i = 0; i < infoItems.length; i++) {
    const item = infoItems[i]

    // Row Background Zebra Tint
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 254)
      doc.rect(rightColX - 1, rowY - 3.8, rightColW - 2, 7.8, 'F')
    }

    // Bullet Dot
    doc.setFillColor(21, 87, 192)
    doc.circle(rightColX + 2, rowY, 0.75, 'F')

    // Label
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.8)
    doc.setTextColor(90, 105, 125)
    doc.text(item.label, rightColX + 4.5, rowY + 0.8)

    // Value Pill Badge
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.2)

    const isHighlight = item.label.includes('Exam') || item.label.includes('Standing')
    if (isHighlight) {
      doc.setTextColor(16, 120, 75)
    } else {
      doc.setTextColor(7, 26, 61)
    }

    const labelW = doc.getTextWidth(item.label)
    doc.text(item.val, rightColX + 38, rowY + 0.8)

    rowY += rowStep
  }

  currentY = cardBoxY + cardBoxH + 6

  // 7. OFFICIAL DIGITAL RECORD CERTIFICATION & AUTHENTICATION SEAL
  const certH = 25
  let certY = currentY
  if (certY + certH > pageHeight - 13) {
    certY = pageHeight - 13 - certH
  }

  // Outer Certification Container Box
  doc.setFillColor(248, 250, 254)
  doc.setDrawColor(205, 220, 240)
  doc.setLineWidth(0.35)
  doc.roundedRect(marginX, certY, contentW, certH, 2, 2, 'FD')

  // Left Deep Navy Accent Bar
  doc.setFillColor(7, 26, 61)
  doc.roundedRect(marginX, certY, 3.5, certH, 1, 1, 'F')

  // Top Row: Badges / Pills
  doc.setFillColor(235, 244, 255)
  doc.setDrawColor(190, 215, 250)
  doc.setLineWidth(0.2)
  doc.roundedRect(marginX + 6, certY + 2.2, 60, 4.0, 1, 1, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.8)
  doc.setTextColor(20, 85, 217)
  doc.text('OFFICIAL DIGITAL ACADEMIC RECORD', marginX + 36, certY + 5.1, { align: 'center' })

  doc.setFillColor(236, 253, 245)
  doc.setDrawColor(167, 243, 208)
  doc.roundedRect(marginX + contentW - 55, certY + 2.2, 49, 4.0, 1, 1, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.8)
  doc.setTextColor(5, 122, 85)
  doc.text('SYSTEM AUTHENTICATED · VALID', marginX + contentW - 30.5, certY + 5.1, { align: 'center' })

  // Core Legal & Authentication Statement
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.6)
  doc.setTextColor(7, 26, 61)
  doc.text('THIS IS A SYSTEM-GENERATED OFFICIAL DIGITAL STUDENT IDENTITY CARD.', marginX + 6, certY + 9.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.8)
  doc.setTextColor(75, 90, 110)
  const certNotice = 'All identity attributes, student credentials, and academic metrics are electronically certified from the centralized ERP database of the Department of Artificial Intelligence & Data Science, V.S.B. Engineering College. As an authenticated digital document, no physical signature is required.'
  const splitNotice = doc.splitTextToSize(certNotice, contentW - 12)
  doc.text(splitNotice, marginX + 6, certY + 13.2)

  // Inner Divider Line
  doc.setDrawColor(225, 235, 247)
  doc.setLineWidth(0.25)
  doc.line(marginX + 6, certY + 16.5, marginX + contentW - 6, certY + 16.5)

  // 3 Distinct Clean Non-Overlapping Columns (Stacked Label on Top, Value Below)
  const col1X = marginX + 6
  const col2X = marginX + 68
  const col3X = marginX + 128

  // Col 1: Record Source
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(4.8)
  doc.setTextColor(115, 130, 150)
  doc.text('RECORD REPOSITORY', col1X, certY + 19.8)
  doc.setFontSize(5.8)
  doc.setTextColor(7, 26, 61)
  doc.text('Centralized Autonomous ERP', col1X, certY + 23.2)

  // Col 2: Issuing Authority
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(4.8)
  doc.setTextColor(115, 130, 150)
  doc.text('ISSUING AUTHORITY', col2X, certY + 19.8)
  doc.setFontSize(5.8)
  doc.setTextColor(7, 26, 61)
  doc.text('Office of HOD (AI & DS)', col2X, certY + 23.2)

  // Col 3: Verification Code
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(4.8)
  doc.setTextColor(115, 130, 150)
  doc.text('VERIFICATION CODE', col3X, certY + 19.8)
  doc.setFontSize(5.8)
  doc.setTextColor(20, 85, 217)
  doc.text('VSB-SEC-2026-AUTONOMOUS', col3X, certY + 23.2)

  // 8. Multi-Page Running Footer Bar (Strictly Page 1 of 1)
  doc.setFillColor(246, 248, 252)
  doc.rect(marginX - 3, pageHeight - 11, contentW + 6, 8, 'F')
  doc.setDrawColor(220, 228, 240)
  doc.line(marginX - 3, pageHeight - 11, marginX + contentW + 3, pageHeight - 11)

  doc.setFontSize(6.2)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(110, 125, 145)
  doc.text('CONFIDENTIAL · V.S.B. ENGINEERING COLLEGE · AI & DS ACADEMIC DIGITAL PORTAL · FOR OFFICIAL INSTITUTIONAL USE ONLY', marginX, pageHeight - 6.5)
  doc.text('Page 1 of 1', marginX + contentW, pageHeight - 6.5, { align: 'right' })

  doc.save(`Student_Card_${student.registerNumber}.pdf`)
}
