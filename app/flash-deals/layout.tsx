import type { Metadata } from 'next'

const BASE = 'https://shopnekt.vercel.app'

export const metadata: Metadata = {
  title: 'Limited Time Deals',
  description: 'Grab flash deals before they expire! Limited-time discounts up to 70% off from verified sellers on ShopNekt. New deals every hour.',
  keywords: ['flash deals', 'limited time offers', 'best deals Tanzania', 'discount products online', 'ShopNekt deals'],
  alternates: { canonical: `${BASE}/flash-deals` },
  openGraph: {
    type: 'website',
    url: `${BASE}/flash-deals`,
    siteName: 'ShopNekt',
    title: 'Limited Time Deals | ShopNekt',
    description: 'Grab flash deals before they expire! Limited-time discounts up to 70% off from verified sellers on ShopNekt. New deals every hour.',
    images: [{
      url: `${BASE}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Limited Time Deals — ShopNekt',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopnekt',
    title: 'Limited Time Deals | ShopNekt',
    description: 'Grab flash deals before they expire! Limited-time discounts up to 70% off from verified sellers on ShopNekt. New deals every hour.',
    images: [`${BASE}/og-image.png`],
  },
}


const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {"@type":"ListItem","position":1,"name":"Home","item":"https://shopnekt.vercel.app"},
      {"@type":"ListItem","position":2,"name":"Flash Deals","item":"https://shopnekt.vercel.app/flash-deals"}
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
