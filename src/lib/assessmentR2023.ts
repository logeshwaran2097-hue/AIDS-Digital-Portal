/**
 * Assessment Methods & Grading System - Regulation 2023 (R2023)
 * Department of Artificial Intelligence and Data Science (AI & DS)
 * V.S.B. Engineering College (Autonomous), Karur
 *
 * Extracted from Official AI&DS Addressing Presentation (Slides 8 to 12)
 */

export interface AssessmentApportionment {
  category: 'Theory' | 'Laboratory' | 'Theory cum Laboratory'
  maxMarks: number
  internalMarks: number
  externalMarks: number
  description: string
}

export const R2023_ASSESSMENT_METHODS: AssessmentApportionment[] = [
  {
    category: 'Theory',
    maxMarks: 100,
    internalMarks: 40,
    externalMarks: 60,
    description: 'Internal Assessments (40 Marks) + End Semester Examination (60 Marks)'
  },
  {
    category: 'Laboratory',
    maxMarks: 100,
    internalMarks: 60,
    externalMarks: 40,
    description: 'Internal Assessments (60 Marks) + End Semester Practical Exam (40 Marks)'
  },
  {
    category: 'Theory cum Laboratory',
    maxMarks: 100,
    internalMarks: 50,
    externalMarks: 50,
    description: 'Continuous Assessment (50 Marks) + End Semester Examination (50 Marks)'
  }
]

export interface GradeDefinition {
  grade: string
  title: string
  range?: string
  minMarks?: number
  maxMarks?: number
  gradePoint: number
  description: string
}

// Absolute Grading System (II Year) - R2023 Slide 11
export const ABSOLUTE_GRADING_II_YEAR: GradeDefinition[] = [
  { grade: 'S', title: 'Outstanding', range: '91 - 100', minMarks: 91, maxMarks: 100, gradePoint: 10, description: 'Exceptional mastery of course content' },
  { grade: 'A+', title: 'Excellent', range: '81 - 90', minMarks: 81, maxMarks: 90, gradePoint: 9, description: 'Demonstrated superior understanding' },
  { grade: 'A', title: 'Very Good', range: '71 - 80', minMarks: 71, maxMarks: 80, gradePoint: 8, description: 'High level of competence' },
  { grade: 'B+', title: 'Good', range: '66 - 70', minMarks: 66, maxMarks: 70, gradePoint: 7, description: 'Above average competence' },
  { grade: 'B', title: 'Above Average', range: '61 - 65', minMarks: 61, maxMarks: 65, gradePoint: 6.5, description: 'Solid foundational understanding' },
  { grade: 'C+', title: 'Average', range: '56 - 60', minMarks: 56, maxMarks: 60, gradePoint: 6, description: 'Meets minimum expected requirements' },
  { grade: 'C', title: 'Satisfactory', range: '50 - 55', minMarks: 50, maxMarks: 55, gradePoint: 5, description: 'Pass - satisfactory performance' },
  { grade: 'U', title: 'Reappearance', range: '< 50', minMarks: 0, maxMarks: 49.99, gradePoint: 0, description: 'Requires re-examination' }
]

// Relative Grading System (III and IV Year) - R2023 Slide 11
export const RELATIVE_GRADING_III_IV_YEAR: GradeDefinition[] = [
  { grade: 'O', title: 'Outstanding', gradePoint: 10, description: 'Top percentile performance' },
  { grade: 'A+', title: 'Excellent', gradePoint: 9, description: 'Significantly above class mean' },
  { grade: 'A', title: 'Very Good', gradePoint: 8, description: 'Above class mean' },
  { grade: 'B+', title: 'Good', gradePoint: 7, description: 'Consistent standard performance' },
  { grade: 'B', title: 'Average', gradePoint: 6, description: 'At or near class median' },
  { grade: 'C', title: 'Satisfactory', gradePoint: 5, description: 'Passing threshold reached' },
  { grade: 'U', title: 'Reappearance', gradePoint: 0, description: 'Arrear / Re-examination required' }
]

/**
 * Calculate Theory Course Internal & External Marks (Slide 9 & 10)
 *
 * Assessment I (100 Marks):
 *   - Assignment 1: 40 Marks max
 *   - Written Test 1: 60 Marks max
 * Assessment II (100 Marks):
 *   - Assignment 2: 40 Marks max
 *   - Written Test 2: 60 Marks max
 * Total Internal Scored for 200 -> Converted to 40 Marks:
 *   Overall Internal = (Total for 200 * 40) / 200
 *
 * External Exam (100 Marks max) -> Converted to 60 Marks:
 *   External Marks = (External Scored * 60) / 100
 */
