import { describe, expect, it } from 'vitest'

import { CampaignType, SurvivorType } from '@/lib/enums'
import { NewSettlementInputSchema } from '@/schemas/new-settlement-input'

describe('NewSettlementInputSchema', () => {
  const minimalValidInput = { settlementName: 'Bright Hollow', monsterIds: {} }

  describe('defaults', () => {
    it('applies all default values when only settlementName is provided', () => {
      const result = NewSettlementInputSchema.parse(minimalValidInput)

      expect(result.campaignType).toBe(CampaignType.PEOPLE_OF_THE_LANTERN)
      expect(result.settlementName).toBe('Bright Hollow')
      expect(result.survivorType).toBe(SurvivorType.CORE)
      expect(result.usesScouts).toBe(false)
      expect(result.monsterIds).toEqual({
        NQ1: [],
        NQ2: [],
        NQ3: [],
        NQ4: [],
        NN1: [],
        NN2: [],
        NN3: [],
        CO: [],
        FI: []
      })
      expect(result.wandererIds).toEqual([])
    })
  })

  describe('settlementName', () => {
    it('is required', () => {
      expect(() => NewSettlementInputSchema.parse({ monsterIds: {} })).toThrow()
    })

    it('rejects an empty string', () => {
      expect(() =>
        NewSettlementInputSchema.parse({ settlementName: '', monsterIds: {} })
      ).toThrow('A nameless settlement cannot be recorded.')
    })

    it('accepts a valid non-empty string', () => {
      const result = NewSettlementInputSchema.parse(minimalValidInput)

      expect(result.settlementName).toBe('Bright Hollow')
    })
  })

  describe('campaignType', () => {
    it('defaults to People of the Lantern', () => {
      const result = NewSettlementInputSchema.parse(minimalValidInput)

      expect(result.campaignType).toBe(CampaignType.PEOPLE_OF_THE_LANTERN)
    })

    it('accepts People of the Dream Keeper', () => {
      const result = NewSettlementInputSchema.parse({
        ...minimalValidInput,
        campaignType: CampaignType.PEOPLE_OF_THE_DREAM_KEEPER
      })

      expect(result.campaignType).toBe(CampaignType.PEOPLE_OF_THE_DREAM_KEEPER)
    })

    it('accepts People of the Stars', () => {
      const result = NewSettlementInputSchema.parse({
        ...minimalValidInput,
        campaignType: CampaignType.PEOPLE_OF_THE_STARS
      })

      expect(result.campaignType).toBe(CampaignType.PEOPLE_OF_THE_STARS)
    })

    it('accepts People of the Sun', () => {
      const result = NewSettlementInputSchema.parse({
        ...minimalValidInput,
        campaignType: CampaignType.PEOPLE_OF_THE_SUN
      })

      expect(result.campaignType).toBe(CampaignType.PEOPLE_OF_THE_SUN)
    })

    it('accepts Squires of the Citadel', () => {
      const result = NewSettlementInputSchema.parse({
        ...minimalValidInput,
        campaignType: CampaignType.SQUIRES_OF_THE_CITADEL
      })

      expect(result.campaignType).toBe(CampaignType.SQUIRES_OF_THE_CITADEL)
    })

    it('accepts Custom', () => {
      const result = NewSettlementInputSchema.parse({
        ...minimalValidInput,
        campaignType: CampaignType.CUSTOM
      })

      expect(result.campaignType).toBe(CampaignType.CUSTOM)
    })

    it('rejects an invalid value', () => {
      expect(() =>
        NewSettlementInputSchema.parse({
          ...minimalValidInput,
          campaignType: 'People of the Darkness'
        })
      ).toThrow()
    })
  })

  describe('survivorType', () => {
    it('defaults to Core', () => {
      const result = NewSettlementInputSchema.parse(minimalValidInput)

      expect(result.survivorType).toBe(SurvivorType.CORE)
    })

    it('accepts Arc', () => {
      const result = NewSettlementInputSchema.parse({
        ...minimalValidInput,
        survivorType: SurvivorType.ARC
      })

      expect(result.survivorType).toBe(SurvivorType.ARC)
    })

    it('accepts Core', () => {
      const result = NewSettlementInputSchema.parse({
        ...minimalValidInput,
        survivorType: SurvivorType.CORE
      })

      expect(result.survivorType).toBe(SurvivorType.CORE)
    })

    it('rejects an invalid value', () => {
      expect(() =>
        NewSettlementInputSchema.parse({
          ...minimalValidInput,
          survivorType: 'Wanderer'
        })
      ).toThrow()
    })
  })

  describe('usesScouts', () => {
    it('defaults to false', () => {
      const result = NewSettlementInputSchema.parse(minimalValidInput)

      expect(result.usesScouts).toBe(false)
    })

    it('accepts true', () => {
      const result = NewSettlementInputSchema.parse({
        ...minimalValidInput,
        usesScouts: true
      })

      expect(result.usesScouts).toBe(true)
    })
  })

  describe('monsterIds', () => {
    it('defaults all nodes to empty arrays', () => {
      const result = NewSettlementInputSchema.parse(minimalValidInput)

      expect(result.monsterIds.NQ1).toEqual([])
      expect(result.monsterIds.NQ2).toEqual([])
      expect(result.monsterIds.NQ3).toEqual([])
      expect(result.monsterIds.NQ4).toEqual([])
      expect(result.monsterIds.NN1).toEqual([])
      expect(result.monsterIds.NN2).toEqual([])
      expect(result.monsterIds.NN3).toEqual([])
      expect(result.monsterIds.CO).toEqual([])
      expect(result.monsterIds.FI).toEqual([])
    })

    it('accepts monster IDs for each node', () => {
      const result = NewSettlementInputSchema.parse({
        ...minimalValidInput,
        monsterIds: {
          NQ1: ['white-lion'],
          NQ2: ['screaming-antelope'],
          NQ3: ['phoenix'],
          NQ4: ['dragon-king'],
          NN1: ['butcher'],
          NN2: ['hand'],
          NN3: ['watcher'],
          CO: ['lion-god'],
          FI: ['gold-smoke-knight']
        }
      })

      expect(result.monsterIds.NQ1).toEqual(['white-lion'])
      expect(result.monsterIds.NQ2).toEqual(['screaming-antelope'])
      expect(result.monsterIds.NQ3).toEqual(['phoenix'])
      expect(result.monsterIds.NQ4).toEqual(['dragon-king'])
      expect(result.monsterIds.NN1).toEqual(['butcher'])
      expect(result.monsterIds.NN2).toEqual(['hand'])
      expect(result.monsterIds.NN3).toEqual(['watcher'])
      expect(result.monsterIds.CO).toEqual(['lion-god'])
      expect(result.monsterIds.FI).toEqual(['gold-smoke-knight'])
    })

    it('accepts multiple monster IDs per node', () => {
      const result = NewSettlementInputSchema.parse({
        ...minimalValidInput,
        monsterIds: {
          NQ1: ['white-lion', 'screaming-antelope'],
          NQ2: [],
          NQ3: [],
          NQ4: [],
          NN1: [],
          NN2: [],
          NN3: [],
          CO: [],
          FI: []
        }
      })

      expect(result.monsterIds.NQ1).toEqual([
        'white-lion',
        'screaming-antelope'
      ])
    })
  })

  describe('wandererIds', () => {
    it('defaults to an empty array', () => {
      const result = NewSettlementInputSchema.parse(minimalValidInput)

      expect(result.wandererIds).toEqual([])
    })

    it('accepts an array of wanderer IDs', () => {
      const result = NewSettlementInputSchema.parse({
        ...minimalValidInput,
        wandererIds: ['aenas', 'luck']
      })

      expect(result.wandererIds).toEqual(['aenas', 'luck'])
    })
  })
})
