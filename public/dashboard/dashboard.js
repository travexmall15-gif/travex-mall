// 
// SHOPNEKT, Shared Dashboard JS
// Modelled after ShopNekt Finance pattern
// 

const SB_URL = 'https://bscecjbgnjitlfmgwcic.supabase.co';
const SB_KEY = 'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos';
const { createClient } = supabase;
const sb = createClient(SB_URL, SB_KEY);

//  AUTH 
const Auth = {
  // No Supabase Auth used, pure phone+password against pending_payments/campus_stores.
  // Session stored in localStorage as {id, market}.
  async getSession() {
    const raw = localStorage.getItem('travex_session');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
  requireAuth() {
    // SYNC — no await, no network call, no hang.
    // Trust local session completely. Removed DB re-validation
    // which caused 5-30s hangs on every page load.
    const raw = localStorage.getItem('travex_session');
    if (!raw) { window.location.href = 'login.html'; return null; }
    let session;
    try { session = JSON.parse(raw); } catch(e) { window.location.href = 'login.html'; return null; }
    if (!session || !session.id) { window.location.href = 'login.html'; return null; }
    return { user: { id: session.id, email: session.id } };
  },
  async signOut() {
    ['travex_session','travex_plan','travex_shop_name','travex_owner_name',
     'travex_category','travex_region','travex_user_id','travex_email'].forEach(k => localStorage.removeItem(k));
    window.location.href = 'login.html';
  },
};

//  SHOP 
const Shop = {
  _cache: null,
  _type: null, // 'business' | 'campus'

  async get() {
    if (this._cache) return this._cache;

    const raw = localStorage.getItem('travex_session');
    if (!raw) return null;
    let session;
    try { session = JSON.parse(raw); } catch { return null; }

    if (session.market === 'campus') {
      const { data: campus } = await sb.from('campus_stores')
        .select('*').eq('id', session.id).eq('is_active', true).maybeSingle();
      if (campus) {
        this._cache = {
          ...campus,
          shop_name:      campus.store_name,
          owner_name:     campus.owner_name,
          shop_whatsapp:  campus.whatsapp,
          shop_category:  campus.category,
          shop_region:    campus.university_abbr,
          shop_desc:      campus.description,
          plan:           'campus',
          _market:        'campus',
        };
        this._type = 'campus';
        return this._cache;
      }
      return null;
    }

    // business market
    const { data: biz } = await sb.from('pending_payments')
      .select('*').eq('id', session.id).eq('status','approved').maybeSingle();
    if (biz) {
      this._cache = { ...biz, _market: 'business' };
      this._type = 'business';
      return this._cache;
    }
    return null;
  },

  isCampus() { return this._type === 'campus'; },
  isBusiness() { return this._type === 'business'; },
};

//  DATABASE 
const DB = {
  products: {
    _tbl() { const s=JSON.parse(localStorage.getItem('travex_session')||'{}'); return s.market==='campus' ? {t:'campus_products',c:'store_id'} : {t:'products',c:'shop_id'}; },
    async getAll(shopId) {
      const {t,c}=this._tbl();
      const { data } = await sb.from(t).select('*').eq(c, shopId).order('created_at',{ascending:false});
      return data || [];
    },
    async save(item) {
      const {t}=this._tbl();
      if (item.id) { const {id,...rest}=item; return sb.from(t).update(rest).eq('id',id); }
      return sb.from(t).insert(item);
    },
    async delete(id) {
      const {t}=this._tbl();
      return sb.from(t).delete().eq('id',id);
    },
  },
  orders: {
    _tbl() { const s=JSON.parse(localStorage.getItem('travex_session')||'{}'); return s.market==='campus' ? {t:'campus_orders',c:'store_id'} : {t:'orders',c:'shop_id'}; },
    async getAll(shopId) {
      const {t,c}=this._tbl();
      const { data } = await sb.from(t).select('*').eq(c, shopId).order('created_at',{ascending:false});
      return data || [];
    },
    async updateStatus(id, status) {
      const {t}=this._tbl();
      return sb.from(t).update({status}).eq('id',id);
    },
  },
  sales: {
    async getAll(shopId) {
      const { data } = await sb.from('seller_sales')
        .select('*').eq('store_id',shopId).order('date',{ascending:false});
      return data || [];
    },
    async save(item) {
      if (item.id) {
        const {id,...rest}=item;
        return sb.from('seller_sales').update(rest).eq('id',id);
      }
      return sb.from('seller_sales').insert(item);
    },
    async delete(id) {
      return sb.from('seller_sales').delete().eq('id',id);
    },
  },
  debts: {
    async getAll(shopId) {
      const { data } = await sb.from('seller_debts')
        .select('*').eq('store_id',shopId).order('created_at',{ascending:false});
      return data || [];
    },
    async save(item) {
      if (item.id) {
        const {id,...rest}=item;
        return sb.from('seller_debts').update(rest).eq('id',id);
      }
      return sb.from('seller_debts').insert(item);
    },
    async delete(id) {
      return sb.from('seller_debts').delete().eq('id',id);
    },
    async markPaid(id) {
      return sb.from('seller_debts').update({paid:true}).eq('id',id);
    },
  },
  vybe: {
    async getPosts(shopId) {
      const { data } = await sb.from('feed_posts')
        .select('*').eq('store_id',shopId).order('created_at',{ascending:false});
      return data || [];
    },
    async getAll(shopId) { return this.getPosts(shopId); },
    async post(item) {
      return sb.from('feed_posts').insert(item);
    },
    async delete(id) {
      return sb.from('feed_posts').delete().eq('id',id);
    },
  },
};

//  HELPERS 
function formatTZS(n) {
  if (!n && n !== 0) return '-';
  return 'TZS ' + Number(n).toLocaleString('en-US');
}
function today() { return new Date().toISOString().split('T')[0]; }
function timeAgo(d) {
  if (!d) return '-';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff/60000);
  if (m < 1)  return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m/60);
  if (h < 24) return h + 'h ago';
  return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short'});
}
function truncate(s, n=40) {
  if (!s) return '-';
  return s.length > n ? s.slice(0,n) + '' : s;
}

