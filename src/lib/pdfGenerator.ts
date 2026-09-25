import { jsPDF } from 'jspdf'
import { VSB_LOGO_BASE64 } from './logoBase64'

export interface PDFTableCell {
  text: string
  badge?: boolean
  badgeType?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'gold'
  align?: 'left' | 'center' | 'right'
  bold?: boolean
}

export interface PDFTableOptions {
  headers: string[]
  rows: (string | PDFTableCell)[][]
  widths?: number[]
  alignments?: ('left' | 'center' | 'right')[]
}

export interface PDFStatCard {
  label: string
  value: string
  badgeColor?: 'blue' | 'emerald' | 'gold' | 'cyan' | 'purple' | 'rose'
}

export interface PDFSection {
  heading: string
  body?: string[]
  table?: PDFTableOptions
  statsGrid?: PDFStatCard[]
}

export interface PDFDocOptions {
  title: string
  subtitle?: string
  subjectCode?: string
  author?: string
  category?: string
  content?: string
  sections?: PDFSection[]
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

/**
 * Renders an official V.S.B. Department running header at the top of subsequent pages (pages 2+)
 */
export function drawRunningPageHeader(doc: jsPDF, marginX: number, contentW: number): number {
  // Top Header Tint
  doc.setFillColor(250, 252, 255)
  doc.rect(marginX - 2, marginX - 2, contentW + 4, 15, 'F')

  // Small Logo
  const logoSize = 10
  try {
    doc.addImage(VSB_LOGO_BASE64, 'PNG', marginX + 1, marginX, logoSize, logoSize)
  } catch {}

  // College & Department running line
  const hCX = marginX + logoSize + (contentW - logoSize) / 2
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(7, 26, 61)
  doc.text('V.S.B. ENGINEERING COLLEGE (AUTONOMOUS)', hCX, marginX + 3.8, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(21, 87, 192)
  doc.text('DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE · OFFICIAL ACADEMIC DOSSIER', hCX, marginX + 7.8, { align: 'center' })

  // Thin separator rule
  const beamY = marginX + 12
  doc.setFillColor(21, 87, 192)
  doc.rect(marginX, beamY, contentW, 0.8, 'F')
  doc.setFillColor(231, 185, 62)
  doc.rect(marginX, beamY + 0.8, contentW, 0.4, 'F')

  return marginX + 17
}

/**
 * Universal Ultra-Luxury Institutional Table Drawer
 * Renders executive academic tables with dark navy/gold headers, alternating rows,
 * repeat-headers on page break, column dividers, and micro status pills.
 */
export function drawLuxuryTable(
  doc: jsPDF,
  table: PDFTableOptions,
  startY: number,
  marginX: number,
  contentW: number,
  pageHeight: number
): number {
  let currentY = startY
  const headers = table.headers
  const numCols = headers.length
  if (numCols === 0 || table.rows.length === 0) return currentY

  // Normalize column widths to sum up to contentW
  let widths = table.widths ? [...table.widths] : []
  const currentSum = widths.reduce((a, b) => a + b, 0)
  if (widths.length !== numCols || Math.abs(currentSum - contentW) > 2) {
    if (widths.length === numCols && currentSum > 0) {
      widths = widths.map(w => (w / currentSum) * contentW)
    } else {
      const even = contentW / numCols
      widths = headers.map(() => even)
    }
  }

  const alignments = table.alignments || headers.map(() => 'left' as const)

  const drawHeader = (yPos: number) => {
    // Header Background: Deep Royal Navy #071A3D
    doc.setFillColor(7, 26, 61)
    doc.rect(marginX, yPos, contentW, 7.5, 'F')
    // Top Royal Cobalt Line
    doc.setFillColor(20, 85, 217)
    doc.rect(marginX, yPos, contentW, 0.6, 'F')
    // Bottom Gold Accent Line
    doc.setFillColor(231, 185, 62)
    doc.rect(marginX, yPos + 7.5 - 0.6, contentW, 0.6, 'F')

    let curX = marginX
    for (let c = 0; c < numCols; c++) {
      const colW = widths[c]
      const colAlign = alignments[c] || 'left'
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6.4)
      doc.setTextColor(255, 255, 255)

      let textX = curX + 2.5
      if (colAlign === 'center') textX = curX + colW / 2
      else if (colAlign === 'right') textX = curX + colW - 2.5

      doc.text(headers[c], textX, yPos + 4.9, { align: colAlign })

      // Subtle column divider line
      if (c < numCols - 1) {
        doc.setDrawColor(26, 52, 95)
        doc.setLineWidth(0.2)
        doc.line(curX + colW, yPos + 1.2, curX + colW, yPos + 6.3)
      }
      curX += colW
    }
  }

  // Draw Initial Table Header
  drawHeader(currentY)
  currentY += 7.5

  const rowHeight = 7.0
  for (let r = 0; r < table.rows.length; r++) {
    // Check page overflow
    if (currentY + rowHeight > pageHeight - 38) {
      doc.addPage()
      // Redraw Outer Luxury Borders
      doc.setDrawColor(215, 226, 242)
      doc.setLineWidth(0.4)
      doc.rect(marginX - 4, marginX - 4, contentW + 8, pageHeight - (marginX - 4) * 2, 'S')
      doc.setDrawColor(238, 243, 250)
      doc.setLineWidth(0.2)
      doc.rect(marginX - 2, marginX - 2, contentW + 4, pageHeight - (marginX - 2) * 2, 'S')

      currentY = drawRunningPageHeader(doc, marginX, contentW)
      drawHeader(currentY)
      currentY += 7.5
    }

    const row = table.rows[r]
    const isEven = r % 2 === 0

    // Alternating Row background: Crisp Pure White and Soft Platinum Blue
    if (isEven) {
      doc.setFillColor(255, 255, 255)
    } else {
      doc.setFillColor(248, 250, 254)
    }
    doc.rect(marginX, currentY, contentW, rowHeight, 'F')

    // Subtle horizontal border
    doc.setDrawColor(228, 235, 245)
    doc.setLineWidth(0.2)
    doc.line(marginX, currentY + rowHeight, marginX + contentW, currentY + rowHeight)

    let curX = marginX
    for (let c = 0; c < numCols; c++) {
      const colW = widths[c]
      const colAlign = alignments[c] || 'left'
      const rawCell = row[c]
      const cellText = typeof rawCell === 'string' ? rawCell : (rawCell?.text || '')
      const isBadge = typeof rawCell === 'object' && rawCell?.badge
      const badgeType = typeof rawCell === 'object' ? rawCell?.badgeType : undefined
      const isBold = typeof rawCell === 'object' ? rawCell?.bold : (c === 0 || c === 1)

      // Vertical column divider
      if (c < numCols - 1) {
        doc.setDrawColor(238, 243, 250)
        doc.setLineWidth(0.15)
        doc.line(curX + colW, currentY, curX + colW, currentY + rowHeight)
      }

      // Check if cell is a status or grade badge
      const textUpper = cellText.toUpperCase().trim()
      const isStatusBadge =
        isBadge ||
        badgeType !== undefined ||
        ['ACTIVE', 'PASS', 'DISTINCTION', 'INACTIVE', 'WITHHELD', 'FAIL', 'AWAITING', 'PENDING', 'S', 'A+', 'A', 'B+', 'B', 'C', 'U'].includes(textUpper)

      if (isStatusBadge && cellText.length > 0 && cellText !== '—') {
        const isSuccess =
          badgeType === 'success' ||
          ['ACTIVE', 'PASS', 'DISTINCTION', 'FIRST CLASS WITH DISTINCTION', 'FIRST CLASS', 'S', 'A+', 'A'].includes(textUpper)
        const isDanger =
          badgeType === 'danger' ||
          ['INACTIVE', 'WITHHELD', 'FAIL', 'U', 'DISCONTINUED', 'ABSENT'].includes(textUpper)
        const isWarning =
          badgeType === 'warning' ||
          ['AWAITING', 'PENDING', 'WARNING', 'CONDONATION', 'B+', 'B'].includes(textUpper)
        const isGold = badgeType === 'gold'

        const pillH = 4.8
        const pillY = currentY + (rowHeight - pillH) / 2
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(5.6)
        const textW = doc.getTextWidth(cellText)
        const pillW = Math.max(14, Math.min(colW - 3, textW + 6))
        const pillX = curX + (colW - pillW) / 2

        if (isSuccess) {
          doc.setFillColor(236, 253, 245) // emerald-50
          doc.setDrawColor(167, 243, 208)
          doc.setTextColor(4, 120, 87)
        } else if (isDanger) {
          doc.setFillColor(254, 242, 242) // red-50
          doc.setDrawColor(254, 202, 202)
          doc.setTextColor(185, 28, 28)
        } else if (isWarning) {
          doc.setFillColor(255, 251, 235) // amber-50
          doc.setDrawColor(253, 230, 138)
          doc.setTextColor(180, 83, 9)
        } else if (isGold) {
          doc.setFillColor(254, 252, 232)
          doc.setDrawColor(245, 208, 77)
          doc.setTextColor(133, 77, 14)
        } else {
          doc.setFillColor(239, 246, 255)
          doc.setDrawColor(191, 219, 254)
          doc.setTextColor(29, 78, 216)
        }

        doc.setLineWidth(0.25)
        doc.roundedRect(pillX, pillY, pillW, pillH, 1.3, 1.3, 'FD')
        doc.text(cellText, pillX + pillW / 2, pillY + 3.4, { align: 'center' })
      } else {
        doc.setFont('helvetica', isBold ? 'bold' : 'normal')
        doc.setFontSize(6.4)
        if (c === 0) {
          doc.setTextColor(100, 116, 139)
        } else if (c === 1) {
          doc.setTextColor(20, 85, 217) // Royal Cobalt for Code / RegNo
        } else {
          doc.setTextColor(15, 23, 42) // Deep navy
        }

        // Clip text with ellipsis if too wide
        let printable = cellText
        while (doc.getTextWidth(printable) > colW - 4.5 && printable.length > 3) {
          printable = printable.slice(0, -3) + '..'
        }

        let textX = curX + 2.5
        if (colAlign === 'center') textX = curX + colW / 2
        else if (colAlign === 'right') textX = curX + colW - 2.5

        doc.text(printable, textX, currentY + 4.6, { align: colAlign })
      }

      curX += colW
    }

    currentY += rowHeight
  }

  // Bottom table finish line
  doc.setDrawColor(20, 85, 217)
  doc.setLineWidth(0.4)
  doc.line(marginX, currentY, marginX + contentW, currentY)

  return currentY + 4.5
}

/**
 * Universal Executive KPI Stat Grid Drawer
 * Renders key summary metrics as sleek cards with accent colors
 */
export function drawExecutiveKPIGrid(
  doc: jsPDF,
  items: { label: string; value: string; badgeColor?: string }[],
  startY: number,
  marginX: number,
  contentW: number
): number {
  const cardCount = items.length
  if (cardCount === 0) return startY

  const cols = cardCount <= 3 ? cardCount : cardCount <= 6 ? Math.ceil(cardCount / 2) : 4
  const gap = 2.5
  const cardW = (contentW - (cols - 1) * gap) / cols
  const cardH = 12.5

  const accents: Record<string, { bg: number[]; bar: number[]; text: number[] }> = {
    blue: { bg: [248, 250, 254], bar: [20, 85, 217], text: [20, 85, 217] },
    emerald: { bg: [236, 253, 245], bar: [16, 185, 129], text: [4, 120, 87] },
    gold: { bg: [254, 252, 232], bar: [234, 179, 8], text: [161, 98, 7] },
    cyan: { bg: [240, 249, 255], bar: [2, 132, 199], text: [3, 105, 161] },
    purple: { bg: [250, 245, 255], bar: [168, 85, 247], text: [126, 34, 206] },
    rose: { bg: [255, 241, 242], bar: [244, 63, 94], text: [190, 18, 60] },
  }

  const defaultKeys = ['blue', 'emerald', 'cyan', 'gold', 'purple', 'rose']

  for (let i = 0; i < cardCount; i++) {
    const colIdx = i % cols
    const rowIdx = Math.floor(i / cols)
    const cardX = marginX + colIdx * (cardW + gap)
    const cardY = startY + rowIdx * (cardH + gap)
    const colorKey = items[i].badgeColor || defaultKeys[i % defaultKeys.length]
    const style = accents[colorKey] || accents.blue

    // Card Container
    doc.setFillColor(style.bg[0], style.bg[1], style.bg[2])
    doc.roundedRect(cardX, cardY, cardW, cardH, 1.5, 1.5, 'F')
    doc.setDrawColor(220, 230, 244)
    doc.setLineWidth(0.2)
    doc.roundedRect(cardX, cardY, cardW, cardH, 1.5, 1.5, 'S')

    // Left Accent Strip
    doc.setFillColor(style.bar[0], style.bar[1], style.bar[2])
    doc.roundedRect(cardX, cardY, 2.2, cardH, 0.8, 0.8, 'F')

    // Label
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(5.0)
    doc.setTextColor(100, 116, 139)
    const rawLabel = items[i].label.toUpperCase()
    const truncatedLabel = doc.splitTextToSize(rawLabel, cardW - 6)[0]
    doc.text(truncatedLabel, cardX + 4.5, cardY + 4.2)

    // Value
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(style.text[0], style.text[1], style.text[2])
    doc.text(items[i].value, cardX + 4.5, cardY + 10.2)
  }

  const numRows = Math.ceil(cardCount / cols)
  return startY + numRows * (cardH + gap) + 2.5
}

/**
 * Automatically parses student roster strings into a structured luxury table
 */
export function parseStudentRosterLines(lines: string[]): PDFTableOptions | null {
  if (!lines || lines.length === 0) return null
  const parsedRows: string[][] = []

  for (let idx = 0; idx < lines.length; idx++) {
    const raw = lines[idx].replace(/^[•\-\*]\s*/, '').trim()
    // Pattern: 1. [922525243065] Jagan M — Year 2, Sem 3, Sec B · Contact: 7010711868 · Status: ACTIVE
    const match = raw.match(/^\s*(\d+)?[\.\)]?\s*\[([^\]]+)\]\s*([^—\-]+)\s*[—\-]\s*(?:Year\s*(\d+),?\s*Sem\s*(\d+),?\s*Sec\s*([A-Za-z0-9]+)|([^·]+))\s*[·•-]?\s*(?:Contact:\s*([^·]+))?\s*[·•-]?\s*(?:Status:\s*(.+))?$/i)
    if (match) {
      const sNo = match[1] || String(idx + 1)
      const regNo = match[2].trim()
      const name = match[3].trim()
      const cohort = match[4] && match[5]
        ? `Yr ${match[4]} · S${match[5]} · ${match[6] || 'A'}`
        : (match[7] || 'AI & DS').trim()
      const contact = (match[8] || 'N/A').trim()
      const status = (match[9] || 'ACTIVE').trim().toUpperCase()

      parsedRows.push([sNo, regNo, name, cohort, contact, status])
    } else {
      // Loose regex fallback
      const loose = raw.match(/^\s*(\d+)?[\.\)]?\s*\[([^\]]+)\]\s*([^—\|]+?)(?:—|\||-)(.+)$/)
      if (loose) {
        parsedRows.push([
          loose[1] || String(idx + 1),
          loose[2].trim(),
          loose[3].trim(),
          'AI & DS',
          loose[4].trim(),
          'ACTIVE'
        ])
      } else {
        return null
      }
    }
  }

  if (parsedRows.length === 0) return null

  return {
    headers: ['#', 'REGISTER NO', 'STUDENT NAME', 'COHORT / CLASS', 'CONTACT DETAILS', 'STATUS'],
    rows: parsedRows,
    widths: [8, 28, 48, 32, 44, 26],
    alignments: ['center', 'left', 'left', 'center', 'left', 'center']
  }
}

