import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Business Market, Buy and Sell in Tanzania | ShopNekt",
  description: "Tanzania's unified business marketplace with 500+ verified shops across 5 regions.",
  openGraph: {
    title: "Business Market, Buy and Sell in Tanzania | ShopNekt",
    description: "Tanzania's unified business marketplace with 500+ verified shops across 5 regions.",
    url: "https://travex-mall.vercel.app/market",
    siteName: "ShopNekt",
    type: "website",
  },
  alternates: { canonical: "https://travex-mall.vercel.app/market" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
