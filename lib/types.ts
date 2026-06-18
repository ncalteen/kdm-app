import { Database, Json, Tables } from '@/lib/database.types'
import { DatabaseCampaignType, HuntEventType } from '@/lib/enums'

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
 * Ability/Impairment Detail
 *
 * Used throughout the app to represent an abilitiy/impairment object. Includes
 * additional information not present in the ability_impairment table.
 */
export type AbilityImpairmentDetail = Omit<
  Tables<'ability_impairment'>,
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
>

/**
 * Disorder Detail
 *
 * Used throughout the app to represent a disorder.
 */
export type DisorderDetail = Omit<
  Tables<'disorder'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Fighting Art Detail
 *
 * Used throughout the app to represent a fighting art.
 */
export type FightingArtDetail = Omit<
  Tables<'fighting_art'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

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
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
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
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
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
 * Encounter Detail
 *
 * Used throughout the app to represent the currently selected encounter.
 */
export type EncounterDetail = Omit<
  Tables<'encounter'>,
  'created_at' | 'updated_at'
> & {
  /** Encounter Monsters */
  encounter_monsters: { [key: string]: EncounterActiveMonsterDetail } | null
  /** Encounter Survivors */
  encounter_survivors: { [key: string]: EncounterSurvivorDetail } | null
}

/**
 * Encounter Monster Detail
 *
 * Used throughout the app to represent a catalog encounter monster and its
 * level data.
 */
export type EncounterMonsterDetail = Omit<
  Tables<'encounter_monster'>,
  'created_at' | 'updated_at'
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
  /** Traits */
  traits: TraitDetail[]
  /** Moods */
  moods: MoodDetail[]
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
  /** Traits */
  traits: (TraitDetail & {
    author_user_id: string | null
    author_username: string | null
    author_avatar_url: string | null
  })[]
  /** Moods */
  moods: (MoodDetail & {
    author_user_id: string | null
    author_username: string | null
    author_avatar_url: string | null
  })[]
  /** Survivor Statuses */
  survivor_statuses: (SurvivorStatusDetail & {
    author_user_id: string | null
    author_username: string | null
    author_avatar_url: string | null
  })[]
}

/**
 * Encounter Survivor Detail
 *
 * Used throughout the app to represent a survivor in an active encounter.
 */
export type EncounterSurvivorDetail = Omit<
  Tables<'encounter_survivor'>,
  'created_at' | 'updated_at'
>

/** Vignette Encounter Role */
export type VignetteEncounterRole = 'owner' | 'collaborator'

/** Catalog Authorship Detail */
export type CatalogAuthorshipDetail = {
  /** Author User ID (null for built-ins / non-custom rows) */
  author_user_id: string | null
  /** Author Username (null for built-ins / ghost authors) */
  author_username: string | null
  /** Author Avatar URL (null for built-ins / ghost / no avatar) */
  author_avatar_url: string | null
}

/** Vignette Catalog Mood Detail */
export type VignetteMonsterLevelMoodDetail = Omit<
  Tables<'vignette_monster_level_mood'>,
  'created_at' | 'updated_at'
> & {
  /** Mood */
  mood: MoodDetail & CatalogAuthorshipDetail
}

/** Vignette Catalog Trait Detail */
export type VignetteMonsterLevelTraitDetail = Omit<
  Tables<'vignette_monster_level_trait'>,
  'created_at' | 'updated_at'
> & {
  /** Trait */
  trait: TraitDetail & CatalogAuthorshipDetail
}

/** Vignette Catalog Survivor Status Detail */
export type VignetteMonsterLevelSurvivorStatusDetail = Omit<
  Tables<'vignette_monster_level_survivor_status'>,
  'created_at' | 'updated_at'
> & {
  /** Survivor Status */
  survivor_status: SurvivorStatusDetail & CatalogAuthorshipDetail
}

/** Vignette Monster Level Detail */
export type VignetteMonsterLevelDetail = Omit<
  Tables<'vignette_monster_level'>,
  'created_at' | 'updated_at'
> & {
  /** Moods */
  moods: VignetteMonsterLevelMoodDetail[]
  /** Traits */
  traits: VignetteMonsterLevelTraitDetail[]
  /** Survivor Statuses */
  survivor_statuses: VignetteMonsterLevelSurvivorStatusDetail[]
}

