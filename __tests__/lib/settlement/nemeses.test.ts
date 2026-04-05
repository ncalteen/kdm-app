import { describe, expect, it } from 'vitest'

import { sortNemeses } from '@/lib/settlement/nemeses'

describe('sortNemeses', () => {
  it('sorts by defined node order (NN1 < NN2 < NN3 < CO < FI)', () => {
    const rows = [
      { node: 'FI', monster_name: 'Alpha' },
      { node: 'NN1', monster_name: 'Beta' },
      { node: 'CO', monster_name: 'Gamma' },
      { node: 'NN3', monster_name: 'Delta' },
      { node: 'NN2', monster_name: 'Epsilon' }
    ]

    const result = sortNemeses(rows)

    expect(result.map((r) => r.node)).toEqual(['NN1', 'NN2', 'NN3', 'CO', 'FI'])
  })

  it('sorts alphabetically by monster name within the same node', () => {
    const rows = [
      { node: 'NN1', monster_name: 'Zebra' },
      { node: 'NN1', monster_name: 'Alpha' },
      { node: 'NN1', monster_name: 'Mango' }
    ]

    const result = sortNemeses(rows)

    expect(result.map((r) => r.monster_name)).toEqual([
      'Alpha',
      'Mango',
      'Zebra'
    ])
  })

  it('places unknown nodes after all known nodes', () => {
    const rows = [
      { node: 'UNKNOWN', monster_name: 'Stranger' },
      { node: 'FI', monster_name: 'Alpha' },
      { node: 'NN1', monster_name: 'Beta' }
    ]

    const result = sortNemeses(rows)

    expect(result.map((r) => r.node)).toEqual(['NN1', 'FI', 'UNKNOWN'])
  })

  it('sorts multiple unknown nodes alphabetically by monster name', () => {
    const rows = [
      { node: 'UNKNOWN', monster_name: 'Zap' },
      { node: 'UNKNOWN', monster_name: 'Ant' }
    ]

    const result = sortNemeses(rows)

    expect(result.map((r) => r.monster_name)).toEqual(['Ant', 'Zap'])
  })

  it('preserves extra properties on row objects', () => {
    const rows = [
      { node: 'NN2', monster_name: 'B', extra: 2 },
      { node: 'NN1', monster_name: 'A', extra: 1 }
    ]

    const result = sortNemeses(rows)

    expect(result[0]).toEqual({ node: 'NN1', monster_name: 'A', extra: 1 })
    expect(result[1]).toEqual({ node: 'NN2', monster_name: 'B', extra: 2 })
  })

  it('does not mutate the original array', () => {
    const rows = [
      { node: 'FI', monster_name: 'A' },
      { node: 'NN1', monster_name: 'B' }
    ]
    const original = [...rows]

    sortNemeses(rows)

    expect(rows).toEqual(original)
  })

  it('returns an empty array when given an empty array', () => {
    expect(sortNemeses([])).toEqual([])
  })
})
