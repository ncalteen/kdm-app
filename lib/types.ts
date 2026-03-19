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
 * Hunt AI Deck Detail
 *
 * Used throughout the app to represent a monster's AI deck in a hunt.
 */
export type HuntAIDeckDetail = Omit<
  Tables<'hunt_ai_deck'>,
  'created_at' | 'updated_at' | 'settlement_id' | 'hunt_id'
>

/**
 * Hunt Detail
 *
 * Used throughout the app to represent the currently selected hunt. Includes
 * additional information not present in the hunt table.
 */
export type HuntDetail = Tables<'hunt'> & {}

/**
 * Hunt Hunt Board Detail
 *
 * Used throughout the app to represent a hunt board.
 */
export type HuntHuntBoardDetail = Omit<
  Tables<'hunt_hunt_board'>,
  'created_at' | 'updated_at'
>

/**
 * Hunt Survivor Detail
 *
 * Used throughout the app to represent a survivor in a hunt.
 */
export type HuntSurvivorDetail = Omit<
  Tables<'hunt_survivor'>,
  'created_at' | 'updated_at'
>

/**
 * Hunt Monster Detail
 *
 * Used throughout the app to represent a monster in a hunt.
 */
export type HuntMonsterDetail = Omit<
  Tables<'hunt_monster'>,
  'created_at' | 'updated_at'
>

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
  /** Gear */
  gear: {
    /** Gear ID */
    id: string
    /** Gear Name */
    gear_name: string
    /** Quantity */
    quantity: number
  }[]
  /** Principle Data */
  principle_data: {
    /** Principle ID */
    id: string
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
 */
export type ShowdownDetail = Omit<
  Tables<'showdown'>,
  'created_at' | 'updated_at'
>

/**
 * Showdown Monster Detail
 *
 * Used throughout the app to represent a monster in a showdown.
 */
export type ShowdownMonsterDetail = Omit<
  Tables<'showdown_monster'>,
  'created_at' | 'updated_at'
>

/**
 * Showdown AI Deck Detail
 *
 * Used throughout the app to represent a monster's AI deck in a showdown.
 */
export type ShowdownAIDeckDetail = Omit<
  Tables<'showdown_ai_deck'>,
  'created_at' | 'updated_at' | 'settlement_id' | 'showdown_id'
>

/**
 * Showdown Survivor Detail
 *
 * Used throughout the app to represent a survivor in a showdown.
 */
export type ShowdownSurvivorDetail = Omit<
  Tables<'showdown_survivor'>,
  'created_at' | 'updated_at'
>

/**
 * Survivor Detail
 *
 * Used throughout the app to represent the currently selected survivor.
 * Includes additional information not present in the survivor table.
 */
export type SurvivorDetail = Tables<'survivor'> & {
  /** Cursed Gear */
  cursed_gear: {
    /** Cursed Gear Name */
    gear_name: string
    /** Cursed Gear ID */
    id: string
  }[]
  /** Disorders */
  disorders: {
    /** Disorder Name */
    disorder_name: string
    /** Disorder ID */
    id: string
  }[]
  /** Survivor Embarked on Hunt/Showdown */
  embarked: boolean
  /** Fighting Arts */
  fighting_arts: {
    /** Fighting Art Name */
    fighting_art_name: string
    /** Fighting Art ID */
    id: string
  }[]
  /** Knowledge 1 */
  knowledge_1: {
    /** Knowledge ID */
    id: string
    /** Knowledge Name */
    knowledge_name: string
  } | null
  /** Knowledge 2 */
  knowledge_2: {
    /** Knowledge ID */
    id: string
    /** Knowledge Name */
    knowledge_name: string
  } | null
  /** Neurosis */
  neurosis: {
    /** Neurosis ID */
    id: string
    /** Neurosis Name */
    neurosis_name: string
  } | null
  /** Philosophy */
  philosophy: {
    /** Philosophy ID */
    id: string
    /** Philosophy Name */
    philosophy_name: string
  } | null
  /** Secret Fighting Arts */
  secret_fighting_arts: {
    /** Secret Fighting Art ID */
    id: string
    /** Secret Fighting Art Name */
    secret_fighting_art_name: string
  }[]
  /** Tenet Knowledge */
  tenet_knowledge: {
    /** Knowledge ID */
    id: string
    /** Knowledge Name */
    knowledge_name: string
  } | null
}

/**
 * Neurosis Detail
 *
 * Used throughout the app to represent a neurosis.
 */
export type NeurosisDetail = Omit<
  Tables<'neurosis'>,
  'created_at' | 'updated_at' | 'custom' | 'user_id'
>

/**
 * Philosophy Detail
 *
 * Used throughout the app to represent a philosophy.
 */
export type PhilosophyDetail = Omit<
  Tables<'philosophy'>,
  'created_at' | 'updated_at' | 'custom' | 'user_id'
>

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

/**
 * Wanderer Timeline Year Detail
 *
 * Used throughout the app to represent a wanderer timeline year.
 */
export type WandererTimelineYearDetail = Omit<
  Tables<'wanderer_timeline_year'>,
  'created_at' | 'updated_at'
>
