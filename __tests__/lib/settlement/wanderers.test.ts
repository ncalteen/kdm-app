import { describe, expect, it } from 'vitest'

import { sortWanderers } from '@/lib/settlement/wanderers'
import { WandererDetail } from '@/lib/types'

/**
 * Build a minimal WandererDetail fixture for testing sortWanderers.
 */
function makeWanderer(name: string): WandererDetail {
  return { wanderer_name: name } as unknown as WandererDetail
}

describe('sortWanderers', () => {
  it('sorts wanderers alphabetically by wanderer_name', () => {
    const input: { [key: string]: WandererDetail } = {
      c: makeWanderer('Zebra'),
      a: makeWanderer('Alpha'),
      b: makeWanderer('Mango')
    }

    const result = sortWanderers(input)

    expect(Object.values(result).map((w) => w.wanderer_name)).toEqual([
      'Alpha',
      'Mango',
      'Zebra'
    ])
  })

  it('returns an empty object when given an empty object', () => {
    expect(sortWanderers({})).toEqual({})
  })

  it('preserves keys associated with each wanderer', () => {
    const input: { [key: string]: WandererDetail } = {
      second: makeWanderer('Beta'),
      first: makeWanderer('Alpha')
    }

    const result = sortWanderers(input)
    const entries = Object.entries(result)

    expect(entries[0]).toEqual(['first', makeWanderer('Alpha')])
    expect(entries[1]).toEqual(['second', makeWanderer('Beta')])
  })

  it('handles a single wanderer', () => {
    const input: { [key: string]: WandererDetail } = {
      only: makeWanderer('Solo')
    }

    const result = sortWanderers(input)

    expect(Object.values(result).map((w) => w.wanderer_name)).toEqual(['Solo'])
  })

  it('handles wanderers with the same name (stable relative order)', () => {
    const input: { [key: string]: WandererDetail } = {
      x: makeWanderer('Same'),
      y: makeWanderer('Same')
    }

    const result = sortWanderers(input)

    expect(Object.values(result).map((w) => w.wanderer_name)).toEqual([
      'Same',
      'Same'
    ])
  })
})
