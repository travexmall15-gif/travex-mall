import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://shopnekt.vercel.app'
  const now  = new Date()

  return [
    { url: `${base}/`,            lastModified: now, changeFrequency: 'daily',  priority: 1.00 },
    { url: `${base}/home`,        lastModified: now, changeFrequency: 'daily',  priority: 0.95 },
    { url: `${base}/market`,      lastModified: now, changeFrequency: 'daily',  priority: 0.95 },
    { url: `${base}/campus`,      lastModified: now, changeFrequency: 'daily',  priority: 0.90 },
    { url: `${base}/vybe`,        lastModified: now, changeFrequency: 'daily',  priority: 0.85 },
    { url: `${base}/flash-deals`, lastModified: now, changeFrequency: 'hourly', priority: 0.90 },
    { url: `${base}/group-buy`,   lastModified: now, changeFrequency: 'daily',  priority: 0.80 },
    { url: `${base}/open-store`,  lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${base}/join`,        lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${base}/move`,        lastModified: now, changeFrequency: 'weekly', priority: 0.70 },

    { url: `${BASE_URL}/menu`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/ai`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/orders`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/messages`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/settings/shopping`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/settings/notifications`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/settings/appearance`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/settings/profile`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/settings/security`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/settings/about`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
  ]
}