/**
 * Automatically parses marksheet / course grade strings into a structured luxury table
 */
export function parseMarksheetLines(lines: string[]): PDFTableOptions | null {
  if (!lines || lines.length === 0) return null
  const parsedRows: string[][] = []

  for (let idx = 0; idx < lines.length; idx++) {
    const raw = lines[idx].replace(/^[•\-\*]\s*/, '').trim()
    if (!raw.includes('|') || !raw.includes('Credits:')) return null

    // e.g.: 1. [CS3301] Data Structures | Credits: 3 | Grade: A+ | Grade Point: 9 | Score: 27.0
    const match = raw.match(/^\s*(\d+)?[\.\)]?\s*\[([^\]]+)\]\s*([^\|]+)\|\s*Credits:\s*([0-9\.]+)\s*\|\s*Grade:\s*([^\|]+)\|\s*Grade Point:\s*([^\|]+)\|\s*Score:\s*(.+)$/i)
    if (match) {
      parsedRows.push([
        match[1] || String(idx + 1),
        match[2].trim(),
        match[3].trim(),
        match[4].trim(),
        match[5].trim(),
        match[6].trim(),
        match[7].trim()
      ])
    } else {
      const parts = raw.split('|').map(p => p.trim())
      if (parts.length >= 4) {
        parsedRows.push([
          String(idx + 1),
          parts[0].replace(/^\d+[\.\)]?\s*\[?/, '').replace(/\]?.*$/, ''),
          parts[0].replace(/^.*\]\s*/, ''),
          parts[1].replace(/Credits:\s*/i, ''),
          parts[2].replace(/Grade:\s*/i, ''),
          parts[3].replace(/Grade Point:\s*/i, ''),
          parts[4] ? parts[4].replace(/Score:\s*/i, '') : '—'
        ])
      }
    }
  }

  if (parsedRows.length === 0) return null

  return {
    headers: ['S.NO', 'COURSE CODE', 'COURSE TITLE', 'CREDITS', 'GRADE', 'GRADE PT', 'CREDIT-POINTS (Ci×Gi)'],
    rows: parsedRows,
    widths: [10, 26, 64, 18, 18, 18, 32],
    alignments: ['center', 'center', 'left', 'center', 'center', 'center', 'right']
  }
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

  // 5. Structured Sections Rendered as Luxury Tables & Executive Dashboards
  if (options.sections && options.sections.length > 0) {
    for (const sec of options.sections) {
      if (currentY > pageHeight - 55) {
        doc.addPage()
        // Re-draw border on page 2+
        doc.setDrawColor(215, 226, 242)
        doc.setLineWidth(0.4)
        doc.rect(marginX - 4, marginX - 4, contentW + 8, pageHeight - (marginX - 4) * 2, 'S')
        doc.setDrawColor(238, 243, 250)
        doc.setLineWidth(0.2)
        doc.rect(marginX - 2, marginX - 2, contentW + 4, pageHeight - (marginX - 2) * 2, 'S')
        currentY = drawRunningPageHeader(doc, marginX, contentW)
      }

      // Section Header Ribbon with Royal Navy & Sapphire Accents
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

      // CASE 1: Explicit Table provided in section
      if (sec.table && sec.table.headers && sec.table.rows) {
        currentY = drawLuxuryTable(doc, sec.table, currentY, marginX, contentW, pageHeight)
        currentY += 2
        continue
      }

      // CASE 2: Explicit KPI Stat Grid provided
      if (sec.statsGrid && sec.statsGrid.length > 0) {
        currentY = drawExecutiveKPIGrid(doc, sec.statsGrid, currentY, marginX, contentW)
        currentY += 2
        continue
      }

      // CASE 3: Text body lines with intelligent luxury conversion
      if (sec.body && sec.body.length > 0) {
        // A: Check if body is a student roster list
        const rosterTable = parseStudentRosterLines(sec.body)
        if (rosterTable) {
          currentY = drawLuxuryTable(doc, rosterTable, currentY, marginX, contentW, pageHeight)
          currentY += 2
          continue
        }

        // B: Check if body is a marksheet grade list
        const marksheetTable = parseMarksheetLines(sec.body)
        if (marksheetTable) {
          currentY = drawLuxuryTable(doc, marksheetTable, currentY, marginX, contentW, pageHeight)
          currentY += 2
          continue
        }

        // C: Check if body is a concise overview or metrics list
        const headingUpper = sec.heading.toUpperCase()
        const isOverviewHeading =
          headingUpper.includes('OVERVIEW') ||
          headingUpper.includes('METRICS') ||
          headingUpper.includes('STATISTICS') ||
          headingUpper.includes('COUNTS') ||
          headingUpper.includes('SUMMARY')

        const allHaveColon = sec.body.every(line => line.includes(':'))
        const allShortValues = sec.body.every(line => {
          const colon = line.indexOf(':')
          return colon > 0 && (line.length - colon) <= 35
        })

        if (isOverviewHeading && allHaveColon && allShortValues && sec.body.length >= 2 && sec.body.length <= 8) {
          const kpiItems = sec.body.map(line => {
            const clean = line.replace(/^[•\-\*]\s*/, '').trim()
            const parts = clean.split(':')
            return {
              label: parts[0].trim(),
              value: parts.slice(1).join(':').trim(),
            }
          })
          currentY = drawExecutiveKPIGrid(doc, kpiItems, currentY, marginX, contentW)
          currentY += 2
          continue
        }

        // D: Fallback structured key-value & description card rendering
        const tableX = marginX
        const tableW = contentW
        const col1W = 75

        for (let rIdx = 0; rIdx < sec.body.length; rIdx++) {
          if (currentY > pageHeight - 45) {
            doc.addPage()
            doc.setDrawColor(215, 226, 242)
            doc.setLineWidth(0.4)
            doc.rect(marginX - 4, marginX - 4, contentW + 8, pageHeight - (marginX - 4) * 2, 'S')
            doc.setDrawColor(238, 243, 250)
            doc.setLineWidth(0.2)
            doc.rect(marginX - 2, marginX - 2, contentW + 4, pageHeight - (marginX - 2) * 2, 'S')
            currentY = drawRunningPageHeader(doc, marginX, contentW)
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
              valLower.includes('pass') ||
              valLower.includes('distinction') ||
              valLower.includes('100%')
            const isShortage =
              valLower.includes('shortage') ||
              valLower.includes('critical') ||
              valLower.includes('fail') ||
              valLower.includes('withheld') ||
              (valLower.includes('absent') && !valLower.startsWith('0') && !valLower.includes('zero'))
            const isWarning =
              valLower.includes('warning') ||
              valLower.includes('remedial') ||
              valLower.includes('condonation') ||
              valLower.includes('awaiting')

            const isFullBanner = val.length > 35

            if (isFullBanner) {
              const bannerW = tableW - col1W - 6
              const bannerX = tableX + col1W + 3
              const bannerH = 5.6
              const bannerY = currentY + (rowHeight - bannerH) / 2

              if (isEligible) {
                doc.setFillColor(236, 253, 245)
                doc.setDrawColor(167, 243, 208)
                doc.setTextColor(5, 122, 85)
              } else if (isShortage) {
                doc.setFillColor(254, 242, 242)
                doc.setDrawColor(254, 202, 202)
                doc.setTextColor(185, 28, 28)
              } else {
                doc.setFillColor(240, 246, 255)
                doc.setDrawColor(219, 234, 254)
                doc.setTextColor(29, 78, 216)
              }
              doc.setLineWidth(0.3)
              doc.roundedRect(bannerX, bannerY, bannerW, bannerH, 1.8, 1.8, 'FD')

              doc.setFont('helvetica', 'bold')
              doc.setFontSize(6.8)
              doc.text(val, bannerX + 4, bannerY + 3.9)
            } else {
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
  subjectCode?: string
  subjectName?: string
  academicYear?: string | null
}

/**
 * buildDeptHeaderBannerDoc
 * Creates the official V.S.B. Department Letterhead Banner matching the institutional format.
 */
export function buildDeptHeaderBannerDoc(widthMm: number = 210, heightMm: number = 34): jsPDF {
  const isLandscape = widthMm > 250
  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [widthMm, heightMm],
  })

  const marginX = 8
  const contentW = widthMm - marginX * 2

  // Background tint
  doc.setFillColor(252, 253, 255)
  doc.rect(0, 0, widthMm, heightMm, 'F')

  // Top accent border (thin gold bar)
  doc.setFillColor(231, 185, 62)
  doc.rect(0, 0, widthMm, 0.7, 'F')

  // Logo
  const logoX = marginX + 1
  const logoY = 2.5
  const logoSize = 22
  doc.setFillColor(255, 255, 255)
  doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 0.8, 'F')
  doc.setDrawColor(231, 185, 62)
  doc.setLineWidth(0.5)
  doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 0.8, 'S')
  try {
    doc.addImage(VSB_LOGO_BASE64, 'PNG', logoX + 1.5, logoY + 1.5, logoSize - 3, logoSize - 3)
  } catch {}

  // College name & dept
  const hCX = marginX + logoSize + (contentW - logoSize) / 2
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13.5)
  doc.setTextColor(7, 26, 61)
  doc.text('V.S.B. ENGINEERING COLLEGE', hCX, 6.2, { align: 'center' })

  // Autonomous badge
  doc.setFillColor(231, 185, 62)
  doc.roundedRect(hCX - 21, 8.2, 42, 3.8, 0.8, 0.8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(7, 26, 61)
  doc.text('AN AUTONOMOUS INSTITUTION', hCX, 10.9, { align: 'center' })

  // Department
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(21, 87, 192)
  doc.text('DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE', hCX, 16.5, { align: 'center' })

  // AICTE & Anna Univ
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.8)
  doc.setTextColor(75, 85, 105)
  doc.text('Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai · Karur - 639 111, Tamil Nadu', hCX, 21.2, { align: 'center' })

  // Accreditation
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(100, 115, 135)
  doc.text('Accredited by NAAC with "A" Grade  ·  NBA Accredited Programs  ·  ISO 9001:2015 Certified', hCX, 25.5, { align: 'center' })

  // Separator beam
  const beamY = 30
  doc.setFillColor(21, 87, 192)
  doc.rect(marginX, beamY, contentW, 1.3, 'F')
  doc.setFillColor(231, 185, 62)
  doc.rect(marginX, beamY + 1.3, contentW, 0.6, 'F')
  doc.setFillColor(231, 185, 62)
  doc.circle(marginX + contentW / 2, beamY + 0.9, 1.6, 'F')
  doc.setFillColor(7, 26, 61)
  doc.circle(marginX + contentW / 2, beamY + 0.9, 0.8, 'F')

  return doc
}

