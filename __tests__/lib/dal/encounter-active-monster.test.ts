import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

vi.mock('@/lib/dal/settlement-shared-user', () => ({
  getSettlementMemberUsernames: vi.fn(),
  resolveSettlementAuthorship: (
    row: { custom: boolean; user_id: string | null } | null | undefined,
    memberProfiles: Map<string, { username: string; avatar_url: string | null }>
  ) => {
    if (!row || !row.custom || !row.user_id) {
      return {
        author_avatar_url: null,
        author_user_id: null,
        author_username: null
      }
    }

    const profile = memberProfiles.get(row.user_id) ?? null
    return {
      author_avatar_url: profile?.avatar_url ?? null,
      author_user_id: row.user_id,
      author_username: profile?.username ?? null
    }
  }
}))

const {
  getEncounterActiveMonsters,
  addEncounterActiveMonster,
  updateEncounterActiveMonster,
  removeEncounterActiveMonster
} = await import('@/lib/dal/encounter-active-monster')
const { getSettlementMemberUsernames } =
  await import('@/lib/dal/settlement-shared-user')

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getSettlementMemberUsernames).mockResolvedValue(new Map())
})

const makeRawMonster = (overrides = {}) => ({
  id: 'encounter-monster-1',
  encounter_id: 'encounter-1',
  monster_name: 'Lantern Leech',
  settlement_id: 'settlement-1',
  encounter_active_monster_trait: [],
  encounter_active_monster_mood: [],
  ...overrides
})

describe('getEncounterActiveMonsters', () => {
  it('returns null when encounterId is null', async () => {
    const result = await getEncounterActiveMonsters(null)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when encounterId is undefined', async () => {
    const result = await getEncounterActiveMonsters(undefined)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns active encounter monsters with resolved trait and mood authors', async () => {
    const rawMonster = makeRawMonster({
      encounter_active_monster_trait: [
        {
          trait: {
            id: 'trait-1',
            custom: true,
            user_id: 'author-1',
            trait_name: 'Lamprey Hide',
            rules: 'Ignore the first wound.'
          }
        },
        {
          trait: {
            id: 'trait-2',
            custom: false,
            user_id: null,
            trait_name: 'Built In',
            rules: null
          }
        },
        { trait: null }
      ],
      encounter_active_monster_mood: [
        {
          mood: {
            id: 'mood-1',
            custom: true,
            user_id: 'ghost-1',
            mood_name: 'Hungry Dark',
            rules: null
          }
        },
        { mood: null }
      ]
    })
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawMonster], error: null })
      })
    })

    const memberProfiles = Promise.resolve(
      new Map([
        [
          'author-1',
          { username: 'ashen.veil', avatar_url: 'https://a/ashen.png' }
        ]
      ])
    )

    const result = await getEncounterActiveMonsters(
      'encounter-1',
      memberProfiles
    )

    expect(result!['encounter-monster-1']).toEqual(
      expect.objectContaining({
        traits: [
          {
            id: 'trait-1',
            custom: true,
            trait_name: 'Lamprey Hide',
            rules: 'Ignore the first wound.',
            author_avatar_url: 'https://a/ashen.png',
            author_user_id: 'author-1',
            author_username: 'ashen.veil'
          },
          {
            id: 'trait-2',
            custom: false,
            trait_name: 'Built In',
            rules: null,
            author_avatar_url: null,
            author_user_id: null,
            author_username: null
          }
        ],
        moods: [
          {
            id: 'mood-1',
            custom: true,
            mood_name: 'Hungry Dark',
            rules: null,
            author_avatar_url: null,
            author_user_id: 'ghost-1',
            author_username: null
          }
        ],
        survivor_statuses: []
      })
    )
    expect(getSettlementMemberUsernames).not.toHaveBeenCalled()
  })

  it('fetches settlement member profiles when they are not prefetched', async () => {
    const rawMonster = makeRawMonster({
      encounter_active_monster_trait: [
        {
          trait: {
            id: 'trait-1',
            custom: true,
            user_id: 'author-1',
            trait_name: 'Bitter Light',
            rules: null
          }
        }
      ]
    })
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawMonster], error: null })
      })
    })
    vi.mocked(getSettlementMemberUsernames).mockResolvedValue(
      new Map([
        [
          'author-1',
          { username: 'lantern.tender', avatar_url: 'https://a/lamp.png' }
        ]
      ])
    )

    const result = await getEncounterActiveMonsters('encounter-1')

    expect(result!['encounter-monster-1'].traits[0].author_username).toBe(
      'lantern.tender'
    )
    expect(getSettlementMemberUsernames).toHaveBeenCalledWith('settlement-1')
  })

  it('uses an empty author map when settlement id is unavailable', async () => {
    const rawMonster = makeRawMonster({ settlement_id: null })
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawMonster], error: null })
      })
    })

    const result = await getEncounterActiveMonsters('encounter-1')

    expect(result).toEqual({
      'encounter-monster-1': expect.objectContaining({
        traits: [],
        moods: [],
        survivor_statuses: []
      })
    })
    expect(getSettlementMemberUsernames).not.toHaveBeenCalled()
  })

  it('returns null when data is null', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    })

    const result = await getEncounterActiveMonsters('encounter-1')

    expect(result).toBeNull()
  })

  it('returns an empty map without member lookup when no monsters are found', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getEncounterActiveMonsters('encounter-1')

    expect(result).toEqual({})
    expect(getSettlementMemberUsernames).not.toHaveBeenCalled()
  })

  it('throws when query fails', async () => {
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
  it('inserts an active encounter monster and returns the id', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'encounter-monster-1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addEncounterActiveMonster({
      encounter_id: 'encounter-1',
      monster_name: 'Lantern Leech',
      settlement_id: 'settlement-1'
    })

    expect(result).toBe('encounter-monster-1')
    expect(mockSupabase.from).toHaveBeenCalledWith('encounter_active_monster')
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

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
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateEncounterActiveMonster('encounter-monster-1', { life: 7 })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('encounter_active_monster')
    expect(mockUpdate).toHaveBeenCalledWith({ life: 7 })
    expect(mockEq).toHaveBeenCalledWith('id', 'encounter-monster-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateEncounterActiveMonster('encounter-monster-1', { life: 7 })
    ).rejects.toThrow('Error Updating Encounter Monster: Update failed')
  })
})

describe('removeEncounterActiveMonster', () => {
  it('removes an active encounter monster successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(
      removeEncounterActiveMonster('encounter-monster-1')
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('encounter_active_monster')
    expect(mockEq).toHaveBeenCalledWith('id', 'encounter-monster-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(
      removeEncounterActiveMonster('encounter-monster-1')
    ).rejects.toThrow('Error Removing Encounter Monster: Delete failed')
  })
})
