import { describe, expect, it } from 'vitest'

import {
  AmbushType,
  ColorChoice,
  MonsterType,
  SurvivorType,
  TurnType
} from '@/lib/enums'
import {
  ABILITY_IMPAIRMENT_REMOVED_MESSAGE,
  ABILITY_IMPAIRMENT_UPDATED_MESSAGE,
  AMBUSH_MESSAGE,
  ARRIVAL_BONUS_REMOVED_MESSAGE,
  ARRIVAL_BONUS_UPDATED_MESSAGE,
  CAMPAIGN_UNLOCK_KILLENIUM_BUTCHER_UPDATED_MESSAGE,
  CAMPAIGN_UNLOCK_SCREAMING_NUKALOPE_UPDATED_MESSAGE,
  CAMPAIGN_UNLOCK_WHITE_GIGALION_UPDATED_MESSAGE,
  CHARACTER_CREATED_MESSAGE,
  CHARACTER_DELETED_MESSAGE,
  CHARACTER_UPDATED_MESSAGE,
  COLLECTIVE_COGNITION_REWARD_CREATED_MESSAGE,
  COLLECTIVE_COGNITION_REWARD_NO_TARGET_ERROR_MESSAGE,
  COLLECTIVE_COGNITION_REWARD_REMOVED_MESSAGE,
  COLLECTIVE_COGNITION_REWARD_SAVED_MESSAGE,
  COLLECTIVE_COGNITION_REWARD_UPDATED_MESSAGE,
  COLLECTIVE_COGNITION_VICTORY_SAVED_MESSAGE,
  COMBAT_ARMS_UPDATED_MESSAGE,
  COMBAT_BODY_UPDATED_MESSAGE,
  COMBAT_HEAD_UPDATED_MESSAGE,
  COMBAT_LEGS_UPDATED_MESSAGE,
  COMBAT_WAIST_UPDATED_MESSAGE,
  CUSTOM_MONSTER_CREATED_MESSAGE,
  CUSTOM_MONSTER_DELETED_MESSAGE,
  CUSTOM_MONSTER_UPDATED_MESSAGE,
  DEPARTING_BONUS_REMOVED_MESSAGE,
  DEPARTING_BONUS_UPDATED_MESSAGE,
  DISABLE_TOASTS_SETTING_UPDATED_MESSAGE,
  DISORDER_CREATED_MESSAGE,
  DISORDER_REMOVED_MESSAGE,
  DISORDER_UPDATED_MESSAGE,
  EMBARK_GEAR_SHORTAGE_ERROR_MESSAGE,
  ENDEAVORS_MINIMUM_ERROR_MESSAGE,
  ENDEAVORS_UPDATED_MESSAGE,
  ERROR_MESSAGE,
  FIGHTING_ART_CREATED_MESSAGE,
  FIGHTING_ART_REMOVED_MESSAGE,
  FIGHTING_ART_UPDATED_MESSAGE,
  FIGHTING_ARTS_MAX_EXCEEDED_ERROR_MESSAGE,
  GEAR_CRAFTED_MESSAGE,
  GEAR_CREATED_MESSAGE,
  GEAR_GRID_CLEARED_MESSAGE,
  GEAR_GRID_SETTLEMENT_REQUIRED_ERROR_MESSAGE,
  GEAR_GRID_SLOT_CLEARED_MESSAGE,
  GEAR_GRID_SLOT_EQUIPPED_MESSAGE,
  GEAR_REMOVED_MESSAGE,
  GEAR_UPDATED_MESSAGE,
  HUNT_ALREADY_ACTIVE_ERROR_MESSAGE,
  HUNT_BEGINS_MESSAGE,
  HUNT_DELETED_MESSAGE,
  HUNT_NOTES_SAVED_MESSAGE,
  HUNT_XP_RANK_UP_ACHIEVED_MESSAGE,
  HUNT_XP_RANK_UP_MILESTONE_ADDED_MESSAGE,
  HUNT_XP_RANK_UP_MILESTONE_REMOVED_MESSAGE,
  HUNT_XP_UPDATED_MESSAGE,
  INNOVATION_CREATED_MESSAGE,
  INNOVATION_REMOVED_MESSAGE,
  INNOVATION_UPDATED_MESSAGE,
  INSANITY_MINIMUM_ERROR_MESSAGE,
  KNOWLEDGE_CREATED_MESSAGE,
  KNOWLEDGE_REMOVED_MESSAGE,
  KNOWLEDGE_UPDATED_MESSAGE,
  LANTERN_RESEARCH_LEVEL_MINIMUM_ERROR,
  LANTERN_RESEARCH_LEVEL_UPDATED_MESSAGE,
  LOCATION_CREATED_MESSAGE,
  LOCATION_REMOVED_MESSAGE,
  LOCATION_UNLOCKED_MESSAGE,
  LOCATION_UPDATED_MESSAGE,
  LOST_SETTLEMENT_COUNT_MINIMUM_ERROR,
  LOST_SETTLEMENT_COUNT_UPDATED_MESSAGE,
  MILESTONE_COMPLETED_MESSAGE,
  MILESTONE_CREATED_MESSAGE,
  MILESTONE_MISSING_EVENT_ERROR,
  MILESTONE_REMOVED_MESSAGE,
  MILESTONE_UPDATED_MESSAGE,
  MONSTER_ACCURACY_TOKENS_UPDATED_MESSAGE,
  MONSTER_ACCURACY_UPDATED_MESSAGE,
  MONSTER_AI_DECK_UPDATED_MESSAGE,
  MONSTER_DAMAGE_TOKENS_UPDATED_MESSAGE,
  MONSTER_EVASION_TOKENS_UPDATED_MESSAGE,
  MONSTER_EVASION_UPDATED_MESSAGE,
  MONSTER_LEVEL_MISSING_MESSAGE,
  MONSTER_LUCK_TOKENS_UPDATED_MESSAGE,
  MONSTER_LUCK_UPDATED_MESSAGE,
  MONSTER_MOVED_MESSAGE,
  MONSTER_MOVEMENT_TOKENS_UPDATED_MESSAGE,
  MONSTER_MOVEMENT_UPDATED_MESSAGE,
  MONSTER_SPEED_TOKENS_UPDATED_MESSAGE,
  MONSTER_SPEED_UPDATED_MESSAGE,
  MONSTER_STARTS_SHOWDOWN_KNOCKED_DOWN_MESSAGE,
  MONSTER_STATS_SAVED_MESSAGE,
  MONSTER_STRENGTH_TOKENS_UPDATED_MESSAGE,
  MONSTER_STRENGTH_UPDATED_MESSAGE,
  MONSTER_TOUGHNESS_UPDATED_MESSAGE,
  MONSTER_VOLUME_REMOVED_MESSAGE,
  MONSTER_VOLUME_UPDATED_MESSAGE,
  MONSTER_WOUND_DECK_UPDATED_MESSAGE,
  MOOD_CREATED_MESSAGE,
  MOOD_REMOVED_MESSAGE,
  MOOD_UPDATED_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE,
  NEMESIS_ADDED_MESSAGE,
  NEMESIS_DEFEATED_MESSAGE,
  NEMESIS_REMOVED_MESSAGE,
  NEMESIS_UNLOCKED_MESSAGE,
  NEMESIS_UPDATED_MESSAGE,
  NEUROSIS_CREATED_MESSAGE,
  NEUROSIS_REMOVED_MESSAGE,
  NEUROSIS_UPDATED_MESSAGE,
  PATTERN_CREATED_MESSAGE,
  PATTERN_REMOVED_MESSAGE,
  PATTERN_UPDATED_MESSAGE,
  PHILOSOPHY_CREATED_MESSAGE,
  PHILOSOPHY_RANK_MINIMUM_ERROR,
  PHILOSOPHY_REMOVED_MESSAGE,
  PHILOSOPHY_UPDATED_MESSAGE,
  PRINCIPLE_CREATED_MESSAGE,
  PRINCIPLE_OPTION_SELECTED_MESSAGE,
  PRINCIPLE_REMOVED_MESSAGE,
  PRINCIPLE_UPDATED_MESSAGE,
  QUARRY_ADDED_MESSAGE,
  QUARRY_REMOVED_MESSAGE,
  QUARRY_UNLOCKED_MESSAGE,
  QUARRY_UPDATED_MESSAGE,
  RESOURCE_CREATED_MESSAGE,
  RESOURCE_REMOVED_MESSAGE,
  RESOURCE_UPDATED_MESSAGE,
  SCOUT_CONFLICT_MESSAGE,
  SCOUT_REQUIRED_MESSAGE,
  SECRET_FIGHTING_ART_CREATED_MESSAGE,
  SECRET_FIGHTING_ART_REMOVED_MESSAGE,
  SECRET_FIGHTING_ART_UPDATED_MESSAGE,
  SECRET_FIGHTING_ARTS_MAX_EXCEEDED_ERROR_MESSAGE,
  SEED_PATTERN_CREATED_MESSAGE,
  SEED_PATTERN_REMOVED_MESSAGE,
  SEED_PATTERN_UPDATED_MESSAGE,
  SETTLEMENT_CREATED_MESSAGE,
  SETTLEMENT_DELETED_MESSAGE,
  SETTLEMENT_LOADED_MESSAGE,
  SETTLEMENT_NOTES_SAVED_MESSAGE,
  SETTLEMENT_PHASE_ENDED_MESSAGE,
  SETTLEMENT_PHASE_STARTED_MESSAGE,
  SETTLEMENT_PHASE_STEP_UPDATED_MESSAGE,
  SETTLEMENT_SAVED_MESSAGE,
  SETTLEMENT_USES_SCOUTS_SETTING_UPDATED_MESSAGE,
  SHOWDOWN_ALREADY_ACTIVE_ERROR_MESSAGE,
  SHOWDOWN_CREATED_MESSAGE,
  SHOWDOWN_DELETED_MESSAGE,
  SHOWDOWN_MONSTER_KNOCKED_DOWN_MESSAGE,
  SHOWDOWN_NOTES_SAVED_MESSAGE,
  SHOWDOWN_TURN_MESSAGE,
  SQUIRE_SUSPICION_UPDATED_MESSAGE,
  STRAIN_MILESTONE_CREATED_MESSAGE,
  STRAIN_MILESTONE_REMOVED_MESSAGE,
  STRAIN_MILESTONE_UPDATED_MESSAGE,
  STRIPE_CHECKOUT_CANCELLED_MESSAGE,
  STRIPE_CHECKOUT_SUCCESS_MESSAGE,
  SURVIVAL_LIMIT_EXCEEDED_ERROR_MESSAGE,
  SURVIVAL_LIMIT_MINIMUM_ERROR_MESSAGE,
  SURVIVAL_LIMIT_UPDATED_MESSAGE,
  SURVIVAL_MINIMUM_ERROR_MESSAGE,
  SURVIVOR_ACCURACY_UPDATED_MESSAGE,
  SURVIVOR_ATTRIBUTE_TOKEN_UPDATED_MESSAGE,
  SURVIVOR_BASE_ATTRIBUTE_UPDATED_MESSAGE,
  SURVIVOR_BRAIN_LIGHT_DAMAGE_UPDATED_MESSAGE,
  SURVIVOR_CAN_DASH_UPDATED_MESSAGE,
  SURVIVOR_CAN_DODGE_UPDATED_MESSAGE,
  SURVIVOR_CAN_ENCOURAGE_UPDATED_MESSAGE,
  SURVIVOR_CAN_ENDURE_UPDATED_MESSAGE,
  SURVIVOR_CAN_FIST_PUMP_UPDATED_MESSAGE,
  SURVIVOR_CAN_SPEND_SURVIVAL_UPDATED_MESSAGE,
  SURVIVOR_CAN_SURGE_UPDATED_MESSAGE,
  SURVIVOR_CAN_USE_FIGHTING_ARTS_OR_KNOWLEDGES_UPDATED_MESSAGE,
  SURVIVOR_CAN_USE_FIGHTING_ARTS_UPDATED_MESSAGE,
  SURVIVOR_COLOR_CHANGED_MESSAGE,
  SURVIVOR_COURAGE_UNDERSTANDING_ABILITY_UPDATED_MESSAGE,
  SURVIVOR_COURAGE_UPDATED_MESSAGE,
  SURVIVOR_CREATED_MESSAGE,
  SURVIVOR_CURSED_GEAR_REMOVED_MESSAGE,
  SURVIVOR_CURSED_GEAR_UPDATED_MESSAGE,
  SURVIVOR_DEAD_STATUS_UPDATED_MESSAGE,
  SURVIVOR_DISORDER_LIMIT_EXCEEDED_ERROR_MESSAGE,
  SURVIVOR_DISORDER_REMOVED_MESSAGE,
  SURVIVOR_DISORDER_UPDATED_MESSAGE,
  SURVIVOR_DISPOSITION_UPDATED_MESSAGE,
  SURVIVOR_EVASION_UPDATED_MESSAGE,
  SURVIVOR_FACES_IN_THE_SKY_TRAIT_UPDATED_MESSAGE,
  SURVIVOR_FIGHTING_ART_REMOVED_MESSAGE,
  SURVIVOR_FIGHTING_ART_UPDATED_MESSAGE,
  SURVIVOR_GENDER_UPDATED_MESSAGE,
  SURVIVOR_INSANITY_UPDATED_MESSAGE,
  SURVIVOR_KNOWLEDGE_OBSERVATION_CONDITIONS_UPDATED_MESSAGE,
  SURVIVOR_KNOWLEDGE_OBSERVATION_RANK_UPDATED_MESSAGE,
  SURVIVOR_KNOWLEDGE_RANK_UP_UPDATED_MESSAGE,
  SURVIVOR_KNOWLEDGE_RULES_UPDATED_MESSAGE,
  SURVIVOR_KNOWLEDGE_UPDATED_MESSAGE,
  SURVIVOR_LIFETIME_REROLL_USED_UPDATED_MESSAGE,
  SURVIVOR_LUCK_UPDATED_MESSAGE,
  SURVIVOR_LUMI_UPDATED_MESSAGE,
  SURVIVOR_MOVEMENT_UPDATED_MESSAGE,
  SURVIVOR_NAME_UPDATED_MESSAGE,
  SURVIVOR_NEUROSIS_UPDATED_MESSAGE,
  SURVIVOR_NEXT_DEPARTURE_BONUS_REMOVED_MESSAGE,
  SURVIVOR_NEXT_DEPARTURE_BONUS_UPDATED_MESSAGE,
  SURVIVOR_NOT_FOUND_MESSAGE,
  SURVIVOR_NOTES_SAVED_MESSAGE,
  SURVIVOR_ON_HUNT_ERROR_MESSAGE,
  SURVIVOR_ON_SHOWDOWN_ERROR_MESSAGE,
  SURVIVOR_ONCE_PER_LIFETIME_EVENT_REMOVED_MESSAGE,
  SURVIVOR_ONCE_PER_LIFETIME_EVENT_UPDATED_MESSAGE,
  SURVIVOR_PHILOSOPHY_RANK_UPDATED_MESSAGE,
  SURVIVOR_PHILOSOPHY_SELECTED_MESSAGE,
  SURVIVOR_REMOVED_MESSAGE,
  SURVIVOR_RETIRED_STATUS_UPDATED_MESSAGE,
  SURVIVOR_SKIP_NEXT_HUNT_UPDATED_MESSAGE,
  SURVIVOR_SPEED_UPDATED_MESSAGE,
  SURVIVOR_STATE_UPDATED_MESSAGE,
  SURVIVOR_STRENGTH_UPDATED_MESSAGE,
  SURVIVOR_SURVIVAL_UPDATED_MESSAGE,
  SURVIVOR_SYSTEMIC_PRESSURE_UPDATED_MESSAGE,
  SURVIVOR_TENET_KNOWLEDGE_OBSERVATION_CONDITIONS_UPDATED_MESSAGE,
  SURVIVOR_TENET_KNOWLEDGE_OBSERVATION_RANK_UPDATED_MESSAGE,
  SURVIVOR_TENET_KNOWLEDGE_RANK_UP_UPDATED_MESSAGE,
  SURVIVOR_TENET_KNOWLEDGE_RULES_UPDATED_MESSAGE,
  SURVIVOR_TENET_KNOWLEDGE_UPDATED_MESSAGE,
  SURVIVOR_TORMENT_UPDATED_MESSAGE,
  SURVIVOR_UNDERSTANDING_UPDATED_MESSAGE,
  SURVIVOR_WEAPON_PROFICIENCY_MASTER_ACHIEVED_MESSAGE,
  SURVIVOR_WEAPON_PROFICIENCY_SPECIALIST_ACHIEVED_MESSAGE,
  SURVIVOR_WEAPON_PROFICIENCY_UPDATED_MESSAGE,
  SURVIVOR_WEAPON_TYPE_UPDATED_MESSAGE,
  SURVIVORS_HEALED_MESSAGE,
  SURVIVORS_MOVED_MESSAGE,
  SYSTEMIC_PRESSURE_MINIMUM_ERROR_MESSAGE,
  TIMELINE_EVENT_EMPTY_ERROR_MESSAGE,
  TIMELINE_EVENT_EMPTY_WARNING_MESSAGE,
  TIMELINE_EVENT_REMOVED_MESSAGE,
  TIMELINE_EVENT_SAVED_MESSAGE,
  TIMELINE_YEAR_ADDED_MESSAGE,
  TIMELINE_YEAR_COMPLETED_MESSAGE,
  TORMENT_MINIMUM_ERROR_MESSAGE,
  TRAIT_CREATED_MESSAGE,
  TRAIT_REMOVED_MESSAGE,
  TRAIT_UPDATED_MESSAGE,
  WANDERER_CREATED_MESSAGE,
  WANDERER_REMOVED_MESSAGE,
  WANDERER_UPDATED_MESSAGE,
  WEAPON_TYPE_CREATED_MESSAGE,
  WEAPON_TYPE_REMOVED_MESSAGE,
  WEAPON_TYPE_UPDATED_MESSAGE
} from '@/lib/messages'

