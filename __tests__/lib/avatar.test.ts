import {
  INITIALS_PALETTE,
  getInitialsFromName,
  pickInitialsColor
} from '@/lib/avatar'
import { describe, expect, it } from 'vitest'

describe('getInitialsFromName', () => {
  it('returns ? for null', () => {
    expect(getInitialsFromName(null)).toBe('?')
  })

  it('returns ? for undefined', () => {
    expect(getInitialsFromName(undefined)).toBe('?')
  })

  it('returns ? for empty string', () => {
    expect(getInitialsFromName('')).toBe('?')
  })

  it('returns ? for whitespace-only string', () => {
    expect(getInitialsFromName('   ')).toBe('?')
  })

  it('takes leading characters of the first two tokens', () => {
    expect(getInitialsFromName('Jane Doe')).toBe('JD')
    expect(getInitialsFromName('jane doe smith')).toBe('JD')
  })

  it('uppercases the result', () => {
    expect(getInitialsFromName('alice bob')).toBe('AB')
  })

  it('falls back to first 2 chars for single-token names', () => {
    expect(getInitialsFromName('ncalteen')).toBe('NC')
    expect(getInitialsFromName('JD')).toBe('JD')
  })

  it('returns a single uppercase char for single-character names', () => {
    expect(getInitialsFromName('x')).toBe('X')
  })

  it('handles extra interior whitespace', () => {
    expect(getInitialsFromName('  jane    doe  ')).toBe('JD')
  })
})

describe('pickInitialsColor', () => {
  it('returns the first palette entry for null/undefined', () => {
    expect(pickInitialsColor(null)).toBe(INITIALS_PALETTE[0])
    expect(pickInitialsColor(undefined)).toBe(INITIALS_PALETTE[0])
    expect(pickInitialsColor('')).toBe(INITIALS_PALETTE[0])
  })

  it('always returns a palette entry', () => {
    for (const key of [
      'a',
      '00000000-0000-0000-0000-000000000001',
      '11111111-1111-1111-1111-111111111111',
      'jane',
      'doe',
      'survivor_42'
    ])
      expect(INITIALS_PALETTE).toContain(pickInitialsColor(key))
  })

  it('is deterministic for the same key', () => {
    const key = '00000000-0000-0000-0000-000000000001'
    expect(pickInitialsColor(key)).toBe(pickInitialsColor(key))
    expect(pickInitialsColor('jane_doe')).toBe(pickInitialsColor('jane_doe'))
  })

  it('distributes different keys across the palette', () => {
    // Probabilistic but deterministic: with 50 distinct keys and a 10-entry
    // palette we expect to hit at least 4 distinct buckets.
    const buckets = new Set<string>()
    for (let i = 0; i < 50; i++)
      buckets.add(pickInitialsColor(`user-${i}-test-key`))

    expect(buckets.size).toBeGreaterThanOrEqual(4)
  })
})
