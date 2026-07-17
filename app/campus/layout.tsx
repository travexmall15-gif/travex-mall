import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Campus Market, Student Marketplace Tanzania | ShopNekt",
  description: "Tanzania's dedicated campus marketplace for university students across 5 universities.",
  openGraph: {
    title: "Campus Market, Student Marketplace Tanzania | ShopNekt",
    description: "Tanzania's dedicated campus marketplace for university students across 5 universities.",
    url: "https://travex-mall.vercel.app/campus",
    siteName: "ShopNekt",
    type: "website",
  },
  alternates: { canonical: "https://travex-mall.vercel.app/campus" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
