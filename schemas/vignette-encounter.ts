import { Constants } from '@/lib/database.types'
import { z } from 'zod'

/** Vignette UUID Schema */
const VignetteUuidSchema = z.uuid('A valid vignette id is required.')

/** Vignette Level Number Schema */
const VignetteLevelNumberSchema = z
  .number()
  .int('Vignette level must be a whole number.')
  .min(1, 'Vignette level must be at least 1.')
  .max(4, 'Vignette level cannot exceed 4.')

/** Vignette Non-Negative Count Schema */
const VignetteNonNegativeCountSchema = z
  .number()
  .int('Count must be a whole number.')
  .min(0, 'Count cannot be negative.')

/** Vignette Token Count Schema */
const VignetteTokenCountSchema = z.number().int('Token count must be whole.')

/** Vignette Grid Coordinate Schema */
const VignetteGridCoordinateSchema = z
  .number()
  .int('Gear grid coordinates must be whole numbers.')
  .min(0, 'Gear grid coordinates cannot be negative.')
  .max(2, 'Gear grid coordinates cannot exceed 2.')

/** Vignette Showdown Turn Schema */
export const VignetteShowdownTurnSchema = z.enum(
  Constants.public.Enums.showdown_turn
)

/**
 * At Least One Defined
 *
 * Checks whether at least one field exists on a payload.
 *
 * @param data Payload Data
 * @param fields Field Names
 * @returns Whether At Least One Field Is Defined
 */
function hasAtLeastOneDefined(
  data: Record<string, unknown>,
  fields: readonly string[]
): boolean {
  return fields.some((field) => data[field] !== undefined)
}

/**
 * Require At Least One Update
 *
 * Adds a validation issue when an update payload has no mutable fields.
 *
 * @param data Payload Data
 * @param ctx Refinement Context
 * @param fields Mutable Field Names
 */
function requireAtLeastOneUpdate(
  data: Record<string, unknown>,
  ctx: z.RefinementCtx,
  fields: readonly string[]
): void {
  if (hasAtLeastOneDefined(data, fields)) return

  ctx.addIssue({
    code: 'custom',
    message: 'At least one change must be included in the update record.'
  })
}

/** Vignette Create Input Schema */
export const VignetteCreateInputSchema = z.object({
  /** Vignette Monster ID */
  vignette_monster_id: VignetteUuidSchema,
  /** Level Number */
  level_number: VignetteLevelNumberSchema
})

/** Vignette Create Input */
export type VignetteCreateInput = z.infer<typeof VignetteCreateInputSchema>

/** Vignette Active Limit Schema */
export const VignetteActiveLimitSchema = z
  .object({
    /** Active Owned Vignette Encounter ID */
    active_vignette_encounter_id: VignetteUuidSchema.nullable().default(null)
  })
  .refine((data) => data.active_vignette_encounter_id === null, {
    message: 'Only one active vignette can run at a time.',
    path: ['active_vignette_encounter_id']
  })

/** Vignette Active Limit */
export type VignetteActiveLimit = z.infer<typeof VignetteActiveLimitSchema>

/** Vignette Encounter Update Input Schema */
export const VignetteEncounterUpdateInputSchema = z
  .object({
    /** Vignette Encounter ID */
    vignette_encounter_id: VignetteUuidSchema,
    /** Turn */
    turn: VignetteShowdownTurnSchema.optional(),
    /** Notes */
    notes: z.string().optional()
  })
  .superRefine((data, ctx) =>
    requireAtLeastOneUpdate(data, ctx, ['turn', 'notes'])
  )

/** Vignette Encounter Update Input */
export type VignetteEncounterUpdateInput = z.infer<
  typeof VignetteEncounterUpdateInputSchema
>

/** Vignette Encounter Delete Input Schema */
export const VignetteEncounterDeleteInputSchema = z.object({
  /** Vignette Encounter ID */
  vignette_encounter_id: VignetteUuidSchema
})

/** Vignette Encounter Delete Input */
export type VignetteEncounterDeleteInput = z.infer<
  typeof VignetteEncounterDeleteInputSchema
>

