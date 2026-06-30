import { Database, Tables } from '@/lib/database.types'
import { HuntEventType } from '@/lib/enums'

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
export type GearAffinityBonusRequirementDetail = {
  /** Required Affinity Color */
  affinity: Database['public']['Enums']['affinity']
  /** Affinity Puzzle Requirement */
  puzzle: boolean
}

/**
 * Gear Grid Position
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
 * Monster Level Data
 *
 * Editable monster-level form data shared by custom nemesis, quarry, and
 * encounter monster workflows.
 */
export type MonsterLevelData = {
  /** Sub-Monster Name */
  sub_monster_name: string | null
  /** Basic AI Cards */
  basic_cards: number
  /** Advanced AI Cards */
  advanced_cards: number
  /** Legendary AI Cards */
  legendary_cards: number
  /** Overtone AI Cards */
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
  /** Life */
  life: number
  /** Traits */
  traits: TraitDetail[]
  /** Moods */
  moods: MoodDetail[]
  /** Survivor Statuses */
  survivor_statuses: SurvivorStatusDetail[]
}

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
  campaign_type: Database['public']['Enums']['campaign_type']
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

/**
 * With Authorship
 *
 * A utility type that adds an authorship field to a given type.
 */
export type WithAuthorship<T> = T & { user_id: string | null }

/****************************************************************************
 * Database Types (with and w/o Joins)
 ****************************************************************************/

/**
 * Ability Impairment
 *
 * Represents the ability impairment table data without joined relationships.
 */
export type AbilityImpairment = Omit<
  Tables<'ability_impairment'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Ability Impairment
 *
 * Represents ability impairment data with joined relationships.
 */
export type AbilityImpairmentDetail = AbilityImpairment & {}

/**
 * Armor Set
 *
 * Represents the armor set table data without joined relationships.
 */
export type ArmorSet = Omit<
  Tables<'armor_set'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Armor Set
 *
 * Represents armor set data with joined relationships.
 */
export type ArmorSetDetail = ArmorSet & {
  /** Armor Set Slot Details */
  slots: ArmorSetSlotDetail[]
}

/**
 * Armor Set Slot
 *
 * Represents the armor set slot table data without joined relationships.
 */
export type ArmorSetSlot = Omit<
  Tables<'armor_set_slot'>,
  'created_at' | 'updated_at'
>

/**
 * Armor Set Slot
 *
 * Represents armor set slot data with joined relationships.
 */
export type ArmorSetSlotDetail = ArmorSetSlot & {
  /** Armor Set Slot Gear Details */
  slot_gear: ArmorSetSlotGearDetail[]
}

/**
 * Armor Set Slot Gear
 *
 * Represents the armor set slot gear table data without joined relationships.
 */
export type ArmorSetSlotGear = Tables<'armor_set_slot_gear'>

/**
 * Armor Set Slot Gear
 *
 * Represents armor set slot gear data with joined relationships.
 */
export type ArmorSetSlotGearDetail = ArmorSetSlotGear & {
  /** Gear Details */
  gear: GearDetail
}

/**
 * Character
 *
 * Represents the character table data without joined relationships.
 */
export type Character = Omit<
  Tables<'character'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Character
 *
 * Represents character data with joined relationships.
 */
export type CharacterDetail = Character & {}

/**
 * Collective Cognition Reward
 *
 * Represents the collective cognition reward table data without joined relationships.
 */
export type CollectiveCognitionReward = Omit<
  Tables<'collective_cognition_reward'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Collective Cognition Reward
 *
 * Represents collective cognition reward data with joined relationships.
 */
export type CollectiveCognitionRewardDetail = CollectiveCognitionReward & {}

/**
 * Constellation
 *
 * Represents the constellation table data without joined relationships.
 */
export type Constellation = Omit<
  Tables<'constellation'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Constellation
 *
 * Represents constellation data with joined relationships.
 */
export type ConstellationDetail = Constellation & {}

/**
 * Disorder
 *
 * Represents the disorder table data without joined relationships.
 */
export type Disorder = Omit<
  Tables<'disorder'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Disorder
 *
 * Represents disorder data with joined relationships.
 */
export type DisorderDetail = Disorder & {}

/**
 * Encounter
 *
 * Represents the encounter table data without joined relationships.
 */
export type Encounter = Omit<Tables<'encounter'>, 'created_at' | 'updated_at'>

/**
 * Encounter
 *
 * Represents encounter data with joined relationships.
 */
export type EncounterDetail = Encounter & {
  /** Encounter Active Monsters */
  monsters: { [key: string]: EncounterActiveMonsterDetail }
  /** Encounter Active Survivors */
  survivors: { [key: string]: EncounterActiveSurvivorDetail }
}

/**
 * Encounter Active Monster
 *
 * Represents the encounter active monster table data without joined relationships.
 */
export type EncounterActiveMonster = Omit<
  Tables<'encounter_active_monster'>,
  'created_at' | 'updated_at'
>

/**
 * Encounter Active Monster
 *
 * Represents encounter active monster data with joined relationships.
 */
export type EncounterActiveMonsterDetail = EncounterActiveMonster & {
  /** Moods */
  moods: EncounterActiveMonsterMoodDetail[]
  /** Traits */
  traits: EncounterActiveMonsterTraitDetail[]
}

/**
 * Encounter Active Monster Mood
 *
 * Represents the encounter active monster mood table data without joined relationships.
 */
export type EncounterActiveMonsterMood = Omit<
  Tables<'encounter_active_monster_mood'>,
  'created_at' | 'updated_at'
>

/**
 * Encounter Active Monster Mood
 *
 * Represents encounter active monster mood data with joined relationships.
 */
export type EncounterActiveMonsterMoodDetail = EncounterActiveMonsterMood & {
  /** Mood Details */
  mood: MoodDetail
}

/**
 * Encounter Active Monster Survivor Status
 *
 * Represents the encounter active monster survivor status table data without joined relationships.
 */
export type EncounterActiveMonsterSurvivorStatus = Omit<
  Tables<'encounter_active_monster_survivor_status'>,
  'created_at' | 'updated_at'
>

/**
 * Encounter Active Monster Survivor Status
 *
 * Represents encounter active monster survivor status data with joined relationships.
 */
export type EncounterActiveMonsterSurvivorStatusDetail =
  EncounterActiveMonsterSurvivorStatus & {
    /** Survivor Status Details */
    survivor_status: SurvivorStatusDetail
  }

/**
 * Encounter Active Monster Trait
 *
 * Represents the encounter active monster trait table data without joined relationships.
 */
export type EncounterActiveMonsterTrait = Omit<
  Tables<'encounter_active_monster_trait'>,
  'created_at' | 'updated_at'
>

/**
 * Encounter Active Monster Trait
 *
 * Represents encounter active monster trait data with joined relationships.
 */
export type EncounterActiveMonsterTraitDetail = EncounterActiveMonsterTrait & {
  /** Trait Details */
  trait: TraitDetail
}

/**
 * Encounter Active Survivor
 *
 * Represents the encounter active survivor table data without joined relationships.
 */
export type EncounterActiveSurvivor = Omit<
  Tables<'encounter_active_survivor'>,
  'created_at' | 'updated_at'
>

/**
 * Encounter Active Survivor
 *
 * Represents encounter active survivor data with joined relationships.
 */
export type EncounterActiveSurvivorDetail = EncounterActiveSurvivor & {}

/**
 * Encounter Monster
 *
 * Represents the encounter monster table data without joined relationships.
 */
export type EncounterMonster = Omit<
  Tables<'encounter_monster'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Encounter Monster
 *
 * Represents encounter monster data with joined relationships.
 */
export type EncounterMonsterDetail = EncounterMonster & {
  /** Level Data */
  levels: EncounterMonsterLevelDetail[]
}

/**
 * Encounter Monster Level
 *
 * Represents the encounter monster level table data without joined relationships.
 */
export type EncounterMonsterLevel = Omit<
  Tables<'encounter_monster_level'>,
  'created_at' | 'updated_at'
>

/**
 * Encounter Monster Level
 *
 * Represents encounter monster level data with joined relationships.
 */