describe('ABILITY_IMPAIRMENT_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(ABILITY_IMPAIRMENT_REMOVED_MESSAGE()).toBe(
      'The ability/impairment has been removed.'
    )
  })
})

describe('ABILITY_IMPAIRMENT_UPDATED_MESSAGE', () => {
  it('returns new message when isNew is true', () => {
    expect(ABILITY_IMPAIRMENT_UPDATED_MESSAGE(true)).toBe(
      'The survivor gains a new ability/impairment.'
    )
  })

  it('returns updated message when isNew is false', () => {
    expect(ABILITY_IMPAIRMENT_UPDATED_MESSAGE(false)).toBe(
      'The ability/impairment has been updated.'
    )
  })
})

describe('AMBUSH_MESSAGE', () => {
  it('returns survivors ambush message', () => {
    expect(AMBUSH_MESSAGE(AmbushType.SURVIVORS)).toBe(
      'The survivors ambush their quarry! The showdown begins.'
    )
  })

  it('returns no ambush message', () => {
    expect(AMBUSH_MESSAGE(AmbushType.NONE)).toBe(
      'The hunt reaches its epic climax! The showdown begins.'
    )
  })

  it('returns monster ambush message', () => {
    expect(AMBUSH_MESSAGE(AmbushType.MONSTER)).toBe(
      'The monster ambushes the survivors! The showdown begins.'
    )
  })

  it('returns default message for unknown ambush type', () => {
    expect(AMBUSH_MESSAGE('unknown' as AmbushType)).toBe('The showdown begins.')
  })
})

describe('ARRIVAL_BONUS_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(ARRIVAL_BONUS_REMOVED_MESSAGE()).toBe(
      'A blessing fades into the void.'
    )
  })
})

describe('ARRIVAL_BONUS_UPDATED_MESSAGE', () => {
  it('returns inscribed message when index is undefined', () => {
    expect(ARRIVAL_BONUS_UPDATED_MESSAGE(undefined)).toBe(
      'The blessing has been inscribed.'
    )
  })

  it('returns new blessing message when index is defined', () => {
    expect(ARRIVAL_BONUS_UPDATED_MESSAGE(0)).toBe(
      'A new blessing graces your settlement.'
    )
    expect(ARRIVAL_BONUS_UPDATED_MESSAGE(5)).toBe(
      'A new blessing graces your settlement.'
    )
  })
})

describe('CAMPAIGN_UNLOCK_KILLENIUM_BUTCHER_UPDATED_MESSAGE', () => {
  it('returns accepts challenge message when unlocked', () => {
    expect(CAMPAIGN_UNLOCK_KILLENIUM_BUTCHER_UPDATED_MESSAGE(true)).toBe(
      'Killenium Butcher accepts your challenge.'
    )
  })

  it('returns retreats message when locked', () => {
    expect(CAMPAIGN_UNLOCK_KILLENIUM_BUTCHER_UPDATED_MESSAGE(false)).toBe(
      'Killenium Butcher retreats into the darkness.'
    )
  })
})

describe('CAMPAIGN_UNLOCK_SCREAMING_NUKALOPE_UPDATED_MESSAGE', () => {
  it('returns accepts challenge message when unlocked', () => {
    expect(CAMPAIGN_UNLOCK_SCREAMING_NUKALOPE_UPDATED_MESSAGE(true)).toBe(
      'Screaming Nukalope accepts your challenge.'
    )
  })

  it('returns retreats message when locked', () => {
    expect(CAMPAIGN_UNLOCK_SCREAMING_NUKALOPE_UPDATED_MESSAGE(false)).toBe(
      'Screaming Nukalope retreats into the darkness.'
    )
  })
})

describe('CAMPAIGN_UNLOCK_WHITE_GIGALION_UPDATED_MESSAGE', () => {
  it('returns accepts challenge message when unlocked', () => {
    expect(CAMPAIGN_UNLOCK_WHITE_GIGALION_UPDATED_MESSAGE(true)).toBe(
      'White Gigalion accepts your challenge.'
    )
  })

  it('returns retreats message when locked', () => {
    expect(CAMPAIGN_UNLOCK_WHITE_GIGALION_UPDATED_MESSAGE(false)).toBe(
      'White Gigalion retreats into the darkness.'
    )
  })
})

describe('COLLECTIVE_COGNITION_REWARD_NO_TARGET_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(COLLECTIVE_COGNITION_REWARD_NO_TARGET_ERROR_MESSAGE()).toBe(
      'A reward must have a collective cognition target.'
    )
  })
})

describe('COLLECTIVE_COGNITION_REWARD_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(COLLECTIVE_COGNITION_REWARD_CREATED_MESSAGE()).toBe(
      'A new collective cognition reward is forged.'
    )
  })
})

describe('COLLECTIVE_COGNITION_REWARD_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(COLLECTIVE_COGNITION_REWARD_REMOVED_MESSAGE()).toBe(
      'The dark gift fades into nothing.'
    )
  })
})

describe('COLLECTIVE_COGNITION_REWARD_SAVED_MESSAGE', () => {
  it('returns granted message when unlocked', () => {
    expect(COLLECTIVE_COGNITION_REWARD_SAVED_MESSAGE(true)).toBe(
      'Reward granted by the darkness.'
    )
  })

  it('returns recedes message when locked', () => {
    expect(COLLECTIVE_COGNITION_REWARD_SAVED_MESSAGE(false)).toBe(
      'The dark gift recedes into shadow.'
    )
  })
})

describe('COLLECTIVE_COGNITION_REWARD_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(COLLECTIVE_COGNITION_REWARD_UPDATED_MESSAGE()).toBe(
      "The settlement's culinary knowledge expands."
    )
  })
})

describe('COLLECTIVE_COGNITION_VICTORY_SAVED_MESSAGE', () => {
  it('returns victory message', () => {
    expect(COLLECTIVE_COGNITION_VICTORY_SAVED_MESSAGE(true)).toBe(
      "The settlement's legacy grows stronger."
    )
  })

  it('returns setback message', () => {
    expect(COLLECTIVE_COGNITION_VICTORY_SAVED_MESSAGE(false)).toBe(
      "The settlement's legacy endures despite setbacks."
    )
  })
})

describe('COMBAT_ARMS_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(COMBAT_ARMS_UPDATED_MESSAGE()).toBe('Arms endure another battle.')
  })
})

describe('COMBAT_BODY_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(COMBAT_BODY_UPDATED_MESSAGE()).toBe(
      'The body bears the scars of survival.'
    )
  })
})

describe('COMBAT_HEAD_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(COMBAT_HEAD_UPDATED_MESSAGE()).toBe(
      'The mind remains sharp despite the trauma.'
    )
  })
})

describe('COMBAT_LEGS_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(COMBAT_LEGS_UPDATED_MESSAGE()).toBe(
      'Legs steady for the journey ahead.'
    )
  })
})

describe('COMBAT_WAIST_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(COMBAT_WAIST_UPDATED_MESSAGE()).toBe(
      'The core strengthens against the darkness.'
    )
  })
})

describe('CUSTOM_MONSTER_CREATED_MESSAGE', () => {
  it('returns nemesis message for NEMESIS type', () => {
    expect(CUSTOM_MONSTER_CREATED_MESSAGE(MonsterType.NEMESIS)).toBe(
      'A new nemesis emerges from the shadows.'
    )
  })

  it('returns quarry message for QUARRY type', () => {
    expect(CUSTOM_MONSTER_CREATED_MESSAGE(MonsterType.QUARRY)).toBe(
      'A new quarry stalks the land.'
    )
  })
})

