import { MonsterNode } from '@/lib/enums'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getQuarries,
  getUserCustomQuarries,
  getQuarry,
  getQuarryIds,
  getQuarryNodesById,
  addQuarry,
  updateQuarry,
  removeQuarry
} = await import('@/lib/dal/quarry')

beforeEach(() => {
  vi.clearAllMocks()
})

const makeQuarry = (overrides = {}) => ({
  id: 'q1',
  alternate_id: null,
  custom: false,
  monster_name: 'White Lion',
  multi_monster: false,
  node: MonsterNode.NQ1,
  prologue: false,
  vignette_id: null,
  ...overrides
})

describe('getQuarries', () => {
  const mockUser = { id: 'user-1' }
  const nonCustomQuarry = makeQuarry({ id: 'q1', custom: false })
  const userCustomQuarry = makeQuarry({
    id: 'q2',
    custom: true,
    monster_name: 'My Quarry'
  })

  const mockSelectIn = (data: object[] | null, error: object | null = null) => {
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({ data, error })
      })
    })
  }

  it('returns every quarry surfaced by RLS', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
    mockSelectIn([nonCustomQuarry, userCustomQuarry])

    const result = await getQuarries()

    expect(result).toEqual({
      q1: nonCustomQuarry,
      q2: userCustomQuarry
    })
    expect(mockSupabase.from).toHaveBeenCalledWith('quarry')
  })

  it('excludes alternates when includeAlternates is false', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const quarryA = makeQuarry({ id: 'q1', alternate_id: 'q2' })
    const quarryB = makeQuarry({ id: 'q2', alternate_id: null })

    mockSelectIn([quarryA, quarryB])

    const result = await getQuarries([MonsterNode.NQ1], false, true)

    expect(result['q2']).toBeUndefined()
    expect(result['q1']).toBeDefined()
  })

  it('excludes vignettes when includeVignettes is false', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const quarryA = makeQuarry({ id: 'q1', vignette_id: 'q2' })
    const quarryB = makeQuarry({ id: 'q2', vignette_id: null })

    mockSelectIn([quarryA, quarryB])

    const result = await getQuarries([MonsterNode.NQ1], true, false)

    expect(result['q2']).toBeUndefined()
    expect(result['q1']).toBeDefined()
  })

  it('includes all quarries when both flags are true', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const quarryA = makeQuarry({
      id: 'q1',
      alternate_id: 'q2',
      vignette_id: 'q3'
    })
    const quarryB = makeQuarry({ id: 'q2' })
    const quarryC = makeQuarry({ id: 'q3' })

    mockSelectIn([quarryA, quarryB, quarryC])

    const result = await getQuarries()

    expect(Object.keys(result)).toHaveLength(3)
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getQuarries()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth returns an error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getQuarries()).rejects.toThrow(
      'Error Fetching User: Auth error'
    )
  })

  it('throws when the query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSelectIn(null, { message: 'DB error' })

    await expect(getQuarries()).rejects.toThrow(
      'Error Fetching Quarries: DB error'
    )
  })

  it('returns empty map when the query returns no rows', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
    mockSelectIn([])

    const result = await getQuarries()
    expect(result).toEqual({})
  })
})

describe('getUserCustomQuarries', () => {
  const mockUser = { id: 'user-1' }
  const customQuarry = makeQuarry({
    id: 'q2',
    custom: true,
    monster_name: 'My Quarry'
  })

  it('returns only custom quarries for the user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockEq2 = vi
      .fn()
      .mockResolvedValue({ data: [customQuarry], error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getUserCustomQuarries()

    expect(result).toEqual({ q2: customQuarry })
    expect(mockSupabase.from).toHaveBeenCalledWith('quarry')
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getUserCustomQuarries()).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth returns an error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getUserCustomQuarries()).rejects.toThrow(
      'Error Fetching User: Auth error'
    )
  })

  it('throws when query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockEq2 = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getUserCustomQuarries()).rejects.toThrow(
      'Error Fetching Custom Quarries: DB error'
    )
  })
})

describe('getQuarry', () => {
  it('returns null for null quarryId without calling DB', async () => {
    const result = await getQuarry(null)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null for undefined quarryId without calling DB', async () => {
    const result = await getQuarry(undefined)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns quarry data for valid id', async () => {
    const quarry = makeQuarry()
    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: quarry, error: null })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getQuarry('q1')

    expect(result).toEqual(quarry)
    expect(mockSupabase.from).toHaveBeenCalledWith('quarry')
  })

  it('returns null when quarry is not found', async () => {
    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: null })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getQuarry('unknown-id')

    expect(result).toBeNull()
  })

  it('throws when query fails', async () => {
    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getQuarry('q1')).rejects.toThrow(
      'Error Fetching Quarry: DB error'
    )
  })
})

