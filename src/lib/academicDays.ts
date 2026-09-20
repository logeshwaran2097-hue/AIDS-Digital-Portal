/**
 * Academic Working Days & Duration Utility
 * Digital Portal of AI & DS - V.S.B. Engineering College
 *
 * Rule: Sunday will not be calculated in any academic leave, OD duration, or attendance allocation,
 * as Sunday is not an institutional working day.
 */

/**
 * Calculates the number of academic working days between fromDate and toDate (inclusive).
 * Sundays are strictly excluded from calculation.
 *
 * Example:
 * 2026-09-18 (Friday) to 2026-09-21 (Monday):
 * - Fri 18: Included (1)
 * - Sat 19: Included (2)
 * - Sun 20: EXCLUDED (0)
 * - Mon 21: Included (3)
 * Total: 3 days (not 4 days).
 */
export function calculateAcademicDays(fromDate?: string | null, toDate?: string | null): number {
  if (!fromDate) return 1
  const cleanFrom = String(fromDate).split('T')[0].trim()
  const cleanTo = String(toDate || fromDate).split('T')[0].trim()

  const start = new Date(cleanFrom + 'T00:00:00')
  const end = new Date(cleanTo + 'T00:00:00')

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1

  const minDate = start <= end ? start : end
  const maxDate = start <= end ? end : start

  let count = 0
  const cur = new Date(minDate)
  let loopLimit = 90

  while (cur <= maxDate && loopLimit-- > 0) {
    // 0 = Sunday: Sunday is strictly excluded from academic duration
    if (cur.getDay() !== 0) {
      count++
    }
    cur.setDate(cur.getDate() + 1)
  }

  return count
}

/**
 * Returns a user-friendly duration string (e.g. "3 days" or "1 day").
 * If the selected range is exclusively on Sunday, returns "0 days (Sunday Non-working)".
 */
export function formatAcademicDuration(
  fromDate?: string | null,
  toDate?: string | null,
  fallbackDays?: string | number | null
): string {
  if (fromDate && toDate) {
    const days = calculateAcademicDays(fromDate, toDate)
    if (days === 0) return '0 days (Sunday)'
    return `${days} ${days === 1 ? 'day' : 'days'}`
  }

  if (fallbackDays !== undefined && fallbackDays !== null) {
    const parsed = typeof fallbackDays === 'number' ? fallbackDays : parseInt(String(fallbackDays), 10)
    if (!isNaN(parsed) && parsed > 0) {
      return `${parsed} ${parsed === 1 ? 'day' : 'days'}`
    }
    return String(fallbackDays)
  }

  return '1 day'
}

/**
 * Returns an array of YYYY-MM-DD date strings in the given range, strictly excluding Sundays.
 */
export function getAcademicWorkingDates(fromDate?: string | null, toDate?: string | null): string[] {
  if (!fromDate) return []
  const cleanFrom = String(fromDate).split('T')[0].trim()
  const cleanTo = String(toDate || fromDate).split('T')[0].trim()

  const start = new Date(cleanFrom + 'T00:00:00')
  const end = new Date(cleanTo + 'T00:00:00')

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return [cleanFrom]

  const minDate = start <= end ? start : end
  const maxDate = start <= end ? end : start

  const result: string[] = []
  const cur = new Date(minDate)
  let loopLimit = 90

  while (cur <= maxDate && loopLimit-- > 0) {
    if (cur.getDay() !== 0) {
      // Exclude Sunday
      const y = cur.getFullYear()
      const m = String(cur.getMonth() + 1).padStart(2, '0')
      const d = String(cur.getDate()).padStart(2, '0')
      result.push(`${y}-${m}-${d}`)
    }
    cur.setDate(cur.getDate() + 1)
  }

  return result
}
