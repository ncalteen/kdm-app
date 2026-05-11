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

const { getPhilosophies, addPhilosophy, updatePhilosophy, removePhilosophy } =
  await import('@/lib/dal/philosophy')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getPhilosophies', () => {
  const mockUser = { id: 'user-1' }
  const row1 = {
    id: 'p1',
    custom: false,
    philosophy_name: 'Philosophy',
    neurosis_id: null
  }
  const row2 = {
    id: 'p2',
    custom: true,
    philosophy_name: 'Custom',
    neurosis_id: null
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

    const result = await getPhilosophies()

    expect(result).toEqual({ [row1.id]: row1, [row2.id]: row2 })
    expect(mockSupabase.from).toHaveBeenCalledWith('philosophy')
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getPhilosophies()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getPhilosophies()).rejects.toThrow(
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

    await expect(getPhilosophies()).rejects.toThrow(
      'Error Fetching Philosophies: DB error'
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

    const result = await getPhilosophies()
    expect(result).toEqual({})
  })
})

describe('addPhilosophy', () => {
  const mockUser = { id: 'user-1' }
  const mockPhilosophy = {
    id: 'ph1',
    custom: false,
    philosophy_name: 'Acanthus Doctor'
  }

  it('inserts a non-custom philosophy without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockPhilosophy, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addPhilosophy({
      philosophy_name: 'Acanthus Doctor',
      custom: false
    })

    expect(result).toEqual(mockPhilosophy)
    expect(mockInsert).toHaveBeenCalledWith({
      philosophy_name: 'Acanthus Doctor',
      custom: false
    })
  })

  it('inserts a custom philosophy with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const customPhilosophy = {
      id: 'ph2',
      custom: true,
      philosophy_name: 'My Philosophy'
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: customPhilosophy, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addPhilosophy({
      philosophy_name: 'My Philosophy',
      custom: true
    })

    expect(result).toEqual(customPhilosophy)
    expect(mockInsert).toHaveBeenCalledWith({
      philosophy_name: 'My Philosophy',
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
      addPhilosophy({ philosophy_name: 'My Philosophy', custom: true })
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(
      addPhilosophy({ philosophy_name: 'Acanthus Doctor', custom: false })
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
      addPhilosophy({ philosophy_name: 'Acanthus Doctor', custom: false })
    ).rejects.toThrow('Error Adding Philosophy: Insert failed')
  })
})

describe('updatePhilosophy', () => {
  it('updates a philosophy and returns the updated record', async () => {
    const updatedPhilosophy = {
      id: 'ph1',
      custom: false,
      philosophy_name: 'Updated Doctor'
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: updatedPhilosophy, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    const result = await updatePhilosophy('ph1', {
      philosophy_name: 'Updated Doctor'
    })

    expect(result).toEqual(updatedPhilosophy)
    expect(mockSupabase.from).toHaveBeenCalledWith('philosophy')
    expect(mockEq).toHaveBeenCalledWith('id', 'ph1')
  })

  it('throws when update fails', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Update failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updatePhilosophy('ph1', { philosophy_name: 'Doctor' })
    ).rejects.toThrow('Error Updating Philosophy: Update failed')
  })

  it('throws when data is null after update', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updatePhilosophy('ph1', { philosophy_name: 'Doctor' })
    ).rejects.toThrow('Philosophy Not Found')
  })
})

describe('removePhilosophy', () => {
  it('removes a philosophy successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removePhilosophy('ph1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('philosophy')
    expect(mockEq).toHaveBeenCalledWith('id', 'ph1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removePhilosophy('ph1')).rejects.toThrow(
      'Error Removing Philosophy: Delete failed'
    )
  })
})