export type EncounterMonsterLevelDetail = EncounterMonsterLevel & {
  /** Moods */
  moods: EncounterMonsterLevelMoodDetail[]
  /** Traits */
  traits: EncounterMonsterLevelTraitDetail[]
}

/**
 * Encounter Monster Level Mood
 *
 * Represents the encounter monster level mood table data without joined relationships.
 */
export type EncounterMonsterLevelMood = Omit<
  Tables<'encounter_monster_level_mood'>,
  'created_at' | 'updated_at'
>

/**
 * Encounter Monster Level Mood
 *
 * Represents encounter monster level mood data with joined relationships.
 */
export type EncounterMonsterLevelMoodDetail = EncounterMonsterLevelMood & {
  /** Mood Details */
  mood: MoodDetail
}

/**
 * Encounter Monster Level Trait
 *
 * Represents the encounter monster level trait table data without joined relationships.
 */
export type EncounterMonsterLevelTrait = Omit<
  Tables<'encounter_monster_level_trait'>,
  'created_at' | 'updated_at'
>

/**
 * Encounter Monster Level Trait
 *
 * Represents encounter monster level trait data with joined relationships.
 */
export type EncounterMonsterLevelTraitDetail = EncounterMonsterLevelTrait & {
  /** Trait Details */
  trait: TraitDetail
}

/**
 * Fighting Art
 *
 * Represents the fighting art table data without joined relationships.
 */
export type FightingArt = Omit<
  Tables<'fighting_art'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Fighting Art
 *
 * Represents fighting art data with joined relationships.
 */
export type FightingArtDetail = FightingArt & {}

/**
 * Gear
 *
 * Represents the gear table data without joined relationships.
 */
export type Gear = Omit<
  Tables<'gear'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Gear
 *
 * Represents gear data with joined relationships.
 */
