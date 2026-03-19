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
 * Character Detail
 *
 * Used throughout the app to represent a character object. Includes additional
 * information not present in the character table.
 */
export type CharacterDetail = Omit<
  Tables<'character'>,
  'created_at' | 'updated_at' | 'custom' | 'user_id'
> & {}

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
  /** Principle Data */
  principle_data: {
    /** Option 1 Name */
    option_1_name: string
    /** Option 1 Selected */
    option_1_selected: boolean
    /** Option 2 Name */
    option_2_name: string
    /** Option 2 Selected */
    option_2_selected: boolean
    /** Principle Name */
    principle_name: string
  }[]
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
  /** Cursed Gear Names */
  cursed_gear_names: string[]
  /** Disorder Names */
  disorder_names: string[]
  /** Survivor Embarked on Hunt/Showdown */
  embarked: boolean
  /** Fighting Art Names */
  fighting_art_names: string[]
  /** Knowledge 1 Name */
  knowledge_1_name: string | null
  /** Knowledge 2 Name */
  knowledge_2_name: string | null
  /** Neurosis Name */
  neurosis_name: string | null
  /** Philosophy Name */
  philosophy_name: string | null
  /** Secret Fighting Art Names */
  secret_fighting_art_names: string[]
  /** Tenet Knowledge Name */
  tenet_knowledge_name: string | null
}

/**
 * Wanderer Detail
 *
 * Used throughout the app to represent the currently selected wanderer.
 * Includes additional information not present in the wanderer table.
 */
export type WandererDetail = Omit<
  Tables<'wanderer'>,
  'created_at' | 'updated_at' | 'custom' | 'user_id'
> & {
  embarked: boolean
}
