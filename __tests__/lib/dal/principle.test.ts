import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CampaignType } from '@/lib/enums'

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
  getPrinciples,
  getPrincipleIds,
  addPrinciple,
  updatePrinciple,
  removePrinciple
} = await import('@/lib/dal/principle')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getPrinciples', () => {
  const mockUser = { id: 'user-1' }
  const nonCustomPrinciple = {
    id: 'pr1',
    custom: false,
    principle_name: 'New Life',
    option_1_name: 'Protect the Young',
    option_2_name: 'Survival of the Fittest',
    campaign_types: ['PEOPLE_OF_THE_LANTERN']
  }
  const userCustomPrinciple = {
    id: 'pr2',
    custom: true,
    principle_name: 'My Principle',
    option_1_name: 'Option A',
    option_2_name: 'Option B',
    campaign_types: ['CUSTOM']
  }
  const sharedPrinciple = {
    id: 'pr3',
    custom: true,
    principle_name: 'Shared Principle',
    option_1_name: 'Option X',
    option_2_name: 'Option Y',
    campaign_types: ['CUSTOM']
  }

  it('returns principles from all three sources', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi
            .fn()
            .mockResolvedValue({ data: [nonCustomPrinciple], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi
              .fn()
              .mockResolvedValue({ data: [userCustomPrinciple], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ principle: [sharedPrinciple] }],
            error: null
          })
        })
      })

    const result = await getPrinciples()

    expect(result).toEqual({
      pr1: nonCustomPrinciple,
      pr2: userCustomPrinciple,
      pr3: sharedPrinciple
    })
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getPrinciples()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getPrinciples()).rejects.toThrow(
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

    await expect(getPrinciples()).rejects.toThrow(
      'Error Fetching Principles: DB error'
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

    await expect(getPrinciples()).rejects.toThrow(
      'Error Fetching Principles: DB error'
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

    await expect(getPrinciples()).rejects.toThrow(
      'Error Fetching Principles: DB error'
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

    const result = await getPrinciples()
    expect(result).toEqual({})
  })
})

describe('getPrincipleIds', () => {
  it('returns principle IDs without userId', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'pr1' }, { id: 'pr2' }], error: null })
    const mockContains = vi.fn().mockReturnValue({ eq: mockEq })
    const mockIn = vi.fn().mockReturnValue({ contains: mockContains })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getPrincipleIds(
      ['New Life', 'Conviction'],
      CampaignType.PEOPLE_OF_THE_LANTERN,
      false
    )

    expect(result).toEqual(['pr1', 'pr2'])
    expect(mockSupabase.from).toHaveBeenCalledWith('principle')
  })

  it('returns principle IDs with userId', async () => {
    const mockEq2 = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'pr3' }], error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockContains = vi.fn().mockReturnValue({ eq: mockEq1 })
    const mockIn = vi.fn().mockReturnValue({ contains: mockContains })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getPrincipleIds(
      ['My Principle'],
      CampaignType.CUSTOM,
      true,
      'user-1'
    )

    expect(result).toEqual(['pr3'])
    expect(mockEq2).toHaveBeenCalledWith('user_id', 'user-1')
  })

  it('throws when DB query fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockContains = vi.fn().mockReturnValue({ eq: mockEq })
    const mockIn = vi.fn().mockReturnValue({ contains: mockContains })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(
      getPrincipleIds(['New Life'], CampaignType.PEOPLE_OF_THE_LANTERN, false)
    ).rejects.toThrow('Error Fetching Principle ID(s): DB error')
  })

  it('throws when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockContains = vi.fn().mockReturnValue({ eq: mockEq })
    const mockIn = vi.fn().mockReturnValue({ contains: mockContains })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(
      getPrincipleIds(['New Life'], CampaignType.PEOPLE_OF_THE_LANTERN, false)
    ).rejects.toThrow('Principle(s) Not Found')
  })
})

describe('addPrinciple', () => {
  const mockUser = { id: 'user-1' }
  const mockPrinciple = {
    id: 'pr1',
    custom: false,
    principle_name: 'New Life',
    option_1_name: 'Protect the Young',
    option_2_name: 'Survival of the Fittest',
    campaign_types: ['PEOPLE_OF_THE_LANTERN']
  }

  it('inserts a non-custom principle without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockPrinciple, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addPrinciple({
      principle_name: 'New Life',
      custom: false,
      option_1_name: 'Protect the Young',
      option_2_name: 'Survival of the Fittest',
      campaign_types: ['PEOPLE_OF_THE_LANTERN']
    })

    expect(result).toEqual(mockPrinciple)
  })

  it('inserts a custom principle with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const customPrinciple = { ...mockPrinciple, id: 'pr2', custom: true }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: customPrinciple, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await addPrinciple({
      principle_name: 'New Life',
      custom: true,
      option_1_name: 'Protect',
      option_2_name: 'Survive',
      campaign_types: ['CUSTOM']
    })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: mockUser.id })
    )
  })

  it('throws when custom and user is null', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(
      addPrinciple({
        principle_name: 'My Principle',
        custom: true,
        option_1_name: 'A',
        option_2_name: 'B',
        campaign_types: ['CUSTOM']
      })
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(
      addPrinciple({
        principle_name: 'New Life',
        custom: false,
        option_1_name: 'A',
        option_2_name: 'B',
        campaign_types: []
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
      addPrinciple({
        principle_name: 'New Life',
        custom: false,
        option_1_name: 'A',
        option_2_name: 'B',
        campaign_types: []
      })
    ).rejects.toThrow('Error Adding Principle: Insert failed')
  })
})

describe('updatePrinciple', () => {
  it('updates a principle successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updatePrinciple('pr1', { principle_name: 'Updated New Life' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('principle')
    expect(mockEq).toHaveBeenCalledWith('id', 'pr1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updatePrinciple('pr1', { principle_name: 'New Life' })
    ).rejects.toThrow('Error Updating Principle: Update failed')
  })
})

describe('removePrinciple', () => {
  it('removes a principle successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removePrinciple('pr1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('principle')
    expect(mockEq).toHaveBeenCalledWith('id', 'pr1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removePrinciple('pr1')).rejects.toThrow(
      'Error Removing Principle: Delete failed'
    )
  })
})
