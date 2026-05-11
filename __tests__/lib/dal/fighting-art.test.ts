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
  getFightingArts,
  addFightingArt,
  updateFightingArt,
  removeFightingArt,
  getCustomFightingArts
} = await import('@/lib/dal/fighting-art')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getFightingArts', () => {
  const mockUser = { id: 'user-1' }
  const row1 = { id: 'f1', custom: false, fighting_art_name: 'Art', rules: null }
  const row2 = { id: 'f2', custom: true, fighting_art_name: 'Custom', rules: null }

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

    const result = await getFightingArts()

    expect(result).toEqual({ [row1.id]: row1, [row2.id]: row2 })
    expect(mockSupabase.from).toHaveBeenCalledWith('fighting_art')
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getFightingArts()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getFightingArts()).rejects.toThrow(
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

    await expect(getFightingArts()).rejects.toThrow(
      'Error Fetching Fighting Arts: DB error'
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

    const result = await getFightingArts()
    expect(result).toEqual({})
  })
})

describe('addFightingArt', () => {
  const mockUser = { id: 'user-1' }
  const mockFightingArt = {
    id: 'fa1',
    custom: false,
    fighting_art_name: 'Rawhide'
  }

  it('inserts a non-custom fighting art without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockFightingArt, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addFightingArt({
      fighting_art_name: 'Rawhide',
      custom: false
    })

    expect(result).toEqual(mockFightingArt)
    expect(mockInsert).toHaveBeenCalledWith({
      fighting_art_name: 'Rawhide',
      custom: false
    })
  })

  it('inserts a custom fighting art with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const customFightingArt = {
      id: 'fa2',
      custom: true,
      fighting_art_name: 'My Fighting Art'
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: customFightingArt, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addFightingArt({
      fighting_art_name: 'My Fighting Art',
      custom: true
    })

    expect(result).toEqual(customFightingArt)
    expect(mockInsert).toHaveBeenCalledWith({
      fighting_art_name: 'My Fighting Art',
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
      addFightingArt({ fighting_art_name: 'My Fighting Art', custom: true })
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(
      addFightingArt({ fighting_art_name: 'Rawhide', custom: false })
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
      addFightingArt({ fighting_art_name: 'Rawhide', custom: false })
    ).rejects.toThrow('Error Adding Fighting Art: Insert failed')
  })
})

describe('updateFightingArt', () => {
  it('updates a fighting art successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateFightingArt('fa1', { fighting_art_name: 'Updated Rawhide' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('fighting_art')
    expect(mockEq).toHaveBeenCalledWith('id', 'fa1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateFightingArt('fa1', { fighting_art_name: 'Rawhide' })
    ).rejects.toThrow('Error Updating Fighting Art: Update failed')
  })
})

describe('removeFightingArt', () => {
  it('removes a fighting art successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeFightingArt('fa1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('fighting_art')
    expect(mockEq).toHaveBeenCalledWith('id', 'fa1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeFightingArt('fa1')).rejects.toThrow(
      'Error Removing Fighting Art: Delete failed'
    )
  })
})

describe('getCustomFightingArts', () => {
  const mockUser = { id: 'user-1' }

  it('returns only custom fighting arts for the authenticated user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const customFightingArt = {
      id: 'fa2',
      custom: true,
      fighting_art_name: 'My Fighting Art'
    }
    const mockEq2 = vi
      .fn()
      .mockResolvedValue({ data: [customFightingArt], error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getCustomFightingArts()

    expect(result).toEqual({ fa2: customFightingArt })
    expect(mockEq1).toHaveBeenCalledWith('custom', true)
    expect(mockEq2).toHaveBeenCalledWith('user_id', mockUser.id)
  })

  it('returns empty map when user has no custom fighting arts', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockEq2 = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getCustomFightingArts()
    expect(result).toEqual({})
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getCustomFightingArts()).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getCustomFightingArts()).rejects.toThrow(
      'Error Fetching User: Auth error'
    )
  })

  it('throws when DB query fails', async () => {
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

    await expect(getCustomFightingArts()).rejects.toThrow(
      'Error Fetching Custom Fighting Arts: DB error'
    )
  })
})
