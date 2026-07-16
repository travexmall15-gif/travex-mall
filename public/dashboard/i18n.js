// ═══════════════════════════════════════════════════════════════
// DASHBOARD BILINGUAL SYSTEM — EN + SW
// ═══════════════════════════════════════════════════════════════
const DASHBOARD_I18N = {
  // NAV
  'Overview':        { sw: 'Muhtasari' },
  'Products':        { sw: 'Bidhaa' },
  'Orders':          { sw: 'Maagizo' },
  'Accounting':      { sw: 'Uhasibu' },
  'Debts':           { sw: 'Madeni' },
  'Invoice':         { sw: 'Ankara' },
  'Reports':         { sw: 'Ripoti' },
  'Social Vybe':     { sw: 'Social Vybe' },
  'Flash Deals':     { sw: 'Ofa za Haraka' },
  'Group Buying':    { sw: 'Nunua Pamoja' },
  'AI Tools':        { sw: 'Zana za AI' },
  'AI Marketing':    { sw: 'Masoko ya AI' },
  'AI Finance':      { sw: 'Fedha ya AI' },
  'Marketing':       { sw: 'Masoko' },
  'Settings':        { sw: 'Mipangilio' },
  'Subscription':    { sw: 'Usajili' },
  'Sign Out':        { sw: 'Toka' },
  // DASHBOARD MAIN
  'Here\'s how your business is doing today': { sw: 'Hapa jinsi biashara yako inavyofanya leo' },
  'Revenue Today':   { sw: 'Mapato ya Leo' },
  'Profit Today':    { sw: 'Faida ya Leo' },
  'Orders Today':    { sw: 'Maagizo ya Leo' },
  'Products Listed': { sw: 'Bidhaa Zilizoorodheshwa' },
  'Recent Orders':   { sw: 'Maagizo ya Hivi Karibuni' },
  'Latest customer orders today': { sw: 'Maagizo ya hivi karibuni ya wateja leo' },
  'View All':        { sw: 'Ona Yote' },
  'Quick Actions':   { sw: 'Vitendo vya Haraka' },
  'Add Product':     { sw: 'Ongeza Bidhaa' },
  'New Invoice':     { sw: 'Ankara Mpya' },
  'Record Sale':     { sw: 'Rekodi Mauzo' },
  'Post to Vybe':    { sw: 'Chapisha Vybe' },
  'Stock Alerts':    { sw: 'Tahadhari za Hisa' },
  'Current Plan':    { sw: 'Mpango wa Sasa' },
  // PRODUCTS
  'Add New Product': { sw: 'Ongeza Bidhaa Mpya' },
  'Product Name':    { sw: 'Jina la Bidhaa' },
  'Price':           { sw: 'Bei' },
  'Stock':           { sw: 'Hisa' },
  'Category':        { sw: 'Aina' },
  'Description':     { sw: 'Maelezo' },
  'Save Product':    { sw: 'Hifadhi Bidhaa' },
  // ORDERS
  'All Orders':      { sw: 'Maagizo Yote' },
  'Pending':         { sw: 'Inangoja' },
  'Confirmed':       { sw: 'Imethibitishwa' },
  'Delivered':       { sw: 'Imetolewa' },
  'Customer':        { sw: 'Mteja' },
  'Phone':           { sw: 'Simu' },
  'Amount':          { sw: 'Kiasi' },
  'Status':          { sw: 'Hali' },
  'Date':            { sw: 'Tarehe' },
  // ACCOUNTING
  'Record Transaction': { sw: 'Rekodi Muamala' },
  'Income':          { sw: 'Mapato' },
  'Expense':         { sw: 'Gharama' },
  'Total Revenue':   { sw: 'Jumla ya Mapato' },
  'Total Expenses':  { sw: 'Jumla ya Gharama' },
  'Net Profit':      { sw: 'Faida Halisi' },
  // COMMON
  'Save':            { sw: 'Hifadhi' },
  'Cancel':          { sw: 'Acha' },
  'Delete':          { sw: 'Futa' },
  'Edit':            { sw: 'Hariri' },
  'Close':           { sw: 'Funga' },
  'Loading...':      { sw: 'Inapakia...' },
  'Search':          { sw: 'Tafuta' },
  'Filter':          { sw: 'Chuja' },
  'Submit':          { sw: 'Wasilisha' },
  'Confirm':         { sw: 'Thibitisha' },
}

// ── Language engine ──────────────────────────────────────────
const LANG = {
  current: localStorage.getItem('travex_lang') || 'en',

  get: function(key) {
    if (this.current === 'sw' && DASHBOARD_I18N[key]) {
      return DASHBOARD_I18N[key].sw || key
    }
    return key
  },

  set: function(lang) {
    this.current = lang
    localStorage.setItem('travex_lang', lang)
    this.apply()
  },

  toggle: function() {
    this.set(this.current === 'en' ? 'sw' : 'en')
  },

  // Auto-translate all [data-i18n] elements
  apply: function() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n')
      el.textContent = this.get(key)
    })
    // Update toggle button
    const btn = document.getElementById('langToggleBtn')
    if (btn) {
      btn.innerHTML = this.current === 'en'
        ? '<span>🇹🇿</span> SW'
        : '<span>🇬🇧</span> EN'
      btn.title = this.current === 'en' ? 'Switch to Kiswahili' : 'Switch to English'
    }
  },

  init: function() {
    this.apply()
    // Auto-translate nav items in sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
      const text = el.textContent?.trim()
      if (text && DASHBOARD_I18N[text]) {
        el.setAttribute('data-i18n-nav', text)
      }
    })
  }
}

// Inject language toggle into header
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const headerRight = document.querySelector('.header-right')
    if (headerRight && !document.getElementById('langToggleBtn')) {
      const btn = document.createElement('button')
      btn.id = 'langToggleBtn'
      btn.onclick = () => LANG.toggle()
      btn.style.cssText = `
        display:inline-flex;align-items:center;gap:5px;
        background:rgba(13,27,62,0.08);border:1px solid rgba(13,27,62,0.15);
        border-radius:999px;padding:5px 12px;font-size:11px;font-weight:700;
        cursor:pointer;color:var(--navy);font-family:inherit;transition:all 0.2s;
        letter-spacing:0.04em;
      `
      btn.innerHTML = LANG.current === 'en' ? '<span>🇹🇿</span> SW' : '<span>🇬🇧</span> EN'
      btn.title = 'Switch Language / Badilisha Lugha'
      headerRight.prepend(btn)
    }
    LANG.init()
  }, 500)
})

window.LANG = LANG
