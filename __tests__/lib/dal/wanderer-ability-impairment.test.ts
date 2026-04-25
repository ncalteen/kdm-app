import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const { setWandererAbilityImpairments } =
  await import('@/lib/dal/wanderer-ability-impairment')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('setWandererAbilityImpairments', () => {
  it('clears junction when no IDs are provided', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({ eq })
    })

    await setWandererAbilityImpairments('w1', [])

    expect(mockSupabase.from).toHaveBeenCalledTimes(1)
    expect(mockSupabase.from).toHaveBeenCalledWith(
      'wanderer_ability_impairment'
    )
    expect(eq).toHaveBeenCalledWith('wanderer_id', 'w1')
  })

  it('clears and inserts when IDs are provided', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({ eq })
    })
    const insert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValueOnce({ insert })

    await setWandererAbilityImpairments('w1', ['a1', 'a2'])

    expect(insert).toHaveBeenCalledWith([
      { wanderer_id: 'w1', ability_impairment_id: 'a1' },
      { wanderer_id: 'w1', ability_impairment_id: 'a2' }
    ])
  })

  it('throws when delete fails', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'del' } })
      })
    })

    await expect(setWandererAbilityImpairments('w1', [])).rejects.toThrow(
      'Error Clearing Wanderer Abilities/Impairments: del'
    )
  })

  it('throws when insert fails', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ error: { message: 'ins' } })
    })

    await expect(setWandererAbilityImpairments('w1', ['a1'])).rejects.toThrow(
      'Error Setting Wanderer Abilities/Impairments: ins'
    )
  })
})
