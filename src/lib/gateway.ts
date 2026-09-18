/**
 * Enterprise Gateway Library — Twilio SMS / Twilio WhatsApp / Meta WhatsApp / Fast2SMS
 * Server-only. Handles real-time absent notifications to parent numbers.
 */
import { prisma } from '@/lib/prisma'

export type SmsProvider = 'twilio' | 'fast2sms' | 'custom'
export type WhatsappProvider = 'fast2sms' | 'meta' | 'twilio'

export interface GatewayConfig {
  smsProvider: SmsProvider
  smsApiKey: string // may be "ACxxxx:token"
  smsSenderId: string
  whatsappEnabled: boolean
  whatsappProvider: WhatsappProvider
  whatsappPhoneNumberId: string
  whatsappAccessToken: string
  fast2smsWhatsappApiKey?: string
  fast2smsPhoneNumberId?: string
  fast2smsMessageId?: string
  twilioAccountSid: string
  twilioAuthToken: string
  twilioPhoneNumber: string // E.164 e.g. +15551234567
  twilioWhatsappFrom: string // e.g. whatsapp:+14155238886
}

export interface SendResult {
  success: boolean
  provider: string
  channel: 'sms' | 'whatsapp'
  sid?: string
  messageId?: string
  error?: string
  details?: any
}

function cleanDigits(phone: string): string {
  return (phone || '').replace(/\D/g, '')
}

export function toE164(phone: string): string | null {
  const d = cleanDigits(phone)
  if (d.length < 10) return null
  const last10 = d.slice(-10)
  return `+91${last10}`
}

export function toWhatsappDigits(phone: string): string | null {
  const d = cleanDigits(phone)
  if (d.length < 10) return null
  return `91${d.slice(-10)}`
}

function parseTwilioCreds(apiKey: string, envSid: string, envToken: string): { sid: string; token: string } {
  let sid = (envSid || '').trim()
  let token = (envToken || '').trim()
  const raw = (apiKey || '').trim()
  if (raw.includes(':')) {
    const [a, ...rest] = raw.split(':')
    sid = a.trim()
    token = rest.join(':').trim()
  } else if (raw.startsWith('AC')) {
    sid = raw
  } else if (raw) {
    token = raw
  }
  return { sid, token }
}

