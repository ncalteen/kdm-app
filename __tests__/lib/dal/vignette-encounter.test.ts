import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

vi.mock('@/lib/dal/user', () => ({
  getUserId: vi.fn()
}))

const {
  getAccessibleVignetteEncountersForUser,
  getActiveVignetteEncounterForUser,
  getSharedVignetteEncountersForUser,
  getVignetteEncounter,
  getVignetteEncounterAIDecks,
  getVignetteEncounterMonsters,
  getVignetteEncounterSharedUsers,
  getVignetteEncounterSurvivors,
  getVignetteMonster,
  getVignetteMonsters
} = await import('@/lib/dal/vignette-encounter')
const { getUserId } = await import('@/lib/dal/user')

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getUserId).mockResolvedValue('owner-1')
})

function queryResult(data: unknown, error: unknown = null) {
  return { data, error }
}

function makeQuery(result: unknown, error: unknown = null) {
  const resolved = queryResult(result, error)
  const query = {
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(resolved),
    select: vi.fn().mockReturnThis(),
    then: (resolve: (value: unknown) => unknown) =>
      Promise.resolve(resolve(resolved))
  }

  return query
}

function mockFromSequence(...queries: ReturnType<typeof makeQuery>[]) {
  mockSupabase.from.mockImplementation(() => {
    const query = queries.shift()
    if (!query) throw new Error('Unexpected query')
    return query
  })
}

const rawCatalogMonster = {
  id: 'vm-1',
  monster_name: 'Killenium Butcher',
  multi_monster: false,
  source_monster_type: 'NEMESIS',
  source_nemesis_id: 'nemesis-1',
  source_quarry_id: null,
  vignette_monster_level: [
    {
      id: 'level-1',
      vignette_monster_id: 'vm-1',
      level_number: 1,
      movement: 6,
      speed: 2,
      accuracy: 4,
      evasion: 1,
      damage: 2,
      toughness: 8,
      life: 12,
      ai_deck_remaining: 7,
      basic_cards: 3,
      advanced_cards: 2,
      legendary_cards: 1,
      overtone_cards: 0,
      accuracy_tokens: 0,
      damage_tokens: 0,
      evasion_tokens: 0,
      luck: 0,
      luck_tokens: 0,
      movement_tokens: 0,
      speed_tokens: 0,
      strength: 0,
      strength_tokens: 0,
      sub_monster_name: null,
      toughness_tokens: 0,
      vignette_monster_level_mood: [
        {
          id: 'level-mood-1',
          mood_id: 'mood-1',
          vignette_monster_level_id: 'level-1',
          mood: {
            id: 'mood-1',
            custom: true,
            user_id: 'author-1',
            mood_name: 'Guttering Dread',
            rules: null
          }
        }
      ],
      vignette_monster_level_trait: [
        {
          id: 'level-trait-1',
          trait_id: 'trait-1',
          vignette_monster_level_id: 'level-1',
          trait: {
            id: 'trait-1',
            custom: false,
            user_id: null,
            trait_name: 'Built In Terror',
            rules: 'Boo.'
          }
        }
      ],
      vignette_monster_level_survivor_status: []
    }
  ],
  vignette_survivor: [
    {
      id: 'survivor-1',
      vignette_monster_id: 'vm-1',
      survivor_name: 'Lantern Bearer',
      survivor_type: 'CORE',
      gender: 'FEMALE',
      movement: 5,
      accuracy: 0,
      strength: 1,
      evasion: 0,
      luck: 0,
      speed: 0,
      survival: 2,
      insanity: 1,
      courage: 0,
      understanding: 0,
      weapon_proficiency: 0,
      weapon_type_id: null,
      arm_armor: 0,
      body_armor: 0,
      head_armor: 0,
      leg_armor: 0,
      waist_armor: 0,
      notes: '',
      vignette_survivor_ability_impairment: [],
      vignette_survivor_disorder: [],
      vignette_survivor_fighting_art: [],
      vignette_survivor_secret_fighting_art: [],
      vignette_survivor_gear_grid: [
        {
          id: 'gear-grid-1',
          vignette_survivor_id: 'survivor-1',
          gear_id: 'gear-1',
          row_number: 0,
          column_number: 1,
          gear: {
            id: 'gear-1',
            custom: true,
            user_id: 'author-2',
            gear_name: 'Bone Blade',
            location_id: null,
            accessory: null,
            accuracy: null,
            affinity_top: null,
            affinity_left: null,
            affinity_right: null,
            affinity_bottom: null,
            affinity_bonus: null,
            affinity_bonus_requirements: [{ affinity: 'RED', puzzle: false }],
            armor_points: null,
            armor_location: null,
            keywords: null,
            rules: null,
            speed: null,
            strength: null,
            weapon_type_id: null,
            gear_gear_cost: [{ cost_gear_id: 'gear-2', quantity: 1 }],
            gear_resource_cost: [],
            gear_resource_type_cost: []
          }
        }
      ]
    }
  ]
}

