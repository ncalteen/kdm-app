import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const { getStrainMilestoneSharedUsers, addStrainMilestoneSharedUsers, removeStrainMilestoneSharedUsers } = await import(
  '@/lib/dal/strain-milestone-shared-user'
)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getStrainMilestoneSharedUsers', () => {
  it('returns mapped shared users on success', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({
        data: [{ shared_user_id: 'u-1', user_settings: { username: 'testuser' } }],
        error: null
      })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getStrainMilestoneSharedUsers('strain_milestone-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('strain_milestone_shared_user')
    expect(mockSelect).toHaveBeenCalledWith(
      'shared_user_id, user_settings!shared_user_id(username)'
    )
    expect(mockEq).toHaveBeenCalledWith('strain_milestone_id', 'strain_milestone-1')
    expect(result).toEqual([{ shared_user_id: 'u-1', username: 'testuser' }])
  })

  it('returns empty array when data is empty', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getStrainMilestoneSharedUsers('strain_milestone-1')

    expect(result).toEqual([])
  })

  it('returns empty array when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getStrainMilestoneSharedUsers('strain_milestone-1')

    expect(result).toEqual([])
  })

  it('throws on error', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getStrainMilestoneSharedUsers('strain_milestone-1')).rejects.toThrow(
      'Error Fetching Strain Milestone Shared Users: DB error'
    )
  })
})

describe('addStrainMilestoneSharedUsers', () => {
  it('returns early without calling from() when sharedUserIds is empty', async () => {
    await addStrainMilestoneSharedUsers('strain_milestone-1', [], 'user-1')

    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts shared users correctly', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await addStrainMilestoneSharedUsers('strain_milestone-1', ['u-1', 'u-2'], 'user-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('strain_milestone_shared_user')
    expect(mockInsert).toHaveBeenCalledWith([
      { strain_milestone_id: 'strain_milestone-1', shared_user_id: 'u-1', user_id: 'user-1' },
      { strain_milestone_id: 'strain_milestone-1', shared_user_id: 'u-2', user_id: 'user-1' }
    ])
  })

  it('throws on error', async () => {
    const mockInsert = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Insert failed' } })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addStrainMilestoneSharedUsers('strain_milestone-1', ['u-1'], 'user-1')
    ).rejects.toThrow('Error Adding Strain Milestone Shared Users: Insert failed')
  })
})

describe('removeStrainMilestoneSharedUsers', () => {
  it('returns early without calling from() when sharedUserIds is empty', async () => {
    await removeStrainMilestoneSharedUsers('strain_milestone-1', [])

    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('deletes shared users correctly', async () => {
    const mockIn = vi.fn().mockResolvedValue({ error: null })
    const mockEq = vi.fn().mockReturnValue({ in: mockIn })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await removeStrainMilestoneSharedUsers('strain_milestone-1', ['u-1', 'u-2'])

    expect(mockSupabase.from).toHaveBeenCalledWith('strain_milestone_shared_user')
    expect(mockEq).toHaveBeenCalledWith('strain_milestone_id', 'strain_milestone-1')
    expect(mockIn).toHaveBeenCalledWith('shared_user_id', ['u-1', 'u-2'])
  })

  it('throws on error', async () => {
    const mockIn = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockEq = vi.fn().mockReturnValue({ in: mockIn })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(
      removeStrainMilestoneSharedUsers('strain_milestone-1', ['u-1'])
    ).rejects.toThrow('Error Removing Strain Milestone Shared Users: Delete failed')
  })
})
