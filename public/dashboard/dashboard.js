// ══════════════════════════════════════
// TRAVEX MALL — Shared Dashboard JS
// Modelled after Travex Finance pattern
// ══════════════════════════════════════

const SB_URL = 'https://bscecjbgnjitlfmgwcic.supabase.co';
const SB_KEY = 'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos';
const { createClient } = supabase;
const sb = createClient(SB_URL, SB_KEY);

// ── AUTH ──────────────────────────────
const Auth = {
  async getSession() {
    const { data: { session } } = await sb.auth.getSession();
    return session;
  },
  async requireAuth() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { window.location.href = 'login.html'; return null; }
    return session;
  },
  async signOut() {
    ['travex_plan','travex_shop_name','travex_owner_name',
     'travex_category','travex_region','travex_user_id'].forEach(k => localStorage.removeItem(k));
    await sb.auth.signOut();
    window.location.href = 'login.html';
  },
};

// ── SHOP ─────────────────────────────
const Shop = {
  _cache: null,
  async get(email) {
    if (this._cache) return this._cache;
    const { data } = await sb.from('pending_payments')
      .select('*').eq('auth_email', email).eq('status','approved').single();
    this._cache = data;
    return data;
  },
};

// ── DATABASE ─────────────────────────
const DB = {
  products: {
    async getAll(shopId) {
      const { data } = await sb.from('campus_products')
        .select('*').eq('store_id', shopId).order('created_at',{ascending:false});
      return data || [];
    },
    async save(item) {
      if (item.id) {
        const {id,...rest}=item;
        return sb.from('campus_products').update(rest).eq('id',id);
      }
      return sb.from('campus_products').insert(item);
    },
    async delete(id) {
      return sb.from('campus_products').delete().eq('id',id);
    },
  },
  orders: {
    async getAll(shopId) {
      const { data } = await sb.from('campus_orders')
        .select('*').eq('store_id',shopId).order('created_at',{ascending:false});
      return data || [];
    },
    async updateStatus(id, status) {
      return sb.from('campus_orders').update({status}).eq('id',id);
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

// ── HELPERS ───────────────────────────
function formatTZS(n) {
  if (!n && n !== 0) return '—';
  return 'TZS ' + Number(n).toLocaleString('en-US');
}
function today() { return new Date().toISOString().split('T')[0]; }
function timeAgo(d) {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff/60000);
  if (m < 1)  return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m/60);
  if (h < 24) return h + 'h ago';
  return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short'});
}
function truncate(s, n=40) {
  if (!s) return '—';
  return s.length > n ? s.slice(0,n) + '…' : s;
}

// ── TOAST ─────────────────────────────
function showToast(msg, type='default') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast' + (type !== 'default' ? ' ' + type : '');
  t.style.display = 'flex';
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.style.display = 'none'; }, 3200);
}

// ── MODAL ─────────────────────────────
function openModal(id)  { const m=document.getElementById(id); if(m) m.classList.add('show'); }
function closeModal(id) { const m=document.getElementById(id); if(m) m.classList.remove('show'); }

// ── SIDEBAR ───────────────────────────
async function loadSidebar(activePage, shopData) {
  const el = document.getElementById('sidebar');
  if (!el) return;

  const plan = shopData?.plan || localStorage.getItem('travex_plan') || 'basic';
  const shopName = shopData?.shop_name || localStorage.getItem('travex_shop_name') || 'My Shop';
  const ownerName = shopData?.owner_name || localStorage.getItem('travex_owner_name') || '';
  const initials = ownerName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || 'TX';
  const isPremium = plan === 'premium';
  const planLabel = plan === 'premium' ? '🥇 Premium' : '🥈 Basic';

  const navItem = (id, href, icon, label, isPro=false) => {
    const locked = isPro && !isPremium;
    return `<a href="${locked?'#':href}" class="nav-item ${activePage===id?'active':''}"
      ${locked?`onclick="showToast('🔒 Premium Only — Upgrade to access','warning');return false"`:''}>
      <i class="ti ${icon}"></i> ${label}
      ${locked ? '<span style="margin-left:auto;background:rgba(255,215,0,0.2);color:var(--gold);font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px">PRO</span>' : ''}
    </a>`;
  };

  el.innerHTML = `
    <div class="sidebar-logo">
      <div class="sidebar-logo-brand">TRAVEX MALL</div>
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
      ${navItem('vybe',      'vybe.html',      'ti-bolt',          'Social Vybe')}
      ${navItem('ai-tools',  'ai-tools.html',  'ti-robot',         'AI Tools',      true)}
      ${navItem('marketing', 'marketing.html', 'ti-speakerphone',  'Marketing',     true)}

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
}

// ── MOBILE MENU ───────────────────────
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

// ── LOADING ───────────────────────────
function showLoading(show=true) {
  const el = document.getElementById('loadingOverlay');
  if (el) el.style.display = show ? 'flex' : 'none';
}

// ── AI CALL ───────────────────────────
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
