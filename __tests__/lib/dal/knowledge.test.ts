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
  getKnowledges,
  addKnowledge,
  updateKnowledge,
  removeKnowledge
} = await import('@/lib/dal/knowledge')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getKnowledges', () => {
  const mockUser = { id: 'user-1' }
  const nonCustomKnowledge = { id: 'k1', custom: false, knowledge_name: 'Horology', philosophy_id: 'p1' }
  const userCustomKnowledge = { id: 'k2', custom: true, knowledge_name: 'My Knowledge', philosophy_id: 'p2' }
  const sharedKnowledge = { id: 'k3', custom: true, knowledge_name: 'Shared Knowledge', philosophy_id: 'p3' }

  it('returns knowledges from all three sources', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [nonCustomKnowledge], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [userCustomKnowledge], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ knowledge: [sharedKnowledge] }],
            error: null
          })
        })
      })

    const result = await getKnowledges()

    expect(result).toEqual({
      k1: nonCustomKnowledge,
      k2: userCustomKnowledge,
      k3: sharedKnowledge
    })
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

    await expect(getKnowledges()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getKnowledges()).rejects.toThrow('Error Fetching User: Auth error')
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

    await expect(getKnowledges()).rejects.toThrow('Error Fetching Knowledges: DB error')
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

    await expect(getKnowledges()).rejects.toThrow('Error Fetching Knowledges: DB error')
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

    await expect(getKnowledges()).rejects.toThrow('Error Fetching Knowledges: DB error')
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

    const result = await getKnowledges()
    expect(result).toEqual({})
  })
})

describe('addKnowledge', () => {
  const mockUser = { id: 'user-1' }
  const mockKnowledge = { id: 'k1', custom: false, knowledge_name: 'Horology', philosophy_id: 'p1' }

  it('inserts a non-custom knowledge without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    const mockSingle = vi.fn().mockResolvedValue({ data: mockKnowledge, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addKnowledge({ knowledge_name: 'Horology', custom: false, philosophy_id: 'p1' })

    expect(result).toEqual(mockKnowledge)
    expect(mockInsert).toHaveBeenCalledWith({
      knowledge_name: 'Horology',
      custom: false,
      philosophy_id: 'p1'
    })
  })

  it('inserts a custom knowledge with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    const customKnowledge = { id: 'k2', custom: true, knowledge_name: 'My Knowledge', philosophy_id: 'p1' }
    const mockSingle = vi.fn().mockResolvedValue({ data: customKnowledge, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addKnowledge({ knowledge_name: 'My Knowledge', custom: true, philosophy_id: 'p1' })

    expect(result).toEqual(customKnowledge)
    expect(mockInsert).toHaveBeenCalledWith({
      knowledge_name: 'My Knowledge',
      custom: true,
      philosophy_id: 'p1',
      user_id: mockUser.id
    })
  })

  it('throws when custom and user is null', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

    await expect(
      addKnowledge({ knowledge_name: 'My Knowledge', custom: true, philosophy_id: 'p1' })
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth returns an error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(
      addKnowledge({ knowledge_name: 'Horology', custom: false, philosophy_id: 'p1' })
    ).rejects.toThrow('Error Fetching User: Auth error')
  })

  it('throws when DB insert fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addKnowledge({ knowledge_name: 'Horology', custom: false, philosophy_id: 'p1' })
    ).rejects.toThrow('Error Adding Knowledge: Insert failed')
  })
})

describe('updateKnowledge', () => {
  it('updates a knowledge successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateKnowledge('k1', { knowledge_name: 'Updated Horology' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('knowledge')
    expect(mockEq).toHaveBeenCalledWith('id', 'k1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateKnowledge('k1', { knowledge_name: 'Horology' })).rejects.toThrow(
      'Error Updating Knowledge: Update failed'
    )
  })
})

describe('removeKnowledge', () => {
  it('removes a knowledge successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeKnowledge('k1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('knowledge')
    expect(mockEq).toHaveBeenCalledWith('id', 'k1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeKnowledge('k1')).rejects.toThrow('Error Removing Knowledge: Delete failed')
  })
})