/** Vignette Encounter AI Deck Update Input Schema */
export const VignetteEncounterAIDeckUpdateInputSchema = z
  .object({
    /** Vignette Encounter AI Deck ID */
    vignette_encounter_ai_deck_id: VignetteUuidSchema,
    /** Basic Cards */
    basic_cards: VignetteNonNegativeCountSchema.optional(),
    /** Advanced Cards */
    advanced_cards: VignetteNonNegativeCountSchema.optional(),
    /** Legendary Cards */
    legendary_cards: VignetteNonNegativeCountSchema.optional(),
    /** Overtone Cards */
    overtone_cards: VignetteNonNegativeCountSchema.optional()
  })
  .superRefine((data, ctx) =>
    requireAtLeastOneUpdate(data, ctx, [
      'basic_cards',
      'advanced_cards',
      'legendary_cards',
      'overtone_cards'
    ])
  )

/** Vignette Encounter AI Deck Update Input */
export type VignetteEncounterAIDeckUpdateInput = z.infer<
  typeof VignetteEncounterAIDeckUpdateInputSchema
>

/** Vignette Encounter Monster Update Fields */
const VignetteEncounterMonsterUpdateFields = [
  'accuracy',
  'accuracy_tokens',
  'ai_card_drawn',
  'ai_deck_remaining',
  'damage',
  'damage_tokens',
  'evasion',
  'evasion_tokens',
  'knocked_down',
  'luck',
  'luck_tokens',
  'monster_name',
  'movement',
  'movement_tokens',
  'notes',
  'speed',
  'speed_tokens',
  'strength',
  'strength_tokens',
  'toughness',
  'toughness_tokens',
  'wounds'
]

/** Vignette Encounter Monster Update Input Schema */
export const VignetteEncounterMonsterUpdateInputSchema = z
  .object({
    /** Vignette Encounter Monster ID */
    vignette_encounter_monster_id: VignetteUuidSchema,
    /** Accuracy */
    accuracy: z.number().int('Accuracy must be a whole number.').optional(),
    /** Accuracy Tokens */
    accuracy_tokens: VignetteTokenCountSchema.optional(),
    /** AI Card Drawn */
    ai_card_drawn: z.boolean().optional(),
    /** AI Deck Remaining */
    ai_deck_remaining: VignetteNonNegativeCountSchema.optional(),
    /** Damage */
    damage: z.number().int('Damage must be a whole number.').optional(),
    /** Damage Tokens */
    damage_tokens: VignetteTokenCountSchema.optional(),
    /** Evasion */
    evasion: z.number().int('Evasion must be a whole number.').optional(),
    /** Evasion Tokens */
    evasion_tokens: VignetteTokenCountSchema.optional(),
    /** Knocked Down */
    knocked_down: z.boolean().optional(),
    /** Luck */
    luck: z.number().int('Luck must be a whole number.').optional(),
    /** Luck Tokens */
    luck_tokens: VignetteTokenCountSchema.optional(),
    /** Monster Name */
    monster_name: z
      .string()
      .trim()
      .min(1, 'A nameless monster cannot be recorded.')
      .optional(),
    /** Movement */
    movement: z.number().int('Movement must be a whole number.').optional(),
    /** Movement Tokens */
    movement_tokens: VignetteTokenCountSchema.optional(),
    /** Notes */
    notes: z.string().optional(),
    /** Speed */
    speed: z.number().int('Speed must be a whole number.').optional(),
    /** Speed Tokens */
    speed_tokens: VignetteTokenCountSchema.optional(),
    /** Strength */
    strength: z.number().int('Strength must be a whole number.').optional(),
    /** Strength Tokens */
    strength_tokens: VignetteTokenCountSchema.optional(),
    /** Toughness */
    toughness: z.number().int('Toughness must be a whole number.').optional(),
    /** Toughness Tokens */
    toughness_tokens: VignetteTokenCountSchema.optional(),
    /** Wounds */
    wounds: VignetteNonNegativeCountSchema.optional()
  })
  .superRefine((data, ctx) =>
    requireAtLeastOneUpdate(data, ctx, VignetteEncounterMonsterUpdateFields)
  )

/** Vignette Encounter Monster Update Input */
export type VignetteEncounterMonsterUpdateInput = z.infer<
  typeof VignetteEncounterMonsterUpdateInputSchema