describe('getQuarryIds', () => {
  it('fetches quarry IDs without userId', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'q1' }, { id: 'q2' }], error: null })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getQuarryIds(
      ['White Lion', 'Screaming Antelope'],
      false
    )

    expect(result).toEqual(['q1', 'q2'])
  })

  it('fetches quarry IDs with userId', async () => {
    const mockEq2 = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'q3' }], error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq1 })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getQuarryIds(['My Quarry'], true, 'user-1')

    expect(result).toEqual(['q3'])
  })

  it('throws when query fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getQuarryIds(['White Lion'], false)).rejects.toThrow(
      'Error Fetching Quarry ID(s): DB error'
    )
  })

  it('throws when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getQuarryIds(['White Lion'], false)).rejects.toThrow(
      'Quarry(ies) Not Found'
    )
  })
})

describe('getQuarryNodesById', () => {
  it('returns empty array for empty ids without calling DB', async () => {
    const result = await getQuarryNodesById([])

    expect(result).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns id/node pairs for given ids', async () => {
    const mockIn = vi.fn().mockResolvedValue({
      data: [
        { id: 'q1', node: MonsterNode.NQ1 },
        { id: 'q2', node: MonsterNode.NQ2 }
      ],
      error: null
    })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getQuarryNodesById(['q1', 'q2'])

    expect(result).toEqual([
      { id: 'q1', node: MonsterNode.NQ1 },
      { id: 'q2', node: MonsterNode.NQ2 }
    ])
  })

  it('throws when query fails', async () => {
    const mockIn = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getQuarryNodesById(['q1'])).rejects.toThrow(
      'Error Fetching Quarry Nodes: DB error'
    )
  })
})

describe('addQuarry', () => {
  const mockUser = { id: 'user-1' }

  it('inserts a non-custom quarry without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const quarry = makeQuarry()
    const mockSingle = vi.fn().mockResolvedValue({ data: quarry, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addQuarry({
      monster_name: 'White Lion',
      custom: false,
      node: MonsterNode.NQ1
    })

    expect(result).toEqual(quarry)
    expect(mockInsert).toHaveBeenCalledWith({
      monster_name: 'White Lion',
      custom: false,
      node: MonsterNode.NQ1
    })
  })

  it('inserts a custom quarry with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const customQuarry = makeQuarry({
      id: 'q2',
      custom: true,
      monster_name: 'My Quarry'
    })
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: customQuarry, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addQuarry({
      monster_name: 'My Quarry',
      custom: true,
      node: MonsterNode.NQ1
    })

    expect(result).toEqual(customQuarry)
    expect(mockInsert).toHaveBeenCalledWith({
      monster_name: 'My Quarry',
      custom: true,
      node: MonsterNode.NQ1,
      user_id: mockUser.id
    })
  })

  it('throws when custom quarry requires auth but user is null', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(
      addQuarry({
        monster_name: 'My Quarry',
        custom: true,
        node: MonsterNode.NQ1
      })
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws Auth Error when auth returns an error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(
      addQuarry({
        monster_name: 'White Lion',
        custom: false,
        node: MonsterNode.NQ1
      })
    ).rejects.toThrow('Error Fetching User: Auth error')
  })

  it('throws when DB insert fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addQuarry({
        monster_name: 'White Lion',
        custom: false,
        node: MonsterNode.NQ1
      })
    ).rejects.toThrow('Error Adding Quarry: Insert failed')
  })
})

describe('updateQuarry', () => {
  it('updates a quarry successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateQuarry('q1', { monster_name: 'Phoenix' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('quarry')
    expect(mockEq).toHaveBeenCalledWith('id', 'q1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateQuarry('q1', { monster_name: 'Phoenix' })
    ).rejects.toThrow('Error Updating Quarry: Update failed')
  })
})

describe('removeQuarry', () => {
  it('removes a quarry successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeQuarry('q1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('quarry')
    expect(mockEq).toHaveBeenCalledWith('id', 'q1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeQuarry('q1')).rejects.toThrow(
      'Error Removing Quarry: Delete failed'
    )
  })
})
