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
  getStrainMilestones,
  addStrainMilestone,
  updateStrainMilestone,
  removeStrainMilestone
} = await import('@/lib/dal/strain-milestone')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getStrainMilestones', () => {
  const mockUser = { id: 'user-1' }
  const row1 = {
    id: 's1',
    custom: false,
    strain_milestone_name: 'Strain',
    rules: null
  }
  const row2 = {
    id: 's2',
    custom: true,
    strain_milestone_name: 'Custom',
    rules: null
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

    const result = await getStrainMilestones()

    expect(result).toEqual({ [row1.id]: row1, [row2.id]: row2 })
    expect(mockSupabase.from).toHaveBeenCalledWith('strain_milestone')
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getStrainMilestones()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getStrainMilestones()).rejects.toThrow(
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

    await expect(getStrainMilestones()).rejects.toThrow(
      'Error Fetching Strain Milestones: DB error'
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

    const result = await getStrainMilestones()
    expect(result).toEqual({})
  })
})

describe('addStrainMilestone', () => {
  const mockUser = { id: 'user-1' }
  const mockStrainMilestone = {
    id: 'sm1',
    custom: false,
    strain_milestone_name: 'Crossroads'
  }

  it('inserts a non-custom strain milestone without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockStrainMilestone, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addStrainMilestone({
      strain_milestone_name: 'Crossroads',
      custom: false
    })

    expect(result).toEqual(mockStrainMilestone)
    expect(mockInsert).toHaveBeenCalledWith({
      strain_milestone_name: 'Crossroads',
      custom: false
    })
  })

  it('inserts a custom strain milestone with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const customStrainMilestone = {
      id: 'sm2',
      custom: true,
      strain_milestone_name: 'My Strain Milestone'
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: customStrainMilestone, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addStrainMilestone({
      strain_milestone_name: 'My Strain Milestone',
      custom: true
    })

    expect(result).toEqual(customStrainMilestone)
    expect(mockInsert).toHaveBeenCalledWith({
      strain_milestone_name: 'My Strain Milestone',
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
      addStrainMilestone({
        strain_milestone_name: 'My Strain Milestone',
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
      addStrainMilestone({ strain_milestone_name: 'Crossroads', custom: false })
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
      addStrainMilestone({ strain_milestone_name: 'Crossroads', custom: false })
    ).rejects.toThrow('Error Adding Strain Milestone: Insert failed')
  })
})

describe('updateStrainMilestone', () => {
  it('updates a strain milestone successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateStrainMilestone('sm1', {
        strain_milestone_name: 'Updated Crossroads'
      })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('strain_milestone')
    expect(mockEq).toHaveBeenCalledWith('id', 'sm1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateStrainMilestone('sm1', { strain_milestone_name: 'Crossroads' })
    ).rejects.toThrow('Error Updating Strain Milestone: Update failed')
  })
})

describe('removeStrainMilestone', () => {
  it('removes a strain milestone successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeStrainMilestone('sm1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('strain_milestone')
    expect(mockEq).toHaveBeenCalledWith('id', 'sm1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeStrainMilestone('sm1')).rejects.toThrow(
      'Error Removing Strain Milestone: Delete failed'
    )
  })
})
