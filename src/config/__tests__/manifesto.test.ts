import { describe, expect, it } from 'vitest'
import { MANIFESTO } from '../manifesto'

describe('MANIFESTO', () => {
  it('has a title and preface', () => {
    expect(MANIFESTO.title.length).toBeGreaterThan(0)
    expect(MANIFESTO.preface.length).toBeGreaterThan(0)
    expect(MANIFESTO.closing.length).toBeGreaterThan(0)
  })

  it('has exactly 5 articles', () => {
    expect(MANIFESTO.articles.length).toBe(5)
  })

  it('every article has id, numeral, headline, and body', () => {
    for (const a of MANIFESTO.articles) {
      expect(typeof a.id).toBe('number')
      expect(a.numeral.length).toBeGreaterThan(0)
      expect(a.headline.length).toBeGreaterThan(0)
      expect(a.body.length).toBeGreaterThan(20)  // body is supposed to be a paragraph
    }
  })

  it('article ids are 1..5 in order', () => {
    expect(MANIFESTO.articles.map(a => a.id)).toEqual([1, 2, 3, 4, 5])
  })

  it('uses Roman numerals I..V', () => {
    expect(MANIFESTO.articles.map(a => a.numeral)).toEqual(['I', 'II', 'III', 'IV', 'V'])
  })

  it('Madde I includes the original landing-page quote', () => {
    expect(MANIFESTO.articles[0].body).toContain('herkes için savunulduğunda')
  })
})
