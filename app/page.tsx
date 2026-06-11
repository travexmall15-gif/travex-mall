import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { Particles } from '@/components/particles'
import { ShopCard } from '@/components/shop-card'
import { shops, universities } from '@/lib/data'
import {
  Store, GraduationCap, Briefcase, FileText,
  ShieldCheck, Rocket, TrendingUp, Sparkles,
  Heart, Zap, ArrowRight, Star,
} from 'lucide-react'

const steps = [
  { icon: FileText,    title: 'Apply',   desc: 'Submit your application with student ID.' },
  { icon: ShieldCheck, title: 'Verify',  desc: 'We review and approve within 48 hours.' },
  { icon: Rocket,      title: 'Launch',  desc: 'Add products and go live instantly.' },
  { icon: TrendingUp,  title: 'Earn',    desc: 'Get WhatsApp orders and grow.' },
]

const benefits = [
  { icon: Zap,         title: 'WhatsApp Orders',    desc: 'Customers order via WhatsApp — simple and fast.' },
  { icon: Sparkles,    title: 'AI Assistants',       desc: 'AI for customer care, marketing and pricing.' },
  { icon: Heart,       title: 'Social Vybe Feed',    desc: 'Promote products on campus social commerce feed.' },
  { icon: TrendingUp,  title: 'Sales Analytics',     desc: 'Track revenue and orders in real-time.' },
  { icon: ShieldCheck, title: 'Verified Badge',       desc: 'Build trust with a verified shop badge.' },
  { icon: Store,       title: 'Your Own Storefront',  desc: 'Custom shop page with your brand and products.' },
]

const testimonials = [
  { name: 'Amina Hassan', role: 'Fashion · UDSM', quote: 'I went from selling at the hostel gate to 50+ orders a week. The WhatsApp integration is genius!', rating: 5 },
  { name: 'John Mushi',   role: 'Electronics · ARU',  quote: 'The AI assistant answers my customers even when I am in class. Revenue doubled in 2 months.', rating: 5 },
  { name: 'Grace Temba',  role: 'Food Vendor · UDOM', quote: 'Setting up my shop took 5 minutes. Now I get lunch orders every morning before 10am.', rating: 5 },
]