/**
 * buildDeptHeaderCoverDoc
 * Creates a branded official V.S.B. Department Letterhead sheet jsPDF document for preview.
 */
export function buildDeptHeaderCoverDoc(options: DeptHeaderDownloadOptions): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
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

  // Clean, official institutional document overview card
  let curY = beamY + 12
  doc.setFillColor(248, 250, 254)
  doc.roundedRect(marginX + 10, curY, contentW - 20, 48, 3, 3, 'F')
  doc.setDrawColor(215, 226, 242)
  doc.setLineWidth(0.4)
  doc.roundedRect(marginX + 10, curY, contentW - 20, 48, 3, 3, 'S')

  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(7, 26, 61)
  const fullSubj = `${options.subjectCode ? `[${options.subjectCode}] ` : ''}${options.subjectName || options.title || 'Official Academic Study Resource'}`.trim()
  doc.text(fullSubj, pageWidth / 2, curY + 10, { align: 'center' })

  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(21, 87, 192)
  doc.text((options.resourceType || 'ACADEMIC REPOSITORY RECORD').replace(/_/g, ' ').toUpperCase(), pageWidth / 2, curY + 18, { align: 'center' })

  const metaParts: string[] = []
  if (options.semester) metaParts.push(`Semester ${options.semester}`)
  if (options.academicYear) metaParts.push(`Academic Year: ${options.academicYear}`)
  metaParts.push('Regulation: R-2021 Autonomous')
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(100, 115, 135)
  doc.text(metaParts.join('  ·  '), pageWidth / 2, curY + 26, { align: 'center' })

  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(71, 85, 105)
  doc.text(`Authenticated Document · Department of AI & DS · Centralized Academic Repository`, pageWidth / 2, curY + 34, { align: 'center' })

  drawDigitalPortalDocumentNotice(doc, {
    y: pageHeight - 35,
    contentW,
    marginX,
    recordType: options.resourceType || 'ACADEMIC STUDY RECORD',
    verificationCode: 'VSB-DIGITAL-PORTAL-E-RECORD',
    repositoryName: 'Centralized Autonomous Digital Library',
    issuingAuthority: 'Department of Artificial Intelligence & Data Science',
    boxHeight: 24,
    isCompact: false,
  })

  // Footer on cover
  doc.setFont('helvetica', 'normal'); doc.setFontSize(5.6); doc.setTextColor(140, 155, 175)
  doc.text('DIGITAL PORTAL DOCUMENT · V.S.B. ENGINEERING COLLEGE (AUTONOMOUS) · AI & DS PORTAL', pageWidth / 2, pageHeight - 5.5, { align: 'center' })

  return doc
}

