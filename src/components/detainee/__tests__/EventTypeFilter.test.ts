import { describe, expect, it } from 'vitest'
import { filterEvents } from '../EventTypeFilter'
import type { DetaineeEvent, DetaineeEventType } from '../../../lib/detainees'

function ev(id: string, type: DetaineeEventType, date = '2025-04-01'): DetaineeEvent {
  return {
    id,
    detainee_id: 'd1',
    event_date: date,
    event_type: type,
    title: `${type}-${id}`,
    description: null,
    source_url: null,
    source_label: null,
    display_order: 0,
  }
}

describe('filterEvents', () => {
  const events: DetaineeEvent[] = [
    ev('1', 'arrest'),
    ev('2', 'hearing'),
    ev('3', 'hearing'),
    ev('4', 'ruling'),
  ]

  it('returns all events when filter is "all"', () => {
    expect(filterEvents(events, 'all')).toHaveLength(4)
  })

  it('returns only matching event_type', () => {
    expect(filterEvents(events, 'hearing').map(e => e.id)).toEqual(['2', '3'])
  })

  it('returns empty array when no events match', () => {
    expect(filterEvents(events, 'release')).toEqual([])
  })

  it('preserves input order', () => {
    const out = filterEvents(events, 'all')
    expect(out.map(e => e.id)).toEqual(['1', '2', '3', '4'])
  })

  it('returns same reference semantics (no mutation)', () => {
    const original = [...events]
    filterEvents(events, 'arrest')
    expect(events).toEqual(original)
  })
})
