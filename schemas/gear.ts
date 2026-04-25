import { Constants } from '@/lib/database.types'
import { z } from 'zod'

/**
 * Gear Category Schema
 *
 * Drives which conditional fields are required when validating a gear
 * payload. Persisted as the combination of populated columns
 * (weapon_type_id / armor_location / armor_points / accessory / weapon
 * stats) on the gear row.
 */
export const GearCategorySchema = z.enum(['OTHER', 'WEAPON', 'ARMOR'])

/**
 * Gear Category
 */
export type GearCategory = z.infer<typeof GearCategorySchema>

/** Affinity Slot Schema */
export const AffinitySchema = z.enum(Constants.public.Enums.affinity)

/** Armor Location Schema */
export const ArmorLocationSchema = z.enum(Constants.public.Enums.armor_location)

/** Gear Keyword Schema */
export const GearKeywordSchema = z.enum(Constants.public.Enums.gear_keyword)

/** Resource Type Schema */
export const ResourceTypeSchema = z.enum(Constants.public.Enums.resource_type)

/**
 * Affinity Bonus Requirement Schema
 *
 * Each requirement is a single affinity color, optionally flagged as a "puzzle"
 * requirement.
 */
export const GearAffinityRequirementSchema = z.object({
  /** Affinity Color */
  affinity: AffinitySchema,
  /** Puzzle Flag */
  puzzle: z.boolean().default(false)
})

/**
 * Gear Affinity Requirement
 */
export type GearAffinityRequirement = z.infer<
  typeof GearAffinityRequirementSchema
>

/**
 * Gear Crafting - Gear Cost Schema
 */
export const GearGearCostSchema = z.object({
  /** Gear ID */
  cost_gear_id: z.string().uuid('Cost gear must be a valid id.'),
  /** Quantity Required */
  quantity: z
    .number()
    .int('Cost quantity must be a whole number.')
    .min(1, 'Cost quantity must be at least one.')
})

/**
 * Gear Crafting - Gear Cost
 */
export type GearGearCost = z.infer<typeof GearGearCostSchema>

/**
 * Gear Crafting - Resource Cost Schema
 */
export const GearResourceCostSchema = z.object({
  /** Resource ID */
  resource_id: z.string().uuid('Cost resource must be a valid id.'),
  /** Quantity Required */
  quantity: z
    .number()
    .int('Cost quantity must be a whole number.')
    .min(1, 'Cost quantity must be at least one.')
})

/**
 * Gear Crafting - Resource Cost
 */
export type GearResourceCost = z.infer<typeof GearResourceCostSchema>

/**
 * Gear Crafting - Resource Type Cost Schema
 */
export const GearResourceTypeCostSchema = z.object({
  /** Resource Type */
  resource_type: ResourceTypeSchema,
  /** Quantity Required */
  quantity: z
    .number()
    .int('Cost quantity must be a whole number.')
    .min(1, 'Cost quantity must be at least one.')
})

/**
 * Gear Crafting - Resource Type Cost
 */
export type GearResourceTypeCost = z.infer<typeof GearResourceTypeCostSchema>

/**
 * Gear Input Schema
 *
 * Validates the payload produced by the gear dialog. The required-field rules
 * vary by gear category:
 *
 * - All gear: `gear_name`.
 * - Weapon: `speed`, `accuracy`, `strength`, `weapon_type_id`.
 * - Armor: `armor_points`, `armor_location`.
 *
 * All other fields (location, affinities, keywords, rules, costs, etc.) are
 * optional regardless of category.
 */
export const GearInputSchema = z
  .object({
    /**
     * Gear Category
     *
     * Drives conditional validation.
     */
    category: GearCategorySchema,
    /** Gear Name (All) */
    gear_name: z
      .string()
      .trim()
      .min(1, 'A nameless piece of gear cannot be forged.'),
    /** Location ID */
    location_id: z.string().uuid().nullable().default(null),
    /** Accessory (Armor) */
    accessory: z.boolean().nullable().default(null),
    /** Accuracy (Weapon) */
    accuracy: z
      .number()
      .int('Accuracy must be a whole number.')
      .nullable()
      .default(null),
    /** Affinity Top */
    affinity_top: AffinitySchema.nullable().default(null),
    /** Affinity Left */
    affinity_left: AffinitySchema.nullable().default(null),
    /** Affinity Right */
    affinity_right: AffinitySchema.nullable().default(null),
    /** Affinity Bottom */
    affinity_bottom: AffinitySchema.nullable().default(null),
    /** Affinity Bonus Rules */
    affinity_bonus: z.string().nullable().default(null),
    /** Affinity Bonus Requirements */
    affinity_bonus_requirements: z
      .array(GearAffinityRequirementSchema)
      .default([]),
    /** Armor Points (Armor) */
    armor_points: z
      .number()
      .int('Armor points must be a whole number.')
      .min(0, 'Armor points cannot be negative.')
      .nullable()
      .default(null),
    /** Armor Location (Armor) */
    armor_location: ArmorLocationSchema.nullable().default(null),
    /** Keywords */
    keywords: z.array(GearKeywordSchema).default([]),
    /** Rules */
    rules: z.string().nullable().default(null),
    /** Speed (Weapon) */
    speed: z
      .number()
      .int('Speed must be a whole number.')
      .nullable()
      .default(null),
    /** Strength (Weapon) */
    strength: z
      .number()
      .int('Strength must be a whole number.')
      .nullable()
      .default(null),
    /** Weapon Type ID (Weapon) */
    weapon_type_id: z.uuid().nullable().default(null),
    /** Crafting Cost: Gear */
    gear_costs: z.array(GearGearCostSchema).default([]),
    /** Crafting Cost: Resources */
    resource_costs: z.array(GearResourceCostSchema).default([]),
    /** Crafting Cost: Resource Types */
    resource_type_costs: z.array(GearResourceTypeCostSchema).default([])
  })
  .superRefine((data, ctx) => {
    // Weapon-specific required fields
    if (data.category === 'WEAPON') {
      if (data.speed == null)
        ctx.addIssue({
          code: 'custom',
          path: ['speed'],
          message: 'A weapon must have a speed.'
        })

      if (data.accuracy == null)
        ctx.addIssue({
          code: 'custom',
          path: ['accuracy'],
          message: 'A weapon must have an accuracy.'
        })

      if (data.strength == null)
        ctx.addIssue({
          code: 'custom',
          path: ['strength'],
          message: 'A weapon must have a strength.'
        })

      if (!data.weapon_type_id)
        ctx.addIssue({
          code: 'custom',
          path: ['weapon_type_id'],
          message: 'A weapon must have a weapon type.'
        })
    }

    // Armor-specific required fields
    if (data.category === 'ARMOR') {
      if (data.armor_points == null)
        ctx.addIssue({
          code: 'custom',
          path: ['armor_points'],
          message: 'Armor must have armor points.'
        })

      if (data.armor_location == null)
        ctx.addIssue({
          code: 'custom',
          path: ['armor_location'],
          message: 'Armor must have an armor location.'
        })
    }
  })

/**
 * Gear Input
 *
 * Inferred type for a validated gear dialog payload.
 */
export type GearInput = z.infer<typeof GearInputSchema>
