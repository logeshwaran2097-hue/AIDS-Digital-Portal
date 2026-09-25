import { getSession } from '@/lib/auth'
import { getNotificationPayloadForSession } from '@/lib/serverNotificationQuery'
import { notificationBus } from '@/lib/notificationBus'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const encoder = new TextEncoder()
    let isStreamClosed = false

    const customReadable = new ReadableStream({
      async start(controller) {
        const sendEvent = (eventName: string, data: any) => {
          if (isStreamClosed) return
          try {
            const raw = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`
            controller.enqueue(encoder.encode(raw))
          } catch {
            isStreamClosed = true
          }
        }

        const sendComment = (comment: string) => {
          if (isStreamClosed) return
          try {
            controller.enqueue(encoder.encode(`: ${comment}\n\n`))
          } catch {
            isStreamClosed = true
          }
        }

        // 1. Initial snapshot sent immediately
        let lastSignature = ''
        try {
          const initialPayload = await getNotificationPayloadForSession(session, 25)
          lastSignature = `${initialPayload.unreadCount}_${initialPayload.latestId}_${JSON.stringify(initialPayload.menuCounts)}`
          sendEvent('snapshot', initialPayload)
        } catch (err) {
          sendEvent('error', { message: 'Failed to generate initial notification snapshot' })
        }

        // 2. Direct event listener for zero-latency in-process broadcast
        const onBusNotification = async () => {
          if (isStreamClosed) return
          try {
            const updated = await getNotificationPayloadForSession(session, 25)
            lastSignature = `${updated.unreadCount}_${updated.latestId}_${JSON.stringify(updated.menuCounts)}`
            sendEvent('update', updated)
          } catch {}
        }

        notificationBus.on('change', onBusNotification)

        // 3. Heartbeat & resilient multi-instance sync interval (every 3.5 seconds)
        let cycleCount = 0
        const intervalId = setInterval(async () => {
          if (isStreamClosed) {
            clearInterval(intervalId)
            return
          }

          cycleCount++
          // Keep-alive heartbeat comment every ~14 seconds
          if (cycleCount % 4 === 0) {
            sendComment('ping')
          }

          try {
            const payload = await getNotificationPayloadForSession(session, 25)
            const currentSignature = `${payload.unreadCount}_${payload.latestId}_${JSON.stringify(payload.menuCounts)}`

            if (currentSignature !== lastSignature) {
              lastSignature = currentSignature
              sendEvent('update', payload)
            }
          } catch {}
        }, 3500)

        // 4. Abort handler when client disconnects or navigates away
        request.signal.addEventListener('abort', () => {
          isStreamClosed = true
          clearInterval(intervalId)
          notificationBus.off('change', onBusNotification)
          try {
            controller.close()
          } catch {}
        })
      },
      cancel() {
        isStreamClosed = true
      },
    })

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform, no-store',
        'Connection': 'keep-alive',
        'Content-Encoding': 'none',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
