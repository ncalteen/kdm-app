import {
  admin,
  createTestUser,
  deleteTestUser,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const KILLENIUM_BUTCHER_FIXTURE_NAME = 'Killenium Butcher'

interface VignetteMonsterLevelFixture {
  /** Vignette Monster ID */
  vignette_monster_id: string
  /** Level Number */
  level_number: number
}

/**
 * Integration - Vignette Encounter Create RLS
 *
 * Verifies the catalog-copy RPC can create the active vignette graph for an
 * authenticated caller while table RLS remains enabled.
 */
describe('Vignette encounter create RLS', () => {
  let authenticatedUser: TestUser
  let fixtureLevel: VignetteMonsterLevelFixture

  beforeAll(async () => {
    authenticatedUser = await createTestUser()
    fixtureLevel = await getFixtureLevel()
  })

  afterAll(async () => {
    if (authenticatedUser) await deleteTestUser(authenticatedUser.id)
  })

  it('creates an active vignette encounter and copied child rows for the owner', async () => {
    const { data: vignetteEncounterId, error: createError } =
      await authenticatedUser.client.rpc(
        'create_vignette_encounter_from_catalog',
        {
          target_level_number: fixtureLevel.level_number,
          target_vignette_monster_id: fixtureLevel.vignette_monster_id
        }
      )

    expect(createError).toBeNull()
    expect(vignetteEncounterId).toEqual(expect.any(String))

    const { data: encounter, error: encounterError } =
      await authenticatedUser.client
        .from('vignette_encounter')
        .select('id, user_id, vignette_monster_id, level_number')
        .eq('id', vignetteEncounterId)
        .single()

    expect(encounterError).toBeNull()
    expect(encounter).toMatchObject({
      id: vignetteEncounterId,
      user_id: authenticatedUser.id,
      vignette_monster_id: fixtureLevel.vignette_monster_id,
      level_number: fixtureLevel.level_number
    })

    const { data: monsters, error: monstersError } =
      await authenticatedUser.client
        .from('vignette_encounter_monster')
        .select('id, vignette_encounter_id')
        .eq('vignette_encounter_id', vignetteEncounterId)

    expect(monstersError).toBeNull()
    expect(monsters?.length).toBeGreaterThan(0)

    const { data: survivors, error: survivorsError } =
      await authenticatedUser.client
        .from('vignette_encounter_survivor')
        .select('id, vignette_encounter_id')
        .eq('vignette_encounter_id', vignetteEncounterId)

    expect(survivorsError).toBeNull()
    expect(survivors?.length).toBeGreaterThan(0)
  })
})

async function getFixtureLevel(): Promise<VignetteMonsterLevelFixture> {
  const { data, error } = await admin
    .from('vignette_monster_level')
    .select(
      'vignette_monster_id, level_number, vignette_monster!inner(monster_name)'
    )
    .eq('vignette_monster.monster_name', KILLENIUM_BUTCHER_FIXTURE_NAME)
    .single()

  if (error || !data)
    throw new Error(`getFixtureLevel failed: ${error?.message}`)

  return {
    vignette_monster_id: data.vignette_monster_id,
    level_number: data.level_number
  }
}
