/**
 * Enterprise Gateway Library — Twilio SMS / Twilio WhatsApp / Meta WhatsApp / Fast2SMS
 * Server-only. Handles real-time absent notifications to parent numbers.
 */
import { prisma } from '@/lib/prisma'

export type SmsProvider = 'twilio' | 'fast2sms' | 'custom'
export type WhatsappProvider = 'twilio' | 'meta'

export interface GatewayConfig {
  smsProvider: SmsProvider
  smsApiKey: string // may be "ACxxxx:token"
  smsSenderId: string
  whatsappEnabled: boolean
  whatsappProvider: WhatsappProvider
  whatsappPhoneNumberId: string
  whatsappAccessToken: string
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
  const rawApiKey = portal.smsApiKey || ''

  const { sid: parsedSid, token: parsedToken } = parseTwilioCreds(rawApiKey, sidEnv, tokenEnv)

  return {
    smsProvider: (portal.smsProvider as SmsProvider) || 'fast2sms', // free tier preferred
    smsApiKey: rawApiKey,
    smsSenderId: portal.smsSenderId || process.env.TWILIO_PHONE_NUMBER || 'VSBEDU',
    whatsappEnabled: portal.whatsappEnabled !== false,
    whatsappProvider: (portal.whatsappProvider as WhatsappProvider) || (portal.whatsappPhoneNumberId || portal.whatsappAccessToken ? 'meta' : 'meta'), // meta is free 1000/mo
    whatsappPhoneNumberId: portal.whatsappPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    whatsappAccessToken: portal.whatsappAccessToken || process.env.WHATSAPP_ACCESS_TOKEN || '',
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

export async function sendWhatsapp(toRaw: string, body: string, cfg?: GatewayConfig): Promise<SendResult> {
  const config = cfg || (await getGatewayConfig())
  if (!config.whatsappEnabled) return { success: false, provider: 'WhatsApp disabled', channel: 'whatsapp', error: 'WhatsApp disabled in settings' }
  if (config.whatsappProvider === 'twilio') {
    const e164 = toE164(toRaw)
    if (!e164) return { success: false, provider: 'Twilio WhatsApp', channel: 'whatsapp', error: 'Invalid phone number' }
    return sendTwilioWhatsapp(e164, body, config)
  }
  // meta
  const digits = toWhatsappDigits(toRaw)
  if (!digits) return { success: false, provider: 'Meta WhatsApp Cloud', channel: 'whatsapp', error: 'Invalid phone number' }
  return sendMetaWhatsapp(digits, body, config)
}

// ─────────────────────────────────────────────────────────────────────────────
// Absent-notification helpers
// ─────────────────────────────────────────────────────────────────────────────
export function buildAbsentMessage(opts: {
  studentName: string
  registerNumber: string
  date: string
  sessionLabel: string
  takenByName?: string
  reason?: string
}): string {
  const { studentName, registerNumber, date, sessionLabel, takenByName, reason } = opts
  const reasonText = reason ? ` Reason: ${reason}.` : ''
  return `[VSB AI&DS] Dear Parent, your ward ${studentName} (${registerNumber}) is marked ABSENT on ${date} (${sessionLabel}).${reasonText} Marked by Class Advisor (${takenByName || 'Class Advisor'}). V.S.B. Engineering College (Autonomous).`
}

export interface AbsentTarget {
  registerNumber: string
  studentName: string
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
  const allTasks: Promise<void>[] = []
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
      const body = buildAbsentMessage({
        studentName: t.studentName,
        registerNumber: t.registerNumber,
        date: meta.date,
        sessionLabel: meta.sessionLabel,
        takenByName: meta.takenByName,
      })

      // Send both channels in parallel, collecting individual results
      const [smsRes, waRes] = await Promise.allSettled([sendSms(phone, body, config), sendWhatsapp(phone, body, config)])

      const smsVal: SendResult =
        smsRes.status === 'fulfilled' ? smsRes.value : { success: false, provider: config.smsProvider, channel: 'sms', error: (smsRes as any).reason?.message || 'SMS failure' }
      const waVal: SendResult =
        waRes.status === 'fulfilled' ? waRes.value : { success: false, provider: config.whatsappProvider, channel: 'whatsapp', error: (waRes as any).reason?.message || 'WA failure' }

      smsResults.push({ ...smsVal, details: { ...(smsVal.details || {}), registerNumber: t.registerNumber } })
      waResults.push({ ...waVal, details: { ...(waVal.details || {}), registerNumber: t.registerNumber } })

      // Audit trail — best effort, don't block
      prisma.auditLog
        .create({
          data: {
            userName: meta.takenByName || 'System',
            action: smsVal.success || waVal.success ? 'ABSENT_ALERT_SENT' : 'ABSENT_ALERT_FAILED',
            module: 'attendance',
            details: `Absent alert for ${t.studentName} (${t.registerNumber}) to ${phone}: SMS=${smsVal.success ? 'OK ' + smsVal.sid : smsVal.error} | WA=${waVal.success ? 'OK ' + (waVal.sid || waVal.messageId) : waVal.error} | Session ${meta.attendanceSessionId || meta.sessionLabel} ${meta.date}`,
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
