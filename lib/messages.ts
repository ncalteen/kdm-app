import {
  AmbushType,
  ColorChoice,
  MonsterType,
  SurvivorType,
  TurnType
} from '@/lib/enums'

/**
 * Ability/Impairment Removed
 *
 * @returns Ability/Impairment Removed Message
 */
export const ABILITY_IMPAIRMENT_REMOVED_MESSAGE = () =>
  'The ability/impairment has been removed.'

/**
 * Ability/Impairment Updated
 *
 * @param isNew Is New Ability/Impairment
 * @returns Ability/Impairment Updated Message
 */
export const ABILITY_IMPAIRMENT_UPDATED_MESSAGE = (isNew: boolean) =>
  isNew
    ? 'The survivor gains a new ability/impairment.'
    : 'The ability/impairment has been updated.'

/**
 * Ambush Message
 *
 * @param ambushType Ambush Type
 * @returns Ambush Message
 */
export const AMBUSH_MESSAGE = (ambushType: AmbushType): string => {
  switch (ambushType) {
    case AmbushType.SURVIVORS:
      return 'The survivors ambush their quarry! The showdown begins.'
    case AmbushType.NONE:
      return 'The hunt reaches its epic climax! The showdown begins.'
    case AmbushType.MONSTER:
      return 'The monster ambushes the survivors! The showdown begins.'
    default:
      return 'The showdown begins.'
  }
}

/**
 * Arrival Bonus Removed
 *
 * @returns Arrival Bonus Removed Message
 */
export const ARRIVAL_BONUS_REMOVED_MESSAGE = () =>
  'A blessing fades into the void.'

/**
 * Arrival Bonus Updated
 *
 * @param index Arrival Bonus Index
 * @returns Arrival Bonus Updated Message
 */
export const ARRIVAL_BONUS_UPDATED_MESSAGE = (index?: number) =>
  index === undefined
    ? 'The blessing has been inscribed.'
    : 'A new blessing graces your settlement.'

/**
 * Campaign Unlocked Killenium Butcher Message
 *
 * @param unlocked Campaign Unlocked Killenium Butcher Status
 * @returns Campaign Unlocked Killenium Butcher Status Updated Message
 */
export const CAMPAIGN_UNLOCK_KILLENIUM_BUTCHER_UPDATED_MESSAGE = (
  unlocked: boolean
) =>
  unlocked
    ? 'Killenium Butcher accepts your challenge.'
    : 'Killenium Butcher retreats into the darkness.'

/**
 * Campaign Unlocked Screaming Nukalope Message
 *
 * @param unlocked Campaign Unlocked Screaming Nukalope Status
 * @returns Campaign Unlocked Screaming Nukalope Status Updated Message
 */
export const CAMPAIGN_UNLOCK_SCREAMING_NUKALOPE_UPDATED_MESSAGE = (
  unlocked: boolean
) =>
  unlocked
    ? 'Screaming Nukalope accepts your challenge.'
    : 'Screaming Nukalope retreats into the darkness.'

/**
 * Campaign Unlocked White Gigalion Message
 *
 * @param unlocked Campaign Unlocked White Gigalion Status
 * @returns Campaign Unlocked White Gigalion Status Updated Message
 */
export const CAMPAIGN_UNLOCK_WHITE_GIGALION_UPDATED_MESSAGE = (
  unlocked: boolean
) =>
  unlocked
    ? 'White Gigalion accepts your challenge.'
    : 'White Gigalion retreats into the darkness.'

/**
 * Collective Cognition Reward No Target Error
 *
 * @returns No Target Collective Cognition Reward Error Message
 */
export const COLLECTIVE_COGNITION_REWARD_NO_TARGET_ERROR_MESSAGE = () =>
  'A reward must have a collective cognition target.'

/**
 * Collective Cognition Reward Saved
 *
 * @param unlocked Unlocked Status
 * @returns Collective Cognition Reward Saved Message
 */
export const COLLECTIVE_COGNITION_REWARD_SAVED_MESSAGE = (unlocked: boolean) =>
  unlocked
    ? 'Reward granted by the darkness.'
    : 'The dark gift recedes into shadow.'

/**
 * Collective Cognition Reward Updated
 *
 * @returns Collective Cognition Reward Updated Message
 */
export const COLLECTIVE_COGNITION_REWARD_UPDATED_MESSAGE = () =>
  "The settlement's culinary knowledge expands."

/**
 * Collective Cognition Victory Saved
 *
 * @param victory Victory Status
 * @returns Collective Cognition Victory Saved Message
 */
export const COLLECTIVE_COGNITION_VICTORY_SAVED_MESSAGE = (victory: boolean) =>
  victory
    ? "The settlement's legacy grows stronger."
    : "The settlement's legacy endures despite setbacks."

/**
 * Combat Arms Updated
 *
 * @returns Combat Arms Updated Message
 */
export const COMBAT_ARMS_UPDATED_MESSAGE = () => 'Arms endure another battle.'

/**
 * Combat Body Updated
 *
 * @returns Combat Body Updated Message
 */
export const COMBAT_BODY_UPDATED_MESSAGE = () =>
  'The body bears the scars of survival.'

/**
 * Combat Head Updated
 *
 * @returns Combat Head Updated Message
 */
export const COMBAT_HEAD_UPDATED_MESSAGE = () =>
  'The mind remains sharp despite the trauma.'

/**
 * Combat Legs Updated
 *
 * @returns Combat Legs Updated Message
 */
export const COMBAT_LEGS_UPDATED_MESSAGE = () =>
  'Legs steady for the journey ahead.'

/**
 * Combat Waist Updated
 *
 * @returns Combat Waist Updated Message
 */
export const COMBAT_WAIST_UPDATED_MESSAGE = () =>
  'The core strengthens against the darkness.'

/**
 * Custom Monster Created
 *
 * @param monsterType Monster Type
 * @returns Custom Monster Created Message
 */
export const CUSTOM_MONSTER_CREATED_MESSAGE = (monsterType: MonsterType) =>
  monsterType === MonsterType.NEMESIS
    ? 'A new nemesis emerges from the shadows.'
    : 'A new quarry stalks the land.'

/**
 * Custom Monster Deleted
 *
 * @param monsterName Monster Name
 * @returns Custom Monster Deleted Message
 */
export const CUSTOM_MONSTER_DELETED_MESSAGE = (monsterName?: string) =>
  `${monsterName ?? 'Monster'} fades back into the darkness.`

/**
 * Custom Monster Updated
 *
 * @param monsterType Monster Type
 * @returns Custom Monster Updated Message
 */
export const CUSTOM_MONSTER_UPDATED_MESSAGE = (monsterType: MonsterType) =>
  monsterType === MonsterType.NEMESIS
    ? 'The nemesis adapts to your will.'
    : 'The quarry shifts in the darkness.'

/**
 * Departing Bonus Removed
 *
 * @returns Departing Bonus Removed Message
 */
export const DEPARTING_BONUS_REMOVED_MESSAGE = () =>
  'A blessing fades into the void.'

/**
 * Departing Bonus Updated
 *
 * @param index Departing Bonus Index
 * @returns Departing Bonus Updated Message
 */
export const DEPARTING_BONUS_UPDATED_MESSAGE = (index?: number) =>
  index !== undefined
    ? 'The blessing has been inscribed.'
    : 'A new blessing graces your settlement.'

/**
 * Error Message
 *
 * @returns Error Message
 */
export const ERROR_MESSAGE = () =>
  'The darkness swallows your words. Please try again.'

/**
 * Fighting Arts Max Exceeded Error
 *
 * @param survivorType Survivor Type
 * @returns Max Fighting Arts Exceeded Error Message
 */