/** Vignette Survivor Ability / Impairment Detail */
export type VignetteSurvivorAbilityImpairmentDetail = Omit<
  Tables<'vignette_survivor_ability_impairment'>,
  'created_at' | 'updated_at'
> & {
  /** Ability or Impairment */
  ability_impairment: AbilityImpairmentDetail & CatalogAuthorshipDetail
}

/** Vignette Survivor Disorder Detail */
export type VignetteSurvivorDisorderDetail = Omit<
  Tables<'vignette_survivor_disorder'>,
  'created_at' | 'updated_at'
> & {
  /** Disorder */
  disorder: DisorderDetail & CatalogAuthorshipDetail
}

/** Vignette Survivor Fighting Art Detail */
export type VignetteSurvivorFightingArtDetail = Omit<
  Tables<'vignette_survivor_fighting_art'>,
  'created_at' | 'updated_at'
> & {
  /** Fighting Art */
  fighting_art: FightingArtDetail & CatalogAuthorshipDetail
}

/** Vignette Survivor Secret Fighting Art Detail */
export type VignetteSurvivorSecretFightingArtDetail = Omit<
  Tables<'vignette_survivor_secret_fighting_art'>,
  'created_at' | 'updated_at'
> & {
  /** Secret Fighting Art */
  secret_fighting_art: SecretFightingArtDetail & CatalogAuthorshipDetail
}

/** Vignette Survivor Gear Grid Detail */
export type VignetteSurvivorGearGridDetail = Omit<
  Tables<'vignette_survivor_gear_grid'>,
  'created_at' | 'updated_at'
> & {
  /** Gear */
  gear: GearDetail & CatalogAuthorshipDetail
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
  /** Secret Fighting Arts */
  secret_fighting_arts: VignetteSurvivorSecretFightingArtDetail[]
  /** Gear Grid */
  gear_grid: VignetteSurvivorGearGridDetail[]
}

/** Vignette Monster Detail */
export type VignetteMonsterDetail = Omit<
  Tables<'vignette_monster'>,
  'created_at' | 'updated_at'
> & {
  /** Levels */
  levels: VignetteMonsterLevelDetail[]
  /** Survivor Presets */
  survivors: VignetteSurvivorDetail[]
}

/** Vignette Encounter AI Deck Detail */
export type VignetteEncounterAIDeckDetail = Omit<
  Tables<'vignette_encounter_ai_deck'>,
  'created_at' | 'updated_at'
>

/** Vignette Encounter Monster Mood Detail */
export type VignetteEncounterMonsterMoodDetail = Omit<
  Tables<'vignette_encounter_monster_mood'>,
  'created_at' | 'updated_at'
> & {
  /** Mood */
  mood: MoodDetail & CatalogAuthorshipDetail
}

/** Vignette Encounter Monster Trait Detail */
export type VignetteEncounterMonsterTraitDetail = Omit<
  Tables<'vignette_encounter_monster_trait'>,
  'created_at' | 'updated_at'
> & {
  /** Trait */
  trait: TraitDetail & CatalogAuthorshipDetail
}

/** Vignette Encounter Monster Survivor Status Detail */
export type VignetteEncounterMonsterSurvivorStatusDetail = Omit<
  Tables<'vignette_encounter_monster_survivor_status'>,
  'created_at' | 'updated_at'
> & {
  /** Survivor Status */
  survivor_status: SurvivorStatusDetail & CatalogAuthorshipDetail
}

/** Vignette Encounter Monster Detail */
export type VignetteEncounterMonsterDetail = Omit<
  Tables<'vignette_encounter_monster'>,
  'created_at' | 'updated_at'
> & {
  /** AI Deck */
  ai_deck: VignetteEncounterAIDeckDetail
  /** Moods */
  moods: VignetteEncounterMonsterMoodDetail[]
  /** Traits */
  traits: VignetteEncounterMonsterTraitDetail[]
  /** Survivor Statuses */
  survivor_statuses: VignetteEncounterMonsterSurvivorStatusDetail[]
}

