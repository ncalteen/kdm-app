import { describe, expect, it } from 'vitest'

import {
  calculateSuspicionLevels,
  calculateTotalSuspicion
} from '@/lib/settlement/squires'
import { SurvivorDetail } from '@/lib/types'

/**
 * Build a minimal SurvivorDetail with only the fields required by the squires
 * utilities. All other required fields are omitted via a cast to keep the
 * test fixtures concise.
 */
function makeSurvivor(
  overrides: Partial<
    Pick<
      SurvivorDetail,
      | 'squire_suspicion_level_1'
      | 'squire_suspicion_level_2'
      | 'squire_suspicion_level_3'
      | 'squire_suspicion_level_4'
    >
  > = {}
): SurvivorDetail {
  return {
    squire_suspicion_level_1: false,
    squire_suspicion_level_2: false,
    squire_suspicion_level_3: false,
    squire_suspicion_level_4: false,
    ...overrides
  } as unknown as SurvivorDetail
}

// ---------------------------------------------------------------------------
// calculateTotalSuspicion
// ---------------------------------------------------------------------------

describe('calculateTotalSuspicion', () => {
  it('returns 0 when no survivors have suspicion levels checked', () => {
    const survivors = [makeSurvivor(), makeSurvivor()]
    expect(calculateTotalSuspicion(survivors)).toBe(0)
  })

  it('returns 0 for an empty array', () => {
    expect(calculateTotalSuspicion([])).toBe(0)
  })

  it('counts each checked level as 1 per survivor', () => {
    const survivors = [
      makeSurvivor({ squire_suspicion_level_1: true }),
      makeSurvivor({
        squire_suspicion_level_1: true,
        squire_suspicion_level_2: true
      })
    ]
    expect(calculateTotalSuspicion(survivors)).toBe(3)
  })

  it('sums all four levels across multiple survivors', () => {
    const survivors = [
      makeSurvivor({
        squire_suspicion_level_1: true,
        squire_suspicion_level_2: true,
        squire_suspicion_level_3: true,
        squire_suspicion_level_4: true
      }),
      makeSurvivor({
        squire_suspicion_level_1: true,
        squire_suspicion_level_2: true,
        squire_suspicion_level_3: true,
        squire_suspicion_level_4: true
      })
    ]
    expect(calculateTotalSuspicion(survivors)).toBe(8)
  })
})

// ---------------------------------------------------------------------------
// calculateSuspicionLevels
// ---------------------------------------------------------------------------

describe('calculateSuspicionLevels', () => {
  describe('when checking a level', () => {
    it('checking level 1 only sets level 1', () => {
      const survivor = makeSurvivor()
      const result = calculateSuspicionLevels(survivor, 1, true)
      expect(result).toEqual({
        squire_suspicion_level_1: true,
        squire_suspicion_level_2: false,
        squire_suspicion_level_3: false,
        squire_suspicion_level_4: false
      })
    })

    it('checking level 2 also sets level 1', () => {
      const survivor = makeSurvivor()
      const result = calculateSuspicionLevels(survivor, 2, true)
      expect(result).toEqual({
        squire_suspicion_level_1: true,
        squire_suspicion_level_2: true,
        squire_suspicion_level_3: false,
        squire_suspicion_level_4: false
      })
    })

    it('checking level 3 also sets levels 1 and 2', () => {
      const survivor = makeSurvivor()
      const result = calculateSuspicionLevels(survivor, 3, true)
      expect(result).toEqual({
        squire_suspicion_level_1: true,
        squire_suspicion_level_2: true,
        squire_suspicion_level_3: true,
        squire_suspicion_level_4: false
      })
    })

    it('checking level 4 also sets levels 1, 2, and 3', () => {
      const survivor = makeSurvivor()
      const result = calculateSuspicionLevels(survivor, 4, true)
      expect(result).toEqual({
        squire_suspicion_level_1: true,
        squire_suspicion_level_2: true,
        squire_suspicion_level_3: true,
        squire_suspicion_level_4: true
      })
    })
  })

  describe('when unchecking a level', () => {
    it('unchecking level 4 only clears level 4', () => {
      const survivor = makeSurvivor({
        squire_suspicion_level_1: true,
        squire_suspicion_level_2: true,
        squire_suspicion_level_3: true,
        squire_suspicion_level_4: true
      })
      const result = calculateSuspicionLevels(survivor, 4, false)
      expect(result).toEqual({
        squire_suspicion_level_1: true,
        squire_suspicion_level_2: true,
        squire_suspicion_level_3: true,
        squire_suspicion_level_4: false
      })
    })

    it('unchecking level 3 also clears levels 4 and 3', () => {
      const survivor = makeSurvivor({
        squire_suspicion_level_1: true,
        squire_suspicion_level_2: true,
        squire_suspicion_level_3: true,
        squire_suspicion_level_4: true
      })
      const result = calculateSuspicionLevels(survivor, 3, false)
      expect(result).toEqual({
        squire_suspicion_level_1: true,
        squire_suspicion_level_2: true,
        squire_suspicion_level_3: false,
        squire_suspicion_level_4: false
      })
    })

    it('unchecking level 2 also clears levels 3 and 4', () => {
      const survivor = makeSurvivor({
        squire_suspicion_level_1: true,
        squire_suspicion_level_2: true,
        squire_suspicion_level_3: true,
        squire_suspicion_level_4: true
      })
      const result = calculateSuspicionLevels(survivor, 2, false)
      expect(result).toEqual({
        squire_suspicion_level_1: true,
        squire_suspicion_level_2: false,
        squire_suspicion_level_3: false,
        squire_suspicion_level_4: false
      })
    })

    it('unchecking level 1 also clears levels 2, 3, and 4', () => {
      const survivor = makeSurvivor({
        squire_suspicion_level_1: true,
        squire_suspicion_level_2: true,
        squire_suspicion_level_3: true,
        squire_suspicion_level_4: true
      })
      const result = calculateSuspicionLevels(survivor, 1, false)
      expect(result).toEqual({
        squire_suspicion_level_1: false,
        squire_suspicion_level_2: false,
        squire_suspicion_level_3: false,
        squire_suspicion_level_4: false
      })
    })
  })
})
