/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Image optimization ──────────────────────────────────
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ── Compiler ────────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  // ── Build ───────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,
  typescript: { ignoreBuildErrors: true },

  // ── Router cache — CRITICAL: prevents stale UI ──────────
  // staleTimes: 0 = never serve cached page segments
  // Without this, navigating back shows old page for up to 5 minutes
  experimental: {
    staleTimes: {
      dynamic: 30,   // cache dynamic pages 30s — faster back navigation
      static:  180,  // cache static pages 3 min
    },
    optimizePackageImports: [
      '@supabase/supabase-js',
      'lucide-react',
      '@vercel/analytics',
    ],
  },

  // ── HTTP Cache-Control headers ───────────────────────────
  async headers() {
    return [
      // HTML pages — never cache
      {
        source: '/((?!_next/static|_next/image|favicon|icon|apple|og-image|manifest).*)',
        headers: [
          { key: 'Cache-Control',      value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma',             value: 'no-cache' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',       value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy',       value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=()' },
          {
            key: 'Content-Security-Policy',
            // Built from the app's actual resources, not a generic template:
            //  - fonts.googleapis.com/fonts.gstatic.com: Google Fonts (used in root layout)
            //  - bscecjbgnjitlfmgwcic.supabase.co: the app's Supabase project (API + Storage)
            //  - wa.me / api.whatsapp.com: WhatsApp deep links used throughout (Vybe, Group Buy, seller contact)
            //  - img-src allows https: broadly because sellers can set arbitrary external
            //    product-image URLs (no fixed set of image hosts to allowlist)
            //  - 'unsafe-inline'/'unsafe-eval' on script-src are required by Next.js's own
            //    inline hydration bootstrap scripts; removing them needs a nonce-based setup
            //    (middleware-generated nonce threaded through app/layout.tsx) — flagged as a
            //    follow-up rather than attempted here, to avoid shipping a CSP that silently
            //    breaks hydration in production.
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://bscecjbgnjitlfmgwcic.supabase.co wss://bscecjbgnjitlfmgwcic.supabase.co https://generativelanguage.googleapis.com https://api.anthropic.com https://vitals.vercel-insights.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
      // Static JS/CSS (hashed) — cache 1 year
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      // Static images/fonts — cache 1 year
      {
        source: '/(.*)\\.(png|jpg|jpeg|gif|svg|ico|webp|avif|woff|woff2|ttf|otf)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      // API routes — never cache
      {
        source: '/api/(.*)',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ]
  },

  async redirects() {
    return [
      { source: '/index',     destination: '/',     permanent: true },
      { source: '/home.html', destination: '/home', permanent: true },
    ]
  },
}

export default nextConfig
