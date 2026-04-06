import { describe, expect, it } from 'vitest'

import { AenasState, Gender } from '@/lib/enums'
import { NewSurvivorInputSchema } from '@/schemas/new-survivor-input'

describe('NewSurvivorInputSchema', () => {
  const minimalValidInput = { settlementId: 'settlement-123' }

  describe('defaults', () => {
    it('applies all default values when only settlementId is provided', () => {
      const result = NewSurvivorInputSchema.parse(minimalValidInput)

      expect(result.abilitiesAndImpairments).toEqual([])
      expect(result.accuracy).toBe(0)
      expect(result.aenasState).toBeUndefined()
      expect(result.canDash).toBe(false)
      expect(result.canDodge).toBe(true)
      expect(result.canFistPump).toBe(false)
      expect(result.canEncourage).toBe(false)
      expect(result.canSurge).toBe(false)
      expect(result.courage).toBe(0)
      expect(result.disposition).toBeUndefined()
      expect(result.evasion).toBe(0)
      expect(result.fightingArtIds).toEqual([])
      expect(result.gender).toBe(Gender.FEMALE)
      expect(result.huntXP).toBe(0)
      expect(result.huntXPRankUp).toEqual([])
      expect(result.insanity).toBe(0)
      expect(result.luck).toBe(0)
      expect(result.movement).toBe(5)
      expect(result.settlementId).toBe('settlement-123')
      expect(result.speed).toBe(0)
      expect(result.strength).toBe(0)
      expect(result.survival).toBe(1)
      expect(result.survivorName).toBeUndefined()
      expect(result.understanding).toBe(0)
      expect(result.wanderer).toBe(false)
      expect(result.armBroken).toBe(0)
      expect(result.armContracture).toBe(0)
      expect(result.armDismembered).toBe(0)
      expect(result.armRupturedMuscle).toBe(false)
      expect(result.bodyBrokenRib).toBe(0)
      expect(result.bodyDestroyedBack).toBe(false)
      expect(result.bodyGapingChestWound).toBe(0)
      expect(result.headBlind).toBe(0)
      expect(result.headDeaf).toBe(false)
      expect(result.headIntracranialHemorrhage).toBe(false)
      expect(result.headShatteredJaw).toBe(false)
      expect(result.legBroken).toBe(0)
      expect(result.legDismembered).toBe(0)
      expect(result.legHamstrung).toBe(false)
      expect(result.waistBrokenHip).toBe(false)
      expect(result.waistDestroyedGenitals).toBe(false)
      expect(result.waistIntestinalProlapse).toBe(false)
      expect(result.waistWarpedPelvis).toBe(0)
      expect(result.canEndure).toBe(false)
      expect(result.lumi).toBe(0)
      expect(result.systemicPressure).toBe(0)
      expect(result.torment).toBe(0)
    })
  })

  describe('settlementId', () => {
    it('is required', () => {
      expect(() => NewSurvivorInputSchema.parse({})).toThrow()
    })

    it('accepts a valid string', () => {
      const result = NewSurvivorInputSchema.parse(minimalValidInput)

      expect(result.settlementId).toBe('settlement-123')
    })
  })

  describe('abilitiesAndImpairments', () => {
    it('accepts an array of non-empty strings', () => {
      const result = NewSurvivorInputSchema.parse({
        ...minimalValidInput,
        abilitiesAndImpairments: ['Mighty Strike', 'Club Foot']
      })

      expect(result.abilitiesAndImpairments).toEqual([
        'Mighty Strike',
        'Club Foot'
      ])
    })

    it('rejects an array containing empty strings', () => {
      expect(() =>
        NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          abilitiesAndImpairments: ['']
        })
      ).toThrow('A nameless ability/impairment cannot be recorded.')
    })
  })

  describe('aenasState', () => {
    it('accepts Content', () => {
      const result = NewSurvivorInputSchema.parse({
        ...minimalValidInput,
        aenasState: AenasState.CONTENT
      })

      expect(result.aenasState).toBe(AenasState.CONTENT)
    })

    it('accepts Hungry', () => {
      const result = NewSurvivorInputSchema.parse({
        ...minimalValidInput,
        aenasState: AenasState.HUNGRY
      })

      expect(result.aenasState).toBe(AenasState.HUNGRY)
    })

    it('is optional', () => {
      const result = NewSurvivorInputSchema.parse(minimalValidInput)

      expect(result.aenasState).toBeUndefined()
    })

    it('rejects an invalid value', () => {
      expect(() =>
        NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          aenasState: 'Starving'
        })
      ).toThrow()
    })
  })

  describe('courage', () => {
    it('accepts the minimum value of 0', () => {
      const result = NewSurvivorInputSchema.parse({
        ...minimalValidInput,
        courage: 0
      })

      expect(result.courage).toBe(0)
    })

    it('accepts the maximum value of 9', () => {
      const result = NewSurvivorInputSchema.parse({
        ...minimalValidInput,
        courage: 9
      })

      expect(result.courage).toBe(9)
    })

    it('rejects negative values', () => {
      expect(() =>
        NewSurvivorInputSchema.parse({ ...minimalValidInput, courage: -1 })
      ).toThrow('Courage cannot be negative.')
    })

    it('rejects values exceeding 9', () => {
      expect(() =>
        NewSurvivorInputSchema.parse({ ...minimalValidInput, courage: 10 })
      ).toThrow('Courage may not exceed 9.')
    })
  })

  describe('disposition', () => {
    it('is optional', () => {
      const result = NewSurvivorInputSchema.parse(minimalValidInput)

      expect(result.disposition).toBeUndefined()
    })

    it('accepts a numeric value', () => {
      const result = NewSurvivorInputSchema.parse({
        ...minimalValidInput,
        disposition: 3
      })

      expect(result.disposition).toBe(3)
    })
  })

  describe('fightingArtIds', () => {
    it('accepts an array of non-empty strings', () => {
      const result = NewSurvivorInputSchema.parse({
        ...minimalValidInput,
        fightingArtIds: ['art-1', 'art-2']
      })

      expect(result.fightingArtIds).toEqual(['art-1', 'art-2'])
    })

    it('rejects an array containing empty strings', () => {
      expect(() =>
        NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          fightingArtIds: ['']
        })
      ).toThrow('A nameless fighting art cannot be recorded.')
    })
  })

  describe('gender', () => {
    it('defaults to Female', () => {
      const result = NewSurvivorInputSchema.parse(minimalValidInput)

      expect(result.gender).toBe(Gender.FEMALE)
    })

    it('accepts Female', () => {
      const result = NewSurvivorInputSchema.parse({
        ...minimalValidInput,
        gender: Gender.FEMALE
      })

      expect(result.gender).toBe(Gender.FEMALE)
    })

    it('accepts Male', () => {
      const result = NewSurvivorInputSchema.parse({
        ...minimalValidInput,
        gender: Gender.MALE
      })

      expect(result.gender).toBe(Gender.MALE)
    })

    it('rejects an invalid value', () => {
      expect(() =>
        NewSurvivorInputSchema.parse({ ...minimalValidInput, gender: 'X' })
      ).toThrow()
    })
  })

  describe('huntXP', () => {
    it('accepts the minimum value of 0', () => {
      const result = NewSurvivorInputSchema.parse({
        ...minimalValidInput,
        huntXP: 0
      })

      expect(result.huntXP).toBe(0)
    })

    it('accepts the maximum value of 16', () => {
      const result = NewSurvivorInputSchema.parse({
        ...minimalValidInput,
        huntXP: 16
      })

      expect(result.huntXP).toBe(16)
    })

    it('rejects negative values', () => {
      expect(() =>
        NewSurvivorInputSchema.parse({ ...minimalValidInput, huntXP: -1 })
      ).toThrow('Hunt XP cannot be negative.')
    })

    it('rejects values exceeding 16', () => {
      expect(() =>
        NewSurvivorInputSchema.parse({ ...minimalValidInput, huntXP: 17 })
      ).toThrow('Hunt XP cannot exceed 16.')
    })
  })

  describe('insanity', () => {
    it('accepts the minimum value of 0', () => {
      const result = NewSurvivorInputSchema.parse({
        ...minimalValidInput,
        insanity: 0
      })

      expect(result.insanity).toBe(0)
    })

    it('rejects negative values', () => {
      expect(() =>
        NewSurvivorInputSchema.parse({ ...minimalValidInput, insanity: -1 })
      ).toThrow('Insanity cannot be negative.')
    })
  })

  describe('movement', () => {
    it('accepts the minimum value of 1', () => {
      const result = NewSurvivorInputSchema.parse({
        ...minimalValidInput,
        movement: 1
      })

      expect(result.movement).toBe(1)
    })

    it('rejects values less than 1', () => {
      expect(() =>
        NewSurvivorInputSchema.parse({ ...minimalValidInput, movement: 0 })
      ).toThrow('Movement cannot be less than 1.')
    })
  })

  describe('survival', () => {
    it('defaults to 1', () => {
      const result = NewSurvivorInputSchema.parse(minimalValidInput)

      expect(result.survival).toBe(1)
    })

    it('accepts the minimum value of 0', () => {
      const result = NewSurvivorInputSchema.parse({
        ...minimalValidInput,
        survival: 0
      })

      expect(result.survival).toBe(0)
    })

    it('rejects negative values', () => {
      expect(() =>
        NewSurvivorInputSchema.parse({ ...minimalValidInput, survival: -1 })
      ).toThrow('Survival cannot be negative.')
    })
  })

  describe('survivorName', () => {
    it('is optional', () => {
      const result = NewSurvivorInputSchema.parse(minimalValidInput)

      expect(result.survivorName).toBeUndefined()
    })

    it('accepts a string value', () => {
      const result = NewSurvivorInputSchema.parse({
        ...minimalValidInput,
        survivorName: 'Aenas'
      })

      expect(result.survivorName).toBe('Aenas')
    })
  })

  describe('understanding', () => {
    it('accepts the minimum value of 0', () => {
      const result = NewSurvivorInputSchema.parse({
        ...minimalValidInput,
        understanding: 0
      })

      expect(result.understanding).toBe(0)
    })

    it('accepts the maximum value of 9', () => {
      const result = NewSurvivorInputSchema.parse({
        ...minimalValidInput,
        understanding: 9
      })

      expect(result.understanding).toBe(9)
    })

    it('rejects negative values', () => {
      expect(() =>
        NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          understanding: -1
        })
      ).toThrow('Understanding cannot be negative.')
    })

    it('rejects values exceeding 9', () => {
      expect(() =>
        NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          understanding: 10
        })
      ).toThrow('Understanding cannot exceed 9.')
    })
  })

  describe('severe injuries', () => {
    describe('armBroken', () => {
      it('accepts the minimum value of 0', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          armBroken: 0
        })

        expect(result.armBroken).toBe(0)
      })

      it('accepts the maximum value of 2', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          armBroken: 2
        })

        expect(result.armBroken).toBe(2)
      })

      it('rejects negative values', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({ ...minimalValidInput, armBroken: -1 })
        ).toThrow('Broken arm count cannot be negative.')
      })

      it('rejects values exceeding 2', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({ ...minimalValidInput, armBroken: 3 })
        ).toThrow('Broken arm count cannot exceed 2.')
      })
    })

    describe('armContracture', () => {
      it('accepts the minimum value of 0', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          armContracture: 0
        })

        expect(result.armContracture).toBe(0)
      })

      it('accepts the maximum value of 5', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          armContracture: 5
        })

        expect(result.armContracture).toBe(5)
      })

      it('rejects negative values', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({
            ...minimalValidInput,
            armContracture: -1
          })
        ).toThrow('Arm contracture count cannot be negative.')
      })

      it('rejects values exceeding 5', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({
            ...minimalValidInput,
            armContracture: 6
          })
        ).toThrow('Arm contracture count cannot exceed 5.')
      })
    })

    describe('armDismembered', () => {
      it('accepts the minimum value of 0', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          armDismembered: 0
        })

        expect(result.armDismembered).toBe(0)
      })

      it('accepts the maximum value of 2', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          armDismembered: 2
        })

        expect(result.armDismembered).toBe(2)
      })

      it('rejects negative values', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({
            ...minimalValidInput,
            armDismembered: -1
          })
        ).toThrow('Dismembered arm count cannot be negative.')
      })

      it('rejects values exceeding 2', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({
            ...minimalValidInput,
            armDismembered: 3
          })
        ).toThrow('Dismembered arm count cannot exceed 2.')
      })
    })

    describe('bodyBrokenRib', () => {
      it('accepts the minimum value of 0', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          bodyBrokenRib: 0
        })

        expect(result.bodyBrokenRib).toBe(0)
      })

      it('accepts the maximum value of 5', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          bodyBrokenRib: 5
        })

        expect(result.bodyBrokenRib).toBe(5)
      })

      it('rejects negative values', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({
            ...minimalValidInput,
            bodyBrokenRib: -1
          })
        ).toThrow('Broken rib count cannot be negative.')
      })

      it('rejects values exceeding 5', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({
            ...minimalValidInput,
            bodyBrokenRib: 6
          })
        ).toThrow('Broken rib count cannot exceed 5.')
      })
    })

    describe('bodyGapingChestWound', () => {
      it('accepts the minimum value of 0', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          bodyGapingChestWound: 0
        })

        expect(result.bodyGapingChestWound).toBe(0)
      })

      it('accepts the maximum value of 5', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          bodyGapingChestWound: 5
        })

        expect(result.bodyGapingChestWound).toBe(5)
      })

      it('rejects negative values', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({
            ...minimalValidInput,
            bodyGapingChestWound: -1
          })
        ).toThrow('Gaping chest wound count cannot be negative.')
      })

      it('rejects values exceeding 5', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({
            ...minimalValidInput,
            bodyGapingChestWound: 6
          })
        ).toThrow('Gaping chest wound count cannot exceed 5.')
      })
    })

    describe('headBlind', () => {
      it('accepts the minimum value of 0', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          headBlind: 0
        })

        expect(result.headBlind).toBe(0)
      })

      it('accepts the maximum value of 2', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          headBlind: 2
        })

        expect(result.headBlind).toBe(2)
      })

      it('rejects negative values', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({
            ...minimalValidInput,
            headBlind: -1
          })
        ).toThrow('Blind count cannot be negative.')
      })

      it('rejects values exceeding 2', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({
            ...minimalValidInput,
            headBlind: 3
          })
        ).toThrow('Blind count cannot exceed 2.')
      })
    })

    describe('legBroken', () => {
      it('accepts the minimum value of 0', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          legBroken: 0
        })

        expect(result.legBroken).toBe(0)
      })

      it('accepts the maximum value of 2', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          legBroken: 2
        })

        expect(result.legBroken).toBe(2)
      })

      it('rejects negative values', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({
            ...minimalValidInput,
            legBroken: -1
          })
        ).toThrow('Broken leg count cannot be negative.')
      })

      it('rejects values exceeding 2', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({
            ...minimalValidInput,
            legBroken: 3
          })
        ).toThrow('Broken leg count cannot exceed 2.')
      })
    })

    describe('legDismembered', () => {
      it('accepts the minimum value of 0', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          legDismembered: 0
        })

        expect(result.legDismembered).toBe(0)
      })

      it('accepts the maximum value of 2', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          legDismembered: 2
        })

        expect(result.legDismembered).toBe(2)
      })

      it('rejects negative values', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({
            ...minimalValidInput,
            legDismembered: -1
          })
        ).toThrow('Dismembered leg count cannot be negative.')
      })

      it('rejects values exceeding 2', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({
            ...minimalValidInput,
            legDismembered: 3
          })
        ).toThrow('Dismembered leg count cannot exceed 2.')
      })
    })

    describe('waistWarpedPelvis', () => {
      it('accepts the minimum value of 0', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          waistWarpedPelvis: 0
        })

        expect(result.waistWarpedPelvis).toBe(0)
      })

      it('accepts the maximum value of 5', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          waistWarpedPelvis: 5
        })

        expect(result.waistWarpedPelvis).toBe(5)
      })

      it('rejects negative values', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({
            ...minimalValidInput,
            waistWarpedPelvis: -1
          })
        ).toThrow('Warped pelvis count cannot be negative.')
      })

      it('rejects values exceeding 5', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({
            ...minimalValidInput,
            waistWarpedPelvis: 6
          })
        ).toThrow('Warped pelvis count cannot exceed 5.')
      })
    })
  })

  describe('arc survivors', () => {
    describe('lumi', () => {
      it('accepts the minimum value of 0', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          lumi: 0
        })

        expect(result.lumi).toBe(0)
      })

      it('rejects negative values', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({ ...minimalValidInput, lumi: -1 })
        ).toThrow('Lumi cannot be negative.')
      })
    })

    describe('systemicPressure', () => {
      it('accepts the minimum value of 0', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          systemicPressure: 0
        })

        expect(result.systemicPressure).toBe(0)
      })

      it('rejects negative values', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({
            ...minimalValidInput,
            systemicPressure: -1
          })
        ).toThrow('Systemic pressure cannot be negative.')
      })
    })

    describe('torment', () => {
      it('accepts the minimum value of 0', () => {
        const result = NewSurvivorInputSchema.parse({
          ...minimalValidInput,
          torment: 0
        })

        expect(result.torment).toBe(0)
      })

      it('rejects negative values', () => {
        expect(() =>
          NewSurvivorInputSchema.parse({ ...minimalValidInput, torment: -1 })
        ).toThrow('Torment cannot be negative.')
      })
    })
  })
})
