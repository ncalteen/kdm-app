import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

vi.mock('@/lib/dal/user', () => ({
  getUserId: vi.fn()
}))

const {
  getEncounterActiveMonsters,
  addEncounterActiveMonster,
  updateEncounterActiveMonster,
  removeEncounterActiveMonster
} = await import('@/lib/dal/encounter-active-monster')
const { getUserId } = await import('@/lib/dal/user')

beforeEach(() => {
  vi.resetAllMocks()
})

const makeActiveMonster = (overrides = {}) => ({
  id: 'encounter-monster-1',
  encounter_id: 'encounter-1',
  monster_name: 'Lantern Leech',
  settlement_id: 'settlement-1',
  moods: [],
  survivor_statuses: [],
  traits: [],
  ...overrides
})

describe('getEncounterActiveMonsters', () => {
  const userId = 'user-1'

  it('returns null when encounterId is null', async () => {
    const result = await getEncounterActiveMonsters(null)

    expect(result).toBeNull()
    expect(getUserId).not.toHaveBeenCalled()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when encounterId is undefined', async () => {
    const result = await getEncounterActiveMonsters(undefined)

    expect(result).toBeNull()
    expect(getUserId).not.toHaveBeenCalled()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns active encounter monsters by id with nested junction rows', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    const activeMonster = makeActiveMonster({
      moods: [
        {
          id: 'monster-mood-1',
          encounter_active_monster_id: 'encounter-monster-1',
          settlement_id: 'settlement-1',
          mood_id: 'mood-1',
          mood: {
            id: 'mood-1',
            custom: true,
            user_id: 'author-1',
            mood_name: 'Hungry Dark',
            rules: null
          }
        }
      ],
      survivor_statuses: [
        {
          id: 'monster-status-1',
          encounter_active_monster_id: 'encounter-monster-1',
          settlement_id: 'settlement-1',
          survivor_status_id: 'status-1',
          survivor_status: {
            id: 'status-1',
            custom: true,
            user_id: 'author-1',
            survivor_status_name: 'Marked by Gloom',
            rules: 'Cannot spend survival.'
          }
        }
      ],
      traits: [
        {
          id: 'monster-trait-1',
          encounter_active_monster_id: 'encounter-monster-1',
          settlement_id: 'settlement-1',
          trait_id: 'trait-1',
          trait: {
            id: 'trait-1',
            custom: true,
            user_id: 'author-1',
            trait_name: 'Lamprey Hide',
            rules: 'Ignore the first wound.'
          }
        }
      ]
    })
    const eq = vi.fn().mockResolvedValue({ data: [activeMonster], error: null })
    const select = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ select })

    const result = await getEncounterActiveMonsters('encounter-1')

    expect(result).toMatchObject({
      'encounter-monster-1': {
        id: activeMonster.id,
        monster_name: activeMonster.monster_name,
        moods: [
          {
            id: 'mood-1',
            mood_name: 'Hungry Dark',
            author_user_id: 'author-1'
          }
        ],
        survivor_statuses: [
          {
            id: 'status-1',
            survivor_status_name: 'Marked by Gloom',
            author_user_id: 'author-1'
          }
        ],
        traits: [
          {
            id: 'trait-1',
            trait_name: 'Lamprey Hide',
            author_user_id: 'author-1'
          }
        ]
      }
    })
    expect(getUserId).toHaveBeenCalled()
    expect(mockSupabase.from).toHaveBeenCalledWith('encounter_active_monster')
    expect(select).toHaveBeenCalledWith(expect.stringContaining('traits:'))
    expect(eq).toHaveBeenCalledWith('encounter_id', 'encounter-1')
  })

  it('throws when user is not authenticated', async () => {
    vi.mocked(getUserId).mockRejectedValue(new Error('Not Authenticated'))

    await expect(getEncounterActiveMonsters('encounter-1')).rejects.toThrow(
      'Not Authenticated'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when data is null', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    })

    const result = await getEncounterActiveMonsters('encounter-1')

    expect(result).toBeNull()
  })

  it('returns an empty map when no monsters are found', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getEncounterActiveMonsters('encounter-1')

    expect(result).toEqual({})
  })

  it('throws when query fails', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'DB error' } })
      })
    })

    await expect(getEncounterActiveMonsters('encounter-1')).rejects.toThrow(
      'Error Fetching Encounter Monsters: DB error'
    )
  })
})

describe('addEncounterActiveMonster', () => {
  it('inserts an active encounter monster and returns the inserted detail', async () => {
    const activeMonster = makeActiveMonster()
    const single = vi
      .fn()
      .mockResolvedValue({ data: activeMonster, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    mockSupabase.from.mockReturnValue({ insert })

    const result = await addEncounterActiveMonster({
      encounter_id: 'encounter-1',
      monster_name: 'Lantern Leech',
      settlement_id: 'settlement-1'
    })

    expect(result).toEqual(activeMonster)
    expect(mockSupabase.from).toHaveBeenCalledWith('encounter_active_monster')
    expect(insert).toHaveBeenCalledWith({
      encounter_id: 'encounter-1',
      monster_name: 'Lantern Leech',
      settlement_id: 'settlement-1'
    })
    expect(select).toHaveBeenCalledWith(expect.stringContaining('traits:'))
  })

  it('throws when insert fails', async () => {
    const single = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    mockSupabase.from.mockReturnValue({ insert })

    await expect(
      addEncounterActiveMonster({
        encounter_id: 'encounter-1',
        monster_name: 'Lantern Leech',
        settlement_id: 'settlement-1'
      })
    ).rejects.toThrow('Error Adding Encounter Monster: Insert failed')
  })
})

describe('updateEncounterActiveMonster', () => {
  it('updates an active encounter monster successfully', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ update })

    await expect(
      updateEncounterActiveMonster('encounter-monster-1', { life: 7 })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('encounter_active_monster')
    expect(update).toHaveBeenCalledWith({ life: 7 })
    expect(eq).toHaveBeenCalledWith('id', 'encounter-monster-1')
  })

  it('throws when update fails', async () => {
    const eq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const update = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ update })

    await expect(
      updateEncounterActiveMonster('encounter-monster-1', { life: 7 })
    ).rejects.toThrow('Error Updating Encounter Monster: Update failed')
  })
})

describe('removeEncounterActiveMonster', () => {
  it('removes an active encounter monster successfully', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const remove = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ delete: remove })

    await expect(
      removeEncounterActiveMonster('encounter-monster-1')
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('encounter_active_monster')
    expect(eq).toHaveBeenCalledWith('id', 'encounter-monster-1')
  })

  it('throws when delete fails', async () => {
    const eq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const remove = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ delete: remove })

    await expect(
      removeEncounterActiveMonster('encounter-monster-1')
    ).rejects.toThrow('Error Removing Encounter Monster: Delete failed')
  })
})
