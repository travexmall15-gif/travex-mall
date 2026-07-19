import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://bscecjbgnjitlfmgwcic.supabase.co',
  'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'
)

// ── Intent detection ──────────────────────────────────────
function detectIntent(msg: string) {
  const m = msg.toLowerCase()

  if (/habari|hujambo|mambo|hello|hi\b|hey|sasa|niaje/.test(m))
    return 'greeting'

  if (/\b(flash deal|ofa|punguzo|discount|deal|bei poa|bei nafuu|cheap|sale)\b/.test(m))
    return 'flash_deals'

  if (/\b(group buy|group|kikundi|pamoja|watu|waunganike|unganika)\b/.test(m))
    return 'group_buy'

  if (/\b(order|agizo|niliamua|nilinunua|nilinunuwa|mnunuzi|nunua|status|liko wapi|iko wapi|tracking|track)\b/.test(m))
    return 'orders'

  if (/\b(fungua duka|open shop|niuze|kuuza|seller|muuzaji|duka|shop yangu|register.*shop|open.*store)\b/.test(m))
    return 'open_shop'

  if (/\b(campus|chuo|student|wanafunzi|university|chuo kikuu)\b/.test(m))
    return 'campus'

  if (/\b(message|ujumbe|seller|mauzo|chat|zungumza|tuma ujumbe)\b/.test(m))
    return 'messaging'

  if (/\b(vybe|social|post|picha|video|like|kupost)\b/.test(m))
    return 'vybe'

  if (/\b(move|delivery|courier|usafirishaji|peleka|pakia|lori|gari)\b/.test(m))
    return 'move'

  if (/\b(malipo|lipa|pesa|payment|wallet|mpesa|tigo|airtel|halotel|yas|benki|bank)\b/.test(m))
    return 'payment_info'

  if (/\b(settings|mipangilio|akaunti|account|profile|wasifu|password|nywila)\b/.test(m))
    return 'settings'

  if (/\b(help|msaada|jinsi|how|nini|what|explain|maelezo|fanya|tutorials?)\b/.test(m))
    return 'help'

  if (/\b(market|biashara|business market|duka|shops|stores|store)\b/.test(m))
    return 'market'

  // Search product
  if (/\b(nataka|ninatafuta|pata|find|search|tafuta|nilete|nipe|nipatie|looking|want|buy|nunua|need|nahitaji)\b/.test(m))
    return 'search_product'

  return 'general'
}

// ── Extract search term ───────────────────────────────────
function extractSearch(msg: string): string {
  return msg
    .replace(/nataka|ninatafuta|pata|find|search|tafuta|nilete|nipe|nipatie|looking for|i want|buy|nunua|need|nahitaji|please|tafadhali|sasa|mimi|mpe|me/gi, '')
    .replace(/\?|!|\./g, '')
    .trim()
}

// ── Format helpers ────────────────────────────────────────
function formatPrice(n: number) {
  return `TZS ${n?.toLocaleString() || '—'}`
}

