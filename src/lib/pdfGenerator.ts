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
      const rowHeight = 7.5
      const col1W = 68

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

        // Alternating Table Row
        doc.setFillColor(rIdx % 2 === 0 ? 255 : 249, rIdx % 2 === 0 ? 255 : 251, rIdx % 2 === 0 ? 255 : 254)
        doc.rect(tableX, currentY, tableW, rowHeight, 'F')
        doc.setDrawColor(225, 233, 245)
        doc.setLineWidth(0.2)
        doc.rect(tableX, currentY, tableW, rowHeight, 'S')

        if (colonIdx > 0 && colonIdx < 45) {
          const label = cleanLine.slice(0, colonIdx).trim()
          const val = cleanLine.slice(colonIdx + 1).trim()

          // Column 1 Divider
          doc.line(tableX + col1W, currentY, tableX + col1W, currentY + rowHeight)

          // Key Label
          doc.setFillColor(21, 87, 192)
          doc.circle(tableX + 4, currentY + rowHeight / 2, 0.7, 'F')

          doc.setFont('helvetica', 'bold')
          doc.setFontSize(7.2)
          doc.setTextColor(55, 65, 81)
          doc.text(label, tableX + 7, currentY + 5)

          // Value Pill / Highlight Text
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(7.6)

          const valLower = val.toLowerCase()
          if (valLower.includes('active') || valLower.includes('100%') || valLower.includes('healthy') || valLower.includes('verified')) {
            // Emerald Accent for active/verified
            doc.setFillColor(236, 253, 245)
            doc.roundedRect(tableX + col1W + 3, currentY + 1.2, tableW - col1W - 6, 5, 1, 1, 'F')
            doc.setDrawColor(167, 243, 208)
            doc.roundedRect(tableX + col1W + 3, currentY + 1.2, tableW - col1W - 6, 5, 1, 1, 'S')
            doc.setTextColor(6, 95, 70)
          } else if (valLower.includes('0 ') || valLower.includes('shortage')) {
            // Amber Neutral Accent
            doc.setFillColor(254, 243, 199)
            doc.roundedRect(tableX + col1W + 3, currentY + 1.2, tableW - col1W - 6, 5, 1, 1, 'F')
            doc.setDrawColor(253, 230, 138)
            doc.roundedRect(tableX + col1W + 3, currentY + 1.2, tableW - col1W - 6, 5, 1, 1, 'S')
            doc.setTextColor(146, 64, 14)
          } else {
            doc.setTextColor(7, 26, 61)
          }

          const splitVal = doc.splitTextToSize(val, tableW - col1W - 10)
          doc.text(splitVal, tableX + col1W + 5, currentY + 4.8)
        } else {
          // Regular Line Card
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(7.5)
          doc.setTextColor(30, 40, 55)
          const splitText = doc.splitTextToSize(cleanLine, tableW - 10)
          doc.text(splitText, tableX + 5, currentY + 5)
        }

        currentY += rowHeight
      }

      currentY += 4
    }
  }

  // 6. Verification Seal & 3-Column Signatures
  // Ensure it fits gracefully on current page or clean bottom
  let sigY = currentY + 3
  if (sigY > pageHeight - 36) {
    sigY = pageHeight - 36
  }

  doc.setDrawColor(215, 225, 240)
  doc.setLineWidth(0.3)
  doc.line(marginX, sigY, marginX + contentW, sigY)

  const sigColWidth = contentW / 3

  // Col 1: System Admin / Class Advisor
  doc.setFontSize(7.2)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text('PREPARED & VERIFIED BY', marginX + sigColWidth / 2, sigY + 5, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(110, 125, 145)
  doc.text('System Administrator / Class Advisor', marginX + sigColWidth / 2, sigY + 9, { align: 'center' })
  doc.text('Department of AI & DS', marginX + sigColWidth / 2, sigY + 12.5, { align: 'center' })

  // Col 2: Head of Department
  doc.setFontSize(7.2)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text('HEAD OF DEPARTMENT', marginX + sigColWidth * 1.5, sigY + 5, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(110, 125, 145)
  doc.text('Dr. S. Karthik, M.E., Ph.D.', marginX + sigColWidth * 1.5, sigY + 9, { align: 'center' })
  doc.text('Professor & Department Head', marginX + sigColWidth * 1.5, sigY + 12.5, { align: 'center' })

  // Col 3: Principal & Institutional Seal
  doc.setFontSize(7.2)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text('PRINCIPAL / COE (AUTONOMOUS)', marginX + sigColWidth * 2.5, sigY + 5, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(110, 125, 145)
  doc.text('V.S.B. Engineering College', marginX + sigColWidth * 2.5, sigY + 9, { align: 'center' })
  doc.text('Official Digital Institutional Seal', marginX + sigColWidth * 2.5, sigY + 12.5, { align: 'center' })

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

  // 5 Clean Categories
  const barCategories = [
    { label: 'Category A', title: 'Total Students', short: 'Total Students', value: options.totalStudents, color: [225, 29, 72] }, // Red
    { label: 'Category B', title: 'Absents (A)', short: 'Absents (A)', value: options.totalAbsents, color: [249, 115, 22] }, // Orange
    { label: 'Category C', title: 'Medical (ML)', short: 'Medical (ML)', value: options.totalMLs, color: [245, 158, 11] }, // Yellow
    { label: 'Category D', title: 'On-Duty (OD)', short: 'On-Duty (OD)', value: options.totalODs, color: [16, 185, 129] }, // Green
    { label: 'Category E', title: 'Presents (P)', short: 'Presents (P)', value: options.totalPresents, color: [37, 99, 235] }, // Blue
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

  // 5. OFFICIAL SIGNATURES
  const finalY = Math.max(currentY + 2, pageHeight - 32)
  doc.setDrawColor(215, 225, 240)
  doc.setLineWidth(0.3)
  doc.line(15, finalY, pageWidth - 15, finalY)

  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text('Faculty Class Advisor', 25, finalY + 5.5)
  doc.text('Head of Department (AI & DS)', pageWidth / 2, finalY + 5.5, { align: 'center' })
  doc.text('Controller of Examinations', pageWidth - 25, finalY + 5.5, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.8)
  doc.setTextColor(120, 130, 145)
  doc.text('Verified Analytics Copy', 25, finalY + 9.5)
  doc.text('V.S.B. Engineering College', pageWidth / 2, finalY + 9.5, { align: 'center' })
  doc.text('Authorized Institutional Seal', pageWidth - 25, finalY + 9.5, { align: 'right' })

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
  profileImage?: string
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

  try {
    doc.addImage(VSB_LOGO_BASE64, 'PNG', 6, 6, 20, 20)
  } catch (e) {
    console.error('Failed to embed logo in student card:', e)
  }

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

  if (student.profileImage && student.profileImage.startsWith('data:image')) {
    try {
      const imgFormat = student.profileImage.includes('png') ? 'PNG' : 'JPEG'
      doc.addImage(student.profileImage, imgFormat, width / 2 - 13.5, 46.5, 27, 27)
    } catch {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(7, 26, 61)
      doc.text(student.name.charAt(0) || 'K', width / 2, 63, { align: 'center' })
    }
  } else {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(7, 26, 61)
    doc.text(student.name.charAt(0) || 'K', width / 2, 63, { align: 'center' })
  }

  // Name & Reg No
  doc.setFontSize(11.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(student.name, width / 2, 77, { align: 'center' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(20, 85, 217)
  doc.text(`REG NO: ${student.registerNumber}`, width / 2, 86, { align: 'center' })

  // Details Table
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(8, 90, width - 16, 68, 2, 2, 'F')
  doc.setDrawColor(230, 235, 245)
  doc.roundedRect(8, 90, width - 16, 68, 2, 2, 'S')

  const items = [
    ['PROGRAM:', student.degreeProgram],
    ['REGULATION:', student.regulation],
    ['BATCH:', student.batch],
    ['YEAR & SEM:', `Year ${student.year} / Sem ${student.semester} (Sec ${student.section})`],
    ['COLLEGE EMAIL:', student.email],
    ['PHONE:', student.phone],
    ['DATE OF BIRTH:', student.dob],
    ['BLOOD GROUP:', student.bloodGroup],
    ['RESIDENCY:', student.residencyStatus],
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
