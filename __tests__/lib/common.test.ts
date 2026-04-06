import { describe, expect, it } from 'vitest'

import {
  LOCAL_STORAGE_KEY,
  baseMonsterLevelData,
  basicHuntBoard,
  monsterAttributeTokenMap,
  settlementPhaseSteps,
  vignetteUnlockMap
} from '@/lib/common'
import { HuntEventType, SettlementPhaseStep } from '@/lib/enums'

describe('LOCAL_STORAGE_KEY', () => {
  it('is defined', () => {
    expect(LOCAL_STORAGE_KEY).toBe('kdm-archivist-local')
  })
})

describe('basicHuntBoard', () => {
  it('has correct structure', () => {
    expect(basicHuntBoard[0]).toBeUndefined()
    expect(basicHuntBoard[1]).toBe(HuntEventType.BASIC)
    expect(basicHuntBoard[2]).toBe(HuntEventType.BASIC)
    expect(basicHuntBoard[3]).toBe(HuntEventType.BASIC)
    expect(basicHuntBoard[4]).toBe(HuntEventType.BASIC)
    expect(basicHuntBoard[5]).toBe(HuntEventType.BASIC)
    expect(basicHuntBoard[6]).toBeUndefined()
    expect(basicHuntBoard[7]).toBe(HuntEventType.BASIC)
    expect(basicHuntBoard[8]).toBe(HuntEventType.BASIC)
    expect(basicHuntBoard[9]).toBe(HuntEventType.BASIC)
    expect(basicHuntBoard[10]).toBe(HuntEventType.BASIC)
    expect(basicHuntBoard[11]).toBe(HuntEventType.BASIC)
    expect(basicHuntBoard[12]).toBeUndefined()
  })
})

describe('baseMonsterLevelData', () => {
  it('has correct default values', () => {
    expect(baseMonsterLevelData.sub_monster_name).toBe('')
    expect(baseMonsterLevelData.basic_cards).toBe(0)
    expect(baseMonsterLevelData.advanced_cards).toBe(0)
    expect(baseMonsterLevelData.legendary_cards).toBe(0)
    expect(baseMonsterLevelData.overtone_cards).toBe(0)
    expect(baseMonsterLevelData.accuracy).toBe(0)
    expect(baseMonsterLevelData.accuracy_tokens).toBe(0)
    expect(baseMonsterLevelData.damage).toBe(0)
    expect(baseMonsterLevelData.damage_tokens).toBe(0)
    expect(baseMonsterLevelData.evasion).toBe(0)
    expect(baseMonsterLevelData.evasion_tokens).toBe(0)
    expect(baseMonsterLevelData.luck).toBe(0)
    expect(baseMonsterLevelData.luck_tokens).toBe(0)
    expect(baseMonsterLevelData.movement).toBe(1)
    expect(baseMonsterLevelData.movement_tokens).toBe(0)
    expect(baseMonsterLevelData.speed).toBe(0)
    expect(baseMonsterLevelData.speed_tokens).toBe(0)
    expect(baseMonsterLevelData.strength).toBe(0)
    expect(baseMonsterLevelData.strength_tokens).toBe(0)
    expect(baseMonsterLevelData.toughness).toBe(0)
    expect(baseMonsterLevelData.toughness_tokens).toBe(0)
    expect(baseMonsterLevelData.life).toBe(0)
    expect(baseMonsterLevelData.traits).toEqual([])
    expect(baseMonsterLevelData.moods).toEqual([])
  })
})

