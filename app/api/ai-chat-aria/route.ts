import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase, isActiveSeller } from '@/lib/security/server-supabase'
import { readSellerSession } from '@/lib/security/signed-session'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'
import { hasSameOrigin } from '@/lib/security/http'

const P = (n: number) => `TZS ${Number(n||0).toLocaleString()}`
const D = (d: string) => new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'2-digit'})

//  Detect language 
function lang(msg: string): 'sw'|'en' {
  const sw = /habari|hujambo|mambo|niaje|sawa|asante|tafadhali|nataka|ninataka|niambie|nini|gani|vipi|jinsi|zaidi|bidhaa|duka|nunua|lipa|peleka|nilete|nipe|pia|lakini|kwamba|kwa|na |ya |wa |za |la |ni |au |je |si |ha |ta |ka /i
  const swWords = msg.split(' ').filter(w => sw.test(w)).length
  return swWords >= 2 ? 'sw' : 'en'
}

//  Score message against intent patterns 
function score(msg: string, patterns: RegExp[]): number {
  const m = msg.toLowerCase()
  return patterns.filter(p => p.test(m)).length
}

//  Detect intent using scoring 
function getIntent(msg: string) {
  const m = msg.toLowerCase()
  const INTENTS: Record<string, RegExp[]> = {
    greet:    [/\bhab\w*\b/,/\bhujambo\b/,/\bmambo\b/,/\bhello\b/,/\bhi\b/,/\bhey\b/,/\bgood\b/,/\bniaje\b/,/\bwelcome\b/,/\bsalaam\b/,/\basubuhi\b/,/\bjioni\b/,/\busiku\b/,/\bsawa\b/,/\bkaribo\b/],
    price:    [/\bbei\b/,/\bprice\b/,/\bgharama\b/,/\bngapi\b/,/\bshilingi\b/,/\bcost\b/,/\bhow much\b/,/\bexpensive\b/,/\bcheap\b/,/\baffordable\b/,/\bpay\b/,/\blipa\b/,/\bkinachouzwa\b/,/\binauzwa\b/,/\binagharimu\b/,/\bworth\b/],
    products: [/\bbiadh\w*\b/,/\bproduct\b/,/\bstock\b/,/\bavailable\b/,/\buna nini\b/,/\bmna nini\b/,/\bselling\b/,/\bitem\b/,/\bgoods\b/,/\bcatalogue\b/,/\borodha\b/,/\bkitu\b/,/\bwhat do you sell\b/,/\bwhat.*have\b/,/\bshow me\b/,/\bniona\b/,/\bnionyeshe\b/],
    delivery: [/\bdelivery\b/,/\blete\b/,/\bpeleka\b/,/\busafirish\w*\b/,/\bshipping\b/,/\bsend\b/,/\btuma\b/,/\barrive\b/,/\bfika\b/,/\bpokea\b/,/\bwhen.*come\b/,/\blini.*fika\b/,/\bmuda.*gani\b/,/\bdeliver\b/,/\bcourier\b/],
    order:    [/\bnunua\b/,/\bbuy\b/,/\border\b/,/\bagizo\b/,/\bpurchase\b/,/\bninahitaji\b/,/\bi want\b/,/\bi need\b/,/\bnaomba\b/,/\bniambie\b/,/\badd to cart\b/,/\bninataka\b/,/\bget\b/,/\bnilete\b/],
    contact:  [/\bmessage\b/,/\bwasiliana\b/,/\bcontact\b/,/\bseller\b/,/\bmuuzaji\b/,/\bzungumza\b/,/\bwhatsapp\b/,/\bchat\b/,/\bsimu\b/,/\bcall\b/,/\bpiga\b/,/\bmmiliki\b/,/\bowner\b/,/\bteam\b/,/\bsupport\b/],
    payment:  [/\bmalipo\b/,/\blipa\b/,/\bpay\b/,/\bpayment\b/,/\bmpesa\b/,/\btigo\b/,/\bairtel\b/,/\bhalotel\b/,/\byas\b/,/\bbenki\b/,/\bbank\b/,/\bcash\b/,/\blipa namba\b/,/\bwallet\b/,/\bescrow\b/,/\btransfer\b/],
    return:   [/\brudisha\b/,/\breturn\b/,/\brefund\b/,/\bexchange\b/,/\breplace\b/,/\btatizo\b/,/\bbroken\b/,/\bdamaged\b/,/\bmbaya\b/,/\bimevunjika\b/,/\bnot working\b/,/\bwrong\b/,/\bfault\b/,/\bcomplaint\b/],
    review:   [/\brating\b/,/\breview\b/,/\bfeedback\b/,/\btathmini\b/,/\bopinion\b/,/\bsifa\b/,/\bmaoni\b/,/\btrust\b/,/\blegit\b/,/\breal\b/,/\bgood seller\b/],
    deals:    [/\bflash deal\b/,/\bflash\b/,/\bdeal\b/,/\bsale\b/,/\bpunguzo\b/,/\bdiscount\b/,/\bpromo\b/,/\boffer\b/,/\bofa\b/,/\bcoupon\b/,/\bsave\b/,/\bcheap\b/,/\bprice drop\b/,/\bbargain\b/],
    group:    [/\bgroup buy\b/,/\bgroup\b/,/\bkikundi\b/,/\bwaunganike\b/,/\bpamoja\b/,/\bbulk\b/,/\btogether\b/,/\bjoin\b/,/\bjiunge\b/,/\bcollective\b/],
    my_orders:[/\border zangu\b/,/\bmy order\b/,/\bnilinunua\b/,/\bi ordered\b/,/\bninavyosubiri\b/,/\btracking\b/,/\bstatus\b/,/\bliko wapi\b/,/\bimefika\b/,/\bimewasili\b/,/\border history\b/,/\bprevious order\b/],
    open_shop:[/\bopen shop\b/,/\bfungua duka\b/,/\bsell on\b/,/\bbecome seller\b/,/\bniuze\b/,/\bkuuza\b/,/\bseller account\b/,/\bregister.*shop\b/,/\bstart.*sell\b/,/\bjoin.*seller\b/],
    campus:   [/\bcampus\b/,/\bchuo\b/,/\bstudent\b/,/\bwanafunzi\b/,/\buniversity\b/,/\bchuo kikuu\b/,/\budsm\b/,/\bmuhas\b/,/\bardhi\b/,/\btia\b/,/\bcollege\b/],
    vybe:     [/\bvybe\b/,/\bsocial\b/,/\bpost\b/,/\bfeed\b/,/\blike\b/,/\bgundua\b/,/\bdiscover\b/,/\bvideo\b/,/\bpicha\b/,/\bphoto\b/],
    move:     [/\bmove\b/,/\blogistics\b/,/\btransport\b/,/\btruk\b/,/\blori\b/,/\bpickup\b/,/\bcargo\b/],
    help:     [/\bhelp\b/,/\bmsaada\b/,/\bhow\b/,/\bjinsi\b/,/\bguide\b/,/\btutorial\b/,/\bexplain\b/,/\bmaelezo\b/,/\bwhat is\b/,/\bnini ni\b/,/\bfaq\b/,/\bmanual\b/],
    thanks:   [/\basante\b/,/\bthank\b/,/\bshukrani\b/,/\bperfect\b/,/\bnzuri\b/,/\bgreat\b/,/\bawesome\b/,/\bexcellent\b/,/\bgood\b/,/\bsawa\b/,/\bokay\b/,/\balright\b/,/\bcool\b/],
    seller_products: [/\bbidhaa zangu\b/,/\bmy product\b/,/\badd product\b/,/\bongeza bidhaa\b/,/\bupdate.*product\b/,/\bedit.*product\b/,/\bdelete.*product\b/,/\binventory\b/,/\bstock.*zangu\b/],
    seller_analytics:[/\bmauzo\b/,/\bsales\b/,/\bmapato\b/,/\brevenue\b/,/\bprofit\b/,/\bfaida\b/,/\btakwimu\b/,/\banalytics\b/,/\bstats\b/,/\bdata\b/,/\bperformance\b/,/\bgrowth\b/,/\bincome\b/],
    seller_marketing:[/\bmarketing\b/,/\btangazo\b/,/\badvertise\b/,/\bpromote\b/,/\bsocial media\b/,/\bbroadcast\b/,/\bcustomer\b/,/\bwateja\b/,/\bgrow\b/,/\bkua\b/],
  }

  let best = 'fallback', bestScore = 0
  for (const [intent, patterns] of Object.entries(INTENTS)) {
    const s = score(msg, patterns)
    if (s > bestScore) { bestScore = s; best = intent }
  }
  return best
}

