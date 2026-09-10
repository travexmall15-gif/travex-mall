'use client'
import Link from 'next/link'
import { Heart, MapPin, MessageCircle, Phone } from 'lucide-react'

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

// LAYOUT NOTE: Apple-store-inspired — very dark, generous negative
// space, large individual product showcases stacked vertically (not
// a dense grid like electronics-01/02) — premium, unhurried pacing.
export default function ElectronicsTemplate03({ store, products, likeCount, isLiked, onLike, onMessage }: WebstoreProps) {
  const waLink = store.shop_whatsapp ? `https://wa.me/${store.shop_whatsapp.replace(/\D/g, '').replace(/^0/, '255')}` : null
  const telLink = store.owner_phone ? `tel:${store.owner_phone}` : null

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Inter',sans-serif", color: '#F5F5F7' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 6%' }}>
        <div style={{ textAlign: 'center', padding: '3rem 0 2rem' }}>
          {store.shop_logo_url && <img src={store.shop_logo_url} alt="" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1.25rem' }} />}
          <h1 style={{ fontSize: '1.6rem', fontWeight: 600, margin: '0 0 8px', letterSpacing: '-0.01em' }}>{store.shop_name}</h1>
          {store.shop_desc && <p style={{ fontSize: '0.85rem', color: '#A1A1A6', maxWidth: 440, margin: '0 auto' }}>{store.shop_desc}</p>}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button onClick={onLike} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#1D1D1F', border: 'none', borderRadius: 999, padding: '8px 16px', cursor: 'pointer', color: '#F5F5F7', fontSize: '0.78rem' }}>
              <Heart size={13} fill={isLiked ? '#FF0080' : 'none'} color={isLiked ? '#FF0080' : '#86868B'} /> {likeCount}
            </button>
            <button onClick={onMessage} style={{ background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', border: 'none', borderRadius: 999, padding: '8px 18px', cursor: 'pointer', fontSize: '0.78rem' }}>Message</button>
            {waLink && <a href={waLink} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: '#fff', borderRadius: 999, padding: '8px 18px', textDecoration: 'none', fontSize: '0.78rem' }}>WhatsApp</a>}
            {telLink && <a href={telLink} style={{ background: '#1D1D1F', borderRadius: 999, padding: '8px 18px', textDecoration: 'none', color: '#F5F5F7', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={12} /> Call</a>}
          </div>
        </div>

        {products.map((p, i) => (
          <div key={p.id} style={{ padding: '3rem 0', borderTop: i > 0 ? '1px solid #1D1D1F' : 'none', textAlign: 'center' }}>
            <div style={{ maxWidth: 460, margin: '0 auto', aspectRatio: '4/3', background: p.image_url ? `url(${p.image_url}) center/contain no-repeat` : '#1D1D1F', borderRadius: 20, marginBottom: 24 }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 600, margin: '0 0 8px' }}>{p.name}</h3>
            <div style={{ fontSize: '1.05rem', color: '#A1A1A6' }}>{fmt(p.price)}</div>
          </div>
        ))}

        <footer style={{ padding: '2rem 0', borderTop: '1px solid #1D1D1F', textAlign: 'center' }}>
          {(store.shop_region || store.shop_city) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.75rem', color: '#86868B', marginBottom: 10 }}>
              <MapPin size={12} /> {[store.shop_address, store.shop_city, store.shop_region].filter(Boolean).join(', ')}
            </div>
          )}
          <div style={{ fontSize: '0.65rem', color: '#4A4A4E' }}>{store.shop_name} · Powered by <Link href="/" style={{ color: '#4A4A4E' }}>ShopNekt</Link></div>
        </footer>
      </div>
    </div>
  )
}
