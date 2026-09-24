/**
 * Academic Year, Cohort Batch, and Semester Mapping & Automation Utilities
 *
 * Official Department Batch Schedule:
 *  - 1st Year (Semesters 1 & 2): Batch 2026-2030
 *  - 2nd Year (Semesters 3 & 4): Batch 2025-2029
 *  - 3rd Year (Semesters 5 & 6): Batch 2024-2028
 *  - 4th Year (Semesters 7 & 8): Batch 2023-2027
 */

export const YEAR_TO_DEFAULT_BATCH: Record<number, string> = {
  1: '2026-2030',
  2: '2025-2029',
  3: '2024-2028',
  4: '2023-2027',
}

export const BATCH_TO_YEAR: Record<string, number> = {
  '2026-2030': 1,
  '2025-2029': 2,
  '2024-2028': 3,
  '2023-2027': 4,
}

export interface AcademicCohort {
  year: number
  batch: string
  label: string
  yearName: string
  semesters: [number, number]
}

export const ACADEMIC_COHORTS: AcademicCohort[] = [
  {
    year: 1,
    batch: '2026-2030',
    label: '1st Year · Batch 2026-2030',
    yearName: 'Year I',
    semesters: [1, 2],
  },
  {
    year: 2,
    batch: '2025-2029',
    label: '2nd Year · Batch 2025-2029',
    yearName: 'Year II',
    semesters: [3, 4],
  },
  {
    year: 3,
    batch: '2024-2028',
    label: '3rd Year · Batch 2024-2028',
    yearName: 'Year III',
    semesters: [5, 6],
  },
  {
    year: 4,
    batch: '2023-2027',
    label: '4th Year · Batch 2023-2027',
    yearName: 'Year IV',
    semesters: [7, 8],
  },
]

/**
 * Returns default batch string for given year
 */
export function getDefaultBatchForYear(year: number | string | undefined | null): string {
  const y = Number(year) || 1
  return YEAR_TO_DEFAULT_BATCH[y] || '2026-2030'
}

/**
 * Resolves academic year number from a batch string
 */
export function getYearFromBatch(batch: string | undefined | null): number | null {
  if (!batch) return null
  const cleaned = batch.trim().replace(/\s+/g, '')
  for (const [b, y] of Object.entries(BATCH_TO_YEAR)) {
    if (cleaned === b || cleaned.includes(b)) {
      return y
    }
  }
  return null
}

/**
 * Resolves academic year (1-4) from semester number (1-8)
 */
export function getYearFromSemester(sem: number | string | undefined | null): number {
  const s = Number(sem) || 1
  return Math.min(4, Math.max(1, Math.ceil(s / 2)))
}

/**
 * Resolves valid semester when year changes, preserving odd/even semester parity
 */
export function getSemesterForYear(year: number, currentSem?: number): number {
  const y = Math.min(4, Math.max(1, Number(year) || 1))
  const minSem = (y - 1) * 2 + 1
  const maxSem = y * 2
  if (currentSem && (currentSem === minSem || currentSem === maxSem)) {
    return currentSem
  }
  if (currentSem && currentSem % 2 === 0) {
    return maxSem
  }
  return minSem
}