export async function getGatewayConfig(): Promise<GatewayConfig> {
  let portal: any = {}
  try {
    const saved = await (prisma as any).systemSettings?.findUnique?.({ where: { key: 'portal_config' } })
    if (saved?.value) portal = JSON.parse(saved.value)
  } catch {}

  const sidEnv = process.env.TWILIO_ACCOUNT_SID || ''
  const tokenEnv = process.env.TWILIO_AUTH_TOKEN || ''

  // smsApiKey may contain "AC:token" — reuse for whatsapp twilio as well
  const rawApiKey =
    portal.smsApiKey ||
    process.env.FAST2SMS_API_KEY ||
    'XSyBcPD25Z6hbnUftEkTVr90xzuMWawoKQRILOHdCY8elm43ipVt9cDqsCbhOo805HdKuLeAES7QGyP4'

  const fast2smsWaKey =
    portal.fast2smsWhatsappApiKey ||
    process.env.FAST2SMS_WHATSAPP_API_KEY ||
    rawApiKey

  const { sid: parsedSid, token: parsedToken } = parseTwilioCreds(rawApiKey, sidEnv, tokenEnv)

  return {
    smsProvider: (portal.smsProvider as SmsProvider) || 'fast2sms',
    smsApiKey: rawApiKey,
    smsSenderId: portal.smsSenderId || process.env.TWILIO_PHONE_NUMBER || 'VSBEDU',
    whatsappEnabled: portal.whatsappEnabled !== false,
    whatsappProvider: (portal.whatsappProvider as WhatsappProvider) || 'fast2sms',
    whatsappPhoneNumberId: portal.whatsappPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    whatsappAccessToken: portal.whatsappAccessToken || process.env.WHATSAPP_ACCESS_TOKEN || '',
    fast2smsWhatsappApiKey: fast2smsWaKey,
    fast2smsPhoneNumberId: portal.fast2smsPhoneNumberId || process.env.FAST2SMS_WHATSAPP_PHONE_NUMBER_ID || '1325593377300934',
    fast2smsMessageId: portal.fast2smsMessageId || process.env.FAST2SMS_WHATSAPP_MESSAGE_ID || '31679',
    twilioAccountSid: parsedSid || sidEnv,
    twilioAuthToken: parsedToken || tokenEnv,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || portal.smsSenderId || '',
    twilioWhatsappFrom: process.env.TWILIO_WHATSAPP_FROM || portal.twilioWhatsappFrom || 'whatsapp:+14155238886',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Low-level senders
// ─────────────────────────────────────────────────────────────────────────────
async function sendTwilioSms(toE164: string, body: string, cfg: GatewayConfig): Promise<SendResult> {
  if (!cfg.twilioAccountSid || !cfg.twilioAuthToken) {
    return { success: false, provider: 'Twilio Cloud SMS', channel: 'sms', error: 'Twilio credentials missing' }
  }
  const from = (cfg.twilioPhoneNumber || cfg.smsSenderId || '').trim()
  // Twilio requires a verified E.164 number, not alphanumeric sender ID
  if (!from.startsWith('+')) {
    return {
      success: false,
      provider: 'Twilio Cloud SMS',
      channel: 'sms',
      error: `Twilio SMS 'From' must be a verified E.164 phone number (e.g. +15551234567). Got "${from}". Set TWILIO_PHONE_NUMBER in env or SMS Sender ID to a Twilio number.`,
    }
  }
  try {
    const basicAuth = Buffer.from(`${cfg.twilioAccountSid}:${cfg.twilioAuthToken}`).toString('base64')
    const form = new URLSearchParams()
    form.append('To', toE164)
    form.append('From', from)
    form.append('Body', body)
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${cfg.twilioAccountSid}/Messages.json`, {
      method: 'POST',
      headers: { Authorization: `Basic ${basicAuth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.sid) return { success: true, provider: 'Twilio Cloud SMS', channel: 'sms', sid: data.sid, details: data }
    return { success: false, provider: 'Twilio Cloud SMS', channel: 'sms', error: data.message || `Twilio error ${data.code || res.status}`, details: data }
  } catch (e: any) {
    return { success: false, provider: 'Twilio Cloud SMS', channel: 'sms', error: e.message }
  }
}

async function sendTwilioWhatsapp(toE164: string, body: string, cfg: GatewayConfig): Promise<SendResult> {
  if (!cfg.twilioAccountSid || !cfg.twilioAuthToken) {
    return { success: false, provider: 'Twilio WhatsApp', channel: 'whatsapp', error: 'Twilio credentials missing' }
  }
  const from = cfg.twilioWhatsappFrom?.trim() || 'whatsapp:+14155238886'
  if (!from.startsWith('whatsapp:')) {
    return { success: false, provider: 'Twilio WhatsApp', channel: 'whatsapp', error: `TWILIO_WHATSAPP_FROM must start with "whatsapp:" e.g. whatsapp:+14155238886. Got "${from}"` }
  }
  try {
    const basicAuth = Buffer.from(`${cfg.twilioAccountSid}:${cfg.twilioAuthToken}`).toString('base64')
    const form = new URLSearchParams()
    form.append('To', `whatsapp:${toE164}`)
    form.append('From', from)
    form.append('Body', body)
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${cfg.twilioAccountSid}/Messages.json`, {
      method: 'POST',
      headers: { Authorization: `Basic ${basicAuth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.sid) return { success: true, provider: 'Twilio WhatsApp', channel: 'whatsapp', sid: data.sid, details: data }
    return { success: false, provider: 'Twilio WhatsApp', channel: 'whatsapp', error: data.message || `Twilio error ${data.code || res.status}`, details: data }
  } catch (e: any) {
    return { success: false, provider: 'Twilio WhatsApp', channel: 'whatsapp', error: e.message }
  }
}

async function sendMetaWhatsapp(toDigits91: string, body: string, cfg: GatewayConfig): Promise<SendResult> {
  if (!cfg.whatsappAccessToken || !cfg.whatsappPhoneNumberId) {
    return { success: false, provider: 'Meta WhatsApp Cloud', channel: 'whatsapp', error: 'Meta WhatsApp credentials missing (Phone Number ID / Access Token)' }
  }
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${cfg.whatsappPhoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.whatsappAccessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to: toDigits91, type: 'text', text: { preview_url: false, body } }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.messages?.[0]?.id) return { success: true, provider: 'Meta WhatsApp Cloud', channel: 'whatsapp', messageId: data.messages[0].id, details: data }
    return { success: false, provider: 'Meta WhatsApp Cloud', channel: 'whatsapp', error: data.error?.message || 'Meta rejected', details: data }
  } catch (e: any) {
    return { success: false, provider: 'Meta WhatsApp Cloud', channel: 'whatsapp', error: e.message }
  }
}

