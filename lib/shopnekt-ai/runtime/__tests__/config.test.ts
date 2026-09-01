import { describe, it, expect, afterEach } from 'vitest'
import { getConfiguredRuntimeKind, buildRuntime, getActiveRuntimeChecked } from '../config'

const originalEnv = { ...process.env }

describe('getConfiguredRuntimeKind', () => {
  afterEach(() => { process.env = { ...originalEnv } })

  it('respects an explicit MODEL_RUNTIME=devFallback override', () => {
    process.env.MODEL_RUNTIME = 'devFallback'
    process.env.ANTHROPIC_API_KEY = 'present'
    expect(getConfiguredRuntimeKind()).toBe('devFallback')
  })

  it('respects an explicit MODEL_RUNTIME=anthropic override', () => {
    process.env.MODEL_RUNTIME = 'anthropic'
    delete process.env.ANTHROPIC_API_KEY
    expect(getConfiguredRuntimeKind()).toBe('anthropic')
  })

  it('auto-selects anthropic when a key is present and nothing is explicitly configured', () => {
    delete process.env.MODEL_RUNTIME
    process.env.ANTHROPIC_API_KEY = 'present'
    expect(getConfiguredRuntimeKind()).toBe('anthropic')
  })

  it('auto-selects devFallback when no key is present and nothing is explicitly configured', () => {
    delete process.env.MODEL_RUNTIME
    delete process.env.ANTHROPIC_API_KEY
    expect(getConfiguredRuntimeKind()).toBe('devFallback')
  })
})

describe('buildRuntime', () => {
  it('builds the correct concrete implementation for each kind', () => {
    expect(buildRuntime('devFallback').kind).toBe('devFallback')
    expect(buildRuntime('anthropic').kind).toBe('anthropic')
  })
})

describe('getActiveRuntimeChecked', () => {
  afterEach(() => { process.env = { ...originalEnv } })

  it('falls back to DevFallbackRuntime when anthropic is configured but no key is present, and reports the fallback honestly', async () => {
    process.env.MODEL_RUNTIME = 'anthropic'
    delete process.env.ANTHROPIC_API_KEY
    const { runtime, usedFallback, detail } = await getActiveRuntimeChecked()
    expect(runtime.kind).toBe('devFallback')
    expect(usedFallback).toBe(true)
    expect(detail).toMatch(/not configured/i)
  })

  it('uses devFallback directly (no fallback flag) when that is what was actually configured', async () => {
    process.env.MODEL_RUNTIME = 'devFallback'
    const { runtime, usedFallback } = await getActiveRuntimeChecked()
    expect(runtime.kind).toBe('devFallback')
    expect(usedFallback).toBe(false)
  })
})
