import { describe, expect, it } from 'vitest'
import {
  CITY_MAX,
  MESSAGE_MAX,
  NAME_MAX,
  NAME_MIN,
  validateSignature,
  SUBMIT_ERROR_MESSAGES,
} from '../manifesto'

describe('validateSignature', () => {
  const valid = { name: 'Ali Yılmaz', city: 'İstanbul', message: 'Adalet için.' }

  it('accepts a well-formed signature', () => {
    expect(validateSignature(valid)).toEqual({})
  })

  it('rejects empty name', () => {
    const errs = validateSignature({ ...valid, name: '' })
    expect(errs.name).toBeTruthy()
  })

  it('rejects name shorter than minimum', () => {
    const errs = validateSignature({ ...valid, name: 'A' })
    expect(errs.name).toBeTruthy()
    expect(NAME_MIN).toBe(2)
  })

  it('rejects name longer than max', () => {
    const errs = validateSignature({ ...valid, name: 'A'.repeat(NAME_MAX + 1) })
    expect(errs.name).toBeTruthy()
  })

  it('trims whitespace before measuring length', () => {
    const errs = validateSignature({ ...valid, name: '  Ali  ' })
    expect(errs.name).toBeUndefined()
  })

  it('requires non-empty city', () => {
    const errs = validateSignature({ ...valid, city: '' })
    expect(errs.city).toBeTruthy()
  })

  it('rejects city above max length', () => {
    const errs = validateSignature({ ...valid, city: 'X'.repeat(CITY_MAX + 1) })
    expect(errs.city).toBeTruthy()
  })

  it('allows missing message', () => {
    const errs = validateSignature({ name: 'Ali', city: 'Ankara' })
    expect(errs.message).toBeUndefined()
  })

  it('rejects message longer than max', () => {
    const errs = validateSignature({ ...valid, message: 'a'.repeat(MESSAGE_MAX + 1) })
    expect(errs.message).toBeTruthy()
  })

  it('treats whitespace-only message as empty', () => {
    const errs = validateSignature({ ...valid, message: '   \n  ' })
    expect(errs.message).toBeUndefined()
  })
})

describe('SUBMIT_ERROR_MESSAGES', () => {
  it('has Turkish copy for every server error code', () => {
    const required = [
      'validation', 'message_rejected', 'already_signed_today',
      'rate_limited', 'db_unavailable', 'config_missing', 'db_error',
      'network', 'unknown',
    ]
    for (const k of required) {
      expect(SUBMIT_ERROR_MESSAGES[k]).toBeTruthy()
    }
  })
})
