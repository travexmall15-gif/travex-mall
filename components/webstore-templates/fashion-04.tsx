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

// LAYOUT NOTE: a narrow, centered single-column well (max 480px) with
// a small square cover and thin hairline dividers between products —
// no hero photography, no color blocks — the restrained opposite of
// fashion-01/02/03's photography-forward approach.
export default function FashionTemplate04({ store, products, likeCount, isLiked, onLike, onMessage }: WebstoreProps) {
  const waLink = store.shop_whatsapp ? `https://wa.me/${store.shop_whatsapp.replace(/\D/g, '').replace(/^0/, '255')}` : null
  const telLink = store.owner_phone ? `tel:${store.owner_phone}` : null

  return (
    <div style={{ background: '#FAFAFA', minHeight: '100vh', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '3rem 5% 2rem', textAlign: 'center' }}>
        {store.shop_logo_url && (
          <img src={store.shop_logo_url} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem' }} />
        )}
        <h1 style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#111', margin: '0 0 6px' }}>{store.shop_name}</h1>
        {store.shop_desc && <p style={{ fontSize: '0.78rem', color: '#888', lineHeight: 1.7, margin: '0 auto', maxWidth: 320 }}>{store.shop_desc}</p>}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.5rem' }}>
          <button onClick={onLike} style={{ background: 'none', border: '1px solid #DDD', borderRadius: 2, padding: '7px 14px', cursor: 'pointer', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 5, color: '#111' }}>
            <Heart size={12} fill={isLiked ? '#FF0080' : 'none'} color={isLiked ? '#FF0080' : '#111'} /> {likeCount}
          </button>
          <button onClick={onMessage} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 2, padding: '7px 16px', cursor: 'pointer', fontSize: '0.72rem' }}>Message</button>
          {waLink && <a href={waLink} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: '#fff', borderRadius: 2, padding: '7px 16px', textDecoration: 'none', fontSize: '0.72rem' }}>WhatsApp</a>}
          {telLink && <a href={telLink} style={{ border: '1px solid #DDD', borderRadius: 2, padding: '7px 16px', textDecoration: 'none', color: '#111', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={11} /> Call</a>}
        </div>
      </div>

      {/* Product list — thin dividers, no cards */}
      {products.length > 0 && (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '1rem 5% 3rem' }}>
          <p style={{ fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#AAA', marginBottom: 14, textAlign: 'center' }}>New Arrivals</p>
          {products.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: '1px solid #EAEAEA' }}>
              <div style={{ width: 56, height: 70, background: p.image_url ? `url(${p.image_url}) center/cover` : '#EEE', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', color: '#111' }}>{p.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#999', marginTop: 2 }}>{fmt(p.price)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <footer style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 5%', borderTop: '1px solid #EAEAEA', textAlign: 'center' }}>
        {(store.shop_region || store.shop_city) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: '0.72rem', color: '#999', marginBottom: 10 }}>
            <MapPin size={11} /> {[store.shop_address, store.shop_city, store.shop_region].filter(Boolean).join(', ')}
          </div>
        )}
        {store.shop_instagram && (
          <a href={`https://instagram.com/${store.shop_instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ color: '#111', display: 'inline-flex', marginBottom: 10 }}><Link2 size={14} /></a>
        )}
        <div style={{ fontSize: '0.64rem', color: '#BBB' }}>{store.shop_name} · Powered by <Link href="/" style={{ color: '#BBB' }}>ShopNekt</Link></div>
      </footer>
    </div>
  )
}
