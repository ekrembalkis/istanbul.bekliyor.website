import { describe, expect, it } from 'vitest'
import {
  aggregateByProvince,
  barRatio,
  colorForCount,
  CHOROPLETH_RAMP,
} from '../provinces'
import type { Detainee } from '../detainees'
import { CITIES } from '../../data/cities'

function d(partial: Partial<Detainee> & { id: string }): Detainee {
  return {
    slug: partial.id,
    name: `Person ${partial.id}`,
    title: null,
    arrest_date: '2025-03-19',
    release_date: null,
    photo_url: null,
    is_featured: false,
    display_order: 0,
    notes: null,
    bio_md: null,
    province_plate: null,
    day_count: 0,
    ...partial,
  }
}

describe('aggregateByProvince', () => {
  it('returns a row for every one of the 81 provinces (zeros included)', () => {
    const agg = aggregateByProvince([])
    expect(agg.ranked).toHaveLength(81)
    expect(agg.byPlate.size).toBe(81)
    for (let p = 1; p <= 81; p++) {
      expect(agg.byPlate.has(p)).toBe(true)
    }
  })

  it('counts detainees per province plate', () => {
    const agg = aggregateByProvince([
      d({ id: 'a', province_plate: 34 }),
      d({ id: 'b', province_plate: 34 }),
      d({ id: 'c', province_plate: 6 }),
      d({ id: 'd', province_plate: null }),
    ])
    expect(agg.byPlate.get(34)?.count).toBe(2)
    expect(agg.byPlate.get(6)?.count).toBe(1)
    expect(agg.byPlate.get(35)?.count).toBe(0)
    expect(agg.totalAssigned).toBe(3)
    expect(agg.totalUnassigned).toBe(1)
    expect(agg.provincesCovered).toBe(2)
  })

  it('ranks by count DESC then by Turkish-collated name', () => {
    const agg = aggregateByProvince([
      d({ id: '1', province_plate: 1 }), // Adana
      d({ id: '2', province_plate: 6 }), // Ankara
      d({ id: '3', province_plate: 6 }), // Ankara
    ])
    expect(agg.ranked[0].city.plate).toBe(6) // 2 events
    expect(agg.ranked[1].city.plate).toBe(1) // 1 event
    // Zero-count rows after, alphabetic
    const zerosFirst = agg.ranked.slice(2, 4).map(r => r.city.name)
    // Adıyaman comes before Afyonkarahisar in tr collation
    expect(zerosFirst).toEqual(['Adıyaman', 'Afyonkarahisar'])
  })

  it('treats out-of-range plate as unassigned (defensive)', () => {
    const agg = aggregateByProvince([
      d({ id: 'x', province_plate: 99 as number }),
    ])
    expect(agg.totalAssigned).toBe(0)
    expect(agg.totalUnassigned).toBe(1)
  })

  it('preserves detainees in original order within a province', () => {
    const agg = aggregateByProvince([
      d({ id: 'b', province_plate: 34 }),
      d({ id: 'a', province_plate: 34 }),
      d({ id: 'c', province_plate: 34 }),
    ])
    expect(agg.byPlate.get(34)?.detainees.map(x => x.slug)).toEqual(['b', 'a', 'c'])
  })

  it('every CITIES entry with a plate is represented', () => {
    const agg = aggregateByProvince([])
    const platedSlugs = CITIES.filter(c => c.plate != null).map(c => c.slug)
    const aggSlugs = agg.ranked.map(r => r.city.slug)
    expect(new Set(aggSlugs)).toEqual(new Set(platedSlugs))
  })
})

describe('barRatio', () => {
  it('returns 0 for zero count', () => {
    expect(barRatio(0, 5)).toBe(0)
  })

  it('returns 0 when max is zero', () => {
    expect(barRatio(2, 0)).toBe(0)
  })

  it('returns 1 for the max value', () => {
    expect(barRatio(5, 5)).toBe(1)
  })

  it('intermediate counts produce ratios in (0, 1)', () => {
    const r = barRatio(2, 5)
    expect(r).toBeGreaterThan(0)
    expect(r).toBeLessThan(1)
  })

  it('logarithmic scaling lifts small values relative to a single big outlier', () => {
    // With log1p scaling, 1/5 should give a higher ratio than the linear 0.2.
    expect(barRatio(1, 5)).toBeGreaterThan(0.2)
  })

  it('handles max=1 cleanly (avoids log1p(1) division surprises)', () => {
    expect(barRatio(1, 1)).toBe(1)
    expect(barRatio(0, 1)).toBe(0)
  })
})

describe('colorForCount', () => {
  it('returns the "no data" krem swatch for zero', () => {
    expect(colorForCount(0, 5)).toBe(CHOROPLETH_RAMP[0])
    expect(colorForCount(0, 0)).toBe(CHOROPLETH_RAMP[0])
  })

  it('returns the brand red max swatch for the max value', () => {
    expect(colorForCount(50, 50)).toBe(CHOROPLETH_RAMP[4])
  })

  it('lifts a single observation off the krem floor (log1p)', () => {
    // count=1 with max=50 → ratio ≈ log1p(1)/log1p(50) ≈ 0.18 → bin 1.
    expect(colorForCount(1, 50)).toBe(CHOROPLETH_RAMP[1])
  })

  it('uses all 5 bins across a realistic distribution', () => {
    const max = 50
    const seen = new Set<string>()
    for (const c of [0, 1, 5, 15, 50]) {
      seen.add(colorForCount(c, max))
    }
    expect(seen.size).toBe(5)
  })

  it('CHOROPLETH_RAMP is a 5-color palette', () => {
    expect(CHOROPLETH_RAMP).toHaveLength(5)
    for (const swatch of CHOROPLETH_RAMP) {
      expect(swatch).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })
})
