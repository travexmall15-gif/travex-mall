import { MetadataRoute } from 'next'

const BASE = 'https://shopnekt.vercel.app'
const NOW  = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Core ──────────────────────────────────────────────
    { url: BASE,                  lastModified: NOW, changeFrequency: 'daily',  priority: 1.00 },
    { url: `${BASE}/home`,        lastModified: NOW, changeFrequency: 'daily',  priority: 0.95 },

    // ── Marketplaces ──────────────────────────────────────
    { url: `${BASE}/market`,      lastModified: NOW, changeFrequency: 'daily',  priority: 0.95 },
    { url: `${BASE}/vybe`,        lastModified: NOW, changeFrequency: 'daily',  priority: 0.85 },
    { url: `${BASE}/flash-deals`, lastModified: NOW, changeFrequency: 'hourly', priority: 0.90 },
    { url: `${BASE}/group-buy`,   lastModified: NOW, changeFrequency: 'daily',  priority: 0.80 },

    // ── Seller ─────────────────────────────────────────────
    { url: `${BASE}/open-store`,  lastModified: NOW, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/join`,        lastModified: NOW, changeFrequency: 'weekly', priority: 0.80 },
    { url: `${BASE}/subscription`,lastModified: NOW, changeFrequency: 'weekly', priority: 0.70 },

    // ── Features ───────────────────────────────────────────
    { url: `${BASE}/ai`,          lastModified: NOW, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${BASE}/move`,        lastModified: NOW, changeFrequency: 'weekly', priority: 0.70 },
    { url: `${BASE}/menu`,        lastModified: NOW, changeFrequency: 'weekly', priority: 0.60 },

    // ── Auth ──────────────────────────────────────────────
    { url: `${BASE}/auth`,        lastModified: NOW, changeFrequency: 'yearly', priority: 0.50 },

    // ── Legal ─────────────────────────────────────────────
    { url: `${BASE}/privacy`,     lastModified: NOW, changeFrequency: 'monthly',priority: 0.40 },
  ]
}