export const FIGHTING_ARTS_MAX_EXCEEDED_ERROR_MESSAGE = (
  survivorType: SurvivorType
) =>
  survivorType === SurvivorType.ARC
    ? 'Arc survivors can only have 1 Fighting Art.'
    : 'Survivors can only have 3 total Fighting Arts and Secret Fighting Arts combined.'

/**
 * Gear Removed
 *
 * @returns Gear Removed Message
 */
export const GEAR_REMOVED_MESSAGE = () => 'Gear has been archived.'

/**
 * Gear Updated
 *
 * @param index Gear Index
 * @returns Gear Updated Message
 */
export const GEAR_UPDATED_MESSAGE = (index?: number) =>
  index !== undefined
    ? 'Gear has been modified.'
    : 'New gear added to settlement storage.'

/**
 * Hunt Already Active Error
 *
 * @returns Hunt Already Active Error Message
 */
export const HUNT_ALREADY_ACTIVE_ERROR_MESSAGE = () =>
  'A hunt is already underway. Complete it before beginning another.'

/**
 * Hunt Begins
 *
 * @param monsterName Monster Name
 * @returns Hunt Begins Message
 */
export const HUNT_BEGINS_MESSAGE = (monsterName: string) =>
  `The hunt for ${monsterName} begins. Survivors venture into the darkness.`

/**
 * Hunt Deleted
 *
 * @returns Hunt Deleted Message
 */
export const HUNT_DELETED_MESSAGE = () =>
  'The hunt ends. Survivors return to the relative safety of the settlement.'

/**
 * Hunt Notes Saved
 *
 * @returns Hunt Notes Saved Message
 */
export const HUNT_NOTES_SAVED_MESSAGE = () =>
  'The tales of this hunt are recorded for future generations.'

/**
 * Hunt XP Rank Up Milestone Added
 *
 * @returns Hunt XP Rank Up Milestone Added Message
 */
export const HUNT_XP_RANK_UP_MILESTONE_ADDED_MESSAGE = () =>
  'Rank up milestone added.'

/**
 * Hunt XP Rank Up Milestone Removed
 *
 * @returns Hunt XP Rank Up Milestone Removed Message
 */
export const HUNT_XP_RANK_UP_MILESTONE_REMOVED_MESSAGE = () =>
  'Rank up milestone removed.'

/**
 * Hunt XP Rank Up Achieved
 *
 * @returns Hunt XP Rank Up Achieved Message
 */
export const HUNT_XP_RANK_UP_ACHIEVED_MESSAGE = () =>
  'The survivor rises through struggle and triumph. Rank up achieved!'

/**
 * Hunt XP Updated
 *
 * @returns Hunt XP Updated Message
 */
export const HUNT_XP_UPDATED_MESSAGE = () =>
  'The lantern grows brighter. Hunt XP updated.'

/**
 * Innovation Removed
 *
 * @returns Innovation Removed Message
 */
export const INNOVATION_REMOVED_MESSAGE = () => 'The innovation has been lost.'

/**
 * Innovation Updated
 *
 * @param index Innovation Index
 * @returns Innovation Updated Message
 */
export const INNOVATION_UPDATED_MESSAGE = (index?: number) =>
  index !== undefined
    ? 'The innovation has been updated.'
    : 'The settlement has innovated.'

/**
 * Insanity Minimum Error
 *
 * @returns Insanity Minimum Error Message
 */
export const INSANITY_MINIMUM_ERROR_MESSAGE = () =>
  'Insanity cannot be negative.'

/**
 * Knowledge Created
 *
 * @returns Knowledge Created Message
 */
export const KNOWLEDGE_CREATED_MESSAGE = () =>
  'New knowledge illuminates the settlement.'

/**
 * Knowledge Removed
 *
 * @returns Knowledge Removed Message
 */
export const KNOWLEDGE_REMOVED_MESSAGE = () => 'Knowledge banished to the void.'

/**
 * Knowledge Updated
 *
 * @returns Knowledge Updated Message
 */
export const KNOWLEDGE_UPDATED_MESSAGE = () => 'Knowledge carved into memory.'

/**
 * Lantern Research Level Minimum Error
 *
 * @returns Lantern Research Level Minimum Error Message
 */
export const LANTERN_RESEARCH_LEVEL_MINIMUM_ERROR = () =>
  'Lantern research level cannot be reduced below 0.'

/**
 * Lantern Research Level Updated
 *
 * @param oldValue Old Lantern Research Level
 * @param newValue New Lantern Research Level
 * @returns Lantern Research Level Updated Message
 */
export const LANTERN_RESEARCH_LEVEL_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? "The lantern's glow illuminates new knowledge."
    : oldValue > newValue
      ? 'The lantern dims, losing some of its knowledge.'
      : "The lantern's knowledge remains unchanged."

/**
 * Location Removed
 *
 * @returns Location Removed Message
 */
export const LOCATION_REMOVED_MESSAGE = () => 'The location has been destroyed.'

/**
 * Location Unlocked
 *
 * @param unlocked Location Unlocked State
 * @returns Location Unlocked Message
 */
export const LOCATION_UNLOCKED_MESSAGE = (unlocked: boolean) =>
  unlocked
    ? 'The location has been illuminated.'
    : 'The location fades into darkness.'

/**
 * Location Updated
 *
 * @param index Location Index
 * @returns Location Updated Message
 */
export const LOCATION_UPDATED_MESSAGE = (index?: number) =>
  index !== undefined
    ? 'The location has been updated.'
    : 'A new location illuminates within settlement.'

/**
 * Lost Settlement Count Minimum Error
 *
 * @returns Lost Settlement Count Minimum Error Message
 */
export const LOST_SETTLEMENT_COUNT_MINIMUM_ERROR = () =>
  'Lost settlement count cannot be reduced below 0.'

/**
 * Lost Settlement Count Updated
 *
 * @param oldValue Old Lost Settlement Count
 * @param newValue New Lost Settlement Count
 * @returns Lost Settlement Count Updated Message
 */
export const LOST_SETTLEMENT_COUNT_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? 'Voices cried out, and were silenced. A settlement has been lost.'
    : oldValue > newValue
      ? 'A lost settlement is reclaimed from the darkness.'
      : 'The count of lost settlements remains unchanged.'

/**
 * Milestone Completed
 *
 * @param complete Milestone Completed State
 * @returns Milestone Completed Message
 */
export const MILESTONE_COMPLETED_MESSAGE = (complete: boolean) =>
  complete
    ? 'Milestone achieved - the settlement persists through the darkness.'
    : 'Milestone status updated.'

/**
 * Milestone Missing Event Error
 *
 * @returns Milestone Missing Event Error Message
 */
export const MILESTONE_MISSING_EVENT_ERROR = () =>
  'A milestone must include a story event.'

/**
 * Milestone Removed
 *
 * @returns Remove Milestone Message
 */
export const MILESTONE_REMOVED_MESSAGE = () =>
  'The milestone fades into the darkness.'

/**
 * Milestone Updated
 *
 * @param index Milestone Index
 * @returns Milestone Updated Message
 */
export const MILESTONE_UPDATED_MESSAGE = (index?: number) =>
  index !== undefined
    ? 'Milestones have been updated.'
    : "A new milestone marks the settlement's destiny."

/**
 * Monster Accuracy Updated
 *
 * @param oldValue Old Value
 * @param newValue New Value
 * @returns Update Message
 */
export const MONSTER_ACCURACY_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? 'The monster strikes more accurately.'
    : oldValue > newValue
      ? 'The monster strikes less accurately.'
      : "The monster's accuracy remains unchanged."

