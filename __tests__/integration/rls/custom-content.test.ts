import {
  admin,
  createTestUser,
  deleteTestUser,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — Custom-Content Tables
 *
 * Every catalog-style table has three RLS policies:
 *
 *  1. Non-custom rows are readable by any authenticated user.
 *  2. Custom rows are readable/writable only by their owner...
 *  3. ...or by users in the matching `<table>_shared_user` join table.
 *
 * This suite runs a single matrix over every table that follows this pattern.
 */

interface CustomContentSpec {
  /** Table name */
  table: string
  /** Shared-user join table name */
  sharedTable: string
  /** FK column in the shared-user table */
  fkCol: string
  /** Display-name column (used in INSERTs) */
  nameCol: string
  /** Required extra columns beyond `custom`, `user_id`, and `nameCol` */
  extras?: Record<string, unknown>
}

const SPECS: CustomContentSpec[] = [
  {
    table: 'ability_impairment',
    sharedTable: 'ability_impairment_shared_user',
    fkCol: 'ability_impairment_id',
    nameCol: 'ability_impairment_name'
  },
  {
    table: 'character',
    sharedTable: 'character_shared_user',
    fkCol: 'character_id',
    nameCol: 'character_name'
  },
  {
    table: 'collective_cognition_reward',
    sharedTable: 'collective_cognition_reward_shared_user',
    fkCol: 'collective_cognition_reward_id',
    nameCol: 'reward_name',
    extras: { collective_cognition: 1 }
  },
  {
    table: 'disorder',
    sharedTable: 'disorder_shared_user',
    fkCol: 'disorder_id',
    nameCol: 'disorder_name'
  },
  {
    table: 'fighting_art',
    sharedTable: 'fighting_art_shared_user',
    fkCol: 'fighting_art_id',
    nameCol: 'fighting_art_name'
  },
  {
    table: 'gear',
    sharedTable: 'gear_shared_user',
    fkCol: 'gear_id',
    nameCol: 'gear_name'
  },
  {
    table: 'innovation',
    sharedTable: 'innovation_shared_user',
    fkCol: 'innovation_id',
    nameCol: 'innovation_name'
  },
  {
    table: 'knowledge',
    sharedTable: 'knowledge_shared_user',
    fkCol: 'knowledge_id',
    nameCol: 'knowledge_name'
  },
  {
    table: 'location',
    sharedTable: 'location_shared_user',
    fkCol: 'location_id',
    nameCol: 'location_name'
  },
  {
    table: 'milestone',
    sharedTable: 'milestone_shared_user',
    fkCol: 'milestone_id',
    nameCol: 'event_name',
    extras: { milestone_name: 'RLS-milestone-name' }
  },
  {
    table: 'nemesis',
    sharedTable: 'nemesis_shared_user',
    fkCol: 'nemesis_id',
    nameCol: 'monster_name',
    extras: { node: 'NN1' }
  },
  {
    table: 'neurosis',
    sharedTable: 'neurosis_shared_user',
    fkCol: 'neurosis_id',
    nameCol: 'neurosis_name'
  },
  {
    table: 'pattern',
    sharedTable: 'pattern_shared_user',
    fkCol: 'pattern_id',
    nameCol: 'pattern_name'
  },
  {
    table: 'philosophy',
    sharedTable: 'philosophy_shared_user',
    fkCol: 'philosophy_id',
    nameCol: 'philosophy_name'
  },
  {
    table: 'principle',
    sharedTable: 'principle_shared_user',
    fkCol: 'principle_id',
    nameCol: 'principle_name',
    extras: { option_1_name: 'Opt 1', option_2_name: 'Opt 2' }
  },
  {
    table: 'quarry',
    sharedTable: 'quarry_shared_user',
    fkCol: 'quarry_id',
    nameCol: 'monster_name',
    extras: { node: 'NQ1' }
  },
  {
    table: 'resource',
    sharedTable: 'resource_shared_user',
    fkCol: 'resource_id',
    nameCol: 'resource_name',
    extras: { category: 'BASIC' }
  },
  {
    table: 'secret_fighting_art',
    sharedTable: 'secret_fighting_art_shared_user',
    fkCol: 'secret_fighting_art_id',
    nameCol: 'secret_fighting_art_name'
  },
  {
    table: 'seed_pattern',
    sharedTable: 'seed_pattern_shared_user',
    fkCol: 'seed_pattern_id',
    nameCol: 'seed_pattern_name'
  },
  {
    table: 'strain_milestone',
    sharedTable: 'strain_milestone_shared_user',
    fkCol: 'strain_milestone_id',
    nameCol: 'strain_milestone_name'
  },
  {
    table: 'wanderer',
    sharedTable: 'wanderer_shared_user',
    fkCol: 'wanderer_id',
    nameCol: 'wanderer_name',
    extras: { gender: 'FEMALE' }
  },
  {
    table: 'weapon_type',
    sharedTable: 'weapon_type_shared_user',
    fkCol: 'weapon_type_id',
    nameCol: 'weapon_type_name'
  }
]

describe('RLS: custom-content tables', () => {
  let owner: TestUser
  let attacker: TestUser
  let sharedGuest: TestUser

  // Collected IDs per spec for use across the nested `it.each` calls.
  const ids = new Map<
    string,
    { nonCustomId: string; ownerCustomId: string; sharedCustomId: string }
  >()

  beforeAll(async () => {
    owner = await createTestUser()
    attacker = await createTestUser()
    sharedGuest = await createTestUser()

    for (const spec of SPECS) {
      const base = { [spec.nameCol]: `RLS-${spec.table}-nc`, ...spec.extras }

      const { data: nonCustom, error: nonCustomErr } = await admin
        .from(spec.table)
        .insert({ ...base, custom: false })
        .select('id')
        .single()
      if (nonCustomErr)
        throw new Error(
          `seed ${spec.table} non-custom: ${nonCustomErr.message}`
        )

      const { data: ownerCustom, error: ownerCustomErr } = await admin
        .from(spec.table)
        .insert({
          ...base,
          [spec.nameCol]: `RLS-${spec.table}-own`,
          custom: true,
          user_id: owner.id
        })
        .select('id')
        .single()
      if (ownerCustomErr)
        throw new Error(
          `seed ${spec.table} owner-custom: ${ownerCustomErr.message}`
        )

      const { data: sharedCustom, error: sharedCustomErr } = await admin
        .from(spec.table)
        .insert({
          ...base,
          [spec.nameCol]: `RLS-${spec.table}-shared`,
          custom: true,
          user_id: owner.id
        })
        .select('id')
        .single()
      if (sharedCustomErr)
        throw new Error(
          `seed ${spec.table} shared-custom: ${sharedCustomErr.message}`
        )

      const { error: shareErr } = await admin.from(spec.sharedTable).insert({
        [spec.fkCol]: sharedCustom!.id,
        shared_user_id: sharedGuest.id,
        user_id: owner.id
      })
      if (shareErr)
        throw new Error(`share ${spec.sharedTable}: ${shareErr.message}`)

      ids.set(spec.table, {
        nonCustomId: nonCustom!.id,
        ownerCustomId: ownerCustom!.id,
        sharedCustomId: sharedCustom!.id
      })
    }
  })

  afterAll(async () => {
    // Deleting rows cascades to share rows via FK ON DELETE CASCADE.
    for (const spec of SPECS) {
      const entry = ids.get(spec.table)
      if (!entry) continue
      await admin
        .from(spec.table)
        .delete()
        .in('id', [
          entry.nonCustomId,
          entry.ownerCustomId,
          entry.sharedCustomId
        ])
    }
    await deleteTestUser(owner.id)
    await deleteTestUser(attacker.id)
    await deleteTestUser(sharedGuest.id)
  })

  it.each(SPECS)(
    '[$table] all authenticated users can SELECT non-custom rows',
    async (spec) => {
      const entry = ids.get(spec.table)!
      for (const user of [owner, attacker, sharedGuest]) {
        const { data, error } = await user.client
          .from(spec.table)
          .select('id')
          .eq('id', entry.nonCustomId)
        expect(error).toBeNull()
        expect(data).toHaveLength(1)
      }
    }
  )

  it.each(SPECS)(
    '[$table] only owner can SELECT their custom row',
    async (spec) => {
      const entry = ids.get(spec.table)!
      const { data: o } = await owner.client
        .from(spec.table)
        .select('id')
        .eq('id', entry.ownerCustomId)
      expect(o).toHaveLength(1)

      const { data: a } = await attacker.client
        .from(spec.table)
        .select('id')
        .eq('id', entry.ownerCustomId)
      expect(a).toEqual([])

      const { data: g } = await sharedGuest.client
        .from(spec.table)
        .select('id')
        .eq('id', entry.ownerCustomId)
      expect(g).toEqual([])
    }
  )

  it.each(SPECS)(
    '[$table] shared guest CAN SELECT the shared custom row but attacker cannot',
    async (spec) => {
      const entry = ids.get(spec.table)!
      const { data: g } = await sharedGuest.client
        .from(spec.table)
        .select('id')
        .eq('id', entry.sharedCustomId)
      expect(g).toHaveLength(1)

      const { data: a } = await attacker.client
        .from(spec.table)
        .select('id')
        .eq('id', entry.sharedCustomId)
      expect(a).toEqual([])
    }
  )

  it.each(SPECS)(
    '[$table] attacker cannot UPDATE or DELETE owner custom row',
    async (spec) => {
      const entry = ids.get(spec.table)!
      const updPayload = { [spec.nameCol]: 'HACKED' }

      const { data: upd } = await attacker.client
        .from(spec.table)
        .update(updPayload)
        .eq('id', entry.ownerCustomId)
        .select('id')
      expect(upd ?? []).toEqual([])

      const { data: del } = await attacker.client
        .from(spec.table)
        .delete()
        .eq('id', entry.ownerCustomId)
        .select('id')
      expect(del ?? []).toEqual([])

      // Confirm row unchanged.
      const { data: check } = await owner.client
        .from(spec.table)
        .select(spec.nameCol)
        .eq('id', entry.ownerCustomId)
        .single()
      expect(
        (check as unknown as Record<string, string>)[spec.nameCol]
      ).not.toBe('HACKED')
    }
  )

  it.each(SPECS)(
    '[$table] shared guest CAN UPDATE but cannot DELETE (documents shared access model)',
    async (spec) => {
      // Every catalog table pairs a `Allow update for shared and custom`
      // policy with its shared-user join table, so shared users can mutate
      // rows they've been granted access to. There is intentionally no
      // matching `Allow delete for shared` policy: delete is owner-only.
      // This test pins both halves of that decision.
      const entry = ids.get(spec.table)!
      const updPayload = { [spec.nameCol]: 'GUEST-EDIT' }

      const { data: upd, error: updErr } = await sharedGuest.client
        .from(spec.table)
        .update(updPayload)
        .eq('id', entry.sharedCustomId)
        .select('id')
      expect(updErr).toBeNull()
      expect(upd ?? []).toHaveLength(1)

      const { data: del } = await sharedGuest.client
        .from(spec.table)
        .delete()
        .eq('id', entry.sharedCustomId)
        .select('id')
      expect(del ?? []).toEqual([])

      // Row must still be visible to the owner.
      const { data: check } = await owner.client
        .from(spec.table)
        .select('id')
        .eq('id', entry.sharedCustomId)
      expect(check ?? []).toHaveLength(1)
    }
  )

  it.each(SPECS)(
    '[$table] attacker cannot INSERT a custom row impersonating another user',
    async (spec) => {
      const { data, error } = await attacker.client
        .from(spec.table)
        .insert({
          [spec.nameCol]: 'IMPERSONATION',
          custom: true,
          user_id: owner.id,
          ...spec.extras
        })
        .select('id')
      // With-check clause forces user_id = auth.uid(), so this must fail.
      expect(data ?? []).toEqual([])
      expect(error?.code).toMatch(/PGRST|42501/)
    }
  )

  it.each(SPECS)(
    '[$table] attacker cannot INSERT a non-custom (catalog) row',
    async (spec) => {
      // Only the admin / service role should create catalog rows. The policy
      // for `custom = false` has no insert path for regular users.
      const { data, error } = await attacker.client
        .from(spec.table)
        .insert({
          [spec.nameCol]: 'ROGUE CATALOG',
          custom: false,
          ...spec.extras
        })
        .select('id')
      expect(data ?? []).toEqual([])
      expect(error?.code).toMatch(/PGRST|42501/)
    }
  )
})
