import React from 'react'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { ToastProvider } from '@/components/toast'
import { LangProvider } from '@/lib/lang-context'
import Script from 'next/script'
import './globals.css'

const SITE_URL = 'https://travex-mall.vercel.app'
const SITE_NAME = 'Travex Mall'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0D1B3E',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Travex Mall, Tanzania\'s Digital Marketplace',
    template: '%s | Travex Mall',
  },
  description: 'Travex Mall is Tanzania\'s leading digital commerce platform. Buy and sell across Tanzania. Open your shop in Business Market or Campus Market. AI-powered tools, flash deals, group buying, and more. Shop online in Tanzania today.',
  keywords: [
    'Travex Mall','Travex','Tanzania marketplace','online marketplace Tanzania',
    'buy online Tanzania','sell online Tanzania','digital marketplace Tanzania',
    'Tanzania e-commerce','duka online Tanzania','best marketplace Tanzania',
    'campus market Tanzania','student marketplace Tanzania','business market Tanzania',
    'online shop Tanzania','shops Tanzania','Africa marketplace','Africa digital commerce',
    'Dar es Salaam marketplace','Tanzania online shopping','Travex Digital Group',
    'flash deals Tanzania','group buying Tanzania','marketplace Africa',
    'best online shop Africa','Tanzania SME digital','AI marketplace Tanzania',
    'social commerce Tanzania','Kiswahili marketplace',
  ],
  authors: [{ name: 'Travex Digital Group', url: SITE_URL }],
  creator: 'Travex Digital Group',
  publisher: 'Travex Digital Group',
  applicationName: SITE_NAME,
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_TZ',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Travex Mall, Tanzania\'s Digital Marketplace',
    description: 'Tanzania\'s leading digital commerce platform. Buy and sell across Tanzania. Business Market, Campus Market, Social Vybe, Flash Deals and more.',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Travex Mall, Tanzania\'s Digital Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travex Mall, Tanzania\'s Digital Marketplace',
    description: 'Tanzania\'s leading digital commerce platform. Buy and sell across Tanzania.',
    images: [`${SITE_URL}/og-image.png`],
    creator: '@travexmall',
  },
  alternates: {
    canonical: SITE_URL,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: SITE_NAME,
  },
  verification: {
    google: 'googleb8594862b3bec06f',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': SITE_NAME,
    'msapplication-TileColor': '#0D1B3E',
  },
  icons: {
    icon: [
      { url: '/icon-dark-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

// JSON-LD Structured Data for AI and search engines
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Travex Digital Group',
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      description: 'Tanzanian technology company building Africa\'s first integrated AI-powered digital commerce ecosystem for SMEs.',
      foundingDate: '2025',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dar es Salaam',
        addressCountry: 'TZ',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+255651919915',
        email: 'jmaregeri006@gmail.com',
        contactType: 'customer service',
        availableLanguage: ['English', 'Swahili'],
      },
      sameAs: [
        'https://www.linkedin.com/in/arch-jumanne-maregeri-b4262a372',
        'https://travex-finance.vercel.app',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Travex Mall',
      description: 'Tanzania\'s leading digital marketplace. Buy and sell online across Tanzania.',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/market?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: ['en', 'sw'],
    },
    {
      '@type': 'OnlineStore',
      '@id': `${SITE_URL}/#store`,
      name: 'Travex Mall',
      url: SITE_URL,
      description: 'Tanzania\'s digital marketplace with Business Market, Campus Market, Social Vybe, Flash Deals and Group Buy features.',
      areaServed: {
        '@type': 'Country',
        name: 'Tanzania',
      },
      priceRange: 'TZS 10,000 - 200,000',
      currenciesAccepted: 'TZS',
      paymentAccepted: 'Mobile Money, M-Pesa, Airtel Money, Cash on Delivery',
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="canonical" href={SITE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning style={{ WebkitTapHighlightColor: 'transparent' as any }}>
        <LangProvider><ToastProvider>{children}</ToastProvider></LangProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <Script src="/pwa-init.js" strategy="afterInteractive" />
        <Script src="/lang.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