/**
 * Monster Accuracy Tokens Updated
 *
 * @param oldValue Old Value
 * @param newValue New Value
 * @returns Update Message
 */
export const MONSTER_ACCURACY_TOKENS_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? 'The monster gains accuracy tokens.'
    : oldValue > newValue
      ? 'The monster loses accuracy tokens.'
      : "The monster's accuracy tokens remain unchanged."

/**
 * Monster AI Deck Updated
 *
 * @param oldValue Old Value
 * @param newValue New Value
 * @returns Update Message
 */
export const MONSTER_AI_DECK_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? 'The monster gains AI cards.'
    : oldValue < newValue
      ? 'The monster loses AI cards.'
      : 'The monster AI deck remains unchanged.'

/**
 * Monster Damage Tokens Updated
 *
 * @param oldValue Old Value
 * @param newValue New Value
 * @returns Update Message
 */
export const MONSTER_DAMAGE_TOKENS_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? 'The monster gains damage tokens.'
    : oldValue > newValue
      ? 'The monster loses damage tokens.'
      : "The monster's damage tokens remain unchanged."

/**
 * Monster Evasion Updated
 *
 * @param oldValue Old Value
 * @param newValue New Value
 * @returns Update Message
 */
export const MONSTER_EVASION_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? 'The monster evades attacks more effectively.'
    : oldValue > newValue
      ? 'The monster evades attacks less effectively.'
      : "The monster's evasion remains unchanged."

/**
 * Monster Evasion Tokens Updated
 *
 * @param oldValue Old Value
 * @param newValue New Value
 * @returns Update Message
 */
export const MONSTER_EVASION_TOKENS_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? 'The monster gains evasion tokens.'
    : oldValue > newValue
      ? 'The monster loses evasion tokens.'
      : "The monster's evasion tokens remain unchanged."

/**
 * Monster Luck Updated
 *
 * @param oldValue Old Value
 * @param newValue New Value
 * @returns Update Message
 */
export const MONSTER_LUCK_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? 'The monster becomes luckier.'
    : oldValue > newValue
      ? 'The monster becomes unluckier.'
      : "The monster's luck remains unchanged."

/**
 * Monster Luck Tokens Updated
 *
 * @param oldValue Old Value
 * @param newValue New Value
 * @returns Update Message
 */
export const MONSTER_LUCK_TOKENS_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? 'The monster gains luck tokens.'
    : oldValue > newValue
      ? 'The monster loses luck tokens.'
      : "The monster's luck tokens remain unchanged."

/**
 * Monster Moved on the Hunt Board
 *
 * @returns Monster Moved Message
 */
export const MONSTER_MOVED_MESSAGE = () => 'Monster moved.'

/**
 * Monster Movement Updated
 *
 * @param oldValue Old Value
 * @param newValue New Value
 * @returns Update Message
 */
export const MONSTER_MOVEMENT_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? 'The monster moves swifter.'
    : oldValue > newValue
      ? 'The monster moves slower.'
      : "The monster's movement remains unchanged."

/**
 * Monster Movement Tokens Updated
 *
 * @param oldValue Old Value
 * @param newValue New Value
 * @returns Update Message
 */
export const MONSTER_MOVEMENT_TOKENS_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? 'The monster gains movement tokens.'
    : oldValue > newValue
      ? 'The monster loses movement tokens.'
      : "The monster's movement tokens remain unchanged."

/**
 * Monster Speed Updated
 *
 * @param oldValue Old Value
 * @param newValue New Value
 * @returns Update Message
 */
export const MONSTER_SPEED_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? 'The monster attacks more swiftly.'
    : oldValue > newValue
      ? 'The monster attacks more slowly.'
      : "The monster's attack speed remains unchanged."

/**
 * Monster Speed Tokens Updated
 *
 * @param oldValue Old Value
 * @param newValue New Value
 * @returns Update Message
 */
export const MONSTER_SPEED_TOKENS_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? 'The monster gains speed tokens.'
    : oldValue > newValue
      ? 'The monster loses speed tokens.'
      : "The monster's speed tokens remain unchanged."

/**
 * Monster Starts Showdown Knocked Down
 *
 * @param knockedDown Knocked Down Status
 * @returns Monster Starts Showdown Knocked Down Message
 */
export const MONSTER_STARTS_SHOWDOWN_KNOCKED_DOWN_MESSAGE = (
  knockedDown: boolean
) =>
  knockedDown
    ? 'The monster will start the showdown knocked down.'
    : 'The monster will start the showdown standing.'

/**
 * Monster Stats Saved
 *
 * @returns Monster Stats Saved Message
 */
export const MONSTER_STATS_SAVED_MESSAGE = () => 'The creature shifts.'

/**
 * Monster Strength Updated
 *
 * @param oldValue Old Value
 * @param newValue New Value
 * @returns Update Message
 */
export const MONSTER_STRENGTH_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? 'The monster strikes more powerfully.'
    : oldValue > newValue
      ? 'The monster strikes less powerfully.'
      : "The monster's strength remains unchanged."

/**
 * Monster Strength Tokens Updated
 *
 * @param oldValue Old Value
 * @param newValue New Value
 * @returns Update Message
 */
export const MONSTER_STRENGTH_TOKENS_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? 'The monster gains strength tokens.'
    : oldValue > newValue
      ? 'The monster loses strength tokens.'
      : "The monster's strength tokens remain unchanged."

/**
 * Monster Toughness Updated
 *
 * @param oldValue Old Value
 * @param newValue New Value
 * @returns Update Message
 */
export const MONSTER_TOUGHNESS_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? 'The monster becomes tougher.'
    : oldValue > newValue
      ? 'The monster becomes less tough.'
      : "The monster's toughness remains unchanged."

/**
 * Monster Volume Removed
 *
 * @returns Monster Volume Removed Message
 */
export const MONSTER_VOLUME_REMOVED_MESSAGE = () =>
  'The monster volume has been consigned to darkness.'

/**
 * Monster Volume Updated
 *
 * @param index Monster Volume Index
 * @returns Monster Volume Updated Message
 */
export const MONSTER_VOLUME_UPDATED_MESSAGE = (index?: number) =>
  index !== undefined
    ? 'Monster volume inscribed in blood.'
    : 'New monster volume inscribed in blood.'

/**
 * Monster Wound Deck Updated
 *
 * @param oldValue Old Value
 * @param newValue New Value
 * @returns Update Message
 */
export const MONSTER_WOUND_DECK_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue > newValue
    ? 'The monster heals its wounds.'
    : oldValue < newValue
      ? 'The monster suffers new wounds.'
      : "The monster's wound deck remains unchanged."

/**
 * Mood Created
 *
 * @returns Mood Created Message
 */
export const MOOD_CREATED_MESSAGE = () => 'A new mood takes hold.'

/**
 * Mood Removed
 *
 * @returns Mood Removed Message
 */
export const MOOD_REMOVED_MESSAGE = () => 'The mood subsides.'

/**
 * Mood Updated
 *
 * @returns Mood Updated Message
 */
export const MOOD_UPDATED_MESSAGE = () => 'The mood has been updated.'

/**
 * Nameless Object Error
 *
 * @param objType Object Type
 * @returns Nameless Object Error Message
 */
export const NAMELESS_OBJECT_ERROR_MESSAGE = (objType: string) =>
  `A nameless ${objType} cannot be recorded.`

/**
 * Nemesis Added
 *
 * @returns Nemesis Added Message
 */
export const NEMESIS_ADDED_MESSAGE = () => 'A new nemesis emerges.'

/**
 * Nemesis Removed
 *
 * @returns Nemesis Removed Message
 */
