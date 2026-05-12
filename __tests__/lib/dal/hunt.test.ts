import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

vi.mock('@/lib/dal/hunt-hunt-board', () => ({
  getHuntHuntBoard: vi.fn()
}))

vi.mock('@/lib/dal/hunt-monster', () => ({
  getHuntMonsters: vi.fn()
}))

vi.mock('@/lib/dal/hunt-survivor', () => ({
  getHuntSurvivors: vi.fn()
}))

vi.mock('@/lib/dal/settlement-shared-user', () => ({
  getSettlementMemberUsernames: vi.fn().mockResolvedValue(new Map())
}))

const { getHunt, addHunt, updateHunt, removeHunt } =
  await import('@/lib/dal/hunt')
const { getHuntHuntBoard } = await import('@/lib/dal/hunt-hunt-board')
const { getHuntMonsters } = await import('@/lib/dal/hunt-monster')
const { getHuntSurvivors } = await import('@/lib/dal/hunt-survivor')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getHunt', () => {
  const mockHuntData = {
    id: 'hunt-1',
    monster_level: 1,
    monster_position: 3,
    settlement_id: 'settlement-1',
    survivor_position: 2
  }

  it('returns null when settlementId is null', async () => {
    const result = await getHunt(null)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when settlementId is undefined', async () => {
    const result = await getHunt(undefined)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when no hunt is found', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      })
    })

    const result = await getHunt('settlement-1')

    expect(result).toBeNull()
    expect(getHuntHuntBoard).not.toHaveBeenCalled()
  })

  it('returns hunt with sub-data when found', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi
            .fn()
            .mockResolvedValue({ data: mockHuntData, error: null })
        })
      })
    })

    const mockBoard = { id: 'board-1', hunt_id: 'hunt-1' }
    const mockMonsters = { 'monster-1': { id: 'monster-1' } }
    const mockSurvivors = { 'hs-1': { id: 'hs-1' } }

    vi.mocked(getHuntHuntBoard).mockResolvedValue(mockBoard as never)
    vi.mocked(getHuntMonsters).mockResolvedValue(mockMonsters as never)
    vi.mocked(getHuntSurvivors).mockResolvedValue(mockSurvivors as never)

    const result = await getHunt('settlement-1')

    expect(result).toEqual({
      ...mockHuntData,
      hunt_board: mockBoard,
      hunt_monsters: mockMonsters,
      hunt_survivors: mockSurvivors
    })
    expect(getHuntHuntBoard).toHaveBeenCalledWith('hunt-1')
    expect(getHuntMonsters).toHaveBeenCalledWith('hunt-1', expect.any(Promise))
    expect(getHuntSurvivors).toHaveBeenCalledWith('hunt-1')
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

    await expect(getHunt('settlement-1')).rejects.toThrow(
      'Error Fetching Hunt: DB error'
    )
  })
})

describe('addHunt', () => {
  it('inserts a hunt and returns the id', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'hunt-1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await addHunt({ settlement_id: 'settlement-1' } as any)

    expect(result).toBe('hunt-1')
    expect(mockSupabase.from).toHaveBeenCalledWith('hunt')
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
      addHunt({ settlement_id: 'settlement-1' } as any)
    ).rejects.toThrow('Error Adding Hunt: Insert failed')
  })
})

describe('updateHunt', () => {
  it('updates a hunt successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateHunt('hunt-1', { monster_level: 2 })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('hunt')
    expect(mockUpdate).toHaveBeenCalledWith({ monster_level: 2 })
    expect(mockEq).toHaveBeenCalledWith('id', 'hunt-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateHunt('hunt-1', { monster_level: 2 })).rejects.toThrow(
      'Error Updating Hunt: Update failed'
    )
  })
})

describe('removeHunt', () => {
  it('removes a hunt successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeHunt('hunt-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('hunt')
    expect(mockEq).toHaveBeenCalledWith('id', 'hunt-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeHunt('hunt-1')).rejects.toThrow(
      'Error Removing Hunt: Delete failed'
    )
  })
})
