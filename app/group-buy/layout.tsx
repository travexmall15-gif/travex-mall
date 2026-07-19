import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Group Buy | ShopNekt',
  description: 'Join group purchases and unlock huge bulk discounts on ShopNekt',
  openGraph: {
    title: 'Group Buy | ShopNekt',
    description: 'Join group purchases and unlock huge bulk discounts on ShopNekt',
    url: 'https://shopnekt.vercel.app/group-buy',
    siteName: 'ShopNekt',
    images: [{ url: 'https://shopnekt.vercel.app/shopnekt-logo.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Group Buy | ShopNekt',
    description: 'Join group purchases and unlock huge bulk discounts on ShopNekt',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{'{children}'}</>
}
