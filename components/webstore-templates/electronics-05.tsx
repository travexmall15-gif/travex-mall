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

// LAYOUT NOTE: a sidebar + main-content layout (info panel fixed on
// the side on wide screens, stacks on top for mobile) — the only
// electronics template using a persistent side panel instead of a
// top header, giving it a "control panel / dashboard-adjacent" feel
// appropriate for a tech shop.
export default function ElectronicsTemplate05({ store, products, likeCount, isLiked, onLike, onMessage }: WebstoreProps) {
  const waLink = store.shop_whatsapp ? `https://wa.me/${store.shop_whatsapp.replace(/\D/g, '').replace(/^0/, '255')}` : null
  const telLink = store.owner_phone ? `tel:${store.owner_phone}` : null

  return (
    <div style={{ background: '#F4F5F7', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 5%', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Sidebar — sticky on desktop, full-width block on mobile */}
        <aside style={{ flex: '1 1 240px', maxWidth: 280, padding: '2rem 0' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', position: 'sticky', top: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: store.shop_logo_url ? `url(${store.shop_logo_url}) center/cover` : 'linear-gradient(135deg,#FF0080,#7800FF)', marginBottom: 14 }} />
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827', marginBottom: 4 }}>{store.shop_name}</div>
            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: 12 }}>{store.shop_category}</div>
            {store.shop_desc && <p style={{ fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.6, marginBottom: 16 }}>{store.shop_desc}</p>}

            <button onClick={onLike} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#F3F4F6', border: 'none', borderRadius: 8, padding: 9, cursor: 'pointer', fontSize: '0.76rem', marginBottom: 8 }}>
              <Heart size={13} fill={isLiked ? '#FF0080' : 'none'} color={isLiked ? '#FF0080' : '#9CA3AF'} /> {likeCount} likes
            </button>
            <button onClick={onMessage} style={{ width: '100%', background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', border: 'none', borderRadius: 8, padding: 9, cursor: 'pointer', fontSize: '0.76rem', fontWeight: 700, marginBottom: 8 }}>Message</button>
            {waLink && <a href={waLink} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', background: '#25D366', color: '#fff', borderRadius: 8, padding: 9, textDecoration: 'none', fontSize: '0.76rem', fontWeight: 700, marginBottom: 8 }}>WhatsApp</a>}
            {telLink && <a href={telLink} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#F3F4F6', borderRadius: 8, padding: 9, textDecoration: 'none', color: '#111827', fontSize: '0.76rem', fontWeight: 700 }}><Phone size={12} /> Call</a>}

            {(store.shop_region || store.shop_city) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: '#9CA3AF', marginTop: 14 }}>
                <MapPin size={11} /> {[store.shop_city, store.shop_region].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        </aside>

        {/* Main product area */}
        <main style={{ flex: '3 1 480px', padding: '2rem 0' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#111827', marginBottom: 14 }}>Products</h2>
          {products.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
              {products.map(p => (
                <div key={p.id} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '1/1', background: p.image_url ? `url(${p.image_url}) center/cover` : '#EEF0F3' }} />
                  <div style={{ padding: 10 }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7800FF', marginTop: 2 }}>{fmt(p.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>No products listed yet.</p>
          )}

          <div style={{ marginTop: 30, fontSize: '0.65rem', color: '#B0B4BB' }}>{store.shop_name} · Powered by <Link href="/" style={{ color: '#B0B4BB' }}>ShopNekt</Link></div>
        </main>
      </div>
    </div>
  )
}
