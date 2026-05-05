import { Database, Tables } from '@/lib/database.types'
import { HuntEventType } from '@/lib/enums'

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
 * Ability/Impairment Detail
 *
 * Used throughout the app to represent an abilitiy/impairment object. Includes
 * additional information not present in the ability_impairment table.
 */
export type AbilityImpairmentDetail = Omit<
  Tables<'ability_impairment'>,
  'created_at' | 'updated_at' | 'user_id'
> & {}

/**
 * Trait Detail
 *
 * Used throughout the app to represent a monster trait. Custom traits are
 * scoped to a single user; non-custom traits are part of the shared catalog.
 */
export type TraitDetail = Omit<
  Tables<'trait'>,
  'created_at' | 'updated_at' | 'user_id'
> & {}

/**
 * Mood Detail
 *
 * Used throughout the app to represent a monster mood. Custom moods are scoped
 * to a single user; non-custom moods are part of the shared catalog.
 */
export type MoodDetail = Omit<
  Tables<'mood'>,
  'created_at' | 'updated_at' | 'user_id'
> & {}

/**
 * Survivor Status Detail
 *
 * Used throughout the app to represent a survivor status inflicted by a
 * nemesis or quarry level. Custom statuses are scoped to a single user;
 * non-custom statuses are part of the shared catalog.
 */
export type SurvivorStatusDetail = Omit<
  Tables<'survivor_status'>,
  'created_at' | 'updated_at' | 'user_id'
> & {}

/**
 * Character Detail
 *
 * Used throughout the app to represent a character object. Includes additional
 * information not present in the character table.
 */
export type CharacterDetail = Omit<
  Tables<'character'>,
  'created_at' | 'updated_at' | 'user_id'
> & {}

/**
 * Collective Cognition Reward Detail
 *
 * Used throughout the app to represent a collective cognition reward.
 */
export type CollectiveCognitionRewardDetail = Omit<
  Tables<'collective_cognition_reward'>,
  'created_at' | 'updated_at' | 'user_id'
>

/**
 * Disorder Detail
 *
 * Used throughout the app to represent a disorder.
 */
export type DisorderDetail = Omit<
  Tables<'disorder'>,
  'created_at' | 'updated_at' | 'user_id'
>

/**
 * Fighting Art Detail
 *
 * Used throughout the app to represent a fighting art.
 */
export type FightingArtDetail = Omit<
  Tables<'fighting_art'>,
  'created_at' | 'updated_at' | 'user_id'
>

/**
 * Secret Fighting Art Detail
 *
 * Used throughout the app to represent a secret fighting art.
 */
export type SecretFightingArtDetail = Omit<
  Tables<'secret_fighting_art'>,
  'created_at' | 'updated_at' | 'user_id'
>

/**
 * Seed Pattern Gear Cost Detail
 *
 * Represents a single gear cost entry tied to a seed pattern.
 */
export type SeedPatternGearCostDetail = {
  /** Gear ID Required to Craft the Seed Pattern */
  cost_gear_id: string
  /** Quantity Required */
  quantity: number
}

/**
 * Seed Pattern Detail
 *
 * Used throughout the app to represent a seed pattern.
 */
export type SeedPatternDetail = Omit<
  Tables<'seed_pattern'>,
  'created_at' | 'updated_at' | 'user_id'
> & {
  /** Gear Costs Required to Craft the Seed Pattern */
  gear_costs: SeedPatternGearCostDetail[]
}

/**
 * Gear Affinity Bonus Requirement Detail
 *
 * Represents a single affinity requirement entry that must be met for the
 * gear's affinity bonus to be active.
 */
export type GearAffinityRequirementDetail = {
  /** Required Affinity Color */
  affinity: Database['public']['Enums']['affinity']
  /** Whether the matching affinity must form a "puzzle" */
  puzzle: boolean
}

/**
 * Gear Gear Cost Detail
 *
 * Represents a specific gear item required to craft this gear.
 */
