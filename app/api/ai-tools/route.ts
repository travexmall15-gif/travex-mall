import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://bscecjbgnjitlfmgwcic.supabase.co',
  'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'
)

const fmt = (n: number) => 'TZS ' + Number(n).toLocaleString('en-US')

const MARKET_PRICES: Record<string,{min:number,max:number,avg:number}> = {
  'Fashion & Clothing': {min:15000,max:250000,avg:45000},
  'Electronics':        {min:25000,max:2000000,avg:350000},
  'Food & Groceries':   {min:1000,max:50000,avg:8000},
  'Beauty & Health':    {min:5000,max:150000,avg:25000},
  'Agriculture':        {min:2000,max:500000,avg:40000},
  'Services':           {min:10000,max:500000,avg:80000},
  'Home & Living':      {min:10000,max:800000,avg:120000},
  'Sports & Fitness':   {min:15000,max:400000,avg:60000},
  'Education':          {min:5000,max:200000,avg:30000},
  'Automotive':         {min:20000,max:5000000,avg:200000},
  'Arts & Crafts':      {min:5000,max:300000,avg:45000},
  'General':            {min:1000,max:500000,avg:30000},
}

const HASHTAGS: Record<string,string[]> = {
  'Fashion & Clothing': ['#MtaaniStyle','#GlobalFashion','#DarFashion','#AfricanFashion'],
  'Electronics':        ['#TechGlobal','#GadgetsDar','#ElectronicsTZ','#TechAfrica'],
  'Food & Groceries':   ['#FoodLovers','#FoodOnline','#GlobalFood','#FreshFood'],
  'Beauty & Health':    ['#BeautyTZ','#SkincareGlobal','#NaturalBeauty','#GlowTZ'],
  'General':            ['#ShopNekt','#ShopOnlineGlobal','#NunuaOnline','#GlobalShopping'],
}

const EXPENSE_CATS = [
  {cat:'Rent',            kw:['rent','kodi','pango','nyumba','ofisi']},
  {cat:'Stock/Inventory', kw:['stock','bidhaa','malighafi','goods','purchase','buy','nunua']},
  {cat:'Transport',       kw:['transport','usafiri','daladala','pikipiki','fuel','petrol','nauli']},
  {cat:'Communication',   kw:['airtime','data','internet','wifi','simu','mpesa','airtel']},
  {cat:'Marketing',       kw:['ad','advert','tangazo','promotion','poster','boost']},
  {cat:'Bank/M-Pesa',     kw:['bank','mpesa','charge','fee','ada','commission','withdraw']},
  {cat:'Utilities',       kw:['umeme','maji','electricity','water','stima','luku','tanesco']},
  {cat:'Salary/Wages',    kw:['mshahara','salary','wage','worker','staff','employee']},
]

function catExpense(line: string): string {
  const l = line.toLowerCase()
  for (const {cat,kw} of EXPENSE_CATS) { if (kw.some(k=>l.includes(k))) return cat }
  return 'Other'
}

function extractAmt(line: string): number {
  const m = line.match(/[\d,]+/)
  return m ? parseInt(m[0].replace(/,/g,'')) : 0
}

function descTool(name:string,category:string,features:string,price:number,shopName:string){
  const tags = [...(HASHTAGS[category]||HASHTAGS['General']),'#ShopNekt','#ShopOnlineGlobal'].join(' ')
  const ps = price ? fmt(price) : ''
  const eng = `${name} — now available at ${shopName} on ShopNekt! ${features?`Key features: ${features}. `:''}${ps?`Priced at only ${ps}. `:''}Order now and get fast delivery worldwide. Quality guaranteed by a verified ShopNekt seller.`
  const swa = `${name} — inapatikana sasa hivi katika ${shopName} kwenye ShopNekt! ${features?`Maelezo: ${features}. `:''}${ps?`Bei yake ni ${ps} tu. `:''}Agiza sasa na kupata delivery haraka duniani kote.`
  return `ENGLISH VERSION:\n${eng}\n\nSWAHILI VERSION:\n${swa}\n\nHASHTAGS:\n${tags}`
}

