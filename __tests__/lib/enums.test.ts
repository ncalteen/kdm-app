import { describe, expect, it } from 'vitest'

import {
  AenasState,
  AmbushType,
  CampaignType,
  ColorChoice,
  DatabaseCampaignType,
  DatabaseGender,
  DatabaseSurvivorType,
  Gender,
  HuntEventCount,
  HuntEventType,
  MonsterNode,
  MonsterType,
  MonsterVersion,
  Philosophy,
  ResourceCategory,
  ResourceType,
  SettlementPhaseStep,
  ShowdownType,
  SurvivorCardMode,
  SurvivorType,
  TabType,
  TurnType
} from '@/lib/enums'

describe('CampaignType', () => {
  it('has correct values', () => {
    expect(CampaignType.PEOPLE_OF_THE_DREAM_KEEPER).toBe(
      'People of the Dream Keeper'
    )
    expect(CampaignType.PEOPLE_OF_THE_LANTERN).toBe('People of the Lantern')
    expect(CampaignType.PEOPLE_OF_THE_STARS).toBe('People of the Stars')
    expect(CampaignType.PEOPLE_OF_THE_SUN).toBe('People of the Sun')
    expect(CampaignType.SQUIRES_OF_THE_CITADEL).toBe('Squires of the Citadel')
    expect(CampaignType.CUSTOM).toBe('Custom')
  })
})

describe('DatabaseCampaignType', () => {
  it('has correct values', () => {
    expect(DatabaseCampaignType['People of the Dream Keeper']).toBe(
      'PEOPLE_OF_THE_DREAM_KEEPER'
    )
    expect(DatabaseCampaignType['People of the Lantern']).toBe(
      'PEOPLE_OF_THE_LANTERN'
    )
    expect(DatabaseCampaignType['People of the Stars']).toBe(
      'PEOPLE_OF_THE_STARS'
    )
    expect(DatabaseCampaignType['People of the Sun']).toBe('PEOPLE_OF_THE_SUN')
    expect(DatabaseCampaignType['Squires of the Citadel']).toBe(
      'SQUIRES_OF_THE_CITADEL'
    )
    expect(DatabaseCampaignType['Custom']).toBe('CUSTOM')
  })
})

describe('SurvivorType', () => {
  it('has correct values', () => {
    expect(SurvivorType.ARC).toBe('Arc')
    expect(SurvivorType.CORE).toBe('Core')
  })
})

describe('DatabaseSurvivorType', () => {
  it('has correct values', () => {
    expect(DatabaseSurvivorType['Arc']).toBe('ARC')
    expect(DatabaseSurvivorType['Core']).toBe('CORE')
  })
})

describe('TabType', () => {
  it('has correct values', () => {
    expect(TabType.ADMIN_SETTINGS).toBe('adminSettings')
    expect(TabType.ARC).toBe('arc')
    expect(TabType.CRAFTING).toBe('crafting')
    expect(TabType.HUNT).toBe('hunt')
    expect(TabType.MONSTERS).toBe('monsters')
    expect(TabType.NOTES).toBe('notes')
    expect(TabType.SETTINGS).toBe('settings')
    expect(TabType.SETTLEMENT_PHASE).toBe('settlementPhase')
    expect(TabType.SETTLEMENT_SETTINGS).toBe('settlementSettings')
    expect(TabType.SHOWDOWN).toBe('showdown')
    expect(TabType.SOCIETY).toBe('society')
    expect(TabType.SQUIRES).toBe('squires')
    expect(TabType.SURVIVORS).toBe('survivors')
    expect(TabType.TIMELINE).toBe('timeline')
    expect(TabType.USER).toBe('user')
  })
})

describe('Gender', () => {
  it('has correct values', () => {
    expect(Gender.FEMALE).toBe('F')
    expect(Gender.MALE).toBe('M')
  })
})

describe('DatabaseGender', () => {
  it('has correct values', () => {
    expect(DatabaseGender.F).toBe('FEMALE')
    expect(DatabaseGender.M).toBe('MALE')
  })
})

describe('ResourceCategory', () => {
  it('has correct values', () => {
    expect(ResourceCategory.BASIC).toBe('Basic')
    expect(ResourceCategory.MONSTER).toBe('Monster')
    expect(ResourceCategory.STRANGE).toBe('Strange')
    expect(ResourceCategory.VERMIN).toBe('Vermin')
  })
})

describe('ResourceType', () => {
  it('has correct values', () => {
    expect(ResourceType.BONE).toBe('Bone')
    expect(ResourceType.HIDE).toBe('Hide')
    expect(ResourceType.ORGAN).toBe('Organ')
    expect(ResourceType.SCRAP).toBe('Scrap')
    expect(ResourceType.HERB).toBe('Herb')
    expect(ResourceType.VERMIN).toBe('Vermin')
  })
})

describe('MonsterType', () => {
  it('has correct values', () => {
    expect(MonsterType.NEMESIS).toBe('Nemesis')
    expect(MonsterType.QUARRY).toBe('Quarry')
  })
})

