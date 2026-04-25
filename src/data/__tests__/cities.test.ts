import { describe, expect, it } from 'vitest'
import {
  ALL_CITY_OPTIONS,
  CITIES,
  SPECIAL_CITY_OPTIONS,
  findCityByName,
  findCityBySlug,
} from '../cities'

describe('CITIES', () => {
  it('contains exactly 81 Turkish provinces', () => {
    expect(CITIES.length).toBe(81)
  })

  it('contains 2 special options (Yurtdışı + Belirtilmedi)', () => {
    expect(SPECIAL_CITY_OPTIONS.length).toBe(2)
    expect(ALL_CITY_OPTIONS.length).toBe(83)
  })

  it('every entry has a non-empty slug, name, and region', () => {
    for (const c of ALL_CITY_OPTIONS) {
      expect(c.slug.length).toBeGreaterThan(0)
      expect(c.name.length).toBeGreaterThan(0)
      expect(c.region.length).toBeGreaterThan(0)
    }
  })

  it('slugs are unique', () => {
    const seen = new Set<string>()
    for (const c of ALL_CITY_OPTIONS) {
      expect(seen.has(c.slug)).toBe(false)
      seen.add(c.slug)
    }
  })

  it('names are unique', () => {
    const seen = new Set<string>()
    for (const c of ALL_CITY_OPTIONS) {
      expect(seen.has(c.name)).toBe(false)
      seen.add(c.name)
    }
  })

  it('slugs are ASCII-only (no Turkish diacritics)', () => {
    for (const c of CITIES) {
      expect(c.slug).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('includes İstanbul, Ankara, İzmir as expected anchors', () => {
    const slugs = new Set(CITIES.map(c => c.slug))
    expect(slugs.has('istanbul')).toBe(true)
    expect(slugs.has('ankara')).toBe(true)
    expect(slugs.has('izmir')).toBe(true)
  })

  it('uses one of seven valid geographic regions for actual cities', () => {
    const valid = new Set([
      'Marmara', 'Ege', 'Akdeniz', 'İç Anadolu',
      'Karadeniz', 'Doğu Anadolu', 'Güneydoğu Anadolu',
    ])
    for (const c of CITIES) {
      expect(valid.has(c.region)).toBe(true)
    }
  })
})

describe('findCityBySlug', () => {
  it('returns the city for a known slug', () => {
    const c = findCityBySlug('istanbul')
    expect(c?.name).toBe('İstanbul')
  })

  it('returns null for an unknown slug', () => {
    expect(findCityBySlug('atlantis')).toBeNull()
  })
})

describe('findCityByName', () => {
  it('finds city case- and space-insensitively', () => {
    expect(findCityByName('İSTANBUL')?.slug).toBe('istanbul')
    expect(findCityByName('  ankara  ')?.slug).toBe('ankara')
  })

  it('returns null for unknown name', () => {
    expect(findCityByName('Narnia')).toBeNull()
  })
})