/** Vignette Encounter Survivor Live State Key */
export type VignetteEncounterSurvivorLiveStateKey =
  | 'accuracy_tokens'
  | 'activation_used'
  | 'arm_heavy_damage'
  | 'arm_light_damage'
  | 'bleeding_tokens'
  | 'block_tokens'
  | 'body_heavy_damage'
  | 'body_light_damage'
  | 'brain_light_damage'
  | 'dead'
  | 'deflect_tokens'
  | 'evasion_tokens'
  | 'head_heavy_damage'
  | 'insanity_tokens'
  | 'knocked_down'
  | 'leg_heavy_damage'
  | 'leg_light_damage'
  | 'luck_tokens'
  | 'movement_tokens'
  | 'movement_used'
  | 'priority_target'
  | 'retired'
  | 'scout'
  | 'speed_tokens'
  | 'strength_tokens'
  | 'survival_tokens'
  | 'waist_heavy_damage'
  | 'waist_light_damage'

/** Vignette Encounter Survivor Live State */
export type VignetteEncounterSurvivorLiveState = Pick<
  Tables<'vignette_encounter_survivor'>,
  VignetteEncounterSurvivorLiveStateKey
>

/** Vignette Encounter Survivor Ability / Impairment Detail */
export type VignetteEncounterSurvivorAbilityImpairmentDetail = Omit<
  Tables<'vignette_encounter_survivor_ability_impairment'>,
  'created_at' | 'updated_at'
> & {
  /** Ability or Impairment */
  ability_impairment: AbilityImpairmentDetail & CatalogAuthorshipDetail
}

/** Vignette Encounter Survivor Disorder Detail */
export type VignetteEncounterSurvivorDisorderDetail = Omit<
  Tables<'vignette_encounter_survivor_disorder'>,
  'created_at' | 'updated_at'
> & {
  /** Disorder */
  disorder: DisorderDetail & CatalogAuthorshipDetail
}

/** Vignette Encounter Survivor Fighting Art Detail */
export type VignetteEncounterSurvivorFightingArtDetail = Omit<
  Tables<'vignette_encounter_survivor_fighting_art'>,
  'created_at' | 'updated_at'
> & {
  /** Fighting Art */
  fighting_art: FightingArtDetail & CatalogAuthorshipDetail
}

/** Vignette Encounter Survivor Secret Fighting Art Detail */
export type VignetteEncounterSurvivorSecretFightingArtDetail = Omit<
  Tables<'vignette_encounter_survivor_secret_fighting_art'>,
  'created_at' | 'updated_at'
> & {
  /** Secret Fighting Art */
  secret_fighting_art: SecretFightingArtDetail & CatalogAuthorshipDetail
}

/** Vignette Encounter Survivor Gear Grid Detail */
export type VignetteEncounterSurvivorGearGridDetail = Omit<
  Tables<'vignette_encounter_survivor_gear_grid'>,
  'created_at' | 'updated_at'
> & {
  /** Gear */
  gear: GearDetail & CatalogAuthorshipDetail
}

/** Vignette Encounter Survivor Detail */
export type VignetteEncounterSurvivorDetail = Omit<
  Tables<'vignette_encounter_survivor'>,
  'created_at' | 'updated_at' | VignetteEncounterSurvivorLiveStateKey
> & {
  /** Live Survivor State */
  live_state: VignetteEncounterSurvivorLiveState
  /** Abilities and Impairments */
  abilities_impairments: VignetteEncounterSurvivorAbilityImpairmentDetail[]
  /** Disorders */
  disorders: VignetteEncounterSurvivorDisorderDetail[]
  /** Fighting Arts */
  fighting_arts: VignetteEncounterSurvivorFightingArtDetail[]
  /** Secret Fighting Arts */
  secret_fighting_arts: VignetteEncounterSurvivorSecretFightingArtDetail[]
  /** Gear Grid */
  gear_grid: VignetteEncounterSurvivorGearGridDetail[]
}

/** Vignette Encounter Shared User Detail */
export type VignetteEncounterSharedUserDetail = Omit<
  Tables<'vignette_encounter_shared_user'>,
  'created_at' | 'updated_at'
> & {
  /** Shared Username */
  username: string
  /** Shared User Avatar URL */
  avatar_url: string | null
}

/** Vignette Encounter Detail */
export type VignetteEncounterDetail = Omit<
  Tables<'vignette_encounter'>,
  'created_at' | 'updated_at'
> & {
  /** Caller's Role on This Vignette */
  role: VignetteEncounterRole
  /** Catalog Monster */
  vignette_monster: VignetteMonsterDetail
  /** Active AI Decks */
  ai_decks: { [key: string]: VignetteEncounterAIDeckDetail }
  /** Active Monsters */
  monsters: { [key: string]: VignetteEncounterMonsterDetail }
  /** Active Survivors */
  survivors: { [key: string]: VignetteEncounterSurvivorDetail }
  /** Shared Users */
  shared_users: VignetteEncounterSharedUserDetail[]
}

