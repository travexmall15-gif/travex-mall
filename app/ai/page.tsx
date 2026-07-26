'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import {
  ArrowLeft, Send, Copy, RotateCcw, Trash2,
  Search, Store, TrendingUp, MapPin, Package, Zap, Check,
} from 'lucide-react'

type Result = {
  id: string; shop_name: string; shop_slug: string | null
  shop_category: string | null; shop_region: string | null; shop_logo: string | null
  plan: string; match_reason: string
  products?: { name: string; price: number }[]
}
type TFn = (key: string, vars?: Record<string, string | number>) => string
type ChatMsg = {
  id: string; role: 'user' | 'ai'; content: string
  results?: Result[]; ts: Date; isTyping?: boolean; queryUsed?: string
}

const CATEGORIES = ['Electronics','Fashion','Food','Beauty','Home','Books','Sports','Accessories','Kids','Health']
const CITIES     = ['Dar es Salaam','Arusha','Mwanza','Dodoma','Moshi','Zanzibar','Tanga','Morogoro']
const CAT_MAP: Record<string,string[]> = {
  Electronics: ['simu','phone','laptop','computer','gadget','charger','tv','electronics'],
  Fashion:     ['shoes','viatu','nguo','clothes','dress','shirt','bag','fashion','jeans'],
  Food:        ['chakula','food','groceries','mkate','nyama','matunda','mboga','juice'],
  Beauty:      ['beauty','makeup','skin','hair','nywele','sabuni','lotion','perfume'],
}
const CITY_KW: Record<string,string[]> = {
  'Dar es Salaam':['dar','kariakoo','ubungo','temeke'],
  'Arusha':['arusha'],'Mwanza':['mwanza'],'Zanzibar':['zanzibar','unguja'],
}
const SELLER_KW  = ['sell','seller','muuzaji','open store','open shop','fungua duka','become a seller','niwe muuzaji','kuwa muuzaji','start selling','anza kuuza']
const TRACK_KW   = ['track','order status','oda yangu','fuatilia oda','where is my order','track order','fuatilia']
const COMPARE_KW = ['compare','linganisha','vs ','versus','difference between']
const SKIP_W     = ['nataka','ninatafuta','tafuta','find','nipe','please','na','ya','la','wa','za','kwa','niulize','show','me']
const pause      = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
const fmt        = (d: Date) => d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})