export const NEMESIS_REMOVED_MESSAGE = () =>
  'The nemesis has returned to the darkness.'

/**
 * Nemesis Unlocked
 *
 * @param name Nemesis Name
 * @param unlocked Nemesis Unlocked State
 * @returns Nemesis Unlocked Message
 */
export const NEMESIS_UNLOCKED_MESSAGE = (name: string, unlocked: boolean) =>
  `${name} ${unlocked ? 'emerges, ready to accept your challenge.' : 'retreats into the darkness, beyond your reach.'}`

/**
 * Nemesis Updated
 *
 * @returns Nemesis Updated Message
 */
export const NEMESIS_UPDATED_MESSAGE = () =>
  'The nemesis waits outside your settlement.'

/**
 * Pattern Removed
 *
 * @returns Remove Pattern Message
 */
export const PATTERN_REMOVED_MESSAGE = () => 'The pattern has been lost.'

/**
 * Pattern Updated
 *
 * @param index Pattern Index
 * @returns Pattern Updated Message
 */
export const PATTERN_UPDATED_MESSAGE = (index?: number) =>
  index !== undefined
    ? 'The pattern has been updated.'
    : 'A new pattern emerges.'

/**
 * Philosophy Created
 *
 * @returns Philosophy Created Message
 */
export const PHILOSOPHY_CREATED_MESSAGE = () => 'A new philosophy emerges.'

/**
 * Philosophy Rank Minimum Error
 *
 * @returns Philosophy Rank Minimum Error Message
 */
export const PHILOSOPHY_RANK_MINIMUM_ERROR = () =>
  'Philosophy rank cannot be negative.'

/**
 * Philosophy Removed
 *
 * @returns Philosophy Removed Message
 */
export const PHILOSOPHY_REMOVED_MESSAGE = () =>
  'The philosophy fades into the void.'

/**
 * Philosophy Updated
 *
 * @returns Philosophy Updated Message
 */
export const PHILOSOPHY_UPDATED_MESSAGE = () => 'Philosophy etched into memory.'

/**
 * Principle Option Selected
 *
 * @param optionName Name of the selected option
 * @returns Principle Option Selected Message
 */
export const PRINCIPLE_OPTION_SELECTED_MESSAGE = (optionName: string) =>
  `The settlement has chosen ${optionName}.`

/**
 * Principle Removed
 *
 * @returns Principle Removed Message
 */
export const PRINCIPLE_REMOVED_MESSAGE = () =>
  'The principle fades into memory.'

/**
 * Principle Updated
 *
 * @param isNew Is New Principle
 * @returns Updated Principle Message
 */
export const PRINCIPLE_UPDATED_MESSAGE = (isNew: boolean) =>
  isNew
    ? 'A new principle guides your settlement.'
    : 'The principle has been inscribed.'

/**
 * Quarry Added
 *
 * @returns Quarry Added Message
 */
export const QUARRY_ADDED_MESSAGE = () => 'A new quarry has been discovered.'

/**
 * Quarry Removed
 *
 * @returns Quarry Removed Message
 */
export const QUARRY_REMOVED_MESSAGE = () => 'The quarry has vanished.'

/**
 * Quarry Unlocked
 *
 * @param quarryName Name of the quarry
 * @param unlocked Quarry Unlocked State
 * @returns Quarry Unlocked Message
 */
export const QUARRY_UNLOCKED_MESSAGE = (
  quarryName: string,
  unlocked: boolean
) =>
  `${quarryName} ${unlocked ? 'emerges, ready to be hunted.' : 'retreats into the darkness, beyond your reach.'}`

/**
 * Quarry Updated
 *
 * @returns Quarry Updated Message
 */
export const QUARRY_UPDATED_MESSAGE = () => 'The quarry has been tracked.'

/**
 * Resource Removed
 *
 * @returns Resource Removed Message
 */
export const RESOURCE_REMOVED_MESSAGE = () => 'The resource has been consumed.'

/**
 * Resource Updated
 *
 * @param index Resource Index
 * @returns Resource Updated Message
 */
export const RESOURCE_UPDATED_MESSAGE = (index?: number) =>
  index !== undefined
    ? 'The resource has been cataloged.'
    : 'A new resource has been gathered.'

/**
 * Scout Conflict
 *
 * @returns Scout Conflict Message
 */
export const SCOUT_CONFLICT_MESSAGE = () =>
  'The selected scout cannot also be one of the survivors selected for the hunt.'

/**
 * Scout Required for Hunt/Showdown
 *
 * @param type Type of Activity
 * @returns Scout Required Message
 */
export const SCOUT_REQUIRED_MESSAGE = (type: 'hunt' | 'showdown') =>
  `This settlement employs scouts. A scout must be selected to begin the ${type}.`

/**
 * Secret Fighting Arts Max Exceeded Error
 *
 * @param survivorType Survivor Type
 * @returns Max Fighting Arts Exceeded Error Message
 */
export const SECRET_FIGHTING_ARTS_MAX_EXCEEDED_ERROR_MESSAGE = (
  survivorType: SurvivorType
) =>
  survivorType === SurvivorType.ARC
    ? 'Arc survivors can only have 1 Secret Fighting Art.'
    : 'Survivors can only have 3 total Fighting Arts and Secret Fighting Arts combined.'

/**
 * Seed Pattern Removed
 *
 * @returns Seed Pattern Removed Message
 */
export const SEED_PATTERN_REMOVED_MESSAGE = () =>
  'The seed pattern has been consumed by darkness.'

/**
 * Seed Pattern Updated
 *
 * @param index Seed Pattern Index
 * @returns Seed Pattern Updated Message
 */
export const SEED_PATTERN_UPDATED_MESSAGE = (index?: number) =>
  index !== undefined
    ? 'The seed pattern has been updated.'
    : 'A new seed pattern has taken root.'

/**
 * Settlement Created
 *
 * @returns Settlement Created Message
 */
export const SETTLEMENT_CREATED_MESSAGE = () =>
  'A lantern pierces the darkness. A new settlement is born.'

/**
 * Settlement Deleted
 *
 * @param settlementName Name of the settlement
 * @returns Settlement Deleted Message
 */
export const SETTLEMENT_DELETED_MESSAGE = (settlementName: string) =>
  `A wave of darkness washes over ${settlementName}. Voices cried out, and were silenced.`

/**
 * Settlement Loaded
 *
 * @returns Settlement Loaded Message
 */
export const SETTLEMENT_LOADED_MESSAGE = () => 'Settlement chronicles loaded!'

/**
 * Settlement Notes Saved
 *
 * @returns Settlement Notes Saved Message
 */
export const SETTLEMENT_NOTES_SAVED_MESSAGE = () =>
  'As stories are shared amongst survivors, they are etched into the history of your settlement.'

/**
 * Settlement Phase Ended
 *
 * @returns Settlement Phase Ended Message
 */
export const SETTLEMENT_PHASE_ENDED_MESSAGE = () =>
  'The settlement phase ends. Survivors prepare to venture into the darkness once more.'

/**
 * Settlement Phase Started
 *
 * @returns Settlement Phase Started Message
 */
export const SETTLEMENT_PHASE_STARTED_MESSAGE = () =>
  'The showdown ends. Remaining survivors return to the relative safety of the settlement.'

/**
 * Settlement Phase Step Updated
 *
 * @param stepTitle Step Title
 * @returns Settlement Phase Step Updated Message
 */
export const SETTLEMENT_PHASE_STEP_UPDATED_MESSAGE = (stepTitle: string) =>
  `Settlement phase moved to the ${stepTitle} step.`

/**
 * Settlement Saved
 *
 * @returns Settlement Saved Message
 */
