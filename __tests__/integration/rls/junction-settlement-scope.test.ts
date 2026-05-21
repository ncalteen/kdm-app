import {
  deleteCatalog,
  seedCatalog,
  seedSettlementFixture,
  SettlementFixture
} from '@/__tests__/integration/helpers/fixtures'
import {
  admin,
  createTestUser,
  deleteTestUser,
  seedSettlement,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — Denormalized Junction Settlement Scope
 *
 * Approach A from issue #189 stores `settlement_id` on the gameplay junctions
 * that previously relied on unfiltered realtime subscriptions. These tests
 * prove the migration backfills the existing fixture rows and the child
 * triggers keep direct writes aligned with their parent rows.
 */
describe('RLS: denormalized junction settlement scope', () => {
  let owner: TestUser
  let outsider: TestUser
  let catalog: SettlementFixture['catalogIds']
  let fixture: SettlementFixture
  let gearGridId: string
  let unrelatedSettlementId: string
  let showdownSettlementId: string

  beforeAll(async () => {
    owner = await createTestUser()
    outsider = await createTestUser()
    catalog = await seedCatalog()
    fixture = await seedSettlementFixture(owner, catalog)

    const { data: gearGrid, error: gearGridError } = await admin
      .from('gear_grid')
      .insert({ survivor_id: fixture.survivorId })
      .select('id')
      .single<{ id: string }>()
    if (gearGridError || !gearGrid)
      throw new Error(`seed gear_grid: ${gearGridError?.message}`)
    gearGridId = gearGrid.id

    unrelatedSettlementId = await seedSettlement(
      owner.id,
      'RLS Unrelated Settlement'
    )

    const { data, error } = await admin
      .from('showdown_monster')
      .select('settlement_id')
      .eq('id', fixture.showdownMonsterId)
      .single<{ settlement_id: string }>()
    if (error || !data)
      throw new Error(`resolve showdown settlement: ${error?.message}`)
    showdownSettlementId = data.settlement_id
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(outsider.id)
    await deleteCatalog(catalog)
  })

  const SCOPED_ROWS = [
    [
      'survivor_ability_impairment',
      () => fixture.survivorJunctionIds.survivor_ability_impairment,
      () => fixture.settlementId
    ],
    [
      'survivor_cursed_gear',
      () => fixture.survivorJunctionIds.survivor_cursed_gear,
      () => fixture.settlementId
    ],
    [
      'survivor_disorder',
      () => fixture.survivorJunctionIds.survivor_disorder,
      () => fixture.settlementId
    ],
    [
      'survivor_fighting_art',
      () => fixture.survivorJunctionIds.survivor_fighting_art,
      () => fixture.settlementId
    ],
    [
      'survivor_secret_fighting_art',
      () => fixture.survivorJunctionIds.survivor_secret_fighting_art,
      () => fixture.settlementId
    ],
    ['gear_grid', () => gearGridId, () => fixture.settlementId],
    [
      'hunt_monster_mood',
      () => fixture.monsterJunctionIds.hunt_monster_mood,
      () => fixture.settlementId
    ],
    [
      'hunt_monster_survivor_status',
      () => fixture.monsterJunctionIds.hunt_monster_survivor_status,
      () => fixture.settlementId
    ],
    [
      'hunt_monster_trait',
      () => fixture.monsterJunctionIds.hunt_monster_trait,
      () => fixture.settlementId
    ],
    [
      'showdown_monster_mood',
      () => fixture.monsterJunctionIds.showdown_monster_mood,
      () => showdownSettlementId
    ],
    [
      'showdown_monster_survivor_status',
      () => fixture.monsterJunctionIds.showdown_monster_survivor_status,
      () => showdownSettlementId
    ],
    [
      'showdown_monster_trait',
      () => fixture.monsterJunctionIds.showdown_monster_trait,
      () => showdownSettlementId
    ]
  ] as const

  it.each(SCOPED_ROWS)(
    'stores the parent settlement on %s',
    async (table, rowId, settlementId) => {
      const { data, error } = await admin
        .from(table)
        .select('id, settlement_id')
        .eq('id', rowId())
        .single<{ id: string; settlement_id: string }>()

      expect(error).toBeNull()
      expect(data?.settlement_id).toBe(settlementId())
    }
  )

  it.each(SCOPED_ROWS)(
    'repairs direct settlement_id changes on %s',
    async (table, rowId, settlementId) => {
      const { data, error } = await admin
        .from(table)
        .update({ settlement_id: unrelatedSettlementId })
        .eq('id', rowId())
        .select('id, settlement_id')
        .single<{ id: string; settlement_id: string }>()

      expect(error).toBeNull()
      expect(data?.settlement_id).toBe(settlementId())
    }
  )

  it('derives settlement_id for gear_grid from its survivor parent', async () => {
    const { data: survivor, error: survivorError } = await admin
      .from('survivor')
      .insert({
        settlement_id: fixture.settlementId,
        gender: 'MALE',
        survivor_name: 'RLS Gear Grid Survivor'
      })
      .select('id')
      .single<{ id: string }>()
    if (survivorError || !survivor)
      throw new Error(`seed gear_grid survivor: ${survivorError?.message}`)

    const { data, error } = await admin
      .from('gear_grid')
      .insert({
        survivor_id: survivor.id,
        settlement_id: unrelatedSettlementId
      })
      .select('id, settlement_id')
      .single<{ id: string; settlement_id: string }>()

    expect(error).toBeNull()
    expect(data?.settlement_id).toBe(fixture.settlementId)

    if (data?.id) await admin.from('gear_grid').delete().eq('id', data.id)
    await admin.from('survivor').delete().eq('id', survivor.id)
  })

  it('uses the same parent reference error for missing and unauthorized parents', async () => {
    const MISSING_SURVIVOR_ID = '00000000-0000-4000-8000-000000000001'

    const [{ error: unauthorizedError }, { error: missingError }] =
      await Promise.all([
        outsider.client.from('gear_grid').insert({
          survivor_id: fixture.survivorId
        }),
        outsider.client.from('gear_grid').insert({
          survivor_id: MISSING_SURVIVOR_ID
        })
      ])

    expect(unauthorizedError?.code).toBe('23503')
    expect(missingError?.code).toBe('23503')
    expect(unauthorizedError?.message).toBe(missingError?.message)
  })
})