/** Vignette Encounter Summary */
export interface VignetteEncounterSummary {
  /** Vignette Encounter ID */
  id: string
  /** Vignette Monster ID */
  vignette_monster_id: string
  /** Vignette Monster Name */
  monster_name: string
  /** Level Number */
  level_number: number
  /** Turn */
  turn: Database['public']['Enums']['showdown_turn']
  /** Owner User ID */
  owner_user_id: string
  /** Owner Username */
  owner_username: string | null
  /** Owner Avatar URL */
  owner_avatar_url: string | null
  /** Caller's Role on This Vignette */
  role: VignetteEncounterRole
}

/** Selected Vignette Encounter */
export interface SelectedVignetteEncounter {
  /** Vignette Encounter ID */
  vignette_encounter_id: string
  /** Caller's Role on This Vignette */
  role: VignetteEncounterRole
}

/**
 * Vignette Encounter State Setter
 *
 * Accepts either a direct value or a functional updater. Use the functional
 * form inside async `.then` / `.catch` callbacks so the update always operates
 * on the latest state instead of a stale closure capture.
 */
export type VignetteEncounterStateSetter = (
  vignetteOrUpdater:
    | VignetteEncounterDetail
    | null
    | ((prev: VignetteEncounterDetail | null) => VignetteEncounterDetail | null)
) => void

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
  /**
   * Traits (joined from hunt_monster_trait → trait).
   *
   * Each entry carries `author_username` — `null` for built-in (non-custom)
   * traits, and the catalog author's username for custom traits so the UI can
   * render the "By @username" chip (E2.8; see
   * `docs/settlement-sharing-architecture.md` §7.4 / §10 Phase 2 item 2.6).
   */
  traits: (TraitDetail & {
    author_user_id: string | null
    author_username: string | null
    author_avatar_url: string | null
  })[]
  /**
   * Moods (joined from hunt_monster_mood → mood).
   *
   * Each entry carries `author_username`; see `traits` above.
   */
  moods: (MoodDetail & {
    author_user_id: string | null
    author_username: string | null
    author_avatar_url: string | null
  })[]
  /**
   * Survivor statuses (joined from hunt_monster_survivor_status →
   * survivor_status).
   *
   * Each entry carries `author_username`; see `traits` above.
   */
  survivor_statuses: (SurvivorStatusDetail & {
    author_user_id: string | null
    author_username: string | null
    author_avatar_url: string | null
  })[]
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
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Knowledge Detail
 *
 * Used throughout the app to represent a knowledge.
 */
export type KnowledgeDetail = Omit<
  Tables<'knowledge'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Location Detail
 *
 * Used throughout the app to represent a location.
 */
export type LocationDetail = Omit<
  Tables<'location'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Milestone Detail
 *
 * Used throughout the app to represent a milestone.
 */
export type MilestoneDetail = Omit<
  Tables<'milestone'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
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
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
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
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
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
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
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
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
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
 * Plan Slug
 *
 * Mirrors the seeded `subscription_plan.plan_id` values used by both the
 * server-side checkout / portal routes and the `user_subscription` row.
 * Each slug maps to a Stripe Price and a presentation block below.
 */
export type PlanSlug = 'free' | 'lantern' | 'lantern_hoard'

/**
 * Principle Detail
 *
 * Used throughout the app to represent a principle.
 */
export type PrincipleDetail = Omit<
  Tables<'principle'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Quarry Detail
 *
 * Used throughout the app to represent a quarry.
 */