describe('monsterAttributeTokenMap', () => {
  it('has correct entries', () => {
    expect(monsterAttributeTokenMap).toHaveLength(8)
    expect(monsterAttributeTokenMap[0]).toEqual({
      key: 'movement',
      tokenKey: 'movement_tokens',
      label: 'Movement'
    })
    expect(monsterAttributeTokenMap[1]).toEqual({
      key: 'accuracy',
      tokenKey: 'accuracy_tokens',
      label: 'Accuracy'
    })
    expect(monsterAttributeTokenMap[2]).toEqual({
      key: 'damage',
      tokenKey: 'damage_tokens',
      label: 'Damage'
    })
    expect(monsterAttributeTokenMap[3]).toEqual({
      key: 'strength',
      tokenKey: 'strength_tokens',
      label: 'Strength'
    })
    expect(monsterAttributeTokenMap[4]).toEqual({
      key: 'evasion',
      tokenKey: 'evasion_tokens',
      label: 'Evasion'
    })
    expect(monsterAttributeTokenMap[5]).toEqual({
      key: 'luck',
      tokenKey: 'luck_tokens',
      label: 'Luck'
    })
    expect(monsterAttributeTokenMap[6]).toEqual({
      key: 'speed',
      tokenKey: 'speed_tokens',
      label: 'Speed'
    })
    expect(monsterAttributeTokenMap[7]).toEqual({
      key: 'toughness',
      tokenKey: 'toughness_tokens',
      label: 'Toughness'
    })
  })
})

describe('settlementPhaseSteps', () => {
  it('has 11 steps', () => {
    expect(settlementPhaseSteps).toHaveLength(11)
  })

  it('steps have correct indices and steps', () => {
    expect(settlementPhaseSteps[0].index).toBe(0)
    expect(settlementPhaseSteps[0].step).toBe(
      SettlementPhaseStep.SET_UP_SETTLEMENT
    )

    expect(settlementPhaseSteps[1].index).toBe(1)
    expect(settlementPhaseSteps[1].step).toBe(
      SettlementPhaseStep.SURVIVORS_RETURN
    )

    expect(settlementPhaseSteps[2].index).toBe(2)
    expect(settlementPhaseSteps[2].step).toBe(
      SettlementPhaseStep.GAIN_ENDEAVORS
    )

    expect(settlementPhaseSteps[3].index).toBe(3)
    expect(settlementPhaseSteps[3].step).toBe(
      SettlementPhaseStep.UPDATE_TIMELINE
    )

    expect(settlementPhaseSteps[4].index).toBe(4)
    expect(settlementPhaseSteps[4].step).toBe(
      SettlementPhaseStep.UPDATE_DEATH_COUNT
    )

    expect(settlementPhaseSteps[5].index).toBe(5)
    expect(settlementPhaseSteps[5].step).toBe(
      SettlementPhaseStep.CHECK_MILESTONES
    )

    expect(settlementPhaseSteps[6].index).toBe(6)
    expect(settlementPhaseSteps[6].step).toBe(SettlementPhaseStep.DEVELOP)

    expect(settlementPhaseSteps[7].index).toBe(7)
    expect(settlementPhaseSteps[7].step).toBe(
      SettlementPhaseStep.PREPARE_DEPARTING_SURVIVORS
    )

    expect(settlementPhaseSteps[8].index).toBe(8)
    expect(settlementPhaseSteps[8].step).toBe(
      SettlementPhaseStep.SPECIAL_SHOWDOWN
    )

    expect(settlementPhaseSteps[9].index).toBe(9)
    expect(settlementPhaseSteps[9].step).toBe(
      SettlementPhaseStep.RECORD_AND_ARCHIVE_RESOURCES
    )

    expect(settlementPhaseSteps[10].index).toBe(10)
    expect(settlementPhaseSteps[10].step).toBe(
      SettlementPhaseStep.END_SETTLEMENT_PHASE
    )
  })

  it('each step has an icon', () => {
    for (const step of settlementPhaseSteps) {
      expect(step.icon).toBeDefined()
    }
  })
})

describe('vignetteUnlockMap', () => {
  it('has correct entries', () => {
    expect(vignetteUnlockMap['Killenium Butcher']).toBe(
      'unlocked_killenium_butcher'
    )
    expect(vignetteUnlockMap['Screaming Nukalope']).toBe(
      'unlocked_screaming_nukalope'
    )
    expect(vignetteUnlockMap['White Gigalion']).toBe('unlocked_white_gigalion')
  })
})
