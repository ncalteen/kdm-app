import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSurvivorSecretFightingArts,
  addSurvivorSecretFightingArt,
  removeSurvivorSecretFightingArt,
  updateSurvivorSecretFightingArt
} = await import('@/lib/dal/survivor-secret-fighting-art')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSurvivorSecretFightingArts', () => {
  it('throws when survivorId is null', async () => {
    await expect(getSurvivorSecretFightingArts(null)).rejects.toThrow('Required: Survivor ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when survivorId is undefined', async () => {
    await expect(getSurvivorSecretFightingArts(undefined)).rejects.toThrow('Required: Survivor ID')
  })

  it('returns secret fighting arts for a survivor', async () => {
    const mockData = [
      { id: 'ssfa1', secret_fighting_art_id: 'sfa1' },
      { id: 'ssfa2', secret_fighting_art_id: 'sfa2' }
    ]
    const mockEq = vi.fn().mockResolvedValue({ data: mockData, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSurvivorSecretFightingArts('survivor-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('survivor_secret_fighting_art')
    expect(mockSelect).toHaveBeenCalledWith('id, secret_fighting_art_id')
    expect(mockEq).toHaveBeenCalledWith('survivor_id', 'survivor-1')
    expect(result).toEqual(mockData)
  })

  it('returns empty array when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSurvivorSecretFightingArts('survivor-1')

    expect(result).toEqual([])
  })

  it('throws when query fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getSurvivorSecretFightingArts('survivor-1')).rejects.toThrow(
      'Error Fetching Survivor Secret Fighting Arts: DB error'
    )
  })
})

describe('addSurvivorSecretFightingArt', () => {
  it('inserts with secret_fighting_art_id and returns junction row id', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'ssfa-new' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSurvivorSecretFightingArt('survivor-1', 'sfa-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('survivor_secret_fighting_art')
    expect(mockInsert).toHaveBeenCalledWith({
      survivor_id: 'survivor-1',
      secret_fighting_art_id: 'sfa-1'
    })
    expect(result).toBe('ssfa-new')
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(addSurvivorSecretFightingArt('survivor-1', 'sfa-1')).rejects.toThrow(
      'Error Adding Survivor Secret Fighting Art: Insert failed'
    )
  })
})

describe('removeSurvivorSecretFightingArt', () => {
  it('deletes with survivor_id and secret_fighting_art_id', async () => {
    const mockSecondEq = vi.fn().mockResolvedValue({ error: null })
    const mockFirstEq = vi.fn().mockReturnValue({ eq: mockSecondEq })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockFirstEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(
      removeSurvivorSecretFightingArt('survivor-1', 'sfa-1')
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('survivor_secret_fighting_art')
    expect(mockFirstEq).toHaveBeenCalledWith('survivor_id', 'survivor-1')
    expect(mockSecondEq).toHaveBeenCalledWith('secret_fighting_art_id', 'sfa-1')
  })

  it('throws when delete fails', async () => {
    const mockSecondEq = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockFirstEq = vi.fn().mockReturnValue({ eq: mockSecondEq })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockFirstEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSurvivorSecretFightingArt('survivor-1', 'sfa-1')).rejects.toThrow(
      'Error Removing Survivor Secret Fighting Art: Delete failed'
    )
  })
})

describe('updateSurvivorSecretFightingArt', () => {
  it('updates matching row', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSurvivorSecretFightingArt('ssfa-1', { secret_fighting_art_id: 'sfa-2' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('survivor_secret_fighting_art')
    expect(mockUpdate).toHaveBeenCalledWith({ secret_fighting_art_id: 'sfa-2' })
    expect(mockEq).toHaveBeenCalledWith('id', 'ssfa-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSurvivorSecretFightingArt('ssfa-1', { secret_fighting_art_id: 'sfa-2' })
    ).rejects.toThrow('Error Updating Survivor Secret Fighting Art: Update failed')
  })
})
