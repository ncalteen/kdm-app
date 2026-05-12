import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

vi.mock('@/lib/dal/showdown-monster', () => ({
  getShowdownMonsters: vi.fn()
}))

vi.mock('@/lib/dal/showdown-survivor', () => ({
  getShowdownSurvivors: vi.fn()
}))

vi.mock('@/lib/dal/settlement-shared-user', () => ({
  getSettlementMemberUsernames: vi.fn().mockResolvedValue(new Map())
}))

const { getShowdown, addShowdown, updateShowdown, removeShowdown } =
  await import('@/lib/dal/showdown')
const { getShowdownMonsters } = await import('@/lib/dal/showdown-monster')
const { getShowdownSurvivors } = await import('@/lib/dal/showdown-survivor')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getShowdown', () => {
  const mockShowdownData = {
    id: 'showdown-1',
    ambush: false,
    monster_level: 1,
    settlement_id: 'settlement-1',
    showdown_type: 'normal',
    turn: 1
  }

  it('returns null when settlementId is null', async () => {
    const result = await getShowdown(null)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when no showdown is found', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      })
    })

    const result = await getShowdown('settlement-1')

    expect(result).toBeNull()
    expect(getShowdownMonsters).not.toHaveBeenCalled()
    expect(getShowdownSurvivors).not.toHaveBeenCalled()
  })

  it('returns showdown with sub-data when found', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi
            .fn()
            .mockResolvedValue({ data: mockShowdownData, error: null })
        })
      })
    })

    const mockMonsters = { 'monster-1': { id: 'monster-1' } }
    const mockSurvivors = { 'ss-1': { id: 'ss-1' } }

    vi.mocked(getShowdownMonsters).mockResolvedValue(mockMonsters as never)
    vi.mocked(getShowdownSurvivors).mockResolvedValue(mockSurvivors as never)

    const result = await getShowdown('settlement-1')

    expect(result).toEqual({
      ...mockShowdownData,
      showdown_monsters: mockMonsters,
      showdown_survivors: mockSurvivors
    })
    expect(getShowdownMonsters).toHaveBeenCalledWith(
      'showdown-1',
      expect.any(Promise)
    )
    expect(getShowdownSurvivors).toHaveBeenCalledWith('showdown-1')
  })

  it('throws when query fails', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'DB error' } })
        })
      })
    })

    await expect(getShowdown('settlement-1')).rejects.toThrow(
      'Error Fetching Showdown: DB error'
    )
  })
})

describe('addShowdown', () => {
  it('inserts a showdown and returns the id', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'showdown-1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await addShowdown({ settlement_id: 'settlement-1' } as any)

    expect(result).toBe('showdown-1')
    expect(mockSupabase.from).toHaveBeenCalledWith('showdown')
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addShowdown({ settlement_id: 'settlement-1' } as any)
    ).rejects.toThrow('Error Adding Showdown: Insert failed')
  })
})

describe('updateShowdown', () => {
  it('updates a showdown successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateShowdown('showdown-1', { turn: 2 } as any)
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('showdown')
    expect(mockUpdate).toHaveBeenCalledWith({ turn: 2 })
    expect(mockEq).toHaveBeenCalledWith('id', 'showdown-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateShowdown('showdown-1', { turn: 2 } as any)
    ).rejects.toThrow('Error Updating Showdown: Update failed')
  })
})

describe('removeShowdown', () => {
  it('removes a showdown successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeShowdown('showdown-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('showdown')
    expect(mockEq).toHaveBeenCalledWith('id', 'showdown-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeShowdown('showdown-1')).rejects.toThrow(
      'Error Removing Showdown: Delete failed'
    )
  })
})
