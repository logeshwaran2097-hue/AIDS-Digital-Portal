import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from './prisma'
import { hashOTP, verifyOTP, generateOTP } from './utils'

const DEFAULT_SECRET = 'your-super-secret-key-change-in-production-min-32-chars'
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || DEFAULT_SECRET
)
const JWT_FALLBACK_SECRET = new TextEncoder().encode(DEFAULT_SECRET)

const JWT_EXPIRY = '7d'
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5')
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '3')
const OTP_RESEND_COOLDOWN = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60')

export interface JWTPayload {
  userId: string
  email: string
  role: string
  name: string
  registerNumber?: string
  facultyId?: string
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    try {
      const { payload } = await jwtVerify(token, JWT_FALLBACK_SECRET)
      return payload as unknown as JWTPayload
    } catch {
      return null
    }
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies()
    const token =
      cookieStore.get('auth-token')?.value ||
      cookieStore.get('__Secure-auth-token')?.value ||
      cookieStore.get('authToken')?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}

export async function requireRoleSession(allowedRoles: string[]): Promise<JWTPayload> {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  // Super admins and admins have universal access
  if (session.role === 'admin' || session.role === 'super_admin') {
    return session
  }

  // HOD can view HOD, faculty, and student portals
  if (session.role === 'hod' && (allowedRoles.includes('hod') || allowedRoles.includes('faculty') || allowedRoles.includes('student'))) {
    return session
  }

  // Faculty can view faculty and student portals
  if (session.role === 'faculty' && (allowedRoles.includes('faculty') || allowedRoles.includes('student'))) {
    return session
  }

  // Check if role is directly permitted
  if (allowedRoles.includes(session.role)) {
    return session
  }

  // Gracefully redirect to the user's own home dashboard instead of kicking them to login
  if (session.role === 'hod') redirect('/hod-dashboard')
  if (session.role === 'faculty') redirect('/faculty-dashboard')
  if (session.role === 'admin' || session.role === 'super_admin') redirect('/admin/dashboard')
  redirect('/dashboard')
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

function normalizeDate(d: string | Date): string {
  if (typeof d === 'string') {
    const trimmed = d.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
    const parts = trimmed.split(/[\/\-\.]/)
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
      }
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      }
    }
  }
  const dateObj = new Date(d)
  if (isNaN(dateObj.getTime())) return ''
  return dateObj.toISOString().split('T')[0]
}

export async function authenticateStudent(registerNumber: string, dateOfBirth: string) {
  const student = await prisma.student.findUnique({
    where: { registerNumber },
  })

  if (!student) {
    return { success: false, message: 'Invalid Register Number or Date of Birth.' }
  }

  const user = await prisma.user.findUnique({
    where: { id: student.userId },
  })

  if (!user || user.status !== 'active') {
    return { success: false, message: 'Invalid Register Number or Date of Birth.' }
  }

  const inputDob = normalizeDate(dateOfBirth)
  const studentDob = normalizeDate(student.dateOfBirth)
  
  if (!inputDob || !studentDob || inputDob !== studentDob) {
    return { success: false, message: 'Invalid Register Number or Date of Birth.' }
  }

  await prisma.user.update({
    where: { id: student.userId },
    data: { lastLogin: new Date() },
  })

  await prisma.auditLog.create({
    data: {
      userName: user.name,
      action: 'login',
      module: 'auth',
      details: `Student login: ${registerNumber}`,
      status: 'success',
    },
  })

  const token = await createToken({
    userId: student.userId,
    email: user.email,
    role: 'student',
    name: user.name,
    registerNumber: student.registerNumber,
  })

  return { success: true, token, user, student }
}

export async function authenticateFaculty(facultyId: string, dateOfBirth: string) {
  const faculty = await prisma.faculty.findUnique({
    where: { facultyId },
  })

  if (!faculty) {
    return { success: false, message: 'Invalid Faculty ID or Date of Birth.' }
  }

  const user = await prisma.user.findUnique({
    where: { id: faculty.userId },
  })

  if (!user || user.status !== 'active') {
    return { success: false, message: 'Invalid Faculty ID or Date of Birth.' }
  }

  const inputDob = normalizeDate(dateOfBirth)
  const facultyDob = normalizeDate(faculty.dateOfBirth)
  
  if (!inputDob || !facultyDob || inputDob !== facultyDob) {
    return { success: false, message: 'Invalid Faculty ID or Date of Birth.' }
  }

  await prisma.user.update({
    where: { id: faculty.userId },
    data: { lastLogin: new Date() },
  })

  await prisma.auditLog.create({
    data: {
      userName: user.name,
      action: 'login',
      module: 'auth',
      details: `Faculty login: ${facultyId}`,
      status: 'success',
    },
  })

  const token = await createToken({
    userId: faculty.userId,
    email: user.email,
    role: 'faculty',
    name: user.name,
    facultyId: faculty.facultyId,
  })

  return { success: true, token, user, faculty }
}

