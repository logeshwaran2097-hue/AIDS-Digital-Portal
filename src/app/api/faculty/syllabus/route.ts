import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { extractTextFromFile, parseSyllabusText, ParsedUnit } from '@/lib/syllabusParser'

export const dynamic = 'force-dynamic'

// GET: Fetch syllabus units for a specific subject
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')?.trim().toUpperCase()

    if (!code) {
      return NextResponse.json({ success: false, message: 'Subject code is required' }, { status: 400 })
    }

    const subject = await prisma.subject.findFirst({
      where: { code },
    })

    if (!subject) {
      return NextResponse.json({ success: true, units: [] })
    }

    const units = await prisma.unit.findMany({
      where: { subjectId: subject.id },
      orderBy: { number: 'asc' },
    })

    const parsedUnits: ParsedUnit[] = units.map((u) => {
      let topicsArr: string[] = []
      try {
        topicsArr = JSON.parse(u.topics || '[]')
      } catch {
        topicsArr = []
      }
      return {
        unit: `Unit ${toRoman(u.number)}`,
        title: u.title,
        hours: 9,
        topics: topicsArr,
        status: 'In-Progress',
      }
    })

    return NextResponse.json({ success: true, units: parsedUnits })
  } catch (error: any) {
    console.error('Fetch syllabus error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch syllabus' }, { status: 500 })
  }
}

// POST: Upload syllabus file (PDF/DOCX) or structured JSON and extract units
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''
    let subjectCode = ''
    let subjectName = ''
    let extractedUnits: ParsedUnit[] = []
    let sourceFileName = 'Uploaded_Syllabus'
    let sourceFileSize = '0 KB'

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      subjectCode = (formData.get('subjectCode') as string || '').trim().toUpperCase()
      subjectName = (formData.get('subjectName') as string || '').trim()
      const file = formData.get('file') as File | null

      if (!subjectCode) {
        return NextResponse.json({ success: false, message: 'Subject code is required' }, { status: 400 })
      }

      if (!file) {
        return NextResponse.json({ success: false, message: 'Syllabus file (.pdf or .docx) is required' }, { status: 400 })
      }

      sourceFileName = file.name
      sourceFileSize = `${(file.size / 1024).toFixed(1)} KB`

      // Convert file into Buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Extract raw text
      const rawText = await extractTextFromFile(buffer, file.type, file.name)
      if (!rawText || rawText.trim().length < 15) {
        return NextResponse.json(
          {
            success: false,
            message: 'Could not extract text from document. Ensure the file contains readable text, not scanned images.',
          },
          { status: 400 }
        )
      }

      // Parse structured units from text
      extractedUnits = parseSyllabusText(rawText)

      if (extractedUnits.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'No units could be identified in the document. Please ensure headings like "UNIT I", "UNIT II" are present.',
          },
          { status: 400 }
        )
      }
    } else {
      // JSON body upload
      const body = await request.json()
      subjectCode = (body.subjectCode || '').trim().toUpperCase()
      subjectName = (body.subjectName || '').trim()
      extractedUnits = body.units || []
      sourceFileName = body.fileName || 'Manual_Entry'
    }

    if (!subjectCode || extractedUnits.length === 0) {
      return NextResponse.json({ success: false, message: 'Subject code and valid units are required' }, { status: 400 })
    }

    // Resolve or upsert subject in prisma.subject
    let subject = await prisma.subject.findFirst({ where: { code: subjectCode } })
    if (!subject) {
      const currentAY = await prisma.academicYear.findFirst({ where: { isCurrent: true } })
      const academicYearId = currentAY ? currentAY.id : 'cmtmnsw30000apv1wxafyfv59'

      subject = await prisma.subject.create({
        data: {
          code: subjectCode,
          name: subjectName || subjectCode,
          credits: 3,
          academicYearId,
          description: 'Curriculum Course with Uploaded Syllabus',
        },
      })
    }

    // Save to prisma.unit and prisma.syllabus
    await prisma.$transaction(async (tx) => {
      // Delete existing units for this subject
      await tx.unit.deleteMany({ where: { subjectId: subject.id } })

      // Insert each extracted unit
      for (let idx = 0; idx < extractedUnits.length; idx++) {
        const u = extractedUnits[idx]
        const unitNumber = parseUnitNumber(u.unit, idx + 1)

        await tx.unit.create({
          data: {
            subjectId: subject.id,
            number: unitNumber,
            title: u.title,
            topics: JSON.stringify(u.topics || []),
            order: idx,
          },
        })
      }

      // Upsert prisma.syllabus
      await tx.syllabus.upsert({
        where: { subjectId: subject.id },
        update: {
          content: JSON.stringify({
            units: extractedUnits,
            sourceFileName,
            sourceFileSize,
            uploadedAt: new Date().toISOString(),
          }),
          version: { increment: 1 },
          status: 'published',
        },
        create: {
          subjectId: subject.id,
          content: JSON.stringify({
            units: extractedUnits,
            sourceFileName,
            sourceFileSize,
            uploadedAt: new Date().toISOString(),
          }),
          version: 1,
          status: 'published',
        },
      })
    })

    return NextResponse.json({
      success: true,
      units: extractedUnits,
      sourceFileName,
      sourceFileSize,
      message: `Successfully extracted and published ${extractedUnits.length} syllabus units for ${subjectCode}!`,
    })
  } catch (error: any) {
    console.error('Syllabus upload error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to process syllabus upload' },
      { status: 500 }
    )
  }
}

