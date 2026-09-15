import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Toaster } from '@/components/ui/Toast'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { PWAInstall } from '@/components/pwa/PWAInstall'
import { VersionUpdateNotifier } from '@/components/pwa/VersionUpdateNotifier'
import { MobileAppSplashScreen } from '@/components/pwa/MobileAppSplashScreen'

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
  title: 'Digital POrtal Of AI&DS - V.S.B. Engineering College',
  description: 'V.S.B. Engineering College - Department of Artificial Intelligence & Data Science Digital Portal, Karur, Tamil Nadu, India',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Digital POrtal Of AI&DS',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-512.png', sizes: '512x512' },
    ],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="application-name" content="Digital POrtal Of AI&DS" />
        <meta name="apple-mobile-web-app-title" content="Digital POrtal Of AI&DS" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
        <link rel="manifest" href="/manifest.json?v=2" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    try { reg.update(); } catch(e) {}
                  }).catch(function() {});
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <MobileAppSplashScreen />
          <PWAInstall />
          <VersionUpdateNotifier />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}