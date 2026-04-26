import { describe, expect, it } from 'vitest'
import {
  EVENT_TYPE_LABELS,
  VALID_EVENT_TYPES,
  isValidEvent,
  filterEventsStream,
  type DetaineeEvent,
  type DetaineeEventType,
} from '../detainees'
import { countRecentEvents } from '../../pages/EventStreamPage'

const ALL_TYPES: DetaineeEventType[] = [
  'arrest', 'detention', 'indictment', 'hearing', 'ruling',
  'release', 'statement', 'transfer', 'other',
  'protest', 'legal', 'press', 'milestone',
]

function ev(
  partial: Partial<DetaineeEvent> & { id: string; event_type: DetaineeEventType },
): DetaineeEvent {
  return {
    detainee_id: null,
    event_date: '2026-04-01',
    title: `evt-${partial.id}`,
    description: null,
    source_url: null,
    source_label: null,
    display_order: 0,
    ...partial,
  }
}

describe('EVENT_TYPE_LABELS — extended (post-general-events migration)', () => {
  it('covers all 13 types from the migration CHECK constraint', () => {
    expect(ALL_TYPES.length).toBe(13)
    for (const type of ALL_TYPES) {
      expect(EVENT_TYPE_LABELS[type]).toBeTruthy()
    }
  })

  it('uses uppercase Turkish labels for the 4 new general types', () => {
    expect(EVENT_TYPE_LABELS.protest).toBe('EYLEM')
    expect(EVENT_TYPE_LABELS.legal).toBe('HUKUKİ ADIM')
    expect(EVENT_TYPE_LABELS.press).toBe('BASIN')
    expect(EVENT_TYPE_LABELS.milestone).toBe('DÖNÜM NOKTASI')
  })

  it('preserves the original 9 person-bound type labels (regression guard)', () => {
    expect(EVENT_TYPE_LABELS.arrest).toBe('GÖZALTI')
    expect(EVENT_TYPE_LABELS.detention).toBe('TUTUKLAMA')
    expect(EVENT_TYPE_LABELS.indictment).toBe('İDDİANAME')
    expect(EVENT_TYPE_LABELS.hearing).toBe('DURUŞMA')
    expect(EVENT_TYPE_LABELS.ruling).toBe('KARAR')
    expect(EVENT_TYPE_LABELS.release).toBe('TAHLİYE')
    expect(EVENT_TYPE_LABELS.statement).toBe('AÇIKLAMA')
    expect(EVENT_TYPE_LABELS.transfer).toBe('NAKİL')
    expect(EVENT_TYPE_LABELS.other).toBe('DİĞER')
  })

  it('every label is uppercase (matches editorial-mono styling)', () => {
    for (const label of Object.values(EVENT_TYPE_LABELS)) {
      expect(label).toBe(label.toLocaleUpperCase('tr-TR'))
    }
  })
})

describe('VALID_EVENT_TYPES set', () => {
  it('contains all 13 types', () => {
    expect(VALID_EVENT_TYPES.size).toBe(13)
    for (const type of ALL_TYPES) {
      expect(VALID_EVENT_TYPES.has(type)).toBe(true)
    }
  })

  it('rejects unknown types', () => {
    expect(VALID_EVENT_TYPES.has('not-a-type' as DetaineeEventType)).toBe(false)
  })
})

describe('isValidEvent (extended)', () => {
  const baseRow = {
    id: 'e1',
    detainee_id: null,
    event_date: '2026-04-01',
    event_type: 'protest',
    title: 'Saraçhane',
    description: null,
    source_url: null,
    source_label: null,
    display_order: 0,
  }

  it('accepts general event with detainee_id null + new type', () => {
    expect(isValidEvent(baseRow)).toBe(true)
  })

  it('accepts a person-bound event with each of the 4 new types', () => {
    for (const t of ['protest', 'legal', 'press', 'milestone'] as DetaineeEventType[]) {
      expect(isValidEvent({ ...baseRow, detainee_id: 'd1', event_type: t })).toBe(true)
    }
  })

  it('rejects events with bogus event_type', () => {
    expect(isValidEvent({ ...baseRow, event_type: 'nope' })).toBe(false)
  })

  it('rejects malformed date', () => {
    expect(isValidEvent({ ...baseRow, event_date: 'yesterday' })).toBe(false)
  })

  it('rejects when title is missing', () => {
    expect(isValidEvent({ ...baseRow, title: 123 })).toBe(false)
  })
})

describe('filterEventsStream', () => {
  const events: DetaineeEvent[] = [
    ev({ id: '1', event_type: 'arrest', detainee_id: 'd-imam' }),
    ev({ id: '2', event_type: 'protest', detainee_id: null }),
    ev({ id: '3', event_type: 'milestone', detainee_id: null }),
    ev({ id: '4', event_type: 'hearing', detainee_id: 'd-imam' }),
    ev({ id: '5', event_type: 'press', detainee_id: 'd-other' }),
  ]

  it('returns all events for empty filter', () => {
    expect(filterEventsStream(events, {})).toHaveLength(5)
  })

  it('filters by single type', () => {
    expect(filterEventsStream(events, { types: ['protest'] }).map(e => e.id)).toEqual(['2'])
  })

  it('filters by multiple types', () => {
    expect(
      filterEventsStream(events, { types: ['protest', 'milestone'] }).map(e => e.id),
    ).toEqual(['2', '3'])
  })

  it('detaineeId="general" returns only events with null detainee_id', () => {
    expect(filterEventsStream(events, { detaineeId: 'general' }).map(e => e.id)).toEqual([
      '2',
      '3',
    ])
  })

  it('detaineeId=<id> returns only that person', () => {
    expect(filterEventsStream(events, { detaineeId: 'd-imam' }).map(e => e.id)).toEqual([
      '1',
      '4',
    ])
  })

  it('combines type + detaineeId filters', () => {
    expect(
      filterEventsStream(events, { types: ['hearing'], detaineeId: 'd-imam' }).map(e => e.id),
    ).toEqual(['4'])
  })

  it('returns empty when type list is empty (no constraint)', () => {
    expect(filterEventsStream(events, { types: [] })).toHaveLength(5)
  })

  it('does not mutate input', () => {
    const original = [...events]
    filterEventsStream(events, { types: ['arrest'], detaineeId: 'general' })
    expect(events).toEqual(original)
  })
})

describe('countRecentEvents', () => {
  const now = new Date('2026-04-26T12:00:00+03:00')

  it('counts events within the window', () => {
    const events = [
      { event_date: '2026-04-25' }, // 1 day ago
      { event_date: '2026-04-22' }, // 4 days ago
      { event_date: '2026-04-15' }, // 11 days ago — out
      { event_date: '2025-03-19' }, // way out
    ]
    expect(countRecentEvents(events, 7, now)).toBe(2)
  })

  it('returns 0 for empty list', () => {
    expect(countRecentEvents([], 7, now)).toBe(0)
  })

  it('ignores malformed dates without throwing', () => {
    const events = [
      { event_date: '2026-04-25' },
      { event_date: 'invalid-date' },
    ]
    expect(countRecentEvents(events, 7, now)).toBe(1)
  })
})