describe('CHARACTER_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(CHARACTER_CREATED_MESSAGE()).toBe(
      'A new character emerges from the shadows.'
    )
  })
})

describe('CHARACTER_DELETED_MESSAGE', () => {
  it('returns message with character name', () => {
    expect(CHARACTER_DELETED_MESSAGE('Cain')).toBe(
      'Cain fades back into the darkness.'
    )
  })

  it('returns message without character name', () => {
    expect(CHARACTER_DELETED_MESSAGE()).toBe(
      'Character fades back into the darkness.'
    )
  })
})

describe('CHARACTER_UPDATED_MESSAGE', () => {
  it('returns message with character name', () => {
    expect(CHARACTER_UPDATED_MESSAGE('Elle')).toBe(
      "Elle has been reshaped by the lantern's light."
    )
  })

  it('returns message without character name', () => {
    expect(CHARACTER_UPDATED_MESSAGE()).toBe(
      "Character has been reshaped by the lantern's light."
    )
  })
})

describe('CUSTOM_MONSTER_DELETED_MESSAGE', () => {
  it('returns message with monster name', () => {
    expect(CUSTOM_MONSTER_DELETED_MESSAGE('White Lion')).toBe(
      'White Lion fades back into the darkness.'
    )
  })

  it('returns message without monster name', () => {
    expect(CUSTOM_MONSTER_DELETED_MESSAGE()).toBe(
      'Monster fades back into the darkness.'
    )
  })
})

describe('CUSTOM_MONSTER_UPDATED_MESSAGE', () => {
  it('returns nemesis message', () => {
    expect(CUSTOM_MONSTER_UPDATED_MESSAGE(MonsterType.NEMESIS)).toBe(
      'The nemesis adapts to your will.'
    )
  })

  it('returns quarry message', () => {
    expect(CUSTOM_MONSTER_UPDATED_MESSAGE(MonsterType.QUARRY)).toBe(
      'The quarry shifts in the darkness.'
    )
  })
})

describe('DEPARTING_BONUS_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(DEPARTING_BONUS_REMOVED_MESSAGE()).toBe(
      'A blessing fades into the void.'
    )
  })
})

describe('DEPARTING_BONUS_UPDATED_MESSAGE', () => {
  it('returns inscribed message when index is defined', () => {
    expect(DEPARTING_BONUS_UPDATED_MESSAGE(0)).toBe(
      'The blessing has been inscribed.'
    )
  })

  it('returns new blessing message when index is undefined', () => {
    expect(DEPARTING_BONUS_UPDATED_MESSAGE(undefined)).toBe(
      'A new blessing graces your settlement.'
    )
  })
})

describe('ENDEAVORS_MINIMUM_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(ENDEAVORS_MINIMUM_ERROR_MESSAGE()).toBe(
      'Endeavors cannot be reduced below 0.'
    )
  })
})

describe('ENDEAVORS_UPDATED_MESSAGE', () => {
  it('returns gains message when newValue > oldValue', () => {
    expect(ENDEAVORS_UPDATED_MESSAGE(0, 5)).toBe(
      'The settlement gains endeavors.'
    )
  })

  it('returns loses message when newValue < oldValue', () => {
    expect(ENDEAVORS_UPDATED_MESSAGE(5, 0)).toBe(
      'The settlement loses endeavors.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(ENDEAVORS_UPDATED_MESSAGE(3, 3)).toBe(
      "The settlement's endeavors remain unchanged."
    )
  })
})

describe('ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(ERROR_MESSAGE()).toBe(
      'The darkness swallows your words. Please try again.'
    )
  })
})

describe('DISORDER_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(DISORDER_CREATED_MESSAGE()).toBe(
      'A new affliction takes root in the darkness.'
    )
  })
})

describe('DISORDER_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(DISORDER_REMOVED_MESSAGE()).toBe(
      'The affliction fades from the settlement.'
    )
  })
})

describe('DISORDER_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(DISORDER_UPDATED_MESSAGE()).toBe(
      'The affliction has been rewritten.'
    )
  })
})

describe('FIGHTING_ART_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(FIGHTING_ART_CREATED_MESSAGE()).toBe(
      'A new fighting art is mastered against the odds.'
    )
  })
})

describe('FIGHTING_ART_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(FIGHTING_ART_REMOVED_MESSAGE()).toBe(
      'The fighting art is lost to the darkness.'
    )
  })
})

describe('FIGHTING_ART_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(FIGHTING_ART_UPDATED_MESSAGE()).toBe(
      'The fighting art has been refined.'
    )
  })
})

describe('FIGHTING_ARTS_MAX_EXCEEDED_ERROR_MESSAGE', () => {
  it('returns ARC message for ARC survivor type', () => {
    expect(FIGHTING_ARTS_MAX_EXCEEDED_ERROR_MESSAGE(SurvivorType.ARC)).toBe(
      'Arc survivors can only have 1 Fighting Art.'
    )
  })

  it('returns CORE message for CORE survivor type', () => {
    expect(FIGHTING_ARTS_MAX_EXCEEDED_ERROR_MESSAGE(SurvivorType.CORE)).toBe(
      'Survivors can only have 3 total Fighting Arts and Secret Fighting Arts combined.'
    )
  })
})

describe('GEAR_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(GEAR_REMOVED_MESSAGE()).toBe('Gear has been archived.')
  })
})

describe('GEAR_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(GEAR_CREATED_MESSAGE()).toBe(
      'New gear is crafted from the remnants of the hunt.'
    )
  })
})

describe('GEAR_UPDATED_MESSAGE', () => {
  it('returns modified message when index is defined', () => {
    expect(GEAR_UPDATED_MESSAGE(0)).toBe('Gear has been modified.')
  })

  it('returns new gear message when index is undefined', () => {
    expect(GEAR_UPDATED_MESSAGE(undefined)).toBe(
      'New gear added to settlement storage.'
    )
  })
})

describe('GEAR_CRAFTED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(GEAR_CRAFTED_MESSAGE()).toBe(
      'The forge cools. New gear is crafted at great cost.'
    )
  })
})

describe('GEAR_GRID_CLEARED_MESSAGE', () => {
  it('returns the survivor-specific message when a name is provided', () => {
    expect(GEAR_GRID_CLEARED_MESSAGE('Lantern')).toBe(
      "Lantern's gear grid has been emptied."
    )
  })

  it('returns a generic message when no name is provided', () => {
    expect(GEAR_GRID_CLEARED_MESSAGE()).toBe('The gear grid has been emptied.')
    expect(GEAR_GRID_CLEARED_MESSAGE(undefined)).toBe(
      'The gear grid has been emptied.'
    )
  })
})

describe('GEAR_GRID_SLOT_EQUIPPED_MESSAGE', () => {
  it('returns the survivor-specific message when a name is provided', () => {
    expect(GEAR_GRID_SLOT_EQUIPPED_MESSAGE('Lantern')).toBe(
      'Lantern equips new gear.'
    )
  })

  it('returns a generic message when no name is provided', () => {
    expect(GEAR_GRID_SLOT_EQUIPPED_MESSAGE()).toBe(
      'A survivor equips new gear.'
    )
  })
})

describe('GEAR_GRID_SLOT_CLEARED_MESSAGE', () => {
  it('returns the survivor-specific message when a name is provided', () => {
    expect(GEAR_GRID_SLOT_CLEARED_MESSAGE('Lantern')).toBe(
      'Lantern sets aside their gear.'
    )
  })

  it('returns a generic message when no name is provided', () => {
    expect(GEAR_GRID_SLOT_CLEARED_MESSAGE()).toBe(
      'A survivor sets aside their gear.'
    )
  })
})

describe('GEAR_GRID_SETTLEMENT_REQUIRED_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(GEAR_GRID_SETTLEMENT_REQUIRED_ERROR_MESSAGE()).toBe(
      'No settlement gear is within reach.'
    )
  })
})

describe('EMBARK_GEAR_SHORTAGE_ERROR_MESSAGE', () => {
  it('formats a single shortage with the gear name and counts', () => {
    expect(
      EMBARK_GEAR_SHORTAGE_ERROR_MESSAGE([
        { gear_name: 'Bone Axe', available: 1, needed: 2 }
      ])
    ).toBe(
      "The settlement's stores cannot bear this burden — Bone Axe (need 2, have 1)."
    )
  })

  it('joins multiple shortages with semicolons in the supplied order', () => {
    expect(
      EMBARK_GEAR_SHORTAGE_ERROR_MESSAGE([
        { gear_name: 'Bone Axe', available: 1, needed: 2 },
        { gear_name: 'Rawhide Vest', available: 0, needed: 1 }
      ])
    ).toBe(
      "The settlement's stores cannot bear this burden — Bone Axe (need 2, have 1); Rawhide Vest (need 1, have 0)."
    )
  })
})

describe('HUNT_ALREADY_ACTIVE_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(HUNT_ALREADY_ACTIVE_ERROR_MESSAGE()).toBe(
      'A hunt is already underway. Complete it before beginning another.'
    )
  })
})

describe('HUNT_BEGINS_MESSAGE', () => {
  it('returns message with monster name', () => {
    expect(HUNT_BEGINS_MESSAGE('White Lion')).toBe(
      'The hunt for White Lion begins. Survivors venture into the darkness.'
    )
  })
})

describe('HUNT_DELETED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(HUNT_DELETED_MESSAGE()).toBe(
      'The hunt ends. Survivors return to the relative safety of the settlement.'
    )
  })
})

describe('HUNT_NOTES_SAVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(HUNT_NOTES_SAVED_MESSAGE()).toBe(
      'The tales of this hunt are recorded for future generations.'
    )
  })
})

describe('HUNT_XP_RANK_UP_MILESTONE_ADDED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(HUNT_XP_RANK_UP_MILESTONE_ADDED_MESSAGE()).toBe(
      "A rank up milestone is etched into the survivor's memory."
    )
  })
})

describe('HUNT_XP_RANK_UP_MILESTONE_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(HUNT_XP_RANK_UP_MILESTONE_REMOVED_MESSAGE()).toBe(
      'A rank up milestone fades from memory.'
    )
  })
})

describe('HUNT_XP_RANK_UP_ACHIEVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(HUNT_XP_RANK_UP_ACHIEVED_MESSAGE()).toBe(
      'The survivor rises through struggle and triumph. Rank up achieved!'
    )
  })
})

describe('HUNT_XP_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(HUNT_XP_UPDATED_MESSAGE()).toBe(
      'The lantern grows brighter. Hunt XP updated.'
    )
  })
})

describe('INNOVATION_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(INNOVATION_REMOVED_MESSAGE()).toBe('The innovation has been lost.')
  })
})

describe('INNOVATION_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(INNOVATION_CREATED_MESSAGE()).toBe(
      'A spark of ingenuity illuminates the settlement.'
    )
  })
})

describe('INNOVATION_UPDATED_MESSAGE', () => {
  it('returns updated message when index is defined', () => {
    expect(INNOVATION_UPDATED_MESSAGE(0)).toBe(
      'The innovation has been updated.'
    )
  })

  it('returns innovated message when index is undefined', () => {
    expect(INNOVATION_UPDATED_MESSAGE(undefined)).toBe(
      'The settlement has innovated.'
    )
  })
})

describe('INSANITY_MINIMUM_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(INSANITY_MINIMUM_ERROR_MESSAGE()).toBe(
      'Insanity cannot be negative.'
    )
  })
})

describe('KNOWLEDGE_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(KNOWLEDGE_CREATED_MESSAGE()).toBe(
      'New knowledge illuminates the settlement.'
    )
  })
})

describe('KNOWLEDGE_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(KNOWLEDGE_REMOVED_MESSAGE()).toBe('Knowledge banished to the void.')
  })
})

describe('KNOWLEDGE_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(KNOWLEDGE_UPDATED_MESSAGE()).toBe('Knowledge carved into memory.')
  })
})

describe('LANTERN_RESEARCH_LEVEL_MINIMUM_ERROR', () => {
  it('returns correct message', () => {
    expect(LANTERN_RESEARCH_LEVEL_MINIMUM_ERROR()).toBe(
      'Lantern research level cannot be reduced below 0.'
    )
  })
})

describe('LANTERN_RESEARCH_LEVEL_UPDATED_MESSAGE', () => {
  it('returns illuminates message when newValue > oldValue', () => {
    expect(LANTERN_RESEARCH_LEVEL_UPDATED_MESSAGE(0, 5)).toBe(
      "The lantern's glow illuminates new knowledge."
    )
  })

  it('returns dims message when newValue < oldValue', () => {
    expect(LANTERN_RESEARCH_LEVEL_UPDATED_MESSAGE(5, 0)).toBe(
      'The lantern dims, losing some of its knowledge.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(LANTERN_RESEARCH_LEVEL_UPDATED_MESSAGE(3, 3)).toBe(
      "The lantern's knowledge remains unchanged."
    )
  })
})