>

/** Vignette Encounter Monster Mood Input Schema */
export const VignetteEncounterMonsterMoodInputSchema = z.object({
  /** Vignette Encounter Monster ID */
  vignette_encounter_monster_id: VignetteUuidSchema,
  /** Mood ID */
  mood_id: VignetteUuidSchema,
  /** Source Vignette Monster Level Mood ID */
  source_vignette_monster_level_mood_id:
    VignetteUuidSchema.nullable().default(null)
})

/** Vignette Encounter Monster Mood Input */
export type VignetteEncounterMonsterMoodInput = z.infer<
  typeof VignetteEncounterMonsterMoodInputSchema
>

/** Vignette Encounter Monster Trait Input Schema */
export const VignetteEncounterMonsterTraitInputSchema = z.object({
  /** Vignette Encounter Monster ID */
  vignette_encounter_monster_id: VignetteUuidSchema,
  /** Trait ID */
  trait_id: VignetteUuidSchema,
  /** Source Vignette Monster Level Trait ID */
  source_vignette_monster_level_trait_id:
    VignetteUuidSchema.nullable().default(null)
})

/** Vignette Encounter Monster Trait Input */
export type VignetteEncounterMonsterTraitInput = z.infer<
  typeof VignetteEncounterMonsterTraitInputSchema
>

/** Vignette Encounter Monster Survivor Status Input Schema */
export const VignetteEncounterMonsterSurvivorStatusInputSchema = z.object({
  /** Vignette Encounter Monster ID */
  vignette_encounter_monster_id: VignetteUuidSchema,
  /** Survivor Status ID */
  survivor_status_id: VignetteUuidSchema,
  /** Source Vignette Monster Level Survivor Status ID */
  source_vignette_monster_level_survivor_status_id:
    VignetteUuidSchema.nullable().default(null)
})

/** Vignette Encounter Monster Survivor Status Input */
export type VignetteEncounterMonsterSurvivorStatusInput = z.infer<
  typeof VignetteEncounterMonsterSurvivorStatusInputSchema
>

/** Vignette Encounter Monster State Delete Input Schema */
export const VignetteEncounterMonsterStateDeleteInputSchema = z.object({
  /** Active Monster State Row ID */
  id: VignetteUuidSchema
})

/** Vignette Encounter Monster State Delete Input */
export type VignetteEncounterMonsterStateDeleteInput = z.infer<
  typeof VignetteEncounterMonsterStateDeleteInputSchema
>

/** Vignette Encounter Survivor Live State Fields */
const VignetteEncounterSurvivorLiveStateFields = [
  'accuracy_tokens',
  'activation_used',
  'arm_heavy_damage',
  'arm_light_damage',
  'bleeding_tokens',
  'block_tokens',
  'body_heavy_damage',
  'body_light_damage',
  'brain_light_damage',
  'dead',
  'deflect_tokens',
  'evasion_tokens',
  'head_heavy_damage',
  'insanity_tokens',
  'knocked_down',
  'leg_heavy_damage',
  'leg_light_damage',
  'luck_tokens',
  'movement_tokens',
  'movement_used',
  'notes',
  'priority_target',
  'retired',
  'scout',
  'speed_tokens',
  'strength_tokens',
  'survival',
  'survival_tokens',
  'waist_heavy_damage',
  'waist_light_damage'
]

