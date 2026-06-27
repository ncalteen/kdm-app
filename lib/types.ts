import { Database, Tables } from '@/lib/database.types'
import { DatabaseCampaignType, HuntEventType } from '@/lib/enums'

/****************************************************************************
 * Miscellaneous Types
 ****************************************************************************/

/** Avatar Source */
export type AvatarSource = 'provider' | 'uploaded' | 'none'

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
 * Gear Affinity Bonus Requirement
 *
 * Represents a single affinity requirement entry that must be met for the
 * gear's affinity bonus to be active.
 */
export type GearAffinityRequirementDetail = {
  /** Required Affinity Color */
  affinity: Database['public']['Enums']['affinity']
  /** Affinity Puzzle Requirement */
  puzzle: boolean
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
 * Notification Kind
 *
 * Discriminator for in-app notification rows. Trigger producers write these
 * values into `notification.kind`; UI renderers can switch on them to choose
 * copy and destination links.
 */
export type NotificationKind =
  | 'settlement_shared_with_you'
  | 'removed_from_settlement'

/**
 * Plan Slug
 *
 * Mirrors the seeded `subscription_plan.plan_id` values used by both the
 * server-side checkout / portal routes and the `user_subscription` row.
 * Each slug maps to a Stripe Price and a presentation block below.
 */
export type PlanSlug = 'free' | 'lantern' | 'lantern_hoard'

/**
 * Settlement List Entry
 *
 * Lightweight row shape returned by `getSettlementForUser` and used by the
 * settlement switcher. Each entry is tagged with the caller's `role`; for
 * collaborator rows, `owner_username` resolves the owner's display handle.
 */
export interface SettlementListEntry {
  /** Campaign Type */
  campaign_type: DatabaseCampaignType
  /** Settlement ID */
  id: string
  /** Settlement Name */
  settlement_name: string
  /** Caller's Role on This Settlement */
  role: SettlementRole
  /** Owner Username (Collaborator Rows Only) */
  owner_username: string | null
}

/**
 * Settlement Role
 *
 * The caller's relationship to a settlement. `owner` rows are loaded directly
 * from `settlement.user_id = auth.uid()`. `collaborator` rows are reached via
 * `settlement_shared_user` and are subject to the shared-user permission set.
 */
export type SettlementRole = 'owner' | 'collaborator'

/****************************************************************************
 * Database Types (with Joins)
 ****************************************************************************/

/**
 * Ability/Impairment Detail
 *
 * Used throughout the app to represent an ability or impairment object.
 */
export type AbilityImpairmentDetail = Omit<
  Tables<'ability_impairment'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {}

/**
 * Armor Set Detail
 *
 * Used throughout the app to represent an armor set together with its slots
 * and slot gear candidates.
 */
export type ArmorSetDetail = Omit<
  Tables<'armor_set'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {
  /** Armor Set Slot Details */
  slots: ArmorSetSlotDetail[]
}

/**
 * Armor Set Slot Detail
 *
 * Represents a single slot in an armor set together with the list of gear
 * pieces that satisfy it. A survivor qualifies for a slot when their gear
 * grid contains at least one of the listed `gear_ids`.
 */
export type ArmorSetSlotDetail = Omit<
  Tables<'armor_set_slot'>,
  'created_at' | 'updated_at'
> & {
  /** Armor Set Slot Gear Details */
  slot_gear: ArmorSetSlotGearDetail[]
}

/**
 * Armor Set Slot Gear Detail
 *
 * Represents a gear item that satisfies a particular slot for an armor set.
 * Also includes the details about the particular gear item.
 */
export type ArmorSetSlotGearDetail = Tables<'armor_set_slot_gear'> & {
  /** Gear Details */
  gear: GearDetail
}

/**
 * Character Detail
 *
 * Used throughout the app to represent a character object. Includes additional
 * information not present in the character table.
 */
export type CharacterDetail = Omit<
  Tables<'character'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {}

/**
 * Collective Cognition Reward Detail
 *
 * Used throughout the app to represent a collective cognition reward.
 */
export type CollectiveCognitionRewardDetail = Omit<
  Tables<'collective_cognition_reward'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {}

/**
 * Constellation Detail
 *
 * Used throughout the app to represent a constellation.
 */
export type ConstellationDetail = Omit<
  Tables<'constellation'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {}

/**
 * Disorder Detail
 *
 * Used throughout the app to represent a disorder.
 */
export type DisorderDetail = Omit<
  Tables<'disorder'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {}

/**
 * Encounter Detail
 *
 * Used throughout the app to represent the currently selected encounter.
 */
export type EncounterDetail = Omit<
  Tables<'encounter'>,
  'created_at' | 'updated_at'
> & {
  /** Encounter Active Monsters */
  monsters: { [key: string]: EncounterActiveMonsterDetail }
  /** Encounter Survivors */
  survivors: { [key: string]: EncounterSurvivorDetail }
}

/**
 * Encounter Active Monster Detail
 *
 * Used throughout the app to represent a monster in an active encounter.
 */
export type EncounterActiveMonsterDetail = Omit<
  Tables<'encounter_active_monster'>,
  'created_at' | 'updated_at'
> & {
  /** Moods */
  moods: EncounterActiveMonsterMoodDetail[]
  /** Survivor Statuses */
  survivor_statuses: EncounterActiveMonsterSurvivorStatusDetail[]
  /** Traits */
  traits: EncounterActiveMonsterTraitDetail[]
}

/**
 * Encounter Active Monster Mood Detail
 *
 * Represents a monster's mood in an active encounter.
 */
export type EncounterActiveMonsterMoodDetail = Omit<
  Tables<'encounter_active_monster_mood'>,
  'created_at' | 'updated_at'
> & {
  /** Mood Details */
  mood: MoodDetail
}

/**
 * Encounter Active Monster Survivor Status Detail
 *
 * Represents a monster's survivor status in an active encounter.
 */
export type EncounterActiveMonsterSurvivorStatusDetail = Omit<
  Tables<'encounter_active_monster_survivor_status'>,
  'created_at' | 'updated_at'
> & {
  /** Survivor Status Details */
  survivor_status: SurvivorStatusDetail
}

/**
 * Encounter Active Monster Trait Detail
 *
 * Represents a monster's trait in an active encounter.
 */
export type EncounterActiveMonsterTraitDetail = Omit<
  Tables<'encounter_active_monster_trait'>,
  'created_at' | 'updated_at'
> & {
  /** Trait Details */
  trait: TraitDetail
}

/**
 * Encounter Monster Detail
 *
 * Used throughout the app to represent a catalog encounter monster and its
 * level data.
 */
export type EncounterMonsterDetail = Omit<
  Tables<'encounter_monster'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {
  /** Level Data */
  levels: EncounterMonsterLevelDetail[]
}

/**
 * Encounter Monster Level Detail
 *
 * Used throughout the app to represent encounter monster level data.
 */
export type EncounterMonsterLevelDetail = Omit<
  Tables<'encounter_monster_level'>,
  'created_at' | 'updated_at'
> & {
  /** Moods */
  moods: EncounterMonsterLevelMoodDetail[]
  /** Traits */
  traits: EncounterMonsterLevelTraitDetail[]
}

/**
 * Encounter Monster Level Mood Detail
 *
 * Represents a monster's mood in an encounter at a specific level.
 */
export type EncounterMonsterLevelMoodDetail = Omit<
  Tables<'encounter_monster_level_mood'>,
  'created_at' | 'updated_at'
> & {
  /** Mood Details */
  mood: MoodDetail
}

/**
 * Encounter Monster Level Trait Detail
 *
 * Represents a monster's trait in an encounter at a specific level.
 */
export type EncounterMonsterLevelTraitDetail = Omit<
  Tables<'encounter_monster_level_trait'>,
  'created_at' | 'updated_at'
> & {
  /** Trait Details */
  trait: TraitDetail
}

/**
 * Encounter Survivor Detail
 *
 * Used throughout the app to represent a survivor in an active encounter.
 */
export type EncounterSurvivorDetail = Omit<
  Tables<'encounter_survivor'>,
  'created_at' | 'updated_at'
> & {
  /** Survivor Details */
  survivor: SurvivorDetail
}

/**
 * Fighting Art Detail
 *
 * Used throughout the app to represent a fighting art.
 */
export type FightingArtDetail = Omit<
  Tables<'fighting_art'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {}

/**
 * Gear Detail
 *
 * Used throughout the app to represent a gear item.
 */
export type GearDetail = Omit<
  Tables<'gear'>,
  | 'created_at'
  | 'updated_at'
  | 'user_id'
  | 'affinity_bonus_requirements'
  | 'archived_at'
> & {
  /** Affinity Bonus Requirements */
  affinity_bonus_requirements: GearAffinityRequirementDetail[]
  /** Gear Costs Required to Craft this Gear */
  gear_costs: GearGearCostDetail[]
  /** Other Costs Required to Craft this Gear */
  other_costs: GearOtherCostDetail[]
  /** Resource Costs Required to Craft this Gear */
  resource_costs: GearResourceCostDetail[]
  /** Resource Type Costs Required to Craft this Gear */
  resource_type_costs: GearResourceTypeCostDetail[]
}

/**
 * Gear Gear Cost Detail
 *
 * Represents a specific gear item required to craft this gear.
 */
export type GearGearCostDetail = Tables<'gear_gear_cost'> & {
  /** Cost Gear Details */
  cost_gear: GearDetail
}

/**
 * Gear Grid Detail
 *
 * Used throughout the app to represent a survivor's 3x3 gear grid. Each
 * position holds an optional gear ID drawn from the settlement's storage.
 */
export type GearGridDetail = Omit<
  Tables<'gear_grid'>,
  'created_at' | 'updated_at'
> & {}

/**
 * Gear Other Cost Detail
 *
 * Represents a specific other cost required to craft this gear.
 */
export type GearOtherCostDetail = Tables<'gear_other_cost'> & {}

/**
 * Gear Resource Cost Detail
 *
 * Represents a specific resource required to craft this gear.
 */
export type GearResourceCostDetail = Tables<'gear_resource_cost'> & {
  /** Resource Details */
  resource: ResourceDetail
}

/**
 * Gear Resource Type Cost Detail
 *
 * Represents a quantity of any resource matching the given resource type
 * required to craft this gear.
 */
export type GearResourceTypeCostDetail = Tables<'gear_resource_type_cost'> & {}

/**
 * Hunt Detail
 *
 * Used throughout the app to represent the currently selected hunt.
 */
export type HuntDetail = Omit<Tables<'hunt'>, 'created_at' | 'updated_at'> & {
  /** Hunt Board */
  hunt_board: HuntHuntBoardDetail
  /** Hunt Monsters */
  monsters: { [key: string]: HuntMonsterDetail }
  /** Hunt Survivors */
  survivors: { [key: string]: HuntSurvivorDetail }
}

/**
 * Hunt AI Deck Detail
 *
 * Used throughout the app to represent a monster's AI deck in a hunt.
 */
export type HuntAIDeckDetail = Omit<
  Tables<'hunt_ai_deck'>,
  'created_at' | 'updated_at'
> & {}

/**
 * Hunt Hunt Board Detail
 *
 * Used throughout the app to represent a hunt board for the currently selected
 * hunt.
 */
export type HuntHuntBoardDetail = Omit<
  Tables<'hunt_hunt_board'>,
  'created_at' | 'updated_at'
> & {}

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
  /** Moods */
  moods: HuntMonsterMoodDetail[]
  /** Survivor Statuses */
  survivor_statuses: HuntMonsterSurvivorStatusDetail[]
  /** Traits */
  traits: HuntMonsterTraitDetail[]
}

