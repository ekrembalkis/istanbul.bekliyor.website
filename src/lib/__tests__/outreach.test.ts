import { describe, expect, it } from 'vitest'
import {
  buildXIntentUrl,
  composeLongMessage,
  composeShortMessage,
  TBMM_CONTACT_URL,
} from '../outreach'
import { SITE } from '../../config/site'

const VARS = { city: 'İstanbul', seats: 98, day: 403 }

describe('composeShortMessage', () => {
  it('substitutes {city}, {seats}, {day} placeholders', () => {
    const out = composeShortMessage('adalet', VARS)
    expect(out).toContain('İstanbul')
    expect(out).toContain('98')
    expect(out).toContain('403')
    expect(out).not.toContain('{city}')
    expect(out).not.toContain('{seats}')
    expect(out).not.toContain('{day}')
  })

  it('stays within the X 280-character limit even with long city names', () => {
    const long = composeShortMessage('adalet', { ...VARS, city: 'A'.repeat(40), seats: 999, day: 9999 })
    expect(long.length).toBeLessThanOrEqual(280)
  })

  it('produces different output for different templates', () => {
    const a = composeShortMessage('adalet', VARS)
    const b = composeShortMessage('irade', VARS)
    expect(a).not.toBe(b)
  })
})

describe('composeLongMessage', () => {
  it('substitutes placeholders and stays under 1000 chars', () => {
    const out = composeLongMessage('vicdan', VARS)
    expect(out).toContain('İstanbul')
    expect(out).toContain('98')
    expect(out.length).toBeLessThanOrEqual(1000)
  })

  it('is meaningfully longer than the short version', () => {
    const s = composeShortMessage('adalet', VARS)
    const l = composeLongMessage('adalet', VARS)
    expect(l.length).toBeGreaterThan(s.length)
    expect(l.length).toBeGreaterThan(400)
  })
})

describe('buildXIntentUrl', () => {
  it('uses configured X intent base', () => {
    expect(buildXIntentUrl('hello').startsWith(SITE.xIntentBase)).toBe(true)
  })

  it('preserves Turkish characters through encoding', () => {
    const url = buildXIntentUrl('Şanlıurfa')
    const decoded = decodeURIComponent(url.split('?text=')[1])
    expect(decoded).toBe('Şanlıurfa')
  })
})

describe('TBMM_CONTACT_URL', () => {
  it('mirrors the SITE config (no separate hardcode)', () => {
    expect(TBMM_CONTACT_URL).toBe(SITE.tbmmContactUrl)
    expect(TBMM_CONTACT_URL.startsWith('https://')).toBe(true)
  })
})
