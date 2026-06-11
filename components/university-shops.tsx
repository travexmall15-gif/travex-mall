'use client'

import { useMemo, useState } from 'react'
import { Search, Store as StoreIcon } from 'lucide-react'
import { ShopCard } from '@/components/shop-card'
import { shopCategories, type Shop } from '@/lib/data'
import { cn } from '@/lib/utils'

const filters = ['All', ...shopCategories]

export function UniversityShops({ shops }: { shops: Shop[] }) {
  const [active, setActive] = useState('All')
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(6)

  const filtered = useMemo(() => {
    return shops.filter((s) => {
      const matchCat = active === 'All' || s.category === active
      const matchQuery =
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.description.toLowerCase().includes(query.toLowerCase())
      return matchCat && matchQuery
    })
  }, [shops, active, query])

  const shown = filtered.slice(0, visible)

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setVisible(6)
          }}
          placeholder="Search shops..."
          className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm outline-none ring-gold/40 transition focus:ring-2"
        />
      </div>

      {/* Filter tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => {
              setActive(f)
              setVisible(6)
            }}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              active === f
                ? 'bg-navy text-white'
                : 'bg-card text-ink hover:bg-navy/5',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid / empty state */}
      {shown.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy/5">
            <StoreIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-heading text-xl font-bold text-navy">
            No shops found
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try a different category or search term to discover more campus
            shops.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((shop) => (
              <ShopCard key={shop.slug} shop={shop} />
            ))}
          </div>
          {visible < filtered.length && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setVisible((v) => v + 6)}
                className="rounded-xl border border-navy px-8 py-3 font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
