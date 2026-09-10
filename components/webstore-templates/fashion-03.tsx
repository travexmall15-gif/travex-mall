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

// LAYOUT NOTE: asymmetric masonry (varying tile sizes via a repeating
// pattern), oversized condensed type, sticker-style price tags — the
// deliberately "loud", gritty energy that differs structurally from
// both fashion-01 (clean grid) and fashion-02 (slow single-column
// story), not just in color.
export default function FashionTemplate03({ store, products, likeCount, isLiked, onLike, onMessage }: WebstoreProps) {
  const waLink = store.shop_whatsapp ? `https://wa.me/${store.shop_whatsapp.replace(/\D/g, '').replace(/^0/, '255')}` : null
  const telLink = store.owner_phone ? `tel:${store.owner_phone}` : null
  const sizePattern = ['1/1', '2/1', '1/1', '1/2', '1/1', '1/1']

  return (
    <div style={{ background: '#111', minHeight: '100vh', fontFamily: "'Arial Black',Impact,sans-serif", color: '#fff' }}>
      {/* Hero — big block type, no soft gradients */}
      <div style={{ background: store.shop_cover_url ? `url(${store.shop_cover_url}) center/cover` : '#000', padding: '3.5rem 6% 2rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 16, right: '6%', background: '#FF0080', color: '#fff', padding: '4px 12px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.05em', transform: 'rotate(3deg)' }}>
          {store.shop_category?.toUpperCase()}
        </div>
        <h1 style={{ fontSize: '2.6rem', fontWeight: 900, margin: 0, lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{store.shop_name}</h1>
        {store.shop_desc && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.85rem', color: '#CCC', marginTop: 12, maxWidth: 360 }}>{store.shop_desc}</p>}
      </div>

      {/* Action bar — blocky buttons */}
      <div style={{ display: 'flex', gap: 6, padding: '0 6% 1.5rem', fontFamily: "'Inter',sans-serif" }}>
        <button onClick={onLike} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#222', border: 'none', color: '#fff', padding: '11px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
          <Heart size={13} fill={isLiked ? '#FF0080' : 'none'} color={isLiked ? '#FF0080' : '#fff'} /> {likeCount}
        </button>
        <button onClick={onMessage} style={{ flex: 1, background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', border: 'none', padding: '11px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>Message</button>
        {waLink && <a href={waLink} target="_blank" rel="noreferrer" style={{ flex: 1, background: '#25D366', color: '#fff', textDecoration: 'none', padding: '11px', textAlign: 'center', fontSize: '0.78rem', fontWeight: 700 }}>WhatsApp</a>}
        {telLink && <a href={telLink} style={{ flex: 1, background: '#222', color: '#fff', textDecoration: 'none', padding: '11px', textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}><Phone size={12} /> Call</a>}
      </div>

      {/* Masonry drop */}
      {products.length > 0 && (
        <div style={{ padding: '0.5rem 4% 2rem', columnWidth: 160, columnGap: 6, maxWidth: 1100, margin: '0 auto' }}>
          {products.map((p, i) => (
            <div key={p.id} style={{ breakInside: 'avoid', marginBottom: 6, position: 'relative' }}>
              <div style={{ aspectRatio: sizePattern[i % sizePattern.length], background: p.image_url ? `url(${p.image_url}) center/cover` : '#222' }} />
              <div style={{ position: 'absolute', bottom: 6, left: 6, right: 6, background: 'rgba(0,0,0,0.75)', padding: '6px 8px' }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.7rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.72rem', fontWeight: 900, color: '#FF0080' }}>{fmt(p.price)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <footer style={{ padding: '1.5rem 6%', borderTop: '3px solid #FF0080', fontFamily: "'Inter',sans-serif" }}>
        {(store.shop_region || store.shop_city) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#999', marginBottom: 10 }}>
            <MapPin size={12} /> {[store.shop_address, store.shop_city, store.shop_region].filter(Boolean).join(', ')}
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
          {store.shop_instagram && <a href={`https://instagram.com/${store.shop_instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ color: '#fff' }}><Link2 size={16} /></a>}
          {store.shop_tiktok && <a href={`https://tiktok.com/@${store.shop_tiktok.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ color: '#fff' }}><Link2 size={16} /></a>}
        </div>
        <div style={{ fontSize: '0.65rem', color: '#555' }}>{store.shop_name} · Powered by <Link href="/" style={{ color: '#555' }}>ShopNekt</Link></div>
      </footer>
    </div>
  )
}
