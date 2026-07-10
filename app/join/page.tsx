'use client'

import Link from 'next/link'

export default function JoinPage() {
  return (
    <main style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f8f9fc', minHeight: '100vh', color: '#0D1B3E' }}>

      {/* ── HEADER ── */}
      <header style={{ background: '#0D1B3E', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/icon-192.png" alt="Travex" width={36} height={36} style={{ borderRadius: 8 }} />
          <span style={{ color: '#C9A84C', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>TRAVEX MALL</span>
        </div>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 999 }}>
          Tembelea Soko →
        </Link>
      </header>

      {/* ── HERO ── */}
      <section style={{ background: 'linear-gradient(135deg, #0D1B3E 0%, #1B3A8A 100%)', padding: 'clamp(3rem,8vw,5rem) 1.5rem', textAlign: 'center', color: '#fff' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 999, padding: '6px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#C9A84C', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>
          🇹🇿 BIASHARA YA KIDIJITALI · TANZANIA
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem', maxWidth: 700, margin: '0 auto 1rem' }}>
          Fungua Duka Lako<br />
          <span style={{ color: '#C9A84C' }}>Travex Mall</span>
        </h1>
        <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: 'rgba(255,255,255,0.7)', maxWidth: 520, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Soko la kwanza la kidijitali Tanzania lenye AI — kwa wanafunzi na wafanyabiashara. Wauza bidhaa zako mtandaoni leo hii, ufikia wateja zaidi.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/open-store" style={{ background: '#C9A84C', color: '#0D1B3E', fontWeight: 800, padding: '1rem 2rem', borderRadius: 14, textDecoration: 'none', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            🏪 Fungua Duka Sasa — Bure!
          </Link>
          <Link href="/" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 700, padding: '1rem 2rem', borderRadius: 14, textDecoration: 'none', fontSize: '1rem', border: '1px solid rgba(255,255,255,0.2)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            🛍️ Angalia Soko
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' }}>
          {[['500+', 'Maduka'], ['5', 'Mikoa'], ['5', 'Vyuo'], ['3', 'Bidhaa za AI']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 900, color: '#C9A84C' }}>{v}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── JINSI INAVYOFANYA KAZI ── */}
      <section style={{ padding: 'clamp(3rem,6vw,4rem) 1.5rem', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', color: '#C9A84C', marginBottom: 8 }}>MCHAKATO</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, color: '#0D1B3E' }}>Jinsi Inavyofanya Kazi</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {[
            { n: '1', icon: '📝', t: 'Omba Duka', d: 'Jaza fomu rahisi ya online — jina, bidhaa, mkoa wako. Inachukua dakika 3 tu.' },
            { n: '2', icon: '✅', t: 'Tathmini na Admin', d: 'Timu yetu inakipitia ombi lako. Jibu ndani ya saa 24. Utapata ujumbe wa WhatsApp.' },
            { n: '3', icon: '🔑', t: 'Pata Login', d: 'Ukiapprove, utapata namba ya simu yako na password kupitia WhatsApp. Ingia dashboard yako.' },
            { n: '4', icon: '📦', t: 'Weka Bidhaa', d: 'Pakia bidhaa zako na picha. Duka lako linaonekana kwenye soko mara moja.' },
            { n: '5', icon: '💰', t: 'Pokea Maagizo', d: 'Wateja wanaagiza bidhaa, unapata arifa papo hapo. Wasiliana nao kupitia WhatsApp.' },
            { n: '6', icon: '📈', t: 'Kukua na AI', d: 'Tumia AI tools — maelezo ya bidhaa, ushauri wa bei, machapisho ya mitandao ya kijamii.' },
          ].map(s => (
            <div key={s.n} style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #E8ECF4', boxShadow: '0 2px 12px rgba(13,27,62,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0D1B3E', color: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', flexShrink: 0 }}>{s.n}</div>
                <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0D1B3E' }}>{s.t}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.65, margin: 0 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MASOKO MAWILI ── */}
      <section style={{ padding: 'clamp(3rem,6vw,4rem) 1.5rem', background: '#0D1B3E' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', color: '#C9A84C', marginBottom: 8 }}>MASOKO</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, color: '#fff' }}>Chagua Soko Lako</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

            {/* Business Market */}
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '2rem', border: '1px solid rgba(201,168,76,0.3)' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', color: '#C9A84C', marginBottom: 12 }}>🏪 BIASHARA MARKET</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>Business Market</h3>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '1.5rem' }}>Kwa wafanyabiashara na wajasiriamali Tanzania. Uza bidhaa na huduma zako kwa wateja nchi nzima.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '1rem 1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontWeight: 800, color: '#fff', marginBottom: 4 }}>🥈 Mpango wa Basic</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 900, color: '#C9A84C', marginBottom: 4 }}>TZS 25,000<span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>/mwezi</span></div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {['Duka lako mtandaoni', 'Bidhaa bila kikomo', 'Ushauri wa AI', 'WhatsApp integration'].map(f => (
                      <li key={f} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', display: 'flex', gap: 6 }}>
                        <span style={{ color: '#86EFAC' }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.08))', borderRadius: 12, padding: '1rem 1.25rem', border: '1px solid rgba(201,168,76,0.4)', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -10, right: 16, background: '#C9A84C', color: '#0D1B3E', fontSize: '0.6rem', fontWeight: 900, padding: '3px 10px', borderRadius: 999 }}>INAYOPENDWA</div>
                  <div style={{ fontWeight: 800, color: '#C9A84C', marginBottom: 4 }}>🥇 Mpango wa Premium</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 900, color: '#C9A84C', marginBottom: 4 }}>TZS 45,000<span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>/mwezi</span></div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {['Kila kitu cha Basic', 'Duka linaonekana kwanza', 'Flash Deals & Group Buy', 'AI Marketing Manager', 'Ripoti za biashara'].map(f => (
                      <li key={f} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'flex', gap: 6 }}>
                        <span style={{ color: '#C9A84C' }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Link href="/open-store-b2b" style={{ display: 'block', textAlign: 'center', background: '#C9A84C', color: '#0D1B3E', fontWeight: 800, padding: '0.875rem', borderRadius: 12, textDecoration: 'none', fontSize: '0.9rem' }}>
                Fungua Duka la Biashara →
              </Link>
            </div>

            {/* Campus Market */}
            <div style={{ background: 'rgba(59,130,246,0.08)', borderRadius: 20, padding: '2rem', border: '1px solid rgba(59,130,246,0.25)' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', color: '#93C5FD', marginBottom: 12 }}>🎓 CAMPUS MARKET</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>Campus Market</h3>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '1.5rem' }}>Kwa wanafunzi wa vyuo Tanzania. Uza bidhaa kwa wanafunzi wenzako. Salama, rahisi na ya bei nafuu.</p>

              <div style={{ background: 'rgba(59,130,246,0.12)', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(59,130,246,0.2)', marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 800, color: '#93C5FD', marginBottom: 8 }}>🎓 Mpango wa Campus</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 900, color: '#93C5FD', marginBottom: 8 }}>TZS 10,000<span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>/mwezi</span></div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {['Duka lako kwenye chuo chako', 'Bidhaa bila kikomo', 'Maagizo kwa WhatsApp', 'AI tools za biashara', 'Social Vybe posts'].map(f => (
                    <li key={f} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', display: 'flex', gap: 6 }}>
                      <span style={{ color: '#86EFAC' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Vyuo vinavyohusika:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['ARU', 'UDSM', 'UDOM', 'TIA', 'NIT'].map(u => (
                    <span key={u} style={{ fontSize: '0.7rem', fontWeight: 700, background: 'rgba(59,130,246,0.2)', color: '#93C5FD', padding: '2px 8px', borderRadius: 999 }}>{u}</span>
                  ))}
                </div>
              </div>
              <Link href="/campus-apply" style={{ display: 'block', textAlign: 'center', background: '#3B82F6', color: '#fff', fontWeight: 800, padding: '0.875rem', borderRadius: 12, textDecoration: 'none', fontSize: '0.9rem' }}>
                Omba Duka la Campus →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI FEATURES ── */}
      <section style={{ padding: 'clamp(3rem,6vw,4rem) 1.5rem', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', color: '#C9A84C', marginBottom: 8 }}>TEKNOLOJIA YA AI</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, color: '#0D1B3E' }}>Vifaa vya AI — Bila Malipo</h2>
          <p style={{ fontSize: '0.9rem', color: '#64748B', maxWidth: 500, margin: '0.75rem auto 0' }}>Kila duka linapatia vifaa vya AI bila gharama ya ziada</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '🤖', t: 'AI Business Assistant', d: 'Andika maelezo ya bidhaa kwa Kiswahili na Kiingereza. Pata ushauri wa bei kwa soko la Tanzania.' },
            { icon: '📊', t: 'AI Accountant', d: 'Taarifa ya biashara yako otomatiki. Gawanya matumizi, angalia faida, pata ushauri wa fedha.' },
            { icon: '📣', t: 'Marketing Manager', d: 'Tengeneza machapisho ya Instagram, WhatsApp na Facebook papo hapo. Share kwa wateja wako.' },
            { icon: '🧠', t: 'Business Coach', d: 'Zungumza na AI Coach wako binafsi. Uliza swali lolote la biashara, upate jibu mara moja.' },
          ].map(f => (
            <div key={f.t} style={{ background: '#fff', borderRadius: 14, padding: '1.25rem', border: '1px solid #E8ECF4', boxShadow: '0 2px 8px rgba(13,27,62,0.04)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>{f.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0D1B3E', marginBottom: 6 }}>{f.t}</div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.65, margin: 0 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DOWNLOAD APP ── */}
      <section style={{ padding: 'clamp(3rem,6vw,4rem) 1.5rem', background: '#0D1B3E', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', color: '#C9A84C', marginBottom: 8 }}>PROGRAMU YA SIMU</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>
            Pakua App ya Travex Mall
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '2rem' }}>
            App ya kweli ya Android — inafunguka kama programu ya kawaida, bila URL bar. Share kupitia Xender, WhatsApp au Google Drive.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/Travex_Mall.apk" download style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#000', color: '#fff', padding: '0.875rem 1.5rem', borderRadius: 14, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', minWidth: 180 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#3DDC84"><path d="M17.523 15.341l-.002-.001-.003-.002L12 7.5l-5.518 7.838-.002.001a5.5 5.5 0 1 0 11.043 0zM12 3L2 19h20L12 3z"/></svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1, marginBottom: 2 }}>PAKUA KWA</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1 }}>Android APK</div>
              </div>
            </a>
            <button onClick={() => alert('Kwa iPhone/iOS:\n\n1. Fungua travex-mall.vercel.app kwenye Safari\n2. Gonga Share (□↑) chini\n3. Gonga "Add to Home Screen"\n4. Gonga Add — Imemaliza! ✅')} style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#000', color: '#fff', padding: '0.875rem 1.5rem', borderRadius: 14, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)', minWidth: 180, fontFamily: 'inherit' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1, marginBottom: 2 }}>WEKA KWENYE</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1 }}>iPhone / iOS</div>
              </div>
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '1.5rem' }}>
            Au tembelea moja kwa moja: <a href="https://travex-mall.vercel.app" style={{ color: '#C9A84C', textDecoration: 'none' }}>travex-mall.vercel.app</a>
          </p>
        </div>
      </section>

      {/* ── LOGIN ── */}
      <section style={{ padding: 'clamp(2rem,5vw,3rem) 1.5rem', textAlign: 'center', background: '#F0F4FF' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 900, color: '#0D1B3E', marginBottom: '0.5rem' }}>Una Duka Tayari?</h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '1.5rem' }}>Ingia kwenye dashboard yako na namba ya simu na password uliyopewa.</p>
          <Link href="/login" style={{ display: 'inline-block', background: '#0D1B3E', color: '#fff', fontWeight: 800, padding: '0.875rem 2.5rem', borderRadius: 14, textDecoration: 'none', fontSize: '0.95rem' }}>
            🔐 Ingia Dashboard →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0D1B3E', padding: '2rem 1.5rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <img src="/icon-192.png" alt="Travex" width={40} height={40} style={{ borderRadius: 10, marginBottom: 12 }} />
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', margin: 0 }}>
          © 2026 Travex Digital Group · <a href="mailto:travexdigital15@gmail.com" style={{ color: '#C9A84C', textDecoration: 'none' }}>travexdigital15@gmail.com</a> · +255 651 919 915
        </p>
      </footer>

    </main>
  )
}
