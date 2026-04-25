import { describe, expect, it } from 'vitest'
import {
  ALL_FORMATS,
  ALL_TEMPLATES,
  FORMAT_DIMENSIONS,
  FORMAT_LABELS,
  TEMPLATE_DESCRIPTIONS,
  TEMPLATE_LABELS,
  isCardFormat,
  isCardTemplate,
} from '../templates'

describe('FORMAT_DIMENSIONS', () => {
  it('matches the well-known social media specs', () => {
    expect(FORMAT_DIMENSIONS['1x1']).toEqual({ w: 1080, h: 1080 })
    expect(FORMAT_DIMENSIONS['16x9']).toEqual({ w: 1200, h: 675 })
    expect(FORMAT_DIMENSIONS['9x16']).toEqual({ w: 1080, h: 1920 })
    expect(FORMAT_DIMENSIONS['header']).toEqual({ w: 1500, h: 500 })
  })

  it('every format has positive width and height', () => {
    for (const f of ALL_FORMATS) {
      const { w, h } = FORMAT_DIMENSIONS[f]
      expect(w).toBeGreaterThan(0)
      expect(h).toBeGreaterThan(0)
    }
  })
})

describe('label maps', () => {
  it('FORMAT_LABELS covers every format', () => {
    for (const f of ALL_FORMATS) {
      expect(FORMAT_LABELS[f]).toBeTruthy()
    }
  })

  it('TEMPLATE_LABELS and TEMPLATE_DESCRIPTIONS cover every template', () => {
    for (const t of ALL_TEMPLATES) {
      expect(TEMPLATE_LABELS[t]).toBeTruthy()
      expect(TEMPLATE_DESCRIPTIONS[t]).toBeTruthy()
    }
  })

  it('uses uppercase Turkish editorial-mono labels', () => {
    for (const t of ALL_TEMPLATES) {
      expect(TEMPLATE_LABELS[t]).toBe(TEMPLATE_LABELS[t].toUpperCase())
    }
  })
})

describe('type guards', () => {
  it('isCardTemplate accepts all templates and rejects others', () => {
    for (const t of ALL_TEMPLATES) expect(isCardTemplate(t)).toBe(true)
    expect(isCardTemplate('garbage')).toBe(false)
    expect(isCardTemplate(null)).toBe(false)
    expect(isCardTemplate(undefined)).toBe(false)
    expect(isCardTemplate(42)).toBe(false)
  })

  it('isCardFormat accepts all formats and rejects others', () => {
    for (const f of ALL_FORMATS) expect(isCardFormat(f)).toBe(true)
    expect(isCardFormat('4x3')).toBe(false)
    expect(isCardFormat('')).toBe(false)
    expect(isCardFormat(null)).toBe(false)
  })
})
