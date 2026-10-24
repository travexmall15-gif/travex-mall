import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { rateLimit, getClientIp } from '@/lib/security/rate-limit'
import { createServiceSupabase } from '@/lib/security/server-supabase'

)

//  Types 
type Product = {
  id?: string; name: string; price: number; stock: number
  description: string | null; category: string | null; image_url?: string | null
}
type Shop = {
  id: string; name: string; desc: string; category: string; region: string
  owner: string; phone: string; whatsapp: string; plan: string; since: string; type: string
}
type ConvState = {
  intent?: string; selectedProduct?: Product; qty?: number
  customerName?: string; customerPhone?: string; step?: string
  orderPlaced?: boolean
}

//  Intent detection 
function detectIntent(msg: string, state: ConvState): string {
  const m = msg.toLowerCase()
  if (state.step === 'await_name') {return 'collect_name'}
  if (state.step === 'await_phone') {return 'collect_phone'}
  if (state.step === 'await_qty') {return 'collect_qty'}
  if (state.step === 'await_confirm') {return 'confirm_order'}
  if (/(hi|hello|habari|hujambo|salam|karibu|hey|mambo|niaje|good|morning|evening)/i.test(m)) {return 'greeting'}
  if (/(order|nunua|buy|pata|ninataka|nataka|need|nitaki|niambie|nipatie|niletee|nipe|peleka|deliver)/i.test(m)) {return 'order_intent'}
  if (/(bei|price|cost|gharama|pesa|thamani|ngapi|kiasi|cheap|nafuu|expensive|ghali)/i.test(m)) {return 'ask_price'}
  if (/(stock|available|ipo|baki|left|ina|zipo|kuna|count|kiasi)/i.test(m)) {return 'ask_stock'}
  if (/(what|nini|una|mnauza|sell|products|bidhaa|items|list|orodha|all|zote|show)/i.test(m)) {return 'list_products'}
  if (/(description|maelezo|info|zaidi|more|detail|about|kuhusu|eleza)/i.test(m)) {return 'ask_description'}
  if (/(contact|wasiliana|phone|simu|whatsapp|owner|mwenye|seller|speak|piga)/i.test(m)) {return 'ask_contact'}
  if (/(location|mahali|region|wapi|mkoa|area|where)/i.test(m)) {return 'ask_location'}
  if (/(cancel|acha|hapana|no|stop|sitaki|ondoa)/i.test(m)) {return 'cancel'}
  if (/(help|msaada|assist|saidia|guide|ongoza)/i.test(m)) {return 'help'}
  if (/(thank|asante|shukrani|great|good|nice|nzuri|sawa|okay)/i.test(m)) {return 'gratitude'}
  if (/\d/.test(m) && state.step === 'await_qty') {return 'collect_qty'}
  return 'search_product'
}

//  Find product by keyword 
function findProducts(query: string, products: Product[]): Product[] {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  if (words.length === 0) {return products.slice(0, 5)}
  return products.filter(p => {
    const text = `${p.name} ${p.description || ''} ${p.category || ''}`.toLowerCase()
    return words.some(w => text.includes(w))
  })
}

//  Format currency 
const fmt = (n: number) => 'TZS ' + Number(n).toLocaleString('en-US')

