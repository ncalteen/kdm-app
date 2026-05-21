import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn()
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
  // Default: no settlement members map (resolved authors will be null).
  mockSupabase.rpc.mockResolvedValue({ data: [], error: null })
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
    const survivorRow = {
      ...baseSurvivor,
      abilities_impairments: [],
      cursed_gear: [],
      disorders: [],
      fighting_arts: [],
      secret_fighting_arts: [],
      hunt_survivor: [],
      showdown_survivor: [],
      knowledge_1: null,
      knowledge_2: null,
      neurosis: null,
      philosophy: null,
      tenet_knowledge: null,
      weapon_type: null
    }
    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: survivorRow, error: null })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

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
      tenet_knowledge: null,
      weapon_type: null
    })
    expect(mockSelect).toHaveBeenCalledWith(
      expect.stringContaining('weapon_type(')
    )
  })
})

describe('getSurvivors', () => {
  it('returns null when no settlement ID', async () => {
    const result = await getSurvivors(null)
    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when no survivors found', async () => {
    const mockReturns = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockOrder = vi.fn().mockReturnValue({ returns: mockReturns })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSurvivors('set-1')
    expect(result).toBeNull()
  })

  it('throws on main query error', async () => {
    const mockReturns = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'query error' } })
    const mockOrder = vi.fn().mockReturnValue({ returns: mockReturns })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getSurvivors('set-1')).rejects.toThrow(
      'Error Fetching Survivors: query error'
    )
  })

  it('returns survivors with empty related data', async () => {
    const survivorRow = {
      ...baseSurvivor,
      abilities_impairments: [],
      cursed_gear: [],
      disorders: [],
      fighting_arts: [],
      secret_fighting_arts: [],
      hunt_survivor: [],
      showdown_survivor: [],
      knowledge_1: null,
      knowledge_2: null,
      neurosis: null,
      philosophy: null,
      tenet_knowledge: null,
      weapon_type: null
    }
    const mockReturns = vi
      .fn()
      .mockResolvedValue({ data: [survivorRow], error: null })
    const mockOrder = vi.fn().mockReturnValue({ returns: mockReturns })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSurvivors('set-1')
    expect(result).toHaveLength(1)
    expect(result![0]).toMatchObject({
      id: 's-1',
      cursed_gear: [],
      disorders: [],
      embarked: false,
      fighting_arts: [],
      secret_fighting_arts: [],
      weapon_type: null
    })
  })

  it('resolves author_username for custom catalog rows across collections', async () => {
    const survivorRow = {
      ...baseSurvivor,
      abilities_impairments: [],
      cursed_gear: [
        {
          gear: {
            id: 'g-1',
            custom: true,
            user_id: 'author-1',
            gear_name: 'Hollow Blade'
          }
        }
      ],
      disorders: [
        {
          disorder: {
            id: 'd-1',
            custom: false,
            user_id: null,
            disorder_name: 'Standard',
            rules: null
          }
        }
      ],
      fighting_arts: [
        {
          fighting_art: {
            id: 'fa-1',
            custom: true,
            user_id: 'ghost-1',
            fighting_art_name: 'Forsaken Step',
            rules: null
          }
        }
      ],
      secret_fighting_arts: [],
      hunt_survivor: [],
      showdown_survivor: [],
      knowledge_1: {
        id: 'k-1',
        custom: true,
        user_id: 'author-1',
        knowledge_name: 'Whispers',
        rules: null,
        observation_conditions: null,
        observation_rank_up_milestone: null
      },
      knowledge_2: null,
      neurosis: null,
      philosophy: null,
      tenet_knowledge: null,
      weapon_type: {
        id: 'wt-1',
        custom: true,
        user_id: 'author-1',
        weapon_type_name: 'Axe',
        specialist_proficiency_rules: 'Axe specialist rules',
        master_proficiency_rules: 'Axe master rules'
      }
    }

    const mockReturns = vi
      .fn()
      .mockResolvedValue({ data: [survivorRow], error: null })
    const mockOrder = vi.fn().mockReturnValue({ returns: mockReturns })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

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

    const result = await getSurvivors('set-1')

    expect(result![0].cursed_gear[0].author_username).toBe('ashen.veil')
    expect(result![0].cursed_gear[0].author_user_id).toBe('author-1')
    expect(result![0].cursed_gear[0].author_avatar_url).toBe(
      'https://a/ashen.png'
    )
    expect(result![0].cursed_gear[0]).not.toHaveProperty('user_id')
    // Built-in disorder resolves to null author.
    expect(result![0].disorders[0].author_username).toBeNull()
    expect(result![0].disorders[0].author_user_id).toBeNull()
    expect(result![0].disorders[0].author_avatar_url).toBeNull()
    // Custom row authored by a member who left the settlement resolves to
    // null even though `custom` is true.
    expect(result![0].fighting_arts[0].author_username).toBeNull()
    expect(result![0].fighting_arts[0].author_user_id).toBe('ghost-1')
    expect(result![0].fighting_arts[0].author_avatar_url).toBeNull()
    expect(result![0].knowledge_1?.author_username).toBe('ashen.veil')
    expect(result![0].knowledge_1?.author_avatar_url).toBe(
      'https://a/ashen.png'
    )
    expect(result![0].weapon_type?.author_username).toBe('ashen.veil')
    expect(result![0].weapon_type?.author_user_id).toBe('author-1')
    expect(result![0].weapon_type?.author_avatar_url).toBe(
      'https://a/ashen.png'
    )
    expect(result![0].weapon_type).not.toHaveProperty('user_id')
    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'get_settlement_member_usernames',
      { target_settlement: 'set-1' }
    )
  })

  it('uses the prefetched member-username promise instead of issuing a duplicate RPC', async () => {
    const survivorRow = {
      ...baseSurvivor,
      abilities_impairments: [],
      cursed_gear: [
        {
          gear: {
            id: 'g-1',
            custom: true,
            user_id: 'author-1',
            gear_name: 'Hollow Blade'
          }
        }
      ],
      disorders: [],
      fighting_arts: [],
      secret_fighting_arts: [],
      hunt_survivor: [],
      showdown_survivor: [],
      knowledge_1: null,
      knowledge_2: null,
      neurosis: null,
      philosophy: null,
      tenet_knowledge: null,
      weapon_type: null
    }

    const mockReturns = vi
      .fn()
      .mockResolvedValue({ data: [survivorRow], error: null })
    const mockOrder = vi.fn().mockReturnValue({ returns: mockReturns })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const prefetched = Promise.resolve(
      new Map<string, { username: string; avatar_url: string | null }>([
        [
          'author-1',
          { username: 'prefetched.user', avatar_url: 'https://a/p.png' }
        ]
      ])
    )

    const result = await getSurvivors('set-1', prefetched)

    expect(result![0].cursed_gear[0].author_username).toBe('prefetched.user')
    expect(result![0].cursed_gear[0].author_avatar_url).toBe('https://a/p.png')
    expect(mockSupabase.rpc).not.toHaveBeenCalled()
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