/**
 * Hunt Monster Mood Detail
 *
 * Used throughout the app to represent a monster's mood in a hunt.
 */
export type HuntMonsterMoodDetail = Omit<
  Tables<'hunt_monster_mood'>,
  'created_at' | 'updated_at'
> & {
  /** Mood Details */
  mood: MoodDetail
}

/**
 * Hunt Monster Survivor Status Detail
 *
 * Used throughout the app to represent a survivor status inflicted by a
 * nemesis or quarry level.
 */
export type HuntMonsterSurvivorStatusDetail = Omit<
  Tables<'hunt_monster_survivor_status'>,
  'created_at' | 'updated_at'
> & {
  /** Survivor Status Details */
  survivor_status: SurvivorStatusDetail
}

/**
 * Hunt Monster Trait Detail
 *
 * Used throughout the app to represent a monster trait in a hunt.
 */
export type HuntMonsterTraitDetail = Omit<
  Tables<'hunt_monster_trait'>,
  'created_at' | 'updated_at'
> & {
  /** Trait Details */
  trait: TraitDetail
}

/**
 * Hunt Survivor Detail
 *
 * Used throughout the app to represent a survivor in a hunt.
 */
export type HuntSurvivorDetail = Omit<
  Tables<'hunt_survivor'>,
  'created_at' | 'updated_at'
> & {
  /** Survivor Details */
  survivor: SurvivorDetail
}

/**
 * Innovation Detail
 *
 * Used throughout the app to represent an innovation.
 */
export type InnovationDetail = Omit<
  Tables<'innovation'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {}

/**
 * Knowledge Detail
 *
 * Used throughout the app to represent a knowledge.
 */
export type KnowledgeDetail = Omit<
  Tables<'knowledge'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {}

/**
 * Location Detail
 *
 * Used throughout the app to represent a location.
 */
