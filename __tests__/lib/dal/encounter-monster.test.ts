import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

vi.mock('@/lib/dal/user', () => ({
  getUserId: vi.fn(),
  getUserIdOrNull: vi.fn()
}))

const {
  getEncounterMonsters,
  getUserCustomEncounterMonsters,
  getEncounterMonster,
  addEncounterMonster,
  updateEncounterMonster,
  removeEncounterMonster,
  addEncounterMonsterLevel,
  updateEncounterMonsterLevel,
  removeEncounterMonsterLevel
} = await import('@/lib/dal/encounter-monster')
const { getUserId, getUserIdOrNull } = await import('@/lib/dal/user')

beforeEach(() => {
  vi.resetAllMocks()
})

const mockLevel = (overrides = {}) => ({
  id: 'level-1',
  accuracy: 0,
  damage: 1,
  encounter_monster_id: 'encounter-monster-1',
  evasion: 0,
  level_number: 1,
  life: 6,
  luck: 0,
  movement: 5,
  speed: 1,
  sub_monster_name: null,
  toughness: 6,
  encounter_monster_level_trait: [],
  encounter_monster_level_mood: [],
  ...overrides
})

const mockMonster = (overrides = {}) => ({
  id: 'encounter-monster-1',
  archived_at: null,
  basic_action: 'Gnaw',
  custom: false,
  instinct: 'Bury the light.',
  monster_name: 'Lantern Leech',
  user_id: null,
  encounter_monster_level: [],
  ...overrides
})

const mockEncounterMonsterSelect = (
  data: object[] | null,
  error: object | null = null
) => {
  mockSupabase.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data, error })
    })
  })
}

describe('getEncounterMonsters', () => {
  it('maps catalog monsters with sorted levels, traits, and moods', async () => {
    const levelTwo = mockLevel({
      id: 'level-2',
      level_number: 2,
      encounter_monster_level_trait: [{ trait: null }],
      encounter_monster_level_mood: [
        {
          mood: {
            id: 'mood-1',
            custom: false,
            mood_name: 'Aloof',
            rules: null
          }
        }
      ]
    })
    const levelOne = mockLevel({
      id: 'level-1',
      level_number: 1,
      encounter_monster_level_trait: [
        {
          trait: {
            id: 'trait-1',
            custom: true,
            trait_name: 'Lamprey Hide',
            rules: 'Ignore the first wound.'
          }
        }
      ],
      encounter_monster_level_mood: [{ mood: null }]
    })
    mockEncounterMonsterSelect([
      mockMonster({ encounter_monster_level: [levelTwo, levelOne] })
    ])

    const result = await getEncounterMonsters()

    expect(result).toHaveLength(1)
    expect(result[0].levels.map((level) => level.level_number)).toEqual([1, 2])
    expect(result[0].levels[0]).toEqual(
      expect.objectContaining({
        id: 'level-1',
        traits: [
          {
            id: 'trait-1',
            custom: true,
            trait_name: 'Lamprey Hide',
            rules: 'Ignore the first wound.'
          }
        ],
        moods: []
      })
    )
    expect(result[0].levels[1]).toEqual(
      expect.objectContaining({
        id: 'level-2',
        traits: [],
        moods: [
          {
            id: 'mood-1',
            custom: false,
            mood_name: 'Aloof',
            rules: null
          }
        ]
      })
    )
    expect(mockSupabase.from).toHaveBeenCalledWith('encounter_monster')
  })

  it('returns an empty array when data is null', async () => {
    mockEncounterMonsterSelect(null)

    const result = await getEncounterMonsters()

    expect(result).toEqual([])
  })

  it('throws when query fails', async () => {
    mockEncounterMonsterSelect(null, { message: 'DB error' })

    await expect(getEncounterMonsters()).rejects.toThrow(
      'Error Fetching Encounter Monsters: DB error'
    )
  })
})

describe('getUserCustomEncounterMonsters', () => {
  it('returns only unarchived custom encounter monsters for the current user', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')
    mockEncounterMonsterSelect([
      mockMonster({ id: 'built-in', custom: false, user_id: null }),
      mockMonster({ id: 'user-custom', custom: true, user_id: 'user-1' }),
      mockMonster({ id: 'other-custom', custom: true, user_id: 'user-2' }),
      mockMonster({
        id: 'archived-custom',
        archived_at: '2026-05-26T00:00:00.000Z',
        custom: true,
        user_id: 'user-1'
      })
    ])

    const result = await getUserCustomEncounterMonsters()

    expect(Object.keys(result)).toEqual(['user-custom'])
  })
})

