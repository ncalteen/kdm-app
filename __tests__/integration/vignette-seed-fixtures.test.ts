import {
  admin,
  createTestUser,
  deleteTestUser,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const SINGLE_MONSTER_FIXTURE_SLUG = 'fixture-lantern-raked-lion'
const MULTI_MONSTER_FIXTURE_SLUG = 'fixture-three-witches-at-the-door'
const EXPECTED_FIXTURE_SLUGS = [
  SINGLE_MONSTER_FIXTURE_SLUG,
  MULTI_MONSTER_FIXTURE_SLUG
] as const

interface FixtureDefinition {
  id: string
  name: string
  slug: string
  description: string | null
  source_monster_type: 'NEMESIS' | 'QUARRY'
  source_nemesis_id: string | null
  source_quarry_id: string | null
  published: boolean
}

interface FixtureLevel {
  id: string
  vignette_encounter_definition_id: string
  level_number: number
}

interface FixtureSurvivorTemplate {
  id: string
  vignette_encounter_definition_id: string
  survivor_name: string
  notes: string
}

interface LevelJunctionRow {
  vignette_encounter_level_id: string
}

interface SurvivorTemplateJunctionRow {
  vignette_survivor_template_id: string
}

/**
 * Integration — Vignette Seed Fixtures
 *
 * Locks down the fixture-only vignette encounter catalog rows seeded for
 * VIG-01.06. These rows intentionally exercise published quarry and nemesis
 * source relationships, single and multi-monster source data, level setup
 * junctions, survivor templates, and gear-grid templates.
 */
describe('Vignette seed fixtures', () => {
  let authenticatedUser: TestUser

  beforeAll(async () => {
    authenticatedUser = await createTestUser()
  })

  afterAll(async () => {
    if (authenticatedUser) await deleteTestUser(authenticatedUser.id)
  })

  it('seeds visible published fixture definitions for single and multi-monster sources', async () => {
    const { data, error } = await authenticatedUser.client
      .from('vignette_encounter_definition')
      .select(
        'id, name, slug, description, source_monster_type, source_nemesis_id, source_quarry_id, published'
      )
      .in('slug', EXPECTED_FIXTURE_SLUGS)
      .order('sort_order')

    expect(error).toBeNull()

    const definitions = (data ?? []) as FixtureDefinition[]
    expect(definitions).toHaveLength(EXPECTED_FIXTURE_SLUGS.length)
    expect(definitions.every((definition) => definition.published)).toBe(true)
    expect(
      definitions.every((definition) => definition.name.startsWith('[Fixture]'))
    ).toBe(true)
    expect(
      definitions.every((definition) =>
        definition.description?.startsWith('Fixture-only')
      )
    ).toBe(true)

    const definitionBySlug = toMapBySlug(definitions)
    const singleMonsterDefinition = definitionBySlug.get(
      SINGLE_MONSTER_FIXTURE_SLUG
    )
    const multiMonsterDefinition = definitionBySlug.get(
      MULTI_MONSTER_FIXTURE_SLUG
    )

    expect(singleMonsterDefinition).toBeDefined()
    expect(multiMonsterDefinition).toBeDefined()
    if (!singleMonsterDefinition || !multiMonsterDefinition) {
      throw new Error('Expected vignette fixture definitions were not seeded.')
    }

    expect(singleMonsterDefinition.source_monster_type).toBe('QUARRY')
    expect(singleMonsterDefinition.source_nemesis_id).toBeNull()
    expect(singleMonsterDefinition.source_quarry_id).not.toBeNull()

    expect(multiMonsterDefinition.source_monster_type).toBe('NEMESIS')
    expect(multiMonsterDefinition.source_nemesis_id).not.toBeNull()
    expect(multiMonsterDefinition.source_quarry_id).toBeNull()

    const { data: quarrySource, error: quarrySourceError } = await admin
      .from('quarry')
      .select('monster_name, multi_monster')
      .eq('id', singleMonsterDefinition.source_quarry_id)
      .single()
    expect(quarrySourceError).toBeNull()
    expect(quarrySource).toMatchObject({
      monster_name: 'White Lion',
      multi_monster: false
    })

    const { data: nemesisSource, error: nemesisSourceError } = await admin
      .from('nemesis')
      .select('monster_name, multi_monster')
      .eq('id', multiMonsterDefinition.source_nemesis_id)
      .single()
    expect(nemesisSourceError).toBeNull()
    expect(nemesisSource).toMatchObject({
      monster_name: 'Red Witches',
      multi_monster: true
    })
  })

  it('seeds level moods, traits, and survivor statuses for every fixture level', async () => {
    const definitions = await getFixtureDefinitions()
    const definitionIds = definitions.map((definition) => definition.id)

    const { data, error } = await admin
      .from('vignette_encounter_level')
      .select('id, vignette_encounter_definition_id, level_number')
      .in('vignette_encounter_definition_id', definitionIds)
      .order('sort_order')

    expect(error).toBeNull()

    const levels = (data ?? []) as FixtureLevel[]
    expect(levels).toHaveLength(4)
    expect(countBy(levels, 'vignette_encounter_definition_id')).toEqual(
      new Map(definitionIds.map((definitionId) => [definitionId, 2]))
    )

    const levelIds = levels.map((level) => level.id)
    const [moodResult, traitResult, survivorStatusResult] = await Promise.all([
      admin
        .from('vignette_encounter_level_mood')
        .select('vignette_encounter_level_id')
        .in('vignette_encounter_level_id', levelIds),
      admin
        .from('vignette_encounter_level_trait')
        .select('vignette_encounter_level_id')
        .in('vignette_encounter_level_id', levelIds),
      admin
        .from('vignette_encounter_level_survivor_status')
        .select('vignette_encounter_level_id')
        .in('vignette_encounter_level_id', levelIds)
    ])

    expect(moodResult.error).toBeNull()
    expect(traitResult.error).toBeNull()
    expect(survivorStatusResult.error).toBeNull()

    expect(levelIdsFrom(moodResult.data)).toEqual(sorted(levelIds))
    expect(levelIdsFrom(traitResult.data)).toEqual(sorted(levelIds))
    expect(levelIdsFrom(survivorStatusResult.data)).toEqual(sorted(levelIds))
  })

  it('seeds survivor templates, survivor template links, and gear grids', async () => {
    const definitions = await getFixtureDefinitions()
    const definitionBySlug = toMapBySlug(definitions)
    const singleMonsterDefinition = definitionBySlug.get(
      SINGLE_MONSTER_FIXTURE_SLUG
    )
    const multiMonsterDefinition = definitionBySlug.get(
      MULTI_MONSTER_FIXTURE_SLUG
    )

    expect(singleMonsterDefinition).toBeDefined()
    expect(multiMonsterDefinition).toBeDefined()
    if (!singleMonsterDefinition || !multiMonsterDefinition) {
      throw new Error('Expected vignette fixture definitions were not seeded.')
    }

    const definitionIds = definitions.map((definition) => definition.id)
    const { data, error } = await admin
      .from('vignette_survivor_template')
      .select('id, vignette_encounter_definition_id, survivor_name, notes')
      .in('vignette_encounter_definition_id', definitionIds)
      .order('sort_order')

    expect(error).toBeNull()

    const survivorTemplates = (data ?? []) as FixtureSurvivorTemplate[]
    expect(survivorTemplates).toHaveLength(5)
    expect(
      survivorTemplates.every((template) =>
        template.survivor_name.startsWith('[Fixture]')
      )
    ).toBe(true)
    expect(
      survivorTemplates.every((template) =>
        template.notes.startsWith('Fixture-only')
      )
    ).toBe(true)

    const survivorTemplateCounts = countBy(
      survivorTemplates,
      'vignette_encounter_definition_id'
    )
    expect(survivorTemplateCounts.get(singleMonsterDefinition.id)).toBe(2)
    expect(survivorTemplateCounts.get(multiMonsterDefinition.id)).toBe(3)

    const survivorTemplateIds = survivorTemplates.map((template) => template.id)
    const [
      gearGridResult,
      fightingArtResult,
      secretFightingArtResult,
      disorderResult,
      abilityImpairmentResult,
      survivorStatusResult
    ] = await Promise.all([
      admin
        .from('vignette_survivor_template_gear_grid')
        .select('vignette_survivor_template_id')
        .in('vignette_survivor_template_id', survivorTemplateIds),
      admin
        .from('vignette_survivor_template_fighting_art')
        .select('vignette_survivor_template_id')
        .in('vignette_survivor_template_id', survivorTemplateIds),
      admin
        .from('vignette_survivor_template_secret_fighting_art')
        .select('vignette_survivor_template_id')
        .in('vignette_survivor_template_id', survivorTemplateIds),
      admin
        .from('vignette_survivor_template_disorder')
        .select('vignette_survivor_template_id')
        .in('vignette_survivor_template_id', survivorTemplateIds),
      admin
        .from('vignette_survivor_template_ability_impairment')
        .select('vignette_survivor_template_id')
        .in('vignette_survivor_template_id', survivorTemplateIds),
      admin
        .from('vignette_survivor_template_survivor_status')
        .select('vignette_survivor_template_id')
        .in('vignette_survivor_template_id', survivorTemplateIds)
    ])

    expect(gearGridResult.error).toBeNull()
    expect(fightingArtResult.error).toBeNull()
    expect(secretFightingArtResult.error).toBeNull()
    expect(disorderResult.error).toBeNull()
    expect(abilityImpairmentResult.error).toBeNull()
    expect(survivorStatusResult.error).toBeNull()

    expect(survivorTemplateIdsFrom(gearGridResult.data)).toEqual(
      sorted(survivorTemplateIds)
    )
    expect((fightingArtResult.data ?? []).length).toBeGreaterThan(0)
    expect((secretFightingArtResult.data ?? []).length).toBeGreaterThan(0)
    expect((disorderResult.data ?? []).length).toBeGreaterThan(0)
    expect((abilityImpairmentResult.data ?? []).length).toBeGreaterThan(0)
    expect((survivorStatusResult.data ?? []).length).toBeGreaterThan(0)
  })
})

async function getFixtureDefinitions(): Promise<FixtureDefinition[]> {
  const { data, error } = await admin
    .from('vignette_encounter_definition')
    .select(
      'id, name, slug, description, source_monster_type, source_nemesis_id, source_quarry_id, published'
    )
    .in('slug', EXPECTED_FIXTURE_SLUGS)
    .order('sort_order')

  expect(error).toBeNull()
  const definitions = (data ?? []) as FixtureDefinition[]
  expect(definitions).toHaveLength(EXPECTED_FIXTURE_SLUGS.length)

  return definitions
}

function toMapBySlug(
  definitions: FixtureDefinition[]
): Map<string, FixtureDefinition> {
  return new Map(definitions.map((definition) => [definition.slug, definition]))
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

function levelIdsFrom(rows: LevelJunctionRow[] | null): string[] {
  return sorted((rows ?? []).map((row) => row.vignette_encounter_level_id))
}

function survivorTemplateIdsFrom(
  rows: SurvivorTemplateJunctionRow[] | null
): string[] {
  return sorted((rows ?? []).map((row) => row.vignette_survivor_template_id))
}

function sorted(values: string[]): string[] {
  return [...new Set(values)].sort()
}
