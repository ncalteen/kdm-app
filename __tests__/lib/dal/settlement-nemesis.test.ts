import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSettlementNemeses,
  addSettlementNemeses,
  removeSettlementNemesis,
  updateSettlementNemesis
} = await import('@/lib/dal/settlement-nemesis')

beforeEach(() => {
  vi.clearAllMocks()
  // Default: no settlement members surfaced (covers tests that don't
  // exercise author_username resolution). Individual tests override.
  mockSupabase.rpc.mockResolvedValue({ data: [], error: null })
})

describe('getSettlementNemeses', () => {
  const rawNemesis = {
    collective_cognition_level_1: false,
    collective_cognition_level_2: false,
    collective_cognition_level_3: false,
    id: 'sn-1',
    level_1_defeated: false,
    level_2_defeated: false,
    level_3_defeated: false,
    level_4_defeated: false,
    nemesis_id: 'n-1',
    unlocked: false,
    nemesis: {
      custom: false,
      monster_name: 'The Hand',
      node: 'hand',
      instinct: null,
      basic_action: null,
      blind_spot: null,
      defeat_outcome: null,
      deployment_rules: null,
      victory_outcome: null
    }
  }

  it('throws when settlementId is null', async () => {
    await expect(getSettlementNemeses(null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when settlementId is undefined', async () => {
    await expect(getSettlementNemeses(undefined)).rejects.toThrow(
      'Required: Settlement ID'
    )
  })

  it('returns empty array when no nemeses exist', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getSettlementNemeses('settlement-1')

    expect(result).toEqual([])
  })

  it('returns mapped nemeses with available levels', async () => {
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [rawNemesis], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [
              { nemesis_id: 'n-1', level_number: 1 },
              { nemesis_id: 'n-1', level_number: 2 }
            ],
            error: null
          })
        })
      })

    const result = await getSettlementNemeses('settlement-1')

    expect(result).toEqual([
      {
        available_levels: [1, 2],
        collective_cognition_level_1: false,
        collective_cognition_level_2: false,
        collective_cognition_level_3: false,
        id: 'sn-1',
        level_1_defeated: false,
        level_2_defeated: false,
        level_3_defeated: false,
        level_4_defeated: false,
        nemesis_id: 'n-1',
        unlocked: false,
        monster_name: 'The Hand',
        node: 'hand',
        instinct: null,
        basic_action: null,
        blind_spot: null,
        defeat_outcome: null,
        deployment_rules: null,
        victory_outcome: null,
        custom: false,
        author_user_id: null,
        author_username: null,
        author_avatar_url: null
      }
    ])
    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_nemesis')
    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis_level')
  })

  it('throws when nemesis query fails', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'DB error' } })
      })
    })

    await expect(getSettlementNemeses('settlement-1')).rejects.toThrow(
      'Error Fetching Settlement Nemeses: DB error'
    )
  })

  it('throws when level query fails', async () => {
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [rawNemesis], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Level error' }
          })
        })
      })

    await expect(getSettlementNemeses('settlement-1')).rejects.toThrow(
      'Error Fetching Nemesis Levels: Level error'
    )
  })
})

describe('addSettlementNemeses', () => {
  const rawNemesis = {
    collective_cognition_level_1: false,
    collective_cognition_level_2: false,
    collective_cognition_level_3: false,
    id: 'sn-1',
    level_1_defeated: false,
    level_2_defeated: false,
    level_3_defeated: false,
    level_4_defeated: false,
    nemesis_id: 'n-1',
    unlocked: false,
    nemesis: {
      custom: false,
      monster_name: 'The Hand',
      node: 'hand',
      instinct: null,
      basic_action: null,
      blind_spot: null,
      defeat_outcome: null,
      deployment_rules: null,
      victory_outcome: null
    }
  }

  it('throws when settlementId is null', async () => {
    await expect(addSettlementNemeses(['n-1'], null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns empty array when nemesisIds is empty', async () => {
    const result = await addSettlementNemeses([], 'settlement-1')

    expect(result).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts nemeses and returns mapped results with levels', async () => {
    mockSupabase.from
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: [rawNemesis], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [{ nemesis_id: 'n-1', level_number: 1 }],
            error: null
          })
        })
      })

    const result = await addSettlementNemeses(['n-1'], 'settlement-1')

    expect(result).toEqual([
      {
        available_levels: [1],
        collective_cognition_level_1: false,
        collective_cognition_level_2: false,
        collective_cognition_level_3: false,
        id: 'sn-1',
        level_1_defeated: false,
        level_2_defeated: false,
        level_3_defeated: false,
        level_4_defeated: false,
        nemesis_id: 'n-1',
        unlocked: false,
        monster_name: 'The Hand',
        node: 'hand',
        instinct: null,
        basic_action: null,
        blind_spot: null,
        defeat_outcome: null,
        deployment_rules: null,
        victory_outcome: null,
        custom: false,
        author_user_id: null,
        author_username: null,
        author_avatar_url: null
      }
    ])
  })

  it('throws when insert fails', async () => {
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' }
        })
      })
    })

    await expect(addSettlementNemeses(['n-1'], 'settlement-1')).rejects.toThrow(
      'Error Adding Settlement Nemeses: Insert failed'
    )
  })

  it('throws when level query fails after insert', async () => {
    mockSupabase.from
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: [rawNemesis], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Level error' }
          })
        })
      })

    await expect(addSettlementNemeses(['n-1'], 'settlement-1')).rejects.toThrow(
      'Error Fetching Nemesis Levels: Level error'
    )
  })
})

describe('removeSettlementNemesis', () => {
  it('throws when settlementNemesisId is null', async () => {
    await expect(removeSettlementNemesis(null)).rejects.toThrow(
      'Required: Settlement Nemesis ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('removes a nemesis successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementNemesis('sn-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_nemesis')
    expect(mockEq).toHaveBeenCalledWith('id', 'sn-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementNemesis('sn-1')).rejects.toThrow(
      'Error Removing Settlement Nemesis: Delete failed'
    )
  })
})

describe('updateSettlementNemesis', () => {
  it('throws when settlementNemesisId is null', async () => {
    await expect(updateSettlementNemesis(null, {})).rejects.toThrow(
      'Required: Settlement Nemesis ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('updates a nemesis successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementNemesis('sn-1', { unlocked: true })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_nemesis')
    expect(mockUpdate).toHaveBeenCalledWith({ unlocked: true })
    expect(mockEq).toHaveBeenCalledWith('id', 'sn-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementNemesis('sn-1', { unlocked: true })
    ).rejects.toThrow('Error Updating Settlement Nemesis: Update failed')
  })
})
