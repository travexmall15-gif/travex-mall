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

    { url: `${base}/menu`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/ai`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/orders`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/messages`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/settings/shopping`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/settings/notifications`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/settings/appearance`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/settings/profile`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/settings/security`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/settings/about`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
  ]
}
