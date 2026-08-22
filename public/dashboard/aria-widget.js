// ═══════════════════════════════════════════════════════════════
// ARIA WIDGET — Floating AI assistant on all dashboard pages
// ═══════════════════════════════════════════════════════════════

(function() {

// ── Inject CSS ───────────────────────────────────────────────
const style = document.createElement('style')
style.textContent = `
  /* Aria Widget */
  #aria-btn {
    position: fixed; bottom: 24px; right: 24px; z-index: 9000;
    width: 56px; height: 56px; border-radius: 50%;
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    border: 3px solid #fff; cursor: pointer;
    box-shadow: 0 6px 24px rgba(99,102,241,0.45);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; padding: 0;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  #aria-btn:hover { transform: scale(1.08); box-shadow: 0 8px 28px rgba(99,102,241,0.55); }
  #aria-btn svg { width: 56px; height: 56px; }

  #aria-badge {
    position: absolute; top: -2px; right: -2px;
    background: #EF4444; color: #fff;
    font-size: 9px; font-weight: 800;
    width: 16px; height: 16px; border-radius: 50%;
    display: none; align-items: center; justify-content: center;
    border: 2px solid #fff;
  }

  #aria-panel {
    position: fixed; bottom: 92px; right: 24px; z-index: 8999;
    width: 340px; max-height: 500px;
    background: #fff; border-radius: 20px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.18);
    display: none; flex-direction: column;
    overflow: hidden; border: 1px solid #E2E8F4;
    font-family: 'Inter', sans-serif;
  }
  #aria-panel.open { display: flex; animation: ariaIn 0.3s cubic-bezier(0.34,1.2,0.64,1); }
  @keyframes ariaIn { from { opacity:0; transform:translateY(12px) scale(0.96); } to { opacity:1; transform:none; } }

  .aria-head {
    background: linear-gradient(135deg, #0D1B3E, #1B3A8A);
    padding: 12px 14px; display: flex; align-items: center; gap: 10px;
  }
  .aria-head-avatar {
    width: 34px; height: 34px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
    border: 2px solid rgba(255,255,255,0.2);
  }
  .aria-head-name { font-size: 13px; font-weight: 700; color: #fff; }
  .aria-head-status {
    font-size: 10px; color: rgba(255,255,255,0.5);
    display: flex; align-items: center; gap: 4px; margin-top: 1px;
  }
  .aria-online-dot { width: 6px; height: 6px; border-radius: 50%; background: #22C55E; }
  .aria-close {
    margin-left: auto; background: none; border: none;
    color: rgba(255,255,255,0.6); cursor: pointer; font-size: 18px; line-height: 1;
  }
  .aria-close:hover { color: #fff; }

  .aria-quick-btns {
    padding: 8px 10px; border-bottom: 1px solid #E2E8F4;
    display: flex; gap: 5px; flex-wrap: wrap; background: #F8FAFF;
  }
  .aria-quick-btn {
    font-size: 10px; font-weight: 600; padding: 4px 9px;
    background: #fff; border: 1px solid #E2E8F4; border-radius: 999px;
    cursor: pointer; color: #475569; transition: all 0.15s;
    font-family: 'Inter', sans-serif;
  }
  .aria-quick-btn:hover { background: #0D1B3E; color: #fff; border-color: #0D1B3E; }

  .aria-msgs {
    flex: 1; overflow-y: auto; padding: 12px; display: flex;
    flex-direction: column; gap: 8px; min-height: 0;
  }
  .aria-msg { display: flex; gap: 6px; align-items: flex-end; }
  .aria-msg.user { flex-direction: row-reverse; }
  .aria-bubble {
    max-width: 85%; padding: 9px 12px; border-radius: 14px;
    font-size: 12px; line-height: 1.65; white-space: pre-wrap;
  }
  .aria-msg.bot .aria-bubble { background: #F0F4FF; color: #1E293B; border-radius: 3px 14px 14px 14px; }
  .aria-msg.user .aria-bubble { background: #0D1B3E; color: #fff; border-radius: 14px 3px 14px 14px; }
  .aria-avatar-sm {
    width: 26px; height: 26px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
    background: linear-gradient(135deg,#6366F1,#8B5CF6);
    display: flex; align-items: center; justify-content: center;
  }

  .aria-typing { display: flex; gap: 4px; padding: 10px 14px; }
  .aria-typing span {
    width: 6px; height: 6px; border-radius: 50%; background: #94A3B8;
    animation: ariaTyping 1.2s infinite;
  }
  .aria-typing span:nth-child(2) { animation-delay: 0.2s; }
  .aria-typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes ariaTyping { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

  .aria-input-row {
    padding: 10px; border-top: 1px solid #E2E8F4;
    display: flex; gap: 6px;
  }
  .aria-input {
    flex: 1; padding: 8px 12px;
    border: 1.5px solid #E2E8F4; border-radius: 10px;
    font-size: 12px; outline: none; font-family: 'Inter', sans-serif;
    transition: border-color 0.2s;
  }
  .aria-input:focus { border-color: #0D1B3E; }
  .aria-send {
    width: 34px; height: 34px; border-radius: 10px;
    background: #0D1B3E; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #C9A84C; font-size: 16px; transition: opacity 0.2s;
  }
  .aria-send:hover { opacity: 0.85; }

  @media(max-width: 768px) {
    #aria-panel { width: calc(100vw - 32px); right: 16px; bottom: 80px; }
    #aria-btn { bottom: 80px; right: 16px; }
  }
`
document.head.appendChild(style)

// ── Aria female SVG ──────────────────────────────────────────
const ARIA_SVG = `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
  <circle cx="28" cy="28" r="28" fill="#6366F1"/>
  <circle cx="28" cy="66" r="22" fill="#818CF8"/>
  <circle cx="28" cy="23" r="13" fill="#FDE8D0"/>
  <path d="M15 20 Q17 10 28 10 Q39 10 41 20 Q39 14 28 14 Q17 14 15 20Z" fill="#7C3AED"/>
  <path d="M15 26 Q12 36 17 40 Q15 32 16 27Z" fill="#7C3AED"/>
  <path d="M41 26 Q44 36 39 40 Q41 32 40 27Z" fill="#7C3AED"/>
  <ellipse cx="23.5" cy="23" rx="1.8" ry="2.2" fill="#1E1B4B"/>
  <ellipse cx="32.5" cy="23" rx="1.8" ry="2.2" fill="#1E1B4B"/>
  <path d="M23 30 Q28 34 33 30" stroke="#E97070" stroke-width="2" stroke-linecap="round" fill="none"/>
  <circle cx="42" cy="10" r="7" fill="#22C55E"/>
  <path d="M39 10 L41.5 12.5 L45.5 7.5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`

// ── Build widget ─────────────────────────────────────────────
const btn = document.createElement('div')
btn.id = 'aria-btn'
btn.innerHTML = ARIA_SVG + '<div id="aria-badge"></div>'

const panel = document.createElement('div')
panel.id = 'aria-panel'
panel.innerHTML = `
  <div class="aria-head">
    <div class="aria-head-avatar">${ARIA_SVG}</div>
    <div>
      <div class="aria-head-name">Aria</div>
      <div class="aria-head-status">
        <div class="aria-online-dot"></div>
        AI Business Assistant
      </div>
    </div>
    <button class="aria-close" onclick="document.getElementById('aria-panel').classList.remove('open')">×</button>
  </div>

  <div class="aria-quick-btns">
    <button class="aria-quick-btn" onclick="ARIA_WIDGET.send('Nionyeshe hali ya leo')"> Briefing</button>
    <button class="aria-quick-btn" onclick="ARIA_WIDGET.send('Angalia stock inayokwisha')"> Stock</button>
    <button class="aria-quick-btn" onclick="ARIA_WIDGET.send('Nionyeshe revenue ya mwezi')"> Revenue</button>
    <button class="aria-quick-btn" onclick="ARIA_WIDGET.send('Nipe tips za kuboresha biashara')"> Tips</button>
    <button class="aria-quick-btn" onclick="ARIA_WIDGET.send('Tengeneza Instagram post')"> Post</button>
    <button class="aria-quick-btn" onclick="ARIA_WIDGET.send('Fanya revenue forecast')"> Forecast</button>
  </div>

  <div class="aria-msgs" id="ariaMsgs">
    <div class="aria-msg bot">
      <div class="aria-avatar-sm">${ARIA_SVG}</div>
      <div class="aria-bubble">Habari! Mimi ni Aria, msaidizi wako wa AI. Ninaweza kukusaidia na mauzo, marketing, fedha, na mengi zaidi. Niambie unachohitaji!</div>
    </div>
  </div>

  <div class="aria-input-row">
    <input class="aria-input" id="ariaInput" placeholder="Uliza Aria chochote..." />
    <button class="aria-send" onclick="ARIA_WIDGET.sendFromInput()"></button>
  </div>
`

document.body.appendChild(btn)
document.body.appendChild(panel)

// ── Widget controller ────────────────────────────────────────
window.ARIA_WIDGET = {
  history: [],

  toggle() {
    const p = document.getElementById('aria-panel')
    p.classList.toggle('open')
    if (p.classList.contains('open')) {
      document.getElementById('ariaInput').focus()
      document.getElementById('aria-badge').style.display = 'none'
    }
  },

  addMsg(role, text) {
    const msgs = document.getElementById('ariaMsgs')
    const div = document.createElement('div')
    div.className = `aria-msg ${role}`
    div.innerHTML = role === 'bot'
      ? `<div class="aria-avatar-sm">${ARIA_SVG}</div><div class="aria-bubble">${text.replace(/\n/g,'<br>')}</div>`
      : `<div class="aria-bubble">${text}</div>`
    msgs.appendChild(div)
    msgs.scrollTop = msgs.scrollHeight
    return div
  },

  showTyping() {
    const msgs = document.getElementById('ariaMsgs')
    const div = document.createElement('div')
    div.className = 'aria-msg bot'
    div.id = 'ariaTyping'
    div.innerHTML = `<div class="aria-avatar-sm">${ARIA_SVG}</div><div class="aria-bubble"><div class="aria-typing"><span></span><span></span><span></span></div></div>`
    msgs.appendChild(div)
    msgs.scrollTop = msgs.scrollHeight
  },

  hideTyping() {
    document.getElementById('ariaTyping')?.remove()
  },

  async send(msg) {
    if (!msg.trim()) return
    const panel = document.getElementById('aria-panel')
    if (!panel.classList.contains('open')) panel.classList.add('open')
    this.addMsg('user', msg)
    this.history.push({ role: 'user', content: msg })
    this.showTyping()
    try {
      const result = await ARIA.chat(msg, this.history)
      this.hideTyping()
      this.addMsg('bot', result.reply)
      this.history.push({ role: 'bot', content: result.reply })

      // If it was a command, refresh page data if function exists
      if (result.action && typeof window.loadData === 'function') {
        setTimeout(() => window.loadData(), 1000)
      }
    } catch(e) {
      this.hideTyping()
      this.addMsg('bot', 'Samahani, hitilafu imetokea. Jaribu tena.')
    }
  },

  sendFromInput() {
    const input = document.getElementById('ariaInput')
    const msg = input.value.trim()
    if (!msg) return
    input.value = ''
    this.send(msg)
  },

  notify(msg) {
    const badge = document.getElementById('aria-badge')
    badge.style.display = 'flex'
    const panel = document.getElementById('aria-panel')
    if (panel.classList.contains('open')) {
      this.addMsg('bot', msg)
    }
  }
}

// Event listeners
btn.addEventListener('click', () => ARIA_WIDGET.toggle())
document.getElementById('ariaInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') ARIA_WIDGET.sendFromInput()
})

// Auto-greet after 3s on dashboard pages
setTimeout(async () => {
  const page = window.location.pathname
  if (page.includes('dashboard.html') || page.includes('index')) {
    const session = JSON.parse(localStorage.getItem('travex_session')||'{}')
    if (session?.id) {
      const result = await ARIA.chat('Nionyeshe hali ya leo', [])
      ARIA_WIDGET.notify(' Aria ana briefing yako!')
      ARIA_WIDGET.history.push({ role: 'bot', content: result.reply })
    }
  }
}, 3000)

})()
