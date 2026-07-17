import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Flash Deals, Best Deals in Tanzania | ShopNekt",
  description: "Find the best flash deals from verified sellers across Tanzania on ShopNekt.",
  openGraph: {
    title: "Flash Deals, Best Deals in Tanzania | ShopNekt",
    description: "Find the best flash deals from verified sellers across Tanzania on ShopNekt.",
    url: "https://travex-mall.vercel.app/flash-deals",
    siteName: "ShopNekt",
    type: "website",
  },
  alternates: { canonical: "https://travex-mall.vercel.app/flash-deals" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