//  Extract product/search term 
function extractTerm(msg: string) {
  return msg
    .replace(/nataka|ninatafuta|tafuta|find|search|nilete|nipe|nipatie|niambie|i want|i need|looking for|need|nahitaji|please|tafadhali|nionyeshe|show me|tell me about|je kuna/gi,'')
    .replace(/[?!.,]/g,'').replace(/\s+/g,' ').trim()
}

const fmt = P, dt = D

async function visibleStoreIds(sb: ReturnType<typeof createServiceSupabase>, storeId?: string) {
  if (storeId) {return [storeId]}
  const { data } = await sb.from('pending_payments').select('id').eq('status', 'approved').limit(1000)
  return (data || []).map(row => row.id as string)
}

//  Response generators 
async function respond(sb: ReturnType<typeof createServiceSupabase>, intent: string, msg: string, l: 'sw'|'en', mode: string, storeId?: string, shopName?: string, shopCategory?: string, userId?: string) {

  const sw = l === 'sw'
  const visibleStores = await visibleStoreIds(sb, storeId)

  //  GREET 
  if (intent === 'greet') {
    if (mode === 'store') {return sw
      ? ` Karibu duka la **${shopName}**!\n\nMimi ni 360 AI, msaidizi wako. Ninaweza kukusaidia na:\n•  Bidhaa na bei\n•  Delivery\n•  Malipo\n•  Maswali yoyote\n\nUnahitaji nini?`
      : ` Welcome to **${shopName}**!\n\nI'm 360 AI, your shopping assistant. I can help with:\n•  Products & prices\n•  Delivery info\n•  Payment options\n•  Any questions\n\nHow can I help you?`}
    if (mode === 'seller') {return sw
      ? ` Habari! Mimi ni **360 AI** — msaidizi wako wa biashara.\n\nNinaweza kukusaidia na:\n•  Bidhaa na inventory\n•  Mauzo na mapato\n•  Masoko\n•  Wateja\n\nUnajua nini leo?`
      : ` Hello! I'm **360 AI** — your business assistant.\n\nI can help with:\n•  Products & inventory\n•  Sales & revenue\n•  Marketing\n•  Customer issues\n\nWhat do you need today?`}
    return sw
      ? ` Habari! Mimi ni **360 AI** — msaidizi wako wa ShopNekt.\n\nNinaweza kukusaidia na:\n•  Bidhaa na maduka\n•  Flash Deals\n•  Orders zako\n•  Kufungua duka\n\nNiulize chochote! `
      : ` Hello! I'm **360 AI** — your ShopNekt assistant.\n\nI can help with:\n•  Products & stores\n•  Flash Deals\n•  Your orders\n•  Opening a shop\n\nAsk me anything! `
  }

  //  PRODUCTS 
  if (intent === 'products') {
    if (storeId) {
      const { data } = await sb.from('products').select('name,price,category').eq('store_id',storeId).eq('is_available',true).limit(12)
      if (data?.length) {
        const list = data.map((p,i) => `${i+1}. **${p.name}** — ${fmt(p.price)}`).join('\n')
        return sw ? ` **Bidhaa za ${shopName}** (${data.length}):\n\n${list}\n\nUnataka kujua zaidi? Niulize!`
                  : ` **Products at ${shopName}** (${data.length}):\n\n${list}\n\nWant details on any item? Just ask!`
      }
    }
    const { data: shops } = await sb.from('pending_payments').select('shop_name,shop_category').eq('status','approved').limit(6)
    const list = shops?.map(s => `• ${s.shop_name} — ${s.shop_category}`).join('\n') || ''
    return sw ? ` **Maduka ya Verified:**\n\n${list}\n\n Nenda /market kuona bidhaa zote!`
              : ` **Verified Stores:**\n\n${list}\n\n Go to /market to browse all products!`
  }

  //  PRICE 
  if (intent === 'price') {
    if (storeId) {
      const { data } = await sb.from('products').select('name,price,original_price').eq('store_id',storeId).order('price',{ascending:true}).limit(8)
      if (data?.length) {
        const list = data.map(p => {
          let r = `• ${p.name}: **${fmt(p.price)}**`
          if (p.original_price > p.price) {r += ` ~~${fmt(p.original_price)}~~`}
          return r
        }).join('\n')
        return sw ? ` **Bei za ${shopName}:**\n\n${list}\n\n Tuma ujumbe kwa bei maalum!`
                  : ` **Prices at ${shopName}:**\n\n${list}\n\n Message the seller for special prices!`
      }
    }
    const { data: deals } = visibleStores.length ? await sb.from('flash_deals').select('product_name,deal_price,discount_pct').in('store_id',visibleStores).eq('status','active').gt('ends_at',new Date().toISOString()).limit(4) : { data: [] }
    if (deals?.length) {
      const list = deals.map(d => `• ${d.product_name}: **${fmt(d.deal_price)}** (-${d.discount_pct}%)`).join('\n')
      return sw ? ` **Bei Poa za Flash Deals:**\n\n${list}\n\n Nenda /flash-deals kununua!`
                : ` **Best Prices on Flash Deals:**\n\n${list}\n\n Go to /flash-deals to buy now!`
    }
    return sw ? ` Bei zinategemea bidhaa na duka.\n\n Nenda /market kuona bei zote.\n Wasiliana na seller kwa bei maalum.`
              : ` Prices vary by product and store.\n\n Go to /market to browse prices.\n Contact sellers for special deals.`
  }

  //  DEALS 
  if (intent === 'deals') {
    const { data } = visibleStores.length ? await sb.from('flash_deals').select('product_name,original_price,deal_price,discount_pct,ends_at').in('store_id',visibleStores).eq('status','active').gt('ends_at',new Date().toISOString()).order('discount_pct',{ascending:false}).limit(5) : { data: [] }
    if (data?.length) {
      const list = data.map((d,i) => {
        const hrs = Math.max(0, Math.floor((new Date(d.ends_at).getTime()-Date.now())/3600000))
        return `${i+1}. **${d.product_name}**\n   ${fmt(d.original_price)} → **${fmt(d.deal_price)}** (-${d.discount_pct}%) ${hrs}h remaining`
      }).join('\n\n')
      return sw ? ` **Flash Deals za Sasa:**\n\n${list}\n\n /flash-deals kununua sasa!`
                : ` **Current Flash Deals:**\n\n${list}\n\n Go to /flash-deals to buy now!`
    }
    return sw ? ` Hakuna flash deals sasa.\n\n Washa "Flash Deal Alerts" kwenye Settings ukitaka notification.\n\n Angalia /flash-deals mara kwa mara!`
              : ` No active flash deals right now.\n\n Enable "Flash Deal Alerts" in Settings for notifications.\n\n Check /flash-deals regularly!`
  }

  //  GROUP BUY 
  if (intent === 'group') {
    const { data } = visibleStores.length ? await sb.from('group_orders').select('product_name,min_members,current_members,discount_pct').in('store_id',visibleStores).eq('status','open').gt('expires_at',new Date().toISOString()).limit(4) : { data: [] }
    if (data?.length) {
      const list = data.map((g,i) => {
        const pct = Math.round((g.current_members/g.min_members)*100)
        return `${i+1}. **${g.product_name}**\n    ${g.current_members}/${g.min_members} (${pct}%) — ${g.discount_pct}% discount`
      }).join('\n\n')
      return sw ? ` **Group Buy Zinazoendela:**\n\n${list}\n\n /group-buy kujiunga!`
                : ` **Active Group Buys:**\n\n${list}\n\n Go to /group-buy to join!`
    }
    return sw ? ` **Group Buy ni nini?**\n\nWatu wengi wanaunganika kununua pamoja. Mkifikia idadi inayohitajika, kila mmoja anapata discount kubwa!\n\n Angalia /group-buy!`
              : ` **What is Group Buy?**\n\nPeople join together to buy one product. When the target is reached, everyone gets a big discount!\n\n Check /group-buy!`
  }

  //  MY ORDERS 
  if (intent === 'my_orders') {
    if (!userId) {return sw ? ` Ingia kwanza kuona orders zako.\n /auth`
                           : ` Please sign in first to view your orders.\n /auth`}
    const { data } = await sb.from('orders').select('product_name,status,total_amount,store_name,created_at').eq('buyer_id',userId).order('created_at',{ascending:false}).limit(6)
    if (data?.length) {
      const list = data.map(o => `**${o.product_name}**\n   ${fmt(o.total_amount)} · ${o.store_name} · ${dt(o.created_at)}`).join('\n\n')
      const rej = data.filter(o=>o.status==='rejected').length
      let r = sw ? ` **Orders Zako:**\n\n${list}` : ` **Your Orders:**\n\n${list}`
      if (rej) {r += sw ? `\n\n ${rej} order imekataliwa — nenda /orders kufanya malipo.` : `\n\n ${rej} order(s) rejected — go to /orders to complete payment.`}
      return r
    }
    return sw ? ` Huna orders bado.\n\n Anza kununua:\n• /market — Business Market\n• /flash-deals — Flash Deals\n• /group-buy — Group Buy`
              : ` You have no orders yet.\n\n Start shopping:\n• /market — Business Market\n• /flash-deals — Flash Deals\n• /group-buy — Group Buy`
  }

  //  DELIVERY 
  if (intent === 'delivery') {
    if (mode === 'store') {return sw
      ? ` **Delivery kutoka ${shopName}:**\n\n Delivery inapatikana — bei na muda inategemea eneo lako.\n\n**Hatua:**\n1. Wasiliana na seller\n2. Toa anwani yako\n3. Kubali bei ya delivery\n\n Bonyeza "Message Seller" `
      : ` **Delivery from ${shopName}:**\n\n Delivery available — price and time depend on your location.\n\n**Steps:**\n1. Contact the seller\n2. Share your address\n3. Agree on delivery fee\n\n Click "Message Seller" `}
    return sw
      ? ` **Delivery kwenye ShopNekt:**\n\n **ShopNekt Move** — delivery ya haraka\n• Tracking ya wakati halisi\n• Salama na ya kuaminika\n• Nenda /move kujua bei\n\n **Seller delivery** — seller anapanga mwenyewe\n **Cash on Delivery** — lipa ukipokea\n\n Wasiliana na seller kwa maelezo!`
      : ` **Delivery on ShopNekt:**\n\n **ShopNekt Move** — fast delivery\n• Real-time tracking\n• Safe & reliable\n• Check /move for rates\n\n **Seller delivery** — arranged directly\n **Cash on Delivery** — pay on receipt\n\n Contact seller for details!`
  }

  //  PAYMENT 
  if (intent === 'payment') {
    return sw
      ? ` **Njia za Malipo kwenye ShopNekt:**\n\n **Mobile Money:**\n• M-Pesa (Vodacom)\n• Tigo Pesa / Lipa Namba\n• Airtel Money / YAS\n• Halotel Halopesa\n\n **Benki:** Bank Transfer\n **Cash on Delivery**\n\n **Mfumo wa Escrow:**\nPesa yako inashikiliwa salama hadi upokee bidhaa — kisha inaenda kwa seller.`
      : ` **Payment Methods on ShopNekt:**\n\n **Mobile Money:**\n• M-Pesa (Vodacom)\n• Tigo Pesa / Lipa Namba\n• Airtel Money / YAS\n• Halotel Halopesa\n\n **Bank Transfer**\n **Cash on Delivery**\n\n **Escrow System:**\nYour money is held safely until you receive your item — then released to the seller.`
  }

  //  CONTACT 
  if (intent === 'contact') {
    if (mode === 'store') {return sw
      ? ` **Kuwasiliana na ${shopName}:**\n\n Bonyeza **"Message Seller"** juu ya ukurasa huu.\n\nSeller atajibu haraka! `
      : ` **Contact ${shopName}:**\n\n Click **"Message Seller"** at the top of this page.\n\nThe seller will respond quickly! `}
    return sw
      ? ` **Kuwasiliana na Seller:**\n\n1. Tembelea duka la seller\n2. Bonyeza "Message Seller"\n3. Andika ujumbe\n\n Inbox yako: /messages`
      : ` **Contacting a Seller:**\n\n1. Visit the seller's store\n2. Click "Message Seller"\n3. Send your message\n\n Your inbox: /messages`
  }

  //  RETURN 
  if (intent === 'return') {
    return sw
      ? ` **Kurudisha Bidhaa:**\n\n Hatua:\n1. Wasiliana na seller ndani ya masaa 24\n2. Eleza tatizo\n3. Seller atakuambia jinsi ya kurudisha\n4. ShopNekt itasaidia kama tatizo halikutatuliwa\n\n Anza sasa kwa kumessage seller!`
      : ` **Returning an Item:**\n\n Steps:\n1. Contact seller within 24 hours\n2. Explain the problem\n3. Seller will guide the return\n4. ShopNekt will help if unresolved\n\n Start by messaging the seller!`
  }

  //  OPEN SHOP 
  if (intent === 'open_shop') {
    return sw
      ? ` **Kufungua Duka kwenye ShopNekt:**\n\n**Hatua 4:**\n1. Nenda /open-store\n2. Jaza fomu (jina, kategoria, maelezo)\n3. Weka picha za bidhaa\n4. Subiri idhini (dakika 30-60)\n\n Utapata dashboard, password, na link yako!\n\n Basic: **Bure!**\n\n Anza sasa: /open-store`
      : ` **Open a Shop on ShopNekt:**\n\n**4 Steps:**\n1. Go to /open-store\n2. Fill the form (name, category, description)\n3. Upload product photos\n4. Wait for approval (30-60 min)\n\n You'll get a dashboard, password & store link!\n\n Basic plan: **Free!**\n\n Start now: /open-store`
  }

  //  CAMPUS 
  if (intent === 'campus') {
    return sw
      ? `Campus Market haipatikani kwa sasa. Tumia Business Market kutafuta maduka na bidhaa.`
      : `Campus Market is not available. Use Business Market to browse stores and products.`
  }

  //  SELLER ANALYTICS 
  if (intent === 'seller_analytics') {
    if (mode === 'seller' && storeId) {
      const { data } = await sb.from('orders').select('status,total_amount').eq('store_id',storeId).limit(500)
      if (data?.length) {
        const total = data.reduce((s,o)=>s+(o.total_amount||0),0)
        const confirmed = data.filter(o=>o.status==='completed').length
        const pending = data.filter(o=>o.status==='pending').length
        return sw
          ? ` **Takwimu za Duka Lako:**\n\n Mapato yote: **${fmt(total)}**\n Orders zilizokamilika: ${confirmed}\nOrders zinazongoja: ${pending}\n Orders zote: ${data.length}\n\n Jibu orders haraka ili kuongeza mauzo!`
          : ` **Your Store Analytics:**\n\n Total revenue: **${fmt(total)}**\n Completed orders: ${confirmed}\nPending orders: ${pending}\n Total orders: ${data.length}\n\n Respond to orders quickly to boost sales!`
      }
    }
    return sw
      ? ` **Kuona Takwimu:**\n\nNenda Dashboard yako → Analytics section.\n\n Tips za kukua:\n• Bidhaa 5+ = wateja 3x zaidi\n• Jibu messages < saa 1\n• Flash Deals kila wiki`
      : ` **View Your Analytics:**\n\nGo to your Dashboard → Analytics section.\n\n Growth tips:\n• 5+ products = 3x more customers\n• Reply messages < 1 hour\n• Run Flash Deals weekly`
  }

  //  SELLER MARKETING 
  if (intent === 'seller_marketing') {
    return sw
      ? ` **Masoko ya Duka Lako:**\n\n**Bure kabisa:**\n•  Post Social Vybe mara 2-3/wiki\n•  Tumia Flash Deals (wateja 4x)\n•  Jiunge Group Buy deals\n•  Jibu reviews za wateja\n\n**Post nzuri:**\n• Picha ya bidhaa + bei wazi\n• Caption fupi yenye kuvutia\n• Post asubuhi 7-9am au jioni 6-8pm`
      : ` **Marketing Your Store:**\n\n**Free methods:**\n•  Post on Social Vybe 2-3x/week\n•  Use Flash Deals (4x more customers)\n•  Join Group Buy deals\n•  Respond to customer reviews\n\n**Great posts:**\n• Clear product photo + price\n• Short engaging caption\n• Post 7-9am or 6-8pm`
  }

  //  SELLER PRODUCTS 
  if (intent === 'seller_products') {
    return sw
      ? ` **Kudhibiti Bidhaa Zako:**\n\n**Kuongeza:**\n1. Dashboard → Products\n2. Bonyeza "+"\n3. Jaza: Jina, Bei, Picha, Maelezo\n4. Save!\n\n Tips:\n• Picha nzuri = +60% views\n• Maelezo ya kina = +40% mauzo\n• Update stock mara kwa mara`
      : ` **Managing Your Products:**\n\n**To add:**\n1. Dashboard → Products\n2. Click "+"\n3. Fill: Name, Price, Photos, Description\n4. Save!\n\n Tips:\n• Good photos = +60% views\n• Detailed descriptions = +40% sales\n• Keep stock updated`
  }

  //  THANKS 
  if (intent === 'thanks') {
    return sw
      ? ` Karibu sana! Niko hapa ukihitaji msaada wowote.\n\n${mode==='store' ? `Biashara njema na ununuzi mzuri kwenye **${shopName}**! ` : 'ShopNekt ina furaha kukuona! '}`
      : ` You're welcome! I'm here whenever you need help.\n\n${mode==='store' ? `Enjoy shopping at **${shopName}**! ` : 'Happy shopping on ShopNekt! '}`
  }

  //  HELP 
  if (intent === 'help') {
    return sw
      ? `**Mwongozo wa shopnekt:**\n\n /home — Ukurasa mkuu\n /market — Business Market\n /vybe — Social Vybe\n /flash-deals — Flash Deals\n /group-buy — Group Buy\n /orders — Orders zangu\n /messages — Inbox\n /open-store — Fungua duka\n /settings — Mipangilio\n /ai — 360 AI\n\nNiulize chochote! `
      : `**shopnekt Guide:**\n\n /home — Home page\n /market — Business Market\n /vybe — Social Vybe\n /flash-deals — Flash Deals\n /group-buy — Group Buy\n /orders — My Orders\n /messages — Inbox\n /open-store — Open a shop\n /settings — Settings\n /ai — 360 AI\n\nAsk me anything! `
  }

  //  VYBE 
  if (intent === 'vybe') {
    const { data } = visibleStores.length ? await sb.from('feed_posts').select('caption,shop_name,likes,likes_count').in('store_id',visibleStores).order('likes_count',{ascending:false}).limit(3) : { data: [] }
    const list = data?.map(p => `• "${(p.caption||'').slice(0,40)}" — ${p.shop_name} (${p.likes_count||0})`).join('\n') || ''
    return sw
      ? ` **Social Vybe:**\n\nGundua bidhaa kupitia picha na videos!\n\n${list ? ` **Trending sasa:**\n${list}\n\n` : ''} Nenda /vybe!`
      : ` **Social Vybe:**\n\nDiscover products through photos and videos!\n\n${list ? ` **Trending now:**\n${list}\n\n` : ''} Go to /vybe!`
  }

  //  REVIEW 
  if (intent === 'review') {
    return sw
      ? ` **Reviews kwenye ShopNekt:**\n\nSellers wanatathminiwa na wateja wao.\n\n•  = Bora kabisa\n•  = Nzuri\n•  = Sawa\n\nAngalia rating ya duka kabla ya kununua!\n\nBaada ya kupokea bidhaa yako, unaweza kuandika review kwenye orders zako.`
      : ` **Reviews on ShopNekt:**\n\nSellers are rated by their customers.\n\n•  = Excellent\n•  = Good\n•  = Average\n\nCheck the store rating before buying!\n\nAfter receiving your item, you can leave a review in your orders.`
  }

  //  MOVE 
  if (intent === 'move') {
    return sw
      ? ` **ShopNekt Move — Delivery Service:**\n\n Delivery ya haraka na salama\n Tracking ya wakati halisi\n Bei nafuu\n\n Nenda /move kujua bei zaidi!`
      : ` **ShopNekt Move — Delivery Service:**\n\n Fast & safe delivery\n Real-time tracking\n Affordable rates\n\n Go to /move for more details!`
  }

  //  SEARCH / FALLBACK 
  const term = extractTerm(msg)
  if (term.length > 1) {
    const safeTerm = term.replace(/[%_,()]/g, ' ').slice(0, 80).trim()
    const { data: shops } = await sb.from('pending_payments').select('id,shop_name,shop_category,shop_region').eq('status','approved').ilike('shop_name',`%${safeTerm}%`).limit(4)
    const { data: products } = visibleStores.length ? await sb.from('products').select('name,price').in('store_id',visibleStores).eq('is_active',true).eq('is_available',true).ilike('name',`%${safeTerm}%`).limit(4) : { data: [] }
    if (shops?.length || products?.length) {
      let r = sw ? ` **Nimepata "${term}":**\n\n` : ` **Found for "${term}":**\n\n`
      if (products?.length) {
        r += sw ? ` **Bidhaa:**\n` : ` **Products:**\n`
        products.forEach(p => { r += `• ${p.name} — ${fmt(p.price)}\n` })
        r += '\n'
      }
      if (shops?.length) {
        r += sw ? ` **Maduka:**\n` : ` **Stores:**\n`
        shops.forEach(s => { r += `• ${s.shop_name} — ${s.shop_category} (${s.shop_region||'Online'})\n` })
      }
      return r + (sw ? '\n /market kwa zaidi!' : '\n /market for more!')
    }
  }

  //  FINAL FALLBACK — try Anthropic for natural language
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey) {
      const context = mode === 'seller'
        ? `You are 360 AI, a business assistant for ShopNekt sellers in Tanzania. Help with sales, orders, products, and business analytics. The seller's store: ${shopName || 'Unknown'} (${shopCategory || 'General'}).`
        : `You are 360 AI, a helpful shopping assistant on ShopNekt marketplace in Tanzania. Help buyers find products, understand deals, track orders, and navigate the platform.`
      
      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 400,
          system: context + " Respond naturally in the user's language (Swahili, English, or mixed). Be concise, helpful, and professional. No emojis.",
          messages: [{ role: 'user', content: msg }],
        }),
      })
      if (aiRes.ok) {
        const aiData = await aiRes.json()
        const text = aiData.content?.[0]?.text
        if (text) {return text}
      }
    }
  } catch {}
  
  return sw
    ? 'Samahani, sijaelewa vizuri. Ninaweza kukusaidia na bidhaa, bei, orders, na maswali yoyote kuhusu ShopNekt. Uliza tena!'
    : "I didn't quite understand. I can help with products, prices, orders, and anything else on ShopNekt. Please ask again!"
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  const limit = rateLimit(`ai-chat-aria:${getClientIp(request)}`, 20, 60)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}

  let body: unknown
  try { body = await request.json() } catch { body = null }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })}
  const input = body as Record<string, unknown>
  const message = typeof input.message === 'string' ? input.message.trim() : ''
  if (!message || message.length > 2000) {return NextResponse.json({ error: 'Invalid message.' }, { status: 400 })}

  const mode = input.mode === 'seller' ? 'seller' : input.mode === 'store' ? 'store' : 'buyer'
  const sellerSession = mode === 'seller' ? readSellerSession(request) : null
  if (mode === 'seller' && (!sellerSession || sellerSession.market !== 'business')) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }
  const sb = createServiceSupabase()
  let storeId: string | undefined
  let shopName = ''
  let shopCategory = 'General'
  if (mode === 'seller') {
    if (!sellerSession || !await isActiveSeller(sb, sellerSession.sellerId, 'business')) {return NextResponse.json({ error: 'Seller account is not active.' }, { status: 403 })}
    storeId = sellerSession.sellerId
    const { data } = await sb.from('pending_payments').select('shop_name,shop_category').eq('id', storeId).maybeSingle()
    shopName = data?.shop_name || ''
    shopCategory = data?.shop_category || 'General'
  } else if (mode === 'store') {
    const requestedStoreId = typeof input.store_id === 'string' ? input.store_id : ''
    if (!UUID.test(requestedStoreId)) {return NextResponse.json({ error: 'Invalid store.' }, { status: 400 })}
    const { data } = await sb.from('pending_payments').select('id,shop_name,shop_category,selected_template,webstore_status')
      .eq('id', requestedStoreId).eq('status', 'approved').maybeSingle()
    if (!data || (data.selected_template && data.webstore_status !== 'published')) {return NextResponse.json({ error: 'Store not found.' }, { status: 404 })}
    storeId = data.id
    shopName = data.shop_name || ''
    shopCategory = data.shop_category || 'General'
  }

  try {
    const reply = await respond(sb, getIntent(message), message, lang(message), mode, storeId, shopName, shopCategory)
    return NextResponse.json({ reply }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Unable to answer right now.' }, { status: 503 })
  }
}