export const SETTLEMENT_SAVED_MESSAGE = () => 'Settlement records preserved!'

/**
 * Settlement Uses Scouts Setting Updated
 *
 * @param usesScouts Uses Scouts
 * @returns Settlement Uses Scouts Setting Updated Message
 */
export const SETTLEMENT_USES_SCOUTS_SETTING_UPDATED_MESSAGE = (
  usesScouts: boolean
) =>
  usesScouts
    ? 'The settlement now employs scouts to aid in hunts.'
    : 'The settlement no longer relies on scouts for hunts.'

/**
 * Disable Toasts Setting Updated
 *
 * @param disableToasts Disable Toasts Setting
 * @returns Disable Toasts Setting Updated Message
 */
export const DISABLE_TOASTS_SETTING_UPDATED_MESSAGE = (
  disableToasts: boolean
) =>
  disableToasts
    ? 'Notification messages have been silenced.'
    : 'Notification messages will now illuminate your journey.'

/**
 * Showdown Already Active Error
 *
 * @returns Showdown Already Active Error Message
 */
export const SHOWDOWN_ALREADY_ACTIVE_ERROR_MESSAGE = () =>
  'A showdown is already in progress. Survive it before facing another foe.'

/**
 * Showdown Created
 *
 * @param monsterName Monster Name
 * @param monsterType Monster Type
 * @returns Showdown Created Message
 */
export const SHOWDOWN_CREATED_MESSAGE = (
  monsterName: string,
  monsterType: MonsterType
) =>
  `The showdown against ${monsterName} begins. ${monsterType === MonsterType.QUARRY ? 'Survivors prepare themselves.' : 'Survivors must defend their home.'}`

/**
 * Showdown Deleted
 *
 * @returns Showdown Deleted Message
 */
export const SHOWDOWN_DELETED_MESSAGE = () =>
  'The showdown ends. Survivors return to the relative safety of the settlement.'

/**
 * Showdown Monster Knocked Down
 *
 * @param knockedDown Knocked Down Status
 * @returns Showdown Monster Knocked Down Message
 */
export const SHOWDOWN_MONSTER_KNOCKED_DOWN_MESSAGE = (knockedDown: boolean) =>
  knockedDown
    ? 'The monster is knocked down!'
    : 'The monster rises to its feet.'

/**
 * Showdown Notes Saved
 *
 * @returns Showdown Notes Saved Message
 */
export const SHOWDOWN_NOTES_SAVED_MESSAGE = () =>
  'The tales of this showdown are recorded for future generations.'

/**
 * Showdown Turn Message
 *
 * @param nextTurn Next Turn
 * @returns Showdown Turn Message
 */
export const SHOWDOWN_TURN_MESSAGE = (nextTurn: TurnType) =>
  nextTurn === TurnType.MONSTER
    ? 'The survivors brace as the monster moves to strike.'
    : 'The survivors engage the monster!'

/**
 * Squire Suspicion Updated
 *
 * @param squireName Squire Name
 * @returns Squire Suspicion Updated Message
 */
export const SQUIRE_SUSPICION_UPDATED_MESSAGE = (squireName: string) =>
  `${squireName}'s doubt grows deeper.`

/**
 * Survival Limit Exceeded Error
 *
 * @param survivalLimit Survival Limit
 * @returns Survival Limit Exceeded Error Message
 */
export const SURVIVAL_LIMIT_EXCEEDED_ERROR_MESSAGE = (survivalLimit: number) =>
  `Survival cannot exceed the settlement's survival limit (${survivalLimit}).`

/**
 * Survival Limit Minimum Error
 *
 * @returns Survival Limit Minimum Error Message
 */
export const SURVIVAL_LIMIT_MINIMUM_ERROR_MESSAGE = () =>
  "Settlement's survival limit cannot be reduced below 1."

/**
 * Survival Limit Updated
 *
 * @param oldValue Old Survival Limit
 * @param newValue New Survival Limit
 * @returns Survival Limit Updated Message
 */
export const SURVIVAL_LIMIT_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? "The settlement's will to live grows stronger."
    : oldValue > newValue
      ? "The settlement's will to live weakens."
      : "The settlement's survival limit remains unchanged."

/**
 * Survival Minimum Error
 *
 * @returns Survival Minimum Error Message
 */
export const SURVIVAL_MINIMUM_ERROR_MESSAGE = () =>
  'Survival cannot be negative.'

/**
 * Survivor Accuracy Updated
 *
 * @returns Survivor Accuracy Updated Message
 */
export const SURVIVOR_ACCURACY_UPDATED_MESSAGE = () =>
  "The survivor's aim pierces through shadow."

/**
 * Survivor Attribute Token Updated
 *
 * @param attributeName Attribute Name
 * @returns Update Message
 */
export const SURVIVOR_ATTRIBUTE_TOKEN_UPDATED_MESSAGE = (
  attributeName: string
) => `The survivor's ${attributeName} tokens have been updated.`

/**
 * Survivor Base Attribute Updated
 *
 * @param attributeName Attribute Name
 * @returns Update Message
 */
export const SURVIVOR_BASE_ATTRIBUTE_UPDATED_MESSAGE = (
  attributeName: string
) => `The survivor's ${attributeName} has been updated.`

/**
 * Survivor Brain Light Damage Updated
 *
 * @param damaged Brain Light Damage Flag
 * @returns Survivor Brain Light Damage Updated Message
 */
export const SURVIVOR_BRAIN_LIGHT_DAMAGE_UPDATED_MESSAGE = (
  damaged: boolean
) =>
  damaged
    ? 'The survivor suffers brain damage from the horrors witnessed.'
    : 'The survivor recovers from their brain injury.'

/**
 * Survivor Can Dash Updated
 *
 * @param canDash Can Dash Flag
 * @returns Survivor Can Dash Updated Message
 */
export const SURVIVOR_CAN_DASH_UPDATED_MESSAGE = (canDash: boolean) =>
  canDash
    ? 'The survivor gains swift feet to dash ahead.'
    : 'The survivor loses their speed, unable to dash.'

/**
 * Survivor Can Dodge Updated
 *
 * @param canDodge Can Dodge Flag
 * @returns Survivor Can Dodge Updated Message
 */
export const SURVIVOR_CAN_DODGE_UPDATED_MESSAGE = (canDodge: boolean) =>
  canDodge
    ? 'The survivor learns to dodge with grace.'
    : 'The survivor loses the ability to dodge.'

/**
 * Survivor Can Encourage Updated
 *
 * @param canEncourage Can Encourage Flag
 * @returns Survivor Can Encourage Updated Message
 */
export const SURVIVOR_CAN_ENCOURAGE_UPDATED_MESSAGE = (
  canEncourage: boolean
) =>
  canEncourage
    ? 'The survivor finds their voice to inspire others.'
    : 'The survivor falls silent, unable to encourage.'

/**
 * Survivor Can Endure Updated
 *
 * @param canEndure Can Endure Flag
 * @returns Survivor Can Endure Updated Message
 */
export const SURVIVOR_CAN_ENDURE_UPDATED_MESSAGE = (canEndure: boolean) =>
  canEndure
    ? 'The survivor finds strength to endure the darkness.'
    : 'The survivor loses their resilience to endure.'

/**
 * Survivor Can Fist Pump Updated
 *
 * @param canFistPump Can Fist Pump Flag
 * @returns Survivor Can Fist Pump Updated Message
 */
export const SURVIVOR_CAN_FIST_PUMP_UPDATED_MESSAGE = (canFistPump: boolean) =>
  canFistPump
    ? 'The survivor raises their fist in triumph.'
    : 'The survivor loses their fighting spirit.'

