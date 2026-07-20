import React from 'react'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { ToastProvider } from '@/components/toast'
import { LangProvider } from '@/lib/lang-context'
import { ThemeProvider } from '@/lib/theme-context'
import Script from 'next/script'
import './globals.css'

const SITE_URL = 'https://shopnekt.vercel.app'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0D1B3E',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ShopNekt — The Global Digital Marketplace',
    template: '%s | ShopNekt',
  },
  description: 'ShopNekt is a global digital marketplace by QNEX360. Buy and sell online with verified sellers. Business Market, Campus Market, Flash Deals, Group Buy and more.',
  keywords: [
    'ShopNekt','online marketplace','Tanzania','buy online','sell online',
    'campus market','flash deals','group buy','QNEX360','e-commerce Tanzania',
    'digital marketplace','online shopping Tanzania','sell products online',
  ],
  authors: [{ name: 'QNEX360', url: 'https://qnex360.vercel.app' }],
  creator: 'QNEX360',
  publisher: 'ShopNekt',
  category: 'shopping',
  alternates: {
    canonical: SITE_URL,
    languages: { 'en-US': `${SITE_URL}/en`, 'sw-TZ': `${SITE_URL}/sw` },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['sw_TZ'],
    url: SITE_URL,
    siteName: 'ShopNekt',
    title: 'ShopNekt — The Global Digital Marketplace',
    description: 'Buy and sell online on ShopNekt. Business Market, Campus Market, Flash Deals, Group Buy. Powered by QNEX360.',
    images: [{
      url: `${SITE_URL}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'ShopNekt — The Global Digital Marketplace',
      type: 'image/png',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopnekt',
    creator: '@qnex360',
    title: 'ShopNekt — The Global Digital Marketplace',
    description: 'Buy and sell online on ShopNekt. Business Market, Campus Market, Flash Deals, Group Buy.',
    images: [`${SITE_URL}/og-image.png`],
  },
  icons: {
    icon: [
      { url: '/favicon.ico',       sizes: 'any' },
      { url: '/icon-192.png',      sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png',      sizes: '512x512', type: 'image/png' },
      { url: '/icon-dark-32x32.png',  sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: light)' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-icon.png',       sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  verification: {
    google: 'shopnekt-google-site-verification',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'ShopNekt',
    'application-name': 'ShopNekt',
    'msapplication-TileColor': '#0D1B3E',
    'msapplication-TileImage': '/icon-192.png',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'ShopNekt',
      url: SITE_URL,
      description: 'ShopNekt — The Global Digital Marketplace by QNEX360',
      inLanguage: ['en-US', 'sw-TZ'],
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/market?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'ShopNekt',
      alternateName: 'QNEX360',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
      },
      image: `${SITE_URL}/og-image.png`,
      description: 'ShopNekt is a global digital marketplace by QNEX360',
      foundingDate: '2024',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+255-651-919-915',
        contactType: 'customer service',
        availableLanguage: ['English', 'Swahili'],
      },
      sameAs: [
        'https://qnex360.vercel.app',
        'https://github.com/travexmall15-gif',
      ],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="antialiased"
        suppressHydrationWarning
        style={{ WebkitTapHighlightColor: 'transparent' as any }}
      >
        <ThemeProvider>
          <LangProvider>
            <ToastProvider>{children}</ToastProvider>
          </LangProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <Script src="/pwa-init.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
