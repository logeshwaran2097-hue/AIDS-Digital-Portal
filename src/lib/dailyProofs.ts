/**
 * Daily Proofs Management Engine for Hackathons (24h, 36h, 48h) & Multi-Day OD Events
 * Excludes Sundays from academic working days.
 */

import { getAcademicWorkingDates } from './academicDays'

export interface DailyProofItem {
  dayNumber: number
  title: string
  date: string
  photoUrl?: string | null
  geoAddress?: string | null
  timestamp?: string | null
  caption?: string | null
  status: 'pending' | 'submitted'
}

export type HackathonDurationFormat =
  | '24 Hours (2 Days)'
  | '36 Hours (2-3 Days)'
  | '48 Hours (3 Days)'
  | 'Single Day (8 Hours)'
  | 'Multi-Day Range'

/**
 * Standard checkpoint titles tailored to Hackathon phases and academic events
 */
export function getHackathonPhaseTitle(dayNumber: number, totalDays: number, isHackathon: boolean): string {
  if (!isHackathon) {
    if (totalDays === 1) return 'Stage 1: Venue Geo-Tag Photo'
    return `Day ${dayNumber}: Daily Session Proof & Geo-Tag`
  }

  if (totalDays === 2) {
    if (dayNumber === 1) return 'Day 1: Kickoff, Registration & Venue Check-in'
    return 'Day 2: Overnight Sprint, Prototype & Valedictory'
  }

  if (totalDays === 3) {
    if (dayNumber === 1) return 'Day 1: Registration & Initial Hackathon Kickoff'
    if (dayNumber === 2) return 'Day 2: Overnight Sprint & Mid-Way Mentorship Review'
    return 'Day 3: Final Jury Pitching, Prototype Demo & Valedictory'
  }

  // 4+ days
  if (dayNumber === 1) return 'Day 1: Kickoff & Venue Check-in'
  if (dayNumber === totalDays) return `Day ${dayNumber}: Final Presentation & Valedictory`
  return `Day ${dayNumber}: Progress & Working Session Proof`
}

/**
 * Generates initial checkpoint list based on category, dates, and format
 */
export function generateDailyProofCheckpoints(
  category: string,
  eventDateOrRange: string,
  durationFormat?: string | null,
  initialPhotoUrl?: string | null
): DailyProofItem[] {
  const isHackathon = /hackathon/i.test(category || '')

  // Extract fromDate and toDate
  let fromDate = ''
  let toDate = ''
  const rangeMatch = eventDateOrRange.match(/([0-9]{4}-[0-9]{2}-[0-9]{2})\s*(?:to|-|->)\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i)
  if (rangeMatch) {
    fromDate = rangeMatch[1]
    toDate = rangeMatch[2]
  } else {
    const singleMatch = eventDateOrRange.match(/([0-9]{4}-[0-9]{2}-[0-9]{2})/i)
    fromDate = singleMatch ? singleMatch[1] : new Date().toISOString().split('T')[0]
    toDate = fromDate
  }

  // Determine working dates (excluding Sundays)
  let workingDates = getAcademicWorkingDates(fromDate, toDate)
  if (workingDates.length === 0) {
    workingDates = [fromDate]
  }

  // Detect duration format if not explicitly provided
  let format = durationFormat || ''
  if (!format) {
    if (/24\s*h/i.test(eventDateOrRange) || (isHackathon && workingDates.length === 2)) {
      format = '24 Hours (2 Days)'
    } else if (/36\s*h/i.test(eventDateOrRange)) {
      format = '36 Hours (2-3 Days)'
    } else if (/48\s*h/i.test(eventDateOrRange) || (isHackathon && workingDates.length === 3)) {
      format = '48 Hours (3 Days)'
    } else if (workingDates.length > 1) {
      format = 'Multi-Day Range'
    } else {
      format = 'Single Day (8 Hours)'
    }
  }

  // If format specifies 24h (2 days) or 36h/48h (3 days), ensure we have enough day slots
  if (format.includes('24 Hours') && workingDates.length < 2) {
    // Generate next consecutive working day
    const nextDate = new Date(workingDates[0])
    nextDate.setDate(nextDate.getDate() + 1)
    if (nextDate.getDay() === 0) nextDate.setDate(nextDate.getDate() + 1) // skip Sunday
    workingDates.push(nextDate.toISOString().split('T')[0])
  } else if ((format.includes('36 Hours') || format.includes('48 Hours')) && workingDates.length < 3) {
    while (workingDates.length < 3) {
      const last = new Date(workingDates[workingDates.length - 1])
      last.setDate(last.getDate() + 1)
      if (last.getDay() === 0) last.setDate(last.getDate() + 1)
      workingDates.push(last.toISOString().split('T')[0])
    }
  }

  const totalDays = workingDates.length

  return workingDates.map((dateStr, idx) => {
    const dayNumber = idx + 1
    const title = getHackathonPhaseTitle(dayNumber, totalDays, isHackathon)
    const isFirst = dayNumber === 1
    const photoUrl = isFirst && initialPhotoUrl ? initialPhotoUrl : null

    return {
      dayNumber,
      title,
      date: dateStr,
      photoUrl,
      geoAddress: null,
      timestamp: photoUrl ? new Date().toISOString() : null,
      caption: null,
      status: photoUrl ? 'submitted' : 'pending',
    }
  })
}

/**
 * Safely parses daily proofs from an ODProof item or auto-generates them
 */
export function parseDailyProofs(proof: {
  category?: string
  eventDate?: string
  durationFormat?: string | null
  dailyProofs?: string | null
  geoPhotoUrl?: string | null
  geoAddress?: string | null
  geoTimestamp?: string | Date | null
}): DailyProofItem[] {
  if (proof.dailyProofs) {
    try {
      const parsed = JSON.parse(proof.dailyProofs)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Guarantee backwards compatibility if primary geoPhotoUrl was updated
        if (proof.geoPhotoUrl && !parsed[0].photoUrl) {
          parsed[0].photoUrl = proof.geoPhotoUrl
          parsed[0].status = 'submitted'
          parsed[0].geoAddress = proof.geoAddress || parsed[0].geoAddress
        }
        return parsed
      }
    } catch {
      // Fallback to generator below
    }
  }

  // Generate fallback checkpoints
  return generateDailyProofCheckpoints(
    proof.category || 'Hackathon',
    proof.eventDate || new Date().toISOString().split('T')[0],
    proof.durationFormat,
    proof.geoPhotoUrl
  )
}
