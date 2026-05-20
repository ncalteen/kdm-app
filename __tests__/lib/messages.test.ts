import { describe, expect, it } from 'vitest'

import { SurvivorType } from '@/lib/enums'
import {
  CAMPAIGN_UNLOCK_KILLENIUM_BUTCHER_UPDATED_MESSAGE,
  CAMPAIGN_UNLOCK_SCREAMING_NUKALOPE_UPDATED_MESSAGE,
  CAMPAIGN_UNLOCK_WHITE_GIGALION_UPDATED_MESSAGE,
  EMBARK_GEAR_SHORTAGE_ERROR_MESSAGE,
  ENDEAVORS_MINIMUM_ERROR_MESSAGE,
  ERROR_MESSAGE,
  FIGHTING_ARTS_MAX_EXCEEDED_ERROR_MESSAGE,
  GEAR_GRID_SETTLEMENT_REQUIRED_ERROR_MESSAGE,
  HUNT_ALREADY_ACTIVE_ERROR_MESSAGE,
  INSANITY_MINIMUM_ERROR_MESSAGE,
  MONSTER_LEVEL_MISSING_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE,
  SCOUT_CONFLICT_MESSAGE,
  SCOUT_REQUIRED_MESSAGE,
  SETTLEMENT_CREATED_MESSAGE,
  SETTLEMENT_DELETED_MESSAGE,
  SETTLEMENT_USES_SCOUTS_SETTING_UPDATED_MESSAGE,
  SHOWDOWN_ALREADY_ACTIVE_ERROR_MESSAGE,
  STRIPE_CHECKOUT_CANCELLED_MESSAGE,
  STRIPE_CHECKOUT_SUCCESS_MESSAGE,
  SURVIVAL_LIMIT_EXCEEDED_ERROR_MESSAGE,
  SURVIVAL_LIMIT_MINIMUM_ERROR_MESSAGE,
  SURVIVAL_MINIMUM_ERROR_MESSAGE,
  SURVIVOR_CREATED_MESSAGE,
  SURVIVOR_DISORDER_LIMIT_EXCEEDED_ERROR_MESSAGE,
  SURVIVOR_ON_HUNT_ERROR_MESSAGE,
  SURVIVOR_ON_SHOWDOWN_ERROR_MESSAGE,
  SURVIVOR_REMOVED_MESSAGE,
  SYSTEMIC_PRESSURE_MINIMUM_ERROR_MESSAGE,
  TIMELINE_EVENT_EMPTY_ERROR_MESSAGE,
  TIMELINE_EVENT_EMPTY_WARNING_MESSAGE,
  TORMENT_MINIMUM_ERROR_MESSAGE
} from '@/lib/messages'

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

describe('ENDEAVORS_MINIMUM_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(ENDEAVORS_MINIMUM_ERROR_MESSAGE()).toBe(
      'Endeavors cannot be reduced below 0.'
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

describe('INSANITY_MINIMUM_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(INSANITY_MINIMUM_ERROR_MESSAGE()).toBe(
      'Insanity cannot be negative.'
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

describe('NAMELESS_OBJECT_ERROR_MESSAGE', () => {
  it('returns message with object type', () => {
    expect(NAMELESS_OBJECT_ERROR_MESSAGE('survivor')).toBe(
      'A nameless survivor cannot be recorded.'
    )
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

describe('SHOWDOWN_ALREADY_ACTIVE_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SHOWDOWN_ALREADY_ACTIVE_ERROR_MESSAGE()).toBe(
      'A showdown is already in progress. Survive it before facing another foe.'
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
      'You step back from the merchant.'
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

describe('SURVIVAL_MINIMUM_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVAL_MINIMUM_ERROR_MESSAGE()).toBe(
      'Survival cannot be negative.'
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

describe('SURVIVOR_DISORDER_LIMIT_EXCEEDED_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(SURVIVOR_DISORDER_LIMIT_EXCEEDED_ERROR_MESSAGE()).toBe(
      'A survivor can have at most 3 disorders.'
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

describe('TORMENT_MINIMUM_ERROR_MESSAGE', () => {
  it('returns correct message', () => {
    expect(TORMENT_MINIMUM_ERROR_MESSAGE()).toBe('Torment cannot be negative.')
  })
})
