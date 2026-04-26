import { describe, expect, it } from 'vitest'
import topology from '../../data/tr-iller.topo.json'
import { feature } from 'topojson-client'
import type { Topology } from 'topojson-specification'
import { CITIES } from '../../data/cities'

const topo = topology as unknown as Topology

describe('tr-iller.topo.json integrity', () => {
  it('has the expected topology shape', () => {
    expect(topo.type).toBe('Topology')
    expect(topo.objects).toBeDefined()
    expect(topo.objects.iller).toBeDefined()
  })

  it('contains exactly 81 features after extraction', () => {
    const fc = feature(topo, topo.objects.iller) as unknown as {
      type: string
      features: unknown[]
    }
    expect(fc.features).toHaveLength(81)
  })

  it('every feature has plate (1..81), name, slug', () => {
    type Props = { plate: number; name: string; slug: string }
    const fc = feature(topo, topo.objects.iller) as unknown as {
      features: { properties: Props }[]
    }
    const seenPlates = new Set<number>()
    for (const f of fc.features) {
      const p = f.properties
      expect(typeof p.plate).toBe('number')
      expect(p.plate).toBeGreaterThanOrEqual(1)
      expect(p.plate).toBeLessThanOrEqual(81)
      expect(typeof p.name).toBe('string')
      expect(p.name.length).toBeGreaterThan(0)
      expect(typeof p.slug).toBe('string')
      expect(p.slug.length).toBeGreaterThan(0)
      seenPlates.add(p.plate)
    }
    expect(seenPlates.size).toBe(81)
  })

  it('every plate in topojson maps back to CITIES roster', () => {
    type Props = { plate: number; slug: string }
    const fc = feature(topo, topo.objects.iller) as unknown as {
      features: { properties: Props }[]
    }
    const cityPlates = new Set(CITIES.filter(c => c.plate != null).map(c => c.plate))
    for (const f of fc.features) {
      expect(cityPlates.has(f.properties.plate)).toBe(true)
    }
  })

  it('topojson stays under the 50KB on-disk budget', () => {
    const size = JSON.stringify(topo).length
    // 50KB raw text ≈ ~15-20KB gz; budget set to keep it editorially sized.
    expect(size).toBeLessThanOrEqual(50_000)
  })
})
