import type { Metadata } from 'next'

const BASE = 'https://shopnekt.vercel.app'

export const metadata: Metadata = {
  title: 'Business Market — Buy & Sell from Verified Shops',
  description: 'Explore thousands of products from verified businesses on ShopNekt Business Market. Fashion, electronics, food, and more — shop safely from anywhere.',
  keywords: ['business market', 'buy online Tanzania', 'verified shops', 'online shopping', 'ShopNekt market'],
  alternates: { canonical: `${BASE}/market` },
  openGraph: {
    type: 'website',
    url: `${BASE}/market`,
    siteName: 'ShopNekt',
    title: 'Business Market — Buy & Sell from Verified Shops | ShopNekt',
    description: 'Explore thousands of products from verified businesses on ShopNekt Business Market. Fashion, electronics, food, and more — shop safely from anywhere.',
    images: [{
      url: `${BASE}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Business Market — Buy & Sell from Verified Shops — ShopNekt',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopnekt',
    title: 'Business Market — Buy & Sell from Verified Shops | ShopNekt',
    description: 'Explore thousands of products from verified businesses on ShopNekt Business Market. Fashion, electronics, food, and more — shop safely from anywhere.',
    images: [`${BASE}/og-image.png`],
  },
}


const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {"@type":"ListItem","position":1,"name":"Home","item":"https://shopnekt.vercel.app"},
      {"@type":"ListItem","position":2,"name":"Business Market","item":"https://shopnekt.vercel.app/market"}
  ]
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {children}
    </>
  )
}
