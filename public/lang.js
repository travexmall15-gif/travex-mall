// ═══════════════════════════════════════════════════════════════
// TRAVEX MALL — Global Language System
// Controls EN ↔ SW across ALL pages via localStorage
// ═══════════════════════════════════════════════════════════════
;(function() {
  const KEY = 'travex_lang'

  const SW = {
    // NAV
    'Home': 'Nyumbani', 'Business': 'Biashara', 'Campus': 'Vyuo',
    'Flash Deals': 'Ofa za Haraka', 'Group Buy': 'Nunua Pamoja',
    'Log In': 'Ingia', 'Sign Up': 'Jiandikishe', 'Open Shop': 'Fungua Duka',
    'Open Your Shop': 'Fungua Duka Lako',
    // MARKET
    'Business Marketplace.': 'Soko la Biashara.',
    'Verified sellers. All categories. Five regions.': 'Wauzaji waliohakikishwa. Aina zote. Mikoa mitano.',
    'Search shops, products, sellers...': 'Tafuta maduka, bidhaa, wauzaji...',
    'Region': 'Mkoa', 'Category': 'Aina',
    'Visit Shop': 'Tembelea Duka', 'Visit Store': 'Tembelea Duka',
    'Basic Plan': 'Mpango wa Msingi', 'Premium Plan': 'Mpango wa Juu',
    'Top Estate': 'Daraja la Juu', '/ month': '/ mwezi',
    'Premium Shops': 'Maduka ya Juu', 'Basic Shops': 'Maduka ya Msingi',
    'Active Sellers': 'Wauzaji Wanaofanya Kazi', 'Total Slots': 'Nafasi Zote',
    'Registration': 'Usajili', 'Regions': 'Mikoa',
    'No shops found': 'Hakuna maduka yaliyopatikana',
    // CAMPUS
    'Campus Marketplace.': 'Soko la Vyuo.',
    'University': 'Chuo Kikuu', 'Browse': 'Vinjari',
    'Student Plan': 'Mpango wa Mwanafunzi', 'slots left': 'nafasi zilizobaki',
    'active shops': 'maduka yanayofanya kazi', 'Full': 'Imejaa',
    // VYBE
    'Live Feed': 'Mpasho wa Moja kwa Moja', 'All Posts': 'Machapisho Yote',
    'Photos': 'Picha', 'Reels': 'Rili', 'Like': 'Penda',
    'No posts yet.': 'Hakuna machapisho bado.',
    // GROUP BUY
    'Buy Together,': 'Nunua Pamoja,', 'Save More.': 'Okoa Zaidi.',
    'Join Group': 'Jiunge na Kikundi', 'Expired': 'Imekwisha',
    'more needed': 'wanaohitajika zaidi', 'Ready!': 'Iko Tayari!',
    'Save': 'Okoa', 'No Active Group Deals': 'Hakuna Ofa za Kikundi',
    'Browse Market': 'Vinjari Soko', 'Loading group deals...': 'Inapakia...',
    // STORE
    'Market': 'Soko', 'Verified': 'Imethibitishwa',
    'Message Seller': 'Wasiliana na Muuzaji', 'products': 'bidhaa',
    'Order': 'Agiza', 'Browse on my own': 'Vinjari Mwenyewe',
    'Chat with Aria': 'Zungumza na Aria', 'Start Chatting': 'Zungumza na Aria',
    'Your Name *': 'Jina Lako *', 'Send Message': 'Tuma Ujumbe',
    'Message Sent!': 'Ujumbe Umetumwa!',
    // HOME
    "Africa's": 'Afrika', 'Intelligent': 'Yenye Akili',
    'Digital Marketplace': 'Soko la Kidijitali',
    'Enter Travex Mall': 'Ingia Travex Mall',
    'Active Shops': 'Maduka Yanayofanya Kazi',
    'Tanzania SMEs': 'Biashara Ndogo Tanzania',
    'Flash Deals': 'Ofa za Haraka',
    'Social Vybe': 'Social Vybe',
    // FOOTER
    'Travex Move': 'Travex Hamisha',
    'Travex Stay': 'Travex Kaa',
    'Travex Digital': 'Travex Digital',
    // COMMON
    'Loading...': 'Inapakia...', 'Search': 'Tafuta',
    'Filter': 'Chuja', 'All': 'Zote',
    'shops found': 'maduka yamepatikana',
    'universities found': 'vyuo vimepatikana',
  }

  function getLang() { return localStorage.getItem(KEY) || 'en' }
  function setLang(l) {
    localStorage.setItem(KEY, l)
    applyLang(l)
    updateBtn(l)
    // Dispatch event so React pages can listen
    window.dispatchEvent(new CustomEvent('travex-lang-change', { detail: l }))
  }

  function applyLang(lang) {
    if (lang !== 'sw') return
    // Translate text nodes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n')
      if (SW[key]) el.textContent = SW[key]
    })
    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder')
      if (SW[key]) el.setAttribute('placeholder', SW[key])
    })
  }

  function updateBtn(lang) {
    document.querySelectorAll('.travex-lang-btn').forEach(btn => {
      btn.textContent = lang === 'en' ? '🇹🇿 Kiswahili' : '🇬🇧 English'
    })
  }

  // Expose globally
  window.TravexLang = {
    get: getLang,
    set: setLang,
    toggle: function() { setLang(getLang() === 'en' ? 'sw' : 'en') },
    sw: SW,
    apply: applyLang,
  }

  // Auto-apply on page load
  document.addEventListener('DOMContentLoaded', function() {
    const lang = getLang()
    if (lang === 'sw') applyLang('sw')
    updateBtn(lang)
  })
})()
