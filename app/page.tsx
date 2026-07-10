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
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');
        @keyframes logoIn  { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
        @keyframes letterDrop { from{opacity:0;transform:translateY(-30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lineGrow { from{width:0;opacity:0} to{width:clamp(60px,10vw,100px);opacity:1} }
        @keyframes subFade  { from{opacity:0} to{opacity:1} }
        .sp-logo { width:clamp(80px,11vw,130px);height:clamp(80px,11vw,130px);border-radius:50%;object-fit:cover;animation:logoIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards;margin-bottom:clamp(18px,3vw,32px) }
        .sp-letter { display:inline-block;font-family:'Cinzel',Georgia,serif;font-size:clamp(1.8rem,5.5vw,4rem);font-weight:900;color:#fff;letter-spacing:0.12em;opacity:0;animation:letterDrop 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards }
        .sp-line { height:2px;background:linear-gradient(90deg,transparent,#C9A84C,transparent);animation:lineGrow 0.5s ease forwards;margin:12px 0 }
        .sp-sub  { font-family:'Cinzel',Georgia,serif;font-size:clamp(0.45rem,1.2vw,0.7rem);color:#C9A84C;letter-spacing:0.3em;text-transform:uppercase;opacity:0;animation:subFade 0.5s ease forwards;margin:0 }
      `}</style>
      <img src="/icon-192.png" alt="Travex" className="sp-logo" />
      <div>
        {['T','R','A','V','E','X'].map((l,i) => (
          <span key={i} className="sp-letter" style={{ animationDelay:`${0.5+i*0.09}s` }}>{l}</span>
        ))}
      </div>
      <div className="sp-line" style={{ animationDelay:'1.1s',animationFillMode:'both' }} />
      <p className="sp-sub" style={{ animationDelay:'1.3s',animationFillMode:'both' }}>Digital Group</p>
    </div>
  )
}
