import type { Metadata } from 'next'

const BASE = 'https://shopnekt.vercel.app'

export const metadata: Metadata = {
  title: 'Join ShopNekt — Start Buying & Selling Today',
  description: "Create your free ShopNekt account today. Join thousands of buyers and sellers on Tanzania's leading digital marketplace.",
  keywords: ['join ShopNekt', 'create account', 'free signup', 'online marketplace account', 'register ShopNekt'],
  alternates: { canonical: `${BASE}/join` },
  openGraph: {
    type: 'website',
    url: `${BASE}/join`,
    siteName: 'ShopNekt',
    title: 'Join ShopNekt | ShopNekt',
    description: "Create your free ShopNekt account today. Join thousands of buyers and sellers on Tanzania's leading digital marketplace.",
    images: [{
      url: `${BASE}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Join ShopNekt — Start Buying and Selling Today',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopnekt',
    title: 'Join ShopNekt | ShopNekt',
    description: "Join thousands of buyers and sellers on Tanzania's leading digital marketplace.",
    images: [`${BASE}/og-image.png`],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
