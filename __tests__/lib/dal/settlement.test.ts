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
  updateSettlement,
  removeSettlement
} = await import('@/lib/dal/settlement')
const { getUserId } = await import('@/lib/dal/user')

beforeEach(() => {
  vi.clearAllMocks()
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