export default function HomePage() {
  return (
    <main style={{ fontFamily: 'Inter, sans-serif', background: '#F8F9FC' }}>
      <SiteNav />

      {/* ── HERO ── */}
      <section style={{
        position: 'relative', minHeight: '100vh', display: 'flex',
        alignItems: 'center', overflow: 'hidden', background: '#0D1B3E',
        paddingTop: '64px', color: '#fff'
      }}>
        <div style={{
          position: 'absolute', inset: 0, backgroundImage: 'url(/hero-marketplace.png)',
          backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.2
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #0D1B3E 0%, rgba(13,27,62,0.92) 60%, rgba(27,58,107,0.8) 100%)'
        }} />
        <Particles />
        <div style={{ position: 'relative', width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '5rem 5% 4rem' }}>
          <div style={{ maxWidth: '680px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)',
              color: '#C9A84C', padding: '0.35rem 1rem', borderRadius: '20px',
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1.5rem'
            }}>
              ◆ Africa's #1 AI-Powered Marketplace — Tanzania 2026
            </div>
            <h1 style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(2.4rem, 6vw, 4.8rem)',
              fontWeight: 900, lineHeight: 1.08, color: '#fff',
              marginBottom: '1.25rem', letterSpacing: '-0.01em'
            }}>
              Africa's{' '}
              <span style={{
                color: '#C9A84C',
                textShadow: '0 0 40px rgba(201,168,76,0.3)'
              }}>Intelligent</span>
              <br />Digital Marketplace
            </h1>
            <p style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', lineHeight: 1.75,
              color: 'rgba(255,255,255,0.65)', marginBottom: '2rem',
              maxWidth: '520px', fontWeight: 400
            }}>
              Create your online store in minutes. Sell across Tanzania. Grow your business with AI-powered tools — designed for every African entrepreneur.
            </p>
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <Link href="/campus-apply" style={{
                background: '#C9A84C', color: '#0D1B3E', padding: '0.85rem 2rem',
                borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                transition: 'all 0.2s'
              }}>
                Login to Your Shop →
              </Link>
              <Link href="/open-store-b2c" style={{
                background: 'rgba(255,255,255,0.08)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.25)', padding: '0.85rem 2rem',
                borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                backdropFilter: 'blur(8px)', transition: 'all 0.2s'
              }}>
                Open New Store
              </Link>
            </div>
            <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
              {[['3M+','Tanzania SMEs'],['$75B','Africa Market'],['30%+','Annual Growth']].map(([v,l]) => (
                <div key={l}>
                  <div style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                    fontWeight: 900, color: '#C9A84C'
                  }}>{v}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── B2C SECTION ── */}
      <section style={{ background: '#F8F9FC', padding: '5rem 5%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-120px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,27,62,0.05), transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06), transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1B3A6B', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '0.6rem' }}>
            For Individual Sellers
          </div>
          <h2 style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 800, color: '#0D1B3E', marginBottom: '0.6rem'
          }}>
            Sell Anything. Reach Everyone.
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.7, marginBottom: '3rem', maxWidth: '480px', margin: '0 auto 3rem' }}>
            Open your B2C shop and start receiving WhatsApp orders from customers across Tanzania. From TZS 25,000/month.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', maxWidth: '900px', margin: '0 auto 2.5rem' }}>
            {[
              { plan: 'Basic', price: 'TZS 25,000/mo', features: ['Personal shop page', 'Unlimited products', 'WhatsApp orders', 'AI Customer Care'] },
              { plan: 'Premium', price: 'TZS 45,000/mo', features: ['All Basic features', 'Priority listing', 'Marketing AI tools', 'Accounting dashboard'], highlight: true },
            ].map(p => (
              <div key={p.plan} style={{
                background: p.highlight ? '#0D1B3E' : '#fff',
                color: p.highlight ? '#fff' : '#0D1B3E',
                border: `2px solid ${p.highlight ? '#C9A84C' : '#E5E7EB'}`,
                borderRadius: '16px', padding: '2rem', textAlign: 'left', position: 'relative'
              }}>
                {p.highlight && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#C9A84C', color: '#0D1B3E', fontSize: '0.62rem', fontWeight: 700, padding: '0.2rem 0.8rem', borderRadius: '20px', whiteSpace: 'nowrap' }}>Most Popular</div>}
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.4rem' }}>B2C {p.plan}</div>
                <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.6rem', fontWeight: 900, marginBottom: '1.25rem' }}>{p.price}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {p.features.map(f => <li key={f} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: p.highlight ? 'rgba(255,255,255,0.75)' : '#374151' }}><span style={{ color: '#C9A84C' }}>✓</span>{f}</li>)}
                </ul>
                <Link href="/open-store-b2c" style={{
                  display: 'block', textAlign: 'center', background: p.highlight ? '#C9A84C' : '#0D1B3E',
                  color: p.highlight ? '#0D1B3E' : '#fff', padding: '0.75rem', borderRadius: '8px',
                  fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none'
                }}>Get Started →</Link>
              </div>
            ))}
          </div>
          <Link href="/open-store-b2c" style={{ fontSize: '0.85rem', color: '#1B3A6B', fontWeight: 600, textDecoration: 'none' }}>
            View all B2C plans →
          </Link>
        </div>
      </section>

      {/* ── B2B SECTION ── */}
      <section style={{ background: '#fff', padding: '5rem 5%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1B3A6B', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '0.6rem' }}>
            For Businesses & SMEs
          </div>
          <h2 style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 800, color: '#0D1B3E', marginBottom: '0.6rem'
          }}>
            Scale Your Business Across Tanzania.
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.7, marginBottom: '3rem', maxWidth: '480px', margin: '0 auto 3rem' }}>
            Get a verified business shop, manage bulk orders and reach customers in every region of Tanzania. From TZS 75,000/month.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', maxWidth: '900px', margin: '0 auto 2.5rem' }}>
            {[
              { plan: 'Basic', price: 'TZS 75,000/mo', features: ['Business verification', 'Multiple products', 'Bulk order management', 'Business analytics'] },
              { plan: 'Premium', price: 'TZS 110,000/mo', features: ['All Basic features', 'Featured placement', 'Priority support', 'Custom branding'], highlight: true },
            ].map(p => (
              <div key={p.plan} style={{
                background: p.highlight ? '#0D1B3E' : '#F8F9FC',
                color: p.highlight ? '#fff' : '#0D1B3E',
                border: `2px solid ${p.highlight ? '#C9A84C' : '#E5E7EB'}`,
                borderRadius: '16px', padding: '2rem', textAlign: 'left', position: 'relative'
              }}>
                {p.highlight && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#C9A84C', color: '#0D1B3E', fontSize: '0.62rem', fontWeight: 700, padding: '0.2rem 0.8rem', borderRadius: '20px', whiteSpace: 'nowrap' }}>Most Popular</div>}
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.4rem' }}>B2B {p.plan}</div>
                <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.6rem', fontWeight: 900, marginBottom: '1.25rem' }}>{p.price}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {p.features.map(f => <li key={f} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: p.highlight ? 'rgba(255,255,255,0.75)' : '#374151' }}><span style={{ color: '#C9A84C' }}>✓</span>{f}</li>)}
                </ul>
                <Link href="/open-store-b2b" style={{
                  display: 'block', textAlign: 'center', background: p.highlight ? '#C9A84C' : '#0D1B3E',
                  color: p.highlight ? '#0D1B3E' : '#fff', padding: '0.75rem', borderRadius: '8px',
                  fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none'
                }}>Get Started →</Link>
              </div>
            ))}
          </div>
          <Link href="/open-store-b2b" style={{ fontSize: '0.85rem', color: '#1B3A6B', fontWeight: 600, textDecoration: 'none' }}>
            View all B2B plans →
          </Link>
        </div>
      </section>

      {/* ── TOP RATED CAROUSEL ── */}
      <section style={{ background: '#F8F9FC', padding: '5rem 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '0.4rem' }}>
                // Editor's Choice
              </div>
              <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)', fontWeight: 800, color: '#0D1B3E' }}>
                Top Rated Shops ⭐⭐⭐⭐⭐
              </h2>
            </div>
            <Link href="/campus" style={{ fontSize: '0.82rem', color: '#1B3A6B', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              View all shops <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {shops.slice(0, 6).map(shop => (
              <ShopCard key={shop.slug} shop={shop} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL VYBE ── */}
      <section style={{ background: '#F8F9FC', padding: '0 5% 5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ background: '#07010E', borderRadius: '20px', padding: 'clamp(2rem, 5vw, 3.5rem)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
              <div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(201,168,76,0.12)', color: '#C9A84C', padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                  <Sparkles size={12} /> Social Commerce
                </span>
                <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
                  Social Vybe Feed
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: '1.75rem' }}>
                  A campus social commerce feed where shops post products, customers like and discover, then order on WhatsApp instantly.
                </p>
                <Link href="/vybe" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: '#C9A84C', color: '#0D1B3E', padding: '0.8rem 1.75rem',
                  borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none'
                }}>
                  Open Social Vybe <ArrowRight size={16} />
                </Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {['/social-vybe-ankara-fashion-flatlay.png','/clean-white-sneakers-product-shot.png','/skincare-cosmetics-flatlay-beauty.png','/tanzanian-pilau-rice-meal.png','/wireless-earbuds-product-photo.png','/smoothie-bowl-healthy-breakfast.png'].map(src => (
                  <img key={src} src={src} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '10px' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── UNIVERSITY STUDENT MARKET ── */}
      <section id="uni" style={{ background: '#fff', padding: '5rem 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1B3A6B', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '0.6rem' }}>
              Student Marketplace
            </div>
            <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#0D1B3E', marginBottom: '0.5rem' }}>
              Your University. Your Market.
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.7, maxWidth: '440px', margin: '0 auto' }}>
              60 seller slots per university. Apply before they fill up.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {universities.map(uni => (
              <Link key={uni.slug} href={`/campus/${uni.slug}`} style={{ textDecoration: 'none' }}>
                <div className="hover:-translate-y-1 hover:shadow-lg transition-all" style={{
                  borderRadius: '14px', overflow: 'hidden', border: '1.5px solid #E5E7EB',
                  cursor: 'pointer'
                }}
                  
                  >
                  <div style={{ height: '90px', background: 'linear-gradient(135deg, #0D1B3E, #1B3A6B)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.75rem', fontWeight: 900, color: '#C9A84C' }}>{uni.abbr}</div>
                    <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{uni.city}</div>
                  </div>
                  <div style={{ padding: '0.85rem 1rem', background: '#fff' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0D1B3E', marginBottom: '0.5rem', lineHeight: 1.3 }}>{uni.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.4rem' }}>
                      <span style={{ color: '#6B7280' }}>{uni.activeShops} active shops</span>
                      <span style={{ color: (uni.totalSlots - uni.activeShops) < 10 ? '#DC2626' : '#059669', fontWeight: 700 }}>
                        {uni.totalSlots - uni.activeShops} slots left
                      </span>
                    </div>
                    <div style={{ height: '4px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(uni.activeShops / uni.totalSlots) * 100}%`, background: '#C9A84C', borderRadius: '4px' }} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link href="/campus-apply" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: '#C9A84C', color: '#0D1B3E', padding: '0.85rem 2rem',
              borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none'
            }}>
              <GraduationCap size={18} /> Apply for a Campus Shop
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: '#F8F9FC', padding: '5rem 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#0D1B3E', marginBottom: '0.5rem' }}>
              How It Works
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#6B7280' }}>Launch your shop in four simple steps.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {steps.map((step, i) => (
              <div key={step.title} style={{
                background: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB',
                padding: '1.75rem 1.5rem', textAlign: 'center', position: 'relative'
              }}>
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: '#C9A84C', color: '#0D1B3E', fontSize: '0.62rem', fontWeight: 700,
                  padding: '0.18rem 0.7rem', borderRadius: '20px'
                }}>Step {i + 1}</div>
                <div style={{ width: '52px', height: '52px', background: 'rgba(13,27,62,0.06)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <step.icon size={24} color="#0D1B3E" />
                </div>
                <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.05rem', fontWeight: 800, color: '#0D1B3E', marginBottom: '0.4rem' }}>{step.title}</div>
                <p style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: '#0D1B3E', padding: '5rem 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '0.5rem' }}>Success Stories</div>
            <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#fff' }}>
              What Our Sellers Say
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {testimonials.map(t => (
              <div key={t.name} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '1.75rem' }}>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '1rem' }}>
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={14} color="#C9A84C" fill="#C9A84C" />)}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, fontStyle: 'italic', marginBottom: '1.5rem' }}>
                  "{t.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0D1B3E', fontSize: '0.85rem', flexShrink: 0 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{t.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section style={{ background: '#fff', padding: '5rem 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#0D1B3E' }}>
              Why Sellers Love Travex Mall
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {benefits.map(b => (
              <div key={b.title} style={{ background: '#F8F9FC', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '1.75rem', transition: 'all 0.2s' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(13,27,62,0.06)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <b.icon size={22} color="#0D1B3E" />
                </div>
                <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1rem', fontWeight: 800, color: '#0D1B3E', marginBottom: '0.4rem' }}>{b.title}</div>
                <p style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.65 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#C9A84C', padding: '5rem 5%', textAlign: 'center' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', fontWeight: 900, color: '#0D1B3E', marginBottom: '0.75rem' }}>
            Open Your Shop Today
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(13,27,62,0.65)', marginBottom: '2rem', lineHeight: 1.7 }}>
            Join {universities.length} universities and hundreds of sellers already growing on Travex Mall.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/campus-apply" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: '#0D1B3E', color: '#fff', padding: '0.9rem 2rem',
              borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none'
            }}>
              <GraduationCap size={18} /> Open Campus Shop
            </Link>
            <Link href="/open-store-b2c" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'transparent', color: '#0D1B3E',
              border: '2px solid #0D1B3E', padding: '0.9rem 2rem',
              borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none'
            }}>
              <Briefcase size={18} /> Open Business Shop
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
