import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Messages | shopnekt',
  description: 'Your shopnekt inbox — chat with sellers and buyers',
  openGraph: {
    title: 'Messages | shopnekt',
    description: 'Your shopnekt inbox — chat with sellers and buyers',
    url: 'https://shopnekt.vercel.app/messages',
    siteName: 'shopnekt',
    images: [{ url: 'https://shopnekt.vercel.app/shopnekt-logo.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Messages | shopnekt',
    description: 'Your shopnekt inbox — chat with sellers and buyers',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
