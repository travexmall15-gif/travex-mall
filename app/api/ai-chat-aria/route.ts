import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://bscecjbgnjitlfmgwcic.supabase.co',
  'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'
)

const fmt  = (n: number) => `TZS ${Number(n||0).toLocaleString()}`
const date = (d: string) => new Date(d).toLocaleDateString('sw-TZ',{day:'numeric',month:'short'})

// ── Detect intent from message ────────────────────────────
function intent(msg: string) {
  const m = msg.toLowerCase()
  if (/habari|hujambo|mambo|salaam|hello|hi\b|hey|niaje|sasa|asubuhi|jioni/.test(m)) return 'greet'
  if (/bei|price|gharama|ngapi|shilingi|inachomwa|inauzwa|cost|expensive|cheap|pesa/.test(m)) return 'price'
  if (/una nini|mna nini|bidhaa|product|stock|available|uza|selling|catalogue|orodha|aina/.test(m)) return 'products'
  if (/delivery|lete|peleka|usafirishaji|shipping|lori|gari|tuma|arrive|fika|pokea/.test(m)) return 'delivery'
  if (/nunua|order|agizo|buy|purchase|ninaomba|nataka|niambie|ninahitaji|cart|basket/.test(m)) return 'order'
  if (/message|zungumza|wasiliana|seller|muuzaji|contact|piga simu|whatsapp|chat/.test(m)) return 'contact'
  if (/malipo|lipa|pesa|pay|payment|mpesa|tigo|airtel|halotel|yas|benki|bank|cash/.test(m)) return 'payment'
  if (/return|rudisha|refund|exchange|replace|tatizo|broken|damaged|mbaya/.test(m)) return 'return'
  if (/rating|review|feedback|tathmini|sifa/.test(m)) return 'review'
  if (/flash deal|ofa|sale|punguzo|discount|promo|offer|offer/.test(m)) return 'deals'
  if (/group buy|group|kikundi|waunganike|pamoja|bulk/.test(m)) return 'group'
  if (/campus|chuo|student|wanafunzi|university|chuo kikuu/.test(m)) return 'campus'
  if (/order zangu|agizo langu|nilinunua|ninangoja|status|tracking|liko wapi|imefika/.test(m)) return 'my_orders'
  if (/open shop|fungua duka|niuze|kuuza|seller account|become seller/.test(m)) return 'open_shop'
  if (/vybe|social|post|picha|video|like|discover/.test(m)) return 'vybe'
  if (/help|msaada|jinsi|how to|nifanye nini|navigat|explain|maelezo/.test(m)) return 'help'
  if (/asante|thank|sawa|ok\b|alright|nzuri|perfect|great|vizuri/.test(m)) return 'thanks'
  if (/tafuta|find|search|nataka|looking|need|ninatafuta|nipatie|nipe|bring|show/.test(m)) return 'search'
  // seller dashboard specific
  if (/bidhaa yangu|products zangu|add product|ongeza bidhaa|update|edit|delete|remove/.test(m)) return 'seller_products'
  if (/mauzo|sales|mapato|revenue|income|profit|faida|takwimu|analytics|stats/.test(m)) return 'seller_analytics'
  if (/wateja|customers|buyer|wanunuzi|maoni|reviews/.test(m)) return 'seller_customers'
  if (/marketing|tangazo|advertise|promote|social media|wa group|broadcast/.test(m)) return 'seller_marketing'
  return 'fallback'
}

function extract(msg: string) {
  return msg
    .replace(/nataka|ninatafuta|tafuta|find|search|nilete|nipe|nipatie|niambie|i want|looking for|need|nahitaji|please|tafadhali/gi,'')
    .replace(/[?!.]/g,'').trim()
}

