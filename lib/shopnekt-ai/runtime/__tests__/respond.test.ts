import { describe, it, expect, vi, afterEach } from 'vitest'
import { generateGroundedResponse } from '../respond'

const originalEnv = { ...process.env }

describe('generateGroundedResponse — grounding discipline', () => {
  afterEach(() => { process.env = { ...originalEnv }; vi.restoreAllMocks() })

  it('uses the dev fallback (never a fabricated answer) when no real runtime is configured', async () => {
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.MODEL_RUNTIME
    const result = await generateGroundedResponse('searchProducts', [{ id: '1', name: 'iPhone 13' }], 'en')
    expect(result.isFallback).toBe(true)
    expect(result.runtimeKind).toBe('devFallback')
  })

  it('never throws even if the underlying runtime errors — always resolves to a safe result', async () => {
    process.env.MODEL_RUNTIME = 'anthropic'
    process.env.ANTHROPIC_API_KEY = 'test-key'
    global.fetch = vi.fn().mockRejectedValue(new Error('network down')) as any
    const result = await generateGroundedResponse('searchProducts', [{ id: '1' }], 'en')
    expect(result).toBeDefined()
    expect(typeof result.text).toBe('string')
  })

  it('the prompt sent to the model contains ONLY the real tool data, never raw database access or secrets', async () => {
    process.env.MODEL_RUNTIME = 'anthropic'
    process.env.ANTHROPIC_API_KEY = 'test-key'
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ content: [{ text: 'Found it.' }] }) })
    global.fetch = mockFetch as any

    const realData = [{ id: 'p1', name: 'Nike Air Force 1', price: 135000 }]
    await generateGroundedResponse('searchProducts', realData, 'en')

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    const promptContent = body.messages[0].content
    expect(promptContent).toContain('Nike Air Force 1')
    expect(promptContent).toContain('135000')
    // Must never contain anything resembling a credential.
    expect(promptContent).not.toMatch(/api[_-]?key/i)
    expect(promptContent).not.toMatch(/password/i)
  })

  it('the system prompt explicitly forbids inventing facts beyond the data block', async () => {
    process.env.MODEL_RUNTIME = 'anthropic'
    process.env.ANTHROPIC_API_KEY = 'test-key'
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ content: [{ text: 'ok' }] }) })
    global.fetch = mockFetch as any

    await generateGroundedResponse('searchProducts', [], 'sw')

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.system).toMatch(/must not mention.*invent/i)
    expect(body.system).toContain('Kiswahili')
  })

  it('the system prompt instructs the model never to translate ShopNekt brand terms', async () => {
    process.env.MODEL_RUNTIME = 'anthropic'
    process.env.ANTHROPIC_API_KEY = 'test-key'
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ content: [{ text: 'ok' }] }) })
    global.fetch = mockFetch as any

    await generateGroundedResponse('searchShops', [], 'sw')

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.system).toContain('ShopNekt')
    expect(body.system).toContain('Flash Deals')
    expect(body.system).toContain('Group Buy')
  })
})
