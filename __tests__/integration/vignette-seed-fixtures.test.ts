import {
  admin,
  createTestUser,
  deleteTestUser,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const KILLENIUM_BUTCHER_FIXTURE_NAME = 'Killenium Butcher'
const SCREAMING_NUKALOPE_FIXTURE_NAME = 'Screaming Nukalope'
const WHITE_GIGALION_FIXTURE_NAME = 'White Gigalion'
const EXPECTED_FIXTURE_NAMES = [
  KILLENIUM_BUTCHER_FIXTURE_NAME,
  SCREAMING_NUKALOPE_FIXTURE_NAME,
  WHITE_GIGALION_FIXTURE_NAME
] as const

interface FixtureMonster {
  id: string
  monster_name: string
  multi_monster: boolean
  source_monster_type: 'NEMESIS' | 'QUARRY'
  source_nemesis_id: string | null
  source_quarry_id: string | null
}

interface FixtureMonsterLevel {
  vignette_monster_id: string
  level_number: number
  movement: number
  speed: number
  accuracy: number
  evasion: number
  damage: number
  toughness: number
  life: number | null
  ai_deck_remaining: number
}

interface FixtureSurvivor {
  vignette_monster_id: string
  survivor_name: string
}

/**
 * Integration - Vignette Seed Fixtures
 *
 * Locks down the VIG-01.06 fixture catalog rows against the final vignette
 * monster and survivor schema. The current fixtures cover one nemesis source
 * and two quarry sources, with four preset survivors for each encounter.
 */
describe('Vignette seed fixtures', () => {
  let authenticatedUser: TestUser

  beforeAll(async () => {
    authenticatedUser = await createTestUser()
  })

  afterAll(async () => {
    if (authenticatedUser) await deleteTestUser(authenticatedUser.id)
  })

  it('seeds visible fixture monsters for nemesis and quarry sources', async () => {
    const { data, error } = await authenticatedUser.client
      .from('vignette_monster')
      .select(
        'id, monster_name, multi_monster, source_monster_type, source_nemesis_id, source_quarry_id'
      )
      .in('monster_name', EXPECTED_FIXTURE_NAMES)
      .order('monster_name')

    expect(error).toBeNull()

    const monsters = (data ?? []) as FixtureMonster[]
    expect(monsters).toHaveLength(EXPECTED_FIXTURE_NAMES.length)
    expect(monsters.map((monster) => monster.monster_name)).toEqual(
      sorted([...EXPECTED_FIXTURE_NAMES])
    )

    const monsterByName = toMapByName(monsters)
    expect(monsterByName.get(KILLENIUM_BUTCHER_FIXTURE_NAME)).toMatchObject({
      multi_monster: false,
      source_monster_type: 'NEMESIS',
      source_quarry_id: null
    })
    expect(monsterByName.get(SCREAMING_NUKALOPE_FIXTURE_NAME)).toMatchObject({
      multi_monster: false,
      source_monster_type: 'QUARRY',
      source_nemesis_id: null
    })
    expect(monsterByName.get(WHITE_GIGALION_FIXTURE_NAME)).toMatchObject({
      multi_monster: false,
      source_monster_type: 'QUARRY',
      source_nemesis_id: null
    })

    await expectSourceMonsterName(
      'nemesis',
      monsterByName.get(KILLENIUM_BUTCHER_FIXTURE_NAME)!.source_nemesis_id!,
      KILLENIUM_BUTCHER_FIXTURE_NAME
    )
    await expectSourceMonsterName(
      'quarry',
      monsterByName.get(SCREAMING_NUKALOPE_FIXTURE_NAME)!.source_quarry_id!,
      SCREAMING_NUKALOPE_FIXTURE_NAME
    )
    await expectSourceMonsterName(
      'quarry',
      monsterByName.get(WHITE_GIGALION_FIXTURE_NAME)!.source_quarry_id!,
      WHITE_GIGALION_FIXTURE_NAME
    )
  })

  it('seeds the Killenium Butcher vignette monster level', async () => {
    const monsters = await getFixtureMonsters()
    const killeniumButcher = toMapByName(monsters).get(
      KILLENIUM_BUTCHER_FIXTURE_NAME
    )!
    const { data, error } = await admin
      .from('vignette_monster_level')
      .select(
        'vignette_monster_id, level_number, movement, speed, accuracy, evasion, damage, toughness, life, ai_deck_remaining'
      )
      .eq('vignette_monster_id', killeniumButcher.id)

    expect(error).toBeNull()
    expect((data ?? []) as FixtureMonsterLevel[]).toEqual([
      {
        vignette_monster_id: killeniumButcher.id,
        level_number: 2,
        movement: 5,
        speed: 1,
        accuracy: 0,
        evasion: 0,
        damage: 1,
        toughness: 13,
        life: 0,
        ai_deck_remaining: 15
      }
    ])
  })

  it('seeds four survivor presets for each fixture monster', async () => {
    const monsters = await getFixtureMonsters()
    const monsterById = toMapById(monsters)
    const { data, error } = await admin
      .from('vignette_survivor')
      .select('vignette_monster_id, survivor_name')
      .in(
        'vignette_monster_id',
        monsters.map((monster) => monster.id)
      )
      .order('survivor_name')

    expect(error).toBeNull()

    const survivors = (data ?? []) as FixtureSurvivor[]
    expect(survivors).toHaveLength(12)
    expect(countBy(survivors, 'vignette_monster_id')).toEqual(
      new Map(monsters.map((monster) => [monster.id, 4]))
    )

    const survivorNamesByMonster = new Map<string, string[]>()
    for (const survivor of survivors) {
      const monsterName = monsterById.get(
        survivor.vignette_monster_id
      )!.monster_name
      survivorNamesByMonster.set(monsterName, [
        ...(survivorNamesByMonster.get(monsterName) ?? []),
        survivor.survivor_name
      ])
    }

    expect(
      sorted(survivorNamesByMonster.get(KILLENIUM_BUTCHER_FIXTURE_NAME) ?? [])
    ).toEqual(['Brave', 'Forgot', 'Hollow', 'Red'])
    expect(
      sorted(survivorNamesByMonster.get(SCREAMING_NUKALOPE_FIXTURE_NAME) ?? [])
    ).toEqual(['Ashbloom', 'Ashroot', 'Gnostin', 'Monday'])
    expect(
      sorted(survivorNamesByMonster.get(WHITE_GIGALION_FIXTURE_NAME) ?? [])
    ).toEqual(['Breccia', 'Gadrock', 'Hungry Basalt', 'Rock Knight'])
  })
})

async function getFixtureMonsters(): Promise<FixtureMonster[]> {
  const { data, error } = await admin
    .from('vignette_monster')
    .select(
      'id, monster_name, multi_monster, source_monster_type, source_nemesis_id, source_quarry_id'
    )
    .in('monster_name', EXPECTED_FIXTURE_NAMES)

  expect(error).toBeNull()
  const monsters = (data ?? []) as FixtureMonster[]
  expect(monsters).toHaveLength(EXPECTED_FIXTURE_NAMES.length)

  return monsters
}

async function expectSourceMonsterName(
  tableName: 'nemesis' | 'quarry',
  sourceMonsterId: string,
  expectedMonsterName: string
): Promise<void> {
  const { data, error } = await admin
    .from(tableName)
    .select('monster_name')
    .eq('id', sourceMonsterId)
    .single()

  expect(error).toBeNull()
  expect(data).toEqual({ monster_name: expectedMonsterName })
}

function toMapByName(monsters: FixtureMonster[]): Map<string, FixtureMonster> {
  return new Map(monsters.map((monster) => [monster.monster_name, monster]))
}

function toMapById<Item extends { id: string }>(
  items: Item[]
): Map<string, Item> {
  return new Map(items.map((item) => [item.id, item]))
}

function countBy<
  Item extends Record<Property, string>,
  Property extends string
>(items: Item[], property: Property): Map<string, number> {
  return items.reduce((counts, item) => {
    const currentCount = counts.get(item[property]) ?? 0
    counts.set(item[property], currentCount + 1)
    return counts
  }, new Map<string, number>())
}

function sorted(values: readonly string[]): string[] {
  return [...values].sort()
}
