/**
 * Campaign Type
 */
export enum CampaignType {
  /** People of the Dream Keeper */
  PEOPLE_OF_THE_DREAM_KEEPER = 'People of the Dream Keeper',
  /** People of the Lantern */
  PEOPLE_OF_THE_LANTERN = 'People of the Lantern',
  /** People of the Stars */
  PEOPLE_OF_THE_STARS = 'People of the Stars',
  /** People of the Sun */
  PEOPLE_OF_THE_SUN = 'People of the Sun',
  /** Squires of the Citadel */
  SQUIRES_OF_THE_CITADEL = 'Squires of the Citadel',
  /** Custom */
  CUSTOM = 'Custom'
}

/**
 * Database Campaign Type
 *
 * Used to look up the campaign type used in the database, using the friendly
 * campaign type as a key.
 */
export enum DatabaseCampaignType {
  /** People of the Dream Keeper */
  'People of the Dream Keeper' = 'PEOPLE_OF_THE_DREAM_KEEPER',
  /** People of the Lantern */
  'People of the Lantern' = 'PEOPLE_OF_THE_LANTERN',
  /** People of the Stars */
  'People of the Stars' = 'PEOPLE_OF_THE_STARS',
  /** People of the Sun */
  'People of the Sun' = 'PEOPLE_OF_THE_SUN',
  /** Squires of the Citadel */
  'Squires of the Citadel' = 'SQUIRES_OF_THE_CITADEL',
  /** Custom */
  'Custom' = 'CUSTOM'
}

/**
 * Survivor Type
 */
export enum SurvivorType {
  /** Arc */
  ARC = 'Arc',
  /** Core */
  CORE = 'Core'
}

/**
 * Database Survivor Type
 *
 * Used to look up the survivor type used in the database, using the friendly survivor type as a key.
 */
export enum DatabaseSurvivorType {
  /** Arc */
  'Arc' = 'ARC',
  /** Core */
  'Core' = 'CORE'
}

/**
 * Tab Type
 */
export enum TabType {
  /** Arc Survivors */
  ARC = 'arc',
  /** Crafting */
  CRAFTING = 'crafting',
  /** Hunt */
  HUNT = 'hunt',
  /** Monsters */
  MONSTERS = 'monsters',
  /** Notes */
  NOTES = 'notes',
  /** Settings */
  SETTINGS = 'settings',
  /** Settlement Phase */
  SETTLEMENT_PHASE = 'settlementPhase',
  /** Showdown */
  SHOWDOWN = 'showdown',
  /** Society */
  SOCIETY = 'society',
  /** Squires */
  SQUIRES = 'squires',
  /** Survivors */
  SURVIVORS = 'survivors',
  /** Timeline */
  TIMELINE = 'timeline',
  /** User */
  USER = 'user'
}

/**
 * Survivor Gender
 */
export enum Gender {
  /** Female */
  FEMALE = 'F',
  /** Male */
  MALE = 'M'
}

/**
 * Survivor Gender
 */
export enum DatabaseGender {
  /** Female */
  F = 'FEMALE',
  /** Male */
  M = 'MALE'
}

/**
 * Resource Category
 */
export enum ResourceCategory {
  /** Basic */
  BASIC = 'Basic',
  /** Monster */
  MONSTER = 'Monster',
  /** Strange */
  STRANGE = 'Strange',
  /** Vermin */
  VERMIN = 'Vermin'
}

/**
 * Resource Type
 */
export enum ResourceType {
  /** Bone */
  BONE = 'Bone',
  /** Hide */
  HIDE = 'Hide',
  /** Organ */
  ORGAN = 'Organ',
  /** Scrap */
  SCRAP = 'Scrap',
  /** Herb */
  HERB = 'Herb',
  /** Vermin */
  VERMIN = 'Vermin'
}

/**
 * Monster Type
 */
export enum MonsterType {
  /** Nemesis */
  NEMESIS = 'Nemesis',
  /** Quarry */
  QUARRY = 'Quarry'
}

/**
 * Color Choice
 */
export enum ColorChoice {
  /** Neutral */
  NEUTRAL = 'neutral',
  /** Stone */
  STONE = 'stone',
  /** Zinc */
  ZINC = 'zinc',
  /** Slate */
  SLATE = 'slate',
  /** Gray */
  GRAY = 'gray',
  /** Red */
  RED = 'red',
  /** Orange */
  ORANGE = 'orange',
  /** Amber */
  AMBER = 'amber',
  /** Yellow */
  YELLOW = 'yellow',
  /** Lime */
  LIME = 'lime',
  /** Green */
  GREEN = 'green',
  /** Emerald */
  EMERALD = 'emerald',
  /** Teal */
  TEAL = 'teal',
  /** Cyan */
  CYAN = 'cyan',
  /** Sky */
  SKY = 'sky',
  /** Blue */
  BLUE = 'blue',
  /** Indigo */
  INDIGO = 'indigo',
  /** Violet */
  VIOLET = 'violet',
  /** Purple */
  PURPLE = 'purple',
  /** Fuchsia */
  FUCHSIA = 'fuchsia',
  /** Pink */
  PINK = 'pink',
  /** Rose */
  ROSE = 'rose'
}

