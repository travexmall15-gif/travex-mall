import type { Metadata } from 'next'

const BASE = 'https://shopnekt.vercel.app'

export const metadata: Metadata = {
  title: 'Social Vybe — Discover Products Through Photos & Videos',
  description: 'Discover trending products through photos and videos on ShopNekt Social Vybe. Like, share, and shop directly from your feed.',
  keywords: ['social commerce', 'product discovery', 'ShopNekt vybe', 'shop social feed', 'buy from videos'],
  alternates: { canonical: `${BASE}/vybe` },
  openGraph: {
    type: 'website',
    url: `${BASE}/vybe`,
    siteName: 'ShopNekt',
    title: 'Social Vybe — Discover Products Through Photos & Videos | ShopNekt',
    description: 'Discover trending products through photos and videos on ShopNekt Social Vybe. Like, share, and shop directly from your feed.',
    images: [{
      url: `${BASE}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Social Vybe — Discover Products Through Photos & Videos — ShopNekt',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopnekt',
    title: 'Social Vybe — Discover Products Through Photos & Videos | ShopNekt',
    description: 'Discover trending products through photos and videos on ShopNekt Social Vybe. Like, share, and shop directly from your feed.',
    images: [`${BASE}/og-image.png`],
  },
}


const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {"@type":"ListItem","position":1,"name":"Home","item":"https://shopnekt.vercel.app"},
      {"@type":"ListItem","position":2,"name":"Social Vybe","item":"https://shopnekt.vercel.app/vybe"}
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
