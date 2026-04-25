import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

vi.mock('@/lib/dal/user', () => ({
  getUserId: vi.fn(),
  getUserIdOrNull: vi.fn()
}))

const {
  getAbilityImpairments,
  addAbilityImpairment,
  updateAbilityImpairment,
  removeAbilityImpairment
} = await import('@/lib/dal/ability-impairment')
const { getUserId, getUserIdOrNull } = await import('@/lib/dal/user')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getAbilityImpairments', () => {
  const userId = 'user-1'
  const nonCustom = {
    id: 'a1',
    custom: false,
    ability_impairment_name: 'Ability',
    rules: null
  }
  const userCustom = {
    id: 'a2',
    custom: true,
    ability_impairment_name: 'Mine',
    rules: null
  }
  const shared = {
    id: 'a3',
    custom: true,
    ability_impairment_name: 'Shared',
    rules: null
  }

  it('returns rows from all three sources', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [nonCustom], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [userCustom], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ ability_impairment: [shared] }],
            error: null
          })
        })
      })

    const result = await getAbilityImpairments()
    expect(result).toEqual({ a1: nonCustom, a2: userCustom, a3: shared })
  })

  it('handles shared row as single object', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ ability_impairment: shared }],
            error: null
          })
        })
      })

    const result = await getAbilityImpairments()
    expect(result).toEqual({ a3: shared })
  })

  it('skips shared rows with null payload', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ ability_impairment: null }],
            error: null
          })
        })
      })

    const result = await getAbilityImpairments()
    expect(result).toEqual({})
  })

  it('throws on query error', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'DB' } })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })

    await expect(getAbilityImpairments()).rejects.toThrow(
      'Error Fetching Ability/Impairments: DB'
    )
  })
})

describe('addAbilityImpairment', () => {
  const userId = 'user-1'

  it('inserts a non-custom row without user_id', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(userId)
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'a1' }, error: null })
        })
      })
    })

    const result = await addAbilityImpairment({
      custom: false,
      ability_impairment_name: 'A'
    })
    expect(result).toEqual({ id: 'a1' })
  })

  it('inserts a custom row with user_id', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(userId)
    const insert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 'a2' }, error: null })
      })
    })
    mockSupabase.from.mockReturnValue({ insert })

    await addAbilityImpairment({
      custom: true,
      ability_impairment_name: 'B'
    })
    expect(insert).toHaveBeenCalledWith({
      custom: true,
      ability_impairment_name: 'B',
      user_id: userId
    })
  })

  it('throws when custom requires auth but user is null', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(null)
    await expect(
      addAbilityImpairment({ custom: true, ability_impairment_name: 'X' })
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws on insert error', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(userId)
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'fail' } })
        })
      })
    })

    await expect(
      addAbilityImpairment({ custom: false, ability_impairment_name: 'A' })
    ).rejects.toThrow('Error Adding Ability/Impairment: fail')
  })
})

describe('updateAbilityImpairment', () => {
  it('updates a row', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({ eq })
    })

    await updateAbilityImpairment('a1', { ability_impairment_name: 'X' })
    expect(eq).toHaveBeenCalledWith('id', 'a1')
  })

  it('throws on update error', async () => {
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'fail' } })
      })
    })

    await expect(
      updateAbilityImpairment('a1', { ability_impairment_name: 'X' })
    ).rejects.toThrow('Error Updating Ability/Impairment: fail')
  })
})

describe('removeAbilityImpairment', () => {
  it('removes a row', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq })
    })

    await removeAbilityImpairment('a1')
    expect(eq).toHaveBeenCalledWith('id', 'a1')
  })

  it('throws on delete error', async () => {
    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'fail' } })
      })
    })

    await expect(removeAbilityImpairment('a1')).rejects.toThrow(
      'Error Removing Ability/Impairment: fail'
    )
  })
})
