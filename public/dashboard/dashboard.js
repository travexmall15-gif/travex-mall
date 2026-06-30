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
  // No Supabase Auth used — pure phone+password against pending_payments/campus_stores.
  // Session stored in localStorage as {id, market}.
  async getSession() {
    const raw = localStorage.getItem('travex_session');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
  async requireAuth() {
    const raw = localStorage.getItem('travex_session');
    if (!raw) { window.location.href = 'login.html'; return null; }
    let session;
    try { session = JSON.parse(raw); } catch { window.location.href = 'login.html'; return null; }

    // Re-validate against DB so suspended/deleted sellers are kicked out immediately
    const table  = session.market === 'campus' ? 'campus_stores' : 'pending_payments';
    const { data } = await sb.from(table).select('id,status,is_active').eq('id', session.id).maybeSingle();
    const stillValid = data && (session.market === 'campus' ? data.is_active === true : data.status === 'approved');
    if (!stillValid) {
      localStorage.removeItem('travex_session');
      window.location.href = 'login.html';
      return null;
    }
    // Fake session.user shape so existing dashboard pages calling session.user.email keep working
    return { user: { id: session.id, email: session.id } };
  },
  async signOut() {
    ['travex_session','travex_plan','travex_shop_name','travex_owner_name',
     'travex_category','travex_region','travex_user_id'].forEach(k => localStorage.removeItem(k));
    window.location.href = 'login.html';
  },
};

// ── SHOP ─────────────────────────────
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
  const isCampus  = plan === 'campus';
  const planLabel = plan === 'premium' ? '🥇 Premium' : plan === 'campus' ? '🎓 Campus' : '🥈 Basic';

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
      ${navItem('vybe',       'vybe.html',       'ti-bolt',          'Social Vybe')}
      ${navItem('flash-deals','flash-deals.html','ti-flame',         '⚡ Flash Deals')}
      ${navItem('group-buy',  'group-buy.html',  'ti-users-group',   '👥 Group Buying')}
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

// ═══════════════════════════════════════════════
// FLASH DEALS — Seller can create/manage
// ═══════════════════════════════════════════════
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

// ═══════════════════════════════════════════════
// GROUP BUYING — Seller can create groups
// ═══════════════════════════════════════════════
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

// ═══════════════════════════════════════════════
// ANALYTICS — Track views
// ═══════════════════════════════════════════════
async function trackEvent(storeId, event, productId, source) {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_id: storeId, event, product_id: productId, source })
    });
  } catch(e) { /* silent */ }
}
