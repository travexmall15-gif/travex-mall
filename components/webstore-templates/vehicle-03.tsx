'use client'
import Link from 'next/link'
import { Heart, MapPin, Phone, Tag } from 'lucide-react'

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

// LAYOUT NOTE: a bright blue-gray "classifieds/marketplace" catalog
// feel — compact cards with a tag badge — built for scanning many
// listings quickly, distinct from vehicle-01 (large showroom cards)
// and vehicle-02 (formal brochure feature cards).
export default function VehicleTemplate03({ store, products, likeCount, isLiked, onLike, onMessage }: WebstoreProps) {
  const waLink = store.shop_whatsapp ? `https://wa.me/${store.shop_whatsapp.replace(/\D/g, '').replace(/^0/, '255')}` : null
  const telLink = store.owner_phone ? `tel:${store.owner_phone}` : null

  return (
    <div style={{ background: '#EEF2F7', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 5%' }}>
        <div style={{ padding: '1.75rem 0 1rem', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: store.shop_logo_url ? `url(${store.shop_logo_url}) center/cover` : 'linear-gradient(135deg,#FF0080,#7800FF)' }} />
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>{store.shop_name}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{store.shop_category}</div>
          </div>
          <button onClick={onLike} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: '0.75rem', color: '#334155' }}>
            <Heart size={13} fill={isLiked ? '#FF0080' : 'none'} color={isLiked ? '#FF0080' : '#94A3B8'} /> {likeCount}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, paddingBottom: '1.25rem' }}>
          <button onClick={onMessage} style={{ flex: 1, background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', border: 'none', borderRadius: 10, padding: 11, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>Message</button>
          {waLink && <a href={waLink} target="_blank" rel="noreferrer" style={{ flex: 1, background: '#25D366', color: '#fff', borderRadius: 10, padding: 11, textDecoration: 'none', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700 }}>WhatsApp</a>}
          {telLink && <a href={telLink} style={{ flex: 1, background: '#fff', borderRadius: 10, padding: 11, textDecoration: 'none', color: '#334155', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}><Phone size={13} /> Call</a>}
        </div>

        {products.length > 0 && (
          <div style={{ paddingBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
            {products.map(p => (
              <div key={p.id} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }}>
                <div style={{ position: 'relative', height: 140, background: p.image_url ? `url(${p.image_url}) center/cover` : '#DCE3EC' }}>
                  <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(255,255,255,0.9)', color: '#7800FF', fontSize: '0.62rem', fontWeight: 800, padding: '3px 8px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Tag size={9} /> {store.shop_category}
                  </span>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{p.name}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#7800FF', marginTop: 4 }}>{fmt(p.price)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <footer style={{ padding: '1.25rem 0 2rem', borderTop: '1px solid #D8E0EA' }}>
          {(store.shop_region || store.shop_city) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#64748B', marginBottom: 8 }}>
              <MapPin size={13} /> {[store.shop_address, store.shop_city, store.shop_region].filter(Boolean).join(', ')}
            </div>
          )}
          <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{store.shop_name} · Powered by <Link href="/" style={{ color: '#94A3B8' }}>ShopNekt</Link></div>
        </footer>
      </div>
    </div>
  )
}
