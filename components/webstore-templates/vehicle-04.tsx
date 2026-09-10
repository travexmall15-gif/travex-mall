'use client'
import Link from 'next/link'
import { Heart, MapPin, Phone } from 'lucide-react'

type Product = { id: string; name: string; price: number; image_url: string | null }
type WebstoreProps = {
  store: {
    id: string; shop_name: string; shop_desc: string | null; shop_category: string | null
    shop_logo_url: string | null; shop_cover_url: string | null
    shop_region: string | null; shop_city: string | null; shop_address: string | null
    shop_whatsapp: string | null; owner_phone: string | null
    shop_instagram: string | null; shop_facebook: string | null; shop_tiktok: string | null
  }
  products: Product[]
  likeCount: number
  isLiked: boolean
  onLike: () => void
  onMessage: () => void
}

const fmt = (n: number) => 'TZS ' + n.toLocaleString('en-US')

// LAYOUT NOTE: classified-ad list rows (small thumbnail + text), no
// hero image at all — pure efficiency for scanning many listings —
// the most text-forward, image-light of all four vehicle templates.
export default function VehicleTemplate04({ store, products, likeCount, isLiked, onLike, onMessage }: WebstoreProps) {
  const waLink = store.shop_whatsapp ? `https://wa.me/${store.shop_whatsapp.replace(/\D/g, '').replace(/^0/, '255')}` : null
  const telLink = store.owner_phone ? `tel:${store.owner_phone}` : null

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 5%' }}>
        <div style={{ padding: '1.5rem 0', borderBottom: '2px solid #111827' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            {store.shop_logo_url && <img src={store.shop_logo_url} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />}
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: 0 }}>{store.shop_name}</h1>
          </div>
          {store.shop_desc && <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0 0 12px' }}>{store.shop_desc}</p>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={onLike} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F3F4F6', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: '0.72rem' }}>
              <Heart size={12} fill={isLiked ? '#FF0080' : 'none'} color={isLiked ? '#FF0080' : '#6B7280'} /> {likeCount}
            </button>
            <button onClick={onMessage} style={{ background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>Message</button>
            {waLink && <a href={waLink} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: '#fff', borderRadius: 6, padding: '6px 14px', textDecoration: 'none', fontSize: '0.72rem', fontWeight: 700 }}>WhatsApp</a>}
            {telLink && <a href={telLink} style={{ background: '#F3F4F6', borderRadius: 6, padding: '6px 14px', textDecoration: 'none', color: '#111827', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> Call</a>}
          </div>
        </div>

        {products.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid #F1F1F1' }}>
            <div style={{ width: 88, height: 66, borderRadius: 6, background: p.image_url ? `url(${p.image_url}) center/cover` : '#F3F4F6', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827' }}>{p.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>{store.shop_category}</div>
            </div>
            <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#7800FF', flexShrink: 0 }}>{fmt(p.price)}</div>
          </div>
        ))}

        <footer style={{ padding: '1.5rem 0 2rem' }}>
          {(store.shop_region || store.shop_city) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#9CA3AF', marginBottom: 8 }}>
              <MapPin size={12} /> {[store.shop_address, store.shop_city, store.shop_region].filter(Boolean).join(', ')}
            </div>
          )}
          <div style={{ fontSize: '0.66rem', color: '#C4C4C4' }}>{store.shop_name} · Powered by <Link href="/" style={{ color: '#C4C4C4' }}>ShopNekt</Link></div>
        </footer>
      </div>
    </div>
  )
}