async function sendFast2Sms(toLast10: string, body: string, cfg: GatewayConfig): Promise<SendResult> {
  const token = cfg.smsApiKey?.trim() || process.env.FAST2SMS_API_KEY || ''
  if (!token) return { success: false, provider: 'Fast2SMS', channel: 'sms', error: 'Fast2SMS API key missing' }
  try {
    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: { authorization: token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ route: 'q', message: body, language: 'english', flash: 0, numbers: toLast10 }),
    })
    const data = await res.json().catch(() => ({}))
    if (data.return === true) return { success: true, provider: 'Fast2SMS', channel: 'sms', sid: data.request_id, details: data }
    return { success: false, provider: 'Fast2SMS', channel: 'sms', error: data.message?.[0] || 'Fast2SMS rejected', details: data }
  } catch (e: any) {
    return { success: false, provider: 'Fast2SMS', channel: 'sms', error: e.message }
  }
}

export interface WhatsappMessageParams {
  studentName?: string
  date?: string
  status?: string
  remarks?: string | null
  reason?: string
  fullMessage?: string
}

export function getEnglishStatus(status?: string | null): string {
  const s = String(status || '').trim().toUpperCase()
  if (s === 'A' || s === 'ABSENT') return 'Absent'
  if (s === 'OD' || s === 'ON-DUTY' || s === 'ON DUTY') return 'On-Duty (OD)'
  if (s === 'ML' || s === 'MEDICAL LEAVE') return 'Medical Leave (ML)'
  if (s === 'L' || s === 'LATE') return 'Late Entry (Late)'
  if (s === 'P' || s === 'PRESENT') return 'Present'
  return status || 'Status Notification'
}

export function getTamilStatus(status?: string | null): string {
  const s = String(status || '').trim().toUpperCase()
  if (s === 'A' || s === 'ABSENT') return 'வருகை தரவில்லை (Absent)'
  if (s === 'OD' || s === 'ON-DUTY' || s === 'ON DUTY') return 'அலுவல் முறை அனுமதி (On-Duty / OD)'
  if (s === 'ML' || s === 'MEDICAL LEAVE') return 'மருத்துவ விடுப்பு (Medical Leave / ML)'
  if (s === 'L' || s === 'LATE') return 'தாமத வருகை (Late Entry)'
  if (s === 'P' || s === 'PRESENT') return 'வருகை புரிந்துள்ளார் (Present)'
  return 'மாணவர் நிலை அறிவிப்பு'
}

export function getEnglishRemarks(remarks?: string | null, status?: string | null): string {
  const r = (remarks || '').trim()
  if (r) return r
  const s = String(status || '').trim().toUpperCase()
  if (s === 'A') return 'Uninformed Absence'
  if (s === 'OD') return 'On-Duty Permission Approved'
  if (s === 'ML') return 'Medical Leave Approved'
  if (s === 'L') return 'Late Entry to Class'
  return 'Official College Record'
}

