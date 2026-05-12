import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSettlementGear,
  addSettlementGear,
  updateSettlementGear,
  removeSettlementGear
} = await import('@/lib/dal/settlement-gear')

beforeEach(() => {
  vi.clearAllMocks()
  // Default: no settlement members surfaced (covers tests that don't
  // exercise author_username resolution). Individual tests override.
  mockSupabase.rpc.mockResolvedValue({ data: [], error: null })
})

describe('getSettlementGear', () => {
  it('throws when settlementId is null', async () => {
    await expect(getSettlementGear(null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when settlementId is undefined', async () => {
    await expect(getSettlementGear(undefined)).rejects.toThrow(
      'Required: Settlement ID'
    )
  })

  it('returns mapped gear', async () => {
    const rawItem = {
      gear_id: 'gear-1',
      id: 'sg-1',
      quantity: 2,
      gear: { gear_name: 'Bone Dagger' }
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawItem], error: null })
      })
    })

    const result = await getSettlementGear('settlement-1')

    expect(result).toEqual([
      {
        custom: false,
        gear_id: 'gear-1',
        gear_name: 'Bone Dagger',
        id: 'sg-1',
        quantity: 2,
        author_username: null
      }
    ])
    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_gear')
  })

  it('returns empty array when no gear exists', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getSettlementGear('settlement-1')

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

    await expect(getSettlementGear('settlement-1')).rejects.toThrow(
      'Error Fetching Settlement Gear: DB error'
    )
  })
})

describe('addSettlementGear', () => {
  it('inserts gear and returns the id', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'sg-1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSettlementGear({
      gear_id: 'gear-1',
      settlement_id: 'settlement-1',
      quantity: 1
    })

    expect(result).toBe('sg-1')
    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_gear')
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addSettlementGear({
        gear_id: 'gear-1',
        settlement_id: 'settlement-1',
        quantity: 1
      })
    ).rejects.toThrow('Error Adding Settlement Gear: Insert failed')
  })
})

describe('updateSettlementGear', () => {
  it('updates gear successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementGear('sg-1', { quantity: 3 })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_gear')
    expect(mockUpdate).toHaveBeenCalledWith({ quantity: 3 })
    expect(mockEq).toHaveBeenCalledWith('id', 'sg-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateSettlementGear('sg-1', { quantity: 3 })).rejects.toThrow(
      'Error Updating Settlement Gear: Update failed'
    )
  })
})

describe('removeSettlementGear', () => {
  it('removes gear successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementGear('sg-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_gear')
    expect(mockEq).toHaveBeenCalledWith('id', 'sg-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementGear('sg-1')).rejects.toThrow(
      'Error Removing Settlement Gear: Delete failed'
    )
  })
})
