import {
  admin,
  createTestUser,
  deleteTestUser,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — Philosophy Rank Table
 *
 * `philosophy_rank` has no ownership columns of its own; access is derived
 * from the parent `philosophy` row via six policies:
 *
 *   1. INSERT — owner of a custom philosophy only.
 *   2. SELECT — any authenticated user when parent philosophy is non-custom.
 *   3. SELECT — owner of a custom philosophy.
 *   4. UPDATE — owner of a custom philosophy.
 *   5. DELETE — owner of a custom philosophy.
 *   6. SELECT — user present in `philosophy_shared_user` for the parent.
 *
 * Notably there is **no** update/delete/insert policy for shared guests:
 * shared access to a philosophy is read-only at the rank level.
 */
describe('RLS: philosophy_rank', () => {
  let owner: TestUser
  let attacker: TestUser
  let sharedGuest: TestUser

  let nonCustomPhilosophyId: string
  let ownerCustomPhilosophyId: string
  let sharedCustomPhilosophyId: string

  let nonCustomRankId: string
  let ownerCustomRankId: string
  let sharedCustomRankId: string

  beforeAll(async () => {
    owner = await createTestUser()
    attacker = await createTestUser()
    sharedGuest = await createTestUser()

    const insertPhilosophy = async (row: {
      philosophy_name: string
      custom: boolean
      user_id?: string
    }): Promise<string> => {
      const { data, error } = await admin
        .from('philosophy')
        .insert(row)
        .select('id')
        .single<{ id: string }>()
      if (error || !data) throw new Error(`seed philosophy: ${error?.message}`)
      return data.id
    }

    const insertRank = async (philosophyId: string): Promise<string> => {
      const { data, error } = await admin
        .from('philosophy_rank')
        .insert({
          philosophy_id: philosophyId,
          rank_number: 1,
          rules: 'RLS rank rules'
        })
        .select('id')
        .single<{ id: string }>()
      if (error || !data)
        throw new Error(`seed philosophy_rank: ${error?.message}`)
      return data.id
    }

    nonCustomPhilosophyId = await insertPhilosophy({
      philosophy_name: 'RLS-philosophy_rank-nc',
      custom: false
    })
    ownerCustomPhilosophyId = await insertPhilosophy({
      philosophy_name: 'RLS-philosophy_rank-own',
      custom: true,
      user_id: owner.id
    })
    sharedCustomPhilosophyId = await insertPhilosophy({
      philosophy_name: 'RLS-philosophy_rank-shared',
      custom: true,
      user_id: owner.id
    })

    const { error: shareErr } = await admin
      .from('philosophy_shared_user')
      .insert({
        philosophy_id: sharedCustomPhilosophyId,
        shared_user_id: sharedGuest.id,
        user_id: owner.id
      })
    if (shareErr) throw new Error(`share philosophy: ${shareErr.message}`)

    nonCustomRankId = await insertRank(nonCustomPhilosophyId)
    ownerCustomRankId = await insertRank(ownerCustomPhilosophyId)
    sharedCustomRankId = await insertRank(sharedCustomPhilosophyId)
  })

  afterAll(async () => {
    // Cascades delete ranks + shared_user rows via FK ON DELETE CASCADE.
    await admin
      .from('philosophy')
      .delete()
      .in('id', [
        nonCustomPhilosophyId,
        ownerCustomPhilosophyId,
        sharedCustomPhilosophyId
      ])
    await deleteTestUser(owner.id)
    await deleteTestUser(attacker.id)
    await deleteTestUser(sharedGuest.id)
  })

  // --------------------------------------------------------------------------
  // SELECT
  // --------------------------------------------------------------------------

  it('all authenticated users CAN SELECT ranks of a non-custom philosophy', async () => {
    for (const user of [owner, attacker, sharedGuest]) {
      const { data, error } = await user.client
        .from('philosophy_rank')
        .select('id')
        .eq('id', nonCustomRankId)
      expect(error).toBeNull()
      expect(data).toHaveLength(1)
    }
  })

  it('only the owner CAN SELECT ranks of their own custom philosophy', async () => {
    const { data: o } = await owner.client
      .from('philosophy_rank')
      .select('id')
      .eq('id', ownerCustomRankId)
    expect(o).toHaveLength(1)

    const { data: a } = await attacker.client
      .from('philosophy_rank')
      .select('id')
      .eq('id', ownerCustomRankId)
    expect(a).toEqual([])

    const { data: g } = await sharedGuest.client
      .from('philosophy_rank')
      .select('id')
      .eq('id', ownerCustomRankId)
    expect(g).toEqual([])
  })

  it('shared guest CAN SELECT ranks of a shared custom philosophy but attacker cannot', async () => {
    const { data: g } = await sharedGuest.client
      .from('philosophy_rank')
      .select('id')
      .eq('id', sharedCustomRankId)
    expect(g).toHaveLength(1)

    const { data: a } = await attacker.client
      .from('philosophy_rank')
      .select('id')
      .eq('id', sharedCustomRankId)
    expect(a).toEqual([])
  })

  // --------------------------------------------------------------------------
  // INSERT
  // --------------------------------------------------------------------------

  it('owner CAN INSERT a rank into their own custom philosophy', async () => {
    const { data, error } = await owner.client
      .from('philosophy_rank')
      .insert({
        philosophy_id: ownerCustomPhilosophyId,
        rank_number: 99,
        rules: 'Owner insert'
      })
      .select('id')
      .single<{ id: string }>()
    expect(error).toBeNull()
    expect(data?.id).toBeDefined()

    // Clean up the extra row so other assertions stay stable.
    if (data?.id) await admin.from('philosophy_rank').delete().eq('id', data.id)
  })

  it('attacker cannot INSERT a rank into a philosophy they do not own', async () => {
    const { data, error } = await attacker.client
      .from('philosophy_rank')
      .insert({
        philosophy_id: ownerCustomPhilosophyId,
        rank_number: 100,
        rules: 'HACK'
      })
      .select('id')
    expect(data ?? []).toEqual([])
    expect(error?.code).toMatch(/PGRST|42501/)
  })

  it('shared guest cannot INSERT a rank into a philosophy shared with them', async () => {
    // Shared access is read-only at the rank level.
    const { data, error } = await sharedGuest.client
      .from('philosophy_rank')
      .insert({
        philosophy_id: sharedCustomPhilosophyId,
        rank_number: 101,
        rules: 'GUEST-INSERT'
      })
      .select('id')
    expect(data ?? []).toEqual([])
    expect(error?.code).toMatch(/PGRST|42501/)
  })

  it('no user (including owner) can INSERT a rank into a non-custom philosophy', async () => {
    // Only admin / service role should ever attach ranks to catalog rows.
    for (const user of [owner, attacker, sharedGuest]) {
      const { data, error } = await user.client
        .from('philosophy_rank')
        .insert({
          philosophy_id: nonCustomPhilosophyId,
          rank_number: 200,
          rules: 'ROGUE CATALOG'
        })
        .select('id')
      expect(data ?? []).toEqual([])
      expect(error?.code).toMatch(/PGRST|42501/)
    }
  })

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------

  it('owner CAN UPDATE a rank on their own custom philosophy', async () => {
    const { data, error } = await owner.client
      .from('philosophy_rank')
      .update({ rules: 'Owner edit' })
      .eq('id', ownerCustomRankId)
      .select('id')
    expect(error).toBeNull()
    expect(data ?? []).toHaveLength(1)
  })

  it('attacker cannot UPDATE a rank on a philosophy they do not own', async () => {
    const { data } = await attacker.client
      .from('philosophy_rank')
      .update({ rules: 'HACKED' })
      .eq('id', ownerCustomRankId)
      .select('id')
    expect(data ?? []).toEqual([])

    const { data: check } = await owner.client
      .from('philosophy_rank')
      .select('rules')
      .eq('id', ownerCustomRankId)
      .single<{ rules: string }>()
    expect(check?.rules).not.toBe('HACKED')
  })

  it('shared guest cannot UPDATE a rank on a philosophy shared with them', async () => {
    // No "Allow update for shared" policy exists; share grants read only.
    const { data } = await sharedGuest.client
      .from('philosophy_rank')
      .update({ rules: 'GUEST-EDIT' })
      .eq('id', sharedCustomRankId)
      .select('id')
    expect(data ?? []).toEqual([])

    const { data: check } = await owner.client
      .from('philosophy_rank')
      .select('rules')
      .eq('id', sharedCustomRankId)
      .single<{ rules: string }>()
    expect(check?.rules).not.toBe('GUEST-EDIT')
  })

  it('no user (including owner) can UPDATE a rank on a non-custom philosophy', async () => {
    for (const user of [owner, attacker, sharedGuest]) {
      const { data } = await user.client
        .from('philosophy_rank')
        .update({ rules: 'CATALOG-EDIT' })
        .eq('id', nonCustomRankId)
        .select('id')
      expect(data ?? []).toEqual([])
    }

    const { data: check } = await admin
      .from('philosophy_rank')
      .select('rules')
      .eq('id', nonCustomRankId)
      .single<{ rules: string }>()
    expect(check?.rules).not.toBe('CATALOG-EDIT')
  })

  // --------------------------------------------------------------------------
  // DELETE
  // --------------------------------------------------------------------------

  it('attacker cannot DELETE a rank on a philosophy they do not own', async () => {
    const { data } = await attacker.client
      .from('philosophy_rank')
      .delete()
      .eq('id', ownerCustomRankId)
      .select('id')
    expect(data ?? []).toEqual([])

    const { data: check } = await owner.client
      .from('philosophy_rank')
      .select('id')
      .eq('id', ownerCustomRankId)
    expect(check).toHaveLength(1)
  })

  it('shared guest cannot DELETE a rank on a philosophy shared with them', async () => {
    const { data } = await sharedGuest.client
      .from('philosophy_rank')
      .delete()
      .eq('id', sharedCustomRankId)
      .select('id')
    expect(data ?? []).toEqual([])

    const { data: check } = await owner.client
      .from('philosophy_rank')
      .select('id')
      .eq('id', sharedCustomRankId)
    expect(check).toHaveLength(1)
  })

  it('no user can DELETE a rank on a non-custom philosophy', async () => {
    for (const user of [owner, attacker, sharedGuest]) {
      const { data } = await user.client
        .from('philosophy_rank')
        .delete()
        .eq('id', nonCustomRankId)
        .select('id')
      expect(data ?? []).toEqual([])
    }

    const { data: check } = await admin
      .from('philosophy_rank')
      .select('id')
      .eq('id', nonCustomRankId)
    expect(check).toHaveLength(1)
  })

  it('owner CAN DELETE a rank on their own custom philosophy', async () => {
    // Create a throwaway rank so the shared afterAll cleanup stays simple.
    const { data: created, error: createErr } = await admin
      .from('philosophy_rank')
      .insert({
        philosophy_id: ownerCustomPhilosophyId,
        rank_number: 2,
        rules: 'to delete'
      })
      .select('id')
      .single<{ id: string }>()
    expect(createErr).toBeNull()

    const { data, error } = await owner.client
      .from('philosophy_rank')
      .delete()
      .eq('id', created!.id)
      .select('id')
    expect(error).toBeNull()
    expect(data ?? []).toHaveLength(1)
  })
})
