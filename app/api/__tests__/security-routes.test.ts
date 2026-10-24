import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
vi.mock('server-only', () => ({}))
import { setSellerSession, setAdminSession, setWebstoreOwnerSession } from '@/lib/security/signed-session'

const serviceMock = vi.hoisted(() => ({ create: vi.fn(), rpc: vi.fn(), lockedUntil: null as string | null }))
vi.mock('@/lib/security/server-supabase', () => ({
  createServiceSupabase: () => serviceMock.create(),
  isActiveSeller: async () => true,
}))

import { POST as dashboardStats } from '../dashboard-stats/route'
import { GET as analyticsGet } from '../analytics/route'
import { POST as notifyPost, PUT as notifyPut } from '../notify/route'
import { PATCH as adminWebstorePatch } from '../admin/webstores/route'
import { POST as sellerLogin } from '../seller/auth/login/route'
import { GET as sellerDataGet, POST as sellerDataPost } from '../seller/data/route'
import { POST as ariaChatPost } from '../ai-chat-aria/route'
import { GET as webstoreStatusGet, PATCH as webstoreStatusPatch, POST as webstoreApplicationPost } from '../webstore/application/route'
import { GET as adminOperationsGet, POST as adminOperationsPost } from '../admin/operations/route'
import { PATCH as sellerSettingsPatch } from '../seller/settings/route'
import { GET as sellerProfileGet } from '../seller/profile/route'
import { POST as shopLikePost } from '../shop-likes/route'
import { POST as vybeLikePost } from '../vybe/like/route'
import { GET as customerOrdersGet } from '../customer/orders/route'
import { GET as customerOrderGet } from '../customer/orders/[id]/route'
import { POST as customerPaymentPost } from '../customer/orders/[id]/payment/route'
import { POST as confirmDeliveryPost } from '../customer/orders/[id]/confirm-delivery/route'
import { POST as storeMessagePost } from '../store-messages/route'

const originalSellerSecret = process.env.SELLER_SESSION_SECRET
const originalAdminSecret = process.env.SHOPNEKT_SESSION_SECRET
const sellerA = '11111111-1111-4111-8111-111111111111'
const sellerB = '22222222-2222-4222-8222-222222222222'
const applicationId = '33333333-3333-4333-8333-333333333333'

function sellerCookie(id: string) {
  const response = NextResponse.json({})
  setSellerSession(response, id, 'business')
  return response.cookies.get('sn_seller_session')!.value
}

function adminCookie() {
  const response = NextResponse.json({})
  setAdminSession(response)
  return response.cookies.get('sn_admin_session')!.value
}

function webstoreOwnerCookie(id: string) {
  const response = NextResponse.json({})
  setWebstoreOwnerSession(response, id)
  return response.cookies.get('sn_webstore_owner_session')!.value
}

function mockQuery(result: unknown) {
  const builder: any = {}
  for (const method of ['select', 'eq', 'order', 'limit', 'update', 'in', 'is']) {builder[method] = vi.fn(() => builder)}
  builder.maybeSingle = vi.fn(async () => result)
  builder.then = (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) => Promise.resolve(result).then(resolve, reject)
  return builder
}

beforeEach(() => {
  process.env.SELLER_SESSION_SECRET = 'seller-session-secret-with-at-least-32-bytes'
  process.env.SHOPNEKT_SESSION_SECRET = 'admin-session-secret-with-at-least-32-bytes'
  serviceMock.create.mockReset()
  serviceMock.rpc.mockReset()
  serviceMock.lockedUntil = null
  serviceMock.create.mockReturnValue({
    from: (table: string) => table === 'pending_payments'
      ? mockQuery({ data: [{ id: sellerA, shop_name: 'Shop A', status: 'approved' }], error: null })
      : mockQuery({ data: serviceMock.lockedUntil ? { locked_until: serviceMock.lockedUntil } : null, error: null }),
    rpc: serviceMock.rpc,
  })
})

afterEach(() => {
  if (originalSellerSecret === undefined) {delete process.env.SELLER_SESSION_SECRET}
  else {process.env.SELLER_SESSION_SECRET = originalSellerSecret}
  if (originalAdminSecret === undefined) {delete process.env.SHOPNEKT_SESSION_SECRET}
  else {process.env.SHOPNEKT_SESSION_SECRET = originalAdminSecret}
})

