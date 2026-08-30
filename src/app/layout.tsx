import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Toaster } from '@/components/ui/Toast'
import { ThemeProvider } from '@/components/ThemeProvider'
import { MobileAppSplashScreen } from '@/components/MobileAppSplashScreen'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#071A41',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Digital Portal of AI&DS - V.S.B. Engineering College',
  description: 'V.S.B. Engineering College - Department of Artificial Intelligence & Data Science Digital Portal, Karur, Tamil Nadu, India',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Digital Portal of AI&DS',
  },
  icons: {
    icon: '/icon-512.png',
    shortcut: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="application-name" content="Digital Portal of AI&DS" />
        <meta name="apple-mobile-web-app-title" content="Digital Portal of AI&DS" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <MobileAppSplashScreen />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}