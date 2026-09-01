import { describe, it, expect } from 'vitest'
import { detectInputLanguage } from '../language/detect'

describe('detectInputLanguage', () => {
  it('detects pure Kiswahili', () => {
    const r = detectInputLanguage('Nataka kununua simu leo, tafadhali nionyeshe bei')
    expect(r.detected).toBe('sw')
    expect(r.isCodeSwitched).toBe(false)
  })

  it('detects pure English', () => {
    const r = detectInputLanguage('I want to buy a phone today, please show me the price')
    expect(r.detected).toBe('en')
    expect(r.isCodeSwitched).toBe(false)
  })

  it('detects mixed Kiswahili/English code-switching', () => {
    const r = detectInputLanguage('Bro kuna phone around 300k?')
    expect(r.isCodeSwitched).toBe(true)
  })

  it('detects the exact spec example "nionyeshe shoes chini ya 100k" as code-switched', () => {
    const r = detectInputLanguage('nionyeshe shoes chini ya 100k')
    expect(r.isCodeSwitched).toBe(true)
  })

  it('does not crash on empty input', () => {
    const r = detectInputLanguage('')
    expect(r.detected).toBe('en')
    expect(r.confidence).toBe(0)
  })

  it('reports low confidence for text with no recognizable signal words (e.g. a bare product name)', () => {
    const r = detectInputLanguage('iPhone 15 Pro Max')
    expect(r.confidence).toBe(0)
  })
})