/**
 * Ambush Type
 */
export enum AmbushType {
  /** Survivors Ambush Monster */
  SURVIVORS = 'survivors',
  /** Monster Ambush Survivors */
  MONSTER = 'monster',
  /** No Ambush */
  NONE = 'none'
}

/**
 * Turn Type
 */
export enum TurnType {
  /** Survivors' Turn */
  SURVIVORS = 'survivors',
  /** Monster's Turn */
  MONSTER = 'monster'
}

/**
 * Survivor Card Mode
 */
export enum SurvivorCardMode {
  /** Hunt Page */
  HUNT_CARD = 'hunt',
  /** Settlement Phase Page */
  SETTLEMENT_PHASE_CARD = 'settlementPhase',
  /** Showdown Page */
  SHOWDOWN_CARD = 'showdown',
  /** Survivor Page */
  SURVIVOR_CARD = 'survivor'
}

/**
 * Hunt Event Type
 */
export enum HuntEventType {
  /** Arc Hunt Event */
  ARC = 'arc',
  /** Basic Hunt Event */
  BASIC = 'basic',
  /** Monster Hunt Event */
  MONSTER = 'monster',
  /** Scout Hunt Event */
  SCOUT = 'scout'
}

/**
 * Hunt Event Count
 *
 * The hunt event tables for:
 *
 * - Basic Hunt Events (100)
 * - Arc Survivor Hunt Events (10)
 * - Scout Hunt Events (10)
 */
export enum HuntEventCount {
  /** Arc/Scout Hunt Events (10) */
  ARC_SCOUT = 10,
  /** Basic Hunt Events (100) */
  BASIC = 100
}

/**
 * Monster Nodes
 */
export enum MonsterNode {
  /** Quarry 1 */
  NQ1 = 'NQ1',
  /** Quarry 2 */
  NQ2 = 'NQ2',
  /** Quarry 3 */
  NQ3 = 'NQ3',
  /** Quarry 4 */
  NQ4 = 'NQ4',
  /** Nemesis 1 */
  NN1 = 'NN1',
  /** Nemesis 2 */
  NN2 = 'NN2',
  /** Nemesis 3 */
  NN3 = 'NN3',
  /** Core Monster */
  CO = 'CO',
  /** Finale Monster */
  FI = 'FI'
}

/**
 * Monster Versions
 */
export enum MonsterVersion {
  /** Original Monster */
  ORIGINAL = 'original',
  /** Alternate Monster */
  ALTERNATE = 'alternate',
  /** Vignette Monster */
  VIGNETTE = 'vignette'
}

/**
 * Settlement Phase Steps
 *
 * There are more than this in the game, but these are the ones that will have
 * an effect on the application. The full list is:
 *
 * 1. Set Up the Settlement
 *    - Manual; not required in the application.
 * 2. Survivors Return
 *    - Heal Survivors
 *    - Apply Arrival Bonuses
 * 3. Gain Endeavors
 *    - +1 for Each Returning Survivor
 *    - Death Principle may affect this.
 * 4. Update Timeline
 *    - Advance Timeline by 1
 *    - Draw Settlement Event
 *    - Trigger Story Events
 * 5. Update the Death Count
 *    - Automatic; not required in the application.
 * 6. Check Milestones
 *    - Check for Campaign Milestones
 *    - Check for Strain Milestones
 * 7. Develop
 *    - Innovate
 *    - Craft at Locations
 *    - Spend Endeavors
 *    - (Arc) Forum?
 * 8. Prepare Departing Survivors
 *    - Manual; Done during the Hunt/Showdown setup in the application.
 * 9. Special Showdown
 *    - Complete and Return to "Update Death Count"
 * 10. Record & Archive Resources
 *     - Automatic; not required in the application.
 * 11. End Settlement Phase
 *     - Close Settlement Phase
 */