function priceTool(name:string,price:number,cond:string,category:string){
  const m = MARKET_PRICES[category]||MARKET_PRICES['General']
  const mult:Record<string,number> = {'brand new':1,'slightly used':0.75,'used - good':0.55,'refurbished':0.65}
  const x = mult[cond]||1
  const [mn,mx,av] = [Math.round(m.min*x),Math.round(m.max*x),Math.round(m.avg*x)]
  let note = ''
  if (price>0){
    if (price<mn) note = `Your price ${fmt(price)} is BELOW market minimum. You can charge more.`
    else if (price>mx) note = `Your price ${fmt(price)} is ABOVE market maximum. Consider reducing.`
    else if (price<av*0.85) note = `Your price ${fmt(price)} is BELOW average — great for attracting buyers quickly.`
    else if (price>av*1.15) note = `Your price ${fmt(price)} is ABOVE average. Highlight premium quality to justify it.`
    else note = `Your price ${fmt(price)} is in the SWEET SPOT for global market!`
  }
  return `PRICE ADVICE: ${name} (${cond})\nCategory: ${category}\n\nTANZANIA MARKET RANGE:\n• Min: ${fmt(mn)}\n• Avg: ${fmt(av)}\n• Max: ${fmt(mx)}\n\n${note?`ASSESSMENT:\n${note}\n\n`:''}RECOMMENDED: ${fmt(av)}\n\nSTRATEGY:\n• Fast sales: ${fmt(Math.round(av*0.88))}\n• Normal: ${fmt(av)}\n• Premium: ${fmt(Math.round(av*1.12))}\n\nTIP: Run Flash Deals on weekends and month-end for best results.`
}

function reportTool(rev:number,exp:number,ords:number,prods:number,days:number,top:string[]){
  const profit=rev-exp
  const margin=rev>0?Math.round(profit/rev*100):0
  const avg=ords>0?Math.round(rev/ords):0
  const score=margin>30?8:margin>15?6:margin>0?4:2
  const label=['','','Needs Attention','','Fair','','Good','','Excellent'][score]||'Fair'
  const recs=[]
  if(prods<5) recs.push('Add more products — shops with 10+ products get 3x more views.')
  if(ords===0) recs.push('Create a Flash Deal to attract your first orders immediately.')
  if(margin<15&&rev>0) recs.push('Review expenses — target at least 20% profit margin.')
  recs.push('Post on Social Vybe daily to increase store visibility.')
  if(score<6) recs.push('Consider upgrading to Premium for top listing position in Business Market.')
  return `BUSINESS REPORT — LAST ${days} DAYS\n${'='.repeat(36)}\n\nFINANCIAL SUMMARY:\n• Revenue:  ${fmt(rev)}\n• Expenses: ${fmt(exp)}\n• Profit:   ${fmt(profit)}\n• Margin:   ${margin}%\n\nORDERS:\n• Total Orders: ${ords}\n• Avg Order:    ${fmt(avg)}\n• Products:     ${prods}\n\n${top.length?`TOP PRODUCTS:\n${top.map((p,i)=>`${i+1}. ${p}`).join('\n')}\n\n`:''}HEALTH SCORE: ${score}/10 — ${label}\n\nRECOMMENDATIONS:\n${recs.map((r,i)=>`${i+1}. ${r}`).join('\n')}`
}

function socialTool(product:string,platform:string,tone:string,offer:string,shopName:string,storeId:string){
  const link=`https://shopnekt.vercel.app/store/${storeId}`
  const offerLine=offer?`\nOFFER: ${offer}`:''
  const tags=(HASHTAGS['General']).join(' ')
  const posts:Record<string,string>={
    instagram: tone==='urgent/FOMO'?`LIMITED TIME — Do not miss out!\n\n${product}${offerLine}\n\nOrder before stock runs out!\n${link}\n\n${tags}`:tone==='professional'?`Introducing: ${product}\n\nAvailable at ${shopName}.${offer?`\n${offer}`:' Premium quality at competitive prices.'}\n\nShop: ${link}\n\n${tags}`:`${product} ipo dukani!\n\n${shopName} inakupa ${product} bora zaidi.${offerLine}\n\nAgiza hapa: ${link}\n\n${tags}`,
    whatsapp: `*${product}*${offerLine?`\n${offerLine}`:''}\n\nAvailable at ${shopName}\nOrder: ${link}`,
    facebook: `Habari friends!\n\n${shopName} tunakupa ${product}!${offerLine?`\n\n${offerLine}`:''} Quality guaranteed. Fast delivery worldwide.\n\nShop here: ${link}\n\nShare with friends!`,
  }
  if(platform==='all') return `INSTAGRAM:\n${posts.instagram}\n\n---\n\nWHATSAPP:\n${posts.whatsapp}\n\n---\n\nFACEBOOK:\n${posts.facebook}`
  return posts[platform]||posts.instagram
}

