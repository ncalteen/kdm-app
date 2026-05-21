import { describe, expect, it } from 'vitest'

import { TABLE_DOMAIN_MAP } from '@/hooks/use-realtime'

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