export type QuarryDetail = Omit<
  Tables<'quarry'>,
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
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
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
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
    /** Whether the underlying reward is user-defined */
    custom: boolean
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
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
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
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
    consequences: string | null
    /** Innovation Benefits */
    benefits: string | null
    /** Whether the underlying innovation is user-defined */
    custom: boolean
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
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
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
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
    /** Whether the underlying location is user-defined */
    custom: boolean
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
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
    /** Whether the underlying milestone is user-defined */
    custom: boolean
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
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
    /** Whether the underlying nemesis is user-defined */
    custom: boolean
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
  }[]
  /** Patterns */
  patterns: {
    /** Settlement Pattern ID */
    id: string
    /** Pattern ID */
    pattern_id: string
    /** Pattern Name */
    pattern_name: string
    /** Whether the underlying pattern is user-defined */
    custom: boolean
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
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
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
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
    /** Whether the underlying principle is user-defined */
    custom: boolean
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
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
    /** Whether the underlying quarry is user-defined */
    custom: boolean
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
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
    /** Whether the underlying resource is user-defined */
    custom: boolean
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
  }[]
  /** Seed Patterns */
  seed_patterns: {
    /** Settlement Seed Pattern ID */
    id: string
    /** Seed Pattern ID */
    seed_pattern_id: string
    /** Seed Pattern Name */
    seed_pattern_name: string
    /** Whether the underlying seed pattern is user-defined */
    custom: boolean
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
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
  /**
   * Traits (joined from showdown_monster_trait → trait).
   *
   * Each entry carries `author_username` — `null` for built-in (non-custom)
   * traits, and the catalog author's username for custom traits so the UI can
   * render the "By @username" chip (E2.8; see `docs/settlement-sharing-architecture.md`
   * §7.4 / §10 Phase 2 item 2.6).
   */
  traits: (TraitDetail & {
    author_user_id: string | null
    author_username: string | null
    author_avatar_url: string | null
  })[]
  /**
   * Moods (joined from showdown_monster_mood → mood).
   *
   * Each entry carries `author_username`; see `traits` above.
   */
  moods: (MoodDetail & {
    author_user_id: string | null
    author_username: string | null
    author_avatar_url: string | null
  })[]
  /**
   * Survivor statuses (joined from showdown_monster_survivor_status →
   * survivor_status).
   *
   * Each entry carries `author_username`; see `traits` above.
   */
  survivor_statuses: (SurvivorStatusDetail & {
    author_user_id: string | null
    author_username: string | null
    author_avatar_url: string | null
  })[]
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
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Survivor Detail
 *
 * Used throughout the app to represent the currently selected survivor.
 * Includes additional information not present in the survivor table.
 */
export type SurvivorDetail = Tables<'survivor'> & {
  /**
   * Abilities and Impairments.
   *
   * Each entry carries `author_username` — `null` for built-in (non-custom)
   * rows, and the catalog author's username for custom rows so the UI can
   * render the "By @username" chip (E2.8; see
   * `docs/settlement-sharing-architecture.md` §7.4 / §10 Phase 2 item 2.6).
   */
  abilities_impairments: {
    /** Ability or Impairment Name */
    ability_impairment_name: string
    /** Custom */
    custom: boolean
    /** Ability or Impairment ID */
    id: string
    /** Rules */
    rules: string
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
  }[]
  /**
   * Cursed Gear.
   *
   * Each entry carries `author_username`; see `abilities_impairments` above.
   */
  cursed_gear: {
    /** Custom */
    custom: boolean
    /** Cursed Gear Name */
    gear_name: string
    /** Cursed Gear ID */
    id: string
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
  }[]
  /**
   * Disorders.
   *
   * Each entry carries `author_username`; see `abilities_impairments` above.
   */
  disorders: {
    /** Custom */
    custom: boolean
    /** Disorder Name */
    disorder_name: string
    /** Disorder ID */
    id: string
    /** Rules */
    rules: string
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
  }[]
  /** Survivor Embarked on Hunt/Showdown */
  embarked: boolean
  /**
   * Fighting Arts.
   *
   * Each entry carries `author_username`; see `abilities_impairments` above.
   */
  fighting_arts: (FightingArtDetail & {
    author_user_id: string | null
    author_username: string | null
    author_avatar_url: string | null
  })[]
  /** Gear Grid (3x3 of equipped gear; null until first edit) */
  gear_grid: GearGridDetail | null
  /**
   * Knowledge 1.
   *
   * Carries `author_username`; see `abilities_impairments` above.
   */
  knowledge_1: {
    /** Knowledge ID */
    id: string
    /** Knowledge Name */
    knowledge_name: string
    /** Custom */
    custom: boolean
    /** Rules */
    rules: string | null
    /** Observation Conditions */
    observation_conditions: string | null
    /** Observation Rank Up Milestone */
    observation_rank_up_milestone: number | null
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
  } | null
  /**
   * Knowledge 2.
   *
   * Carries `author_username`; see `abilities_impairments` above.
   */
  knowledge_2: {
    /** Knowledge ID */
    id: string
    /** Knowledge Name */
    knowledge_name: string
    /** Custom */
    custom: boolean
    /** Rules */
    rules: string | null
    /** Observation Conditions */
    observation_conditions: string | null
    /** Observation Rank Up Milestone */
    observation_rank_up_milestone: number | null
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
  } | null
  /**
   * Neurosis.
   *
   * Carries `author_username`; see `abilities_impairments` above.
   */
  neurosis: {
    /** Neurosis ID */
    id: string
    /** Neurosis Name */
    neurosis_name: string
    /** Custom */
    custom: boolean
    /** Rules */
    rules: string | null
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
  } | null
  /**
   * Philosophy.
   *
   * Carries `author_username`; see `abilities_impairments` above.
   */
  philosophy: {
    /** Philosophy ID */
    id: string
    /** Philosophy Name */
    philosophy_name: string
    /** Custom */
    custom: boolean
    /** Hunt XP Milestones */
    hunt_xp_milestones: number[] | null
    /** Tenet Knowledge ID */
    tenet_knowledge_id: string | null
    /** Tier */
    tier: number | null
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
  } | null
  /**
   * Secret Fighting Arts.
   *
   * Each entry carries `author_username`; see `abilities_impairments` above.
   */
  secret_fighting_arts: (SecretFightingArtDetail & {
    author_user_id: string | null
    author_username: string | null
    author_avatar_url: string | null
  })[]
  /**
   * Tenet Knowledge.
   *
   * Carries `author_username`; see `abilities_impairments` above.
   */
  tenet_knowledge: {
    /** Knowledge ID */
    id: string
    /** Knowledge Name */
    knowledge_name: string
    /** Custom */
    custom: boolean
    /** Rules */
    rules: string | null
    /** Observation Conditions */
    observation_conditions: string | null
    /** Observation Rank Up Milestone */
    observation_rank_up_milestone: number | null
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
  } | null
  /**
   * Weapon Type.
   *
   * Carries the selected weapon type's specialist/mastery rules so survivor
   * cards can render proficiency bonuses without a second catalog lookup.
   */
  weapon_type: {
    /** Weapon Type ID */
    id: string
    /** Weapon Type Name */
    weapon_type_name: string
    /** Custom */
    custom: boolean
    /** Specialist Proficiency Rules */
    specialist_proficiency_rules: string | null
    /** Master Proficiency Rules */
    master_proficiency_rules: string | null
    /** Author User ID (null for built-ins / non-custom rows) */
    author_user_id: string | null
    /** Author Username (null for built-ins / ghost authors) */
    author_username: string | null
    /** Author Avatar URL (null for built-ins / ghost / no avatar) */
    author_avatar_url: string | null
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
 * Notification Row
 *
 * Client-side row shape for the `notification` table. Kept explicit because
 * the generated Supabase database types do not include the pending
 * notification migration yet.
 */
export interface NotificationRow {
  /** Notification ID */
  id: string
  /** Recipient User ID */
  recipient_user_id: string
  /** Notification Kind */
  kind: NotificationKind
  /** Notification Payload */
  payload: Json
  /** Read Timestamp */
  read_at: string | null
  /** Created Timestamp */
  created_at: string
}

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
export interface UserSubscriptionDetail {
  /** Active Plan ID */
  plan_id: 'free' | 'lantern' | 'lantern_hoard'
  /** Subscription Status (e.g. `active`, `past_due`, `canceled`) */
  status: string
  /** Current Period End (ISO timestamp; null on the free plan) */
  current_period_end: string | null
  /**
   * Cancellation Pending At Period End
   *
   * `true` when the subscriber has cancelled through the Stripe Customer
   * Portal but the subscription is still entitled until
   * `current_period_end`. Stripe holds the row at `status = 'active'` (or
   * `'trialing'`) during this window and only transitions to `'canceled'`
   * when the period actually expires. The SubscriptionCard reads this flag
   * to swap the renewal copy for a "watch ends on …" treatment.
   */
  cancel_at_period_end: boolean
  /**
   * Whether The User May Create New Shares
   *
   * Mirrors the `user_can_share()` Postgres predicate consulted by RLS on
   * `settlement_shared_user.INSERT`.
   */
  can_share: boolean
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
  'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>
