import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

vi.mock('@/lib/campaigns/squires', () => ({
  SquiresOfTheCitadelSurvivors: [
    { name: 'Squire 1', gender: 'MALE' },
    { name: 'Squire 2', gender: 'FEMALE' }
  ]
}))

vi.mock('@/lib/messages', () => ({
  SURVIVOR_ON_HUNT_ERROR_MESSAGE: () => 'Survivor is on a hunt',
  SURVIVOR_ON_SHOWDOWN_ERROR_MESSAGE: () => 'Survivor is on a showdown'
}))

const {
  addSquiresOfTheCitadelSurvivors,
  getSurvivor,
  getSurvivors,
  updateSurvivor,
  deleteSurvivor,
  createSurvivor
} = await import('@/lib/dal/survivor')

beforeEach(() => {
  vi.clearAllMocks()
})

// Helper to build a minimal survivor base object
const baseSurvivor = {
  id: 's-1',
  settlement_id: 'set-1',
  survivor_name: 'Test',
  gender: 'MALE',
  knowledge_1_id: null,
  knowledge_2_id: null,
  neurosis_id: null,
  philosophy_id: null,
  tenet_knowledge_id: null,
  courage: 0,
  understanding: 0,
  survival: 0,
  insanity: 0,
  hunt_xp: 0,
  hunt_xp_rank_up: false,
  movement: 5,
  accuracy: 0,
  strength: 0,
  evasion: 0,
  luck: 0,
  speed: 0,
  can_dash: false,
  can_dodge: false,
  can_encourage: false,
  can_endure: false,
  can_fist_pump: false,
  can_surge: false,
  wanderer: false,
  arm_broken: false,
  arm_contracture: false,
  arm_dismembered: false,
  arm_ruptured_muscle: false,
  body_broken_rib: false,
  body_destroyed_back: false,
  body_gaping_chest_wound: false,
  head_blind: false,
  head_deaf: false,
  head_intracranial_hemorrhage: false,
  head_shattered_jaw: false,
  leg_broken: false,
  leg_dismembered: false,
  leg_hamstrung: false,
  waist_broken_hip: false,
  waist_destroyed_genitals: false,
  waist_intestinal_prolapse: false,
  waist_warped_pelvis: false,
  abilities_impairments: [],
  disposition: null,
  aenas_state: null,
  lumi: null,
  systemic_pressure: null,
  torment: null
}

describe('addSquiresOfTheCitadelSurvivors', () => {
  it('inserts squire survivors for a settlement', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await addSquiresOfTheCitadelSurvivors('set-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('survivor')
    expect(mockInsert).toHaveBeenCalledWith([
      { gender: 'MALE', settlement_id: 'set-1', survivor_name: 'Squire 1' },
      { gender: 'FEMALE', settlement_id: 'set-1', survivor_name: 'Squire 2' }
    ])
  })

  it('throws when no settlement ID provided', async () => {
    await expect(addSquiresOfTheCitadelSurvivors(null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws on DB error', async () => {
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: { message: 'DB error' } })
    })

    await expect(addSquiresOfTheCitadelSurvivors('set-1')).rejects.toThrow(
      'Error Adding Squires to Settlement: DB error'
    )
  })
})

describe('getSurvivor', () => {
  it('throws when no survivor ID', async () => {
    await expect(getSurvivor(null)).rejects.toThrow('Required: Survivor ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when survivor not found', async () => {
    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: null })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSurvivor('s-1')
    expect(result).toBeNull()
  })

  it('throws on main query error', async () => {
    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getSurvivor('s-1')).rejects.toThrow(
      'Error Fetching Survivor: DB error'
    )
  })

  it('returns survivor with empty related data when no FK IDs set', async () => {
    // First call: main survivor query
    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: baseSurvivor, error: null })
    const mockSurvivorEq = vi
      .fn()
      .mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSurvivorSelect = vi.fn().mockReturnValue({ eq: mockSurvivorEq })

    // Junction table calls (all return empty)
    const emptyResult = { data: [], error: null }
    const mockLimit = vi.fn().mockResolvedValue(emptyResult)
    const mockIn = vi.fn().mockResolvedValue(emptyResult)
    const mockJunctionEq = vi.fn().mockReturnValue({ limit: mockLimit })
    const mockJunctionSelect = vi
      .fn()
      .mockReturnValue({ eq: mockJunctionEq, in: mockIn })

    mockSupabase.from
      .mockReturnValueOnce({ select: mockSurvivorSelect })
      .mockReturnValue({ select: mockJunctionSelect })

    const result = await getSurvivor('s-1')

    expect(result).toMatchObject({
      id: 's-1',
      cursed_gear: [],
      disorders: [],
      embarked: false,
      fighting_arts: [],
      knowledge_1: null,
      knowledge_2: null,
      neurosis: null,
      philosophy: null,
      secret_fighting_arts: [],
      tenet_knowledge: null
    })
  })

  it('throws when a junction table query fails', async () => {
    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: baseSurvivor, error: null })
    const mockSurvivorEq = vi
      .fn()
      .mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSurvivorSelect = vi.fn().mockReturnValue({ eq: mockSurvivorEq })

    const errorResult = { data: null, error: { message: 'junction error' } }
    const mockLimit = vi.fn().mockResolvedValue(errorResult)
    const mockJunctionEq = vi.fn().mockReturnValue({ limit: mockLimit })
    const mockJunctionSelect = vi.fn().mockReturnValue({ eq: mockJunctionEq })

    mockSupabase.from
      .mockReturnValueOnce({ select: mockSurvivorSelect })
      .mockReturnValue({ select: mockJunctionSelect })

    await expect(getSurvivor('s-1')).rejects.toThrow('junction error')
  })
})