function waTool(type:string,detail:string,shopName:string,storeId:string){
  const link=`https://shopnekt.vercel.app/store/${storeId}`
  const t:Record<string,string>={
    'new product announcement':`*NEW ARRIVAL at ${shopName}!*\n\n${detail||'Check our latest products.'}\n\nOrder here: ${link}\nFast delivery. Quality guaranteed!`,
    'thank you after purchase':`*Thank you for your order!*\n\nDear customer, thank you for choosing ${shopName}. Your order${detail?` (${detail})`:''} is being processed. We appreciate your support!\n\nVisit again: ${link}`,
    'follow up - haven\'t ordered':`*Hello from ${shopName}!*\n\nWe noticed you visited our store. We have great products for you!${detail?`\n\nFeaturing: ${detail}`:''}\n\nShop now: ${link}`,
    'flash deal promotion':`*FLASH DEAL - Limited Time!*\n\n${detail||`Special discount at ${shopName}!`}\n\nHurry — offer ends soon!\n${link}`,
    'restocked item':`*BACK IN STOCK!*\n\n${detail||`Popular items are back at ${shopName}.`}\n\nGet yours: ${link}`,
    'holiday/festive greeting':`*Greetings from ${shopName}!*\n\nWishing you and your family all the best! Thank you for your continued support.\n\nFestive deals: ${link}`,
  }
  return t[type]||t['new product announcement']
}

function tipsTool(prods:number,ords:number,rev:number,vybes:number,plan:string,shopName:string){
  const tips:string[]=[]
  if(prods===0) tips.push(`ADD PRODUCTS FIRST: ${shopName} has no products. Add at least 5 products immediately — buyers cannot order what they cannot see.`)
  else if(prods<5) tips.push(`ADD MORE PRODUCTS: You have ${prods} product${prods===1?'':'s'}. Shops with 10+ products get 3x more views. Add 5 more this week.`)
  if(ords===0) tips.push(`GET YOUR FIRST ORDER: Create a Flash Deal with 10-15% discount on your best product. Flash Deals appear on the homepage and attract buyers fast.`)
  else if(ords<5) tips.push(`GROW YOUR ORDERS: You have ${ords} order${ords===1?'':'s'}. Post on Social Vybe daily with product photos to reach more buyers.`)
  if(vybes===0) tips.push(`POST ON SOCIAL VYBE: You have not posted on Social Vybe yet. Post your top 3 products today — Vybe posts drive direct traffic to your store.`)
  if(rev>0) tips.push(`INCREASE ORDER VALUE: Bundle 2-3 products together at a small discount. Bundles increase average order value by 40%.`)
  if(plan==='basic') tips.push(`UPGRADE TO PREMIUM: Premium sellers appear at the TOP of Business Market. With ${prods} products and ${ords} orders, upgrading (TZS 50,000/mo) will boost your visibility.`)
  const extras=[`RESPOND QUICKLY: Reply to messages within 1 hour. Fast sellers get 5-star reviews and repeat customers.`,`USE GOOD PHOTOS: Products with clear bright photos sell 3x faster. Take photos in natural daylight.`,`CREATE GROUP BUYS: Set up Group Buy deals to move inventory fast and attract bulk buyers.`]
  let i=0; while(tips.length<5&&i<extras.length) tips.push(extras[i++])
  return tips.slice(0,5).map((t,i)=>`TIP ${i+1}: ${t}`).join('\n\n')
}

function coachTool(q:string,ctx:any){
  const name=ctx?.shop_name||'your shop'
  const prods=ctx?.product_count||0
  const ords=ctx?.order_count||0
  const rev=ctx?.revenue||0
  if(/(price|bei|ngapi|cost|cheap|expensive)/i.test(q)) return `For ${name}, start by setting your price 10% below competitors to attract first buyers. Once you have 5+ reviews, raise prices. Use the Smart Price Advisor for specific product pricing.`
  if(/(customer|wateja|buyers|attract|draw)/i.test(q)) return `To attract more customers: (1) Post daily on Social Vybe. (2) Create a Flash Deal for your top product. (3) Ask satisfied customers to share your store link. Consistency is key — daily posters get 3x more visitors.`
  if(/(marketing|tangazo|promote|advertise)/i.test(q)) return `Best free marketing on ShopNekt: (1) WhatsApp Status — post products every morning. (2) Social Vybe — post with good photos. (3) Flash Deals — run weekend promos. (4) Group Buy — reward buyers who bring friends.`
  if(/(profit|faida|earn|pesa|money)/i.test(q)) return `To increase profit: (1) Reduce transport and M-Pesa charges. (2) Buy stock in bulk for better supplier prices. (3) Focus on your top 3 best-selling products. Target 20-30% margin per product. Your revenue so far: ${fmt(rev)}.`
  if(/(delivery|logistics|transport|shipping)/i.test(q)) return `Use ShopNekt Move for deliveries — connects you with verified bodaboda riders and drivers. Set clear timeframes (Dar: same day, other regions: 1-3 days). Customers appreciate predictability.`
  if(/(review|rating|feedback)/i.test(q)) return `To get good reviews: (1) Deliver on time. (2) Package products properly. (3) Follow up after delivery. (4) Resolve complaints immediately. Good reviews improve your search ranking on ShopNekt.`
  return `My advice for ${name}: Focus on three things this week — (1) add products if below 10, (2) post on Social Vybe daily, (3) create a Flash Deal. You have ${prods} products and ${ords} orders. ${ords===0?'Getting your first order is the most important step right now.':'Keep growing — every 10 orders builds your reputation.'} Ask me anything specific!`
}

