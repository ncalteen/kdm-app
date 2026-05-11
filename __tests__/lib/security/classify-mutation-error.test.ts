import { isAuthorizationError } from '@/lib/security/classify-mutation-error'
import { describe, expect, it } from 'vitest'

describe('isAuthorizationError', () => {
  describe('non-authorization shapes', () => {
    it('returns false for null', () => {
      expect(isAuthorizationError(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(isAuthorizationError(undefined)).toBe(false)
    })

    it('returns false for primitives', () => {
      expect(isAuthorizationError('boom')).toBe(false)
      expect(isAuthorizationError(42)).toBe(false)
      expect(isAuthorizationError(true)).toBe(false)
    })

    it('returns false for objects without code or message', () => {
      expect(isAuthorizationError({})).toBe(false)
      expect(isAuthorizationError({ details: 'irrelevant' })).toBe(false)
    })

    it('returns false for unrelated postgres codes', () => {
      expect(isAuthorizationError({ code: '23505' })).toBe(false)
      expect(isAuthorizationError({ code: '23503' })).toBe(false)
      expect(isAuthorizationError({ code: '22P02' })).toBe(false)
    })

    it('returns false for unrelated postgrest codes', () => {
      expect(isAuthorizationError({ code: 'PGRST301' })).toBe(false)
      expect(isAuthorizationError({ code: 'PGRST100' })).toBe(false)
    })

    it('returns false for generic error messages', () => {
      expect(isAuthorizationError({ message: 'network failure' })).toBe(false)
      expect(
        isAuthorizationError({ message: 'duplicate key value violates' })
      ).toBe(false)
    })

    it('returns false when code is not a string', () => {
      expect(isAuthorizationError({ code: 42501 })).toBe(false)
    })
  })

  describe('authorization error codes', () => {
    it('matches postgres insufficient_privilege (42501)', () => {
      expect(isAuthorizationError({ code: '42501' })).toBe(true)
    })

    it('matches postgres feature_not_supported (0A000) from the [E1.3] trigger', () => {
      expect(isAuthorizationError({ code: '0A000' })).toBe(true)
    })

    it('matches postgrest PGRST116 (no rows returned)', () => {
      expect(isAuthorizationError({ code: 'PGRST116' })).toBe(true)
    })

    it('matches postgrest PGRST204 (no content)', () => {
      expect(isAuthorizationError({ code: 'PGRST204' })).toBe(true)
    })

    it('matches when code is present alongside an unrelated message', () => {
      expect(
        isAuthorizationError({
          code: '42501',
          message: 'something completely different'
        })
      ).toBe(true)
    })
  })

  describe('authorization message patterns', () => {
    it('matches the [E1.3] trigger function name', () => {
      expect(
        isAuthorizationError({
          message:
            'error in function enforce_settlement_owner_only_columns at line 12'
        })
      ).toBe(true)
    })

    it("matches the trigger's bespoke owner-only message", () => {
      expect(
        isAuthorizationError({
          message:
            'Only the settlement owner can change settlement_name, campaign_type, survivor_type, uses_scouts, or user_id'
        })
      ).toBe(true)
    })

    it('matches the canonical postgres RLS rejection text', () => {
      expect(
        isAuthorizationError({
          message:
            'new row violates row-level security policy for table "settlement"'
        })
      ).toBe(true)
    })

    it('matches postgres permission denied messages', () => {
      expect(
        isAuthorizationError({
          message: 'permission denied for table settlement'
        })
      ).toBe(true)
    })

    it('matches case-insensitively', () => {
      expect(
        isAuthorizationError({ message: 'ROW-LEVEL SECURITY violated' })
      ).toBe(true)
    })
  })
})
