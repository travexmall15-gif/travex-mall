;(function() {
  const KEY = 'travex_lang'

  function getLang() { return localStorage.getItem(KEY) || 'en' }

  function toggle() {
    const next = getLang() === 'en' ? 'sw' : 'en'
    localStorage.setItem(KEY, next)
    // Fire event so React T components update instantly
    window.dispatchEvent(new CustomEvent('travex-lang-change', { detail: next }))
    // Update all toggle buttons
    document.querySelectorAll('.travex-lang-btn').forEach(btn => {
      btn.innerHTML = next === 'en' ? '&#127481;&#127487; Kiswahili' : '&#127468;&#127463; English'
    })
  }

  window.TravexLang = { get: getLang, toggle }

  // Init button text on load
  document.addEventListener('DOMContentLoaded', function() {
    const lang = getLang()
    document.querySelectorAll('.travex-lang-btn').forEach(btn => {
      btn.innerHTML = lang === 'en' ? '&#127481;&#127487; Kiswahili' : '&#127468;&#127463; English'
    })
  })
})()
