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
  const row1 = {
    id: 'a1',
    custom: false,
    ability_impairment_name: 'Ability',
    rules: null
  }
  const row2 = {
    id: 'a2',
    custom: true,
    ability_impairment_name: 'Mine',
    rules: null
  }

  it('returns every row surfaced by RLS', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({
        data: [row1, row2],
        error: null
      })
    })

    const result = await getAbilityImpairments()

    expect(result).toEqual({ [row1.id]: row1, [row2.id]: row2 })
    expect(mockSupabase.from).toHaveBeenCalledWith('ability_impairment')
  })

  it('throws when user is not authenticated', async () => {
    vi.mocked(getUserId).mockRejectedValue(new Error('Not Authenticated'))

    await expect(getAbilityImpairments()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    vi.mocked(getUserId).mockRejectedValue(
      new Error('Error Fetching User: Auth error')
    )

    await expect(getAbilityImpairments()).rejects.toThrow(
      'Error Fetching User: Auth error'
    )
  })

  it('throws when the query fails', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)

    mockSupabase.from.mockReturnValueOnce({
      select: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    })

    await expect(getAbilityImpairments()).rejects.toThrow(
      'Error Fetching Ability/Impairments: DB error'
    )
  })

  it('returns an empty map when the query returns no rows', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: [], error: null })
    })

    const result = await getAbilityImpairments()
    expect(result).toEqual({})
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