// ── Main handler ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json()
    const intent = detectIntent(message)
    let reply = ''

    switch (intent) {

      // ── GREETING ───────────────────────────────────────
      case 'greeting': {
        const greets = [
          '👋 Habari! Mimi ni ARIA, msaidizi wako wa ShopNekt. Unaweza kuniuliza kuhusu bidhaa, order zako, deals, au chochote kuhusu ShopNekt!',
          '🛍️ Karibu ShopNekt! Mimi ni ARIA. Ninaweza kukusaidia kupata bidhaa, kuangalia order, au kuelezea jinsi ShopNekt inavyofanya kazi. Unahitaji nini?',
          '✨ Habari! Nina furaha kukusaidia leo. Je, unatafuta bidhaa, kuangalia deal, au kuna swali kuhusu ShopNekt?',
        ]
        reply = greets[Math.floor(Math.random() * greets.length)]
        break
      }

      // ── SEARCH PRODUCT ─────────────────────────────────
      case 'search_product': {
        const term = extractSearch(message)
        if (!term || term.length < 2) {
          reply = '🔍 Unatafuta nini hasa? Niambie jina la bidhaa au aina unayotaka. Mfano: "nataka viatu vya ngozi" au "ninatafuta simu ya Samsung".'
          break
        }

        const { data: shops } = await sb
          .from('shops')
          .select('shop_name, shop_category, shop_city, id')
          .or(`shop_name.ilike.%${term}%,shop_category.ilike.%${term}%,shop_description.ilike.%${term}%`)
          .limit(5)

        const { data: products } = await sb
          .from('products')
          .select('name, price, store_name, id')
          .ilike('name', `%${term}%`)
          .limit(5)

        if ((products && products.length > 0) || (shops && shops.length > 0)) {
          reply = `🛍️ Nimeona matokeo ya "${term}":\n\n`
          if (products && products.length > 0) {
            reply += `📦 **Bidhaa:**\n`
            products.forEach(p => {
              reply += `• ${p.name} — ${formatPrice(p.price)} (${p.store_name})\n`
            })
          }
          if (shops && shops.length > 0) {
            reply += `\n🏪 **Maduka:**\n`
            shops.forEach(s => {
              reply += `• ${s.shop_name} — ${s.shop_category} (${s.shop_city || 'Online'})\n`
            })
          }
          reply += `\n👉 Nenda Business Market au tumia search ya app kupata zaidi.`
        } else {
          reply = `🔍 Sikupata bidhaa ya "${term}" moja kwa moja. Jaribu:\n• Tembelea Business Market\n• Angalia Flash Deals\n• Tumia search bar juu ya app\n\nAu niambie aina ya bidhaa kwa ujumla (mfano: "nguo", "simu", "chakula")`
        }
        break
      }

      // ── FLASH DEALS ────────────────────────────────────
      case 'flash_deals': {
        const { data: deals } = await sb
          .from('flash_deals')
          .select('product_name, original_price, discounted_price, discount_pct, ends_at')
          .eq('is_active', true)
          .order('discount_pct', { ascending: false })
          .limit(5)

        if (deals && deals.length > 0) {
          reply = `⚡ **Flash Deals za Sasa** (Bei Poa!):\n\n`
          deals.forEach((d, i) => {
            const ends = new Date(d.ends_at)
            const diff = Math.max(0, Math.floor((ends.getTime() - Date.now()) / 3600000))
            reply += `${i+1}. ${d.product_name}\n   ~~${formatPrice(d.original_price)}~~ → **${formatPrice(d.discounted_price)}** (-${d.discount_pct}%)\n   ⏰ Inaisha baada ya saa ~${diff}\n\n`
          })
          reply += `👉 Nenda /flash-deals kuona zote!`
        } else {
          reply = `⚡ Hakuna flash deals zinazoendelea sasa hivi. Tembelea /flash-deals mara kwa mara — deals mpya zinatokea kila wakati!\n\n💡 Washa "Flash Deal Alerts" kwenye Shopping Preferences ukitaka kupata notification.`
        }
        break
      }

      // ── GROUP BUY ──────────────────────────────────────
      case 'group_buy': {
        const { data: groups } = await sb
          .from('group_buys')
          .select('product_name, target_members, current_members, discount_pct, ends_at')
          .eq('status', 'active')
          .order('current_members', { ascending: false })
          .limit(5)

        if (groups && groups.length > 0) {
          reply = `👥 **Group Buy Zinazoendela:**\n\n`
          groups.forEach((g, i) => {
            const pct = Math.round((g.current_members / g.target_members) * 100)
            reply += `${i+1}. ${g.product_name}\n   👤 ${g.current_members}/${g.target_members} watu (${pct}%)\n   🏷️ Discount: ${g.discount_pct}% ukifikia lengo\n\n`
          })
          reply += `👉 Nenda /group-buy kujiunga!`
        } else {
          reply = `👥 **Group Buy inafanyaje kazi?**\n\nWatu wengi wanaunganika kununua bidhaa moja pamoja. Mkifikia idadi ya watu walihitajika, kila mmoja anapata discount kubwa!\n\n✅ Faida: Bei nafuu zaidi\n✅ Salama: Pesa inalindwa\n\n👉 Angalia /group-buy kwa group zinazoendelea.`
        }
        break
      }

      // ── ORDERS ─────────────────────────────────────────
      case 'orders': {
        if (!userId) {
          reply = `📦 Ili kuona order zako, tafadhali ingia kwanza.\n\n👉 Nenda /auth kuingia, kisha /orders kuona history yako.`
          break
        }
        const { data: orders } = await sb
          .from('orders')
          .select('product_name, status, total_amount, created_at')
          .eq('buyer_id', userId)
          .order('created_at', { ascending: false })
          .limit(5)

        if (orders && orders.length > 0) {
          const pending   = orders.filter(o => o.status === 'pending').length
          const confirmed = orders.filter(o => o.status === 'confirmed').length
          const rejected  = orders.filter(o => o.status === 'rejected').length

          reply = `📦 **Order zako za Hivi Karibuni:**\n\n`
          orders.forEach(o => {
            const emoji = o.status==='confirmed'?'✅':o.status==='rejected'?'❌':'⏳'
            reply += `${emoji} ${o.product_name} — ${formatPrice(o.total_amount)}\n   Status: ${o.status}\n\n`
          })
          reply += `📊 Jumla: Pending(${pending}) Confirmed(${confirmed}) Rejected(${rejected})\n\n👉 Nenda /orders kuona zote na kufanya malipo.`
        } else {
          reply = `📦 Hujafanya order yoyote bado.\n\n🛍️ Anza kununua:\n• Business Market → /market\n• Flash Deals → /flash-deals\n• Group Buy → /group-buy`
        }
        break
      }

      // ── OPEN SHOP ──────────────────────────────────────
      case 'open_shop': {
        reply = `🏪 **Jinsi ya Kufungua Duka ShopNekt:**\n\n1️⃣ Nenda /open-store\n2️⃣ Jaza fomu ya duka lako\n3️⃣ Weka jina, maelezo na picha\n4️⃣ Chagua kategoria\n5️⃣ Subiri idhini (mara nyingi dakika 30-60)\n\n✅ Faida za kuuza ShopNekt:\n• Wateja wengi duniani\n• AI tools za masoko\n• Dashboard kamili\n• Usalama wa malipo\n\n👉 Anza sasa: nenda /open-store!`
        break
      }

      // ── CAMPUS ─────────────────────────────────────────
      case 'campus': {
        const { data: unis } = await sb
          .from('campus_universities')
          .select('name, abbr, campus_count')
          .limit(8)

        reply = `🎓 **Campus Market — Soko la Wanafunzi:**\n\nWanafunzi wanaweza kuuza bidhaa kwa wanafunzi wenzao!\n\n`
        if (unis && unis.length > 0) {
          reply += `🏫 **Vyuo vilivyopo:**\n`
          unis.forEach(u => { reply += `• ${u.name} (${u.abbr})\n` })
          reply += `\n`
        }
        reply += `📝 Unataka kuuza chuo chako?\n👉 Nenda /campus-apply kuomba slot!\n\n👀 Tazama maduka ya wanafunzi:\n👉 Nenda /campus`
        break
      }

      // ── MESSAGING ──────────────────────────────────────
      case 'messaging': {
        reply = `💬 **Jinsi ya Kuwasiliana na Seller:**\n\n1. Tembelea duka la seller\n2. Bonyeza "Message Seller"\n3. Andika ujumbe wako\n4. Subiri jibu!\n\n📱 Inbox yako yote ipo /messages\n\nMessaging inafanya kazi real-time — unapata ujumbe mara moja! ✅`
        break
      }

      // ── VYBE ───────────────────────────────────────────
      case 'vybe': {
        const { data: posts } = await sb
          .from('feed_posts')
          .select('caption, store_name, likes, created_at')
          .order('likes', { ascending: false })
          .limit(3)

        reply = `✨ **Social Vybe — Social Commerce:**\n\nSeller wanapost picha na video za bidhaa zao. Unaweza:\n• ❤️ Like posts unazozipenda\n• 🛍️ Nunua moja kwa moja kutoka post\n• 🏪 Tembelea duka la seller\n\n`
        if (posts && posts.length > 0) {
          reply += `🔥 **Popular Posts Sasa:**\n`
          posts.forEach(p => { reply += `• "${p.caption?.slice(0,40) || 'Post'}..." — ${p.store_name} (❤️ ${p.likes || 0})\n` })
        }
        reply += `\n👉 Nenda /vybe kuona zaidi!`
        break
      }

      // ── PAYMENT INFO ───────────────────────────────────
      case 'payment_info': {
        reply = `💳 **Njia za Malipo ShopNekt:**\n\n📱 Mobile Money:\n• M-Pesa (Vodacom)\n• Tigo Pesa / Lipa Namba\n• Airtel Money / YAS\n• Halotel Halopesa\n\n🏦 Benki:\n• Bank Transfer\n\n🔒 **Mfumo wa Escrow (Salama):**\nPesa yako inashikiliwa na ShopNekt hadi upokee mzigo, kisha inaenda kwa seller.\n\n⚠️ Mimi siwezi kufanya malipo — nenda /orders kufanya malipo ya order yako.`
        break
      }

      // ── SETTINGS ───────────────────────────────────────
      case 'settings': {
        reply = `⚙️ **Settings za ShopNekt:**\n\n👤 Profile → /settings/profile\n🔒 Security → /settings/security\n🔔 Notifications → /settings/notifications\n🛒 Shopping Prefs → /settings/shopping\n❓ Help → /settings/about\n\n👉 Nenda /settings kuona zote.`
        break
      }

      // ── MARKET ─────────────────────────────────────────
      case 'market': {
        const { data: shops } = await sb
          .from('shops')
          .select('shop_name, shop_category, shop_city, rating')
          .eq('is_verified', true)
          .order('rating', { ascending: false })
          .limit(5)

        reply = `🏪 **Business Market — Maduka ya Verified:**\n\n`
        if (shops && shops.length > 0) {
          shops.forEach(s => {
            reply += `• ${s.shop_name} — ${s.shop_category} (${s.shop_city || 'Online'}) ⭐ ${s.rating || 'Mpya'}\n`
          })
          reply += `\n`
        }
        reply += `👉 Tembelea /market kuona maduka yote ya verified sellers!`
        break
      }

      // ── MOVE ───────────────────────────────────────────
      case 'move': {
        reply = `🚛 **ShopNekt Move — Delivery Service:**\n\nShopNekt Move inasaidia kusafirisha mizigo kwa haraka na usalama.\n\n✅ Huduma:\n• Delivery ndani ya mji\n• Ufuatiliaji wa wakati halisi\n• Bei nafuu\n• Salama\n\n👉 Nenda /move kuona bei na kuweka booking.`
        break
      }

      // ── HELP ───────────────────────────────────────────
      case 'help': {
        reply = `ℹ️ **ShopNekt — Mwongozo wa Haraka:**\n\n🏠 /home — Ukurasa mkuu\n🏪 /market — Business Market\n🎓 /campus — Campus Market\n💬 /vybe — Social Vybe\n⚡ /flash-deals — Flash Deals\n👥 /group-buy — Group Buy\n📦 /orders — Order zangu\n💬 /messages — Inbox\n⚙️ /settings — Mipangilio\n✨ /ai — Mimi (ARIA)!\n\nNiulize chochote — niko hapa kukusaidia! 😊`
        break
      }

      // ── GENERAL ────────────────────────────────────────
      default: {
        reply = `🤔 Sijaelewa vizuri. Unaweza kuuliza kuhusu:\n\n• 🛍️ Kutafuta bidhaa\n• ⚡ Flash Deals\n• 👥 Group Buy\n• 📦 Order zako\n• 🏪 Kufungua duka\n• 🎓 Campus Market\n• 💬 Kuwasiliana na seller\n• ⚙️ Settings\n\nNiambie unavyotaka kufanya! 😊`
        break
      }
    }

    return NextResponse.json({ reply })

  } catch (e) {
    return NextResponse.json({
      reply: '❌ Tatizo limetokea. Tafadhali jaribu tena baadaye.'
    }, { status: 500 })
  }
}
