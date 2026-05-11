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

const { getTraits, addTrait, updateTrait, removeTrait, resolveTraitNames } =
  await import('@/lib/dal/trait')
const { getUserId, getUserIdOrNull } = await import('@/lib/dal/user')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getTraits', () => {
  const userId = 'user-1'
  const row1 = { id: 't1', custom: false, trait_name: 'Trait', rules: null }
  const row2 = { id: 't2', custom: true, trait_name: 'Custom', rules: null }

  it('returns every row surfaced by RLS', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({
        data: [row1, row2],
        error: null
      })
    })

    const result = await getTraits()

    expect(result).toEqual({ [row1.id]: row1, [row2.id]: row2 })
    expect(mockSupabase.from).toHaveBeenCalledWith('trait')
  })

  it('throws when user is not authenticated', async () => {
    vi.mocked(getUserId).mockRejectedValue(new Error('Not Authenticated'))

    await expect(getTraits()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    vi.mocked(getUserId).mockRejectedValue(new Error('Error Fetching User: Auth error'))

    await expect(getTraits()).rejects.toThrow(
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

    await expect(getTraits()).rejects.toThrow(
      'Error Fetching Traits: DB error'
    )
  })

  it('returns an empty map when the query returns no rows', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: [], error: null })
    })

    const result = await getTraits()
    expect(result).toEqual({})
  })
})

describe('addTrait', () => {
  const userId = 'user-1'

  it('inserts a non-custom trait without user_id', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(userId)
    const single = vi
      .fn()
      .mockResolvedValue({ data: { id: 't1' }, error: null })
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({ single })
      })
    })

    const result = await addTrait({ custom: false, trait_name: 'A' })
    expect(result).toEqual({ id: 't1' })
  })

  it('inserts a custom trait with user_id', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(userId)
    const insert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 't2' }, error: null })
      })
    })
    mockSupabase.from.mockReturnValue({ insert })

    await addTrait({ custom: true, trait_name: 'B' })
    expect(insert).toHaveBeenCalledWith({
      custom: true,
      trait_name: 'B',
      user_id: userId
    })
  })

  it('throws when custom trait requires auth but user is null', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(null)
    await expect(addTrait({ custom: true, trait_name: 'X' })).rejects.toThrow(
      'Not Authenticated'
    )
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

    await expect(addTrait({ custom: false, trait_name: 'A' })).rejects.toThrow(
      'Error Adding Trait: fail'
    )
  })
})

describe('updateTrait', () => {
  it('updates a trait', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({ eq })
    })

    await updateTrait('t1', { trait_name: 'X' })
    expect(eq).toHaveBeenCalledWith('id', 't1')
  })

  it('throws on update error', async () => {
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'fail' } })
      })
    })

    await expect(updateTrait('t1', { trait_name: 'X' })).rejects.toThrow(
      'Error Updating Trait: fail'
    )
  })
})

describe('removeTrait', () => {
  it('removes a trait', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq })
    })

    await removeTrait('t1')
    expect(eq).toHaveBeenCalledWith('id', 't1')
  })

  it('throws on delete error', async () => {
    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'fail' } })
      })
    })

    await expect(removeTrait('t1')).rejects.toThrow(
      'Error Removing Trait: fail'
    )
  })
})

describe('resolveTraitNames', () => {
  const userId = 'user-1'

  it('returns empty array for empty input', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    const result = await resolveTraitNames(['', '   '])
    expect(result).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('reuses existing rows and inserts missing ones', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        or: vi.fn().mockResolvedValue({
          data: [
            { id: 'e1', trait_name: 'Tough', custom: false, user_id: null }
          ],
          error: null
        })
      })
    })
    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi
            .fn()
            .mockResolvedValue({ data: { id: 'new1' }, error: null })
        })
      })
    })

    const result = await resolveTraitNames(['Tough', 'tough', '  Fast '])
    expect(result).toEqual(['e1', 'new1'])
  })

  it('throws when lookup fails', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        or: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB' } })
      })
    })

    await expect(resolveTraitNames(['x'])).rejects.toThrow(
      'Error Resolving Traits: DB'
    )
  })

  it('throws when insert fails', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        or: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })
    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'fail' } })
        })
      })
    })

    await expect(resolveTraitNames(['x'])).rejects.toThrow(
      'Error Adding Trait: fail'
    )
  })
})
