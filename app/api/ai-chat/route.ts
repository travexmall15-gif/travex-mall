import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://bscecjbgnjitlfmgwcic.supabase.co',
  'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'
)

const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY || ''

export async function POST(req: Request) {
  const { store_id, message, session_id, history } = await req.json()

  // ── Fetch ALL store data in parallel ─────────────────────────────
  const [
    { data: storeData },
    { data: campusData },
    { data: products },
    { data: campusProducts },
    { data: orders },
    { data: vybePostsData },
  ] = await Promise.all([
    sb.from('pending_payments')
      .select('shop_name,shop_desc,shop_category,shop_region,owner_name,owner_phone,shop_whatsapp,plan,shop_color,created_at')
      .eq('id', store_id).maybeSingle(),

    sb.from('campus_stores')
      .select('store_name,description,category,university_abbr,whatsapp,phone,created_at')
      .eq('id', store_id).maybeSingle(),

    sb.from('campus_products')
      .select('name,price,stock,description,category,image_url')
      .eq('store_id', store_id)
      .gt('stock', 0)
      .order('created_at', { ascending: false })
      .limit(50),

    sb.from('products')
      .select('name,price,stock,description,category,image_url')
      .eq('store_id', store_id)
      .gt('stock', 0)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(r => r).catch(() => ({ data: null })),

    sb.from('orders')
      .select('id')
      .eq('store_id', store_id)
      .limit(1)
      .then(r => ({ data: r.data?.length || 0 }))
      .catch(() => ({ data: 0 })),

    sb.from('feed_posts')
      .select('content,post_text,caption,price,tag')
      .eq('store_id', store_id)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(r => r).catch(() => ({ data: null })),
  ])

  // ── Merge store info ───────────────────────────────────────────────
  const shop = storeData ? {
    name: storeData.shop_name,
    desc: storeData.shop_desc,
    category: storeData.shop_category,
    region: storeData.shop_region,
    owner: storeData.owner_name,
    phone: storeData.owner_phone,
    whatsapp: storeData.shop_whatsapp,
    plan: storeData.plan,
    since: storeData.created_at?.split('T')[0],
    type: 'business',
  } : campusData ? {
    name: campusData.store_name,
    desc: campusData.description,
    category: campusData.category,
    region: campusData.university_abbr,
    phone: campusData.phone,
    whatsapp: campusData.whatsapp,
    since: campusData.created_at?.split('T')[0],
    type: 'campus',
  } : null

  // ── Merge products ─────────────────────────────────────────────────
  const allProducts = [...(products || []), ...(campusProducts || [])]
    .filter((p, i, arr) => arr.findIndex(x => x.name === p.name) === i)

  const productList = allProducts.length > 0
    ? allProducts.map(p =>
        `• ${p.name} — TZS ${Number(p.price).toLocaleString('en-US')} (${p.stock} in stock)${p.category ? ` [${p.category}]` : ''}${p.description ? `\n  ${p.description}` : ''}`
      ).join('\n')
    : 'No products listed yet — the seller is still setting up.'

  // ── Recent posts context ─────────────────────────────────────────
  const recentPosts = (vybePostsData || []).map(p =>
    `• ${p.content || p.post_text || p.caption || ''}${p.price ? ` (TZS ${Number(p.price).toLocaleString()})` : ''}${p.tag ? ` #${p.tag}` : ''}`
  ).join('\n')

  // ── ARIA system prompt ─────────────────────────────────────────────
  const systemPrompt = `You are Aria, an intelligent and friendly AI shopping assistant for "${shop?.name || 'this shop'}" on Travex Mall, Tanzania's leading digital marketplace.

You have COMPLETE knowledge of this store. Your job is to help customers find products, answer questions, compare options, and guide them through placing an order — all within Travex Mall.

═══ STORE INFORMATION ═══
Name: ${shop?.name || 'Unknown'}
Description: ${shop?.desc || 'A shop on Travex Mall'}
Category: ${shop?.category || 'General'}
Region: ${shop?.region || 'Tanzania'}
Plan: ${shop?.plan === 'premium' ? 'Premium (Top-tier seller)' : shop?.plan === 'campus' ? 'Campus Seller' : 'Basic Seller'}
Active Since: ${shop?.since || 'Recently'}
Contact: ${(shop?.whatsapp || shop?.phone || '').replace(/\D/g, '') || 'Via Travex Mall'}

═══ AVAILABLE PRODUCTS (${allProducts.length} items) ═══
${productList}

${recentPosts ? `═══ RECENT PROMOTIONS ═══\n${recentPosts}` : ''}

═══ YOUR ROLE AS ARIA ═══
1. GREET customers warmly and make them feel welcome
2. ANSWER any question about this store and its products with confidence
3. RECOMMEND products based on what the customer needs
4. HELP customers compare products by price, features, availability
5. GUIDE customers through the ordering process step by step
6. INFORM customers about stock levels and pricing accurately
7. HANDLE complaints and questions professionally
8. COMMUNICATE naturally in both English and Kiswahili

═══ ORDER PROCESS YOU GUIDE ═══
When a customer wants to order:
- Ask them which product and how many
- Confirm the total price (price × quantity)
- Ask for their name and phone number
- Tell them the seller will confirm via WhatsApp or call
- Encourage them to click the product card to complete the order form

═══ TONE & STYLE ═══
- Warm, helpful and professional
- Mix English and Kiswahili naturally (e.g. "Sawa!" "Asante!" "Karibu!")
- Be concise but complete — no unnecessary filler
- Use product data accurately — never guess or make up prices
- If a product is not listed, say it honestly and suggest alternatives
- Keep responses short for simple questions, detailed for complex ones

IMPORTANT: You represent ${shop?.name || 'this shop'} professionally. Every response should make the customer feel confident and welcome.`

  // ── No API key fallback ────────────────────────────────────────────
  if (!CLAUDE_KEY) {
    const q = message.toLowerCase()
    let reply = ''

    if (q.includes('product') || q.includes('bidhaa') || q.includes('what') || q.includes('nini')) {
      reply = allProducts.length > 0
        ? `We have ${allProducts.length} products available:\n\n${allProducts.slice(0, 5).map(p => `• ${p.name} — TZS ${Number(p.price).toLocaleString()}`).join('\n')}\n\nWhich one interests you?`
        : `The seller is still adding products. Check back soon or message the seller directly.`
    } else if (q.includes('price') || q.includes('bei') || q.includes('cost') || q.includes('ghali')) {
      const prods = allProducts.slice(0, 3).map(p => `${p.name}: TZS ${Number(p.price).toLocaleString()}`).join(', ')
      reply = prods ? `Current prices: ${prods}` : 'No products listed yet.'
    } else if (q.includes('order') || q.includes('buy') || q.includes('nunua') || q.includes('pata')) {
      reply = `To place an order, click on any product card and fill in your name and phone number. The seller will confirm shortly! Which product would you like?`
    } else if (q.includes('hello') || q.includes('hi') || q.includes('habari') || q.includes('jambo') || q.includes('welcome')) {
      reply = `Karibu sana to ${shop?.name || 'our store'}! I am Aria, your shopping assistant. We have ${allProducts.length} products available. What are you looking for today?`
    } else {
      reply = `Hello! I am Aria, your assistant at ${shop?.name || 'this store'}. We have ${allProducts.length} products. Ask me about any product, price, or how to order!`
    }

    return NextResponse.json({ reply, session_id })
  }

  // ── Claude API call ────────────────────────────────────────────────
  const claudeMessages = (history || [])
    .slice(-10)
    .filter((m: any) => m.role === 'user' || m.role === 'bot')
    .map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }))
  claudeMessages.push({ role: 'user', content: message })

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        system: systemPrompt,
        messages: claudeMessages,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({
        reply: 'I am having trouble connecting right now. Please try again shortly.',
        session_id,
      })
    }

    const reply = data.content?.[0]?.text || 'Sorry, I could not process that. Please try again.'

    // Save session (non-blocking)
    sb.from('ai_chat_sessions').upsert({
      session_id,
      store_id,
      messages: [...(history || []).slice(-20), { role: 'user', content: message }, { role: 'bot', content: reply }],
      updated_at: new Date().toISOString(),
    }, { onConflict: 'session_id' }).catch(() => {})

    return NextResponse.json({ reply, session_id })

  } catch {
    return NextResponse.json({
      reply: 'I am temporarily unavailable. Please try again in a moment.',
      session_id,
    })
  }
}
