import React from 'react'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { ToastProvider } from '@/components/toast'
import Script from 'next/script'
import './globals.css'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0D1B3E',
}


export const metadata: Metadata = {
  title: 'Travex Mall — Tanzania\'s Digital Marketplace',
  description: 'Travex Mall — Tanzania\'s intelligent digital marketplace. Open your shop in Business Market or Campus Market. AI-powered tools, flash deals, group buying and more. Start free today!',
  keywords: 'Tanzania marketplace, campus market, student shop, Travex Mall, online store Tanzania',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Travex Mall',
  },
  applicationName: 'Travex Mall',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Travex Mall',
    'msapplication-TileColor': '#0D1B3E',
  },
  icons: {
    icon: [
      { url: '/icon-dark-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Playfair Display (headings) + Inter (body) — consistent across ALL pages */}
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ WebkitTapHighlightColor: 'transparent' as any }}>
        <ToastProvider>{children}</ToastProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <Script src="/pwa-init.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
