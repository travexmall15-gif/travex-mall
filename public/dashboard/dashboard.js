// ══════════════════════════════════════
// TRAVEX MALL — Shared Dashboard JS
// ══════════════════════════════════════

const SB_URL = 'https://bscecjbgnjitlfmgwcic.supabase.co';
const SB_KEY = 'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos';
const { createClient } = supabase;
const sb = createClient(SB_URL, SB_KEY);

// ── Auth ──────────────────────────────
const Auth = {
  async getSession() {
    const { data: { session } } = await sb.auth.getSession();
    return session;
  },
  async getUser() {
    const { data: { user } } = await sb.auth.getUser();
    return user;
  },
  async signOut() {
    ['travex_plan','travex_shop_name','travex_owner_name',
     'travex_category','travex_region','travex_user_id'].forEach(k => localStorage.removeItem(k));
    await sb.auth.signOut();
    window.location.href = 'login.html';
  },
  async requireAuth() {
    const session = await this.getSession();
    if (!session) { window.location.href = 'login.html'; return null; }
    return session;
  },
};

// ── Shop Profile ──────────────────────
const Shop = {
  async get(email) {
    // Try pending_payments (business market)
    const { data } = await sb
      .from('pending_payments')
      .select('*')
      .eq('auth_email', email)
      .eq('status', 'approved')
      .single();
    return data;
  },
  async getCampus(userId) {
    const { data } = await sb
      .from('campus_stores')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    return data;
  },
};

// ── Database helpers ──────────────────
const DB = {
  products: {
    async getAll(shopId) {
      const { data } = await sb.from('campus_products')
        .select('*').eq('store_id', shopId)
        .order('created_at', { ascending: false });
      return data || [];
    },
    async save(item) {
      if (item.id) {
        const { id, ...rest } = item;
        return sb.from('campus_products').update(rest).eq('id', id);
      }
      return sb.from('campus_products').insert(item);
    },
    async delete(id) {
      return sb.from('campus_products').delete().eq('id', id);
    },
  },
  orders: {
    async getAll(shopId) {
      const { data } = await sb.from('campus_orders')
        .select('*').eq('store_id', shopId)
        .order('created_at', { ascending: false });
      return data || [];
    },
    async updateStatus(id, status) {
      return sb.from('campus_orders').update({ status }).eq('id', id);
    },
    async getToday(shopId) {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await sb.from('campus_orders')
        .select('*').eq('store_id', shopId)
        .gte('created_at', today);
      return data || [];
    },
  },
  sales: {
    async getAll(shopId) {
      const { data } = await sb.from('seller_sales')
        .select('*').eq('store_id', shopId)
        .order('date', { ascending: false });
      return data || [];
    },
    async getByDate(shopId, date) {
      const { data } = await sb.from('seller_sales')
        .select('*').eq('store_id', shopId).eq('date', date);
      return data || [];
    },
    async save(item) {
      if (item.id) {
        const { id, ...rest } = item;
        return sb.from('seller_sales').update(rest).eq('id', id);
      }
      return sb.from('seller_sales').insert(item);
    },
    async delete(id) {
      return sb.from('seller_sales').delete().eq('id', id);
    },
  },
  debts: {
    async getAll(shopId) {
      const { data } = await sb.from('seller_debts')
        .select('*').eq('store_id', shopId)
        .order('created_at', { ascending: false });
      return data || [];
    },
    async save(item) {
      if (item.id) {
        const { id, ...rest } = item;
        return sb.from('seller_debts').update(rest).eq('id', id);
      }
      return sb.from('seller_debts').insert(item);
    },
    async delete(id) {
      return sb.from('seller_debts').delete().eq('id', id);
    },
  },
  vybe: {
    async getPosts(shopId) {
      const { data } = await sb.from('feed_posts')
        .select('*').eq('store_id', shopId)
        .order('created_at', { ascending: false });
      return data || [];
    },
    async post(item) {
      return sb.from('feed_posts').insert(item);
    },
    async delete(id) {
      return sb.from('feed_posts').delete().eq('id', id);
    },
  },
};

