import {
  admin,
  createTestUser,
  deleteTestUser,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — Nested Entity Tables
 *
 * Tables whose access is gated via a parent custom entity (quarry, nemesis,
 * wanderer). A non-owner cannot CRUD rows attached to a parent they don't own.
 */
describe('RLS: nested entity tables', () => {
  let owner: TestUser
  let attacker: TestUser

  let quarryId: string
  let nemesisId: string
  let wandererId: string
  let locationId: string
  let customTraitId: string
  let customMoodId: string
  let customSurvivorStatusId: string
  let customCcrId: string
  let customAbilityImpairmentId: string

  const rowIds: Record<string, string> = {}

  beforeAll(async () => {
    owner = await createTestUser()
    attacker = await createTestUser()

    // Custom parents (owned).
    const ins = async (
      table: string,
      row: Record<string, unknown>
    ): Promise<string> => {
      const { data, error } = await admin
        .from(table)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(row as any)
        .select('id')
        .single<{ id: string }>()
      if (error || !data) throw new Error(`seed ${table}: ${error?.message}`)
      return data.id
    }

    locationId = await ins('location', {
      custom: false,
      location_name: 'RLS Nested Location'
    })

    quarryId = await ins('quarry', {
      custom: true,
      user_id: owner.id,
      monster_name: 'RLS Owner Quarry',
      node: 'NQ1'
    })
    nemesisId = await ins('nemesis', {
      custom: true,
      user_id: owner.id,
      monster_name: 'RLS Owner Nemesis',
      node: 'NN1'
    })
    wandererId = await ins('wanderer', {
      custom: true,
      user_id: owner.id,
      wanderer_name: 'RLS Owner Wanderer',
      gender: 'FEMALE'
    })

    rowIds.quarry_location = await ins('quarry_location', {
      quarry_id: quarryId,
      location_id: locationId
    })
    rowIds.quarry_timeline_year = await ins('quarry_timeline_year', {
      quarry_id: quarryId,
      year_number: 1,
      entries: ['RLS entry']
    })
    rowIds.quarry_hunt_board = await ins('quarry_hunt_board', {
      quarry_id: quarryId
    })
    rowIds.quarry_hunt_board_position = await ins(
      'quarry_hunt_board_position',
      {
        quarry_id: quarryId,
        level_number: 1,
        monster_hunt_pos: 12,
        survivor_hunt_pos: 0
      }
    )
    rowIds.quarry_level = await ins('quarry_level', {
      quarry_id: quarryId,
      level_number: 1
    })

    rowIds.nemesis_location = await ins('nemesis_location', {
      nemesis_id: nemesisId,
      location_id: locationId
    })
    rowIds.nemesis_timeline_year = await ins('nemesis_timeline_year', {
      nemesis_id: nemesisId,
      year_number: 1,
      entries: ['RLS entry']
    })
    rowIds.nemesis_level = await ins('nemesis_level', {
      nemesis_id: nemesisId,
      level_number: 1
    })

    rowIds.wanderer_timeline_year = await ins('wanderer_timeline_year', {
      wanderer_id: wandererId,
      year_number: 1,
      entries: ['RLS entry']
    })

    // Owner-scoped custom trait + mood used by the monster-level junction
    // rows below. They sit alongside the other catalog custom content.
    customTraitId = await ins('trait', {
      custom: true,
      user_id: owner.id,
      trait_name: 'RLS Nested Trait'
    })
    customMoodId = await ins('mood', {
      custom: true,
      user_id: owner.id,
      mood_name: 'RLS Nested Mood'
    })

    rowIds.quarry_level_trait = await ins('quarry_level_trait', {
      quarry_level_id: rowIds.quarry_level,
      trait_id: customTraitId
    })
    rowIds.quarry_level_mood = await ins('quarry_level_mood', {
      quarry_level_id: rowIds.quarry_level,
      mood_id: customMoodId
    })
    rowIds.nemesis_level_trait = await ins('nemesis_level_trait', {
      nemesis_level_id: rowIds.nemesis_level,
      trait_id: customTraitId
    })
    rowIds.nemesis_level_mood = await ins('nemesis_level_mood', {
      nemesis_level_id: rowIds.nemesis_level,
      mood_id: customMoodId
    })

    // Owner-scoped custom survivor_status, collective_cognition_reward, and
    // ability_impairment used by the remaining nested junction rows. Seeded
    // here so the cleanup block can cascade via the parent records above.
    customSurvivorStatusId = await ins('survivor_status', {
      custom: true,
      user_id: owner.id,
      survivor_status_name: 'RLS Nested Survivor Status'
    })
    customCcrId = await ins('collective_cognition_reward', {
      custom: true,
      user_id: owner.id,
      reward_name: 'RLS Nested CCR',
      collective_cognition: 1
    })
    customAbilityImpairmentId = await ins('ability_impairment', {
      custom: true,
      user_id: owner.id,
      ability_impairment_name: 'RLS Nested A&I'
    })

    rowIds.quarry_level_survivor_status = await ins(
      'quarry_level_survivor_status',
      {
        quarry_level_id: rowIds.quarry_level,
        survivor_status_id: customSurvivorStatusId
      }
    )
    rowIds.nemesis_level_survivor_status = await ins(
      'nemesis_level_survivor_status',
      {
        nemesis_level_id: rowIds.nemesis_level,
        survivor_status_id: customSurvivorStatusId
      }
    )
    rowIds.quarry_collective_cognition_reward = await ins(
      'quarry_collective_cognition_reward',
      {
        quarry_id: quarryId,
        collective_cognition_reward_id: customCcrId
      }
    )
    rowIds.wanderer_ability_impairment = await ins(
      'wanderer_ability_impairment',
      {
        wanderer_id: wandererId,
        ability_impairment_id: customAbilityImpairmentId
      }
    )
  })

  afterAll(async () => {
    // Cascade via parent deletes.
    await admin.from('quarry').delete().eq('id', quarryId)
    await admin.from('nemesis').delete().eq('id', nemesisId)
    await admin.from('wanderer').delete().eq('id', wandererId)
    await admin.from('location').delete().eq('id', locationId)
    await admin.from('trait').delete().eq('id', customTraitId)
    await admin.from('mood').delete().eq('id', customMoodId)
    await admin
      .from('survivor_status')
      .delete()
      .eq('id', customSurvivorStatusId)
    await admin
      .from('collective_cognition_reward')
      .delete()
      .eq('id', customCcrId)
    await admin
      .from('ability_impairment')
      .delete()
      .eq('id', customAbilityImpairmentId)
    await deleteTestUser(owner.id)
    await deleteTestUser(attacker.id)
  })

  const NESTED_TABLES = [
    'quarry_location',
    'quarry_timeline_year',
    'quarry_hunt_board',
    'quarry_hunt_board_position',
    'quarry_level',
    'quarry_level_trait',
    'quarry_level_mood',
    'quarry_level_survivor_status',
    'quarry_collective_cognition_reward',
    'nemesis_location',
    'nemesis_timeline_year',
    'nemesis_level',
    'nemesis_level_trait',
    'nemesis_level_mood',
    'nemesis_level_survivor_status',
    'wanderer_timeline_year',
    'wanderer_ability_impairment'
  ] as const

  it.each(NESTED_TABLES)(
    'attacker cannot SELECT owner rows in %s',
    async (table) => {
      const { data, error } = await attacker.client
        .from(table)
        .select('id')
        .eq('id', rowIds[table])
      expect(error).toBeNull()
      expect(data).toEqual([])
    }
  )

  it.each(NESTED_TABLES)(
    'attacker cannot DELETE owner rows in %s',
    async (table) => {
      const { data } = await attacker.client
        .from(table)
        .delete()
        .eq('id', rowIds[table])
        .select('id')
      expect(data ?? []).toEqual([])

      const { data: check } = await owner.client
        .from(table)
        .select('id')
        .eq('id', rowIds[table])
      expect(check).toHaveLength(1)
    }
  )

  it('attacker cannot INSERT into a quarry they do not own', async () => {
    const { data, error } = await attacker.client
      .from('quarry_location')
      .insert({ quarry_id: quarryId, location_id: locationId })
      .select('id')
    expect(data ?? []).toEqual([])
    expect(error?.code).toMatch(/PGRST|42501/)
  })

  it('attacker cannot INSERT into a nemesis they do not own', async () => {
    const { data, error } = await attacker.client
      .from('nemesis_location')
      .insert({ nemesis_id: nemesisId, location_id: locationId })
      .select('id')
    expect(data ?? []).toEqual([])
    expect(error?.code).toMatch(/PGRST|42501/)
  })

  it('attacker cannot INSERT into a quarry_level they do not own (traits)', async () => {
    const { data, error } = await attacker.client
      .from('quarry_level_trait')
      .insert({
        quarry_level_id: rowIds.quarry_level,
        trait_id: customTraitId
      })
      .select('id')
    expect(data ?? []).toEqual([])
    expect(error?.code).toMatch(/PGRST|42501/)
  })

  it('attacker cannot INSERT into a nemesis_level they do not own (moods)', async () => {
    const { data, error } = await attacker.client
      .from('nemesis_level_mood')
      .insert({
        nemesis_level_id: rowIds.nemesis_level,
        mood_id: customMoodId
      })
      .select('id')
    expect(data ?? []).toEqual([])
    expect(error?.code).toMatch(/PGRST|42501/)
  })
})
