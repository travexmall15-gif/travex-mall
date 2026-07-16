// ═══════════════════════════════════════════════════════════════
// ARIA AI ENGINE — Dashboard Intelligence Layer
// No external API. Data-driven. Controls entire dashboard.
// ═══════════════════════════════════════════════════════════════

const ARIA = (() => {
  const SB_URL = 'https://bscecjbgnjitlfmgwcic.supabase.co'
  const SB_KEY = 'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'
  const fmt = n => 'TZS ' + Number(n||0).toLocaleString('en-US')

  // ── Supabase helper ─────────────────────────────────────────
  async function sb(table, method='GET', body=null, query='') {
    const res = await fetch(`${SB_URL}/rest/v1/${table}${query}`, {
      method,
      headers: {
        'apikey': SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : '',
      },
      body: body ? JSON.stringify(body) : null
    })
    return res.json()
  }

  // ── Session ─────────────────────────────────────────────────
  function getSession() {
    try { return JSON.parse(localStorage.getItem('travex_session') || '{}') } catch { return {} }
  }
  function getStoreId() { return getSession()?.id || '' }

  // ── Intent detection ─────────────────────────────────────────
  function detectIntent(msg) {
    const m = msg.toLowerCase()
    // COMMANDS
    if (/(ongeza|add|weka|ingiza).*(bidhaa|product)/i.test(m)) return 'ADD_PRODUCT'
    if (/(flash.deal|deal ya muda|discount deal)/i.test(m)) return 'CREATE_FLASH_DEAL'
    if (/(group.buy|group deal|nunua pamoja)/i.test(m)) return 'CREATE_GROUP_BUY'
    if (/(post.*vybe|vybe.*post|post.*social|chapisha)/i.test(m)) return 'CREATE_POST'
    if (/(futa|delete|ondoa).*(bidhaa|product)/i.test(m)) return 'DELETE_PRODUCT'
    if (/(hariri|edit|update|badilisha).*(bidhaa|product)/i.test(m)) return 'EDIT_PRODUCT'
    // QUERIES
    if (/(orders|amri|maombi).*(leo|today|wiki|week)/i.test(m)) return 'SHOW_ORDERS'
    if (/(revenue|mauzo|mapato).*(wiki|leo|mwezi|month)/i.test(m)) return 'SHOW_REVENUE'
    if (/(stock|bidhaa|inventory).*(chini|low|inakwisha)/i.test(m)) return 'CHECK_STOCK'
    if (/(customers|wateja|wanunuzi)/i.test(m)) return 'SHOW_CUSTOMERS'
    if (/(profit|faida|net)/i.test(m)) return 'SHOW_PROFIT'
    if (/(report|ripoti|muhtasari)/i.test(m)) return 'GENERATE_REPORT'
    // MARKETING
    if (/(post.*instagram|instagram.*post)/i.test(m)) return 'GEN_INSTAGRAM'
    if (/(post.*whatsapp|whatsapp.*post|status)/i.test(m)) return 'GEN_WHATSAPP'
    if (/(post.*facebook|facebook.*post)/i.test(m)) return 'GEN_FACEBOOK'
    if (/(marketing|tangazo|advertis)/i.test(m)) return 'MARKETING_IDEAS'
    if (/(message.*customers|tuma.*message|broadcast)/i.test(m)) return 'BROADCAST_MSG'
    // FINANCE
    if (/(projection|forecast|utabiri|mwakani|month.ijayo)/i.test(m)) return 'REVENUE_FORECAST'
    if (/(break.?even|faida.?kuanza|profit.?point)/i.test(m)) return 'BREAKEVEN'
    if (/(cash.?flow|pesa.?inayoingia)/i.test(m)) return 'CASH_FLOW'
    if (/(tax|tra|kodi|vat)/i.test(m)) return 'TAX_ESTIMATE'
    if (/(expense.*kubwa|gharama.*nyingi|costly)/i.test(m)) return 'TOP_EXPENSES'
    // ADVICE
    if (/(briefing|hali|status|vipi|leo)/i.test(m)) return 'DAILY_BRIEFING'
    if (/(tips|advice|ushauri|nasaha|improve|boresha)/i.test(m)) return 'SMART_TIPS'
    if (/(risk|hatari|tatizo|problem)/i.test(m)) return 'RISK_ANALYSIS'
    if (/(washindani|competition|market)/i.test(m)) return 'MARKET_INTEL'
    // GREETINGS
    if (/(hi|hello|habari|hujambo|salam|hebu|nipe)/i.test(m)) return 'GREETING'
    return 'GENERAL_HELP'
  }

  // ── Data fetchers ────────────────────────────────────────────
  async function fetchStore() {
    const id = getStoreId()
    if (!id) return null
    const [store] = await sb('pending_payments', 'GET', null, `?id=eq.${id}`)
    return store
  }

  async function fetchProducts() {
    const id = getStoreId()
    const session = getSession()
    // Business sellers use campus_products table (Travex Mall schema)
    const table = 'campus_products'
    return await sb(table, 'GET', null, `?store_id=eq.${id}&order=created_at.desc`)
  }

  async function fetchOrders(days=30) {
    const id = getStoreId()
    const since = new Date()
    since.setDate(since.getDate() - days)
    try {
      const data = await sb('orders', 'GET', null,
        `?store_id=eq.${id}&created_at=gte.${since.toISOString()}&order=created_at.desc&limit=100`)
      return Array.isArray(data) ? data : []
    } catch { return [] }
  }

  async function fetchSales(days=30) {
    const id = getStoreId()
    const since = new Date()
    since.setDate(since.getDate() - days)
    return await sb('seller_sales', 'GET', null,
      `?store_id=eq.${id}&created_at=gte.${since.toISOString()}&order=created_at.desc`)
  }

  async function fetchPosts() {
    const id = getStoreId()
    return await sb('feed_posts', 'GET', null, `?store_id=eq.${id}&order=created_at.desc&limit=10`)
  }

  // ── Command executors ─────────────────────────────────────────
  async function addProduct(name, price, stock, category, desc) {
    const id = getStoreId()
    const res = await sb('campus_products', 'POST', {
      store_id: id, name, price: Number(price)||0,
      stock: Number(stock)||1, category, description: desc,
      created_at: new Date().toISOString()
    })
    return res[0] ? `✅ Bidhaa "${name}" imeongezwa kwa mafanikio!\nBei: ${fmt(price)} | Stock: ${stock}` : '❌ Hitilafu imetokea. Jaribu tena.'
  }

  async function createFlashDeal(productName, discount, hours) {
    const id = getStoreId()
    const expiry = new Date()
    expiry.setHours(expiry.getHours() + (Number(hours)||24))
    const products = await fetchProducts()
    const product = products.find(p => p.name?.toLowerCase().includes(productName?.toLowerCase()))
    if (!product) return `❌ Sikupata bidhaa "${productName}". Tafadhali angalia jina na ujaribu tena.`
    const dealPrice = product.price * (1 - Number(discount)/100)
    await sb('flash_deals', 'POST', {
      store_id: id, product_id: product.id,
      product_name: product.name, original_price: product.price,
      deal_price: dealPrice, discount_pct: Number(discount),
      expires_at: expiry.toISOString(), status: 'active',
      created_at: new Date().toISOString()
    })
    return `✅ Flash Deal imeundwa!\n📦 ${product.name}\n💰 ${fmt(product.price)} → ${fmt(dealPrice)} (-${discount}%)\n⏰ Inakwisha: ${expiry.toLocaleString('en-GB')}`
  }

  async function createGroupBuy(productName, discount, minMembers) {
    const id = getStoreId()
    const products = await fetchProducts()
    const product = products.find(p => p.name?.toLowerCase().includes(productName?.toLowerCase()))
    if (!product) return `❌ Sikupata bidhaa "${productName}".`
    const dealPrice = product.price * (1 - Number(discount)/100)
    await sb('group_orders', 'POST', {
      store_id: id, product_name: product.name,
      unit_price: product.price, discount_pct: Number(discount),
      min_members: Number(minMembers)||3, current_members: 0,
      status: 'open', created_at: new Date().toISOString()
    })
    return `✅ Group Buy imeundwa!\n📦 ${product.name}\n💰 ${fmt(dealPrice)} ukiwa na watu ${minMembers}\n👥 Inahitaji watu ${minMembers} kujoin`
  }

  async function createVybePost(content, price, tag) {
    const id = getStoreId()
    const store = await fetchStore()
    await sb('feed_posts', 'POST', {
      store_id: id, shop_name: store?.shop_name,
      content, caption: content, price: Number(price)||null,
      tag, created_at: new Date().toISOString()
    })
    return `✅ Post imechapishwa kwenye Social Vybe!\n\n"${content}"\n\nWateja wataona post yako hivi karibuni.`
  }

  // ── Response generators ──────────────────────────────────────
  async function generateResponse(intent, msg, store, products, orders, sales) {
    const revenue = sales.filter(s=>s.type!=='expense').reduce((a,s)=>a+Number(s.amount||0),0)
    const expenses = sales.filter(s=>s.type==='expense').reduce((a,s)=>a+Number(s.amount||0),0)
    const profit = revenue - expenses
    const todayOrders = orders.filter(o=>{
      const d = new Date(o.created_at)
      const today = new Date()
      return d.toDateString() === today.toDateString()
    })
    const lowStock = products.filter(p=>p.stock <= 5)
    const shopName = store?.shop_name || 'duka lako'
    const storeLink = `https://travex-mall.vercel.app/store/${store?.id}`

    switch(intent) {

      case 'GREETING':
        return `Habari! Mimi ni Aria, msaidizi wako wa AI katika ${shopName}.\n\nLeo una:\n• Orders ${todayOrders.length} za leo\n• Products ${products.length} zilizopo\n• Revenue ya mwezi: ${fmt(revenue)}\n${lowStock.length > 0 ? `\n⚠️ Bidhaa ${lowStock.length} zina stock chini ya 5!` : ''}\n\nNinaweza kukusaidia na nini leo?`

      case 'DAILY_BRIEFING':
        return `📊 BRIEFING YA LEO — ${new Date().toLocaleDateString('en-GB')}\n\n🏪 ${shopName}\n\n💰 FEDHA:\n• Revenue (mwezi): ${fmt(revenue)}\n• Expenses: ${fmt(expenses)}\n• Profit: ${fmt(profit)} (${revenue>0?Math.round(profit/revenue*100):0}%)\n\n📦 ORDERS:\n• Leo: ${todayOrders.length}\n• Mwezi huu: ${orders.length}\n\n🛍️ BIDHAA:\n• Zote: ${products.length}\n• Chini ya stock: ${lowStock.length}\n\n${lowStock.length > 0 ? `⚠️ ALERT: ${lowStock.map(p=>`${p.name} (${p.stock} imebaki)`).join(', ')}\n\n` : ''}${orders.length === 0 ? '💡 TIP: Tengeneza Flash Deal kuvutia order ya kwanza.' : profit < 0 ? '💡 TIP: Gharama zinazidi mapato. Angalia expenses.' : '✅ Biashara inaendelea vizuri!'}`

      case 'SHOW_ORDERS':
        const recentOrders = orders.slice(0,5)
        if (!recentOrders.length) return `Hakuna orders bado. Tengeneza Flash Deal au post kwenye Social Vybe kuvutia wateja!`
        return `📦 ORDERS (${orders.length} total):\n\n${recentOrders.map((o,i)=>
          `${i+1}. ${o.customer_name||'Customer'} — ${fmt(o.total_amount)} [${(o.status||'pending').toUpperCase()}]`
        ).join('\n')}\n\n${orders.length > 5 ? `Na orders ${orders.length-5} zaidi. Nenda Orders page kuona zote.` : ''}`

      case 'SHOW_REVENUE':
        const weekly = orders.filter(o=>{ const d=new Date(o.created_at); const w=new Date(); w.setDate(w.getDate()-7); return d>=w }).reduce((a,o)=>a+Number(o.total_amount||0),0)
        return `💰 REVENUE SUMMARY:\n\n• Wiki hii: ${fmt(weekly)}\n• Mwezi huu: ${fmt(revenue)}\n• Expenses: ${fmt(expenses)}\n• Profit: ${fmt(profit)}\n• Margin: ${revenue>0?Math.round(profit/revenue*100):0}%\n\n${profit > 0 ? `✅ Biashara ina faida ya ${Math.round(profit/revenue*100)}%` : '⚠️ Bado hujafika faida. Punguza gharama au ongeza mauzo.'}`

      case 'CHECK_STOCK':
        if (!lowStock.length) return `✅ Stock iko sawa! Bidhaa zote zina akiba ya kutosha.\n\n${products.slice(0,5).map(p=>`• ${p.name}: ${p.stock} zimebaki`).join('\n')}`
        return `⚠️ BIDHAA ZINAZOKWISHA:\n\n${lowStock.map(p=>`• ${p.name}: ${p.stock} tu zimebaki!`).join('\n')}\n\nNakushauri uorder upya stock haraka kabla ya kukosa wateja.`

      case 'SHOW_PROFIT':
        return `📊 UCHAMBUZI WA FAIDA:\n\nRevenue: ${fmt(revenue)}\nExpenses: ${fmt(expenses)}\nProfit: ${fmt(profit)}\n\n${profit > 0 ? `✅ Margin yako ni ${Math.round(profit/revenue*100)}%. ${profit/revenue > 0.3 ? 'Nzuri sana!' : 'Jaribu kufikia 30%+'}` : '❌ Unapoteza pesa. Punguza expenses au panda bei.'}`

      case 'GENERATE_REPORT':
        const topProducts = [...new Map(orders.map(o=>[o.product_name,o])).values()].slice(0,3)
        return `📋 BUSINESS REPORT — ${new Date().toLocaleDateString('en-GB')}\n\n${shopName}\n${'─'.repeat(30)}\n\nREVENUE: ${fmt(revenue)}\nEXPENSES: ${fmt(expenses)}\nPROFIT: ${fmt(profit)}\nORDERS: ${orders.length}\nPRODUCTS: ${products.length}\n\n${topProducts.length?`TOP PRODUCTS:\n${topProducts.map((p,i)=>`${i+1}. ${p.product_name}`).join('\n')}\n\n`:''}HEALTH SCORE: ${profit>0&&orders.length>5?'8/10 Good':orders.length>0?'5/10 Growing':'3/10 Early Stage'}`

      case 'GEN_INSTAGRAM':
        const instaProduct = products[0]
        return `📸 INSTAGRAM POST:\n\n${instaProduct ? `✨ ${instaProduct.name} — ${fmt(instaProduct.price)}\n\nQuality yako. Bei yako. Delivered hadi kwako!\n\nAgiza sasa: ${storeLink}\n\n#TanzaniaFashion #${(shopName||'').replace(/\s+/g,'')} #TravexMall #ShopOnlineTZ #NunuaOnline` : `✨ ${shopName} — Tanzania's trusted seller!\n\nQuality products. Fast delivery. Verified seller.\n\nShop now: ${storeLink}\n\n#TanzaniaShops #TravexMall #ShopOnlineTZ`}`

      case 'GEN_WHATSAPP':
        return `📱 WHATSAPP STATUS:\n\n*${shopName}* - Tunakuletea bidhaa bora!\n\n${products.slice(0,3).map(p=>`✅ ${p.name} — ${fmt(p.price)}`).join('\n')}\n\nAgiza hapa: ${storeLink}\nDelivery Tanzania nzima!`

      case 'GEN_FACEBOOK':
        return `📘 FACEBOOK POST:\n\nHabari Facebook family! 👋\n\n${shopName} tuna deals nzuri leo!\n\n${products.slice(0,3).map(p=>`• ${p.name} — ${fmt(p.price)}`).join('\n')}\n\nClick kununua: ${storeLink}\n\nShare this post to help your friends shop too!`

      case 'MARKETING_IDEAS':
        return `🎯 MARKETING IDEAS KWA ${(shopName||'').toUpperCase()}:\n\n1. POST DAILY — Chapisha picha mpya ya bidhaa kila siku kwenye Social Vybe\n2. FLASH DEALS WEEKEND — Run deals Ijumaa-Jumapili wateja wana pesa zaidi\n3. WHATSAPP STATUS — Update status kila asubuhi na bidhaa moja + bei\n4. GROUP BUY — Tengeneza deal ya kununua pamoja savings kubwa\n5. CUSTOMER PHOTOS — Omba wateja wakupigishie picha na bidhaa yako\n6. SEASON DEALS — Tengeneza deals za holidays (Easter, Eid, Christmas)\n7. REFERRAL — Mpe customer discount 5% akimleta rafiki\n\n💡 Anza na tip 1 leo — piga picha ya bidhaa yako bora na nipe caption niandike post yako!`

      case 'BROADCAST_MSG':
        const customerCount = [...new Set(orders.map(o=>o.customer_phone).filter(Boolean))].length
        return `📢 BROADCAST MESSAGE\n\nUna customers ${customerCount} wa unique.\n\nHapa template unaweza kutumia WhatsApp:\n\n---\n*Habari ${shopName} customers!*\n\nTunashukuru support yenu! Leo tuna:\n${products.slice(0,3).map(p=>`✅ ${p.name} — ${fmt(p.price)}`).join('\n')}\n\nAgiza hapa: ${storeLink}\n---\n\nNenda Settings > Contacts kupata nambari za customers wako.`

      case 'REVENUE_FORECAST':
        const monthlyAvg = revenue / Math.max(orders.length, 1) * Math.max(orders.length, 1)
        const growth = orders.length > 10 ? 1.15 : orders.length > 5 ? 1.10 : 1.05
        const forecast = monthlyAvg * growth
        return `📈 REVENUE FORECAST:\n\nMwezi huu (actual): ${fmt(revenue)}\nMwezi ujao (projected): ${fmt(forecast)}\nGrowth expected: ${Math.round((growth-1)*100)}%\n\nKWA KUFIKIA FORECAST:\n${forecast > revenue ? `• Ongeza orders ${Math.ceil((forecast-revenue)/Math.max(revenue/Math.max(orders.length,1),1))} zaidi\n• Chapisha posts ${Math.ceil(30/7)} za wiki\n• Tengeneza Flash Deal 2 kwa mwezi` : '• Endelea na pace ya sasa — unafanya vizuri!'}\n\nProjection inategemea trend ya sasa. Actual inaweza kutofautiana.`

      case 'BREAKEVEN':
        const avgPrice = products.length ? products.reduce((a,p)=>a+Number(p.price||0),0)/products.length : 0
        const avgCost = avgPrice * 0.6
        const unitsNeeded = expenses > 0 ? Math.ceil(expenses / (avgPrice - avgCost)) : 0
        return `📊 BREAK-EVEN ANALYSIS:\n\nExpenses (mwezi): ${fmt(expenses)}\nAverage price yako: ${fmt(avgPrice)}\nEstimated cost/unit: ${fmt(avgCost)}\nProfit per sale: ${fmt(avgPrice - avgCost)}\n\n✅ UNAHITAJI KUUZA: ${unitsNeeded} bidhaa/mwezi kufika break-even\n\nSasa una orders ${orders.length}/mwezi.\n${orders.length >= unitsNeeded ? '🎉 Umeshafika break-even!' : `📌 Bado unahitaji sales ${unitsNeeded - orders.length} zaidi.`}`

      case 'CASH_FLOW':
        const inflow = revenue
        const outflow = expenses
        const net = inflow - outflow
        return `💸 CASH FLOW PROJECTION (Wiki 4):\n\nWEEK 1: +${fmt(inflow/4)} | -${fmt(outflow/4)} = ${fmt(net/4)}\nWEEK 2: +${fmt(inflow/4)} | -${fmt(outflow/4)} = ${fmt(net/4)}\nWEEK 3: +${fmt(inflow/4)} | -${fmt(outflow/4)} = ${fmt(net/4)}\nWEEK 4: +${fmt(inflow/4)} | -${fmt(outflow/4)} = ${fmt(net/4)}\n\nNET MONTH TOTAL: ${fmt(net)}\n${net > 0 ? '✅ Cash flow iko positive' : '⚠️ Cash flow iko negative — reduce expenses'}`

      case 'TAX_ESTIMATE':
        const taxable = revenue * 0.18
        const vat = revenue >= 100000000 ? revenue * 0.18 : 0
        return `🏛️ TAX ESTIMATE (Tanzania):\n\nRevenue: ${fmt(revenue)}\n\nVAT (18%) — applicable ukizidi TZS 100M/yr:\n${revenue * 12 >= 100000000 ? fmt(vat) : 'Bado chini ya threshold'}\n\nIncome Tax (30% ya profit):\n${fmt(profit * 0.30)}\n\nWithholding Tax (5% kwenye services):\nAngalia aina ya bidhaa\n\n⚠️ DISCLAIMER: Hizi ni estimates tu. Wasiliana na TRA au accountant kwa ushauri rasmi.`

      case 'TOP_EXPENSES':
        return `💸 TOP EXPENSES ANALYSIS:\n\nKulingana na rekodi zako:\n${expenses > 0 ? `Total Expenses: ${fmt(expenses)}\n\nCategories zinazoweza kufanywa:\n• Stock/Inventory — punguza kwa kununua bulk\n• Transport — tumia Travex Move kwa bei nzuri\n• Communication — pata business data bundle\n• Marketing — tumia free platforms (Vybe, WhatsApp)\n\nTip: Angalia Accounting > Expenses kwa breakdown kamili.` : 'Bado hujasajili expenses yoyote. Nenda Accounting > Record ukisajili.'}`

      case 'RISK_ANALYSIS':
        const risks = []
        if (lowStock.length > 2) risks.push(`⚠️ Stock chini: Bidhaa ${lowStock.length} zinakwisha`)
        if (orders.length === 0) risks.push('⚠️ Hakuna orders: Biashara haina mauzo')
        if (profit < 0) risks.push('⚠️ Upotevu: Expenses zinazidi revenue')
        if (products.length < 3) risks.push('⚠️ Products chache: Ongeza bidhaa kuvutia wateja')
        if (!risks.length) return `✅ RISK ASSESSMENT:\n\nHakuna hatari kubwa zilizoonekana!\nBiashara yako iko salama kwa sasa.\n\nEndelea:\n• Angalia stock kila wiki\n• Post kwenye Vybe kila siku\n• Track expenses kila transaction`
        return `🚨 RISK ASSESSMENT:\n\n${risks.join('\n')}\n\nSOLUTIONS:\n${risks.map(r => r.includes('Stock') ? '• Order stock upya haraka' : r.includes('orders') ? '• Tengeneza Flash Deal leo' : r.includes('Upotevu') ? '• Reduce expenses, panda bei' : '• Ongeza bidhaa 5+ wiki hii').join('\n')}`

      case 'SMART_TIPS':
        const tips = []
        if (products.length < 5) tips.push('📦 Ongeza bidhaa zaidi — shops zenye 10+ bidhaa zinapata 3x views zaidi')
        if (orders.length === 0) tips.push('⚡ Tengeneza Flash Deal leo — inakuvutia order ya kwanza haraka')
        if (lowStock.length) tips.push(`🔄 Restock: ${lowStock.map(p=>p.name).join(', ')}`)
        tips.push('📸 Piga picha nzuri — bidhaa zenye picha nzuri zinauzwa 3x haraka')
        tips.push('💬 Jibu messages haraka — response < 1hr inakupa 5-star reviews')
        if (profit > 0) tips.push('📈 Upgrade to Premium — Premium sellers wanaonekana juu zaidi kwenye listings')
        return `💡 SMART TIPS KWA ${(shopName||'').toUpperCase()}:\n\n${tips.slice(0,5).map((t,i)=>`${i+1}. ${t}`).join('\n\n')}`

      case 'MARKET_INTEL':
        return `🌍 MARKET INTELLIGENCE — Tanzania 2026:\n\n📈 TRENDING CATEGORIES:\n• Fashion & Clothing — Mahitaji makubwa Dar es Salaam\n• Electronics — Smartphones, accessories zinauzwa sana\n• Beauty & Health — Growing market, margins nzuri\n• Food & Groceries — Consistent demand, competition kubwa\n\n💰 PRICE INSIGHTS:\n• Customers watafuta bei nafuu Ijumaa-Jumapili\n• Month-end (27-31) ni peak buying days\n• Flash Deals zinaincrease sales 40% average\n\n🏆 TIPS ZA KUSHINDA WASHINDANI:\n• Response time < 1 hour\n• Clear product photos\n• Competitive pricing ±5% ya market\n• Consistent Social Vybe presence`

      default:
        return `Samahani sikuelewa vizuri. Ninaweza kukusaidia na:\n\n📊 "nionyeshe revenue ya mwezi"\n📦 "angalia stock inayokwisha"\n📈 "fanya revenue forecast"\n📱 "tengeneza Instagram post"\n⚡ "unda flash deal ya [bidhaa] na [%] discount"\n💡 "nipe tips za kuboresha biashara"\n📋 "tengeneza report"\n\nSema amri yoyote na nitafanya kazi mara moja!`
    }
  }

  // ── Parse commands for ADD_PRODUCT etc ──────────────────────
  async function executeCommand(intent, msg, store, products) {
    // ADD_PRODUCT: "ongeza bidhaa Laptop HP, 650000, stock 5, Electronics"
    if (intent === 'ADD_PRODUCT') {
      const nameMatch = msg.match(/(?:bidhaa|product|add|ongeza)\s+([^,\d]+?)(?:,|bei|price|\d|$)/i)
      const priceMatch = msg.match(/(?:bei|price|tzs|sh)?\s*[\s:]?\s*([\d,]+)/i)
      const stockMatch = msg.match(/stock\s*:?\s*(\d+)/i)
      const catMatch = msg.match(/(fashion|electronics|food|beauty|agriculture|services|home|sports|education)/i)
      const name = nameMatch?.[1]?.trim() || 'Bidhaa Mpya'
      const price = priceMatch?.[1]?.replace(/,/g,'') || '0'
      const stock = stockMatch?.[1] || '1'
      const cat = catMatch?.[1] || 'General'

      if (name === 'Bidhaa Mpya') {
        return `Ili kuongeza bidhaa, niambie:\n📦 Jina: [jina la bidhaa]\n💰 Bei: [bei]\n📊 Stock: [idadi]\n\nMfano: "Ongeza bidhaa Nike Shoes, bei 45000, stock 10, Fashion"`
      }
      return await addProduct(name, price, stock, cat, '')
    }

    if (intent === 'CREATE_FLASH_DEAL') {
      const productMatch = msg.match(/(?:ya|of|deal|flash)\s+([^,\d]+?)(?:,|\d|na|with|$)/i)
      const discountMatch = msg.match(/(\d+)\s*%/i)
      const hoursMatch = msg.match(/(?:saa|hours?|hrs?)\s*(\d+)/i)
      const product = productMatch?.[1]?.trim()
      const discount = discountMatch?.[1] || '10'
      const hours = hoursMatch?.[1] || '24'

      if (!product) {
        return `Niambie:\n⚡ "Unda flash deal ya [bidhaa] na [%] discount kwa [masaa] masaa"\n\nMfano: "Unda flash deal ya Laptop na 15% discount kwa 48 masaa"`
      }
      return await createFlashDeal(product, discount, hours)
    }

    if (intent === 'CREATE_GROUP_BUY') {
      const productMatch = msg.match(/(?:ya|of|group|pamoja)\s+([^,\d]+?)(?:,|\d|na|with|$)/i)
      const discountMatch = msg.match(/(\d+)\s*%/i)
      const membersMatch = msg.match(/(?:watu|members?|people)\s*(\d+)/i)
      const product = productMatch?.[1]?.trim()
      return product
        ? await createGroupBuy(product, discountMatch?.[1]||'10', membersMatch?.[1]||'3')
        : `Niambie: "Unda group buy ya [bidhaa] na [%] discount, watu [nambari]"\n\nMfano: "Unda group buy ya Phone na 20% discount, watu 5"`
    }

    if (intent === 'CREATE_POST') {
      const productRef = products?.[0]?.name || 'bidhaa yetu'
      const shopName = store?.shop_name || 'duka letu'
      const content = msg.replace(/(post.*vybe|vybe.*post|chapisha)/gi,'').trim() ||
        `${productRef} inapatikana ${shopName}! Quality guaranteed. Agiza sasa.`
      const priceMatch = msg.match(/(\d+)/i)
      return await createVybePost(content, priceMatch?.[1]||null, 'offer')
    }

    return null
  }

  // ── Public API ───────────────────────────────────────────────
  return {
    async chat(msg, history=[]) {
      const intent = detectIntent(msg)
      const storeId = getStoreId()
      if (!storeId) return { reply: 'Tafadhali ingia kwanza (Login) ili Aria akusaidie.', intent }

      const [store, products, orders, sales] = await Promise.all([
        fetchStore(), fetchProducts(), fetchOrders(), fetchSales()
      ])

      // Try command execution first
      const commandResult = await executeCommand(intent, msg, store, products)
      if (commandResult) return { reply: commandResult, intent, action: intent }

      // Otherwise generate response
      const reply = await generateResponse(intent, msg, store, products, orders, sales)
      return { reply, intent }
    },

    getStoreId,
    fetchStore,
    fetchProducts,
    fetchOrders,
    fetchSales,
    fetchPosts,
    fmt,
  }
})()