export function getTamilRemarks(remarks?: string | null, status?: string | null): string {
  const r = (remarks || '').trim()
  if (!r) {
    const s = String(status || '').trim().toUpperCase()
    if (s === 'A') return 'முன்னறிவிப்பற்ற விடுப்பு'
    if (s === 'OD') return 'அலுவல் முறை பணி அனுமதி (அங்கீகரிக்கப்பட்டது)'
    if (s === 'ML') return 'மருத்துவ விடுப்பு (அங்கீகரிக்கப்பட்டது)'
    if (s === 'L') return 'வகுப்பிற்கு தாமத வருகை'
    return 'கல்லூரி அதிகாரப்பூர்வ பதிவு'
  }

  const lower = r.toLowerCase()
  if (lower.includes('uninformed absence')) return 'முன்னறிவிப்பற்ற விடுப்பு'
  if (lower.includes('medical leave')) return 'மருத்துவ விடுப்பு (சான்றிதழ் சமர்ப்பிக்கப்பட்டது)'
  if (lower.includes('symposium') || lower.includes('hackathon')) return 'கருத்தரங்கம் / ஹேக்கத்தான் அலுவல் அனுமதி'
  if (lower.includes('sports') || lower.includes('ncc') || lower.includes('nss')) return 'விளையாட்டு / NCC / NSS அலுவல் அனுமதி'
  if (lower.includes('placement') || lower.includes('internship')) return 'வேலைவாய்ப்பு / பயிற்சி முகாம் அனுமதி'
  if (lower.includes('family emergency') || lower.includes('permission')) return 'குடும்ப அவசரக் காரண விடுப்பு'
  if (lower.includes('late entry') || lower.includes('gate pass')) return 'தாமத வருகை அனுமதி (Gate Pass)'
  if (lower.includes('personal reason')) return 'தனிப்பட்ட காரண விடுப்பு'
  if (lower.includes('sick') || lower.includes('fever')) return 'உடல்நலக் குறைவு விடுப்பு'

  return `${r} (வகுப்பு ஆலோசகர் பதிவு)`
}

export function buildBilingualStatusMessage(opts: {
  studentName: string
  date: string
  status: string
  remarks?: string | null
}): string {
  const engStatus = getEnglishStatus(opts.status)
  const tamStatus = getTamilStatus(opts.status)
  const engRemarks = getEnglishRemarks(opts.remarks, opts.status)
  const tamRemarks = getTamilRemarks(opts.remarks, opts.status)

  return `Dear Parent,

OFFICIAL STUDENT STATUS NOTIFICATION

Department of AI & DS
V.S.B. Engineering College (Autonomous)

Student Name: ${opts.studentName}
Date: ${opts.date}
Status: ${engStatus}
Remarks: ${engRemarks}

This is an official notification regarding your son/daughter's student status.

For any clarification, please contact the Class Advisor.

Regards,
Class Advisor
Department of AI & DS
V.S.B. Engineering College (Autonomous)

அன்புள்ள பெற்றோரே,

மாணவர் நிலை தொடர்பான அதிகாரப்பூர்வ அறிவிப்பு

AI & DS துறை
வி.எஸ்.பி. பொறியியல் கல்லூரி (தன்னாட்சி)

மாணவர் பெயர்: ${opts.studentName}
தேதி: ${opts.date}
நிலை: ${tamStatus}
குறிப்பு: ${tamRemarks}

உங்கள் மகன்/மகளின் மாணவர் நிலை தொடர்பான அதிகாரப்பூர்வ அறிவிப்பு இது.

மேலும் விளக்கங்களுக்கு வகுப்பு ஆலோசகரை தொடர்பு கொள்ளவும்.

நன்றி,
வகுப்பு ஆலோசகர்
AI & DS துறை
வி.எஸ்.பி. பொறியியல் கல்லூரி (தன்னாட்சி)`
}

