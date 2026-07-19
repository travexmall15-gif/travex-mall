import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Messages | ShopNekt',
  description: 'Your ShopNekt inbox — chat with sellers and buyers',
  openGraph: {
    title: 'Messages | ShopNekt',
    description: 'Your ShopNekt inbox — chat with sellers and buyers',
    url: 'https://shopnekt.vercel.app/messages',
    siteName: 'ShopNekt',
    images: [{ url: 'https://shopnekt.vercel.app/shopnekt-logo.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Messages | ShopNekt',
    description: 'Your ShopNekt inbox — chat with sellers and buyers',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