export default function AiPage() {
  const router = useRouter()
  const { t, lang } = useTranslation()

  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input,    setInput]    = useState('')
  const [budget,   setBudget]   = useState('')
  const [category, setCategory] = useState('')
  const [city,     setCity]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [copiedId, setCopiedId] = useState<string|null>(null)
  const [dots,     setDots]     = useState('.')

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}) }, [messages])
  useEffect(() => {
    if (!loading) { setDots('.'); return }
    const iv = setInterval(() => setDots(d => d.length>=3?'.':d+'.'), 400)
    return () => clearInterval(iv)
  }, [loading])

  const addMsg   = (m: ChatMsg) => setMessages(p => [...p, m])
  const patchMsg = (id: string, patch: Partial<ChatMsg>) =>
    setMessages(p => p.map(m => m.id===id ? {...m,...patch} : m))

  function typeInto(id: string, text: string, results?: Result[]) {
    let i = 0
    const iv = setInterval(() => {
      i++
      setMessages(p => p.map(m =>
        m.id===id ? {...m, content:text.slice(0,i), isTyping:i<text.length} : m
      ))
      if (i >= text.length) {
        clearInterval(iv)
        setMessages(p => p.map(m =>
          m.id===id ? {...m, isTyping:false, ...(results!==undefined?{results}:{})} : m
        ))
      }
    }, 14)
  }

  async function searchShops(query: string): Promise<Result[]> {
    const budgetNum = budget
      ? parseInt(budget.replace(/,/g,'')) * (budget.toLowerCase().endsWith('k')?1000:1)
      : 0
    const lq = query.toLowerCase()
    let cat = category
    if (!cat) { for (const [c,kws] of Object.entries(CAT_MAP)) { if(kws.some(k=>lq.includes(k))){cat=c;break} } }
    let loc = city
    if (!loc) { for (const [c,kws] of Object.entries(CITY_KW)) { if(kws.some(k=>lq.includes(k))){loc=c;break} } }
    let q: any = sb.from('pending_payments').select('id,shop_name,shop_slug,shop_category,shop_region,shop_logo,plan,shop_desc').eq('status','approved').limit(30)
    if (cat) q = q.ilike('shop_category',`%${cat}%`)
    if (loc) q = q.ilike('shop_region',`%${loc}%`)
    const { data: shops } = await q
    const enriched: Result[] = []
    for (const shop of (shops||[]).slice(0,15)) {
      let pq: any = sb.from('products').select('name,price').eq('shop_id',shop.id).eq('is_available',true).limit(4)
      if (budgetNum>0) pq = pq.lte('price',budgetNum)
      const terms = query.split(' ').filter(w=>w.length>2&&!SKIP_W.includes(w.toLowerCase()))
      if (terms.length) pq = pq.or(terms.map((t:string)=>`name.ilike.%${t}%`).join(','))
      const { data: products } = await pq
      const textMatch = terms.some((term:string)=>
        shop.shop_name?.toLowerCase().includes(term.toLowerCase())||
        shop.shop_description?.toLowerCase().includes(term.toLowerCase())
      )
      if (products?.length||textMatch) {
        const why: string[] = []
        if (products?.length) why.push(`${products.length} product${products.length>1?'s':''} found`)
        if (budgetNum>0&&products?.length) why.push(`TZS ${budgetNum.toLocaleString()}`)
        if (loc) why.push(`\uD83D\uDCCD ${loc}`)
        enriched.push({...shop, match_reason:why.join(' \u00B7 ')||'Verified store', products:products||[], rating:shop.rating||0})
      }
    }
    if (!enriched.length) {
      const { data: fb } = await sb.from('pending_payments').select('id,shop_name,shop_slug,shop_category,shop_region,shop_logo,plan').eq('status','approved').or(`shop_name.ilike.%${query}%,shop_desc.ilike.%${query}%,shop_category.ilike.%${query}%`).limit(6)
      for (const s of (fb||[])) enriched.push({...s,match_reason:'Matches search',products:[]})
    }
    return enriched.sort((a,b)=>(b.products?.length||0)-(a.products?.length||0)).slice(0,8)
  }

  async function send(override?: string) {
    const text = (override??input).trim()
    if (!text||loading) return
    if (!override) setInput('')
    setLoading(true)
    const aiId = crypto.randomUUID()
    addMsg({id:crypto.randomUUID(),role:'user',content:text,ts:new Date()})
    addMsg({id:aiId,role:'ai',content:'',ts:new Date(),isTyping:true,queryUsed:text})
    const lq = text.toLowerCase()
    if (SELLER_KW.some(k=>lq.includes(k)))  { await pause(600); typeInto(aiId,t('ai.sellerResponse'));       setLoading(false); return }
    if (TRACK_KW.some(k=>lq.includes(k)))   { await pause(500); typeInto(aiId,t('ai.trackOrderResponse'));   setLoading(false); return }
    if (COMPARE_KW.some(k=>lq.includes(k))) { await pause(500); typeInto(aiId,t('ai.compareResponse'));      setLoading(false); return }
    try {
      const results = await searchShops(text)
      const msg = results.length>0 ? t('ai.foundShops',{count:results.length}) : t('ai.noShopsFound',{query:text})
      typeInto(aiId,msg,results)
    } catch { patchMsg(aiId,{content:t('ai.genericError'),isTyping:false}) }
    setLoading(false)
  }

  async function copyMsg(id: string, content: string) {
    try { await navigator.clipboard.writeText(content); setCopiedId(id); setTimeout(()=>setCopiedId(null),2000) } catch {}
  }

  const isEmpty = messages.length===0
  const canSend = input.trim().length>0&&!loading
  const isSW    = lang==='sw'

  const SUGG = [
    {icon:'\uD83D\uDECD\uFE0F',title:t('ai.suggest1'),sub:t('ai.suggest1sub'),q:isSW?'ninatafuta bidhaa bora':'find best products'},
    {icon:'\uD83D\uDCB0',title:t('ai.suggest2'),sub:t('ai.suggest2sub'),q:isSW?'pendekeza bidhaa bajeti yangu':'recommend products under budget'},
    {icon:'\u2696\uFE0F',title:t('ai.suggest3'),sub:t('ai.suggest3sub'),q:isSW?'linganisha bidhaa mbili':'compare products'},
    {icon:'\uD83D\uDCCD',title:t('ai.suggest4'),sub:t('ai.suggest4sub'),q:isSW?'maduka karibu Dar es Salaam':'shops near me Dar es Salaam'},
    {icon:'\uD83D\uDD25',title:t('ai.suggest5'),sub:t('ai.suggest5sub'),q:isSW?'bidhaa maarufu popular':'trending popular products'},
    {icon:'\uD83E\uDD14',title:t('ai.suggest6'),sub:t('ai.suggest6sub'),q:isSW?'nisaidie kuchagua bora':'help me choose best'},
    {icon:'\uD83D\uDCE6',title:t('ai.suggest7'),sub:t('ai.suggest7sub'),q:isSW?'fuatilia oda yangu':'track my order'},
    {icon:'\uD83C\uDFEA',title:t('ai.suggest8'),sub:t('ai.suggest8sub'),q:isSW?'niwe muuzaji fungua duka':'become a seller open shop'},
  ]
  const QA = [
    {Icon:Search,     lk:'qa1',q:isSW?'tafuta bidhaa bora':'find best products'},
    {Icon:Package,    lk:'qa2',q:isSW?'linganisha bidhaa':'compare products'},
    {Icon:Store,      lk:'qa3',q:isSW?'niwe muuzaji':'become a seller'},
    {Icon:TrendingUp, lk:'qa4',q:isSW?'bidhaa maarufu':'trending products'},
    {Icon:MapPin,     lk:'qa5',q:isSW?'maduka karibu':'shops near me'},
    {Icon:Zap,        lk:'qa6',q:isSW?'fuatilia oda':'track order'},
  ]

  const CSS = `
    html,body{margin:0;padding:0}
    .aip{display:flex;flex-direction:column;height:100dvh;min-height:100vh;background:#F8FAFC;font-family:'Inter',sans-serif;overflow:hidden}
    .aih{flex-shrink:0;background:linear-gradient(135deg,#080F37,#0D1B3E);border-bottom:1px solid rgba(255,255,255,0.07)}
    .aih-in{max-width:760px;margin:0 auto;display:flex;align-items:center;gap:12px;height:62px;padding:0 20px}
    .aih-av{background:linear-gradient(135deg,rgba(201,168,76,0.22),rgba(201,168,76,0.07));border:1px solid rgba(201,168,76,0.38);border-radius:11px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:0.95rem;color:#C9A84C;flex-shrink:0}
    .aih-btn{background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.70);width:36px;height:36px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.15s;flex-shrink:0}
    .aih-btn:hover{background:rgba(255,255,255,0.16)}
    .aim{flex:1;overflow-y:auto;scroll-behavior:smooth}
    .aim::-webkit-scrollbar{width:4px}
    .aim::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:99px}
    .aim-in{max-width:760px;margin:0 auto;padding:20px 16px 16px}
    .ai-hero{text-align:center;padding:28px 0 8px}
    .ai-hero-av{width:76px;height:76px;border-radius:24px;background:linear-gradient(145deg,#1a3468,#0D1B3E);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;box-shadow:0 16px 40px rgba(13,27,62,0.28),0 0 0 1px rgba(201,168,76,0.14)}
    .ai-hero h1{font-size:1.5rem;font-weight:900;color:#0F172A;margin:0 0 6px;letter-spacing:-0.025em}
    .ai-hero p{font-size:0.85rem;color:#64748B;margin:0}
    .sg{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:20px}
    .sc{background:#fff;border:1.5px solid #E2E8F0;border-radius:14px;padding:13px 14px;text-align:left;cursor:pointer;font-family:inherit;display:flex;align-items:flex-start;gap:10px;transition:all 0.2s;width:100%}
    .sc:hover{border-color:rgba(201,168,76,0.55);box-shadow:0 4px 16px rgba(201,168,76,0.10);transform:translateY(-1px)}
    .sc-t{font-weight:700;font-size:0.79rem;color:#0F172A;margin-bottom:2px;line-height:1.3;text-align:left}
    .sc-s{font-size:0.68rem;color:#94A3B8;line-height:1.3;text-align:left}
    .mr{display:flex;gap:10px;margin-bottom:14px;align-items:flex-start}
    .mr.user{flex-direction:row-reverse}
    .mb{max-width:83%}
    .av{width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#0D1B3E,#1a3468);display:flex;align-items:center;justify-content:center;color:#C9A84C;font-weight:900;font-size:0.85rem;flex-shrink:0}
    .ub{background:#0D1B3E;color:#fff;border-radius:20px 4px 20px 20px;padding:10px 16px;font-size:0.875rem;line-height:1.6;display:inline-block}
    .ab{background:#fff;color:#1e293b;border:1px solid #E2E8F0;border-radius:4px 20px 20px 20px;padding:10px 16px;font-size:0.875rem;line-height:1.6;box-shadow:0 1px 6px rgba(0,0,0,0.04);white-space:pre-line}
    .td-wrap{display:flex;gap:4px;align-items:center;padding:14px 16px;background:#fff;border:1px solid #E2E8F0;border-radius:4px 20px 20px 20px;box-shadow:0 1px 6px rgba(0,0,0,0.04)}
    .td{width:7px;height:7px;border-radius:50%;background:#CBD5E1;animation:tdp 1.2s ease-in-out infinite}
    .td:nth-child(2){animation-delay:0.2s}.td:nth-child(3){animation-delay:0.4s}
    @keyframes tdp{0%,80%,100%{transform:scale(0.75);opacity:0.4}40%{transform:scale(1);opacity:1}}
    .cursor{display:inline-block;width:2px;height:14px;background:#94A3B8;margin-left:1px;vertical-align:middle;animation:blink 0.75s step-end infinite}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
    .ts{font-size:0.61rem;color:#CBD5E1;margin-top:4px;display:block}
    .mr.user .ts{text-align:right}
    .ma{display:flex;gap:5px;margin-top:6px}
    .ma-btn{display:inline-flex;align-items:center;gap:3px;background:none;border:1px solid #E2E8F0;border-radius:999px;padding:3px 9px;font-size:0.66rem;color:#64748B;cursor:pointer;font-family:inherit;transition:all 0.15s}
    .ma-btn:hover{border-color:#C9A84C;color:#A07830}
    .rl{margin-top:10px;display:flex;flex-direction:column;gap:7px}
    .rc{display:flex;align-items:center;gap:12px;background:#F8FAFF;border:1.5px solid #E2E8F0;border-radius:13px;padding:12px 14px;text-decoration:none;color:inherit;transition:all 0.2s}
    .rc:hover{border-color:#C9A84C;box-shadow:0 4px 16px rgba(201,168,76,0.12)}
    .rl-logo{width:44px;height:44px;border-radius:12px;flex-shrink:0;background:linear-gradient(135deg,#0D1B3E,#1a3468);display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:#C9A84C;font-weight:900;overflow:hidden;border:1px solid #E2E8F0}
    .va{display:block;text-align:center;padding:9px 12px;color:#3B82F6;font-size:0.76rem;font-weight:600;text-decoration:none;border-radius:10px;background:#EFF6FF;border:1px solid #DBEAFE;transition:background 0.15s}
    .va:hover{background:#DBEAFE}
    .aib{flex-shrink:0;border-top:1px solid #E2E8F0;background:#fff;padding:10px 16px 22px}
    .aib-in{max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:8px}
    .qa-row{display:flex;gap:6px;overflow-x:auto;-ms-overflow-style:none;scrollbar-width:none}
    .qa-row::-webkit-scrollbar{display:none}
    .qa-btn{display:inline-flex;align-items:center;gap:4px;background:rgba(13,27,62,0.05);border:1px solid rgba(13,27,62,0.09);border-radius:999px;padding:5px 12px;font-size:0.7rem;font-weight:600;color:#334155;cursor:pointer;font-family:inherit;white-space:nowrap;transition:all 0.15s;flex-shrink:0}
    .qa-btn:hover{background:#0D1B3E;color:#C9A84C;border-color:#0D1B3E}
    .fr{display:flex;gap:7px;overflow-x:auto;-ms-overflow-style:none;scrollbar-width:none}
    .fr::-webkit-scrollbar{display:none}
    .fi,.fs{flex:0 0 auto;padding:7px 12px;border-radius:999px;border:1.5px solid #E2E8F0;font-size:0.74rem;font-family:inherit;color:#334155;outline:none;background:#fff;cursor:pointer;transition:border-color 0.15s;min-width:128px}
    .fi::placeholder{color:#94A3B8}.fi:focus,.fs:focus{border-color:#C9A84C}
    .ir{display:flex;gap:8px}
    .ci{flex:1;padding:13px 16px;border-radius:14px;border:1.5px solid #E2E8F0;font-size:0.875rem;font-family:inherit;color:#0F172A;outline:none;transition:border-color 0.15s;background:#fff}
    .ci:focus{border-color:#C9A84C}.ci:disabled{background:#F8FAFC;cursor:not-allowed}
    .sb{width:50px;height:50px;border-radius:14px;background:#0D1B3E;border:none;color:#C9A84C;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0}
    .sb:disabled{background:#E2E8F0;color:#94A3B8;cursor:not-allowed}
    .sb:not(:disabled):hover{background:#162444;box-shadow:0 4px 14px rgba(13,27,62,0.25)}
    @media(max-width:480px){.sg{grid-template-columns:1fr 1fr}.mb{max-width:88%}.ai-hero h1{font-size:1.3rem}.aih-in{padding:0 12px}.aim-in{padding:16px 12px 12px}.aib{padding:8px 12px 20px}}
    @media(max-width:340px){.sg{grid-template-columns:1fr}}
  `

  return (
    <div className="aip">
      <style>{CSS}</style>

      <header className="aih">
        <div className="aih-in">
          <button className="aih-btn" onClick={() => router.back()} aria-label="Back"><ArrowLeft size={17}/></button>
          <div className="aih-av">\u2736</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,color:'#fff',fontSize:'0.9rem',letterSpacing:'-0.01em'}}>{t('ai.title')}</div>
            <div style={{display:'flex',alignItems:'center',gap:5}}>
              <span style={{width:5,height:5,borderRadius:'50%',background:'#6ee7b7',display:'inline-block'}}/>
              <span style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.40)'}}>{t('ai.online')}</span>
            </div>
          </div>
          {!isEmpty && (
            <button className="aih-btn" onClick={() => setMessages([])} title={t('ai.clearChat')}><Trash2 size={15}/></button>
          )}
        </div>
      </header>

      <main className="aim">
        <div className="aim-in">
          {isEmpty && (
            <>
              <div className="ai-hero">
                <div className="ai-hero-av">
                  <svg viewBox="0 0 52 52" width="38" height="38" fill="none" aria-hidden="true">
                    <circle cx="26" cy="26" r="20" fill="rgba(201,168,76,0.12)"/>
                    <path d="M26 10L30 22L42 26L30 30L26 42L22 30L10 26L22 22Z" fill="#C9A84C" opacity="0.95"/>
                    <circle cx="26" cy="26" r="4" fill="rgba(255,255,255,0.18)"/>
                  </svg>
                </div>
                <h1>{t('ai.title')}</h1>
                <p>{t('ai.subtitle')}</p>
              </div>
              <div className="sg">
                {SUGG.map((s,i) => (
                  <button key={i} className="sc" onClick={() => send(s.q)}>
                    <span style={{fontSize:'1.2rem',flexShrink:0,lineHeight:'1.3'}}>{s.icon}</span>
                    <div><div className="sc-t">{s.title}</div><div className="sc-s">{s.sub}</div></div>
                  </button>
                ))}
              </div>
            </>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`mr ${msg.role}`}>
              {msg.role==='ai' && <div className="av">\u2736</div>}
              <div className="mb">
                {msg.role==='user' ? (
                  <div className="ub">{msg.content}</div>
                ) : (
                  <>
                    {msg.isTyping && !msg.content
                      ? <div className="td-wrap"><span className="td"/><span className="td"/><span className="td"/></div>
                      : <div className="ab">{msg.content}{msg.isTyping && <span className="cursor"/>}</div>
                    }
                    {msg.results!==undefined && !msg.isTyping && <ResultList results={msg.results} t={t} q={msg.queryUsed||''}/>}
                    {!msg.isTyping && msg.content && (
                      <div className="ma">
                        <button className="ma-btn" onClick={() => copyMsg(msg.id, msg.content)}>
                          {copiedId===msg.id ? <><Check size={11}/> {t('ai.copied')}</> : <><Copy size={11}/> {t('ai.copy')}</>}
                        </button>
                        {msg.queryUsed && (
                          <button className="ma-btn" onClick={() => send(msg.queryUsed)}><RotateCcw size={11}/> {t('ai.regenerate')}</button>
                        )}
                      </div>
                    )}
                  </>
                )}
                <span className="ts">{fmt(msg.ts)}</span>
              </div>
            </div>
          ))}
          <div ref={bottomRef}/>
        </div>
      </main>

      <div className="aib">
        <div className="aib-in">
          <div className="qa-row">
            {QA.map(({Icon,lk,q}) => (
              <button key={lk} className="qa-btn" onClick={() => send(q)}><Icon size={11}/> {t(`ai.${lk}`)}</button>
            ))}
          </div>
          <div className="fr">
            <input value={budget} onChange={e=>setBudget(e.target.value)} placeholder={`\uD83D\uDCB0 ${t('ai.budgetPlaceholder')}`} className="fi"/>
            <select value={category} onChange={e=>setCategory(e.target.value)} className="fs">
              <option value="">{`\uD83D\uDCE6 ${t('ai.categoryAll')}`}</option>
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <select value={city} onChange={e=>setCity(e.target.value)} className="fs">
              <option value="">{`\uD83D\uDCCD ${t('ai.cityAll')}`}</option>
              {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="ir">
            <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}
              placeholder={t('ai.placeholder')} disabled={loading} className="ci" autoComplete="off"/>
            <button onClick={()=>send()} disabled={!canSend} className="sb" aria-label={t('ai.send')}>
              {loading ? <span style={{fontSize:'0.85rem',fontWeight:700}}>{dots}</span> : <Send size={18}/>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultList({results,t,q}:{results:Result[];t:TFn;q:string}) {
  if (!results.length) return null
  return (
    <div className="rl">
      {results.map(store=>(
        <a key={store.id} href={`/store/${store.shop_slug}`} className="rc">
          <div className="rl-logo">
            {store.shop_logo
              ? <img src={store.shop_logo} alt={store.shop_name} style={{width:'100%',height:'100%',objectFit:'cover'}} loading="lazy"/>
              : <span>{store.shop_name?.[0]?.toUpperCase()||'\uD83C\uDFEA'}</span>
            }
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
              <span style={{fontWeight:700,color:'#0F172A',fontSize:'0.88rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{store.shop_name}</span>
              {store.plan === 'premium' && <span style={{fontSize:'0.67rem',color:'#C9A84C',flexShrink:0}}>★ Premium</span>}
            </div>
            <div style={{fontSize:'0.7rem',color:'#94A3B8',marginBottom:4,display:'flex',gap:6,flexWrap:'wrap'}}>
              {store.shop_category&&<span>{store.shop_category}</span>}
              {store.shop_region&&<span>\uD83D\uDCCD {store.shop_region}</span>}
            </div>
            <span style={{display:'inline-flex',alignItems:'center',gap:3,fontSize:'0.66rem',color:'#059669',background:'rgba(5,150,105,0.08)',border:'1px solid rgba(5,150,105,0.15)',borderRadius:999,padding:'2px 7px'}}>
              \u2713 {store.match_reason}
            </span>
            {(store.products?.length||0)>0&&(
              <div style={{marginTop:5,display:'flex',gap:4,flexWrap:'wrap'}}>
                {(store.products || []).slice(0,3).map((p,j)=>(
                  <span key={j} style={{fontSize:'0.67rem',background:'#F8FAFC',border:'1px solid #E2E8F0',borderRadius:5,padding:'2px 7px',color:'#475569'}}>
                    {p.name} \u00B7 <strong>TZS {p.price?.toLocaleString()}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>
          <span style={{color:'#CBD5E1',fontSize:'1.1rem',flexShrink:0}}>\u203A</span>
        </a>
      ))}
      <a href={`/market?q=${encodeURIComponent(q)}`} className="va">{t('ai.viewMarket')} \u2192</a>
    </div>
  )
}