describe('LOCATION_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(LOCATION_REMOVED_MESSAGE()).toBe('The location has been destroyed.')
  })
})

describe('LOCATION_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(LOCATION_CREATED_MESSAGE()).toBe(
      'A new location is discovered in the darkness.'
    )
  })
})

describe('LOCATION_UNLOCKED_MESSAGE', () => {
  it('returns illuminated message when unlocked', () => {
    expect(LOCATION_UNLOCKED_MESSAGE(true)).toBe(
      'The location has been illuminated.'
    )
  })

  it('returns fades message when locked', () => {
    expect(LOCATION_UNLOCKED_MESSAGE(false)).toBe(
      'The location fades into darkness.'
    )
  })
})

describe('LOCATION_UPDATED_MESSAGE', () => {
  it('returns updated message when index is defined', () => {
    expect(LOCATION_UPDATED_MESSAGE(0)).toBe('The location has been updated.')
  })

  it('returns new location message when index is undefined', () => {
    expect(LOCATION_UPDATED_MESSAGE(undefined)).toBe(
      'A new location illuminates within settlement.'
    )
  })
})

describe('LOST_SETTLEMENT_COUNT_MINIMUM_ERROR', () => {
  it('returns correct message', () => {
    expect(LOST_SETTLEMENT_COUNT_MINIMUM_ERROR()).toBe(
      'Lost settlement count cannot be reduced below 0.'
    )
  })
})

describe('LOST_SETTLEMENT_COUNT_UPDATED_MESSAGE', () => {
  it('returns lost message when newValue > oldValue', () => {
    expect(LOST_SETTLEMENT_COUNT_UPDATED_MESSAGE(0, 1)).toBe(
      'Voices cried out, and were silenced. A settlement has been lost.'
    )
  })

  it('returns reclaimed message when newValue < oldValue', () => {
    expect(LOST_SETTLEMENT_COUNT_UPDATED_MESSAGE(1, 0)).toBe(
      'A lost settlement is reclaimed from the darkness.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(LOST_SETTLEMENT_COUNT_UPDATED_MESSAGE(1, 1)).toBe(
      'The count of lost settlements remains unchanged.'
    )
  })
})

describe('MILESTONE_COMPLETED_MESSAGE', () => {
  it('returns achieved message when complete', () => {
    expect(MILESTONE_COMPLETED_MESSAGE(true)).toBe(
      'Milestone achieved - the settlement persists through the darkness.'
    )
  })

  it('returns updated message when not complete', () => {
    expect(MILESTONE_COMPLETED_MESSAGE(false)).toBe('Milestone status updated.')
  })
})

describe('MILESTONE_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(MILESTONE_CREATED_MESSAGE()).toBe(
      'A new milestone looms on the horizon.'
    )
  })
})

describe('MILESTONE_MISSING_EVENT_ERROR', () => {
  it('returns correct message', () => {
    expect(MILESTONE_MISSING_EVENT_ERROR()).toBe(
      'A milestone must include a story event.'
    )
  })
})

describe('MILESTONE_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(MILESTONE_REMOVED_MESSAGE()).toBe(
      'The milestone fades into the darkness.'
    )
  })
})

describe('MILESTONE_UPDATED_MESSAGE', () => {
  it('returns updated message when index is defined', () => {
    expect(MILESTONE_UPDATED_MESSAGE(0)).toBe('Milestones have been updated.')
  })

  it('returns new milestone message when index is undefined', () => {
    expect(MILESTONE_UPDATED_MESSAGE(undefined)).toBe(
      "A new milestone marks the settlement's destiny."
    )
  })
})

describe('MONSTER_ACCURACY_UPDATED_MESSAGE', () => {
  it('returns more accurate message when newValue > oldValue', () => {
    expect(MONSTER_ACCURACY_UPDATED_MESSAGE(0, 1)).toBe(
      'The monster strikes more accurately.'
    )
  })

  it('returns less accurate message when newValue < oldValue', () => {
    expect(MONSTER_ACCURACY_UPDATED_MESSAGE(1, 0)).toBe(
      'The monster strikes less accurately.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(MONSTER_ACCURACY_UPDATED_MESSAGE(1, 1)).toBe(
      "The monster's accuracy remains unchanged."
    )
  })
})

describe('MONSTER_ACCURACY_TOKENS_UPDATED_MESSAGE', () => {
  it('returns gains message when newValue > oldValue', () => {
    expect(MONSTER_ACCURACY_TOKENS_UPDATED_MESSAGE(0, 1)).toBe(
      'The monster gains accuracy tokens.'
    )
  })

  it('returns loses message when newValue < oldValue', () => {
    expect(MONSTER_ACCURACY_TOKENS_UPDATED_MESSAGE(1, 0)).toBe(
      'The monster loses accuracy tokens.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(MONSTER_ACCURACY_TOKENS_UPDATED_MESSAGE(1, 1)).toBe(
      "The monster's accuracy tokens remain unchanged."
    )
  })
})

describe('MONSTER_AI_DECK_UPDATED_MESSAGE', () => {
  it('returns gains message when newValue > oldValue', () => {
    expect(MONSTER_AI_DECK_UPDATED_MESSAGE(0, 1)).toBe(
      'The monster gains AI cards.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(MONSTER_AI_DECK_UPDATED_MESSAGE(1, 1)).toBe(
      'The monster AI deck remains unchanged.'
    )
  })
})

describe('MONSTER_DAMAGE_TOKENS_UPDATED_MESSAGE', () => {
  it('returns gains message when newValue > oldValue', () => {
    expect(MONSTER_DAMAGE_TOKENS_UPDATED_MESSAGE(0, 1)).toBe(
      'The monster gains damage tokens.'
    )
  })

  it('returns loses message when newValue < oldValue', () => {
    expect(MONSTER_DAMAGE_TOKENS_UPDATED_MESSAGE(1, 0)).toBe(
      'The monster loses damage tokens.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(MONSTER_DAMAGE_TOKENS_UPDATED_MESSAGE(1, 1)).toBe(
      "The monster's damage tokens remain unchanged."
    )
  })
})

describe('MONSTER_EVASION_UPDATED_MESSAGE', () => {
  it('returns more effectively message when newValue > oldValue', () => {
    expect(MONSTER_EVASION_UPDATED_MESSAGE(0, 1)).toBe(
      'The monster evades attacks more effectively.'
    )
  })

  it('returns less effectively message when newValue < oldValue', () => {
    expect(MONSTER_EVASION_UPDATED_MESSAGE(1, 0)).toBe(
      'The monster evades attacks less effectively.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(MONSTER_EVASION_UPDATED_MESSAGE(1, 1)).toBe(
      "The monster's evasion remains unchanged."
    )
  })
})

describe('MONSTER_EVASION_TOKENS_UPDATED_MESSAGE', () => {
  it('returns gains message when newValue > oldValue', () => {
    expect(MONSTER_EVASION_TOKENS_UPDATED_MESSAGE(0, 1)).toBe(
      'The monster gains evasion tokens.'
    )
  })

  it('returns loses message when newValue < oldValue', () => {
    expect(MONSTER_EVASION_TOKENS_UPDATED_MESSAGE(1, 0)).toBe(
      'The monster loses evasion tokens.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(MONSTER_EVASION_TOKENS_UPDATED_MESSAGE(1, 1)).toBe(
      "The monster's evasion tokens remain unchanged."
    )
  })
})

describe('MONSTER_LEVEL_MISSING_MESSAGE', () => {
  it('returns correct message', () => {
    expect(MONSTER_LEVEL_MISSING_MESSAGE()).toBe(
      'At least one level is required.'
    )
  })
})

describe('MONSTER_LUCK_UPDATED_MESSAGE', () => {
  it('returns luckier message when newValue > oldValue', () => {
    expect(MONSTER_LUCK_UPDATED_MESSAGE(0, 1)).toBe(
      'The monster becomes luckier.'
    )
  })

  it('returns unluckier message when newValue < oldValue', () => {
    expect(MONSTER_LUCK_UPDATED_MESSAGE(1, 0)).toBe(
      'The monster becomes unluckier.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(MONSTER_LUCK_UPDATED_MESSAGE(1, 1)).toBe(
      "The monster's luck remains unchanged."
    )
  })
})

describe('MONSTER_LUCK_TOKENS_UPDATED_MESSAGE', () => {
  it('returns gains message when newValue > oldValue', () => {
    expect(MONSTER_LUCK_TOKENS_UPDATED_MESSAGE(0, 1)).toBe(
      'The monster gains luck tokens.'
    )
  })

  it('returns loses message when newValue < oldValue', () => {
    expect(MONSTER_LUCK_TOKENS_UPDATED_MESSAGE(1, 0)).toBe(
      'The monster loses luck tokens.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(MONSTER_LUCK_TOKENS_UPDATED_MESSAGE(1, 1)).toBe(
      "The monster's luck tokens remain unchanged."
    )
  })
})

describe('MONSTER_MOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(MONSTER_MOVED_MESSAGE()).toBe('The monster shifts in the dark.')
  })
})

describe('MONSTER_MOVEMENT_UPDATED_MESSAGE', () => {
  it('returns swifter message when newValue > oldValue', () => {
    expect(MONSTER_MOVEMENT_UPDATED_MESSAGE(0, 1)).toBe(
      'The monster moves swifter.'
    )
  })

  it('returns slower message when newValue < oldValue', () => {
    expect(MONSTER_MOVEMENT_UPDATED_MESSAGE(1, 0)).toBe(
      'The monster moves slower.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(MONSTER_MOVEMENT_UPDATED_MESSAGE(1, 1)).toBe(
      "The monster's movement remains unchanged."
    )
  })
})

describe('MONSTER_MOVEMENT_TOKENS_UPDATED_MESSAGE', () => {
  it('returns gains message when newValue > oldValue', () => {
    expect(MONSTER_MOVEMENT_TOKENS_UPDATED_MESSAGE(0, 1)).toBe(
      'The monster gains movement tokens.'
    )
  })

  it('returns loses message when newValue < oldValue', () => {
    expect(MONSTER_MOVEMENT_TOKENS_UPDATED_MESSAGE(1, 0)).toBe(
      'The monster loses movement tokens.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(MONSTER_MOVEMENT_TOKENS_UPDATED_MESSAGE(1, 1)).toBe(
      "The monster's movement tokens remain unchanged."
    )
  })
})

describe('MONSTER_SPEED_UPDATED_MESSAGE', () => {
  it('returns more swiftly message when newValue > oldValue', () => {
    expect(MONSTER_SPEED_UPDATED_MESSAGE(0, 1)).toBe(
      'The monster attacks more swiftly.'
    )
  })

  it('returns more slowly message when newValue < oldValue', () => {
    expect(MONSTER_SPEED_UPDATED_MESSAGE(1, 0)).toBe(
      'The monster attacks more slowly.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(MONSTER_SPEED_UPDATED_MESSAGE(1, 1)).toBe(
      "The monster's attack speed remains unchanged."
    )
  })
})

describe('MONSTER_SPEED_TOKENS_UPDATED_MESSAGE', () => {
  it('returns gains message when newValue > oldValue', () => {
    expect(MONSTER_SPEED_TOKENS_UPDATED_MESSAGE(0, 1)).toBe(
      'The monster gains speed tokens.'
    )
  })

  it('returns loses message when newValue < oldValue', () => {
    expect(MONSTER_SPEED_TOKENS_UPDATED_MESSAGE(1, 0)).toBe(
      'The monster loses speed tokens.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(MONSTER_SPEED_TOKENS_UPDATED_MESSAGE(1, 1)).toBe(
      "The monster's speed tokens remain unchanged."
    )
  })
})

describe('MONSTER_STARTS_SHOWDOWN_KNOCKED_DOWN_MESSAGE', () => {
  it('returns knocked down message', () => {
    expect(MONSTER_STARTS_SHOWDOWN_KNOCKED_DOWN_MESSAGE(true)).toBe(
      'The monster will start the showdown knocked down.'
    )
  })

  it('returns standing message', () => {
    expect(MONSTER_STARTS_SHOWDOWN_KNOCKED_DOWN_MESSAGE(false)).toBe(
      'The monster will start the showdown standing.'
    )
  })
})

describe('MONSTER_STATS_SAVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(MONSTER_STATS_SAVED_MESSAGE()).toBe('The creature shifts.')
  })
})

describe('MONSTER_STRENGTH_UPDATED_MESSAGE', () => {
  it('returns more powerfully message when newValue > oldValue', () => {
    expect(MONSTER_STRENGTH_UPDATED_MESSAGE(0, 1)).toBe(
      'The monster strikes more powerfully.'
    )
  })

  it('returns less powerfully message when newValue < oldValue', () => {
    expect(MONSTER_STRENGTH_UPDATED_MESSAGE(1, 0)).toBe(
      'The monster strikes less powerfully.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(MONSTER_STRENGTH_UPDATED_MESSAGE(1, 1)).toBe(
      "The monster's strength remains unchanged."
    )
  })
})

