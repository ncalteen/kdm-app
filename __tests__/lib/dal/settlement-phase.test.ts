import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSettlementPhase,
  updateSettlementPhase,
  addSettlementPhase,
  removeSettlementPhase
} = await import('@/lib/dal/settlement-phase')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSettlementPhase', () => {
  const mockPhaseData = {
    id: 'phase-1',
    endeavors: 1,
    returning_scout_id: null,
    settlement_id: 'settlement-1',
    step: 1
  }

  it('returns null when settlementId is null', async () => {
    const result = await getSettlementPhase(null)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when settlementId is undefined', async () => {
    const result = await getSettlementPhase(undefined)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when no phase is found', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      })
    })

    const result = await getSettlementPhase('settlement-1')

    expect(result).toBeNull()
  })

  it('returns phase with returning survivor ids', async () => {
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi
              .fn()
              .mockResolvedValue({ data: mockPhaseData, error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ survivor_id: 'surv-1' }],
            error: null
          })
        })
      })

    const result = await getSettlementPhase('settlement-1')

    expect(result).toEqual({
      ...mockPhaseData,
      returning_survivor_ids: ['surv-1']
    })
    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_phase')
    expect(mockSupabase.from).toHaveBeenCalledWith(
      'settlement_phase_returning_survivor'
    )
  })

  it('returns empty returning_survivor_ids when none exist', async () => {
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi
              .fn()
              .mockResolvedValue({ data: mockPhaseData, error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })

    const result = await getSettlementPhase('settlement-1')

    expect(result!.returning_survivor_ids).toEqual([])
  })

  it('throws when phase query fails', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'DB error' } })
        })
      })
    })

    await expect(getSettlementPhase('settlement-1')).rejects.toThrow(
      'Error Fetching Settlement Phase: DB error'
    )
  })

  it('throws when returning survivor query fails', async () => {
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi
              .fn()
              .mockResolvedValue({ data: mockPhaseData, error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Returning error' }
          })
        })
      })

    await expect(getSettlementPhase('settlement-1')).rejects.toThrow(
      'Error Fetching Returning Survivors: Returning error'
    )
  })
})

describe('updateSettlementPhase', () => {
  it('throws when settlementPhaseId is null', async () => {
    await expect(
      updateSettlementPhase(null, { step: 'SURVIVORS_RETURN' })
    ).rejects.toThrow('Required: Settlement Phase ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('updates a phase successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementPhase('phase-1', { step: 'SURVIVORS_RETURN' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_phase')
    expect(mockUpdate).toHaveBeenCalledWith({ step: 'SURVIVORS_RETURN' })
    expect(mockEq).toHaveBeenCalledWith('id', 'phase-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementPhase('phase-1', { step: 'SURVIVORS_RETURN' })
    ).rejects.toThrow('Error Updating Settlement Phase: Update failed')
  })
})

describe('addSettlementPhase', () => {
  it('inserts a phase with no returning survivors and returns id', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'phase-1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSettlementPhase({ settlement_id: 'settlement-1' })

    expect(result).toBe('phase-1')
    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_phase')
  })

  it('inserts phase and returning survivors, returns id', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'phase-1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert1 = vi.fn().mockReturnValue({ select: mockSelect })

    const mockInsert2 = vi.fn().mockResolvedValue({ error: null })

    mockSupabase.from
      .mockReturnValueOnce({ insert: mockInsert1 })
      .mockReturnValueOnce({ insert: mockInsert2 })

    const result = await addSettlementPhase({ settlement_id: 'settlement-1' }, [
      'surv-1'
    ])

    expect(result).toBe('phase-1')
    expect(mockInsert2).toHaveBeenCalledWith([
      {
        settlement_id: 'settlement-1',
        settlement_phase_id: 'phase-1',
        survivor_id: 'surv-1'
      }
    ])
  })

  it('cleans up phase when returning survivor insert fails', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'phase-1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert1 = vi.fn().mockReturnValue({ select: mockSelect })

    const mockInsert2 = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Survivor insert failed' } })

    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })

    mockSupabase.from
      .mockReturnValueOnce({ insert: mockInsert1 })
      .mockReturnValueOnce({ insert: mockInsert2 })
      .mockReturnValueOnce({ delete: mockDelete })

    await expect(
      addSettlementPhase({ settlement_id: 'settlement-1' }, ['surv-1'])
    ).rejects.toThrow(
      'Error Adding Returning Survivors: Survivor insert failed'
    )

    expect(mockDelete).toHaveBeenCalled()
    expect(mockEq).toHaveBeenCalledWith('id', 'phase-1')
  })

  it('throws when phase insert fails', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addSettlementPhase({ settlement_id: 'settlement-1' })
    ).rejects.toThrow('Error Adding Settlement Phase: Insert failed')
  })
})

describe('removeSettlementPhase', () => {
  it('removes a phase successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementPhase('phase-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_phase')
    expect(mockEq).toHaveBeenCalledWith('id', 'phase-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementPhase('phase-1')).rejects.toThrow(
      'Error Removing Settlement Phase: Delete failed'
    )
  })
})