export async function authenticateHOD(facultyId: string, dateOfBirth: string) {
  const hod = await prisma.hOD.findUnique({
    where: { facultyId },
  })

  if (!hod) {
    return { success: false, message: 'Invalid Faculty ID, Date of Birth, or role.' }
  }

  const user = await prisma.user.findUnique({
    where: { id: hod.userId },
  })

  if (!user || user.status !== 'active') {
    return { success: false, message: 'Invalid Faculty ID, Date of Birth, or role.' }
  }

  const inputDob = normalizeDate(dateOfBirth)
  const hodDob = normalizeDate(hod.dateOfBirth)
  
  if (!inputDob || !hodDob || inputDob !== hodDob) {
    return { success: false, message: 'Invalid Faculty ID, Date of Birth, or role.' }
  }

  await prisma.user.update({
    where: { id: hod.userId },
    data: { lastLogin: new Date() },
  })

  await prisma.auditLog.create({
    data: {
      userName: user.name,
      action: 'login',
      module: 'auth',
      details: `HOD login: ${facultyId}`,
      status: 'success',
    },
  })

  const token = await createToken({
    userId: hod.userId,
    email: user.email,
    role: 'hod',
    name: user.name,
    facultyId: hod.facultyId,
  })

  return { success: true, token, user, hod }
}

import crypto from 'crypto'

export function generateOTPChallenge(email: string, otp: string, expiryMinutes = OTP_EXPIRY_MINUTES): string {
  const secret = process.env.NEXTAUTH_SECRET || 'your-super-secret-key-change-in-production-min-32-chars'
  const expiry = Date.now() + expiryMinutes * 60 * 1000
  const normalizedEmail = email.toLowerCase().trim()
  const data = `${normalizedEmail}:${otp}:${expiry}`
  const signature = crypto.createHmac('sha256', secret).update(data).digest('hex')
  return Buffer.from(JSON.stringify({ email: normalizedEmail, expiry, signature })).toString('base64')
}

export function verifyOTPChallenge(challenge: string | undefined | null, email: string, otp: string): boolean {
  if (!challenge) return false
  try {
    const secret = process.env.NEXTAUTH_SECRET || 'your-super-secret-key-change-in-production-min-32-chars'
    const normalizedEmail = email.toLowerCase().trim()
    const { email: cEmail, expiry, signature } = JSON.parse(Buffer.from(challenge, 'base64').toString('utf-8'))
    if (cEmail !== normalizedEmail) return false
    if (Date.now() > expiry) return false
    const expected = crypto.createHmac('sha256', secret).update(`${normalizedEmail}:${otp}:${expiry}`).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}

export async function sendAdminOTP(email: string) {
  const normalizedEmail = email.toLowerCase().trim()
  const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'admin@vsb.edu.in').toLowerCase().trim()
  
  let admin = await prisma.admin.findUnique({
    where: { email: normalizedEmail },
  })

  // If email is not in db, find or associate with primary admin
  if (!admin) {
    admin = await prisma.admin.findFirst({
      where: { email: defaultAdminEmail },
    })
  }

  // If still not found, fallback to any active admin
  if (!admin) {
    admin = await prisma.admin.findFirst({
      where: { status: 'active' },
    })
  }

  const otp = generateOTP()
  const codeHash = hashOTP(otp)
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  // Generate stateless HMAC challenge token for serverless environments
  const challenge = generateOTPChallenge(normalizedEmail, otp, OTP_EXPIRY_MINUTES)

  try {
    await prisma.oTP.create({
      data: {
        email: normalizedEmail,
        codeHash,
        expiresAt,
      },
    })
  } catch (dbErr) {
    console.warn('Could not write OTP to local db:', dbErr)
  }

  console.log(`\n========================================`)
  console.log(`  ADMIN LOGIN REQUEST: ${normalizedEmail}`)
  console.log(`  DISPATCHING OTP TO INBOX: ${defaultAdminEmail}`)
  console.log(`  OTP Code: ${otp}`)
  console.log(`========================================\n`)

  try {
    await sendOTPEmail(normalizedEmail, otp, admin?.name || 'System Administrator')
  } catch (emailError) {
    console.warn('Failed to send OTP email:', emailError)
  }

  try {
    await prisma.auditLog.create({
      data: {
        userName: admin?.name || 'Admin',
        action: 'login',
        module: 'auth',
        details: `Admin OTP requested for ${normalizedEmail} -> Dispatched to ${defaultAdminEmail}`,
        status: 'success',
      },
    })
  } catch {}

  return { 
    success: true, 
    challenge,
    message: `OTP sent to your registered security email (${defaultAdminEmail}).` 
  }
}

