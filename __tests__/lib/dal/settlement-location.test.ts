import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSettlementLocations,
  addSettlementLocations,
  updateSettlementLocation,
  removeSettlementLocation
} = await import('@/lib/dal/settlement-location')

beforeEach(() => {
  vi.clearAllMocks()
  // Default: no settlement members surfaced (covers tests that don't
  // exercise author_username resolution). Individual tests override.
  mockSupabase.rpc.mockResolvedValue({ data: [], error: null })
})

describe('getSettlementLocations', () => {
  it('throws when settlementId is null', async () => {
    await expect(getSettlementLocations(null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when settlementId is undefined', async () => {
    await expect(getSettlementLocations(undefined)).rejects.toThrow(
      'Required: Settlement ID'
    )
  })

  it('returns mapped locations', async () => {
    const rawItem = {
      id: 'sl-1',
      location_id: 'loc-1',
      unlocked: true,
      location: { location_name: 'Lantern Hoard' }
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawItem], error: null })
      })
    })

    const result = await getSettlementLocations('settlement-1')

    expect(result).toEqual([
      {
        id: 'sl-1',
        location_id: 'loc-1',
        location_name: 'Lantern Hoard',
        unlocked: true,
        author_username: null
      }
    ])
    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_location')
  })

  it('returns empty array when no locations exist', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getSettlementLocations('settlement-1')

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

    await expect(getSettlementLocations('settlement-1')).rejects.toThrow(
      'Error Fetching Settlement Locations: DB error'
    )
  })
})

describe('addSettlementLocations', () => {
  it('throws when settlementId is null', async () => {
    await expect(addSettlementLocations(['loc-1'], null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns empty array when locationIds is empty', async () => {
    const result = await addSettlementLocations([], 'settlement-1')

    expect(result).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts and returns mapped locations', async () => {
    const rawItem = {
      id: 'sl-1',
      location: { id: 'loc-1', location_name: 'Lantern Hoard' }
    }
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: [rawItem], error: null })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSettlementLocations(['loc-1'], 'settlement-1')

    expect(result).toEqual([
      { id: 'sl-1', location_id: 'loc-1', location_name: 'Lantern Hoard' }
    ])
    expect(mockInsert).toHaveBeenCalledWith([
      { location_id: 'loc-1', settlement_id: 'settlement-1', unlocked: false }
    ])
  })

  it('throws when insert fails', async () => {
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addSettlementLocations(['loc-1'], 'settlement-1')
    ).rejects.toThrow('Error Adding Settlement Locations: Insert failed')
  })
})

describe('updateSettlementLocation', () => {
  it('updates a location successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementLocation('sl-1', { unlocked: true })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_location')
    expect(mockUpdate).toHaveBeenCalledWith({ unlocked: true })
    expect(mockEq).toHaveBeenCalledWith('id', 'sl-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementLocation('sl-1', { unlocked: true })
    ).rejects.toThrow('Error Updating Settlement Location: Update failed')
  })
})

describe('removeSettlementLocation', () => {
  it('removes a location successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementLocation('sl-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_location')
    expect(mockEq).toHaveBeenCalledWith('id', 'sl-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementLocation('sl-1')).rejects.toThrow(
      'Error Removing Settlement Location: Delete failed'
    )
  })
})
