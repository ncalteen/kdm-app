import { LOCAL_STORAGE_KEY } from '@/lib/common'
import { ColorChoice, MonsterNode, MonsterType } from '@/lib/enums'
import { SettlementDetail } from '@/lib/types'
import {
  calculateSettlementCollectiveCognition,
  canDash,
  canEncourage,
  canEndure,
  canFistPump,
  canSurge,
  cn,
  formatJoinedTimeAgo,
  getAvailableNodes,
  getCardColorStyles,
  getCatalogDeleteGuardMessage,
  getColorStyle,
  getOverwhelmingDarknessLabel,
  saveToLocalStorage,
  survivorsBornWithUnderstanding
} from '@/lib/utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Helper to build a minimal innovation list
function makeInnovations(names: string[]) {
  return names.map((name) => ({ innovation_name: name })) as Parameters<
    typeof canEncourage
  >[0]
}

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('merges tailwind classes (last wins)', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
  })
})

describe('canEncourage', () => {
  it('returns true when Language innovation is present', () => {
    expect(canEncourage(makeInnovations(['Language']))).toBe(true)
  })

  it('returns false when Language innovation is absent', () => {
    expect(canEncourage(makeInnovations(['Paint']))).toBe(false)
  })

  it('returns false for empty innovations', () => {
    expect(canEncourage([])).toBe(false)
  })
})

describe('canSurge', () => {
  it('returns true when Inner Lantern innovation is present', () => {
    expect(canSurge(makeInnovations(['Inner Lantern']))).toBe(true)
  })

  it('returns false when Inner Lantern innovation is absent', () => {
    expect(canSurge(makeInnovations(['Language']))).toBe(false)
  })

  it('returns false for empty innovations', () => {
    expect(canSurge([])).toBe(false)
  })
})

describe('canDash', () => {
  it('returns true when Paint innovation is present', () => {
    expect(canDash(makeInnovations(['Paint']))).toBe(true)
  })

  it('returns false when Paint innovation is absent', () => {
    expect(canDash(makeInnovations(['Language']))).toBe(false)
  })

  it('returns false for empty innovations', () => {
    expect(canDash([])).toBe(false)
  })
})

describe('canFistPump', () => {
  it('returns true when Silent Dialect innovation is present', () => {
    expect(canFistPump(makeInnovations(['Silent Dialect']))).toBe(true)
  })

  it('returns false when Silent Dialect innovation is absent', () => {
    expect(canFistPump(makeInnovations(['Language']))).toBe(false)
  })

  it('returns false for empty innovations', () => {
    expect(canFistPump([])).toBe(false)
  })
})

describe('canEndure', () => {
  it('returns true when Destiny innovation is present', () => {
    expect(canEndure(makeInnovations(['Destiny']))).toBe(true)
  })

  it('returns false when Destiny innovation is absent', () => {
    expect(canEndure(makeInnovations(['Language']))).toBe(false)
  })

  it('returns false for empty innovations', () => {
    expect(canEndure([])).toBe(false)
  })
})

describe('survivorsBornWithUnderstanding', () => {
  it('returns true when Graves innovation is present', () => {
    expect(survivorsBornWithUnderstanding(makeInnovations(['Graves']))).toBe(
      true
    )
  })

  it('returns false when Graves innovation is absent', () => {
    expect(survivorsBornWithUnderstanding(makeInnovations(['Language']))).toBe(
      false
    )
  })

  it('returns false for empty innovations', () => {
    expect(survivorsBornWithUnderstanding([])).toBe(false)
  })
})

