import Link from 'next/link'
import { Star, ShieldCheck, MessageCircle } from 'lucide-react'
import type { Shop } from '@/lib/data'

export function ShopAvatar({
  name,
  color,
  size = 56,
}: {
  name: string
  color: string
  size?: number
}) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl font-heading font-bold text-white"
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        fontSize: size * 0.36,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

export function ShopCard({ shop }: { shop: Shop }) {
  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start gap-3">
        <ShopAvatar name={shop.name} color={shop.logoColor} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-heading text-lg font-bold text-navy">
              {shop.name}
            </h3>
            {shop.verified && (
              <ShieldCheck className="h-4 w-4 shrink-0 text-secondary" />
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-full bg-navy/5 px-2.5 py-0.5 text-xs font-medium text-navy">
              {shop.category}
            </span>
            <span className="flex items-center gap-0.5 text-xs font-medium text-ink">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              {shop.rating}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {shop.description}
      </p>

      <div className="mt-4 flex gap-2">
        <a
          href={`https://wa.me/${shop.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-success px-3 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
        <Link
          href={`/store/${shop.slug}`}
          className="flex flex-1 items-center justify-center rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-secondary"
        >
          Visit Shop
        </Link>
      </div>
    </div>
  )
}
