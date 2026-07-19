import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://bscecjbgnjitlfmgwcic.supabase.co',
  'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'
)

function detectIntent(msg: string) {
  const m = msg.toLowerCase()
  if (/habari|hujambo|mambo|hello|hi\b|hey|sasa/.test(m)) return 'greeting'
  if (/bei|price|gharama|pesa|shilingi|ngapi|cost/.test(m)) return 'price'
  if (/delivery|lete|peleka|usafirishaji|lori|gari|tuma/.test(m)) return 'delivery'
  if (/order|agizo|nunua|buy|ninataka|nataka|niambie/.test(m)) return 'order'
  if (/seller|muuzaji|duka|owner|mmiliki|zungumza|message|chat/.test(m)) return 'contact'
  if (/bidhaa|products|una nini|mna nini|stock|opo|available/.test(m)) return 'products'
  if (/flash deal|ofa|punguzo|discount|deal|cheap/.test(m)) return 'flash_deals'
  if (/group buy|group|kikundi|pamoja/.test(m)) return 'group_buy'
  if (/order|agizo|niliamua|status|liko wapi/.test(m)) return 'orders'
  if (/campus|chuo|student/.test(m)) return 'campus'
  if (/help|msaada|jinsi|how/.test(m)) return 'help'
  if (/tafuta|find|search|nataka|looking|need/.test(m)) return 'search'
  return 'general'
}

function fmtPrice(n: number) { return `TZS ${n?.toLocaleString() || '—'}` }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) }

