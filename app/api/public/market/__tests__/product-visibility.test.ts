import { describe, expect, it } from 'vitest'
import { isProductPubliclyAvailable } from '../../../../../lib/products/public-visibility'

describe('public product visibility', () => {
  it('includes stocked products that are active and available', () => {
    expect(isProductPubliclyAvailable({ stock: 3, is_active: true, is_available: true })).toBe(true)
    expect(isProductPubliclyAvailable({ stock: 3 })).toBe(true)
  })

  it('excludes inactive, unavailable, and out-of-stock products', () => {
    expect(isProductPubliclyAvailable({ stock: 3, is_active: false, is_available: true })).toBe(false)
    expect(isProductPubliclyAvailable({ stock: 3, is_active: true, is_available: false })).toBe(false)
    expect(isProductPubliclyAvailable({ stock: 0, is_active: true, is_available: true })).toBe(false)
    expect(isProductPubliclyAvailable({ stock: 'not-a-number' })).toBe(false)
  })
})