/**
 * Survivor Can Surge Updated
 *
 * @param canSurge Can Surge Flag
 * @returns Survivor Can Surge Updated Message
 */
export const SURVIVOR_CAN_SURGE_UPDATED_MESSAGE = (canSurge: boolean) =>
  canSurge
    ? 'The survivor feels a surge of power within.'
    : 'The survivor loses their ability to surge.'

/**
 * Survivor Can Spend Survival Updated
 *
 * @param value New Value
 * @returns Update Message
 */
export const SURVIVOR_CAN_SPEND_SURVIVAL_UPDATED_MESSAGE = (value: boolean) =>
  value === false
    ? 'The survivor freezes - survival cannot be spent.'
    : 'The survivor can once again spend survival.'

/**
 * Survivor Can Use Fighting Arts Updated (for Fighting Arts context)
 *
 * @param canUse Can Use Fighting Arts
 * @returns Survivor Can Use Fighting Arts Updated Message
 */
export const SURVIVOR_CAN_USE_FIGHTING_ARTS_UPDATED_MESSAGE = (
  canUse: boolean
) =>
  canUse
    ? 'The survivor recalls the ways of battle.'
    : 'The survivor has forgotten their fighting techniques.'

/**
 * Survivor Can Use Fighting Arts or Knowledges Updated
 *
 * @param canUse Can Use Fighting Arts or Knowledges
 * @returns Survivor Can Use Fighting Arts or Knowledges Updated Message
 */
export const SURVIVOR_CAN_USE_FIGHTING_ARTS_OR_KNOWLEDGES_UPDATED_MESSAGE = (
  canUse: boolean
) =>
  canUse
    ? 'The survivor recalls their knowledge.'
    : 'The survivor has forgotten their learnings.'

/**
 * Survivor Color Changed
 *
 * @param newColor New Color
 * @returns Survivor Color Changed Message
 */
export const SURVIVOR_COLOR_CHANGED_MESSAGE = (newColor: ColorChoice) =>
  `Survivor color changed to ${newColor}.`

/**
 * Survivor Courage/Understanding Ability Updated
 *
 * @returns Survivor Courage/Understanding Ability Updated Message
 */
export const SURVIVOR_COURAGE_UNDERSTANDING_ABILITY_UPDATED_MESSAGE = () =>
  "The survivor's inner strength grows brighter."

/**
 * Survivor Courage Updated
 *
 * @returns Survivor Courage Updated Message
 */
export const SURVIVOR_COURAGE_UPDATED_MESSAGE = () =>
  'Courage burns brighter in the darkness.'

/**
 * Survivor Created
 *
 * @returns Survivor Created Message
 */
export const SURVIVOR_CREATED_MESSAGE = () =>
  'A lantern approaches. A new survivor emerges from the darkness.'

/**
 * Survivor Cursed Gear Removed
 *
 * @param name Survivor Name
 * @returns Survivor Cursed Gear Removed Message
 */
export const SURVIVOR_CURSED_GEAR_REMOVED_MESSAGE = (name?: string) =>
  `${name ?? 'Survivor'}'s cursed gear has been removed.`

/**
 * Survivor Cursed Gear Updated
 *
 * @param name Survivor Name
 * @param isNew Is New Cursed Gear
 * @returns Survivor Cursed Gear Updated Message
 */
export const SURVIVOR_CURSED_GEAR_UPDATED_MESSAGE = (
  name?: string,
  isNew = false
) =>
  isNew
    ? `${name ?? 'Survivor'}'s cursed gear has been added.`
    : `${name ?? 'Survivor'}'s cursed gear has been updated.`

/**
 * Survivor Dead Status Updated
 *
 * @param dead Dead Status
 * @returns Survivor Dead Status Updated Message
 */
export const SURVIVOR_DEAD_STATUS_UPDATED_MESSAGE = (dead: boolean) =>
  dead
    ? 'The darkness claims another soul. The survivor has fallen.'
    : 'Against all odds, life returns. The survivor lives again.'

/**
 * Survivor Disorder Limit Exceeded Error
 *
 * @returns Survivor Disorder Limit Exceeded Error Message
 */
export const SURVIVOR_DISORDER_LIMIT_EXCEEDED_ERROR_MESSAGE = () =>
  'A survivor can have at most 3 disorders.'

/**
 * Survivor Disorder Removed
 *
 * @returns Survivor Disorder Removed Message
 */
export const SURVIVOR_DISORDER_REMOVED_MESSAGE = () =>
  'The survivor has overcome their disorder.'

/**
 * Survivor Disorder Updated
 *
 * @param isNew Is New Disorder
 * @returns Survivor Disorder Updated Message
 */
export const SURVIVOR_DISORDER_UPDATED_MESSAGE = (isNew = false) =>
  isNew
    ? 'The survivor gains a new disorder.'
    : 'The disorder has been updated.'

/**
 * Survivor Disposition Updated
 *
 * @returns Survivor Disposition Updated Message
 */
export const SURVIVOR_DISPOSITION_UPDATED_MESSAGE = () =>
  "The wanderer's disposition shifts."

/**
 * Survivor Evasion Updated
 *
 * @returns Survivor Evasion Updated Message
 */
export const SURVIVOR_EVASION_UPDATED_MESSAGE = () =>
  'Grace in the face of death improves.'

/**
 * Survivor Faces in the Sky Trait Updated
 *
 * @returns Survivor Faces in the Sky Trait Updated Message
 */
export const SURVIVOR_FACES_IN_THE_SKY_TRAIT_UPDATED_MESSAGE = () =>
  'The stars align. Celestial traits recorded.'

/**
 * Survivor Fighting Art Removed
 *
 * @param isSecret Is Secret Fighting Art
 * @returns Survivor Fighting Art Removed Message
 */
export const SURVIVOR_FIGHTING_ART_REMOVED_MESSAGE = (isSecret = false) =>
  isSecret
    ? 'The secret fighting art has been banished from memory.'
    : 'The fighting art has been forgotten.'

/**
 * Survivor Fighting Art Updated
 *
 * @param isSecret Is Secret Fighting Art
 * @param isNew Is New Fighting Art
 * @returns Survivor Fighting Art Updated Message
 */
export const SURVIVOR_FIGHTING_ART_UPDATED_MESSAGE = (
  isSecret = false,
  isNew = false
) => {
  if (isNew) {
    return isSecret
      ? 'A new secret fighting art has been mastered.'
      : 'A new fighting art has been mastered.'
  }
  return isSecret
    ? 'The secret fighting art has been perfected.'
    : 'The fighting art has been perfected.'
}

/**
 * Survivor Gender Updated
 *
 * @returns Survivor Gender Updated Message
 */
export const SURVIVOR_GENDER_UPDATED_MESSAGE = () =>
  "The survivor's essence is recorded in the lantern's glow."

/**
 * Survivor Insanity Updated
 *
 * @param oldValue Old Value
 * @param newValue New Value
 * @returns Update Message
 */
export const SURVIVOR_INSANITY_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? 'The survivor gains insanity.'
    : oldValue > newValue
      ? 'The survivor loses insanity.'
      : "The survivor's insanity remains unchanged."

/**
 * Survivor Knowledge Observation Conditions Updated
 *
 * @returns Survivor Knowledge Observation Conditions Updated Message
 */
export const SURVIVOR_KNOWLEDGE_OBSERVATION_CONDITIONS_UPDATED_MESSAGE = () =>
  'Observation conditions etched in the darkness.'

/**
 * Survivor Knowledge Observation Rank Updated
 *
 * @returns Survivor Knowledge Observation Rank Updated Message
 */
