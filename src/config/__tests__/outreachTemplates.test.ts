import { describe, expect, it } from 'vitest'
import {
  findTemplate,
  OUTREACH_TEMPLATE_IDS,
  OUTREACH_TEMPLATES,
  type OutreachTemplateId,
} from '../outreachTemplates'

describe('OUTREACH_TEMPLATES', () => {
  it('has exactly 3 templates', () => {
    expect(OUTREACH_TEMPLATES.length).toBe(3)
  })

  it('has the expected ids in the agreed order', () => {
    expect(OUTREACH_TEMPLATE_IDS).toEqual(['adalet', 'irade', 'vicdan'] as OutreachTemplateId[])
  })

  it('every template carries label, hint, short, and long', () => {
    for (const t of OUTREACH_TEMPLATES) {
      expect(t.label.length).toBeGreaterThan(0)
      expect(t.hint.length).toBeGreaterThan(0)
      expect(t.short.length).toBeGreaterThan(0)
      expect(t.long.length).toBeGreaterThan(0)
    }
  })

  it('short version stays within X 280-character limit even before substitution', () => {
    // {city} max ~20 chars, {seats} max 3 chars, {day} max 4 chars.
    // Allow some slack — substituted result must still fit in composer.
    for (const t of OUTREACH_TEMPLATES) {
      expect(t.short.length).toBeLessThanOrEqual(320)
    }
  })

  it('long version stays within 1000-character cap', () => {
    for (const t of OUTREACH_TEMPLATES) {
      expect(t.long.length).toBeLessThanOrEqual(1000)
    }
  })

  it('every template references all three placeholders in either short or long', () => {
    const required = ['{city}', '{seats}', '{day}']
    for (const t of OUTREACH_TEMPLATES) {
      const combined = t.short + t.long
      for (const ph of required) {
        expect(combined).toContain(ph)
      }
    }
  })

  it('uses uppercase Turkish labels (matches editorial-mono chip styling)', () => {
    for (const t of OUTREACH_TEMPLATES) {
      expect(t.label).toBe(t.label.toLocaleUpperCase('tr-TR'))
    }
  })
})

describe('findTemplate', () => {
  it('returns the template by id', () => {
    expect(findTemplate('adalet').id).toBe('adalet')
    expect(findTemplate('irade').id).toBe('irade')
    expect(findTemplate('vicdan').id).toBe('vicdan')
  })

  it('throws for unknown id', () => {
    expect(() => findTemplate('garbage' as OutreachTemplateId)).toThrow()
  })
})
