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
 * Exercises vignette instance ownership, collaboration, and sharing policies
 * introduced for VIG-01.04 / GitHub issue #332.
 */
describe('RLS: vignette encounter sharing', () => {
  let owner: TestUser
  let collaborator: TestUser
  let stranger: TestUser
  const vignetteEncounterDefinitionIds: string[] = []
  let vignetteEncounterId: string
  let vignetteEncounterMonsterId: string
  let vignetteEncounterSurvivorId: string
  let vignetteEncounterGearGridId: string

  beforeAll(async () => {
    owner = await createTestUser()
    collaborator = await createTestUser()
    stranger = await createTestUser()
    vignetteEncounterId = await seedVignetteEncounter(owner.id)
    const stateIds =
      await seedVignetteEncounterGameplayState(vignetteEncounterId)
    vignetteEncounterMonsterId = stateIds.monsterId
    vignetteEncounterSurvivorId = stateIds.survivorId
    vignetteEncounterGearGridId = stateIds.gearGridId
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)

    if (vignetteEncounterDefinitionIds.length > 0) {
      await admin
        .from('vignette_encounter_definition')
        .delete()
        .in('id', vignetteEncounterDefinitionIds)
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

    const vignetteEncounterDefinitionId = definition!.id
    vignetteEncounterDefinitionIds.push(vignetteEncounterDefinitionId)

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

  async function seedVignetteEncounterGameplayState(
    encounterId: string
  ): Promise<{ monsterId: string; survivorId: string; gearGridId: string }> {
    const { data: gear, error: gearError } = await admin
      .from('gear')
      .select('id')
      .limit(1)
      .single()
    expect(gearError).toBeNull()
    expect(gear).not.toBeNull()

    const { data: monster, error: monsterError } = await admin
      .from('vignette_encounter_monster')
      .insert({ vignette_encounter_id: encounterId })
      .select('id')
      .single()
    expect(monsterError).toBeNull()
    expect(monster).not.toBeNull()

    const { data: survivor, error: survivorError } = await admin
      .from('vignette_encounter_survivor')
      .insert({
        vignette_encounter_id: encounterId,
        survivor_name: 'RLS Vignette Survivor'
      })
      .select('id')
      .single()
    expect(survivorError).toBeNull()
    expect(survivor).not.toBeNull()

    const { data: gearGrid, error: gearGridError } = await admin
      .from('vignette_encounter_gear_grid')
      .insert({
        vignette_encounter_survivor_id: survivor!.id,
        gear_id: gear!.id,
        row_number: 0,
        column_number: 0
      })
      .select('id')
      .single()
    expect(gearGridError).toBeNull()
    expect(gearGrid).not.toBeNull()

    return {
      monsterId: monster!.id,
      survivorId: survivor!.id,
      gearGridId: gearGrid!.id
    }
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

  it('allows the owner to create and update their own active vignette instance', async () => {
    const tempOwner = await createTestUser()
    const tempEncounterId = await seedVignetteEncounter(tempOwner.id)

    const { data: selected, error: selectError } = await tempOwner.client
      .from('vignette_encounter')
      .select('id, round')
      .eq('id', tempEncounterId)
    expect(selectError).toBeNull()
    expect(selected).toEqual([{ id: tempEncounterId, round: 1 }])

    const { data: updated, error: updateError } = await tempOwner.client
      .from('vignette_encounter')
      .update({ round: 2, notes: 'Owner keeps the lantern high' })
      .eq('id', tempEncounterId)
      .select('id, round, notes')
    expect(updateError).toBeNull()
    expect(updated).toEqual([
      {
        id: tempEncounterId,
        round: 2,
        notes: 'Owner keeps the lantern high'
      }
    ])

    await deleteTestUser(tempOwner.id)
  })

  it('allows the owner to end their own active vignette instance', async () => {
    const tempOwner = await createTestUser()
    const tempEncounterId = await seedVignetteEncounter(tempOwner.id)
    const endedAt = new Date().toISOString()

    const { data, error } = await tempOwner.client
      .from('vignette_encounter')
      .update({ status: 'ENDED', ended_at: endedAt })
      .eq('id', tempEncounterId)
      .select('id, status, ended_at')
    expect(error).toBeNull()
    expect(data).toEqual([
      {
        id: tempEncounterId,
        status: 'ENDED',
        ended_at: expect.any(String)
      }
    ])
    expect(new Date(data![0].ended_at!).toISOString()).toBe(endedAt)

    await deleteTestUser(tempOwner.id)
  })

  it('allows the owner to delete their own active vignette instance', async () => {
    const tempOwner = await createTestUser()
    const tempEncounterId = await seedVignetteEncounter(tempOwner.id)

    const { error } = await tempOwner.client
      .from('vignette_encounter')
      .delete()
      .eq('id', tempEncounterId)
    expect(error).toBeNull()

    const { data: remaining, error: remainingError } = await admin
      .from('vignette_encounter')
      .select('id')
      .eq('id', tempEncounterId)
    expect(remainingError).toBeNull()
    expect(remaining).toEqual([])

    await deleteTestUser(tempOwner.id)
  })

  it('allows a collaborator to read and update active gameplay state', async () => {
    await setUserSubscription(owner.id, 'lantern_hoard', 'active')
    await clearShares()

    const { error: shareError } = await owner.client
      .from('vignette_encounter_shared_user')
      .insert({
        vignette_encounter_id: vignetteEncounterId,
        shared_user_id: collaborator.id,
        created_by: owner.id
      })
    expect(shareError).toBeNull()

    const { data: encounterRows, error: encounterSelectError } =
      await collaborator.client
        .from('vignette_encounter')
        .select('id, round')
        .eq('id', vignetteEncounterId)
    expect(encounterSelectError).toBeNull()
    expect(encounterRows).toEqual([{ id: vignetteEncounterId, round: 1 }])

    const { data: encounterUpdate, error: encounterUpdateError } =
      await collaborator.client
        .from('vignette_encounter')
        .update({ round: 2, notes: 'Collaborator trims the wick' })
        .eq('id', vignetteEncounterId)
        .select('id, round, notes')
    expect(encounterUpdateError).toBeNull()
    expect(encounterUpdate).toEqual([
      {
        id: vignetteEncounterId,
        round: 2,
        notes: 'Collaborator trims the wick'
      }
    ])

    const { data: monsterUpdate, error: monsterUpdateError } =
      await collaborator.client
        .from('vignette_encounter_monster')
        .update({ current_wounds: 3, knocked_down: true })
        .eq('id', vignetteEncounterMonsterId)
        .select('id, current_wounds, knocked_down')
    expect(monsterUpdateError).toBeNull()
    expect(monsterUpdate).toEqual([
      {
        id: vignetteEncounterMonsterId,
        current_wounds: 3,
        knocked_down: true
      }
    ])

    const { data: survivorUpdate, error: survivorUpdateError } =
      await collaborator.client
        .from('vignette_encounter_survivor')
        .update({ survival: 2, notes: 'The survivor refuses the dark' })
        .eq('id', vignetteEncounterSurvivorId)
        .select('id, survival, notes')
    expect(survivorUpdateError).toBeNull()
    expect(survivorUpdate).toEqual([
      {
        id: vignetteEncounterSurvivorId,
        survival: 2,
        notes: 'The survivor refuses the dark'
      }
    ])

    const { data: gearGridUpdate, error: gearGridUpdateError } =
      await collaborator.client
        .from('vignette_encounter_gear_grid')
        .update({ row_number: 1, column_number: 1 })
        .eq('id', vignetteEncounterGearGridId)
        .select('id, row_number, column_number')
    expect(gearGridUpdateError).toBeNull()
    expect(gearGridUpdate).toEqual([
      {
        id: vignetteEncounterGearGridId,
        row_number: 1,
        column_number: 1
      }
    ])
  })

  it('prevents a collaborator from ending or deleting a vignette instance', async () => {
    await setUserSubscription(owner.id, 'lantern_hoard', 'active')
    await clearShares()

    const { error: shareError } = await owner.client
      .from('vignette_encounter_shared_user')
      .insert({
        vignette_encounter_id: vignetteEncounterId,
        shared_user_id: collaborator.id,
        created_by: owner.id
      })
    expect(shareError).toBeNull()

    const { error: endError } = await collaborator.client
      .from('vignette_encounter')
      .update({ status: 'ENDED', ended_at: new Date().toISOString() })
      .eq('id', vignetteEncounterId)
    expect(endError).not.toBeNull()

    const { error: deleteError } = await collaborator.client
      .from('vignette_encounter')
      .delete()
      .eq('id', vignetteEncounterId)
    expect(deleteError).toBeNull()

    const { data: remaining, error: remainingError } = await admin
      .from('vignette_encounter')
      .select('id, status')
      .eq('id', vignetteEncounterId)
    expect(remainingError).toBeNull()
    expect(remaining).toEqual([{ id: vignetteEncounterId, status: 'ACTIVE' }])
  })

  it('prevents strangers from reading or mutating vignette instance rows', async () => {
    await setUserSubscription(owner.id, 'lantern_hoard', 'active')
    await clearShares()

    const { data: encounterRows, error: encounterSelectError } =
      await stranger.client
        .from('vignette_encounter')
        .select('id')
        .eq('id', vignetteEncounterId)
    expect(encounterSelectError).toBeNull()
    expect(encounterRows).toEqual([])

    const { data: updateRows, error: updateError } = await stranger.client
      .from('vignette_encounter_monster')
      .update({ current_wounds: 9 })
      .eq('id', vignetteEncounterMonsterId)
      .select('id')
    expect(updateError).toBeNull()
    expect(updateRows).toEqual([])

    const { data: monsterRows, error: monsterRowsError } = await admin
      .from('vignette_encounter_monster')
      .select('id, current_wounds')
      .eq('id', vignetteEncounterMonsterId)
    expect(monsterRowsError).toBeNull()
    expect(monsterRows).toEqual([
      { id: vignetteEncounterMonsterId, current_wounds: 3 }
    ])
  })

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

  it('prevents duplicate shares for the same vignette and collaborator', async () => {
    await setUserSubscription(owner.id, 'lantern_hoard', 'active')
    await clearShares()

    const share = {
      vignette_encounter_id: vignetteEncounterId,
      shared_user_id: collaborator.id,
      created_by: owner.id
    }

    const { error: firstInsertError } = await owner.client
      .from('vignette_encounter_shared_user')
      .insert(share)
    expect(firstInsertError).toBeNull()

    const { error: duplicateInsertError } = await owner.client
      .from('vignette_encounter_shared_user')
      .insert(share)
    expect(duplicateInsertError).not.toBeNull()

    const { data: shareRows, error: shareRowsError } = await admin
      .from('vignette_encounter_shared_user')
      .select('shared_user_id')
      .eq('vignette_encounter_id', vignetteEncounterId)
    expect(shareRowsError).toBeNull()
    expect(shareRows).toEqual([{ shared_user_id: collaborator.id }])
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
