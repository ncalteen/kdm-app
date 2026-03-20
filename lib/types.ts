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
 * Collective Cognition Reward Detail
 *
 * Used throughout the app to represent a collective cognition reward.
 */
export type CollectiveCognitionRewardDetail = Omit<
  Tables<'collective_cognition_reward'>,
  'created_at' | 'updated_at' | 'custom' | 'user_id'
>

/**
 * Disorder Detail
 *
 * Used throughout the app to represent a disorder.
 */
export type DisorderDetail = Omit<
  Tables<'disorder'>,
  'created_at' | 'updated_at' | 'custom' | 'user_id'
>

/**
 * Fighting Art Detail
 *
 * Used throughout the app to represent a fighting art.
 */
export type FightingArtDetail = Omit<
  Tables<'fighting_art'>,
  'created_at' | 'updated_at' | 'custom' | 'user_id'
>

/**
 * Secret Fighting Art Detail
 *
 * Used throughout the app to represent a secret fighting art.
 */
export type SecretFightingArtDetail = Omit<
  Tables<'secret_fighting_art'>,
  'created_at' | 'updated_at' | 'custom' | 'user_id'
>

/**
 * Gear Detail
 *
 * Used throughout the app to represent a gear item.
 */
export type GearDetail = Omit<
  Tables<'gear'>,
  'created_at' | 'updated_at' | 'custom' | 'user_id'
>

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
 * Used throughout the app to represent the currently selected hunt.
 */
export type HuntDetail = Omit<Tables<'hunt'>, 'created_at' | 'updated_at'> & {
  /** Hunt Board */
  hunt_board: HuntHuntBoardDetail
  /** Hunt Monsters */
  hunt_monsters: { [key: string]: HuntMonsterDetail }
  /** Hunt Survivors */
  hunt_survivors: { [key: string]: HuntSurvivorDetail }
}

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
 * Hunt Monster Detail
 *
 * Used throughout the app to represent a monster in a hunt.
 */
export type HuntMonsterDetail = Omit<
  Tables<'hunt_monster'>,
  'created_at' | 'updated_at'
> & {
  /** AI Deck */
  ai_deck: HuntAIDeckDetail
}

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
 * Innovation Detail
 *
 * Used throughout the app to represent an innovation.
 */
export type InnovationDetail = Omit<
  Tables<'innovation'>,
  'created_at' | 'updated_at' | 'custom' | 'user_id'
>

/**
 * Knowledge Detail
 *
 * Used throughout the app to represent a knowledge.
 */
export type KnowledgeDetail = Omit<
  Tables<'knowledge'>,
  'created_at' | 'updated_at' | 'custom' | 'user_id'
>

/**
 * Location Detail
 *
 * Used throughout the app to represent a location.
 */
export type LocationDetail = Omit<
  Tables<'location'>,
  'created_at' | 'updated_at' | 'custom' | 'user_id'
>

/**
 * Milestone Detail
 *
 * Used throughout the app to represent a milestone.
 */
export type MilestoneDetail = Omit<
  Tables<'milestone'>,
  'created_at' | 'updated_at' | 'custom' | 'user_id'
>

/**
 * Nemesis Detail
 *
 * Used throughout the app to represent a nemesis.
 */
export type NemesisDetail = Omit<
  Tables<'nemesis'>,
  'created_at' | 'updated_at' | 'custom' | 'user_id'
>

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
 * Pattern Detail
 *
 * Used throughout the app to represent a pattern.
 */
export type PatternDetail = Omit<
  Tables<'pattern'>,
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
 * Principle Detail
 *
 * Used throughout the app to represent a principle.
 */
export type PrincipleDetail = Omit<
  Tables<'principle'>,
  'created_at' | 'updated_at' | 'custom' | 'user_id'
>

/**
 * Quarry Detail
 *
 * Used throughout the app to represent a quarry.
 */
export type QuarryDetail = Omit<
  Tables<'quarry'>,
  'created_at' | 'updated_at' | 'custom' | 'user_id'
>

/**
 * Resource Detail
 *
 * Used throughout the app to represent a resource.
 */
