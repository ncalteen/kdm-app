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

const {
  getInnovations,
  getInnovationIds,
  addInnovation,
  updateInnovation,
  removeInnovation
} = await import('@/lib/dal/innovation')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getInnovations', () => {
  const mockUser = { id: 'user-1' }
  const row1 = {
    id: 'i1',
    custom: false,
    innovation_name: 'Innovation',
    tags: [],
    consequence_innovation_ids: [],
    requirement_innovation_ids: []
  }
  const row2 = {
    id: 'i2',
    custom: true,
    innovation_name: 'Custom',
    tags: [],
    consequence_innovation_ids: [],
    requirement_innovation_ids: []
  }

  it('returns every row surfaced by RLS', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({
        data: [row1, row2],
        error: null
      })
    })

    const result = await getInnovations()

    expect(result).toEqual({ [row1.id]: row1, [row2.id]: row2 })
    expect(mockSupabase.from).toHaveBeenCalledWith('innovation')
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getInnovations()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getInnovations()).rejects.toThrow(
      'Error Fetching User: Auth error'
    )
  })

  it('throws when the query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSupabase.from.mockReturnValueOnce({
      select: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    })

    await expect(getInnovations()).rejects.toThrow(
      'Error Fetching Innovations: DB error'
    )
  })

  it('returns an empty map when the query returns no rows', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: [], error: null })
    })

    const result = await getInnovations()
    expect(result).toEqual({})
  })
})

describe('getInnovationIds', () => {
  it('returns innovation IDs without userId', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'i1' }, { id: 'i2' }], error: null })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getInnovationIds(['Cooking', 'Lantern Oven'], false)

    expect(result).toEqual(['i1', 'i2'])
    expect(mockSupabase.from).toHaveBeenCalledWith('innovation')
  })

  it('returns innovation IDs with userId (adds user_id filter)', async () => {
    const mockEq2 = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'i3' }], error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq1 })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getInnovationIds(['My Innovation'], true, 'user-1')

    expect(result).toEqual(['i3'])
    expect(mockEq2).toHaveBeenCalledWith('user_id', 'user-1')
  })

  it('throws when DB query fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getInnovationIds(['Cooking'], false)).rejects.toThrow(
      'Error Fetching Innovation ID(s): DB error'
    )
  })

  it('throws when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getInnovationIds(['Cooking'], false)).rejects.toThrow(
      'Innovation(s) Not Found'
    )
  })
})

describe('addInnovation', () => {
  const mockUser = { id: 'user-1' }
  const mockInnovation = { id: 'i1', custom: false, innovation_name: 'Cooking' }

  it('inserts a non-custom innovation without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockInnovation, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addInnovation({
      innovation_name: 'Cooking',
      custom: false
    })

    expect(result).toEqual(mockInnovation)
    expect(mockInsert).toHaveBeenCalledWith({
      innovation_name: 'Cooking',
      custom: false
    })
  })

  it('inserts a custom innovation with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const customInnovation = {
      id: 'i2',
      custom: true,
      innovation_name: 'My Innovation'
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: customInnovation, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addInnovation({
      innovation_name: 'My Innovation',
      custom: true
    })

    expect(result).toEqual(customInnovation)
    expect(mockInsert).toHaveBeenCalledWith({
      innovation_name: 'My Innovation',
      custom: true,
      user_id: mockUser.id
    })
  })

  it('throws when custom and user is null', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(
      addInnovation({ innovation_name: 'My Innovation', custom: true })
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(
      addInnovation({ innovation_name: 'Cooking', custom: false })
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
      addInnovation({ innovation_name: 'Cooking', custom: false })
    ).rejects.toThrow('Error Adding Innovation: Insert failed')
  })
})

describe('updateInnovation', () => {
  it('updates an innovation successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateInnovation('i1', { innovation_name: 'Updated Cooking' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('innovation')
    expect(mockEq).toHaveBeenCalledWith('id', 'i1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateInnovation('i1', { innovation_name: 'Cooking' })
    ).rejects.toThrow('Error Updating Innovation: Update failed')
  })
})

describe('removeInnovation', () => {
  it('removes an innovation successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeInnovation('i1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('innovation')
    expect(mockEq).toHaveBeenCalledWith('id', 'i1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeInnovation('i1')).rejects.toThrow(
      'Error Removing Innovation: Delete failed'
    )
  })
})
