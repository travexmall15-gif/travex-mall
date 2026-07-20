import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE = 'https://shopnekt.vercel.app'
const sb   = createClient(
  'https://bscecjbgnjitlfmgwcic.supabase.co',
  'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'
)

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data: shop } = await sb
    .from('shops')
    .select('shop_name,shop_description,shop_category,shop_city,shop_logo,shop_banner')
    .eq('shop_slug', slug)
    .single()

  if (!shop) {
    return {
      title: 'Store Not Found',
      description: 'This store could not be found on ShopNekt.',
      robots: { index: false, follow: false },
    }
  }

  const title       = `${shop.shop_name} — Official Store`
  const description = shop.shop_description
    || `Shop at ${shop.shop_name} on ShopNekt. ${shop.shop_category || ''} ${shop.shop_city ? `based in ${shop.shop_city}` : ''}. Verified seller on ShopNekt marketplace.`
  const image       = shop.shop_banner || shop.shop_logo || `${BASE}/og-image.png`
  const url         = `${BASE}/store/${slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'profile',
      url,
      siteName: 'ShopNekt',
      title: `${title} | ShopNekt`,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: shop.shop_name }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@shopnekt',
      title: `${title} | ShopNekt`,
      description,
      images: [image],
    },
  }
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
