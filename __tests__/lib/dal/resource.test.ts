import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  auth: {
    getUser: vi.fn()
  },
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const { getResources, addResource, updateResource, removeResource } =
  await import('@/lib/dal/resource')

beforeEach(() => {
  vi.clearAllMocks()
})

const makeResourceRow = (overrides = {}) => ({
  id: 'r1',
  custom: false,
  resource_name: 'Broken Lantern',
  category: 'basic',
  quarry_id: null,
  resource_types: ['organ'],
  quarry: null,
  ...overrides
})

describe('getResources', () => {
  const mockUser = { id: 'user-1' }
  const nonCustomResource = makeResourceRow()
  const userCustomResource = makeResourceRow({ id: 'r2', custom: true, resource_name: 'My Resource' })
  const sharedResource = makeResourceRow({ id: 'r3', custom: true, resource_name: 'Shared Resource' })

  it('returns resources from all three sources', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [nonCustomResource], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [userCustomResource], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ resource: [sharedResource] }],
            error: null
          })
        })
      })

    const result = await getResources()

    expect(result['r1']).toMatchObject({ id: 'r1', resource_name: 'Broken Lantern' })
    expect(result['r2']).toMatchObject({ id: 'r2', resource_name: 'My Resource' })
    expect(result['r3']).toMatchObject({ id: 'r3', resource_name: 'Shared Resource' })
  })

  it('correctly maps quarry object shape', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    const resourceWithQuarry = makeResourceRow({
      quarry_id: 'q1',
      quarry: { monster_name: 'White Lion', node: 'A' }
    })

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [resourceWithQuarry], error: null })
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

    const result = await getResources()

    expect(result['r1'].quarry_monster_name).toBe('White Lion')
    expect(result['r1'].quarry_node).toBe('A')
  })

  it('correctly maps quarry array shape', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    const resourceWithArrayQuarry = makeResourceRow({
      quarry_id: 'q1',
      quarry: [{ monster_name: 'Screaming Antelope', node: 'B' }]
    })

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [resourceWithArrayQuarry], error: null })
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

    const result = await getResources()

    expect(result['r1'].quarry_monster_name).toBe('Screaming Antelope')
    expect(result['r1'].quarry_node).toBe('B')
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

    await expect(getResources()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getResources()).rejects.toThrow('Error Fetching User: Auth error')
  })

  it('throws when non-custom query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
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

    await expect(getResources()).rejects.toThrow('Error Fetching Resources: DB error')
  })

  it('throws when user-custom query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })

    await expect(getResources()).rejects.toThrow('Error Fetching Resources: DB error')
  })

  it('throws when shared query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

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
          eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
        })
      })

    await expect(getResources()).rejects.toThrow('Error Fetching Resources: DB error')
  })

  it('returns empty map when all sources return empty arrays', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

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
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })

    const result = await getResources()
    expect(result).toEqual({})
  })
})

describe('addResource', () => {
  const mockUser = { id: 'user-1' }

  it('inserts a non-custom resource without quarry', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    const rawData = makeResourceRow()
    const mockSingle = vi.fn().mockResolvedValue({ data: rawData, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addResource({
      resource_name: 'Broken Lantern',
      custom: false,
      category: 'basic',
      resource_types: ['organ']
    })

    expect(result).toMatchObject({ id: 'r1', resource_name: 'Broken Lantern' })
    expect(result.quarry_monster_name).toBeNull()
    expect(result.quarry_node).toBeNull()
  })

  it('inserts a non-custom resource with quarry object', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    const rawData = makeResourceRow({
      quarry_id: 'q1',
      quarry: { monster_name: 'White Lion', node: 'A' }
    })
    const mockSingle = vi.fn().mockResolvedValue({ data: rawData, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addResource({
      resource_name: 'Broken Lantern',
      custom: false,
      category: 'basic',
      resource_types: ['organ'],
      quarry_id: 'q1'
    })

    expect(result.quarry_monster_name).toBe('White Lion')
    expect(result.quarry_node).toBe('A')
  })

  it('inserts a custom resource with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    const rawData = makeResourceRow({ id: 'r2', custom: true })
    const mockSingle = vi.fn().mockResolvedValue({ data: rawData, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await addResource({ resource_name: 'My Resource', custom: true, category: 'basic', resource_types: [] })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: mockUser.id })
    )
  })

  it('throws when custom and user is null', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

    await expect(
      addResource({ resource_name: 'My Resource', custom: true, category: 'basic', resource_types: [] })
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(
      addResource({ resource_name: 'Broken Lantern', custom: false, category: 'basic', resource_types: [] })
    ).rejects.toThrow('Error Fetching User: Auth error')
  })

  it('throws when DB insert fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addResource({ resource_name: 'Broken Lantern', custom: false, category: 'basic', resource_types: [] })
    ).rejects.toThrow('Error Adding Resource: Insert failed')
  })
})

describe('updateResource', () => {
  it('updates a resource successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateResource('r1', { resource_name: 'Updated Lantern' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('resource')
    expect(mockEq).toHaveBeenCalledWith('id', 'r1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateResource('r1', { resource_name: 'Lantern' })).rejects.toThrow(
      'Error Updating Resource: Update failed'
    )
  })
})

describe('removeResource', () => {
  it('removes a resource successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeResource('r1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('resource')
    expect(mockEq).toHaveBeenCalledWith('id', 'r1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeResource('r1')).rejects.toThrow('Error Removing Resource: Delete failed')
  })
})
