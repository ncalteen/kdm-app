import {
  VignetteActiveLimitSchema,
  VignetteCreateInputSchema,
  VignetteEncounterAIDeckUpdateInputSchema,
  VignetteEncounterDeleteInputSchema,
  VignetteEncounterMonsterMoodInputSchema,
  VignetteEncounterMonsterStateDeleteInputSchema,
  VignetteEncounterMonsterSurvivorStatusInputSchema,
  VignetteEncounterMonsterTraitInputSchema,
  VignetteEncounterMonsterUpdateInputSchema,
  VignetteEncounterSurvivorGearGridUpdateInputSchema,
  VignetteEncounterSurvivorLiveStateUpdateInputSchema,
  VignetteEncounterUpdateInputSchema,
  VignetteShareInputSchema,
  VignetteShareRemovalInputSchema
} from '@/schemas/vignette-encounter'
import { describe, expect, it } from 'vitest'

const uuid = '12345678-1234-4234-8234-123456789abc'
const alternateUuid = '12345678-1234-4234-8234-123456789abd'

describe('VignetteCreateInputSchema', () => {
  it('accepts a valid catalog create payload', () => {
    const result = VignetteCreateInputSchema.parse({
      vignette_monster_id: uuid,
      level_number: 2
    })

    expect(result).toEqual({ vignette_monster_id: uuid, level_number: 2 })
  })

  it('rejects invalid id and level values', () => {
    const result = VignetteCreateInputSchema.safeParse({
      vignette_monster_id: 'not-a-uuid',
      level_number: 5
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual([
        'vignette_monster_id',
        'level_number'
      ])
    }
  })
})

describe('VignetteActiveLimitSchema', () => {
  it('accepts a user with no active owned vignette', () => {
    expect(VignetteActiveLimitSchema.parse({})).toEqual({
      active_vignette_encounter_id: null
    })
  })

  it('rejects a second active owned vignette with themed copy', () => {
    const result = VignetteActiveLimitSchema.safeParse({
      active_vignette_encounter_id: uuid
    })

    expect(result.success).toBe(false)
    if (!result.success)
      expect(result.error.issues[0].message).toMatch(/one active vignette/i)
  })
})

describe('VignetteEncounterUpdateInputSchema', () => {
  it('accepts turn and notes updates', () => {
    const result = VignetteEncounterUpdateInputSchema.parse({
      vignette_encounter_id: uuid,
      turn: 'SURVIVOR',
      notes: 'The lantern still burns.'
    })

    expect(result).toEqual({
      vignette_encounter_id: uuid,
      turn: 'SURVIVOR',
      notes: 'The lantern still burns.'
    })
  })

  it('rejects an empty update payload', () => {
    const result = VignetteEncounterUpdateInputSchema.safeParse({
      vignette_encounter_id: uuid
    })

    expect(result.success).toBe(false)
    if (!result.success)
      expect(result.error.issues[0].message).toMatch(/one change/i)
  })
})

describe('VignetteEncounterDeleteInputSchema', () => {
  it('accepts a valid delete payload', () => {
    expect(
      VignetteEncounterDeleteInputSchema.parse({ vignette_encounter_id: uuid })
    ).toEqual({ vignette_encounter_id: uuid })
  })

  it('rejects invalid delete payloads', () => {
    const result = VignetteEncounterDeleteInputSchema.safeParse({
      vignette_encounter_id: 'not-a-uuid'
    })

    expect(result.success).toBe(false)
    if (!result.success)
      expect(result.error.issues[0].message).toMatch(/valid vignette id/i)
  })
})

describe('VignetteEncounterAIDeckUpdateInputSchema', () => {
  it('accepts AI deck card count updates', () => {
    const result = VignetteEncounterAIDeckUpdateInputSchema.parse({
      vignette_encounter_ai_deck_id: uuid,
      basic_cards: 7,
      advanced_cards: 3
    })

    expect(result.basic_cards).toBe(7)
    expect(result.advanced_cards).toBe(3)
  })

  it('rejects negative AI deck counts', () => {
    const result = VignetteEncounterAIDeckUpdateInputSchema.safeParse({
      vignette_encounter_ai_deck_id: uuid,
      basic_cards: -1
    })

    expect(result.success).toBe(false)
  })
})

describe('VignetteEncounterMonsterUpdateInputSchema', () => {
  it('accepts mutable monster state updates', () => {
    const result = VignetteEncounterMonsterUpdateInputSchema.parse({
      vignette_encounter_monster_id: uuid,
      ai_card_drawn: true,
      knocked_down: true,
      monster_name: '  Lantern Horror  ',
      wounds: 3
    })

    expect(result).toMatchObject({
      ai_card_drawn: true,
      knocked_down: true,
      monster_name: 'Lantern Horror',
      wounds: 3
    })
  })

  it('rejects negative wounds', () => {
    const result = VignetteEncounterMonsterUpdateInputSchema.safeParse({
      vignette_encounter_monster_id: uuid,
      wounds: -1
    })

    expect(result.success).toBe(false)
  })

  it('rejects an empty monster update payload', () => {
    const result = VignetteEncounterMonsterUpdateInputSchema.safeParse({
      vignette_encounter_monster_id: uuid
    })

    expect(result.success).toBe(false)
  })
})

describe('Vignette active monster state card schemas', () => {
  it('accepts mood, trait, and survivor status inserts with nullable source links', () => {
    expect(
      VignetteEncounterMonsterMoodInputSchema.parse({
        vignette_encounter_monster_id: uuid,
        mood_id: alternateUuid
      })
    ).toMatchObject({ source_vignette_monster_level_mood_id: null })

    expect(
      VignetteEncounterMonsterTraitInputSchema.parse({
        vignette_encounter_monster_id: uuid,
        trait_id: alternateUuid,
        source_vignette_monster_level_trait_id: uuid
      })
    ).toMatchObject({ source_vignette_monster_level_trait_id: uuid })

    expect(
      VignetteEncounterMonsterSurvivorStatusInputSchema.parse({
        vignette_encounter_monster_id: uuid,
        survivor_status_id: alternateUuid
      })
    ).toMatchObject({ source_vignette_monster_level_survivor_status_id: null })
  })

  it('accepts monster state delete payloads', () => {
    expect(
      VignetteEncounterMonsterStateDeleteInputSchema.parse({ id: uuid })
    ).toEqual({
      id: uuid
    })
  })
})

describe('VignetteEncounterSurvivorLiveStateUpdateInputSchema', () => {
  it('accepts live survivor state updates including survival and notes', () => {
    const result = VignetteEncounterSurvivorLiveStateUpdateInputSchema.parse({
      vignette_encounter_survivor_id: uuid,
      activation_used: true,
      bleeding_tokens: 1,
      knocked_down: true,
      movement_used: true,
      notes: 'The survivor refuses the dark',
      survival: 2,
      survival_tokens: -1
    })

    expect(result).toMatchObject({
      activation_used: true,
      bleeding_tokens: 1,
      knocked_down: true,
      movement_used: true,
      notes: 'The survivor refuses the dark',
      survival: 2,
      survival_tokens: -1
    })
  })

  it('rejects negative survival and bleeding token counts', () => {
    const result =
      VignetteEncounterSurvivorLiveStateUpdateInputSchema.safeParse({
        vignette_encounter_survivor_id: uuid,
        bleeding_tokens: -1,
        survival: -1
      })

    expect(result.success).toBe(false)
  })

  it('rejects an empty live-state update payload', () => {
    const result =
      VignetteEncounterSurvivorLiveStateUpdateInputSchema.safeParse({
        vignette_encounter_survivor_id: uuid
      })

    expect(result.success).toBe(false)
  })
})

describe('VignetteEncounterSurvivorGearGridUpdateInputSchema', () => {
  it('accepts active gear-grid position updates', () => {
    const result = VignetteEncounterSurvivorGearGridUpdateInputSchema.parse({
      vignette_encounter_survivor_gear_grid_id: uuid,
      row_number: 1,
      column_number: 2
    })

    expect(result.row_number).toBe(1)
    expect(result.column_number).toBe(2)
  })

  it('rejects out-of-bounds grid coordinates', () => {
    const result = VignetteEncounterSurvivorGearGridUpdateInputSchema.safeParse(
      {
        vignette_encounter_survivor_gear_grid_id: uuid,
        row_number: 3
      }
    )

    expect(result.success).toBe(false)
  })
})

describe('Vignette sharing schemas', () => {
  it('trims exact-username share input', () => {
    const result = VignetteShareInputSchema.parse({
      vignette_encounter_id: uuid,
      username: '  lanternkeeper  '
    })

    expect(result.username).toBe('lanternkeeper')
  })

  it('rejects empty usernames', () => {
    const result = VignetteShareInputSchema.safeParse({
      vignette_encounter_id: uuid,
      username: ''
    })

    expect(result.success).toBe(false)
    if (!result.success)
      expect(result.error.issues[0].message).toMatch(/nameless collaborator/i)
  })

  it('accepts share removal payloads', () => {
    const result = VignetteShareRemovalInputSchema.parse({
      vignette_encounter_id: uuid,
      shared_user_id: alternateUuid
    })

    expect(result).toEqual({
      vignette_encounter_id: uuid,
      shared_user_id: alternateUuid
    })
  })
})