//  TOAST 
function showToast(msg, type='default') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast' + (type !== 'default' ? ' ' + type : '');
  t.style.display = 'flex';
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.style.display = 'none'; }, 3200);
}

//  MODAL 
function openModal(id)  { const m=document.getElementById(id); if(m) m.classList.add('show'); }
function closeModal(id) { const m=document.getElementById(id); if(m) m.classList.remove('show'); }

//  SIDEBAR 
async function loadSidebar(activePage, shopData) {
  const el = document.getElementById('sidebar');
  if (!el) return;

  const plan = shopData?.plan || localStorage.getItem('travex_plan') || 'basic';
  const shopName = shopData?.shop_name || localStorage.getItem('travex_shop_name') || 'My Shop';
  const ownerName = shopData?.owner_name || localStorage.getItem('travex_owner_name') || '';
  const initials = ownerName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || 'TX';
  const isPremium = plan === 'premium';
  const isCampus  = plan === 'campus';
  const planLabel = plan === 'premium' ? ' Premium' : plan === 'campus' ? ' Campus' : ' Basic';

  const navItem = (id, href, icon, label, isPro=false) => {
    const locked = isPro && !isPremium;
    return `<a href="${locked?'#':href}" class="nav-item ${activePage===id?'active':''}"
      ${locked?`onclick="showToast(' Premium Only, Upgrade to access','warning');return false"`:''}>
      <i class="ti ${icon}"></i> ${label}
      ${locked ? '<span style="margin-left:auto;background:rgba(255,215,0,0.2);color:var(--gold);font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px">PRO</span>' : ''}
    </a>`;
  };

  el.innerHTML = `
    <div class="sidebar-logo">
      <div class="sidebar-logo-brand">SHOPNEKT</div>
      <div class="sidebar-logo-tag">Seller Dashboard</div>
    </div>

    <div class="sidebar-user">
      <div class="sidebar-avatar">${initials}</div>
      <div>
        <div class="sidebar-user-name">${truncate(shopName,20)}</div>
        <div class="sidebar-user-plan">${planLabel}</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-label">Main</div>
      ${navItem('dashboard', 'dashboard.html', 'ti-home',          'Overview')}
      ${navItem('products',  'products.html',  'ti-package',       'Products')}
      ${navItem('orders',    'orders.html',    'ti-shopping-cart', 'Orders')}

      <div class="nav-label">Finance</div>
      ${navItem('accounting','accounting.html','ti-cash',          'Accounting')}
      ${navItem('debts',     'debts.html',     'ti-credit-card',   'Debts')}
      ${navItem('invoice',   'invoice.html',   'ti-file-invoice',  'Invoice')}
      ${navItem('reports',   'reports.html',   'ti-chart-bar',     'Reports')}

      <div class="nav-label">Growth</div>
      ${navItem('vybe',       'vybe.html',       'ti-bolt',          'Social Vybe')}
      ${navItem('flash-deals','flash-deals.html','ti-flame',         ' Flash Deals')}
      ${navItem('group-buy',  'group-buy.html',  'ti-users-group',   ' Group Buying')}
      ${navItem('ai-tools',    'ai-tools.html',    'ti-robot',          'AI Tools')}
      ${navItem('ai-marketing','ai-marketing.html','ti-speakerphone',   'AI Marketing')}
      ${navItem('ai-finance',  'ai-finance.html',  'ti-chart-arrows-vertical','AI Finance')}

      <div class="nav-label">Account</div>
      ${navItem('settings',  'settings.html',  'ti-settings',      'Settings')}
    </nav>

    <div class="sidebar-footer">
      <a href="/subscription" class="nav-item"><i class="ti ti-crown"></i> Subscription</a>
      <button class="nav-item logout-btn" onclick="Auth.signOut()" style="color:rgba(255,100,100,0.75);border:none;background:none;cursor:pointer;font-family:inherit;width:100%">
        <i class="ti ti-logout"></i> Sign Out
      </button>
    </div>
  `;
  // Apply i18n after sidebar renders
  setTimeout(() => { if (window.LANG) window.LANG.apply(); }, 100);
}