// ── Helpers ───────────────────────────
function formatTZS(n) {
  if (!n && n !== 0) return '—';
  return 'TZS ' + Number(n).toLocaleString('en-US');
}
function today() {
  return new Date().toISOString().split('T')[0];
}
function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
function truncate(str, n = 40) {
  if (!str) return '—';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

// ── Toast ─────────────────────────────
function showToast(msg, type = 'default', duration = 3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast show${type !== 'default' ? ' ' + type : ''}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

// ── Modal ─────────────────────────────
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('show');
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('show');
}

// ── Sidebar ───────────────────────────
async function loadSidebar(activePage, shopData) {
  const el = document.getElementById('sidebar');
  if (!el) return;

  const plan = shopData?.plan || localStorage.getItem('travex_plan') || 'basic';
  const shopName = shopData?.shop_name || localStorage.getItem('travex_shop_name') || 'My Shop';
  const ownerName = shopData?.owner_name || localStorage.getItem('travex_owner_name') || '';
  const initials = ownerName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'S';
  const isPremium = plan === 'premium';

  const navItems = [
    { id: 'dashboard', href: 'dashboard.html',   icon: 'ti-home',          label: 'Overview' },
    { id: 'products',  href: 'products.html',     icon: 'ti-package',       label: 'Products' },
    { id: 'orders',    href: 'orders.html',        icon: 'ti-shopping-cart', label: 'Orders' },
    { id: 'accounting',href: 'accounting.html',   icon: 'ti-cash',          label: 'Accounting' },
    { id: 'debts',     href: 'debts.html',         icon: 'ti-credit-card',   label: 'Debts' },
    { id: 'invoice',   href: 'invoice.html',       icon: 'ti-file-invoice',  label: 'Invoice' },
    { id: 'reports',   href: 'reports.html',       icon: 'ti-chart-bar',     label: 'Reports' },
    { id: 'vybe',      href: 'vybe.html',          icon: 'ti-bolt',          label: 'Social Vybe' },
    { id: 'ai-tools',  href: 'ai-tools.html',      icon: 'ti-robot',         label: 'AI Tools', premium: true },
    { id: 'marketing', href: 'marketing.html',     icon: 'ti-speakerphone',  label: 'Marketing', premium: true },
    { id: 'settings',  href: 'settings.html',      icon: 'ti-settings',      label: 'Settings' },
  ];

  el.innerHTML = `
    <div class="sb-brand">
      <div class="sb-logo">T</div>
      <div>
        <div class="sb-brand-text">TRAVEX MALL</div>
        <div class="sb-brand-sub">Seller Dashboard</div>
      </div>
    </div>

    <div class="sb-user">
      <div class="sb-avatar">${initials}</div>
      <div>
        <div class="sb-user-name">${truncate(shopName, 22)}</div>
        <div class="sb-user-plan">${isPremium ? '🥇 Premium' : '🥈 Basic'}</div>
      </div>
    </div>

    <div class="sb-section">
      <div class="sb-section-label">Main</div>
      ${navItems.slice(0, 3).map(i => navLink(i, activePage, isPremium)).join('')}
    </div>

    <div class="sb-section">
      <div class="sb-section-label">Finance</div>
      ${navItems.slice(3, 7).map(i => navLink(i, activePage, isPremium)).join('')}
    </div>

    <div class="sb-section">
      <div class="sb-section-label">Growth</div>
      ${navItems.slice(7, 10).map(i => navLink(i, activePage, isPremium)).join('')}
    </div>

    <div class="sb-section">
      ${navItems.slice(10).map(i => navLink(i, activePage, isPremium)).join('')}
    </div>

    <div class="sb-footer">
      <button class="sb-item" onclick="Auth.signOut()" style="color:rgba(255,100,100,0.7)">
        <i class="ti ti-logout"></i> Sign Out
      </button>
    </div>
  `;
}

function navLink(item, activePage, isPremium) {
  const isActive = item.id === activePage;
  const isLocked = item.premium && !isPremium;
  return `
    <a href="${isLocked ? '#' : item.href}" class="sb-item ${isActive ? 'active' : ''}"
       ${isLocked ? `onclick="showToast('🔒 Upgrade to Premium to unlock this feature','warning');return false"` : ''}>
      <i class="ti ${item.icon}"></i>
      ${item.label}
      ${isLocked ? '<span class="sb-badge" style="background:var(--gold);color:var(--navy)">PRO</span>' : ''}
    </a>`;
}

// ── Mobile menu toggle ─────────────────
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

// ── Loading overlay ────────────────────
function showLoading(show = true) {
  const el = document.getElementById('loadingOverlay');
  if (el) el.style.display = show ? 'flex' : 'none';
}

// ── AI Helper ─────────────────────────
async function askAI(systemPrompt, userMessage) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || 'Sorry, could not get a response.';
}