export type GearDetail = Gear & {
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
 * Gear Gear Cost
 *
 * Represents the gear gear cost table data without joined relationships.
 */
export type GearGearCost = Tables<'gear_gear_cost'>

/**
 * Gear Gear Cost
 *
 * Represents gear gear cost data with joined relationships.
 */
export type GearGearCostDetail = GearGearCost & {
  /** Cost Gear Details */
  cost_gear: GearDetail
}

/**
 * Gear Grid
 *
 * Represents the gear grid table data without joined relationships.
 */
export type GearGrid = Omit<Tables<'gear_grid'>, 'created_at' | 'updated_at'>

/**
 * Gear Grid
 *
 * Represents gear grid data with joined relationships.
 */
export type GearGridDetail = GearGrid & {
  /** Top Left Gear */
  gear_top_left: GearDetail | null
  /** Top Center Gear */
  gear_top_center: GearDetail | null
  /** Top Right Gear */
  gear_top_right: GearDetail | null
  /** Middle Left Gear */
  gear_mid_left: GearDetail | null
  /** Middle Center Gear */
  gear_mid_center: GearDetail | null
  /** Middle Right Gear */
  gear_mid_right: GearDetail | null
  /** Bottom Left Gear */
  gear_bottom_left: GearDetail | null
  /** Bottom Center Gear */
  gear_bottom_center: GearDetail | null
  /** Bottom Right Gear */
  gear_bottom_right: GearDetail | null
}

/**
 * Gear Other Cost
 *
 * Represents the gear other cost table data without joined relationships.
 */
export type GearOtherCost = Tables<'gear_other_cost'>

/**
 * Gear Other Cost
 *
 * Represents gear other cost data with joined relationships.
 */
export type GearOtherCostDetail = GearOtherCost & {}

/**
 * Gear Resource Cost
 *
 * Represents the gear resource cost table data without joined relationships.
 */
export type GearResourceCost = Tables<'gear_resource_cost'>

/**
 * Gear Resource Cost
 *
 * Represents gear resource cost data with joined relationships.
 */
export type GearResourceCostDetail = GearResourceCost & {
  /** Resource Details */
  resource: ResourceDetail
}

/**
 * Gear Resource Type Cost
 *
 * Represents the gear resource type cost table data without joined relationships.
 */
export type GearResourceTypeCost = Tables<'gear_resource_type_cost'>

/**
 * Gear Resource Type Cost
 *
 * Represents gear resource type cost data with joined relationships.
 */
export type GearResourceTypeCostDetail = GearResourceTypeCost & {}

/**
 * Hunt
 *
 * Represents the hunt table data without joined relationships.
 */
export type Hunt = Omit<Tables<'hunt'>, 'created_at' | 'updated_at'>

/**
 * Hunt
 *
 * Represents hunt data with joined relationships.
 */
export type HuntDetail = Hunt & {
  /** Hunt Board */
  hunt_board: HuntHuntBoardDetail
  /** Hunt Monsters */
  monsters: { [key: string]: HuntMonsterDetail }
  /** Hunt Survivors */
  survivors: { [key: string]: HuntSurvivorDetail }
}

/**
 * Hunt AIDeck
 *
 * Represents the hunt aideck table data without joined relationships.
 */
export type HuntAIDeck = Omit<
  Tables<'hunt_ai_deck'>,
  'created_at' | 'updated_at'
>

/**
 * Hunt AIDeck
 *
 * Represents hunt aideck data with joined relationships.
 */
export type HuntAIDeckDetail = HuntAIDeck & {}

/**
 * Hunt Hunt Board
 *
 * Represents the hunt hunt board table data without joined relationships.
 */
export type HuntHuntBoard = Omit<
  Tables<'hunt_hunt_board'>,
  'created_at' | 'updated_at'
>

/**
 * Hunt Hunt Board
 *
 * Represents hunt hunt board data with joined relationships.
 */
export type HuntHuntBoardDetail = HuntHuntBoard & {}

/**
 * Hunt Monster
 *
 * Represents the hunt monster table data without joined relationships.
 */
export type HuntMonster = Omit<
  Tables<'hunt_monster'>,
  'created_at' | 'updated_at'
>

/**
 * Hunt Monster
 *
 * Represents hunt monster data with joined relationships.
 */
export type HuntMonsterDetail = HuntMonster & {
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
 * Hunt Monster Mood
 *
 * Represents the hunt monster mood table data without joined relationships.
 */
export type HuntMonsterMood = Omit<
  Tables<'hunt_monster_mood'>,
  'created_at' | 'updated_at'
>

/**
 * Hunt Monster Mood
 *
 * Represents hunt monster mood data with joined relationships.
 */
export type HuntMonsterMoodDetail = HuntMonsterMood & {
  /** Mood Details */
  mood: MoodDetail
}

/**
 * Hunt Monster Survivor Status
 *
 * Represents the hunt monster survivor status table data without joined relationships.
 */
export type HuntMonsterSurvivorStatus = Omit<
  Tables<'hunt_monster_survivor_status'>,
  'created_at' | 'updated_at'
>

/**
 * Hunt Monster Survivor Status
 *
 * Represents hunt monster survivor status data with joined relationships.
 */
export type HuntMonsterSurvivorStatusDetail = HuntMonsterSurvivorStatus & {
  /** Survivor Status Details */
  survivor_status: SurvivorStatusDetail
}

/**
 * Hunt Monster Trait
 *
 * Represents the hunt monster trait table data without joined relationships.
 */
export type HuntMonsterTrait = Omit<
  Tables<'hunt_monster_trait'>,
  'created_at' | 'updated_at'
>

/**
 * Hunt Monster Trait
 *
 * Represents hunt monster trait data with joined relationships.
 */
export type HuntMonsterTraitDetail = HuntMonsterTrait & {
  /** Trait Details */
  trait: TraitDetail
}

/**
 * Hunt Survivor
 *
 * Represents the hunt survivor table data without joined relationships.
 */
export type HuntSurvivor = Omit<
  Tables<'hunt_survivor'>,
  'created_at' | 'updated_at'
>

/**
 * Hunt Survivor
 *
 * Represents hunt survivor data with joined relationships.
 */
export type HuntSurvivorDetail = HuntSurvivor & {
  /** Survivor Details */
  survivor: SurvivorDetail
}

/**
 * Innovation
 *
 * Represents the innovation table data without joined relationships.
 */
export type Innovation = Omit<
  Tables<'innovation'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Innovation
 *
 * Represents innovation data with joined relationships.
 */
export type InnovationDetail = Innovation & {}

/**
 * Knowledge
 *
 * Represents the knowledge table data without joined relationships.
 */
export type Knowledge = Omit<
  Tables<'knowledge'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Knowledge
 *
 * Represents knowledge data with joined relationships.
 */
export type KnowledgeDetail = Knowledge & {}

/**
 * Location
 *
 * Represents the location table data without joined relationships.
 */
export type Location = Omit<
  Tables<'location'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Location
 *
 * Represents location data with joined relationships.
 */
export type LocationDetail = Location & {}

/**
 * Lookup User Audit
 *
 * Represents the lookup user audit table data without joined relationships.
 */
export type LookupUserAudit = Tables<'lookup_user_audit'>

/**
 * Lookup User Audit
 *
 * Represents lookup user audit data with joined relationships.
 */
export type LookupUserAuditDetail = LookupUserAudit & {}

/**
 * Milestone
 *
 * Represents the milestone table data without joined relationships.
 */
export type Milestone = Omit<
  Tables<'milestone'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Milestone
 *
 * Represents milestone data with joined relationships.
 */
export type MilestoneDetail = Milestone & {}

/**
 * Mood
 *
 * Represents the mood table data without joined relationships.
 */
export type Mood = Omit<
  Tables<'mood'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Mood
 *
 * Represents mood data with joined relationships.
 */
export type MoodDetail = Mood & {}

/**
 * Nemesis
 *
 * Represents the nemesis table data without joined relationships.
 */
export type Nemesis = Omit<
  Tables<'nemesis'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Nemesis
 *
 * Represents nemesis data with joined relationships.
 */
export type NemesisDetail = Nemesis & {
  /** Level Details */
  levels: NemesisLevelDetail[]
  /** Location Details */
  location: NemesisLocationDetail
  /** Timeline Years */
  timeline_years: NemesisTimelineYearDetail[]
}

/**
 * Nemesis Level
 *
 * Represents the nemesis level table data without joined relationships.
 */
export type NemesisLevel = Omit<
  Tables<'nemesis_level'>,
  'created_at' | 'updated_at'
>

/**
 * Nemesis Level
 *
 * Represents nemesis level data with joined relationships.
 */
export type NemesisLevelDetail = NemesisLevel & {
  /** Moods */
  moods: NemesisLevelMoodDetail[]
  /** Survivor Statuses */
  survivor_statuses: NemesisLevelSurvivorStatusDetail[]
  /** Traits */
  traits: NemesisLevelTraitDetail[]
}

/**
 * Nemesis Level Mood
 *
 * Represents the nemesis level mood table data without joined relationships.
 */
export type NemesisLevelMood = Omit<
  Tables<'nemesis_level_mood'>,
  'created_at' | 'updated_at'
>

/**
 * Nemesis Level Mood
 *
 * Represents nemesis level mood data with joined relationships.
 */
export type NemesisLevelMoodDetail = NemesisLevelMood & {
  /** Mood Details */
  mood: MoodDetail
}

/**
 * Nemesis Level Survivor Status
 *
 * Represents the nemesis level survivor status table data without joined relationships.
 */
export type NemesisLevelSurvivorStatus = Omit<
  Tables<'nemesis_level_survivor_status'>,
  'created_at' | 'updated_at'
>

/**
 * Nemesis Level Survivor Status
 *
 * Represents nemesis level survivor status data with joined relationships.
 */
export type NemesisLevelSurvivorStatusDetail = NemesisLevelSurvivorStatus & {
  /** Survivor Status Details */
  survivor_status: SurvivorStatusDetail
}

/**
 * Nemesis Level Trait
 *
 * Represents the nemesis level trait table data without joined relationships.
 */
export type NemesisLevelTrait = Omit<
  Tables<'nemesis_level_trait'>,
  'created_at' | 'updated_at'
>

/**
 * Nemesis Level Trait
 *
 * Represents nemesis level trait data with joined relationships.
 */
export type NemesisLevelTraitDetail = NemesisLevelTrait & {
  /** Trait Details */
  trait: TraitDetail
}

/**
 * Nemesis Location
 *
 * Represents the nemesis location table data without joined relationships.
 */
export type NemesisLocation = Omit<
  Tables<'nemesis_location'>,
  'created_at' | 'updated_at'
>

/**
 * Nemesis Location
 *
 * Represents nemesis location data with joined relationships.
 */
export type NemesisLocationDetail = NemesisLocation & {
  /** Location Details */
  location: LocationDetail
}

/**
 * Nemesis Timeline Year
 *
 * Represents the nemesis timeline year table data without joined relationships.
 */
export type NemesisTimelineYear = Omit<
  Tables<'nemesis_timeline_year'>,
  'created_at' | 'updated_at'
>

/**
 * Nemesis Timeline Year
 *
 * Represents nemesis timeline year data with joined relationships.
 */
export type NemesisTimelineYearDetail = NemesisTimelineYear & {}

/**
 * Neurosis
 *
 * Represents the neurosis table data without joined relationships.
 */
export type Neurosis = Omit<
  Tables<'neurosis'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Neurosis
 *
 * Represents neurosis data with joined relationships.
 */
export type NeurosisDetail = Neurosis & {}

/**
 * Notification
 *
 * Represents the notification table data without joined relationships.
 */
export type Notification = Tables<'notification'>

/**
 * Notification
 *
 * Represents notification data with joined relationships.
 */
export type NotificationDetail = Notification & {}

/**
 * Pattern
 *
 * Represents the pattern table data without joined relationships.
 */
export type Pattern = Omit<
  Tables<'pattern'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Pattern
 *
 * Represents pattern data with joined relationships.
 */
export type PatternDetail = Pattern & {
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
 * Pattern Gear Cost
 *
 * Represents the pattern gear cost table data without joined relationships.
 */
export type PatternGearCost = Tables<'pattern_gear_cost'>

/**
 * Pattern Gear Cost
 *
 * Represents pattern gear cost data with joined relationships.
 */
export type PatternGearCostDetail = PatternGearCost & {
  /** Cost Gear Details */
  cost_gear: GearDetail
}

/**
 * Pattern Innovation Requirement
 *
 * Represents the pattern innovation requirement table data without joined relationships.
 */
export type PatternInnovationRequirement =
  Tables<'pattern_innovation_requirement'>

/**
 * Pattern Innovation Requirement
 *
 * Represents pattern innovation requirement data with joined relationships.
 */
export type PatternInnovationRequirementDetail =
  PatternInnovationRequirement & {
    /** Innovation Details */
    innovation: InnovationDetail
  }

/**
 * Pattern Resource Cost
 *
 * Represents the pattern resource cost table data without joined relationships.
 */
export type PatternResourceCost = Tables<'pattern_resource_cost'>

/**
 * Pattern Resource Cost
 *
 * Represents pattern resource cost data with joined relationships.
 */
export type PatternResourceCostDetail = PatternResourceCost & {
  /** Resource Details */
  resource: ResourceDetail
}

/**
 * Pattern Resource Type Cost
 *
 * Represents the pattern resource type cost table data without joined relationships.
 */
export type PatternResourceTypeCost = Tables<'pattern_resource_type_cost'>

/**
 * Pattern Resource Type Cost
 *
 * Represents pattern resource type cost data with joined relationships.
 */
export type PatternResourceTypeCostDetail = PatternResourceTypeCost & {}

/**
 * Philosophy
 *
 * Represents the philosophy table data without joined relationships.
 */
export type Philosophy = Omit<
  Tables<'philosophy'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Philosophy
 *
 * Represents philosophy data with joined relationships.
 */
export type PhilosophyDetail = Philosophy & {
  /** Neurosis Details */
  neurosis: NeurosisDetail
  /** Philosophy Ranks */
  ranks: PhilosophyRankDetail[]
  /** Tenet Knowledge Details */
  tenet_knowledge: KnowledgeDetail
}

/**
 * Philosophy Rank
 *
 * Represents the philosophy rank table data without joined relationships.
 */
export type PhilosophyRank = Omit<
  Tables<'philosophy_rank'>,
  'created_at' | 'updated_at'
>

/**
 * Philosophy Rank
 *
 * Represents philosophy rank data with joined relationships.
 */
export type PhilosophyRankDetail = PhilosophyRank & {}

/**
 * Principle
 *
 * Represents the principle table data without joined relationships.
 */
export type Principle = Omit<
  Tables<'principle'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Principle
 *
 * Represents principle data with joined relationships.
 */
export type PrincipleDetail = Principle & {}

/**
 * Quarry
 *
 * Represents the quarry table data without joined relationships.
 */
export type Quarry = Omit<
  Tables<'quarry'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Quarry
 *
 * Represents quarry data with joined relationships.
 */
export type QuarryDetail = Quarry & {
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
 * Quarry Collective Cognition Reward
 *
 * Represents the quarry collective cognition reward table data without joined relationships.
 */
export type QuarryCollectiveCognitionReward = Omit<
  Tables<'quarry_collective_cognition_reward'>,
  'created_at' | 'updated_at'
>

/**
 * Quarry Collective Cognition Reward
 *
 * Represents quarry collective cognition reward data with joined relationships.
 */
export type QuarryCollectiveCognitionRewardDetail =
  QuarryCollectiveCognitionReward & {
    /** Collective Cognition Reward Details */
    collective_cognition_reward: CollectiveCognitionRewardDetail
  }

/**
 * Quarry Hunt Board
 *
 * Represents the quarry hunt board table data without joined relationships.
 */
export type QuarryHuntBoard = Omit<
  Tables<'quarry_hunt_board'>,
  'created_at' | 'updated_at'
>

/**
 * Quarry Hunt Board
 *
 * Represents quarry hunt board data with joined relationships.
 */
export type QuarryHuntBoardDetail = QuarryHuntBoard & {}

/**
 * Quarry Hunt Board Position
 *
 * Represents the quarry hunt board position table data without joined relationships.
 */
export type QuarryHuntBoardPosition = Omit<
  Tables<'quarry_hunt_board_position'>,
  'created_at' | 'updated_at'
>

/**
 * Quarry Hunt Board Position
 *
 * Represents quarry hunt board position data with joined relationships.
 */
export type QuarryHuntBoardPositionDetail = QuarryHuntBoardPosition & {}

/**
 * Quarry Level
 *
 * Represents the quarry level table data without joined relationships.
 */
export type QuarryLevel = Omit<
  Tables<'quarry_level'>,
  'created_at' | 'updated_at'
>

/**
 * Quarry Level
 *
 * Represents quarry level data with joined relationships.
 */
export type QuarryLevelDetail = QuarryLevel & {
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
 * Quarry Level Mood
 *
 * Represents the quarry level mood table data without joined relationships.
 */
export type QuarryLevelMood = Omit<
  Tables<'quarry_level_mood'>,
  'created_at' | 'updated_at'
>

/**
 * Quarry Level Mood
 *
 * Represents quarry level mood data with joined relationships.
 */
export type QuarryLevelMoodDetail = QuarryLevelMood & {
  /** Mood Details */
  mood: MoodDetail
}

/**
 * Quarry Level Survivor Status
 *
 * Represents the quarry level survivor status table data without joined relationships.
 */
export type QuarryLevelSurvivorStatus = Omit<
  Tables<'quarry_level_survivor_status'>,
  'created_at' | 'updated_at'
>

/**
 * Quarry Level Survivor Status
 *
 * Represents quarry level survivor status data with joined relationships.
 */
export type QuarryLevelSurvivorStatusDetail = QuarryLevelSurvivorStatus & {
  /** Survivor Status Details */
  survivor_status: SurvivorStatusDetail
}

/**
 * Quarry Level Trait
 *
 * Represents the quarry level trait table data without joined relationships.
 */
export type QuarryLevelTrait = Omit<
  Tables<'quarry_level_trait'>,
  'created_at' | 'updated_at'
>

/**
 * Quarry Level Trait
 *
 * Represents quarry level trait data with joined relationships.
 */
export type QuarryLevelTraitDetail = QuarryLevelTrait & {
  /** Trait Details */
  trait: TraitDetail
}

/**
 * Quarry Location
 *
 * Represents the quarry location table data without joined relationships.
 */
export type QuarryLocation = Omit<
  Tables<'quarry_location'>,
  'created_at' | 'updated_at'
>

/**
 * Quarry Location
 *
 * Represents quarry location data with joined relationships.
 */
export type QuarryLocationDetail = QuarryLocation & {
  /** Location Details */
  location: LocationDetail
}

/**
 * Quarry Timeline Year
 *
 * Represents the quarry timeline year table data without joined relationships.
 */
export type QuarryTimelineYear = Omit<
  Tables<'quarry_timeline_year'>,
  'created_at' | 'updated_at'
>

/**
 * Quarry Timeline Year
 *
 * Represents quarry timeline year data with joined relationships.
 */
export type QuarryTimelineYearDetail = QuarryTimelineYear & {}

/**
 * Resource
 *
 * Represents the resource table data without joined relationships.
 */
export type Resource = Omit<
  Tables<'resource'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Resource
 *
 * Represents resource data with joined relationships.
 */
export type ResourceDetail = Resource & {
  /** Nemesis */
  nemesis: {
    /** Monster Name */
    monster_name: string
    /** Node */
    node: Database['public']['Enums']['monster_node']
  } | null
  /** Pattern */
  pattern: PatternDetail | null
  /** Quarry */
  quarry: {
    /** Quarry Name */
    monster_name: string
    /** Node */
    node: Database['public']['Enums']['monster_node']
  } | null
}

/**
 * Secret Fighting Art
 *
 * Represents the secret fighting art table data without joined relationships.
 */
export type SecretFightingArt = Omit<
  Tables<'secret_fighting_art'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Secret Fighting Art
 *
 * Represents secret fighting art data with joined relationships.
 */
export type SecretFightingArtDetail = SecretFightingArt & {}

/**
 * Seed Pattern
 *
 * Represents the seed pattern table data without joined relationships.
 */
export type SeedPattern = Omit<
  Tables<'seed_pattern'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Seed Pattern
 *
 * Represents seed pattern data with joined relationships.
 */
export type SeedPatternDetail = SeedPattern & {
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
 * Seed Pattern Gear Cost
 *
 * Represents the seed pattern gear cost table data without joined relationships.
 */
export type SeedPatternGearCost = Tables<'seed_pattern_gear_cost'>

/**
 * Seed Pattern Gear Cost
 *
 * Represents seed pattern gear cost data with joined relationships.
 */
export type SeedPatternGearCostDetail = SeedPatternGearCost & {
  /** Cost Gear */
  cost_gear: GearDetail
}

/**
 * Seed Pattern Innovation Requirement
 *
 * Represents the seed pattern innovation requirement table data without joined relationships.
 */
export type SeedPatternInnovationRequirement =
  Tables<'seed_pattern_innovation_requirement'>

/**
 * Seed Pattern Innovation Requirement
 *
 * Represents seed pattern innovation requirement data with joined relationships.
 */
export type SeedPatternInnovationRequirementDetail =
  SeedPatternInnovationRequirement & {
    /** Innovation Details */
    innovation: InnovationDetail
  }

/**
 * Seed Pattern Resource Cost
 *
 * Represents the seed pattern resource cost table data without joined relationships.
 */
export type SeedPatternResourceCost = Tables<'seed_pattern_resource_cost'>

/**
 * Seed Pattern Resource Cost
 *
 * Represents seed pattern resource cost data with joined relationships.
 */
export type SeedPatternResourceCostDetail = SeedPatternResourceCost & {
  /** Cost Resource */
  resource: ResourceDetail
}

/**
 * Seed Pattern Resource Type Cost
 *
 * Represents the seed pattern resource type cost table data without joined relationships.
 */
export type SeedPatternResourceTypeCost =
  Tables<'seed_pattern_resource_type_cost'>

/**
 * Seed Pattern Resource Type Cost
 *
 * Represents seed pattern resource type cost data with joined relationships.
 */
export type SeedPatternResourceTypeCostDetail = SeedPatternResourceTypeCost & {}

/**
 * Settlement
 *
 * Represents the settlement table data without joined relationships.
 */
export type Settlement = Omit<Tables<'settlement'>, 'created_at' | 'updated_at'>

/**
 * Settlement
 *
 * Represents settlement data with joined relationships.
 */
export type SettlementDetail = Settlement & {
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
 * Settlement Collective Cognition Reward
 *
 * Represents the settlement collective cognition reward table data without joined relationships.
 */
export type SettlementCollectiveCognitionReward = Omit<
  Tables<'settlement_collective_cognition_reward'>,
  'created_at' | 'updated_at'
>

/**
 * Settlement Collective Cognition Reward
 *
 * Represents settlement collective cognition reward data with joined relationships.
 */
export type SettlementCollectiveCognitionRewardDetail =
  SettlementCollectiveCognitionReward & {
    /** Collective Cognition Reward Details */
    collective_cognition_reward: CollectiveCognitionRewardDetail
  }

/**
 * Settlement Gear
 *
 * Represents the settlement gear table data without joined relationships.
 */
export type SettlementGear = Omit<
  Tables<'settlement_gear'>,
  'created_at' | 'updated_at'
>

/**
 * Settlement Gear
 *
 * Represents settlement gear data with joined relationships.
 */
export type SettlementGearDetail = SettlementGear & {
  /** Gear Details */
  gear: GearDetail
}

/**
 * Settlement Innovation
 *
 * Represents the settlement innovation table data without joined relationships.
 */
export type SettlementInnovation = Omit<
  Tables<'settlement_innovation'>,
  'created_at' | 'updated_at'
>

/**
 * Settlement Innovation
 *
 * Represents settlement innovation data with joined relationships.
 */
export type SettlementInnovationDetail = SettlementInnovation & {
  /** Innovation Details */
  innovation: InnovationDetail
}

/**
 * Settlement Knowledge
 *
 * Represents the settlement knowledge table data without joined relationships.
 */
export type SettlementKnowledge = Omit<
  Tables<'settlement_knowledge'>,
  'created_at' | 'updated_at'
>

/**
 * Settlement Knowledge
 *
 * Represents settlement knowledge data with joined relationships.
 */
export type SettlementKnowledgeDetail = SettlementKnowledge & {
  /** Knowledge Details */
  knowledge: KnowledgeDetail
}

/**
 * Settlement Location
 *
 * Represents the settlement location table data without joined relationships.
 */
export type SettlementLocation = Omit<
  Tables<'settlement_location'>,
  'created_at' | 'updated_at'
>

/**
 * Settlement Location
 *
 * Represents settlement location data with joined relationships.
 */
export type SettlementLocationDetail = SettlementLocation & {
  /** Location Details */
  location: LocationDetail
}

/**
 * Settlement Milestone
 *
 * Represents the settlement milestone table data without joined relationships.
 */
export type SettlementMilestone = Omit<
  Tables<'settlement_milestone'>,
  'created_at' | 'updated_at'
>

/**
 * Settlement Milestone
 *
 * Represents settlement milestone data with joined relationships.
 */
export type SettlementMilestoneDetail = SettlementMilestone & {
  /** Milestone Details */
  milestone: MilestoneDetail
}

/**
 * Settlement Nemesis
 *
 * Represents the settlement nemesis table data without joined relationships.
 */
export type SettlementNemesis = Omit<
  Tables<'settlement_nemesis'>,
  'created_at' | 'updated_at'
>

/**
 * Settlement Nemesis
 *
 * Represents settlement nemesis data with joined relationships.
 */
export type SettlementNemesisDetail = SettlementNemesis & {
  /** Nemesis Details */
  nemesis: NemesisDetail
}

/**
 * Settlement Pattern
 *
 * Represents the settlement pattern table data without joined relationships.
 */
export type SettlementPattern = Omit<
  Tables<'settlement_pattern'>,
  'created_at' | 'updated_at'
>

/**
 * Settlement Pattern
 *
 * Represents settlement pattern data with joined relationships.
 */
export type SettlementPatternDetail = SettlementPattern & {
  /** Pattern Details */
  pattern: PatternDetail
}

/**
 * Settlement Phase
 *
 * Represents the settlement phase table data without joined relationships.
 */
export type SettlementPhase = Omit<
  Tables<'settlement_phase'>,
  'created_at' | 'updated_at'
>

/**
 * Settlement Phase
 *
 * Represents settlement phase data with joined relationships.
 */
export type SettlementPhaseDetail = SettlementPhase & {
  /** Returning Scout */
  returning_scout: SurvivorDetail
  /** Returning Survivors */
  returning_survivors: SettlementPhaseReturningSurvivorDetail[]
}

/**
 * Settlement Phase Returning Survivor
 *
 * Represents the settlement phase returning survivor table data without joined relationships.
 */
export type SettlementPhaseReturningSurvivor =
  Tables<'settlement_phase_returning_survivor'>

/**
 * Settlement Phase Returning Survivor
 *
 * Represents settlement phase returning survivor data with joined relationships.
 */
export type SettlementPhaseReturningSurvivorDetail =
  SettlementPhaseReturningSurvivor & {
    /** Returning Survivor */
    returning_survivor: SurvivorDetail
  }

/**
 * Settlement Philosophy
 *
 * Represents the settlement philosophy table data without joined relationships.
 */
export type SettlementPhilosophy = Omit<
  Tables<'settlement_philosophy'>,
  'created_at' | 'updated_at'
>

/**
 * Settlement Philosophy
 *
 * Represents settlement philosophy data with joined relationships.
 */
export type SettlementPhilosophyDetail = SettlementPhilosophy & {
  /** Philosophy Details */
  philosophy: PhilosophyDetail
}

/**
 * Settlement Principle
 *
 * Represents the settlement principle table data without joined relationships.
 */
export type SettlementPrinciple = Omit<
  Tables<'settlement_principle'>,
  'created_at' | 'updated_at'
>

/**
 * Settlement Principle
 *
 * Represents settlement principle data with joined relationships.
 */
export type SettlementPrincipleDetail = SettlementPrinciple & {
  /** Principle Details */
  principle: PrincipleDetail
}

/**
 * Settlement Quarry
 *
 * Represents the settlement quarry table data without joined relationships.
 */
export type SettlementQuarry = Omit<
  Tables<'settlement_quarry'>,
  'created_at' | 'updated_at'
>

/**
 * Settlement Quarry
 *
 * Represents settlement quarry data with joined relationships.
 */
export type SettlementQuarryDetail = SettlementQuarry & {
  /** Quarry Details */
  quarry: QuarryDetail
}

/**
 * Settlement Resource
 *
 * Represents the settlement resource table data without joined relationships.
 */
export type SettlementResource = Omit<
  Tables<'settlement_resource'>,
  'created_at' | 'updated_at'
>

/**
 * Settlement Resource
 *
 * Represents settlement resource data with joined relationships.
 */
export type SettlementResourceDetail = SettlementResource & {
  /** Resource Details */
  resource: ResourceDetail
}

/**
 * Settlement Seed Pattern
 *
 * Represents the settlement seed pattern table data without joined relationships.
 */
export type SettlementSeedPattern = Omit<
  Tables<'settlement_seed_pattern'>,
  'created_at' | 'updated_at'
>

/**
 * Settlement Seed Pattern
 *
 * Represents settlement seed pattern data with joined relationships.
 */
export type SettlementSeedPatternDetail = SettlementSeedPattern & {
  /** Seed Pattern Details */
  seed_pattern: SeedPatternDetail
}

/**
 * Settlement Shared User
 *
 * Represents the settlement shared user table data without joined relationships.
 */
export type SettlementSharedUser = Omit<
  Tables<'settlement_shared_user'>,
  'created_at'
>

/**
 * Settlement Shared User
 *
 * Represents settlement shared user data with joined relationships.
 */
export type SettlementSharedUserDetail = SettlementSharedUser & {}

/**
 * Settlement Timeline Year
 *
 * Represents the settlement timeline year table data without joined relationships.
 */
export type SettlementTimelineYear = Omit<
  Tables<'settlement_timeline_year'>,
  'created_at' | 'id' | 'updated_at'
>

/**
 * Settlement Timeline Year
 *
 * Represents settlement timeline year data with joined relationships.
 */
export type SettlementTimelineYearDetail = SettlementTimelineYear & {}

/**
 * Showdown
 *
 * Represents the showdown table data without joined relationships.
 */
export type Showdown = Omit<Tables<'showdown'>, 'created_at' | 'updated_at'>

/**
 * Showdown
 *
 * Represents showdown data with joined relationships.
 */
export type ShowdownDetail = Showdown & {
  /** Showdown Monsters */
  monsters: { [key: string]: ShowdownMonsterDetail }
  /** Showdown Survivors */
  survivors: { [key: string]: ShowdownSurvivorDetail }
}

/**
 * Showdown AIDeck
 *
 * Represents the showdown aideck table data without joined relationships.
 */
export type ShowdownAIDeck = Omit<
  Tables<'showdown_ai_deck'>,
  'created_at' | 'updated_at'
>

/**
 * Showdown AIDeck
 *
 * Represents showdown aideck data with joined relationships.
 */
export type ShowdownAIDeckDetail = ShowdownAIDeck & {}

/**
 * Showdown Monster
 *
 * Represents the showdown monster table data without joined relationships.
 */
export type ShowdownMonster = Omit<
  Tables<'showdown_monster'>,
  'created_at' | 'updated_at'
>

/**
 * Showdown Monster
 *
 * Represents showdown monster data with joined relationships.
 */
export type ShowdownMonsterDetail = ShowdownMonster & {
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
 * Showdown Monster Mood
 *
 * Represents the showdown monster mood table data without joined relationships.
 */
export type ShowdownMonsterMood = Omit<
  Tables<'showdown_monster_mood'>,
  'created_at' | 'updated_at'
>

/**
 * Showdown Monster Mood
 *
 * Represents showdown monster mood data with joined relationships.
 */
export type ShowdownMonsterMoodDetail = ShowdownMonsterMood & {
  /** Mood Details */
  mood: MoodDetail
}

/**
 * Showdown Monster Survivor Status
 *
 * Represents the showdown monster survivor status table data without joined relationships.
 */
export type ShowdownMonsterSurvivorStatus = Omit<
  Tables<'showdown_monster_survivor_status'>,
  'created_at' | 'updated_at'
>

/**
 * Showdown Monster Survivor Status
 *
 * Represents showdown monster survivor status data with joined relationships.
 */
export type ShowdownMonsterSurvivorStatusDetail =
  ShowdownMonsterSurvivorStatus & {
    /** Survivor Status Details */
    survivor_status: SurvivorStatusDetail
  }

/**
 * Showdown Monster Trait
 *
 * Represents the showdown monster trait table data without joined relationships.
 */
export type ShowdownMonsterTrait = Omit<
  Tables<'showdown_monster_trait'>,
  'created_at' | 'updated_at'
>

/**
 * Showdown Monster Trait
 *
 * Represents showdown monster trait data with joined relationships.
 */
export type ShowdownMonsterTraitDetail = ShowdownMonsterTrait & {
  /** Trait Details */
  trait: TraitDetail
}

/**
 * Showdown Survivor
 *
 * Represents the showdown survivor table data without joined relationships.
 */
export type ShowdownSurvivor = Omit<
  Tables<'showdown_survivor'>,
  'created_at' | 'updated_at'
>

/**
 * Showdown Survivor
 *
 * Represents showdown survivor data with joined relationships.
 */
export type ShowdownSurvivorDetail = ShowdownSurvivor & {
  /** Survivor Details */
  survivor: SurvivorDetail
}

/**
 * Strain Milestone
 *
 * Represents the strain milestone table data without joined relationships.
 */
export type StrainMilestone = Omit<
  Tables<'strain_milestone'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Strain Milestone
 *
 * Represents strain milestone data with joined relationships.
 */
export type StrainMilestoneDetail = StrainMilestone & {}

/**
 * Subscription Plan
 *
 * Represents the subscription plan table data without joined relationships.
 */
export type SubscriptionPlan = Tables<'subscription_plan'>

/**
 * Subscription Plan
 *
 * Represents subscription plan data with joined relationships.
 */
export type SubscriptionPlanDetail = SubscriptionPlan & {}

/**
 * Survivor
 *
 * Represents the survivor table data without joined relationships.
 */
export type Survivor = Tables<'survivor'>

/**
 * Survivor
 *
 * Represents survivor data with joined relationships.
 */
export type SurvivorDetail = Survivor & {
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
 * Survivor Ability Impairment
 *
 * Represents the survivor ability impairment table data without joined relationships.
 */
export type SurvivorAbilityImpairment = Omit<
  Tables<'survivor_ability_impairment'>,
  'created_at' | 'updated_at'
>

/**
 * Survivor Ability Impairment
 *
 * Represents survivor ability impairment data with joined relationships.
 */
export type SurvivorAbilityImpairmentDetail = SurvivorAbilityImpairment & {
  /** Ability/Impairment Details */
  ability_impairment: AbilityImpairmentDetail
}

/**
 * Survivor Cursed Gear
 *
 * Represents the survivor cursed gear table data without joined relationships.
 */
export type SurvivorCursedGear = Omit<
  Tables<'survivor_cursed_gear'>,
  'created_at' | 'updated_at'
>

/**
 * Survivor Cursed Gear
 *
 * Represents survivor cursed gear data with joined relationships.
 */
export type SurvivorCursedGearDetail = SurvivorCursedGear & {
  /** Cursed Gear Details */
  cursed_gear: GearDetail
}

/**
 * Survivor Disorder
 *
 * Represents the survivor disorder table data without joined relationships.
 */
export type SurvivorDisorder = Omit<
  Tables<'survivor_disorder'>,
  'created_at' | 'updated_at'
>

/**
 * Survivor Disorder
 *
 * Represents survivor disorder data with joined relationships.
 */
export type SurvivorDisorderDetail = SurvivorDisorder & {
  /** Disorder Details */
  disorder: DisorderDetail
}

/**
 * Survivor Fighting Art
 *
 * Represents the survivor fighting art table data without joined relationships.
 */
export type SurvivorFightingArt = Omit<
  Tables<'survivor_fighting_art'>,
  'created_at' | 'updated_at'
>

/**
 * Survivor Fighting Art
 *
 * Represents survivor fighting art data with joined relationships.
 */
export type SurvivorFightingArtDetail = SurvivorFightingArt & {
  /** Fighting Art Details */
  fighting_art: FightingArtDetail
}

/**
 * Survivor Secret Fighting Art
 *
 * Represents the survivor secret fighting art table data without joined relationships.
 */
export type SurvivorSecretFightingArt = Omit<
  Tables<'survivor_secret_fighting_art'>,
  'created_at' | 'updated_at'
>

/**
 * Survivor Secret Fighting Art
 *
 * Represents survivor secret fighting art data with joined relationships.
 */
export type SurvivorSecretFightingArtDetail = SurvivorSecretFightingArt & {
  /** Secret Fighting Art Details */
  secret_fighting_art: SecretFightingArtDetail
}

/**
 * Survivor Status
 *
 * Represents the survivor status table data without joined relationships.
 */
export type SurvivorStatus = Omit<
  Tables<'survivor_status'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Survivor Status
 *
 * Represents survivor status data with joined relationships.
 */
export type SurvivorStatusDetail = SurvivorStatus & {}

/**
 * Trait
 *
 * Represents the trait table data without joined relationships.
 */
export type Trait = Omit<
  Tables<'trait'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Trait
 *
 * Represents trait data with joined relationships.
 */
export type TraitDetail = Trait & {}

/**
 * User Settings
 *
 * Represents the user settings table data without joined relationships.
 */
export type UserSettings = Omit<
  Tables<'user_settings'>,
  'created_at' | 'updated_at'
>

/**
 * User Settings
 *
 * Represents user settings data with joined relationships.
 */
export type UserSettingsDetail = UserSettings & {}

/**
 * User Subscription
 *
 * Represents the user subscription table data without joined relationships.
 */
export type UserSubscription = Tables<'user_subscription'>

/**
 * User Subscription
 *
 * Represents user subscription data with joined relationships.
 */
export type UserSubscriptionDetail = UserSubscription & {
  /**
   * Whether The User May Create New Shares
   *
   * Mirrors the `user_can_share()` Postgres predicate consulted by RLS on
   * `settlement_shared_user.INSERT`.
   */
  can_share: boolean
}

/**
 * Vignette Encounter
 *
 * Represents the vignette encounter table data without joined relationships.
 */
export type VignetteEncounter = Omit<
  Tables<'vignette_encounter'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Encounter
 *
 * Represents vignette encounter data with joined relationships.
 */
export type VignetteEncounterDetail = VignetteEncounter & {
  /** Vignette Encounter Monsters */
  monsters: { [key: string]: VignetteEncounterMonsterDetail }
  /** Vignette Encounter Survivors */
  survivors: { [key: string]: VignetteEncounterSurvivorDetail }
}

/**
 * Vignette Encounter AIDeck
 *
 * Represents the vignette encounter aideck table data without joined relationships.
 */
export type VignetteEncounterAIDeck = Omit<
  Tables<'vignette_encounter_ai_deck'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Encounter AIDeck
 *
 * Represents vignette encounter aideck data with joined relationships.
 */
export type VignetteEncounterAIDeckDetail = VignetteEncounterAIDeck & {}

/**
 * Vignette Encounter Monster
 *
 * Represents the vignette encounter monster table data without joined relationships.
 */
export type VignetteEncounterMonster = Omit<
  Tables<'vignette_encounter_monster'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Encounter Monster
 *
 * Represents vignette encounter monster data with joined relationships.
 */
export type VignetteEncounterMonsterDetail = VignetteEncounterMonster & {
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
 * Vignette Encounter Monster Mood
 *
 * Represents the vignette encounter monster mood table data without joined relationships.
 */
export type VignetteEncounterMonsterMood = Omit<
  Tables<'vignette_encounter_monster_mood'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Encounter Monster Mood
 *
 * Represents vignette encounter monster mood data with joined relationships.
 */
export type VignetteEncounterMonsterMoodDetail =
  VignetteEncounterMonsterMood & {
    /** Mood */
    mood: MoodDetail
  }

/**
 * Vignette Encounter Monster Survivor Status
 *
 * Represents the vignette encounter monster survivor status table data without joined relationships.
 */
export type VignetteEncounterMonsterSurvivorStatus = Omit<
  Tables<'vignette_encounter_monster_survivor_status'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Encounter Monster Survivor Status
 *
 * Represents vignette encounter monster survivor status data with joined relationships.
 */
export type VignetteEncounterMonsterSurvivorStatusDetail =
  VignetteEncounterMonsterSurvivorStatus & {
    /** Survivor Status */
    survivor_status: SurvivorStatusDetail
  }

/**
 * Vignette Encounter Monster Trait
 *
 * Represents the vignette encounter monster trait table data without joined relationships.
 */
export type VignetteEncounterMonsterTrait = Omit<
  Tables<'vignette_encounter_monster_trait'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Encounter Monster Trait
 *
 * Represents vignette encounter monster trait data with joined relationships.
 */
export type VignetteEncounterMonsterTraitDetail =
  VignetteEncounterMonsterTrait & {
    /** Trait */
    trait: TraitDetail
  }

/**
 * Vignette Encounter Shared User
 *
 * Represents the vignette encounter shared user table data without joined relationships.
 */
export type VignetteEncounterSharedUser = Omit<
  Tables<'vignette_encounter_shared_user'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Encounter Shared User
 *
 * Represents vignette encounter shared user data with joined relationships.
 */
export type VignetteEncounterSharedUserDetail = VignetteEncounterSharedUser & {}

/**
 * Vignette Encounter Survivor
 *
 * Represents the vignette encounter survivor table data without joined relationships.
 */
export type VignetteEncounterSurvivor = Omit<
  Tables<'vignette_encounter_survivor'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Encounter Survivor
 *
 * Represents vignette encounter survivor data with joined relationships.
 */
export type VignetteEncounterSurvivorDetail = VignetteEncounterSurvivor & {
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
 * Vignette Encounter Survivor Ability Impairment
 *
 * Represents the vignette encounter survivor ability impairment table data without joined relationships.
 */
export type VignetteEncounterSurvivorAbilityImpairment = Omit<
  Tables<'vignette_encounter_survivor_ability_impairment'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Encounter Survivor Ability Impairment
 *
 * Represents vignette encounter survivor ability impairment data with joined relationships.
 */
export type VignetteEncounterSurvivorAbilityImpairmentDetail =
  VignetteEncounterSurvivorAbilityImpairment & {
    /** Ability or Impairment */
    ability_impairment: AbilityImpairmentDetail
  }

/**
 * Vignette Encounter Survivor Disorder
 *
 * Represents the vignette encounter survivor disorder table data without joined relationships.
 */
export type VignetteEncounterSurvivorDisorder = Omit<
  Tables<'vignette_encounter_survivor_disorder'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Encounter Survivor Disorder
 *
 * Represents vignette encounter survivor disorder data with joined relationships.
 */
export type VignetteEncounterSurvivorDisorderDetail =
  VignetteEncounterSurvivorDisorder & {
    /** Disorder */
    disorder: DisorderDetail
  }

/**
 * Vignette Encounter Survivor Fighting Art
 *
 * Represents the vignette encounter survivor fighting art table data without joined relationships.
 */
export type VignetteEncounterSurvivorFightingArt = Omit<
  Tables<'vignette_encounter_survivor_fighting_art'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Encounter Survivor Fighting Art
 *
 * Represents vignette encounter survivor fighting art data with joined relationships.
 */
export type VignetteEncounterSurvivorFightingArtDetail =
  VignetteEncounterSurvivorFightingArt & {
    /** Fighting Art */
    fighting_art: FightingArtDetail
  }

/**
 * Vignette Encounter Survivor Gear Grid
 *
 * Represents the vignette encounter survivor gear grid table data without joined relationships.
 */
export type VignetteEncounterSurvivorGearGrid = Omit<
  Tables<'vignette_encounter_survivor_gear_grid'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Encounter Survivor Gear Grid
 *
 * Represents vignette encounter survivor gear grid data with joined relationships.
 */
export type VignetteEncounterSurvivorGearGridDetail =
  VignetteEncounterSurvivorGearGrid & {}

/**
 * Vignette Encounter Survivor Secret Fighting Art
 *
 * Represents the vignette encounter survivor secret fighting art table data without joined relationships.
 */
export type VignetteEncounterSurvivorSecretFightingArt = Omit<
  Tables<'vignette_encounter_survivor_secret_fighting_art'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Encounter Survivor Secret Fighting Art
 *
 * Represents vignette encounter survivor secret fighting art data with joined relationships.
 */
export type VignetteEncounterSurvivorSecretFightingArtDetail =
  VignetteEncounterSurvivorSecretFightingArt & {
    /** Secret Fighting Art */
    secret_fighting_art: SecretFightingArtDetail
  }

/**
 * Vignette Monster
 *
 * Represents the vignette monster table data without joined relationships.
 */
export type VignetteMonster = Omit<
  Tables<'vignette_monster'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Monster
 *
 * Represents vignette monster data with joined relationships.
 */
export type VignetteMonsterDetail = VignetteMonster & {
  /** Source Nemesis */
  source_nemesis: NemesisDetail | null
  /** Source Quarry */
  source_quarry: QuarryDetail | null
  /** Levels */
  levels: VignetteMonsterLevelDetail[]
}

/**
 * Vignette Monster Summary
 *
 * Lightweight catalog monster summary used by vignette selection screens.
 */
export type VignetteMonsterSummary = Pick<
  VignetteMonster,
  'id' | 'monster_name' | 'multi_monster' | 'source_monster_type'
> & {
  /** Level Summaries */
  levels: Pick<VignetteMonsterLevel, 'id' | 'level_number'>[]
}

/**
 * Vignette Encounter Summary
 *
 * Lightweight active vignette encounter row used by encounter lists.
 */
export type VignetteEncounterSummary = Pick<
  VignetteEncounter,
  'id' | 'level_number' | 'turn' | 'vignette_monster_id'
> & {
  /** Monster Name */
  monster_name: string
  /** Owner Avatar URL */
  owner_avatar_url: string | null
  /** Owner User ID */
  owner_user_id: string | null
  /** Owner Username */
  owner_username: string | null
  /** Caller's Role on This Vignette Encounter */
  role: SettlementRole
}

/**
 * Vignette Encounter Summary Detail
 *
 * Lightweight active vignette encounter row with its monster name relation.
 */
export type VignetteEncounterSummaryDetail = Pick<
  VignetteEncounter,
  'id' | 'level_number' | 'notes' | 'turn' | 'user_id' | 'vignette_monster_id'
> & {
  /** Vignette Monster */
  vignette_monster: Pick<VignetteMonster, 'monster_name'> | null
}

/**
 * Vignette Monster Level
 *
 * Represents the vignette monster level table data without joined relationships.
 */
export type VignetteMonsterLevel = Omit<
  Tables<'vignette_monster_level'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Monster Level
 *
 * Represents vignette monster level data with joined relationships.
 */
export type VignetteMonsterLevelDetail = VignetteMonsterLevel & {
  /** Moods */
  moods: VignetteMonsterLevelMoodDetail[]
  /** Survivor Statuses */
  survivor_statuses: VignetteMonsterLevelSurvivorStatusDetail[]
  /** Traits */
  traits: VignetteMonsterLevelTraitDetail[]
}

/**
 * Vignette Monster Level Mood
 *
 * Represents the vignette monster level mood table data without joined relationships.
 */
export type VignetteMonsterLevelMood = Omit<
  Tables<'vignette_monster_level_mood'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Monster Level Mood
 *
 * Represents vignette monster level mood data with joined relationships.
 */
export type VignetteMonsterLevelMoodDetail = VignetteMonsterLevelMood & {
  /** Mood */
  mood: MoodDetail
}

/**
 * Vignette Monster Level Survivor Status
 *
 * Represents the vignette monster level survivor status table data without joined relationships.
 */
export type VignetteMonsterLevelSurvivorStatus = Omit<
  Tables<'vignette_monster_level_survivor_status'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Monster Level Survivor Status
 *
 * Represents vignette monster level survivor status data with joined relationships.
 */
export type VignetteMonsterLevelSurvivorStatusDetail =
  VignetteMonsterLevelSurvivorStatus & {
    /** Survivor Status */
    survivor_status: SurvivorStatusDetail
  }

/**
 * Vignette Monster Level Trait
 *
 * Represents the vignette monster level trait table data without joined relationships.
 */
export type VignetteMonsterLevelTrait = Omit<
  Tables<'vignette_monster_level_trait'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Monster Level Trait
 *
 * Represents vignette monster level trait data with joined relationships.
 */
export type VignetteMonsterLevelTraitDetail = VignetteMonsterLevelTrait & {
  /** Trait */
  trait: TraitDetail
}

/**
 * Vignette Survivor
 *
 * Represents the vignette survivor table data without joined relationships.
 */
export type VignetteSurvivor = Omit<
  Tables<'vignette_survivor'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Survivor
 *
 * Represents vignette survivor data with joined relationships.
 */
export type VignetteSurvivorDetail = VignetteSurvivor & {
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
 * Vignette Survivor Disorder
 *
 * Represents the vignette survivor disorder table data without joined relationships.
 */
export type VignetteSurvivorDisorder = Omit<
  Tables<'vignette_survivor_disorder'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Survivor Disorder
 *
 * Represents vignette survivor disorder data with joined relationships.
 */
export type VignetteSurvivorDisorderDetail = VignetteSurvivorDisorder & {
  /** Disorder */
  disorder: DisorderDetail
}

/**
 * Vignette Survivor Ability Impairment
 *
 * Represents the vignette survivor ability impairment table data without joined relationships.
 */
export type VignetteSurvivorAbilityImpairment = Omit<
  Tables<'vignette_survivor_ability_impairment'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Survivor Ability Impairment
 *
 * Represents vignette survivor ability impairment data with joined relationships.
 */
export type VignetteSurvivorAbilityImpairmentDetail =
  VignetteSurvivorAbilityImpairment & {
    /** Ability or Impairment */
    ability_impairment: AbilityImpairmentDetail
  }

/**
 * Vignette Survivor Fighting Art
 *
 * Represents the vignette survivor fighting art table data without joined relationships.
 */
export type VignetteSurvivorFightingArt = Omit<
  Tables<'vignette_survivor_fighting_art'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Survivor Fighting Art
 *
 * Represents vignette survivor fighting art data with joined relationships.
 */
export type VignetteSurvivorFightingArtDetail = VignetteSurvivorFightingArt & {
  /** Fighting Art */
  fighting_art: FightingArtDetail
}

/**
 * Vignette Survivor Gear Grid
 *
 * Represents the vignette survivor gear grid table data without joined relationships.
 */
export type VignetteSurvivorGearGrid = Omit<
  Tables<'vignette_survivor_gear_grid'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Survivor Gear Grid
 *
 * Represents vignette survivor gear grid data with joined relationships.
 */
export type VignetteSurvivorGearGridDetail = VignetteSurvivorGearGrid & {}

/**
 * Vignette Survivor Secret Fighting Art
 *
 * Represents the vignette survivor secret fighting art table data without joined relationships.
 */
export type VignetteSurvivorSecretFightingArt = Omit<
  Tables<'vignette_survivor_secret_fighting_art'>,
  'created_at' | 'updated_at'
>

/**
 * Vignette Survivor Secret Fighting Art
 *
 * Represents vignette survivor secret fighting art data with joined relationships.
 */
export type VignetteSurvivorSecretFightingArtDetail =
  VignetteSurvivorSecretFightingArt & {
    /** Secret Fighting Art */
    secret_fighting_art: SecretFightingArtDetail
  }

/**
 * Wanderer
 *
 * Represents the wanderer table data without joined relationships.
 */
export type Wanderer = Omit<
  Tables<'wanderer'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Wanderer
 *
 * Represents wanderer data with joined relationships.
 */
export type WandererDetail = Wanderer & {
  /** Abilities and Impairments */
  abilities_impairments: WandererAbilityImpairmentDetail[]
  /** Fighting Arts */
  fighting_arts: WandererFightingArtDetail[]
  /** Rare Gear */
  rare_gear: WandererRareGearDetail[]
  /** Timeline Years */
  timeline_years: WandererTimelineYearDetail[]
}

/**
 * Wanderer Ability Impairment
 *
 * Represents the wanderer ability impairment table data without joined relationships.
 */
export type WandererAbilityImpairment = Omit<
  Tables<'wanderer_ability_impairment'>,
  'created_at' | 'updated_at'
>

/**
 * Wanderer Ability Impairment
 *
 * Represents wanderer ability impairment data with joined relationships.
 */
export type WandererAbilityImpairmentDetail = WandererAbilityImpairment & {
  /** Ability or Impairment */
  ability_impairment: AbilityImpairmentDetail
}

/**
 * Wanderer Fighting Art
 *
 * Represents the wanderer fighting art table data without joined relationships.
 */
export type WandererFightingArt = Omit<
  Tables<'wanderer_fighting_art'>,
  'created_at' | 'updated_at'
>

/**
 * Wanderer Fighting Art
 *
 * Represents wanderer fighting art data with joined relationships.
 */
export type WandererFightingArtDetail = WandererFightingArt & {
  /** Fighting Art */
  fighting_art: FightingArtDetail
}

/**
 * Wanderer Rare Gear
 *
 * Represents the wanderer rare gear table data without joined relationships.
 */
export type WandererRareGear = Omit<
  Tables<'wanderer_rare_gear'>,
  'created_at' | 'updated_at'
>

/**
 * Wanderer Rare Gear
 *
 * Represents wanderer rare gear data with joined relationships.
 */
export type WandererRareGearDetail = WandererRareGear & {
  /** Rare Gear */
  gear: GearDetail
}

/**
 * Wanderer Timeline Year
 *
 * Represents the wanderer timeline year table data without joined relationships.
 */
export type WandererTimelineYear = Omit<
  Tables<'wanderer_timeline_year'>,
  'created_at' | 'updated_at'
>

/**
 * Wanderer Timeline Year
 *
 * Represents wanderer timeline year data with joined relationships.
 */
export type WandererTimelineYearDetail = WandererTimelineYear & {}

/**
 * Weapon Type
 *
 * Represents the weapon type table data without joined relationships.
 */
export type WeaponType = Omit<
  Tables<'weapon_type'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Weapon Type
 *
 * Represents weapon type data with joined relationships.
 */
export type WeaponTypeDetail = WeaponType & {}

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
