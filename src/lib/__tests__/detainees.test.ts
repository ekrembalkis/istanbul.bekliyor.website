import { describe, expect, it } from 'vitest'
import {
  EVENT_TYPE_LABELS,
  type DetaineeEventType,
} from '../detainees'

describe('EVENT_TYPE_LABELS', () => {
  it('covers every event_type value from the migration CHECK constraint', () => {
    // Migration 20260426000000_detainee_profile.sql allows exactly these values.
    const allowed: DetaineeEventType[] = [
      'arrest', 'detention', 'indictment', 'hearing', 'ruling',
      'release', 'statement', 'transfer', 'other',
    ]
    for (const type of allowed) {
      expect(EVENT_TYPE_LABELS[type]).toBeTruthy()
    }
  })

  it('uses uppercase Turkish labels (matches editorial-mono styling)', () => {
    for (const label of Object.values(EVENT_TYPE_LABELS)) {
      expect(label).toBe(label.toUpperCase())
    }
  })

  it('has no empty labels', () => {
    for (const label of Object.values(EVENT_TYPE_LABELS)) {
      expect(label.length).toBeGreaterThan(0)
    }
  })
})