export type LocationDetail = Omit<
  Tables<'location'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {}

/**
 * Milestone Detail
 *
 * Used throughout the app to represent a milestone.
 */
export type MilestoneDetail = Omit<
  Tables<'milestone'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {}

/**
 * Mood Detail
 *
 * Used throughout the app to represent a monster mood. Custom moods are scoped
 * to a single user; non-custom moods are part of the shared catalog.
 */
export type MoodDetail = Omit<
  Tables<'mood'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {}

/**
 * Nemesis Detail
 *
 * Used throughout the app to represent a nemesis.
 */
export type NemesisDetail = Omit<
  Tables<'nemesis'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {
  /** Level Details */
  levels: NemesisLevelDetail[]
  /** Location Details */
  location: NemesisLocationDetail
  /** Timeline Years */
  timeline_years: NemesisTimelineYearDetail[]
}

/**
 * Nemesis Level Detail
 *
 * Used throughout the app to represent a nemesis's level configuration
 * including stats, AI deck, and life value.
 */
export type NemesisLevelDetail = Omit<
  Tables<'nemesis_level'>,
  'created_at' | 'updated_at'
> & {
  /** Moods */
  moods: NemesisLevelMoodDetail[]
  /** Survivor Statuses */
  survivor_statuses: NemesisLevelSurvivorStatusDetail[]
  /** Traits */
  traits: NemesisLevelTraitDetail[]
}

/**
 * Nemesis Level Mood Detail
 *
 * Used throughout the app to represent a nemesis's mood at a specific level.
 */
export type NemesisLevelMoodDetail = Omit<
  Tables<'nemesis_level_mood'>,
  'created_at' | 'updated_at'
> & {
  /** Mood Details */
  mood: MoodDetail
}

/**
 * Nemesis Level Survivor Status Detail
 *
 * Used throughout the app to represent a survivor status inflicted by a
 * nemesis at a specific level.
 */
export type NemesisLevelSurvivorStatusDetail = Omit<
  Tables<'nemesis_level_survivor_status'>,
  'created_at' | 'updated_at'
> & {
  /** Survivor Status Details */
  survivor_status: SurvivorStatusDetail
}

/**
 * Nemesis Level Trait Detail
 *
 * Used throughout the app to represent a trait of a nemesis at a specific level.
 */
export type NemesisLevelTraitDetail = Omit<
  Tables<'nemesis_level_trait'>,
  'created_at' | 'updated_at'
> & {
  /** Trait Details */
  trait: TraitDetail
}

/**
 * Nemesis Location Detail
 *
 * Used throughout the app to represent a nemesis's location.
 */
export type NemesisLocationDetail = Omit<
  Tables<'nemesis_location'>,
  'created_at' | 'updated_at'
> & {
  /** Location Details */
  location: LocationDetail
}

/**
 * Nemesis Timeline Year Detail
 *
 * Used throughout the app to represent a nemesis timeline year entry.
 */
export type NemesisTimelineYearDetail = Omit<
  Tables<'nemesis_timeline_year'>,
  'created_at' | 'updated_at'
> & {}

/**
 * Neurosis Detail
 *
 * Used throughout the app to represent a neurosis.
 */
export type NeurosisDetail = Omit<
  Tables<'neurosis'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {}

/**
 * Notification Detail
 *
 * Used throughout the app to represent a notification.
 */
export type NotificationDetail = Tables<'notification'> & {}

/**
 * Pattern Detail
 *
 * Used throughout the app to represent a pattern.
 */
export type PatternDetail = Omit<
  Tables<'pattern'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {
  /** Crafted Gear */
  crafted_gear: GearDetail
  /** Gear Costs Required to Craft the Pattern */
  gear_costs: PatternGearCostDetail[]
  /** Innovation Requirements (settlement must have all of these) */
  innovation_requirements: PatternInnovationRequirementDetail[]
  /** Resource Costs Required to Craft the Pattern */
  resource_costs: PatternResourceCostDetail[]
  /** Resource Type Costs Required to Craft the Pattern */
  resource_type_costs: PatternResourceTypeCostDetail[]
}

/**
 * Pattern Gear Cost Detail
 *
 * Represents a single gear cost entry tied to a pattern.
 */
export type PatternGearCostDetail = Tables<'pattern_gear_cost'> & {
  /** Cost Gear Details */
  cost_gear: GearDetail
}

/**
 * Pattern Innovation Requirement Detail
 */
export type PatternInnovationRequirementDetail =
  Tables<'pattern_innovation_requirement'> & {
    /** Innovation Details */
    innovation: InnovationDetail
  }

/**
 * Pattern Resource Cost Detail
 *
 * Represents a specific resource required to craft a pattern.
 */
export type PatternResourceCostDetail = Tables<'pattern_resource_cost'> & {
  /** Resource Details */
  resource: ResourceDetail
}

/**
 * Pattern Resource Type Cost Detail
 *
 * Represents a quantity of any resource matching the given resource type
 * required to craft a pattern.
 */
export type PatternResourceTypeCostDetail =
  Tables<'pattern_resource_type_cost'> & {}

/**
 * Philosophy Detail
 *
 * Used throughout the app to represent a philosophy.
 */
export type PhilosophyDetail = Omit<
  Tables<'philosophy'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {
  /** Neurosis Details */
  neurosis: NeurosisDetail[]
  /** Philosophy Ranks */
  ranks: PhilosophyRankDetail[]
  /** Tenet Knowledge Details */
  tenet_knowledge: KnowledgeDetail[]
}

/**
 * Philosophy Rank Detail
 *
 * Used throughout the app to represent a rank within a philosophy.
 */
export type PhilosophyRankDetail = Omit<
  Tables<'philosophy_rank'>,
  'created_at' | 'updated_at'
> & {}

/**
 * Principle Detail
 *
 * Used throughout the app to represent a principle.
 */
export type PrincipleDetail = Omit<
  Tables<'principle'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {}

/**
 * Quarry Detail
 *
 * Used throughout the app to represent a quarry.
 */
export type QuarryDetail = Omit<
  Tables<'quarry'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {
  /** Alternate Quarry Details */
  alternate: QuarryDetail | null
  /** Collective Cognition Reward Details */
  collective_cognition_reward: QuarryCollectiveCognitionRewardDetail | null
  /** Hunt Board Details */
  hunt_board: QuarryHuntBoardDetail
  /** Levels */
  levels: QuarryLevelDetail[]
  /** Location Details */
  location: QuarryLocationDetail | null
  /** Timeline Year Detail */
  timeline_year: QuarryTimelineYearDetail[]
  /** Vignette Quarry Details */
  vignette: QuarryDetail | null
}

/**
 * Quarry Collective Cognition Reward Detail
 *
 * Used throughout the app to represent the reward for collecting collective
 * cognition from a quarry.
 */
