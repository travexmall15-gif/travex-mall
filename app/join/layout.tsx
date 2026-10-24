import type { Metadata } from 'next'

const BASE = 'https://shopnekt.vercel.app'

export const metadata: Metadata = {
  title: 'Join shopnekt — Start Buying & Selling Today',
  description: "Create your free shopnekt account today. Join thousands of buyers and sellers on Tanzania's leading digital marketplace.",
  keywords: ['join shopnekt', 'create account', 'free signup', 'online marketplace account', 'register shopnekt'],
  alternates: { canonical: `${BASE}/join` },
  openGraph: {
    type: 'website',
    url: `${BASE}/join`,
    siteName: 'shopnekt',
    title: 'Join shopnekt | shopnekt',
    description: "Create your free shopnekt account today. Join thousands of buyers and sellers on Tanzania's leading digital marketplace.",
    images: [{
      url: `${BASE}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Join shopnekt — Start Buying and Selling Today',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopnekt',
    title: 'Join shopnekt | shopnekt',
    description: "Join thousands of buyers and sellers on Tanzania's leading digital marketplace.",
    images: [`${BASE}/og-image.png`],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