//  Main handler 
export async function POST(req: Request) {
  // Rate limit: 20 messages / 60s per IP — generous for real conversation,
  // tight enough to blunt scripted abuse (Part 37).
  const { allowed, retryAfterSeconds } = rateLimit(`ai-chat:${getClientIp(req)}`, 20, 60)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } })
  }
  try {
  const body = await req.json()
  const store_id = typeof body.store_id === 'string' ? body.store_id : ''
  const message = typeof body.message === 'string' ? body.message : ''
  const session_id = typeof body.session_id === 'string' && /^[0-9a-f-]{36}$/i.test(body.session_id) ? body.session_id : randomUUID()
  const state: ConvState = body.conv_state && typeof body.conv_state === 'object' ? body.conv_state : {}
  const msg = message.trim()
  if (!UUID.test(store_id) || !msg || msg.length > 2000) {
    return NextResponse.json({ error: 'Invalid chat request.' }, { status: 400 })
  }
  const sb = createServiceSupabase()

  //  Fetch ALL store data 
  const [
    { data: storeRow },
    { data: bizProducts },
  ] = await Promise.all([
    sb.from('pending_payments')
      .select('id,shop_name,shop_desc,shop_category,shop_region,shop_whatsapp,plan,created_at,selected_template,webstore_status')
      .eq('id', store_id).eq('status', 'approved').maybeSingle(),
    sb.from('products').select('id,name,price,stock,description,category,image_url,is_active,is_available')
      .eq('store_id', store_id).gt('stock', 0).order('name').limit(200),
  ])

  if (!storeRow || (storeRow.selected_template && storeRow.webstore_status !== 'published')) {
    return NextResponse.json({ error: 'Store not found.' }, { status: 404 })
  }
  const shop: Shop = {
    id: storeRow.id, name: storeRow.shop_name, desc: storeRow.shop_desc || '',
    category: storeRow.shop_category || 'General', region: storeRow.shop_region || 'Tanzania',
    owner: '', phone: '',
    whatsapp: storeRow.shop_whatsapp || '',
    plan: storeRow.plan, since: storeRow.created_at?.split('T')[0] || '',
    type: 'business',
  }

  const allProducts: Product[] = (bizProducts || []).filter(p => p.is_active !== false && p.is_available !== false)
  const wa = shop.whatsapp.replace(/\D/g, '')

  //  Detect intent 
  const intent = detectIntent(msg, state)
  let reply = ''
  let newState: ConvState = { ...state }

  //  Handle intents 
  if (intent === 'greeting') {
    const prods = allProducts.length > 0
      ? `\n\nTuna bidhaa ${allProducts.length}. Unaweza kuuliza kuhusu:\n• Bidhaa na bei\n• Kufanya order\n• Kuwasiliana na seller`
      : '\n\nSeller bado anaongeza bidhaa.'
    reply = `Karibu sana ${shop.name}! Mimi ni Aria, msaidizi wako wa ununuzi. Niko hapa kukusaidia kupata unachotaka na kufanya order kwa urahisi.${prods}\n\nUnaweza kuniambia unataka nini?`
    newState = {}

  } else if (intent === 'help') {
    reply = `Ninaweza kukusaidia na:\n\n• **Bidhaa** — "Una viatu? / What products do you have?"\n• **Bei** — "Bei ya X ni ngapi?"\n• **Order** — "Nataka kuorder X"\n• **Stock** — "X ipo bado?"\n• **Mawasiliano** — "Niwasiliane na seller"\n\nUnataka kuanza na nini?`

  } else if (intent === 'list_products') {
    if (allProducts.length === 0) {
      reply = `Samahani, ${shop.name} bado hana bidhaa zilizowekwa. Rudi baadaye au wasiliana na seller moja kwa moja.`
    } else {
      const cats = [...new Set(allProducts.map(p => p.category).filter(Boolean))]
      const list = allProducts.slice(0, 8).map(p => `• ${p.name} — ${fmt(p.price)} (${p.stock} available)`).join('\n')
      reply = `${shop.name} ana bidhaa ${allProducts.length}${cats.length ? ` katika categories: ${cats.join(', ')}` : ''}:\n\n${list}${allProducts.length > 8 ? `\n\n...na ${allProducts.length - 8} zaidi. Tafuta kwa jina au category!` : ''}\n\nUnataka kujua zaidi kuhusu bidhaa gani?`
    }

  } else if (intent === 'ask_price') {
    const found = findProducts(msg, allProducts)
    if (found.length === 0) {
      reply = allProducts.length > 0
        ? `Sijapata bidhaa unayotafuta. Bidhaa zetu ni:\n${allProducts.slice(0,5).map(p=>`• ${p.name} — ${fmt(p.price)}`).join('\n')}`
        : `Hakuna bidhaa zilizowekwa bado.`
    } else if (found.length === 1) {
      reply = `Bei ya **${found[0].name}** ni **${fmt(found[0].price)}**.\n${found[0].description ? `\n${found[0].description}` : ''}\n${found[0].stock <= 5 ? `\nHaraka! Zimebaki ${found[0].stock} tu.` : `\nStock: ${found[0].stock} available.`}\n\nUnataka kuorder?`
      newState.selectedProduct = found[0]
    } else {
      reply = `Nimeona bidhaa ${found.length} zinazofanana na ulichotafuta:\n\n${found.slice(0,5).map(p=>`• ${p.name} — ${fmt(p.price)} (${p.stock} available)`).join('\n')}\n\nUnapenda bei ya bidhaa gani hasa?`
    }

  } else if (intent === 'ask_stock') {
    const found = findProducts(msg, allProducts)
    if (found.length === 0) {
      reply = `Sijapata bidhaa unayotafuta. Bidhaa zetu zilizopo:\n${allProducts.slice(0,5).map(p=>`• ${p.name} — ${p.stock} available`).join('\n')}`
    } else {
      reply = found.slice(0,3).map(p =>
        `• **${p.name}**: ${p.stock > 10 ? `Ipo — ${p.stock} available` : p.stock > 0 ? `Inakwisha — ${p.stock} tu zimebaki!` : 'Imeisha stock'}`
      ).join('\n')
      reply += `\n\nUnataka kuorder moja?`
      if (found.length === 1) {newState.selectedProduct = found[0]}
    }

  } else if (intent === 'ask_description') {
    const found = findProducts(msg, allProducts)
    if (found.length === 0) {
      reply = `Samahani, sikusaisika bidhaa hiyo. Una swali kuhusu bidhaa nyingine?`
    } else {
      const p = found[0]
      reply = `**${p.name}**\nBei: ${fmt(p.price)}\nStock: ${p.stock} available\nCategory: ${p.category || 'General'}\n\n${p.description || 'Maelezo ya kina hayajaongezwa bado.'}\n\nUnataka kuorder?`
      newState.selectedProduct = p
    }

  } else if (intent === 'ask_contact') {
    reply = `Unaweza kuwasiliana na mwenye ${shop.name} moja kwa moja:\n\n`
    if (wa) {reply += ` WhatsApp: +${wa}\n`}
    if (shop.phone) {reply += ` Simu: ${shop.phone}\n`}
    reply += `\nAu niambie tatizo lako nami nitasaidia!\n\nPia unaweza kutuma message kupitia kitufe cha "Message Seller" juu.`

  } else if (intent === 'ask_location') {
    reply = `${shop.name} ipo:\n Mkoa: ${shop.region}\n Category: ${shop.category}\n Imefunguliwa: ${shop.since || 'Hivi karibuni'}\n${shop.plan === 'premium' ? '\nSeller hii ni Premium — wamethhibitishwa na ShopNekt.' : ''}`

  } else if (intent === 'order_intent') {
    const found = findProducts(msg, allProducts)
    if (found.length === 0 && allProducts.length === 0) {
      reply = `Samahani, ${shop.name} bado hana bidhaa. Wasiliana na seller moja kwa moja.`
    } else if (found.length === 0) {
      reply = `Bidhaa gani unataka kuorder? Hizi ndizo bidhaa zetu:\n\n${allProducts.slice(0,6).map(p=>`• ${p.name} — ${fmt(p.price)}`).join('\n')}\n\nChagua moja!`
      newState.step = 'await_product_selection'
    } else if (found.length === 1) {
      const p = found[0]
      newState.selectedProduct = p
      newState.step = 'await_qty'
      reply = `Umechagua: **${p.name}** — ${fmt(p.price)} per item\nStock: ${p.stock} available\n\nUnataka idadi ngapi?`
    } else {
      reply = `Nimeona bidhaa zinazofanana:\n\n${found.slice(0,5).map((p,i)=>`${i+1}. ${p.name} — ${fmt(p.price)}`).join('\n')}\n\nUnataka nambari gani?`
      newState.step = 'await_product_selection'
      newState.selectedProduct = undefined
    }

  } else if (intent === 'collect_qty' || (state.step === 'await_qty')) {
    const num = parseInt(msg.replace(/\D/g, '')) || 1
    const p = state.selectedProduct
    if (!p) {
      reply = `Samahani, niambie bidhaa unayotaka kwanza.`
      newState.step = undefined
    } else if (num > p.stock) {
      reply = `Samahani, tuna ${p.stock} tu za ${p.name}. Unaweza kuorder ${p.stock} au chini. Idadi ngapi?`
    } else {
      newState.qty = num
      newState.step = 'await_name'
      const total = p.price * num
      reply = `Sawa! Order yako:\n• Bidhaa: ${p.name}\n• Idadi: ${num}\n• Jumla: **${fmt(total)}**\n\nSasa ninahitaji taarifa zako. Jina lako kamili ni nani?`
    }

  } else if (intent === 'collect_name' || state.step === 'await_name') {
    if (msg.length < 2) {
      reply = `Tafadhali niambie jina lako kamili.`
    } else {
      newState.customerName = msg
      newState.step = 'await_phone'
      reply = `Asante ${msg}! Sasa ninahitaji nambari yako ya simu ili seller aweze kukuwasiliana. Nambari yako ni?`
    }

  } else if (intent === 'collect_phone' || state.step === 'await_phone') {
    const phone = msg.replace(/\s/g, '')
    if (phone.length < 9) {
      reply = `Tafadhali weka nambari sahihi ya simu (mfano: 0712345678 au +255712345678).`
    } else {
      newState.customerPhone = phone
      newState.step = 'await_confirm'
      const p = state.selectedProduct!
      const total = fmt(p.price * (state.qty || 1))
      reply = `Sawa! Thibitisha order yako:\n\n Bidhaa: ${p.name}\n Idadi: ${state.qty || 1}\n Jumla: ${total}\n Jina: ${state.customerName}\n Simu: ${phone}\n Duka: ${shop.name}\n\nUnathibitisha? Andika **NDIYO** kutuma order au **HAPANA** kufuta.`
    }

  } else if (intent === 'confirm_order' && state.step === 'await_confirm') {
    if (/(ndiyo|yes|confirm|sawa|ok|ndio|yeah|yep)/i.test(msg)) {
      const selectedId = typeof state.selectedProduct?.id === 'string' ? state.selectedProduct.id : ''
      const qty = Number.isInteger(state.qty) ? Number(state.qty) : 0
      const customerName = typeof state.customerName === 'string' ? state.customerName.trim() : ''
      const customerPhone = typeof state.customerPhone === 'string' ? state.customerPhone.trim() : ''
      const validContact = customerName.length >= 2 && customerName.length <= 120
        && /^[0-9+()\s.-]{6,32}$/.test(customerPhone)
      const { data: product } = UUID.test(selectedId) && qty >= 1 && qty <= 99 && validContact
        ? await sb.from('products').select('id,store_id,name,price,stock,is_active,is_available')
          .eq('id', selectedId).eq('store_id', store_id).maybeSingle()
        : { data: null }
      const p = product
      const total = p ? Number(p.price) * qty : 0
      const orderErr = !p || p.stock < qty || p.is_active === false || p.is_available === false
        ? new Error('Product is not available')
        : (await sb.from('orders').insert({
          store_id,
          store_name: shop.name,
          product_name: p.name,
          product_id: p.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          phone: customerPhone,
          quantity: qty,
          total_amount: total,
          total_price: total,
          status: 'pending',
          notes: 'Order placed via Aria AI Assistant',
        })).error

      if (orderErr) {
        reply = `Bidhaa haipatikani tena au kuna tatizo la kiufundi. Tafadhali jaribu tena au wasiliana na seller moja kwa moja${wa ? ` kwa WhatsApp: +${wa}` : ''}.`
      } else {
        newState = { orderPlaced: true }
        reply = `Order yako imepelekwa kwa ${shop.name}!\n\n **Umefanikiwa!**\n\n ${p!.name} x${qty}\n ${fmt(total)}\n ${customerName}\n ${customerPhone}\n\nSeller atakupigia simu au kukutumia WhatsApp hivi karibuni kukuthibitishia. Asante kwa kununua kutoka ${shop.name}!`
      }

    } else {
      newState = {}
      reply = `Sawa, order imefutwa. Unaweza kuanza upya au kuendelea kuvinjari duka. Kuna kitu kingine ninachoweza kukusaidia nacho?`
    }

  } else if (intent === 'cancel') {
    newState = {}
    reply = `Sawa, nimefuta. Niambie ukitaka msaada mwingine!`

  } else if (intent === 'gratitude') {
    reply = `Asante! Karibu tena ${shop.name} wakati wowote. Kuna kitu kingine unachohitaji?`

  } else {
    // Smart search — try to find product
    const found = findProducts(msg, allProducts)
    if (found.length > 0) {
      if (found.length === 1) {
        const p = found[0]
        newState.selectedProduct = p
        reply = `Nimeona: **${p.name}**\nBei: ${fmt(p.price)}\nStock: ${p.stock} available\n${p.description ? `\n${p.description}\n` : ''}\nUnataka kuorder au una swali lingine?`
      } else {
        reply = `Nimeona bidhaa ${found.length} zinazofanana:\n\n${found.slice(0,5).map(p=>`• ${p.name} — ${fmt(p.price)} (${p.stock} left)`).join('\n')}\n\nUnataka kujua zaidi kuhusu ipi?`
      }
    } else if (allProducts.length > 0) {
      // Try Anthropic for natural language understanding
    try {
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (apiKey) {
        const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5',
            max_tokens: 250,
            system: `You are Aria, a helpful AI assistant for ${shop.name} in Tanzania. The store sells: ${allProducts.slice(0,8).map(p=>p.name+' TZS '+p.price).join(', ')}. Reply naturally in the user's language (Swahili or English). Be concise and helpful. No emojis.`,
            messages: [{ role: 'user', content: msg }]
          })
        })
        if (aiRes.ok) {
          const aiData = await aiRes.json()
          reply = aiData.content?.[0]?.text || ''
        }
      }
    } catch {}
    if (!reply) {reply = `Ninaweza kukusaidia na bidhaa na bei, kufanya order, au mawasiliano na seller. Unataka nini?`}
    } else {
      reply = `Karibu ${shop.name}! Duka lina bidhaa ${allProducts.length}. Ninaweza kukusaidia na swali lolote.`
    }
  }

  return NextResponse.json({ reply, session_id, conv_state: newState })
  } catch (err) {
    return NextResponse.json({ reply: 'Samahani, kuna tatizo la kiufundi. Tafadhali jaribu tena.', session_id: '', conv_state: {} }, { status: 500 })
  }
}