/**
 * Generates data URI for the official department header cover page
 */
export function generateCoverPageDataUri(options: DeptHeaderDownloadOptions): string {
  const doc = buildDeptHeaderCoverDoc(options)
  return doc.output('datauristring')
}

export async function downloadWithDeptHeader(options: DeptHeaderDownloadOptions): Promise<void> {
  const { fileUrl, fileName } = options

  try {
    const resp = await fetch(fileUrl)
    if (!resp.ok) {
      throw new Error('Failed to fetch the original resource file.')
    }

    const originalPdfBytes = await resp.arrayBuffer()
    
    // If file is larger than 40MB, fallback to direct download to prevent browser OOM
    if (originalPdfBytes.byteLength > 40 * 1024 * 1024) {
      console.warn('File exceeds 40MB, downloading original file directly.')
      const blob = new Blob([originalPdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return
    }

    // Dynamically import pdf-lib to avoid SSR issues
    const { PDFDocument } = await import('pdf-lib')

    // Load original PDF
    const originalDoc = await PDFDocument.load(originalPdfBytes, { ignoreEncryption: true })
    const pageCount = originalDoc.getPageCount()
    if (pageCount === 0) {
      throw new Error('PDF document has no pages.')
    }

    // Get primary page width from the first page
    const firstPage = originalDoc.getPage(0)
    const { width: firstW } = firstPage.getSize()
    const widthMm = (firstW * 25.4) / 72
    const headerHeightMm = 34

    // Build the official V.S.B. Department Letterhead Banner
    const headerDoc = buildDeptHeaderBannerDoc(widthMm, headerHeightMm)
    const headerPdfBytes = headerDoc.output('arraybuffer')

    const loadedHeaderDoc = await PDFDocument.load(headerPdfBytes)
    const mergedPdf = await PDFDocument.create()
    const embeddedHeader = await mergedPdf.embedPage(loadedHeaderDoc.getPage(0))

    // Copy all original pages (NO separate blank cover page prepended)
    const pageIndices = Array.from({ length: pageCount }, (_, i) => i)
    const copiedPages = await mergedPdf.copyPages(originalDoc, pageIndices)

    const headerHeightPt = (headerHeightMm * 72) / 25.4

    // Apply official header to ALL pages of the PDF
    for (let i = 0; i < copiedPages.length; i++) {
      const page = copiedPages[i]
      mergedPdf.addPage(page)
      const { width, height } = page.getSize()

      // Scale content slightly and offset downwards to comfortably accommodate the header without obscuring content
      const scale = 0.88
      const offsetX = (width * (1 - scale)) / 2
      const offsetY = 12

      try {
        page.scaleContent(scale, scale)
        page.translateContent(offsetX / scale, offsetY / scale)
      } catch (scaleErr) {
        console.warn('Could not transform page content, drawing header directly:', scaleErr)
      }

      // Draw official header banner across the top of this page
      page.drawPage(embeddedHeader, {
        x: 0,
        y: height - headerHeightPt,
        width: width,
        height: headerHeightPt,
      })
    }

    // Save and download merged PDF
    const mergedPdfBytes = await mergedPdf.save()
    const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error applying header to all PDF pages:', err)
    // Fallback to direct download if PDF merge/stamp fails
    const a = document.createElement('a')
    a.href = fileUrl
    a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

// ============================================================================
// 10. AUTHENTIC INSTITUTIONAL COLLEGE MARKSHEET / GRADE SHEET GENERATOR
// ============================================================================

export interface CollegeMarksheetCourse {
  code: string
  name: string
  credits: number
  courseType?: string
  grade: string
  gradePoint: number
  creditPoints: number
  result: 'PASS' | 'RA' | 'SA' | 'W'
}

export interface CollegeMarksheetPDFData {
  registerNumber: string
  studentName: string
  degree?: string
  branch?: string
  semester: number
  academicYear?: string
  regulation?: string
  examSession?: string
  gradingSystem?: 'absolute_ii_year' | 'relative_iii_iv_year' | string
  courses: CollegeMarksheetCourse[]
  totalRegisteredCredits: number
  totalEarnedCredits: number
  totalGradePoints: number
  sgpa: number
  cgpa?: number
  classification?: string
  folioNumber?: string
  dateOfIssue?: string
  fileName?: string
}

/**
 * Generates an authentic, official collegiate Grade Sheet matching
 * Anna University / V.S.B. Autonomous standards with full institutional borders,
 * tabular course breakdown, SGPA calculation, grading scale legend,
 * and Controller of Examinations authentication seals.
 */
export function generateOfficialCollegeMarksheetPDF(data: CollegeMarksheetPDFData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 10
  const contentW = pageWidth - marginX * 2 // 190mm

  // ── 1. Official Institutional Double Frame ──────────────────────────────────
  // Outer navy border
  doc.setDrawColor(7, 26, 61)
  doc.setLineWidth(0.7)
  doc.rect(marginX - 2, marginX - 2, contentW + 4, pageHeight - (marginX - 2) * 2, 'S')

  // Inner gold hairline border
  doc.setDrawColor(218, 165, 32)
  doc.setLineWidth(0.3)
  doc.rect(marginX - 0.7, marginX - 0.7, contentW + 1.4, pageHeight - (marginX - 0.7) * 2, 'S')

  // Corner decorative marks
  const corners = [
    [marginX - 1.5, marginX - 1.5],
    [marginX + contentW + 1.5, marginX - 1.5],
    [marginX - 1.5, pageHeight - marginX + 1.5],
    [marginX + contentW + 1.5, pageHeight - marginX + 1.5],
  ]
  doc.setFillColor(218, 165, 32)
  corners.forEach(([cx, cy]) => {
    doc.circle(cx, cy, 0.8, 'F')
  })

  // ── 2. Prestigious Institutional Letterhead ─────────────────────────────────
  doc.setFillColor(252, 253, 255)
  doc.rect(marginX, marginX, contentW, 31, 'F')

  // College Crest Mount
  const logoX = marginX + 2.5
  const logoY = marginX + 2
  const logoSize = 22

  doc.setFillColor(255, 255, 255)
  doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 1, 'F')
  doc.setDrawColor(218, 165, 32)
  doc.setLineWidth(0.5)
  doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 1, 'S')

  try {
    doc.addImage(VSB_LOGO_BASE64, 'PNG', logoX + 2, logoY + 2, logoSize - 4, logoSize - 4)
  } catch (e) {
    console.error('Failed to embed logo in marksheet PDF:', e)
  }

  // Header Center Typography
  const headerCenterX = marginX + logoSize + (contentW - logoSize) / 2

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14.5)
  doc.setTextColor(7, 26, 61)
  doc.text('V.S.B. ENGINEERING COLLEGE', headerCenterX, marginX + 5.2, { align: 'center' })

  // Autonomous Pill
  doc.setFillColor(231, 185, 62)
  doc.roundedRect(headerCenterX - 23, marginX + 7, 46, 3.8, 1, 1, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(7, 26, 61)
  doc.text('AN AUTONOMOUS INSTITUTION', headerCenterX, marginX + 9.8, { align: 'center' })

  // Department
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.8)
  doc.setTextColor(21, 87, 192)
  doc.text('DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE', headerCenterX, marginX + 15.2, { align: 'center' })

  // Affiliation & Accreditation
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(75, 85, 105)
  doc.text('Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai · Karur - 639 111, Tamil Nadu', headerCenterX, marginX + 19.5, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.2)
  doc.setTextColor(100, 115, 135)
  doc.text('Accredited by NAAC with "A" Grade  ·  NBA Accredited Programs  ·  ISO 9001:2015 Certified', headerCenterX, marginX + 23.5, { align: 'center' })

  // Gold & Blue Beam
  const beamY = marginX + 26
  doc.setFillColor(21, 87, 192)
  doc.rect(marginX, beamY, contentW, 1.2, 'F')
  doc.setFillColor(231, 185, 62)
  doc.rect(marginX, beamY + 1.2, contentW, 0.6, 'F')

  let currentY = beamY + 5.5

  // ── 3. Examination Authority & Document Title Banner ────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(14, 44, 102)
  doc.text('OFFICE OF THE CONTROLLER OF EXAMINATIONS', marginX + contentW / 2, currentY, { align: 'center' })
  currentY += 4.5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12.5)
  doc.setTextColor(7, 26, 61)
  doc.text('GRADE SHEET / STATEMENT OF GRADES', marginX + contentW / 2, currentY, { align: 'center' })
  currentY += 4

  const examSessionText = data.examSession || `B.Tech. DEGREE EXAMINATIONS — SEMESTER 0${data.semester} (${data.academicYear || '2025-2026'})`
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(21, 87, 192)
  doc.text(examSessionText, marginX + contentW / 2, currentY, { align: 'center' })
  currentY += 4.5

  // Metadata Strip (Folio, Regulation, Issue Date)
  const metaStripH = 6.2
  doc.setFillColor(245, 248, 255)
  doc.rect(marginX, currentY, contentW, metaStripH, 'F')
  doc.setDrawColor(215, 226, 242)
  doc.setLineWidth(0.3)
  doc.rect(marginX, currentY, contentW, metaStripH, 'S')

  const now = new Date()
  const todayStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const folio = data.folioNumber || `VSB-COE/${data.academicYear ? data.academicYear.split('-')[0] : '2026'}/G-${data.registerNumber}`

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(71, 85, 105)
  doc.text('FOLIO NO:', marginX + 3, currentY + 4.2)
  doc.setTextColor(7, 26, 61)
  doc.text(folio, marginX + 17, currentY + 4.2)

  doc.setTextColor(71, 85, 105)
  doc.text('REGULATION:', marginX + contentW / 2 - 15, currentY + 4.2)
  doc.setTextColor(7, 26, 61)
  doc.text(data.regulation || '2023 (Autonomous)', marginX + contentW / 2 + 5, currentY + 4.2)

  doc.setTextColor(71, 85, 105)
  doc.text('DATE OF ISSUE:', marginX + contentW - 38, currentY + 4.2)
  doc.setTextColor(7, 26, 61)
  doc.text(data.dateOfIssue || todayStr, marginX + contentW - 3, currentY + 4.2, { align: 'right' })

  currentY += metaStripH + 3

  // ── 4. Student Academic Credentials Matrix (Clean 4-Cell Grid) ──────────────
  const credBoxH = 13.5
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(marginX, currentY, contentW, credBoxH, 1, 1, 'FD')
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.3)
  doc.roundedRect(marginX, currentY, contentW, credBoxH, 1, 1, 'S')

  // Vertical separator
  doc.line(marginX + contentW / 2, currentY, marginX + contentW / 2, currentY + credBoxH)
  // Horizontal divider
  doc.line(marginX, currentY + credBoxH / 2, marginX + contentW, currentY + credBoxH / 2)

  // Cell 1: Register Number
  const r1Y = currentY + 4.6
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(100, 116, 139)
  doc.text('REGISTER NUMBER:', marginX + 3.5, r1Y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.8)
  doc.setTextColor(7, 26, 61)
  doc.text(data.registerNumber, marginX + 32, r1Y)

  // Cell 2: Student Name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(100, 116, 139)
  doc.text('STUDENT NAME:', marginX + contentW / 2 + 3.5, r1Y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.8)
  doc.setTextColor(7, 26, 61)
  doc.text((data.studentName || 'STUDENT').toUpperCase(), marginX + contentW / 2 + 28, r1Y)

  // Cell 3: Degree & Branch
  const r2Y = currentY + credBoxH / 2 + 4.6
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(100, 116, 139)
  doc.text('DEGREE & BRANCH:', marginX + 3.5, r2Y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.2)
  doc.setTextColor(21, 87, 192)
  doc.text('B.Tech. Artificial Intelligence & Data Science', marginX + 32, r2Y)

  // Cell 4: Semester & Session
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(100, 116, 139)
  doc.text('SEMESTER / YEAR:', marginX + contentW / 2 + 3.5, r2Y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.2)
  doc.setTextColor(7, 26, 61)
  doc.text(`Semester ${data.semester} (Year ${Math.ceil(data.semester / 2)}) · ${data.academicYear || '2025-2026'}`, marginX + contentW / 2 + 28, r2Y)

  currentY += credBoxH + 3.5

  // ── 5. Official Course-Wise Grade Performance Table ─────────────────────────
  // Columns: [S.NO, CODE, TITLE, TYPE, CREDITS, GRADE, GP, CREDIT-PTS, RESULT]
  // Total widths = 10 + 22 + 74 + 18 + 14 + 14 + 12 + 14 + 12 = 190mm
  const colWidths = [10, 22, 74, 18, 14, 14, 12, 14, 12]
  const colHeaders = [
    'S.NO',
    'COURSE CODE',
    'COURSE TITLE',
    'CATEGORY',
    'CREDITS (C)',
    'GRADE (G)',
    'GP',
    'PTS (C×G)',
    'RESULT',
  ]

  // Table Header Row
  const thH = 7.2
  doc.setFillColor(7, 26, 61) // Deep Navy
  doc.rect(marginX, currentY, contentW, thH, 'F')
  doc.setDrawColor(7, 26, 61)
  doc.setLineWidth(0.3)
  doc.rect(marginX, currentY, contentW, thH, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.2)
  doc.setTextColor(255, 255, 255)

  let curX = marginX
  colHeaders.forEach((hdr, idx) => {
    const w = colWidths[idx]
    if (idx === 2) {
      // Title left aligned
      doc.text(hdr, curX + 2.5, currentY + 4.8)
    } else {
      doc.text(hdr, curX + w / 2, currentY + 4.8, { align: 'center' })
    }
    // Vertical divider inside header
    if (idx > 0) {
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(0.15)
      doc.line(curX, currentY + 1, curX, currentY + thH - 1)
    }
    curX += w
  })

  currentY += thH

  // Course Rows
  const rowH = 6.2
  const courses = data.courses || []

  courses.forEach((course, cIdx) => {
    // Check if new page is needed
    if (currentY + rowH > pageHeight - 65) {
      doc.addPage()
      // Outer border on subsequent page
      doc.setDrawColor(7, 26, 61)
      doc.setLineWidth(0.7)
      doc.rect(marginX - 2, marginX - 2, contentW + 4, pageHeight - (marginX - 2) * 2, 'S')
      doc.setDrawColor(218, 165, 32)
      doc.setLineWidth(0.3)
      doc.rect(marginX - 0.7, marginX - 0.7, contentW + 1.4, pageHeight - (marginX - 0.7) * 2, 'S')
      currentY = drawRunningPageHeader(doc, marginX, contentW)
    }

    const isEven = cIdx % 2 === 0
    doc.setFillColor(isEven ? 255 : 249, isEven ? 255 : 250, isEven ? 255 : 252)
    doc.rect(marginX, currentY, contentW, rowH, 'F')

    // Cell outer border
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.2)
    doc.rect(marginX, currentY, contentW, rowH, 'S')

    let rowX = marginX
    const gradeUpper = (course.grade || '').toUpperCase()
    const isPassing = !['U', 'RA', 'SA', 'W'].includes(gradeUpper) && course.gradePoint > 0

    // 0: S.No
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.8)
    doc.setTextColor(71, 85, 105)
    doc.text(String(cIdx + 1), rowX + colWidths[0] / 2, currentY + 4.2, { align: 'center' })
    rowX += colWidths[0]

    // 1: Course Code
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.8)
    doc.setTextColor(7, 26, 61)
    doc.text(course.code || '—', rowX + colWidths[1] / 2, currentY + 4.2, { align: 'center' })
    rowX += colWidths[1]

    // 2: Course Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.7)
    doc.setTextColor(30, 41, 59)
    const title = doc.splitTextToSize(course.name || 'Subject', colWidths[2] - 4)
    doc.text(title[0] || '', rowX + 2, currentY + 4.2)
    rowX += colWidths[2]

    // 3: Category
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.2)
    doc.setTextColor(100, 116, 139)
    doc.text(course.courseType || 'Theory', rowX + colWidths[3] / 2, currentY + 4.2, { align: 'center' })
    rowX += colWidths[3]

    // 4: Credits
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.8)
    doc.setTextColor(7, 26, 61)
    doc.text(String(course.credits), rowX + colWidths[4] / 2, currentY + 4.2, { align: 'center' })
    rowX += colWidths[4]

    // 5: Letter Grade with badge
    const badgeW = 9.5
    const badgeH = 4.2
    const badgeX = rowX + (colWidths[5] - badgeW) / 2
    const badgeY = currentY + (rowH - badgeH) / 2

    if (gradeUpper === 'O' || gradeUpper === 'A+') {
      doc.setFillColor(236, 253, 245)
      doc.setDrawColor(16, 185, 129)
      doc.setTextColor(4, 120, 87)
    } else if (gradeUpper === 'A' || gradeUpper === 'B+') {
      doc.setFillColor(239, 246, 255)
      doc.setDrawColor(59, 130, 246)
      doc.setTextColor(29, 78, 216)
    } else if (gradeUpper === 'B' || gradeUpper === 'C') {
      doc.setFillColor(254, 252, 232)
      doc.setDrawColor(234, 179, 8)
      doc.setTextColor(161, 98, 7)
    } else {
      doc.setFillColor(254, 242, 242)
      doc.setDrawColor(239, 68, 68)
      doc.setTextColor(185, 28, 28)
    }

    doc.setLineWidth(0.2)
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 0.8, 0.8, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.8)
    doc.text(course.grade || '—', badgeX + badgeW / 2, badgeY + 3.0, { align: 'center' })
    rowX += colWidths[5]

    // 6: Grade Point
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.8)
    doc.setTextColor(7, 26, 61)
    doc.text(String(course.gradePoint), rowX + colWidths[6] / 2, currentY + 4.2, { align: 'center' })
    rowX += colWidths[6]

    // 7: Points (C x G)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.8)
    doc.setTextColor(21, 87, 192)
    doc.text(course.creditPoints.toFixed(1), rowX + colWidths[7] / 2, currentY + 4.2, { align: 'center' })
    rowX += colWidths[7]

    // 8: Result (PASS / RA)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.4)
    if (isPassing) {
      doc.setTextColor(5, 150, 105)
      doc.text('PASS', rowX + colWidths[8] / 2, currentY + 4.2, { align: 'center' })
    } else {
      doc.setTextColor(220, 38, 38)
      doc.text('RA', rowX + colWidths[8] / 2, currentY + 4.2, { align: 'center' })
    }

    currentY += rowH
  })

  // Table Footer Row: Cumulative Totals
  const tFootH = 6.8
  doc.setFillColor(241, 245, 252)
  doc.rect(marginX, currentY, contentW, tFootH, 'F')
  doc.setDrawColor(180, 200, 230)
  doc.setLineWidth(0.3)
  doc.rect(marginX, currentY, contentW, tFootH, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(7, 26, 61)
  doc.text('SEMESTER TOTALS:', marginX + 3.5, currentY + 4.5)

  const footX1 = marginX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]
  doc.text(String(data.totalRegisteredCredits), footX1 + colWidths[4] / 2, currentY + 4.5, { align: 'center' })

  const footX2 = footX1 + colWidths[4] + colWidths[5] + colWidths[6]
  doc.setTextColor(21, 87, 192)
  doc.text(data.totalGradePoints.toFixed(1), footX2 + colWidths[7] / 2, currentY + 4.5, { align: 'center' })

  const allPassed = courses.every((c) => c.gradePoint > 0 && !['U', 'RA', 'SA', 'W'].includes((c.grade || '').toUpperCase()))
  doc.setTextColor(allPassed ? 5 : 220, allPassed ? 150 : 38, allPassed ? 105 : 38)
  doc.text(allPassed ? 'ALL PASS' : 'RE-APPEAR', footX2 + colWidths[7] + colWidths[8] / 2, currentY + 4.5, { align: 'center' })

  currentY += tFootH + 3.5

  // ── 6. Official Academic Performance Ledger & Result Classification ─────────
  const summaryBoxH = 14
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(marginX, currentY, contentW, summaryBoxH, 1, 1, 'FD')
  doc.setDrawColor(21, 87, 192)
  doc.setLineWidth(0.4)
  doc.roundedRect(marginX, currentY, contentW, summaryBoxH, 1, 1, 'S')

  // Top Accent stripe
  doc.setFillColor(21, 87, 192)
  doc.rect(marginX, currentY, contentW, 1.2, 'F')

  // 4 Horizontal KPI blocks
  const cellW = contentW / 4
  const stats = [
    { label: 'REGISTERED CREDITS', value: `${data.totalRegisteredCredits} Credits`, color: [7, 26, 61] },
    { label: 'EARNED CREDITS', value: `${data.totalEarnedCredits} Credits`, color: [5, 122, 85] },
    { label: 'CUMULATIVE POINTS (Ci×Gi)', value: `${data.totalGradePoints.toFixed(1)} Pts`, color: [21, 87, 192] },
    { label: 'SEMESTER SGPA', value: `${data.sgpa.toFixed(2)} / 10.00`, color: [16, 185, 129] },
  ]

  stats.forEach((st, sIdx) => {
    const sX = marginX + sIdx * cellW
    if (sIdx > 0) {
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.2)
      doc.line(sX, currentY + 1.2, sX, currentY + summaryBoxH)
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(5.8)
    doc.setTextColor(100, 116, 139)
    doc.text(st.label, sX + cellW / 2, currentY + 5.2, { align: 'center' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.8)
    doc.setTextColor(st.color[0], st.color[1], st.color[2])
    doc.text(st.value, sX + cellW / 2, currentY + 10.2, { align: 'center' })
  })

  currentY += summaryBoxH + 2.5

  // Result Standing Banner
  const bannerH = 6.2
  doc.setFillColor(allPassed ? 240 : 254, allPassed ? 253 : 242, allPassed ? 244 : 242)
  doc.roundedRect(marginX, currentY, contentW, bannerH, 0.8, 0.8, 'F')
  doc.setDrawColor(allPassed ? 16 : 239, allPassed ? 185 : 68, allPassed ? 129 : 68)
  doc.setLineWidth(0.3)
  doc.roundedRect(marginX, currentY, contentW, bannerH, 0.8, 0.8, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(7, 26, 61)
  doc.text('OFFICIAL RESULT CLASSIFICATION:', marginX + 4, currentY + 4.2)

  const classificationText = data.classification || (data.sgpa >= 8.5 ? 'FIRST CLASS WITH DISTINCTION' : data.sgpa >= 6.5 ? 'FIRST CLASS' : data.sgpa >= 5.0 ? 'SECOND CLASS' : 'RE-APPEAR')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.2)
  doc.setTextColor(allPassed ? 5 : 220, allPassed ? 122 : 38, allPassed ? 85 : 38)
  doc.text(allPassed ? `PASS — ${classificationText}` : 'RE-APPEAR REQUIRED', marginX + 54, currentY + 4.2)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.2)
  doc.setTextColor(100, 116, 139)
  doc.text('Status: Verified against V.S.B. Autonomous ERP Ledger', marginX + contentW - 4, currentY + 4.2, { align: 'right' })

  currentY += bannerH + 3

  // ── 7. Statutory 10-Point Scale Autonomous Grading Scale Legend ─────────────
  const legendH = 11.5
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(marginX, currentY, contentW, legendH, 1, 1, 'FD')
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.2)
  doc.roundedRect(marginX, currentY, contentW, legendH, 1, 1, 'S')

  const lCols = [
    { grade: 'O', pts: '10', range: '91-100', desc: 'Outstanding' },
    { grade: 'A+', pts: '9', range: '81-90', desc: 'Excellent' },
    { grade: 'A', pts: '8', range: '71-80', desc: 'Very Good' },
    { grade: 'B+', pts: '7', range: '61-70', desc: 'Good' },
    { grade: 'B', pts: '6', range: '50-60', desc: 'Above Avg' },
    { grade: 'C', pts: '5', range: '45-49', desc: 'Average' },
    { grade: 'U', pts: '0', range: '<45', desc: 'Re-appear' },
    { grade: 'SA', pts: '0', range: 'Shortage', desc: 'Attendance' },
    { grade: 'W', pts: '—', range: 'Withdrawal', desc: 'Withdrawn' },
  ]

  const legCellW = contentW / (lCols.length + 1)

  // Label column
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.5)
  doc.setTextColor(71, 85, 105)
  doc.text('LETTER GRADE', marginX + 2, currentY + 3.2)
  doc.text('GRADE POINT', marginX + 2, currentY + 6.6)
  doc.text('PERFORMANCE', marginX + 2, currentY + 10.0)

  lCols.forEach((col, lIdx) => {
    const lx = marginX + legCellW + lIdx * ((contentW - legCellW) / lCols.length)
    const cw = (contentW - legCellW) / lCols.length

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(5.8)
    doc.setTextColor(col.grade === 'U' ? 220 : 7, col.grade === 'U' ? 38 : 26, col.grade === 'U' ? 38 : 61)
    doc.text(col.grade, lx + cw / 2, currentY + 3.2, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.6)
    doc.setTextColor(71, 85, 105)
    doc.text(col.pts, lx + cw / 2, currentY + 6.6, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(4.8)
    doc.setTextColor(100, 116, 139)
    doc.text(col.desc, lx + cw / 2, currentY + 10.0, { align: 'center' })
  })

  currentY += legendH + 3.5

  // ── 8. Official Signatures & COE Digital Seal Block ─────────────────────────
  const sigH = 19
  const sigColW = contentW / 3

  // Col 1: Class Advisor
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.3)
  doc.line(marginX + 6, currentY + 10, marginX + sigColW - 6, currentY + 10)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(7, 26, 61)
  doc.text('FACULTY CLASS ADVISOR', marginX + sigColW / 2, currentY + 13.5, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.8)
  doc.setTextColor(100, 116, 139)
  doc.text('Dept. of Artificial Intelligence & Data Science', marginX + sigColW / 2, currentY + 16.8, { align: 'center' })

  // Col 2: Autonomous COE Institutional Seal
  const sealCenterX = marginX + contentW / 2
  const sealCenterY = currentY + 8
  const sealR = 8.5

  doc.setFillColor(250, 252, 255)
  doc.circle(sealCenterX, sealCenterY, sealR, 'F')
  doc.setDrawColor(21, 87, 192)
  doc.setLineWidth(0.5)
  doc.circle(sealCenterX, sealCenterY, sealR, 'S')

  doc.setDrawColor(231, 185, 62)
  doc.setLineWidth(0.25)
  doc.circle(sealCenterX, sealCenterY, sealR - 1.5, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(4.4)
  doc.setTextColor(21, 87, 192)
  doc.text('V.S.B. ENGINEERING COLLEGE', sealCenterX, sealCenterY - 3.2, { align: 'center' })
  doc.text('AUTONOMOUS', sealCenterX, sealCenterY - 0.5, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(4.0)
  doc.setTextColor(231, 185, 62)
  doc.text('★ OFFICE OF COE ★', sealCenterX, sealCenterY + 2.2, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(4.2)
  doc.setTextColor(5, 122, 85)
  doc.text('OFFICIALLY VERIFIED', sealCenterX, sealCenterY + 4.8, { align: 'center' })

  // Col 3: Controller of Examinations
  const col3X = marginX + sigColW * 2
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.3)
  doc.line(col3X + 6, currentY + 10, col3X + sigColW - 6, currentY + 10)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(7, 26, 61)
  doc.text('CONTROLLER OF EXAMINATIONS', col3X + sigColW / 2, currentY + 13.5, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.8)
  doc.setTextColor(100, 116, 139)
  doc.text('V.S.B. Engineering College (Autonomous)', col3X + sigColW / 2, currentY + 16.8, { align: 'center' })

  currentY += sigH + 1

  // ── 9. Official Universal Digital Portal Notice Footer ───────────────────────
  drawDigitalPortalDocumentNotice(doc, {
    y: Math.min(currentY, pageHeight - 32),
    contentW,
    marginX,
    recordType: 'AUTONOMOUS SEMESTER GRADE SHEET RECORD',
    verificationCode: folio,
    repositoryName: 'Centralized Autonomous Examination ERP',
    issuingAuthority: 'Office of the Controller of Examinations',
    boxHeight: 22,
  })

  // ── 10. Save and Trigger Download ───────────────────────────────────────────
  const downloadFileName = data.fileName || `VSB_AIDS_Sem${data.semester}_Official_GradeSheet_${data.registerNumber}`
  const finalName = downloadFileName.endsWith('.pdf') ? downloadFileName : `${downloadFileName}.pdf`
  doc.save(finalName)
}
