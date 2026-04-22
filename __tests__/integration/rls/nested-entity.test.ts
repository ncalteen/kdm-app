import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  admin,
  createTestUser,
  deleteTestUser,
  TestUser
} from '../helpers/supabase'

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
      gender: 'F'
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
      quarry_id: quarryId,
      level_number: 1
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
  })

  afterAll(async () => {
    // Cascade via parent deletes.
    await admin.from('quarry').delete().eq('id', quarryId)
    await admin.from('nemesis').delete().eq('id', nemesisId)
    await admin.from('wanderer').delete().eq('id', wandererId)
    await admin.from('location').delete().eq('id', locationId)
    await deleteTestUser(owner.id)
    await deleteTestUser(attacker.id)
  })

  const NESTED_TABLES = [
    'quarry_location',
    'quarry_timeline_year',
    'quarry_hunt_board',
    'quarry_hunt_board_position',
    'quarry_level',
    'nemesis_location',
    'nemesis_timeline_year',
    'nemesis_level',
    'wanderer_timeline_year'
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
})
