import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Orders | ShopNekt',
  description: 'Track and manage your ShopNekt orders',
  openGraph: {
    title: 'My Orders | ShopNekt',
    description: 'Track and manage your ShopNekt orders',
    url: 'https://shopnekt.vercel.app/orders',
    siteName: 'ShopNekt',
    images: [{ url: 'https://shopnekt.vercel.app/shopnekt-logo.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Orders | ShopNekt',
    description: 'Track and manage your ShopNekt orders',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{'{children}'}</>
}