describe('getColorStyle', () => {
  it('returns the bg style by default', () => {
    expect(getColorStyle(ColorChoice.RED)).toBe('bg-red-500')
    expect(getColorStyle(ColorChoice.BLUE)).toBe('bg-blue-500')
    expect(getColorStyle(ColorChoice.GREEN)).toBe('bg-green-500')
  })

  it('returns the correct border style', () => {
    expect(getColorStyle(ColorChoice.RED, 'border')).toBe('border-red-300/50')
    expect(getColorStyle(ColorChoice.BLUE, 'border')).toBe('border-blue-300/50')
  })

  it('returns the correct border-hover style', () => {
    expect(getColorStyle(ColorChoice.RED, 'border-hover')).toBe(
      'border-red-400/70'
    )
  })

  it('returns the correct header style', () => {
    expect(getColorStyle(ColorChoice.RED, 'header')).toBe(
      'bg-red-100/30 border-red-300/40'
    )
  })

  it('falls back to slate when color is unknown', () => {
    expect(getColorStyle('unknown' as ColorChoice)).toBe('bg-slate-500')
  })

  it('returns styles for all ColorChoice values', () => {
    for (const color of Object.values(ColorChoice)) {
      expect(getColorStyle(color)).toMatch(/^bg-/)
    }
  })
})

describe('getCardColorStyles', () => {
  it('returns CSS properties with correct variables', () => {
    const styles = getCardColorStyles(ColorChoice.RED)

    expect(styles).toHaveProperty('--card-border-color')
    expect(styles).toHaveProperty('--card-border-hover-color')
    expect(styles).toHaveProperty('--card-header-bg')
  })

  it('returns different values for different colors', () => {
    const redStyles = getCardColorStyles(ColorChoice.RED)
    const blueStyles = getCardColorStyles(ColorChoice.BLUE)

    // @ts-expect-error - we know these properties exist
    expect(redStyles['--card-border-color']).not.toBe(
      // @ts-expect-error - we know these properties exist
      blueStyles['--card-border-color']
    )
  })

  it('falls back to slate for unknown colors', () => {
    const unknownStyles = getCardColorStyles('unknown' as ColorChoice)
    const slateStyles = getCardColorStyles(ColorChoice.SLATE)

    // @ts-expect-error - we know these properties exist
    expect(unknownStyles['--card-border-color']).toBe(
      // @ts-expect-error - we know these properties exist
      slateStyles['--card-border-color']
    )
  })

  it('returns styles for all ColorChoice values', () => {
    for (const color of Object.values(ColorChoice)) {
      const styles = getCardColorStyles(color)
      expect(styles).toHaveProperty('--card-border-color')
    }
  })
})

describe('getOverwhelmingDarknessLabel', () => {
  it('returns special label for Flower Knight', () => {
    expect(getOverwhelmingDarknessLabel('Flower Knight')).toBe(
      'The Forest Wants What it Wants'
    )
  })

  it('is case-insensitive for Flower Knight', () => {
    expect(getOverwhelmingDarknessLabel('flower knight')).toBe(
      'The Forest Wants What it Wants'
    )
    expect(getOverwhelmingDarknessLabel('FLOWER KNIGHT')).toBe(
      'The Forest Wants What it Wants'
    )
  })

  it('returns default label for other monsters', () => {
    expect(getOverwhelmingDarknessLabel('White Lion')).toBe(
      'Overwhelming Darkness'
    )
    expect(getOverwhelmingDarknessLabel('Phoenix')).toBe(
      'Overwhelming Darkness'
    )
  })

  it('returns default label for undefined', () => {
    expect(getOverwhelmingDarknessLabel(undefined)).toBe(
      'Overwhelming Darkness'
    )
  })

  it('returns default label for empty string', () => {
    expect(getOverwhelmingDarknessLabel('')).toBe('Overwhelming Darkness')
  })
})

