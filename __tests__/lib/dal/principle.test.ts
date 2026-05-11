import { CampaignType } from '@/lib/enums'
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
  const row1 = { id: 'p1', custom: false, principle_name: 'Principle', principle_category: 'A', option1_id: null, option2_id: null }
  const row2 = { id: 'p2', custom: true, principle_name: 'Custom', principle_category: 'B', option1_id: null, option2_id: null }

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

    const result = await getPrinciples()

    expect(result).toEqual({ [row1.id]: row1, [row2.id]: row2 })
    expect(mockSupabase.from).toHaveBeenCalledWith('principle')
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

    await expect(getPrinciples()).rejects.toThrow(
      'Error Fetching Principles: DB error'
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

    const result = await getPrinciples()
    expect(result).toEqual({})
  })
})

describe('getPrincipleIds', () => {
  it('returns principle IDs without userId', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'pr1' }, { id: 'pr2' }], error: null })
    const mockOr = vi.fn().mockReturnValue({ eq: mockEq })
    const mockIn = vi.fn().mockReturnValue({ or: mockOr })
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
    const mockOr = vi.fn().mockReturnValue({ eq: mockEq1 })
    const mockIn = vi.fn().mockReturnValue({ or: mockOr })
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
    const mockOr = vi.fn().mockReturnValue({ eq: mockEq })
    const mockIn = vi.fn().mockReturnValue({ or: mockOr })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(
      getPrincipleIds(['New Life'], CampaignType.PEOPLE_OF_THE_LANTERN, false)
    ).rejects.toThrow('Error Fetching Principle ID(s): DB error')
  })

  it('throws when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockOr = vi.fn().mockReturnValue({ eq: mockEq })
    const mockIn = vi.fn().mockReturnValue({ or: mockOr })
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
