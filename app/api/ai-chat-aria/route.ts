import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://bscecjbgnjitlfmgwcic.supabase.co',
  'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'
)

const fmtPrice = (n: number) => `TZS ${Number(n||0).toLocaleString()}`
const fmtDate  = (d: string) => new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})

// ── Fetch relevant ShopNekt data ──────────────────────────
async function fetchContext(mode: string, storeId?: string, userId?: string) {
  const ctx: Record<string, any> = {}

  try {
    // Flash deals
    const { data: deals } = await sb.from('flash_deals').select('product_name,original_price,discounted_price,discount_pct,ends_at').eq('is_active',true).limit(5)
    ctx.flash_deals = deals?.map(d => `${d.product_name}: was ${fmtPrice(d.original_price)}, now ${fmtPrice(d.discounted_price)} (-${d.discount_pct}%)`) || []

    // Group buys
    const { data: groups } = await sb.from('group_buys').select('product_name,target_members,current_members,discount_pct').eq('status','active').limit(4)
    ctx.group_buys = groups?.map(g => `${g.product_name}: ${g.current_members}/${g.target_members} members (${g.discount_pct}% discount when full)`) || []

    if (mode === 'store' && storeId) {
      // Store products
      const { data: products } = await sb.from('products').select('name,price,category,description,is_available').eq('shop_id',storeId).eq('is_available',true).limit(20)
      ctx.store_products = products?.map(p => `${p.name}: ${fmtPrice(p.price)} (${p.category})`) || []

      // Store info
      const { data: store } = await sb.from('shops').select('shop_name,shop_category,shop_city,shop_description,shop_whatsapp,rating').eq('id',storeId).single()
      ctx.store_info = store || {}

    } else if (mode === 'seller' && userId) {
      // Seller's orders summary
      const { data: orders } = await sb.from('orders').select('status,total_amount,product_name,created_at').eq('store_owner_id',userId).order('created_at',{ascending:false}).limit(10)
      ctx.my_orders = orders?.map(o => `${o.product_name}: ${fmtPrice(o.total_amount)} - ${o.status} (${fmtDate(o.created_at)})`) || []

      const total = orders?.reduce((s,o) => s + (o.total_amount||0), 0) || 0
      ctx.total_sales = fmtPrice(total)
      ctx.pending_orders = orders?.filter(o=>o.status==='pending').length || 0

    } else if (userId) {
      // Buyer's orders
      const { data: myOrders } = await sb.from('orders').select('product_name,status,total_amount,store_name,created_at').eq('buyer_id',userId).order('created_at',{ascending:false}).limit(8)
      ctx.my_orders = myOrders?.map(o => `${o.product_name} from ${o.store_name}: ${fmtPrice(o.total_amount)} - ${o.status} (${fmtDate(o.created_at)})`) || []
    }

    // Top stores (always)
    const { data: shops } = await sb.from('shops').select('shop_name,shop_category,shop_city').eq('is_verified',true).limit(10)
    ctx.top_stores = shops?.map(s => `${s.shop_name} (${s.shop_category}, ${s.shop_city||'Online'})`) || []

  } catch(e) { /* continue with partial data */ }

  return ctx
}

