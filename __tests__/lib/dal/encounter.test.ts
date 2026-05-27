import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

vi.mock('@/lib/dal/encounter-active-monster', () => ({
  getEncounterActiveMonsters: vi.fn()
}))

vi.mock('@/lib/dal/encounter-survivor', () => ({
  getEncounterSurvivors: vi.fn()
}))

vi.mock('@/lib/dal/settlement-shared-user', () => ({
  getSettlementMemberUsernames: vi.fn()
}))

const { getEncounter, addEncounter, updateEncounter, removeEncounter } =
  await import('@/lib/dal/encounter')
const { getEncounterActiveMonsters } = await import(
  '@/lib/dal/encounter-active-monster'
)
const { getEncounterSurvivors } = await import('@/lib/dal/encounter-survivor')
const { getSettlementMemberUsernames } = await import(
  '@/lib/dal/settlement-shared-user'
)

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getSettlementMemberUsernames).mockResolvedValue(new Map())
})

describe('getEncounter', () => {
  const mockEncounterData = {
    id: 'encounter-1',
    hunt_id: 'hunt-1',
    monster_level: 2,
    settlement_id: 'settlement-1',
    turn: 'MONSTER'
  }

  it('returns null when settlementId is null', async () => {
    const result = await getEncounter(null)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when settlementId is undefined', async () => {
    const result = await getEncounter(undefined)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when no encounter is found', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      })
    })

    const result = await getEncounter('settlement-1')

    expect(result).toBeNull()
    expect(getEncounterActiveMonsters).not.toHaveBeenCalled()
    expect(getEncounterSurvivors).not.toHaveBeenCalled()
  })

  it('returns the active encounter with monsters and survivors', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi
            .fn()
            .mockResolvedValue({ data: mockEncounterData, error: null })
        })
      })
    })

    const mockMonsters = { 'monster-1': { id: 'monster-1' } }
    const mockSurvivors = { 'survivor-1': { id: 'survivor-1' } }
    vi.mocked(getEncounterActiveMonsters).mockResolvedValue(
      mockMonsters as never
    )
    vi.mocked(getEncounterSurvivors).mockResolvedValue(mockSurvivors as never)

    const result = await getEncounter('settlement-1')

    expect(result).toEqual({
      ...mockEncounterData,
      encounter_monsters: mockMonsters,
      encounter_survivors: mockSurvivors
    })
    expect(getSettlementMemberUsernames).toHaveBeenCalledWith('settlement-1')
    expect(getEncounterActiveMonsters).toHaveBeenCalledWith(
      'encounter-1',
      expect.any(Promise)
    )
    expect(getEncounterSurvivors).toHaveBeenCalledWith('encounter-1')
  })

  it('throws when query fails', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'DB error' } })
        })
      })
    })

    await expect(getEncounter('settlement-1')).rejects.toThrow(
      'Error Fetching Encounter: DB error'
    )
  })
})

describe('addEncounter', () => {
  it('inserts an encounter and returns the id', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'encounter-1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addEncounter({
      hunt_id: 'hunt-1',
      monster_level: 1,
      settlement_id: 'settlement-1'
    })

    expect(result).toBe('encounter-1')
    expect(mockSupabase.from).toHaveBeenCalledWith('encounter')
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addEncounter({
        hunt_id: 'hunt-1',
        monster_level: 1,
        settlement_id: 'settlement-1'
      })
    ).rejects.toThrow('Error Adding Encounter: Insert failed')
  })
})

describe('updateEncounter', () => {
  it('updates an encounter successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateEncounter('encounter-1', { turn: 'SURVIVOR' })
    ).resolves.toBe(undefined)

    expect(mockSupabase.from).toHaveBeenCalledWith('encounter')
    expect(mockUpdate).toHaveBeenCalledWith({ turn: 'SURVIVOR' })
    expect(mockEq).toHaveBeenCalledWith('id', 'encounter-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateEncounter('encounter-1', { turn: 'SURVIVOR' })
    ).rejects.toThrow('Error Updating Encounter: Update failed')
  })
})

describe('removeEncounter', () => {
  it('removes an encounter successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeEncounter('encounter-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('encounter')
    expect(mockEq).toHaveBeenCalledWith('id', 'encounter-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeEncounter('encounter-1')).rejects.toThrow(
      'Error Removing Encounter: Delete failed'
    )
  })
})