/** Vignette Encounter Survivor Live State Update Input Schema */
export const VignetteEncounterSurvivorLiveStateUpdateInputSchema = z
  .object({
    /** Vignette Encounter Survivor ID */
    vignette_encounter_survivor_id: VignetteUuidSchema,
    /** Accuracy Tokens */
    accuracy_tokens: VignetteTokenCountSchema.optional(),
    /** Activation Used */
    activation_used: z.boolean().optional(),
    /** Arm Heavy Damage */
    arm_heavy_damage: z.boolean().optional(),
    /** Arm Light Damage */
    arm_light_damage: z.boolean().optional(),
    /** Bleeding Tokens */
    bleeding_tokens: VignetteNonNegativeCountSchema.optional(),
    /** Block Tokens */
    block_tokens: VignetteTokenCountSchema.optional(),
    /** Body Heavy Damage */
    body_heavy_damage: z.boolean().optional(),
    /** Body Light Damage */
    body_light_damage: z.boolean().optional(),
    /** Brain Light Damage */
    brain_light_damage: z.boolean().optional(),
    /** Dead */
    dead: z.boolean().optional(),
    /** Deflect Tokens */
    deflect_tokens: VignetteTokenCountSchema.optional(),
    /** Evasion Tokens */
    evasion_tokens: VignetteTokenCountSchema.optional(),
    /** Head Heavy Damage */
    head_heavy_damage: z.boolean().optional(),
    /** Insanity Tokens */
    insanity_tokens: VignetteTokenCountSchema.optional(),
    /** Knocked Down */
    knocked_down: z.boolean().optional(),
    /** Leg Heavy Damage */
    leg_heavy_damage: z.boolean().optional(),
    /** Leg Light Damage */
    leg_light_damage: z.boolean().optional(),
    /** Luck Tokens */
    luck_tokens: VignetteTokenCountSchema.optional(),
    /** Movement Tokens */
    movement_tokens: VignetteTokenCountSchema.optional(),
    /** Movement Used */
    movement_used: z.boolean().optional(),
    /** Notes */
    notes: z.string().optional(),
    /** Priority Target */
    priority_target: z.boolean().optional(),
    /** Retired */
    retired: z.boolean().optional(),
    /** Scout */
    scout: z.boolean().optional(),
    /** Speed Tokens */
    speed_tokens: VignetteTokenCountSchema.optional(),
    /** Strength Tokens */
    strength_tokens: VignetteTokenCountSchema.optional(),
    /** Survival */
    survival: VignetteNonNegativeCountSchema.optional(),
    /** Survival Tokens */
    survival_tokens: VignetteTokenCountSchema.optional(),
    /** Waist Heavy Damage */
    waist_heavy_damage: z.boolean().optional(),
    /** Waist Light Damage */
    waist_light_damage: z.boolean().optional()
  })
  .superRefine((data, ctx) => {
    requireAtLeastOneUpdate(data, ctx, VignetteEncounterSurvivorLiveStateFields)
  })

/** Vignette Encounter Survivor Live State Update Input */
export type VignetteEncounterSurvivorLiveStateUpdateInput = z.infer<
  typeof VignetteEncounterSurvivorLiveStateUpdateInputSchema
>

/** Vignette Encounter Survivor Gear Grid Update Input Schema */
export const VignetteEncounterSurvivorGearGridUpdateInputSchema = z
  .object({
    /** Vignette Encounter Survivor Gear Grid ID */
    vignette_encounter_survivor_gear_grid_id: VignetteUuidSchema,
    /** Gear ID */
    gear_id: VignetteUuidSchema.optional(),
    /** Row Number */
    row_number: VignetteGridCoordinateSchema.optional(),
    /** Column Number */
    column_number: VignetteGridCoordinateSchema.optional()
  })
  .superRefine((data, ctx) =>
    requireAtLeastOneUpdate(data, ctx, [
      'gear_id',
      'row_number',
      'column_number'
    ])
  )

/** Vignette Encounter Survivor Gear Grid Update Input */
export type VignetteEncounterSurvivorGearGridUpdateInput = z.infer<
  typeof VignetteEncounterSurvivorGearGridUpdateInputSchema
>

/** Vignette Share Input Schema */
export const VignetteShareInputSchema = z.object({
  /** Vignette Encounter ID */
  vignette_encounter_id: VignetteUuidSchema,
  /** Username */
  username: z
    .string()
    .trim()
    .min(1, 'A nameless collaborator cannot be invited.')
})

/** Vignette Share Input */
export type VignetteShareInput = z.infer<typeof VignetteShareInputSchema>

/** Vignette Share Removal Input Schema */
export const VignetteShareRemovalInputSchema = z.object({
  /** Vignette Encounter ID */
  vignette_encounter_id: VignetteUuidSchema,
  /** Shared User ID */
  shared_user_id: VignetteUuidSchema
})

/** Vignette Share Removal Input */
export type VignetteShareRemovalInput = z.infer<
  typeof VignetteShareRemovalInputSchema
>
