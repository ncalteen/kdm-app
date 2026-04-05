import { describe, expect, it } from 'vitest'

import { sortQuarries } from '@/lib/settlement/quarries'

describe('sortQuarries', () => {
  it('sorts by node ascending', () => {
    const rows = [
      { node: 'QN3', monster_name: 'Alpha' },
      { node: 'QN1', monster_name: 'Beta' },
      { node: 'QN2', monster_name: 'Gamma' }
    ]

    const result = sortQuarries(rows)

    expect(result.map((r) => r.node)).toEqual(['QN1', 'QN2', 'QN3'])
  })

  it('sorts alphabetically by monster name within the same node', () => {
    const rows = [
      { node: 'QN1', monster_name: 'Zebra' },
      { node: 'QN1', monster_name: 'Alpha' },
      { node: 'QN1', monster_name: 'Mango' }
    ]

    const result = sortQuarries(rows)

    expect(result.map((r) => r.monster_name)).toEqual([
      'Alpha',
      'Mango',
      'Zebra'
    ])
  })

  it('sorts by node first, then monster name second', () => {
    const rows = [
      { node: 'B', monster_name: 'Alpha' },
      { node: 'A', monster_name: 'Zebra' },
      { node: 'A', monster_name: 'Alpha' }
    ]

    const result = sortQuarries(rows)

    expect(result).toEqual([
      { node: 'A', monster_name: 'Alpha' },
      { node: 'A', monster_name: 'Zebra' },
      { node: 'B', monster_name: 'Alpha' }
    ])
  })

  it('preserves extra properties on row objects', () => {
    const rows = [
      { node: 'B', monster_name: 'Alpha', extra: 2 },
      { node: 'A', monster_name: 'Beta', extra: 1 }
    ]

    const result = sortQuarries(rows)

    expect(result[0]).toEqual({ node: 'A', monster_name: 'Beta', extra: 1 })
    expect(result[1]).toEqual({ node: 'B', monster_name: 'Alpha', extra: 2 })
  })

  it('does not mutate the original array', () => {
    const rows = [
      { node: 'B', monster_name: 'Alpha' },
      { node: 'A', monster_name: 'Beta' }
    ]
    const original = [...rows]

    sortQuarries(rows)

    expect(rows).toEqual(original)
  })

  it('returns an empty array when given an empty array', () => {
    expect(sortQuarries([])).toEqual([])
  })
})
