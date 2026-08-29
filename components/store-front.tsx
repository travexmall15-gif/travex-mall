'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  ShoppingCart,
  Plus,
  Minus,
  Star,
  X,
  Search,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react'
import type { Shop, Product } from '@/lib/data'
import { productsByShop, formatTZS, ShopAvatar } from '@/lib/data'
import { useToast } from '@/components/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type CartItem = Product & { qty: number }

const productImages: Record<string, string> = {
  p1: '/social-vybe-ankara-fashion-flatlay.png',
  p2: '/clean-white-sneakers-product-shot.png',
  p3: '/clean-white-sneakers-product-shot.png',
  p4: '/social-vybe-ankara-fashion-flatlay.png',
  d1: '/wireless-earbuds-product-photo.png',
  d2: '/skincare-cosmetics-flatlay-beauty.png',
  d3: '/smoothie-bowl-healthy-breakfast.png',
}

function imgFor(p: Product) {
  return productImages[p.id] || '/store-banner-fashion.png'
}

export function StoreFront({ shop }: { shop: Shop }) {
  const { toast } = useToast()
  const allProducts = productsByShop[shop.slug] || productsByShop.default
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [query, setQuery] = useState('')

  const products = allProducts.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  )

  function addToCart(p: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id)
      if (existing) {
        return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
      }
      return [...prev, { ...p, qty: 1 }]
    })
    toast(`${p.name} added to cart`, 'success')
  }

  function changeQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    )
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Banner */}
      <div className="relative h-48 w-full overflow-hidden md:h-64">
        <Image
          src="/store-banner-fashion.png"
          alt={`${shop.name} banner`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 to-navy/30" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* Shop header */}
        <div className="-mt-16 flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-lg md:flex-row md:items-center">
          <ShopAvatar name={shop.name} color={shop.logoColor} size={96} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-bold text-navy">
                {shop.name}
              </h1>
              {shop.verified && (
                <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
            </div>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              {shop.description}
            </p>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-ink">
                <Star className="h-4 w-4 fill-gold text-gold" />
                {shop.rating}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {shop.category}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={`https://wa.me/${shop.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-success px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" />
              Chat
            </a>
            <Button
              onClick={() => setCartOpen(true)}
              className="relative bg-navy text-white hover:bg-secondary"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Products */}
        <div className="mb-16 mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="group overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-lg"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={imgFor(p) || '/placeholder.svg'}
                  alt={p.name}
                  fill
                  className="object-cover transition group-hover:scale-105"
                />
                {p.stock < 10 && (
                  <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-navy">
                    Only {p.stock} left
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-1 font-medium text-ink">{p.name}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {p.description}
                </p>
                <p className="mt-1 font-heading text-lg font-bold text-navy">
                  {formatTZS(p.price)}
                </p>
                <Button
                  size="sm"
                  onClick={() => addToCart(p)}
                  className="mt-2 w-full bg-gold text-navy hover:bg-gold-light"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <p className="col-span-full py-12 text-center text-muted-foreground">
              No products found.
            </p>
          )}
        </div>
      </div>

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            aria-label="Close cart"
            className="absolute inset-0 bg-navy/50"
            onClick={() => setCartOpen(false)}
          />
          <div className="animate-slide-in relative flex h-full w-full max-w-md flex-col bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="font-heading text-lg font-bold text-navy">
                Your Cart
              </h2>
              <button onClick={() => setCartOpen(false)} aria-label="Close">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">
                  Your cart is empty.
                </p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {cart.map((i) => (
                    <li key={i.id} className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={imgFor(i) || '/placeholder.svg'}
                          alt={i.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-ink">
                          {i.name}
                        </p>
                        <p className="text-sm font-bold text-navy">
                          {formatTZS(i.price)}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <button
                            onClick={() => changeQty(i.id, -1)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-border"
                            aria-label="Decrease"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm">
                            {i.qty}
                          </span>
                          <button
                            onClick={() => changeQty(i.id, 1)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-border"
                            aria-label="Increase"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-heading text-xl font-bold text-navy">
                  {formatTZS(cartTotal)}
                </span>
              </div>
              <Button
                disabled={cart.length === 0}
                onClick={() => {
                  toast('Order placed! The seller will contact you.', 'success')
                  setCart([])
                  setCartOpen(false)
                }}
                className="w-full bg-navy text-white hover:bg-secondary"
              >
                Checkout via WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
