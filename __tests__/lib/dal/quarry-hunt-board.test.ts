import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HuntEventType } from '@/lib/enums'

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getQuarryHuntBoard,
  addQuarryHuntBoard,
  updateQuarryHuntBoard,
  removeQuarryHuntBoard
} = await import('@/lib/dal/quarry-hunt-board')

beforeEach(() => {
  vi.clearAllMocks()
})

const mockHuntBoard = {
  id: 'hb1',
  quarry_id: 'q1',
  pos_1: HuntEventType.BASIC,
  pos_2: HuntEventType.BASIC,
  pos_3: HuntEventType.BASIC,
  pos_4: HuntEventType.MONSTER,
  pos_5: HuntEventType.BASIC,
  pos_7: HuntEventType.BASIC,
  pos_8: HuntEventType.BASIC,
  pos_9: HuntEventType.BASIC,
  pos_10: HuntEventType.BASIC,
  pos_11: HuntEventType.MONSTER
}

describe('getQuarryHuntBoard', () => {
  it('throws when quarryId is null', async () => {
    await expect(getQuarryHuntBoard(null)).rejects.toThrow(
      'Required: Quarry ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when quarryId is undefined', async () => {
    await expect(getQuarryHuntBoard(undefined)).rejects.toThrow(
      'Required: Quarry ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns hunt board for a valid quarry', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockHuntBoard, error: null })
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getQuarryHuntBoard('q1')

    expect(result).toEqual(mockHuntBoard)
    expect(mockSupabase.from).toHaveBeenCalledWith('quarry_hunt_board')
    expect(mockEq).toHaveBeenCalledWith('quarry_id', 'q1')
  })

  it('throws when query fails', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getQuarryHuntBoard('q1')).rejects.toThrow(
      'Error Fetching Quarry Hunt Board: DB error'
    )
  })
})

describe('addQuarryHuntBoard', () => {
  it('inserts a quarry hunt board and returns its id', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'hb1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const huntBoardData = {
      quarry_id: 'q1',
      pos_1: HuntEventType.BASIC,
      pos_2: HuntEventType.BASIC,
      pos_3: HuntEventType.BASIC,
      pos_4: HuntEventType.MONSTER,
      pos_5: HuntEventType.BASIC,
      pos_7: HuntEventType.BASIC,
      pos_8: HuntEventType.BASIC,
      pos_9: HuntEventType.BASIC,
      pos_10: HuntEventType.BASIC,
      pos_11: HuntEventType.MONSTER
    }

    const result = await addQuarryHuntBoard(huntBoardData)

    expect(result).toBe('hb1')
    expect(mockSupabase.from).toHaveBeenCalledWith('quarry_hunt_board')
    expect(mockInsert).toHaveBeenCalledWith(huntBoardData)
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addQuarryHuntBoard({
        quarry_id: 'q1',
        pos_1: HuntEventType.BASIC,
        pos_2: HuntEventType.BASIC,
        pos_3: HuntEventType.BASIC,
        pos_4: HuntEventType.MONSTER,
        pos_5: HuntEventType.BASIC,
        pos_7: HuntEventType.BASIC,
        pos_8: HuntEventType.BASIC,
        pos_9: HuntEventType.BASIC,
        pos_10: HuntEventType.BASIC,
        pos_11: HuntEventType.MONSTER
      })
    ).rejects.toThrow('Error Adding Quarry Hunt Board: Insert failed')
  })
})

describe('updateQuarryHuntBoard', () => {
  it('updates a quarry hunt board successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateQuarryHuntBoard('hb1', { pos_4: HuntEventType.SCOUT })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('quarry_hunt_board')
    expect(mockEq).toHaveBeenCalledWith('id', 'hb1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateQuarryHuntBoard('hb1', { pos_4: HuntEventType.SCOUT })
    ).rejects.toThrow('Error Updating Quarry Hunt Board: Update failed')
  })
})

describe('removeQuarryHuntBoard', () => {
  it('removes a quarry hunt board successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeQuarryHuntBoard('hb1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('quarry_hunt_board')
    expect(mockEq).toHaveBeenCalledWith('id', 'hb1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeQuarryHuntBoard('hb1')).rejects.toThrow(
      'Error Removing Quarry Hunt Board: Delete failed'
    )
  })
})
