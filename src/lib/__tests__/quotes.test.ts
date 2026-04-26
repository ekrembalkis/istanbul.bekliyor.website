import { describe, expect, it } from 'vitest'
import { getDailyQuote, getQuoteForOffset } from '../quotes'
import { QUOTES, QUOTE_KIND_LABELS } from '../../data/quotes'
import { composeShareText } from '../../components/quote/QuoteCard'

describe('QUOTES dataset', () => {
  it('has at least 15 entries', () => {
    expect(QUOTES.length).toBeGreaterThanOrEqual(15)
  })

  it('every quote has unique id', () => {
    const ids = new Set(QUOTES.map(q => q.id))
    expect(ids.size).toBe(QUOTES.length)
  })

  it('every quote has non-empty text, author, source', () => {
    for (const q of QUOTES) {
      expect(q.text.length).toBeGreaterThan(0)
      expect(q.author.length).toBeGreaterThan(0)
      expect(q.source.length).toBeGreaterThan(0)
    }
  })

  it('every kind has a Turkish uppercase label', () => {
    const seenKinds = new Set(QUOTES.map(q => q.kind))
    for (const k of seenKinds) {
      expect(QUOTE_KIND_LABELS[k]).toBeTruthy()
      expect(QUOTE_KIND_LABELS[k]).toBe(QUOTE_KIND_LABELS[k].toLocaleUpperCase('tr-TR'))
    }
  })

  it('quote text fits within reasonable length (≤500 chars) for share UX', () => {
    for (const q of QUOTES) {
      expect(q.text.length).toBeLessThanOrEqual(500)
    }
  })
})

describe('getDailyQuote', () => {
  it('returns a quote from the dataset', () => {
    const q = getDailyQuote(1)
    expect(QUOTES).toContainEqual(q)
  })

  it('is deterministic — same day → same quote', () => {
    expect(getDailyQuote(42).id).toBe(getDailyQuote(42).id)
    expect(getDailyQuote(100).id).toBe(getDailyQuote(100).id)
  })

  it('falls back to first quote for invalid day', () => {
    expect(getDailyQuote(0)).toBe(QUOTES[0])
    expect(getDailyQuote(-5)).toBe(QUOTES[0])
    expect(getDailyQuote(NaN)).toBe(QUOTES[0])
  })

  it('rotates across the dataset (covers most quotes within len*3 days)', () => {
    const seen = new Set<string>()
    for (let d = 1; d <= QUOTES.length * 3; d++) {
      seen.add(getDailyQuote(d).id)
    }
    // With a hash-mix rotation we expect ≥80% coverage in 3× span — collisions
    // are fine, but a stuck-on-one-quote regression must fail.
    expect(seen.size).toBeGreaterThanOrEqual(Math.floor(QUOTES.length * 0.8))
  })

  it('two consecutive days return different quotes (no sequential pattern)', () => {
    let differing = 0
    for (let d = 1; d < 50; d++) {
      if (getDailyQuote(d).id !== getDailyQuote(d + 1).id) differing++
    }
    // hash mix should give >95% differing — strict guard against modulo-only
    // regression where day N and N+1 happen to be same only with wrap-around.
    expect(differing).toBeGreaterThanOrEqual(45)
  })
})

describe('getQuoteForOffset', () => {
  it('offset 0 returns same as base day', () => {
    expect(getQuoteForOffset(0, 100).id).toBe(getDailyQuote(100).id)
  })

  it('offset +1 returns same as base+1', () => {
    expect(getQuoteForOffset(1, 100).id).toBe(getDailyQuote(101).id)
  })
})

describe('composeShareText', () => {
  const sample = QUOTES[0]

  it('includes day, author, hashtag', () => {
    const text = composeShareText(sample, 404)
    expect(text).toContain('GÜN 404')
    expect(text).toContain(sample.author)
    expect(text).toContain('#İstanbulBekliyor')
  })

  it('truncates long quotes with ellipsis to keep share text under tweet budget', () => {
    const longQuote = {
      ...sample,
      text: 'a'.repeat(500),
    }
    const text = composeShareText(longQuote, 1)
    expect(text.length).toBeLessThanOrEqual(280)
    expect(text).toContain('…')
  })

  it('does not truncate short quotes', () => {
    const shortQuote = { ...sample, text: 'Adalet, herkes için adalet olduğunda adalettir.' }
    const text = composeShareText(shortQuote, 1)
    expect(text).not.toContain('…')
    expect(text).toContain(shortQuote.text)
  })
})