describe('MONSTER_STRENGTH_TOKENS_UPDATED_MESSAGE', () => {
  it('returns gains message when newValue > oldValue', () => {
    expect(MONSTER_STRENGTH_TOKENS_UPDATED_MESSAGE(0, 1)).toBe(
      'The monster gains strength tokens.'
    )
  })

  it('returns loses message when newValue < oldValue', () => {
    expect(MONSTER_STRENGTH_TOKENS_UPDATED_MESSAGE(1, 0)).toBe(
      'The monster loses strength tokens.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(MONSTER_STRENGTH_TOKENS_UPDATED_MESSAGE(1, 1)).toBe(
      "The monster's strength tokens remain unchanged."
    )
  })
})

describe('MONSTER_TOUGHNESS_UPDATED_MESSAGE', () => {
  it('returns tougher message when newValue > oldValue', () => {
    expect(MONSTER_TOUGHNESS_UPDATED_MESSAGE(0, 1)).toBe(
      'The monster becomes tougher.'
    )
  })

  it('returns less tough message when newValue < oldValue', () => {
    expect(MONSTER_TOUGHNESS_UPDATED_MESSAGE(1, 0)).toBe(
      'The monster becomes less tough.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(MONSTER_TOUGHNESS_UPDATED_MESSAGE(1, 1)).toBe(
      "The monster's toughness remains unchanged."
    )
  })
})

describe('MONSTER_VOLUME_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(MONSTER_VOLUME_REMOVED_MESSAGE()).toBe(
      'The monster volume has been consigned to darkness.'
    )
  })
})

describe('MONSTER_VOLUME_UPDATED_MESSAGE', () => {
  it('returns inscribed message when index is defined', () => {
    expect(MONSTER_VOLUME_UPDATED_MESSAGE(0)).toBe(
      'Monster volume inscribed in blood.'
    )
  })

  it('returns new volume message when index is undefined', () => {
    expect(MONSTER_VOLUME_UPDATED_MESSAGE(undefined)).toBe(
      'New monster volume inscribed in blood.'
    )
  })
})

describe('MONSTER_WOUND_DECK_UPDATED_MESSAGE', () => {
  it('returns heals message when newValue < oldValue', () => {
    expect(MONSTER_WOUND_DECK_UPDATED_MESSAGE(5, 0)).toBe(
      'The monster heals its wounds.'
    )
  })

  it('returns suffers message when newValue > oldValue', () => {
    expect(MONSTER_WOUND_DECK_UPDATED_MESSAGE(0, 5)).toBe(
      'The monster suffers new wounds.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(MONSTER_WOUND_DECK_UPDATED_MESSAGE(3, 3)).toBe(
      "The monster's wound deck remains unchanged."
    )
  })
})

describe('MOOD_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(MOOD_CREATED_MESSAGE()).toBe('A new mood takes hold.')
  })
})

describe('MOOD_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(MOOD_REMOVED_MESSAGE()).toBe('The mood subsides.')
  })
})

describe('MOOD_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(MOOD_UPDATED_MESSAGE()).toBe('The mood has been updated.')
  })
})

describe('NAMELESS_OBJECT_ERROR_MESSAGE', () => {
  it('returns message with object type', () => {
    expect(NAMELESS_OBJECT_ERROR_MESSAGE('survivor')).toBe(
      'A nameless survivor cannot be recorded.'
    )
  })
})

describe('NEMESIS_ADDED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(NEMESIS_ADDED_MESSAGE()).toBe('A new nemesis emerges.')
  })
})

describe('NEMESIS_DEFEATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(NEMESIS_DEFEATED_MESSAGE()).toBe(
      'The nemesis has been defeated...for now.'
    )
  })
})

describe('NEMESIS_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(NEMESIS_REMOVED_MESSAGE()).toBe(
      'The nemesis has returned to the darkness.'
    )
  })
})

describe('NEMESIS_UNLOCKED_MESSAGE', () => {
  it('returns emerges message when unlocked', () => {
    expect(NEMESIS_UNLOCKED_MESSAGE('Butcher', true)).toBe(
      'Butcher emerges, ready to accept your challenge.'
    )
  })

  it('returns retreats message when locked', () => {
    expect(NEMESIS_UNLOCKED_MESSAGE('Butcher', false)).toBe(
      'Butcher retreats into the darkness, beyond your reach.'
    )
  })
})

describe('NEMESIS_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(NEMESIS_UPDATED_MESSAGE()).toBe(
      'The nemesis waits outside your settlement.'
    )
  })
})

describe('PATTERN_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(PATTERN_REMOVED_MESSAGE()).toBe('The pattern has been lost.')
  })
})

describe('PATTERN_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(PATTERN_CREATED_MESSAGE()).toBe(
      'A new pattern is woven from scattered knowledge.'
    )
  })
})

describe('PATTERN_UPDATED_MESSAGE', () => {
  it('returns updated message when index is defined', () => {
    expect(PATTERN_UPDATED_MESSAGE(0)).toBe('The pattern has been updated.')
  })

  it('returns new pattern message when index is undefined', () => {
    expect(PATTERN_UPDATED_MESSAGE(undefined)).toBe('A new pattern emerges.')
  })
})

describe('PHILOSOPHY_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(PHILOSOPHY_CREATED_MESSAGE()).toBe('A new philosophy emerges.')
  })
})

describe('PHILOSOPHY_RANK_MINIMUM_ERROR', () => {
  it('returns correct message', () => {
    expect(PHILOSOPHY_RANK_MINIMUM_ERROR()).toBe(
      'Philosophy rank cannot be negative.'
    )
  })
})

describe('PHILOSOPHY_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(PHILOSOPHY_REMOVED_MESSAGE()).toBe(
      'The philosophy fades into the void.'
    )
  })
})

describe('PHILOSOPHY_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(PHILOSOPHY_UPDATED_MESSAGE()).toBe('Philosophy etched into memory.')
  })
})

describe('PRINCIPLE_OPTION_SELECTED_MESSAGE', () => {
  it('returns message with option name', () => {
    expect(PRINCIPLE_OPTION_SELECTED_MESSAGE('New Life')).toBe(
      'The settlement has chosen New Life.'
    )
  })
})

describe('PRINCIPLE_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(PRINCIPLE_CREATED_MESSAGE()).toBe(
      'A new principle guides the settlement.'
    )
  })
})

describe('PRINCIPLE_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(PRINCIPLE_REMOVED_MESSAGE()).toBe('The principle fades into memory.')
  })
})

describe('PRINCIPLE_UPDATED_MESSAGE', () => {
  it('returns new principle message when isNew', () => {
    expect(PRINCIPLE_UPDATED_MESSAGE(true)).toBe(
      'A new principle guides your settlement.'
    )
  })

  it('returns inscribed message when not new', () => {
    expect(PRINCIPLE_UPDATED_MESSAGE(false)).toBe(
      'The principle has been inscribed.'
    )
  })
})

describe('QUARRY_ADDED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(QUARRY_ADDED_MESSAGE()).toBe('A new quarry has been discovered.')
  })
})

describe('QUARRY_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(QUARRY_REMOVED_MESSAGE()).toBe('The quarry has vanished.')
  })
})

describe('QUARRY_UNLOCKED_MESSAGE', () => {
  it('returns emerges message when unlocked', () => {
    expect(QUARRY_UNLOCKED_MESSAGE('White Lion', true)).toBe(
      'White Lion emerges, ready to be hunted.'
    )
  })

  it('returns retreats message when locked', () => {
    expect(QUARRY_UNLOCKED_MESSAGE('White Lion', false)).toBe(
      'White Lion retreats into the darkness, beyond your reach.'
    )
  })
})

describe('QUARRY_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(QUARRY_UPDATED_MESSAGE()).toBe('The quarry has been tracked.')
  })
})

describe('RESOURCE_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(RESOURCE_REMOVED_MESSAGE()).toBe('The resource has been consumed.')
  })
})

describe('RESOURCE_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(RESOURCE_CREATED_MESSAGE()).toBe(
      'A new resource is discovered in the darkness.'
    )
  })
})

describe('RESOURCE_UPDATED_MESSAGE', () => {
  it('returns cataloged message when index is defined', () => {
    expect(RESOURCE_UPDATED_MESSAGE(0)).toBe('The resource has been cataloged.')
  })

  it('returns gathered message when index is undefined', () => {
    expect(RESOURCE_UPDATED_MESSAGE(undefined)).toBe(
      'A new resource has been gathered.'
    )
  })
})

describe('NEUROSIS_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(NEUROSIS_CREATED_MESSAGE()).toBe(
      'A new neurosis takes hold of the mind.'
    )
  })
})

describe('NEUROSIS_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(NEUROSIS_REMOVED_MESSAGE()).toBe('The neurosis loosens its grip.')
  })
})

describe('NEUROSIS_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(NEUROSIS_UPDATED_MESSAGE()).toBe('The neurosis has shifted.')
  })
})

describe('SCOUT_CONFLICT_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SCOUT_CONFLICT_MESSAGE()).toBe(
      'The selected scout cannot also be one of the survivors selected for the hunt.'
    )
  })
})

describe('SCOUT_REQUIRED_MESSAGE', () => {
  it('returns hunt message', () => {
    expect(SCOUT_REQUIRED_MESSAGE('hunt')).toBe(
      'This settlement employs scouts. A scout must be selected to begin the hunt.'
    )
  })

  it('returns showdown message', () => {
    expect(SCOUT_REQUIRED_MESSAGE('showdown')).toBe(
      'This settlement employs scouts. A scout must be selected to begin the showdown.'
    )
  })
})

describe('SECRET_FIGHTING_ARTS_MAX_EXCEEDED_ERROR_MESSAGE', () => {
  it('returns ARC message for ARC survivor type', () => {
    expect(
      SECRET_FIGHTING_ARTS_MAX_EXCEEDED_ERROR_MESSAGE(SurvivorType.ARC)
    ).toBe('Arc survivors can only have 1 Secret Fighting Art.')
  })

  it('returns CORE message for CORE survivor type', () => {
    expect(
      SECRET_FIGHTING_ARTS_MAX_EXCEEDED_ERROR_MESSAGE(SurvivorType.CORE)
    ).toBe(
      'Survivors can only have 3 total Fighting Arts and Secret Fighting Arts combined.'
    )
  })
})

describe('SECRET_FIGHTING_ART_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SECRET_FIGHTING_ART_CREATED_MESSAGE()).toBe(
      'A forbidden technique is discovered.'
    )
  })
})

describe('SECRET_FIGHTING_ART_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SECRET_FIGHTING_ART_REMOVED_MESSAGE()).toBe(
      'The forbidden technique is forgotten.'
    )
  })
})

describe('SECRET_FIGHTING_ART_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SECRET_FIGHTING_ART_UPDATED_MESSAGE()).toBe(
      'The forbidden technique has been altered.'
    )
  })
})

describe('SEED_PATTERN_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SEED_PATTERN_REMOVED_MESSAGE()).toBe(
      'The seed pattern has been consumed by darkness.'
    )
  })
})

describe('SEED_PATTERN_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SEED_PATTERN_CREATED_MESSAGE()).toBe(
      'A new seed pattern takes root.'
    )
  })
})

describe('SEED_PATTERN_UPDATED_MESSAGE', () => {
  it('returns updated message when index is defined', () => {
    expect(SEED_PATTERN_UPDATED_MESSAGE(0)).toBe(
      'The seed pattern has been updated.'
    )
  })

  it('returns new seed pattern message when index is undefined', () => {
    expect(SEED_PATTERN_UPDATED_MESSAGE(undefined)).toBe(
      'A new seed pattern has taken root.'
    )
  })
})

describe('SETTLEMENT_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SETTLEMENT_CREATED_MESSAGE()).toBe(
      'A lantern pierces the darkness. A new settlement is born.'
    )
  })
})

describe('SETTLEMENT_DELETED_MESSAGE', () => {
  it('returns message with settlement name', () => {
    expect(SETTLEMENT_DELETED_MESSAGE('Lanternhearth')).toBe(
      'A wave of darkness washes over Lanternhearth. Voices cried out, and were silenced.'
    )
  })
})

describe('SETTLEMENT_LOADED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SETTLEMENT_LOADED_MESSAGE()).toBe('Settlement chronicles loaded!')
  })
})

describe('SETTLEMENT_NOTES_SAVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SETTLEMENT_NOTES_SAVED_MESSAGE()).toBe(
      'As stories are shared amongst survivors, they are etched into the history of your settlement.'
    )
  })
})

describe('SETTLEMENT_PHASE_ENDED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SETTLEMENT_PHASE_ENDED_MESSAGE()).toBe(
      'The settlement phase ends. Survivors prepare to venture into the darkness once more.'
    )
  })
})

