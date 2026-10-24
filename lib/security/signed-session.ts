import { createHmac, timingSafeEqual } from 'node:crypto'
import type { NextRequest, NextResponse } from 'next/server'

const SELLER_COOKIE = 'sn_seller_session'
const ADMIN_COOKIE = 'sn_admin_session'
const WEBSTORE_OWNER_COOKIE = 'sn_webstore_owner_session'
const SESSION_SECONDS = 60 * 60 * 12
const WEBSTORE_OWNER_SECONDS = 60 * 60 * 24 * 30

type SessionPayload = { sub: string; market?: string; role?: string; exp: number }

function secret(name: string): string | null {
  const value = process.env[name]
  return value && value.length >= 32 ? value : null
}

function encode(payload: SessionPayload, key: string) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', key).update(body).digest('base64url')
  return `${body}.${signature}`
}

function decode(value: string | undefined, key: string): SessionPayload | null {
  if (!value) {return null}
  const [body, signature, ...extra] = value.split('.')
  if (!body || !signature || extra.length) {return null}
  const expected = createHmac('sha256', key).update(body).digest()
  let supplied: Buffer
  try { supplied = Buffer.from(signature, 'base64url') } catch { return null }
  if (supplied.toString('base64url') !== signature) {return null}
  if (supplied.length !== expected.length || !timingSafeEqual(expected, supplied)) {return null}
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload
    if (!payload.sub || !Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) {return null}
    return payload
  } catch { return null }
}

function setCookie(response: NextResponse, name: string, token: string, maxAge = SESSION_SECONDS) {
  response.cookies.set(name, token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
    path: '/', maxAge,
  })
}

export function setSellerSession(response: NextResponse, sellerId: string, market: string) {
  const key = secret('SELLER_SESSION_SECRET')
  if (!key) {throw new Error('SELLER_SESSION_SECRET is not configured')}
  const token = encode({ sub: sellerId, market, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS }, key)
  setCookie(response, SELLER_COOKIE, token)
}

export function readSellerSession(request: NextRequest): { sellerId: string; market: string } | null {
  const key = secret('SELLER_SESSION_SECRET')
  if (!key) {return null}
  const payload = decode(request.cookies.get(SELLER_COOKIE)?.value, key)
  if (!payload || !payload.market) {return null}
  return { sellerId: payload.sub, market: payload.market }
}

export function setWebstoreOwnerSession(response: NextResponse, applicationId: string) {
  const baseKey = secret('SELLER_SESSION_SECRET')
  if (!baseKey) {throw new Error('SELLER_SESSION_SECRET is not configured')}
  const key = createHmac('sha256', baseKey).update('shopnekt-webstore-owner-v1').digest('hex')
  const token = encode({ sub: applicationId, role: 'webstore-owner', exp: Math.floor(Date.now() / 1000) + WEBSTORE_OWNER_SECONDS }, key)
  setCookie(response, WEBSTORE_OWNER_COOKIE, token, WEBSTORE_OWNER_SECONDS)
}

export function readWebstoreOwnerSession(request: NextRequest): { applicationId: string } | null {
  const baseKey = secret('SELLER_SESSION_SECRET')
  if (!baseKey) {return null}
  const key = createHmac('sha256', baseKey).update('shopnekt-webstore-owner-v1').digest('hex')
  const payload = decode(request.cookies.get(WEBSTORE_OWNER_COOKIE)?.value, key)
  if (!payload || payload.role !== 'webstore-owner') {return null}
  return { applicationId: payload.sub }
}

export function setAdminSession(response: NextResponse) {
  const key = secret('SHOPNEKT_SESSION_SECRET')
  if (!key) {throw new Error('SHOPNEKT_SESSION_SECRET is not configured')}
  const token = encode({ sub: 'configured-admin', role: 'admin', exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS }, key)
  setCookie(response, ADMIN_COOKIE, token)
}

export function hasAdminSession(request: NextRequest): boolean {
  const key = secret('SHOPNEKT_SESSION_SECRET')
  if (!key) {return false}
  const payload = decode(request.cookies.get(ADMIN_COOKIE)?.value, key)
  return payload?.role === 'admin' && payload.sub === 'configured-admin'
}

export function clearSession(response: NextResponse, name: 'seller' | 'admin') {
  response.cookies.set(name === 'seller' ? SELLER_COOKIE : ADMIN_COOKIE, '', {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0,
  })
}

export function adminPasscodeMatches(candidate: unknown) {
  const configured = process.env.SHOPNEKT_ADMIN_PASSCODE
  if (typeof candidate !== 'string' || !configured || configured.length < 20) {return false}
  const a = Buffer.from(candidate)
  const b = Buffer.from(configured)
  return a.length === b.length && timingSafeEqual(a, b)
}
