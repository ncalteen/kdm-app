import { admin, TestUser } from '@/__tests__/integration/helpers/supabase'

/**
 * Settlement-Scoped Fixture
 *
 * Owns: 1 settlement + 1 row in every settlement-scoped and survivor/hunt/
 * showdown-scoped table. Built with the admin client so RLS policies don't
 * gate the setup.
 */
export interface SettlementFixture {
  /** Settlement ID */
  settlementId: string
  /** Survivor ID */
  survivorId: string
  /** Hunt ID */
  huntId: string
  /** Hunt AI Deck ID */
  huntAiDeckId: string
  /** Hunt Hunt Board ID */
  huntHuntBoardId: string
  /** Hunt Monster ID */
  huntMonsterId: string
  /** Hunt Survivor ID */
  huntSurvivorId: string
  /** Showdown ID */
  showdownId: string
  /** Showdown AI Deck ID */
  showdownAiDeckId: string
  /** Showdown Monster ID */
  showdownMonsterId: string
  /** Showdown Survivor ID */
  showdownSurvivorId: string
  /** Settlement Phase ID */
  settlementPhaseId: string
  /** Map of settlement-junction table → seeded row ID */
  settlementJunctionIds: Record<string, string>
  /** Map of survivor-junction table → seeded row ID */
  survivorJunctionIds: Record<string, string>
  /** Catalog IDs used by the junctions (for re-use in assertions) */
  catalogIds: {
    collectiveCognitionRewardId: string
    disorderId: string
    fightingArtId: string
    gearId: string
    innovationId: string
    knowledgeId: string
    locationId: string
    milestoneId: string
    nemesisId: string
    patternId: string
    philosophyId: string
    principleId: string
    quarryId: string
    resourceId: string
    secretFightingArtId: string
    seedPatternId: string
    abilityImpairmentId: string
  }
}

/**
 * Seed Non-Custom Catalog
 *
 * Inserts one row per catalog table as `custom = false`. These are treated by
 * the policies as globally readable, so tests can reuse them across users.
 * Called once per test run from the top-level fixture.
 *
 * @returns Catalog IDs
 */
export async function seedCatalog(): Promise<SettlementFixture['catalogIds']> {
  // Each insert uses the admin client (service role), which bypasses RLS.
  // `custom: false` and `user_id: null` matches the shape the app uses for
  // app-provided catalog rows.
  const insert = async (
    table: string,
    row: Record<string, unknown>
  ): Promise<string> => {
    const { data, error } = await admin
      .from(table)
      .insert(row)
      .select('id')
      .single<{ id: string }>()
    if (error || !data)
      throw new Error(`seedCatalog ${table}: ${error?.message}`)
    return data.id
  }

  const [
    collectiveCognitionRewardId,
    disorderId,
    fightingArtId,
    locationId,
    innovationId,
    knowledgeId,
    milestoneId,
    patternId,
    philosophyId,
    principleId,
    secretFightingArtId,
    seedPatternId,
    resourceId,
    abilityImpairmentId
  ] = await Promise.all([
    insert('collective_cognition_reward', {
      custom: false,
      reward_name: 'RLS Test Reward',
      collective_cognition: 1
    }),
    insert('disorder', { custom: false, disorder_name: 'RLS Test Disorder' }),
    insert('fighting_art', {
      custom: false,
      fighting_art_name: 'RLS Test Fighting Art'
    }),
    insert('location', { custom: false, location_name: 'RLS Test Location' }),
    insert('innovation', {
      custom: false,
      innovation_name: 'RLS Test Innovation'
    }),
    insert('knowledge', {
      custom: false,
      knowledge_name: 'RLS Test Knowledge'
    }),
    insert('milestone', {
      custom: false,
      event_name: 'RLS Test Milestone',
      milestone_name: 'RLS Test Milestone Name'
    }),
    insert('pattern', { custom: false, pattern_name: 'RLS Test Pattern' }),
    insert('philosophy', { custom: false, philosophy_name: 'RLS Test Philos' }),
    insert('principle', {
      custom: false,
      principle_name: 'RLS Test Principle',
      option_1_name: 'Opt 1',
      option_2_name: 'Opt 2'
    }),
    insert('secret_fighting_art', {
      custom: false,
      secret_fighting_art_name: 'RLS Test SFA'
    }),
    insert('seed_pattern', {
      custom: false,
      seed_pattern_name: 'RLS Test Seed Pattern'
    }),
    insert('resource', {
      custom: false,
      resource_name: 'RLS Test Resource',
      category: 'BASIC'
    }),
    insert('ability_impairment', {
      custom: false,
      ability_impairment_name: 'RLS Test A&I'
    })
  ])

  // Gear depends on location FK being nullable — pass null.
  const gearId = await insert('gear', {
    custom: false,
    gear_name: 'RLS Test Gear'
  })

  // Quarry & nemesis have required `node` enum.
  const quarryId = await insert('quarry', {
    custom: false,
    monster_name: 'RLS Test Quarry',
    node: 'NQ1'
  })
  const nemesisId = await insert('nemesis', {
    custom: false,
    monster_name: 'RLS Test Nemesis',
    node: 'NN1'
  })

  return {
    collectiveCognitionRewardId,
    disorderId,
    fightingArtId,
    gearId,
    innovationId,
    knowledgeId,
    locationId,
    milestoneId,
    nemesisId,
    patternId,
    philosophyId,
    principleId,
    quarryId,
    resourceId,
    secretFightingArtId,
    seedPatternId,
    abilityImpairmentId
  }
}