export const SURVIVOR_KNOWLEDGE_OBSERVATION_RANK_UPDATED_MESSAGE = () =>
  'The lantern illuminates newfound wisdom.'

/**
 * Survivor Knowledge Rank Up Updated
 *
 * @param value Rank Up Value
 * @returns Survivor Knowledge Rank Up Updated Message
 */
export const SURVIVOR_KNOWLEDGE_RANK_UP_UPDATED_MESSAGE = (
  value: number | undefined
) =>
  value !== undefined
    ? 'Knowledge rank up milestone marked.'
    : 'Knowledge rank up milestone removed.'

/**
 * Survivor Knowledge Rules Updated
 *
 * @returns Survivor Knowledge Rules Updated Message
 */
export const SURVIVOR_KNOWLEDGE_RULES_UPDATED_MESSAGE = () =>
  'The rules of wisdom are inscribed in lantern light.'

/**
 * Survivor Knowledge Updated
 *
 * @param value Knowledge Value
 * @returns Survivor Knowledge Updated Message
 */
export const SURVIVOR_KNOWLEDGE_UPDATED_MESSAGE = (value: string) =>
  value
    ? 'Knowledge inscribed in the lantern light.'
    : 'Knowledge forgotten in the darkness.'

/**
 * Survivor Lifetime Reroll Used Updated
 *
 * @param used Lifetime Reroll Used
 * @returns Survivor Lifetime Reroll Used Updated Message
 */
export const SURVIVOR_LIFETIME_REROLL_USED_UPDATED_MESSAGE = (used: boolean) =>
  used
    ? 'The survivor has used their lifetime reroll.'
    : 'The survivor has regained their lifetime reroll.'

/**
 * Survivor Luck Updated
 *
 * @returns Survivor Luck Updated Message
 */
export const SURVIVOR_LUCK_UPDATED_MESSAGE = () =>
  'Fortune favors the desperate soul.'

/**
 * Survivor Lumi Updated
 *
 * @returns Survivor Lumi Updated Message
 */
export const SURVIVOR_LUMI_UPDATED_MESSAGE = () =>
  'Arc energy courses through enlightened veins.'

/**
 * Survivor Movement Updated
 *
 * @returns Survivor Movement Updated Message
 */
export const SURVIVOR_MOVEMENT_UPDATED_MESSAGE = () =>
  'Strides through darkness grow more confident.'

/**
 * Survivor Name Updated
 *
 * @returns Survivor Name Updated Message
 */
export const SURVIVOR_NAME_UPDATED_MESSAGE = () =>
  "The survivor's name echoes through the lantern light."

/**
 * Survivor Neurosis Updated
 *
 * @param value Neurosis Value
 * @returns Survivor Neurosis Updated Message
 */
export const SURVIVOR_NEUROSIS_UPDATED_MESSAGE = (value: string) =>
  value
    ? 'The neurosis manifests in the mind.'
    : 'The neurosis fades into darkness.'

/**
 * Survivor Next Departure Bonus Removed
 *
 * @returns Survivor Next Departure Bonus Removed Message
 */
export const SURVIVOR_NEXT_DEPARTURE_BONUS_REMOVED_MESSAGE = () =>
  'The lantern dims. Next departure bonus removed.'

/**
 * Survivor Next Departure Bonus Updated
 *
 * @param isNew Is New Next Departure Bonus
 * @returns Survivor Next Departure Bonus Updated Message
 */
export const SURVIVOR_NEXT_DEPARTURE_BONUS_UPDATED_MESSAGE = (isNew = false) =>
  isNew
    ? 'The lantern glows. Next departure bonus added.'
    : 'The lantern glows. Next departure bonus updated.'

/**
 * Survivor Not Found
 *
 * @returns Survivor Not Found Message
 */
export const SURVIVOR_NOT_FOUND_MESSAGE = () =>
  'Survivor not found in campaign data.'

/**
 * Survivor Notes Updated
 *
 * @returns Survivor Notes Updated Message
 */
export const SURVIVOR_NOTES_SAVED_MESSAGE = () =>
  'The survivor shares their tales, adding to the settlement chronicles.'

/**
 * Survivor On Hunt Error
 *
 * @returns Survivor On Hunt Error Message
 */
export const SURVIVOR_ON_HUNT_ERROR_MESSAGE = () =>
  'The survivor cannot be erased while on a hunt.'

/**
 * Survivor On Showdown Error
 *
 * @returns Survivor On Showdown Error Message
 */
export const SURVIVOR_ON_SHOWDOWN_ERROR_MESSAGE = () =>
  'The survivor cannot be erased while in a showdown.'

/**
 * Survivor Once Per Lifetime Event Removed
 *
 * @returns Survivor Once Per Lifetime Event Removed Message
 */
export const SURVIVOR_ONCE_PER_LIFETIME_EVENT_REMOVED_MESSAGE = () =>
  'A fleeting moment fades back into darkness.'

/**
 * Survivor Once Per Lifetime Event Updated
 *
 * @returns Survivor Once Per Lifetime Event Updated Message
 */
export const SURVIVOR_ONCE_PER_LIFETIME_EVENT_UPDATED_MESSAGE = () =>
  'A once-in-a-lifetime moment has been inscribed in memory.'

/**
 * Survivor Philosophy Rank Updated
 *
 * @returns Survivor Philosophy Rank Updated Message
 */
export const SURVIVOR_PHILOSOPHY_RANK_UPDATED_MESSAGE = () =>
  'Philosophy rank has been updated.'

/**
 * Survivor Philosophy Selected
 *
 * @param value Philosophy Value
 * @returns Survivor Philosophy Selected Message
 */
export const SURVIVOR_PHILOSOPHY_SELECTED_MESSAGE = (value: string) =>
  value
    ? 'The path of wisdom begins to illuminate the darkness.'
    : 'The philosophical path returns to shadow.'

/**
 * Survivor Removed
 *
 * @param survivorName Name of the survivor
 * @returns Survivor Removed Message
 */
export const SURVIVOR_REMOVED_MESSAGE = (survivorName: string | undefined) =>
  survivorName
    ? `Darkness overtook ${survivorName}. A voice cried out, and was suddenly silenced.`
    : 'A voice cried out, and was suddenly silenced.'

/**
 * Survivor Retired Status Updated
 *
 * @param retired Retired Status
 * @returns Survivor Retired Status Updated Message
 */
export const SURVIVOR_RETIRED_STATUS_UPDATED_MESSAGE = (retired: boolean) =>
  retired
    ? 'The survivor retires from the hunt, seeking peace in the settlement.'
    : 'The call of adventure stirs once more. The survivor returns from retirement.'

/**
 * Skip Next Hunt Updated
 *
 * @param skip Skip Next Hunt Flag
 * @returns Skip Next Hunt Updated Message
 */
export const SURVIVOR_SKIP_NEXT_HUNT_UPDATED_MESSAGE = (skip: boolean) =>
  skip
    ? 'The survivor will skip the next hunt.'
    : 'The survivor will not skip the next hunt.'

/**
 * Survivor Speed Updated
 *
 * @returns Survivor Speed Updated Message
 */
export const SURVIVOR_SPEED_UPDATED_MESSAGE = () =>
  'Swift as shadows, the survivor advances.'

/**
 * Survivor State Updated
 *
 * @param survivorName Survivor Name
 * @param state Survivor State
 * @returns Survivor State Updated Message
 */
export const SURVIVOR_STATE_UPDATED_MESSAGE = (
  survivorName: string,
  state: string
) => `${survivorName} is now ${state.toLowerCase()}.`

/**
 * Survivor Strength Updated
 *
 * @returns Survivor Strength Updated Message
 */
