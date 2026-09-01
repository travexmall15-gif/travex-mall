import { describe, it, expect } from 'vitest'
import { DevFallbackRuntime } from '../adapters/dev-fallback'

describe('DevFallbackRuntime', () => {
  const runtime = new DevFallbackRuntime()

  it('always reports itself as available and clearly labeled as a fallback', async () => {
    const health = await runtime.healthCheck()
    expect(health.available).toBe(true)
    expect(health.kind).toBe('devFallback')
    expect(health.detail).toMatch(/not a real model/i)
  })

  it('generate() always sets isFallback: true', async () => {
    const result = await runtime.generate('###DATA###[]###ENDDATA###')
    expect(result.isFallback).toBe(true)
    expect(result.runtimeKind).toBe('devFallback')
  })

  it('renders a non-empty-result message when the data block has items', async () => {
    const prompt = `###DATA###${JSON.stringify([{ id: '1' }, { id: '2' }])}###ENDDATA###`
    const result = await runtime.generate(prompt)
    expect(result.text).toContain('2')
  })

  it('renders a no-results message for an empty array data block', async () => {
    const result = await runtime.generate('###DATA###[]###ENDDATA###')
    expect(result.text).toMatch(/no results/i)
  })

  it('never fabricates content when no data block is present in the prompt', async () => {
    const result = await runtime.generate('just some prompt with no data block')
    expect(result.text).toMatch(/no model-generated response available/i)
  })

  it('stream() yields delta chunks followed by a done event, with no artificial delay', async () => {
    const chunks: string[] = []
    let sawDone = false
    const start = Date.now()
    for await (const chunk of runtime.stream('###DATA###[{"id":"1"}]###ENDDATA###')) {
      if (chunk.type === 'delta') {chunks.push(chunk.text)}
      if (chunk.type === 'done') {sawDone = true}
    }
    const elapsed = Date.now() - start
    expect(sawDone).toBe(true)
    expect(chunks.join('')).toContain('1')
    expect(elapsed).toBeLessThan(200) // no setTimeout-based fake streaming
  })
})