/**
 * Seed Settlement Fixture
 *
 * Builds a full ownership graph under `owner`. One row per settlement-scoped
 * table, sufficient for the cross-user RLS matrix.
 *
 * @param owner Owner Test User
 * @param catalog Catalog IDs (from seedCatalog)
 * @returns Settlement Fixture
 */
export async function seedSettlementFixture(
  owner: TestUser,
  catalog: SettlementFixture['catalogIds']
): Promise<SettlementFixture> {
  const ins = async (
    table: string,
    row: Record<string, unknown>,
    idCol = 'id'
  ): Promise<string> => {
    const { data, error } = await admin
      .from(table)
      .insert(row)
      .select(idCol)
      .single<Record<string, string>>()
    if (error || !data)
      throw new Error(`seedFixture ${table}: ${error?.message}`)
    return data[idCol]
  }

  // 1. Settlement.
  const settlementId = await ins('settlement', {
    user_id: owner.id,
    settlement_name: 'RLS Owner Settlement',
    campaign_type: 'PEOPLE_OF_THE_LANTERN',
    survivor_type: 'CORE',
    current_year: 0,
    survival_limit: 1,
    uses_scouts: false,
    arrival_bonuses: [],
    departing_bonuses: [],
    monster_volumes: [],
    lantern_research: 0,
    notes: ''
  })

  // 2. Survivor (before hunt/showdown because they reference it).
  const survivorId = await ins('survivor', {
    settlement_id: settlementId,
    gender: 'FEMALE',
    survivor_name: 'RLS Survivor'
  })

  // 3. Settlement-scoped junction rows.
  const settlementJunctionIds: Record<string, string> = {}
  const junctions: [string, Record<string, unknown>][] = [
    [
      'settlement_collective_cognition_reward',
      {
        collective_cognition_reward_id: catalog.collectiveCognitionRewardId,
        settlement_id: settlementId
      }
    ],
    [
      'settlement_gear',
      { gear_id: catalog.gearId, settlement_id: settlementId }
    ],
    [
      'settlement_innovation',
      { innovation_id: catalog.innovationId, settlement_id: settlementId }
    ],
    [
      'settlement_knowledge',
      { knowledge_id: catalog.knowledgeId, settlement_id: settlementId }
    ],
    [
      'settlement_location',
      { location_id: catalog.locationId, settlement_id: settlementId }
    ],
    [
      'settlement_milestone',
      { milestone_id: catalog.milestoneId, settlement_id: settlementId }
    ],
    [
      'settlement_nemesis',
      { nemesis_id: catalog.nemesisId, settlement_id: settlementId }
    ],
    [
      'settlement_pattern',
      { pattern_id: catalog.patternId, settlement_id: settlementId }
    ],
    [
      'settlement_philosophy',
      { philosophy_id: catalog.philosophyId, settlement_id: settlementId }
    ],
    [
      'settlement_principle',
      { principle_id: catalog.principleId, settlement_id: settlementId }
    ],
    [
      'settlement_quarry',
      { quarry_id: catalog.quarryId, settlement_id: settlementId }
    ],
    [
      'settlement_resource',
      { resource_id: catalog.resourceId, settlement_id: settlementId }
    ],
    [
      'settlement_seed_pattern',
      {
        seed_pattern_id: catalog.seedPatternId,
        settlement_id: settlementId
      }
    ],
    [
      'settlement_timeline_year',
      { settlement_id: settlementId, year_number: 0 }
    ]
  ]
  for (const [table, row] of junctions)
    settlementJunctionIds[table] = await ins(table, row)

  // 4. Survivor-scoped junctions.
  const survivorJunctionIds: Record<string, string> = {
    survivor_disorder: await ins('survivor_disorder', {
      survivor_id: survivorId,
      disorder_id: catalog.disorderId
    }),
    survivor_fighting_art: await ins('survivor_fighting_art', {
      survivor_id: survivorId,
      fighting_art_id: catalog.fightingArtId
    }),
    survivor_cursed_gear: await ins('survivor_cursed_gear', {
      survivor_id: survivorId,
      gear_id: catalog.gearId
    }),
    survivor_secret_fighting_art: await ins('survivor_secret_fighting_art', {
      survivor_id: survivorId,
      secret_fighting_art_id: catalog.secretFightingArtId
    }),
    survivor_ability_impairment: await ins('survivor_ability_impairment', {
      survivor_id: survivorId,
      ability_impairment_id: catalog.abilityImpairmentId
    })
  }

  // 5. Hunt graph.
  const huntId = await ins('hunt', {
    settlement_id: settlementId,
    monster_level: 1
  })
  const huntAiDeckId = await ins('hunt_ai_deck', {
    hunt_id: huntId,
    settlement_id: settlementId
  })
  const huntHuntBoardId = await ins('hunt_hunt_board', {
    hunt_id: huntId,
    settlement_id: settlementId
  })
  const huntMonsterId = await ins('hunt_monster', {
    ai_deck_id: huntAiDeckId,
    hunt_id: huntId,
    settlement_id: settlementId
  })
  const huntSurvivorId = await ins('hunt_survivor', {
    hunt_id: huntId,
    settlement_id: settlementId,
    survivor_id: survivorId
  })

  // 6. Showdown graph (separate settlement-unique → need fresh settlement for
  // showdown since `showdown.settlement_id` is unique alongside hunt. Swap by
  // deleting hunt, or use a separate settlement. Simpler: use a 2nd
  // settlement reserved for the showdown graph.)
  const showdownSettlementId = await ins('settlement', {
    user_id: owner.id,
    settlement_name: 'RLS Owner Showdown Settlement',
    campaign_type: 'PEOPLE_OF_THE_LANTERN',
    survivor_type: 'CORE',
    current_year: 0,
    survival_limit: 1,
    uses_scouts: false,
    arrival_bonuses: [],
    departing_bonuses: [],
    monster_volumes: [],
    lantern_research: 0,
    notes: ''
  })
  const showdownSurvivorPersonId = await ins('survivor', {
    settlement_id: showdownSettlementId,
    gender: 'FEMALE',
    survivor_name: 'RLS Showdown Survivor'
  })
  const showdownId = await ins('showdown', {
    settlement_id: showdownSettlementId,
    monster_level: 1
  })
  const showdownAiDeckId = await ins('showdown_ai_deck', {
    settlement_id: showdownSettlementId,
    showdown_id: showdownId
  })
  const showdownMonsterId = await ins('showdown_monster', {
    ai_deck_id: showdownAiDeckId,
    settlement_id: showdownSettlementId,
    showdown_id: showdownId
  })
  const showdownSurvivorId = await ins('showdown_survivor', {
    settlement_id: showdownSettlementId,
    showdown_id: showdownId,
    survivor_id: showdownSurvivorPersonId
  })

  // 7. Settlement phase (on the hunt settlement — unique constraint).
  const settlementPhaseId = await ins('settlement_phase', {
    settlement_id: settlementId
  })

  return {
    settlementId,
    survivorId,
    huntId,
    huntAiDeckId,
    huntHuntBoardId,
    huntMonsterId,
    huntSurvivorId,
    showdownId,
    showdownAiDeckId,
    showdownMonsterId,
    showdownSurvivorId,
    settlementPhaseId,
    settlementJunctionIds,
    survivorJunctionIds,
    catalogIds: catalog
  }
}

