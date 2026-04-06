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
  getUserId: vi.fn()
}))

const { getDisorders, addDisorder, updateDisorder, removeDisorder } =
  await import('@/lib/dal/disorder')
const { getUserId } = await import('@/lib/dal/user')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getDisorders', () => {
  const mockUserId = 'user-1'

  const nonCustomDisorder = {
    id: 'd1',
    custom: false,
    disorder_name: 'Anxiety'
  }
  const userCustomDisorder = {
    id: 'd2',
    custom: true,
    disorder_name: 'My Disorder'
  }
  const sharedDisorder = {
    id: 'd3',
    custom: true,
    disorder_name: 'Shared Disorder'
  }

  it('returns disorders from all three sources', async () => {
    vi.mocked(getUserId).mockResolvedValue(mockUserId)

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi
            .fn()
            .mockResolvedValue({ data: [nonCustomDisorder], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi
              .fn()
              .mockResolvedValue({ data: [userCustomDisorder], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ disorder: [sharedDisorder] }],
            error: null
          })
        })
      })

    const result = await getDisorders()

    expect(result).toEqual({
      d1: nonCustomDisorder,
      d2: userCustomDisorder,
      d3: sharedDisorder
    })
  })

  it('handles shared disorder as single object (not array)', async () => {
    vi.mocked(getUserId).mockResolvedValue(mockUserId)

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
            data: [{ disorder: sharedDisorder }],
            error: null
          })
        })
      })

    const result = await getDisorders()

    expect(result).toEqual({ d3: sharedDisorder })
  })

  it('throws when getUserId fails (not authenticated)', async () => {
    vi.mocked(getUserId).mockRejectedValue(new Error('Not Authenticated'))

    await expect(getDisorders()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when non-custom query fails', async () => {
    vi.mocked(getUserId).mockResolvedValue(mockUserId)

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'DB error' } })
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

    await expect(getDisorders()).rejects.toThrow(
      'Error Fetching Built-in Disorders: DB error'
    )
  })

  it('throws when user-custom query fails', async () => {
    vi.mocked(getUserId).mockResolvedValue(mockUserId)

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi
              .fn()
              .mockResolvedValue({ data: null, error: { message: 'DB error' } })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })

    await expect(getDisorders()).rejects.toThrow(
      'Error Fetching Custom Disorders: DB error'
    )
  })

  it('throws when shared query fails', async () => {
    vi.mocked(getUserId).mockResolvedValue(mockUserId)

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
          eq: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'DB error' } })
        })
      })

    await expect(getDisorders()).rejects.toThrow(
      'Error Fetching Shared Disorders: DB error'
    )
  })

  it('returns empty map when all sources are empty', async () => {
    vi.mocked(getUserId).mockResolvedValue(mockUserId)

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

    const result = await getDisorders()
    expect(result).toEqual({})
  })
})

describe('addDisorder', () => {
  const mockUser = { id: 'user-1' }
  const mockDisorder = { id: 'd1', custom: false, disorder_name: 'Anxiety' }

  it('inserts a non-custom disorder without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

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
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

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
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(
      addDisorder({ disorder_name: 'My Disorder', custom: true })
    ).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth returns an error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(
      addDisorder({ disorder_name: 'Anxiety', custom: false })
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
