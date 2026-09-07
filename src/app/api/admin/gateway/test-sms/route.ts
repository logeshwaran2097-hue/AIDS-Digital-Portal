import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface TestGatewayPayload {
  mobileNumber: string
  provider?: 'twilio' | 'fast2sms' | 'custom' | 'meta'
  apiKey?: string
  senderId?: string
  whatsappEnabled?: boolean
  whatsappPhoneNumberId?: string
  whatsappAccessToken?: string
  channel?: 'sms' | 'whatsapp'
  messageText?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'admin' && session.role !== 'hod')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only Administrators and HOD can test the gateway.' },
        { status: 401 }
      )
    }

    const body: TestGatewayPayload = await request.json()
    const {
      mobileNumber,
      provider = 'twilio',
      apiKey = '',
      senderId = 'VSBEDU',
      whatsappEnabled = false,
      whatsappPhoneNumberId = '',
      whatsappAccessToken = '',
      channel = 'sms',
      messageText,
    } = body

    if (!mobileNumber || typeof mobileNumber !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing target phone number. Please enter a valid mobile number.' },
        { status: 400 }
      )
    }

    // Clean phone number
    const cleanDigits = mobileNumber.replace(/\D/g, '')
    if (cleanDigits.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number length. Mobile numbers must be at least 10 digits.' },
        { status: 400 }
      )
    }

    // Normalized variants
    const last10 = cleanDigits.slice(-10)
    const e164 = `+91${last10}`
    const fullCountryDigits = `91${last10}`

    const timestamp = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    const finalMessage =
      messageText?.trim() ||
      `[VSB AI&DS Official] Attendance Alert Verification: System Gateway live connection verified for +91-${last10} at ${timestamp}. V.S.B. Engineering College (Autonomous).`

    const waWebUrl = `https://wa.me/${fullCountryDigits}?text=${encodeURIComponent(finalMessage)}`

    // Channel 1: WhatsApp Test
    if (channel === 'whatsapp') {
      // Fast2SMS WhatsApp Business API
      if (provider === 'fast2sms') {
        const token =
          apiKey.trim() ||
          process.env.FAST2SMS_WHATSAPP_API_KEY ||
          process.env.FAST2SMS_API_KEY ||
          'XSyBcPD25Z6hbnUftEkTVr90xzuMWawoKQRILOHdCY8elm43ipVt9cDqsCbhOo805HdKuLeAES7QGyP4'

        if (!token) {
          return NextResponse.json({
            success: false,
            channel: 'whatsapp',
            provider: 'Fast2SMS WhatsApp API',
            requiresConfig: true,
            error:
              'Fast2SMS WhatsApp API Authorization Key is required. Please paste your Fast2SMS API Key in the field above or set FAST2SMS_WHATSAPP_API_KEY in server environment.',
            whatsappWebUrl: waWebUrl,
            targetNumber: e164,
            messagePreview: finalMessage,
          })
        }

        const phoneId =
          whatsappPhoneNumberId.trim() ||
          process.env.FAST2SMS_WHATSAPP_PHONE_NUMBER_ID ||
          '1325593377300934'

        const messageId = process.env.FAST2SMS_WHATSAPP_MESSAGE_ID || '31679'
        const todayStr = new Date().toLocaleDateString('en-GB')

        try {
          const waRes = await fetch('https://www.fast2sms.com/dev/whatsapp', {
            method: 'POST',
            headers: {
              authorization: token,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message_id: messageId,
              phone_number_id: phoneId,
              numbers: last10,
              variables_values: `Verification Test|${todayStr}|Gateway Verified|Verified`,
            }),
          })

          const waData = await waRes.json()

          if (waData.return === true) {
            await prisma.auditLog
              .create({
                data: {
                  userName: session.name || 'System Administrator',
                  action: 'TEST_WHATSAPP_GATEWAY',
                  module: 'gateway',
                  details: `Dispatched test WhatsApp to +91-${last10} via Fast2SMS WhatsApp API. Request ID: ${waData.request_id || 'N/A'}`,
                  status: 'SUCCESS',
                },
              })
              .catch(() => {})

            return NextResponse.json({
              success: true,
              channel: 'whatsapp',
              provider: 'Fast2SMS WhatsApp API',
              sid: waData.request_id,
              targetNumber: e164,
              message: `✅ Live WhatsApp message dispatched to +91-${last10} via Fast2SMS WhatsApp API! (Request ID: ${waData.request_id})`,
              details: `Official attendance alert template [vsb_attendance_alert] delivered to recipient +91-${last10}.`,
              whatsappWebUrl: waWebUrl,
            })
          } else {
            const errMsg = waData.message?.[0] || 'Fast2SMS WhatsApp Gateway rejected the request.'
            return NextResponse.json({
              success: false,
              channel: 'whatsapp',
              provider: 'Fast2SMS WhatsApp API',
              error: `Fast2SMS WhatsApp Error: ${errMsg}`,
              details: waData,
              whatsappWebUrl: waWebUrl,
            })
          }
        } catch (err: any) {
          return NextResponse.json({
            success: false,
            channel: 'whatsapp',
            provider: 'Fast2SMS WhatsApp API',
            error: `Failed to connect to Fast2SMS WhatsApp API: ${err.message}`,
            whatsappWebUrl: waWebUrl,
          })
        }
      }

      // Twilio WhatsApp
      if (provider === 'twilio') {
        let accountSid = process.env.TWILIO_ACCOUNT_SID || ''
        let authToken = process.env.TWILIO_AUTH_TOKEN || ''
        const rawKey = apiKey.trim()

        if (rawKey.includes(':')) {
          const parts = rawKey.split(':')
          accountSid = parts[0].trim()
          authToken = parts[1].trim()
        } else if (rawKey.startsWith('AC')) {
          accountSid = rawKey
        } else if (rawKey) {
          authToken = rawKey
        }

        const twilioWhatsAppFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'

        if (!accountSid || !authToken) {
          return NextResponse.json({
            success: false,
            channel: 'whatsapp',
            provider: 'Twilio WhatsApp',
            requiresConfig: true,
            error:
              'Twilio Account SID & Auth Token required for WhatsApp. Format "ACxxxx:token" in the API key field or set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in environment. Ensure you have a Twilio WhatsApp-enabled number (sandbox or verified business number).',
            whatsappWebUrl: waWebUrl,
            targetNumber: e164,
            messagePreview: finalMessage,
          })
        }

        try {
          const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
          const formParams = new URLSearchParams()
          formParams.append('To', `whatsapp:${e164}`)
          formParams.append('From', twilioWhatsAppFrom)
          formParams.append('Body', finalMessage)

          const twilioRes = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
            {
              method: 'POST',
              headers: {
                Authorization: `Basic ${basicAuth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formParams.toString(),
            }
          )

          const twilioData = await twilioRes.json()

          if (twilioRes.ok && twilioData.sid) {
            await prisma.auditLog.create({
              data: {
                userName: session.name || 'System Administrator',
                action: 'TEST_WHATSAPP_GATEWAY',
                module: 'gateway',
                details: `Dispatched test WhatsApp to ${e164} via Twilio WhatsApp. SID: ${twilioData.sid}`,
                status: 'SUCCESS',
              },
            }).catch(() => {})

            return NextResponse.json({
              success: true,
              channel: 'whatsapp',
              provider: 'Twilio WhatsApp',
              sid: twilioData.sid,
              status: twilioData.status,
              targetNumber: e164,
              message: `✅ Live WhatsApp message dispatched to ${e164} via Twilio! (SID: ${twilioData.sid})`,
              whatsappWebUrl: waWebUrl,
            })
          } else {
            const errMsg = twilioData.message || `Twilio error code ${twilioData.code || 'UNKNOWN'}`
            return NextResponse.json({
              success: false,
              channel: 'whatsapp',
              provider: 'Twilio WhatsApp',
              error: `Twilio WhatsApp Error: ${errMsg}`,
              details: twilioData,
              whatsappWebUrl: waWebUrl,
            })
          }
        } catch (err: any) {
          return NextResponse.json({
            success: false,
            channel: 'whatsapp',
            provider: 'Twilio WhatsApp',
            error: `Failed to connect to Twilio WhatsApp: ${err.message}`,
            whatsappWebUrl: waWebUrl,
          })
        }
      }

      // Meta WhatsApp Cloud API (existing code)
      const token = whatsappAccessToken.trim() || process.env.WHATSAPP_ACCESS_TOKEN || ''
      const phoneId = whatsappPhoneNumberId.trim() || process.env.WHATSAPP_PHONE_NUMBER_ID || ''

      if (!token || !phoneId) {
        return NextResponse.json({
          success: false,
          channel: 'whatsapp',
          provider: 'Meta WhatsApp Cloud API',
          requiresConfig: true,
          error:
            'Meta WhatsApp Cloud API credentials not configured. Please enter your Phone Number ID and Access Token above, or click "Send via WhatsApp Web" for instant browser dispatch. You can also use Twilio WhatsApp by selecting Twilio as provider.',
          whatsappWebUrl: waWebUrl,
          messagePreview: finalMessage,
          targetNumber: e164,
        })
      }

      // Live request to Meta Graph API
      try {
        const metaRes = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: fullCountryDigits,
            type: 'text',
            text: { preview_url: false, body: finalMessage },
          }),
        })

        const metaData = await metaRes.json()

        if (metaRes.ok && metaData.messages?.[0]?.id) {
          // Log success to audit trail
          await prisma.auditLog.create({
            data: {
              userName: session.name || 'System Administrator',
              action: 'TEST_WHATSAPP_GATEWAY',
              module: 'gateway',
              details: `Dispatched live test WhatsApp message to ${e164} via Meta Cloud API. Message ID: ${metaData.messages[0].id}`,
              status: 'SUCCESS',
            },
          }).catch(() => {})

          return NextResponse.json({
            success: true,
            channel: 'whatsapp',
            provider: 'Meta WhatsApp Cloud API',
            messageId: metaData.messages[0].id,
            targetNumber: e164,
            message: `✅ Live WhatsApp message successfully dispatched to ${e164}!`,
            whatsappWebUrl: waWebUrl,
          })
        } else {
          const errMsg = metaData.error?.message || 'Meta Cloud API rejected the message.'
          return NextResponse.json({
            success: false,
            channel: 'whatsapp',
            provider: 'Meta WhatsApp Cloud API',
            error: `Meta WhatsApp API error: ${errMsg}`,
            details: metaData,
            whatsappWebUrl: waWebUrl,
          })
        }
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          channel: 'whatsapp',
          error: `Failed to connect to Meta WhatsApp API: ${err.message}`,
          whatsappWebUrl: waWebUrl,
        })
      }
    }

    // Channel 2: Cellular SMS
    if (provider === 'fast2sms') {
      const token = apiKey.trim() || process.env.FAST2SMS_API_KEY || ''
      if (!token) {
        return NextResponse.json({
          success: false,
          channel: 'sms',
          provider: 'Fast2SMS',
          requiresConfig: true,
          error:
            'Fast2SMS API Authorization Key is required. Please paste your Fast2SMS API Key in the field above or set FAST2SMS_API_KEY in server environment. You can also send via WhatsApp Web below.',
          whatsappWebUrl: waWebUrl,
          targetNumber: e164,
          messagePreview: finalMessage,
        })
      }

      try {
        const smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'q',
            message: finalMessage,
            language: 'english',
            flash: 0,
            numbers: last10,
          }),
        })

        const smsData = await smsRes.json()

        if (smsData.return === true) {
          await prisma.auditLog.create({
            data: {
              userName: session.name || 'System Administrator',
              action: 'TEST_SMS_GATEWAY',
              module: 'gateway',
              details: `Dispatched test SMS to ${last10} via Fast2SMS. Request ID: ${smsData.request_id || 'N/A'}`,
              status: 'SUCCESS',
            },
          }).catch(() => {})

          return NextResponse.json({
            success: true,
            channel: 'sms',
            provider: 'Fast2SMS Gateway',
            requestId: smsData.request_id,
            targetNumber: last10,
            message: `✅ Test SMS dispatched to +91 ${last10} successfully! (Request ID: ${smsData.request_id || 'OK'})`,
            whatsappWebUrl: waWebUrl,
          })
        } else {
          const errMsg = smsData.message?.[0] || 'Fast2SMS Gateway rejected the request.'
          return NextResponse.json({
            success: false,
            channel: 'sms',
            provider: 'Fast2SMS Gateway',
            error: `Fast2SMS Provider Response: ${errMsg}`,
            details: smsData,
            whatsappWebUrl: waWebUrl,
          })
        }
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          channel: 'sms',
          error: `Failed to connect to Fast2SMS Gateway: ${err.message}`,
          whatsappWebUrl: waWebUrl,
        })
      }
    }

    if (provider === 'twilio') {
      let accountSid = process.env.TWILIO_ACCOUNT_SID || ''
      let authToken = process.env.TWILIO_AUTH_TOKEN || ''
      const rawKey = apiKey.trim()

      if (rawKey.includes(':')) {
        const parts = rawKey.split(':')
        accountSid = parts[0].trim()
        authToken = parts[1].trim()
      } else if (rawKey.startsWith('AC')) {
        accountSid = rawKey
      } else if (rawKey) {
        authToken = rawKey
      }

      if (!accountSid || !authToken) {
        return NextResponse.json({
          success: false,
          channel: 'sms',
          provider: 'Twilio Cloud SMS',
          requiresConfig: true,
          error:
            'Twilio Account SID & Auth Token required. Format "ACxxxx:token" in the API key field or set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in environment. You can also send via WhatsApp Web below.',
          whatsappWebUrl: waWebUrl,
          targetNumber: e164,
          messagePreview: finalMessage,
        })
      }

      try {
        const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
        const formParams = new URLSearchParams()
        formParams.append('To', e164)
        formParams.append('From', senderId.trim() || process.env.TWILIO_PHONE_NUMBER || 'VSBEDU')
        formParams.append('Body', finalMessage)

        const twilioRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${basicAuth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formParams.toString(),
          }
        )

        const twilioData = await twilioRes.json()

        if (twilioRes.ok && twilioData.sid) {
          await prisma.auditLog.create({
            data: {
              userName: session.name || 'System Administrator',
              action: 'TEST_SMS_GATEWAY',
              module: 'gateway',
              details: `Dispatched test SMS to ${e164} via Twilio. SID: ${twilioData.sid}`,
              status: 'SUCCESS',
            },
          }).catch(() => {})

          return NextResponse.json({
            success: true,
            channel: 'sms',
            provider: 'Twilio Cloud SMS',
            sid: twilioData.sid,
            status: twilioData.status,
            targetNumber: e164,
            message: `✅ Test SMS dispatched to ${e164} successfully! (Twilio SID: ${twilioData.sid})`,
            whatsappWebUrl: waWebUrl,
          })
        } else {
          const errMsg = twilioData.message || `Twilio error code ${twilioData.code || 'UNKNOWN'}`
          return NextResponse.json({
            success: false,
            channel: 'sms',
            provider: 'Twilio Cloud SMS',
            error: `Twilio Gateway Error: ${errMsg}`,
            details: twilioData,
            whatsappWebUrl: waWebUrl,
          })
        }
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          channel: 'sms',
          error: `Failed to connect to Twilio Gateway: ${err.message}`,
          whatsappWebUrl: waWebUrl,
        })
      }
    }

    // Custom HTTP Gateway
    return NextResponse.json({
      success: false,
      channel: 'sms',
      provider: 'Custom Institutional HTTP Gateway',
      requiresConfig: true,
      error:
        'Custom HTTP SMS Gateway endpoint not specified. Provide gateway endpoint URL or use Fast2SMS / Twilio. You can also send via WhatsApp Web below.',
      whatsappWebUrl: waWebUrl,
      targetNumber: e164,
      messagePreview: finalMessage,
    })
  } catch (error: any) {
    console.error('Test Gateway route error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error while testing gateway' },
      { status: 500 }
    )
  }
}
