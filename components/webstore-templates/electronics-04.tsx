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

// LAYOUT NOTE: a plain, functional comparison-table-style list —
// small thumbnail, name, price right-aligned in a bordered row — for
// buyers who want to scan prices fast, not browse imagery. The most
// utilitarian of the four electronics templates.
export default function ElectronicsTemplate04({ store, products, likeCount, isLiked, onLike, onMessage }: WebstoreProps) {
  const waLink = store.shop_whatsapp ? `https://wa.me/${store.shop_whatsapp.replace(/\D/g, '').replace(/^0/, '255')}` : null
  const telLink = store.owner_phone ? `tel:${store.owner_phone}` : null

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 5%' }}>
        <div style={{ padding: '1.5rem 0', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {store.shop_logo_url && <img src={store.shop_logo_url} alt="" style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover' }} />}
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111827' }}>{store.shop_name}</div>
            <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>{store.shop_category}</div>
          </div>
          <button onClick={onLike} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F3F4F6', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: '0.72rem' }}>
            <Heart size={12} fill={isLiked ? '#FF0080' : 'none'} color={isLiked ? '#FF0080' : '#9CA3AF'} /> {likeCount}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, paddingBottom: '1rem' }}>
          <button onClick={onMessage} style={{ flex: 1, background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', border: 'none', borderRadius: 8, padding: 9, cursor: 'pointer', fontSize: '0.76rem', fontWeight: 700 }}>Message</button>
          {waLink && <a href={waLink} target="_blank" rel="noreferrer" style={{ flex: 1, background: '#25D366', color: '#fff', borderRadius: 8, padding: 9, textDecoration: 'none', textAlign: 'center', fontSize: '0.76rem', fontWeight: 700 }}>WhatsApp</a>}
          {telLink && <a href={telLink} style={{ flex: 1, background: '#F3F4F6', borderRadius: 8, padding: 9, textDecoration: 'none', color: '#111827', textAlign: 'center', fontSize: '0.76rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Phone size={12} /> Call</a>}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid #F1F1F1' }}>
                <td style={{ padding: '10px 0', width: 52 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: p.image_url ? `url(${p.image_url}) center/cover` : '#F3F4F6' }} />
                </td>
                <td style={{ padding: '10px 12px', fontSize: '0.85rem', color: '#111827', fontWeight: 600 }}>{p.name}</td>
                <td style={{ padding: '10px 0', fontSize: '0.88rem', fontWeight: 900, color: '#7800FF', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(p.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <footer style={{ padding: '1.5rem 0 2rem', borderTop: '1px solid #F1F1F1', marginTop: 20 }}>
          {(store.shop_region || store.shop_city) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#9CA3AF', marginBottom: 8 }}>
              <MapPin size={12} /> {[store.shop_address, store.shop_city, store.shop_region].filter(Boolean).join(', ')}
            </div>
          )}
          <div style={{ fontSize: '0.65rem', color: '#C4C4C4' }}>{store.shop_name} · Powered by <Link href="/" style={{ color: '#C4C4C4' }}>ShopNekt</Link></div>
        </footer>
      </div>
    </div>
  )
}
