'use client'
import Link from 'next/link'
import { Heart, MapPin, Link2, MessageCircle, Phone } from 'lucide-react'

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

// LAYOUT NOTE: unlike fashion-01's grid, this template tells the
// story as a vertical sequence of full-width alternating blocks — one
// product at a time, large — the "luxury editorial" reading pattern
// of print fashion magazines, not a browsable catalog grid.
export default function FashionTemplate02({ store, products, likeCount, isLiked, onLike, onMessage }: WebstoreProps) {
  const waLink = store.shop_whatsapp ? `https://wa.me/${store.shop_whatsapp.replace(/\D/g, '').replace(/^0/, '255')}` : null
  const telLink = store.owner_phone ? `tel:${store.owner_phone}` : null

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', fontFamily: 'Georgia, serif', color: '#F5F5F0' }}>
      {/* Full-bleed hero, minimal chrome */}
      <div style={{ position: 'relative', height: '85vh', minHeight: 420, background: store.shop_cover_url ? `url(${store.shop_cover_url}) center/cover` : '#141414' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 8%' }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 300, letterSpacing: '0.05em', margin: 0 }}>{store.shop_name}</h1>
          <div style={{ width: 40, height: 1, background: '#7800FF', margin: '18px 0' }} />
          {store.shop_desc && <p style={{ fontSize: '0.9rem', color: '#D4D4D4', maxWidth: 380, lineHeight: 1.8, fontStyle: 'italic' }}>{store.shop_desc}</p>}
        </div>
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, padding: '2rem 6%', borderBottom: '1px solid #2A2A2A' }}>
        <button onClick={onLike} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #7800FF', color: '#F5F5F0', borderRadius: 999, padding: '9px 18px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem' }}>
          <Heart size={14} fill={isLiked ? '#FF0080' : 'none'} color={isLiked ? '#FF0080' : '#F5F5F0'} /> {likeCount}
        </button>
        <button onClick={onMessage} style={{ background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', border: 'none', borderRadius: 999, padding: '9px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <MessageCircle size={14} /> Message
        </button>
        {waLink && <a href={waLink} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: '#fff', borderRadius: 999, padding: '9px 20px', textDecoration: 'none', fontSize: '0.8rem' }}>WhatsApp</a>}
        {telLink && <a href={telLink} style={{ background: 'none', border: '1px solid #F5F5F0', borderRadius: 999, padding: '9px 20px', textDecoration: 'none', color: '#F5F5F0', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={13} /> Call</a>}
      </div>

      {/* Editorial story blocks — one product per full-width section, alternating alignment */}
      {products.length > 0 && (
        <div style={{ padding: '3rem 0' }}>
          <p style={{ textAlign: 'center', fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7800FF', marginBottom: '2.5rem' }}>New Arrivals</p>
          {products.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', flexDirection: i % 2 === 0 ? 'row' : 'row-reverse', alignItems: 'center', gap: '4%', padding: '2.5rem 6%', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px', aspectRatio: '4/5', background: p.image_url ? `url(${p.image_url}) center/cover` : '#1A1A1A' }} />
              <div style={{ flex: '1 1 260px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 300, margin: '0 0 12px' }}>{p.name}</h3>
                <p style={{ fontSize: '1.1rem', color: '#7800FF', marginBottom: 16 }}>{fmt(p.price)}</p>
                <div style={{ width: 30, height: 1, background: '#3A3A3A' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <footer style={{ padding: '2.5rem 6%', borderTop: '1px solid #2A2A2A', textAlign: 'center', maxWidth: 1100, margin: '0 auto', boxSizing: 'border-box' }}>
        {(store.shop_region || store.shop_city) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.78rem', color: '#8A8A8A', marginBottom: 14 }}>
            <MapPin size={13} /> {[store.shop_address, store.shop_city, store.shop_region].filter(Boolean).join(', ')}
          </div>
        )}
        {(store.shop_instagram || store.shop_facebook) && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 14 }}>
            {store.shop_instagram && <a href={`https://instagram.com/${store.shop_instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ color: '#F5F5F0' }}><Link2 size={17} /></a>}
            {store.shop_facebook && <a href={store.shop_facebook.startsWith('http') ? store.shop_facebook : `https://${store.shop_facebook}`} target="_blank" rel="noreferrer" style={{ color: '#F5F5F0' }}><Link2 size={17} /></a>}
          </div>
        )}
        <div style={{ fontSize: '0.68rem', color: '#5A5A5A' }}>{store.shop_name} · Powered by <Link href="/" style={{ color: '#5A5A5A' }}>ShopNekt</Link></div>
      </footer>
    </div>
  )
}
