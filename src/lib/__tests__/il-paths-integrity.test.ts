import { describe, expect, it } from 'vitest'
import pathsRaw from '../../data/tr-il-paths.json'
import { CITIES } from '../../data/cities'

const paths = pathsRaw as unknown as {
  viewbox: [number, number]
  features: Record<string, string>
  meta: { featureCount: number }
}

const VIEWBOX_W = 1000
const VIEWBOX_H = 562

describe('tr-il-paths.json (pre-computed SVG paths)', () => {
  it('declares the expected viewBox', () => {
    expect(paths.viewbox).toEqual([VIEWBOX_W, VIEWBOX_H])
  })

  it('contains exactly one entry per CITIES plate (81)', () => {
    const platedCities = CITIES.filter(c => c.plate != null)
    expect(platedCities).toHaveLength(81)
    expect(Object.keys(paths.features)).toHaveLength(81)
    for (const c of platedCities) {
      expect(paths.features[String(c.plate)]).toBeTruthy()
    }
  })

  it('every d-string starts with M and is non-trivial (>40 chars)', () => {
    for (const [plate, d] of Object.entries(paths.features)) {
      expect(d).toMatch(/^M/)
      expect((d as string).length).toBeGreaterThan(40)
      expect(plate).toMatch(/^\d+$/)
    }
  })

  it('every coord falls within the viewBox bounds', () => {
    // d-strings are pure numeric "M x,y L x,y ..." sequences (geoPath's
    // default output). Extract every number, ensure none lands outside
    // [0, viewBox_dim] — that would be a build-time projection bug.
    const numRe = /-?\d+(?:\.\d+)?/g
    for (const [plate, d] of Object.entries(paths.features)) {
      const nums = (d as string).match(numRe) ?? []
      expect(nums.length).toBeGreaterThan(0)
      for (let i = 0; i < nums.length; i += 2) {
        const x = parseFloat(nums[i])
        const y = parseFloat(nums[i + 1])
        expect(Number.isFinite(x), `plate ${plate} x[${i}]`).toBe(true)
        expect(Number.isFinite(y), `plate ${plate} y[${i}]`).toBe(true)
        // Allow 1px slop for rounding at the bbox edges.
        expect(x).toBeGreaterThanOrEqual(-1)
        expect(x).toBeLessThanOrEqual(VIEWBOX_W + 1)
        expect(y).toBeGreaterThanOrEqual(-1)
        expect(y).toBeLessThanOrEqual(VIEWBOX_H + 1)
      }
    }
  })

  it('İstanbul (plate 34) renders in the upper half of the viewBox (NW corner of Turkey)', () => {
    // Reality check: Turkey's projection should place İstanbul in the
    // northwest. If the build-time projection degenerated, every path
    // would collapse into a sub-pixel cluster and this would fail loudly.
    const d = paths.features['34'] as string
    const numRe = /-?\d+(?:\.\d+)?/g
    const nums = (d.match(numRe) ?? []).map(parseFloat)
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (let i = 0; i < nums.length; i += 2) {
      const x = nums[i]
      const y = nums[i + 1]
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
    // Bbox should span at least 30 viewBox units (else projection collapsed).
    expect(maxX - minX).toBeGreaterThan(30)
    // Bbox center should be in the upper half (y < center_y).
    expect((minY + maxY) / 2).toBeLessThan(VIEWBOX_H / 2)
  })
})
