import React from 'react'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { ToastProvider } from '@/components/toast'
import { LangProvider } from '@/lib/lang-context'
import { ThemeProvider } from '@/lib/theme-context'
import Script from 'next/script'
import './globals.css'

const SITE_URL = 'https://shopnekt.vercel.app'
const SITE_NAME = 'ShopNekt'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0D1B3E',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://shopnekt.vercel.app'),
  title: {
    default: 'ShopNekt — The Global Digital Marketplace',
    template: '%s | ShopNekt',
  },
  description: 'ShopNekt is a global digital marketplace by QNEX360. Shop from verified sellers worldwide. Business Market, Campus Market, Flash Deals, Group Buy, and more.',
  keywords: ['ShopNekt', 'online marketplace', 'Tanzania', 'buy online', 'sell online', 'campus market', 'flash deals', 'group buy', 'QNEX360'],
  authors: [{ name: 'QNEX360', url: 'https://qnex360.vercel.app' }],
  creator: 'QNEX360',
  publisher: 'ShopNekt by QNEX360',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'sw_TZ',
    url: 'https://shopnekt.vercel.app',
    siteName: 'ShopNekt',
    title: 'ShopNekt — The Global Digital Marketplace',
    description: 'Buy and sell online on ShopNekt. Business Market, Campus Market, Flash Deals, Group Buy. Powered by QNEX360.',
    images: [{ url: 'https://shopnekt.vercel.app/shopnekt-logo.png', width: 1200, height: 630, alt: 'ShopNekt Marketplace' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopNekt — The Global Digital Marketplace',
    description: 'Buy and sell online on ShopNekt. Business Market, Campus Market, Flash Deals, Group Buy.',
    images: ['https://shopnekt.vercel.app/shopnekt-logo.png'],
  },
  icons: {
    icon: '/favicon.png',
    apple: '/icon-192.png',
    shortcut: '/favicon.png',
  },
  manifest: '/manifest.json',
  verification: {
    google: 'shopnekt-google-verification',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap&display=swap" rel="stylesheet" />
        <link rel="canonical" href={SITE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning style={{ WebkitTapHighlightColor: 'transparent' as any }}>
        <ThemeProvider><LangProvider><ToastProvider>{children}</ToastProvider></LangProvider></ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <Script src="/pwa-init.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
