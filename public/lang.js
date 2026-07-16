;(function() {
  const KEY = 'travex_lang'

  // ── Full EN→SW dictionary ──────────────────────────────────
  const SW = {
    // NAV & BUTTONS
    'Home': 'Nyumbani',
    'Business': 'Biashara',
    'Campus': 'Vyuo',
    'Social Vybe': 'Social Vybe',
    'Flash Deals': 'Ofa za Haraka',
    'Group Buy': 'Nunua Pamoja',
    'Move': 'Hamisha',
    'Log In': 'Ingia',
    'Sign Up': 'Jiandikishe',
    'Open Shop': 'Fungua Duka',
    'Open Your Shop': 'Fungua Duka Lako',
    'Enter Travex Mall': 'Ingia Travex Mall',
    // MARKET
    'Business Marketplace.': 'Soko la Biashara.',
    'Region': 'Mkoa',
    'Category': 'Aina',
    'Visit Shop': 'Tembelea Duka',
    'Basic Plan': 'Mpango wa Msingi',
    'Premium Plan': 'Mpango wa Juu',
    'Top Estate': 'Daraja la Juu',
    '/ month': '/ mwezi',
    'Premium Shops': 'Maduka ya Juu',
    'Basic Shops': 'Maduka ya Msingi',
    'Active Sellers': 'Wauzaji Wanaofanya Kazi',
    'Total Slots': 'Nafasi Zote',
    'Registration': 'Usajili',
    'Regions': 'Mikoa',
    'No shops found': 'Hakuna maduka yaliyopatikana',
    'Try different filters or search term': 'Jaribu vichujio tofauti',
    'shops found': 'maduka yamepatikana',
    'shop found': 'duka limepatikana',
    // CAMPUS
    'Campus Marketplace.': 'Soko la Vyuo.',
    'University': 'Chuo Kikuu',
    'Browse': 'Vinjari',
    'Student Plan': 'Mpango wa Mwanafunzi',
    'Full': 'Imejaa',
    'universities found': 'vyuo vimepatikana',
    'university found': 'chuo kimepatikana',
    // VYBE
    'Live Feed': 'Mpasho wa Moja kwa Moja',
    'All Posts': 'Machapisho Yote',
    'Photos': 'Picha',
    'Reels': 'Rili',
    'Like': 'Penda',
    'No posts yet.': 'Hakuna machapisho bado.',
    'Loading posts...': 'Inapakia machapisho...',
    // GROUP BUY
    'Buy Together,': 'Nunua Pamoja,',
    'Save More.': 'Okoa Zaidi.',
    'Join Group': 'Jiunge na Kikundi',
    'Expired': 'Imekwisha',
    'more needed': 'wanaohitajika zaidi',
    'Ready!': 'Iko Tayari!',
    'No Active Group Deals': 'Hakuna Ofa za Kikundi',
    'Browse Market': 'Vinjari Soko',
    'Loading group deals...': 'Inapakia...',
    'groups found': 'vikundi vimepatikana',
    'group found': 'kikundi kimepatikana',
    // STORE
    'Market': 'Soko',
    'Verified': 'Imethibitishwa',
    'Message Seller': 'Wasiliana na Muuzaji',
    'Order': 'Agiza',
    'Browse on my own': 'Vinjari Mwenyewe',
    'Chat with Aria': 'Zungumza na Aria',
    'Send Message': 'Tuma Ujumbe',
    'Message Sent!': 'Ujumbe Umetumwa!',
    'Setting Up Shop': 'Inaandaa Duka',
    'No products found': 'Hakuna bidhaa zilizopatikana',
    // HOME
    "Africa's": 'Afrika',
    'Digital Marketplace': 'Soko la Kidijitali',
    'Active Shops': 'Maduka Yanayofanya Kazi',
    'Tanzania SMEs': 'Biashara Ndogo Tanzania',
    // FOOTER
    'Travex Move': 'Travex Hamisha',
    'Travex Stay': 'Travex Kaa',
    // COMMON
    'Loading...': 'Inapakia...',
    'Retry': 'Jaribu Tena',
    'Try Again': 'Jaribu Tena',
    'Search': 'Tafuta',
    'All': 'Zote',
    'Close': 'Funga',
    'Cancel': 'Acha',
    'Save': 'Okoa',
    'PREMIUM': 'PREMIUM',
    'BASIC': 'MSINGI',
    'products': 'bidhaa',
    'left': 'zilizobaki',
    'active shops': 'maduka yanayofanya kazi',
  }

  // EN is just the reverse of SW
  const EN = Object.fromEntries(Object.entries(SW).map(([k,v]) => [v,k]))

  function getLang() { return localStorage.getItem(KEY) || 'en' }

  // ── DOM Text Walker ────────────────────────────────────────
  function translateDOM(dict) {
    const skip = new Set(['SCRIPT','STYLE','TEXTAREA','INPUT','CODE','PRE'])

    // Walk text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    )

    const nodes = []
    let n
    while ((n = walker.nextNode())) nodes.push(n)

    nodes.forEach(node => {
      const el = node.parentElement
      if (!el || skip.has(el.tagName)) return
      // Exact match on trimmed text
      const trimmed = node.textContent.trim()
      if (trimmed && dict[trimmed]) {
        node.textContent = node.textContent.replace(trimmed, dict[trimmed])
      }
    })

    // Translate placeholders
    document.querySelectorAll('[placeholder]').forEach(el => {
      const ph = el.getAttribute('placeholder')
      if (ph && dict[ph]) el.setAttribute('placeholder', dict[ph])
      // Store original for toggle back
      if (!el.dataset.origPlaceholder) el.dataset.origPlaceholder = ph
    })

    // Translate title attributes (tooltips)
    document.querySelectorAll('[title]').forEach(el => {
      const ti = el.getAttribute('title')
      if (ti && dict[ti]) el.setAttribute('title', dict[ti])
    })
  }

  // ── Apply language ────────────────────────────────────────
  function apply(lang) {
    if (lang === 'sw') {
      translateDOM(SW)
    } else {
      // Reload page to restore English (simplest reliable approach)
      window.location.reload()
    }

    // Update all toggle buttons
    document.querySelectorAll('.travex-lang-btn').forEach(btn => {
      btn.innerHTML = lang === 'en' ? '🇹🇿 Kiswahili' : '🇬🇧 English'
    })
  }

  function toggle() {
    const current = getLang()
    const next = current === 'en' ? 'sw' : 'en'
    localStorage.setItem(KEY, next)
    apply(next)
  }

  // ── Public API ────────────────────────────────────────────
  window.TravexLang = { get: getLang, toggle, apply, SW, EN }

  // ── Auto-apply on every page load ────────────────────────
  function init() {
    const lang = getLang()

    // Update button text
    document.querySelectorAll('.travex-lang-btn').forEach(btn => {
      btn.innerHTML = lang === 'en' ? '🇹🇿 Kiswahili' : '🇬🇧 English'
    })

    // Apply SW if set
    if (lang === 'sw') {
      // Wait for React/DOM to finish rendering
      setTimeout(() => translateDOM(SW), 800)
      // Also try again after more time for dynamic content
      setTimeout(() => translateDOM(SW), 2000)
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

})()
