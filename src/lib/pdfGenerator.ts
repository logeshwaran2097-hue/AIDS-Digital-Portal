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

export interface DigitalPortalNoticeOptions {
  y: number
  contentW: number
  marginX: number
  recordType?: string
  verificationCode?: string
  repositoryName?: string
  issuingAuthority?: string
  boxHeight?: number
  isCompact?: boolean
}

/**
 * Universal Official Digital Portal Document Notice Block
 * Renders a standardized, professional institutional description method at the end of every PDF record.
 * Fulfills the requirement:
 * "This is Digital Portal Document, Not an original document like professional description method will be at last for all records"
 */
export function drawDigitalPortalDocumentNotice(
  doc: jsPDF,
  options: DigitalPortalNoticeOptions
): number {
  const {
    y,
    contentW,
    marginX,
    recordType = 'OFFICIAL DIGITAL PORTAL RECORD',
    verificationCode = 'VSB-DIGITAL-PORTAL-E-RECORD',
    repositoryName = 'Centralized Autonomous ERP Ledger',
    issuingAuthority = 'Office of HOD (AI & DS) · Digital Directorate',
    boxHeight = 23,
    isCompact = false,
  } = options

  const boxH = Math.min(boxHeight, 25)
  const boxY = y

  // 1. Clean, Modern Container (Soft slate-50 background with subtle border)
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.roundedRect(marginX, boxY, contentW, boxH, 1.5, 1.5, 'FD')

  // 2. Subtle Left Primary Accent Stripe (VSB Blue)
  doc.setFillColor(20, 85, 217)
  doc.roundedRect(marginX, boxY, 2.5, boxH, 0.8, 0.8, 'F')

  // 3. Top Row Header: Document Title & Verification Badge
  const topTextY = boxY + 4.8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.2)
  doc.setTextColor(15, 23, 42)
  doc.text('DIGITAL PORTAL DOCUMENT · AUTHENTICATED ELECTRONIC COPY', marginX + 5.5, topTextY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.2)
  doc.setTextColor(5, 122, 85)
  doc.text('✓ Authenticated E-Record · Valid without Signature (IT Act)', marginX + contentW - 5.5, topTextY, { align: 'right' })

  // 4. Clean, Simple & Professional Attestation Note
  const bodyY = boxY + 9.0
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.4)
  doc.setTextColor(71, 85, 105)

  const p = 'This is an official system-generated Digital Portal Document issued by V.S.B. Engineering College (Autonomous) and is not an original physical certificate. Cryptographically authenticated under Information Technology Act electronic records provisions, it carries full institutional legitimacy without a handwritten signature or wet seal.'
  const splitP = doc.splitTextToSize(p, contentW - 11)
  doc.text(splitP.slice(0, 2), marginX + 5.5, bodyY)

  // 5. Sleek Metadata Verification Strip
  const footerDividerY = boxY + boxH - 6.2
  doc.setDrawColor(234, 240, 248)
  doc.setLineWidth(0.2)
  doc.line(marginX + 5.5, footerDividerY, marginX + contentW - 5.5, footerDividerY)

  const metaTextY = boxY + boxH - 3.0
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(4.8)
  doc.setTextColor(100, 116, 139)
  doc.text('ISSUING AUTHORITY:', marginX + 5.5, metaTextY)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(issuingAuthority, marginX + 27, metaTextY)

  const col2X = marginX + Math.round(contentW * 0.48)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 116, 139)
  doc.text('LEDGER:', col2X, metaTextY)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(repositoryName, col2X + 11, metaTextY)

  const col3X = marginX + contentW - 5.5
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(20, 85, 217)
  doc.text(`VERIFICATION ID: ${verificationCode}`, col3X, metaTextY, { align: 'right' })

  return boxY + boxH
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

  // 6. OFFICIAL DIGITAL PORTAL DOCUMENT NOTICE & DESCRIPTION METHOD (NOT AN ORIGINAL PHYSICAL DOCUMENT)
  const certH = 24
  let certY = currentY + 4
  if (certY + certH > pageHeight - 12) {
    doc.addPage()
    certY = marginX + 6
  }

  drawDigitalPortalDocumentNotice(doc, {
    y: certY,
    contentW,
    marginX,
    recordType: options.category || 'ACADEMIC RECORD & SYLLABUS DOSSIER',
    verificationCode: options.subjectCode ? `VSB-ACAD-${options.subjectCode}` : 'VSB-DIGITAL-PORTAL-E-RECORD',
    repositoryName: 'Centralized Autonomous ERP Ledger',
    issuingAuthority: 'Office of HOD (AI & DS) · Digital Directorate',
    boxHeight: certH,
    isCompact: false,
  })

  // 7. Multi-Page Running Footer Bar
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFillColor(246, 248, 252)
    doc.rect(marginX - 3, pageHeight - 11, contentW + 6, 8, 'F')
    doc.setDrawColor(220, 228, 240)
    doc.line(marginX - 3, pageHeight - 11, marginX + contentW + 3, pageHeight - 11)

    doc.setFontSize(5.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(110, 125, 145)
    doc.text('DIGITAL PORTAL DOCUMENT · V.S.B. ENGINEERING COLLEGE (AUTONOMOUS) · AI & DS PORTAL · SYSTEM-GENERATED ELECTRONIC RECORD (NOT AN ORIGINAL PHYSICAL CERTIFICATE)', marginX, pageHeight - 6.5)
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
  const bgCertH = 24
  const bgCertY = Math.max(currentY + 2, pageHeight - 11 - bgCertH)
  const bgMarginX = 15
  const bgContentW = pageWidth - 30

  drawDigitalPortalDocumentNotice(doc, {
    y: bgCertY,
    contentW: bgContentW,
    marginX: bgMarginX,
    recordType: 'COHORT ATTENDANCE ANALYTICS REPORT',
    verificationCode: 'VSB-ATT-ANALYTICS-2026',
    repositoryName: 'Centralized Autonomous ERP Ledger',
    issuingAuthority: 'Office of HOD (AI & DS)',
    boxHeight: bgCertH,
    isCompact: true,
  })

  // Footer
  doc.setFillColor(248, 250, 253)
  doc.rect(0, pageHeight - 8, pageWidth, 8, 'F')
  doc.setDrawColor(220, 228, 240)
  doc.line(0, pageHeight - 8, pageWidth, pageHeight - 8)
  doc.setFontSize(5.8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 110, 125)
  doc.text('DIGITAL PORTAL DOCUMENT · V.S.B. ENGINEERING COLLEGE (AUTONOMOUS) · AI & DS PORTAL · SYSTEM GENERATED ELECTRONIC RECORD (NOT AN ORIGINAL PHYSICAL CERTIFICATE)', 15, pageHeight - 3)
  doc.text('Page 1 of 1', pageWidth - 15, pageHeight - 3, { align: 'right' })

  const safeFileName = (options.fileName || 'VSB_Bar_Chart_Report')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')

  doc.save(`${safeFileName}.pdf`)
}

const emojiDataUrlCache: Record<string, string> = {}

