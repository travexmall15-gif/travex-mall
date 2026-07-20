import type { Metadata } from 'next'

const BASE = 'https://shopnekt.vercel.app'

export const metadata: Metadata = {
  title: '360 AI Assistant — Your Smart Shopping Guide',
  description: 'Meet 360 AI by ShopNekt — your intelligent shopping assistant. Find products, compare prices, and get instant answers in English or Swahili.',
  keywords: ['AI shopping assistant', '360 AI', 'ShopNekt AI', 'smart shopping', 'AI marketplace'],
  alternates: { canonical: `${BASE}/ai` },
  openGraph: {
    type: 'website',
    url: `${BASE}/ai`,
    siteName: 'ShopNekt',
    title: '360 AI Assistant — Your Smart Shopping Guide | ShopNekt',
    description: 'Meet 360 AI by ShopNekt — your intelligent shopping assistant. Find products, compare prices, and get instant answers in English or Swahili.',
    images: [{
      url: `${BASE}/og-image.png`,
      width: 1200,
      height: 630,
      alt: '360 AI Assistant — Your Smart Shopping Guide — ShopNekt',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopnekt',
    title: '360 AI Assistant — Your Smart Shopping Guide | ShopNekt',
    description: 'Meet 360 AI by ShopNekt — your intelligent shopping assistant. Find products, compare prices, and get instant answers in English or Swahili.',
    images: [`${BASE}/og-image.png`],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
