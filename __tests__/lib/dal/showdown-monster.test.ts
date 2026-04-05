import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getShowdownMonsters,
  addShowdownMonster,
  updateShowdownMonster,
  removeShowdownMonster
} = await import('@/lib/dal/showdown-monster')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getShowdownMonsters', () => {
  it('returns null when showdownId is null', async () => {
    const result = await getShowdownMonsters(null)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when showdownId is undefined', async () => {
    const result = await getShowdownMonsters(undefined)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns a map of showdown monsters with ai_deck', async () => {
    const rawMonster = {
      id: 'monster-1',
      monster_name: 'White Lion',
      showdown_id: 'showdown-1',
      showdown_ai_deck: {
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

    const result = await getShowdownMonsters('showdown-1')

    expect(result).toEqual({
      'monster-1': { ...rawMonster, ai_deck: rawMonster.showdown_ai_deck }
    })
    expect(mockSupabase.from).toHaveBeenCalledWith('showdown_monster')
  })

  it('sets ai_deck to null when showdown_ai_deck is absent', async () => {
    const rawMonster = {
      id: 'monster-1',
      monster_name: 'White Lion',
      showdown_id: 'showdown-1',
      showdown_ai_deck: null
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawMonster], error: null })
      })
    })

    const result = await getShowdownMonsters('showdown-1')

    expect(result!['monster-1'].ai_deck).toBeNull()
  })

  it('returns null when data is null', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    })

    const result = await getShowdownMonsters('showdown-1')

    expect(result).toBeNull()
  })

  it('throws when query fails', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
      })
    })

    await expect(getShowdownMonsters('showdown-1')).rejects.toThrow(
      'Error Fetching Showdown Monsters: DB error'
    )
  })
})

describe('addShowdownMonster', () => {
  it('inserts a showdown monster and returns the id', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'monster-1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addShowdownMonster({ showdown_id: 'showdown-1', monster_name: 'White Lion' })

    expect(result).toBe('monster-1')
    expect(mockSupabase.from).toHaveBeenCalledWith('showdown_monster')
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addShowdownMonster({ showdown_id: 'showdown-1', monster_name: 'White Lion' })
    ).rejects.toThrow('Error Adding Showdown Monster: Insert failed')
  })
})

describe('updateShowdownMonster', () => {
  it('updates a showdown monster successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateShowdownMonster('monster-1', { wounds: 3 })).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('showdown_monster')
    expect(mockUpdate).toHaveBeenCalledWith({ wounds: 3 })
    expect(mockEq).toHaveBeenCalledWith('id', 'monster-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateShowdownMonster('monster-1', { wounds: 3 })).rejects.toThrow(
      'Error Updating Showdown Monster: Update failed'
    )
  })
})

describe('removeShowdownMonster', () => {
  it('removes a showdown monster successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeShowdownMonster('monster-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('showdown_monster')
    expect(mockEq).toHaveBeenCalledWith('id', 'monster-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeShowdownMonster('monster-1')).rejects.toThrow(
      'Error Removing Showdown Monster: Delete failed'
    )
  })
})
