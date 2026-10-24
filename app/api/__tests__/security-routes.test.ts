import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
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
import { GET as webstoreStatusGet, PATCH as webstoreStatusPatch } from '../webstore/application/route'
import { GET as adminOperationsGet, POST as adminOperationsPost } from '../admin/operations/route'
import { PATCH as sellerSettingsPatch } from '../seller/settings/route'
import { GET as sellerProfileGet } from '../seller/profile/route'

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
  for (const method of ['select', 'eq', 'order', 'limit', 'update', 'in']) {builder[method] = vi.fn(() => builder)}
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
})
