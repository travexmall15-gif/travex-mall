import type { Metadata } from 'next'

const BASE = 'https://shopnekt.vercel.app'

export const metadata: Metadata = {
  title: 'Campus Market — Student Marketplace',
  description: 'ShopNekt Campus Market connects university students. Buy and sell textbooks, electronics, food, and more on campus — student to student.',
  keywords: ['campus marketplace', 'student marketplace Tanzania', 'university market', 'buy on campus', 'sell on campus'],
  alternates: { canonical: `${BASE}/campus` },
  openGraph: {
    type: 'website',
    url: `${BASE}/campus`,
    siteName: 'ShopNekt',
    title: 'Campus Market — Student Marketplace | ShopNekt',
    description: 'ShopNekt Campus Market connects university students. Buy and sell textbooks, electronics, food, and more on campus — student to student.',
    images: [{
      url: `${BASE}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Campus Market — Student Marketplace — ShopNekt',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopnekt',
    title: 'Campus Market — Student Marketplace | ShopNekt',
    description: 'ShopNekt Campus Market connects university students. Buy and sell textbooks, electronics, food, and more on campus — student to student.',
    images: [`${BASE}/og-image.png`],
  },
}


const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {"@type":"ListItem","position":1,"name":"Home","item":"https://shopnekt.vercel.app"},
      {"@type":"ListItem","position":2,"name":"Campus Market","item":"https://shopnekt.vercel.app/campus"}
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