export async function POST(req: Request) {
  const { tool, store_id, ...params } = await req.json()

  const [
    {data:storeRow},{data:products},{data:sales},{data:orders},{data:vybes},
  ] = await Promise.all([
    sb.from('pending_payments').select('shop_name,shop_category,plan').eq('id',store_id).maybeSingle(),
    sb.from('campus_products').select('name,price,category').eq('store_id',store_id),
    sb.from('seller_sales').select('amount,category,created_at').eq('store_id',store_id).order('created_at',{ascending:false}).limit(200),
    sb.from('orders').select('id,total_amount,created_at').eq('store_id',store_id).order('created_at',{ascending:false}).limit(100),
    sb.from('feed_posts').select('id').eq('store_id',store_id),
  ])

  const shopName=storeRow?.shop_name||'My Shop'
  const shopCat=storeRow?.shop_category||'General'
  const shopPlan=storeRow?.plan||'basic'
  let result=''

  switch(tool){
    case 'description': result=descTool(params.name||'',params.category||shopCat,params.features||'',Number(params.price)||0,shopName); break
    case 'price': result=priceTool(params.name||'',Number(params.price)||0,params.condition||'brand new',params.category||shopCat); break
    case 'report': {
      const days=parseInt(params.period)||30
      const since=new Date(); since.setDate(since.getDate()-days)
      const ps=(sales||[]).filter((s:any)=>new Date(s.created_at)>=since)
      const po=(orders||[]).filter((o:any)=>new Date(o.created_at)>=since)
      const rev=ps.filter((s:any)=>s.category!=='expense').reduce((a:number,s:any)=>a+Number(s.amount||0),0)
      const exp=ps.filter((s:any)=>s.category==='expense').reduce((a:number,s:any)=>a+Number(s.amount||0),0)
      result=reportTool(rev,exp,po.length,(products||[]).length,days,(products||[]).slice(0,3).map((p:any)=>`${p.name} — ${fmt(p.price)}`))
      break
    }
    case 'expenses': {
      const lines=(params.text||'').split('\n').filter((l:string)=>l.trim())
      const cats:Record<string,number>={}; let total=0
      const rows=lines.map((l:string)=>{const c=catExpense(l);const a=extractAmt(l);cats[c]=(cats[c]||0)+a;total+=a;return `${l.trim().padEnd(30)} -> ${c}${a?` (${fmt(a)})`:''}`})
      const sum=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([c,a])=>`• ${c}: ${fmt(a)} (${Math.round(a/total*100)}%)`).join('\n')
      result=`EXPENSE BREAKDOWN:\n${rows.join('\n')}\n\n---\n\nBY CATEGORY:\n${sum}\n\nTOTAL: ${fmt(total)}`
      break
    }
    case 'social': result=socialTool(params.product||'',params.platform||'instagram',params.tone||'casual and fun',params.offer||'',shopName,store_id); break
    case 'whatsapp': result=waTool(params.type||'new product announcement',params.detail||'',shopName,store_id); break
    case 'tips': {
      const rev=(orders||[]).reduce((a:number,o:any)=>a+Number(o.total_amount||0),0)
      result=tipsTool((products||[]).length,(orders||[]).length,rev,(vybes||[]).length,shopPlan,shopName)
      break
    }
    case 'coach': result=coachTool(params.message||'',{shop_name:shopName,product_count:(products||[]).length,order_count:(orders||[]).length,revenue:(orders||[]).reduce((a:number,o:any)=>a+Number(o.total_amount||0),0)}); break
    default: result='Unknown tool.'
  }

  return NextResponse.json({result})
}
