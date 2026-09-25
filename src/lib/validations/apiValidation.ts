import { z } from 'zod'
import { NextResponse } from 'next/server'

/**
 * Standard request validation helper that returns typed data or an HTTP 400 response with issue details.
 */
export function validateBody<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const errorDetails = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }))
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          message: errorDetails[0]?.message || 'Invalid input parameters',
          errors: errorDetails,
        },
        { status: 400 }
      ),
    }
  }
  return { success: true, data: result.data }
}

// ==========================================
// Reusable field validators
// ==========================================

export const optionalEmailSchema = z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val === null ? undefined : val),
  z.string().trim().email('Invalid email address').optional().nullable()
)

// ==========================================
// 1. Authentication & Onboarding Schemas
// ==========================================

export const adminSendOtpSchema = z
  .object({
    email: z.string().email('Invalid email address'),
  })
  .passthrough()

export const adminVerifyOtpSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    otp: z.string().min(4).max(10),
    challenge: z.string().optional(),
  })
  .passthrough()

export const facultyLoginSchema = z
  .object({
    facultyId: z.string().max(100).optional(),
    email: z.string().max(100).optional(),
    name: z.string().max(100).optional(),
    password: z.string().max(100).optional(),
    dateOfBirth: z.string().max(30).optional(),
    role: z.string().max(30).optional(),
    loginAsRole: z.string().max(30).optional(),
  })
  .passthrough()
  .refine((d) => d.facultyId || d.email || d.name, {
    message: 'Faculty Email ID, Faculty ID, or Name is required',
  })

export const hodLoginSchema = z
  .object({
    facultyId: z.string().max(100).optional(),
    email: z.string().max(100).optional(),
    name: z.string().max(100).optional(),
    password: z.string().max(100).optional(),
    dateOfBirth: z.string().max(30).optional(),
  })
  .passthrough()
  .refine((d) => d.facultyId || d.email || d.name, {
    message: 'HOD Email ID, Name, or HOD ID is required',
  })

export const studentLoginSchema = z
  .object({
    registerNumber: z.string().max(100).optional(),
    email: z.string().max(100).optional(),
    password: z.string().max(100).optional(),
    dateOfBirth: z.string().max(30).optional(),
  })
  .passthrough()
  .refine((d) => d.registerNumber || d.email, {
    message: 'Register Number or Email ID is required',
  })

export const checkEmailSchema = z
  .object({
    email: z.string().email('Valid email address is required'),
    userId: z.string().max(100).optional(),
    registerNumber: z.string().max(50).optional(),
    facultyId: z.string().max(50).optional(),
  })
  .passthrough()

export const sendOnboardingOtpSchema = z
  .object({
    email: z.string().email('Valid email address is required'),
    name: z.string().max(100).optional(),
    userId: z.string().max(100).optional(),
    registerNumber: z.string().max(50).optional(),
    facultyId: z.string().max(50).optional(),
    role: z.string().max(30).optional(),
    subjectName: z.string().max(150).optional(),
    department: z.string().max(150).optional(),
    year: z.union([z.number(), z.string()]).optional(),
    semester: z.union([z.number(), z.string()]).optional(),
    section: z.string().max(10).optional(),
    advisorName: z.string().max(100).optional(),
    advisorYear: z.union([z.number(), z.string()]).optional(),
    advisorSem: z.union([z.number(), z.string()]).optional(),
    advisorSec: z.string().max(10).optional(),
    advisorBatch: z.string().max(50).optional(),
  })
  .passthrough()

export const verifyOnboardingOtpSchema = z
  .object({
    email: z.string().email('Valid email address is required'),
    otp: z.string().min(4).max(10),
    challenge: z.string().max(500).optional(),
  })
  .passthrough()

export const studentSendEmailOtpSchema = z
  .object({
    email: z.string().email('Valid email address is required'),
    name: z.string().max(100).optional(),
    regNo: z.string().max(50).optional(),
    registerNumber: z.string().max(50).optional(),
    advisorName: z.string().max(100).optional(),
    year: z.union([z.number(), z.string()]).optional(),
    semester: z.union([z.number(), z.string()]).optional(),
    section: z.string().max(10).optional(),
    department: z.string().max(150).optional(),
  })
  .passthrough()

