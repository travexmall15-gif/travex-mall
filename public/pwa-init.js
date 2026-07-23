// ShopNekt — PWA Initializer
(function() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => reg.update())
        .catch(function(e) { /* silently fail */ });
    });
  }

  // Capture install prompt
  var _prompt = null;
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    _prompt = e;
    window.dispatchEvent(new CustomEvent('pwaReady'));
  });

  // Global install function
  window.installShopNektApp = function() {
    if (_prompt) {
      _prompt.prompt();
      _prompt.userChoice.then(function() { _prompt = null; });
    } else {
      alert('To install ShopNekt:\n\nAndroid: Tap menu (\u22EE) \u2192 "Add to Home Screen"\niOS Safari: Tap Share (\u25A1\u2191) \u2192 "Add to Home Screen"');
    }
  };
})();

  // Force SW update on every page load — prevents stale cached pages
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => {
      reg.update() // Check for new SW version
    })
    // When new SW activates, reload to get fresh content
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
  }
