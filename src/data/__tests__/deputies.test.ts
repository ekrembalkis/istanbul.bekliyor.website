import { describe, expect, it } from 'vitest'
import {
  DISTRIBUTION_2023,
  seatsForCity,
  seatsForCityName,
  seatsForPlate,
} from '../deputies'

describe('DISTRIBUTION_2023', () => {
  it('targets 600 total seats across 81 provinces', () => {
    expect(DISTRIBUTION_2023.totalSeats).toBe(600)
    expect(Object.keys(DISTRIBUTION_2023.seats).length).toBe(81)
  })

  it('seats sum to exactly 600', () => {
    const sum = Object.values(DISTRIBUTION_2023.seats).reduce((a, b) => a + b, 0)
    expect(sum).toBe(600)
  })

  it('every province has at least 1 seat (Kanun 2839 minimum)', () => {
    for (const seats of Object.values(DISTRIBUTION_2023.seats)) {
      expect(seats).toBeGreaterThanOrEqual(1)
    }
  })

  it('plaka kodları 1..81 cover the full range with no gaps', () => {
    for (let plate = 1; plate <= 81; plate++) {
      expect(DISTRIBUTION_2023.seats[plate]).toBeDefined()
    }
  })

  it('matches well-known anchor values from YSK 2023/224', () => {
    expect(DISTRIBUTION_2023.seats[34]).toBe(98)  // İstanbul
    expect(DISTRIBUTION_2023.seats[6]).toBe(36)   // Ankara
    expect(DISTRIBUTION_2023.seats[35]).toBe(28)  // İzmir
    expect(DISTRIBUTION_2023.seats[16]).toBe(20)  // Bursa
    expect(DISTRIBUTION_2023.seats[7]).toBe(17)   // Antalya
    expect(DISTRIBUTION_2023.seats[62]).toBe(1)   // Tunceli
    expect(DISTRIBUTION_2023.seats[69]).toBe(1)   // Bayburt
  })
})

describe('seatsForPlate', () => {
  it('returns the seat count for a known plate', () => {
    expect(seatsForPlate(34)).toBe(98)  // İstanbul
  })

  it('returns null for an unknown plate', () => {
    expect(seatsForPlate(99)).toBeNull()
    expect(seatsForPlate(0)).toBeNull()
  })
})

describe('seatsForCity (slug)', () => {
  it('cross-references slug → plate → seats', () => {
    expect(seatsForCity('istanbul')).toBe(98)
    expect(seatsForCity('ankara')).toBe(36)
    expect(seatsForCity('izmir')).toBe(28)
  })

  it('returns null for special non-province options', () => {
    expect(seatsForCity('yurtdisi')).toBeNull()
    expect(seatsForCity('belirtilmedi')).toBeNull()
  })

  it('returns null for unknown slug', () => {
    expect(seatsForCity('atlantis')).toBeNull()
  })
})

describe('seatsForCityName', () => {
  it('matches the display name', () => {
    expect(seatsForCityName('İstanbul')).toBe(98)
    expect(seatsForCityName('  Ankara  ')).toBe(36)
  })

  it('returns null for non-existent name', () => {
    expect(seatsForCityName('Narnia')).toBeNull()
  })
})
