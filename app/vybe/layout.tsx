import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Social Vybe, Social Commerce Tanzania | ShopNekt",
  description: "Tanzania's business social network. Post products and connect with buyers.",
  openGraph: {
    title: "Social Vybe, Social Commerce Tanzania | ShopNekt",
    description: "Tanzania's business social network. Post products and connect with buyers.",
    url: "https://travex-mall.vercel.app/vybe",
    siteName: "ShopNekt",
    type: "website",
  },
  alternates: { canonical: "https://travex-mall.vercel.app/vybe" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