// ── Store customer care ───────────────────────────────────
async function storeMode(msg: string, it: string, storeId: string, shopName: string, shopCategory?: string) {
  switch(it) {
    case 'greet':
      return `👋 Karibu duka la **${shopName}**!\n\nMimi ni 360 AI, msaidizi wako. Ninaweza kukusaidia na:\n\n• 🛍️ Bidhaa na bei\n• 🚛 Delivery na utoaji\n• 💳 Malipo\n• 💬 Maswali yoyote kuhusu duka hili\n\nUnahitaji msaada gani?`

    case 'products': {
      const { data } = await sb.from('products').select('name,price,category,description').eq('shop_id',storeId).eq('is_available',true).limit(8)
      if (data?.length) {
        let r = `🛍️ **Bidhaa za ${shopName}** (${data.length} zinapatikana):\n\n`
        data.forEach((p,i) => { r += `${i+1}. **${p.name}** — ${fmt(p.price)}\n` })
        r += `\nUnataka kujua zaidi kuhusu bidhaa yoyote? Niulize! 😊`
        return r
      }
      return `🛍️ **${shopName}** ina bidhaa za ${shopCategory||'aina mbalimbali'}.\n\n💬 Wasiliana na seller moja kwa moja kwa orodha kamili ya bidhaa na bei za sasa.\n\n👉 Bonyeza **"Message Seller"** juu ya ukurasa huu.`
    }

    case 'price': {
      const { data } = await sb.from('products').select('name,price,original_price').eq('shop_id',storeId).order('price',{ascending:true}).limit(6)
      if (data?.length) {
        let r = `💰 **Bei za ${shopName}:**\n\n`
        data.forEach(p => {
          r += `• ${p.name}: **${fmt(p.price)}**`
          if (p.original_price && p.original_price > p.price) r += ` ~~${fmt(p.original_price)}~~`
          r += '\n'
        })
        r += `\n💬 Piga goti — tuma ujumbe kwa bei maalum au discount!`
        return r
      }
      return `💰 Bei za **${shopName}** zinategemea bidhaa.\n\n💬 Tuma ujumbe kwa seller kwa bei sahihi:\n👉 Bonyeza **"Message Seller"**`
    }

    case 'delivery':
      return `🚛 **Delivery kutoka ${shopName}:**\n\n📍 Delivery inapatikana — bei na muda inategemea eneo lako.\n\n**Jinsi ya kupata delivery:**\n1. Wasiliana na seller\n2. Toa anwani yako\n3. Kubali bei ya delivery\n4. Seller atapanga utoaji\n\n💬 Tuma ujumbe sasa: **"Message Seller"** 👆`

    case 'payment':
      return `💳 **Malipo kwa ${shopName}:**\n\n✅ Njia zinazopokelewa:\n• 📱 M-Pesa\n• 📱 Tigo Pesa / Lipa Namba\n• 📱 Airtel Money (YAS)\n• 📱 Halotel Halopesa\n• 🏦 Benki\n• 💵 Cash on Delivery\n\n🔒 Malipo yote yanashikiliwa salama na ShopNekt hadi upokee bidhaa yako.\n\n💬 Uliza seller kwa maelezo zaidi!`

    case 'return':
      return `🔄 **Kurudisha Bidhaa - ${shopName}:**\n\n📋 Hatua za kurudisha:\n1. Wasiliana na seller ndani ya saa 24\n2. Eleza tatizo na bidhaa\n3. Seller atakuambia jinsi ya kurudisha\n4. ShopNekt itasaidia kama tatizo halikutatuliwa\n\n💬 Anza sasa: **"Message Seller"** 👆`

    case 'contact':
      return `💬 **Kuwasiliana na ${shopName}:**\n\n👆 Bonyeza kitufe cha **"Message Seller"** juu ya ukurasa huu.\n\nAu tuma ujumbe wa moja kwa moja kupitia sehemu ya Messages kwenye app.\n\nSeller atajibu haraka iwezekanavyo! ⚡`

    case 'order':
      return `🛒 **Kununua kutoka ${shopName}:**\n\n**Hatua rahisi:**\n1. 👀 Angalia bidhaa na bei\n2. 💬 Wasiliana na seller kwa "Message Seller"\n3. ✅ Kubali bidhaa na bei\n4. 💳 Fanya malipo kupitia ShopNekt\n5. 📦 Subiri delivery!\n\n🔒 Malipo yako yanalindwa na ShopNekt.\n\nUna maswali? Niulize! 😊`

    case 'thanks':
      return `😊 Karibu sana! Niko hapa ukihitaji msaada wowote.\n\nKaribuni duka la **${shopName}** tena! 🛍️`

    default: {
      const { data } = await sb.from('products').select('name,price').eq('shop_id',storeId).limit(3)
      let r = `🤔 Samahani, sijaelewea vizuri. Naweza kukusaidia na:\n\n`
      r += `• 🛍️ **Bidhaa** — "Mna bidhaa gani?"\n`
      r += `• 💰 **Bei** — "Bei gani?"\n`
      r += `• 🚛 **Delivery** — "Mna delivery?"\n`
      r += `• 💳 **Malipo** — "Naliweza kulipa vipi?"\n`
      r += `• 💬 **Seller** — "Niwasiliane na seller"\n`
      if (data?.length) {
        r += `\n✨ **Bidhaa maarufu:**\n`
        data.forEach(p => { r += `• ${p.name} — ${fmt(p.price)}\n` })
      }
      r += `\nUliza tena kwa lugha yoyote! 😊`
      return r
    }
  }
}