export type QuarryCollectiveCognitionRewardDetail = Omit<
  Tables<'quarry_collective_cognition_reward'>,
  'created_at' | 'updated_at'
> & {
  /** Collective Cognition Reward Details */
  collective_cognition_reward: CollectiveCognitionRewardDetail
}

/**
 * Quarry Hunt Board Detail
 *
 * Used throughout the app to represent a quarry's hunt board template.
 */
export type QuarryHuntBoardDetail = Omit<
  Tables<'quarry_hunt_board'>,
  'created_at' | 'updated_at'
> & {}

/**
 * Quarry Hunt Board Position Detail
 *
 * Used throughout the app to represent a quarry's level-based hunt positions.
 */
export type QuarryHuntBoardPositionDetail = Omit<
  Tables<'quarry_hunt_board_position'>,
  'created_at' | 'updated_at'
> & {}

/**
 * Quarry Level Detail
 *
 * Used throughout the app to represent a quarry's level configuration
 * including stats, AI deck, and hunt positions.
 */
export type QuarryLevelDetail = Omit<
  Tables<'quarry_level'>,
  'created_at' | 'updated_at'
> & {
  /** Hunt Board Positions */
  hunt_board_position: QuarryHuntBoardPositionDetail
  /** Moods */
  moods: QuarryLevelMoodDetail[]
  /** Survivor Statuses */
  survivor_statuses: QuarryLevelSurvivorStatusDetail[]
  /** Traits */
  traits: QuarryLevelTraitDetail[]
}

/**
 * Quarry Level Mood Detail
 *
 * Used throughout the app to represent a quarry level's mood.
 */
export type QuarryLevelMoodDetail = Omit<
  Tables<'quarry_level_mood'>,
  'created_at' | 'updated_at'
> & {
  /** Mood Details */
  mood: MoodDetail
}

/**
 * Quarry Level Survivor Status Detail
 *
 * Used throughout the app to represent a quarry level's survivor status.
 */
export type QuarryLevelSurvivorStatusDetail = Omit<
  Tables<'quarry_level_survivor_status'>,
  'created_at' | 'updated_at'
> & {
  /** Survivor Status Details */
  survivor_status: SurvivorStatusDetail
}

/**
 * Quarry Level Trait Detail
 *
 * Used throughout the app to represent a quarry level's trait.
 */
export type QuarryLevelTraitDetail = Omit<
  Tables<'quarry_level_trait'>,
  'created_at' | 'updated_at'
> & {
  /** Trait Details */
  trait: TraitDetail
}

/**
 * Quarry Location Detail
 *
 * Used throughout the app to represent a quarry's location.
 */
export type QuarryLocationDetail = Omit<
  Tables<'quarry_location'>,
  'created_at' | 'updated_at'
> & {
  /** Location Details */
  location: LocationDetail
}

/**
 * Quarry Timeline Year Detail
 *
 * Used throughout the app to represent a quarry timeline year entry.
 */
export type QuarryTimelineYearDetail = Omit<
  Tables<'quarry_timeline_year'>,
  'created_at' | 'updated_at'
> & {}

/**
 * Resource Detail
 *
 * Used throughout the app to represent a resource.
 */
export type ResourceDetail = Omit<
  Tables<'resource'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {
  /** Nemesis */
  nemesis: NemesisDetail | null
  /** Pattern */
  pattern: PatternDetail | null
  /** Quarry */
  quarry: QuarryDetail | null
}

/**
 * Secret Fighting Art Detail
 *
 * Used throughout the app to represent a secret fighting art.
 */
export type SecretFightingArtDetail = Omit<
  Tables<'secret_fighting_art'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Seed Pattern Detail
 *
 * Used throughout the app to represent a seed pattern.
 */
export type SeedPatternDetail = Omit<
  Tables<'seed_pattern'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {
  /** Crafted Gear */
  crafted_gear: GearDetail
  /** Gear Costs Required to Craft the Seed Pattern */
  gear_costs: SeedPatternGearCostDetail[]
  /** Innovation Requirements */
  innovation_requirements: SeedPatternInnovationRequirementDetail[]
  /** Resource Costs */
  resource_costs: SeedPatternResourceCostDetail[]
  /** Resource Type Costs */
  resource_type_costs: SeedPatternResourceTypeCostDetail[]
}

/**
 * Seed Pattern Gear Cost Detail
 *
 * Represents a single gear cost entry tied to a seed pattern.
 */
export type SeedPatternGearCostDetail = Tables<'seed_pattern_gear_cost'> & {
  /** Cost Gear */
  cost_gear: GearDetail
}

/**
 * Seed Pattern Innovation Requirement Detail
 *
 * Represents a single innovation requirement entry tied to a seed pattern.
 */
export type SeedPatternInnovationRequirementDetail =
  Tables<'seed_pattern_innovation_requirement'> & {
    /** Innovation Details */
    innovation: InnovationDetail
  }

/**
 * Seed Pattern Resource Cost Detail
 *
 * Represents a single resource cost entry tied to a seed pattern.
 */
export type SeedPatternResourceCostDetail =
  Tables<'seed_pattern_resource_cost'> & {
    /** Cost Resource */
    resource: ResourceDetail
  }

/**
 * Seed Pattern Resource Type Cost Detail
 *
 * Represents a single resource type cost entry tied to a seed pattern.
 */
export type SeedPatternResourceTypeCostDetail =
  Tables<'seed_pattern_resource_type_cost'> & {}

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
  collective_cognition_rewards: SettlementCollectiveCognitionRewardDetail[]
  /** Gear */
  gear: SettlementGearDetail[]
  /** Innovations */
  innovations: SettlementInnovationDetail[]
  /** Knowledges */
  knowledges: SettlementKnowledgeDetail[]
  /** Locations */
  locations: SettlementLocationDetail[]
  /** Milestones */
  milestones: SettlementMilestoneDetail[]
  /** Nemeses */
  nemeses: SettlementNemesisDetail[]
  /** Neuroses */
  // neuroses: SettlementNeurosisDetails[]
  /** Patterns */
  patterns: SettlementPatternDetail[]
  /** Philosophies */
  philosophies: SettlementPhilosophyDetail[]
  /** Principles */
  principles: SettlementPrincipleDetail[]
  /** Quarries */
  quarries: SettlementQuarryDetail[]
  /** Resources */
  resources: SettlementResourceDetail[]
  /** Seed Patterns */
  seed_patterns: SettlementSeedPatternDetail[]
  /** Caller's Role on This Settlement */
  role: SettlementRole
  /** Settlement Timeline */
  timeline: {
    /** Year Number */
    [key: number]: SettlementTimelineYearDetail
  }
}

