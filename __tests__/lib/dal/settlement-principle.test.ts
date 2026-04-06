import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSettlementPrinciples,
  addSettlementPrinciples,
  updateSettlementPrinciple,
  removeSettlementPrinciple
} = await import('@/lib/dal/settlement-principle')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSettlementPrinciples', () => {
  it('throws when settlementId is null', async () => {
    await expect(getSettlementPrinciples(null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when settlementId is undefined', async () => {
    await expect(getSettlementPrinciples(undefined)).rejects.toThrow(
      'Required: Settlement ID'
    )
  })

  it('returns mapped principles', async () => {
    const rawItem = {
      id: 'spr-1',
      option_1_selected: false,
      option_2_selected: true,
      principle_id: 'prin-1',
      principle: {
        principle_name: 'New Life',
        option_1_name: 'Protect the Young',
        option_2_name: 'Survival of the Fittest'
      }
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawItem], error: null })
      })
    })

    const result = await getSettlementPrinciples('settlement-1')

    expect(result).toEqual([
      {
        id: 'spr-1',
        option_1_name: 'Protect the Young',
        option_1_selected: false,
        option_2_name: 'Survival of the Fittest',
        option_2_selected: true,
        principle_id: 'prin-1',
        principle_name: 'New Life'
      }
    ])
    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_principle')
  })

  it('returns empty array when no principles exist', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getSettlementPrinciples('settlement-1')

    expect(result).toEqual([])
  })

  it('throws when query fails', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'DB error' } })
      })
    })

    await expect(getSettlementPrinciples('settlement-1')).rejects.toThrow(
      'Error Fetching Settlement Principles: DB error'
    )
  })
})

describe('addSettlementPrinciples', () => {
  it('throws when settlementId is null', async () => {
    await expect(addSettlementPrinciples(['prin-1'], null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns empty array when principleIds is empty', async () => {
    const result = await addSettlementPrinciples([], 'settlement-1')

    expect(result).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts and returns ids', async () => {
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'spr-1' }], error: null })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSettlementPrinciples(['prin-1'], 'settlement-1')

    expect(result).toEqual([{ id: 'spr-1' }])
    expect(mockInsert).toHaveBeenCalledWith([
      {
        option_1_selected: false,
        option_2_selected: false,
        principle_id: 'prin-1',
        settlement_id: 'settlement-1'
      }
    ])
  })

  it('throws when insert fails', async () => {
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addSettlementPrinciples(['prin-1'], 'settlement-1')
    ).rejects.toThrow('Error Adding Settlement Principles: Insert failed')
  })
})

describe('updateSettlementPrinciple', () => {
  it('updates a principle successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementPrinciple('spr-1', { option_1_selected: true })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_principle')
    expect(mockUpdate).toHaveBeenCalledWith({ option_1_selected: true })
    expect(mockEq).toHaveBeenCalledWith('id', 'spr-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementPrinciple('spr-1', { option_1_selected: true })
    ).rejects.toThrow('Error Updating Settlement Principle: Update failed')
  })
})

describe('removeSettlementPrinciple', () => {
  it('removes a principle successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementPrinciple('spr-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_principle')
    expect(mockEq).toHaveBeenCalledWith('id', 'spr-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementPrinciple('spr-1')).rejects.toThrow(
      'Error Removing Settlement Principle: Delete failed'
    )
  })
})