export type ResourceDetail = Omit<
  Tables<'resource'>,
  'created_at' | 'updated_at' | 'custom' | 'user_id'
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
  /** Collective Cognition Rewards */
  collective_cognition_rewards: {
    /** Collective Cognition Reward Collective Cognition */
    collective_cognition: string
    /** Collective Cognition Reward ID */
    collective_cognition_reward_id: string
    /** Settlement Collective Cognition Reward ID */
    id: string
    /** Collective Cognition Reward Name */
    reward_name: string
    /** Unlocked */
    unlocked: boolean
  }[]
  /** Gear */
  gear: {
    /** Settlement Gear ID */
    id: string
    /** Gear ID */
    gear_id: string
    /** Gear Name */
    gear_name: string
    /** Quantity */
    quantity: number
  }[]
  /** Innovations */
  innovations: {
    /** Settlement Innovation ID */
    id: string
    /** Innovation ID */
    innovation_id: string
    /** Innovation Name */
    innovation_name: string
  }[]
  /** Knowledges */
  knowledges: {
    /** Settlement Knowledge ID */
    id: string
    /** Knowledge ID */
    knowledge_id: string
    /** Knowledge Name */
    knowledge_name: string
  }[]
  /** Locations */
  locations: {
    /** Settlement Location ID */
    id: string
    /** Location ID */
    location_id: string
    /** Location Name */
    location_name: string
    /** Unlocked */
    unlocked: boolean
  }[]
  /** Milestones */
  milestones: {
    /** Complete */
    complete: boolean
    /** Settlement Milestone ID */
    id: string
    /** Milestone ID */
    milestone_id: string
    /** Milestone Name */
    milestone_name: string
  }[]
  /** Nemeses */
  nemeses: {
    /** Available Levels */
    available_levels: number[]
    /** Collective Cognition Level 1 */
    collective_cognition_level_1: boolean
    /** Collective Cognition Level 2 */
    collective_cognition_level_2: boolean
    /** Collective Cognition Level 3 */
    collective_cognition_level_3: boolean
    /** Settlement Nemesis ID */
    id: string
    /** Level 1 Defeated */
    level_1_defeated: boolean
    /** Level 2 Defeated */
    level_2_defeated: boolean
    /** Level 3 Defeated */
    level_3_defeated: boolean
    /** Level 4 Defeated */
    level_4_defeated: boolean
    /** Nemesis ID */
    nemesis_id: string
    /** Unlocked */
    unlocked: boolean
    /** Monster Name */
    monster_name: string
    /** Node */
    node: string
  }[]
  /** Patterns */
  patterns: {
    /** Settlement Pattern ID */
    id: string
    /** Pattern ID */
    pattern_id: string
    /** Pattern Name */
    pattern_name: string
  }[]
  /** Philosophies */
  philosophies: {
    /** Settlement Philosophy ID */
    id: string
    /** Philosophy ID */
    philosophy_id: string
    /** Philosophy Name */
    philosophy_name: string
  }[]
  /** Principles */
  principles: {
    /** Settlement Principle ID */
    id: string
    /** Option 1 Name */
    option_1_name: string
    /** Option 1 Selected */
    option_1_selected: boolean
    /** Option 2 Name */
    option_2_name: string
    /** Option 2 Selected */
    option_2_selected: boolean
    /** Principle ID */
    principle_id: string
    /** Principle Name */
    principle_name: string
  }[]
  /** Quarries */
  quarries: {
    /** Collective Cognition Level 1 */
    collective_cognition_level_1: boolean
    /** Collective Cognition Level 2 */
    collective_cognition_level_2: [boolean, boolean]
    /** Collective Cognition Level 3 */
    collective_cognition_level_3: [boolean, boolean, boolean]
    /** Collective Cognition Prologue */
    collective_cognition_prologue: boolean
    /** Settlement Quarry ID */
    id: string
    /** Monster Name */
    monster_name: string
    /** Node */
    node: string
    /** Quarry ID */
    quarry_id: string
    /** Unlocked */
    unlocked: boolean
  }[]
  /** Resources */
  resources: {
    /** Category */
    category: string
    /** Settlement Resource ID */
    id: string
    /** Quarry ID */
    quarry_id: string | null
    /** Resource ID */
    resource_id: string
    /** Resource Name */
    resource_name: string
    /** Resource Types */
    resource_types: string[]
  }[]
  /** Seed Patterns */
  seed_patterns: {
    /** Settlement Seed Pattern ID */
    id: string
    /** Seed Pattern ID */
    seed_pattern_id: string
    /** Seed Pattern Name */
    seed_pattern_name: string
  }[]
  /** Shared Settlement */
  shared: boolean
  /** Survivors Born with +1 Understanding */
  survivors_born_with_understanding: boolean
  /** Settlement Timeline */
  timeline: {
    /** Year Number */
    [key: number]: {
      /** Year Completed */
      completed: boolean
      /** Settlement Timeline Year Entries */
      entries: string[]
      /** Settlement Timeline Year ID */
      id: string
    }
  }
}

/**
 * Settlement Phase Detail
 *
 * Used throughout the app to represent the currently selected settlement phase.
 */
export type SettlementPhaseDetail = Omit<
  Tables<'settlement_phase'>,
  'created_at' | 'updated_at'
> & {
  /** Returning Survivor IDs */
  returning_survivor_ids: string[]
}

/**
 * Settlement Nemesis Detail
 *
 * Used throughout the app to represent a settlement nemesis.
 */
export type SettlementNemesisDetail = Omit<
  Tables<'settlement_nemesis'>,
  'created_at' | 'updated_at' | 'settlement_id'
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
 * Showdown Detail
 *
 * Used throughout the app to represent the currently selected showdown.
 */
export type ShowdownDetail = Omit<
  Tables<'showdown'>,
  'created_at' | 'updated_at'
> & {
  /** Showdown Monsters */
  showdown_monsters: { [key: string]: ShowdownMonsterDetail }
  /** Showdown Survivors */
  showdown_survivors: { [key: string]: ShowdownSurvivorDetail }
}

/**
 * Showdown Monster Detail
 *
 * Used throughout the app to represent a monster in a showdown.
 */
export type ShowdownMonsterDetail = Omit<
  Tables<'showdown_monster'>,
  'created_at' | 'updated_at'
> & {
  /** AI Deck */
  ai_deck: ShowdownAIDeckDetail
}

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
 * Strain Milestone Detail
 *
 * Used throughout the app to represent a strain milestone.
 */
export type StrainMilestoneDetail = Omit<
  Tables<'strain_milestone'>,
  'created_at' | 'updated_at' | 'custom' | 'user_id'
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

/**
 * Weapon Type Detail
 *
 * Used throughout the app to represent a weapon type.
 */
export type WeaponTypeDetail = Omit<
  Tables<'weapon_type'>,
  'created_at' | 'updated_at' | 'custom' | 'user_id'
>
