import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Flash Deals, Best Deals in Tanzania | Travex Mall",
  description: "Find the best flash deals from verified sellers across Tanzania on Travex Mall.",
  openGraph: {
    title: "Flash Deals, Best Deals in Tanzania | Travex Mall",
    description: "Find the best flash deals from verified sellers across Tanzania on Travex Mall.",
    url: "https://travex-mall.vercel.app/flash-deals",
    siteName: "Travex Mall",
    type: "website",
  },
  alternates: { canonical: "https://travex-mall.vercel.app/flash-deals" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
