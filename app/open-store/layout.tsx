import type { Metadata } from 'next'

const BASE = 'https://shopnekt.vercel.app'

export const metadata: Metadata = {
  title: 'Open Your Store — Sell Online on shopnekt',
  description: 'Start selling on shopnekt for free. Open your online store in minutes, reach verified buyers, and grow your business with our powerful seller tools.',
  keywords: ['open store shopnekt', 'sell online Tanzania', 'create online shop', 'start selling', 'free seller account'],
  alternates: { canonical: `${BASE}/open-store` },
  openGraph: {
    type: 'website',
    url: `${BASE}/open-store`,
    siteName: 'shopnekt',
    title: 'Open Your Store — Sell Online on shopnekt | shopnekt',
    description: 'Start selling on shopnekt for free. Open your online store in minutes, reach verified buyers, and grow your business with our powerful seller tools.',
    images: [{
      url: `${BASE}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Open Your Store — Sell Online on shopnekt — shopnekt',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopnekt',
    title: 'Open Your Store — Sell Online on shopnekt | shopnekt',
    description: 'Start selling on shopnekt for free. Open your online store in minutes, reach verified buyers, and grow your business with our powerful seller tools.',
    images: [`${BASE}/og-image.png`],
  },
}


const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {"@type":"ListItem","position":1,"name":"Home","item":"https://shopnekt.vercel.app"},
      {"@type":"ListItem","position":2,"name":"Open Your Store","item":"https://shopnekt.vercel.app/open-store"}
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
