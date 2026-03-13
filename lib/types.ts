import { Tables } from '@/lib/database.types'

/**
 * Campaign Template
 *
 * Base information used to create a new settlement using a campaign template.
 */
export type CampaignTemplate = {
  /** Collective Cognition Reward IDs */
  collectiveCognitionRewardIds: string[]
  /** Innovation IDs */
  innovationIds: string[]
  /** Location IDs */
  locationIds: string[]
  /** Milestone IDs */
  milestoneIds: string[]
  /** Nemesis IDs */
  nemesisIds: string[]
  /** Principle IDs */
  principleIds: string[]
  /** Quarry IDs */
  quarryIds: string[]
  /**
   * Settlement Timeline
   *
   * These are not IDs, as they are added into the settlement_timeline table as
   * part of settlement creation. They aren't shared globally.
   */
  timeline: {
    year_number: number
    entries: string[]
  }[]
  /** Wanderer IDs */
  wandererIds: string[]
}

/**
 * Hunt Detail
 *
 * Used throughout the app to represent the currently selected hunt. Includes
 * additional information not present in the hunt table.
 */
export type HuntDetail = Tables<'hunt'> & {}

/**
 * Settlement Detail
 *
 * Used throughout the app to represent the currently selected settlement.
 * Includes additional information not present in the settlement table.
 */
export type SettlementDetail = Tables<'settlement'> & {
  /** Can Encourage */
  can_encourage: boolean
  /** Can Surge */
  can_surge: boolean
  /** Can Dash */
  can_dash: boolean
  /** Can Fist Pump */
  can_fist_pump: boolean
  /** Can Endure */
  can_endure: boolean
  /** Shared Settlement */
  shared: boolean
  /** Survivors Born with +1 Understanding */
  survivors_born_with_understanding: boolean
}

/**
 * Settlement Phase Detail
 *
 * Used throughout the app to represent the currently selected settlement phase.
 * Includes additional information not present in the settlement_phase table.
 */
export type SettlementPhaseDetail = Tables<'settlement_phase'> & {}

/**
 * Showdown Detail
 *
 * Used throughout the app to represent the currently selected showdown.
 * Includes additional information not present in the showdown table.
 */
export type ShowdownDetail = Tables<'showdown'> & {}

/**
 * Survivor Detail
 *
 * Used throughout the app to represent the currently selected survivor.
 * Includes additional information not present in the survivor table.
 */
export type SurvivorDetail = Tables<'survivor'> & {
  embarked: boolean
}

/**
 * Wanderer Detail
 *
 * Used throughout the app to represent the currently selected wanderer.
 * Includes additional information not present in the wanderer table.
 */
export type WandererDetail = Tables<'wanderer'> & {
  embarked: boolean
}
