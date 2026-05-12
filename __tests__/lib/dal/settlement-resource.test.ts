import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSettlementResources,
  addSettlementResources,
  updateSettlementResource,
  removeSettlementResource
} = await import('@/lib/dal/settlement-resource')

beforeEach(() => {
  vi.clearAllMocks()
  // Default: no settlement members surfaced (covers tests that don't
  // exercise author_username resolution). Individual tests override.
  mockSupabase.rpc.mockResolvedValue({ data: [], error: null })
})

describe('getSettlementResources', () => {
  it('throws when settlementId is null', async () => {
    await expect(getSettlementResources(null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when settlementId is undefined', async () => {
    await expect(getSettlementResources(undefined)).rejects.toThrow(
      'Required: Settlement ID'
    )
  })

  it('returns mapped resources with quarry data', async () => {
    const rawItem = {
      id: 'sr-1',
      resource_id: 'res-1',
      quantity: 2,
      resource: {
        category: 'basic',
        quarry_id: 'q-1',
        resource_name: 'Bone',
        resource_types: ['bone'],
        quarry: { monster_name: 'White Lion', node: 'white_lion' }
      }
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawItem], error: null })
      })
    })

    const result = await getSettlementResources('settlement-1')

    expect(result).toEqual([
      {
        category: 'basic',
        id: 'sr-1',
        quantity: 2,
        quarry_id: 'q-1',
        quarry_monster_name: 'White Lion',
        quarry_node: 'white_lion',
        resource_id: 'res-1',
        resource_name: 'Bone',
        resource_types: ['bone'],
        author_username: null
      }
    ])
    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_resource')
  })

  it('returns resources with null quarry fields when quarry is absent', async () => {
    const rawItem = {
      id: 'sr-1',
      resource_id: 'res-1',
      quantity: 1,
      resource: {
        category: 'basic',
        quarry_id: null,
        resource_name: 'Scrap',
        resource_types: ['scrap'],
        quarry: null
      }
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawItem], error: null })
      })
    })

    const result = await getSettlementResources('settlement-1')

    expect(result[0].quarry_monster_name).toBeNull()
    expect(result[0].quarry_node).toBeNull()
    expect(result[0].quarry_id).toBeNull()
  })

  it('returns empty array when no resources exist', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getSettlementResources('settlement-1')

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

    await expect(getSettlementResources('settlement-1')).rejects.toThrow(
      'Error Fetching Settlement Resources: DB error'
    )
  })
})

describe('addSettlementResources', () => {
  it('throws when settlementId is null', async () => {
    await expect(addSettlementResources(['res-1'], null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns empty array when resourceIds is empty', async () => {
    const result = await addSettlementResources([], 'settlement-1')

    expect(result).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts and returns ids', async () => {
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'sr-1' }], error: null })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSettlementResources(['res-1'], 'settlement-1')

    expect(result).toEqual([{ id: 'sr-1' }])
    expect(mockInsert).toHaveBeenCalledWith([
      { resource_id: 'res-1', settlement_id: 'settlement-1', quantity: 0 }
    ])
  })

  it('throws when insert fails', async () => {
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addSettlementResources(['res-1'], 'settlement-1')
    ).rejects.toThrow('Error Adding Settlement Resources: Insert failed')
  })
})

describe('updateSettlementResource', () => {
  it('updates a resource successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementResource('sr-1', { quantity: 5 })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_resource')
    expect(mockUpdate).toHaveBeenCalledWith({ quantity: 5 })
    expect(mockEq).toHaveBeenCalledWith('id', 'sr-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementResource('sr-1', { quantity: 5 })
    ).rejects.toThrow('Error Updating Settlement Resource: Update failed')
  })
})

describe('removeSettlementResource', () => {
  it('removes a resource successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementResource('sr-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_resource')
    expect(mockEq).toHaveBeenCalledWith('id', 'sr-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementResource('sr-1')).rejects.toThrow(
      'Error Removing Settlement Resource: Delete failed'
    )
  })
})
