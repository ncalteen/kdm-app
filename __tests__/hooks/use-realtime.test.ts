import { describe, expect, it } from 'vitest'

import {
  shouldRefreshCatalogForLinkedContentChange,
  TABLE_DOMAIN_MAP
} from '@/hooks/use-realtime'

describe('TABLE_DOMAIN_MAP realtime settlement scoping', () => {
  const ACTIVE_SETTLEMENT_ID = 'active-settlement'
  const UNRELATED_SETTLEMENT_ID = 'unrelated-settlement'

  const DENORMALIZED_JUNCTION_TABLES = [
    'survivor_ability_impairment',
    'survivor_cursed_gear',
    'survivor_disorder',
    'survivor_fighting_art',
    'survivor_secret_fighting_art',
    'gear_grid',
    'hunt_monster_mood',
    'hunt_monster_survivor_status',
    'hunt_monster_trait',
    'showdown_monster_mood',
    'showdown_monster_survivor_status',
    'showdown_monster_trait'
  ] as const

  it.each(DENORMALIZED_JUNCTION_TABLES)(
    'filters %s by the active settlement_id',
    (table) => {
      const entry = TABLE_DOMAIN_MAP[table]
      const filter = `${entry.filterColumn}=eq.${ACTIVE_SETTLEMENT_ID}`

      expect(entry.filterColumn).toBe('settlement_id')
      expect(filter).toBe(`settlement_id=eq.${ACTIVE_SETTLEMENT_ID}`)
      expect(filter).not.toBe(`settlement_id=eq.${UNRELATED_SETTLEMENT_ID}`)
    }
  )
})

describe('shouldRefreshCatalogForLinkedContentChange', () => {
  it('refreshes catalog data when a survivor neurosis link appears', () => {
    expect(
      shouldRefreshCatalogForLinkedContentChange('survivor', {
        eventType: 'UPDATE',
        new: { id: 'survivor-1', neurosis_id: 'neurosis-1' },
        old: { id: 'survivor-1' }
      })
    ).toBe(true)
  })

  it('refreshes catalog data when a survivor direct catalog link changes', () => {
    const snapshots = new Map<string, Record<string, unknown>>()

    expect(
      shouldRefreshCatalogForLinkedContentChange(
        'survivor',
        {
          eventType: 'UPDATE',
          new: { id: 'survivor-1', neurosis_id: 'neurosis-1' },
          old: { id: 'survivor-1' }
        },
        snapshots
      )
    ).toBe(true)

    expect(
      shouldRefreshCatalogForLinkedContentChange(
        'survivor',
        {
          eventType: 'UPDATE',
          new: { id: 'survivor-1', neurosis_id: 'neurosis-1' },
          old: { id: 'survivor-1' }
        },
        snapshots
      )
    ).toBe(false)

    expect(
      shouldRefreshCatalogForLinkedContentChange(
        'survivor',
        {
          eventType: 'UPDATE',
          new: { id: 'survivor-1', neurosis_id: 'neurosis-2' },
          old: { id: 'survivor-1' }
        },
        snapshots
      )
    ).toBe(true)
  })

  it('does not refresh catalog data for ordinary survivor updates', () => {
    expect(
      shouldRefreshCatalogForLinkedContentChange('survivor', {
        eventType: 'UPDATE',
        new: { id: 'survivor-1', courage: 2 },
        old: { id: 'survivor-1' }
      })
    ).toBe(false)
  })

  it('refreshes catalog data when a direct catalog link is cleared as the first observed event', () => {
    expect(
      shouldRefreshCatalogForLinkedContentChange('survivor', {
        eventType: 'UPDATE',
        new: { id: 'survivor-1', neurosis_id: null },
        old: { id: 'survivor-1' }
      })
    ).toBe(true)
  })

  it('refreshes catalog data when a direct catalog-link row is deleted before a snapshot exists', () => {
    expect(
      shouldRefreshCatalogForLinkedContentChange('survivor', {
        eventType: 'DELETE',
        new: {},
        old: { id: 'survivor-1' }
      })
    ).toBe(true)
  })

  it('refreshes catalog data for survivor catalog junction changes', () => {
    expect(
      shouldRefreshCatalogForLinkedContentChange('survivor_disorder', {
        eventType: 'INSERT',
        new: {
          id: 'junction-1',
          survivor_id: 'survivor-1',
          disorder_id: 'disorder-1'
        },
        old: {}
      })
    ).toBe(true)
  })

  it('refreshes catalog data for monster catalog junction changes', () => {
    expect(
      shouldRefreshCatalogForLinkedContentChange('hunt_monster_trait', {
        eventType: 'INSERT',
        new: {
          id: 'junction-1',
          hunt_monster_id: 'monster-1',
          trait_id: 'trait-1'
        },
        old: {}
      })
    ).toBe(true)
  })
})
