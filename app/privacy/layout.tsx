import type { Metadata } from 'next'

const BASE = 'https://shopnekt.vercel.app'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: "Read shopnekt Privacy Policy. Learn how we collect, use, and protect your personal data on our marketplace platform.",
  keywords: ['shopnekt privacy', 'data policy', 'privacy policy', 'personal data protection'],
  alternates: { canonical: `${BASE}/privacy` },
  openGraph: {
    type: 'website',
    url: `${BASE}/privacy`,
    siteName: 'shopnekt',
    title: 'Privacy Policy | shopnekt',
    description: "Read shopnekt Privacy Policy. Learn how we collect, use, and protect your personal data.",
    images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: 'shopnekt Privacy Policy' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopnekt',
    title: 'Privacy Policy | shopnekt',
    description: "shopnekt Privacy Policy — how we collect and protect your data.",
    images: [`${BASE}/og-image.png`],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
