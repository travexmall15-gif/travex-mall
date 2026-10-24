import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Orders | shopnekt',
  description: 'Track and manage your shopnekt orders',
  openGraph: {
    title: 'My Orders | shopnekt',
    description: 'Track and manage your shopnekt orders',
    url: 'https://shopnekt.vercel.app/orders',
    siteName: 'shopnekt',
    images: [{ url: 'https://shopnekt.vercel.app/shopnekt-logo.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Orders | shopnekt',
    description: 'Track and manage your shopnekt orders',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
