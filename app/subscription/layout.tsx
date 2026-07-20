import type { Metadata } from 'next'

const BASE = 'https://shopnekt.vercel.app'

export const metadata: Metadata = {
  title: 'Seller Plans & Pricing — ShopNekt',
  description: 'Choose the right ShopNekt seller plan for your business. Start free and upgrade as you grow. Compare features and pricing.',
  keywords: ['ShopNekt pricing', 'seller plan', 'subscription plan', 'upgrade shop', 'ShopNekt premium'],
  alternates: { canonical: `${BASE}/subscription` },
  openGraph: {
    type: 'website',
    url: `${BASE}/subscription`,
    siteName: 'ShopNekt',
    title: 'Seller Plans & Pricing — ShopNekt | ShopNekt',
    description: 'Choose the right ShopNekt seller plan for your business. Start free and upgrade as you grow. Compare features and pricing.',
    images: [{
      url: `${BASE}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Seller Plans & Pricing — ShopNekt — ShopNekt',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopnekt',
    title: 'Seller Plans & Pricing — ShopNekt | ShopNekt',
    description: 'Choose the right ShopNekt seller plan for your business. Start free and upgrade as you grow. Compare features and pricing.',
    images: [`${BASE}/og-image.png`],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