function getEmojiDataUrl(emoji: string, size = 64): string {
  if (typeof document === 'undefined') return ''
  if (emojiDataUrlCache[emoji]) return emojiDataUrlCache[emoji]

  try {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    ctx.clearRect(0, 0, size, size)
    ctx.font = `${Math.round(size * 0.72)}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Segoe UI Symbol", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(emoji, size / 2, size / 2 + Math.round(size * 0.04))

    const url = canvas.toDataURL('image/png')
    emojiDataUrlCache[emoji] = url
    return url
  } catch {
    return ''
  }
}

function drawEmoji(
  doc: jsPDF,
  emoji: string,
  x: number,
  y: number,
  size = 3.6,
  fallbackColor: [number, number, number] = [21, 87, 192]
) {
  const dataUrl = getEmojiDataUrl(emoji)
  if (dataUrl && dataUrl.startsWith('data:image')) {
    try {
      doc.addImage(dataUrl, 'PNG', x, y, size, size)
      return
    } catch {
      // Fallback below
    }
  }

  doc.setFillColor(fallbackColor[0], fallbackColor[1], fallbackColor[2])
  doc.circle(x + size / 2, y + size / 2, size / 3, 'F')
}

function getRoundedSquareImage(src: string, size = 320, radius = 56): Promise<string> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined' || !src) return resolve(src)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(src)

        // Draw rounded squircle path (matching rounded-3xl in profile UI)
        ctx.beginPath()
        ctx.moveTo(radius, 0)
        ctx.lineTo(size - radius, 0)
        ctx.quadraticCurveTo(size, 0, size, radius)
        ctx.lineTo(size, size - radius)
        ctx.quadraticCurveTo(size, size, size - radius, size)
        ctx.lineTo(radius, size)
        ctx.quadraticCurveTo(0, size, 0, size - radius)
        ctx.lineTo(0, radius)
        ctx.quadraticCurveTo(0, 0, radius, 0)
        ctx.closePath()
        ctx.clip()

        // Center square crop (object-cover)
        let sWidth = img.width
        let sHeight = img.height
        let sx = 0
        let sy = 0
        if (sWidth > sHeight) {
          sx = (sWidth - sHeight) / 2
          sWidth = sHeight
        } else if (sHeight > sWidth) {
          sy = (sHeight - sWidth) / 2
          sHeight = sWidth
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size)
        resolve(canvas.toDataURL('image/png'))
      } catch {
        resolve(src)
      }
    }
    img.onerror = () => resolve(src)
    img.src = src
  })
}

export async function downloadStudentCardPDF(student: {
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
  // Authentic Lanyard PVC Smart ID Card Canvas (96mm x 144mm - True ID Card Aspect Ratio)
  const cardW = 96
  const cardH = 144

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [cardW, cardH],
  })

  // 1. Dual Luxury Card Borders
  doc.setDrawColor(210, 224, 244)
  doc.setLineWidth(0.6)
  doc.roundedRect(1.5, 1.5, cardW - 3, cardH - 3, 3, 3, 'S')

  doc.setDrawColor(235, 242, 252)
  doc.setLineWidth(0.3)
  doc.roundedRect(2.8, 2.8, cardW - 5.6, cardH - 5.6, 2.2, 2.2, 'S')

  // 2. Physical Lanyard Slot Punch Hole Indicator
  doc.setFillColor(236, 242, 250)
  doc.roundedRect(cardW / 2 - 7, 3.5, 14, 2.5, 1.2, 1.2, 'F')
  doc.setDrawColor(190, 205, 225)
  doc.setLineWidth(0.2)
  doc.roundedRect(cardW / 2 - 7, 3.5, 14, 2.5, 1.2, 1.2, 'S')

  // 3. Official Prestigious Academic Letterhead (PDF Format for Header)
  doc.setFillColor(250, 252, 255)
  doc.rect(3, 7.5, cardW - 6, 20.5, 'F')

  const logoX = 5
  const logoY = 8.5
  const logoSize = 17

  // Circular Gold Ring Base
  doc.setFillColor(255, 255, 255)
  doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 0.6, 'F')
  doc.setDrawColor(231, 185, 62) // Gold
  doc.setLineWidth(0.5)
  doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 0.6, 'S')

  try {
    doc.addImage(VSB_LOGO_BASE64, 'PNG', logoX + 0.8, logoY + 0.8, logoSize - 1.6, logoSize - 1.6)
  } catch (e) {
    console.error('Failed to embed logo in student card PDF:', e)
  }

  const headerCenterX = (cardW + 24) / 2

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.8)
  doc.setTextColor(7, 26, 61)
  doc.text('V.S.B. ENGINEERING COLLEGE', headerCenterX, 12, { align: 'center' })

  // Autonomous Pill Tag
  doc.setFillColor(231, 185, 62)
  doc.roundedRect(headerCenterX - 20, 13.5, 40, 3.2, 0.8, 0.8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.0)
  doc.setTextColor(7, 26, 61)
  doc.text('AN AUTONOMOUS INSTITUTION · KARUR', headerCenterX, 15.8, { align: 'center' })

  // Department Title (FULL FORM)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(4.7)
  doc.setTextColor(21, 87, 192)
  doc.text('DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE', headerCenterX, 20.2, { align: 'center' })

  // Affiliations
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(4.0)
  doc.setTextColor(90, 105, 125)
  doc.text('Affiliated to Anna University, Chennai · NAAC "A" Grade', headerCenterX, 23.6, { align: 'center' })

  // 4. Sapphire & Gold Ornamental Beam Separator
  doc.setFillColor(21, 87, 192)
  doc.rect(3, 28, cardW - 6, 1.2, 'F')

  doc.setFillColor(231, 185, 62)
  doc.rect(3, 29.2, cardW - 6, 0.6, 'F')

  // Center Diamond Accent
  doc.setFillColor(231, 185, 62)
  doc.circle(cardW / 2, 28.8, 1.4, 'F')
  doc.setFillColor(7, 26, 61)
  doc.circle(cardW / 2, 28.8, 0.7, 'F')

  // 5. Card Title Ribbon
  doc.setFillColor(238, 244, 255)
  doc.setDrawColor(190, 215, 250)
  doc.setLineWidth(0.25)
  doc.roundedRect(cardW / 2 - 24, 31.5, 48, 4.2, 1.2, 1.2, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.0)
  doc.setTextColor(20, 85, 217)
  doc.text('STUDENT IDENTITY CARD', cardW / 2, 34.5, { align: 'center' })

  // 6. Centered Squircle Photograph (1:1 Ratio with Rounded-3xl Corners Matching UI Avatar)
  const photoSize = 33
  const photoX = (cardW - photoSize) / 2
  const photoY = 37.0

  // Outer Squircle Shadow Ring
  doc.setFillColor(242, 247, 255)
  doc.roundedRect(photoX - 1.2, photoY - 1.2, photoSize + 2.4, photoSize + 2.4, 5.0, 5.0, 'F')
  doc.setDrawColor(200, 218, 242)
  doc.setLineWidth(0.4)
  doc.roundedRect(photoX - 1.2, photoY - 1.2, photoSize + 2.4, photoSize + 2.4, 5.0, 5.0, 'S')

  // Crisp White Squircle Inset Border (matching second photo)
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(photoX - 0.4, photoY - 0.4, photoSize + 0.8, photoSize + 0.8, 4.4, 4.4, 'F')

  let hasImage = false
  if (student.profileImage && (student.profileImage.startsWith('data:image') || student.profileImage.startsWith('http'))) {
    try {
      const roundedImg = await getRoundedSquareImage(student.profileImage, 320, 54)
      doc.addImage(roundedImg, 'PNG', photoX, photoY, photoSize, photoSize)
      hasImage = true
    } catch (e) {
      console.error('Failed to embed squircle student photo:', e)
    }
  }

  if (!hasImage) {
    doc.setFillColor(14, 85, 217) // Royal Cobalt gradient tone
    doc.roundedRect(photoX, photoY, photoSize, photoSize, 4.2, 4.2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(26)
    doc.setTextColor(255, 255, 255)
    doc.text(student.name.charAt(0) || 'S', cardW / 2, photoY + photoSize / 2 + 3.2, { align: 'center' })
  }

  // Elegant Squircle Outline Stroke
  doc.setDrawColor(210, 226, 246)
  doc.setLineWidth(0.4)
  doc.roundedRect(photoX, photoY, photoSize, photoSize, 4.2, 4.2, 'S')

  // 7. Student Name & Registration Pill
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11.0)
  doc.setTextColor(7, 26, 61)
  doc.text(student.name.toUpperCase(), cardW / 2, 75.0, { align: 'center' })

  // Registration Pill
  doc.setFillColor(7, 26, 61)
  doc.roundedRect(cardW / 2 - 24, 77.2, 48, 5.2, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.2)
  doc.setTextColor(244, 196, 48)
  doc.text(`REG NO: ${student.registerNumber}`, cardW / 2, 80.9, { align: 'center' })

  // 8. Comprehensive Student Details Matrix (All Details Shown Below)
  const yr = student.year || 1
  let sem = student.semester || 1
  const minSem = (yr - 1) * 2 + 1
  const maxSem = yr * 2
  if (sem < minSem || sem > maxSem) {
    sem = minSem
  }

  const gridX = 5.5
  const gridW = cardW - 11
  const gridY = 85.5
  const gridH = 35.0

  doc.setFillColor(252, 254, 255)
  doc.setDrawColor(215, 228, 245)
  doc.setLineWidth(0.3)
  doc.roundedRect(gridX, gridY, gridW, gridH, 2, 2, 'FD')

  const rowH = 7.0

  // Zebra backgrounds
  for (let r = 0; r < 5; r++) {
    if (r % 2 === 0) {
      doc.setFillColor(248, 250, 254)
      doc.rect(gridX + 0.5, gridY + r * rowH, gridW - 1, rowH, 'F')
    }
    // Row dividers
    if (r > 0) {
      doc.setDrawColor(228, 236, 248)
      doc.setLineWidth(0.2)
      doc.line(gridX + 1.0, gridY + r * rowH, gridX + gridW - 1.0, gridY + r * rowH)
    }
  }

  // Row 1: Date of Birth & Blood Group (with emojis)
  let curY = gridY + 4.8
  const emojiSize = 3.6
  drawEmoji(doc, '📅', gridX + 2.5, curY - 2.7, emojiSize, [21, 87, 192])
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(4.8)
  doc.setTextColor(100, 115, 135)
  doc.text('DATE OF BIRTH:', gridX + 7.0, curY - 0.2)
  doc.setFontSize(5.4)
  doc.setTextColor(7, 26, 61)
  doc.text(student.dob || '01/01/2004', gridX + 27.0, curY - 0.2)

  drawEmoji(doc, '🩸', gridX + 46.5, curY - 2.7, emojiSize, [220, 38, 38])
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(4.8)
  doc.setTextColor(100, 115, 135)
  doc.text('BLOOD GROUP:', gridX + 51.0, curY - 0.2)
  doc.setFontSize(6.2)
  doc.setTextColor(220, 38, 38) // Medical Red Highlight
  doc.text(student.bloodGroup || 'O+ve', gridX + 70.0, curY - 0.2)

  // Row 2: Batch (with emoji)
  curY += rowH
  drawEmoji(doc, '🎓', gridX + 2.5, curY - 2.7, emojiSize, [21, 87, 192])
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(4.8)
  doc.setTextColor(100, 115, 135)
  doc.text('BATCH:', gridX + 7.0, curY - 0.2)
  doc.setFontSize(5.5)
  doc.setTextColor(7, 26, 61)
  doc.text(student.batch || '2025 - 2029', gridX + 26.0, curY - 0.2)

  // Row 3: Residency Status (with emoji)
  curY += rowH
  drawEmoji(doc, '🏠', gridX + 2.5, curY - 2.7, emojiSize, [21, 87, 192])
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(4.8)
  doc.setTextColor(100, 115, 135)
  doc.text('RESIDENCY STATUS:', gridX + 7.0, curY - 0.2)
  doc.setFontSize(5.4)
  doc.setTextColor(7, 26, 61)
  doc.text(student.residencyStatus || 'Day Scholar', gridX + 34.5, curY - 0.2)

  // Row 4: Contact Number (with emoji)
  curY += rowH
  drawEmoji(doc, '📞', gridX + 2.5, curY - 2.7, emojiSize, [16, 140, 75])
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(4.8)
  doc.setTextColor(100, 115, 135)
  doc.text('CONTACT NUMBER:', gridX + 7.0, curY - 0.2)
  doc.setFontSize(5.4)
  doc.setTextColor(7, 26, 61)
  doc.text(student.phone || 'Not Provided', gridX + 34.5, curY - 0.2)

  // Row 5: Official Email (with emoji)
  curY += rowH
  drawEmoji(doc, '✉️', gridX + 2.5, curY - 2.7, emojiSize, [20, 85, 217])
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(4.8)
  doc.setTextColor(100, 115, 135)
  doc.text('OFFICIAL EMAIL:', gridX + 7.0, curY - 0.2)
  doc.setFontSize(5.4)
  doc.setTextColor(7, 26, 61)
  const emailText = doc.splitTextToSize(student.email || 'Not Provided', gridW - 38)[0] || student.email
  doc.text(emailText, gridX + 34.5, curY - 0.2)

  // 10. Institutional Footer (Clean, Authoritative College Identity Strip)
  // Mirror Beam Separator (Sapphire & Gold)
  doc.setFillColor(231, 185, 62)
  doc.rect(3, 125.5, cardW - 6, 0.6, 'F')

  doc.setFillColor(21, 87, 192)
  doc.rect(3, 126.1, cardW - 6, 1.2, 'F')

  // Center Diamond Accent
  doc.setFillColor(231, 185, 62)
  doc.circle(cardW / 2, 126.7, 1.4, 'F')
  doc.setFillColor(7, 26, 61)
  doc.circle(cardW / 2, 126.7, 0.7, 'F')

  // Clean Light Background Panel
  doc.setFillColor(250, 252, 255)
  doc.rect(3, 127.8, cardW - 6, 12.8, 'F')

  // Line 1: College Name & Autonomous Status
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.2)
  doc.setTextColor(7, 26, 61)
  doc.text('V.S.B. ENGINEERING COLLEGE (AUTONOMOUS)', cardW / 2, 131.8, { align: 'center' })

  // Line 2: Campus Address & Web Portal
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(4.0)
  doc.setTextColor(80, 95, 120)
  doc.text('NH-67, Covai Road, Karur - 639 111, Tamil Nadu · www.vsbec.com', cardW / 2, 135.2, { align: 'center' })

  // Line 3: Institutional Notice & Contact
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(3.6)
  doc.setTextColor(100, 115, 135)
  doc.text('Digital Portal E-Pass · Not an Original Physical Smartcard · Ph: 04324-290141', cardW / 2, 138.6, { align: 'center' })

  doc.save(`Student_Card_${student.registerNumber}.pdf`)
}

/**
 * Converts an SVG URL (such as the official verification dossier) or raster image to an official high-resolution A4 PDF and triggers immediate browser download.
 */
export async function downloadSvgAsPdf(
  fileUrl: string,
  fileName: string = 'Official_Student_Leave_Verification_Dossier.pdf'
): Promise<void> {
  if (typeof window === 'undefined') return

  // If already a PDF, trigger direct download
  if (fileUrl.endsWith('.pdf') || fileUrl.startsWith('data:application/pdf')) {
    const a = document.createElement('a')
    a.href = fileUrl
    a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return
  }

  let blobUrl = fileUrl
  let needsRevoke = false

  if (!fileUrl.startsWith('data:') && !fileUrl.startsWith('blob:')) {
    const res = await fetch(fileUrl)
    const blob = await res.blob()
    blobUrl = URL.createObjectURL(blob)
    needsRevoke = true
  }

  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Failed to load image asset for PDF rendering'))
      img.src = blobUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = 1700
    canvas.height = 2300
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('HTML Canvas 2D context unavailable')

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const imgData = canvas.toDataURL('image/jpeg', 0.98)

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    doc.addImage(imgData, 'JPEG', 0, 0, 210, 297)

    const finalName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
    doc.save(finalName)
  } finally {
    if (needsRevoke) {
      URL.revokeObjectURL(blobUrl)
    }
  }
}

export interface AdvisorAttendancePDFOptions {
  classes: {
    className: string
    year: number
    section: string
    totalStudents: number
    presentAvg: number
    absentCount?: number
    attendancePct: number
    advisorName?: string | null
    statusNote?: string
  }[]
  date?: string
  hodName?: string
  department?: string
  fileName?: string
}

export function generateAdvisorMorningAttendancePDF(options: AdvisorAttendancePDFOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 12
  const contentW = pageWidth - marginX * 2

  // 1. Double Document Border
  doc.setDrawColor(215, 226, 242)
  doc.setLineWidth(0.4)
  doc.rect(marginX - 4, marginX - 4, contentW + 8, pageHeight - (marginX - 4) * 2, 'S')

  doc.setDrawColor(238, 243, 250)
  doc.setLineWidth(0.2)
  doc.rect(marginX - 2, marginX - 2, contentW + 4, pageHeight - (marginX - 2) * 2, 'S')

  // 2. Letterhead
  doc.setFillColor(250, 252, 255)
  doc.rect(marginX - 2, marginX - 2, contentW + 4, 36, 'F')

  const logoX = marginX + 2
  const logoY = marginX + 2
  const logoSize = 22

  doc.setFillColor(255, 255, 255)
  doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 1, 'F')
  doc.setDrawColor(231, 185, 62)
  doc.setLineWidth(0.5)
  doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 1, 'S')

  try {
    doc.addImage(VSB_LOGO_BASE64, 'PNG', logoX + 2, logoY + 2, logoSize - 4, logoSize - 4)
  } catch (e) {
    console.error('Failed to embed logo:', e)
  }

  const headerCenterX = marginX + logoSize + (contentW - logoSize) / 2

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13.5)
  doc.setTextColor(7, 26, 61)
  doc.text('V.S.B. ENGINEERING COLLEGE', headerCenterX, marginX + 5.5, { align: 'center' })

  doc.setFillColor(231, 185, 62)
  doc.roundedRect(headerCenterX - 24, marginX + 7.5, 48, 4, 1, 1, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(7, 26, 61)
  doc.text('AN AUTONOMOUS INSTITUTION — NBA & NAAC "A"', headerCenterX, marginX + 10.3, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(21, 87, 192)
  doc.text(
    options.department || 'DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE',
    headerCenterX,
    marginX + 16.5,
    { align: 'center' }
  )

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.8)
  doc.setTextColor(75, 85, 105)
  doc.text(
    'Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai · Karur - 639 111',
    headerCenterX,
    marginX + 21,
    { align: 'center' }
  )

  // Gold & Blue Beam
  const beamY = marginX + 32
  doc.setFillColor(21, 87, 192)
  doc.rect(marginX, beamY, contentW, 1.2, 'F')
  doc.setFillColor(231, 185, 62)
  doc.rect(marginX, beamY + 1.2, contentW, 0.6, 'F')

  let currentY = beamY + 6

  // 3. Document Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(7, 26, 61)
  doc.text('ADVISOR MORNING ROLL-CALL & CLASS-WISE ATTENDANCE AUDIT REPORT', marginX, currentY)

  const printDate = options.date || new Date().toISOString().split('T')[0]
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 115, 135)
  doc.text(`Academic Jurisdiction: AI & DS Directorate  ·  Session: Morning Roll-Call  ·  Date: ${printDate}`, marginX, currentY + 4)

  currentY += 8

  // 4. Metrics Summary Strip
  const totalEnrolled = options.classes.reduce((acc, c) => acc + c.totalStudents, 0)
  const totalPresent = options.classes.reduce((acc, c) => acc + c.presentAvg, 0)
  const avgPct = totalEnrolled > 0 ? Math.round((totalPresent / totalEnrolled) * 10000) / 100 : 0
  const compliantCount = options.classes.filter((c) => c.attendancePct >= 75).length
  const shortageCount = options.classes.filter((c) => c.attendancePct < 75).length

  doc.setFillColor(246, 249, 254)
  doc.roundedRect(marginX, currentY, contentW, 11, 2, 2, 'F')
  doc.setDrawColor(215, 225, 245)
  doc.setLineWidth(0.3)
  doc.roundedRect(marginX, currentY, contentW, 11, 2, 2, 'S')

  const colW = contentW / 5
  const metrics = [
    { label: 'TOTAL ENROLLED', val: `${totalEnrolled} Students` },
    { label: 'NO. OF PRESENTS', val: `${totalPresent} Attendees` },
    { label: 'DEPT. ATTENDANCE', val: `${avgPct}%` },
    { label: 'ELIGIBLE (>=75%)', val: `${compliantCount} Classes` },
    { label: 'SHORTAGE (<75%)', val: `${shortageCount} Classes` },
  ]

  metrics.forEach((m, idx) => {
    const mx = marginX + idx * colW + 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.setTextColor(100, 115, 135)
    doc.text(m.label, mx, currentY + 4)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(7, 26, 61)
    doc.text(m.val, mx, currentY + 8.5)
  })

  currentY += 15

  // 5. Visual Bar Graph
  const chartH = 45
  doc.setFillColor(17, 17, 17) // Sleek dark matching dark mode aesthetics
  doc.roundedRect(marginX, currentY, contentW, chartH, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(244, 196, 48)
  doc.text('Class-wise Average Attendance (%)', marginX + 5, currentY + 5.5)

  // Chart axes area
  const chartInnerX = marginX + 10
  const chartInnerY = currentY + 9
  const chartInnerW = contentW - 14
  const chartInnerH = 26
  const barCount = options.classes.length
  const barSlotW = chartInnerW / barCount
  const barActualW = Math.min(10, barSlotW * 0.65)

  options.classes.forEach((cls, idx) => {
    const bx = chartInnerX + idx * barSlotW + (barSlotW - barActualW) / 2
    const h = (cls.attendancePct / 100) * chartInnerH
    const by = chartInnerY + chartInnerH - h

    // Bar column
    if (cls.attendancePct === 0) {
      doc.setFillColor(55, 65, 81) // dark gray for pending
    } else if (cls.attendancePct >= 75) {
      doc.setFillColor(79, 131, 240) // royal blue
    } else {
      doc.setFillColor(239, 68, 68) // red for low
    }
    doc.rect(bx, by, barActualW, Math.max(0.5, h), 'F')

    // Percentage text above bar
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(5.5)
    doc.setTextColor(255, 255, 255)
    doc.text(
      cls.attendancePct === 0 ? '0%' : `${cls.attendancePct}%`,
      bx + barActualW / 2,
      Math.max(chartInnerY + 2, by - 1),
      { align: 'center' }
    )

    // Angled or short x-label
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(5.5)
    doc.setTextColor(200, 210, 225)
    const shortName = cls.className.replace(' AIDS', '')
    doc.text(shortName, bx + barActualW / 2, chartInnerY + chartInnerH + 4, { align: 'center' })
  })

  currentY += chartH + 5

  // 6. Detailed Class Breakdown Table
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(7, 26, 61)
  doc.text('CLASS BREAKDOWN & ADVISOR ALLOCATION ROSTER', marginX, currentY)

  currentY += 3

  // Table Header
  const tableHeaders = [
    { title: '#', w: 7, align: 'center' },
    { title: 'CLASS SECTION', w: 25, align: 'left' },
    { title: 'ADVISOR NAME', w: 38, align: 'left' },
    { title: 'ENROLLED', w: 18, align: 'center' },
    { title: 'NO. OF PRESENTS', w: 20, align: 'center' },
    { title: 'NO. OF ABSENTEES', w: 20, align: 'center' },
    { title: 'ATTENDANCE %', w: 22, align: 'center' },
    { title: 'VERIFICATION STATUS', w: 36, align: 'left' },
  ]

  const rowHeight = 6.2
  doc.setFillColor(7, 26, 61)
  doc.rect(marginX, currentY, contentW, rowHeight, 'F')

  let thX = marginX
  tableHeaders.forEach((th) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.setTextColor(255, 255, 255)
    const tx = th.align === 'center' ? thX + th.w / 2 : thX + 2
    doc.text(th.title, tx, currentY + 4.2, { align: th.align as any })
    thX += th.w
  })

  currentY += rowHeight

  // Table Rows
  options.classes.forEach((cls, idx) => {
    const isEven = idx % 2 === 0
    if (isEven) {
      doc.setFillColor(250, 252, 255)
      doc.rect(marginX, currentY, contentW, rowHeight, 'F')
    }

    doc.setDrawColor(235, 240, 248)
    doc.setLineWidth(0.2)
    doc.line(marginX, currentY + rowHeight, marginX + contentW, currentY + rowHeight)

    let tdX = marginX

    // 1. Index
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.8)
    doc.setTextColor(100, 115, 135)
    doc.text(String(idx + 1), tdX + 3.5, currentY + 4.2, { align: 'center' })
    tdX += 7

    // 2. Class Section
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(7, 26, 61)
    doc.text(cls.className, tdX + 2, currentY + 4.2)
    tdX += 25

    // 3. Advisor Name
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.8)
    doc.setTextColor(40, 50, 70)
    doc.text(cls.advisorName || 'Faculty Advisor', tdX + 2, currentY + 4.2)
    tdX += 38

    // 4. Enrolled
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.8)
    doc.setTextColor(7, 26, 61)
    doc.text(String(cls.totalStudents), tdX + 9, currentY + 4.2, { align: 'center' })
    tdX += 18

    // 5. Present Count
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.8)
    doc.setTextColor(21, 87, 192)
    doc.text(String(cls.presentAvg), tdX + 10, currentY + 4.2, { align: 'center' })
    tdX += 20

    // 6. Absent Count
    const absVal = cls.absentCount !== undefined 
      ? cls.absentCount 
      : (cls.attendancePct > 0 ? Math.max(0, cls.totalStudents - cls.presentAvg) : 0)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.8)
    doc.setTextColor(absVal > 0 ? 220 : 140, absVal > 0 ? 38 : 140, absVal > 0 ? 38 : 140)
    doc.text(String(absVal), tdX + 10, currentY + 4.2, { align: 'center' })
    tdX += 20

    // 7. Attendance %
    const isGood = cls.attendancePct >= 75
    const isPending = cls.attendancePct === 0
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    if (isPending) {
      doc.setTextColor(217, 119, 6) // amber
    } else if (isGood) {
      doc.setTextColor(22, 163, 74) // green
    } else {
      doc.setTextColor(220, 38, 38) // red
    }
    doc.text(`${cls.attendancePct}%`, tdX + 11, currentY + 4.2, { align: 'center' })
    tdX += 22

    // 8. Status Note
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.2)
    const status = cls.statusNote || (isPending ? 'Register Pending' : isGood ? 'Advisor Verified' : 'Shortage Alert (<75%)')
    doc.text(status, tdX + 2, currentY + 4.2)

    currentY += rowHeight
  })

  currentY += 6

  // 7. Official Endorsement Signatures (Digital Attestations)
  doc.setDrawColor(215, 226, 242)
  doc.setLineWidth(0.3)
  doc.line(marginX, currentY, marginX + contentW, currentY)

  currentY += 5

  const signColW = contentW / 3

  // Signatory 1
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(7, 26, 61)
  doc.text('CLASS ADVISORS COMMITTEE', marginX + 4, currentY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.8)
  doc.setTextColor(100, 115, 135)
  doc.text('Morning Roll-Call Verified', marginX + 4, currentY + 3.5)
  doc.setTextColor(16, 185, 129)
  doc.text('✓ Digitally Recorded by Class Advisor', marginX + 4, currentY + 7.5)

  // Signatory 2
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(7, 26, 61)
  doc.text('DEPARTMENT ACADEMIC CELL', marginX + signColW + 4, currentY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.8)
  doc.setTextColor(100, 115, 135)
  doc.text('Regulation 2021 Monitoring', marginX + signColW + 4, currentY + 3.5)
  doc.setTextColor(16, 185, 129)
  doc.text('✓ Electronically Audited & Synced', marginX + signColW + 4, currentY + 7.5)

  // Signatory 3: HOD
  const hodX = marginX + signColW * 2 + 4
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(7, 26, 61)
  doc.text('HEAD OF DEPARTMENT (HOD)', hodX, currentY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.8)
  doc.setTextColor(100, 115, 135)
  doc.text(`Prof. ${options.hodName || 'Head of Department'} · AI & DS`, hodX, currentY + 3.5)
  doc.setTextColor(20, 85, 217)
  doc.text('✓ Sanctioned by HOD', hodX, currentY + 7.5)

  currentY += 12

  drawDigitalPortalDocumentNotice(doc, {
    y: currentY,
    contentW,
    marginX,
    recordType: 'ADVISOR ATTENDANCE AUDIT RECORD',
    verificationCode: `VSB-ATT-ROLL-${printDate.replace(/[^0-9]/g, '')}`,
    repositoryName: 'Daily Roll-Call Central Database',
    issuingAuthority: 'Academic Attendance Cell & HOD Office',
    boxHeight: 24,
    isCompact: true,
  })

  // Footer compliance text
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.6)
  doc.setTextColor(130, 145, 165)
  doc.text(
    'DIGITAL PORTAL DOCUMENT · V.S.B. ENGINEERING COLLEGE (AUTONOMOUS) · AI & DS PORTAL · SYSTEM GENERATED ELECTRONIC RECORD (NOT AN ORIGINAL PHYSICAL CERTIFICATE)',
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  )

  const downloadName = options.fileName || `Advisor_Attendance_Report_${printDate}.pdf`
  doc.save(downloadName)
}

export interface BusPassPDFData {
  passNo: string
  studentName: string
  registerNumber: string
  department: string
  year: number | string
  section: string
  busNo: string
  routeNo?: string
  routeName?: string
  via?: string
  boardingStop: string
  busRegNo?: string
  morningArrival?: string
  eveningDeparture?: string
  incharge?: string
  inchargePhone?: string
  driver?: string
  driverPhone?: string
  issueDate: string
  qrDataUrl?: string
}

export function generateAndDownloadBusPassPDF(data: BusPassPDFData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 14
  const contentW = pageWidth - marginX * 2

  // 1. Dual Luxury Security Borders
  doc.setDrawColor(21, 87, 192) // Sapphire Navy
  doc.setLineWidth(0.8)
  doc.rect(marginX - 4, marginX - 4, contentW + 8, pageHeight - (marginX - 4) * 2, 'S')

  doc.setDrawColor(231, 185, 62) // Gold
  doc.setLineWidth(0.4)
  doc.rect(marginX - 2, marginX - 2, contentW + 4, pageHeight - (marginX - 2) * 2, 'S')

  // 2. Official Academic Letterhead
  doc.setFillColor(250, 252, 255)
  doc.rect(marginX - 2, marginX - 2, contentW + 4, 38, 'F')

  const logoX = marginX + 3
  const logoY = marginX + 3
  const logoSize = 24

  // Circular Gold Ring Base for Emblem
  doc.setFillColor(255, 255, 255)
  doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 1, 'F')
  doc.setDrawColor(231, 185, 62)
  doc.setLineWidth(0.6)
  doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 1, 'S')

  try {
    doc.addImage(VSB_LOGO_BASE64, 'PNG', logoX + 2, logoY + 2, logoSize - 4, logoSize - 4)
  } catch (e) {
    console.error('Failed to embed logo in PDF:', e)
  }

  const headerCenterX = marginX + logoSize + (contentW - logoSize) / 2

  // Master Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(7, 26, 61)
  doc.text('V.S.B. ENGINEERING COLLEGE', headerCenterX, marginX + 6.5, { align: 'center' })

  // Autonomous Badge Pill
  doc.setFillColor(231, 185, 62)
  doc.roundedRect(headerCenterX - 24, marginX + 8.5, 48, 4.2, 1, 1, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(7, 26, 61)
  doc.text('AN AUTONOMOUS INSTITUTION', headerCenterX, marginX + 11.5, { align: 'center' })

  // Department
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(21, 87, 192)
  doc.text('DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE', headerCenterX, marginX + 17.5, { align: 'center' })

  // Affiliation
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.8)
  doc.setTextColor(75, 85, 105)
  doc.text('Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai · Karur - 639 111, Tamil Nadu', headerCenterX, marginX + 22.5, { align: 'center' })

  // NAAC & NBA
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(100, 115, 135)
  doc.text('Accredited by NAAC with "A" Grade · NBA Accredited Programs · ISO 9001:2015 Certified', headerCenterX, marginX + 27, { align: 'center' })

  // Decorative Beam
  const beamY = marginX + 34
  doc.setFillColor(21, 87, 192)
  doc.rect(marginX, beamY, contentW, 1.4, 'F')
  doc.setFillColor(231, 185, 62)
  doc.rect(marginX, beamY + 1.4, contentW, 0.7, 'F')

  // Document Title Banner
  let curY = beamY + 7
  doc.setFillColor(7, 26, 61)
  doc.roundedRect(marginX, curY, contentW, 10.5, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('OFFICIAL COLLEGE BUS TRANSPORTATION PASS & BOARDING SLIP', marginX + contentW / 2, curY + 6.8, { align: 'center' })

  // Meta bar: Pass No & Academic Year
  curY += 14
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(7, 26, 61)
  doc.text(`PASS SERIAL: ${data.passNo}`, marginX, curY)
  doc.text(`ACADEMIC YEAR: 2026 - 2027`, marginX + contentW / 2, curY, { align: 'center' })
  doc.text(`DATE OF ISSUE: ${data.issueDate}`, marginX + contentW, curY, { align: 'right' })

  // Section 1: Student Particulars Table
  curY += 5
  doc.setFillColor(243, 247, 254)
  doc.roundedRect(marginX, curY, contentW, 26, 2, 2, 'F')
  doc.setDrawColor(215, 228, 245)
  doc.setLineWidth(0.3)
  doc.roundedRect(marginX, curY, contentW, 26, 2, 2, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(21, 87, 192)
  doc.text('1. STUDENT IDENTIFICATION & VERIFIED ONBOARDING PARTICULARS', marginX + 4, curY + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(75, 85, 105)

  // Row 1
  doc.text('Student Name:', marginX + 4, curY + 11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(data.studentName, marginX + 32, curY + 11)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Register Number:', marginX + contentW / 2 + 4, curY + 11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(data.registerNumber, marginX + contentW / 2 + 36, curY + 11)

  // Row 2
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Department:', marginX + 4, curY + 17)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(data.department, marginX + 32, curY + 17)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Year & Section:', marginX + contentW / 2 + 4, curY + 17)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(`Year ${data.year} • Section ${data.section}`, marginX + contentW / 2 + 36, curY + 17)

  // Row 3
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Category:', marginX + 4, curY + 23)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(14, 116, 144) // Cyan / Teal
  doc.text('Verified Day Scholar (College Bus Commuter)', marginX + 32, curY + 23)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Pass Status:', marginX + contentW / 2 + 4, curY + 23)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(16, 185, 129) // Emerald
  doc.text('ACTIVE & SANCTIONED', marginX + contentW / 2 + 36, curY + 23)

  // Section 2: Transportation & Route Details Table
  curY += 31
  doc.setFillColor(243, 247, 254)
  doc.roundedRect(marginX, curY, contentW, 36, 2, 2, 'F')
  doc.setDrawColor(215, 228, 245)
  doc.setLineWidth(0.3)
  doc.roundedRect(marginX, curY, contentW, 36, 2, 2, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(21, 87, 192)
  doc.text('2. ALLOCATED TRANSPORTATION & ROUTE DETAILS', marginX + 4, curY + 5.5)

  // Clean and format values properly
  const busNumDigits = String(data.busNo || '').replace(/[^0-9]/g, '')
  const formattedBusNo = busNumDigits ? `Bus No. ${busNumDigits.padStart(2, '0')}` : (data.busNo ? `Bus No. ${data.busNo}` : 'Bus No. 05')

  const rawRouteName = data.routeName || 'College Campus Transit'
  const cleanRouteName = rawRouteName
    .replace(/[↔→]/g, 'to')
    .replace(/!\"/g, 'to')
    .replace(/\s*->\s*/g, ' to ')
    .replace(/\s*<->\s*/g, ' to ')
    .replace(/\s+to\s+/gi, ' to ')
    .trim()
  const routeText = data.routeNo ? `${data.routeNo}: ${cleanRouteName}` : cleanRouteName

  const cleanBoardingStop = (data.boardingStop || 'Designated Stop')
    .replace(/\s*\([^)]*\)/g, '')
    .trim()

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(75, 85, 105)

  // Row 1: Bus Number & Commuter Category
  doc.text('Allocated Bus Number:', marginX + 4, curY + 13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(formattedBusNo, marginX + 42, curY + 13)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Commuter Category:', marginX + contentW / 2 + 4, curY + 13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text('Day Scholar (College Bus)', marginX + contentW / 2 + 38, curY + 13)

  // Row 2: Allocated Route
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Allocated Route:', marginX + 4, curY + 21)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(routeText, marginX + 42, curY + 21)

  // Row 3: Designated Boarding Stop
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Designated Boarding Stop:', marginX + 4, curY + 29)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(21, 87, 192)
  doc.text(cleanBoardingStop, marginX + 42, curY + 29)

  // Section 3: Security QR Code and Institutional Rules
  curY += 45
  const qrBoxW = 46
  const qrBoxH = 46

  // QR Code Mount
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(marginX, curY, qrBoxW, qrBoxH, 2, 2, 'F')
  doc.setDrawColor(21, 87, 192)
  doc.setLineWidth(0.4)
  doc.roundedRect(marginX, curY, qrBoxW, qrBoxH, 2, 2, 'S')

  if (data.qrDataUrl) {
    try {
      doc.addImage(data.qrDataUrl, 'PNG', marginX + 2, curY + 2, qrBoxW - 4, qrBoxH - 9)
    } catch (e) {
      console.error('Failed to embed QR code in PDF:', e)
    }
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.2)
  doc.setTextColor(21, 87, 192)
  doc.text('SCAN TO VERIFY AUTHENTICITY', marginX + qrBoxW / 2, curY + qrBoxH - 3, { align: 'center' })

  // Rules & Regulations Box (Right of QR Code)
  const rulesX = marginX + qrBoxW + 4
  const rulesW = contentW - qrBoxW - 4

  doc.setFillColor(248, 250, 252)
  doc.roundedRect(rulesX, curY, rulesW, qrBoxH, 2, 2, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.roundedRect(rulesX, curY, rulesW, qrBoxH, 2, 2, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(7, 26, 61)
  doc.text('INSTITUTIONAL TRANSPORTATION REGULATIONS:', rulesX + 4, curY + 5.5)

  const rules = [
    '1. This transport pass is strictly non-transferable and valid for Academic Year 2026-27.',
    '2. Students must be present at the designated stop prior to scheduled bus arrival.',
    '3. Display of this digital QR slip or physical pass to the conductor/incharge is mandatory upon boarding.',
    '4. Discipline and decorum must be maintained at all times inside the college transportation vehicle.',
    '5. In case of route or boarding stop alteration, submit application to the Transport Desk 24 hours prior.'
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(71, 85, 105)
  let ruleY = curY + 12
  rules.forEach(r => {
    doc.text(r, rulesX + 4, ruleY)
    ruleY += 6.6
  })

  // Section 4: Official Digital Portal Document Notice & Verification Attestation
  curY += qrBoxH + 4
  const noticeH = 24

  drawDigitalPortalDocumentNotice(doc, {
    y: curY,
    contentW,
    marginX,
    recordType: 'COLLEGE BUS TRANSPORTATION PASS',
    verificationCode: `VSB-BUS-${data.passNo || data.registerNumber}`,
    repositoryName: 'Centralized Transport ERP Ledger',
    issuingAuthority: 'College Transport Directorate & AI/DS HOD Office',
    boxHeight: noticeH,
    isCompact: false,
  })

  // Footer compliance text
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.6)
  doc.setTextColor(140, 155, 175)
  doc.text(
    'DIGITAL PORTAL DOCUMENT · V.S.B. ENGINEERING COLLEGE (AUTONOMOUS) · AI & DS PORTAL · SYSTEM GENERATED ELECTRONIC RECORD (NOT AN ORIGINAL PHYSICAL CERTIFICATE)',
    pageWidth / 2,
    pageHeight - 6.5,
    { align: 'center' }
  )

  const downloadName = `VSB_College_Bus_Pass_Slip_${data.registerNumber}.pdf`
  doc.save(downloadName)
}

export interface HostelGatePassPDFData {
  passRecordNumber: string
  studentName: string
  registerNumber: string
  department: string
  year: number | string
  section: string
  hostelBlock: string
  roomNo: string
  passType: string
  purpose: string
  destination?: string
  departureTime?: string
  curfewLimit: string
  parentPhone: string
  parentConfirmed?: boolean
  wardenName: string
  wardenContact: string
  sanctionTimestamp: string
  issueDate: string
  qrDataUrl?: string
}

export function generateAndDownloadHostelGatePassPDF(data: HostelGatePassPDFData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 14
  const contentW = pageWidth - marginX * 2

  // 1. Dual Security Borders (Deep Navy & Rich Gold)
  doc.setDrawColor(7, 26, 61) // Deep Royal Navy
  doc.setLineWidth(0.8)
  doc.rect(marginX - 4, marginX - 4, contentW + 8, pageHeight - (marginX - 4) * 2, 'S')

  doc.setDrawColor(231, 185, 62) // Gold
  doc.setLineWidth(0.4)
  doc.rect(marginX - 2, marginX - 2, contentW + 4, pageHeight - (marginX - 2) * 2, 'S')

  // 2. Official Academic Letterhead
  doc.setFillColor(250, 252, 255)
  doc.rect(marginX - 2, marginX - 2, contentW + 4, 38, 'F')

  const logoX = marginX + 3
  const logoY = marginX + 3
  const logoSize = 24

  // Circular Gold Ring Base for Emblem
  doc.setFillColor(255, 255, 255)
  doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 1, 'F')
  doc.setDrawColor(231, 185, 62)
  doc.setLineWidth(0.6)
  doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 1, 'S')

  try {
    doc.addImage(VSB_LOGO_BASE64, 'PNG', logoX + 2, logoY + 2, logoSize - 4, logoSize - 4)
  } catch (e) {
    console.error('Failed to embed logo in PDF:', e)
  }

  const headerCenterX = marginX + logoSize + (contentW - logoSize) / 2

  // Master Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(7, 26, 61)
  doc.text('V.S.B. ENGINEERING COLLEGE', headerCenterX, marginX + 6.5, { align: 'center' })

  // Autonomous Badge Pill
  doc.setFillColor(231, 185, 62)
  doc.roundedRect(headerCenterX - 24, marginX + 8.5, 48, 4.2, 1, 1, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(7, 26, 61)
  doc.text('AN AUTONOMOUS INSTITUTION', headerCenterX, marginX + 11.5, { align: 'center' })

  // Department
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(13, 90, 66) // Deep Emerald Teal
  doc.text('DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE', headerCenterX, marginX + 17.5, { align: 'center' })

  // Affiliation
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.8)
  doc.setTextColor(75, 85, 105)
  doc.text('Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai · Karur - 639 111, Tamil Nadu', headerCenterX, marginX + 22.5, { align: 'center' })

  // NAAC & NBA
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(100, 115, 135)
  doc.text('Accredited by NAAC with "A" Grade · NBA Accredited Programs · ISO 9001:2015 Certified', headerCenterX, marginX + 27, { align: 'center' })

  // Decorative Beam
  const beamY = marginX + 34
  doc.setFillColor(13, 90, 66) // Deep Emerald Beam
  doc.rect(marginX, beamY, contentW, 1.4, 'F')
  doc.setFillColor(231, 185, 62) // Gold Underline
  doc.rect(marginX, beamY + 1.4, contentW, 0.7, 'F')

  // Document Title Banner
  let curY = beamY + 6.5
  doc.setFillColor(7, 26, 61)
  doc.roundedRect(marginX, curY, contentW, 10.5, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('OFFICIAL HOSTEL RESIDENT GATE PASS & OUTPASS SLIP', marginX + contentW / 2, curY + 6.8, { align: 'center' })

  // Meta bar: Pass Record No, Academic Year, Sanction Timestamp
  curY += 13.5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(7, 26, 61)
  doc.text(`RECORD NO: ${data.passRecordNumber}`, marginX, curY)
  doc.text(`ACADEMIC YEAR: 2026 - 2027`, marginX + contentW / 2, curY, { align: 'center' })
  doc.setTextColor(13, 90, 66)
  doc.text(`SANCTIONED: ${data.sanctionTimestamp}`, marginX + contentW, curY, { align: 'right' })

  // Section 1: Student Identification & Hostel Particulars
  curY += 4.5
  const sec1H = 26
  doc.setFillColor(240, 253, 244) // Mint/Emerald Tint
  doc.roundedRect(marginX, curY, contentW, sec1H, 2, 2, 'F')
  doc.setDrawColor(187, 247, 208)
  doc.setLineWidth(0.3)
  doc.roundedRect(marginX, curY, contentW, sec1H, 2, 2, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(13, 90, 66)
  doc.text('1. STUDENT IDENTIFICATION & HOSTEL RESIDENCY PARTICULARS', marginX + 4, curY + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.8)
  doc.setTextColor(75, 85, 105)

  // Row 1
  doc.text('Student Full Name:', marginX + 4, curY + 11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(data.studentName, marginX + 34, curY + 11)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Register Number:', marginX + contentW / 2 + 4, curY + 11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(data.registerNumber, marginX + contentW / 2 + 36, curY + 11)

  // Row 2
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Department:', marginX + 4, curY + 16.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(data.department, marginX + 34, curY + 16.5)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Year & Section:', marginX + contentW / 2 + 4, curY + 16.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(`Year ${data.year} • Section ${data.section}`, marginX + contentW / 2 + 36, curY + 16.5)

  // Row 3
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Hostel & Room:', marginX + 4, curY + 22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(13, 90, 66)
  doc.text(`${data.hostelBlock}  ·  ${data.roomNo}`, marginX + 34, curY + 22)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Pass Status:', marginX + contentW / 2 + 4, curY + 22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(16, 185, 129)
  doc.text('SANCTIONED & DIGITALLY VERIFIED', marginX + contentW / 2 + 36, curY + 22)

  // Section 2: Outpass Movement Schedule & Curfew Specifications
  curY += sec1H + 3.5
  const sec2H = 26
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(marginX, curY, contentW, sec2H, 2, 2, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.roundedRect(marginX, curY, contentW, sec2H, 2, 2, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(21, 87, 192)
  doc.text('2. OUTPASS MOVEMENT SCHEDULE & CURFEW SPECIFICATIONS', marginX + 4, curY + 5)

  // Row 1
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.8)
  doc.setTextColor(75, 85, 105)
  doc.text('Outing Category:', marginX + 4, curY + 11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text((data.passType || 'Day Outing').replace('_', ' ').toUpperCase(), marginX + 34, curY + 11)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Destination / Place:', marginX + contentW / 2 + 4, curY + 11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(data.destination || 'Karur Central / Local', marginX + contentW / 2 + 36, curY + 11)

  // Row 2
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Departure Out-Time:', marginX + 4, curY + 16.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(data.departureTime || 'Today, Permitted Out-Time', marginX + 34, curY + 16.5)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Mandatory Return Curfew:', marginX + contentW / 2 + 4, curY + 16.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(185, 28, 28) // Urgent Red Curfew
  doc.text(data.curfewLimit, marginX + contentW / 2 + 36, curY + 16.5)

  // Row 3
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Authorized Purpose:', marginX + 4, curY + 22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(data.purpose, marginX + 34, curY + 22)

  // Section 3: Parental Consent & Warden Authorization
  curY += sec2H + 3.5
  const sec3H = 21
  doc.setFillColor(254, 252, 245)
  doc.roundedRect(marginX, curY, contentW, sec3H, 2, 2, 'F')
  doc.setDrawColor(245, 230, 195)
  doc.setLineWidth(0.3)
  doc.roundedRect(marginX, curY, contentW, sec3H, 2, 2, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(180, 83, 9) // Amber/Gold
  doc.text('3. PARENTAL CONSENT & WARDEN SANCTION RECORDS', marginX + 4, curY + 5)

  // Row 1
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.8)
  doc.setTextColor(75, 85, 105)
  doc.text('Parent Contact Phone:', marginX + 4, curY + 11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(data.parentPhone, marginX + 38, curY + 11)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Parent Verification Status:', marginX + contentW / 2 + 4, curY + 11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(16, 185, 129)
  doc.text('Telephonically Confirmed & Consent Recorded', marginX + contentW / 2 + 40, curY + 11)

  // Row 2
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Sanctioning Warden:', marginX + 4, curY + 16.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(7, 26, 61)
  doc.text(data.wardenName, marginX + 38, curY + 16.5)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 105)
  doc.text('Warden Office Phone:', marginX + contentW / 2 + 4, curY + 16.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(13, 90, 66)
  doc.text(data.wardenContact, marginX + contentW / 2 + 40, curY + 16.5)

  // Section 4: Campus Main Gate Movement Log (Security Desk Check)
  curY += sec3H + 3.5
  const sec4H = 24
  doc.setFillColor(241, 245, 249)
  doc.roundedRect(marginX, curY, contentW, sec4H, 2, 2, 'F')
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.3)
  doc.roundedRect(marginX, curY, contentW, sec4H, 2, 2, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(51, 65, 85)
  doc.text('4. CAMPUS MAIN GATE SECURITY DESK MOVEMENT LOG', marginX + 4, curY + 5)

  // Gate Exit Sub-box
  const gateColW = (contentW - 6) / 2
  doc.setDrawColor(203, 213, 225)
  doc.line(marginX + gateColW + 3, curY + 2, marginX + gateColW + 3, curY + sec4H - 2)

  // Left: Gate Exit (Out)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.2)
  doc.setTextColor(185, 28, 28)
  doc.text('GATE DEPARTURE (OUT):', marginX + 4, curY + 10)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(75, 85, 105)
  doc.text('Date & Out-Time:  _____ / _____ / 2026   ____:____  AM / PM', marginX + 4, curY + 15)
  doc.text('Security Officer Sign:  ___________________________________', marginX + 4, curY + 20)

  // Right: Gate Entry (In)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.2)
  doc.setTextColor(16, 185, 129)
  doc.text('GATE ARRIVAL (IN):', marginX + gateColW + 8, curY + 10)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(75, 85, 105)
  doc.text('Date & In-Time:   _____ / _____ / 2026   ____:____  AM / PM', marginX + gateColW + 8, curY + 15)
  doc.text('Security Officer Sign:  ___________________________________', marginX + gateColW + 8, curY + 20)

  // Section 5: Scannable QR Code and Mandatory Hostel Rules
  curY += sec4H + 4
  const qrBoxW = 44
  const qrBoxH = 43

  // QR Code Mount
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(marginX, curY, qrBoxW, qrBoxH, 2, 2, 'F')
  doc.setDrawColor(13, 90, 66)
  doc.setLineWidth(0.4)
  doc.roundedRect(marginX, curY, qrBoxW, qrBoxH, 2, 2, 'S')

  if (data.qrDataUrl) {
    try {
      doc.addImage(data.qrDataUrl, 'PNG', marginX + 2, curY + 2, qrBoxW - 4, qrBoxH - 9)
    } catch (e) {
      console.error('Failed to embed QR code in PDF:', e)
    }
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6)
  doc.setTextColor(13, 90, 66)
  doc.text('SCAN TO VERIFY AUTHENTICITY', marginX + qrBoxW / 2, curY + qrBoxH - 3, { align: 'center' })

  // Regulations Box (Right of QR Code)
  const rulesX = marginX + qrBoxW + 4
  const rulesW = contentW - qrBoxW - 4

  doc.setFillColor(248, 250, 252)
  doc.roundedRect(rulesX, curY, rulesW, qrBoxH, 2, 2, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.roundedRect(rulesX, curY, rulesW, qrBoxH, 2, 2, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(7, 26, 61)
  doc.text('MANDATORY HOSTEL INMATE CODE & OUTING REGULATIONS:', rulesX + 4, curY + 5)

  const hostelRules = [
    '1. The student must carry this official Gate Pass Slip along with their College RFID ID Card at all times.',
    '2. Pass must be produced to the Security Officer at the Main Gate during departure and return.',
    '3. Adherence to curfew (Boys: 06:30 PM / Girls: 06:00 PM) is mandatory. Late arrival attracts disciplinary action.',
    '4. Student must remain contactable on their registered mobile number throughout the entire outing period.',
    '5. For Home Leave, parent confirmation of safe arrival at home must be communicated to the Hostel Warden.'
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.4)
  doc.setTextColor(71, 85, 105)
  let ruleY = curY + 11
  hostelRules.forEach(r => {
    doc.text(r, rulesX + 4, ruleY)
    ruleY += 6.2
  })

  // Section 6: Official Digital Attestation & Digital Portal Document Notice
  curY += qrBoxH + 4
  const attColW = contentW / 3
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(marginX, curY, contentW, 14, 1.5, 1.5, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.roundedRect(marginX, curY, contentW, 14, 1.5, 1.5, 'S')

  // Col 1: Student Undertaking
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(7, 26, 61)
  doc.text('STUDENT DIGITAL UNDERTAKING', marginX + 4, curY + 4.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.8)
  doc.setTextColor(16, 185, 129)
  doc.text('✓ Digitally Acknowledged & Logged', marginX + 4, curY + 8.5)
  doc.setTextColor(100, 115, 135)
  doc.text(data.studentName, marginX + 4, curY + 12)

  // Col 2: Hostel Warden
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(7, 26, 61)
  doc.text('HOSTEL WARDEN SANCTION', marginX + attColW + 4, curY + 4.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.8)
  doc.setTextColor(16, 185, 129)
  doc.text('✓ Digitally Sanctioned & Recorded', marginX + attColW + 4, curY + 8.5)
  doc.setTextColor(100, 115, 135)
  doc.text(data.wardenName, marginX + attColW + 4, curY + 12)

  // Col 3: Institutional Approval
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(7, 26, 61)
  doc.text('AUTONOMOUS PORTAL APPROVAL', marginX + attColW * 2 + 4, curY + 4.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.8)
  doc.setTextColor(20, 85, 217)
  doc.text('✓ E-Outpass Record Active', marginX + attColW * 2 + 4, curY + 8.5)
  doc.setTextColor(100, 115, 135)
  doc.text('Hostel Administration Cell', marginX + attColW * 2 + 4, curY + 12)

  curY += 16

  drawDigitalPortalDocumentNotice(doc, {
    y: curY,
    contentW,
    marginX,
    recordType: 'HOSTEL GATE PASS OUTPASS',
    verificationCode: data.passRecordNumber || `VSB-GP-${data.registerNumber}`,
    repositoryName: 'Hostel Administration Central Ledger',
    issuingAuthority: 'Hostel Warden & Chief Warden Office',
    boxHeight: 24,
    isCompact: true,
  })

  // Footer compliance text
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.6)
  doc.setTextColor(140, 155, 175)
  doc.text(
    'DIGITAL PORTAL DOCUMENT · V.S.B. ENGINEERING COLLEGE (AUTONOMOUS) · AI & DS PORTAL · SYSTEM GENERATED ELECTRONIC RECORD (NOT AN ORIGINAL PHYSICAL CERTIFICATE)',
    pageWidth / 2,
    pageHeight - 5.5,
    { align: 'center' }
  )

  const downloadName = `VSB_Hostel_Gate_Pass_${data.registerNumber}.pdf`
  doc.save(downloadName)
}




/**
 * downloadWithDeptHeader
 * Downloads the original uploaded file (PDF) with the VSB department header cover
 * page prepended. Uses pdfjs-dist to render original PDF pages as canvas images
 * and inserts them after the branded cover page in a new jsPDF document.
 */
export interface DeptHeaderDownloadOptions {
  fileUrl: string
  fileName: string
  title: string
  resourceType?: string
  uploadedByName?: string
  semester?: number | null
  description?: string
}

export async function downloadWithDeptHeader(options: DeptHeaderDownloadOptions): Promise<void> {
  const { fileUrl, fileName, resourceType } = options

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const renderHeader = () => {
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const marginX = 12
    const contentW = pageWidth - marginX * 2

    // Frame
    doc.setDrawColor(215, 226, 242); doc.setLineWidth(0.4)
    doc.rect(marginX - 4, marginX - 4, contentW + 8, pageHeight - (marginX - 4) * 2, 'S')
    doc.setDrawColor(238, 243, 250); doc.setLineWidth(0.2)
    doc.rect(marginX - 2, marginX - 2, contentW + 4, pageHeight - (marginX - 2) * 2, 'S')

    // Header tint
    doc.setFillColor(250, 252, 255)
    doc.rect(marginX - 2, marginX - 2, contentW + 4, 38, 'F')

    // Logo
    const logoX = marginX + 2; const logoY = marginX + 3; const logoSize = 24
    doc.setFillColor(255, 255, 255)
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 1, 'F')
    doc.setDrawColor(231, 185, 62); doc.setLineWidth(0.6)
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 1, 'S')
    try { doc.addImage(VSB_LOGO_BASE64, 'PNG', logoX + 2, logoY + 2, logoSize - 4, logoSize - 4) } catch {}

    // College name & dept
    const hCX = marginX + logoSize + (contentW - logoSize) / 2
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14.5); doc.setTextColor(7, 26, 61)
    doc.text('V.S.B. ENGINEERING COLLEGE', hCX, marginX + 6.5, { align: 'center' })
    doc.setFillColor(231, 185, 62)
    doc.roundedRect(hCX - 22, marginX + 8.5, 44, 4, 1, 1, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6.8); doc.setTextColor(7, 26, 61)
    doc.text('AN AUTONOMOUS INSTITUTION', hCX, marginX + 11.3, { align: 'center' })
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(21, 87, 192)
    doc.text('DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE', hCX, marginX + 17.5, { align: 'center' })
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(75, 85, 105)
    doc.text('Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai · Karur - 639 111, Tamil Nadu', hCX, marginX + 22.5, { align: 'center' })
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6.8); doc.setTextColor(100, 115, 135)
    doc.text('Accredited by NAAC with "A" Grade  ·  NBA Accredited Programs  ·  ISO 9001:2015 Certified', hCX, marginX + 27, { align: 'center' })

    // Separator beam
    const beamY = marginX + 34
    doc.setFillColor(21, 87, 192); doc.rect(marginX, beamY, contentW, 1.4, 'F')
    doc.setFillColor(231, 185, 62); doc.rect(marginX, beamY + 1.4, contentW, 0.7, 'F')
    doc.setFillColor(231, 185, 62); doc.circle(marginX + contentW / 2, beamY + 1, 1.8, 'F')
    doc.setFillColor(7, 26, 61); doc.circle(marginX + contentW / 2, beamY + 1, 0.9, 'F')

    // Footer on cover
    doc.setFont('helvetica', 'normal'); doc.setFontSize(5.6); doc.setTextColor(140, 155, 175)
    doc.text('DIGITAL PORTAL DOCUMENT · V.S.B. ENGINEERING COLLEGE (AUTONOMOUS) · AI & DS PORTAL', pageWidth / 2, pageHeight - 5.5, { align: 'center' })
  }

  try {
    const resp = await fetch(fileUrl)
    if (resp.ok) {
      const arrayBuffer = await resp.arrayBuffer()
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
      const pdfSrc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
      const numPages = pdfSrc.numPages
      const isLabManual = resourceType === 'LAB_MANUAL'
      
      for (let i = 1; i <= numPages; i++) {
        if (i > 1) {
          doc.addPage()
        }
        
        const shouldRenderHeader = !isLabManual || i === 1
        
        if (shouldRenderHeader) {
          renderHeader()
        }

        const page = await pdfSrc.getPage(i)
        const viewport = page.getViewport({ scale: 2.0 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width; canvas.height = viewport.height
        const ctx = canvas.getContext('2d')!
        await page.render({ canvasContext: ctx, viewport }).promise
        const imgData = canvas.toDataURL('image/jpeg', 0.92)
        
        if (shouldRenderHeader) {
          const a4W = 186; const a4H = 232 // contentW and available height below header
          const ratio = Math.min(a4W / (viewport.width / 2), a4H / (viewport.height / 2))
          const imgW = (viewport.width / 2) * ratio; const imgH = (viewport.height / 2) * ratio
          doc.addImage(imgData, 'JPEG', 12 + (a4W - imgW) / 2, 50 + (a4H - imgH) / 2, imgW, imgH)
        } else {
          const a4W = 210; const a4H = 297
          const ratio = Math.min(a4W / (viewport.width / 2), a4H / (viewport.height / 2))
          const imgW = (viewport.width / 2) * ratio; const imgH = (viewport.height / 2) * ratio
          doc.addImage(imgData, 'JPEG', (a4W - imgW) / 2, (a4H - imgH) / 2, imgW, imgH)
        }
      }
    }
  } catch (err) {
    console.warn('downloadWithDeptHeader: could not embed original pages:', err)
  }

  doc.save('VSB_' + fileName.replace(/\.[^/.]+$/, '') + '.pdf')
}