// ── Build system prompt ───────────────────────────────────
function buildSystemPrompt(mode: string, shopName: string, ctx: Record<string,any>) {

  const sharedKnowledge = `
ABOUT SHOPNEKT:
ShopNekt is a global digital marketplace by QNEX360.
Features: Business Market, Campus Market, Social Vybe, Flash Deals, Group Buy, ShopNekt Move (delivery), In-app Messaging.
Navigation URLs: /home, /market, /campus, /vybe, /flash-deals, /group-buy, /messages, /orders, /open-store, /settings, /ai

PAYMENT METHODS: M-Pesa, Tigo Pesa/Lipa Namba, Airtel Money/YAS, Halotel Halopesa, Bank Transfer, Cash on Delivery
PAYMENT SYSTEM: Escrow — money held safely until buyer confirms receipt, then released to seller.

CURRENT FLASH DEALS: ${ctx.flash_deals?.length ? ctx.flash_deals.join(' | ') : 'None active right now'}
CURRENT GROUP BUYS: ${ctx.group_buys?.length ? ctx.group_buys.join(' | ') : 'None active right now'}
VERIFIED STORES: ${ctx.top_stores?.join(', ') || 'Various stores available'}
`

  if (mode === 'store') {
    return `You are 360 AI, the customer care assistant for the store "${shopName}" on ShopNekt marketplace.

STORE INFORMATION:
Name: ${shopName}
Category: ${ctx.store_info?.shop_category || 'General'}
City: ${ctx.store_info?.shop_city || 'Online'}
Description: ${ctx.store_info?.shop_description || 'Quality products'}
Rating: ${ctx.store_info?.rating || 'New store'}
WhatsApp: ${ctx.store_info?.shop_whatsapp || 'Contact via ShopNekt messages'}

AVAILABLE PRODUCTS:
${ctx.store_products?.length ? ctx.store_products.join('\n') : 'Contact seller for product list'}

${sharedKnowledge}

INSTRUCTIONS:
- You ONLY help with questions about this specific store and its products
- For general ShopNekt questions, answer briefly then redirect to store context
- DETECT the language of user's message and ALWAYS respond in the SAME language
- If user writes in Swahili → respond entirely in Swahili
- If user writes in English → respond entirely in English
- Be friendly, helpful, and concise
- Never make up products or prices that aren't in the list above
- For anything requiring direct seller contact, guide user to "Message Seller" button`

  } else if (mode === 'seller') {
    return `You are 360 AI, the personal business assistant for a seller on ShopNekt marketplace.

SELLER DATA:
Recent Orders: ${ctx.my_orders?.length ? ctx.my_orders.join('\n') : 'No orders yet'}
Total Sales Value: ${ctx.total_sales || 'TZS 0'}
Pending Orders: ${ctx.pending_orders || 0}

${sharedKnowledge}

SELLER DASHBOARD FEATURES:
- Add/edit/delete products with photos
- View and manage orders (confirm/reject)
- See analytics and sales reports
- Send broadcast messages to customers
- Manage store profile and settings
- Dashboard URL: /dashboard/login.html

INSTRUCTIONS:
- Help sellers run their business better
- Give practical advice on pricing, marketing, customer service
- DETECT the language of user's message and ALWAYS respond in the SAME language
- If user writes in Swahili → respond entirely in Swahili
- If user writes in English → respond entirely in English
- Use their actual data (orders, sales) when relevant
- Give specific, actionable advice`

  } else {
    return `You are 360 AI, the shopping assistant for ShopNekt marketplace.

USER DATA:
${ctx.my_orders?.length ? 'User Orders:\n' + ctx.my_orders.join('\n') : 'No orders yet for this user'}

${sharedKnowledge}

INSTRUCTIONS:
- Help users find products, understand features, track orders, and navigate ShopNekt
- DETECT the language of user's message and ALWAYS respond in the SAME language
- If user writes in Swahili → respond entirely in Swahili  
- If user writes in English → respond entirely in English
- Mix of languages? → respond in the dominant language
- Use real data (flash deals, orders, stores) in your answers
- Be friendly, helpful, and concise (max 200 words per response)
- You CANNOT process payments or access user location
- For navigation, give the URL path (e.g., "go to /flash-deals")`
  }
}

// ── Call AI model ─────────────────────────────────────────
async function callAI(systemPrompt: string, messages: Array<{role:string, content:string}>) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('No API key')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: systemPrompt,
      messages: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
    }),
  })

  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

// ── Main handler ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { message, messages = [], userId, storeId, shopName, shopCategory, mode = 'general' } = await req.json()
    if (!message?.trim()) return NextResponse.json({ reply: 'Please send a message.' })

    // Fetch real data from Supabase
    const ctx = await fetchContext(mode, storeId, userId)

    // Build system prompt with real data
    const systemPrompt = buildSystemPrompt(mode, shopName || 'ShopNekt Store', ctx)

    // Build message history
    const msgHistory = [
      ...messages.slice(-4).map((m: any) => ({ role: m.role === 'bot' ? 'assistant' : m.role, content: m.content })),
      { role: 'user', content: message }
    ]

    // Call AI model
    const reply = await callAI(systemPrompt, msgHistory)

    return NextResponse.json({ reply: reply || 'Samahani, jaribu tena.' })

  } catch (err: any) {
    console.error('360 AI error:', err.message)
    // Fallback if API fails
    const { message: msg } = await req.json().catch(() => ({ message: '' }))
    return NextResponse.json({
      reply: msg?.toLowerCase().includes('swahili') || msg?.includes('habari') || msg?.includes('nataka')
        ? '❌ Tatizo la muda limetokea. Tafadhali jaribu tena baadaye.'
        : '❌ A temporary error occurred. Please try again shortly.'
    }, { status: 200 })
  }
}