//  MOBILE MENU 
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

//  LOADING 
function showLoading(show=true) {
  const el = document.getElementById('loadingOverlay');
  if (el) el.style.display = show ? 'flex' : 'none';
}

//  AI CALL 
async function askAI(system, userMsg) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 800,
        system,
        messages: [{ role:'user', content:userMsg }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || 'Could not get response.';
  } catch(e) {
    return 'Error connecting to AI. Please try again.';
  }
}

// 
// FLASH DEALS, Seller can create/manage
// 
const FlashDeals = {
  async getAll(shopId) {
    const { data } = await sb.from('flash_deals')
      .select('*').eq('store_id', shopId)
      .order('created_at', { ascending: false });
    return data || [];
  },
  async create(item) {
    return sb.from('flash_deals').insert(item);
  },
  async delete(id) {
    return sb.from('flash_deals').delete().eq('id', id);
  },
};

// 
// GROUP BUYING, Seller can create groups
// 
const GroupBuys = {
  async getAll(shopId) {
    const { data } = await sb.from('group_orders')
      .select('*, group_order_members(count)')
      .eq('store_id', shopId)
      .order('created_at', { ascending: false });
    return data || [];
  },
  async create(item) {
    return sb.from('group_orders').insert(item);
  },
  async delete(id) {
    return sb.from('group_orders').delete().eq('id', id);
  },
};

// 
// ANALYTICS, Track views
// 
async function trackEvent(storeId, event, productId, source) {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_id: storeId, event, product_id: productId, source })
    });
  } catch(e) { /* silent */ }
}