describe('SETTLEMENT_PHASE_STARTED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SETTLEMENT_PHASE_STARTED_MESSAGE()).toBe(
      'The showdown ends. Remaining survivors return to the relative safety of the settlement.'
    )
  })
})

describe('SETTLEMENT_PHASE_STEP_UPDATED_MESSAGE', () => {
  it('returns message with step title', () => {
    expect(SETTLEMENT_PHASE_STEP_UPDATED_MESSAGE('Develop')).toBe(
      'Settlement phase moved to the Develop step.'
    )
  })
})

describe('SETTLEMENT_SAVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SETTLEMENT_SAVED_MESSAGE()).toBe('Settlement records preserved!')
  })
})

describe('SETTLEMENT_USES_SCOUTS_SETTING_UPDATED_MESSAGE', () => {
  it('returns employs scouts message when true', () => {
    expect(SETTLEMENT_USES_SCOUTS_SETTING_UPDATED_MESSAGE(true)).toBe(
      'The settlement now employs scouts to aid in hunts.'
    )
  })

  it('returns no longer relies message when false', () => {
    expect(SETTLEMENT_USES_SCOUTS_SETTING_UPDATED_MESSAGE(false)).toBe(
      'The settlement no longer relies on scouts for hunts.'
    )
  })
})

describe('DISABLE_TOASTS_SETTING_UPDATED_MESSAGE', () => {
  it('returns silenced message when true', () => {
    expect(DISABLE_TOASTS_SETTING_UPDATED_MESSAGE(true)).toBe(
      'Notification messages have been silenced.'
    )
  })

  it('returns illuminate message when false', () => {
    expect(DISABLE_TOASTS_SETTING_UPDATED_MESSAGE(false)).toBe(
      'Notification messages will now illuminate your journey.'
    )
  })
})

describe('SHOWDOWN_ALREADY_ACTIVE_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SHOWDOWN_ALREADY_ACTIVE_ERROR_MESSAGE()).toBe(
      'A showdown is already in progress. Survive it before facing another foe.'
    )
  })
})

describe('SHOWDOWN_CREATED_MESSAGE', () => {
  it('returns quarry message for QUARRY type', () => {
    expect(SHOWDOWN_CREATED_MESSAGE('White Lion', MonsterType.QUARRY)).toBe(
      'The showdown against White Lion begins. Survivors prepare themselves.'
    )
  })

  it('returns nemesis message for NEMESIS type', () => {
    expect(SHOWDOWN_CREATED_MESSAGE('Butcher', MonsterType.NEMESIS)).toBe(
      'The showdown against Butcher begins. Survivors must defend their home.'
    )
  })
})

describe('SHOWDOWN_DELETED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SHOWDOWN_DELETED_MESSAGE()).toBe(
      'The showdown ends. Survivors return to the relative safety of the settlement.'
    )
  })
})

describe('SHOWDOWN_MONSTER_KNOCKED_DOWN_MESSAGE', () => {
  it('returns knocked down message', () => {
    expect(SHOWDOWN_MONSTER_KNOCKED_DOWN_MESSAGE(true)).toBe(
      'The monster is knocked down!'
    )
  })

  it('returns rises message', () => {
    expect(SHOWDOWN_MONSTER_KNOCKED_DOWN_MESSAGE(false)).toBe(
      'The monster rises to its feet.'
    )
  })
})

describe('SHOWDOWN_NOTES_SAVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SHOWDOWN_NOTES_SAVED_MESSAGE()).toBe(
      'The tales of this showdown are recorded for future generations.'
    )
  })
})

describe('SHOWDOWN_TURN_MESSAGE', () => {
  it('returns monster turn message', () => {
    expect(SHOWDOWN_TURN_MESSAGE(TurnType.MONSTER)).toBe(
      'The survivors brace as the monster moves to strike.'
    )
  })

  it('returns survivors turn message', () => {
    expect(SHOWDOWN_TURN_MESSAGE(TurnType.SURVIVORS)).toBe(
      'The survivors engage the monster!'
    )
  })
})

describe('SQUIRE_SUSPICION_UPDATED_MESSAGE', () => {
  it('returns message with squire name', () => {
    expect(SQUIRE_SUSPICION_UPDATED_MESSAGE('Cain')).toBe(
      "Cain's doubt grows deeper."
    )
  })
})

describe('STRIPE_CHECKOUT_SUCCESS_MESSAGE', () => {
  it('returns the lantern-bright success message', () => {
    expect(STRIPE_CHECKOUT_SUCCESS_MESSAGE()).toBe(
      'The lantern burns brighter. Your watch begins anew.'
    )
  })
})

describe('STRIPE_CHECKOUT_CANCELLED_MESSAGE', () => {
  it('returns the step-back-from-the-merchant cancellation message', () => {
    expect(STRIPE_CHECKOUT_CANCELLED_MESSAGE()).toBe(
      'You step back from the merchant. The lantern waits.'
    )
  })
})

describe('SURVIVAL_LIMIT_EXCEEDED_ERROR_MESSAGE', () => {
  it('returns message with survival limit', () => {
    expect(SURVIVAL_LIMIT_EXCEEDED_ERROR_MESSAGE(5)).toBe(
      "Survival cannot exceed the settlement's survival limit (5)."
    )
  })
})

describe('SURVIVAL_LIMIT_MINIMUM_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVAL_LIMIT_MINIMUM_ERROR_MESSAGE()).toBe(
      "Settlement's survival limit cannot be reduced below 1."
    )
  })
})

describe('SURVIVAL_LIMIT_UPDATED_MESSAGE', () => {
  it('returns grows message when newValue > oldValue', () => {
    expect(SURVIVAL_LIMIT_UPDATED_MESSAGE(0, 5)).toBe(
      "The settlement's will to live grows stronger."
    )
  })

  it('returns weakens message when newValue < oldValue', () => {
    expect(SURVIVAL_LIMIT_UPDATED_MESSAGE(5, 0)).toBe(
      "The settlement's will to live weakens."
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(SURVIVAL_LIMIT_UPDATED_MESSAGE(3, 3)).toBe(
      "The settlement's survival limit remains unchanged."
    )
  })
})

describe('SURVIVAL_MINIMUM_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVAL_MINIMUM_ERROR_MESSAGE()).toBe(
      'Survival cannot be negative.'
    )
  })
})

describe('SURVIVOR_ACCURACY_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_ACCURACY_UPDATED_MESSAGE()).toBe(
      "The survivor's aim pierces through shadow."
    )
  })
})

describe('SURVIVOR_ATTRIBUTE_TOKEN_UPDATED_MESSAGE', () => {
  it('returns message with attribute name', () => {
    expect(SURVIVOR_ATTRIBUTE_TOKEN_UPDATED_MESSAGE('accuracy')).toBe(
      "The survivor's accuracy tokens have been updated."
    )
  })
})

describe('SURVIVOR_BASE_ATTRIBUTE_UPDATED_MESSAGE', () => {
  it('returns message with attribute name', () => {
    expect(SURVIVOR_BASE_ATTRIBUTE_UPDATED_MESSAGE('strength')).toBe(
      "The survivor's strength has been updated."
    )
  })
})

describe('SURVIVOR_BRAIN_LIGHT_DAMAGE_UPDATED_MESSAGE', () => {
  it('returns brain damage message', () => {
    expect(SURVIVOR_BRAIN_LIGHT_DAMAGE_UPDATED_MESSAGE(true)).toBe(
      'The survivor suffers brain damage from the horrors witnessed.'
    )
  })

  it('returns recovery message', () => {
    expect(SURVIVOR_BRAIN_LIGHT_DAMAGE_UPDATED_MESSAGE(false)).toBe(
      'The survivor recovers from their brain injury.'
    )
  })
})

describe('SURVIVOR_CAN_DASH_UPDATED_MESSAGE', () => {
  it('returns gains message', () => {
    expect(SURVIVOR_CAN_DASH_UPDATED_MESSAGE(true)).toBe(
      'The survivor gains swift feet to dash ahead.'
    )
  })

  it('returns loses message', () => {
    expect(SURVIVOR_CAN_DASH_UPDATED_MESSAGE(false)).toBe(
      'The survivor loses their speed, unable to dash.'
    )
  })
})

describe('SURVIVOR_CAN_DODGE_UPDATED_MESSAGE', () => {
  it('returns gains dodge message', () => {
    expect(SURVIVOR_CAN_DODGE_UPDATED_MESSAGE(true)).toBe(
      'The survivor learns to dodge with grace.'
    )
  })

  it('returns loses dodge message', () => {
    expect(SURVIVOR_CAN_DODGE_UPDATED_MESSAGE(false)).toBe(
      'The survivor loses the ability to dodge.'
    )
  })
})

describe('SURVIVOR_CAN_ENCOURAGE_UPDATED_MESSAGE', () => {
  it('returns finds voice message', () => {
    expect(SURVIVOR_CAN_ENCOURAGE_UPDATED_MESSAGE(true)).toBe(
      'The survivor finds their voice to inspire others.'
    )
  })

  it('returns falls silent message', () => {
    expect(SURVIVOR_CAN_ENCOURAGE_UPDATED_MESSAGE(false)).toBe(
      'The survivor falls silent, unable to encourage.'
    )
  })
})

describe('SURVIVOR_CAN_ENDURE_UPDATED_MESSAGE', () => {
  it('returns finds strength message', () => {
    expect(SURVIVOR_CAN_ENDURE_UPDATED_MESSAGE(true)).toBe(
      'The survivor finds strength to endure the darkness.'
    )
  })

  it('returns loses resilience message', () => {
    expect(SURVIVOR_CAN_ENDURE_UPDATED_MESSAGE(false)).toBe(
      'The survivor loses their resilience to endure.'
    )
  })
})

describe('SURVIVOR_CAN_FIST_PUMP_UPDATED_MESSAGE', () => {
  it('returns raises fist message', () => {
    expect(SURVIVOR_CAN_FIST_PUMP_UPDATED_MESSAGE(true)).toBe(
      'The survivor raises their fist in triumph.'
    )
  })

  it('returns loses fighting spirit message', () => {
    expect(SURVIVOR_CAN_FIST_PUMP_UPDATED_MESSAGE(false)).toBe(
      'The survivor loses their fighting spirit.'
    )
  })
})

describe('SURVIVOR_CAN_SURGE_UPDATED_MESSAGE', () => {
  it('returns surge message', () => {
    expect(SURVIVOR_CAN_SURGE_UPDATED_MESSAGE(true)).toBe(
      'The survivor feels a surge of power within.'
    )
  })

  it('returns loses surge message', () => {
    expect(SURVIVOR_CAN_SURGE_UPDATED_MESSAGE(false)).toBe(
      'The survivor loses their ability to surge.'
    )
  })
})

describe('SURVIVOR_CAN_SPEND_SURVIVAL_UPDATED_MESSAGE', () => {
  it('returns cannot spend message when false', () => {
    expect(SURVIVOR_CAN_SPEND_SURVIVAL_UPDATED_MESSAGE(false)).toBe(
      'The survivor freezes - survival cannot be spent.'
    )
  })

  it('returns can spend message when true', () => {
    expect(SURVIVOR_CAN_SPEND_SURVIVAL_UPDATED_MESSAGE(true)).toBe(
      'The survivor can once again spend survival.'
    )
  })
})

describe('SURVIVOR_CAN_USE_FIGHTING_ARTS_UPDATED_MESSAGE', () => {
  it('returns recalls message', () => {
    expect(SURVIVOR_CAN_USE_FIGHTING_ARTS_UPDATED_MESSAGE(true)).toBe(
      'The survivor recalls the ways of battle.'
    )
  })

  it('returns forgotten message', () => {
    expect(SURVIVOR_CAN_USE_FIGHTING_ARTS_UPDATED_MESSAGE(false)).toBe(
      'The survivor has forgotten their fighting techniques.'
    )
  })
})

describe('SURVIVOR_CAN_USE_FIGHTING_ARTS_OR_KNOWLEDGES_UPDATED_MESSAGE', () => {
  it('returns recalls knowledge message', () => {
    expect(
      SURVIVOR_CAN_USE_FIGHTING_ARTS_OR_KNOWLEDGES_UPDATED_MESSAGE(true)
    ).toBe('The survivor recalls their knowledge.')
  })

  it('returns forgotten learnings message', () => {
    expect(
      SURVIVOR_CAN_USE_FIGHTING_ARTS_OR_KNOWLEDGES_UPDATED_MESSAGE(false)
    ).toBe('The survivor has forgotten their learnings.')
  })
})

describe('SURVIVOR_COLOR_CHANGED_MESSAGE', () => {
  it('returns message with new color', () => {
    expect(SURVIVOR_COLOR_CHANGED_MESSAGE(ColorChoice.RED)).toBe(
      `Survivor color changed to ${ColorChoice.RED}.`
    )
  })
})

