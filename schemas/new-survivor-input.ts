import { AenasState, Gender } from '@/lib/enums'
import { z } from 'zod'

/**
 * New Survivor Input Schema
 *
 * This includes all attributes and properties that are needed when creating a
 * new survivor.
 */
export const NewSurvivorInputSchema = z.object({
  /** Abilities and Impairments */
  abilitiesAndImpairments: z
    .array(
      z.string().min(1, 'A nameless ability/impairment cannot be recorded.')
    )
    .default([]),
  /** Accuracy */
  accuracy: z.number().default(0),
  /**
   * Aenas' State
   *
   * Currently only used by Aenas (Wanderer) to track her Hungry/Content state
   * while in the settlement.
   */
  aenasState: z.enum(AenasState).optional(),
  /** Can Dash */
  canDash: z.boolean().default(false),
  /** Can Dodge */
  canDodge: z.boolean().default(true),
  /** Can Fist Pump */
  canFistPump: z.boolean().default(false),
  /** Can Encourage */
  canEncourage: z.boolean().default(false),
  /** Can Surge */
  canSurge: z.boolean().default(false),
  /** Courage */
  courage: z
    .number()
    .min(0, 'Courage cannot be negative.')
    .max(9, 'Courage may not exceed 9.')
    .default(0),
  /** Disposition (Wanderers) */
  disposition: z.number().optional(),
  /** Evasion */
  evasion: z.number().default(0),
  /** Fighting Arts */
  fightingArts: z
    .array(z.string().min(1, 'A nameless fighting art cannot be recorded.'))
    .default([]),
  /** Gender */
  gender: z.enum(Gender).default(Gender.FEMALE),
  /** Hunt XP */
  huntXP: z
    .number()
    .min(0, 'Hunt XP cannot be negative.')
    .max(16, 'Hunt XP cannot exceed 16.')
    .default(0),
  /** Hunt XP Rank Up Milestones */
  huntXPRankUp: z.array(z.number()).default([]),
  /** Insanity */
  insanity: z.number().min(0, 'Insanity cannot be negative.').default(0),
  /** Luck */
  luck: z.number().default(0),
  /** Movement */
  movement: z.number().min(1, 'Movement cannot be less than 1.').default(5),
  /** Settlement ID */
  settlementId: z.string(),
  /** Speed */
  speed: z.number().default(0),
  /** Strength */
  strength: z.number().default(0),
  /**
   * Survival
   *
   * Named survivors start with 1 survival.
   */
  survival: z.number().min(0, 'Survival cannot be negative.').default(1),
  /** Survivor Name */
  survivorName: z.string().optional(),
  /** Understanding */
  understanding: z
    .number()
    .min(0, 'Understanding cannot be negative.')
    .max(9, 'Understanding cannot exceed 9.')
    .default(0),
  /** Survivor is a Wanderer */
  wanderer: z.boolean().default(false),

  /*
   * Severe Injuries
   *
   * Currently only used by Luck (Wanderer) during creation.
   */

  /** Arm: Broken */
  armBroken: z
    .number()
    .min(0, 'Broken arm count cannot be negative.')
    .max(2, 'Broken arm count cannot exceed 2.')
    .default(0),
  /** Arm: Contracture */
  armContracture: z
    .number()
    .min(0, 'Arm contracture count cannot be negative.')
    .max(5, 'Arm contracture count cannot exceed 5.')
    .default(0),
  /** Arm: Dismembered */
  armDismembered: z
    .number()
    .min(0, 'Dismembered arm count cannot be negative.')
    .max(2, 'Dismembered arm count cannot exceed 2.')
    .default(0),
  /** Arm: Ruptured Muscle */
  armRupturedMuscle: z.boolean().default(false),
  /** Body: Broken Rib */
  bodyBrokenRib: z
    .number()
    .min(0, 'Broken rib count cannot be negative.')
    .max(5, 'Broken rib count cannot exceed 5.')
    .default(0),
  /** Body: Destroyed Back */
  bodyDestroyedBack: z.boolean().default(false),
  /** Body: Gaping Chest Wound */
  bodyGapingChestWound: z
    .number()
    .min(0, 'Gaping chest wound count cannot be negative.')
    .max(5, 'Gaping chest wound count cannot exceed 5.')
    .default(0),
  /** Head: Blind */
  headBlind: z
    .number()
    .min(0, 'Blind count cannot be negative.')
    .max(2, 'Blind count cannot exceed 2.')
    .default(0),
  /** Head: Deaf */
  headDeaf: z.boolean().default(false),
  /** Head: Intracranial Hemorrhage */
  headIntracranialHemorrhage: z.boolean().default(false),
  /** Head: Shattered Jaw */
  headShatteredJaw: z.boolean().default(false),
  /** Leg: Broken */
  legBroken: z
    .number()
    .min(0, 'Broken leg count cannot be negative.')
    .max(2, 'Broken leg count cannot exceed 2.')
    .default(0),
  /** Leg: Dismembered */
  legDismembered: z
    .number()
    .min(0, 'Dismembered leg count cannot be negative.')
    .max(2, 'Dismembered leg count cannot exceed 2.')
    .default(0),
  /** Leg: Hamstrung */
  legHamstrung: z.boolean().default(false),
  /** Waist: Broken Hip */
  waistBrokenHip: z.boolean().default(false),
  /** Waist: Destroyed Genitals */
  waistDestroyedGenitals: z.boolean().default(false),
  /** Waist: Intestinal Prolapse */
  waistIntestinalProlapse: z.boolean().default(false),
  /** Waist: Warped Pelvis */
  waistWarpedPelvis: z
    .number()
    .min(0, 'Warped pelvis count cannot be negative.')
    .max(5, 'Warped pelvis count cannot exceed 5.')
    .default(0),

  /*
   * Arc Survivors
   */

  /** Can Endure */
  canEndure: z.boolean().default(false),
  /** Lumi */
  lumi: z.number().min(0, 'Lumi cannot be negative.').default(0),
  /** Systemic Pressure */
  systemicPressure: z
    .number()
    .min(0, 'Systemic pressure cannot be negative.')
    .default(0),
  /** Torment */
  torment: z.number().min(0, 'Torment cannot be negative.').default(0)
})

/**
 * New Survivor Input
 */
export type NewSurvivorInput = z.infer<typeof NewSurvivorInputSchema>
