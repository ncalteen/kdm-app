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

vi.mock('@/lib/dal/user-subscription', () => ({
  getUserSubscription: vi.fn()
}))

vi.mock('@/lib/campaigns/potl', () => ({
  getPeopleOfTheLanternTemplate: vi.fn().mockResolvedValue({
    collectiveCognitionRewardIds: [],
    innovationIds: [],
    locationIds: [],
    milestoneIds: [],
    nemesisIds: [],
    principleIds: [],
    quarryIds: [],
    timeline: []
  })
}))

// Mock all of the related DAL modules used by `getSettlement` so the test
// file does not need to set up DB mocks for each one. These are used only
// for verifying that `getSettlement` invokes them and aggregates results.
vi.mock('@/lib/dal/settlement-collective-cognition-reward', () => ({
  getSettlementCollectiveCognitionRewards: vi.fn().mockResolvedValue([]),
  addSettlementCollectiveCognitionRewards: vi.fn()
}))
vi.mock('@/lib/dal/settlement-gear', () => ({
  getSettlementGear: vi.fn().mockResolvedValue([])
}))
vi.mock('@/lib/dal/settlement-innovation', () => ({
  getSettlementInnovations: vi.fn().mockResolvedValue([]),
  addSettlementInnovations: vi.fn()
}))
vi.mock('@/lib/dal/settlement-knowledge', () => ({
  getSettlementKnowledges: vi.fn().mockResolvedValue([])
}))
vi.mock('@/lib/dal/settlement-location', () => ({
  getSettlementLocations: vi.fn().mockResolvedValue([]),
  addSettlementLocations: vi.fn()
}))
vi.mock('@/lib/dal/settlement-milestone', () => ({
  getSettlementMilestones: vi.fn().mockResolvedValue([]),
  addSettlementMilestones: vi.fn()
}))
vi.mock('@/lib/dal/settlement-nemesis', () => ({
  getSettlementNemeses: vi.fn().mockResolvedValue([]),
  addSettlementNemeses: vi.fn()
}))
vi.mock('@/lib/dal/settlement-pattern', () => ({
  getSettlementPatterns: vi.fn().mockResolvedValue([])
}))
vi.mock('@/lib/dal/settlement-philosophy', () => ({
  getSettlementPhilosophies: vi.fn().mockResolvedValue([])
}))
vi.mock('@/lib/dal/settlement-principle', () => ({
  getSettlementPrinciples: vi.fn().mockResolvedValue([]),
  addSettlementPrinciples: vi.fn()
}))
vi.mock('@/lib/dal/settlement-quarry', () => ({
  getSettlementQuarries: vi.fn().mockResolvedValue([]),
  addSettlementQuarries: vi.fn()
}))
vi.mock('@/lib/dal/settlement-resource', () => ({
  getSettlementResources: vi.fn().mockResolvedValue([])
}))
vi.mock('@/lib/dal/settlement-seed-pattern', () => ({
  getSettlementSeedPatterns: vi.fn().mockResolvedValue([])
}))
vi.mock('@/lib/dal/settlement-shared-user', () => ({
  getSettlementMemberUsernames: vi.fn().mockResolvedValue(new Map())
}))
vi.mock('@/lib/dal/settlement-timeline-year', () => ({
  getSettlementTimelineYears: vi.fn().mockResolvedValue([]),
  addSettlementTimelineYears: vi.fn()
}))
vi.mock('@/lib/dal/neurosis', () => ({
  getNeuroses: vi.fn().mockResolvedValue({})
}))

const {
  getSettlement,
  getLostSettlementCount,
  getOwnedSettlementCount,
  createSettlement,
  updateSettlement,
  removeSettlement
} = await import('@/lib/dal/settlement')
const { getUserId } = await import('@/lib/dal/user')
const { getUserSubscription } = await import('@/lib/dal/user-subscription')
const { FREE_TIER_SETTLEMENT_LIMIT } = await import('@/lib/common')
const { CampaignType, SurvivorType } = await import('@/lib/enums')
const { FREE_TIER_SETTLEMENT_LIMIT_MESSAGE } = await import('@/lib/messages')

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getUserSubscription).mockResolvedValue({
    plan_id: 'free',
    status: 'active',
    current_period_end: null,
    cancel_at_period_end: false,
    can_share: false
  })
})