export function calculateTheoryMarks(input: {
  test1Marks: number // out of 100 or directly 60
  test1IsOutOf100?: boolean
  test2Marks: number // out of 100 or directly 60
  test2IsOutOf100?: boolean
  assignment1Marks: number // out of 100 or directly 40
  assignment1IsOutOf100?: boolean
  assignment2Marks: number // out of 100 or directly 40
  assignment2IsOutOf100?: boolean
  externalMarksScored: number // out of 100
}) {
  const test1 = input.test1IsOutOf100 !== false ? (input.test1Marks * 60) / 100 : input.test1Marks
  const test2 = input.test2IsOutOf100 !== false ? (input.test2Marks * 60) / 100 : input.test2Marks
  const assign1 = input.assignment1IsOutOf100 !== false ? (input.assignment1Marks * 40) / 100 : input.assignment1Marks
  const assign2 = input.assignment2IsOutOf100 !== false ? (input.assignment2Marks * 40) / 100 : input.assignment2Marks

  const totalScoredOutOf200 = Number((test1 + test2 + assign1 + assign2).toFixed(2))
  const overallInternalRaw = (totalScoredOutOf200 * 40) / 200
  const overallInternalRounded = Math.round(overallInternalRaw)

  const externalConverted = Number(((input.externalMarksScored * 60) / 100).toFixed(2))
  const externalRounded = Math.round(externalConverted)

  const totalFinalMarks = overallInternalRounded + externalRounded

  return {
    test1Contribution: Number(test1.toFixed(2)),
    test2Contribution: Number(test2.toFixed(2)),
    assignment1Contribution: Number(assign1.toFixed(2)),
    assignment2Contribution: Number(assign2.toFixed(2)),
    totalScoredOutOf200,
    overallInternalRaw: Number(overallInternalRaw.toFixed(2)),
    overallInternal: overallInternalRounded,
    externalConverted,
    externalMarks: externalRounded,
    totalMarks: totalFinalMarks
  }
}

/**
 * Calculate Laboratory Course Internal & External Marks (Slide 12)
 *
 * Observation, Record: 75 Marks
 * Test: 25 Marks
 * Total Internal Scored for 100 -> Converted to 60 Marks:
 *   Internal Marks = (Total for 100 * 60) / 100
 *
 * External Practical Exam: Scored out of 100 -> Converted to 40 Marks:
 *   External Marks = (External Scored * 40) / 100
 */
export function calculateLabMarks(input: {
  observationRecordMarks: number // out of 75
  testMarks: number // out of 25
  externalMarksScored: number // out of 100
}) {
  const totalFor100 = Math.min(100, Math.max(0, input.observationRecordMarks + input.testMarks))
  const internalConverted = (totalFor100 * 60) / 100
  const internalRounded = Math.round(internalConverted)

  const externalConverted = (input.externalMarksScored * 40) / 100
  const externalRounded = Math.round(externalConverted)

  const totalFinalMarks = internalRounded + externalRounded

  return {
    observationRecordMarks: input.observationRecordMarks,
    testMarks: input.testMarks,
    totalScoredOutOf100: totalFor100,
    overallInternalRaw: Number(internalConverted.toFixed(2)),
    overallInternal: internalRounded,
    externalConverted: Number(externalConverted.toFixed(2)),
    externalMarks: externalRounded,
    totalMarks: totalFinalMarks
  }
}

/**
 * Calculate Theory cum Laboratory Course Marks (Slide 12)
 *
 * Assessment I (100 Marks):
 *   - Assignment/MiniProject: 40 Marks
 *   - Written Test: 60 Marks
 * Assessment II (100 Marks):
 *   - Lab Observation/Record: 75 Marks
 *   - Test: 25 Marks
 * Total Internal Scored for 200 -> Converted to 50 Marks:
 *   Internal Marks = (Total for 200 * 50) / 200
 *
 * External Exam: Scored out of 100 -> Converted to 50 Marks:
 *   External Marks = (External Scored * 50) / 100
 */
export function calculateTheoryCumLabMarks(input: {
  assignmentMarks: number // out of 100 or 40
  assignmentIsOutOf100?: boolean
  writtenTestMarks: number // out of 100 or 60
  writtenTestIsOutOf100?: boolean
  labRecordMarks: number // out of 75
  labTestMarks: number // out of 25
  externalMarksScored: number // out of 100
}) {
  const assign = input.assignmentIsOutOf100 !== false ? (input.assignmentMarks * 40) / 100 : input.assignmentMarks
  const written = input.writtenTestIsOutOf100 !== false ? (input.writtenTestMarks * 60) / 100 : input.writtenTestMarks
  const assessment1 = assign + written

  const labRecord = Math.min(75, Math.max(0, input.labRecordMarks))
  const labTest = Math.min(25, Math.max(0, input.labTestMarks))
  const assessment2 = labRecord + labTest

  const totalFor200 = Number((assessment1 + assessment2).toFixed(2))
  const internalConverted = (totalFor200 * 50) / 200
  const internalRounded = Math.round(internalConverted)

  const externalConverted = (input.externalMarksScored * 50) / 100
  const externalRounded = Math.round(externalConverted)

  const totalFinalMarks = internalRounded + externalRounded

  return {
    assessment1Contribution: Number(assessment1.toFixed(2)),
    assessment2Contribution: Number(assessment2.toFixed(2)),
    totalScoredOutOf200: totalFor200,
    overallInternalRaw: Number(internalConverted.toFixed(2)),
    overallInternal: internalRounded,
    externalConverted: Number(externalConverted.toFixed(2)),
    externalMarks: externalRounded,
    totalMarks: totalFinalMarks
  }
}

/**
 * Determine Absolute Grade for II Year (Slide 11)
 */
export function getAbsoluteGradeIIYear(totalMarks: number): GradeDefinition {
  const rounded = Math.round(totalMarks)
  for (const item of ABSOLUTE_GRADING_II_YEAR) {
    if (item.minMarks !== undefined && item.maxMarks !== undefined) {
      if (rounded >= item.minMarks && rounded <= item.maxMarks) {
        return item
      }
    }
  }
  return ABSOLUTE_GRADING_II_YEAR[ABSOLUTE_GRADING_II_YEAR.length - 1]
}
