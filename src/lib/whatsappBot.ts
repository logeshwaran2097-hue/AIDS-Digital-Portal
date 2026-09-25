/**
 * Meta WhatsApp Cloud API Service for Department Leadership / HOD
 * Directly interfaces with Meta Graph API v19.0+ without third-party middleman fees.
 */

const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0'

const FALLBACK_PHONE_ID = '1353917354472660'
const FALLBACK_ACCESS_TOKEN =
  'EAAPuVsoV7TsBSiSdBtLy3z8N1eBWhGNQlhi979RvmO4UVVd40FauDMyXZCGoEZAwuWeg009ZBYUGKz78PZAqHKEFEtHNHbmwdZBJcrhaPlzZBUcqLdZCX4eoHp4hWkr9XQNt922ZBtoJCUZCO5zxjh4K1gdWn0ZAEOZAjBwFsADYdGUmYq0knQdU0BG557gCGAZChECOEyHRzQfE8PZCtOqTujQUZBBantDfdkVjJ2bnVXXibl1TnihuWMHzCtQD1gMWCjDF4QlAHHPcDvNfUWZATXX5PzaXHcV'

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
 * Send interactive buttons to a WhatsApp recipient (Up to 3 buttons)
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

  const payload: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanRecipient,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText },
      action: {
        buttons: buttons.slice(0, 3).map((b) => ({
          type: 'reply',
          reply: {
            id: b.id,
            title: b.title.slice(0, 20), // WhatsApp max title limit is 20 chars
          },
        })),
      },
    },
  }

  if (headerText) {
    payload.interactive.header = {
      type: 'text',
      text: headerText,
    }
  }

  if (footerText) {
    payload.interactive.footer = {
      text: footerText,
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
      console.error('[WhatsApp Bot] Failed to dispatch interactive buttons:', data)
      // Fallback to text if interactive template is rejected
      return sendWhatsAppText(to, `${headerText ? headerText + '\n\n' : ''}${bodyText}`)
    }

    return true
  } catch (err) {
    console.error('[WhatsApp Bot] Exception during button dispatch:', err)
    return false
  }
}
