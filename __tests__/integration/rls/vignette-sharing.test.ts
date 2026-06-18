import {
  admin,
  createTestUser,
  deleteTestUser,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS - Vignette Encounter Sharing
 *
 * Exercises vignette instance ownership, collaboration, and sharing policies
 * against the final VIG-01 active encounter schema.
 */
describe('RLS: vignette encounter sharing', () => {
  let owner: TestUser
  let collaborator: TestUser
  let stranger: TestUser
  const vignetteMonsterIds: string[] = []
  const moodIds: string[] = []
  const traitIds: string[] = []
  const survivorStatusIds: string[] = []
  let vignetteMonsterId: string
  let vignetteEncounterId: string
  let vignetteEncounterAiDeckId: string
  let vignetteEncounterMonsterId: string
  let vignetteEncounterMonsterMoodId: string
  let vignetteEncounterMonsterTraitId: string
  let vignetteEncounterMonsterSurvivorStatusId: string
  let vignetteEncounterSurvivorId: string
  let vignetteEncounterGearGridId: string
  let moodId: string
  let alternateMoodId: string
  let traitId: string
  let alternateTraitId: string
  let survivorStatusId: string
  let alternateSurvivorStatusId: string

  beforeAll(async () => {
    owner = await createTestUser()
    collaborator = await createTestUser()
    stranger = await createTestUser()
    const primaryCards = await seedMonsterStateCards('primary')
    moodId = primaryCards.moodId
    traitId = primaryCards.traitId
    survivorStatusId = primaryCards.survivorStatusId
    const alternateCards = await seedMonsterStateCards('alternate')
    alternateMoodId = alternateCards.moodId
    alternateTraitId = alternateCards.traitId
    alternateSurvivorStatusId = alternateCards.survivorStatusId
    vignetteMonsterId = await seedVignetteMonster()
    vignetteEncounterId = await seedVignetteEncounter(owner.id)
    const stateIds =
      await seedVignetteEncounterGameplayState(vignetteEncounterId)
    vignetteEncounterAiDeckId = stateIds.aiDeckId
    vignetteEncounterMonsterId = stateIds.monsterId
    vignetteEncounterMonsterMoodId = stateIds.monsterMoodId
    vignetteEncounterMonsterTraitId = stateIds.monsterTraitId
    vignetteEncounterMonsterSurvivorStatusId = stateIds.monsterSurvivorStatusId
    vignetteEncounterSurvivorId = stateIds.survivorId
    vignetteEncounterGearGridId = stateIds.gearGridId
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)

    if (vignetteMonsterIds.length > 0) {
      await admin.from('vignette_monster').delete().in('id', vignetteMonsterIds)
    }
    if (moodIds.length > 0) await admin.from('mood').delete().in('id', moodIds)
    if (traitIds.length > 0)
      await admin.from('trait').delete().in('id', traitIds)
    if (survivorStatusIds.length > 0) {
      await admin.from('survivor_status').delete().in('id', survivorStatusIds)
    }
  })

  async function seedMonsterStateCards(label: string): Promise<{
    moodId: string
    traitId: string
    survivorStatusId: string
  }> {
    const suffix = `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const { data: mood, error: moodError } = await admin
      .from('mood')
      .insert({ custom: false, mood_name: `RLS Vignette Mood ${suffix}` })
      .select('id')
      .single()
    expect(moodError).toBeNull()
    expect(mood).not.toBeNull()
    moodIds.push(mood!.id)

    const { data: trait, error: traitError } = await admin
      .from('trait')
      .insert({ custom: false, trait_name: `RLS Vignette Trait ${suffix}` })
      .select('id')
      .single()
    expect(traitError).toBeNull()
    expect(trait).not.toBeNull()
    traitIds.push(trait!.id)

    const { data: survivorStatus, error: survivorStatusError } = await admin
      .from('survivor_status')
      .insert({
        custom: false,
        survivor_status_name: `RLS Vignette Status ${suffix}`
      })
      .select('id')
      .single()
    expect(survivorStatusError).toBeNull()
    expect(survivorStatus).not.toBeNull()
    survivorStatusIds.push(survivorStatus!.id)

    return {
      moodId: mood!.id,
      traitId: trait!.id,
      survivorStatusId: survivorStatus!.id
    }
  }

  async function seedVignetteMonster(): Promise<string> {
    const { data: quarry, error: quarryError } = await admin
      .from('quarry')
      .select('id')
      .limit(1)
      .single()
    expect(quarryError).toBeNull()
    expect(quarry).not.toBeNull()

    const { data: monster, error: monsterError } = await admin
      .from('vignette_monster')
      .insert({
        monster_name: `RLS Test Vignette ${Date.now()}`,
        source_monster_type: 'QUARRY',
        source_quarry_id: quarry!.id
      })
      .select('id')
      .single()
    expect(monsterError).toBeNull()
    expect(monster).not.toBeNull()

    const monsterId = monster!.id
    vignetteMonsterIds.push(monsterId)

    const { error: levelError } = await admin
      .from('vignette_monster_level')
      .insert({
        vignette_monster_id: monsterId,
        level_number: 1
      })
    expect(levelError).toBeNull()

    return monsterId
  }

  async function seedVignetteEncounter(userId: string): Promise<string> {
    const { data: encounter, error: encounterError } = await admin
      .from('vignette_encounter')
      .insert({
        user_id: userId,
        vignette_monster_id: vignetteMonsterId,
        level_number: 1
      })
      .select('id')
      .single()
    expect(encounterError).toBeNull()
    expect(encounter).not.toBeNull()

    return encounter!.id
  }

  async function seedVignetteEncounterGameplayState(
    encounterId: string
  ): Promise<{
    aiDeckId: string
    monsterId: string
    monsterMoodId: string
    monsterTraitId: string
    monsterSurvivorStatusId: string
    survivorId: string
    gearGridId: string
  }> {
    const { data: gear, error: gearError } = await admin
      .from('gear')
      .select('id')
      .limit(1)
      .single()
    expect(gearError).toBeNull()
    expect(gear).not.toBeNull()

    const { data: aiDeck, error: aiDeckError } = await admin
      .from('vignette_encounter_ai_deck')
      .insert({ vignette_encounter_id: encounterId, basic_cards: 1 })
      .select('id')
      .single()
    expect(aiDeckError).toBeNull()
    expect(aiDeck).not.toBeNull()

    const { data: monster, error: monsterError } = await admin
      .from('vignette_encounter_monster')
      .insert({
        ai_deck_id: aiDeck!.id,
        vignette_encounter_id: encounterId,
        monster_name: 'RLS Vignette Monster'
      })
      .select('id')
      .single()
    expect(monsterError).toBeNull()
    expect(monster).not.toBeNull()

    const { data: monsterMood, error: monsterMoodError } = await admin
      .from('vignette_encounter_monster_mood')
      .insert({
        vignette_encounter_monster_id: monster!.id,
        mood_id: moodId
      })
      .select('id')
      .single()
    expect(monsterMoodError).toBeNull()
    expect(monsterMood).not.toBeNull()

    const { data: monsterTrait, error: monsterTraitError } = await admin
      .from('vignette_encounter_monster_trait')
      .insert({
        vignette_encounter_monster_id: monster!.id,
        trait_id: traitId
      })
      .select('id')
      .single()
    expect(monsterTraitError).toBeNull()
    expect(monsterTrait).not.toBeNull()

    const { data: monsterSurvivorStatus, error: monsterSurvivorStatusError } =
      await admin
        .from('vignette_encounter_monster_survivor_status')
        .insert({
          vignette_encounter_monster_id: monster!.id,
          survivor_status_id: survivorStatusId
        })
        .select('id')
        .single()
    expect(monsterSurvivorStatusError).toBeNull()
    expect(monsterSurvivorStatus).not.toBeNull()

    const { data: survivor, error: survivorError } = await admin
      .from('vignette_encounter_survivor')
      .insert({
        vignette_monster_id: vignetteMonsterId,
        vignette_encounter_id: encounterId,
        survivor_name: 'RLS Vignette Survivor'
      })
      .select('id')
      .single()
    expect(survivorError).toBeNull()
    expect(survivor).not.toBeNull()

    const { data: gearGrid, error: gearGridError } = await admin
      .from('vignette_encounter_survivor_gear_grid')
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
      aiDeckId: aiDeck!.id,
      monsterId: monster!.id,
      monsterMoodId: monsterMood!.id,
      monsterTraitId: monsterTrait!.id,
      monsterSurvivorStatusId: monsterSurvivorStatus!.id,
      survivorId: survivor!.id,
      gearGridId: gearGrid!.id
    }
  }

  function monsterStateCases(cardIds: {
    moodId: string
    traitId: string
    survivorStatusId: string
  }): Array<{
    table:
      | 'vignette_encounter_monster_mood'
      | 'vignette_encounter_monster_trait'
      | 'vignette_encounter_monster_survivor_status'
    cardColumn: 'mood_id' | 'trait_id' | 'survivor_status_id'
    cardId: string
  }> {
    return [
      {
        table: 'vignette_encounter_monster_mood',
        cardColumn: 'mood_id',
        cardId: cardIds.moodId
      },
      {
        table: 'vignette_encounter_monster_trait',
        cardColumn: 'trait_id',
        cardId: cardIds.traitId
      },
      {
        table: 'vignette_encounter_monster_survivor_status',
        cardColumn: 'survivor_status_id',
        cardId: cardIds.survivorStatusId
      }
    ]
  }

  function seededMonsterStateCases(): Array<{
    table:
      | 'vignette_encounter_monster_mood'
      | 'vignette_encounter_monster_trait'
      | 'vignette_encounter_monster_survivor_status'
    cardColumn: 'mood_id' | 'trait_id' | 'survivor_status_id'
    cardId: string
    rowId: string
  }> {
    return [
      {
        table: 'vignette_encounter_monster_mood',
        cardColumn: 'mood_id',
        cardId: moodId,
        rowId: vignetteEncounterMonsterMoodId
      },
      {
        table: 'vignette_encounter_monster_trait',
        cardColumn: 'trait_id',
        cardId: traitId,
        rowId: vignetteEncounterMonsterTraitId
      },
      {
        table: 'vignette_encounter_monster_survivor_status',
        cardColumn: 'survivor_status_id',
        cardId: survivorStatusId,
        rowId: vignetteEncounterMonsterSurvivorStatusId
      }
    ]
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

  async function shareWithCollaborator(): Promise<void> {
    await setUserSubscription(owner.id, 'lantern_hoard', 'active')
    await clearShares()

    const { error } = await owner.client
      .from('vignette_encounter_shared_user')
      .insert({
        vignette_encounter_id: vignetteEncounterId,
        shared_user_id: collaborator.id
      })
    expect(error).toBeNull()
  }

  it('allows the owner to create and update their own vignette instance', async () => {
    const tempOwner = await createTestUser()
    const tempEncounterId = await seedVignetteEncounter(tempOwner.id)

    const { data: selected, error: selectError } = await tempOwner.client
      .from('vignette_encounter')
      .select('id, turn')
      .eq('id', tempEncounterId)
    expect(selectError).toBeNull()
    expect(selected).toEqual([{ id: tempEncounterId, turn: 'MONSTER' }])

    const { data: updated, error: updateError } = await tempOwner.client
      .from('vignette_encounter')
      .update({ turn: 'SURVIVOR', notes: 'Owner keeps the lantern high' })
      .eq('id', tempEncounterId)
      .select('id, turn, notes')
    expect(updateError).toBeNull()
    expect(updated).toEqual([
      {
        id: tempEncounterId,
        turn: 'SURVIVOR',
        notes: 'Owner keeps the lantern high'
      }
    ])

    await deleteTestUser(tempOwner.id)
  })

  it('allows the owner to delete their own vignette instance', async () => {
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
    await shareWithCollaborator()

    const { data: encounterRows, error: encounterSelectError } =
      await collaborator.client
        .from('vignette_encounter')
        .select('id, turn')
        .eq('id', vignetteEncounterId)
    expect(encounterSelectError).toBeNull()
    expect(encounterRows).toEqual([
      { id: vignetteEncounterId, turn: 'MONSTER' }
    ])

    const { data: encounterUpdate, error: encounterUpdateError } =
      await collaborator.client
        .from('vignette_encounter')
        .update({ turn: 'SURVIVOR', notes: 'Collaborator trims the wick' })
        .eq('id', vignetteEncounterId)
        .select('id, turn, notes')
    expect(encounterUpdateError).toBeNull()
    expect(encounterUpdate).toEqual([
      {
        id: vignetteEncounterId,
        turn: 'SURVIVOR',
        notes: 'Collaborator trims the wick'
      }
    ])

    const { data: aiDeckUpdate, error: aiDeckUpdateError } =
      await collaborator.client
        .from('vignette_encounter_ai_deck')
        .update({ basic_cards: 2, advanced_cards: 1 })
        .eq('id', vignetteEncounterAiDeckId)
        .select('id, basic_cards, advanced_cards')
    expect(aiDeckUpdateError).toBeNull()
    expect(aiDeckUpdate).toEqual([
      {
        id: vignetteEncounterAiDeckId,
        basic_cards: 2,
        advanced_cards: 1
      }
    ])

    const { data: monsterUpdate, error: monsterUpdateError } =
      await collaborator.client
        .from('vignette_encounter_monster')
        .update({ wounds: 3, knocked_down: true })
        .eq('id', vignetteEncounterMonsterId)
        .select('id, wounds, knocked_down')
    expect(monsterUpdateError).toBeNull()
    expect(monsterUpdate).toEqual([
      {
        id: vignetteEncounterMonsterId,
        wounds: 3,
        knocked_down: true
      }
    ])

    const { data: survivorUpdate, error: survivorUpdateError } =
      await collaborator.client
        .from('vignette_encounter_survivor')
        .update({
          activation_used: true,
          bleeding_tokens: 1,
          knocked_down: true,
          movement_used: true,
          notes: 'The survivor refuses the dark',
          survival: 2,
          survival_tokens: -1
        })
        .eq('id', vignetteEncounterSurvivorId)
        .select(
          'id, activation_used, bleeding_tokens, knocked_down, movement_used, survival, survival_tokens, notes'
        )
    expect(survivorUpdateError).toBeNull()
    expect(survivorUpdate).toEqual([
      {
        id: vignetteEncounterSurvivorId,
        activation_used: true,
        bleeding_tokens: 1,
        knocked_down: true,
        movement_used: true,
        survival: 2,
        survival_tokens: -1,
        notes: 'The survivor refuses the dark'
      }
    ])

    const { data: gearGridUpdate, error: gearGridUpdateError } =
      await collaborator.client
        .from('vignette_encounter_survivor_gear_grid')
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

  it('allows the owner to read and manage active monster state cards', async () => {
    for (const stateCase of seededMonsterStateCases()) {
      const { data: selected, error: selectError } = await owner.client
        .from(stateCase.table)
        .select(`id, ${stateCase.cardColumn}`)
        .eq('id', stateCase.rowId)
      expect(selectError).toBeNull()
      expect(selected).toEqual([
        {
          id: stateCase.rowId,
          [stateCase.cardColumn]: stateCase.cardId
        }
      ])
    }

    for (const stateCase of monsterStateCases({
      moodId: alternateMoodId,
      traitId: alternateTraitId,
      survivorStatusId: alternateSurvivorStatusId
    })) {
      const { data: inserted, error: insertError } = await owner.client
        .from(stateCase.table)
        .insert({
          vignette_encounter_monster_id: vignetteEncounterMonsterId,
          [stateCase.cardColumn]: stateCase.cardId
        })
        .select(`id, ${stateCase.cardColumn}`)
        .single()
      expect(insertError).toBeNull()
      expect(inserted).toMatchObject({
        [stateCase.cardColumn]: stateCase.cardId
      })

      const { error: deleteError } = await owner.client
        .from(stateCase.table)
        .delete()
        .eq('id', inserted!.id)
      expect(deleteError).toBeNull()

      const { data: remaining, error: remainingError } = await admin
        .from(stateCase.table)
        .select('id')
        .eq('id', inserted!.id)
      expect(remainingError).toBeNull()
      expect(remaining).toEqual([])
    }
  })

  it('allows collaborators to read and manage active monster state cards', async () => {
    await shareWithCollaborator()

    for (const stateCase of seededMonsterStateCases()) {
      const { data: selected, error: selectError } = await collaborator.client
        .from(stateCase.table)
        .select(`id, ${stateCase.cardColumn}`)
        .eq('id', stateCase.rowId)
      expect(selectError).toBeNull()
      expect(selected).toEqual([
        {
          id: stateCase.rowId,
          [stateCase.cardColumn]: stateCase.cardId
        }
      ])
    }

    for (const stateCase of monsterStateCases({
      moodId: alternateMoodId,
      traitId: alternateTraitId,
      survivorStatusId: alternateSurvivorStatusId
    })) {
      const { data: inserted, error: insertError } = await collaborator.client
        .from(stateCase.table)
        .insert({
          vignette_encounter_monster_id: vignetteEncounterMonsterId,
          [stateCase.cardColumn]: stateCase.cardId
        })
        .select(`id, ${stateCase.cardColumn}`)
        .single()
      expect(insertError).toBeNull()
      expect(inserted).toMatchObject({
        [stateCase.cardColumn]: stateCase.cardId
      })

      const { error: deleteError } = await collaborator.client
        .from(stateCase.table)
        .delete()
        .eq('id', inserted!.id)
      expect(deleteError).toBeNull()

      const { data: remaining, error: remainingError } = await admin
        .from(stateCase.table)
        .select('id')
        .eq('id', inserted!.id)
      expect(remainingError).toBeNull()
      expect(remaining).toEqual([])
    }
  })

  it('prevents a collaborator from deleting a vignette instance', async () => {
    await shareWithCollaborator()

    const { error: deleteError } = await collaborator.client
      .from('vignette_encounter')
      .delete()
      .eq('id', vignetteEncounterId)
    expect(deleteError).toBeNull()

    const { data: remaining, error: remainingError } = await admin
      .from('vignette_encounter')
      .select('id')
      .eq('id', vignetteEncounterId)
    expect(remainingError).toBeNull()
    expect(remaining).toEqual([{ id: vignetteEncounterId }])
  })

  it('prevents strangers from reading or mutating vignette instance rows', async () => {
    await shareWithCollaborator()

    const { data: encounterRows, error: encounterSelectError } =
      await stranger.client
        .from('vignette_encounter')
        .select('id')
        .eq('id', vignetteEncounterId)
    expect(encounterSelectError).toBeNull()
    expect(encounterRows).toEqual([])

    const { data: updateRows, error: updateError } = await stranger.client
      .from('vignette_encounter_monster')
      .update({ wounds: 9 })
      .eq('id', vignetteEncounterMonsterId)
      .select('id')
    expect(updateError).toBeNull()
    expect(updateRows).toEqual([])

    const { data: monsterRows, error: monsterRowsError } = await admin
      .from('vignette_encounter_monster')
      .select('id, wounds')
      .eq('id', vignetteEncounterMonsterId)
    expect(monsterRowsError).toBeNull()
    expect(monsterRows).toEqual([{ id: vignetteEncounterMonsterId, wounds: 3 }])
  })

  it('prevents strangers from reading or mutating active monster state cards', async () => {
    await shareWithCollaborator()

    for (const stateCase of seededMonsterStateCases()) {
      const { data: selected, error: selectError } = await stranger.client
        .from(stateCase.table)
        .select(`id, ${stateCase.cardColumn}`)
        .eq('id', stateCase.rowId)
      expect(selectError).toBeNull()
      expect(selected).toEqual([])

      const { data: inserted, error: insertError } = await stranger.client
        .from(stateCase.table)
        .insert({
          vignette_encounter_monster_id: vignetteEncounterMonsterId,
          [stateCase.cardColumn]: stateCase.cardId
        })
        .select('id')
      expect(insertError).not.toBeNull()
      expect(inserted).toBeNull()

      const { error: deleteError } = await stranger.client
        .from(stateCase.table)
        .delete()
        .eq('id', stateCase.rowId)
      expect(deleteError).toBeNull()

      const { data: remaining, error: remainingError } = await admin
        .from(stateCase.table)
        .select('id')
        .eq('id', stateCase.rowId)
      expect(remainingError).toBeNull()
      expect(remaining).toEqual([{ id: stateCase.rowId }])
    }
  })

  it('denies share creation for a free owner', async () => {
    await setUserSubscription(owner.id, 'free', 'active')
    await clearShares()

    const { error } = await owner.client
      .from('vignette_encounter_shared_user')
      .insert({
        vignette_encounter_id: vignetteEncounterId,
        shared_user_id: collaborator.id
      })

    expect(error).not.toBeNull()
  })

  it('allows an active Lantern Hoard owner to share with a free collaborator', async () => {
    await shareWithCollaborator()

    const { data: collaboratorRows, error: collaboratorSelectError } =
      await collaborator.client
        .from('vignette_encounter_shared_user')
        .select('vignette_encounter_id, shared_user_id')
        .eq('vignette_encounter_id', vignetteEncounterId)
    expect(collaboratorSelectError).toBeNull()
    expect(collaboratorRows).toEqual([
      {
        vignette_encounter_id: vignetteEncounterId,
        shared_user_id: collaborator.id
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
    await shareWithCollaborator()
    await setUserSubscription(collaborator.id, 'lantern_hoard', 'active')

    const { error: collaboratorInsertError } = await collaborator.client
      .from('vignette_encounter_shared_user')
      .insert({
        vignette_encounter_id: vignetteEncounterId,
        shared_user_id: stranger.id
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
    await shareWithCollaborator()

    const { error: duplicateInsertError } = await owner.client
      .from('vignette_encounter_shared_user')
      .insert({
        vignette_encounter_id: vignetteEncounterId,
        shared_user_id: collaborator.id
      })
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
        shared_user_id: owner.id
      })

    expect(error).not.toBeNull()
  })
})
