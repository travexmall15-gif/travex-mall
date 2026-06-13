import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { Particles } from '@/components/particles'
import { shops, universities } from '@/lib/data'
import { ArrowRight, GraduationCap, Briefcase } from 'lucide-react'

const UNIS = [
  { abbr: 'UDSM', name: 'Univ. of Dar es Salaam', city: 'Dar es Salaam', slug: 'udsm', shops: 58, total: 60 },
  { abbr: 'UDOM', name: 'Univ. of Dodoma', city: 'Dodoma', slug: 'udom', shops: 31, total: 60 },
  { abbr: 'ARU',  name: 'Ardhi University', city: 'Dar es Salaam', slug: 'aru', shops: 42, total: 60 },
  { abbr: 'TIA',  name: 'Tanzania Inst. of Accountancy', city: 'Dar es Salaam', slug: 'tia', shops: 24, total: 60 },
  { abbr: 'NIT',  name: 'Nelson Mandela African Inst. of Science', city: 'Arusha', slug: 'nit', shops: 12, total: 60 },
]

export default function HomePage() {
  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#F3F5FA', overflowX: 'hidden' }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@300;400;500;600;700&family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        :root{--navy:#0D1B3E;--blue:#1B3A6B;--gold:#C9A84C;--gold2:#F0C96B;--white:#fff;--offwhite:#F8F9FC;--gray:#6B7280;--lgray:#E5E7EB;--green:#059669}
        *{box-sizing:border-box}
        .hover-lift{transition:all 0.25s ease}
        .hover-lift:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,0.12)}
        .shop-card-home{background:#fff;border:1px solid #E5E7EB;border-radius:18px;overflow:hidden;transition:all 0.2s}
        .shop-card-home:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,0.1)}
        @media(max-width:768px){
          .hero-h1{font-size:clamp(2rem,8vw,3rem)!important}
          .hero-sub{font-size:0.88rem!important}
          .section-headline{font-size:clamp(1.4rem,5vw,2rem)!important}
          .bebas-big{font-size:clamp(2.8rem,12vw,8rem)!important}
          .uni-grid{flex-direction:column!important;align-items:stretch!important}
          .uni-card{min-width:unset!important;width:100%!important}
          .footer-grid-inner{grid-template-columns:1fr 1fr!important}
        }
      `}</style>

      <SiteNav />

      {/* ══════════ HERO ══════════ */}
      <section style={{position:'relative',minHeight:'100vh',display:'flex',alignItems:'center',overflow:'hidden',background:'#0D1B3E',paddingTop:'64px',color:'#fff'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'url(/hero-marketplace.png)',backgroundSize:'cover',backgroundPosition:'center',opacity:0.2}} />
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(13,27,62,0.96) 0%,rgba(13,27,62,0.88) 60%,rgba(27,58,107,0.75) 100%)'}} />
        {/* Beam */}
        <div style={{position:'absolute',inset:'-30%',pointerEvents:'none',zIndex:0,background:'linear-gradient(112deg,transparent 30%,rgba(110,150,235,0.22) 46%,rgba(201,168,76,0.14) 56%,transparent 72%)',filter:'blur(48px)'}} />
        {/* Grid */}
        <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0,opacity:0.05,backgroundImage:'linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)',backgroundSize:'56px 56px'}} />
        <Particles />
        <div style={{position:'relative',width:'100%',maxWidth:'1200px',margin:'0 auto',padding:'5rem 5% 4rem'}}>
          <div style={{maxWidth:'680px'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'rgba(201,168,76,0.12)',border:'1px solid rgba(201,168,76,0.35)',color:'#C9A84C',padding:'0.35rem 1rem',borderRadius:'999px',fontSize:'0.72rem',fontWeight:700,letterSpacing:'0.05em',marginBottom:'1.5rem'}}>
              ◆ Africa's #1 AI-Powered Marketplace — Tanzania 2026
            </div>
            <h1 className="hero-h1" style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'clamp(2.4rem,6vw,4.8rem)',fontWeight:900,lineHeight:1.06,color:'#fff',marginBottom:'1.2rem',letterSpacing:'-0.01em'}}>
              Africa's <span style={{color:'#C9A84C'}}>Intelligent</span><br/>Digital Marketplace
            </h1>
            <p className="hero-sub" style={{fontSize:'clamp(0.88rem,1.8vw,1.05rem)',lineHeight:1.75,color:'rgba(255,255,255,0.65)',marginBottom:'2rem',maxWidth:'520px',fontWeight:400}}>
              Create your online store in minutes. Sell across Tanzania. Grow your business with AI-powered intelligence — designed for every African entrepreneur.
            </p>
            <div style={{display:'flex',gap:'0.85rem',flexWrap:'wrap',marginBottom:'2.5rem'}}>
              <Link href="/campus-dashboard" style={{background:'#C9A84C',color:'#0D1B3E',padding:'0.9rem 2.2rem',borderRadius:'999px',fontWeight:700,fontSize:'0.9rem',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'0.4rem'}}>
                Login to Your Shop →
              </Link>
              <Link href="/market" style={{background:'rgba(255,255,255,0.08)',color:'#fff',border:'1px solid rgba(255,255,255,0.25)',padding:'0.9rem 2.2rem',borderRadius:'999px',fontWeight:600,fontSize:'0.9rem',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'0.4rem'}}>
                Open New Store
              </Link>
            </div>
            <div style={{display:'flex',gap:'2.5rem',flexWrap:'wrap'}}>
              {[['3M+','Tanzania SMEs'],['$75B','Africa Market'],['30%+','Annual Growth']].map(([v,l])=>(
                <div key={l}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:900,color:'#C9A84C'}}>{v}</div>
                  <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.45)',marginTop:'2px'}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ B2C SECTION ══════════ */}
      <section style={{position:'relative',overflow:'hidden',background:'#F3F5FA',padding:'6rem 5%',textAlign:'center'}}>
        <div style={{position:'absolute',top:'-150px',left:'-100px',width:'500px',height:'500px',borderRadius:'50%',background:'radial-gradient(circle,rgba(13,27,62,0.06),transparent 65%)',pointerEvents:'none'}} />
        <div style={{position:'absolute',bottom:'-100px',right:'-100px',width:'400px',height:'400px',borderRadius:'50%',background:'radial-gradient(circle,rgba(201,168,76,0.05),transparent 65%)',pointerEvents:'none'}} />
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(13,27,62,0.03) 1px,transparent 1px)',backgroundSize:'28px 28px',pointerEvents:'none'}} />
        <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:'linear-gradient(90deg,transparent,rgba(13,27,62,0.15),transparent)'}} />
        <div style={{position:'relative',zIndex:1,maxWidth:'900px',margin:'0 auto'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'rgba(192,192,192,0.12)',border:'1px solid rgba(192,192,192,0.25)',color:'#9CA3AF',padding:'0.32rem 1rem',fontSize:'0.62rem',fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',marginBottom:'1.5rem'}}>
            <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#9CA3AF',flexShrink:0}} />
            RETAIL MARKET · B2C
          </div>
          <div style={{lineHeight:0.88,marginBottom:'1rem'}}>
            <div className="bebas-big" style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(3.5rem,10vw,8rem)',color:'#0D1B3E',letterSpacing:'0.03em',display:'block'}}>SHOP FROM</div>
            <div className="bebas-big" style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(3.5rem,10vw,8rem)',letterSpacing:'0.03em',background:'linear-gradient(135deg,#0D1B3E,#1B3A6B,#C9A84C)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',display:'block'}}>LOCAL RETAILERS</div>
          </div>
          <div style={{fontFamily:"'Inter',sans-serif",fontSize:'clamp(0.82rem,1.8vw,1rem)',fontWeight:600,color:'#9CA3AF',letterSpacing:'0.25em',textTransform:'uppercase',marginBottom:'1.2rem'}}>Find · Buy · Trust · 🥈 Silver Verified</div>
          <p style={{fontSize:'clamp(0.82rem,1.5vw,0.95rem)',color:'#6B7280',lineHeight:1.85,marginBottom:'2.5rem',fontWeight:300,maxWidth:'560px',marginLeft:'auto',marginRight:'auto'}}>Discover verified local sellers across Tanzania. Fashion, electronics, food and more — all in one place.</p>
          <div style={{display:'flex',gap:'0.75rem',justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/market" style={{background:'#0D1B3E',color:'#fff',padding:'0.95rem 2.4rem',fontSize:'0.9rem',fontWeight:700,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'0.5rem',borderRadius:'999px',boxShadow:'0 8px 20px rgba(13,27,62,0.22)'}}>
              🛍️ Browse Market
            </Link>
            <Link href="/campus-dashboard" style={{background:'transparent',color:'#0D1B3E',padding:'0.95rem 2.4rem',fontSize:'0.9rem',fontWeight:600,textDecoration:'none',border:'2px solid #0D1B3E',display:'inline-flex',alignItems:'center',gap:'0.5rem',borderRadius:'999px'}}>
              Login to Your Shop →
            </Link>
          </div>
        </div>
      </section>
      <div style={{height:'1px',background:'linear-gradient(90deg,transparent,rgba(13,27,62,0.12),transparent)'}} />

      {/* ══════════ B2B SECTION ══════════ */}
      <section style={{position:'relative',overflow:'hidden',background:'#080A0F',padding:'6rem 5%',textAlign:'center'}}>
        <div style={{position:'absolute',top:'-120px',left:'-100px',width:'500px',height:'500px',borderRadius:'50%',background:'radial-gradient(circle,rgba(201,168,76,0.12),transparent 65%)',filter:'blur(50px)',pointerEvents:'none'}} />
        <div style={{position:'absolute',bottom:'-80px',right:'-80px',width:'400px',height:'400px',borderRadius:'50%',background:'radial-gradient(circle,rgba(201,168,76,0.08),transparent 65%)',filter:'blur(40px)',pointerEvents:'none'}} />
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)',backgroundSize:'28px 28px',pointerEvents:'none'}} />
        <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent)'}} />
        <div style={{position:'relative',zIndex:1,maxWidth:'900px',margin:'0 auto'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'rgba(201,168,76,0.08)',border:'1px solid rgba(201,168,76,0.2)',color:'rgba(201,168,76,0.8)',padding:'0.32rem 1rem',fontSize:'0.62rem',fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',marginBottom:'1.5rem'}}>
            <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#C9A84C',flexShrink:0}} />
            WHOLESALE MARKET · B2B
          </div>
          <div style={{lineHeight:0.88,marginBottom:'1rem'}}>
            <div className="bebas-big" style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(3.5rem,10vw,8rem)',color:'#fff',letterSpacing:'0.03em',display:'block'}}>BUY IN BULK FROM</div>
            <div className="bebas-big" style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(3.5rem,10vw,8rem)',letterSpacing:'0.03em',background:'linear-gradient(135deg,#C9A84C,#F0C96B,#C9A84C)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',display:'block'}}>WHOLESALERS</div>
          </div>
          <div style={{fontSize:'clamp(0.82rem,1.8vw,1rem)',fontWeight:600,color:'rgba(201,168,76,0.5)',letterSpacing:'0.25em',textTransform:'uppercase',marginBottom:'1.2rem'}}>Source · Bulk · Verified · 🥇 Gold Certified</div>
          <p style={{fontSize:'clamp(0.82rem,1.5vw,0.95rem)',color:'rgba(255,255,255,0.35)',lineHeight:1.85,marginBottom:'2.5rem',fontWeight:300,maxWidth:'560px',marginLeft:'auto',marginRight:'auto'}}>Connect with verified manufacturers, importers and distributors. Best bulk prices across Tanzania.</p>
          <div style={{display:'flex',gap:'0.75rem',justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/market" style={{background:'#C9A84C',color:'#111',padding:'0.95rem 2.4rem',fontSize:'0.9rem',fontWeight:700,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'0.5rem',borderRadius:'8px'}}>
              🏭 Browse All Shops
            </Link>
            <Link href="/campus-dashboard" style={{background:'transparent',color:'rgba(255,255,255,0.6)',padding:'0.95rem 2.4rem',fontSize:'0.9rem',fontWeight:600,textDecoration:'none',border:'2px solid rgba(255,255,255,0.15)',display:'inline-flex',alignItems:'center',gap:'0.5rem',borderRadius:'999px'}}>
              Login to Your Shop →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ TOP RATED CAROUSEL ══════════ */}
      <section id="top-rated" style={{background:'#F3F5FA',padding:'5rem 5%'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'2rem',flexWrap:'wrap',gap:'1rem',paddingRight:'0'}}>
            <div>
              <div style={{fontSize:'0.68rem',fontWeight:700,color:'#C9A84C',textTransform:'uppercase',letterSpacing:'0.18em',marginBottom:'0.4rem'}}>// Editor's Choice</div>
              <div className="section-headline" style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'clamp(1.3rem,2.5vw,1.6rem)',fontWeight:800,color:'#0D1B3E'}}>Top Rated Shops ⭐⭐⭐⭐⭐</div>
              <div style={{fontSize:'0.82rem',color:'#6B7280',marginTop:'0.2rem'}}>Highest rated verified stores</div>
            </div>
            <Link href="/campus" style={{fontSize:'0.82rem',color:'#1B3A6B',fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center',gap:'0.3rem'}}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'1.25rem'}}>
            {shops.slice(0,6).map(shop=>{
              const init = shop.name.split(' ').map((w:string)=>w[0]).join('').substring(0,2).toUpperCase()
              const wa = shop.whatsapp.replace(/\D/g,'')
              return (
                <div key={shop.slug} className="shop-card-home">
                  <div style={{height:'56px',background:`linear-gradient(135deg,${shop.logoColor},#0D1B3E)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',fontWeight:800,color:'#fff',fontFamily:"'Playfair Display',serif"}}>
                    {init}
                  </div>
                  <div style={{padding:'0.85rem 1rem'}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'0.3rem'}}>
                      <div style={{fontWeight:700,fontSize:'0.85rem',color:'#0D1B3E'}}>{shop.name}</div>
                      {shop.verified && <span style={{fontSize:'0.6rem',background:'rgba(5,150,105,0.1)',color:'#059669',padding:'0.1rem 0.4rem',borderRadius:'6px',fontWeight:700,flexShrink:0,marginLeft:'0.4rem'}}>✓ Verified</span>}
                    </div>
                    <div style={{fontSize:'0.68rem',background:'rgba(201,168,76,0.1)',color:'#92741a',padding:'0.15rem 0.5rem',borderRadius:'8px',display:'inline-block',fontWeight:700,marginBottom:'0.5rem'}}>{shop.category}</div>
                    <p style={{fontSize:'0.75rem',color:'#6B7280',lineHeight:1.5,marginBottom:'0.75rem',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{shop.description}</p>
                    <div style={{display:'flex',gap:'0.4rem'}}>
                      <a href={`https://wa.me/${wa}`} target="_blank" style={{flex:1,padding:'0.4rem',background:'#25D366',color:'#fff',border:'none',borderRadius:'7px',fontSize:'0.7rem',fontWeight:700,textAlign:'center',textDecoration:'none'}}>💬 WhatsApp</a>
                      <Link href={`/campus/${shop.university}`} style={{flex:1,padding:'0.4rem',background:'#0D1B3E',color:'#fff',borderRadius:'7px',fontSize:'0.7rem',fontWeight:700,textAlign:'center',textDecoration:'none'}}>🏪 Visit</Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════ SOCIAL VYBE ══════════ */}
      <section style={{position:'relative',overflow:'hidden',background:'#0A0A0F',padding:'5rem 5%'}}>
        <div style={{position:'absolute',top:'-120px',left:'-100px',width:'500px',height:'500px',borderRadius:'50%',background:'radial-gradient(circle,rgba(255,0,128,0.2),transparent 65%)',filter:'blur(60px)',pointerEvents:'none'}} />
        <div style={{position:'absolute',bottom:'-80px',right:'-80px',width:'450px',height:'450px',borderRadius:'50%',background:'radial-gradient(circle,rgba(120,0,255,0.18),transparent 65%)',filter:'blur(60px)',pointerEvents:'none'}} />
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(255,255,255,0.03) 1px,transparent 1px)',backgroundSize:'28px 28px',pointerEvents:'none'}} />
        <div style={{position:'absolute',top:0,left:0,right:0,height:'1.5px',background:'linear-gradient(90deg,transparent,#FF0080,#7800FF,#00C8FF,transparent)'}} />
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:'1.5px',background:'linear-gradient(90deg,transparent,#00C8FF,#7800FF,#FF0080,transparent)'}} />
        <div style={{position:'relative',zIndex:2,maxWidth:'900px',margin:'0 auto',textAlign:'center'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',marginBottom:'1.5rem',padding:'0.35rem 1.1rem',border:'1px solid rgba(255,0,128,0.35)',background:'rgba(255,0,128,0.07)'}}>
            <span style={{width:'7px',height:'7px',borderRadius:'50%',background:'#FF0080',flexShrink:0}} />
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'0.62rem',fontWeight:700,color:'rgba(255,0,128,0.85)',letterSpacing:'0.2em',textTransform:'uppercase'}}>NEW INSIDE TRAVEX MALL</span>
          </div>
          <div style={{marginBottom:'0.75rem',lineHeight:0.88}}>
            <div className="bebas-big" style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(3.5rem,9vw,7.5rem)',color:'#fff',letterSpacing:'0.03em',display:'block'}}>TRAVEX</div>
            <div className="bebas-big" style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(3.5rem,9vw,7.5rem)',letterSpacing:'0.03em',background:'linear-gradient(135deg,#FF0080,#7800FF,#00C8FF)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',display:'block'}}>SOCIAL VYBE</div>
          </div>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'clamp(0.82rem,2vw,1.1rem)',fontWeight:600,color:'rgba(255,255,255,0.45)',letterSpacing:'0.25em',textTransform:'uppercase',marginBottom:'1.5rem'}}>Be Seen &nbsp;·&nbsp; Be Sold &nbsp;·&nbsp; Be Vybe</div>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:'clamp(0.85rem,1.5vw,1rem)',color:'rgba(255,255,255,0.45)',lineHeight:1.85,marginBottom:'2.5rem',maxWidth:'640px',marginLeft:'auto',marginRight:'auto',fontWeight:300}}>
            Tanzania's first <strong style={{color:'rgba(255,255,255,0.8)',fontWeight:600}}>Business Social Network</strong> — powered by Travex Mall. Post your products, grow your brand and connect directly with buyers across Tanzania. Like Instagram, but built for <strong style={{color:'rgba(255,255,255,0.8)',fontWeight:600}}>African business</strong>.
          </p>
          <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap',justifyContent:'center',marginBottom:'3rem'}}>
            <Link href="/vybe" style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'linear-gradient(135deg,#FF0080,#7800FF)',color:'#fff',padding:'0.9rem 2.2rem',fontFamily:"'Space Grotesk',sans-serif",fontSize:'0.9rem',fontWeight:700,textDecoration:'none',borderRadius:'6px'}}>
              ✦ Explore Social Vybe
            </Link>
            <Link href="/campus-dashboard" style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'transparent',color:'rgba(255,255,255,0.6)',padding:'0.9rem 2.2rem',fontFamily:"'Space Grotesk',sans-serif",fontSize:'0.9rem',fontWeight:600,textDecoration:'none',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'6px'}}>
              Post Your Business →
            </Link>
          </div>
          <div style={{display:'flex',justifyContent:'center',flexWrap:'wrap',border:'1px solid rgba(255,255,255,0.06)'}}>
            {[['POST','#FF0080','Daily Content'],['LIKE','#7800FF','Real Engagement'],['SELL','#00C8FF','Direct to Buyers']].map(([word,color,sub],i,arr)=>(
              <div key={word} style={{padding:'1rem 2.5rem',borderRight:i<arr.length-1?'1px solid rgba(255,255,255,0.06)':'none',flex:1,minWidth:'100px',textAlign:'center'}}>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'1.5rem',color,letterSpacing:'0.05em'}}>{word}</div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'0.58rem',color:'rgba(255,255,255,0.25)',textTransform:'uppercase',letterSpacing:'0.12em',marginTop:'2px'}}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ UNI STUDENT MARKET ══════════ */}
      <section id="uni" style={{position:'relative',overflow:'hidden',background:'#0D1B3E',padding:'5rem 5%',color:'#fff'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'url(/campus-hero.png)',backgroundSize:'cover',backgroundPosition:'center',opacity:0.12}} />
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(13,27,62,0.96),rgba(27,58,107,0.9))'}} />
        <div style={{position:'relative',zIndex:2,maxWidth:'1100px',margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:'2.5rem'}}>
            <div style={{display:'inline-block',background:'rgba(201,168,76,0.12)',border:'1px solid rgba(201,168,76,0.3)',color:'#C9A84C',padding:'0.35rem 1rem',borderRadius:'999px',fontSize:'0.72rem',fontWeight:700,letterSpacing:'0.06em',marginBottom:'1rem'}}>
              🎓 Exclusively For University Students
            </div>
            <h2 className="section-headline" style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'clamp(1.6rem,4vw,2.6rem)',fontWeight:800,color:'#fff',marginBottom:'0.75rem'}}>
              Travex <span style={{color:'#C9A84C'}}>Uni-Student</span> Market
            </h2>
            <p style={{fontSize:'clamp(0.82rem,1.5vw,0.95rem)',color:'rgba(255,255,255,0.55)',lineHeight:1.75,maxWidth:'520px',margin:'0 auto 1.5rem'}}>
              Tanzania's first verified student marketplace. Buy from trusted student entrepreneurs at your own university.
            </p>
            <div style={{display:'flex',justifyContent:'center',gap:'2.5rem',flexWrap:'wrap',marginBottom:'2rem'}}>
              {[['200','Founding Shops'],['5','Universities'],['TZS 15K','Per Month']].map(([v,l])=>(
                <div key={l} style={{textAlign:'center'}}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(1.2rem,3vw,1.8rem)',fontWeight:900,color:'#C9A84C'}}>{v}</div>
                  <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.08em'}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:'0.75rem',justifyContent:'center',flexWrap:'wrap',marginBottom:'2.5rem'}}>
              <Link href="/campus" style={{background:'#C9A84C',color:'#0D1B3E',padding:'0.85rem 2rem',borderRadius:'10px',fontWeight:700,fontSize:'0.88rem',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'0.4rem'}}>
                <GraduationCap size={18}/> Explore Student Market →
              </Link>
              <Link href="/campus-apply" style={{background:'transparent',color:'rgba(255,255,255,0.75)',border:'1px solid rgba(255,255,255,0.25)',padding:'0.85rem 2rem',borderRadius:'10px',fontWeight:600,fontSize:'0.88rem',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'0.4rem'}}>
                Open Your Shop →
              </Link>
            </div>
          </div>
          {/* Universities horizontal scroll */}
          <div className="uni-grid" style={{display:'flex',gap:'1rem',overflowX:'auto',paddingBottom:'0.75rem',WebkitOverflowScrolling:'touch',scrollbarWidth:'thin',scrollbarColor:'rgba(201,168,76,0.3) transparent'}}>
            {UNIS.map(u=>(
              <Link key={u.slug} href={`/campus/${u.slug}`} className="uni-card hover-lift" style={{textDecoration:'none',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',padding:'1.2rem',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.75rem',transition:'all 0.3s',cursor:'pointer',minWidth:'160px',flexShrink:0,borderRadius:'12px'}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.6rem',fontWeight:900,color:'#C9A84C'}}>{u.abbr}</div>
                <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.55)',textAlign:'center',lineHeight:1.4}}>{u.name}</div>
                <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.35)'}}>{u.city}</div>
                <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',justifyContent:'center'}}>
                  <span style={{fontSize:'0.58rem',background:'rgba(201,168,76,0.15)',color:'#C9A84C',padding:'0.1rem 0.45rem',borderRadius:'6px',fontWeight:700}}>{u.shops} shops</span>
                  <span style={{fontSize:'0.58rem',background:u.total-u.shops<10?'rgba(220,38,38,0.15)':'rgba(5,150,105,0.15)',color:u.total-u.shops<10?'#f87171':'#34d399',padding:'0.1rem 0.45rem',borderRadius:'6px',fontWeight:700}}>{u.total-u.shops} left</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer id="contact" style={{background:'#060B18',color:'rgba(255,255,255,0.55)',fontFamily:"'Inter',sans-serif"}}>
        <div style={{borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'1.5rem 5%',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem'}}>
          <div>
            <div style={{fontSize:'0.6rem',color:'rgba(255,255,255,0.25)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.3rem'}}>Parent Company</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:'1.1rem',color:'#fff'}}>TRAVEX <span style={{color:'#C9A84C'}}>DIGITAL GROUP</span></div>
            <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.3)',marginTop:'0.15rem'}}>Innovate · Connect · Grow</div>
          </div>
          <div style={{display:'flex',gap:'0.6rem',flexWrap:'wrap'}}>
            {[['🏪 Travex Mall','/'],['🎓 Travex Campus','/campus'],['🏨 Travex Stay','#'],['🚚 Travex Move','#']].map(([label,href])=>(
              <Link key={label} href={href} style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.45)',padding:'0.35rem 0.85rem',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'6px',textDecoration:'none',transition:'all 0.2s'}}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="footer-grid-inner" style={{maxWidth:'1200px',margin:'0 auto',padding:'3rem 5%',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:'2.5rem'}}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:'1rem',color:'#fff',marginBottom:'0.75rem'}}>TRAVEX <span style={{color:'#C9A84C'}}>MALL</span></div>
            <p style={{fontSize:'0.8rem',lineHeight:1.7,color:'rgba(255,255,255,0.4)',marginBottom:'1.25rem',maxWidth:'300px'}}>Africa's intelligent digital marketplace — empowering businesses and students across Tanzania and beyond.</p>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              <a href="mailto:travexmall15@gmail.com" style={{fontSize:'0.78rem',color:'rgba(255,255,255,0.4)',textDecoration:'none',display:'flex',alignItems:'center',gap:'0.4rem'}}>📧 travexmall15@gmail.com</a>
              <a href="https://wa.me/255651919915" target="_blank" style={{fontSize:'0.78rem',color:'rgba(255,255,255,0.4)',textDecoration:'none',display:'flex',alignItems:'center',gap:'0.4rem'}}>💬 +255 651 919 915</a>
              <a href="https://wa.me/255657575950" target="_blank" style={{fontSize:'0.78rem',color:'rgba(255,255,255,0.4)',textDecoration:'none',display:'flex',alignItems:'center',gap:'0.4rem'}}>💬 +255 657 575 950</a>
            </div>
          </div>
          {[
            ['Products',[['Travex Mall','/'],['Travex Campus','/campus'],['Social Vybe','/vybe'],['Business Market','/market']]],
            ['Company',[['Travex Digital Group','https://travex-digital-group.vercel.app'],['Our Story','https://travex-digital-group.vercel.app/story.html'],['Our Team','https://travex-digital-group.vercel.app/team.html'],['Contact TDG','https://travex-digital-group.vercel.app/contact.html']]],
            ['Support',[['Email Support','mailto:travexmall15@gmail.com'],['WhatsApp 1','https://wa.me/255651919915'],['WhatsApp 2','https://wa.me/255657575950'],['Open Shop','/campus-apply']]],
          ].map(([title,links])=>(
            <div key={title as string}>
              <h4 style={{fontSize:'0.72rem',fontWeight:700,color:'rgba(255,255,255,0.7)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'1rem'}}>{title as string}</h4>
              <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                {(links as [string,string][]).map(([l,h])=>(
                  <li key={l}><a href={h} style={{fontSize:'0.78rem',color:'rgba(255,255,255,0.35)',textDecoration:'none',transition:'color 0.2s'}}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'1.25rem 5%',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.75rem'}}>
          <p style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.25)'}}>
            © 2026 <a href="https://travex-digital-group.vercel.app" target="_blank" style={{color:'#C9A84C',textDecoration:'none',fontWeight:700}}>Travex Digital Group</a>. All rights reserved.
          </p>
          <p style={{fontSize:'0.68rem',color:'rgba(201,168,76,0.3)',fontStyle:'italic'}}>Africa's Intelligent Business Ecosystem</p>
        </div>
      </footer>
    </main>
  )
}
