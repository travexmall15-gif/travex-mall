import React from 'react'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { ToastProvider } from '@/components/toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Travex Mall — Tanzania\'s Digital Marketplace',
  description: 'Travex Mall — Tanzania\'s premier digital marketplace for campus students and businesses. Shop, sell and grow.',
  keywords: 'Tanzania marketplace, campus market, student shop, Travex Mall, online store Tanzania',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Travex Mall',
  },
  applicationName: 'Travex Mall',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Playfair Display (headings) + Inter (body) — consistent across ALL pages */}
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ToastProvider>{children}</ToastProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .catch(function(e) { console.log('SW error:', e); });
            });
          }
          var _deferredPrompt = null;
          window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            _deferredPrompt = e;
            window.dispatchEvent(new CustomEvent('pwaReady'));
          });
          window.installTravexApp = function() {
            if (_deferredPrompt) {
              _deferredPrompt.prompt();
              _deferredPrompt.userChoice.then(function(r) {
                _deferredPrompt = null;
              });
            } else {
              alert('To install: tap the browser menu (⋮) then "Add to Home Screen"');
            }
          };
        `}} />
      </body>
    </html>
  )
}
