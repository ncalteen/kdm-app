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
  getMilestones,
  getMilestoneIds,
  addMilestone,
  updateMilestone,
  removeMilestone
} = await import('@/lib/dal/milestone')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getMilestones', () => {
  const mockUser = { id: 'user-1' }
  const row1 = { id: 'm1', custom: false, milestone_name: 'Milestone', rules: null, story_event_id: null }
  const row2 = { id: 'm2', custom: true, milestone_name: 'Custom', rules: null, story_event_id: null }

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

    const result = await getMilestones()

    expect(result).toEqual({ [row1.id]: row1, [row2.id]: row2 })
    expect(mockSupabase.from).toHaveBeenCalledWith('milestone')
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getMilestones()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getMilestones()).rejects.toThrow(
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

    await expect(getMilestones()).rejects.toThrow(
      'Error Fetching Milestones: DB error'
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

    const result = await getMilestones()
    expect(result).toEqual({})
  })
})

describe('getMilestoneIds', () => {
  it('returns milestone IDs without userId', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'm1' }, { id: 'm2' }], error: null })
    const mockOr = vi.fn().mockReturnValue({ eq: mockEq })
    const mockIn = vi.fn().mockReturnValue({ or: mockOr })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getMilestoneIds(
      ['First Story', 'Second Story'],
      CampaignType.PEOPLE_OF_THE_LANTERN,
      false
    )

    expect(result).toEqual(['m1', 'm2'])
    expect(mockSupabase.from).toHaveBeenCalledWith('milestone')
  })

  it('returns milestone IDs with userId', async () => {
    const mockEq2 = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'm3' }], error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockOr = vi.fn().mockReturnValue({ eq: mockEq1 })
    const mockIn = vi.fn().mockReturnValue({ or: mockOr })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getMilestoneIds(
      ['My Milestone'],
      CampaignType.CUSTOM,
      true,
      'user-1'
    )

    expect(result).toEqual(['m3'])
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
      getMilestoneIds(
        ['First Story'],
        CampaignType.PEOPLE_OF_THE_LANTERN,
        false
      )
    ).rejects.toThrow('Error Fetching Milestone ID(s): DB error')
  })

  it('throws when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockOr = vi.fn().mockReturnValue({ eq: mockEq })
    const mockIn = vi.fn().mockReturnValue({ or: mockOr })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(
      getMilestoneIds(
        ['First Story'],
        CampaignType.PEOPLE_OF_THE_LANTERN,
        false
      )
    ).rejects.toThrow('Milestone(s) Not Found')
  })
})

describe('addMilestone', () => {
  const mockUser = { id: 'user-1' }
  const mockMilestone = {
    id: 'm1',
    custom: false,
    milestone_name: 'First Story',
    event_name: 'Returning Survivors',
    campaign_types: ['PEOPLE_OF_THE_LANTERN']
  }

  it('inserts a non-custom milestone without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockMilestone, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addMilestone({
      milestone_name: 'First Story',
      custom: false,
      event_name: 'Returning Survivors',
      campaign_types: ['PEOPLE_OF_THE_LANTERN']
    })

    expect(result).toEqual(mockMilestone)
  })

  it('inserts a custom milestone with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const customMilestone = {
      id: 'm2',
      custom: true,
      milestone_name: 'My Milestone',
      event_name: 'Custom Event',
      campaign_types: ['CUSTOM']
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: customMilestone, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addMilestone({
      milestone_name: 'My Milestone',
      custom: true,
      event_name: 'Custom Event',
      campaign_types: ['CUSTOM']
    })

    expect(result).toEqual(customMilestone)
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
      addMilestone({
        milestone_name: 'My Milestone',
        custom: true,
        campaign_types: ['CUSTOM']
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(
      addMilestone({
        milestone_name: 'First Story',
        custom: false,
        campaign_types: []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
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
      addMilestone({
        milestone_name: 'First Story',
        custom: false,
        campaign_types: []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    ).rejects.toThrow('Error Adding Milestone: Insert failed')
  })
})

describe('updateMilestone', () => {
  it('updates a milestone successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateMilestone('m1', { milestone_name: 'Updated First Story' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('milestone')
    expect(mockEq).toHaveBeenCalledWith('id', 'm1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateMilestone('m1', { milestone_name: 'First Story' })
    ).rejects.toThrow('Error Updating Milestone: Update failed')
  })
})

describe('removeMilestone', () => {
  it('removes a milestone successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeMilestone('m1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('milestone')
    expect(mockEq).toHaveBeenCalledWith('id', 'm1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeMilestone('m1')).rejects.toThrow(
      'Error Removing Milestone: Delete failed'
    )
  })
})
