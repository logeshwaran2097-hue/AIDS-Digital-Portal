/**
 * Meta WhatsApp Cloud API Service for Department Leadership / HOD
 * Directly interfaces with Meta Graph API v19.0+ without third-party middleman fees.
 */

const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0'

const FALLBACK_PHONE_ID = '1353917354472660'
const FALLBACK_ACCESS_TOKEN =
  'EAAPuVsoV7TsBSqb0oSp0nR2Hb6ylKu4wJKNZB26T3bRU4d3ZA16lsVNoLqqFbjsxjQSsZA9Ch8wxuXADwLeIrX9GJm2aQLJ3NeuvDXU32uAzsV4jV3xZAHnfYX2Yb0grvU6GQZBSgO2C36guXoMvL5g4dWFJl0ZB9sjz8sM8LqG92s9I8J0qhTDG9JvbBgWgJLJQZDZD'

export interface WhatsAppButtonOption {
  id: string
  title: string
}

/**
 * Send a clean text message to a WhatsApp recipient
 */
export async function sendWhatsAppText(to: string, message: string): Promise<boolean> {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || FALLBACK_PHONE_ID
  const token = process.env.WHATSAPP_ACCESS_TOKEN || FALLBACK_ACCESS_TOKEN

  if (!phoneId || !token) {
    console.warn('[WhatsApp Bot] Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN environment variables.')
    return false
  }

  const cleanRecipient = to.replace(/\D/g, '')

  try {
    const res = await fetch(`${GRAPH_API_BASE}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanRecipient,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      console.error('[WhatsApp Bot] Failed to dispatch text message:', data)
      return false
    }

    return true
  } catch (err) {
    console.error('[WhatsApp Bot] Exception during text dispatch:', err)
    return false
  }
}

/**
 * Mark an incoming WhatsApp message as read immediately.
 * This triggers instant double blue checkmarks (✓✓) on the sender's phone.
 */
export async function markWhatsAppMessageRead(messageId: string): Promise<boolean> {
  if (!messageId) return false
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || FALLBACK_PHONE_ID
  const token = process.env.WHATSAPP_ACCESS_TOKEN || FALLBACK_ACCESS_TOKEN

  if (!phoneId || !token) return false

  try {
    const res = await fetch(`${GRAPH_API_BASE}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Send interactive buttons to a WhatsApp recipient (Up to 3 buttons)
 * Optimized for sub-second execution with automated parameter compliance.
 */
export async function sendWhatsAppButtons(
  to: string,
  bodyText: string,
  buttons: WhatsAppButtonOption[],
  headerText?: string,
  footerText?: string
): Promise<boolean> {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || FALLBACK_PHONE_ID
  const token = process.env.WHATSAPP_ACCESS_TOKEN || FALLBACK_ACCESS_TOKEN

  if (!phoneId || !token) {
    console.warn('[WhatsApp Bot] Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN.')
    return false
  }

  const cleanRecipient = to.replace(/\D/g, '')

  // Meta interactive button body limit is strictly 1024 characters.
  // If the body is too long or there are no buttons, bypass interactive mode directly to avoid a 1.5s failed roundtrip.
  if (!buttons || buttons.length === 0 || bodyText.length > 1000) {
    const combined = `${headerText ? headerText + '\n\n' : ''}${bodyText}${footerText ? '\n\n' + footerText : ''}`
    return sendWhatsAppText(cleanRecipient, combined)
  }

  const payload: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanRecipient,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText.slice(0, 1024) },
      action: {
        buttons: buttons.slice(0, 3).map((b) => ({
          type: 'reply',
          reply: {
            id: b.id.slice(0, 256),
            title: b.title.slice(0, 20), // WhatsApp strict max 20 chars
          },
        })),
      },
    },
  }

  if (headerText) {
    payload.interactive.header = {
      type: 'text',
      text: headerText.slice(0, 60), // WhatsApp strict max 60 chars
    }
  }

  if (footerText) {
    payload.interactive.footer = {
      text: footerText.slice(0, 60), // WhatsApp strict max 60 chars
    }
  }

  try {
    const res = await fetch(`${GRAPH_API_BASE}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) {
      console.warn('[WhatsApp Bot] Button dispatch failed, sending text fallback:', data)
      const combined = `${headerText ? headerText + '\n\n' : ''}${bodyText}`
      return sendWhatsAppText(cleanRecipient, combined)
    }

    return true
  } catch (err) {
    console.error('[WhatsApp Bot] Exception during button dispatch:', err)
    return false
  }
}

