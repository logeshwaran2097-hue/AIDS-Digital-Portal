import { EventEmitter } from 'events'

// Global in-process event emitter for instant real-time notification dispatch
class NotificationEventBus extends EventEmitter {}

// Use global singleton to survive hot-reloads in Next.js development
const globalForNotifications = global as unknown as {
  notificationBus?: NotificationEventBus
}

export const notificationBus =
  globalForNotifications.notificationBus || new NotificationEventBus()

if (process.env.NODE_ENV !== 'production') {
  globalForNotifications.notificationBus = notificationBus
}

notificationBus.setMaxListeners(200)
