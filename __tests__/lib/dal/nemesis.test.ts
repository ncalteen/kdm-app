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
  getNemeses,
  getUserCustomNemeses,
  getNemesis,
  getNemesisIds,
  getNemesisNodesById,
  addNemesis,
  updateNemesis,
  removeNemesis
} = await import('@/lib/dal/nemesis')

beforeEach(() => {
  vi.clearAllMocks()
})

const makeNemesis = (overrides = {}) => ({
  id: 'n1',
  alternate_id: null,
  custom: false,
  monster_name: 'The Butcher',
  multi_monster: false,
  node: MonsterNode.NN1,
  vignette_id: null,
  ...overrides
})

describe('getNemeses', () => {
  const mockUser = { id: 'user-1' }
  const nonCustomNemesis = makeNemesis({ id: 'n1', custom: false })
  const userCustomNemesis = makeNemesis({
    id: 'n2',
    custom: true,
    monster_name: 'My Nemesis'
  })

  const mockSelectIn = (data: object[] | null, error: object | null = null) => {
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({ data, error })
      })
    })
  }

  it('returns every nemesis surfaced by RLS', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
    mockSelectIn([nonCustomNemesis, userCustomNemesis])

    const result = await getNemeses()

    expect(result).toEqual({
      n1: nonCustomNemesis,
      n2: userCustomNemesis
    })
    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis')
  })

  it('excludes alternates when includeAlternates is false', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const nemesisA = makeNemesis({ id: 'n1', alternate_id: 'n2' })
    const nemesisB = makeNemesis({ id: 'n2', alternate_id: null })

    mockSelectIn([nemesisA, nemesisB])

    const result = await getNemeses(
      [
        MonsterNode.NN1,
        MonsterNode.NN2,
        MonsterNode.NN3,
        MonsterNode.CO,
        MonsterNode.FI
      ],
      false,
      true
    )

    expect(result['n2']).toBeUndefined()
    expect(result['n1']).toBeDefined()
  })

  it('excludes vignettes when includeVignettes is false', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const nemesisA = makeNemesis({ id: 'n1', vignette_id: 'n2' })
    const nemesisB = makeNemesis({ id: 'n2', vignette_id: null })

    mockSelectIn([nemesisA, nemesisB])

    const result = await getNemeses(
      [
        MonsterNode.NN1,
        MonsterNode.NN2,
        MonsterNode.NN3,
        MonsterNode.CO,
        MonsterNode.FI
      ],
      true,
      false
    )

    expect(result['n2']).toBeUndefined()
    expect(result['n1']).toBeDefined()
  })

  it('includes all nemeses when both flags are true', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const nemesisA = makeNemesis({
      id: 'n1',
      alternate_id: 'n2',
      vignette_id: 'n3'
    })
    const nemesisB = makeNemesis({ id: 'n2' })
    const nemesisC = makeNemesis({ id: 'n3' })

    mockSelectIn([nemesisA, nemesisB, nemesisC])

    const result = await getNemeses()

    expect(Object.keys(result)).toHaveLength(3)
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getNemeses()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth returns an error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getNemeses()).rejects.toThrow(
      'Error Fetching User: Auth error'
    )
  })

  it('throws when the query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSelectIn(null, { message: 'DB error' })

    await expect(getNemeses()).rejects.toThrow(
      'Error Fetching Nemeses: DB error'
    )
  })

  it('returns empty map when the query returns no rows', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
    mockSelectIn([])

    const result = await getNemeses()
    expect(result).toEqual({})
  })
})

describe('getUserCustomNemeses', () => {
  const mockUser = { id: 'user-1' }
  const customNemesis = makeNemesis({
    id: 'n2',
    custom: true,
    monster_name: 'My Nemesis'
  })

  it('returns only custom nemeses for the user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockEq2 = vi
      .fn()
      .mockResolvedValue({ data: [customNemesis], error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getUserCustomNemeses()

    expect(result).toEqual({ n2: customNemesis })
    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis')
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getUserCustomNemeses()).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth returns an error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getUserCustomNemeses()).rejects.toThrow(
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

    await expect(getUserCustomNemeses()).rejects.toThrow(
      'Error Fetching Custom Nemeses: DB error'
    )
  })
})

