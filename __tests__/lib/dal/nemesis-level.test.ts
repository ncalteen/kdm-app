import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const { getNemesisLevels, addNemesisLevel, updateNemesisLevel, removeNemesisLevel } =
  await import('@/lib/dal/nemesis-level')

beforeEach(() => {
  vi.clearAllMocks()
})

const mockLevel = {
  id: 'nl1',
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
  life: 10,
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

describe('getNemesisLevels', () => {
  it('throws when nemesisId is null', async () => {
    await expect(getNemesisLevels(null)).rejects.toThrow('Required: Nemesis ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when nemesisId is undefined', async () => {
    await expect(getNemesisLevels(undefined)).rejects.toThrow('Required: Nemesis ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns nemesis levels for a valid id', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: [mockLevel], error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getNemesisLevels('n1')

    expect(result).toEqual([mockLevel])
    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis_level')
    expect(mockEq).toHaveBeenCalledWith('nemesis_id', 'n1')
  })

  it('returns empty array when no levels exist', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getNemesisLevels('n1')

    expect(result).toEqual([])
  })

  it('throws when query fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getNemesisLevels('n1')).rejects.toThrow('Error Fetching Nemesis Levels: DB error')
  })
})

describe('addNemesisLevel', () => {
  it('inserts a nemesis level and returns its id', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'nl1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addNemesisLevel({ nemesis_id: 'n1', level_number: 1, life: 10 })

    expect(result).toBe('nl1')
    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis_level')
    expect(mockInsert).toHaveBeenCalledWith({ nemesis_id: 'n1', level_number: 1, life: 10 })
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(addNemesisLevel({ nemesis_id: 'n1', level_number: 1, life: 10 })).rejects.toThrow(
      'Error Adding Nemesis Level: Insert failed'
    )
  })
})

describe('updateNemesisLevel', () => {
  it('updates a nemesis level successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateNemesisLevel('nl1', { life: 15 })).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis_level')
    expect(mockUpdate).toHaveBeenCalledWith({ life: 15 })
    expect(mockEq).toHaveBeenCalledWith('id', 'nl1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateNemesisLevel('nl1', { life: 15 })).rejects.toThrow(
      'Error Updating Nemesis Level: Update failed'
    )
  })
})

describe('removeNemesisLevel', () => {
  it('removes a nemesis level successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeNemesisLevel('nl1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis_level')
    expect(mockEq).toHaveBeenCalledWith('id', 'nl1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeNemesisLevel('nl1')).rejects.toThrow(
      'Error Removing Nemesis Level: Delete failed'
    )
  })
})
