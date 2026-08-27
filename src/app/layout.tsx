import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Toaster } from '@/components/ui/Toast'
import { PWAInstall } from '@/components/PWAInstall'
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
  title: 'V.S.B. AI & DS Digital Portal',
  description: 'V.S.B. Engineering College - Artificial Intelligence & Data Science Department Digital Portal, Karur, Tamil Nadu, India',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VSB AI&DS',
  },
  icons: {
    icon: '/college-emblem.png',
    shortcut: '/college-emblem.png',
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
        <meta name="application-name" content="VSB AI&DS" />
        <meta name="apple-mobile-web-app-title" content="VSB AI&DS" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <MobileAppSplashScreen />
          {children}
          <Toaster />
          <PWAInstall />
        </ThemeProvider>
      </body>
    </html>
  )
}