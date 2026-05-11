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

vi.mock('@/lib/dal/user', () => ({
  getUserId: vi.fn(),
  getUserIdOrNull: vi.fn()
}))

const { getDisorders, addDisorder, updateDisorder, removeDisorder } =
  await import('@/lib/dal/disorder')
const { getUserId, getUserIdOrNull } = await import('@/lib/dal/user')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getDisorders', () => {
  const userId = 'user-1'
  const row1 = { id: 'd1', custom: false, disorder_name: 'Disorder', rules: null }
  const row2 = { id: 'd2', custom: true, disorder_name: 'Custom', rules: null }

  it('returns every row surfaced by RLS', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({
        data: [row1, row2],
        error: null
      })
    })

    const result = await getDisorders()

    expect(result).toEqual({ [row1.id]: row1, [row2.id]: row2 })
    expect(mockSupabase.from).toHaveBeenCalledWith('disorder')
  })

  it('throws when user is not authenticated', async () => {
    vi.mocked(getUserId).mockRejectedValue(new Error('Not Authenticated'))

    await expect(getDisorders()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    vi.mocked(getUserId).mockRejectedValue(new Error('Error Fetching User: Auth error'))

    await expect(getDisorders()).rejects.toThrow(
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

    await expect(getDisorders()).rejects.toThrow(
      'Error Fetching Disorders: DB error'
    )
  })

  it('returns an empty map when the query returns no rows', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: [], error: null })
    })

    const result = await getDisorders()
    expect(result).toEqual({})
  })
})

describe('addDisorder', () => {
  const mockUser = { id: 'user-1' }
  const mockDisorder = { id: 'd1', custom: false, disorder_name: 'Anxiety' }

  it('inserts a non-custom disorder without user_id', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(mockUser.id)

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockDisorder, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addDisorder({
      disorder_name: 'Anxiety',
      custom: false
    })

    expect(result).toEqual(mockDisorder)
    expect(mockInsert).toHaveBeenCalledWith({
      disorder_name: 'Anxiety',
      custom: false
    })
  })

  it('inserts a custom disorder with user_id', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(mockUser.id)

    const customDisorder = {
      id: 'd2',
      custom: true,
      disorder_name: 'My Disorder'
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: customDisorder, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addDisorder({
      disorder_name: 'My Disorder',
      custom: true
    })

    expect(result).toEqual(customDisorder)
    expect(mockInsert).toHaveBeenCalledWith({
      disorder_name: 'My Disorder',
      custom: true,
      user_id: mockUser.id
    })
  })

  it('throws when custom disorder requires auth but user is null', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(null)

    await expect(
      addDisorder({ disorder_name: 'My Disorder', custom: true })
    ).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth returns an error', async () => {
    vi.mocked(getUserIdOrNull).mockRejectedValue(
      new Error('Error Fetching User: Auth error')
    )

    await expect(
      addDisorder({ disorder_name: 'Anxiety', custom: false })
    ).rejects.toThrow('Error Fetching User: Auth error')
  })

  it('throws when DB insert fails', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(mockUser.id)

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addDisorder({ disorder_name: 'Anxiety', custom: false })
    ).rejects.toThrow('Error Adding Disorder: Insert failed')
  })
})

describe('updateDisorder', () => {
  it('updates a disorder successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateDisorder('d1', { disorder_name: 'Updated Anxiety' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('disorder')
    expect(mockUpdate).toHaveBeenCalledWith({
      disorder_name: 'Updated Anxiety'
    })
    expect(mockEq).toHaveBeenCalledWith('id', 'd1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateDisorder('d1', { disorder_name: 'Anxiety' })
    ).rejects.toThrow('Error Updating Disorder: Update failed')
  })
})

describe('removeDisorder', () => {
  it('removes a disorder successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeDisorder('d1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('disorder')
    expect(mockEq).toHaveBeenCalledWith('id', 'd1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeDisorder('d1')).rejects.toThrow(
      'Error Removing Disorder: Delete failed'
    )
  })
})