describe('getNemesis', () => {
  it('returns null for null nemesisId without calling DB', async () => {
    const result = await getNemesis(null)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null for undefined nemesisId without calling DB', async () => {
    const result = await getNemesis(undefined)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns nemesis data for valid id', async () => {
    const nemesis = makeNemesis()
    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: nemesis, error: null })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getNemesis('n1')

    expect(result).toEqual(nemesis)
    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis')
  })

  it('returns null when nemesis is not found', async () => {
    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: null })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getNemesis('unknown-id')

    expect(result).toBeNull()
  })

  it('throws when query fails', async () => {
    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getNemesis('n1')).rejects.toThrow(
      'Error Fetching Nemesis: DB error'
    )
  })
})

describe('getNemesisIds', () => {
  it('fetches nemesis IDs without userId', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'n1' }, { id: 'n2' }], error: null })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getNemesisIds(['The Butcher', 'The King'], false)

    expect(result).toEqual(['n1', 'n2'])
  })

  it('fetches nemesis IDs with userId', async () => {
    const mockEq2 = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'n3' }], error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq1 })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getNemesisIds(['My Nemesis'], true, 'user-1')

    expect(result).toEqual(['n3'])
  })

  it('throws when query fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getNemesisIds(['The Butcher'], false)).rejects.toThrow(
      'Error Fetching Nemesis ID(s): DB error'
    )
  })

  it('throws when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getNemesisIds(['The Butcher'], false)).rejects.toThrow(
      'Nemesis(es) Not Found'
    )
  })
})

describe('getNemesisNodesById', () => {
  it('returns empty array for empty ids without calling DB', async () => {
    const result = await getNemesisNodesById([])

    expect(result).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns id/node pairs for given ids', async () => {
    const mockIn = vi.fn().mockResolvedValue({
      data: [
        { id: 'n1', node: MonsterNode.NN1 },
        { id: 'n2', node: MonsterNode.NN2 }
      ],
      error: null
    })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getNemesisNodesById(['n1', 'n2'])

    expect(result).toEqual([
      { id: 'n1', node: MonsterNode.NN1 },
      { id: 'n2', node: MonsterNode.NN2 }
    ])
  })

  it('throws when query fails', async () => {
    const mockIn = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getNemesisNodesById(['n1'])).rejects.toThrow(
      'Error Fetching Nemesis Nodes: DB error'
    )
  })
})

describe('addNemesis', () => {
  const mockUser = { id: 'user-1' }

  it('inserts a non-custom nemesis without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const nemesis = makeNemesis()
    const mockSingle = vi.fn().mockResolvedValue({ data: nemesis, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addNemesis({
      monster_name: 'The Butcher',
      custom: false,
      node: MonsterNode.NN1
    })

    expect(result).toEqual(nemesis)
    expect(mockInsert).toHaveBeenCalledWith({
      monster_name: 'The Butcher',
      custom: false,
      node: MonsterNode.NN1
    })
  })

  it('inserts a custom nemesis with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const customNemesis = makeNemesis({
      id: 'n2',
      custom: true,
      monster_name: 'My Nemesis'
    })
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: customNemesis, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addNemesis({
      monster_name: 'My Nemesis',
      custom: true,
      node: MonsterNode.NN1
    })

    expect(result).toEqual(customNemesis)
    expect(mockInsert).toHaveBeenCalledWith({
      monster_name: 'My Nemesis',
      custom: true,
      node: MonsterNode.NN1,
      user_id: mockUser.id
    })
  })

  it('throws when custom nemesis requires auth but user is null', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(
      addNemesis({
        monster_name: 'My Nemesis',
        custom: true,
        node: MonsterNode.NN1
      })
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth returns an error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(
      addNemesis({
        monster_name: 'The Butcher',
        custom: false,
        node: MonsterNode.NN1
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
      addNemesis({
        monster_name: 'The Butcher',
        custom: false,
        node: MonsterNode.NN1
      })
    ).rejects.toThrow('Error Adding Nemesis: Insert failed')
  })
})

describe('updateNemesis', () => {
  it('updates a nemesis successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateNemesis('n1', { monster_name: 'The Watcher' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis')
    expect(mockEq).toHaveBeenCalledWith('id', 'n1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateNemesis('n1', { monster_name: 'The Watcher' })
    ).rejects.toThrow('Error Updating Nemesis: Update failed')
  })
})

describe('removeNemesis', () => {
  it('removes a nemesis successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeNemesis('n1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis')
    expect(mockEq).toHaveBeenCalledWith('id', 'n1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeNemesis('n1')).rejects.toThrow(
      'Error Removing Nemesis: Delete failed'
    )
  })
})
