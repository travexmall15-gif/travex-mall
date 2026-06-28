import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://bscecjbgnjitlfmgwcic.supabase.co',
  'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'
)

const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY || ''

export async function POST(req: Request) {
  const { store_id, message, session_id, history } = await req.json()

  // Get store info + products
  const { data: products } = await sb.from('campus_products')
    .select('name,price,stock,description,category')
    .eq('store_id', store_id).gt('stock', 0).limit(20)

  const { data: storeData } = await sb.from('pending_payments')
    .select('shop_name,shop_desc,shop_category,owner_phone,shop_whatsapp')
    .eq('id', store_id).maybeSingle()

  const { data: campusStore } = !storeData ? await sb.from('campus_stores')
    .select('store_name,description,category,whatsapp,phone')
    .eq('id', store_id).maybeSingle() : { data: null }

  const shop = storeData || {
    shop_name: campusStore?.store_name,
    shop_desc: campusStore?.description,
    owner_phone: campusStore?.phone,
    shop_whatsapp: campusStore?.whatsapp,
  }

  const productList = (products || []).map(p =>
    `- ${p.name}: TZS ${Number(p.price).toLocaleString()} (${p.stock} in stock)${p.description ? ' — ' + p.description : ''}`
  ).join('\n')

  const systemPrompt = `You are an intelligent AI assistant for "${shop?.shop_name || 'a shop'}" on Travex Mall, Tanzania's digital marketplace.

SHOP INFO:
${shop?.shop_desc || 'A shop on Travex Mall'}

AVAILABLE PRODUCTS:
${productList || 'No products listed yet'}

CONTACT:
WhatsApp: ${(shop?.shop_whatsapp || shop?.owner_phone || '').replace(/\D/g, '')}

YOUR CAPABILITIES:
1. Write product descriptions (English + Swahili)
2. Give pricing advice for Tanzania market
3. Generate social media posts (Instagram, WhatsApp, Facebook)
4. Analyze business data and give reports
5. Categorize expenses
6. Write WhatsApp customer messages
7. Give business coaching advice specific to Tanzania
8. Help with marketing strategies

RULES:
- Be helpful, practical and specific to Tanzania market
- Can naturally mix English and Swahili (Tanzanian style)
- Keep responses concise but thorough
- Use emojis moderately
- When asked about products, use the actual product data above
- Give actionable advice, not generic tips`

  if (!CLAUDE_KEY) {
    // Fallback without API key
    const lmsg = message.toLowerCase()
    let reply = ''
    if (lmsg.includes('description') || lmsg.includes('maelezo')) {
      reply = 'To generate AI descriptions, please set up your ANTHROPIC_API_KEY in Vercel environment variables. Go to vercel.com → Settings → Environment Variables.'
    } else if (lmsg.includes('price') || lmsg.includes('bei')) {
      const prods = (products || []).slice(0, 3).map(p => `${p.name}: TZS ${Number(p.price).toLocaleString()}`).join(', ')
      reply = prods ? `Your current prices: ${prods}. For AI pricing advice, set up ANTHROPIC_API_KEY in Vercel.` : 'Add products first, then I can help with pricing!'
    } else if (lmsg.includes('report') || lmsg.includes('ripoti')) {
      reply = `Quick stats: ${(products||[]).length} products in stock. For full AI reports, set up ANTHROPIC_API_KEY in Vercel.`
    } else {
      reply = `Hi! I'm the AI assistant for ${shop?.shop_name || 'your shop'}. To unlock full AI features (descriptions, pricing, marketing, coaching), set up ANTHROPIC_API_KEY in Vercel environment variables. 🤖`
    }
    return NextResponse.json({ reply, session_id })
  }

  // Build Claude messages
  const claudeMessages = (history || []).slice(-8).map((m: any) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.content
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
        max_tokens: 1024,
        system: systemPrompt,
        messages: claudeMessages,
      })
    })

    const data = await res.json()
    const reply = data.content?.[0]?.text || 'Sorry, please try again! 😊'

    // Save to chat session
    await sb.from('ai_chat_sessions').upsert({
      session_id,
      store_id,
      messages: [...(history || []), { role: 'user', content: message }, { role: 'bot', content: reply }],
      updated_at: new Date().toISOString()
    }, { onConflict: 'session_id' }).catch(() => {})

    return NextResponse.json({ reply, session_id })
  } catch (e: any) {
    return NextResponse.json({
      reply: 'AI is temporarily unavailable. Error: ' + (e.message || 'Unknown'),
      session_id
    })
  }
}