// ── Seller dashboard AI ───────────────────────────────────
async function sellerMode(msg: string, it: string, userId?: string) {
  switch(it) {
    case 'greet':
      return `👋 Habari! Mimi ni **360 AI** — msaidizi wako wa duka.\n\nNinaweza kukusaidia na:\n\n• 📦 Bidhaa na inventory\n• 📊 Mauzo na mapato\n• 📣 Masoko na matangazo\n• 💬 Maswali ya wateja\n• 🚛 Delivery na utoaji\n\nUnajua nini leo?`

    case 'seller_products':
      return `📦 **Bidhaa Zako:**\n\n**Kuongeza bidhaa mpya:**\n1. Dashboard → Products\n2. Bonyeza "+" au "Add Product"\n3. Jaza: Jina, Bei, Picha (2-4 nzuri), Maelezo\n4. Save — inaonekana mara moja!\n\n💡 **Vidokezo vya mauzo bora:**\n• Picha nzuri = +60% views\n• Maelezo ya kina = +40% ununuzi\n• Bei ya ushindani = wateja zaidi\n• Update stock mara kwa mara\n\nUna swali kuhusu bidhaa fulani?`

    case 'seller_analytics':
      return `📊 **Takwimu za Duka Lako:**\n\nAngalia dashboard yako kwa takwimu za wakati halisi:\n\n📈 **Unavyoweza kukua:**\n• Ongeza bidhaa 5+ (shops zenye bidhaa nyingi zinapata wateja 3x zaidi)\n• Jibu messages kwa saa 1 (response rate juu = rank juu)\n• Weka bei ya Flash Deal wiki moja kila mwezi\n• Shiriki katika Group Buy\n\n💰 **Malengo mazuri:**\n• Mauzo 10+ kwa wiki = duka imara\n• Rating 4.5+ = trust ya wateja\n\nUnataka msaada wa kuongeza mauzo?`

    case 'seller_marketing':
      return `📣 **Masoko ya Duka Lako:**\n\n**Bure kabisa:**\n• 📸 Post kwenye Social Vybe mara 2-3 kwa wiki\n• 💬 Jibu reviews za wateja\n• 🏷️ Tumia Flash Deals (wateja 4x zaidi)\n• 👥 Jiunge na Group Buy deals\n\n**Vidokezo vya post nzuri:**\n• Picha ya bidhaa + bei wazi\n• Hashtags: #ShopNekt #Tanzania\n• Caption ya kuvutia na emoji\n• Post asubuhi 7-9am au jioni 6-8pm\n\n**WhatsApp Marketing:**\nTumia broadcast kwenye dashboard kutuma offers kwa wateja wako wa zamani!\n\nUnahitaji msaada wa maandishi ya tangazo?`

    case 'seller_customers':
      return `👥 **Wateja Wako:**\n\n**Jinsi ya kuwavutia wateja zaidi:**\n• Jibu messages haraka (saa 1 au chini)\n• Toa offer maalum kwa wateja wa kwanza\n• Omba review baada ya delivery\n• Tuma thank you message\n\n**Tatizo na mteja?**\n• Sikiliza tatizo kwanza\n• Toa suluhisho haraka\n• Rudisha pesa kama bidhaa si nzuri\n• Wateja waridhika = reviews nzuri\n\nUna tatizo maalum na mteja? Niambie!\n`

    case 'delivery':
      return `🚛 **Delivery kwa Sellers:**\n\n**ShopNekt Move** — bora zaidi:\n• Nenda /move kujua bei\n• Tracking ya wakati halisi\n• Salama na ya kuaminika\n\n**Unaweza pia:**\n• Tumia bodaboda wa eneo lako\n• Toa delivery mwenyewe (eneo la karibu)\n• Partner na delivery service ya karibu\n\n💡 **Tip:** Delivery ya bure kwa orders 50,000+ inaongeza mauzo!`

    case 'price':
      return `💰 **Kuweka Bei Nzuri:**\n\n**Formula rahisi:**\n> Bei = Gharama × 1.3 hadi 2.0\n\n**Mifano:**\n• Unanunua TZS 10,000 → Uza TZS 13,000-20,000\n• Unanunua TZS 50,000 → Uza TZS 65,000-80,000\n\n**Angalia competition:**\n• Tafuta bidhaa kama yako kwenye Market\n• Weka bei sawa au nafuu kidogo\n• Ubora wa huduma = bei juu inawezekana\n\n**Flash Deals:**\n• Punguza 20-30% kwa muda mfupi\n• Wateja wengi wanakuja → mauzo zaidi\n\nUna bidhaa gani unataka bei yake?`

    case 'payment':
      return `💳 **Malipo kwa Sellers:**\n\n**Mfumo wa ShopNekt Escrow:**\n• Mteja analipa → pesa inashikiliwa\n• Bidhaa inatumwa → mteja anapokea\n• Mteja anahakikisha → pesa inakuja kwako\n\n**Muda wa kupata pesa:**\n• Baada ya mteja kuthibitisha delivery\n• Kawaida saa 24-48 baada ya delivery\n\n**Njia za kupokea:**\n• M-Pesa, Tigo Pesa, Airtel, Halotel\n• Benki transfer\n\nUna swali kuhusu malipo fulani?`

    case 'thanks':
      return `😊 Karibu sana! Niko hapa kukusaidia ukihitaji chochote.\n\nBiashara njema! 💪🛍️`

    default:
      return `🤔 Sijaelewa vizuri. Naweza kukusaidia na:\n\n• 📦 Bidhaa — "Niongeze bidhaa vipi?"\n• 📊 Mauzo — "Jinsi ya kuongeza mauzo"\n• 📣 Masoko — "Ninavyoweza kutangaza?"\n• 💰 Bei — "Niweke bei gani?"\n• 🚛 Delivery — "Delivery inafanyaje?"\n• 👥 Wateja — "Jinsi ya kuwafurahisha wateja"\n\nUliza swali lako kwa Kiswahili au Kiingereza! 😊`
  }
}

