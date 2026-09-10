'use client'
import Link from 'next/link'
import { Heart, MapPin, Phone, Zap } from 'lucide-react'

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

// LAYOUT NOTE: one large "spotlight" hero listing (the first product,
// full-width) followed by a compact grid for the rest — a "featured
// vehicle + full inventory" pattern none of vehicle-01..04 use.
export default function VehicleTemplate05({ store, products, likeCount, isLiked, onLike, onMessage }: WebstoreProps) {
  const waLink = store.shop_whatsapp ? `https://wa.me/${store.shop_whatsapp.replace(/\D/g, '').replace(/^0/, '255')}` : null
  const telLink = store.owner_phone ? `tel:${store.owner_phone}` : null
  const [spotlight, ...rest] = products

  return (
    <div style={{ background: '#0D0D0F', minHeight: '100vh', fontFamily: "'Inter',sans-serif", color: '#F5F5F5' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 5%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '1.5rem 0', flexWrap: 'wrap' }}>
          {store.shop_logo_url && <img src={store.shop_logo_url} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />}
          <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{store.shop_name}</div>
          <button onClick={onLike} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, background: '#1C1C1F', border: 'none', borderRadius: 999, padding: '7px 14px', cursor: 'pointer', color: '#F5F5F5', fontSize: '0.75rem' }}>
            <Heart size={13} fill={isLiked ? '#FF0080' : 'none'} color={isLiked ? '#FF0080' : '#8A8A8A'} /> {likeCount}
          </button>
        </div>

        {/* Spotlight hero — the flagship listing, full width */}
        {spotlight && (
          <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', height: 320, background: spotlight.image_url ? `url(${spotlight.image_url}) center/cover` : 'linear-gradient(135deg,#1C1C1F,#0D0D0F)', marginBottom: 24 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.85),transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '4px 10px', borderRadius: 999, marginBottom: 10 }}>
                <Zap size={10} /> Featured
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px' }}>{spotlight.name}</h2>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FF0080' }}>{fmt(spotlight.price)}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button onClick={onMessage} style={{ flex: 1, background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', border: 'none', borderRadius: 10, padding: 11, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>Message</button>
          {waLink && <a href={waLink} target="_blank" rel="noreferrer" style={{ flex: 1, background: '#25D366', color: '#fff', borderRadius: 10, padding: 11, textDecoration: 'none', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700 }}>WhatsApp</a>}
          {telLink && <a href={telLink} style={{ flex: 1, background: '#1C1C1F', borderRadius: 10, padding: 11, textDecoration: 'none', color: '#F5F5F5', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}><Phone size={13} /> Call</a>}
        </div>

        {rest.length > 0 && (
          <div style={{ paddingBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
            {rest.map(p => (
              <div key={p.id} style={{ background: '#161618', borderRadius: 12, overflow: 'hidden', border: '1px solid #26262A' }}>
                <div style={{ height: 110, background: p.image_url ? `url(${p.image_url}) center/cover` : '#1C1C1F' }} />
                <div style={{ padding: 10 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#FF0080', fontWeight: 800, marginTop: 3 }}>{fmt(p.price)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <footer style={{ padding: '1.25rem 0 2rem', borderTop: '1px solid #26262A' }}>
          {(store.shop_region || store.shop_city) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#8A8A8A', marginBottom: 8 }}>
              <MapPin size={12} /> {[store.shop_address, store.shop_city, store.shop_region].filter(Boolean).join(', ')}
            </div>
          )}
          <div style={{ fontSize: '0.65rem', color: '#4A4A4E' }}>{store.shop_name} · Powered by <Link href="/" style={{ color: '#4A4A4E' }}>ShopNekt</Link></div>
        </footer>
      </div>
    </div>
  )
}