describe('getEncounterMonster', () => {
  it('returns null when encounterMonsterId is null', async () => {
    const result = await getEncounterMonster(null)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when encounterMonsterId is undefined', async () => {
    const result = await getEncounterMonster(undefined)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns the requested encounter monster when found', async () => {
    mockEncounterMonsterSelect([
      mockMonster({ id: 'encounter-monster-1' }),
      mockMonster({ id: 'encounter-monster-2' })
    ])

    const result = await getEncounterMonster('encounter-monster-2')

    expect(result?.id).toBe('encounter-monster-2')
  })

  it('returns null when the requested encounter monster is not found', async () => {
    mockEncounterMonsterSelect([mockMonster({ id: 'encounter-monster-1' })])

    const result = await getEncounterMonster('missing-monster')

    expect(result).toBeNull()
  })
})

describe('addEncounterMonster', () => {
  it('inserts a custom encounter monster for the current user', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue('user-1')
    const insertedMonster = {
      id: 'encounter-monster-1',
      archived_at: null,
      basic_action: 'Gnaw',
      custom: true,
      instinct: 'Bury the light.',
      monster_name: 'Lantern Leech',
      updated_at: '2026-05-26T00:00:00.000Z',
      user_id: 'user-1'
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: insertedMonster, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addEncounterMonster({
      basic_action: 'Gnaw',
      custom: true,
      instinct: 'Bury the light.',
      monster_name: 'Lantern Leech'
    })

    expect(result).toEqual({ ...insertedMonster, levels: [] })
    expect(mockInsert).toHaveBeenCalledWith({
      basic_action: 'Gnaw',
      custom: true,
      instinct: 'Bury the light.',
      monster_name: 'Lantern Leech',
      user_id: 'user-1'
    })
  })

  it('inserts a non-custom encounter monster without a user id', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(null)
    const insertedMonster = {
      id: 'encounter-monster-1',
      archived_at: null,
      basic_action: null,
      custom: false,
      instinct: null,
      monster_name: 'Bone Eater',
      updated_at: '2026-05-26T00:00:00.000Z',
      user_id: null
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: insertedMonster, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addEncounterMonster({
      custom: false,
      monster_name: 'Bone Eater'
    })

    expect(result).toEqual({ ...insertedMonster, levels: [] })
    expect(mockInsert).toHaveBeenCalledWith({
      custom: false,
      monster_name: 'Bone Eater'
    })
  })

  it('throws when adding a custom encounter monster anonymously', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(null)

    await expect(
      addEncounterMonster({ custom: true, monster_name: 'Nameless Thing' })
    ).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when insert fails', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue('user-1')
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addEncounterMonster({ custom: true, monster_name: 'Lantern Leech' })
    ).rejects.toThrow('Error Adding Encounter Monster: Insert failed')
  })
})

describe('updateEncounterMonster', () => {
  it('updates an encounter monster successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateEncounterMonster('encounter-monster-1', {
        monster_name: 'New Name'
      })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('encounter_monster')
    expect(mockUpdate).toHaveBeenCalledWith({ monster_name: 'New Name' })
    expect(mockEq).toHaveBeenCalledWith('id', 'encounter-monster-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateEncounterMonster('encounter-monster-1', {
        monster_name: 'New Name'
      })
    ).rejects.toThrow('Error Updating Encounter Monster: Update failed')
  })
})

describe('removeEncounterMonster', () => {
  it('removes an encounter monster successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(
      removeEncounterMonster('encounter-monster-1')
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('encounter_monster')
    expect(mockEq).toHaveBeenCalledWith('id', 'encounter-monster-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeEncounterMonster('encounter-monster-1')).rejects.toThrow(
      'Error Removing Encounter Monster: Delete failed'
    )
  })
})

describe('addEncounterMonsterLevel', () => {
  it('inserts an encounter monster level and returns the id', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'level-1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addEncounterMonsterLevel({
      encounter_monster_id: 'encounter-monster-1',
      level_number: 1,
      life: 6
    })

    expect(result).toBe('level-1')
    expect(mockSupabase.from).toHaveBeenCalledWith('encounter_monster_level')
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addEncounterMonsterLevel({
        encounter_monster_id: 'encounter-monster-1',
        level_number: 1,
        life: 6
      })
    ).rejects.toThrow('Error Adding Encounter Monster Level: Insert failed')
  })
})

describe('updateEncounterMonsterLevel', () => {
  it('updates an encounter monster level successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateEncounterMonsterLevel('level-1', { life: 7 })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('encounter_monster_level')
    expect(mockUpdate).toHaveBeenCalledWith({ life: 7 })
    expect(mockEq).toHaveBeenCalledWith('id', 'level-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateEncounterMonsterLevel('level-1', { life: 7 })
    ).rejects.toThrow('Error Updating Encounter Monster Level: Update failed')
  })
})

describe('removeEncounterMonsterLevel', () => {
  it('removes an encounter monster level successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(
      removeEncounterMonsterLevel('level-1')
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('encounter_monster_level')
    expect(mockEq).toHaveBeenCalledWith('id', 'level-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeEncounterMonsterLevel('level-1')).rejects.toThrow(
      'Error Removing Encounter Monster Level: Delete failed'
    )
  })
})
