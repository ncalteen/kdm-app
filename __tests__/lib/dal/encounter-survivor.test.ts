import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

vi.mock('@/lib/dal/settlement-shared-user', () => ({
  getSettlementMemberUsernames: vi.fn().mockResolvedValue(new Map()),
  resolveSettlementAuthorship: () => ({
    author_avatar_url: null,
    author_user_id: null,
    author_username: null
  })
}))

const {
  getEncounterSurvivors,
  addEncounterSurvivor,
  updateEncounterSurvivor,
  removeEncounterSurvivor
} = await import('@/lib/dal/encounter-active-survivor')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('getEncounterSurvivors', () => {
  it('returns null when encounterId is null', async () => {
    const result = await getEncounterSurvivors(null)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when encounterId is undefined', async () => {
    const result = await getEncounterSurvivors(undefined)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns a map of encounter survivors', async () => {
    const survivor = {
      id: 'encounter-survivor-1',
      encounter_id: 'encounter-1',
      survivor_id: 'survivor-1',
      scout: false,
      bleeding_tokens: 1,
      settlement_id: 'settlement-1',
      survivor: {
        id: 'survivor-1',
        survivor_name: 'Foundling',
        settlement_id: 'settlement-1',
        abilities_impairments: [],
        cursed_gear: [],
        disorders: [],
        fighting_arts: [],
        gear_grid: null,
        hunt_survivor: [],
        knowledge_1: null,
        knowledge_2: null,
        neurosis: null,
        philosophy: null,
        secret_fighting_arts: [],
        showdown_survivor: [],
        tenet_knowledge: null,
        weapon_type: null
      }
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [survivor], error: null })
      })
    })

    const result = await getEncounterSurvivors('encounter-1')
    const { hunt_survivor, showdown_survivor, ...survivorDetail } =
      survivor.survivor
    void hunt_survivor
    void showdown_survivor

    expect(result).toEqual({
      'encounter-survivor-1': {
        ...survivor,
        survivor: {
          ...survivorDetail,
          embarked: false
        }
      }
    })
    expect(mockSupabase.from).toHaveBeenCalledWith('encounter_active_survivor')
  })

  it('returns null when data is null', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    })

    const result = await getEncounterSurvivors('encounter-1')

    expect(result).toBeNull()
  })

  it('returns an empty map when no survivors are found', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getEncounterSurvivors('encounter-1')

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

    await expect(getEncounterSurvivors('encounter-1')).rejects.toThrow(
      'Error Fetching Encounter Survivors: DB error'
    )
  })
})

describe('addEncounterSurvivor', () => {
  it('inserts an encounter survivor and returns the id', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'encounter-survivor-1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addEncounterSurvivor({
      encounter_id: 'encounter-1',
      settlement_id: 'settlement-1',
      survivor_id: 'survivor-1'
    })

    expect(result).toBe('encounter-survivor-1')
    expect(mockSupabase.from).toHaveBeenCalledWith('encounter_active_survivor')
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addEncounterSurvivor({
        encounter_id: 'encounter-1',
        settlement_id: 'settlement-1',
        survivor_id: 'survivor-1'
      })
    ).rejects.toThrow('Error Adding Encounter Survivor: Insert failed')
  })
})

describe('updateEncounterSurvivor', () => {
  it('updates an encounter survivor successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateEncounterSurvivor('encounter-survivor-1', { scout: true })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('encounter_active_survivor')
    expect(mockUpdate).toHaveBeenCalledWith({ scout: true })
    expect(mockEq).toHaveBeenCalledWith('id', 'encounter-survivor-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateEncounterSurvivor('encounter-survivor-1', { scout: true })
    ).rejects.toThrow('Error Updating Encounter Survivor: Update failed')
  })
})

describe('removeEncounterSurvivor', () => {
  it('removes an encounter survivor successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(
      removeEncounterSurvivor('encounter-survivor-1')
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('encounter_active_survivor')
    expect(mockEq).toHaveBeenCalledWith('id', 'encounter-survivor-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(
      removeEncounterSurvivor('encounter-survivor-1')
    ).rejects.toThrow('Error Removing Encounter Survivor: Delete failed')
  })
})
