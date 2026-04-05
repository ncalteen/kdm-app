import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const { getQuarryLevels, addQuarryLevel, updateQuarryLevel, removeQuarryLevel } =
  await import('@/lib/dal/quarry-level')

beforeEach(() => {
  vi.clearAllMocks()
})

const mockLevel = {
  id: 'ql1',
  accuracy: 0,
  accuracy_tokens: 0,
  advanced_cards: [],
  ai_deck_remaining: null,
  basic_cards: [],
  damage: 0,
  damage_tokens: 0,
  evasion: 0,
  evasion_tokens: 0,
  legendary_cards: [],
  level_number: 1,
  luck: 0,
  luck_tokens: 0,
  moods: [],
  movement: 5,
  movement_tokens: 0,
  overtone_cards: [],
  speed: 0,
  speed_tokens: 0,
  strength: 0,
  strength_tokens: 0,
  sub_monster_name: null,
  survivor_statuses: [],
  toughness: 5,
  toughness_tokens: 0,
  traits: []
}

describe('getQuarryLevels', () => {
  it('throws when quarryId is null', async () => {
    await expect(getQuarryLevels(null)).rejects.toThrow('Required: Quarry ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when quarryId is undefined', async () => {
    await expect(getQuarryLevels(undefined)).rejects.toThrow('Required: Quarry ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns merged quarry levels with hunt board positions', async () => {
    const position = { level_number: 1, monster_hunt_pos: 10, survivor_hunt_pos: 3 }

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [mockLevel], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [position], error: null })
        })
      })

    const result = await getQuarryLevels('q1')

    expect(result).toEqual([
      { ...mockLevel, hunt_pos: 10, survivor_hunt_pos: 3 }
    ])
  })

  it('uses default hunt positions when no position data exists for a level', async () => {
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [mockLevel], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })

    const result = await getQuarryLevels('q1')

    expect(result).toEqual([
      { ...mockLevel, hunt_pos: 12, survivor_hunt_pos: 0 }
    ])
  })

  it('returns empty array when no levels exist', async () => {
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })

    const result = await getQuarryLevels('q1')

    expect(result).toEqual([])
  })

  it('throws when levels query fails', async () => {
    // Code throws before reaching the positions query, so only one mock is needed
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
      })
    })

    await expect(getQuarryLevels('q1')).rejects.toThrow('Error Fetching Quarry Levels: DB error')
  })

  it('throws when positions query fails', async () => {
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [mockLevel], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'Pos error' } })
        })
      })

    await expect(getQuarryLevels('q1')).rejects.toThrow(
      'Error Fetching Quarry Hunt Positions: Pos error'
    )
  })
})

describe('addQuarryLevel', () => {
  it('inserts a quarry level and returns its id', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'ql1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addQuarryLevel({ quarry_id: 'q1', level_number: 1 })

    expect(result).toBe('ql1')
    expect(mockSupabase.from).toHaveBeenCalledWith('quarry_level')
    expect(mockInsert).toHaveBeenCalledWith({ quarry_id: 'q1', level_number: 1 })
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(addQuarryLevel({ quarry_id: 'q1', level_number: 1 })).rejects.toThrow(
      'Error Adding Quarry Level: Insert failed'
    )
  })
})

describe('updateQuarryLevel', () => {
  it('updates a quarry level successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateQuarryLevel('ql1', { toughness: 8 })).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('quarry_level')
    expect(mockEq).toHaveBeenCalledWith('id', 'ql1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateQuarryLevel('ql1', { toughness: 8 })).rejects.toThrow(
      'Error Updating Quarry Level: Update failed'
    )
  })
})

describe('removeQuarryLevel', () => {
  it('removes a quarry level successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeQuarryLevel('ql1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('quarry_level')
    expect(mockEq).toHaveBeenCalledWith('id', 'ql1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeQuarryLevel('ql1')).rejects.toThrow('Error Removing Quarry Level: Delete failed')
  })
})
