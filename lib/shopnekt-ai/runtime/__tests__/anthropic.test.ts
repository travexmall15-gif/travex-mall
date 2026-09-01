import { describe, it, expect, vi, afterEach } from 'vitest'
import { AnthropicModelRuntime } from '../adapters/anthropic'

const originalFetch = global.fetch
const originalEnv = { ...process.env }

describe('AnthropicModelRuntime', () => {
  afterEach(() => {
    global.fetch = originalFetch
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  describe('healthCheck', () => {
    it('reports unavailable when ANTHROPIC_API_KEY is not set', async () => {
      delete process.env.ANTHROPIC_API_KEY
      const runtime = new AnthropicModelRuntime()
      const health = await runtime.healthCheck()
      expect(health.available).toBe(false)
      expect(health.detail).toMatch(/not configured/i)
    })

    it('reports available when a key is present', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key'
      const runtime = new AnthropicModelRuntime()
      const health = await runtime.healthCheck()
      expect(health.available).toBe(true)
    })
  })

  describe('generate', () => {
    it('throws a clear error rather than silently proceeding when no key is configured', async () => {
      delete process.env.ANTHROPIC_API_KEY
      const runtime = new AnthropicModelRuntime()
      await expect(runtime.generate('hello')).rejects.toThrow(/ANTHROPIC_API_KEY/)
    })

    it('sends the expected request shape (mocked network — no real API call)', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key'
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: [{ text: 'Nimekupatia matokeo.' }] }),
      })
      global.fetch = mockFetch as any

      const runtime = new AnthropicModelRuntime()
      const result = await runtime.generate('###DATA###[]###ENDDATA###', { system: 'You are ShopNekt AI.' })

      expect(result.text).toBe('Nimekupatia matokeo.')
      expect(result.isFallback).toBe(false)
      expect(result.runtimeKind).toBe('anthropic')

      const [url, init] = mockFetch.mock.calls[0]
      expect(url).toBe('https://api.anthropic.com/v1/messages')
      expect(init.headers['x-api-key']).toBe('test-key')
      expect(init.headers['anthropic-version']).toBe('2023-06-01')
      const body = JSON.parse(init.body)
      expect(body.system).toBe('You are ShopNekt AI.')
      expect(body.messages[0].content).toContain('###DATA###')
    })

    it('throws when the API responds with a non-ok status (never silently returns empty text as if successful)', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key'
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as any
      const runtime = new AnthropicModelRuntime()
      await expect(runtime.generate('hello')).rejects.toThrow(/500/)
    })
  })

  describe('stream', () => {
    it('yields an error chunk when no key is configured, rather than throwing out of the generator', async () => {
      delete process.env.ANTHROPIC_API_KEY
      const runtime = new AnthropicModelRuntime()
      const chunks = []
      for await (const chunk of runtime.stream('hello')) {chunks.push(chunk)}
      expect(chunks).toEqual([{ type: 'error', message: expect.stringContaining('ANTHROPIC_API_KEY') }])
    })

    it('parses real Anthropic SSE content_block_delta events into delta chunks', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key'
      const sseBody = [
        'data: {"type":"content_block_delta","delta":{"text":"Nime"}}\n\n',
        'data: {"type":"content_block_delta","delta":{"text":"kupatia"}}\n\n',
        'data: {"type":"message_stop"}\n\n',
      ].join('')

      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(sseBody))
          controller.close()
        },
      })

      global.fetch = vi.fn().mockResolvedValue({ ok: true, body: stream }) as any

      const runtime = new AnthropicModelRuntime()
      const chunks: any[] = []
      for await (const chunk of runtime.stream('hello')) {chunks.push(chunk)}

      const deltas = chunks.filter(c => c.type === 'delta').map(c => c.text)
      expect(deltas.join('')).toBe('Nimekupatia')
      expect(chunks[chunks.length - 1].type).toBe('done')
    })
  })
})
