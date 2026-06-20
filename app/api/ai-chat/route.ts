import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://bscecjbgnjitlfmgwcic.supabase.co',
  'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'
)

const GEMINI_KEY = process.env.GEMINI_API_KEY || ''

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

  const systemPrompt = `You are an AI sales assistant for "${shop.shop_name}" on Travex Mall Tanzania.

SHOP INFO:
${shop.shop_desc || 'A great shop on Travex Mall'}

AVAILABLE PRODUCTS:
${productList || 'No products listed yet'}

PAYMENT & CONTACT:
WhatsApp: ${(shop.shop_whatsapp || shop.owner_phone || '').replace(/\D/g,'')}

YOUR RULES:
1. Answer ONLY about this shop's products
2. Help customers with prices, availability, sizes, colors
3. Guide customers to place an order or contact via WhatsApp
4. Be friendly, helpful and speak naturally (can mix English/Swahili like Tanzanians do)
5. When customer wants to buy, say "Place an order using the Order button on this page or WhatsApp us!"
6. Keep responses SHORT (2-3 sentences max)
7. If you don't know something, say "Please WhatsApp us for more details"`

  if (!GEMINI_KEY) {
    // Fallback without AI key
    const lmsg = message.toLowerCase()
    let reply = ''
    if (lmsg.includes('bei') || lmsg.includes('price') || lmsg.includes('ngapi')) {
      const prods = (products || []).slice(0, 3).map(p => `${p.name}: TZS ${Number(p.price).toLocaleString()}`).join(', ')
      reply = prods ? `Our prices: ${prods}. Use the Order button to buy! 🛍️` : "Please WhatsApp us for prices!"
    } else if (lmsg.includes('stock') || lmsg.includes('available') || lmsg.includes('ipo')) {
      const inStock = (products||[]).filter(p => p.stock > 0)
      reply = inStock.length > 0 ? `Yes, we have ${inStock.length} products in stock! Check them above.` : "Contact us on WhatsApp for availability."
    } else if (lmsg.includes('order') || lmsg.includes('buy') || lmsg.includes('nunua')) {
      reply = `To order, click the "Order" button on any product above, or WhatsApp us directly! 📱`
    } else {
      reply = `Hi! I'm the ${shop.shop_name} assistant. Ask me about our products, prices, or how to order! 😊`
    }
    return NextResponse.json({ reply, session_id })
  }

  // Build chat history for Gemini
  const geminiHistory = (history || []).map((m: any) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }))

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [
          ...geminiHistory,
          { role: 'user', parts: [{ text: message }] }
        ],
        generationConfig: { maxOutputTokens: 150, temperature: 0.7 }
      })
    }
  )

  const data = await res.json()
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Samahani, try again! 😊"

  // Save to chat session
  await sb.from('ai_chat_sessions').upsert({
    session_id,
    store_id,
    messages: [...(history || []), { role: 'user', content: message }, { role: 'bot', content: reply }],
    updated_at: new Date().toISOString()
  }, { onConflict: 'session_id' })

  return NextResponse.json({ reply, session_id })
}
