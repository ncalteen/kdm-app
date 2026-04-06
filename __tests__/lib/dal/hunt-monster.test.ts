import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getHuntMonsters,
  addHuntMonster,
  updateHuntMonster,
  removeHuntMonster
} = await import('@/lib/dal/hunt-monster')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getHuntMonsters', () => {
  it('returns null when huntId is null', async () => {
    const result = await getHuntMonsters(null)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when huntId is undefined', async () => {
    const result = await getHuntMonsters(undefined)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns a map of hunt monsters with ai_deck', async () => {
    const rawMonster = {
      id: 'monster-1',
      monster_name: 'White Lion',
      hunt_id: 'hunt-1',
      hunt_ai_deck: {
        id: 'deck-1',
        basic_cards: 5,
        advanced_cards: 2,
        legendary_cards: 0,
        overtone_cards: 1
      }
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawMonster], error: null })
      })
    })

    const result = await getHuntMonsters('hunt-1')

    expect(result).toEqual({
      'monster-1': { ...rawMonster, ai_deck: rawMonster.hunt_ai_deck }
    })
    expect(mockSupabase.from).toHaveBeenCalledWith('hunt_monster')
  })

  it('sets ai_deck to null when hunt_ai_deck is absent', async () => {
    const rawMonster = {
      id: 'monster-1',
      monster_name: 'White Lion',
      hunt_id: 'hunt-1',
      hunt_ai_deck: null
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawMonster], error: null })
      })
    })

    const result = await getHuntMonsters('hunt-1')

    expect(result!['monster-1'].ai_deck).toBeNull()
  })

  it('returns null when data is null', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    })

    const result = await getHuntMonsters('hunt-1')

    expect(result).toBeNull()
  })

  it('throws when query fails', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'DB error' } })
      })
    })

    await expect(getHuntMonsters('hunt-1')).rejects.toThrow(
      'Error Fetching Hunt Monsters: DB error'
    )
  })
})

describe('addHuntMonster', () => {
  it('inserts a hunt monster and returns the id', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'monster-1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addHuntMonster({
      hunt_id: 'hunt-1',
      monster_name: 'White Lion'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    expect(result).toBe('monster-1')
    expect(mockSupabase.from).toHaveBeenCalledWith('hunt_monster')
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
      addHuntMonster({ hunt_id: 'hunt-1', monster_name: 'White Lion' } as any)
    ).rejects.toThrow('Error Adding Hunt Monster: Insert failed')
  })
})

describe('updateHuntMonster', () => {
  it('updates a hunt monster successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateHuntMonster('monster-1', { wounds: 3 })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('hunt_monster')
    expect(mockUpdate).toHaveBeenCalledWith({ wounds: 3 })
    expect(mockEq).toHaveBeenCalledWith('id', 'monster-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateHuntMonster('monster-1', { wounds: 3 })).rejects.toThrow(
      'Error Updating Hunt Monster: Update failed'
    )
  })
})

describe('removeHuntMonster', () => {
  it('removes a hunt monster successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeHuntMonster('monster-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('hunt_monster')
    expect(mockEq).toHaveBeenCalledWith('id', 'monster-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeHuntMonster('monster-1')).rejects.toThrow(
      'Error Removing Hunt Monster: Delete failed'
    )
  })
})
