import type { Metadata } from 'next'

const BASE = 'https://shopnekt.vercel.app'

export const metadata: Metadata = {
  title: 'Group Buy — Unlock Bulk Discounts Together',
  description: 'Join group purchases on ShopNekt and unlock huge bulk discounts. The more people join, the lower the price for everyone.',
  keywords: ['group buy', 'bulk discount', 'collective buying', 'group purchase Tanzania', 'ShopNekt group buy'],
  alternates: { canonical: `${BASE}/group-buy` },
  openGraph: {
    type: 'website',
    url: `${BASE}/group-buy`,
    siteName: 'ShopNekt',
    title: 'Group Buy — Unlock Bulk Discounts Together | ShopNekt',
    description: 'Join group purchases on ShopNekt and unlock huge bulk discounts. The more people join, the lower the price for everyone.',
    images: [{
      url: `${BASE}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Group Buy — Unlock Bulk Discounts Together — ShopNekt',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopnekt',
    title: 'Group Buy — Unlock Bulk Discounts Together | ShopNekt',
    description: 'Join group purchases on ShopNekt and unlock huge bulk discounts. The more people join, the lower the price for everyone.',
    images: [`${BASE}/og-image.png`],
  },
}


const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {"@type":"ListItem","position":1,"name":"Home","item":"https://shopnekt.vercel.app"},
      {"@type":"ListItem","position":2,"name":"Group Buy","item":"https://shopnekt.vercel.app/group-buy"}
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