describe('ColorChoice', () => {
  it('has correct values', () => {
    expect(ColorChoice.NEUTRAL).toBe('neutral')
    expect(ColorChoice.STONE).toBe('stone')
    expect(ColorChoice.ZINC).toBe('zinc')
    expect(ColorChoice.SLATE).toBe('slate')
    expect(ColorChoice.GRAY).toBe('gray')
    expect(ColorChoice.RED).toBe('red')
    expect(ColorChoice.ORANGE).toBe('orange')
    expect(ColorChoice.AMBER).toBe('amber')
    expect(ColorChoice.YELLOW).toBe('yellow')
    expect(ColorChoice.LIME).toBe('lime')
    expect(ColorChoice.GREEN).toBe('green')
    expect(ColorChoice.EMERALD).toBe('emerald')
    expect(ColorChoice.TEAL).toBe('teal')
    expect(ColorChoice.CYAN).toBe('cyan')
    expect(ColorChoice.SKY).toBe('sky')
    expect(ColorChoice.BLUE).toBe('blue')
    expect(ColorChoice.INDIGO).toBe('indigo')
    expect(ColorChoice.VIOLET).toBe('violet')
    expect(ColorChoice.PURPLE).toBe('purple')
    expect(ColorChoice.FUCHSIA).toBe('fuchsia')
    expect(ColorChoice.PINK).toBe('pink')
    expect(ColorChoice.ROSE).toBe('rose')
  })
})

describe('AmbushType', () => {
  it('has correct values', () => {
    expect(AmbushType.SURVIVORS).toBe('survivors')
    expect(AmbushType.NONE).toBe('none')
    expect(AmbushType.MONSTER).toBe('monster')
  })
})

describe('TurnType', () => {
  it('has correct values', () => {
    expect(TurnType.MONSTER).toBe('monster')
    expect(TurnType.SURVIVORS).toBe('survivors')
  })
})

describe('SurvivorCardMode', () => {
  it('has correct values', () => {
    expect(SurvivorCardMode.HUNT_CARD).toBe('hunt')
    expect(SurvivorCardMode.SETTLEMENT_PHASE_CARD).toBe('settlementPhase')
    expect(SurvivorCardMode.SHOWDOWN_CARD).toBe('showdown')
    expect(SurvivorCardMode.SURVIVOR_CARD).toBe('survivor')
  })
})

describe('HuntEventType', () => {
  it('has correct values', () => {
    expect(HuntEventType.ARC).toBe('ARC')
    expect(HuntEventType.BASIC).toBe('BASIC')
    expect(HuntEventType.MONSTER).toBe('MONSTER')
    expect(HuntEventType.SCOUT).toBe('SCOUT')
  })
})

describe('HuntEventCount', () => {
  it('has correct values', () => {
    expect(HuntEventCount.ARC_SCOUT).toBe(10)
    expect(HuntEventCount.BASIC).toBe(100)
  })
})

describe('MonsterNode', () => {
  it('has correct values', () => {
    expect(MonsterNode.NQ1).toBe('NQ1')
    expect(MonsterNode.NQ2).toBe('NQ2')
    expect(MonsterNode.NQ3).toBe('NQ3')
    expect(MonsterNode.NQ4).toBe('NQ4')
    expect(MonsterNode.NN1).toBe('NN1')
    expect(MonsterNode.NN2).toBe('NN2')
    expect(MonsterNode.NN3).toBe('NN3')
    expect(MonsterNode.CO).toBe('CO')
    expect(MonsterNode.FI).toBe('FI')
  })
})

describe('MonsterVersion', () => {
  it('has correct values', () => {
    expect(MonsterVersion.ORIGINAL).toBe('original')
    expect(MonsterVersion.ALTERNATE).toBe('alternate')
    expect(MonsterVersion.VIGNETTE).toBe('vignette')
  })
})

describe('SettlementPhaseStep', () => {
  it('has correct values', () => {
    expect(SettlementPhaseStep.SET_UP_SETTLEMENT).toBe('Set Up Settlement')
    expect(SettlementPhaseStep.SURVIVORS_RETURN).toBe('Survivors Return')
    expect(SettlementPhaseStep.GAIN_ENDEAVORS).toBe('Gain Endeavors')
    expect(SettlementPhaseStep.UPDATE_TIMELINE).toBe('Update Timeline')
    expect(SettlementPhaseStep.UPDATE_DEATH_COUNT).toBe('Update Death Count')
    expect(SettlementPhaseStep.CHECK_MILESTONES).toBe('Check Milestones')
    expect(SettlementPhaseStep.DEVELOP).toBe('Develop')
    expect(SettlementPhaseStep.PREPARE_DEPARTING_SURVIVORS).toBe(
      'Prepare Departing Survivors'
    )
    expect(SettlementPhaseStep.SPECIAL_SHOWDOWN).toBe('Special Showdown')
    expect(SettlementPhaseStep.RECORD_AND_ARCHIVE_RESOURCES).toBe(
      'Record and Archive Resources'
    )
    expect(SettlementPhaseStep.END_SETTLEMENT_PHASE).toBe(
      'End Settlement Phase'
    )
  })
})

describe('ShowdownType', () => {
  it('has correct values', () => {
    expect(ShowdownType.REGULAR).toBe('Regular')
    expect(ShowdownType.SPECIAL).toBe('Special')
  })
})

describe('Philosophy', () => {
  it('has correct values', () => {
    expect(Philosophy.AMBITIONISM).toBe('Ambitionism')
    expect(Philosophy.CHAMPION).toBe('Champion')
    expect(Philosophy.COLLECTIVISM).toBe('Collectivism')
    expect(Philosophy.DEADISM).toBe('Deadism')
    expect(Philosophy.DREAMISM).toBe('Dreamism')
    expect(Philosophy.LANTERNISM).toBe('Lanternism')
  })
})

describe('AenasState', () => {
  it('has correct values', () => {
    expect(AenasState.CONTENT).toBe('Content')
    expect(AenasState.HUNGRY).toBe('Hungry')
  })
})