describe('getVignetteMonsters', () => {
  it('returns vignette catalog monsters keyed by id with nested setup data', async () => {
    mockSupabase.from.mockReturnValue(makeQuery([rawCatalogMonster]))

    const result = await getVignetteMonsters()

    expect(mockSupabase.from).toHaveBeenCalledWith('vignette_monster')
    expect(result['vm-1'].levels[0].moods[0].mood).toMatchObject({
      id: 'mood-1',
      mood_name: 'Guttering Dread',
      author_user_id: 'author-1',
      author_username: null,
      author_avatar_url: null
    })
    expect(result['vm-1'].levels[0].traits[0].trait).toMatchObject({
      id: 'trait-1',
      author_user_id: null
    })
    expect(result['vm-1'].survivors[0].gear_grid[0].gear).toMatchObject({
      id: 'gear-1',
      gear_name: 'Bone Blade',
      author_user_id: 'author-2',
      affinity_bonus_requirements: [{ affinity: 'RED', puzzle: false }],
      gear_costs: [{ cost_gear_id: 'gear-2', quantity: 1 }]
    })
  })

  it('throws when the catalog query fails', async () => {
    mockSupabase.from.mockReturnValue(makeQuery(null, { message: 'DB error' }))

    await expect(getVignetteMonsters()).rejects.toThrow(
      'Error Fetching Vignette Monsters: DB error'
    )
  })
})

