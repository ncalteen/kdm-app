import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const { getHuntAIDecks, addHuntAIDeck, updateHuntAIDeck, removeHuntAIDeck } =
  await import('@/lib/dal/hunt-ai-deck')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getHuntAIDecks', () => {
  it('throws when huntId is null', async () => {
    await expect(getHuntAIDecks(null)).rejects.toThrow('Required: Hunt ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when huntId is undefined', async () => {
    await expect(getHuntAIDecks(undefined)).rejects.toThrow('Required: Hunt ID')
  })

  it('returns a map of hunt AI decks', async () => {
    const deck1 = {
      id: 'deck-1',
      basic_cards: 5,
      advanced_cards: 3,
      legendary_cards: 1,
      overtone_cards: 2
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [deck1], error: null })
      })
    })

    const result = await getHuntAIDecks('hunt-1')

    expect(result).toEqual({ 'deck-1': deck1 })
    expect(mockSupabase.from).toHaveBeenCalledWith('hunt_ai_deck')
  })

  it('returns an empty map when no decks exist', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getHuntAIDecks('hunt-1')

    expect(result).toEqual({})
  })

  it('throws when the query fails', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
      })
    })

    await expect(getHuntAIDecks('hunt-1')).rejects.toThrow(
      'Error Fetching Hunt AI Decks: DB error'
    )
  })
})

describe('addHuntAIDeck', () => {
  const mockDeck = {
    id: 'deck-1',
    basic_cards: 5,
    advanced_cards: 3,
    legendary_cards: 1,
    overtone_cards: 2
  }

  it('inserts a hunt AI deck and returns it', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: mockDeck, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addHuntAIDeck({ hunt_id: 'hunt-1', basic_cards: 5 })

    expect(result).toEqual(mockDeck)
    expect(mockSupabase.from).toHaveBeenCalledWith('hunt_ai_deck')
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(addHuntAIDeck({ hunt_id: 'hunt-1', basic_cards: 5 })).rejects.toThrow(
      'Error Adding Hunt AI Deck: Insert failed'
    )
  })
})

describe('updateHuntAIDeck', () => {
  it('updates a hunt AI deck successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateHuntAIDeck('deck-1', { basic_cards: 10 })).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('hunt_ai_deck')
    expect(mockUpdate).toHaveBeenCalledWith({ basic_cards: 10 })
    expect(mockEq).toHaveBeenCalledWith('id', 'deck-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateHuntAIDeck('deck-1', { basic_cards: 10 })).rejects.toThrow(
      'Error Updating Hunt AI Deck: Update failed'
    )
  })
})

describe('removeHuntAIDeck', () => {
  it('removes a hunt AI deck successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeHuntAIDeck('deck-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('hunt_ai_deck')
    expect(mockEq).toHaveBeenCalledWith('id', 'deck-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeHuntAIDeck('deck-1')).rejects.toThrow(
      'Error Removing Hunt AI Deck: Delete failed'
    )
  })
})