export const studentVerifyEmailOtpSchema = z
  .object({
    email: z.string().email('Valid email address is required'),
    otp: z.string().min(4).max(10),
  })
  .passthrough()

export const studentCompleteOnboardingSchema = z
  .object({
    name: z.string().max(100).optional(),
    phone: z.string().max(100).optional().nullable(),
    parentPhone: z.string().max(100).optional().nullable(),
    dateOfBirth: z.string().max(50).optional().nullable(),
    email: optionalEmailSchema,
    otp: z.string().max(20).optional(),
    newPassword: z.preprocess(
      (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
      z.string().min(6).max(100).optional()
    ),
    skipEmailVerification: z.boolean().optional(),
    residencyStatus: z.string().max(500).optional().nullable(),
    bloodGroup: z.string().max(30).optional().nullable(),
    isParentWhatsapp: z.boolean().optional(),
    hostelBlock: z.string().max(100).optional().nullable(),
    roomNo: z.string().max(50).optional().nullable(),
    busNo: z.string().max(100).optional().nullable(),
    boardingPoint: z.string().max(200).optional().nullable(),
    profileImage: z.string().max(2000000).optional().nullable(),
  })
  .passthrough()

// ==========================================
// 2. Student Management & Profile Schemas
// ==========================================

export const adminCreateStudentSchema = z
  .object({
    registerNumber: z.string().min(3).max(30),
    name: z.string().min(2).max(100),
    email: optionalEmailSchema,
    password: z.string().min(4).max(100),
    phone: z.string().max(100).optional().nullable(),
    parentPhone: z.string().max(100).optional().nullable(),
    dateOfBirth: z.string().max(50).optional().nullable(),
    department: z.string().max(150).optional(),
    year: z.union([z.number().int().min(1).max(5), z.string()]).optional(),
    semester: z.union([z.number().int().min(1).max(10), z.string()]).optional(),
    batch: z.string().max(50).optional().nullable(),
    section: z.string().max(10).optional(),
    advisorName: z.string().max(100).optional().nullable(),
    status: z.enum(['active', 'inactive', 'suspended', 'graduated']).optional(),
    bloodGroup: z.string().max(10).optional().nullable(),
    residencyStatus: z.string().max(500).optional().nullable(),
    busNo: z.string().max(100).optional().nullable(),
    boardingPoint: z.string().max(200).optional().nullable(),
    busDetails: z.string().max(500).optional().nullable(),
    hostelBlock: z.string().max(100).optional().nullable(),
    roomNo: z.string().max(50).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    cgpa: z.union([z.number().min(0).max(10), z.string(), z.null()]).optional(),
    attendance: z.union([z.string().max(20), z.number(), z.null()]).optional(),
  })
  .passthrough()

// Student self-update schema strictly prevents modifying academic records (cgpa, attendance, year, semester, section, batch, status, registerNumber)
export const studentSelfUpdateSchema = z
  .object({
    id: z.string().optional(),
    registerNumber: z.string().max(30).optional(),
    name: z.string().min(2).max(100).optional(),
    email: optionalEmailSchema,
    password: z.preprocess(
      (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
      z.string().min(6).max(100).optional()
    ),
    phone: z.string().max(100).optional().nullable(),
    parentPhone: z.string().max(100).optional().nullable(),
    isParentWhatsapp: z.boolean().optional(),
    dateOfBirth: z.string().max(50).optional().nullable(),
    bloodGroup: z.string().max(10).optional().nullable(),
    residencyStatus: z.string().max(500).optional().nullable(),
    busNo: z.string().max(100).optional().nullable(),
    boardingPoint: z.string().max(200).optional().nullable(),
    busDetails: z.string().max(500).optional().nullable(),
    hostelBlock: z.string().max(100).optional().nullable(),
    roomNo: z.string().max(50).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    profileImage: z.string().max(2000000).optional().nullable(),
    // Read-only frontend fields allowed in payload but strictly ignored by backend for non-admins
    department: z.string().max(150).optional(),
    year: z.union([z.number(), z.string()]).optional(),
    semester: z.union([z.number(), z.string()]).optional(),
    section: z.string().max(10).optional(),
    batch: z.string().max(50).optional().nullable(),
    advisorName: z.string().max(100).optional().nullable(),
    degreeProgram: z.string().max(150).optional(),
    regulation: z.string().max(100).optional(),
    enrollmentStatus: z.string().max(50).optional(),
    cgpa: z.union([z.number(), z.string(), z.null()]).optional(),
    attendance: z.union([z.number(), z.string(), z.null()]).optional(),
  })
  .passthrough()

export const adminUpdateStudentSchema = studentSelfUpdateSchema
  .extend({
    userId: z.string().optional(),
    registerNumber: z.string().max(30).optional(),
    department: z.string().max(150).optional(),
    year: z.union([z.number().int().min(1).max(5), z.string()]).optional(),
    semester: z.union([z.number().int().min(1).max(10), z.string()]).optional(),
    batch: z.string().max(50).optional().nullable(),
    section: z.string().max(10).optional(),
    advisorName: z.string().max(100).optional().nullable(),
    status: z.enum(['active', 'inactive', 'suspended', 'graduated']).optional(),
    cgpa: z.union([z.number().min(0).max(10), z.string(), z.null()]).optional(),
    attendance: z.union([z.string().max(20), z.number(), z.null()]).optional(),
  })
  .passthrough()

// ==========================================
// 3. Gate Pass Schemas
// ==========================================

export const gatePassStudentUpdateSchema = z
  .object({
    id: z.string().min(1),
    date: z.string().max(30).optional(),
    time: z.string().max(30).optional(),
    reason: z.string().max(500).optional(),
    destination: z.string().max(200).optional(),
    parentContact: z.string().max(30).optional(),
    type: z.enum(['emergency', 'personal', 'medical', 'academic', 'hostel_outpass', 'od']).optional(),
  })
  .strict()

export const gatePassPrivilegedUpdateSchema = gatePassStudentUpdateSchema
  .extend({
    reg: z.string().max(30).optional(),
    name: z.string().max(100).optional(),
    dept: z.string().max(100).optional(),
    year: z.union([z.number(), z.string()]).optional(),
    sec: z.string().max(10).optional(),
    status: z.enum(['pending', 'approved', 'rejected', 'used', 'expired']).optional(),
    parentConsent: z.boolean().optional(),
    remarks: z.string().max(500).optional(),
    approvedBy: z.string().max(100).optional(),
    approvedAt: z.string().max(50).optional(),
  })
  .strict()

// ==========================================
// 4. Project & Capstone Schemas
// ==========================================

export const createProjectSchema = z
  .object({
    title: z.string().min(3).max(200),
    description: z.string().max(2000).optional(),
    problemStatement: z.string().max(2000).optional(),
    proposedSolution: z.string().max(2000).optional(),
    technologies: z.union([z.array(z.string()), z.string()]).optional(),
    dataset: z.string().max(500).optional().nullable(),
    results: z.string().max(2000).optional().nullable(),
    futureScope: z.string().max(1000).optional().nullable(),
    documentation: z.string().max(500).optional().nullable(),
    githubUrl: z.string().url().max(500).optional().nullable(),
    domain: z.string().max(100).optional(),
    year: z.union([z.number().int().min(1).max(5), z.string()]).optional(),
    guideName: z.string().max(100).optional(),
    guideEmail: optionalEmailSchema,
    teamMembers: z.string().max(500).optional(),
    // Status can only be set by privileged users; if passed, validated strictly
    status: z.enum(['Pending Review', 'Approved & Active', 'Under Review', 'Completed', 'Rejected']).optional(),
  })
  .strict()

export const updateProjectSchema = createProjectSchema
  .extend({
    id: z.string().min(1),
  })
  .strict()

// ==========================================
// 5. Attendance Schemas
// ==========================================

export const attendanceRecordItemSchema = z
  .object({
    studentId: z.string().optional(),
    registerNumber: z.string().min(3).max(30),
    studentName: z.string().max(100).optional(),
    status: z.enum(['P', 'A', 'OD', 'ML', 'L']),
    remarks: z.string().max(200).optional().nullable(),
  })
  .strict()

export const saveAttendanceSchema = z
  .object({
    sessionType: z.enum(['morning', 'subject']),
    subjectCode: z.string().max(50).optional().nullable(),
    subjectName: z.string().max(150).optional().nullable(),
    year: z.union([z.number().int().min(1).max(5), z.string()]),
    section: z.string().max(10),
    semester: z.union([z.number().int().min(1).max(10), z.string()]).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    hour: z.string().max(50).optional().nullable(),
    isLocked: z.boolean().optional(),
    records: z.array(attendanceRecordItemSchema).optional(),
    students: z.array(attendanceRecordItemSchema).optional(),
  })
  .strict()
  .refine((d) => (d.records && d.records.length > 0) || (d.students && d.students.length > 0), {
    message: 'Attendance records must contain at least one student',
  })

export const attendanceUnlockActionSchema = z
  .object({
    action: z.enum(['REQUEST', 'APPROVE', 'REJECT', 'REVOKE']),
    id: z.string().optional(),
    sessionId: z.string().optional(),
    year: z.union([z.number(), z.string()]).optional(),
    section: z.string().max(10).optional(),
    semester: z.union([z.number(), z.string()]).optional(),
    academicYear: z.string().max(50).optional(),
    sessionType: z.string().max(50).optional(),
    subjectCode: z.string().max(50).optional(),
    subjectName: z.string().max(150).optional(),
    hour: z.string().max(50).optional(),
    date: z.string().max(30).optional(),
    reason: z.string().max(500).optional(),
    targetStudent: z.string().max(50).optional(),
    intendedStatus: z.string().max(20).optional(),
    reviewNote: z.string().max(500).optional(),
  })
  .strict()

// ==========================================
// 6. OD Applications & Proofs
// ==========================================

export const odApplicationSubmitSchema = z
  .object({
    studentName: z.string().max(100).optional().nullable(),
    registerNumber: z.string().max(50).optional().nullable(),
    year: z.union([z.number(), z.string()]).optional().nullable(),
    semester: z.union([z.number(), z.string()]).optional().nullable(),
    section: z.string().max(10).optional().nullable(),
    applicationType: z.string().min(2).max(100),
    fromDate: z.string().min(4).max(60),
    toDate: z.string().min(4).max(60),
    totalDays: z.union([z.number(), z.string()]).optional().nullable(),
    eventName: z.string().max(200).optional().nullable(),
    organizer: z.string().max(200).optional().nullable(),
    eventMode: z.string().max(50).optional().nullable(),
    teamName: z.string().max(100).optional().nullable(),
    teamMembers: z.union([z.string(), z.array(z.any())]).optional().nullable(),
    projectTitle: z.string().max(200).optional().nullable(),
    domain: z.string().max(100).optional().nullable(),
    companyGuide: z.string().max(100).optional().nullable(),
    doctorName: z.string().max(100).optional().nullable(),
    parentContact: z.string().max(30).optional().nullable(),
    reason: z.string().max(2000).optional().nullable(),
    brochureFile: z.string().max(20000000).optional().nullable(),
    brochureName: z.string().max(200).optional().nullable(),
    registrationProof: z.string().max(20000000).optional().nullable(),
    registrationProofName: z.string().max(200).optional().nullable(),
    abstractOrLetter: z.string().max(20000000).optional().nullable(),
    abstractOrLetterName: z.string().max(200).optional().nullable(),
  })
  .passthrough()
export const odAdvisorProofSchema = z
  .object({
    action: z.literal('upload_advisor_proof'),
    registerNumber: z.string().min(3).max(30),
    fileName: z.string().max(200).optional(),
    fileData: z.string().min(1).max(5000000),
    fileSize: z.number().optional(),
    fileType: z.string().max(100).optional(),
  })
  .strict()

export const odApplicationPostSchema = z.union([
  odAdvisorProofSchema,
  odApplicationSubmitSchema,
])

export const odApplicationReviewSchema = z
  .object({
    notificationId: z.string().optional(),
    registerNumber: z.string().min(3).max(30),
    action: z.enum(['endorse', 'decline', 'approve', 'reject', 'hod_approve', 'hod_reject', 'verify_parent_consent']),
    remarks: z.string().max(500).optional().nullable(),
    studentName: z.string().max(100).optional(),
    eventName: z.string().max(200).optional(),
    dates: z.string().max(100).optional(),
    fromDate: z.string().max(50).optional(),
    toDate: z.string().max(50).optional(),
    applicationType: z.string().max(100).optional(),
  })
  .passthrough()

export const odProofActionSchema = z
  .object({
    action: z.enum([
      'REGISTER_OD',
      'UPDATE_OD',
      'EDIT_OD',
      'DELETE_OD',
      'DELETE_EVENT',
      'DELETE_ALL_OD',
      'UPLOAD_GEOTAG',
      'UPLOAD_CERTIFICATE',
      'ADVISOR_VERIFY',
      'HOD_APPROVE',
      'ADVISOR_REJECT',
      'HOD_REJECT',
      'ADMIN_SANCTION',
      'ADMIN_APPROVE',
      'ADMIN_REJECT',
      'ADMIN_DELETE',
      'SYNC_SANCTIONED_ODS',
    ]),
    id: z.string().max(100).optional(),
    eventName: z.string().max(200).optional(),
    category: z.string().max(100).optional(),
    eventDate: z.string().max(50).optional(),
    venueCollege: z.string().max(200).optional().nullable(),
    geoPhotoUrl: z.string().max(5000000).optional(),
    latitude: z.union([z.number(), z.string()]).optional().nullable(),
    longitude: z.union([z.number(), z.string()]).optional().nullable(),
    collegeName: z.string().max(200).optional(),
    collegeAddress: z.string().max(500).optional(),
    geoAddress: z.string().max(500).optional(),
    geoTimestamp: z.string().max(50).optional(),
    certificateUrl: z.string().max(5000000).optional(),
    certificateName: z.string().max(200).optional(),
    achievement: z.string().max(200).optional(),
    remarks: z.string().max(1000).optional(),
    durationFormat: z.string().max(100).optional().nullable(),
    dayNumber: z.union([z.number(), z.string()]).optional().nullable(),
    dailyProofs: z.string().max(10000000).optional().nullable(),
    caption: z.string().max(500).optional().nullable(),
  })
  .strict()

// ==========================================
// 7. General Content & Announcements Schemas
// ==========================================

export const createAnnouncementSchema = z
  .object({
    title: z.string().min(3).max(200),
    content: z.string().max(5000).optional(),
    category: z.string().max(50).optional(),
    target: z.string().max(50).optional(),
    attachmentUrl: z.string().max(500).optional().nullable(),
    createdByName: z.string().max(100).optional(),
  })
  .strict()

export const updateAnnouncementSchema = createAnnouncementSchema
  .extend({
    id: z.string().min(1),
  })
  .strict()

export const formTrackerSchema = z
  .object({
    announcementId: z.string().min(1).max(100),
    registerNumber: z.string().max(50).optional(),
    studentId: z.string().max(100).optional(),
    studentName: z.string().max(100).optional(),
  })
  .strict()

export const createNotificationSchema = z
  .object({
    title: z.string().min(2).max(200),
    message: z.string().min(2).max(2000),
    target: z.string().max(50).optional(),
    targetIds: z.union([z.array(z.string()), z.string()]).optional(),
    createdByName: z.string().max(100).optional(),
    link: z.string().max(500).optional(),
  })
  .strict()

export const patchNotificationSchema = z
  .object({
    notificationId: z.string().max(100).optional(),
    markAllRead: z.boolean().optional(),
  })
  .strict()

export const createEventSchema = z
  .object({
    name: z.string().min(3).max(200),
    description: z.string().max(2000).optional(),
    category: z.string().max(50).optional(),
    date: z.string().max(50).optional(),
    time: z.string().max(50).optional(),
    venue: z.string().max(150).optional(),
    createdByName: z.string().max(100).optional(),
    organizer: z.string().max(100).optional(),
    targetSemester: z.string().max(50).optional(),
    registrationInfo: z.string().max(100).optional(),
    registrationUrl: z.string().url().max(500).optional().nullable().or(z.literal('')),
  })
  .strict()

export const createAchievementSchema = z
  .object({
    title: z.string().min(3).max(200),
    description: z.string().max(5000).optional(),
    category: z.string().max(100).optional(),
    recipientType: z.enum(['student', 'faculty']).optional(),
    recipientName: z.string().max(100).optional(),
    eventName: z.string().max(200).optional().nullable(),
    awardName: z.string().max(200).optional().nullable(),
    certificateUrl: z.string().min(1).max(10000000), // supports base64 data URLs for PDF/image proof documents
    date: z.string().max(50).optional(),
  })
  .strict()


// ==========================================
// 8. Laboratory & Academic Settings
// ==========================================

export const createLabActivitySchema = z
  .object({
    labName: z.string().max(150).optional(),
    labCode: z.string().max(50).optional().nullable(),
    year: z.union([z.number(), z.string()]).optional(),
    semester: z.union([z.number(), z.string()]).optional(),
    section: z.string().max(10).optional(),
    batch: z.string().max(50).optional().nullable(),
    day: z.string().max(30).optional(),
    date: z.string().max(30),
    period: z.string().max(100).optional().nullable(),
    experimentNo: z.union([z.number(), z.string()]).optional().nullable(),
    experimentName: z.string().min(2).max(200),
    topicsCovered: z.string().min(2).max(2000),
    activityType: z.string().max(100).optional(),
    labTrainer: z.string().max(100).optional().nullable(),
    toolsUsed: z.string().max(200).optional().nullable(),
    status: z.string().max(50).optional(),
    attendanceCount: z.union([z.number(), z.string()]).optional().nullable(),
    remarks: z.string().max(500).optional().nullable(),
  })
  .strict()

export const updateLabActivitySchema = createLabActivitySchema
  .partial()
  .extend({
    id: z.string().min(1),
  })
  .strict()

// ==========================================
// 9. Push Notifications & AI Chat
// ==========================================

export const pushSubscriptionSchema = z
  .object({
    endpoint: z.string().url(),
    keys: z
      .object({
        p256dh: z.string().min(1),
        auth: z.string().min(1),
      })
      .strict(),
  })
  .strict()

export const pushTestSchema = z
  .object({
    endpoint: z.string().url().optional(),
    delaySeconds: z.number().int().min(0).max(30).optional(),
    title: z.string().max(150).optional(),
    message: z.string().max(500).optional(),
  })
  .strict()

export const aiQuerySchema = z
  .object({
    message: z.string().min(1).max(2000),
    sessionId: z.string().max(100).optional(),
    apiKey: z.string().max(200).optional(),
    agent: z.string().max(100).optional(),
    context: z.record(z.any()).optional(),
  })
  .passthrough()

// ==========================================
// 10. Complete Profile & Admin/Settings Schemas
// ==========================================

export const completeProfileSchema = z
  .object({
    userId: z.string().max(100).optional(),
    registerNumber: z.string().max(50).optional(),
    facultyId: z.string().max(50).optional(),
    role: z.string().max(30).optional(),
    name: z.string().max(100).optional(),
    phone: z.string().max(100).optional().nullable(),
    parentPhone: z.string().max(100).optional().nullable(),
    isParentWhatsapp: z.boolean().optional(),
    email: optionalEmailSchema,
    dateOfBirth: z.string().max(50).optional().nullable(),
    department: z.string().max(150).optional(),
    year: z.union([z.number(), z.string()]).optional(),
    semester: z.union([z.number(), z.string()]).optional(),
    section: z.string().max(20).optional(),
    advisorName: z.string().max(100).optional(),
    advisorBatch: z.string().max(100).optional().nullable(),
    advisorYear: z.union([z.number(), z.string()]).optional().nullable(),
    advisorSem: z.union([z.number(), z.string()]).optional().nullable(),
    advisorSec: z.string().max(10).optional().nullable(),
    classPeriod: z.string().max(50).optional().nullable(),
    bloodGroup: z.string().max(30).optional().nullable(),
    residencyStatus: z.string().max(500).optional().nullable(),
    hostelBlock: z.string().max(100).optional().nullable(),
    roomNo: z.string().max(50).optional().nullable(),
    busNo: z.string().max(100).optional().nullable(),
    boardingPoint: z.string().max(200).optional().nullable(),
    profileImage: z.string().max(2000000).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    busDetails: z.string().max(500).optional().nullable(),
    newPassword: z.preprocess(
      (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
      z.string().min(6).max(100).optional()
    ),
    qualification: z.string().max(100).optional(),
    specialization: z.string().max(150).optional(),
    experience: z.union([z.number(), z.string()]).optional(),
    correctionRemarks: z.string().max(1000).optional(),
    staffId: z.string().max(50).optional(),
    emailOtp: z.string().max(20).optional(),
    otp: z.string().max(20).optional(),
    challenge: z.string().max(500).optional(),
  })
  .passthrough()

export const createFacultySchema = z
  .object({
    facultyId: z.string().max(50).optional(),
    name: z.string().min(2).max(100),
    email: optionalEmailSchema,
    phone: z.string().max(100).optional().nullable(),
    password: z.string().max(100).optional(),
    dateOfBirth: z.string().max(50).optional().nullable(),
    designation: z.string().max(100).optional(),
    qualification: z.string().max(100).optional(),
    experience: z.union([z.number(), z.string()]).optional().nullable(),
    specialization: z.string().max(150).optional(),
    subjects: z.union([z.array(z.string()), z.string()]).optional(),
    subjectName: z.string().max(150).optional().nullable(),
    classDay: z.string().max(50).optional().nullable(),
    classPeriod: z.string().max(50).optional().nullable(),
    classTime: z.string().max(50).optional().nullable(),
    advisorBatch: z.string().max(100).optional().nullable(),
    advisorYear: z.union([z.number(), z.string()]).optional().nullable(),
    advisorSem: z.union([z.number(), z.string()]).optional().nullable(),
    advisorSec: z.string().max(10).optional().nullable(),
    facultyType: z.string().max(50).optional(),
    status: z.string().max(30).optional(),
    labTrainer: z.string().max(100).optional().nullable(),
    // Client-side allocation fields
    isClassAdvisor: z.boolean().optional(),
    hasTheory: z.boolean().optional(),
    teachingYear: z.union([z.number(), z.string()]).optional().nullable(),
    teachingSem: z.union([z.number(), z.string()]).optional().nullable(),
    hasLab: z.boolean().optional(),
    labSubjectName: z.string().max(150).optional().nullable(),
    labSubjectCode: z.string().max(50).optional().nullable(),
    labYear: z.union([z.number(), z.string()]).optional().nullable(),
    labSem: z.union([z.number(), z.string()]).optional().nullable(),
    labDay: z.string().max(50).optional().nullable(),
    labPeriod: z.string().max(50).optional().nullable(),
    labTime: z.string().max(50).optional().nullable(),
    allocationType: z.string().max(50).optional().nullable(),
  })
  .passthrough()

export const createHodSchema = z
  .object({
    facultyId: z.string().max(50).optional(),
    name: z.string().min(2).max(100),
    email: optionalEmailSchema,
    phone: z.string().max(100).optional().nullable(),
    password: z.string().max(100).optional(),
    department: z.string().max(150).optional(),
    designation: z.string().max(100).optional(),
    qualification: z.string().max(100).optional(),
    experience: z.union([z.number(), z.string()]).optional().nullable(),
    dateOfBirth: z.string().max(50).optional().nullable(),
    specialization: z.string().max(150).optional(),
    status: z.string().max(30).optional(),
  })
  .passthrough()

export const adminAcademicsSchema = z
  .object({
    code: z.string().min(2).max(30),
    name: z.string().min(2).max(200),
    credits: z.union([z.number().min(0).max(30), z.string()]).optional(),
    courseType: z.string().max(100).optional(),
    category: z.string().max(100).optional(),
    description: z.string().max(1000).optional(),
    facultyInCharge: z.string().max(150).optional(),
    semester: z.union([z.number().min(1).max(10), z.string()]).optional(),
  })
  .passthrough()

export const adminRolesSchema = z
  .object({
    permissions: z.array(z.any()),
  })
  .strict()

export const adminProfileSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    email: optionalEmailSchema,
    phone: z.string().max(20).optional().nullable(),
    profileImage: z.string().max(500000).optional().nullable(),
  })
  .strict()

export const adminSettingsSchema = z
  .object({
    action: z.string().max(50).optional(),
    currentPassword: z.string().max(100).optional(),
    newPassword: z.string().max(100).optional(),
  })
  .passthrough()

export const facultySettingsSchema = z
  .object({
    action: z.enum(['SAVE_PREFERENCES', 'CHANGE_PASSWORD', 'UPDATE_PROFILE']),
    preferences: z.record(z.any()).optional(),
    currentPassword: z.string().max(100).optional(),
    newPassword: z.string().max(100).optional(),
    name: z.string().max(100).optional(),
    phone: z.string().max(20).optional().nullable(),
    specialization: z.string().max(150).optional(),
    qualification: z.string().max(100).optional(),
    experience: z.union([z.number(), z.string()]).optional(),
    cabin: z.string().max(50).optional(),
    officeHours: z.string().max(100).optional(),
    profileImage: z.string().max(500000).optional().nullable(),
  })
  .passthrough()

export const hodSettingsSchema = z
  .object({
    attendanceThreshold: z.union([z.number(), z.string()]).optional(),
    showAttendanceBenchmark: z.boolean().optional(),
    academicTerm: z.string().max(100).optional(),
    regulation: z.string().max(50).optional(),
    academicYear: z.string().max(50).optional(),
    departmentCode: z.string().max(30).optional(),
    departmentName: z.string().max(150).optional(),
    hodContactEmail: optionalEmailSchema,
    smsDefaulters: z.boolean().optional(),
    emailQPUploads: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
    autoLockRegister: z.boolean().optional(),
    odProofNotification: z.boolean().optional(),
    advisorApprovalRequired: z.boolean().optional(),
  })
  .passthrough()

export const hodProfileSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().max(20).optional().nullable(),
    profileImage: z.string().max(500000).optional().nullable(),
    designation: z.string().max(100).optional(),
    qualification: z.string().max(100).optional(),
    experience: z.union([z.number(), z.string()]).optional(),
    officeLocation: z.string().max(150).optional(),
    officeHours: z.string().max(100).optional(),
    specializations: z.array(z.string().max(100)).optional(),
    bio: z.string().max(2000).optional(),
  })
  .passthrough()

