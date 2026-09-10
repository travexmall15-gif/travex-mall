'use client'
import Link from 'next/link'
import { Heart, MapPin, Phone, ShieldCheck } from 'lucide-react'

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

// LAYOUT NOTE: white/cream "formal dealership brochure" feel — the
// opposite palette of vehicle-01's dark showroom — vehicles presented
// as large individual feature cards with a details list, not a dense
// grid.
export default function VehicleTemplate02({ store, products, likeCount, isLiked, onLike, onMessage }: WebstoreProps) {
  const waLink = store.shop_whatsapp ? `https://wa.me/${store.shop_whatsapp.replace(/\D/g, '').replace(/^0/, '255')}` : null
  const telLink = store.owner_phone ? `tel:${store.owner_phone}` : null

  return (
    <div style={{ background: '#FAF9F6', minHeight: '100vh', fontFamily: "'Georgia',serif", color: '#1A1A1A' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 5%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '2rem 0 1.5rem', borderBottom: '2px solid #1A1A1A', flexWrap: 'wrap' }}>
          {store.shop_logo_url && <img src={store.shop_logo_url} alt="" style={{ width: 54, height: 54, borderRadius: 8, objectFit: 'cover' }} />}
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 400, margin: 0 }}>{store.shop_name}</h1>
            {store.shop_desc && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.82rem', color: '#666', marginTop: 4 }}>{store.shop_desc}</p>}
          </div>
          <div style={{ display: 'flex', gap: 8, fontFamily: "'Inter',sans-serif" }}>
            <button onClick={onLike} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid #1A1A1A', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: '0.75rem' }}>
              <Heart size={13} fill={isLiked ? '#FF0080' : 'none'} color={isLiked ? '#FF0080' : '#1A1A1A'} /> {likeCount}
            </button>
            <button onClick={onMessage} style={{ background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: '0.75rem' }}>Message</button>
            {waLink && <a href={waLink} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: '#fff', borderRadius: 6, padding: '8px 16px', textDecoration: 'none', fontSize: '0.75rem' }}>WhatsApp</a>}
            {telLink && <a href={telLink} style={{ border: '1px solid #1A1A1A', borderRadius: 6, padding: '8px 16px', textDecoration: 'none', color: '#1A1A1A', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={13} /> Call</a>}
          </div>
        </div>

        {/* Large feature listings */}
        {products.length > 0 && (
          <div style={{ padding: '2rem 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 24 }}>
            {products.map(p => (
              <div key={p.id} style={{ background: '#fff', border: '1px solid #E5DFD3' }}>
                <div style={{ aspectRatio: '16/10', background: p.image_url ? `url(${p.image_url}) center/cover` : '#EEE9DD' }} />
                <div style={{ padding: 18 }}>
                  <div style={{ fontSize: '1.05rem', marginBottom: 8 }}>{p.name}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.72rem', color: '#7800FF', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                    <ShieldCheck size={12} /> Verified Listing
                  </div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: '1.15rem' }}>{fmt(p.price)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <footer style={{ padding: '1.5rem 0 2rem', borderTop: '1px solid #E5DFD3', fontFamily: "'Inter',sans-serif" }}>
          {(store.shop_region || store.shop_city) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#777', marginBottom: 10 }}>
              <MapPin size={13} /> {[store.shop_address, store.shop_city, store.shop_region].filter(Boolean).join(', ')}
            </div>
          )}
          <div style={{ fontSize: '0.68rem', color: '#AAA' }}>{store.shop_name} · Powered by <Link href="/" style={{ color: '#AAA' }}>ShopNekt</Link></div>
        </footer>
      </div>
    </div>
  )
}
