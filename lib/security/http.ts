import type { NextRequest } from 'next/server'

/** Cookie-authenticated mutations must originate from the application origin. */
export function hasSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  if (!origin) {return false}
  try {
    return new URL(origin).origin === new URL(request.url).origin
  } catch {
    return false
  }
}
