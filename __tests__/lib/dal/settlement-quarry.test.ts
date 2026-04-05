import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSettlementQuarries,
  addSettlementQuarries,
  removeSettlementQuarry,
  updateSettlementQuarry
} = await import('@/lib/dal/settlement-quarry')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSettlementQuarries', () => {
  it('throws when settlementId is null', async () => {
    await expect(getSettlementQuarries(null)).rejects.toThrow('Required: Settlement ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when settlementId is undefined', async () => {
    await expect(getSettlementQuarries(undefined)).rejects.toThrow('Required: Settlement ID')
  })

  it('returns mapped quarries', async () => {
    const rawItem = {
      collective_cognition_level_1: false,
      collective_cognition_level_2: [false, false],
      collective_cognition_level_3: [false, false, false],
      collective_cognition_prologue: false,
      id: 'sq-1',
      quarry_id: 'q-1',
      unlocked: true,
      quarry: { monster_name: 'White Lion', node: 'white_lion', prologue: true }
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawItem], error: null })
      })
    })

    const result = await getSettlementQuarries('settlement-1')

    expect(result).toEqual([
      {
        collective_cognition_level_1: false,
        collective_cognition_level_2: [false, false],
        collective_cognition_level_3: [false, false, false],
        collective_cognition_prologue: false,
        id: 'sq-1',
        monster_name: 'White Lion',
        node: 'white_lion',
        prologue: true,
        quarry_id: 'q-1',
        unlocked: true
      }
    ])
    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_quarry')
  })

  it('returns empty array when no quarries exist', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getSettlementQuarries('settlement-1')

    expect(result).toEqual([])
  })

  it('throws when query fails', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
      })
    })

    await expect(getSettlementQuarries('settlement-1')).rejects.toThrow(
      'Error Fetching Settlement Quarries: DB error'
    )
  })
})

describe('addSettlementQuarries', () => {
  it('throws when settlementId is null', async () => {
    await expect(addSettlementQuarries(['q-1'], null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns empty array when quarryIds is empty', async () => {
    const result = await addSettlementQuarries([], 'settlement-1')

    expect(result).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts and returns ids', async () => {
    const mockSelect = vi.fn().mockResolvedValue({ data: [{ id: 'sq-1' }], error: null })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSettlementQuarries(['q-1'], 'settlement-1')

    expect(result).toEqual([{ id: 'sq-1' }])
    expect(mockInsert).toHaveBeenCalledWith([
      {
        collective_cognition_level_1: false,
        collective_cognition_level_2: [false, false],
        collective_cognition_level_3: [false, false, false],
        collective_cognition_prologue: false,
        quarry_id: 'q-1',
        settlement_id: 'settlement-1',
        unlocked: false
      }
    ])
  })

  it('throws when insert fails', async () => {
    const mockSelect = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(addSettlementQuarries(['q-1'], 'settlement-1')).rejects.toThrow(
      'Error Adding Settlement Quarries: Insert failed'
    )
  })
})

describe('removeSettlementQuarry', () => {
  it('throws when settlementQuarryId is null', async () => {
    await expect(removeSettlementQuarry(null)).rejects.toThrow(
      'Required: Settlement Quarry ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('removes a quarry successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementQuarry('sq-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_quarry')
    expect(mockEq).toHaveBeenCalledWith('id', 'sq-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementQuarry('sq-1')).rejects.toThrow(
      'Error Removing Settlement Quarry: Delete failed'
    )
  })
})

describe('updateSettlementQuarry', () => {
  it('throws when settlementQuarryId is null', async () => {
    await expect(updateSettlementQuarry(null, {})).rejects.toThrow(
      'Required: Settlement Quarry ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('updates a quarry successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementQuarry('sq-1', { unlocked: true })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_quarry')
    expect(mockUpdate).toHaveBeenCalledWith({ unlocked: true })
    expect(mockEq).toHaveBeenCalledWith('id', 'sq-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementQuarry('sq-1', { unlocked: true })
    ).rejects.toThrow('Error Updating Settlement Quarry: Update failed')
  })
})