/**
 * Delete Catalog Rows
 *
 * Removes rows seeded by `seedCatalog`. Called in `afterAll`.
 *
 * @param catalog Catalog IDs
 */
export async function deleteCatalog(
  catalog: SettlementFixture['catalogIds']
): Promise<void> {
  const pairs: [string, string][] = [
    ['collective_cognition_reward', catalog.collectiveCognitionRewardId],
    ['disorder', catalog.disorderId],
    ['fighting_art', catalog.fightingArtId],
    ['gear', catalog.gearId],
    ['innovation', catalog.innovationId],
    ['knowledge', catalog.knowledgeId],
    ['location', catalog.locationId],
    ['milestone', catalog.milestoneId],
    ['nemesis', catalog.nemesisId],
    ['pattern', catalog.patternId],
    ['philosophy', catalog.philosophyId],
    ['principle', catalog.principleId],
    ['quarry', catalog.quarryId],
    ['resource', catalog.resourceId],
    ['secret_fighting_art', catalog.secretFightingArtId],
    ['seed_pattern', catalog.seedPatternId],
    ['ability_impairment', catalog.abilityImpairmentId]
  ]
  // Deletes cascade to dependent rows via FK ON DELETE CASCADE.
  await Promise.all(
    pairs.map(([table, id]) => admin.from(table).delete().eq('id', id))
  )
}
