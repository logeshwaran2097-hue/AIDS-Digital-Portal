'use client'

import { Toaster as HotToaster, toast as hotToast, ToasterProps } from 'react-hot-toast'

export interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const toast = {
  success: (message: string, options?: ToastOptions) => 
    hotToast.success(message, { duration: 4000, ...options }),
  error: (message: string, options?: ToastOptions) => 
    hotToast.error(message, { duration: 5000, ...options }),
  warning: (message: string, options?: ToastOptions) => 
    hotToast(message, { 
      icon: '⚠️', 
      duration: 4000, 
      style: { background: '#fef3c7', color: '#92400e' },
      ...options 
    }),
  info: (message: string, options?: ToastOptions) => 
    hotToast(message, { 
      icon: 'ℹ️', 
      duration: 4000, 
      style: { background: '#dbeafe', color: '#1e40af' },
      ...options 
    }),
  loading: (message: string, options?: ToastOptions) => 
    hotToast.loading(message, { ...options }),
  dismiss: (id?: string) => hotToast.dismiss(id),
  promise: <T,>(promise: Promise<T>, messages: { loading: string; success: string | ((data: T) => string); error: string | ((err: Error) => string) }) =>
    hotToast.promise(promise, messages),
}

export function Toaster(props?: ToasterProps) {
  return <HotToaster position="top-right" {...props} />
}

export { toast }