export const SURVIVOR_STRENGTH_UPDATED_MESSAGE = () =>
  'Muscles forged in adversity grow stronger.'

/**
 * Survivor Survival Updated
 *
 * @param oldValue Old Value
 * @param newValue New Value
 * @returns Update Message
 */
export const SURVIVOR_SURVIVAL_UPDATED_MESSAGE = (
  oldValue: number,
  newValue: number
) =>
  oldValue < newValue
    ? 'The survivor gains survival.'
    : oldValue > newValue
      ? 'The survivor loses survival.'
      : "The survivor's survival remains unchanged."

/**
 * Survivor Systemic Pressure Updated
 *
 * @returns Survivor Systemic Pressure Updated Message
 */
export const SURVIVOR_SYSTEMIC_PRESSURE_UPDATED_MESSAGE = () =>
  'Systemic pressure updated successfully.'

/**
 * Survivor Tenet Knowledge Observation Conditions Updated
 *
 * @param value Tenet Knowledge Observation Conditions Value
 * @returns Survivor Tenet Knowledge Observation Conditions Updated Message
 */
export const SURVIVOR_TENET_KNOWLEDGE_OBSERVATION_CONDITIONS_UPDATED_MESSAGE = (
  value: string
) =>
  value
    ? "Observation conditions are recorded in the survivor's memory."
    : 'The conditions vanish into the void.'

/**
 * Survivor Tenet Knowledge Observation Rank Updated
 *
 * @param isRankUp Is Rank Up
 * @param rank Observation Rank
 * @returns Survivor Tenet Knowledge Observation Rank Updated Message
 */
export const SURVIVOR_TENET_KNOWLEDGE_OBSERVATION_RANK_UPDATED_MESSAGE = (
  isRankUp: boolean,
  rank: number
) =>
  isRankUp
    ? 'Wisdom ascends through knowledge and understanding. Rank up achieved!'
    : `Observation rank ${rank} burns bright in the lantern's glow.`

/**
 * Survivor Tenet Knowledge Rank Up Updated
 *
 * @param value Rank Up Value
 * @returns Survivor Tenet Knowledge Rank Up Updated Message
 */
export const SURVIVOR_TENET_KNOWLEDGE_RANK_UP_UPDATED_MESSAGE = (
  value: number | undefined
) =>
  value !== undefined
    ? 'Tenet knowledge rank up milestone marked.'
    : 'Tenet knowledge rank up milestone removed.'

/**
 * Survivor Tenet Knowledge Rules Updated
 *
 * @param value Tenet Knowledge Rules Value
 * @returns Survivor Tenet Knowledge Rules Updated Message
 */
export const SURVIVOR_TENET_KNOWLEDGE_RULES_UPDATED_MESSAGE = (
  value: string
) =>
  value
    ? 'The rules of knowledge are etched in stone.'
    : 'The rules fade back into mystery.'

/**
 * Survivor Tenet Knowledge Updated
 *
 * @param value Tenet Knowledge Value
 * @returns Survivor Tenet Knowledge Updated Message
 */
export const SURVIVOR_TENET_KNOWLEDGE_UPDATED_MESSAGE = (value: string) =>
  value
    ? 'Tenet knowledge is inscribed in memory.'
    : 'Tenet knowledge dissolves into shadow.'

/**
 * Survivor Torment Updated
 *
 * @returns Survivor Torment Updated Message
 */
export const SURVIVOR_TORMENT_UPDATED_MESSAGE = () => 'Torment level updated.'

/**
 * Survivor Understanding Updated
 *
 * @returns Survivor Understanding Updated Message
 */
export const SURVIVOR_UNDERSTANDING_UPDATED_MESSAGE = () =>
  'Understanding illuminates the path forward.'

/**
 * Survivor Weapon Proficiency Master Achieved
 *
 * @returns Survivor Weapon Proficiency Master Achieved Message
 */
export const SURVIVOR_WEAPON_PROFICIENCY_MASTER_ACHIEVED_MESSAGE = () =>
  'The survivor achieves mastery beyond mortal limits.'

/**
 * Survivor Weapon Proficiency Specialist Achieved
 *
 * @returns Survivor Weapon Proficiency Specialist Achieved Message
 */
export const SURVIVOR_WEAPON_PROFICIENCY_SPECIALIST_ACHIEVED_MESSAGE = () =>
  'The survivor becomes a specialist in their craft.'

/**
 * Survivor Weapon Proficiency Updated
 *
 * @returns Survivor Weapon Proficiency Updated Message
 */
export const SURVIVOR_WEAPON_PROFICIENCY_UPDATED_MESSAGE = () =>
  'The survivor hones their weapon proficiency.'

/**
 * Survivor Weapon Type Updated
 *
 * @returns Survivor Weapon Type Updated Message
 */
export const SURVIVOR_WEAPON_TYPE_UPDATED_MESSAGE = () =>
  'The survivor turns their focus to a new weapon.'

/**
 * Survivors Healed
 *
 * @returns Survivors Healed Message
 */
export const SURVIVORS_HEALED_MESSAGE = () => 'Survivors healed.'

/**
 * Survivors Moved on the Hunt Board
 *
 * @returns Survivors Moved Message
 */
export const SURVIVORS_MOVED_MESSAGE = () => 'Survivors moved.'

/**
 * Systemic Pressure Minimum Error
 *
 * @returns Systemic Pressure Minimum Error Message
 */
export const SYSTEMIC_PRESSURE_MINIMUM_ERROR_MESSAGE = () =>
  'Systemic pressure cannot be negative.'

/**
 * Timeline Event Empty Error
 *
 * @returns Timeline Event Empty Error Message
 */
export const TIMELINE_EVENT_EMPTY_ERROR_MESSAGE = () =>
  'Cannot save an empty event!'

/**
 * Timeline Event Empty Warning
 *
 * @returns Timeline Event Empty Warning Message
 */
export const TIMELINE_EVENT_EMPTY_WARNING_MESSAGE = () =>
  'Finish editing the current event before adding another.'

/**
 * Timeline Event Removed
 *
 * @returns Timeline Event Removed Message
 */
export const TIMELINE_EVENT_REMOVED_MESSAGE = () =>
  'The chronicle is altered - a memory fades into darkness.'

/**
 * Timeline Event Saved
 *
 * @returns Timeline Event Saved Message
 */
export const TIMELINE_EVENT_SAVED_MESSAGE = () =>
  'The chronicles remember - a memory is etched in stone.'

/**
 * Timeline Year Added
 *
 * @returns Timeline Year Added Message
 */
export const TIMELINE_YEAR_ADDED_MESSAGE = () =>
  'A new lantern year is added - the chronicles expand.'

/**
 * Timeline Year Completed
 *
 * @param completed Year Completion Status
 * @returns Timeline Year Completed Message
 */
export const TIMELINE_YEAR_COMPLETED_MESSAGE = (completed: boolean) =>
  completed ? 'The year concludes in triumph.' : 'The year remains unfinished.'

/**
 * Torment Minimum Error
 *
 * @returns Torment Minimum Error Message
 */
export const TORMENT_MINIMUM_ERROR_MESSAGE = () => 'Torment cannot be negative.'

/**
 * Trait Created
 *
 * @returns Trait Created Message
 */
export const TRAIT_CREATED_MESSAGE = () => 'A new trait emerges.'

/**
 * Trait Removed
 *
 * @returns Trait Removed Message
 */
export const TRAIT_REMOVED_MESSAGE = () => 'The trait fades from memory.'

/**
 * Trait Updated
 *
 * @returns Trait Updated Message
 */
export const TRAIT_UPDATED_MESSAGE = () => 'The trait has been updated.'