describe('getSurvivors', () => {
  it('returns null when no settlement ID', async () => {
    const result = await getSurvivors(null)
    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when no survivors found', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSurvivors('set-1')
    expect(result).toBeNull()
  })

  it('throws on main query error', async () => {
    const mockOrder = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'query error' } })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getSurvivors('set-1')).rejects.toThrow(
      'Error Fetching Survivors: query error'
    )
  })

  it('returns survivors with empty related data', async () => {
    const survivor = { ...baseSurvivor }

    // Main survivor query
    const mockOrder = vi
      .fn()
      .mockResolvedValue({ data: [survivor], error: null })
    const mockSurvivorEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSurvivorSelect = vi.fn().mockReturnValue({ eq: mockSurvivorEq })

    // Junction tables
    const emptyResult = { data: [], error: null }
    const mockIn = vi.fn().mockResolvedValue(emptyResult)
    const mockJunctionSelect = vi.fn().mockReturnValue({ in: mockIn })

    mockSupabase.from
      .mockReturnValueOnce({ select: mockSurvivorSelect })
      .mockReturnValue({ select: mockJunctionSelect })

    const result = await getSurvivors('set-1')
    expect(result).toHaveLength(1)
    expect(result![0]).toMatchObject({
      id: 's-1',
      cursed_gear: [],
      disorders: [],
      embarked: false,
      fighting_arts: [],
      secret_fighting_arts: []
    })
  })
})

describe('updateSurvivor', () => {
  it('updates a survivor', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await updateSurvivor('s-1', { survivor_name: 'Updated' })

    expect(mockUpdate).toHaveBeenCalledWith({ survivor_name: 'Updated' })
    expect(mockEq).toHaveBeenCalledWith('id', 's-1')
  })

  it('throws when no survivor ID', async () => {
    await expect(updateSurvivor(null, {})).rejects.toThrow(
      'Required: Survivor ID'
    )
  })

  it('throws on DB error', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'update error' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateSurvivor('s-1', {})).rejects.toThrow(
      'Error Updating Survivor: update error'
    )
  })
})