/**
 * Settlement Collective Cognition Reward Detail
 *
 * Used throughout the app to represent a settlement's collective cognition
 * reward. Custom rewards are scoped to a single user; non-custom rewards are
 * part of the shared catalog.
 */
export type SettlementCollectiveCognitionRewardDetail = Omit<
  Tables<'settlement_collective_cognition_reward'>,
  'created_at' | 'updated_at'
> & {
  /** Collective Cognition Reward Details */
  collective_cognition_reward: CollectiveCognitionRewardDetail
}

/**
 * Settlement Gear Detail
 *
 * Used throughout the app to represent a settlement's gear. Custom gear is
 * scoped to a single user; non-custom gear is part of the shared catalog.
 */
export type SettlementGearDetail = Omit<
  Tables<'settlement_gear'>,
  'created_at' | 'updated_at'
> & {
  /** Gear Details */
  gear: GearDetail
}

/**
 * Settlement Innovation Detail
 *
 * Used throughout the app to represent a settlement's innovation. Custom innovations are
 * scoped to a single user; non-custom innovations are part of the shared catalog.
 */
export type SettlementInnovationDetail = Omit<
  Tables<'settlement_innovation'>,
  'created_at' | 'updated_at'
> & {
  /** Innovation Details */
  innovation: InnovationDetail
}

/**
 * Settlement Knowledge Detail
 *
 * Used throughout the app to represent a settlement's knowledge. Custom knowledge is
 * scoped to a single user; non-custom knowledge is part of the shared catalog.
 */
export type SettlementKnowledgeDetail = Omit<
  Tables<'settlement_knowledge'>,
  'created_at' | 'updated_at'
> & {
  /** Knowledge Details */
  knowledge: KnowledgeDetail
}

/**
 * Settlement Location Detail
 *
 * Used throughout the app to represent a settlement's location. Custom locations are
 * scoped to a single user; non-custom locations are part of the shared catalog.
 */
export type SettlementLocationDetail = Omit<
  Tables<'settlement_location'>,
  'created_at' | 'updated_at'
> & {
  /** Location Details */
  location: LocationDetail
}

/**
 * Settlement Milestone Detail
 *
 * Used throughout the app to represent a settlement's milestone. Custom milestones are
 * scoped to a single user; non-custom milestones are part of the shared catalog.
 */
export type SettlementMilestoneDetail = Omit<
  Tables<'settlement_milestone'>,
  'created_at' | 'updated_at'
> & {
  /** Milestone Details */
  milestone: MilestoneDetail
}

/**
 * Settlement Nemesis Detail
 *
 * Used throughout the app to represent a settlement's nemesis. Custom nemeses are
 * scoped to a single user; non-custom nemeses are part of the shared catalog.
 */
export type SettlementNemesisDetail = Omit<
  Tables<'settlement_nemesis'>,
  'created_at' | 'updated_at'
> & {
  /** Nemesis Details */
  nemesis: NemesisDetail
}

/**
 * Settlement Pattern Detail
 *
 * Used throughout the app to represent a settlement's pattern. Custom patterns are
 * scoped to a single user; non-custom patterns are part of the shared catalog.
 */
export type SettlementPatternDetail = Omit<
  Tables<'settlement_pattern'>,
  'created_at' | 'updated_at'
> & {
  /** Pattern Details */
  pattern: PatternDetail
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
  /** Returning Scout */
  returning_scout: SurvivorDetail
  /** Returning Survivors */
  returning_survivors: SettlementPhaseReturningSurvivorDetail[]
}

/**
 * Settlement Phase Returning Survivor Detail
 *
 * Used throughout the app to represent a survivor returning in a settlement phase.
 */
export type SettlementPhaseReturningSurvivorDetail =
  Tables<'settlement_phase_returning_survivor'> & {
    /** Returning Survivor */
    returning_survivor: SurvivorDetail
  }

/**
 * Settlement Philosophy Detail
 *
 * Used throughout the app to represent a settlement's philosophy. Custom philosophies are
 * scoped to a single user; non-custom philosophies are part of the shared catalog.
 */
export type SettlementPhilosophyDetail = Omit<
  Tables<'settlement_philosophy'>,
  'created_at' | 'updated_at'
> & {
  /** Philosophy Details */
  philosophy: PhilosophyDetail
}

/**
 * Settlement Principle Detail
 *
 * Used throughout the app to represent a settlement's principle. Custom principles are
 * scoped to a single user; non-custom principles are part of the shared catalog.
 */
export type SettlementPrincipleDetail = Omit<
  Tables<'settlement_principle'>,
  'created_at' | 'updated_at'
> & {
  /** Principle Details */
  principle: PrincipleDetail
}

/**
 * Settlement Quarry Detail
 *
 * Used throughout the app to represent a settlement's quarry. Custom quarries are
 * scoped to a single user; non-custom quarries are part of the shared catalog.
 */
export type SettlementQuarryDetail = Omit<
  Tables<'settlement_quarry'>,
  'created_at' | 'updated_at'
> & {
  /** Quarry Details */
  quarry: QuarryDetail
}

/**
 * Settlement Resource Detail
 *
 * Used throughout the app to represent a settlement's resource. Custom resources are
 * scoped to a single user; non-custom resources are part of the shared catalog.
 */
export type SettlementResourceDetail = Omit<
  Tables<'settlement_resource'>,
  'created_at' | 'updated_at'
> & {
  /** Resource Details */
  resource: ResourceDetail
}

/**
 * Settlement Seed Pattern Detail
 *
 * Used throughout the app to represent a settlement's seed pattern. Custom seed patterns are
 * scoped to a single user; non-custom seed patterns are part of the shared catalog.
 */
export type SettlementSeedPatternDetail = Omit<
  Tables<'settlement_seed_pattern'>,
  'created_at' | 'updated_at'
> & {
  /** Seed Pattern Details */
  seed_pattern: SeedPatternDetail
}

/**
 * Settlement Shared User Detail
 *
 * Used throughout the app to represent a user who has shared a settlement.
 */
export type SettlementSharedUserDetail = Omit<
  Tables<'settlement_shared_user'>,
  'created_at'
> & {}

/**
 * Settlement Timeline Year Detail
 *
 * Used throughout the app to represent a settlement timeline year.
 */
export type SettlementTimelineYearDetail = Omit<
  Tables<'settlement_timeline_year'>,
  'created_at' | 'id' | 'updated_at'
> & {}

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
  monsters: { [key: string]: ShowdownMonsterDetail }
  /** Showdown Survivors */
  survivors: { [key: string]: ShowdownSurvivorDetail }
}

/**
 * Showdown AI Deck Detail
 *
 * Used throughout the app to represent a monster's AI deck in a showdown.
 */
