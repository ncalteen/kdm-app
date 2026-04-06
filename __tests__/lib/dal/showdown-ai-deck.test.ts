import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getShowdownAIDecks,
  addShowdownAIDeck,
  updateShowdownAIDeck,
  removeShowdownAIDeck
} = await import('@/lib/dal/showdown-ai-deck')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getShowdownAIDecks', () => {
  it('throws when showdownId is null', async () => {
    await expect(getShowdownAIDecks(null)).rejects.toThrow(
      'Required: Showdown ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when showdownId is undefined', async () => {
    await expect(getShowdownAIDecks(undefined)).rejects.toThrow(
      'Required: Showdown ID'
    )
  })

  it('returns a map of showdown AI decks', async () => {
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

    const result = await getShowdownAIDecks('showdown-1')

    expect(result).toEqual({ 'deck-1': deck1 })
    expect(mockSupabase.from).toHaveBeenCalledWith('showdown_ai_deck')
  })

  it('returns an empty map when no decks exist', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getShowdownAIDecks('showdown-1')

    expect(result).toEqual({})
  })

  it('throws when query fails', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'DB error' } })
      })
    })

    await expect(getShowdownAIDecks('showdown-1')).rejects.toThrow(
      'Error Fetching Showdown AI Decks: DB error'
    )
  })
})

describe('addShowdownAIDeck', () => {
  it('inserts a showdown AI deck and returns it', async () => {
    const mockDeck = {
      id: 'deck-1',
      basic_cards: 5,
      advanced_cards: 2,
      legendary_cards: 0,
      overtone_cards: 1
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockDeck, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addShowdownAIDeck({
      showdown_id: 'showdown-1',
      basic_cards: 5
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    expect(result).toEqual(mockDeck)
    expect(mockSupabase.from).toHaveBeenCalledWith('showdown_ai_deck')
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
      addShowdownAIDeck({ showdown_id: 'showdown-1', basic_cards: 5 } as any)
    ).rejects.toThrow('Error Adding Showdown AI Deck: Insert failed')
  })
})

describe('updateShowdownAIDeck', () => {
  it('updates a showdown AI deck successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateShowdownAIDeck('deck-1', { basic_cards: 10 })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('showdown_ai_deck')
    expect(mockUpdate).toHaveBeenCalledWith({ basic_cards: 10 })
    expect(mockEq).toHaveBeenCalledWith('id', 'deck-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateShowdownAIDeck('deck-1', { basic_cards: 10 })
    ).rejects.toThrow('Error Updating Showdown AI Deck: Update failed')
  })
})

describe('removeShowdownAIDeck', () => {
  it('removes a showdown AI deck successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeShowdownAIDeck('deck-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('showdown_ai_deck')
    expect(mockEq).toHaveBeenCalledWith('id', 'deck-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeShowdownAIDeck('deck-1')).rejects.toThrow(
      'Error Removing Showdown AI Deck: Delete failed'
    )
  })
})