// PUT: Save manual edits to syllabus units (update unit titles, hours, topics)
export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const subjectCode = (body.subjectCode || '').trim().toUpperCase()
    const units: ParsedUnit[] = body.units || []

    if (!subjectCode || units.length === 0) {
      return NextResponse.json({ success: false, message: 'Subject code and units are required' }, { status: 400 })
    }

    let subject = await prisma.subject.findFirst({ where: { code: subjectCode } })
    if (!subject) {
      const currentAY = await prisma.academicYear.findFirst({ where: { isCurrent: true } })
      const academicYearId = currentAY ? currentAY.id : 'cmtmnsw30000apv1wxafyfv59'

      subject = await prisma.subject.create({
        data: {
          code: subjectCode,
          name: body.subjectName || subjectCode,
          credits: 3,
          academicYearId,
          description: 'Curriculum Course with Uploaded Syllabus',
        },
      })
    }

    await prisma.$transaction(async (tx) => {
      await tx.unit.deleteMany({ where: { subjectId: subject.id } })

      for (let idx = 0; idx < units.length; idx++) {
        const u = units[idx]
        const unitNumber = parseUnitNumber(u.unit, idx + 1)

        await tx.unit.create({
          data: {
            subjectId: subject.id,
            number: unitNumber,
            title: u.title,
            topics: JSON.stringify(u.topics || []),
            order: idx,
          },
        })
      }

      await tx.syllabus.upsert({
        where: { subjectId: subject.id },
        update: {
          content: JSON.stringify({
            units,
            updatedAt: new Date().toISOString(),
          }),
          status: 'published',
        },
        create: {
          subjectId: subject.id,
          content: JSON.stringify({
            units,
            updatedAt: new Date().toISOString(),
          }),
          version: 1,
          status: 'published',
        },
      })
    })

    return NextResponse.json({
      success: true,
      units,
      message: `Syllabus for ${subjectCode} updated successfully!`,
    })
  } catch (error: any) {
    console.error('Update syllabus error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update syllabus' },
      { status: 500 }
    )
  }
}

// DELETE: Clear syllabus for a subject
export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')?.trim().toUpperCase()

    if (!code) {
      return NextResponse.json({ success: false, message: 'Subject code is required' }, { status: 400 })
    }

    const subject = await prisma.subject.findFirst({ where: { code } })
    if (subject) {
      await prisma.$transaction([
        prisma.unit.deleteMany({ where: { subjectId: subject.id } }),
        prisma.syllabus.deleteMany({ where: { subjectId: subject.id } }),
      ])
    }

    return NextResponse.json({ success: true, message: `Syllabus cleared for ${code}` })
  } catch (error: any) {
    console.error('Delete syllabus error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Failed to clear syllabus' }, { status: 500 })
  }
}

// Helpers
function parseUnitNumber(unitStr: string, fallback: number): number {
  const romanMap: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8 }
  const match = unitStr.match(/(?:unit|module)?\s*([IVXLCDM\d]+)/i)
  if (match) {
    const raw = match[1].toUpperCase()
    if (romanMap[raw]) return romanMap[raw]
    const num = parseInt(raw, 10)
    if (!isNaN(num)) return num
  }
  return fallback
}

function toRoman(num: number): string {
  const romans: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let result = ''
  let n = num
  for (const [val, roman] of romans) {
    while (n >= val) {
      result += roman
      n -= val
    }
  }
  return result || String(num)
}
