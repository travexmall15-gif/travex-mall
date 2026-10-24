import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const serviceMock = vi.hoisted(() => ({ create: vi.fn() }))
vi.mock('server-only', () => ({}))
vi.mock('@/lib/security/server-supabase', () => ({ createServiceSupabase: () => serviceMock.create() }))

import { GET } from '../route'

type QueryResult = { data: Array<Record<string, unknown>>; error: null }

class MockQuery implements PromiseLike<QueryResult> {
  constructor(private rows: Array<Record<string, unknown>>) {}
  select(fields?: string) { void fields; return this }
  or(filters: string) { void filters; return this }
  order(field: string, options?: unknown) { void field; void options; return this }
  limit(count: number) { void count; return this }
  ilike(field: string, pattern: string) { void field; void pattern; return this }
  not(field: string, operator: string, value: unknown) { void field; void operator; void value; return this }
  lte(field: string, value: unknown) { void field; void value; return this }
  gte(field: string, value: unknown) { void field; void value; return this }
  eq(field: string, value: unknown) { this.rows = this.rows.filter(row => row[field] === value); return this }
  gt(field: string, value: unknown) { this.rows = this.rows.filter(row => Number(row[field]) > Number(value) || String(row[field]) > String(value)); return this }
  in(field: string, values: unknown[]) { this.rows = this.rows.filter(row => values.includes(row[field])); return this }
  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve({ data: this.rows, error: null }).then(onfulfilled, onrejected)
  }
}

function query(data: unknown) {
  const rows = Array.isArray(data) ? data as Array<Record<string, unknown>> : []
  return new MockQuery(rows)
}

const approved = {
  id: 'store-public', status: 'approved', shop_name: 'Public Living', shop_category: 'Home Living',
  shop_region: 'Dar es Salaam', shop_desc: 'Furniture and home goods', shop_logo_url: null, plan: 'basic', created_at: '2026-01-01',
}
const service = {
  id: 'store-service', status: 'approved', shop_name: 'City Repairs', shop_category: 'Services',
  shop_region: 'Dar es Salaam', shop_desc: 'Chair repairs', shop_logo_url: null, plan: 'basic', created_at: '2026-01-02',
}
const hidden = {
  id: 'store-pending', status: 'pending', shop_name: 'Pending Shop', shop_category: 'Home Living',
  shop_region: 'Dar es Salaam', shop_desc: 'Furniture', shop_logo_url: null, plan: 'basic', created_at: '2026-01-03',
}

beforeEach(() => {
  serviceMock.create.mockReset()
  serviceMock.create.mockReturnValue({
    from: (table: string) => {
      const rows: Record<string, unknown[]> = {
        pending_payments: [approved, service, hidden],
        products: [
          { id: 'product-chair', name: 'Oak chair', price: 240000, category: 'Furniture', image_url: '/chair.jpg', store_id: 'store-public', stock: 3, is_available: true },
          { id: 'product-inactive', name: 'Inactive chair', price: 90000, category: 'Furniture', image_url: null, store_id: 'store-public', stock: 5, is_active: false, is_available: true },
          { id: 'product-hidden', name: 'Hidden chair', price: 90000, category: 'Furniture', image_url: null, store_id: 'store-pending', stock: 5, is_available: true },
        ],
        feed_posts: [{ id: 'post-one', store_id: 'store-public', shop_name: 'Public Living', caption: 'New chairs', post_text: null, media_url: '/post.jpg', category: 'Furniture', tag: null, created_at: '2026-01-04' }],
        flash_deals: [{ id: 'deal-one', store_id: 'store-public', shop_name: 'Public Living', product_name: 'Chair offer', product_image: '/deal.jpg', deal_price: 190000, ends_at: '2099-01-01', status: 'active' }],
        group_orders: [{ id: 'group-one', store_id: 'store-public', shop_name: 'Public Living', product_name: 'Chair group', product_image: '/group.jpg', unit_price: 200000, status: 'open', created_at: '2026-01-05' }],
      }
      return query(rows[table] || [])
    },
  })
})

describe('public marketplace search', () => {
  it('returns only entities tied to approved stores and maps each result to its destination', async () => {
    const request = new NextRequest('https://shopnekt.test/api/public/market?type=search&q=chair&limit=8')
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.results.map((result: { kind: string }) => result.kind)).toEqual([
      'store', 'vybe', 'flash_deal', 'product', 'service', 'group_buy',
    ])
    expect(body.results.find((result: { id: string }) => result.id === 'product-chair').href).toBe('/store/store-public?product=product-chair')
    expect(body.results.find((result: { id: string }) => result.id === 'post-one').href).toBe('/vybe#post-one')
    expect(body.results.find((result: { id: string }) => result.id === 'deal-one').href).toBe('/flash-deals#deal-deal-one')
    expect(body.results.find((result: { id: string }) => result.id === 'group-one').href).toBe('/group-buy/group-one')
    expect(body.results.some((result: { id: string }) => result.id === 'product-hidden')).toBe(false)
    expect(body.results.some((result: { id: string }) => result.id === 'product-inactive')).toBe(false)
    expect(body.results.some((result: { id: string }) => result.id === 'store-pending')).toBe(false)
  })

  it('limits category-only searches to real product records', async () => {
    const request = new NextRequest('https://shopnekt.test/api/public/market?type=search&category=Furniture&limit=8')
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.results.map((result: { kind: string }) => result.kind)).toEqual(['product'])
    expect(body.results[0].category).toBe('Furniture')
  })

  it('rejects unsafe query syntax instead of sending it to the database filter', async () => {
    const request = new NextRequest('https://shopnekt.test/api/public/market?type=search&q=%25%2Cselect')
    const response = await GET(request)

    expect(response.status).toBe(400)
    expect(serviceMock.create).toHaveBeenCalledTimes(1)
  })
})
