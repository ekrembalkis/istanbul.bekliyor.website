import { describe, expect, it } from 'vitest'
import {
  MESSAGE_MAX,
  MESSAGE_MIN,
  NAME_MAX,
  NAME_MIN,
  validateLetter,
  SUBMIT_ERROR_MESSAGES,
} from '../letters'

describe('validateLetter', () => {
  it('accepts a minimal valid letter', () => {
    expect(validateLetter({ message: 'Selam' })).toEqual({})
  })

  it('accepts a letter with author name', () => {
    expect(validateLetter({ message: 'Sözüm var', author_name: 'Ali' })).toEqual({})
  })

  it('rejects message shorter than min', () => {
    const errs = validateLetter({ message: 'a'.repeat(MESSAGE_MIN - 1) })
    expect(errs.message).toBeTruthy()
  })

  it('rejects message longer than max', () => {
    const errs = validateLetter({ message: 'a'.repeat(MESSAGE_MAX + 1) })
    expect(errs.message).toBeTruthy()
  })

  it('treats whitespace-only message as invalid', () => {
    const errs = validateLetter({ message: '   \n  ' })
    expect(errs.message).toBeTruthy()
  })

  it('allows empty author_name (anonymous)', () => {
    expect(validateLetter({ message: 'Selam', author_name: '' })).toEqual({})
  })

  it('rejects author shorter than min when provided', () => {
    const errs = validateLetter({ message: 'Selam', author_name: 'A' })
    expect(errs.author_name).toBeTruthy()
    expect(NAME_MIN).toBe(2)
  })

  it('rejects author longer than max', () => {
    const errs = validateLetter({
      message: 'Selam',
      author_name: 'A'.repeat(NAME_MAX + 1),
    })
    expect(errs.author_name).toBeTruthy()
  })

  it('trims whitespace before measuring', () => {
    expect(validateLetter({ message: '   Selam dünya   ', author_name: '  Ali  ' })).toEqual({})
  })
})

describe('SUBMIT_ERROR_MESSAGES', () => {
  it('has Turkish copy for every server error code', () => {
    const required = [
      'validation', 'message_rejected', 'moderation_unavailable',
      'too_fast', 'rate_limited', 'unknown_detainee',
      'db_unavailable', 'config_missing', 'db_error',
      'origin_not_allowed', 'method_not_allowed',
      'network', 'unknown',
    ]
    for (const k of required) {
      expect(SUBMIT_ERROR_MESSAGES[k]).toBeTruthy()
    }
  })
})