describe('getSettlement', () => {
  it('throws when settlementId is null', async () => {
    await expect(getSettlement(null)).rejects.toThrow('Required: Settlement ID')
  })

  it('returns owned settlement details with role:owner', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')

    // Owned lookup
    const ownedMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: 's1', settlement_name: 'Test' },
      error: null
    })
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ maybeSingle: ownedMaybeSingle })
        })
      })
    })

    const result = await getSettlement('s1')
    expect(result).toMatchObject({ id: 's1', role: 'owner' })
  })

  it('returns shared settlement details with role:collaborator', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')

    // Owned lookup → no row
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      })
    })
    // Shared lookup → row
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { settlement: { id: 's1', settlement_name: 'Shared' } },
              error: null
            })
          })
        })
      })
    })

    const result = await getSettlement('s1')
    expect(result).toMatchObject({ id: 's1', role: 'collaborator' })
  })

  it('returns null when neither owned nor shared row exists', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      })
    })
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      })
    })

    expect(await getSettlement('s1')).toBeNull()
  })

  it('throws on owned-lookup error', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi
              .fn()
              .mockResolvedValue({ data: null, error: { message: 'oops' } })
          })
        })
      })
    })

    await expect(getSettlement('s1')).rejects.toThrow(
      'Error Fetching Settlement: oops'
    )
  })

  it('throws on shared-lookup error', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      })
    })
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi
              .fn()
              .mockResolvedValue({ data: null, error: { message: 'oops' } })
          })
        })
      })
    })

    await expect(getSettlement('s1')).rejects.toThrow(
      'Error Fetching Shared Settlement: oops'
    )
  })

  it('handles shared settlement returned as array', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      })
    })
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                settlement: [{ id: 's1', settlement_name: 'Shared' }]
              },
              error: null
            })
          })
        })
      })
    })

    const result = await getSettlement('s1')
    expect(result).toMatchObject({ id: 's1', role: 'collaborator' })
  })
})

describe('getLostSettlementCount', () => {
  it('throws when settlementId is missing', async () => {
    await expect(getLostSettlementCount(null)).rejects.toThrow(
      'Required: Settlement ID'
    )
  })

  it('returns the count from supabase', async () => {
    const eq3 = vi.fn().mockResolvedValue({ count: 1, error: null })
    const eq2 = vi.fn().mockReturnValue({ eq: eq3 })
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 })
    const select = vi.fn().mockReturnValue({ eq: eq1 })
    mockSupabase.from.mockReturnValue({ select })

    expect(await getLostSettlementCount('s1')).toBe(1)
  })

  it('throws on query error', async () => {
    const eq3 = vi
      .fn()
      .mockResolvedValue({ count: null, error: { message: 'DB' } })
    const eq2 = vi.fn().mockReturnValue({ eq: eq3 })
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 })
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: eq1 })
    })

    await expect(getLostSettlementCount('s1')).rejects.toThrow(
      'Error Fetching Lost Settlement Count: DB'
    )
  })
})

describe('updateSettlement', () => {
  it('throws when settlementId is missing', async () => {
    await expect(
      updateSettlement(null, { settlement_name: 'X' })
    ).rejects.toThrow('Required: Settlement ID')
  })

  it('updates a settlement', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({ eq })
    })

    await updateSettlement('s1', { settlement_name: 'X' })
    expect(eq).toHaveBeenCalledWith('id', 's1')
  })

  it('throws on update error', async () => {
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'fail' } })
      })
    })

    await expect(
      updateSettlement('s1', { settlement_name: 'X' })
    ).rejects.toThrow('Error Updating Settlement: fail')
  })
})

describe('removeSettlement', () => {
  it('removes a settlement scoped to the authenticated user', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')
    const eq2 = vi.fn().mockResolvedValue({ error: null })
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 })
    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq: eq1 })
    })

    await removeSettlement('s1')
    expect(eq1).toHaveBeenCalledWith('id', 's1')
    expect(eq2).toHaveBeenCalledWith('user_id', 'user-1')
  })

  it('throws on delete error', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')
    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'fail' } })
        })
      })
    })

    await expect(removeSettlement('s1')).rejects.toThrow(
      'Error Removing Settlement: fail'
    )
  })
})

