import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Open Your Shop | ShopNekt',
  description: 'Start selling on ShopNekt for free. Join thousands of sellers worldwide',
  openGraph: {
    title: 'Open Your Shop | ShopNekt',
    description: 'Start selling on ShopNekt for free. Join thousands of sellers worldwide',
    url: 'https://shopnekt.vercel.app/open-store',
    siteName: 'ShopNekt',
    images: [{ url: 'https://shopnekt.vercel.app/shopnekt-logo.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Open Your Shop | ShopNekt',
    description: 'Start selling on ShopNekt for free. Join thousands of sellers worldwide',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{'{children}'}</>
}