export type ShowdownAIDeckDetail = Omit<
  Tables<'showdown_ai_deck'>,
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
> & {
  /** AI Deck */
  ai_deck: ShowdownAIDeckDetail
  /** Moods */
  moods: ShowdownMonsterMoodDetail[]
  /** Survivor Statuses */
  survivor_statuses: ShowdownMonsterSurvivorStatusDetail[]
  /** Traits */
  traits: ShowdownMonsterTraitDetail[]
}

/**
 * Showdown Monster Mood Detail
 *
 * Used throughout the app to represent a monster's mood in a showdown.
 */
export type ShowdownMonsterMoodDetail = Omit<
  Tables<'showdown_monster_mood'>,
  'created_at' | 'updated_at'
> & {
  /** Mood Details */
  mood: MoodDetail
}

/**
 * Showdown Monster Survivor Status Detail
 *
 * Used throughout the app to represent a survivor status inflicted by a
 * nemesis or quarry level. Custom statuses are scoped to a single user;
 * non-custom statuses are part of the shared catalog.
 */
export type ShowdownMonsterSurvivorStatusDetail = Omit<
  Tables<'showdown_monster_survivor_status'>,
  'created_at' | 'updated_at'
> & {
  /** Survivor Status Details */
  survivor_status: SurvivorStatusDetail
}

/**
 * Showdown Monster Trait Detail
 *
 * Used throughout the app to represent a monster's trait in a showdown.
 */
export type ShowdownMonsterTraitDetail = Omit<
  Tables<'showdown_monster_trait'>,
  'created_at' | 'updated_at'
> & {
  /** Trait Details */
  trait: TraitDetail
}

/**
 * Showdown Survivor Detail
 *
 * Used throughout the app to represent a survivor in a showdown.
 */
export type ShowdownSurvivorDetail = Omit<
  Tables<'showdown_survivor'>,
  'created_at' | 'updated_at'
> & {
  /** Survivor Details */
  survivor: SurvivorDetail
}

/**
 * Strain Milestone Detail
 *
 * Used throughout the app to represent a strain milestone.
 */
export type StrainMilestoneDetail = Omit<
  Tables<'strain_milestone'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {}

/**
 * Survivor Detail
 *
 * Used throughout the app to represent the currently selected survivor.
 * Includes additional information not present in the survivor table.
 */
export type SurvivorDetail = Tables<'survivor'> & {
  /** Abilities and Impairments */
  abilities_impairments: SurvivorAbilityImpairmentDetail[]
  /** Cursed Gear */
  cursed_gear: SurvivorCursedGearDetail[]
  /** Disorders */
  disorders: SurvivorDisorderDetail[]
  /** Survivor Embarked on Hunt/Showdown */
  embarked: boolean
  /** Fighting Arts */
  fighting_arts: SurvivorFightingArtDetail[]
  /** Gear Grid (3x3 of equipped gear; null until first edit) */
  gear_grid: GearGridDetail | null
  /** Knowledge 1 */
  knowledge_1: KnowledgeDetail | null
  /** Knowledge 2 */
  knowledge_2: KnowledgeDetail | null
  /** Neurosis */
  neurosis: NeurosisDetail | null
  /** Philosophy */
  philosophy: PhilosophyDetail | null
  /** Secret Fighting Arts */
  secret_fighting_arts: SurvivorSecretFightingArtDetail[]
  /** Tenet Knowledge */
  tenet_knowledge: KnowledgeDetail | null
  /** Weapon Type */
  weapon_type: WeaponTypeDetail | null
}

/**
 * Survivor Ability/Impairment Detail
 *
 * Used throughout the app to represent a survivor's ability or impairment.
 * Custom abilities/impairments are scoped to a single user; non-custom
 * abilities/impairments are part of the shared catalog.
 */
export type SurvivorAbilityImpairmentDetail = Omit<
  Tables<'survivor_ability_impairment'>,
  'created_at' | 'updated_at'
> & {
  /** Ability/Impairment Details */
  ability_impairment: AbilityImpairmentDetail
}

/**
 * Survivor Cursed Gear Detail
 *
 * Used throughout the app to represent a survivor's cursed gear.
 * Custom cursed gear is scoped to a single user; non-custom cursed gear
 * is part of the shared catalog.
 */
export type SurvivorCursedGearDetail = Omit<
  Tables<'survivor_cursed_gear'>,
  'created_at' | 'updated_at'
> & {
  /** Cursed Gear Details */
  cursed_gear: GearDetail
}

/**
 * Survivor Disorder Detail
 *
 * Used throughout the app to represent a survivor's disorders.
 * Custom disorders are scoped to a single user; non-custom disorders
 * are part of the shared catalog.
 */
export type SurvivorDisorderDetail = Omit<
  Tables<'survivor_disorder'>,
  'created_at' | 'updated_at'
> & {
  /** Disorder Details */
  disorder: DisorderDetail
}

/**
 * Survivor Fighting Art Detail
 *
 * Used throughout the app to represent a survivor's fighting arts.
 * Custom fighting arts are scoped to a single user; non-custom fighting arts
 * are part of the shared catalog.
 */
export type SurvivorFightingArtDetail = Omit<
  Tables<'survivor_fighting_art'>,
  'created_at' | 'updated_at'
> & {
  /** Fighting Art Details */
  fighting_art: FightingArtDetail
}

/**
 * Survivor Secret Fighting Art Detail
 *
 * Used throughout the app to represent a survivor's secret fighting arts.
 */
export type SurvivorSecretFightingArtDetail = Omit<
  Tables<'survivor_secret_fighting_art'>,
  'created_at' | 'updated_at'
> & {
  /** Secret Fighting Art Details */
  secret_fighting_art: SecretFightingArtDetail
}

/**
 * Survivor Status Detail
 *
 * Used throughout the app to represent a survivor status inflicted by a
 * nemesis or quarry level. Custom statuses are scoped to a single user;
 * non-custom statuses are part of the shared catalog.
 */
export type SurvivorStatusDetail = Omit<
  Tables<'survivor_status'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {}

/**
 * Trait Detail
 *
 * Used throughout the app to represent a monster trait. Custom traits are
 * scoped to a single user; non-custom traits are part of the shared catalog.
 */
export type TraitDetail = Omit<
  Tables<'trait'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {}

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
 * User Subscription Detail
 *
 * Client-side projection of the authenticated user's row in
 * `user_subscription`, combined with the `user_can_share()` entitlement
 * flag. Returned by `getUserSubscription()` in
 * `lib/dal/user-subscription.ts` and surfaced on `LocalContext` so any
 * component can read the active plan and share entitlement without
 * re-querying. The same Postgres predicate that decides `can_share` here
 * also gates RLS on `settlement_shared_user.INSERT`.
 */
