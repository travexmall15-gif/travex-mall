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

  // Try business market first (pending_payments table, id = slug)
  let name = '', description = '', image = '', city = '', category = ''

  const { data: biz } = await sb
    .from('pending_payments')
    .select('shop_name,shop_desc,shop_category,shop_city,shop_logo,shop_banner')
    .eq('id', slug)
    .eq('status', 'approved')
    .single()

  if (biz) {
    name        = biz.shop_name || ''
    description = biz.shop_desc || ''
    category    = biz.shop_category || ''
    city        = biz.shop_city || ''
    image       = biz.shop_banner || biz.shop_logo || ''
  } else {
    // Try campus stores
    const { data: campus } = await sb
      .from('campus_stores')
      .select('store_name,description,category,university_abbr,logo,banner')
      .eq('id', slug)
      .eq('is_active', true)
      .single()

    if (campus) {
      name        = campus.store_name || ''
      description = campus.description || ''
      category    = campus.category || ''
      city        = campus.university_abbr || ''
      image       = campus.banner || campus.logo || ''
    }
  }

  if (!name) {
    return {
      title: 'Store Not Found',
      description: 'This store could not be found on ShopNekt.',
      robots: { index: false, follow: false },
    }
  }

  const title = `${name} — Official Store`
  const desc  = description || `Shop at ${name} on ShopNekt. ${category} ${city ? `based in ${city}` : ''}. Verified seller on ShopNekt marketplace.`
  const img   = image || `${BASE}/og-image.png`
  const url   = `${BASE}/store/${slug}`

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      type: 'profile',
      url,
      siteName: 'ShopNekt',
      title: `${title} | ShopNekt`,
      description: desc,
      images: [{ url: img, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@shopnekt',
      title: `${title} | ShopNekt`,
      description: desc,
      images: [img],
    },
  }
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