describe('getAvailableNodes', () => {
  it('returns nemesis nodes for NEMESIS type', () => {
    const nodes = getAvailableNodes(MonsterType.NEMESIS)
    expect(nodes).toContain(MonsterNode.NN1)
    expect(nodes).toContain(MonsterNode.NN2)
    expect(nodes).toContain(MonsterNode.NN3)
    expect(nodes).toContain(MonsterNode.CO)
    expect(nodes).toContain(MonsterNode.FI)
    expect(nodes).not.toContain(MonsterNode.NQ1)
  })

  it('returns quarry nodes for QUARRY type', () => {
    const nodes = getAvailableNodes(MonsterType.QUARRY)
    expect(nodes).toContain(MonsterNode.NQ1)
    expect(nodes).toContain(MonsterNode.NQ2)
    expect(nodes).toContain(MonsterNode.NQ3)
    expect(nodes).toContain(MonsterNode.NQ4)
    expect(nodes).not.toContain(MonsterNode.NN1)
  })

  it('returns no nodes for ENCOUNTER type', () => {
    expect(getAvailableNodes(MonsterType.ENCOUNTER)).toEqual([])
  })
})

describe('saveToLocalStorage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'localStorage',
      (() => {
        const store: Record<string, string> = {}
        return {
          setItem: vi.fn((key: string, value: string) => {
            store[key] = value
          }),
          getItem: vi.fn((key: string) => store[key] ?? null),
          removeItem: vi.fn((key: string) => {
            delete store[key]
          }),
          clear: vi.fn(() => {
            for (const key in store) delete store[key]
          })
        }
      })()
    )
  })

  it('saves data to localStorage', () => {
    const data = { foo: 'bar', count: 42 }
    saveToLocalStorage(data)

    expect(localStorage.setItem).toHaveBeenCalledWith(
      LOCAL_STORAGE_KEY,
      JSON.stringify(data)
    )
  })

  it('saves null to localStorage', () => {
    saveToLocalStorage(null)

    expect(localStorage.setItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEY, 'null')
  })
})

describe('calculateSettlementCollectiveCognition', () => {
  it('returns 0 when settlement is null', () => {
    expect(calculateSettlementCollectiveCognition(null)).toBe(0)
  })

  it('returns 0 when settlement has no nemeses or quarries', () => {
    const s = {
      nemeses: [],
      quarries: []
    } as unknown as SettlementDetail
    expect(calculateSettlementCollectiveCognition(s)).toBe(0)
  })

  it('handles missing nemeses/quarries arrays', () => {
    const s = {} as unknown as SettlementDetail
    expect(calculateSettlementCollectiveCognition(s)).toBe(0)
  })

  it('sums nemesis CC levels (3 each)', () => {
    const s = {
      nemeses: [
        {
          collective_cognition_level_1: true,
          collective_cognition_level_2: true,
          collective_cognition_level_3: false
        },
        {
          collective_cognition_level_1: false,
          collective_cognition_level_2: true,
          collective_cognition_level_3: true
        }
      ],
      quarries: []
    } as unknown as SettlementDetail

    // 3 + 3 + 3 + 3 = 12
    expect(calculateSettlementCollectiveCognition(s)).toBe(12)
  })

  it('sums quarry CC fields with proper weights', () => {
    const s = {
      nemeses: [],
      quarries: [
        {
          collective_cognition_prologue: true, // +1
          collective_cognition_level_1: true, // +1
          collective_cognition_level_2: [true, false, true], // +2 +2 = 4
          collective_cognition_level_3: [true, true] // +3 +3 = 6
        }
      ]
    } as unknown as SettlementDetail

    expect(calculateSettlementCollectiveCognition(s)).toBe(12)
  })

  it('combines nemesis and quarry totals', () => {
    const s = {
      nemeses: [
        {
          collective_cognition_level_1: true,
          collective_cognition_level_2: false,
          collective_cognition_level_3: false
        }
      ],
      quarries: [
        {
          collective_cognition_prologue: true,
          collective_cognition_level_1: false,
          collective_cognition_level_2: [],
          collective_cognition_level_3: []
        }
      ]
    } as unknown as SettlementDetail

    expect(calculateSettlementCollectiveCognition(s)).toBe(4)
  })
})

