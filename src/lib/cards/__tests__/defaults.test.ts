import { describe, expect, it } from 'vitest'
import { DEFAULT_MESSAGES, getDailyDefaultMessage } from '../defaults'

describe('DEFAULT_MESSAGES', () => {
  it('has at least 4 mottos', () => {
    expect(DEFAULT_MESSAGES.length).toBeGreaterThanOrEqual(4)
  })

  it('has no empty entries', () => {
    for (const m of DEFAULT_MESSAGES) {
      expect(m.length).toBeGreaterThan(0)
    }
  })
})

describe('getDailyDefaultMessage', () => {
  it('returns a real motto for day 1', () => {
    expect(DEFAULT_MESSAGES).toContain(getDailyDefaultMessage(1))
  })

  it('rotates through the pool with day modulo length', () => {
    const len = DEFAULT_MESSAGES.length
    expect(getDailyDefaultMessage(1)).toBe(getDailyDefaultMessage(1 + len))
    expect(getDailyDefaultMessage(2)).toBe(getDailyDefaultMessage(2 + len))
  })

  it('falls back to first motto for invalid day', () => {
    expect(getDailyDefaultMessage(0)).toBe(DEFAULT_MESSAGES[0])
    expect(getDailyDefaultMessage(-5)).toBe(DEFAULT_MESSAGES[0])
    expect(getDailyDefaultMessage(NaN)).toBe(DEFAULT_MESSAGES[0])
    expect(getDailyDefaultMessage(Infinity)).toBe(DEFAULT_MESSAGES[0])
  })

  it('produces different messages for adjacent days', () => {
    const a = getDailyDefaultMessage(1)
    const b = getDailyDefaultMessage(2)
    expect(a).not.toBe(b)
  })
})
