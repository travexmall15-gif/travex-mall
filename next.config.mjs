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
