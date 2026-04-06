import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getHuntHuntBoard,
  addHuntHuntBoard,
  updateHuntHuntBoard,
  removeHuntHuntBoard
} = await import('@/lib/dal/hunt-hunt-board')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getHuntHuntBoard', () => {
  const mockBoard = {
    id: 'board-1',
    hunt_id: 'hunt-1',
    pos_1: null,
    pos_2: null,
    pos_3: null,
    pos_4: null,
    pos_5: null,
    pos_7: null,
    pos_8: null,
    pos_9: null,
    pos_10: null,
    pos_11: null,
    settlement_id: 'settlement-1'
  }

  it('returns null when huntId is null', async () => {
    const result = await getHuntHuntBoard(null)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when huntId is undefined', async () => {
    const result = await getHuntHuntBoard(undefined)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns hunt board data', async () => {
    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: mockBoard, error: null })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getHuntHuntBoard('hunt-1')

    expect(result).toEqual(mockBoard)
    expect(mockSupabase.from).toHaveBeenCalledWith('hunt_hunt_board')
  })

  it('returns null when no board is found', async () => {
    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: null })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getHuntHuntBoard('hunt-1')

    expect(result).toBeNull()
  })

  it('throws when query fails', async () => {
    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getHuntHuntBoard('hunt-1')).rejects.toThrow(
      'Error Fetching Hunt Board: DB error'
    )
  })
})

describe('addHuntHuntBoard', () => {
  it('inserts a hunt board and returns it', async () => {
    const mockBoard = {
      id: 'board-1',
      hunt_id: 'hunt-1',
      settlement_id: 'settlement-1'
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockBoard, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addHuntHuntBoard({
      hunt_id: 'hunt-1',
      settlement_id: 'settlement-1'
    })

    expect(result).toEqual(mockBoard)
    expect(mockSupabase.from).toHaveBeenCalledWith('hunt_hunt_board')
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addHuntHuntBoard({ hunt_id: 'hunt-1', settlement_id: 'settlement-1' })
    ).rejects.toThrow('Error Adding Hunt Board: Insert failed')
  })
})

describe('updateHuntHuntBoard', () => {
  it('updates a hunt board successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateHuntHuntBoard('board-1', { pos_1: 'BASIC' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('hunt_hunt_board')
    expect(mockUpdate).toHaveBeenCalledWith({ pos_1: 'BASIC' })
    expect(mockEq).toHaveBeenCalledWith('id', 'board-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateHuntHuntBoard('board-1', { pos_1: 'BASIC' })
    ).rejects.toThrow('Error Updating Hunt Board: Update failed')
  })
})

describe('removeHuntHuntBoard', () => {
  it('removes a hunt board successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeHuntHuntBoard('board-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('hunt_hunt_board')
    expect(mockEq).toHaveBeenCalledWith('id', 'board-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeHuntHuntBoard('board-1')).rejects.toThrow(
      'Error Removing Hunt Board: Delete failed'
    )
  })
})
