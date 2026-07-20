import type { Metadata } from 'next'

const BASE = 'https://shopnekt.vercel.app'

export const metadata: Metadata = {
  title: 'Menu — Navigate ShopNekt',
  description: 'Explore all ShopNekt features — Business Market, Campus Market, Social Vybe, Flash Deals, Group Buy, and more.',
  keywords: ['ShopNekt menu', 'ShopNekt features', 'marketplace navigation'],
  alternates: { canonical: `${BASE}/menu` },
  openGraph: {
    type: 'website',
    url: `${BASE}/menu`,
    siteName: 'ShopNekt',
    title: 'Menu — Navigate ShopNekt | ShopNekt',
    description: 'Explore all ShopNekt features — Business Market, Campus Market, Social Vybe, Flash Deals, Group Buy, and more.',
    images: [{
      url: `${BASE}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Menu — Navigate ShopNekt — ShopNekt',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopnekt',
    title: 'Menu — Navigate ShopNekt | ShopNekt',
    description: 'Explore all ShopNekt features — Business Market, Campus Market, Social Vybe, Flash Deals, Group Buy, and more.',
    images: [`${BASE}/og-image.png`],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