describe('getVignetteMonster', () => {
  it('returns null when the id is null', async () => {
    const result = await getVignetteMonster(null)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('filters by vignette monster id', async () => {
    const query = makeQuery([rawCatalogMonster])
    mockSupabase.from.mockReturnValue(query)

    const result = await getVignetteMonster('vm-1')

    expect(result?.id).toBe('vm-1')
    expect(query.eq).toHaveBeenCalledWith('id', 'vm-1')
  })
})

describe('vignette encounter summaries', () => {
  const ownedEncounter = {
    id: 'encounter-1',
    level_number: 2,
    turn: 'MONSTER',
    user_id: 'owner-1',
    vignette_monster_id: 'vm-1',
    vignette_monster: { monster_name: 'Killenium Butcher' }
  }

  const sharedEncounter = {
    id: 'encounter-2',
    level_number: 1,
    turn: 'SURVIVOR',
    user_id: 'other-owner',
    vignette_monster_id: 'vm-2',
    vignette_monster: { monster_name: 'Screaming Nukalope' }
  }

  it('fetches only the current user owned active vignette', async () => {
    const query = makeQuery(ownedEncounter)
    mockSupabase.from.mockReturnValue(query)

    const result = await getActiveVignetteEncounterForUser()

    expect(query.eq).toHaveBeenCalledWith('user_id', 'owner-1')
    expect(result).toEqual({
      id: 'encounter-1',
      level_number: 2,
      monster_name: 'Killenium Butcher',
      owner_avatar_url: null,
      owner_user_id: 'owner-1',
      owner_username: null,
      role: 'owner',
      turn: 'MONSTER',
      vignette_monster_id: 'vm-1'
    })
  })

  it('fetches shared active vignettes as collaborator summaries', async () => {
    const query = makeQuery([{ vignette_encounter: sharedEncounter }])
    mockSupabase.from.mockReturnValue(query)

    const result = await getSharedVignetteEncountersForUser()

    expect(query.eq).toHaveBeenCalledWith('shared_user_id', 'owner-1')
    expect(result).toEqual([
      expect.objectContaining({
        id: 'encounter-2',
        role: 'collaborator',
        monster_name: 'Screaming Nukalope',
        owner_user_id: 'other-owner'
      })
    ])
  })

  it('combines owned and shared summaries for accessible switching', async () => {
    mockFromSequence(
      makeQuery(ownedEncounter),
      makeQuery([{ vignette_encounter: sharedEncounter }])
    )

    const result = await getAccessibleVignetteEncountersForUser()

    expect(result.map((summary) => summary.id)).toEqual([
      'encounter-1',
      'encounter-2'
    ])
    expect(result.map((summary) => summary.role)).toEqual([
      'owner',
      'collaborator'
    ])
  })
})

describe('getVignetteEncounter', () => {
  const encounter = {
    id: 'encounter-1',
    level_number: 1,
    notes: 'A narrow pool of light.',
    turn: 'MONSTER',
    user_id: 'owner-1',
    vignette_monster_id: 'vm-1'
  }

  const aiDeck = {
    id: 'deck-1',
    vignette_encounter_id: 'encounter-1',
    basic_cards: 4,
    advanced_cards: 2,
    legendary_cards: 1,
    overtone_cards: 0
  }

  it('returns null when the id is undefined', async () => {
    const result = await getVignetteEncounter(undefined)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('assembles full active detail state with role data', async () => {
    mockFromSequence(
      makeQuery(encounter),
      makeQuery([rawCatalogMonster]),
      makeQuery([aiDeck]),
      makeQuery([
        {
          id: 'share-1',
          vignette_encounter_id: 'encounter-1',
          shared_user_id: 'collab-1',
          user_settings: { username: 'lantern.friend', avatar_url: null }
        }
      ]),
      makeQuery([
        {
          id: 'active-monster-1',
          vignette_encounter_id: 'encounter-1',
          ai_deck_id: 'deck-1',
          monster_name: 'Butcher',
          wounds: 2,
          vignette_encounter_monster_mood: [
            {
              id: 'active-mood-1',
              vignette_encounter_monster_id: 'active-monster-1',
              mood_id: 'mood-1',
              source_vignette_monster_level_mood_id: 'level-mood-1',
              mood: {
                id: 'mood-1',
                custom: true,
                user_id: 'author-1',
                mood_name: 'Guttering Dread',
                rules: null
              }
            }
          ],
          vignette_encounter_monster_trait: [],
          vignette_encounter_monster_survivor_status: []
        }
      ]),
      makeQuery([
        {
          id: 'active-survivor-1',
          vignette_encounter_id: 'encounter-1',
          vignette_monster_id: 'vm-1',
          source_vignette_survivor_id: 'survivor-1',
          survivor_name: 'Lantern Bearer',
          survivor_type: 'CORE',
          movement: 5,
          accuracy: 0,
          strength: 1,
          evasion: 0,
          luck: 0,
          speed: 0,
          survival: 2,
          insanity: 1,
          courage: 0,
          understanding: 0,
          weapon_proficiency: 0,
          weapon_type_id: null,
          arm_armor: 0,
          body_armor: 0,
          head_armor: 0,
          leg_armor: 0,
          waist_armor: 0,
          gender: 'FEMALE',
          notes: 'Still standing.',
          activation_used: true,
          accuracy_tokens: 0,
          arm_heavy_damage: false,
          arm_light_damage: false,
          bleeding_tokens: 1,
          block_tokens: 0,
          body_heavy_damage: false,
          body_light_damage: false,
          brain_light_damage: false,
          dead: false,
          deflect_tokens: 0,
          evasion_tokens: 0,
          head_heavy_damage: false,
          insanity_tokens: 0,
          knocked_down: false,
          leg_heavy_damage: false,
          leg_light_damage: false,
          luck_tokens: 0,
          movement_tokens: 0,
          movement_used: true,
          priority_target: false,
          retired: false,
          scout: false,
          speed_tokens: 0,
          strength_tokens: 0,
          survival_tokens: -1,
          waist_heavy_damage: false,
          waist_light_damage: false,
          vignette_encounter_survivor_ability_impairment: [],
          vignette_encounter_survivor_disorder: [],
          vignette_encounter_survivor_fighting_art: [],
          vignette_encounter_survivor_secret_fighting_art: [],
          vignette_encounter_survivor_gear_grid: []
        }
      ])
    )

    const result = await getVignetteEncounter('encounter-1')

    expect(result).toMatchObject({
      id: 'encounter-1',
      role: 'owner',
      vignette_monster: { id: 'vm-1' },
      ai_decks: { 'deck-1': aiDeck },
      shared_users: [
        {
          id: 'share-1',
          shared_user_id: 'collab-1',
          username: 'lantern.friend',
          avatar_url: null
        }
      ]
    })
    expect(result!.monsters['active-monster-1'].ai_deck).toEqual(aiDeck)
    expect(result!.monsters['active-monster-1'].moods[0].mood).toMatchObject({
      mood_name: 'Guttering Dread',
      author_user_id: 'author-1'
    })
    expect(result!.survivors['active-survivor-1'].live_state).toMatchObject({
      activation_used: true,
      bleeding_tokens: 1,
      movement_used: true,
      survival_tokens: -1,
      notes: 'Still standing.'
    })
    expect(result!.survivors['active-survivor-1']).not.toHaveProperty(
      'activation_used'
    )
  })

  it('uses collaborator role when the current user is not the owner', async () => {
    vi.mocked(getUserId).mockResolvedValue('collab-1')
    mockFromSequence(
      makeQuery(encounter),
      makeQuery([rawCatalogMonster]),
      makeQuery([]),
      makeQuery([]),
      makeQuery([]),
      makeQuery([])
    )

    const result = await getVignetteEncounter('encounter-1')

    expect(result?.role).toBe('collaborator')
  })

  it('throws when the base encounter query fails', async () => {
    mockSupabase.from.mockReturnValue(makeQuery(null, { message: 'DB error' }))

    await expect(getVignetteEncounter('encounter-1')).rejects.toThrow(
      'Error Fetching Vignette Encounter: DB error'
    )
  })

  it('throws with the missing vignette monster id when catalog data is absent', async () => {
    mockFromSequence(
      makeQuery(encounter),
      makeQuery([]),
      makeQuery([]),
      makeQuery([])
    )

    await expect(getVignetteEncounter('encounter-1')).rejects.toThrow(
      'Error Fetching Vignette Encounter: Vignette Monster Not Found for vignette_monster_id vm-1'
    )
  })
})

describe('active vignette child readers', () => {
  it('returns null for empty ids', async () => {
    await expect(getVignetteEncounterAIDecks(null)).resolves.toBeNull()
    await expect(getVignetteEncounterMonsters(undefined)).resolves.toBeNull()
    await expect(getVignetteEncounterSurvivors(null)).resolves.toBeNull()
    await expect(getVignetteEncounterSharedUsers(undefined)).resolves.toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('fetches AI decks when active monsters are read without prefetched decks', async () => {
    const aiDeck = {
      id: 'deck-1',
      vignette_encounter_id: 'encounter-1',
      basic_cards: 4,
      advanced_cards: 2,
      legendary_cards: 1,
      overtone_cards: 0
    }
    mockFromSequence(
      makeQuery([
        {
          id: 'active-monster-1',
          vignette_encounter_id: 'encounter-1',
          ai_deck_id: 'deck-1',
          monster_name: 'Butcher',
          vignette_encounter_monster_mood: [],
          vignette_encounter_monster_trait: [],
          vignette_encounter_monster_survivor_status: []
        }
      ]),
      makeQuery([aiDeck])
    )

    const result = await getVignetteEncounterMonsters('encounter-1')

    expect(result!['active-monster-1'].ai_deck).toEqual(aiDeck)
    expect(mockSupabase.from).toHaveBeenNthCalledWith(
      1,
      'vignette_encounter_monster'
    )
    expect(mockSupabase.from).toHaveBeenNthCalledWith(
      2,
      'vignette_encounter_ai_deck'
    )
  })

  it('throws when an active monster references an unknown AI deck', async () => {
    mockFromSequence(
      makeQuery([
        {
          id: 'active-monster-1',
          vignette_encounter_id: 'encounter-1',
          ai_deck_id: 'missing-deck',
          monster_name: 'Butcher',
          vignette_encounter_monster_mood: [],
          vignette_encounter_monster_trait: [],
          vignette_encounter_monster_survivor_status: []
        }
      ]),
      makeQuery([
        {
          id: 'deck-1',
          vignette_encounter_id: 'encounter-1',
          basic_cards: 4,
          advanced_cards: 2,
          legendary_cards: 1,
          overtone_cards: 0
        }
      ])
    )

    await expect(getVignetteEncounterMonsters('encounter-1')).rejects.toThrow(
      'Error Fetching Vignette Encounter Monsters: AI deck missing-deck not found for monster active-monster-1'
    )
  })
})
