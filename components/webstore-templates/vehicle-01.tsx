'use client'
import Link from 'next/link'
import { Heart, MapPin, MessageCircle, Phone, Gauge } from 'lucide-react'

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

export default function VehicleTemplate01({ store, products, likeCount, isLiked, onLike, onMessage }: WebstoreProps) {
  const waLink = store.shop_whatsapp ? `https://wa.me/${store.shop_whatsapp.replace(/\D/g, '').replace(/^0/, '255')}` : null
  const telLink = store.owner_phone ? `tel:${store.owner_phone}` : null
  const newArrivals = products.slice(0, 3)

  return (
    <div style={{ background: '#0B0E14', minHeight: '100vh', fontFamily: "'Inter',sans-serif", color: '#E5E7EB' }}>
      {/* Showroom header bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 6%', borderBottom: '1px solid #1F2430' }}>
        {store.shop_logo_url && <img src={store.shop_logo_url} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />}
        <div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>{store.shop_name}</div>
          {store.shop_category && <div style={{ fontSize: '0.7rem', color: '#7800FF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{store.shop_category}</div>}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={onLike} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#1A1F2B', border: 'none', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', color: '#E5E7EB', fontSize: '0.75rem' }}>
            <Heart size={13} fill={isLiked ? '#FF0080' : 'none'} color={isLiked ? '#FF0080' : '#9CA3AF'} /> {likeCount}
          </button>
        </div>
      </div>

      {/* Hero — full vehicle photography */}
      <div style={{ position: 'relative', height: '46vh', minHeight: 280, background: store.shop_cover_url ? `url(${store.shop_cover_url}) center/cover` : 'linear-gradient(135deg,#1A1F2B,#0B0E14)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0B0E14, transparent 55%)' }} />
        <div style={{ position: 'absolute', bottom: 20, left: '6%' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: 0 }}>{store.shop_name}</h1>
          {store.shop_desc && <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: 6, maxWidth: 420 }}>{store.shop_desc}</p>}
        </div>
      </div>

      {/* Contact strip */}
      <div style={{ display: 'flex', gap: 10, padding: '14px 6%' }}>
        <button onClick={onMessage} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>
          <MessageCircle size={14} /> Message
        </button>
        {waLink && <a href={waLink} target="_blank" rel="noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#25D366', color: '#fff', borderRadius: 10, padding: '11px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700 }}>WhatsApp</a>}
        {telLink && <a href={telLink} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#1A1F2B', borderRadius: 10, padding: '11px', textDecoration: 'none', color: '#E5E7EB', fontSize: '0.82rem', fontWeight: 700 }}><Phone size={14} /> Call</a>}
      </div>

      {/* New Arrivals — large showroom cards */}
      {newArrivals.length > 0 && (
        <div style={{ padding: '1.5rem 6%' }}>
          <h2 style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7800FF', marginBottom: 14, fontWeight: 800 }}>New Arrivals</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {newArrivals.map(p => (
              <div key={p.id} style={{ background: '#141821', borderRadius: 14, overflow: 'hidden', border: '1px solid #1F2430' }}>
                <div style={{ height: 160, background: p.image_url ? `url(${p.image_url}) center/cover` : '#1A1F2B' }} />
                <div style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{p.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}><Gauge size={11} /> Available</div>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '1rem', color: '#7800FF' }}>{fmt(p.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full catalog grid */}
      {products.length > newArrivals.length && (
        <div style={{ padding: '0.5rem 6% 2rem' }}>
          <h2 style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 14, fontWeight: 800 }}>Full Inventory</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {products.map(p => (
              <div key={p.id} style={{ background: '#141821', borderRadius: 12, overflow: 'hidden', border: '1px solid #1F2430' }}>
                <div style={{ height: 90, background: p.image_url ? `url(${p.image_url}) center/cover` : '#1A1F2B' }} />
                <div style={{ padding: 10 }}>
                  <div style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#7800FF', fontWeight: 800, marginTop: 2 }}>{fmt(p.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer style={{ padding: '1.5rem 6%', borderTop: '1px solid #1F2430' }}>
        {(store.shop_region || store.shop_city) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 10 }}>
            <MapPin size={13} /> {[store.shop_address, store.shop_city, store.shop_region].filter(Boolean).join(', ')}
          </div>
        )}
        <div style={{ fontSize: '0.68rem', color: '#4B5563' }}>{store.shop_name} · Powered by <Link href="/" style={{ color: '#4B5563' }}>ShopNekt</Link></div>
      </footer>
    </div>
  )
}
