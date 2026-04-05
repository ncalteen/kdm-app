import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getQuarryHuntBoardPositions,
  upsertQuarryHuntBoardPosition,
  updateQuarryHuntBoardPosition,
  removeQuarryHuntBoardPosition
} = await import('@/lib/dal/quarry-hunt-board-position')

beforeEach(() => {
  vi.clearAllMocks()
})

const mockPosition = {
  id: 'pos1',
  quarry_id: 'q1',
  level_number: 1,
  monster_hunt_pos: 12,
  survivor_hunt_pos: 0
}

describe('getQuarryHuntBoardPositions', () => {
  it('throws when quarryId is null', async () => {
    await expect(getQuarryHuntBoardPositions(null)).rejects.toThrow('Required: Quarry ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when quarryId is undefined', async () => {
    await expect(getQuarryHuntBoardPositions(undefined)).rejects.toThrow('Required: Quarry ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns hunt board positions for a valid quarry', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: [mockPosition], error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getQuarryHuntBoardPositions('q1')

    expect(result).toEqual([mockPosition])
    expect(mockSupabase.from).toHaveBeenCalledWith('quarry_hunt_board_position')
    expect(mockEq).toHaveBeenCalledWith('quarry_id', 'q1')
  })

  it('returns empty array when no positions exist', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getQuarryHuntBoardPositions('q1')

    expect(result).toEqual([])
  })

  it('throws when query fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getQuarryHuntBoardPositions('q1')).rejects.toThrow(
      'Error Fetching Quarry Hunt Board Positions: DB error'
    )
  })
})

describe('upsertQuarryHuntBoardPosition', () => {
  it('upserts a quarry hunt board position successfully', async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({ upsert: mockUpsert })

    await expect(
      upsertQuarryHuntBoardPosition({
        quarry_id: 'q1',
        level_number: 1,
        monster_hunt_pos: 12,
        survivor_hunt_pos: 0
      })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('quarry_hunt_board_position')
    expect(mockUpsert).toHaveBeenCalledWith(
      { quarry_id: 'q1', level_number: 1, monster_hunt_pos: 12, survivor_hunt_pos: 0 },
      { onConflict: 'quarry_id,level_number' }
    )
  })

  it('throws when upsert fails', async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ error: { message: 'Upsert failed' } })
    mockSupabase.from.mockReturnValue({ upsert: mockUpsert })

    await expect(
      upsertQuarryHuntBoardPosition({
        quarry_id: 'q1',
        level_number: 1,
        monster_hunt_pos: 12,
        survivor_hunt_pos: 0
      })
    ).rejects.toThrow('Error Upserting Quarry Hunt Board Position: Upsert failed')
  })
})

describe('updateQuarryHuntBoardPosition', () => {
  it('updates a quarry hunt board position successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateQuarryHuntBoardPosition('pos1', { monster_hunt_pos: 11 })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('quarry_hunt_board_position')
    expect(mockEq).toHaveBeenCalledWith('id', 'pos1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateQuarryHuntBoardPosition('pos1', { monster_hunt_pos: 11 })).rejects.toThrow(
      'Error Updating Quarry Hunt Board Position: Update failed'
    )
  })
})

describe('removeQuarryHuntBoardPosition', () => {
  it('removes a quarry hunt board position successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeQuarryHuntBoardPosition('pos1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('quarry_hunt_board_position')
    expect(mockEq).toHaveBeenCalledWith('id', 'pos1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeQuarryHuntBoardPosition('pos1')).rejects.toThrow(
      'Error Removing Quarry Hunt Board Position: Delete failed'
    )
  })
})
