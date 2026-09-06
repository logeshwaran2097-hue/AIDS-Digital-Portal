export interface ParsedQuestion {
  id?: string
  unit: string
  type: '2_mark' | '16_mark'
  marks: number
  q: string
  bloom: string
  co?: string
}

const BLOOM_MAP: Record<string, string> = {
  l1: 'L1: Remember',
  remember: 'L1: Remember',
  recalling: 'L1: Remember',
  l2: 'L2: Understand',
  understand: 'L2: Understand',
  comprehend: 'L2: Understand',
  l3: 'L3: Apply',
  apply: 'L3: Apply',
  application: 'L3: Apply',
  l4: 'L4: Analyze',
  analyze: 'L4: Analyze',
  analysis: 'L4: Analyze',
  l5: 'L5: Evaluate',
  evaluate: 'L5: Evaluate',
  evaluation: 'L5: Evaluate',
  l6: 'L6: Create',
  create: 'L6: Create',
  synthesis: 'L6: Create',
}

const ROMAN_NUMS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

function toRoman(num: number): string {
  return ROMAN_NUMS[num - 1] || String(num)
}

function parseUnitNumber(str: string): string {
  const match = str.match(/([ivx]+|\d+)/i)
  if (!match) return 'Unit I'
  const val = match[1].toUpperCase()
  if (/^\d+$/.test(val)) {
    const n = parseInt(val, 10)
    return `Unit ${toRoman(n)}`
  }
  return `Unit ${val}`
}

/**
 * Parses raw text from a Question Bank document into structured questions
 */
export function parseQuestionBankText(rawText: string): ParsedQuestion[] {
  if (!rawText || !rawText.trim()) return []

  const lines = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const results: ParsedQuestion[] = []

  let currentUnit = 'Unit I'
  let currentType: '2_mark' | '16_mark' = '2_mark'
  let currentMarks = 2

  let pendingQuestion: {
    unit: string
    type: '2_mark' | '16_mark'
    marks: number
    q: string
    bloom: string
    co?: string
  } | null = null

  const commitPending = () => {
    if (pendingQuestion && pendingQuestion.q.trim().length > 5) {
      let cleanQ = pendingQuestion.q
        .replace(/^\d+[\.\)]\s*/, '')
        .replace(/^\([a-z0-9]+\)\s*/i, '')
        .replace(/^[Qq]\d+[\.\:\-]?\s*/, '')
        .replace(/\[\s*\d+\s*marks?\s*\]/gi, '')
        .replace(/\(\s*\d+\s*marks?\s*\)/gi, '')
        .replace(/\s+/g, ' ')
        .trim()

      if (cleanQ.length > 5) {
        results.push({
          ...pendingQuestion,
          q: cleanQ,
        })
      }
    }
    pendingQuestion = null
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // 1. Detect Unit Heading: e.g. "UNIT - I", "UNIT 1", "MODULE II"
    if (
      /^(?:unit|module|chapter)\s*[-:]?\s*([ivx]+|\d+)/i.test(line) ||
      /^===*\s*(?:unit|module)\s*([ivx]+|\d+)/i.test(line)
    ) {
      commitPending()
      currentUnit = parseUnitNumber(line)
      // Reset to Part A at start of a new unit
      currentType = '2_mark'
      currentMarks = 2
      continue
    }

    // 2. Detect Section / Part Heading: e.g. "PART - A (2 Marks)", "PART B", "16 Marks"
    if (
      /part\s*[-:]?\s*a\b/i.test(line) ||
      /(?:2\s*marks?|two\s*marks?)\s*(?:questions?)?/i.test(line)
    ) {
      commitPending()
      currentType = '2_mark'
      currentMarks = 2
      continue
    }

    if (
      /part\s*[-:]?\s*[bc]\b/i.test(line) ||
      /(?:16\s*marks?|13\s*marks?|sixteen\s*marks?)\s*(?:questions?)?/i.test(line)
    ) {
      commitPending()
      currentType = '16_mark'
      currentMarks = 16
      continue
    }

    // Skip generic document headers / footers
    if (
      /^(vsb|v\.s\.b\.|department of|academic year|question bank|subject code|faculty name|page \d+)/i.test(
        line
      ) &&
      line.length < 60
    ) {
      continue
    }

    // 3. Detect start of a new question
    const isNewQuestion =
      /^(?:\d+[\.\)]|\([a-z0-9]+\)|[Qq]\d+[\.\:\-]|\*\s+)/.test(line) ||
      (line.endsWith('?') && line.length > 20)

    if (isNewQuestion) {
      commitPending()

      // Extract Bloom's level if tagged in the line
      let bloom = currentType === '2_mark' ? 'L2: Understand' : 'L3: Apply'
      const bloomMatch = line.match(/\b(l[1-6]|remember|understand|apply|analyze|evaluate|create)\b/i)
      if (bloomMatch) {
        const key = bloomMatch[1].toLowerCase()
        if (BLOOM_MAP[key]) {
          bloom = BLOOM_MAP[key]
        }
      }

      // Extract CO if tagged
      let co: string | undefined = undefined
      const coMatch = line.match(/\b(CO[1-6])\b/i)
      if (coMatch) {
        co = coMatch[1].toUpperCase()
      }

      // Determine marks if explicitly mentioned in brackets or text
      let marks = currentMarks
      let qType = currentType
      if (/\b(?:16|13|15)\s*marks?\b/i.test(line)) {
        marks = 16
        qType = '16_mark'
      } else if (/\b2\s*marks?\b/i.test(line)) {
        marks = 2
        qType = '2_mark'
      } else if (currentType === '2_mark' && line.length > 150) {
        // Unusually long question in part A is likely a 16-mark problem
        if (/explain|discuss|elaborate|derive|design|prove/i.test(line)) {
          marks = 16
          qType = '16_mark'
        }
      }

      pendingQuestion = {
        unit: currentUnit,
        type: qType,
        marks,
        q: line,
        bloom,
        co: co || (currentUnit === 'Unit I' ? 'CO1' : currentUnit === 'Unit II' ? 'CO2' : currentUnit === 'Unit III' ? 'CO3' : currentUnit === 'Unit IV' ? 'CO4' : 'CO5'),
      }
    } else if (pendingQuestion) {
      // Continuation of the current question across multiple lines
      pendingQuestion.q += ' ' + line
    } else if (line.length > 15 && (line.includes('?') || /^(what|define|explain|state|list|compare|describe|derive|how)/i.test(line))) {
      // Standalone question without explicit numbering
      commitPending()
      pendingQuestion = {
        unit: currentUnit,
        type: currentType,
        marks: currentMarks,
        q: line,
        bloom: currentType === '2_mark' ? 'L2: Understand' : 'L3: Apply',
        co: currentUnit === 'Unit I' ? 'CO1' : currentUnit === 'Unit II' ? 'CO2' : currentUnit === 'Unit III' ? 'CO3' : currentUnit === 'Unit IV' ? 'CO4' : 'CO5',
      }
    }
  }

  commitPending()

  return results
}
