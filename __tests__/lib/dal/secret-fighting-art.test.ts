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
  getSecretFightingArts,
  addSecretFightingArt,
  updateSecretFightingArt,
  removeSecretFightingArt
} = await import('@/lib/dal/secret-fighting-art')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSecretFightingArts', () => {
  const mockUser = { id: 'user-1' }
  const nonCustomSFA = {
    id: 'sfa1',
    custom: false,
    secret_fighting_art_name: 'Fist and Tooth'
  }
  const userCustomSFA = {
    id: 'sfa2',
    custom: true,
    secret_fighting_art_name: 'My Secret Art'
  }
  const sharedSFA = {
    id: 'sfa3',
    custom: true,
    secret_fighting_art_name: 'Shared Secret Art'
  }

  it('returns secret fighting arts from all three sources', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [nonCustomSFA], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi
              .fn()
              .mockResolvedValue({ data: [userCustomSFA], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ secret_fighting_art: [sharedSFA] }],
            error: null
          })
        })
      })

    const result = await getSecretFightingArts()

    expect(result).toEqual({
      sfa1: nonCustomSFA,
      sfa2: userCustomSFA,
      sfa3: sharedSFA
    })
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getSecretFightingArts()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getSecretFightingArts()).rejects.toThrow(
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

    await expect(getSecretFightingArts()).rejects.toThrow(
      'Error Fetching Secret Fighting Arts: DB error'
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

    await expect(getSecretFightingArts()).rejects.toThrow(
      'Error Fetching Secret Fighting Arts: DB error'
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

    await expect(getSecretFightingArts()).rejects.toThrow(
      'Error Fetching Secret Fighting Arts: DB error'
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

    const result = await getSecretFightingArts()
    expect(result).toEqual({})
  })
})

describe('addSecretFightingArt', () => {
  const mockUser = { id: 'user-1' }
  const mockSFA = {
    id: 'sfa1',
    custom: false,
    secret_fighting_art_name: 'Fist and Tooth'
  }

  it('inserts a non-custom secret fighting art without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockSingle = vi.fn().mockResolvedValue({ data: mockSFA, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSecretFightingArt({
      secret_fighting_art_name: 'Fist and Tooth',
      custom: false
    })

    expect(result).toEqual(mockSFA)
    expect(mockInsert).toHaveBeenCalledWith({
      secret_fighting_art_name: 'Fist and Tooth',
      custom: false
    })
  })

  it('inserts a custom secret fighting art with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const customSFA = {
      id: 'sfa2',
      custom: true,
      secret_fighting_art_name: 'My Secret Art'
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: customSFA, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSecretFightingArt({
      secret_fighting_art_name: 'My Secret Art',
      custom: true
    })

    expect(result).toEqual(customSFA)
    expect(mockInsert).toHaveBeenCalledWith({
      secret_fighting_art_name: 'My Secret Art',
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
      addSecretFightingArt({
        secret_fighting_art_name: 'My Secret Art',
        custom: true
      })
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(
      addSecretFightingArt({
        secret_fighting_art_name: 'Fist and Tooth',
        custom: false
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
      addSecretFightingArt({
        secret_fighting_art_name: 'Fist and Tooth',
        custom: false
      })
    ).rejects.toThrow('Error Adding Secret Fighting Art: Insert failed')
  })
})

describe('updateSecretFightingArt', () => {
  it('updates a secret fighting art successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSecretFightingArt('sfa1', {
        secret_fighting_art_name: 'Updated Fist and Tooth'
      })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('secret_fighting_art')
    expect(mockEq).toHaveBeenCalledWith('id', 'sfa1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSecretFightingArt('sfa1', {
        secret_fighting_art_name: 'Fist and Tooth'
      })
    ).rejects.toThrow('Error Updating Secret Fighting Art: Update failed')
  })
})

describe('removeSecretFightingArt', () => {
  it('removes a secret fighting art successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSecretFightingArt('sfa1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('secret_fighting_art')
    expect(mockEq).toHaveBeenCalledWith('id', 'sfa1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSecretFightingArt('sfa1')).rejects.toThrow(
      'Error Removing Secret Fighting Art: Delete failed'
    )
  })
})
