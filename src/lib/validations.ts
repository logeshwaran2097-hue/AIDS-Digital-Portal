import { z } from 'zod'
import { NextResponse } from 'next/server'

// Clean string sanitizer (strips potential null bytes and controls)
export const safeString = (min = 1, max = 500) =>
  z.string().trim().min(min, `Field must be at least ${min} character(s)`).max(max, `Field cannot exceed ${max} characters`)

// 6-digit numeric OTP schema
export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'OTP must be exactly 6 numeric digits')

// Phone number schema (10-15 digits, optional +)
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+?\d{1,4}[- ]?)?\d{10}$/, 'Invalid phone number format')

// Email schema
export const emailSchema = z
  .string()
  .trim()
  .email('Invalid email address format')
  .max(150, 'Email cannot exceed 150 characters')

// Student Login Schema
export const studentLoginSchema = z.object({
  identifier: z.string().trim().min(2, 'Register Number or Email is required').max(100),
  password: z.string().min(1, 'Password is required').max(128, 'Password cannot exceed 128 characters'),
})

// Staff/Faculty/HOD Login Schema
export const staffLoginSchema = z.object({
  identifier: z.string().trim().min(2, 'Faculty ID or Email is required').max(100),
  password: z.string().min(1, 'Password is required').max(128, 'Password cannot exceed 128 characters'),
  role: z.enum(['faculty', 'advisor', 'hod']).optional(),
})

// Admin Send OTP Schema
export const adminSendOtpSchema = z.object({
  email: emailSchema,
})

// Admin Verify OTP Schema
export const adminVerifyOtpSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
  challenge: z.string().trim().min(1).optional(),
})

// Verify Onboarding OTP Schema
export const verifyOnboardingOtpSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
  challenge: z.string().trim().optional(),
})

// AI Request Schema
export const aiQuerySchema = z.object({
  prompt: z.string().trim().min(1, 'Prompt cannot be empty').max(4000, 'Prompt exceeds maximum length of 4000 characters'),
  context: z.record(z.any()).optional(),
  model: z.string().trim().max(100).optional(),
})

// Student Profile Update Schema
export const studentUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().max(20).optional().nullable(),
  parentPhone: z.string().trim().max(20).optional().nullable(),
  isParentWhatsapp: z.boolean().optional(),
  bloodGroup: z.string().trim().max(10).optional().nullable(),
  residencyStatus: z.string().trim().max(30).optional().nullable(),
  hostelBlock: z.string().trim().max(50).optional().nullable(),
  roomNo: z.string().trim().max(20).optional().nullable(),
  busNo: z.string().trim().max(20).optional().nullable(),
  boardingPoint: z.string().trim().max(100).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  profileImage: z.string().max(500000).optional().nullable(),
  dateOfBirth: z.string().max(30).optional().nullable(),
})

/**
 * Validates request body against schema.
 * Returns { data, errorResponse }
 */
export async function validateBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ data?: T; errorResponse?: NextResponse }> {
  try {
    const json = await req.json()
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      const errorDetails = parsed.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }))
      return {
        errorResponse: NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            message: errorDetails[0]?.message || 'Invalid input data',
            details: errorDetails,
          },
          { status: 400 }
        ),
      }
    }
    return { data: parsed.data }
  } catch {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      ),
    }
  }
}