describe('getOwnedSettlementCount', () => {
  it('returns the count scoped to the authenticated user', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')

    const eq = vi.fn().mockResolvedValue({ count: 3, error: null })
    const select = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ select })

    expect(await getOwnedSettlementCount()).toBe(3)
    expect(mockSupabase.from).toHaveBeenCalledWith('settlement')
    expect(select).toHaveBeenCalledWith('id', { count: 'exact', head: true })
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1')
  })

  it('treats a null count as zero', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')

    const eq = vi.fn().mockResolvedValue({ count: null, error: null })
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({ eq })
    })

    expect(await getOwnedSettlementCount()).toBe(0)
  })

  it('throws on query error', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')

    const eq = vi
      .fn()
      .mockResolvedValue({ count: null, error: { message: 'DB' } })
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({ eq })
    })

    await expect(getOwnedSettlementCount()).rejects.toThrow(
      'Error Fetching Owned Settlement Count: DB'
    )
  })
})

describe('createSettlement (free-tier ownership cap)', () => {
  /**
   * Minimal `NewSettlementInput` payload. The cap check runs before any
   * template / campaign work, so the rest of the fields are irrelevant to
   * this test path — we only need a value the function can destructure.
   */
  const baseInput = {
    campaignType: CampaignType.PEOPLE_OF_THE_LANTERN,
    settlementName: 'Doomed',
    survivorType: SurvivorType.CORE,
    usesScouts: false,
    monsterIds: {
      NQ1: [],
      NQ2: [],
      NQ3: [],
      NQ4: [],
      NN1: [],
      NN2: [],
      NN3: [],
      CO: [],
      FI: []
    },
    wandererIds: []
    // Cast at the call site to avoid pulling enum mocks into this test.
  } as unknown as Parameters<typeof createSettlement>[0]

  it('throws the free-tier cap message when the user is at the limit', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')

    // Count query → at-the-cap. createSettlement must short-circuit before
    // it ever calls `.insert(...)`, so we only stage the count response.
    const insert = vi.fn()
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          count: FREE_TIER_SETTLEMENT_LIMIT,
          error: null
        })
      }),
      insert
    })

    await expect(createSettlement(baseInput)).rejects.toThrow(
      FREE_TIER_SETTLEMENT_LIMIT_MESSAGE(FREE_TIER_SETTLEMENT_LIMIT)
    )

    // Defense-in-depth: no insert should fire when the cap is reached.
    expect(insert).not.toHaveBeenCalled()
  })

  it('throws the free-tier cap message when the user is over the limit', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')

    const insert = vi.fn()
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          count: FREE_TIER_SETTLEMENT_LIMIT + 7,
          error: null
        })
      }),
      insert
    })

    await expect(createSettlement(baseInput)).rejects.toThrow(
      FREE_TIER_SETTLEMENT_LIMIT_MESSAGE(FREE_TIER_SETTLEMENT_LIMIT)
    )
    expect(insert).not.toHaveBeenCalled()
  })

  it('does not enforce the free-tier cap for an active lantern subscriber', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')
    vi.mocked(getUserSubscription).mockResolvedValue({
      plan_id: 'lantern',
      status: 'active',
      current_period_end: '2027-01-01T00:00:00Z',
      cancel_at_period_end: false,
      can_share: false
    })

    const countSelect = vi.fn()
    const settlementInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'insert reached' }
        })
      })
    })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'settlement') {
        return {
          select: countSelect,
          insert: settlementInsert
        }
      }

      return {
        select: vi.fn(),
        insert: vi.fn()
      }
    })

    await expect(createSettlement(baseInput)).rejects.toThrow(
      'Error Creating Settlement: insert reached'
    )

    expect(countSelect).not.toHaveBeenCalled()
    expect(settlementInsert).toHaveBeenCalledOnce()
  })

  it('falls back to the free-tier cap when the subscription lookup fails', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')
    vi.mocked(getUserSubscription).mockRejectedValue(
      new Error('rpc unavailable')
    )
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    const countEq = vi.fn().mockResolvedValue({ count: 0, error: null })
    const countSelect = vi.fn().mockReturnValue({ eq: countEq })
    const settlementInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'insert reached' }
        })
      })
    })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'settlement') {
        return {
          select: countSelect,
          insert: settlementInsert
        }
      }

      return {
        select: vi.fn(),
        insert: vi.fn()
      }
    })

    await expect(createSettlement(baseInput)).rejects.toThrow(
      'Error Creating Settlement: insert reached'
    )

    expect(countSelect).toHaveBeenCalledWith('id', {
      count: 'exact',
      head: true
    })
    expect(countEq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(settlementInsert).toHaveBeenCalledOnce()
    expect(consoleError).toHaveBeenCalledWith(
      'Settlement Subscription Entitlement Error:',
      expect.any(Error)
    )

    consoleError.mockRestore()
  })
})
