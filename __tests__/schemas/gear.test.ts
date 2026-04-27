import { GearInputSchema } from '@/schemas/gear'
import { describe, expect, it } from 'vitest'

const baseValid = {
  category: 'OTHER' as const,
  gear_name: 'Item'
}

describe('GearInputSchema (defaults & basic validation)', () => {
  it('accepts a valid OTHER payload and applies defaults', () => {
    const result = GearInputSchema.parse(baseValid)
    expect(result).toMatchObject({
      category: 'OTHER',
      gear_name: 'Item',
      location_id: null,
      accessory: null,
      accuracy: null,
      affinity_top: null,
      affinity_left: null,
      affinity_right: null,
      affinity_bottom: null,
      affinity_bonus: null,
      affinity_bonus_requirements: [],
      armor_points: null,
      armor_location: null,
      keywords: [],
      rules: null,
      speed: null,
      strength: null,
      weapon_type_id: null,
      gear_costs: [],
      resource_costs: [],
      resource_type_costs: []
    })
  })

  it('rejects empty gear name', () => {
    const result = GearInputSchema.safeParse({ ...baseValid, gear_name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/nameless/i)
    }
  })

  it('trims gear name whitespace', () => {
    const result = GearInputSchema.parse({
      ...baseValid,
      gear_name: '  Sword  '
    })
    expect(result.gear_name).toBe('Sword')
  })

  it('rejects non-integer accuracy', () => {
    const result = GearInputSchema.safeParse({
      ...baseValid,
      accuracy: 1.5
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative armor_points', () => {
    const result = GearInputSchema.safeParse({
      ...baseValid,
      armor_points: -1
    })
    expect(result.success).toBe(false)
  })
})

describe('GearInputSchema (WEAPON category)', () => {
  it('rejects WEAPON missing speed/accuracy/strength/weapon_type_id', () => {
    const result = GearInputSchema.safeParse({
      ...baseValid,
      category: 'WEAPON'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0])
      expect(paths).toContain('speed')
      expect(paths).toContain('accuracy')
      expect(paths).toContain('strength')
      expect(paths).toContain('weapon_type_id')
    }
  })

  it('accepts a valid WEAPON', () => {
    const result = GearInputSchema.safeParse({
      ...baseValid,
      category: 'WEAPON',
      speed: 1,
      accuracy: 5,
      strength: 3,
      weapon_type_id: '12345678-1234-4234-8234-123456789abc'
    })
    expect(result.success).toBe(true)
  })
})

describe('GearInputSchema (ARMOR category)', () => {
  it('rejects ARMOR missing armor_points/armor_location', () => {
    const result = GearInputSchema.safeParse({
      ...baseValid,
      category: 'ARMOR'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0])
      expect(paths).toContain('armor_points')
      expect(paths).toContain('armor_location')
    }
  })

  it('accepts a valid ARMOR', () => {
    const result = GearInputSchema.safeParse({
      ...baseValid,
      category: 'ARMOR',
      armor_points: 2,
      armor_location: 'CHEST'
    })
    expect(result.success).toBe(true)
  })
})

describe('GearInputSchema (cost sub-schemas)', () => {
  it('rejects gear_costs with quantity < 1', () => {
    const result = GearInputSchema.safeParse({
      ...baseValid,
      gear_costs: [
        {
          cost_gear_id: '12345678-1234-4234-8234-123456789abc',
          quantity: 0
        }
      ]
    })
    expect(result.success).toBe(false)
  })

  it('rejects gear_costs with non-uuid id', () => {
    const result = GearInputSchema.safeParse({
      ...baseValid,
      gear_costs: [{ cost_gear_id: 'not-a-uuid', quantity: 1 }]
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid resource_costs', () => {
    const result = GearInputSchema.safeParse({
      ...baseValid,
      resource_costs: [
        {
          resource_id: '12345678-1234-4234-8234-123456789abc',
          quantity: 2
        }
      ]
    })
    expect(result.success).toBe(true)
  })

  it('rejects resource_type_costs with non-integer quantity', () => {
    const result = GearInputSchema.safeParse({
      ...baseValid,
      resource_type_costs: [{ resource_type: 'BONE', quantity: 1.2 }]
    })
    expect(result.success).toBe(false)
  })
})