export async function POST(req: NextRequest) {
  try {
    const { message, userId, storeId, shopName, shopCategory, mode } = await req.json()
    const intent = detectIntent(message)
    let reply = ''

    // ── STORE CUSTOMER CARE MODE ──────────────────────────
    if (mode === 'store' && storeId) {
      switch (intent) {

        case 'greeting':
          reply = `👋 Habari! Karibu duka la **${shopName}**!\n\nNinaweza kukusaidia na:\n• 🛍️ Bidhaa zinazopo\n• 💰 Bei na offers\n• 📦 Delivery\n• 💬 Kuwasiliana na seller\n\nUnahitaji nini?`
          break

        case 'price': {
          const { data: products } = await sb.from('products').select('name, price, description').eq('shop_id', storeId).limit(6)
          if (products && products.length > 0) {
            reply = `💰 **Bei za ${shopName}:**\n\n`
            products.forEach(p => { reply += `• ${p.name} — ${fmtPrice(p.price)}\n` })
            reply += `\nTuma ujumbe kwa seller kwa bei maalum! 📲`
          } else {
            reply = `💰 Tafadhali wasiliana na seller wa **${shopName}** moja kwa moja kwa habari za bei.\n\n👉 Bonyeza "Message Seller" kwenye duka hili.`
          }
          break
        }

        case 'products': {
          const { data: products } = await sb.from('products').select('name, price, category').eq('shop_id', storeId).limit(8)
          if (products && products.length > 0) {
            reply = `🛍️ **Bidhaa za ${shopName}:**\n\n`
            products.forEach(p => { reply += `• ${p.name} — ${fmtPrice(p.price)}\n` })
            reply += `\nUnataka kujua zaidi kuhusu bidhaa yoyote?`
          } else {
            reply = `🛍️ Duka la **${shopName}** lina bidhaa mbalimbali za ${shopCategory || 'aina mbalimbali'}.\n\nWasiliana na seller kupata orodha kamili!`
          }
          break
        }

        case 'delivery':
          reply = `🚛 **Delivery kwa ${shopName}:**\n\n📍 Delivery inapatikana kwa baadhi ya maeneo.\n💬 Wasiliana na seller kujua:\n• Bei ya delivery\n• Muda wa delivery\n• Maeneo yanayohudumiwa\n\n👉 Bonyeza "Message Seller" dukani hili!`
          break

        case 'contact':
          reply = `💬 **Kuwasiliana na ${shopName}:**\n\n👉 Bonyeza kitufe cha **"Message Seller"** kwenye ukurasa wa duka hili.\n\nSeller atajibu haraka iwezekanavyo! ✅`
          break

        case 'order':
          reply = `📦 **Kununua kutoka ${shopName}:**\n\n1. Chagua bidhaa unayotaka\n2. Wasiliana na seller\n3. Kubali bei na delivery\n4. Fanya malipo\n\n💬 Anza kwa kubonyeza "Message Seller"!`
          break

        default:
          reply = `🤔 Samahani, sijaelewa vizuri.\n\nNinaweza kukusaidia na:\n• 🛍️ Bidhaa — "Mna nini?"\n• 💰 Bei — "Bei gani?"\n• 📦 Delivery — "Mna delivery?"\n• 💬 Seller — "Niwasiliane na seller"\n\nUliza tena! 😊`
      }

    // ── SELLER DASHBOARD MODE ─────────────────────────────
    } else if (mode === 'seller') {
      switch (intent) {

        case 'greeting':
          reply = `👋 Habari! Mimi ni **360 AI** — msaidizi wako wa duka.\n\nNinaweza kukusaidia na:\n• 📦 Kuongeza bidhaa\n• 📊 Kuangalia mauzo\n• 💰 Mapato na takwimu\n• 📣 Masoko na matangazo\n• 💬 Maswali ya wateja\n\nUnahitaji nini?`
          break

        case 'products':
          reply = `🛍️ **Kuongeza Bidhaa:**\n\n1. Nenda "Products" kwenye sidebar\n2. Bonyeza "+ Add Product"\n3. Jaza: jina, bei, picha, description\n4. Save — bidhaa itaonekana mara moja!\n\n💡 Tip: Picha nzuri zinaongeza mauzo kwa 60%!`
          break

        case 'price':
          reply = `💰 **Ushauri wa Bei:**\n\n✅ Bei nzuri:\n• Angalia washindani wako\n• Fikiri gharama + faida\n• Weka bei ya Flash Deal wakati wa promotion\n\n📊 Bei ya kawaida kwa Tanzania:\n• Nguo: TZS 10,000-50,000\n• Simu: TZS 200,000+\n• Chakula: TZS 2,000-20,000`
          break

        case 'delivery':
          reply = `🚛 **Delivery kwa Sellers:**\n\n• Tumia **ShopNekt Move** kwa delivery rahisi\n• Waambie wateja bei ya delivery mapema\n• Nenda /move kuona bei za ShopNekt Move\n\n💡 Delivery ya bure inaongeza mauzo!`
          break

        case 'orders':
          reply = `📦 **Orders Zako:**\n\nAngalia orders zako:\n• Dashboard → Orders section\n• Pending orders zinahitaji hatua yako\n• Confirm au reject kila order\n\n⚡ Jibu orders haraka — wateja wanasubiri!`
          break

        default:
          reply = `🤔 Ninaweza kukusaidia na:\n• 📦 Bidhaa — "Niongeze bidhaa vipi?"\n• 💰 Bei — "Niweke bei gani?"\n• 📊 Mauzo — "Angalia mauzo yangu"\n• 📣 Masoko — "Ninavyoweza kutangaza?"\n• 🚛 Delivery — "Delivery inafanyaje?"\n\nUliza swali lako! 😊`
      }

    // ── GENERAL MENU MODE ─────────────────────────────────
    } else {
      switch (intent) {
        case 'greeting':
          reply = `👋 Habari! Mimi ni **360 AI** — msaidizi wako wa ShopNekt.\n\nNinaweza kukusaidia kupata bidhaa, kuangalia deals, kueleza features, na zaidi!\n\nUnahitaji nini?`
          break
        case 'flash_deals': {
          const { data: deals } = await sb.from('flash_deals').select('product_name,original_price,discounted_price,discount_pct').eq('is_active',true).order('discount_pct',{ascending:false}).limit(5)
          if (deals && deals.length > 0) {
            reply = `⚡ **Flash Deals za Sasa:**\n\n`
            deals.forEach((d,i) => { reply += `${i+1}. ${d.product_name}\n   ~~${fmtPrice(d.original_price)}~~ → ${fmtPrice(d.discounted_price)} (-${d.discount_pct}%)\n\n` })
            reply += `👉 Nenda /flash-deals kuona zote!`
          } else {
            reply = `⚡ Hakuna flash deals sasa. Tembelea /flash-deals mara kwa mara!\n\n💡 Washa "Flash Deal Alerts" kwenye Settings.`
          }
          break
        }
        case 'search': {
          const term = message.replace(/nataka|tafuta|find|search|ninatafuta|pata/gi,'').trim()
          if (term.length > 2) {
            const { data: shops } = await sb.from('shops').select('shop_name,shop_category,shop_city').or(`shop_name.ilike.%${term}%,shop_category.ilike.%${term}%`).limit(5)
            if (shops && shops.length > 0) {
              reply = `🔍 Nimeona "${term}":\n\n`
              shops.forEach(s => { reply += `• ${s.shop_name} — ${s.shop_category} (${s.shop_city||'Online'})\n` })
              reply += `\n👉 Nenda /market kuona zaidi!`
            } else {
              reply = `🔍 Sikupata "${term}". Jaribu:\n• Nenda /market\n• Tumia search bar ya app\n• Angalia /flash-deals`
            }
          } else {
            reply = `🔍 Unatafuta nini hasa? Niambie jina la bidhaa!`
          }
          break
        }
        case 'orders': {
          if (!userId) { reply = `📦 Ingia kwanza kuona orders zako.\n👉 Nenda /auth`; break }
          const { data: orders } = await sb.from('orders').select('product_name,status,total_amount').eq('buyer_id',userId).order('created_at',{ascending:false}).limit(5)
          if (orders && orders.length > 0) {
            reply = `📦 **Orders Zako za Hivi Karibuni:**\n\n`
            orders.forEach(o => {
              const e = o.status==='confirmed'?'✅':o.status==='rejected'?'❌':'⏳'
              reply += `${e} ${o.product_name} — ${fmtPrice(o.total_amount)}\n`
            })
            reply += `\n👉 Nenda /orders kuona zote.`
          } else {
            reply = `📦 Huna orders bado.\n🛍️ Anza kununua: /market`
          }
          break
        }
        default:
          reply = `🤔 Ninaweza kukusaidia na:\n• 🛍️ Kutafuta bidhaa\n• ⚡ Flash Deals\n• 📦 Orders zako\n• 🏪 Kufungua duka\n• 🎓 Campus Market\n\nNiulize chochote! 😊`
      }
    }

    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json({ reply: '❌ Tatizo limetokea. Jaribu tena.' }, { status: 500 })
  }
}
