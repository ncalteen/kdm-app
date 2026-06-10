import {
  admin,
  createTestUser,
  deleteTestUser,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — Vignette Encounter Sharing
 *
 * Exercises the sharing table and Lantern Hoard entitlement helper introduced
 * for VIG-01.03 / GitHub issue #335.
 */
describe('RLS: vignette encounter sharing', () => {
  let owner: TestUser
  let collaborator: TestUser
  let stranger: TestUser
  let vignetteEncounterDefinitionId: string
  let vignetteEncounterId: string

  beforeAll(async () => {
    owner = await createTestUser()
    collaborator = await createTestUser()
    stranger = await createTestUser()
    vignetteEncounterId = await seedVignetteEncounter(owner.id)
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)

    if (vignetteEncounterDefinitionId) {
      await admin
        .from('vignette_encounter_definition')
        .delete()
        .eq('id', vignetteEncounterDefinitionId)
    }
  })

  async function seedVignetteEncounter(userId: string): Promise<string> {
    const { data: quarry, error: quarryError } = await admin
      .from('quarry')
      .select('id')
      .limit(1)
      .single()
    expect(quarryError).toBeNull()
    expect(quarry).not.toBeNull()

    const { data: definition, error: definitionError } = await admin
      .from('vignette_encounter_definition')
      .insert({
        name: 'RLS Test Vignette',
        slug: `rls-test-vignette-${Date.now()}`,
        source_monster_type: 'QUARRY',
        source_quarry_id: quarry!.id,
        published: true
      })
      .select('id')
      .single()
    expect(definitionError).toBeNull()
    expect(definition).not.toBeNull()

    vignetteEncounterDefinitionId = definition!.id

    const { data: level, error: levelError } = await admin
      .from('vignette_encounter_level')
      .insert({
        vignette_encounter_definition_id: vignetteEncounterDefinitionId,
        level_number: 1
      })
      .select('id')
      .single()
    expect(levelError).toBeNull()
    expect(level).not.toBeNull()

    const { data: encounter, error: encounterError } = await admin
      .from('vignette_encounter')
      .insert({
        user_id: userId,
        vignette_encounter_definition_id: vignetteEncounterDefinitionId,
        vignette_encounter_level_id: level!.id
      })
      .select('id')
      .single()
    expect(encounterError).toBeNull()
    expect(encounter).not.toBeNull()

    return encounter!.id
  }

  async function setUserSubscription(
    userId: string,
    planId: 'free' | 'lantern' | 'lantern_hoard',
    status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete'
  ): Promise<void> {
    const { error } = await admin
      .from('user_subscription')
      .update({ plan_id: planId, status })
      .eq('user_id', userId)
    expect(error).toBeNull()
  }

  async function clearShares(): Promise<void> {
    const { error } = await admin
      .from('vignette_encounter_shared_user')
      .delete()
      .eq('vignette_encounter_id', vignetteEncounterId)
    expect(error).toBeNull()
  }

  it('denies share creation for a free owner', async () => {
    await setUserSubscription(owner.id, 'free', 'active')
    await clearShares()

    const { error } = await owner.client
      .from('vignette_encounter_shared_user')
      .insert({
        vignette_encounter_id: vignetteEncounterId,
        shared_user_id: collaborator.id,
        created_by: owner.id
      })

    expect(error).not.toBeNull()
  })

  it('allows an active Lantern Hoard owner to share with a free collaborator', async () => {
    await setUserSubscription(owner.id, 'lantern_hoard', 'active')
    await clearShares()

    const { error: insertError } = await owner.client
      .from('vignette_encounter_shared_user')
      .insert({
        vignette_encounter_id: vignetteEncounterId,
        shared_user_id: collaborator.id,
        created_by: owner.id
      })
    expect(insertError).toBeNull()

    const { data: collaboratorRows, error: collaboratorSelectError } =
      await collaborator.client
        .from('vignette_encounter_shared_user')
        .select('vignette_encounter_id, shared_user_id, created_by')
        .eq('vignette_encounter_id', vignetteEncounterId)
    expect(collaboratorSelectError).toBeNull()
    expect(collaboratorRows).toEqual([
      {
        vignette_encounter_id: vignetteEncounterId,
        shared_user_id: collaborator.id,
        created_by: owner.id
      }
    ])

    const { data: strangerRows, error: strangerSelectError } =
      await stranger.client
        .from('vignette_encounter_shared_user')
        .select('vignette_encounter_id')
        .eq('vignette_encounter_id', vignetteEncounterId)
    expect(strangerSelectError).toBeNull()
    expect(strangerRows).toEqual([])
  })

  it('prevents non-owners and collaborators from managing shares', async () => {
    await setUserSubscription(owner.id, 'lantern_hoard', 'active')
    await setUserSubscription(collaborator.id, 'lantern_hoard', 'active')
    await clearShares()

    const { error: ownerInsertError } = await owner.client
      .from('vignette_encounter_shared_user')
      .insert({
        vignette_encounter_id: vignetteEncounterId,
        shared_user_id: collaborator.id,
        created_by: owner.id
      })
    expect(ownerInsertError).toBeNull()

    const { error: collaboratorInsertError } = await collaborator.client
      .from('vignette_encounter_shared_user')
      .insert({
        vignette_encounter_id: vignetteEncounterId,
        shared_user_id: stranger.id,
        created_by: collaborator.id
      })
    expect(collaboratorInsertError).not.toBeNull()

    const { error: collaboratorDeleteError } = await collaborator.client
      .from('vignette_encounter_shared_user')
      .delete()
      .eq('vignette_encounter_id', vignetteEncounterId)
      .eq('shared_user_id', collaborator.id)
    expect(collaboratorDeleteError).toBeNull()

    const { data: stillSharedRows, error: stillSharedError } = await admin
      .from('vignette_encounter_shared_user')
      .select('shared_user_id')
      .eq('vignette_encounter_id', vignetteEncounterId)
    expect(stillSharedError).toBeNull()
    expect(stillSharedRows).toEqual([{ shared_user_id: collaborator.id }])

    const { error: ownerDeleteError } = await owner.client
      .from('vignette_encounter_shared_user')
      .delete()
      .eq('vignette_encounter_id', vignetteEncounterId)
      .eq('shared_user_id', collaborator.id)
    expect(ownerDeleteError).toBeNull()

    const { data: remainingRows, error: remainingError } = await admin
      .from('vignette_encounter_shared_user')
      .select('shared_user_id')
      .eq('vignette_encounter_id', vignetteEncounterId)
    expect(remainingError).toBeNull()
    expect(remainingRows).toEqual([])
  })

  it('prevents owners from sharing a vignette with themselves', async () => {
    await setUserSubscription(owner.id, 'lantern_hoard', 'active')
    await clearShares()

    const { error } = await owner.client
      .from('vignette_encounter_shared_user')
      .insert({
        vignette_encounter_id: vignetteEncounterId,
        shared_user_id: owner.id,
        created_by: owner.id
      })

    expect(error).not.toBeNull()
  })
})