export type GearGearCostDetail = {
  /** Gear ID Required to Craft this Gear */
  cost_gear_id: string
  /** Quantity Required */
  quantity: number
}

/**
 * Gear Resource Cost Detail
 *
 * Represents a specific resource required to craft this gear.
 */
export type GearResourceCostDetail = {
  /** Resource ID Required to Craft this Gear */
  resource_id: string
  /** Quantity Required */
  quantity: number
}

/**
 * Gear Resource Type Cost Detail
 *
 * Represents a quantity of any resource matching the given resource type
 * required to craft this gear.
 */
export type GearResourceTypeCostDetail = {
  /** Resource Type Required to Craft this Gear */
  resource_type: Database['public']['Enums']['resource_type']
  /** Quantity Required */
  quantity: number
}

/**
 * Gear Detail
 *
 * Used throughout the app to represent a gear item.
 */
export type GearDetail = Omit<
  Tables<'gear'>,
  'created_at' | 'updated_at' | 'user_id' | 'affinity_bonus_requirements'
> & {
  /** Affinity Bonus Requirements */
  affinity_bonus_requirements: GearAffinityRequirementDetail[]
  /** Gear Costs Required to Craft this Gear */
  gear_costs: GearGearCostDetail[]
  /** Resource Costs Required to Craft this Gear */
  resource_costs: GearResourceCostDetail[]
  /** Resource Type Costs Required to Craft this Gear */
  resource_type_costs: GearResourceTypeCostDetail[]
}

/**
 * Armor Set Slot Detail
 *
 * Represents a single slot in an armor set together with the list of gear
 * pieces that satisfy it. A survivor qualifies for a slot when their gear
 * grid contains at least one of the listed `gear_ids`.
 */
export type ArmorSetSlotDetail = {
  /** Slot ID */
  id: string
  /** Slot Name (e.g. "Head", "Chest") */
  slot_name: string
  /** Slot Display Order */
  slot_order: number
  /** Whether the Slot Must Be Satisfied for the Set to Qualify */
  required: boolean
  /** Gear IDs That Satisfy This Slot */
  gear_ids: string[]
}

/**
 * Armor Set Detail
 *
 * Used throughout the app to represent an armor set together with its slots
 * and slot gear candidates.
 */
export type ArmorSetDetail = Omit<
  Tables<'armor_set'>,
  'created_at' | 'updated_at' | 'user_id'
> & {
  /** Slots Composing the Set */
  slots: ArmorSetSlotDetail[]
}

/**
 * Gear Grid Position
 *
 * One of the nine slots on a survivor's 3x3 gear grid. Position keys map
 * directly to columns on the `gear_grid` table (e.g. `top_left` →
 * `pos_top_left`).
 */
export type GearGridPosition =
  | 'top_left'
  | 'top_center'
  | 'top_right'
  | 'mid_left'
  | 'mid_center'
  | 'mid_right'
  | 'bottom_left'
  | 'bottom_center'
  | 'bottom_right'

/**
 * Gear Grid Detail
 *
 * Used throughout the app to represent a survivor's 3x3 gear grid. Each
 * position holds an optional gear ID drawn from the settlement's storage.
 */
export type GearGridDetail = {
  /** Gear Grid ID (null until the row has been persisted) */
  id: string | null
  /** Top-Left Position Gear ID */
  pos_top_left: string | null
  /** Top-Center Position Gear ID */
  pos_top_center: string | null
  /** Top-Right Position Gear ID */
  pos_top_right: string | null
  /** Middle-Left Position Gear ID */
  pos_mid_left: string | null
  /** Middle-Center Position Gear ID */
  pos_mid_center: string | null
  /** Middle-Right Position Gear ID */
  pos_mid_right: string | null
  /** Bottom-Left Position Gear ID */
  pos_bottom_left: string | null
  /** Bottom-Center Position Gear ID */
  pos_bottom_center: string | null
  /** Bottom-Right Position Gear ID */
  pos_bottom_right: string | null
  /**
   * Selected Armor Set ID
   *
   * The armor set the survivor has chosen to apply when their loadout qualifies
   * for more than one. A `clear_selected_armor_set_if_unqualified` database
   * trigger automatically resets this column to null when the persisted
   * positions no longer satisfy the selected set.
   */
  selected_armor_set_id: string | null
}

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
 * Hunt Board
 */