describe('SURVIVOR_COURAGE_UNDERSTANDING_ABILITY_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_COURAGE_UNDERSTANDING_ABILITY_UPDATED_MESSAGE()).toBe(
      "The survivor's inner strength grows brighter."
    )
  })
})

describe('SURVIVOR_COURAGE_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_COURAGE_UPDATED_MESSAGE()).toBe(
      'Courage burns brighter in the darkness.'
    )
  })
})

describe('SURVIVOR_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_CREATED_MESSAGE()).toBe(
      'A lantern approaches. A new survivor emerges from the darkness.'
    )
  })
})

describe('SURVIVOR_CURSED_GEAR_REMOVED_MESSAGE', () => {
  it('returns message with name', () => {
    expect(SURVIVOR_CURSED_GEAR_REMOVED_MESSAGE('Ada')).toBe(
      "Ada's cursed gear has been removed."
    )
  })

  it('returns message without name', () => {
    expect(SURVIVOR_CURSED_GEAR_REMOVED_MESSAGE()).toBe(
      "Survivor's cursed gear has been removed."
    )
  })
})

describe('SURVIVOR_CURSED_GEAR_UPDATED_MESSAGE', () => {
  it('returns added message when isNew', () => {
    expect(SURVIVOR_CURSED_GEAR_UPDATED_MESSAGE('Ada', true)).toBe(
      "Ada's cursed gear has been added."
    )
  })

  it('returns updated message when not new', () => {
    expect(SURVIVOR_CURSED_GEAR_UPDATED_MESSAGE('Ada', false)).toBe(
      "Ada's cursed gear has been updated."
    )
  })

  it('returns message without name when isNew', () => {
    expect(SURVIVOR_CURSED_GEAR_UPDATED_MESSAGE(undefined, true)).toBe(
      "Survivor's cursed gear has been added."
    )
  })

  it('returns message without name when not new', () => {
    expect(SURVIVOR_CURSED_GEAR_UPDATED_MESSAGE(undefined, false)).toBe(
      "Survivor's cursed gear has been updated."
    )
  })
})

describe('SURVIVOR_DEAD_STATUS_UPDATED_MESSAGE', () => {
  it('returns fallen message', () => {
    expect(SURVIVOR_DEAD_STATUS_UPDATED_MESSAGE(true)).toBe(
      'The darkness claims another soul. The survivor has fallen.'
    )
  })

  it('returns lives again message', () => {
    expect(SURVIVOR_DEAD_STATUS_UPDATED_MESSAGE(false)).toBe(
      'Against all odds, life returns. The survivor lives again.'
    )
  })
})

describe('SURVIVOR_DISORDER_LIMIT_EXCEEDED_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_DISORDER_LIMIT_EXCEEDED_ERROR_MESSAGE()).toBe(
      'A survivor can have at most 3 disorders.'
    )
  })
})

describe('SURVIVOR_DISORDER_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_DISORDER_REMOVED_MESSAGE()).toBe(
      'The survivor has overcome their disorder.'
    )
  })
})

describe('SURVIVOR_DISORDER_UPDATED_MESSAGE', () => {
  it('returns new disorder message when isNew', () => {
    expect(SURVIVOR_DISORDER_UPDATED_MESSAGE(true)).toBe(
      'The survivor gains a new disorder.'
    )
  })

  it('returns updated message when not new', () => {
    expect(SURVIVOR_DISORDER_UPDATED_MESSAGE(false)).toBe(
      'The disorder has been updated.'
    )
  })

  it('uses false as default', () => {
    expect(SURVIVOR_DISORDER_UPDATED_MESSAGE()).toBe(
      'The disorder has been updated.'
    )
  })
})

describe('SURVIVOR_DISPOSITION_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_DISPOSITION_UPDATED_MESSAGE()).toBe(
      "The wanderer's disposition shifts."
    )
  })
})

describe('SURVIVOR_EVASION_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_EVASION_UPDATED_MESSAGE()).toBe(
      'Grace in the face of death improves.'
    )
  })
})

describe('SURVIVOR_FACES_IN_THE_SKY_TRAIT_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_FACES_IN_THE_SKY_TRAIT_UPDATED_MESSAGE()).toBe(
      'The stars align. Celestial traits recorded.'
    )
  })
})

describe('SURVIVOR_FIGHTING_ART_REMOVED_MESSAGE', () => {
  it('returns secret fighting art message when isSecret', () => {
    expect(SURVIVOR_FIGHTING_ART_REMOVED_MESSAGE(true)).toBe(
      'The secret fighting art has been banished from memory.'
    )
  })

  it('returns fighting art message when not secret', () => {
    expect(SURVIVOR_FIGHTING_ART_REMOVED_MESSAGE(false)).toBe(
      'The fighting art has been forgotten.'
    )
  })

  it('uses false as default', () => {
    expect(SURVIVOR_FIGHTING_ART_REMOVED_MESSAGE()).toBe(
      'The fighting art has been forgotten.'
    )
  })
})

describe('SURVIVOR_FIGHTING_ART_UPDATED_MESSAGE', () => {
  it('returns new secret fighting art message when isNew and isSecret', () => {
    expect(SURVIVOR_FIGHTING_ART_UPDATED_MESSAGE(true, true)).toBe(
      'A new secret fighting art has been mastered.'
    )
  })

  it('returns new fighting art message when isNew and not secret', () => {
    expect(SURVIVOR_FIGHTING_ART_UPDATED_MESSAGE(false, true)).toBe(
      'A new fighting art has been mastered.'
    )
  })

  it('returns perfected secret fighting art message when not new and isSecret', () => {
    expect(SURVIVOR_FIGHTING_ART_UPDATED_MESSAGE(true, false)).toBe(
      'The secret fighting art has been perfected.'
    )
  })

  it('returns perfected fighting art message when not new and not secret', () => {
    expect(SURVIVOR_FIGHTING_ART_UPDATED_MESSAGE(false, false)).toBe(
      'The fighting art has been perfected.'
    )
  })

  it('uses defaults of false, false', () => {
    expect(SURVIVOR_FIGHTING_ART_UPDATED_MESSAGE()).toBe(
      'The fighting art has been perfected.'
    )
  })
})

describe('SURVIVOR_GENDER_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_GENDER_UPDATED_MESSAGE()).toBe(
      "The survivor's essence is recorded in the lantern's glow."
    )
  })
})

describe('SURVIVOR_INSANITY_UPDATED_MESSAGE', () => {
  it('returns gains message when newValue > oldValue', () => {
    expect(SURVIVOR_INSANITY_UPDATED_MESSAGE(0, 1)).toBe(
      'The survivor gains insanity.'
    )
  })

  it('returns loses message when newValue < oldValue', () => {
    expect(SURVIVOR_INSANITY_UPDATED_MESSAGE(1, 0)).toBe(
      'The survivor loses insanity.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(SURVIVOR_INSANITY_UPDATED_MESSAGE(1, 1)).toBe(
      "The survivor's insanity remains unchanged."
    )
  })
})

describe('SURVIVOR_KNOWLEDGE_OBSERVATION_CONDITIONS_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_KNOWLEDGE_OBSERVATION_CONDITIONS_UPDATED_MESSAGE()).toBe(
      'Observation conditions etched in the darkness.'
    )
  })
})

describe('SURVIVOR_KNOWLEDGE_OBSERVATION_RANK_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_KNOWLEDGE_OBSERVATION_RANK_UPDATED_MESSAGE()).toBe(
      'The lantern illuminates newfound wisdom.'
    )
  })
})

describe('SURVIVOR_KNOWLEDGE_RANK_UP_UPDATED_MESSAGE', () => {
  it('returns marked message when value is defined', () => {
    expect(SURVIVOR_KNOWLEDGE_RANK_UP_UPDATED_MESSAGE(3)).toBe(
      'Knowledge rank up milestone marked.'
    )
  })

  it('returns removed message when value is undefined', () => {
    expect(SURVIVOR_KNOWLEDGE_RANK_UP_UPDATED_MESSAGE(undefined)).toBe(
      'Knowledge rank up milestone removed.'
    )
  })
})

describe('SURVIVOR_KNOWLEDGE_RULES_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_KNOWLEDGE_RULES_UPDATED_MESSAGE()).toBe(
      'The rules of wisdom are inscribed in lantern light.'
    )
  })
})

describe('SURVIVOR_KNOWLEDGE_UPDATED_MESSAGE', () => {
  it('returns inscribed message when value is truthy', () => {
    expect(SURVIVOR_KNOWLEDGE_UPDATED_MESSAGE('some knowledge')).toBe(
      'Knowledge inscribed in the lantern light.'
    )
  })

  it('returns forgotten message when value is falsy', () => {
    expect(SURVIVOR_KNOWLEDGE_UPDATED_MESSAGE('')).toBe(
      'Knowledge forgotten in the darkness.'
    )
  })
})

describe('SURVIVOR_LIFETIME_REROLL_USED_UPDATED_MESSAGE', () => {
  it('returns used message', () => {
    expect(SURVIVOR_LIFETIME_REROLL_USED_UPDATED_MESSAGE(true)).toBe(
      'The survivor has used their lifetime reroll.'
    )
  })

  it('returns regained message', () => {
    expect(SURVIVOR_LIFETIME_REROLL_USED_UPDATED_MESSAGE(false)).toBe(
      'The survivor has regained their lifetime reroll.'
    )
  })
})

describe('SURVIVOR_LUCK_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_LUCK_UPDATED_MESSAGE()).toBe(
      'Fortune favors the desperate soul.'
    )
  })
})

describe('SURVIVOR_LUMI_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_LUMI_UPDATED_MESSAGE()).toBe(
      'Arc energy courses through enlightened veins.'
    )
  })
})

describe('SURVIVOR_MOVEMENT_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_MOVEMENT_UPDATED_MESSAGE()).toBe(
      'Strides through darkness grow more confident.'
    )
  })
})

describe('SURVIVOR_NAME_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_NAME_UPDATED_MESSAGE()).toBe(
      "The survivor's name echoes through the lantern light."
    )
  })
})

describe('SURVIVOR_NEUROSIS_UPDATED_MESSAGE', () => {
  it('returns manifests message when value is truthy', () => {
    expect(SURVIVOR_NEUROSIS_UPDATED_MESSAGE('some neurosis')).toBe(
      'The neurosis manifests in the mind.'
    )
  })

  it('returns fades message when value is falsy', () => {
    expect(SURVIVOR_NEUROSIS_UPDATED_MESSAGE('')).toBe(
      'The neurosis fades into darkness.'
    )
  })
})

describe('SURVIVOR_NEXT_DEPARTURE_BONUS_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_NEXT_DEPARTURE_BONUS_REMOVED_MESSAGE()).toBe(
      'The lantern dims. Next departure bonus removed.'
    )
  })
})

describe('SURVIVOR_NEXT_DEPARTURE_BONUS_UPDATED_MESSAGE', () => {
  it('returns added message when isNew', () => {
    expect(SURVIVOR_NEXT_DEPARTURE_BONUS_UPDATED_MESSAGE(true)).toBe(
      'The lantern glows. Next departure bonus added.'
    )
  })

  it('returns updated message when not new', () => {
    expect(SURVIVOR_NEXT_DEPARTURE_BONUS_UPDATED_MESSAGE(false)).toBe(
      'The lantern glows. Next departure bonus updated.'
    )
  })

  it('uses false as default', () => {
    expect(SURVIVOR_NEXT_DEPARTURE_BONUS_UPDATED_MESSAGE()).toBe(
      'The lantern glows. Next departure bonus updated.'
    )
  })
})

describe('SURVIVOR_NOT_FOUND_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_NOT_FOUND_MESSAGE()).toBe(
      'Survivor not found in campaign data.'
    )
  })
})

describe('SURVIVOR_NOTES_SAVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_NOTES_SAVED_MESSAGE()).toBe(
      'The survivor shares their tales, adding to the settlement chronicles.'
    )
  })
})

describe('SURVIVOR_ON_HUNT_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_ON_HUNT_ERROR_MESSAGE()).toBe(
      'The survivor cannot be erased while on a hunt.'
    )
  })
})

describe('SURVIVOR_ON_SHOWDOWN_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_ON_SHOWDOWN_ERROR_MESSAGE()).toBe(
      'The survivor cannot be erased while in a showdown.'
    )
  })
})

describe('SURVIVOR_ONCE_PER_LIFETIME_EVENT_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_ONCE_PER_LIFETIME_EVENT_REMOVED_MESSAGE()).toBe(
      'A fleeting moment fades back into darkness.'
    )
  })
})

describe('SURVIVOR_ONCE_PER_LIFETIME_EVENT_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_ONCE_PER_LIFETIME_EVENT_UPDATED_MESSAGE()).toBe(
      'A once-in-a-lifetime moment has been inscribed in memory.'
    )
  })
})

