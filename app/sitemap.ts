import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://travex-mall.vercel.app'
  const now = new Date()

  return [
    { url: `${base}/`,           lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/home`,       lastModified: now, changeFrequency: 'daily',   priority: 0.95 },
    { url: `${base}/market`,     lastModified: now, changeFrequency: 'daily',   priority: 0.95 },
    { url: `${base}/campus`,     lastModified: now, changeFrequency: 'daily',   priority: 0.90 },
    { url: `${base}/vybe`,       lastModified: now, changeFrequency: 'daily',   priority: 0.85 },
    { url: `${base}/flash-deals`,lastModified: now, changeFrequency: 'hourly',  priority: 0.90 },
    { url: `${base}/group-buy`,  lastModified: now, changeFrequency: 'daily',   priority: 0.80 },
    { url: `${base}/open-store`, lastModified: now, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${base}/join`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.75 },
  ]
}
