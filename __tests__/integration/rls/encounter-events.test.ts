import {
  admin,
  createTestUser,
  deleteTestUser,
  seedSettlement,
  shareSettlement,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — Encounter Events
 *
 * Encounter events are settlement-scoped gameplay rows that pause a hunt. The
 * active encounter tables should follow the same member CRUD rules as hunts and
 * showdowns, while custom encounter catalog rows, traits, and moods become
 * visible to settlement members only when referenced by an active encounter.
 */
describe('RLS: encounter events', () => {
  let owner: TestUser
  let collaborator: TestUser
  let stranger: TestUser
  let settlementId: string
  let survivorId: string
  let huntId: string
  let encounterMonsterId: string
  let encounterLevelId: string
  let traitId: string
  let moodId: string
  let levelTraitId: string
  let levelMoodId: string
  let encounterId: string
  let activeMonsterId: string
  let activeTraitId: string
  let activeMoodId: string
  let encounterSurvivorId: string
  let strangerTraitId: string
  let strangerMoodId: string

  beforeAll(async () => {
    owner = await createTestUser()
    collaborator = await createTestUser()
    stranger = await createTestUser()

    settlementId = await seedSettlement(owner.id, 'RLS Encounter Settlement')
    await shareSettlement(settlementId, collaborator.id, owner.id)

    const { data: survivor, error: survivorError } = await admin
      .from('survivor')
      .insert({
        gender: 'FEMALE',
        settlement_id: settlementId,
        survivor_name: 'RLS Encounter Survivor'
      })
      .select('id')
      .single<{ id: string }>()
    if (survivorError || !survivor)
      throw new Error(`seed survivor: ${survivorError?.message}`)
    survivorId = survivor.id

    const { data: hunt, error: huntError } = await admin
      .from('hunt')
      .insert({ monster_level: 1, settlement_id: settlementId })
      .select('id')
      .single<{ id: string }>()
    if (huntError || !hunt) throw new Error(`seed hunt: ${huntError?.message}`)
    huntId = hunt.id

    const { data: monster, error: monsterError } = await admin
      .from('encounter_monster')
      .insert({
        custom: true,
        monster_name: 'RLS Encounter Beast',
        user_id: owner.id
      })
      .select('id')
      .single<{ id: string }>()
    if (monsterError || !monster)
      throw new Error(`seed encounter monster: ${monsterError?.message}`)
    encounterMonsterId = monster.id

    const { data: level, error: levelError } = await admin
      .from('encounter_monster_level')
      .insert({
        accuracy: 4,
        damage: 1,
        encounter_monster_id: encounterMonsterId,
        evasion: 0,
        level_number: 1,
        life: 6,
        luck: 1,
        movement: 5,
        speed: 2,
        toughness: 7
      })
      .select('id')
      .single<{ id: string }>()
    if (levelError || !level)
      throw new Error(`seed encounter level: ${levelError?.message}`)
    encounterLevelId = level.id

    const { data: trait, error: traitError } = await admin
      .from('trait')
      .insert({
        custom: true,
        trait_name: 'RLS Encounter Trait',
        user_id: owner.id
      })
      .select('id')
      .single<{ id: string }>()
    if (traitError || !trait)
      throw new Error(`seed trait: ${traitError?.message}`)
    traitId = trait.id

    const { data: mood, error: moodError } = await admin
      .from('mood')
      .insert({
        custom: true,
        mood_name: 'RLS Encounter Mood',
        user_id: owner.id
      })
      .select('id')
      .single<{ id: string }>()
    if (moodError || !mood) throw new Error(`seed mood: ${moodError?.message}`)
    moodId = mood.id

    const { data: strangerTrait, error: strangerTraitError } = await admin
      .from('trait')
      .insert({ custom: false, trait_name: 'RLS Encounter Stranger Trait' })
      .select('id')
      .single<{ id: string }>()
    if (strangerTraitError || !strangerTrait)
      throw new Error(`seed stranger trait: ${strangerTraitError?.message}`)
    strangerTraitId = strangerTrait.id

    const { data: strangerMood, error: strangerMoodError } = await admin
      .from('mood')
      .insert({ custom: false, mood_name: 'RLS Encounter Stranger Mood' })
      .select('id')
      .single<{ id: string }>()
    if (strangerMoodError || !strangerMood)
      throw new Error(`seed stranger mood: ${strangerMoodError?.message}`)
    strangerMoodId = strangerMood.id

    const { data: levelTrait, error: levelTraitError } = await admin
      .from('encounter_monster_level_trait')
      .insert({
        encounter_monster_level_id: encounterLevelId,
        trait_id: traitId
      })
      .select('id')
      .single<{ id: string }>()
    if (levelTraitError || !levelTrait)
      throw new Error(`seed level trait: ${levelTraitError?.message}`)
    levelTraitId = levelTrait.id

    const { data: levelMood, error: levelMoodError } = await admin
      .from('encounter_monster_level_mood')
      .insert({ encounter_monster_level_id: encounterLevelId, mood_id: moodId })
      .select('id')
      .single<{ id: string }>()
    if (levelMoodError || !levelMood)
      throw new Error(`seed level mood: ${levelMoodError?.message}`)
    levelMoodId = levelMood.id

    const { data: encounter, error: encounterError } = await admin
      .from('encounter')
      .insert({
        hunt_id: huntId,
        monster_level: 1,
        settlement_id: settlementId
      })
      .select('id')
      .single<{ id: string }>()
    if (encounterError || !encounter)
      throw new Error(`seed encounter: ${encounterError?.message}`)
    encounterId = encounter.id

    const { data: activeMonster, error: activeMonsterError } = await admin
      .from('encounter_active_monster')
      .insert({
        accuracy: 4,
        damage: 1,
        encounter_id: encounterId,
        encounter_monster_id: encounterMonsterId,
        encounter_monster_level_id: encounterLevelId,
        life: 6,
        monster_name: 'RLS Encounter Beast',
        settlement_id: settlementId,
        toughness: 7
      })
      .select('id')
      .single<{ id: string }>()
    if (activeMonsterError || !activeMonster)
      throw new Error(`seed active monster: ${activeMonsterError?.message}`)
    activeMonsterId = activeMonster.id

    const { data: activeTrait, error: activeTraitError } = await admin
      .from('encounter_active_monster_trait')
      .insert({
        encounter_active_monster_id: activeMonsterId,
        trait_id: traitId
      })
      .select('id')
      .single<{ id: string }>()
    if (activeTraitError || !activeTrait)
      throw new Error(`seed active trait: ${activeTraitError?.message}`)
    activeTraitId = activeTrait.id

    const { data: activeMood, error: activeMoodError } = await admin
      .from('encounter_active_monster_mood')
      .insert({ encounter_active_monster_id: activeMonsterId, mood_id: moodId })
      .select('id')
      .single<{ id: string }>()
    if (activeMoodError || !activeMood)
      throw new Error(`seed active mood: ${activeMoodError?.message}`)
    activeMoodId = activeMood.id

    const { data: encounterSurvivor, error: encounterSurvivorError } =
      await admin
        .from('encounter_survivor')
        .insert({
          bleeding_tokens: 1,
          encounter_id: encounterId,
          settlement_id: settlementId,
          survivor_id: survivorId
        })
        .select('id')
        .single<{ id: string }>()
    if (encounterSurvivorError || !encounterSurvivor)
      throw new Error(
        `seed encounter survivor: ${encounterSurvivorError?.message}`
      )
    encounterSurvivorId = encounterSurvivor.id
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)
    if (strangerTraitId)
      await admin.from('trait').delete().eq('id', strangerTraitId)
    if (strangerMoodId)
      await admin.from('mood').delete().eq('id', strangerMoodId)
  })

  const activeRows = () => [
    { table: 'encounter', rowId: () => encounterId },
    { table: 'encounter_active_monster', rowId: () => activeMonsterId },
    {
      table: 'encounter_active_monster_trait',
      rowId: () => activeTraitId
    },
    {
      table: 'encounter_active_monster_mood',
      rowId: () => activeMoodId
    },
    { table: 'encounter_survivor', rowId: () => encounterSurvivorId }
  ]

  it.each(activeRows())(
    'collaborator CAN SELECT active row in $table',
    async ({ table, rowId }) => {
      const { data, error } = await collaborator.client
        .from(table)
        .select('id')
        .eq('id', rowId())
      expect(error).toBeNull()
      expect(data).toHaveLength(1)
    }
  )

  it.each(activeRows())(
    'stranger CANNOT SELECT active row in $table',
    async ({ table, rowId }) => {
      const { data, error } = await stranger.client
        .from(table)
        .select('id')
        .eq('id', rowId())
      expect(error).toBeNull()
      expect(data).toEqual([])
    }
  )

  it.each([
    {
      table: 'encounter',
      rowId: () => encounterId,
      update: { turn: 'SURVIVOR' }
    },
    {
      table: 'encounter_active_monster',
      rowId: () => activeMonsterId,
      update: { life: 5 }
    },
    {
      table: 'encounter_survivor',
      rowId: () => encounterSurvivorId,
      update: { bleeding_tokens: 2 }
    }
  ])('collaborator CAN UPDATE $table', async ({ table, rowId, update }) => {
    const { data, error } = await collaborator.client
      .from(table)
      .update(update)
      .eq('id', rowId())
      .select('id')
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
  })

  it.each([
    {
      table: 'encounter_active_monster_trait',
      catalogColumn: 'trait_id',
      catalogId: () => traitId,
      strangerCatalogId: () => strangerTraitId,
      activeRowId: () => activeTraitId
    },
    {
      table: 'encounter_active_monster_mood',
      catalogColumn: 'mood_id',
      catalogId: () => moodId,
      strangerCatalogId: () => strangerMoodId,
      activeRowId: () => activeMoodId
    }
  ])(
    'collaborator CAN DELETE + re-INSERT active junction in $table',
    async (row) => {
      const { data: deleted, error: deleteError } = await collaborator.client
        .from(row.table)
        .delete()
        .eq('id', row.activeRowId())
        .select('id')
      expect(deleteError).toBeNull()
      expect(deleted).toHaveLength(1)

      const { data: inserted, error: insertError } = await collaborator.client
        .from(row.table)
        .insert({
          encounter_active_monster_id: activeMonsterId,
          [row.catalogColumn]: row.catalogId()
        })
        .select('id, settlement_id')
        .single<{ id: string; settlement_id: string }>()
      expect(insertError).toBeNull()
      expect(inserted?.settlement_id).toBe(settlementId)

      if (row.table === 'encounter_active_monster_trait')
        activeTraitId = inserted!.id
      else activeMoodId = inserted!.id
    }
  )

  it.each([
    {
      table: 'encounter_active_monster_trait',
      catalogColumn: 'trait_id',
      catalogId: () => strangerTraitId
    },
    {
      table: 'encounter_active_monster_mood',
      catalogColumn: 'mood_id',
      catalogId: () => strangerMoodId
    }
  ])('stranger CANNOT INSERT active junction in $table', async (row) => {
    const { data, error } = await stranger.client.from(row.table).insert({
      encounter_active_monster_id: activeMonsterId,
      [row.catalogColumn]: row.catalogId()
    })
    expect(data ?? []).toEqual([])
    expect(error?.code).toMatch(/PGRST|42501|23503/)
  })

  it.each([
    { table: 'encounter_monster', rowId: () => encounterMonsterId },
    { table: 'encounter_monster_level', rowId: () => encounterLevelId },
    { table: 'encounter_monster_level_trait', rowId: () => levelTraitId },
    { table: 'encounter_monster_level_mood', rowId: () => levelMoodId },
    { table: 'trait', rowId: () => traitId },
    { table: 'mood', rowId: () => moodId }
  ])(
    'collaborator CAN SELECT custom catalog row in $table through active encounter',
    async ({ table, rowId }) => {
      const { data, error } = await collaborator.client
        .from(table)
        .select('id')
        .eq('id', rowId())
      expect(error).toBeNull()
      expect(data).toHaveLength(1)
    }
  )

  it.each([
    { table: 'encounter_monster', rowId: () => encounterMonsterId },
    { table: 'encounter_monster_level', rowId: () => encounterLevelId },
    { table: 'encounter_monster_level_trait', rowId: () => levelTraitId },
    { table: 'encounter_monster_level_mood', rowId: () => levelMoodId },
    { table: 'trait', rowId: () => traitId },
    { table: 'mood', rowId: () => moodId }
  ])(
    'stranger CANNOT SELECT custom catalog row in $table',
    async ({ table, rowId }) => {
      const { data, error } = await stranger.client
        .from(table)
        .select('id')
        .eq('id', rowId())
      expect(error).toBeNull()
      expect(data).toEqual([])
    }
  )
})
