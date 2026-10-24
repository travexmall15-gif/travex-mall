import type { Metadata } from 'next'
import { createServiceSupabase } from '@/lib/security/server-supabase'

const BASE = 'https://shopnekt.vercel.app'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  let name = '', description = '', image = '', city = '', category = ''
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug)) {
    return { title: 'Store Not Found', description: 'This store could not be found on shopnekt.', robots: { index: false, follow: false } }
  }
  const sb = createServiceSupabase()
  const { data: store } = await sb.from('pending_payments')
    .select('shop_name,shop_desc,shop_category,shop_city,shop_logo_url,shop_cover_url,selected_template,webstore_status')
    .eq('id', slug).eq('status', 'approved').maybeSingle()
  if (store && (!store.selected_template || store.webstore_status === 'published')) {
    name = store.shop_name || ''
    description = store.shop_desc || ''
    category = store.shop_category || ''
    city = store.shop_city || ''
    image = store.shop_cover_url || store.shop_logo_url || ''
  }

  if (!name) {
    return {
      title: 'Store Not Found',
      description: 'This store could not be found on shopnekt.',
      robots: { index: false, follow: false },
    }
  }

  const title = `${name} — Official Store`
  const desc  = description || `Shop at ${name} on shopnekt. ${category} ${city ? `based in ${city}` : ''}. Verified seller on shopnekt marketplace.`
  const img   = image || `${BASE}/og-image.png`
  const url   = `${BASE}/store/${slug}`

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      type: 'profile',
      url,
      siteName: 'shopnekt',
      title: `${title} | shopnekt`,
      description: desc,
      images: [{ url: img, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@shopnekt',
      title: `${title} | shopnekt`,
      description: desc,
      images: [img],
    },
  }
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