export type UserSubscriptionDetail = Tables<'user_subscription'> & {
  /**
   * Whether The User May Create New Shares
   *
   * Mirrors the `user_can_share()` Postgres predicate consulted by RLS on
   * `settlement_shared_user.INSERT`.
   */
  can_share: boolean
}

/**
 * Vignette Encounter Detail
 *
 * Used throughout the app to represent an active vignette encounter.
 */
export type VignetteEncounterDetail = Omit<
  Tables<'vignette_encounter'>,
  'created_at' | 'updated_at'
> & {
  /** Vignette Encounter Monsters */
  monsters: { [key: string]: VignetteEncounterMonsterDetail }
  /** Vignette Encounter Survivors */
  survivors: { [key: string]: VignetteEncounterSurvivorDetail }
}

/**
 * Vignette Encounter AI Deck Detail
 *
 * Used throughout the app to represent the AI deck for an active vignette
 * encounter.
 */
export type VignetteEncounterAIDeckDetail = Omit<
  Tables<'vignette_encounter_ai_deck'>,
  'created_at' | 'updated_at'
> & {}

/**
 * Vignette Encounter Monster Detail
 *
 * Used throughout the app to represent a vignette monster for an active
 * vignette encounter.
 */
export type VignetteEncounterMonsterDetail = Omit<
  Tables<'vignette_encounter_monster'>,
  'created_at' | 'updated_at'
> & {
  /** AI Deck */
  ai_deck: VignetteEncounterAIDeckDetail
  /** Moods */
  moods: VignetteEncounterMonsterMoodDetail[]
  /** Survivor Statuses */
  survivor_statuses: VignetteEncounterMonsterSurvivorStatusDetail[]
  /** Traits */
  traits: VignetteEncounterMonsterTraitDetail[]
}

/**
 * Vignette Encounter Monster Mood Detail
 *
 * Used throughout the app to represent the mood of a monster in an active
 * vignette encounter.
 */
export type VignetteEncounterMonsterMoodDetail = Omit<
  Tables<'vignette_encounter_monster_mood'>,
  'created_at' | 'updated_at'
> & {
  /** Mood */
  mood: MoodDetail
}

/**
 * Vignette Encounter Monster Survivor Status Detail
 *
 * Used throughout the app to represent the survivor status of a monster in an
 * active vignette encounter.
 */
export type VignetteEncounterMonsterSurvivorStatusDetail = Omit<
  Tables<'vignette_encounter_monster_survivor_status'>,
  'created_at' | 'updated_at'
> & {
  /** Survivor Status */
  survivor_status: SurvivorStatusDetail
}

/**
 * Vignette Encounter Monster Trait Detail
 *
 * Used throughout the app to represent the trait of a monster in an active
 * vignette encounter.
 */
export type VignetteEncounterMonsterTraitDetail = Omit<
  Tables<'vignette_encounter_monster_trait'>,
  'created_at' | 'updated_at'
> & {
  /** Trait */
  trait: TraitDetail
}

/**
 * Vignette Encounter Shared User Detail
 *
 * Used throughout the app to represent a user who has shared an active vignette
 * encounter.
 */
export type VignetteEncounterSharedUserDetail = Omit<
  Tables<'vignette_encounter_shared_user'>,
  'created_at' | 'updated_at'
> & {}

/**
 * Vignette Encounter Survivor Detail
 *
 * Used throughout the app to represent a survivor in an active vignette
 * encounter.
 */
export type VignetteEncounterSurvivorDetail = Omit<
  Tables<'vignette_encounter_survivor'>,
  'created_at' | 'updated_at'
> & {
  /** Abilities and Impairments */
  abilities_impairments: VignetteEncounterSurvivorAbilityImpairmentDetail[]
  /** Disorders */
  disorders: VignetteEncounterSurvivorDisorderDetail[]
  /** Fighting Arts */
  fighting_arts: VignetteEncounterSurvivorFightingArtDetail[]
  /** Gear Grid */
  gear_grid: VignetteEncounterSurvivorGearGridDetail[]
  /** Secret Fighting Arts */
  secret_fighting_arts: VignetteEncounterSurvivorSecretFightingArtDetail[]
  /** Weapon Type */
  weapon_type: WeaponTypeDetail | null
}

/**
 * Vignette Survivor Ability / Impairment Detail
 *
 * Used throughout the app to represent a survivor's ability or impairment in an
 * active vignette encounter.
 */
export type VignetteEncounterSurvivorAbilityImpairmentDetail = Omit<
  Tables<'vignette_encounter_survivor_ability_impairment'>,
  'created_at' | 'updated_at'
> & {
  /** Ability or Impairment */
  ability_impairment: AbilityImpairmentDetail
}

/**
 * Vignette Encounter Survivor Disorder Detail
 *
 * Used throughout the app to represent a survivor's disorder in an active
 * vignette encounter.
 */
export type VignetteEncounterSurvivorDisorderDetail = Omit<
  Tables<'vignette_encounter_survivor_disorder'>,
  'created_at' | 'updated_at'
> & {
  /** Disorder */
  disorder: DisorderDetail
}

/**
 * Vignette Encounter Survivor Fighting Art Detail
 *
 * Used throughout the app to represent a survivor's fighting art in an active
 * vignette encounter.
 */
export type VignetteEncounterSurvivorFightingArtDetail = Omit<
  Tables<'vignette_encounter_survivor_fighting_art'>,
  'created_at' | 'updated_at'
> & {
  /** Fighting Art */
  fighting_art: FightingArtDetail
}

/**
 * Vignette Encounter Survivor Gear Grid Detail
 *
 * Used throughout the app to represent a survivor's gear grid in an active
 * vignette encounter.
 */
export type VignetteEncounterSurvivorGearGridDetail = Omit<
  Tables<'vignette_encounter_survivor_gear_grid'>,
  'created_at' | 'updated_at'
> & {}

/**
 * Vignette Encounter Survivor Secret Fighting Art Detail
 *
 * Used throughout the app to represent a survivor's secret fighting art in an active
 * vignette encounter.
 */
export type VignetteEncounterSurvivorSecretFightingArtDetail = Omit<
  Tables<'vignette_encounter_survivor_secret_fighting_art'>,
  'created_at' | 'updated_at'
> & {
  /** Secret Fighting Art */
  secret_fighting_art: SecretFightingArtDetail
}

/**
 * Vignette Monster Detail
 *
 * Used throughout the app to represent a template monster for a vignette
 * encounter.
 */
export type VignetteMonsterDetail = Omit<
  Tables<'vignette_monster'>,
  'created_at' | 'updated_at'
> & {
  /** Source Nemesis */
  source_nemesis: NemesisDetail | null
  /** Source Quarry */
  source_quarry: QuarryDetail | null
  /** Levels */
  levels: VignetteMonsterLevelDetail[]
}

/**
 * Vignette Monster Level Detail
 *
 * Used throughout the app to represent a template monster level for a
 * vignette encounter.
 */