describe('deleteSurvivor', () => {
  it('throws when no settlement ID', async () => {
    await expect(deleteSurvivor(null, 's-1')).rejects.toThrow(
      'Required: Settlement ID'
    )
  })

  it('throws when survivor is on a hunt', async () => {
    const huntMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'hs-1' }, error: null })
    const huntEq = vi.fn().mockReturnValue({ maybeSingle: huntMaybeSingle })
    const huntSelect = vi.fn().mockReturnValue({ eq: huntEq })

    const showdownMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: null })
    const showdownEq = vi
      .fn()
      .mockReturnValue({ maybeSingle: showdownMaybeSingle })
    const showdownSelect = vi.fn().mockReturnValue({ eq: showdownEq })

    mockSupabase.from
      .mockReturnValueOnce({ select: huntSelect })
      .mockReturnValueOnce({ select: showdownSelect })

    await expect(deleteSurvivor('set-1', 's-1')).rejects.toThrow(
      'Survivor is on a hunt'
    )
  })

  it('throws when survivor is on a showdown', async () => {
    const huntMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: null })
    const huntEq = vi.fn().mockReturnValue({ maybeSingle: huntMaybeSingle })
    const huntSelect = vi.fn().mockReturnValue({ eq: huntEq })

    const showdownMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'ss-1' }, error: null })
    const showdownEq = vi
      .fn()
      .mockReturnValue({ maybeSingle: showdownMaybeSingle })
    const showdownSelect = vi.fn().mockReturnValue({ eq: showdownEq })

    mockSupabase.from
      .mockReturnValueOnce({ select: huntSelect })
      .mockReturnValueOnce({ select: showdownSelect })

    await expect(deleteSurvivor('set-1', 's-1')).rejects.toThrow(
      'Survivor is on a showdown'
    )
  })

  it('deletes survivor and returns remaining survivors', async () => {
    const huntMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: null })
    const huntEq = vi.fn().mockReturnValue({ maybeSingle: huntMaybeSingle })
    const huntSelect = vi.fn().mockReturnValue({ eq: huntEq })

    const showdownMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: null })
    const showdownEq = vi
      .fn()
      .mockReturnValue({ maybeSingle: showdownMaybeSingle })
    const showdownSelect = vi.fn().mockReturnValue({ eq: showdownEq })

    const mockDeleteEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockDeleteEq })

    const mockOrder = vi
      .fn()
      .mockResolvedValue({ data: [baseSurvivor], error: null })
    const mockFetchEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockFetchSelect = vi.fn().mockReturnValue({ eq: mockFetchEq })

    mockSupabase.from
      .mockReturnValueOnce({ select: huntSelect })
      .mockReturnValueOnce({ select: showdownSelect })
      .mockReturnValueOnce({ delete: mockDelete })
      .mockReturnValueOnce({ select: mockFetchSelect })

    const result = await deleteSurvivor('set-1', 's-1')
    expect(result).toEqual([baseSurvivor])
  })

  it('throws on hunt check DB error', async () => {
    const huntMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'hunt error' } })
    const huntEq = vi.fn().mockReturnValue({ maybeSingle: huntMaybeSingle })
    const huntSelect = vi.fn().mockReturnValue({ eq: huntEq })

    const showdownMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: null })
    const showdownEq = vi
      .fn()
      .mockReturnValue({ maybeSingle: showdownMaybeSingle })
    const showdownSelect = vi.fn().mockReturnValue({ eq: showdownEq })

    mockSupabase.from
      .mockReturnValueOnce({ select: huntSelect })
      .mockReturnValueOnce({ select: showdownSelect })

    await expect(deleteSurvivor('set-1', 's-1')).rejects.toThrow(
      'Error Checking Survivor Hunts: hunt error'
    )
  })

  it('throws on delete error', async () => {
    const huntMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: null })
    const huntEq = vi.fn().mockReturnValue({ maybeSingle: huntMaybeSingle })
    const huntSelect = vi.fn().mockReturnValue({ eq: huntEq })

    const showdownMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: null })
    const showdownEq = vi
      .fn()
      .mockReturnValue({ maybeSingle: showdownMaybeSingle })
    const showdownSelect = vi.fn().mockReturnValue({ eq: showdownEq })

    const mockDeleteEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'delete error' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockDeleteEq })

    mockSupabase.from
      .mockReturnValueOnce({ select: huntSelect })
      .mockReturnValueOnce({ select: showdownSelect })
      .mockReturnValueOnce({ delete: mockDelete })

    await expect(deleteSurvivor('set-1', 's-1')).rejects.toThrow(
      'Error Deleting Survivor: delete error'
    )
  })
})

describe('createSurvivor', () => {
  const mockInput = {
    settlementId: 'set-1',
    survivorName: 'New Survivor',
    gender: 'M' as const,
    accuracy: 0,
    canDash: false,
    canDodge: false,
    canEncourage: false,
    canEndure: false,
    canFistPump: false,
    canSurge: false,
    courage: 0,
    evasion: 0,
    huntXP: 0,
    huntXPRankUp: false,
    insanity: 0,
    luck: 0,
    movement: 5,
    speed: 0,
    strength: 0,
    survival: 0,
    understanding: 0,
    wanderer: false,
    abilitiesAndImpairments: [],
    armBroken: false,
    armContracture: false,
    armDismembered: false,
    armRupturedMuscle: false,
    bodyBrokenRib: false,
    bodyDestroyedBack: false,
    bodyGapingChestWound: false,
    headBlind: false,
    headDeaf: false,
    headIntracranialHemorrhage: false,
    headShatteredJaw: false,
    legBroken: false,
    legDismembered: false,
    legHamstrung: false,
    waistBrokenHip: false,
    waistDestroyedGenitals: false,
    waistIntestinalProlapse: false,
    waistWarpedPelvis: false
  }

  it('throws when no settlement ID', async () => {
    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createSurvivor({ ...mockInput, settlementId: '' } as any)
    ).rejects.toThrow('Required: Settlement ID')
  })

  it('throws on insert error', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'insert fail' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(createSurvivor(mockInput as any)).rejects.toThrow(
      'Error Creating Survivor: insert fail'
    )
  })
})
