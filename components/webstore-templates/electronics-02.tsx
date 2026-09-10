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

// LAYOUT NOTE: big vivid gradient hero banner (not a photo) with bold
// centered typography — a "launch page" feel — then a clean grid,
// distinct from electronics-01's compact utilitarian catalog.
export default function ElectronicsTemplate02({ store, products, likeCount, isLiked, onLike, onMessage }: WebstoreProps) {
  const waLink = store.shop_whatsapp ? `https://wa.me/${store.shop_whatsapp.replace(/\D/g, '').replace(/^0/, '255')}` : null
  const telLink = store.owner_phone ? `tel:${store.owner_phone}` : null

  return (
    <div style={{ background: '#0A0A12', minHeight: '100vh', fontFamily: "'Inter',sans-serif", color: '#fff' }}>
      <div style={{ background: 'linear-gradient(160deg,#FF0080,#7800FF)', padding: '3rem 5% 2.5rem', textAlign: 'center' }}>
        {store.shop_logo_url && <img src={store.shop_logo_url} alt="" style={{ width: 60, height: 60, borderRadius: 16, objectFit: 'cover', margin: '0 auto 1rem', border: '3px solid rgba(255,255,255,0.4)' }} />}
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 8px' }}>{store.shop_name}</h1>
        {store.shop_desc && <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', maxWidth: 420, margin: '0 auto' }}>{store.shop_desc}</p>}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 5%' }}>
        <div style={{ display: 'flex', gap: 8, padding: '1.25rem 0' }}>
          <button onClick={onLike} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#17171F', border: 'none', borderRadius: 10, padding: '9px 16px', cursor: 'pointer', color: '#fff', fontSize: '0.78rem' }}>
            <Heart size={13} fill={isLiked ? '#FF0080' : 'none'} color={isLiked ? '#FF0080' : '#8A8A9A'} /> {likeCount}
          </button>
          <button onClick={onMessage} style={{ flex: 1, background: '#17171F', border: 'none', borderRadius: 10, padding: '9px', cursor: 'pointer', color: '#fff', fontSize: '0.78rem', fontWeight: 700 }}>Message</button>
          {waLink && <a href={waLink} target="_blank" rel="noreferrer" style={{ flex: 1, background: '#25D366', color: '#fff', borderRadius: 10, padding: '9px', textDecoration: 'none', textAlign: 'center', fontSize: '0.78rem', fontWeight: 700 }}>WhatsApp</a>}
          {telLink && <a href={telLink} style={{ flex: 1, background: '#17171F', borderRadius: 10, padding: '9px', textDecoration: 'none', color: '#fff', textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}><Phone size={13} /> Call</a>}
        </div>

        {products.length > 0 && (
          <div style={{ paddingBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
            {products.map(p => (
              <div key={p.id} style={{ background: '#17171F', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ aspectRatio: '1/1', background: p.image_url ? `url(${p.image_url}) center/cover` : '#22222E' }} />
                <div style={{ padding: 10 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#FF0080', marginTop: 3 }}>{fmt(p.price)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <footer style={{ padding: '1.25rem 0 2rem', borderTop: '1px solid #22222E' }}>
          {(store.shop_region || store.shop_city) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#8A8A9A', marginBottom: 8 }}>
              <MapPin size={12} /> {[store.shop_address, store.shop_city, store.shop_region].filter(Boolean).join(', ')}
            </div>
          )}
          <div style={{ fontSize: '0.65rem', color: '#4A4A56' }}>{store.shop_name} · Powered by <Link href="/" style={{ color: '#4A4A56' }}>ShopNekt</Link></div>
        </footer>
      </div>
    </div>
  )
}
