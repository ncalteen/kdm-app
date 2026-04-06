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

const { getNeuroses, addNeurosis, updateNeurosis, removeNeurosis } =
  await import('@/lib/dal/neurosis')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getNeuroses', () => {
  const mockUser = { id: 'user-1' }
  const nonCustomNeurosis = {
    id: 'n1',
    custom: false,
    neurosis_name: 'Agoraphobia',
    philosophy_id: 'p1'
  }
  const userCustomNeurosis = {
    id: 'n2',
    custom: true,
    neurosis_name: 'My Neurosis',
    philosophy_id: 'p2'
  }
  const sharedNeurosis = {
    id: 'n3',
    custom: true,
    neurosis_name: 'Shared Neurosis',
    philosophy_id: 'p3'
  }

  it('returns neuroses from all three sources', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi
            .fn()
            .mockResolvedValue({ data: [nonCustomNeurosis], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi
              .fn()
              .mockResolvedValue({ data: [userCustomNeurosis], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ neurosis: [sharedNeurosis] }],
            error: null
          })
        })
      })

    const result = await getNeuroses()

    expect(result).toEqual({
      n1: nonCustomNeurosis,
      n2: userCustomNeurosis,
      n3: sharedNeurosis
    })
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getNeuroses()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getNeuroses()).rejects.toThrow(
      'Error Fetching User: Auth error'
    )
  })

  it('throws when non-custom query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

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

    await expect(getNeuroses()).rejects.toThrow(
      'Error Fetching Neuroses: DB error'
    )
  })

  it('throws when user-custom query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

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

    await expect(getNeuroses()).rejects.toThrow(
      'Error Fetching Neuroses: DB error'
    )
  })

  it('throws when shared query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

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

    await expect(getNeuroses()).rejects.toThrow(
      'Error Fetching Neuroses: DB error'
    )
  })

  it('returns empty map when all sources return empty arrays', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

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

    const result = await getNeuroses()
    expect(result).toEqual({})
  })
})

describe('addNeurosis', () => {
  const mockUser = { id: 'user-1' }
  const mockNeurosis = {
    id: 'n1',
    custom: false,
    neurosis_name: 'Agoraphobia',
    philosophy_id: 'p1'
  }

  it('inserts a non-custom neurosis without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockNeurosis, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addNeurosis({
      neurosis_name: 'Agoraphobia',
      custom: false,
      philosophy_id: 'p1'
    })

    expect(result).toEqual(mockNeurosis)
    expect(mockInsert).toHaveBeenCalledWith({
      neurosis_name: 'Agoraphobia',
      custom: false,
      philosophy_id: 'p1'
    })
  })

  it('inserts a custom neurosis with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const customNeurosis = {
      id: 'n2',
      custom: true,
      neurosis_name: 'My Neurosis',
      philosophy_id: 'p1'
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: customNeurosis, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addNeurosis({
      neurosis_name: 'My Neurosis',
      custom: true,
      philosophy_id: 'p1'
    })

    expect(result).toEqual(customNeurosis)
    expect(mockInsert).toHaveBeenCalledWith({
      neurosis_name: 'My Neurosis',
      custom: true,
      philosophy_id: 'p1',
      user_id: mockUser.id
    })
  })

  it('throws when custom neurosis requires auth but user is null', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(
      addNeurosis({
        neurosis_name: 'My Neurosis',
        custom: true,
        philosophy_id: 'p1'
      })
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth returns an error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(
      addNeurosis({
        neurosis_name: 'Agoraphobia',
        custom: false,
        philosophy_id: 'p1'
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
      addNeurosis({
        neurosis_name: 'Agoraphobia',
        custom: false,
        philosophy_id: 'p1'
      })
    ).rejects.toThrow('Error Adding Neurosis: Insert failed')
  })
})

describe('updateNeurosis', () => {
  it('updates a neurosis successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateNeurosis('n1', { neurosis_name: 'Updated Agoraphobia' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('neurosis')
    expect(mockEq).toHaveBeenCalledWith('id', 'n1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateNeurosis('n1', { neurosis_name: 'Agoraphobia' })
    ).rejects.toThrow('Error Updating Neurosis: Update failed')
  })
})

describe('removeNeurosis', () => {
  it('removes a neurosis successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeNeurosis('n1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('neurosis')
    expect(mockEq).toHaveBeenCalledWith('id', 'n1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeNeurosis('n1')).rejects.toThrow(
      'Error Removing Neurosis: Delete failed'
    )
  })
})