export type VignetteMonsterLevelDetail = Omit<
  Tables<'vignette_monster_level'>,
  'created_at' | 'updated_at'
> & {
  /** Moods */
  moods: VignetteMonsterLevelMoodDetail[]
  /** Survivor Statuses */
  survivor_statuses: VignetteMonsterLevelSurvivorStatusDetail[]
  /** Traits */
  traits: VignetteMonsterLevelTraitDetail[]
}

/**
 * Vignette Monster Level Mood Detail
 *
 * Used throughout the app to represent a mood of a template monster level for a
 * vignette encounter.
 */
export type VignetteMonsterLevelMoodDetail = Omit<
  Tables<'vignette_monster_level_mood'>,
  'created_at' | 'updated_at'
> & {
  /** Mood */
  mood: MoodDetail
}

/**
 * Vignette Monster Level Survivor Status Detail
 *
 * Used throughout the app to represent a survivor status of a template monster
 * level for a vignette encounter.
 */
export type VignetteMonsterLevelSurvivorStatusDetail = Omit<
  Tables<'vignette_monster_level_survivor_status'>,
  'created_at' | 'updated_at'
> & {
  /** Survivor Status */
  survivor_status: SurvivorStatusDetail
}

/**
 * Vignette Monster Level Trait Detail
 *
 * Used throughout the app to represent a trait of a template monster level for
 * a vignette encounter.
 */
export type VignetteMonsterLevelTraitDetail = Omit<
  Tables<'vignette_monster_level_trait'>,
  'created_at' | 'updated_at'
> & {
  /** Trait */
  trait: TraitDetail
}

/** Vignette Survivor Detail */
export type VignetteSurvivorDetail = Omit<
  Tables<'vignette_survivor'>,
  'created_at' | 'updated_at'
> & {
  /** Abilities and Impairments */
  abilities_impairments: VignetteSurvivorAbilityImpairmentDetail[]
  /** Disorders */
  disorders: VignetteSurvivorDisorderDetail[]
  /** Fighting Arts */
  fighting_arts: VignetteSurvivorFightingArtDetail[]
  /** Gear Grid */
  gear_grid: VignetteSurvivorGearGridDetail[]
  /** Secret Fighting Arts */
  secret_fighting_arts: VignetteSurvivorSecretFightingArtDetail[]
  /** Weapon Type */
  weapon_type: WeaponTypeDetail
}

/**
 * Vignette Survivor Disorder Detail
 *
 * Used throughout the app to represent a disorder of a template survivor for a
 * vignette encounter.
 */
export type VignetteSurvivorDisorderDetail = Omit<
  Tables<'vignette_survivor_disorder'>,
  'created_at' | 'updated_at'
> & {
  /** Disorder */
  disorder: DisorderDetail
}

/**
 * Vignette Survivor Ability Impairment Detail
 *
 * Used throughout the app to represent an ability or impairment of a template
 * survivor for a vignette encounter.
 */
export type VignetteSurvivorAbilityImpairmentDetail = Omit<
  Tables<'vignette_survivor_ability_impairment'>,
  'created_at' | 'updated_at'
> & {
  /** Ability or Impairment */
  ability_impairment: AbilityImpairmentDetail
}

/**
 * Vignette Survivor Fighting Art Detail
 *
 * Used throughout the app to represent a fighting art of a template survivor
 * for a vignette encounter.
 */
export type VignetteSurvivorFightingArtDetail = Omit<
  Tables<'vignette_survivor_fighting_art'>,
  'created_at' | 'updated_at'
> & {
  /** Fighting Art */
  fighting_art: FightingArtDetail
}

/**
 * Vignette Survivor Gear Grid Detail
 *
 * Used throughout the app to represent the gear grid of a template survivor for
 * a vignette encounter.
 */
export type VignetteSurvivorGearGridDetail = Omit<
  Tables<'vignette_survivor_gear_grid'>,
  'created_at' | 'updated_at'
> & {}

/**
 * Vignette Survivor Secret Fighting Art Detail
 *
 * Used throughout the app to represent a secret fighting art of a template
 * survivor for a vignette encounter.
 */
export type VignetteSurvivorSecretFightingArtDetail = Omit<
  Tables<'vignette_survivor_secret_fighting_art'>,
  'created_at' | 'updated_at'
> & {
  /** Secret Fighting Art */
  secret_fighting_art: SecretFightingArtDetail
}

/**
 * Wanderer Detail
 *
 * Used throughout the app to represent the currently selected wanderer.
 * Includes additional information not present in the wanderer table.
 */
export type WandererDetail = Omit<
  Tables<'wanderer'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {
  /** Abilities and Impairments */
  abilities_impairments: WandererAbilityImpairmentDetail[]
  /** Fighting Arts */
  fighting_arts: FightingArtDetail[]
  /** Rare Gear */
  rare_gear: GearDetail[]
  /** Timeline Years */
  timeline_years: WandererTimelineYearDetail[]
}

/**
 * Wanderer Ability / Impairment Detail
 *
 * Used throughout the app to represent an ability or impairment of a template
 * wanderer.
 */
export type WandererAbilityImpairmentDetail = Omit<
  Tables<'wanderer_ability_impairment'>,
  'created_at' | 'updated_at'
> & {
  /** Ability or Impairment */
  ability_impairment: AbilityImpairmentDetail
}

/**
 * Wanderer Timeline Year Detail
 *
 * Used throughout the app to represent a wanderer timeline year.
 */
export type WandererTimelineYearDetail = Omit<
  Tables<'wanderer_timeline_year'>,
  'created_at' | 'updated_at'
> & {}

/**
 * Weapon Type Detail
 *
 * Used throughout the app to represent a weapon type.
 */
export type WeaponTypeDetail = Omit<
  Tables<'weapon_type'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
> & {}

/****************************************************************************
 * Setter Function Types
 ****************************************************************************/

/**
 * Encounter State Setter
 *
 * Accepts either a direct value or a functional updater. Use the functional
 * form inside async `.then` / `.catch` callbacks so the update always operates
 * on the latest state instead of a stale closure capture.
 */
export type EncounterStateSetter = (
  encounterOrUpdater:
    | EncounterDetail
    | null
    | ((prev: EncounterDetail | null) => EncounterDetail | null)
) => void

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
 * Vignette Encounter State Setter
 *
 * Accepts either a direct value or a functional updater. Use the functional
 * form inside async `.then` / `.catch` callbacks so the update always operates
 * on the latest state instead of a stale closure capture.
 */
export type VignetteEncounterStateSetter = (
  vignetteEncounterOrUpdater:
    | VignetteEncounterDetail
    | null
    | ((prev: VignetteEncounterDetail | null) => VignetteEncounterDetail | null)
) => void