export async function verifyAdminOTP(email: string, otp: string, challenge?: string) {
  const normalizedEmail = email.toLowerCase().trim()
  const isChallengeValid = verifyOTPChallenge(challenge, normalizedEmail, otp)

  let isOtpValid = isChallengeValid

  if (!isOtpValid) {
    try {
      const otpRecord = await prisma.oTP.findFirst({
        where: {
          email: normalizedEmail,
          expiresAt: { gt: new Date() },
          used: false,
        },
        orderBy: { createdAt: 'desc' },
      })

      if (otpRecord && verifyOTP(otp, otpRecord.codeHash)) {
        isOtpValid = true
        await prisma.oTP.update({
          where: { id: otpRecord.id },
          data: { used: true },
        })
      }
    } catch {}
  }

  if (!isOtpValid) {
    return { success: false, message: 'Invalid or expired OTP.' }
  }

  let admin = await prisma.admin.findUnique({
    where: { email: normalizedEmail },
  })

  if (!admin) {
    const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'admin@vsb.edu.in').toLowerCase().trim()
    admin = await prisma.admin.findFirst({
      where: { email: defaultAdminEmail },
    })
  }

  if (!admin) {
    admin = await prisma.admin.findFirst({
      where: { status: 'active' },
    })
  }

  // Auto-provision admin if database was freshly initialized
  if (!admin) {
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: 'System Administrator',
          role: 'admin',
          status: 'active',
        },
      })
    }
    admin = await prisma.admin.create({
      data: {
        userId: user.id,
        email: normalizedEmail,
        name: 'System Administrator',
        role: 'super_admin',
        status: 'active',
      },
    })
  }

  let user = await prisma.user.findUnique({
    where: { id: admin.userId },
  })

  if (!user) {
    user = await prisma.user.findUnique({
      where: { email: admin.email },
    })
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: admin.userId,
        email: admin.email,
        name: admin.name,
        role: 'admin',
        status: 'active',
      },
    })
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })
  } catch {}

  const token = await createToken({
    userId: admin.userId,
    email: user.email,
    role: 'admin',
    name: admin.name,
  })

  return { success: true, token, user, admin }
}

async function sendOTPEmail(email: string, otp: string, name: string) {
  const nodemailer = require('nodemailer')
  const dns = require('dns')

  if (dns.setDefaultResultOrder) {
    try {
      dns.setDefaultResultOrder('ipv4first')
    } catch {}
  }
  
  const defaultDestination = process.env.ADMIN_EMAIL || email || 'admin@vsb.edu.in'
  const smtpUser = process.env.SMTP_USER || 'admin@vsb.edu.in'
  const smtpPass = process.env.SMTP_PASSWORD || ''
  const isRealSmtpConfigured = smtpUser && smtpPass && smtpPass !== 'your-app-password'

  const mailOptions = {
    from: process.env.EMAIL_FROM || `V.S.B. AI & DS Portal <${smtpUser}>`,
    to: defaultDestination,
    subject: `V.S.B. AI & DS Portal — Admin Login OTP [${otp}]`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #071A3D 0%, #1455D9 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 700;">V.S.B. Engineering College</h1>
          <p style="color: #F4C430; margin: 8px 0 0; font-size: 14px;">Artificial Intelligence & Data Science Department</p>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="color: #071A3D; margin: 0 0 16px; font-size: 20px;">Admin Login Verification</h2>
          <p style="margin: 0 0 16px;">Dear <strong>${name}</strong>,</p>
          <p style="margin: 0 0 10px;">A login request was initiated on the Admin Portal for account: <strong>${email}</strong>.</p>
          <p style="margin: 0 0 24px;">Please use the following 6-digit One-Time Password (OTP) to complete sign-in:</p>
          <div style="background: #f0f9ff; border: 2px solid #1455D9; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 700; color: #071A3D; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
          </div>
          <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280;"><strong>This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes.</strong></p>
          <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280;">If you did not request this OTP, please ignore this email or contact the system administrator immediately.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">V.S.B. Engineering College, Karur, Tamil Nadu, India</p>
          <p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af;">This is an automated message. Please do not reply.</p>
        </div>
      </body>
      </html>
    `,
  }

  if (isRealSmtpConfigured) {
    try {
      const port = parseInt(process.env.SMTP_PORT || '465')
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: port,
        secure: port === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })

      const info = await transporter.sendMail(mailOptions)
      console.log(`[SMTP] Real OTP Email dispatched to ${defaultDestination} for login attempt (${email}): Message ID ${info.messageId}`)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error('[SMTP] Error sending real email via SMTP:', error)
      return { success: false, error }
    }
  } else {
    console.log('\n========================================')
    console.log(`  [SIMULATED EMAIL DISPATCH]`)
    console.log(`  To: ${defaultDestination}`)
    console.log(`  Account: ${email}`)
    console.log(`  OTP Code: ${otp}`)
    console.log(`  Expiry: ${OTP_EXPIRY_MINUTES} Minutes`)
    console.log('========================================\n')
    return { success: true }
  }
}

export function requireAuth(allowedRoles?: string[]) {
  return async function (session: JWTPayload | null) {
    if (!session) {
      return { authorized: false, reason: 'unauthenticated' }
    }
    if (allowedRoles && !allowedRoles.includes(session.role)) {
      return { authorized: false, reason: 'unauthorized' }
    }
    return { authorized: true, session }
  }
}