// ── General menu AI ───────────────────────────────────────
async function generalMode(msg: string, it: string, userId?: string) {
  switch(it) {
    case 'greet':
      const greets = [
        `👋 Habari! Mimi ni **360 AI** — msaidizi wako wa ShopNekt.\n\nNinaweza kukusaidia:\n• 🔍 Kutafuta bidhaa\n• ⚡ Flash Deals za sasa\n• 📦 Kuangalia orders\n• 🏪 Kufungua duka\n• ❓ Maswali yoyote\n\nUnahitaji nini?`,
        `✨ Karibu ShopNekt! Mimi ni **360 AI**.\n\nSaidia yangu:\n• 🛍️ Bidhaa na maduka\n• ⚡ Deals za leo\n• 📦 Orders na delivery\n• 🎓 Campus Market\n\nNiulize chochote! 😊`
      ]
      return greets[Math.floor(Math.random() * greets.length)]

    case 'search': {
      const term = extract(msg)
      if (!term || term.length < 2) return `🔍 Unatafuta nini hasa? Niambie jina la bidhaa au aina!\n\nMfano: "nataka viatu vya ngozi" au "ninatafuta simu ya Samsung"`
      const [{ data: products }, { data: shops }] = await Promise.all([
        sb.from('products').select('name,price,store_name').ilike('name',`%${term}%`).limit(5),
        sb.from('shops').select('shop_name,shop_category,shop_city').or(`shop_name.ilike.%${term}%,shop_category.ilike.%${term}%`).limit(4),
      ])
      let r = `🔍 **Matokeo ya "${term}":**\n\n`
      if (products?.length) {
        r += `📦 **Bidhaa:**\n`
        products.forEach(p => { r += `• ${p.name} — ${fmt(p.price)} (${p.store_name})\n` })
        r += '\n'
      }
      if (shops?.length) {
        r += `🏪 **Maduka:**\n`
        shops.forEach(s => { r += `• ${s.shop_name} — ${s.shop_category} (${s.shop_city||'Online'})\n` })
        r += '\n'
      }
      if (!products?.length && !shops?.length) return `🔍 Sikupata "${term}" sasa.\n\n💡 Jaribu:\n• Nenda **Business Market** (/market)\n• Angalia **Flash Deals** (/flash-deals)\n• Tumia search bar ya app\n\nAu niambie aina ya bidhaa kwa ujumla!`
      r += `👉 Tembelea /market kwa matokeo yote!`
      return r
    }

    case 'deals': {
      const { data } = await sb.from('flash_deals').select('product_name,original_price,discounted_price,discount_pct,ends_at').eq('is_active',true).order('discount_pct',{ascending:false}).limit(5)
      if (data?.length) {
        let r = `⚡ **Flash Deals za Sasa (${data.length}):**\n\n`
        data.forEach((d,i) => {
          const hrs = Math.max(0, Math.floor((new Date(d.ends_at).getTime()-Date.now())/3600000))
          r += `${i+1}. **${d.product_name}**\n   ${fmt(d.original_price)} → **${fmt(d.discounted_price)}** (-${d.discount_pct}%)\n   ⏰ Inaisha saa ${hrs}\n\n`
        })
        r += `👉 Nenda /flash-deals kununua sasa!`
        return r
      }
      return `⚡ Hakuna flash deals sasa hivi.\n\n💡 Tembelea /flash-deals mara kwa mara — deals mpya zinatokea kila wakati!\n\n🔔 Washa "Flash Deal Alerts" kwenye Settings ukitaka notification.`
    }

    case 'group': {
      const { data } = await sb.from('group_buys').select('product_name,target_members,current_members,discount_pct,ends_at').eq('status','active').limit(4)
      if (data?.length) {
        let r = `👥 **Group Buy Zinazoendela:**\n\n`
        data.forEach((g,i) => {
          const pct = Math.round((g.current_members/g.target_members)*100)
          r += `${i+1}. **${g.product_name}**\n   👤 ${g.current_members}/${g.target_members} watu (${pct}%)\n   🏷️ Discount: ${g.discount_pct}%\n\n`
        })
        r += `👉 Nenda /group-buy kujiunga!`
        return r
      }
      return `👥 **Group Buy — Inafanyaje?**\n\nWatu wengi wanaunganika kununua bidhaa moja pamoja. Mkifikia idadi ya watu, kila mmoja anapata discount kubwa!\n\n✅ Faida: Bei nafuu\n✅ Salama: Pesa inalindwa\n\n👉 Angalia /group-buy!`
    }

    case 'my_orders': {
      if (!userId) return `📦 Ili kuona orders zako, tafadhali ingia kwanza.\n\n👉 Nenda /auth kuingia`
      const { data } = await sb.from('orders').select('product_name,status,total_amount,created_at').eq('buyer_id',userId).order('created_at',{ascending:false}).limit(5)
      if (data?.length) {
        const e = (s: string) => s==='confirmed'?'✅':s==='rejected'?'❌':'⏳'
        let r = `📦 **Orders Zako za Hivi Karibuni:**\n\n`
        data.forEach(o => { r += `${e(o.status)} **${o.product_name}**\n   ${fmt(o.total_amount)} · ${date(o.created_at)} · ${o.status}\n\n` })
        const pend = data.filter(o=>o.status==='rejected').length
        if (pend) r += `⚠️ ${pend} order imekataliwa — nenda /orders kufanya malipo.`
        r += `\n👉 Nenda /orders kwa historia yote.`
        return r
      }
      return `📦 Huna orders bado.\n\n🛍️ Anza kununua:\n• Business Market → /market\n• Flash Deals → /flash-deals\n• Group Buy → /group-buy`
    }

    case 'open_shop':
      return `🏪 **Kufungua Duka kwenye ShopNekt:**\n\n**Hatua 4 rahisi:**\n1. Nenda /open-store\n2. Jaza fomu (jina, kategoria, maelezo)\n3. Weka picha ya bidhaa za kwanza\n4. Subiri idhini (dakika 30-60)\n\n✅ **Kisha utapata:**\n• Dashboard ya kudhibiti duka\n• Password ya kuingia\n• Link ya duka lako\n\n💰 **Bei:**\n• Basic: Bure!\n• Premium: TZS 15,000/mwezi\n\n👉 Anza sasa: /open-store`

    case 'campus':
      return `🎓 **Campus Market — Soko la Wanafunzi:**\n\nWanafunzi wanauza kwa wanafunzi wenzao!\n\n**Faida:**\n• 🏫 Bidhaa za chuo — vitabu, notes, accessories\n• 💰 Bei nafuu kuliko market\n• 🤝 Trust — seller ni mwanafunzi mwenzako\n\n**Vyuo vilivyopo:** UDSM, Ardhi, MUHAS, TIA na vingine\n\n👉 Angalia /campus\n👉 Unataka kuuza? /campus-apply`

    case 'vybe':
      return `✨ **Social Vybe — Social Commerce:**\n\nGundua bidhaa kupitia picha na videos!\n\n• ❤️ Like posts unaozipenda\n• 🛍️ Nunua moja kwa moja kutoka post\n• 🏪 Tembelea duka la seller\n• 🔥 Gundua trending products\n\n👉 Nenda /vybe sasa!`

    case 'payment':
      return `💳 **Malipo kwenye ShopNekt:**\n\n📱 **Mobile Money:**\n• M-Pesa (Vodacom)\n• Tigo Pesa / Lipa Namba\n• Airtel Money / YAS\n• Halotel Halopesa\n\n🏦 **Benki:** Bank Transfer\n💵 **Nyingine:** Cash on Delivery\n\n🔒 **Mfumo wa Escrow:**\nPesa yako inashikiliwa salama hadi upokee bidhaa — kisha inaenda kwa seller.`

    case 'help':
      return `ℹ️ **Mwongozo wa ShopNekt:**\n\n🏠 /home — Ukurasa mkuu\n🏪 /market — Business Market\n🎓 /campus — Campus Market\n✨ /vybe — Social Vybe\n⚡ /flash-deals — Flash Deals\n👥 /group-buy — Group Buy\n📦 /orders — Orders zangu\n💬 /messages — Inbox\n🏪 /open-store — Fungua duka\n⚙️ /settings — Mipangilio\n✨ /ai — 360 AI (mimi!)\n\nNiulize chochote! 😊`

    case 'thanks':
      return `😊 Karibu sana!\n\nNiko hapa ukihitaji msaada wowote — saa yoyote!\n\nBiashara njema na ununuzi mzuri! 🛍️✨`

    default: {
      // Try to search for anything mentioned
      const term = extract(msg)
      if (term.length > 2) {
        const { data } = await sb.from('shops').select('shop_name,shop_category').ilike('shop_name',`%${term}%`).limit(3)
        if (data?.length) {
          let r = `🤔 Sijaelewa vizuri, lakini nimepata hivi:\n\n🏪 **Maduka yanayohusiana:**\n`
          data.forEach(s => { r += `• ${s.shop_name} — ${s.shop_category}\n` })
          r += `\n👉 /market kwa matokeo yote!\n\nAu niulize tena kwa uwazi zaidi? 😊`
          return r
        }
      }
      return `🤔 Samahani, sijaelewa vizuri.\n\nNinaweza kukusaidia na:\n• 🔍 Kutafuta bidhaa\n• ⚡ Flash Deals\n• 📦 Orders zangu\n• 🏪 Kufungua duka\n• 🎓 Campus Market\n• 💬 Kuwasiliana na seller\n\nUliza tena kwa uwazi zaidi! 😊`
    }
  }
}

// ── Main handler ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, userId, storeId, shopName, shopCategory, mode } = body
    if (!message?.trim()) return NextResponse.json({ reply: '❓ Tuma ujumbe wako.' })

    const it = intent(message)
    let reply: string

    if (mode === 'store' && storeId) {
      reply = await storeMode(message, it, storeId, shopName || 'Duka', shopCategory)
    } else if (mode === 'seller') {
      reply = await sellerMode(message, it, userId)
    } else {
      reply = await generalMode(message, it, userId)
    }

    return NextResponse.json({ reply })
  } catch (e) {
    console.error('360 AI error:', e)
    return NextResponse.json({ reply: '❌ Tatizo limetokea. Tafadhali jaribu tena baadaye.' }, { status: 500 })
  }
}
