// ShopNekt — PWA Initializer
(function() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js')
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
  window.installTravexApp = function() {
    if (_prompt) {
      _prompt.prompt();
      _prompt.userChoice.then(function() { _prompt = null; });
    } else {
      alert('To install ShopNekt:\n\nAndroid: Tap menu (\u22EE) \u2192 "Add to Home Screen"\niOS Safari: Tap Share (\u25A1\u2191) \u2192 "Add to Home Screen"');
    }
  };
})();