export type HuntBoard = {
  /** Position 1 */
  1: HuntEventType
  /** Position 2 */
  2: HuntEventType
  /** Position 3 */
  3: HuntEventType
  /** Position 4 */
  4: HuntEventType
  /** Position 5 */
  5: HuntEventType
  /** Position 7 */
  7: HuntEventType
  /** Position 8 */
  8: HuntEventType
  /** Position 9 */
  9: HuntEventType
  /** Position 10 */
  10: HuntEventType
  /** Position 11 */
  11: HuntEventType
}

/**
 * Hunt State Setter
 *
 * Accepts either a direct value or a functional updater. Use the functional
 * form inside async `.then` / `.catch` callbacks so the update always operates
 * on the latest state instead of a stale closure capture.
 */
export type HuntStateSetter = (
  huntOrUpdater:
    | HuntDetail
    | null
    | ((prev: HuntDetail | null) => HuntDetail | null)
) => void

/**
 * Hunt Detail
 *
 * Used throughout the app to represent the currently selected hunt.
 */
export type HuntDetail = Omit<Tables<'hunt'>, 'created_at' | 'updated_at'> & {
  /** Hunt Board */
  hunt_board: HuntHuntBoardDetail | null
  /** Hunt Monsters */
  hunt_monsters: { [key: string]: HuntMonsterDetail } | null
  /** Hunt Survivors */
  hunt_survivors: { [key: string]: HuntSurvivorDetail } | null
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
  /** Traits (joined from hunt_monster_trait → trait) */
  traits: TraitDetail[]
  /** Moods (joined from hunt_monster_mood → mood) */
  moods: MoodDetail[]
  /** Survivor statuses (joined from hunt_monster_survivor_status → survivor_status) */
  survivor_statuses: SurvivorStatusDetail[]
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
  'created_at' | 'updated_at' | 'user_id'
>

/**
 * Knowledge Detail
 *
 * Used throughout the app to represent a knowledge.
 */
export type KnowledgeDetail = Omit<
  Tables<'knowledge'>,
  'created_at' | 'updated_at' | 'user_id'
>

/**
 * Location Detail
 *
 * Used throughout the app to represent a location.
 */
export type LocationDetail = Omit<
  Tables<'location'>,
  'created_at' | 'updated_at' | 'user_id'
>

/**
 * Milestone Detail
 *
 * Used throughout the app to represent a milestone.
 */
export type MilestoneDetail = Omit<
  Tables<'milestone'>,
  'created_at' | 'updated_at' | 'user_id'
>

/**
 * Monster Level Data
 *
 * Used when creating or editing a custom monster.
 */
/** Per-level sub-monster form data */
export type MonsterLevelData = {
  /** Sub-Monster Name (Optional) */
  sub_monster_name: string | null
  /** AI Deck: Basic Cards */
  basic_cards: number
  /** AI Deck: Advanced Cards */
  advanced_cards: number
  /** AI Deck: Legendary Cards */
  legendary_cards: number
  /** AI Deck: Overtone Cards */
  overtone_cards: number
  /** Accuracy */
  accuracy: number
  /** Accuracy Tokens */
  accuracy_tokens: number
  /** Damage */
  damage: number
  /** Damage Tokens */
  damage_tokens: number
  /** Evasion */
  evasion: number
  /** Evasion Tokens */
  evasion_tokens: number
  /** Luck */
  luck: number
  /** Luck Tokens */
  luck_tokens: number
  /** Movement */
  movement: number
  /** Movement Tokens */
  movement_tokens: number
  /** Speed */
  speed: number
  /** Speed Tokens */
  speed_tokens: number
  /** Strength */
  strength: number
  /** Strength Tokens */
  strength_tokens: number
  /** Toughness */
  toughness: number
  /** Toughness Tokens */
  toughness_tokens: number
  /** Life (nemesis only) */
  life: number
  /** Traits */
  traits: TraitDetail[]
  /** Moods */
  moods: MoodDetail[]
  /** Survivor Statuses */
  survivor_statuses: SurvivorStatusDetail[]
}

/**
 * Nemesis Detail
 *
 * Used throughout the app to represent a nemesis.
 */
export type NemesisDetail = Omit<
  Tables<'nemesis'>,
  'created_at' | 'updated_at' | 'user_id'
>

/**
 * Nemesis Level Detail
 *
 * Used throughout the app to represent a nemesis's level configuration
 * including stats, AI deck, and life value.
 */
export type NemesisLevelDetail = Omit<
  Tables<'nemesis_level'>,
  'created_at' | 'updated_at' | 'nemesis_id'
> & {
  /** Traits (joined from nemesis_level_trait → trait) */
  traits: TraitDetail[]
  /** Moods (joined from nemesis_level_mood → mood) */
  moods: MoodDetail[]
  /** Survivor statuses (joined from nemesis_level_survivor_status → survivor_status) */
  survivor_statuses: SurvivorStatusDetail[]
}

/**
 * Nemesis Timeline Detail
 *
 * Used throughout the app to represent a nemesis timeline entry.
 */
export type NemesisTimelineDetail = Omit<
  Tables<'nemesis_timeline_year'>,
  'created_at' | 'updated_at' | 'campaign_types' | 'nemesis_id'
>

/**
 * Neurosis Detail
 *
 * Used throughout the app to represent a neurosis.
 */
export type NeurosisDetail = Omit<
  Tables<'neurosis'>,
  'created_at' | 'updated_at' | 'user_id'
>

/**
 * Pattern Gear Cost Detail
 *
 * Represents a single gear cost entry tied to a pattern.
 */
export type PatternGearCostDetail = {
  /** Gear ID Required to Craft the Pattern */
  cost_gear_id: string
  /** Quantity Required */
  quantity: number
}

/**
 * Pattern Resource Cost Detail
 *
 * Represents a specific resource required to craft a pattern.
 */
export type PatternResourceCostDetail = {
  /** Resource ID Required to Craft the Pattern */
  resource_id: string
  /** Quantity Required */
  quantity: number
}

/**
 * Pattern Resource Type Cost Detail
 *
 * Represents a quantity of any resource matching the given resource type
 * required to craft a pattern.
 */
export type PatternResourceTypeCostDetail = {
  /** Resource Type Required to Craft the Pattern */
  resource_type: Database['public']['Enums']['resource_type']
  /** Quantity Required */
  quantity: number
}

/**
 * Pattern Detail
 *
 * Used throughout the app to represent a pattern.
 */
export type PatternDetail = Omit<
  Tables<'pattern'>,
  'created_at' | 'updated_at' | 'user_id'
> & {
  /** Gear Costs Required to Craft the Pattern */
  gear_costs: PatternGearCostDetail[]
  /** Resource Costs Required to Craft the Pattern */
  resource_costs: PatternResourceCostDetail[]
  /** Resource Type Costs Required to Craft the Pattern */
  resource_type_costs: PatternResourceTypeCostDetail[]
  /** Innovation Requirements (settlement must have all of these) */
  innovation_requirement_ids: string[]
}

/**
 * Philosophy Detail
 *
 * Used throughout the app to represent a philosophy.
 */
export type PhilosophyDetail = Omit<
  Tables<'philosophy'>,
  'created_at' | 'updated_at' | 'user_id'
>

/**
 * Philosophy Rank Detail
 *
 * Used throughout the app to represent a rank within a philosophy.
 */
export type PhilosophyRankDetail = Omit<
  Tables<'philosophy_rank'>,
  'created_at' | 'updated_at'
>

/**
 * Principle Detail
 *
 * Used throughout the app to represent a principle.
 */
export type PrincipleDetail = Omit<
  Tables<'principle'>,
  'created_at' | 'updated_at' | 'user_id'
>

/**
 * Quarry Detail
 *
 * Used throughout the app to represent a quarry.
 */
export type QuarryDetail = Omit<
  Tables<'quarry'>,
  'created_at' | 'updated_at' | 'user_id'
>

/**
 * Quarry Hunt Board Detail
 *
 * Used throughout the app to represent a quarry's hunt board template.
 */
export type QuarryHuntBoardDetail = Omit<
  Tables<'quarry_hunt_board'>,
  'created_at' | 'updated_at'
>

/**
 * Quarry Hunt Board Position Detail
 *
 * Used throughout the app to represent a quarry's level-based hunt positions.
 */
export type QuarryHuntBoardPositionDetail = Omit<
  Tables<'quarry_hunt_board_position'>,
  'created_at' | 'updated_at'
>

/**
 * Quarry Level Detail
 *
 * Used throughout the app to represent a quarry's level configuration
 * including stats, AI deck, and hunt positions.
 */
export type QuarryLevelDetail = Omit<
  Tables<'quarry_level'>,
  'created_at' | 'updated_at' | 'quarry_id'
> & {
  /** Monster Hunt Position (joined from quarry_hunt_board_position) */
  hunt_pos: number
  /** Survivor Hunt Position (joined from quarry_hunt_board_position) */
  survivor_hunt_pos: number
  /** Traits (joined from quarry_level_trait → trait) */
  traits: TraitDetail[]
  /** Moods (joined from quarry_level_mood → mood) */
  moods: MoodDetail[]
  /** Survivor statuses (joined from quarry_level_survivor_status → survivor_status) */
  survivor_statuses: SurvivorStatusDetail[]
}

/**
 * Quarry Timeline Detail
 *
 * Used throughout the app to represent a quarry timeline entry.
 */
export type QuarryTimelineDetail = Omit<
  Tables<'quarry_timeline_year'>,
  'created_at' | 'updated_at' | 'campaign_types' | 'quarry_id'
>

/**
 * Resource Detail
 *
 * Used throughout the app to represent a resource.
 */
export type ResourceDetail = Omit<
  Tables<'resource'>,
  'created_at' | 'updated_at' | 'user_id'
> & {
  /** Quarry Monster Name (joined from quarry table) */
  quarry_monster_name: string | null
  /** Quarry Node (joined from quarry table) */
  quarry_node: string | null
}

/**
 * Settlement State Setter
 *
 * Accepts either a direct value or a functional updater. Use the functional
 * form inside async `.then` / `.catch` callbacks so the update always operates
 * on the latest state instead of a stale closure capture.
 */
export type SettlementStateSetter = (
  settlementOrUpdater:
    | SettlementDetail
    | null
    | ((prev: SettlementDetail | null) => SettlementDetail | null)
) => void

/**
 * Settlement Role
 *
 * The caller's relationship to a settlement. `owner` rows are loaded directly
 * from `settlement.user_id = auth.uid()`. `collaborator` rows are reached via
 * `settlement_shared_user` and are subject to the shared-user permission set.
 */
export type SettlementRole = 'owner' | 'collaborator'

/**
 * Settlement Detail
 *
 * Used throughout the app to represent the currently selected settlement.
 * Includes additional information not present in the settlement table.
 */
export type SettlementDetail = Omit<
  Tables<'settlement'>,
  'created_at' | 'updated_at'
> & {
  /** Collective Cognition Rewards */
  collective_cognition_rewards: {
    /** Collective Cognition Reward Collective Cognition */
    collective_cognition: number
    /** Collective Cognition Reward ID */
    collective_cognition_reward_id: string
    /** Settlement Collective Cognition Reward ID */
    id: string
    /** Collective Cognition Reward Name */
    reward_name: string
    /** Collective Cognition Reward Rules */
    rules: string | null
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
    /** Whether the underlying gear is user-defined */
    custom: boolean
  }[]
  /** Innovations */
  innovations: {
    /** Settlement Innovation ID */
    id: string
    /** Innovation ID */
    innovation_id: string
    /** Innovation Name */
    innovation_name: string
    /** Innovation Rules */
    rules: string | null
    /** Innovation Consequences */
    consequences: string[] | null
    /** Innovation Benefits */
    benefits: string[] | null
  }[]
  /** Knowledges */
  knowledges: {
    /** Settlement Knowledge ID */
    id: string
    /** Knowledge ID */
    knowledge_id: string
    /** Knowledge Name */
    knowledge_name: string
    /** Philosophy ID */
    philosophy_id: string | null
    /** Knowledge Rules */
    rules: string | null
    /** Observation Conditions */
    observation_conditions: string | null
    /** Observation Rank Up Milestone */
    observation_rank_up_milestone: number | null
    /** Whether the underlying knowledge is user-defined */
    custom: boolean
  }[]
  /** Locations */
  locations: {
    /** Settlement Location ID */
    id: string
    /** Location ID */
    location_id: string
    /** Location Name */
    location_name: string
    /** Location Rules */
    rules: string | null
    /** Unlocked */
    unlocked: boolean
  }[]
  /** Neuroses */
  neuroses: {
    /** Neurosis ID */
    id: string
    /** Neurosis Name */
    neurosis_name: string
    /** Whether the underlying neurosis is user-defined */
    custom: boolean
  }[]
  /** Milestones */
  milestones: {
    /** Complete */
    complete: boolean
    /** Event Name */
    event_name: string
    /** Settlement Milestone ID */
    id: string
    /** Milestone ID */
    milestone_id: string
    /** Milestone Name */
    milestone_name: string
    /** Milestone Requirements */
    requirements: string | null
    /** Milestone Rules */
    rules: string | null
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
    /** Instinct */
    instinct: string | null
    /** Basic Action */
    basic_action: string | null
    /** Blind Spot */
    blind_spot: string | null
    /** Defeat Outcome */
    defeat_outcome: string | null
    /** Deployment Rules */
    deployment_rules: string | null
    /** Victory Outcome */
    victory_outcome: string | null
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
    /** Hunt XP Milestones */
    hunt_xp_milestones: number[] | null
    /** Tenet Knowledge ID */
    tenet_knowledge_id: string | null
    /** Philosophy Tier */
    tier: number | null
    /** Linked Neurosis ID */
    neurosis_id: string | null
    /** Whether the underlying philosophy is user-defined */
    custom: boolean
  }[]
  /** Principles */
  principles: {
    /** Settlement Principle ID */
    id: string
    /** Option 1 Name */
    option_1_name: string
    /** Option 1 Rules */
    option_1_rules: string | null
    /** Option 1 Selected */
    option_1_selected: boolean
    /** Option 2 Name */
    option_2_name: string
    /** Option 2 Rules */
    option_2_rules: string | null
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
    /** Has Prologue Hunt */
    prologue: boolean
    /** Quarry ID */
    quarry_id: string
    /** Unlocked */
    unlocked: boolean
    /** Instinct */
    instinct: string | null
    /** Basic Action */
    basic_action: string | null
    /** Blind Spot */
    blind_spot: string | null
    /** Defeat Outcome */
    defeat_outcome: string | null
    /** Deployment Rules */
    deployment_rules: string | null
    /** Victory Outcome */
    victory_outcome: string | null
  }[]
  /** Resources */
  resources: {
    /** Category */
    category: string
    /** Settlement Resource ID */
    id: string
    /** Quantity */
    quantity: number
    /** Quarry ID */
    quarry_id: string | null
    /** Quarry Monster Name */
    quarry_monster_name: string | null
    /** Quarry Node */
    quarry_node: string | null
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
  /** Caller's Role on This Settlement */
  role: SettlementRole
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
 * Settlement Quarry Detail
 *
 * Used throughout the app to represent a settlement quarry.
 */
export type SettlementQuarryDetail = Omit<
  Tables<'settlement_quarry'>,
  'created_at' | 'updated_at' | 'settlement_id'
>

/**
 * Settlement Timeline Year Detail
 *
 * Used throughout the app to represent a settlement timeline year.
 */
export type SettlementTimelineYearDetail = Omit<
  Tables<'settlement_timeline_year'>,
  'created_at' | 'id' | 'updated_at'
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
 * Showdown State Setter
 *
 * Accepts either a direct value or a functional updater. Use the functional
 * form inside async `.then` / `.catch` callbacks so the update always operates
 * on the latest state instead of a stale closure capture.
 */
export type ShowdownStateSetter = (
  showdownOrUpdater:
    | ShowdownDetail
    | null
    | ((prev: ShowdownDetail | null) => ShowdownDetail | null)
) => void

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
  showdown_monsters: { [key: string]: ShowdownMonsterDetail } | null
  /** Showdown Survivors */
  showdown_survivors: { [key: string]: ShowdownSurvivorDetail } | null
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
  /** Traits (joined from showdown_monster_trait → trait) */
  traits: TraitDetail[]
  /** Moods (joined from showdown_monster_mood → mood) */
  moods: MoodDetail[]
  /** Survivor statuses (joined from showdown_monster_survivor_status → survivor_status) */
  survivor_statuses: SurvivorStatusDetail[]
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
  'created_at' | 'updated_at' | 'user_id'
>

/**
 * Survivor Detail
 *
 * Used throughout the app to represent the currently selected survivor.
 * Includes additional information not present in the survivor table.
 */
export type SurvivorDetail = Tables<'survivor'> & {
  /** Abilities and Impairments */
  abilities_impairments: {
    /** Ability or Impairment Name */
    ability_impairment_name: string
    /** Custom */
    custom: boolean
    /** Ability or Impairment ID */
    id: string
    /** Rules */
    rules: string
  }[]
  /** Cursed Gear */
  cursed_gear: {
    /** Cursed Gear Name */
    gear_name: string
    /** Cursed Gear ID */
    id: string
  }[]
  /** Disorders */
  disorders: {
    /** Custom */
    custom: boolean
    /** Disorder Name */
    disorder_name: string
    /** Disorder ID */
    id: string
    /** Rules */
    rules: string
  }[]
  /** Survivor Embarked on Hunt/Showdown */
  embarked: boolean
  /** Fighting Arts */
  fighting_arts: FightingArtDetail[]
  /** Gear Grid (3x3 of equipped gear; null until first edit) */
  gear_grid: GearGridDetail | null
  /** Knowledge 1 */
  knowledge_1: {
    /** Knowledge ID */
    id: string
    /** Knowledge Name */
    knowledge_name: string
    /** Rules */
    rules: string | null
    /** Observation Conditions */
    observation_conditions: string | null
    /** Observation Rank Up Milestone */
    observation_rank_up_milestone: number | null
  } | null
  /** Knowledge 2 */
  knowledge_2: {
    /** Knowledge ID */
    id: string
    /** Knowledge Name */
    knowledge_name: string
    /** Rules */
    rules: string | null
    /** Observation Conditions */
    observation_conditions: string | null
    /** Observation Rank Up Milestone */
    observation_rank_up_milestone: number | null
  } | null
  /** Neurosis */
  neurosis: {
    /** Neurosis ID */
    id: string
    /** Neurosis Name */
    neurosis_name: string
    /** Rules */
    rules: string | null
  } | null
  /** Philosophy */
  philosophy: {
    /** Philosophy ID */
    id: string
    /** Philosophy Name */
    philosophy_name: string
    /** Hunt XP Milestones */
    hunt_xp_milestones: number[] | null
    /** Tenet Knowledge ID */
    tenet_knowledge_id: string | null
    /** Tier */
    tier: number | null
  } | null
  /** Secret Fighting Arts */
  secret_fighting_arts: SecretFightingArtDetail[]
  /** Tenet Knowledge */
  tenet_knowledge: {
    /** Knowledge ID */
    id: string
    /** Knowledge Name */
    knowledge_name: string
    /** Rules */
    rules: string | null
    /** Observation Conditions */
    observation_conditions: string | null
    /** Observation Rank Up Milestone */
    observation_rank_up_milestone: number | null
  } | null
}

/**
 * Survivor Cursed Gear Detail
 *
 * Used throughout the app to represent a survivor's cursed gear items.
 */
export type SurvivorCursedGearDetail = Omit<
  Tables<'survivor_cursed_gear'>,
  'created_at' | 'updated_at' | 'survivor_id'
>

/**
 * Survivor Disorder Detail
 *
 * Used throughout the app to represent a survivor's disorders.
 */
export type SurvivorDisorderDetail = Omit<
  Tables<'survivor_disorder'>,
  'created_at' | 'updated_at' | 'survivor_id'
>

/**
 * Survivor Fighting Art Detail
 *
 * Used throughout the app to represent a survivor's fighting arts.
 */
export type SurvivorFightingArtDetail = Omit<
  Tables<'survivor_fighting_art'>,
  'created_at' | 'updated_at' | 'survivor_id'
>

/**
 * Survivor Secret Fighting Art Detail
 *
 * Used throughout the app to represent a survivor's secret fighting arts.
 */
export type SurvivorSecretFightingArtDetail = Omit<
  Tables<'survivor_secret_fighting_art'>,
  'created_at' | 'updated_at' | 'survivor_id'
>

/**
 * Survivor State Setter
 *
 * Accepts either a direct value or a functional updater. Use the functional
 * form inside async `.then` / `.catch` callbacks so the update always operates
 * on the latest state instead of a stale closure capture.
 */
export type SurvivorStateSetter = (
  survivorOrUpdater:
    | SurvivorDetail
    | null
    | ((prev: SurvivorDetail | null) => SurvivorDetail | null)
) => void

/**
 * Survivors State Setter
 *
 * Accepts either a direct value or a functional updater. Use the functional
 * form inside async `.then` / `.catch` callbacks so the update always operates
 * on the latest state instead of a stale closure capture.
 */
export type SurvivorsStateSetter = (
  survivorsOrUpdater:
    | SurvivorDetail[]
    | ((prev: SurvivorDetail[]) => SurvivorDetail[])
) => void

/**
 * User Settings Detail
 *
 * Used throughout the app to represent the user's settings.
 */
export type UserSettingsDetail = Omit<
  Tables<'user_settings'>,
  'created_at' | 'updated_at'
>

/**
 * Wanderer Detail
 *
 * Used throughout the app to represent the currently selected wanderer.
 * Includes additional information not present in the wanderer table.
 */
export type WandererDetail = Omit<
  Tables<'wanderer'>,
  'created_at' | 'updated_at' | 'user_id'
> & {
  /** Abilities and Impairments (resolved via junction table) */
  abilities_impairments: WandererAbilityImpairmentDetail[]
}

/**
 * Wanderer Ability / Impairment Detail
 *
 * Represents an ability/impairment linked to a wanderer. The wanderer → ability/
 * impairment relationship is stored in the `wanderer_ability_impairment`
 * junction table; at read time the junction is flattened to the underlying
 * `ability_impairment` row so consumers can work with a single object shape.
 */
export type WandererAbilityImpairmentDetail = AbilityImpairmentDetail

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
  'created_at' | 'updated_at' | 'user_id'
>
