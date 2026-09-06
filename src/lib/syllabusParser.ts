import mammoth from 'mammoth'

export interface ParsedUnit {
  unit: string
  title: string
  hours: number
  topics: string[]
  status: 'Completed' | 'In-Progress'
}

/**
 * Extracts raw text from an uploaded PDF, DOCX, or text buffer
 */
export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  const lowerName = fileName.toLowerCase()

  if (mimeType.includes('pdf') || lowerName.endsWith('.pdf')) {
    try {
      const pdfParse = require('pdf-parse')
      const pdfData = await (pdfParse as any)(buffer)
      return pdfData.text || ''
    } catch (err: any) {
      console.error('PDF text extraction error:', err)
      throw new Error('Could not parse PDF file. Ensure the PDF is not password-protected or corrupted.')
    }
  }

  if (
    mimeType.includes('word') ||
    mimeType.includes('officedocument') ||
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.doc')
  ) {
    try {
      const docxData = await mammoth.extractRawText({ buffer })
      return docxData.value || ''
    } catch (err: any) {
      console.error('DOCX text extraction error:', err)
      throw new Error('Could not parse Word document. Ensure the file is a valid .docx document.')
    }
  }

  // Fallback to UTF-8 text
  return buffer.toString('utf-8')
}

/**
 * Parses raw text extracted from PDF or DOCX into structured units and topics.
 */
export function parseSyllabusText(rawText: string): ParsedUnit[] {
  if (!rawText || !rawText.trim()) return []

  const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Detect Unit / Module headings
  // Examples:
  // UNIT I INTRODUCTION TO ALGORITHMS 9
  // UNIT - 1 : LINEAR DATA STRUCTURES (9 PERIODS)
  // MODULE 3: STATE SPACE SEARCH
  const unitRegex =
    /(?:^|\n)\s*(?:UNIT|MODULE|CHAPTER)\s*[-:]?\s*([IVXLCDM\d]+)[\s\:\-\–\—\.]*([\s\S]*?)(?=(?:\n\s*(?:UNIT|MODULE|CHAPTER)\s*[-:]?\s*[IVXLCDM\d]+|\n\s*(?:TEXT\s*BOOKS?|REFERENCES?|COURSE\s*OUTCOMES?|TOTAL\s*[\:\s]*\d+)|\s*$))/gi

  const units: ParsedUnit[] = []
  let match: RegExpExecArray | null

  while ((match = unitRegex.exec(cleanText)) !== null) {
    const rawNumber = match[1].trim()
    const content = match[2].trim()

    // Normalize unit label: 1 -> Unit I, 2 -> Unit II, or keep roman
    let unitLabel = `Unit ${rawNumber}`
    const numMap: Record<string, string> = {
      '1': 'I',
      '2': 'II',
      '3': 'III',
      '4': 'IV',
      '5': 'V',
      '6': 'VI',
      '7': 'VII',
      '8': 'VIII',
    }
    if (numMap[rawNumber]) {
      unitLabel = `Unit ${numMap[rawNumber]}`
    } else if (/^[IVXLCDM]+$/i.test(rawNumber)) {
      unitLabel = `Unit ${rawNumber.toUpperCase()}`
    }

    // Split content into title line and body
    const lines = content.split('\n').map((l) => l.trim()).filter(Boolean)
    let titleLine = lines[0] || 'Unit Concepts'
    const bodyLines = lines.slice(1).join(' ')

    // Extract hours from title line or end of title
    let hours = 9
    const hoursMatch = titleLine.match(/[\(\[\s](\d+)\s*(?:hours?|periods?|hrs?|p)?[\)\]\s]*$/i)
    if (hoursMatch) {
      hours = parseInt(hoursMatch[1], 10)
      titleLine = titleLine.replace(hoursMatch[0], '').trim()
    } else {
      const bodyHours = content.match(/(?:periods?|hours?)\s*[\:\s]*(\d+)/i)
      if (bodyHours) {
        hours = parseInt(bodyHours[1], 10)
      }
    }

    // Clean title line
    let cleanTitle = titleLine.replace(/^[\s\:\-\–\—\.\,\;\/]+|[\s\:\-\–\—\.\,\;\/]+$/g, '').trim()
    if (!cleanTitle) cleanTitle = `Unit ${rawNumber} Studies`

    // Extract topics from body
    const fullBody = (bodyLines || lines.join(' ')).replace(cleanTitle, '')

    // Split on bullets, dashes, semicolons, or periods followed by uppercase
    const rawTopics = fullBody
      .split(/(?:[\n;•·*▪►]|[-–—]\s+|\.\s+(?=[A-Z0-9]))/)
      .map((t) => t.trim().replace(/^[\s\-\–\—\•\*\d+\.\:\)]+/, '').trim())
      .filter((t) => t.length > 3 && !/^(total|hours|periods|unit|text\s*books|references)/i.test(t))

    // Deduplicate topics
    const topics: string[] = []
    const seen = new Set<string>()
    for (const t of rawTopics) {
      const lower = t.toLowerCase()
      if (!seen.has(lower)) {
        seen.add(lower)
        topics.push(t)
      }
    }

    units.push({
      unit: unitLabel,
      title: cleanTitle,
      hours: hours > 0 && hours <= 60 ? hours : 9,
      topics: topics.length > 0 ? topics : [cleanTitle, 'Fundamental Principles', 'Case Studies & Applications'],
      status: 'In-Progress',
    })
  }

  // If no units were found through regex (unstructured syllabus text), create a standard 5-unit segmentation
  if (units.length === 0 && cleanText.length > 50) {
    const paragraphs = cleanText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 20 && !/^(syllabus|regulation|course|department|credits)/i.test(p))

    const numUnits = Math.min(Math.max(paragraphs.length, 1), 5)
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V']

    for (let i = 0; i < numUnits; i++) {
      const pText = paragraphs[i] || `Unit ${romanNumerals[i]} Core Foundations`
      const pLines = pText.split('\n').map((l) => l.trim()).filter(Boolean)
      const title = pLines[0]?.slice(0, 60) || `Unit ${romanNumerals[i]}`
      const subTopics = pLines.slice(1).length > 0 ? pLines.slice(1) : [pText.slice(0, 100)]

      units.push({
        unit: `Unit ${romanNumerals[i]}`,
        title,
        hours: 9,
        topics: subTopics,
        status: 'In-Progress',
      })
    }
  }

  return units
}
