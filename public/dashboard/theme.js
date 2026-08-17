// ShopNekt Theme System - Light/Dark Mode Toggle & Persistence
(function() {
  'use strict';

  // Get saved theme or default to light
  function getSavedTheme() {
    return localStorage.getItem('shopnekt-theme') || 'light';
  }

  // Apply theme to document
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('shopnekt-theme', theme);
  }

  // Initialize theme on page load
  function initTheme() {
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);
  }

  // Toggle theme
  window.toggleTheme = function() {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    
    // Update any theme toggle buttons in the UI
    updateThemeButtons(newTheme);
  };

  // Update theme toggle button icons/text
  function updateThemeButtons(theme) {
    const toggleBtns = document.querySelectorAll('[data-theme-toggle]');
    toggleBtns.forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) {
        if (theme === 'dark') {
          icon.className = icon.className.replace('ti-moon', 'ti-sun');
        } else {
          icon.className = icon.className.replace('ti-sun', 'ti-moon');
        }
      }
    });
  }

  // Set theme explicitly
  window.setTheme = function(theme) {
    if (theme === 'light' || theme === 'dark') {
      applyTheme(theme);
      updateThemeButtons(theme);
    }
  };

  // Get current theme
  window.getCurrentTheme = function() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
})();
