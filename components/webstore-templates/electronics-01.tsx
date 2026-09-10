'use client'
import Link from 'next/link'
import { Heart, MapPin, MessageCircle, Phone, Link2 } from 'lucide-react'

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

export default function ElectronicsTemplate01({ store, products, likeCount, isLiked, onLike, onMessage }: WebstoreProps) {
  const waLink = store.shop_whatsapp ? `https://wa.me/${store.shop_whatsapp.replace(/\D/g, '').replace(/^0/, '255')}` : null
  const telLink = store.owner_phone ? `tel:${store.owner_phone}` : null
  const newArrivals = products.slice(0, 6)

  return (
    <div style={{ background: '#F7F8FA', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>
      {/* Compact header — logo left, actions right (catalog feel, not a big hero) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 6%', background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ width: 46, height: 46, borderRadius: 10, background: store.shop_logo_url ? `url(${store.shop_logo_url}) center/cover` : 'linear-gradient(135deg,#FF0080,#7800FF)', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111827' }}>{store.shop_name}</div>
          {store.shop_category && <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{store.shop_category}</div>}
        </div>
        <button onClick={onLike} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F3F4F6', border: 'none', borderRadius: 999, padding: '7px 12px', cursor: 'pointer', fontSize: '0.75rem', color: '#374151' }}>
          <Heart size={13} fill={isLiked ? '#FF0080' : 'none'} color={isLiked ? '#FF0080' : '#9CA3AF'} /> {likeCount}
        </button>
      </div>

      {/* Slim banner strip instead of a huge hero — utilitarian, spec-forward feel */}
      {store.shop_cover_url && (
        <div style={{ height: 120, background: `url(${store.shop_cover_url}) center/cover` }} />
      )}

      {store.shop_desc && (
        <div style={{ padding: '1.25rem 6% 0.5rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>{store.shop_desc}</p>
        </div>
      )}

      {/* Contact row — compact, functional */}
      <div style={{ display: 'flex', gap: 8, padding: '1rem 6%' }}>
        <button onClick={onMessage} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
          <MessageCircle size={13} /> Message
        </button>
        {waLink && <a href={waLink} target="_blank" rel="noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#25D366', color: '#fff', borderRadius: 8, padding: '9px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700 }}>WhatsApp</a>}
        {telLink && <a href={telLink} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: '9px', textDecoration: 'none', color: '#374151', fontSize: '0.75rem', fontWeight: 700 }}><Phone size={13} /> Call</a>}
      </div>

      {/* New Arrivals — dense catalog grid, spec-forward */}
      {newArrivals.length > 0 && (
        <div style={{ padding: '0.5rem 6% 1rem' }}>
          <h2 style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7800FF', marginBottom: 10, fontWeight: 800 }}>New Arrivals</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 8 }}>
            {newArrivals.map(p => (
              <div key={p.id} style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                <div style={{ aspectRatio: '1/1', background: p.image_url ? `url(${p.image_url}) center/cover` : '#F3F4F6' }} />
                <div style={{ padding: 8 }}>
                  <div style={{ fontSize: '0.68rem', color: '#111827', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#7800FF', fontWeight: 800, marginTop: 2 }}>{fmt(p.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full catalog */}
      {products.length > newArrivals.length && (
        <div style={{ padding: '0.5rem 6% 2rem' }}>
          <h2 style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280', marginBottom: 10, fontWeight: 800 }}>All Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 8 }}>
            {products.map(p => (
              <div key={p.id} style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                <div style={{ aspectRatio: '1/1', background: p.image_url ? `url(${p.image_url}) center/cover` : '#F3F4F6' }} />
                <div style={{ padding: 8 }}>
                  <div style={{ fontSize: '0.68rem', color: '#111827', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#7800FF', fontWeight: 800, marginTop: 2 }}>{fmt(p.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer style={{ padding: '1.25rem 6%', background: '#fff', borderTop: '1px solid #E5E7EB', maxWidth: 1100, margin: '0 auto', boxSizing: 'border-box' }}>
        {(store.shop_region || store.shop_city) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#6B7280', marginBottom: 8 }}>
            <MapPin size={12} /> {[store.shop_address, store.shop_city, store.shop_region].filter(Boolean).join(', ')}
          </div>
        )}
        {store.shop_instagram && (
          <a href={`https://instagram.com/${store.shop_instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ color: '#6B7280', display: 'inline-flex', marginBottom: 8 }}><Link2 size={16} /></a>
        )}
        <div style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>{store.shop_name} · Powered by <Link href="/" style={{ color: '#9CA3AF' }}>ShopNekt</Link></div>
      </footer>
    </div>
  )
}
