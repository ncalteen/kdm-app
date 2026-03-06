'use client'

import { CampaignType, SurvivorType } from '@/lib/enums'
import { z } from 'zod'

/**
 * New Settlement Input Schema
 *
 * This is used to ensure that when creating a new settlement, the necessary
 * data is included based on the selected campaign type.
 */
export const NewSettlementInputSchema = z.object({
  /** Campaign Type */
  campaignType: z
    .enum(CampaignType)
    .default(CampaignType.PEOPLE_OF_THE_LANTERN),
  /** Settlement Name */
  settlementName: z
    .string()
    .min(1, 'A nameless settlement cannot be recorded.'),
  /** Survivor Type */
  survivorType: z.enum(SurvivorType).default(SurvivorType.CORE),
  /** Uses Scouts */
  usesScouts: z.boolean().default(false),
  /**
   * Monster ID Selection
   *
   * It's normally recommended to only have one monster per node, but custom
   * campaigns allow for more flexibility.
   */
  monsterIds: z.object({
    /** Node Quarry 1 Monster ID Selection */
    NQ1: z.array(z.string()).default([]),
    /** Node Quarry 2 Monster ID Selection */
    NQ2: z.array(z.string()).default([]),
    /** Node Quarry 3 Monster ID Selection */
    NQ3: z.array(z.string()).default([]),
    /** Node Quarry 4 Monster ID Selection */
    NQ4: z.array(z.string()).default([]),
    /** Node Nemesis 1 Monster ID Selection */
    NN1: z.array(z.string()).default([]),
    /** Node Nemesis 2 Monster ID Selection */
    NN2: z.array(z.string()).default([]),
    /** Node Nemesis 3 Monster ID Selection */
    NN3: z.array(z.string()).default([]),
    /** Core Monster ID Selection */
    CO: z.array(z.string()).default([]),
    /** Finale Monster ID Selection */
    FI: z.array(z.string()).default([])
  }),
  /** Wanderer ID Selection */
  wandererIds: z.array(z.string()).default([])
})

/**
 * New Settlement Input Schema
 *
 * This is used to ensure that when creating a new settlement, the necessary
 * data is included based on the selected campaign type.
 */
export type NewSettlementInput = z.infer<typeof NewSettlementInputSchema>
