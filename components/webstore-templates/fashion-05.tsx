'use client'
import Link from 'next/link'
import { Heart, MapPin, Link2, Phone } from 'lucide-react'

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

// LAYOUT NOTE: a two-column hero (large cover left, name/actions/desc
// stacked right on desktop; stacks vertically on mobile) feeding into
// a uniform 1:1 catalog grid — a "magazine cover + lookbook" hybrid
// distinct from the other 4 fashion layouts (grid-only, single-column
// story, masonry, and minimal-list).
export default function FashionTemplate05({ store, products, likeCount, isLiked, onLike, onMessage }: WebstoreProps) {
  const waLink = store.shop_whatsapp ? `https://wa.me/${store.shop_whatsapp.replace(/\D/g, '').replace(/^0/, '255')}` : null
  const telLink = store.owner_phone ? `tel:${store.owner_phone}` : null

  return (
    <div style={{ background: '#FFF9F5', minHeight: '100vh', fontFamily: "'Georgia',serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 5%' }}>
        {/* Two-column hero — reflows to single column on narrow screens */}
        <div style={{ display: 'flex', gap: '4%', padding: '2.5rem 0', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px', aspectRatio: '4/5', background: store.shop_cover_url ? `url(${store.shop_cover_url}) center/cover` : 'linear-gradient(135deg,#FF0080,#7800FF)', borderRadius: 4 }} />
          <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {store.shop_category && <p style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7800FF', marginBottom: 10 }}>{store.shop_category}</p>}
            <h1 style={{ fontSize: '2rem', fontWeight: 400, color: '#2A2A2A', margin: '0 0 14px' }}>{store.shop_name}</h1>
            {store.shop_desc && <p style={{ fontSize: '0.88rem', color: '#6B6B6B', lineHeight: 1.7, marginBottom: 20, maxWidth: 380 }}>{store.shop_desc}</p>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={onLike} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1.5px solid #2A2A2A', borderRadius: 999, padding: '8px 16px', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: '0.78rem' }}>
                <Heart size={13} fill={isLiked ? '#FF0080' : 'none'} color={isLiked ? '#FF0080' : '#2A2A2A'} /> {likeCount}
              </button>
              <button onClick={onMessage} style={{ background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', border: 'none', borderRadius: 999, padding: '8px 18px', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: '0.78rem' }}>Message</button>
              {waLink && <a href={waLink} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: '#fff', borderRadius: 999, padding: '8px 18px', textDecoration: 'none', fontFamily: "'Inter',sans-serif", fontSize: '0.78rem' }}>WhatsApp</a>}
              {telLink && <a href={telLink} style={{ border: '1.5px solid #2A2A2A', borderRadius: 999, padding: '8px 18px', textDecoration: 'none', color: '#2A2A2A', fontFamily: "'Inter',sans-serif", fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={13} /> Call</a>}
            </div>
          </div>
        </div>

        {/* Uniform lookbook grid */}
        {products.length > 0 && (
          <div style={{ padding: '1rem 0 3rem' }}>
            <p style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B0A99C', marginBottom: 16 }}>The Collection</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 18 }}>
              {products.map(p => (
                <div key={p.id}>
                  <div style={{ aspectRatio: '1/1', background: p.image_url ? `url(${p.image_url}) center/cover` : '#F0E9DE', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.82rem', color: '#2A2A2A' }}>{p.name}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.78rem', color: '#7800FF', fontWeight: 700 }}>{fmt(p.price)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer style={{ padding: '1.5rem 0 2rem', borderTop: '1px solid #EDE0D0', fontFamily: "'Inter',sans-serif" }}>
          {(store.shop_region || store.shop_city) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#8A8A8A', marginBottom: 10 }}>
              <MapPin size={13} /> {[store.shop_address, store.shop_city, store.shop_region].filter(Boolean).join(', ')}
            </div>
          )}
          {store.shop_instagram && <a href={`https://instagram.com/${store.shop_instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ color: '#2A2A2A', display: 'inline-flex', marginBottom: 10 }}><Link2 size={16} /></a>}
          <div style={{ fontSize: '0.68rem', color: '#B0A99C' }}>{store.shop_name} · Powered by <Link href="/" style={{ color: '#B0A99C' }}>ShopNekt</Link></div>
        </footer>
      </div>
    </div>
  )
}