describe('SURVIVOR_PHILOSOPHY_RANK_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_PHILOSOPHY_RANK_UPDATED_MESSAGE()).toBe(
      'Philosophy rank has been updated.'
    )
  })
})

describe('SURVIVOR_PHILOSOPHY_SELECTED_MESSAGE', () => {
  it('returns illuminates message when value is truthy', () => {
    expect(SURVIVOR_PHILOSOPHY_SELECTED_MESSAGE('Lanternism')).toBe(
      'The path of wisdom begins to illuminate the darkness.'
    )
  })

  it('returns shadow message when value is falsy', () => {
    expect(SURVIVOR_PHILOSOPHY_SELECTED_MESSAGE('')).toBe(
      'The philosophical path returns to shadow.'
    )
  })
})

describe('SURVIVOR_REMOVED_MESSAGE', () => {
  it('returns message with survivor name', () => {
    expect(SURVIVOR_REMOVED_MESSAGE('Ada')).toBe(
      'Darkness overtook Ada. A voice cried out, and was suddenly silenced.'
    )
  })

  it('returns message without survivor name', () => {
    expect(SURVIVOR_REMOVED_MESSAGE(undefined)).toBe(
      'A voice cried out, and was suddenly silenced.'
    )
  })
})

describe('SURVIVOR_RETIRED_STATUS_UPDATED_MESSAGE', () => {
  it('returns retired message', () => {
    expect(SURVIVOR_RETIRED_STATUS_UPDATED_MESSAGE(true)).toBe(
      'The survivor retires from the hunt, seeking peace in the settlement.'
    )
  })

  it('returns return from retirement message', () => {
    expect(SURVIVOR_RETIRED_STATUS_UPDATED_MESSAGE(false)).toBe(
      'The call of adventure stirs once more. The survivor returns from retirement.'
    )
  })
})

describe('SURVIVOR_SKIP_NEXT_HUNT_UPDATED_MESSAGE', () => {
  it('returns will skip message', () => {
    expect(SURVIVOR_SKIP_NEXT_HUNT_UPDATED_MESSAGE(true)).toBe(
      'The survivor will skip the next hunt.'
    )
  })

  it('returns will not skip message', () => {
    expect(SURVIVOR_SKIP_NEXT_HUNT_UPDATED_MESSAGE(false)).toBe(
      'The survivor will not skip the next hunt.'
    )
  })
})

describe('SURVIVOR_SPEED_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_SPEED_UPDATED_MESSAGE()).toBe(
      'Swift as shadows, the survivor advances.'
    )
  })
})

describe('SURVIVOR_STATE_UPDATED_MESSAGE', () => {
  it('returns message with survivor name and state', () => {
    expect(SURVIVOR_STATE_UPDATED_MESSAGE('Ada', 'Retiring')).toBe(
      'Ada is now retiring.'
    )
  })
})

describe('SURVIVOR_STRENGTH_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_STRENGTH_UPDATED_MESSAGE()).toBe(
      'Muscles forged in adversity grow stronger.'
    )
  })
})

describe('SURVIVOR_SURVIVAL_UPDATED_MESSAGE', () => {
  it('returns gains message when newValue > oldValue', () => {
    expect(SURVIVOR_SURVIVAL_UPDATED_MESSAGE(0, 1)).toBe(
      'The survivor gains survival.'
    )
  })

  it('returns loses message when newValue < oldValue', () => {
    expect(SURVIVOR_SURVIVAL_UPDATED_MESSAGE(1, 0)).toBe(
      'The survivor loses survival.'
    )
  })

  it('returns unchanged message when values are equal', () => {
    expect(SURVIVOR_SURVIVAL_UPDATED_MESSAGE(1, 1)).toBe(
      "The survivor's survival remains unchanged."
    )
  })
})

describe('SURVIVOR_SYSTEMIC_PRESSURE_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_SYSTEMIC_PRESSURE_UPDATED_MESSAGE()).toBe(
      'Systemic pressure updated successfully.'
    )
  })
})

describe('SURVIVOR_TENET_KNOWLEDGE_OBSERVATION_CONDITIONS_UPDATED_MESSAGE', () => {
  it('returns recorded message when value is truthy', () => {
    expect(
      SURVIVOR_TENET_KNOWLEDGE_OBSERVATION_CONDITIONS_UPDATED_MESSAGE(
        'conditions'
      )
    ).toBe("Observation conditions are recorded in the survivor's memory.")
  })

  it('returns vanish message when value is falsy', () => {
    expect(
      SURVIVOR_TENET_KNOWLEDGE_OBSERVATION_CONDITIONS_UPDATED_MESSAGE('')
    ).toBe('The conditions vanish into the void.')
  })
})

describe('SURVIVOR_TENET_KNOWLEDGE_OBSERVATION_RANK_UPDATED_MESSAGE', () => {
  it('returns rank up message when isRankUp', () => {
    expect(
      SURVIVOR_TENET_KNOWLEDGE_OBSERVATION_RANK_UPDATED_MESSAGE(true, 3)
    ).toBe(
      'Wisdom ascends through knowledge and understanding. Rank up achieved!'
    )
  })

  it('returns rank message when not rank up', () => {
    expect(
      SURVIVOR_TENET_KNOWLEDGE_OBSERVATION_RANK_UPDATED_MESSAGE(false, 3)
    ).toBe("Observation rank 3 burns bright in the lantern's glow.")
  })
})

describe('SURVIVOR_TENET_KNOWLEDGE_RANK_UP_UPDATED_MESSAGE', () => {
  it('returns marked message when value is defined', () => {
    expect(SURVIVOR_TENET_KNOWLEDGE_RANK_UP_UPDATED_MESSAGE(3)).toBe(
      'Tenet knowledge rank up milestone marked.'
    )
  })

  it('returns removed message when value is undefined', () => {
    expect(SURVIVOR_TENET_KNOWLEDGE_RANK_UP_UPDATED_MESSAGE(undefined)).toBe(
      'Tenet knowledge rank up milestone removed.'
    )
  })

  it('returns marked message when value is null', () => {
    expect(SURVIVOR_TENET_KNOWLEDGE_RANK_UP_UPDATED_MESSAGE(null)).toBe(
      'Tenet knowledge rank up milestone marked.'
    )
  })
})

describe('SURVIVOR_TENET_KNOWLEDGE_RULES_UPDATED_MESSAGE', () => {
  it('returns etched message when value is truthy', () => {
    expect(SURVIVOR_TENET_KNOWLEDGE_RULES_UPDATED_MESSAGE('rules')).toBe(
      'The rules of knowledge are etched in stone.'
    )
  })

  it('returns mystery message when value is falsy', () => {
    expect(SURVIVOR_TENET_KNOWLEDGE_RULES_UPDATED_MESSAGE('')).toBe(
      'The rules fade back into mystery.'
    )
  })
})

describe('SURVIVOR_TENET_KNOWLEDGE_UPDATED_MESSAGE', () => {
  it('returns inscribed message when value is truthy', () => {
    expect(SURVIVOR_TENET_KNOWLEDGE_UPDATED_MESSAGE('knowledge')).toBe(
      'Tenet knowledge is inscribed in memory.'
    )
  })

  it('returns dissolves message when value is falsy', () => {
    expect(SURVIVOR_TENET_KNOWLEDGE_UPDATED_MESSAGE('')).toBe(
      'Tenet knowledge dissolves into shadow.'
    )
  })
})

describe('SURVIVOR_TORMENT_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_TORMENT_UPDATED_MESSAGE()).toBe('Torment level updated.')
  })
})

describe('SURVIVOR_UNDERSTANDING_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_UNDERSTANDING_UPDATED_MESSAGE()).toBe(
      'Understanding illuminates the path forward.'
    )
  })
})

describe('SURVIVOR_WEAPON_PROFICIENCY_MASTER_ACHIEVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_WEAPON_PROFICIENCY_MASTER_ACHIEVED_MESSAGE()).toBe(
      'The survivor achieves mastery beyond mortal limits.'
    )
  })
})

describe('SURVIVOR_WEAPON_PROFICIENCY_SPECIALIST_ACHIEVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_WEAPON_PROFICIENCY_SPECIALIST_ACHIEVED_MESSAGE()).toBe(
      'The survivor becomes a specialist in their craft.'
    )
  })
})

describe('SURVIVOR_WEAPON_PROFICIENCY_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_WEAPON_PROFICIENCY_UPDATED_MESSAGE()).toBe(
      'The survivor hones their weapon proficiency.'
    )
  })
})

describe('WEAPON_TYPE_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(WEAPON_TYPE_CREATED_MESSAGE()).toBe(
      'A new weapon type is forged from the darkness.'
    )
  })
})

describe('WEAPON_TYPE_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(WEAPON_TYPE_REMOVED_MESSAGE()).toBe(
      'The weapon type is lost to the darkness.'
    )
  })
})

describe('WEAPON_TYPE_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(WEAPON_TYPE_UPDATED_MESSAGE()).toBe(
      'The weapon type has been reforged.'
    )
  })
})

describe('SURVIVOR_WEAPON_TYPE_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_WEAPON_TYPE_UPDATED_MESSAGE()).toBe(
      'The survivor turns their focus to a new weapon.'
    )
  })
})

describe('WANDERER_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(WANDERER_CREATED_MESSAGE()).toBe(
      'A new wanderer emerges from the endless darkness.'
    )
  })
})

describe('WANDERER_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(WANDERER_REMOVED_MESSAGE()).toBe(
      'The wanderer vanishes into the shadows.'
    )
  })
})

describe('WANDERER_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(WANDERER_UPDATED_MESSAGE()).toBe(
      "The wanderer's tale has been inscribed."
    )
  })
})

describe('SURVIVORS_HEALED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVORS_HEALED_MESSAGE()).toBe('The survivors mend their wounds.')
  })
})

describe('SURVIVORS_MOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVORS_MOVED_MESSAGE()).toBe(
      'Survivors press deeper into the dark.'
    )
  })
})

describe('SYSTEMIC_PRESSURE_MINIMUM_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SYSTEMIC_PRESSURE_MINIMUM_ERROR_MESSAGE()).toBe(
      'Systemic pressure cannot be negative.'
    )
  })
})

describe('TIMELINE_EVENT_EMPTY_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(TIMELINE_EVENT_EMPTY_ERROR_MESSAGE()).toBe(
      'Cannot save an empty event!'
    )
  })
})

describe('TIMELINE_EVENT_EMPTY_WARNING_MESSAGE', () => {
  it('returns correct message', () => {
    expect(TIMELINE_EVENT_EMPTY_WARNING_MESSAGE()).toBe(
      'Finish editing the current event before adding another.'
    )
  })
})

describe('TIMELINE_EVENT_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(TIMELINE_EVENT_REMOVED_MESSAGE()).toBe(
      'The chronicle is altered - a memory fades into darkness.'
    )
  })
})

describe('TIMELINE_EVENT_SAVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(TIMELINE_EVENT_SAVED_MESSAGE()).toBe(
      'The chronicles remember - a memory is etched in stone.'
    )
  })
})

describe('TIMELINE_YEAR_ADDED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(TIMELINE_YEAR_ADDED_MESSAGE()).toBe(
      'A new lantern year is added - the chronicles expand.'
    )
  })
})

describe('TIMELINE_YEAR_COMPLETED_MESSAGE', () => {
  it('returns triumph message when completed', () => {
    expect(TIMELINE_YEAR_COMPLETED_MESSAGE(true)).toBe(
      'The year concludes in triumph.'
    )
  })

  it('returns unfinished message when not completed', () => {
    expect(TIMELINE_YEAR_COMPLETED_MESSAGE(false)).toBe(
      'The year remains unfinished.'
    )
  })
})

describe('TORMENT_MINIMUM_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(TORMENT_MINIMUM_ERROR_MESSAGE()).toBe('Torment cannot be negative.')
  })
})

describe('STRAIN_MILESTONE_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(STRAIN_MILESTONE_CREATED_MESSAGE()).toBe(
      'A new strain milestone emerges from the struggle.'
    )
  })
})

describe('STRAIN_MILESTONE_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(STRAIN_MILESTONE_REMOVED_MESSAGE()).toBe(
      'The strain milestone crumbles into dust.'
    )
  })
})

describe('STRAIN_MILESTONE_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(STRAIN_MILESTONE_UPDATED_MESSAGE()).toBe(
      'The strain milestone shifts under pressure.'
    )
  })
})

describe('TRAIT_CREATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(TRAIT_CREATED_MESSAGE()).toBe('A new trait emerges.')
  })
})

describe('TRAIT_REMOVED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(TRAIT_REMOVED_MESSAGE()).toBe('The trait fades from memory.')
  })
})

describe('TRAIT_UPDATED_MESSAGE', () => {
  it('returns correct message', () => {
    expect(TRAIT_UPDATED_MESSAGE()).toBe('The trait has been updated.')
  })
})
