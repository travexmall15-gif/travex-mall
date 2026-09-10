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

export default function FashionTemplate01({ store, products, likeCount, isLiked, onLike, onMessage }: WebstoreProps) {
  const waLink = store.shop_whatsapp ? `https://wa.me/${store.shop_whatsapp.replace(/\D/g, '').replace(/^0/, '255')}` : null
  const telLink = store.owner_phone ? `tel:${store.owner_phone}` : null
  const newArrivals = products.slice(0, 4)

  return (
    <div style={{ background: '#FFFDF9', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
      {/* Hero — full-bleed editorial */}
      <div style={{ position: 'relative', height: '58vh', minHeight: 340, background: store.shop_cover_url ? `url(${store.shop_cover_url}) center/cover` : 'linear-gradient(135deg,#FF0080,#7800FF)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: 24, left: '6%', right: '6%' }}>
          {store.shop_logo_url && (
            <img src={store.shop_logo_url} alt="" style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid #fff', objectFit: 'cover', marginBottom: 12 }} />
          )}
          <h1 style={{ fontSize: '2.2rem', color: '#fff', margin: 0, fontWeight: 400, letterSpacing: '0.02em' }}>{store.shop_name}</h1>
          {store.shop_category && <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>{store.shop_category}</p>}
        </div>
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', gap: 10, padding: '16px 6%', borderBottom: '1px solid #EDE6DA', flexWrap: 'wrap' }}>
        <button onClick={onLike} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #111', borderRadius: 999, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem' }}>
          <Heart size={14} fill={isLiked ? '#FF0080' : 'none'} color={isLiked ? '#FF0080' : '#111'} /> {likeCount}
        </button>
        <button onClick={onMessage} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#111', color: '#fff', border: 'none', borderRadius: 999, padding: '8px 18px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem' }}>
          <MessageCircle size={14} /> Message
        </button>
        {waLink && <a href={waLink} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#25D366', color: '#fff', borderRadius: 999, padding: '8px 18px', textDecoration: 'none', fontSize: '0.8rem' }}>WhatsApp</a>}
        {telLink && <a href={telLink} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #111', borderRadius: 999, padding: '8px 18px', textDecoration: 'none', color: '#111', fontSize: '0.8rem' }}><Phone size={14} /> Call</a>}
      </div>

      {/* About */}
      {store.shop_desc && (
        <div style={{ padding: '2rem 6%', maxWidth: 640 }}>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#3A3A3A', fontStyle: 'italic' }}>{store.shop_desc}</p>
        </div>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <div style={{ padding: '1rem 6% 2rem' , maxWidth: 1100, margin: '0 auto', boxSizing: 'border-box' }}>
          <h2 style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8A8A8A', marginBottom: 16 }}>New Arrivals</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
            {newArrivals.map(p => (
              <div key={p.id}>
                <div style={{ aspectRatio: '3/4', background: p.image_url ? `url(${p.image_url}) center/cover` : '#F0EBE1', borderRadius: 2, marginBottom: 8 }} />
                <div style={{ fontSize: '0.9rem', color: '#111' }}>{p.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#8A8A8A' }}>{fmt(p.price)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All products */}
      {products.length > newArrivals.length && (
        <div style={{ padding: '1rem 6% 2rem' , maxWidth: 1100, margin: '0 auto', boxSizing: 'border-box' }}>
          <h2 style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8A8A8A', marginBottom: 16 }}>Collection</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
            {products.map(p => (
              <div key={p.id}>
                <div style={{ aspectRatio: '3/4', background: p.image_url ? `url(${p.image_url}) center/cover` : '#F0EBE1', borderRadius: 2, marginBottom: 8 }} />
                <div style={{ fontSize: '0.9rem', color: '#111' }}>{p.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#8A8A8A' }}>{fmt(p.price)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ padding: '2rem 6%', borderTop: '1px solid #EDE6DA', marginTop: 20, maxWidth: 1100, margin: '20px auto 0', boxSizing: 'border-box' }}>
        {(store.shop_region || store.shop_city) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#8A8A8A', marginBottom: 10 }}>
            <MapPin size={13} /> {[store.shop_address, store.shop_city, store.shop_region].filter(Boolean).join(', ')}
          </div>
        )}
        <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
          {store.shop_instagram && <a href={`https://instagram.com/${store.shop_instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ color: '#111' }}><Link2 size={18} /></a>}
          {store.shop_facebook && <a href={store.shop_facebook.startsWith('http') ? store.shop_facebook : `https://${store.shop_facebook}`} target="_blank" rel="noreferrer" style={{ color: '#111' }}><Link2 size={18} /></a>}
        </div>
        <div style={{ fontSize: '0.7rem', color: '#B0A99C' }}>
          {store.shop_name} · Powered by <Link href="/" style={{ color: '#B0A99C' }}>ShopNekt</Link>
        </div>
      </footer>
    </div>
  )
}