async function sendFast2SmsWhatsapp(
  toLast10: string,
  bodyOrParams: string | WhatsappMessageParams,
  cfg: GatewayConfig
): Promise<SendResult> {
  const token =
    cfg.fast2smsWhatsappApiKey?.trim() ||
    cfg.smsApiKey?.trim() ||
    process.env.FAST2SMS_WHATSAPP_API_KEY ||
    process.env.FAST2SMS_API_KEY ||
    'XSyBcPD25Z6hbnUftEkTVr90xzuMWawoKQRILOHdCY8elm43ipVt9cDqsCbhOo805HdKuLeAES7QGyP4'

  if (!token) {
    return { success: false, provider: 'Fast2SMS WhatsApp', channel: 'whatsapp', error: 'Fast2SMS WhatsApp API key missing' }
  }

  const phoneId =
    cfg.fast2smsPhoneNumberId?.trim() ||
    process.env.FAST2SMS_WHATSAPP_PHONE_NUMBER_ID ||
    '1325593377300934'

  const messageId =
    cfg.fast2smsMessageId?.trim() ||
    process.env.FAST2SMS_WHATSAPP_MESSAGE_ID ||
    '31679'

  let sName = 'Student'
  let sDate = new Date().toLocaleDateString('en-GB')
  let sStatus = 'Absent'
  let sRemarks = 'Uninformed Absence'

  if (typeof bodyOrParams === 'object') {
    sName = bodyOrParams.studentName || 'Student'
    sDate = bodyOrParams.date || new Date().toLocaleDateString('en-GB')
    sStatus = bodyOrParams.status || bodyOrParams.reason || 'Absent'
    sRemarks = (bodyOrParams.remarks !== undefined && bodyOrParams.remarks !== null) ? bodyOrParams.remarks : (sStatus === 'A' ? 'Uninformed Absence' : sStatus === 'OD' ? 'On-Duty' : sStatus === 'ML' ? 'Medical Leave' : 'Official Notification')
  } else {
    // Attempt extracting name and date from text
    const nameMatch = bodyOrParams.match(/Student Name:\s*([^\n]+)/i) || bodyOrParams.match(/ward\s+([^(]+)\s*\(/i) || bodyOrParams.match(/மாணவர் பெயர்:\s*([^\n]+)/i)
    if (nameMatch) sName = nameMatch[1].trim()
    const dateMatch = bodyOrParams.match(/Date:\s*([0-9\-/]+)/i) || bodyOrParams.match(/on\s+([0-9\-/]+)/i) || bodyOrParams.match(/தேதி:\s*([0-9\-/]+)/i)
    if (dateMatch) sDate = dateMatch[1].trim()
    const statusMatch = bodyOrParams.match(/Status:\s*([^\n]+)/i) || bodyOrParams.match(/நிலை:\s*([^\n]+)/i)
    if (statusMatch) sStatus = statusMatch[1].trim()
    const remarksMatch = bodyOrParams.match(/Remarks:\s*([^\n]+)/i) || bodyOrParams.match(/குறிப்பு:\s*([^\n]+)/i)
    if (remarksMatch) sRemarks = remarksMatch[1].trim()
  }

  const engStatus = getEnglishStatus(sStatus)
  const tamStatus = getTamilStatus(sStatus)
  const engRemarks = getEnglishRemarks(sRemarks, sStatus)
  const tamRemarks = getTamilRemarks(sRemarks, sStatus)

  // 8 variables matching bilingual template
  const variablesValues8 = `${sName}|${sDate}|${engStatus}|${engRemarks}|${sName}|${sDate}|${tamStatus}|${tamRemarks}`
  // 4 variables fallback if template requires 4 params
  const variablesValues4 = `${sName}|${sDate}|${engStatus} (${tamStatus})|${engRemarks} (${tamRemarks})`

  try {
    let res = await fetch('https://www.fast2sms.com/dev/whatsapp', {
      method: 'POST',
      headers: {
        authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message_id: messageId,
        phone_number_id: phoneId,
        numbers: toLast10,
        variables_values: variablesValues8,
      }),
    })
    let data = await res.json().catch(() => ({}))

    // If Fast2SMS returned error mentioning variables not matching, auto-retry with 4 variables
    if (
      data.return !== true &&
      data.message &&
      Array.isArray(data.message) &&
      (data.message[0]?.toLowerCase().includes('variable') || data.message[0]?.toLowerCase().includes('match'))
    ) {
      const resRetry = await fetch('https://www.fast2sms.com/dev/whatsapp', {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_id: messageId,
          phone_number_id: phoneId,
          numbers: toLast10,
          variables_values: variablesValues4,
        }),
      })
      const dataRetry = await resRetry.json().catch(() => ({}))
      if (dataRetry.return === true) {
        return { success: true, provider: 'Fast2SMS WhatsApp', channel: 'whatsapp', sid: dataRetry.request_id, details: dataRetry }
      }
      data = dataRetry
    }

    if (data.return === true) {
      return { success: true, provider: 'Fast2SMS WhatsApp', channel: 'whatsapp', sid: data.request_id, details: data }
    }
    return {
      success: false,
      provider: 'Fast2SMS WhatsApp',
      channel: 'whatsapp',
      error: data.message?.[0] || 'Fast2SMS WhatsApp rejected',
      details: data,
    }
  } catch (e: any) {
    return { success: false, provider: 'Fast2SMS WhatsApp', channel: 'whatsapp', error: e.message }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public: unified senders respecting GatewayConfig
// ─────────────────────────────────────────────────────────────────────────────
export async function sendSms(toRaw: string, body: string, cfg?: GatewayConfig): Promise<SendResult> {
  const config = cfg || (await getGatewayConfig())
  const e164 = toE164(toRaw)
  if (!e164) return { success: false, provider: config.smsProvider, channel: 'sms', error: 'Invalid phone number' }
  if (config.smsProvider === 'twilio') return sendTwilioSms(e164, body, config)
  if (config.smsProvider === 'fast2sms') {
    const last10 = cleanDigits(toRaw).slice(-10)
    return sendFast2Sms(last10, body, config)
  }
  return { success: false, provider: 'Custom', channel: 'sms', error: 'Custom gateway not configured' }
}

export async function sendWhatsapp(
  toRaw: string,
  bodyOrParams: string | WhatsappMessageParams,
  cfg?: GatewayConfig
): Promise<SendResult> {
  const config = cfg || (await getGatewayConfig())
  if (!config.whatsappEnabled) return { success: false, provider: 'WhatsApp disabled', channel: 'whatsapp', error: 'WhatsApp disabled in settings' }

  if (config.whatsappProvider === 'fast2sms') {
    const last10 = cleanDigits(toRaw).slice(-10)
    if (last10.length < 10) return { success: false, provider: 'Fast2SMS WhatsApp', channel: 'whatsapp', error: 'Invalid phone number' }
    return sendFast2SmsWhatsapp(last10, bodyOrParams, config)
  }

  const bodyStr =
    typeof bodyOrParams === 'string'
      ? bodyOrParams
      : (bodyOrParams.fullMessage ||
          buildBilingualStatusMessage({
            studentName: bodyOrParams.studentName || 'Student',
            date: bodyOrParams.date || new Date().toLocaleDateString('en-GB'),
            status: bodyOrParams.status || bodyOrParams.reason || 'Absent',
            remarks: bodyOrParams.remarks,
          }))

  if (config.whatsappProvider === 'twilio') {
    const e164 = toE164(toRaw)
    if (!e164) return { success: false, provider: 'Twilio WhatsApp', channel: 'whatsapp', error: 'Invalid phone number' }
    return sendTwilioWhatsapp(e164, bodyStr, config)
  }
  // meta
  const digits = toWhatsappDigits(toRaw)
  if (!digits) return { success: false, provider: 'Meta WhatsApp Cloud', channel: 'whatsapp', error: 'Invalid phone number' }
  return sendMetaWhatsapp(digits, bodyStr, config)
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification helpers
// ─────────────────────────────────────────────────────────────────────────────
export function buildAbsentMessage(opts: {
  studentName: string
  registerNumber: string
  date: string
  sessionLabel: string
  takenByName?: string
  reason?: string
}): string {
  return buildBilingualStatusMessage({
    studentName: opts.studentName,
    date: opts.date,
    status: 'Absent',
    remarks: opts.reason || 'Uninformed Absence',
  })
}

export interface AbsentTarget {
  registerNumber: string
  studentName: string
  status?: string
  remarks?: string | null
  parentPhone?: string | null
  studentPhone?: string | null
}

export async function dispatchAbsentAlerts(
  targets: AbsentTarget[],
  meta: { date: string; sessionLabel: string; takenByName?: string; attendanceSessionId?: string },
  cfg?: GatewayConfig
): Promise<{ sms: SendResult[]; whatsapp: SendResult[] }> {
  const config = cfg || (await getGatewayConfig())
  const smsResults: SendResult[] = []
  const waResults: SendResult[] = []

  // Fire all in parallel with concurrency cap 5
  const concurrency = 5
  let idx = 0

  async function worker() {
    while (idx < targets.length) {
      const i = idx++
      const t = targets[i]
      const phone = (t.parentPhone || t.studentPhone || '').trim()
      if (!phone || cleanDigits(phone).length < 10) {
        const err: SendResult = { success: false, provider: 'N/A', channel: 'sms', error: `No valid parent/student phone for ${t.registerNumber}` }
        smsResults.push(err)
        waResults.push({ ...err, channel: 'whatsapp' })
        continue
      }
      const st = (t.status || 'A').toUpperCase()
      const body = buildBilingualStatusMessage({
        studentName: t.studentName,
        date: meta.date,
        status: st,
        remarks: t.remarks,
      })

      // Send both channels in parallel
      const [smsRes, waRes] = await Promise.allSettled([
        sendSms(phone, body, config),
        sendWhatsapp(
          phone,
          {
            studentName: t.studentName,
            date: meta.date,
            status: st,
            remarks: t.remarks,
            fullMessage: body,
          },
          config
        ),
      ])

      const smsVal: SendResult =
        smsRes.status === 'fulfilled' ? smsRes.value : { success: false, provider: config.smsProvider, channel: 'sms', error: (smsRes as any).reason?.message || 'SMS failure' }
      const waVal: SendResult =
        waRes.status === 'fulfilled' ? waRes.value : { success: false, provider: config.whatsappProvider, channel: 'whatsapp', error: (waRes as any).reason?.message || 'WA failure' }

      smsResults.push({ ...smsVal, details: { ...(smsVal.details || {}), registerNumber: t.registerNumber } })
      waResults.push({ ...waVal, details: { ...(waVal.details || {}), registerNumber: t.registerNumber } })

      const actionPrefix = st === 'OD' ? 'OD_ALERT' : st === 'ML' ? 'ML_ALERT' : st === 'L' ? 'LATE_ALERT' : 'ABSENT_ALERT'

      // Audit trail — best effort, don't block
      prisma.auditLog
        .create({
          data: {
            userName: meta.takenByName || 'System',
            action: smsVal.success || waVal.success ? `${actionPrefix}_SENT` : `${actionPrefix}_FAILED`,
            module: 'attendance',
            details: `Official status alert [${st}] for ${t.studentName} (${t.registerNumber}) to ${phone}: SMS=${smsVal.success ? 'OK ' + smsVal.sid : smsVal.error} | WA=${waVal.success ? 'OK ' + (waVal.sid || waVal.messageId) : waVal.error} | Session ${meta.attendanceSessionId || meta.sessionLabel} ${meta.date}`,
            status: smsVal.success || waVal.success ? 'SUCCESS' : 'FAILED',
          },
        })
        .catch(() => {})
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, targets.length) }, () => worker())
  await Promise.all(workers)
  return { sms: smsResults, whatsapp: waResults }
}