describe('protected API boundaries', () => {
  it('requires a server-issued seller session for seller AI mode', async () => {
    const request = new NextRequest('https://shopnekt.test/api/ai-chat-aria', {
      method: 'POST', headers: { origin: 'https://shopnekt.test' },
      body: JSON.stringify({ mode: 'seller', userId: sellerA, message: 'show revenue' }),
    })
    expect((await ariaChatPost(request)).status).toBe(401)
    expect(serviceMock.create).not.toHaveBeenCalled()
  })

  it('does not let a client supplied user id expose another customer order history through AI', async () => {
    const query = mockQuery({ data: [], error: null })
    const from = vi.fn((_table: string) => query)
    serviceMock.create.mockReturnValue({ from, rpc: serviceMock.rpc })
    const request = new NextRequest('https://shopnekt.test/api/ai-chat-aria', {
      method: 'POST', headers: { origin: 'https://shopnekt.test' },
      body: JSON.stringify({ mode: 'buyer', userId: sellerB, message: 'tracking my order history' }),
    })
    const response = await ariaChatPost(request)
    expect(response.status).toBe(200)
    expect(from.mock.calls.map(([table]) => table)).not.toContain('orders')
  })

  it('rejects seller data requests without a seller session', async () => {
    const request = new NextRequest('https://shopnekt.test/api/seller/data?resource=orders')
    expect((await sellerDataGet(request)).status).toBe(401)
    expect(serviceMock.create).not.toHaveBeenCalled()
  })

  it('does not treat a normal customer cookie as seller authentication for seller data', async () => {
    const request = new NextRequest('https://shopnekt.test/api/seller/data?resource=orders', {
      headers: { cookie: 'sn_customer_session=%7B%22id%22%3A%22customer-1%22%7D' },
    })
    expect((await sellerDataGet(request)).status).toBe(401)
    expect(serviceMock.create).not.toHaveBeenCalled()
  })

  it('binds seller data reads to the signed seller even if another store id is requested', async () => {
    const query = mockQuery({ data: [{ id: applicationId }], error: null })
    const from = vi.fn().mockReturnValue(query)
    serviceMock.create.mockReturnValue({ from, rpc: serviceMock.rpc })
    const request = new NextRequest(`https://shopnekt.test/api/seller/data?resource=orders&store_id=${sellerB}`, {
      headers: { cookie: `sn_seller_session=${sellerCookie(sellerA)}` },
    })
    const response = await sellerDataGet(request)
    expect(response.status).toBe(200)
    expect(query.eq).toHaveBeenCalledWith('store_id', sellerA)
    expect(query.eq).not.toHaveBeenCalledWith('store_id', sellerB)
  })

  it('overwrites a forged store id with the signed seller id when creating products', async () => {
    let inserted: Record<string, unknown> | undefined
    const query = mockQuery({ data: { id: applicationId }, error: null }) as any
    query.insert = vi.fn((values: Record<string, unknown>) => { inserted = values; return query })
    query.single = vi.fn(async () => ({ data: { id: applicationId }, error: null }))
    const from = vi.fn().mockReturnValue(query)
    serviceMock.create.mockReturnValue({ from, rpc: serviceMock.rpc })
    const request = new NextRequest('https://shopnekt.test/api/seller/data', {
      method: 'POST', headers: { cookie: `sn_seller_session=${sellerCookie(sellerA)}`, origin: 'https://shopnekt.test' },
      body: JSON.stringify({ resource: 'products', action: 'create', item: { store_id: sellerB, name: 'Secure product', price: 1200 } }),
    })
    expect((await sellerDataPost(request)).status).toBe(201)
    expect(inserted?.store_id).toBe(sellerA)
  })

  it('updates only submitted product fields and scopes the update to the signed seller', async () => {
    const query = mockQuery({ data: { id: applicationId }, error: null }) as any
    let updated: Record<string, unknown> | undefined
    query.update = vi.fn((values: Record<string, unknown>) => { updated = values; return query })
    serviceMock.create.mockReturnValue({ from: vi.fn(() => query), rpc: serviceMock.rpc })
    const request = new NextRequest('https://shopnekt.test/api/seller/data', {
      method: 'POST', headers: { cookie: `sn_seller_session=${sellerCookie(sellerA)}`, origin: 'https://shopnekt.test' },
      body: JSON.stringify({ resource: 'products', action: 'update', id: applicationId, item: { name: 'Updated name' } }),
    })

    expect((await sellerDataPost(request)).status).toBe(200)
    expect(updated).toEqual({ store_id: sellerA, name: 'Updated name' })
    expect(query.eq).toHaveBeenCalledWith('id', applicationId)
    expect(query.eq).toHaveBeenCalledWith('store_id', sellerA)
  })

  it('allows only pending orders to be confirmed or cancelled by their seller', async () => {
    const query = mockQuery({ data: { id: applicationId, status: 'confirmed' }, error: null }) as any
    let updated: Record<string, unknown> | undefined
    query.update = vi.fn((values: Record<string, unknown>) => { updated = values; return query })
    const from = vi.fn(() => query)
    serviceMock.create.mockReturnValue({ from, rpc: serviceMock.rpc })
    const request = new NextRequest('https://shopnekt.test/api/seller/data', {
      method: 'POST', headers: { cookie: `sn_seller_session=${sellerCookie(sellerA)}`, origin: 'https://shopnekt.test' },
      body: JSON.stringify({ resource: 'orders', action: 'status', id: applicationId, status: 'confirmed' }),
    })

    expect((await sellerDataPost(request)).status).toBe(200)
    expect(updated?.status).toBe('confirmed')
    expect(query.eq).toHaveBeenCalledWith('store_id', sellerA)
    expect(query.eq).toHaveBeenCalledWith('status', 'pending')

    const invalid = new NextRequest('https://shopnekt.test/api/seller/data', {
      method: 'POST', headers: { cookie: `sn_seller_session=${sellerCookie(sellerA)}`, origin: 'https://shopnekt.test' },
      body: JSON.stringify({ resource: 'orders', action: 'status', id: applicationId, status: 'delivered' }),
    })
    expect((await sellerDataPost(invalid)).status).toBe(400)
    expect(from).toHaveBeenCalledTimes(1)
  })

  it('rejects malformed seller data values before writing', async () => {
    const query = mockQuery({ data: null, error: null }) as any
    const from = vi.fn().mockReturnValue(query)
    serviceMock.create.mockReturnValue({ from, rpc: serviceMock.rpc })
    const request = new NextRequest('https://shopnekt.test/api/seller/data', {
      method: 'POST', headers: { cookie: `sn_seller_session=${sellerCookie(sellerA)}`, origin: 'https://shopnekt.test' },
      body: JSON.stringify({ resource: 'products', action: 'create', item: { name: 'Invalid price', price: -4 } }),
    })
    expect((await sellerDataPost(request)).status).toBe(400)
    expect(from).not.toHaveBeenCalled()
  })

  it('requires a verified buyer token before changing preferred shops and ignores client user ids', async () => {
    const anonymous = new NextRequest('https://shopnekt.test/api/shop-likes', {
      method: 'POST', headers: { origin: 'https://shopnekt.test' },
      body: JSON.stringify({ store_id: sellerA, user_id: sellerB, liked: true }),
    })
    serviceMock.create.mockReturnValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('invalid token') }) } })
    expect((await shopLikePost(anonymous)).status).toBe(401)

    const query = mockQuery({ data: { id: sellerA }, error: null }) as any
    let inserted: Record<string, unknown> | undefined
    query.insert = vi.fn((row: Record<string, unknown>) => { inserted = row; return Promise.resolve({ error: null }) })
    const from = vi.fn((table: string) => table === 'pending_payments' ? query : query)
    serviceMock.create.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: sellerA } }, error: null }) },
      from, rpc: serviceMock.rpc,
    })
    const authorized = new NextRequest('https://shopnekt.test/api/shop-likes', {
      method: 'POST', headers: { origin: 'https://shopnekt.test', authorization: 'Bearer verified-customer-token' },
      body: JSON.stringify({ store_id: sellerA, user_id: sellerB, liked: true }),
    })
    expect((await shopLikePost(authorized)).status).toBe(200)
    expect(inserted).toEqual({ store_id: sellerA, user_id: sellerA })
    expect(query.eq).toHaveBeenCalledWith('status', 'approved')
  })

  it('blocks direct unauthenticated feed-like writes and rejects malformed requests', async () => {
    const wrongOrigin = new NextRequest('https://shopnekt.test/api/vybe/like', {
      method: 'POST', headers: { origin: 'https://attacker.test' },
      body: JSON.stringify({ post_id: applicationId, liked: true }),
    })
    expect((await vybeLikePost(wrongOrigin)).status).toBe(403)
    const malformed = new NextRequest('https://shopnekt.test/api/vybe/like', {
      method: 'POST', headers: { origin: 'https://shopnekt.test' },
      body: JSON.stringify({ post_id: 'not-a-uuid', liked: 100 }),
    })
    expect((await vybeLikePost(malformed)).status).toBe(400)
  })

  it('requires verified customer authentication for orders, payment and delivery confirmation', async () => {
    const orders = new NextRequest('https://shopnekt.test/api/customer/orders')
    expect((await customerOrdersGet(orders)).status).toBe(401)
    const order = new NextRequest(`https://shopnekt.test/api/customer/orders/${applicationId}`)
    expect((await customerOrderGet(order, { params: Promise.resolve({ id: applicationId }) })).status).toBe(401)
    const payment = new NextRequest(`https://shopnekt.test/api/customer/orders/${applicationId}/payment`, {
      method: 'POST', headers: { origin: 'https://shopnekt.test' }, body: JSON.stringify({ payment_method: 'mpesa', payment_option: 'full' }),
    })
    expect((await customerPaymentPost(payment, { params: Promise.resolve({ id: applicationId }) })).status).toBe(401)
    const delivery = new NextRequest(`https://shopnekt.test/api/customer/orders/${applicationId}/confirm-delivery`, {
      method: 'POST', headers: { origin: 'https://shopnekt.test' },
    })
    expect((await confirmDeliveryPost(delivery, { params: Promise.resolve({ id: applicationId }) })).status).toBe(401)
    expect(serviceMock.create).not.toHaveBeenCalled()
  })

  it('does not return an order when the verified customer does not own it', async () => {
    const query = mockQuery({ data: null, error: null })
    serviceMock.create.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: sellerA } }, error: null }) },
      from: vi.fn(() => query),
    })
    const request = new NextRequest(`https://shopnekt.test/api/customer/orders/${applicationId}`, {
      headers: { authorization: 'Bearer verified-token' },
    })
    expect((await customerOrderGet(request, { params: Promise.resolve({ id: applicationId }) })).status).toBe(404)
    expect(query.eq).toHaveBeenCalledWith('buyer_id', sellerA)
  })

  it('rejects cross-origin public store messages and validates message input', async () => {
    const forbidden = new NextRequest('https://shopnekt.test/api/store-messages', {
      method: 'POST', headers: { origin: 'https://attacker.test' }, body: JSON.stringify({ store_id: sellerA, sender_name: 'Buyer', message: 'Hello' }),
    })
    expect((await storeMessagePost(forbidden)).status).toBe(403)
    const invalid = new NextRequest('https://shopnekt.test/api/store-messages', {
      method: 'POST', headers: { origin: 'https://shopnekt.test' }, body: JSON.stringify({ store_id: sellerA, sender_name: 'A', message: '' }),
    })
    expect((await storeMessagePost(invalid)).status).toBe(400)
  })

  it('rejects unauthenticated dashboard statistics requests', async () => {
    const request = new NextRequest('https://shopnekt.test/api/dashboard-stats', { method: 'POST', body: JSON.stringify({ shop_id: sellerA, market: 'business' }) })
    expect((await dashboardStats(request)).status).toBe(401)
    expect(serviceMock.create).not.toHaveBeenCalled()
  })

  it('does not accept a normal customer cookie as seller authentication', async () => {
    const request = new NextRequest('https://shopnekt.test/api/dashboard-stats', {
      method: 'POST', headers: { cookie: 'sn_customer_session=%7B%22id%22%3A%22customer-1%22%7D' },
      body: JSON.stringify({ shop_id: sellerA, market: 'business' }),
    })
    expect((await dashboardStats(request)).status).toBe(401)
    expect(serviceMock.create).not.toHaveBeenCalled()
  })

  it('blocks a seller session from requesting another seller statistics', async () => {
    const request = new NextRequest('https://shopnekt.test/api/dashboard-stats', {
      method: 'POST', headers: { cookie: `sn_seller_session=${sellerCookie(sellerA)}` },
      body: JSON.stringify({ shop_id: sellerB, market: 'business' }),
    })
    expect((await dashboardStats(request)).status).toBe(403)
    expect(serviceMock.create).not.toHaveBeenCalled()
  })

  it('validates analytics periods and restricts reads to the seller session', async () => {
    expect((await analyticsGet(new NextRequest(`https://shopnekt.test/api/analytics?store_id=${sellerA}`))).status).toBe(401)
    const otherSeller = new NextRequest(`https://shopnekt.test/api/analytics?store_id=${sellerB}`, { headers: { cookie: `sn_seller_session=${sellerCookie(sellerA)}` } })
    expect((await analyticsGet(otherSeller)).status).toBe(403)
    const invalidDays = new NextRequest(`https://shopnekt.test/api/analytics?store_id=${sellerA}&days=9999`, { headers: { cookie: `sn_seller_session=${sellerCookie(sellerA)}` } })
    expect((await analyticsGet(invalidDays)).status).toBe(400)
  })

  it('rejects notification subscription changes without a seller session', async () => {
    const request = new NextRequest('https://shopnekt.test/api/notify', { method: 'POST', headers: { origin: 'https://shopnekt.test' }, body: JSON.stringify({ store_id: sellerA, subscription: {} }) })
    expect((await notifyPost(request)).status).toBe(401)
    expect(serviceMock.create).not.toHaveBeenCalled()
  })

  it('rejects seller settings writes without a server-issued seller session', async () => {
    const request = new NextRequest('https://shopnekt.test/api/seller/settings', {
      method: 'PATCH', headers: { origin: 'https://shopnekt.test' }, body: JSON.stringify({ section: 'shop', id: sellerB, shop_name: 'Changed by customer' }),
    })
    expect((await sellerSettingsPatch(request)).status).toBe(401)
    expect(serviceMock.create).not.toHaveBeenCalled()
  })

  it('rejects social links containing misleading URL credentials before saving seller settings', async () => {
    const from = vi.fn()
    serviceMock.create.mockReturnValue({ from, rpc: serviceMock.rpc })
    const request = new NextRequest('https://shopnekt.test/api/seller/settings', {
      method: 'PATCH', headers: { cookie: `sn_seller_session=${sellerCookie(sellerA)}`, origin: 'https://shopnekt.test' },
      body: JSON.stringify({ section: 'shop', shop_name: 'Shop', shop_category: 'Services', shop_region: 'Dar', shop_whatsapp: '255712345678', shop_desc: 'Business profile', shop_instagram: 'https://attacker.example@instagram.com/profile' }),
    })

    expect((await sellerSettingsPatch(request)).status).toBe(400)
    expect(from).not.toHaveBeenCalled()
  })

  it('rejects profile reads without a seller session and binds authorized reads to the signed seller id', async () => {
    const anonymous = new NextRequest('https://shopnekt.test/api/seller/profile')
    expect((await sellerProfileGet(anonymous)).status).toBe(401)
    expect(serviceMock.create).not.toHaveBeenCalled()

    const profile = mockQuery({ data: { id: sellerA, shop_name: 'Shop A', status: 'approved' }, error: null })
    const from = vi.fn().mockReturnValue(profile)
    serviceMock.create.mockReturnValue({ from, rpc: serviceMock.rpc })
    const authorized = new NextRequest('https://shopnekt.test/api/seller/profile', {
      headers: { cookie: `sn_seller_session=${sellerCookie(sellerA)}` },
    })
    expect((await sellerProfileGet(authorized)).status).toBe(200)
    expect(profile.eq).toHaveBeenCalledWith('id', sellerA)
  })

  it('prevents a seller from sending notifications for another seller', async () => {
    const request = new NextRequest('https://shopnekt.test/api/notify', {
      method: 'PUT', headers: { cookie: `sn_seller_session=${sellerCookie(sellerA)}`, origin: 'https://shopnekt.test' },
      body: JSON.stringify({ store_id: sellerB, title: 'Offer', body: 'Special offer' }),
    })
    expect((await notifyPut(request)).status).toBe(403)
    expect(serviceMock.create).not.toHaveBeenCalled()
  })

  it('does not allow a browser request to review a WebStore application without admin proof', async () => {
    const request = new NextRequest('https://shopnekt.test/api/admin/webstores', { method: 'PATCH', headers: { origin: 'https://shopnekt.test' }, body: JSON.stringify({ id: applicationId, status: 'approved' }) })
    expect((await adminWebstorePatch(request)).status).toBe(401)
    expect(serviceMock.create).not.toHaveBeenCalled()
  })

  it('rejects unauthenticated access and operations on the legacy admin dashboard API', async () => {
    const read = new NextRequest('https://shopnekt.test/api/admin/operations')
    expect((await adminOperationsGet(read)).status).toBe(401)
    const write = new NextRequest('https://shopnekt.test/api/admin/operations', {
      method: 'POST', headers: { origin: 'https://shopnekt.test' }, body: JSON.stringify({ action: 'set-market-status', id: applicationId, status: 'approved' }),
    })
    expect((await adminOperationsPost(write)).status).toBe(401)
    expect(serviceMock.create).not.toHaveBeenCalled()
  })

  it('does not treat a seller session as admin proof', async () => {
    const request = new NextRequest('https://shopnekt.test/api/admin/webstores', {
      method: 'PATCH', headers: { cookie: `sn_seller_session=${sellerCookie(sellerA)}`, origin: 'https://shopnekt.test' },
      body: JSON.stringify({ id: applicationId, status: 'approved' }),
    })
    expect((await adminWebstorePatch(request)).status).toBe(401)
    expect(serviceMock.create).not.toHaveBeenCalled()
  })

  it('rejects malformed PINs before database verification', async () => {
    const request = new NextRequest('https://shopnekt.test/api/seller/auth/login', { method: 'POST', body: JSON.stringify({ email: 'seller@example.com', pin: '12345' }) })
    expect((await sellerLogin(request)).status).toBe(400)
    expect(serviceMock.create).not.toHaveBeenCalled()
  })

  it('returns 401 for an incorrect PIN and 429 once the database lockout is active', async () => {
    serviceMock.rpc.mockResolvedValue({ data: false, error: null })
    const badPin = () => new NextRequest('https://shopnekt.test/api/seller/auth/login', { method: 'POST', body: JSON.stringify({ email: 'seller@example.com', pin: '1234' }) })
    expect((await sellerLogin(badPin())).status).toBe(401)
    serviceMock.lockedUntil = new Date(Date.now() + 60_000).toISOString()
    expect((await sellerLogin(badPin())).status).toBe(429)
  })

  it('treats server-issued admin session as authorization for the review endpoint', async () => {
    const query = mockQuery({ data: { id: applicationId, webstore_status: 'submitted' }, error: null })
    const update = mockQuery({ data: { id: applicationId }, error: null })
    const from = vi.fn().mockReturnValueOnce(query).mockReturnValueOnce(update)
    serviceMock.create.mockReturnValue({ from, rpc: serviceMock.rpc })
    const request = new NextRequest('https://shopnekt.test/api/admin/webstores', {
      method: 'PATCH', headers: { cookie: `sn_admin_session=${adminCookie()}`, 'Content-Type': 'application/json', origin: 'https://shopnekt.test' },
      body: JSON.stringify({ id: applicationId, status: 'approved' }),
    })
    expect((await adminWebstorePatch(request)).status).toBe(200)
  })

  it('does not reveal WebStore status to unauthenticated email lookups', async () => {
    const request = new NextRequest(`https://shopnekt.test/api/webstore/application?email=owner@example.com`)
    expect((await webstoreStatusGet(request)).status).toBe(401)
    expect(serviceMock.create).not.toHaveBeenCalled()
  })

  it('limits WebStore status lookup to the application session and matching email', async () => {
    const appQuery = mockQuery({ data: { id: applicationId, shop_name: 'Private Shop', shop_category: 'Fashion', webstore_status: 'submitted', webstore_rejection_reason: null, owner_email: 'owner@example.com' }, error: null })
    serviceMock.create.mockReturnValue({ from: () => appQuery, rpc: serviceMock.rpc })
    const request = new NextRequest('https://shopnekt.test/api/webstore/application?email=another@example.com', {
      headers: { cookie: `sn_webstore_owner_session=${webstoreOwnerCookie(applicationId)}` },
    })
    expect((await webstoreStatusGet(request)).status).toBe(404)
    expect(appQuery.eq).toHaveBeenCalledWith('id', applicationId)
  })

  it('only lets the application session publish its own approved WebStore', async () => {
    const notApprovedQuery = mockQuery({ data: { id: applicationId, webstore_status: 'submitted' }, error: null })
    serviceMock.create.mockReturnValue({ from: () => notApprovedQuery, rpc: serviceMock.rpc })
    const unauthorizedPublish = new NextRequest('https://shopnekt.test/api/webstore/application', { method: 'PATCH', headers: { origin: 'https://shopnekt.test' } })
    expect((await webstoreStatusPatch(unauthorizedPublish)).status).toBe(401)

    const approvedQuery = mockQuery({ data: { id: applicationId, webstore_status: 'approved' }, error: null })
    const updateQuery = mockQuery({ data: { id: applicationId }, error: null })
    const from = vi.fn().mockReturnValueOnce(approvedQuery).mockReturnValueOnce(updateQuery)
    serviceMock.create.mockReturnValue({ from, rpc: serviceMock.rpc })
    const ownerPublish = new NextRequest('https://shopnekt.test/api/webstore/application', {
      method: 'PATCH', headers: { cookie: `sn_webstore_owner_session=${webstoreOwnerCookie(applicationId)}`, origin: 'https://shopnekt.test' },
    })
    expect((await webstoreStatusPatch(ownerPublish)).status).toBe(200)
    expect(updateQuery.eq).toHaveBeenCalledWith('id', applicationId)
    expect(updateQuery.eq).toHaveBeenCalledWith('webstore_status', 'approved')
  })

  it('submits an approved seller WebStore against the existing store record', async () => {
    const templateQuery = mockQuery({ data: { id: 'fashion-template' }, error: null })
    const sellerQuery = mockQuery({ data: { id: sellerA, status: 'approved', webstore_status: null }, error: null })
    const updateQuery = mockQuery({ data: { id: sellerA }, error: null })
    let updated: Record<string, unknown> | undefined
    updateQuery.update = vi.fn((values: Record<string, unknown>) => { updated = values; return updateQuery })
    const pendingQueries = [sellerQuery, updateQuery]
    const from = vi.fn((table: string) => table === 'webstore_templates' ? templateQuery : pendingQueries.shift())
    serviceMock.create.mockReturnValue({ from, rpc: serviceMock.rpc })
    const request = new NextRequest('https://shopnekt.test/api/webstore/application', {
      method: 'POST', headers: { cookie: `sn_seller_session=${sellerCookie(sellerA)}`, origin: 'https://shopnekt.test', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shop_name: 'Shop A', shop_desc: 'A real store description', owner_name: 'Owner A', owner_phone: '255712345678',
        owner_email: 'owner@example.com', shop_whatsapp: '255712345678', shop_region: 'Dar es Salaam',
        selected_template: 'fashion-template', shop_category: 'Fashion', market: 'fashion',
      }),
    })

    const response = await webstoreApplicationPost(request)
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ success: true, application_id: sellerA, reused_store: true })
    expect(updated?.webstore_status).toBe('submitted')
    expect(updateQuery.eq).toHaveBeenCalledWith('id', sellerA)
    expect(updateQuery.eq).toHaveBeenCalledWith('status', 'approved')
    expect(updateQuery.is).toHaveBeenCalledWith('webstore_status', null)
    expect(from).toHaveBeenCalledTimes(3)
  })

  it('does not create another WebStore application while review or approval is active', async () => {
    const templateQuery = mockQuery({ data: { id: 'fashion-template' }, error: null })
    const sellerQuery = mockQuery({ data: { id: sellerA, status: 'approved', webstore_status: 'submitted' }, error: null })
    const from = vi.fn((table: string) => table === 'webstore_templates' ? templateQuery : sellerQuery)
    serviceMock.create.mockReturnValue({ from, rpc: serviceMock.rpc })
    const request = new NextRequest('https://shopnekt.test/api/webstore/application', {
      method: 'POST', headers: { cookie: `sn_seller_session=${sellerCookie(sellerA)}`, origin: 'https://shopnekt.test', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shop_name: 'Shop A', shop_desc: 'A real store description', owner_name: 'Owner A', owner_phone: '255712345678',
        owner_email: 'owner@example.com', shop_whatsapp: '255712345678', shop_region: 'Dar es Salaam',
        selected_template: 'fashion-template', shop_category: 'Fashion', market: 'fashion',
      }),
    })

    expect((await webstoreApplicationPost(request)).status).toBe(409)
    expect(from).toHaveBeenCalledTimes(2)
    expect(sellerQuery.update).not.toHaveBeenCalled()
  })
})
