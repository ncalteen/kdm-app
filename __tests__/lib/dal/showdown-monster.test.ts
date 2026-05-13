import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn()
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
  // Default: no settlement members map (resolved authors will be null).
  mockSupabase.rpc.mockResolvedValue({ data: [], error: null })
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
      'monster-1': {
        ...rawMonster,
        ai_deck: rawMonster.showdown_ai_deck,
        traits: [],
        moods: [],
        survivor_statuses: []
      }
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
        eq: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'DB error' } })
      })
    })

    await expect(getShowdownMonsters('showdown-1')).rejects.toThrow(
      'Error Fetching Showdown Monsters: DB error'
    )
  })

  it('resolves author_username for custom trait/mood/survivor_status rows authored by a settlement member', async () => {
    const rawMonster = {
      id: 'monster-1',
      monster_name: 'White Lion',
      showdown_id: 'showdown-1',
      settlement_id: 'settlement-1',
      showdown_ai_deck: null,
      showdown_monster_trait: [
        {
          trait: {
            id: 't-1',
            custom: true,
            user_id: 'author-1',
            trait_name: 'Hollow Roar',
            rules: null
          }
        },
        {
          trait: {
            id: 't-2',
            custom: false,
            user_id: null,
            trait_name: 'Standard',
            rules: null
          }
        }
      ],
      showdown_monster_mood: [
        {
          mood: {
            id: 'm-1',
            custom: true,
            user_id: 'ghost-1',
            mood_name: 'Forsaken',
            rules: null
          }
        }
      ],
      showdown_monster_survivor_status: [
        {
          survivor_status: {
            id: 's-1',
            custom: true,
            user_id: 'author-1',
            survivor_status_name: 'Marked',
            rules: null
          }
        }
      ]
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawMonster], error: null })
      })
    })
    mockSupabase.rpc.mockResolvedValue({
      data: [
        {
          user_id: 'author-1',
          username: 'ashen.veil',
          avatar_url: 'https://a/ashen.png'
        }
      ],
      error: null
    })

    const result = await getShowdownMonsters('showdown-1')

    expect(result!['monster-1'].traits).toEqual([
      {
        id: 't-1',
        custom: true,
        trait_name: 'Hollow Roar',
        rules: null,
        author_user_id: 'author-1',
        author_username: 'ashen.veil',
        author_avatar_url: 'https://a/ashen.png'
      },
      {
        id: 't-2',
        custom: false,
        trait_name: 'Standard',
        rules: null,
        author_user_id: null,
        author_username: null,
        author_avatar_url: null
      }
    ])
    // Ghost author (member left settlement) resolves to null username but
    // retains the author_user_id.
    expect(result!['monster-1'].moods[0].author_username).toBeNull()
    expect(result!['monster-1'].moods[0].author_user_id).toBe('ghost-1')
    expect(result!['monster-1'].moods[0].author_avatar_url).toBeNull()
    expect(result!['monster-1'].survivor_statuses[0].author_username).toBe(
      'ashen.veil'
    )
    expect(result!['monster-1'].survivor_statuses[0].author_user_id).toBe(
      'author-1'
    )
    expect(result!['monster-1'].survivor_statuses[0].author_avatar_url).toBe(
      'https://a/ashen.png'
    )
    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'get_settlement_member_usernames',
      { target_settlement: 'settlement-1' }
    )
  })

  it('skips the member-username RPC when no monsters exist', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getShowdownMonsters('showdown-1')

    expect(result).toEqual({})
    expect(mockSupabase.rpc).not.toHaveBeenCalled()
  })

  it('uses the prefetched member-username promise instead of issuing a duplicate RPC', async () => {
    const rawMonster = {
      id: 'monster-1',
      monster_name: 'White Lion',
      showdown_id: 'showdown-1',
      settlement_id: 'settlement-1',
      showdown_ai_deck: null,
      showdown_monster_trait: [
        {
          trait: {
            id: 't-1',
            custom: true,
            user_id: 'author-1',
            trait_name: 'Hollow Roar',
            rules: null
          }
        }
      ],
      showdown_monster_mood: [],
      showdown_monster_survivor_status: []
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawMonster], error: null })
      })
    })

    const prefetched = Promise.resolve(
      new Map<string, { username: string; avatar_url: string | null }>([
        [
          'author-1',
          { username: 'prefetched.user', avatar_url: 'https://a/p.png' }
        ]
      ])
    )

    const result = await getShowdownMonsters('showdown-1', prefetched)

    expect(result!['monster-1'].traits[0].author_username).toBe(
      'prefetched.user'
    )
    expect(result!['monster-1'].traits[0].author_avatar_url).toBe(
      'https://a/p.png'
    )
    expect(mockSupabase.rpc).not.toHaveBeenCalled()
  })
})

describe('addShowdownMonster', () => {
  it('inserts a showdown monster and returns the id', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'monster-1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addShowdownMonster({
      showdown_id: 'showdown-1',
      monster_name: 'White Lion'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    expect(result).toBe('monster-1')
    expect(mockSupabase.from).toHaveBeenCalledWith('showdown_monster')
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addShowdownMonster({
        showdown_id: 'showdown-1',
        monster_name: 'White Lion'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    ).rejects.toThrow('Error Adding Showdown Monster: Insert failed')
  })
})

describe('updateShowdownMonster', () => {
  it('updates a showdown monster successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateShowdownMonster('monster-1', { wounds: 3 })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('showdown_monster')
    expect(mockUpdate).toHaveBeenCalledWith({ wounds: 3 })
    expect(mockEq).toHaveBeenCalledWith('id', 'monster-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateShowdownMonster('monster-1', { wounds: 3 })
    ).rejects.toThrow('Error Updating Showdown Monster: Update failed')
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
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeShowdownMonster('monster-1')).rejects.toThrow(
      'Error Removing Showdown Monster: Delete failed'
    )
  })
})