export enum SettlementPhaseStep {
  /** Set Up Settlement */
  SET_UP_SETTLEMENT = 'Set Up Settlement',
  /** Survivors Return */
  SURVIVORS_RETURN = 'Survivors Return',
  /** Gain Endeavors */
  GAIN_ENDEAVORS = 'Gain Endeavors',
  /** Update Timeline */
  UPDATE_TIMELINE = 'Update Timeline',
  /** Update Death Count */
  UPDATE_DEATH_COUNT = 'Update Death Count',
  /** Check Milestones */
  CHECK_MILESTONES = 'Check Milestones',
  /** Develop */
  DEVELOP = 'Develop',
  /** Prepare Departing Survivors */
  PREPARE_DEPARTING_SURVIVORS = 'Prepare Departing Survivors',
  /** Special Showdown */
  SPECIAL_SHOWDOWN = 'Special Showdown',
  /** Record and Archive Resources */
  RECORD_AND_ARCHIVE_RESOURCES = 'Record and Archive Resources',
  /** End Settlement Phase */
  END_SETTLEMENT_PHASE = 'End Settlement Phase'
}

/**
 * Database Settlement Phase Step Mapping
 *
 * Maps between the database enum values (uppercase identifiers) and the
 * display-friendly SettlementPhaseStep enum values.
 */
export const DatabaseSettlementPhaseStep: Record<string, SettlementPhaseStep> =
  {
    SET_UP_SETTLEMENT: SettlementPhaseStep.SET_UP_SETTLEMENT,
    SURVIVORS_RETURN: SettlementPhaseStep.SURVIVORS_RETURN,
    GAIN_ENDEAVORS: SettlementPhaseStep.GAIN_ENDEAVORS,
    UPDATE_TIMELINE: SettlementPhaseStep.UPDATE_TIMELINE,
    UPDATE_DEATH_COUNT: SettlementPhaseStep.UPDATE_DEATH_COUNT,
    CHECK_MILESTONES: SettlementPhaseStep.CHECK_MILESTONES,
    DEVELOP: SettlementPhaseStep.DEVELOP,
    PREPARE_DEPARTING_SURVIVORS:
      SettlementPhaseStep.PREPARE_DEPARTING_SURVIVORS,
    SPECIAL_SHOWDOWN: SettlementPhaseStep.SPECIAL_SHOWDOWN,
    RECORD_AND_ARCHIVE_RESOURCES:
      SettlementPhaseStep.RECORD_AND_ARCHIVE_RESOURCES,
    END_SETTLEMENT_PHASE: SettlementPhaseStep.END_SETTLEMENT_PHASE
  }

/**
 * Showdown Types
 */
export enum ShowdownType {
  /** Regular Showdown */
  REGULAR = 'Regular',
  /** Special Showdown */
  SPECIAL = 'Special'
}

/**
 * Philosophy
 */
export enum Philosophy {
  /** Ambitionism */
  AMBITIONISM = 'Ambitionism',
  /** Champion */
  CHAMPION = 'Champion',
  /** Collectivism */
  COLLECTIVISM = 'Collectivism',
  /** Deadism */
  DEADISM = 'Deadism',
  /** Dreamism */
  DREAMISM = 'Dreamism',
  /** Faceism */
  FACEISM = 'Faceism',
  /** Gatherism */
  GATHERISM = 'Gatherism',
  /** Gourmandism */
  GOURMANDISM = 'Gourmandism',
  /** Homicidalism */
  HOMICIDALISM = 'Homicidalism',
  /** Impermanism */
  IMPERMANISM = 'Impermanism',
  /** Lanternism */
  LANTERNISM = 'Lanternism',
  /** Marrowism */
  MARROWISM = 'Marrowism',
  /** Monster */
  MONSTER = 'Monster',
  /** Optimism */
  OPTIMISM = 'Optimism',
  /** Regalism */
  REGALISM = 'Regalism',
  /** Romanticism */
  ROMANTICISM = 'Romanticism',
  /** Starting */
  STARTING = 'Starting',
  /** Survivalism */
  SURVIVALISM = 'Survivalism',
  /** Verminism */
  VERMINISM = 'Verminism',
  /** Wanderer - Aenas */
  WANDERER_AENAS = 'Wanderer - Aenas',
  /** Wanderer - Candy & Cola */
  WANDERER_CANDY_COLA = 'Wanderer - Candy & Cola',
  /** Wanderer - Death Drifter */
  WANDERER_DEATH_DRIFTER = 'Wanderer - Death Drifter',
  /** Wanderer - Goth */
  WANDERER_GOTH = 'Wanderer - Goth',
  /** Wanderer - Lucl */
  WANDERER_LUCK = 'Wanderer - Luck',
  /** Wanderer - Preacher */
  WANDERER_PREACHER = 'Wanderer - Preacher'
}

/**
 * Aenas State
 *
 * Used to track Aenas' state while in the settlement, which can be either
 * Hungry or Content.
 */
export enum AenasState {
  /** Content */
  CONTENT = 'Content',
  /** Hungry */
  HUNGRY = 'Hungry'
}