export const profileChangeRequestSchema = z
  .object({
    registerNumber: z.string().max(50).optional(),
    studentName: z.string().max(100).optional(),
    requestedData: z.union([z.record(z.any()), z.string()]),
    currentData: z.union([z.record(z.any()), z.string()]).optional(),
    reason: z.string().max(500).optional(),
  })
  .strict()

export const profileChangeReviewSchema = z
  .object({
    id: z.string().min(1),
    action: z.enum(['approve', 'reject']),
    adminNotes: z.string().max(500).optional(),
    reviewedBy: z.string().max(100).optional(),
  })
  .strict()

export const bulkStudentItemSchema = z
  .object({
    registerNumber: z.string().min(1).max(50),
    name: z.string().min(1).max(100),
    email: optionalEmailSchema,
    password: z.string().max(100).optional(),
    phone: z.string().max(100).optional().nullable(),
    parentPhone: z.string().max(100).optional().nullable(),
    dateOfBirth: z.string().max(50).optional().nullable(),
    department: z.string().max(150).optional(),
    year: z.union([z.number(), z.string()]).optional(),
    semester: z.union([z.number(), z.string()]).optional(),
    batch: z.string().max(50).optional().nullable(),
    section: z.string().max(10).optional(),
    advisorName: z.string().max(100).optional().nullable(),
    bloodGroup: z.string().max(15).optional().nullable(),
    residencyStatus: z.string().max(50).optional().nullable(),
    cgpa: z.union([z.number(), z.string()]).optional().nullable(),
    attendance: z.union([z.string(), z.number()]).optional().nullable(),
    status: z.string().max(30).optional(),
  })
  .passthrough()

export const bulkStudentImportSchema = z
  .object({
    students: z.array(bulkStudentItemSchema).min(1, 'Please provide an array of student records'),
    defaultPassword: z.string().min(4).max(100).optional(),
  })
  .strict()