// ══════════════════════════════════════════
//  360 AI — Seller Dashboard Assistant
// ══════════════════════════════════════════
(function(){
  // Inject CSS
  const style = document.createElement('style');
  style.textContent = `
    #ai360-btn{position:fixed;bottom:24px;right:20px;width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#0D1B3E,#1B3A8A);box-shadow:0 6px 20px rgba(13,27,62,0.45);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:9999;transition:transform .2s}
    #ai360-btn:hover{transform:scale(1.1)}
    #ai360-badge{position:absolute;top:0;right:0;width:16px;height:16px;background:#F97316;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:900;color:#fff}
    #ai360-win{position:fixed;bottom:84px;right:16px;width:310px;max-height:420px;background:#fff;border-radius:18px;box-shadow:0 16px 48px rgba(13,27,62,0.22);display:none;flex-direction:column;z-index:9998;overflow:hidden;border:1.5px solid #E2E8F0;font-family:'Inter',sans-serif}
    #ai360-win.open{display:flex}
    #ai360-hd{background:linear-gradient(135deg,#0D1B3E,#1B3A8A);padding:10px 13px;display:flex;align-items:center;gap:9px;flex-shrink:0}
    #ai360-hd-icon{width:30px;height:30px;background:rgba(255,255,255,0.12);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:14px}
    #ai360-hd-title{flex:1}
    #ai360-hd-title b{display:block;font-size:.8rem;font-weight:800;color:#fff}
    #ai360-hd-title span{font-size:.62rem;color:rgba(255,255,255,0.5)}
    #ai360-close{background:rgba(255,255,255,0.1);border:none;border-radius:50%;width:26px;height:26px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px}
    #ai360-msgs{flex:1;overflow-y:auto;padding:10px 12px;display:flex;flex-direction:column;gap:7px;background:#F8FAFF}
    .ai360-msg{max-width:80%;padding:7px 10px;font-size:.78rem;line-height:1.5;border-radius:12px}
    .ai360-bot{background:#fff;color:#0F172A;border:1px solid #E2E8F0;align-self:flex-start;border-radius:3px 12px 12px 12px}
    .ai360-user{background:#0D1B3E;color:#fff;align-self:flex-end;border-radius:12px 12px 3px 12px}
    .ai360-typing{display:flex;gap:4px;padding:7px 10px}
    .ai360-dot{width:6px;height:6px;border-radius:50%;background:#CBD5E1;animation:ai360bounce .8s ease infinite}
    .ai360-dot:nth-child(2){animation-delay:.15s}.ai360-dot:nth-child(3){animation-delay:.3s}
    @keyframes ai360bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
    #ai360-inp-row{padding:8px 10px;border-top:1px solid #E2E8F0;display:flex;gap:7px;align-items:center;background:#fff;flex-shrink:0}
    #ai360-inp{flex:1;padding:7px 11px;border:1.5px solid #E2E8F0;border-radius:10px;font-size:.78rem;font-family:'Inter',sans-serif;outline:none;background:#F8FAFF;color:#0F172A}
    #ai360-inp:focus{border-color:#0D1B3E}
    #ai360-send{width:30px;height:30px;border-radius:50%;background:#0D1B3E;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px}
    #ai360-send:disabled{background:#E2E8F0;cursor:not-allowed}
  `;
  document.head.appendChild(style);

  // Inject HTML
  const el = document.createElement('div');
  el.innerHTML = `
    <button id="ai360-btn" onclick="ai360.toggle()">
      ✨
      <div id="ai360-badge">AI</div>
    </button>
    <div id="ai360-win">
      <div id="ai360-hd">
        <div id="ai360-hd-icon">✨</div>
        <div id="ai360-hd-title"><b>360 AI</b><span>Seller Assistant</span></div>
        <button id="ai360-close" onclick="ai360.toggle()">✕</button>
      </div>
      <div id="ai360-msgs">
        <div class="ai360-msg ai360-bot">👋 Habari! Mimi ni <b>360 AI</b> — msaidizi wako wa duka.<br><br>Ninaweza kukusaidia na bidhaa, mauzo, bei, na zaidi. Unauliza nini?</div>
      </div>
      <div id="ai360-inp-row">
        <input id="ai360-inp" placeholder="Uliza swali..." onkeydown="if(event.key==='Enter')ai360.send()">
        <button id="ai360-send" onclick="ai360.send()">➤</button>
      </div>
    </div>
  `;
  document.body.appendChild(el);

  // AI Logic
  window.ai360 = {
    msgs: [],
    loading: false,
    toggle() {
      document.getElementById('ai360-win').classList.toggle('open');
    },
    addMsg(role, text) {
      const el = document.createElement('div');
      el.className = 'ai360-msg ' + (role==='bot' ? 'ai360-bot' : 'ai360-user');
      el.innerHTML = text.replace(/\*\*(.*?)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>');
      const msgs = document.getElementById('ai360-msgs');
      msgs.appendChild(el);
      msgs.scrollTop = msgs.scrollHeight;
    },
    async send() {
      const inp = document.getElementById('ai360-inp');
      const msg = inp.value.trim();
      if (!msg || this.loading) return;
      inp.value = '';
      this.addMsg('user', msg);
      this.loading = true;
      document.getElementById('ai360-send').disabled = true;

      // Typing indicator
      const typing = document.createElement('div');
      typing.className = 'ai360-msg ai360-bot ai360-typing';
      typing.innerHTML = '<div class="ai360-dot"></div><div class="ai360-dot"></div><div class="ai360-dot"></div>';
      document.getElementById('ai360-msgs').appendChild(typing);

      try {
        const session = JSON.parse(localStorage.getItem('travex_session') || '{}');
        const res = await fetch('/api/ai-chat-aria', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ message: msg, mode: 'seller', userId: session.id || null })
        });
        const data = await res.json();
        typing.remove();
        this.addMsg('bot', data.reply || 'Samahani, jaribu tena.');
      } catch {
        typing.remove();
        this.addMsg('bot', '❌ Tatizo. Jaribu tena.');
      }
      this.loading = false;
      document.getElementById('ai360-send').disabled = false;
    }
  };
})();
