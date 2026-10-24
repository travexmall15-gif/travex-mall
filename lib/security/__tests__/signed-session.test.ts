import { afterEach, describe, expect, it } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { adminPasscodeMatches, hasAdminSession, readSellerSession, setAdminSession, setSellerSession } from '../signed-session'

const originalSellerSecret = process.env.SELLER_SESSION_SECRET
const originalAdminSecret = process.env.SHOPNEKT_SESSION_SECRET
const originalPasscode = process.env.SHOPNEKT_ADMIN_PASSCODE

afterEach(() => {
  if (originalSellerSecret === undefined) {delete process.env.SELLER_SESSION_SECRET}
  else {process.env.SELLER_SESSION_SECRET = originalSellerSecret}
  if (originalAdminSecret === undefined) {delete process.env.SHOPNEKT_SESSION_SECRET}
  else {process.env.SHOPNEKT_SESSION_SECRET = originalAdminSecret}
  if (originalPasscode === undefined) {delete process.env.SHOPNEKT_ADMIN_PASSCODE}
  else {process.env.SHOPNEKT_ADMIN_PASSCODE = originalPasscode}
})

function cookieFrom(set: (response: NextResponse) => void, name: string) {
  const response = NextResponse.json({ ok: true })
  set(response)
  return response.cookies.get(name)?.value || ''
}

describe('signed server sessions', () => {
  it('binds seller identity and market to an integrity-protected HttpOnly cookie', () => {
    process.env.SELLER_SESSION_SECRET = 'seller-session-secret-with-at-least-32-bytes'
    const cookie = cookieFrom(response => setSellerSession(response, 'seller-A', 'business'), 'sn_seller_session')
    const request = new NextRequest('https://shopnekt.test/api', { headers: { cookie: `sn_seller_session=${cookie}` } })
    expect(readSellerSession(request)).toEqual({ sellerId: 'seller-A', market: 'business' })
    expect(cookie).toContain('.')
  })

  it('rejects tampered and missing seller cookies', () => {
    process.env.SELLER_SESSION_SECRET = 'seller-session-secret-with-at-least-32-bytes'
    const cookie = cookieFrom(response => setSellerSession(response, 'seller-A', 'business'), 'sn_seller_session')
    const tampered = `${cookie.slice(0, -1)}${cookie.endsWith('a') ? 'b' : 'a'}`
    expect(readSellerSession(new NextRequest('https://shopnekt.test', { headers: { cookie: `sn_seller_session=${tampered}` } }))).toBeNull()
    expect(readSellerSession(new NextRequest('https://shopnekt.test'))).toBeNull()
  })

  it('accepts only the server-configured admin passcode and signed admin session', () => {
    process.env.SHOPNEKT_SESSION_SECRET = 'admin-session-secret-with-at-least-32-bytes'
    process.env.SHOPNEKT_ADMIN_PASSCODE = 'a-strong-admin-secret-passphrase'
    expect(adminPasscodeMatches('a-strong-admin-secret-passphrase')).toBe(true)
    expect(adminPasscodeMatches('shopnekt2026')).toBe(false)
    const cookie = cookieFrom(setAdminSession, 'sn_admin_session')
    expect(hasAdminSession(new NextRequest('https://shopnekt.test', { headers: { cookie: `sn_admin_session=${cookie}` } }))).toBe(true)
    const tampered = `${cookie.slice(0, -1)}${cookie.endsWith('a') ? 'b' : 'a'}`
    expect(hasAdminSession(new NextRequest('https://shopnekt.test', { headers: { cookie: `sn_admin_session=${tampered}` } }))).toBe(false)
  })

  it('fails closed when the admin secret is short or absent', () => {
    process.env.SHOPNEKT_SESSION_SECRET = 'short'
    expect(hasAdminSession(new NextRequest('https://shopnekt.test'))).toBe(false)
    process.env.SHOPNEKT_ADMIN_PASSCODE = 'shopnekt2026'
    expect(adminPasscodeMatches('shopnekt2026')).toBe(false)
  })
})
