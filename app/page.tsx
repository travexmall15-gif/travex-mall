'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SplashPage() {
  const router = useRouter()
  const [fade, setFade] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 1800)
    const t2 = setTimeout(() => router.replace('/home'), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [router])

  return (
    <div style={{ position:'fixed',inset:0,background:'#080F37',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',transition:'opacity 0.6s ease',opacity:fade?0:1 }}>
      <style>{`
        @keyframes logoIn    { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
        @keyframes letterDrop{ from{opacity:0;transform:translateY(-30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lineGrow  { from{width:0;opacity:0} to{width:clamp(60px,10vw,100px);opacity:1} }
        @keyframes subFade   { from{opacity:0} to{opacity:1} }
        .sp-logo   { width:clamp(80px,11vw,130px);height:clamp(80px,11vw,130px);border-radius:22px;object-fit:cover;animation:logoIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards;margin-bottom:clamp(18px,3vw,32px) }
        .sp-letter { display:inline-block;font-family:'Inter',sans-serif;font-size:clamp(1.8rem,5.5vw,4rem);font-weight:900;color:#fff;letter-spacing:0.08em;opacity:0;animation:letterDrop 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards }
        .sp-nekt   { display:inline-block;font-family:'Inter',sans-serif;font-size:clamp(1.8rem,5.5vw,4rem);font-weight:900;color:#F97316;letter-spacing:0.08em;opacity:0;animation:letterDrop 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards }
        .sp-line   { height:2px;background:linear-gradient(90deg,transparent,#F97316,transparent);animation:lineGrow 0.5s ease forwards;margin:12px 0 }
        .sp-sub    { font-family:'Inter',sans-serif;font-size:clamp(0.45rem,1.1vw,0.65rem);color:rgba(255,255,255,0.35);letter-spacing:0.25em;text-transform:uppercase;opacity:0;animation:subFade 0.5s ease forwards;margin:0 }
        .sp-qnex   { font-family:'Inter',sans-serif;font-size:clamp(0.5rem,1vw,0.62rem);color:rgba(255,255,255,0.22);letter-spacing:0.18em;text-transform:uppercase;opacity:0;animation:subFade 0.5s ease forwards;margin-top:6px }
      `}</style>

      {/* App Icon */}
      <img src="/icon-192.png" alt="ShopNekt" className="sp-logo" />

      {/* S H O P — N E K T */}
      <div>
        {['S','H','O','P'].map((l,i) => (
          <span key={i} className="sp-letter" style={{ animationDelay:`${0.4+i*0.08}s` }}>{l}</span>
        ))}
        <span className="sp-letter" style={{ animationDelay:'0.74s', color:'rgba(255,255,255,0.3)', fontSize:'clamp(1rem,3vw,2rem)', verticalAlign:'middle', margin:'0 4px' }}>·</span>
        {['N','E','K','T'].map((l,i) => (
          <span key={i} className="sp-nekt" style={{ animationDelay:`${0.82+i*0.08}s` }}>{l}</span>
        ))}
      </div>

      {/* Gold line */}
      <div className="sp-line" style={{ animationDelay:'1.2s', animationFillMode:'both' }} />

      {/* Tagline */}
      <p className="sp-sub" style={{ animationDelay:'1.35s', animationFillMode:'both' }}>
        Shop More. Save More. Live Better.
      </p>

      {/* from QNEX360 */}
      <p className="sp-qnex" style={{ animationDelay:'1.5s', animationFillMode:'both' }}>
        from QNEX360
      </p>
    </div>
  )
}
