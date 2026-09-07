/**
 * Fast2SMS WhatsApp Business API Integration
 * Sends WhatsApp template messages via Fast2SMS Cloud API
 * API Docs: https://docs.fast2sms.com/whatsapp-business-api
 */

const FAST2SMS_WA_BASE = 'https://www.fast2sms.com/dev/wa'

export interface Fast2SMSWhatsAppResponse {
  success: boolean
  requestId?: string
  message?: string
  error?: string
  raw?: unknown
}

/**
 * Send a WhatsApp template message via Fast2SMS
 * @param mobileNumber - 10-digit Indian mobile number
 * @param templateName - Approved template name in Fast2SMS dashboard
 * @param variables - Array of variable values for template placeholders {{1}}, {{2}}, etc.
 * @param apiKey - Optional override; falls back to FAST2SMS_WHATSAPP_API_KEY env
 */
export async function sendFast2SMSWhatsApp({
  mobileNumber,
  templateName,
  variables = [],
  apiKey,
}: {
  mobileNumber: string
  templateName: string
  variables?: string[]
  apiKey?: string
}): Promise<Fast2SMSWhatsAppResponse> {
  const token = apiKey?.trim() || process.env.FAST2SMS_WHATSAPP_API_KEY || ''

  if (!token) {
    return {
      success: false,
      error: 'FAST2SMS_WHATSAPP_API_KEY is not configured.',
    }
  }

  // Normalize to last 10 digits
  const cleanDigits = mobileNumber.replace(/\D/g, '')
  const last10 = cleanDigits.slice(-10)

  if (last10.length < 10) {
    return { success: false, error: `Invalid mobile number: ${mobileNumber}` }
  }

  try {
    const payload: Record<string, unknown> = {
      authorization: token,
      route: 'whatsapp_template',
      numbers: last10,
      template_name: templateName,
      language_code: 'en',
      header_type: 'none',
    }

    // Add template variables as body_parameters
    if (variables.length > 0) {
      payload['body_parameters'] = variables.map((v) => ({ type: 'text', text: v }))
    }

    const res = await fetch(`${FAST2SMS_WA_BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: token,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (data.return === true || data.status === 'success' || res.ok) {
      return {
        success: true,
        requestId: data.request_id || data.message_id || 'OK',
        message: `WhatsApp sent to +91${last10} via Fast2SMS`,
        raw: data,
      }
    }

    const errMsg = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || data.error || 'Fast2SMS WhatsApp API rejected the request'

    return { success: false, error: errMsg, raw: data }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error'
    return { success: false, error: `Failed to reach Fast2SMS WhatsApp API: ${msg}` }
  }
}

/**
 * Send attendance absence alert to parent via Fast2SMS WhatsApp
 * Uses the approved template: vsb_attendance_alert
 * Template variables: {{1}}=Student Name, {{2}}=Date, {{3}}=Reason, {{4}}=Absent Count
 */
export async function sendAttendanceAlertWhatsApp({
  parentMobile,
  studentName,
  date,
  reason,
  absentCount,
  apiKey,
}: {
  parentMobile: string
  studentName: string
  date: string
  reason?: string
  absentCount?: number
  apiKey?: string
}): Promise<Fast2SMSWhatsAppResponse> {
  return sendFast2SMSWhatsApp({
    mobileNumber: parentMobile,
    templateName: 'vsb_attendance_alert',
    variables: [
      studentName,
      date,
      reason || 'Not Specified',
      String(absentCount ?? 1),
    ],
    apiKey,
  })
}