describe('formatJoinedTimeAgo', () => {
  const NOW = new Date('2026-05-10T12:00:00.000Z').getTime()

  it('returns "just now" for sub-second deltas', () => {
    expect(formatJoinedTimeAgo('2026-05-10T12:00:00.000Z', NOW)).toBe(
      'just now'
    )
  })

  it('returns "just now" at 1 second', () => {
    expect(formatJoinedTimeAgo('2026-05-10T11:59:59.000Z', NOW)).toBe(
      'just now'
    )
  })

  it('pluralizes seconds correctly', () => {
    expect(formatJoinedTimeAgo('2026-05-10T11:59:55.000Z', NOW)).toBe(
      '5 seconds ago'
    )
  })

  it('singularizes 1 minute', () => {
    expect(formatJoinedTimeAgo('2026-05-10T11:59:00.000Z', NOW)).toBe(
      '1 minute ago'
    )
  })

  it('pluralizes minutes', () => {
    expect(formatJoinedTimeAgo('2026-05-10T11:55:00.000Z', NOW)).toBe(
      '5 minutes ago'
    )
  })

  it('singularizes 1 hour', () => {
    expect(formatJoinedTimeAgo('2026-05-10T11:00:00.000Z', NOW)).toBe(
      '1 hour ago'
    )
  })

  it('pluralizes hours', () => {
    expect(formatJoinedTimeAgo('2026-05-10T09:00:00.000Z', NOW)).toBe(
      '3 hours ago'
    )
  })

  it('singularizes 1 day', () => {
    expect(formatJoinedTimeAgo('2026-05-09T12:00:00.000Z', NOW)).toBe(
      '1 day ago'
    )
  })

  it('pluralizes days', () => {
    expect(formatJoinedTimeAgo('2026-04-26T12:00:00.000Z', NOW)).toBe(
      '14 days ago'
    )
  })

  it('rolls over into months', () => {
    // 31 days back ⇒ 1 month
    expect(formatJoinedTimeAgo('2026-04-09T12:00:00.000Z', NOW)).toBe(
      '1 month ago'
    )
  })

  it('rolls over into years', () => {
    // ~365 days back ⇒ 1 year (12 months bucket)
    expect(formatJoinedTimeAgo('2025-05-10T12:00:00.000Z', NOW)).toBe(
      '1 year ago'
    )
  })

  it('falls back to "recently" for invalid timestamps', () => {
    expect(formatJoinedTimeAgo('not-a-date', NOW)).toBe('recently')
  })

  it('clamps future timestamps to "just now" instead of producing negative values', () => {
    expect(formatJoinedTimeAgo('2026-05-10T12:01:00.000Z', NOW)).toBe(
      'just now'
    )
  })
})

describe('getCatalogDeleteGuardMessage', () => {
  it('extracts the friendly message from a wrapped DAL error', () => {
    const err = new Error(
      'Error Removing Disorder: You cannot unmake what others rely upon (1 settlement(s): PotL 1)'
    )
    expect(getCatalogDeleteGuardMessage(err)).toBe(
      'You cannot unmake what others rely upon (1 settlement(s): PotL 1)'
    )
  })

  it('extracts the message with multiple blocking settlement names', () => {
    const err = new Error(
      'Error Removing Knowledge: You cannot unmake what others rely upon (4 settlement(s): Alpha, Beta, Delta)'
    )
    expect(getCatalogDeleteGuardMessage(err)).toBe(
      'You cannot unmake what others rely upon (4 settlement(s): Alpha, Beta, Delta)'
    )
  })

  it('returns null when the error is unrelated to the catalog delete guard', () => {
    const err = new Error('Error Removing Disorder: network timeout')
    expect(getCatalogDeleteGuardMessage(err)).toBeNull()
  })

  it('returns null for non-Error values', () => {
    expect(getCatalogDeleteGuardMessage(null)).toBeNull()
    expect(getCatalogDeleteGuardMessage(undefined)).toBeNull()
    expect(getCatalogDeleteGuardMessage('string')).toBeNull()
    expect(getCatalogDeleteGuardMessage({ message: 'boom' })).toBeNull()
  })
})
