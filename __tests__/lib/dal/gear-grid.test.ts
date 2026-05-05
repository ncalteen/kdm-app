import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  applyGearGridSlot,
  applySelectedArmorSet,
  clearGearGrid,
  emptyGearGrid,
  getGearGrid,
  saveGearGrid,
  setGearGridSlot,
  setSelectedArmorSet
} = await import('@/lib/dal/gear-grid')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('emptyGearGrid', () => {
  it('returns a grid with every slot null and a null id', () => {
    const grid = emptyGearGrid()

    expect(grid).toEqual({
      id: null,
      pos_top_left: null,
      pos_top_center: null,
      pos_top_right: null,
      pos_mid_left: null,
      pos_mid_center: null,
      pos_mid_right: null,
      pos_bottom_left: null,
      pos_bottom_center: null,
      pos_bottom_right: null,
      selected_armor_set_id: null
    })
  })
})

describe('getGearGrid', () => {
  it('throws when survivorId is null', async () => {
    await expect(getGearGrid(null)).rejects.toThrow('Required: Survivor ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when survivorId is undefined', async () => {
    await expect(getGearGrid(undefined)).rejects.toThrow(
      'Required: Survivor ID'
    )
  })

  it('returns the persisted gear grid', async () => {
    const mockData = {
      id: 'grid-1',
      pos_top_left: 'gear-a',
      pos_top_center: null,
      pos_top_right: null,
      pos_mid_left: null,
      pos_mid_center: 'gear-b',
      pos_mid_right: null,
      pos_bottom_left: null,
      pos_bottom_center: null,
      pos_bottom_right: null,
      selected_armor_set_id: null
    }
    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: mockData, error: null })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getGearGrid('survivor-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('gear_grid')
    expect(mockSelect).toHaveBeenCalledWith(
      'id, pos_top_left, pos_top_center, pos_top_right, pos_mid_left, pos_mid_center, pos_mid_right, pos_bottom_left, pos_bottom_center, pos_bottom_right, selected_armor_set_id'
    )
    expect(mockEq).toHaveBeenCalledWith('survivor_id', 'survivor-1')
    expect(result).toEqual(mockData)
  })

  it('returns null when no row exists', async () => {
    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: null })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getGearGrid('survivor-1')

    expect(result).toBeNull()
  })

  it('throws when the query fails', async () => {
    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getGearGrid('survivor-1')).rejects.toThrow(
      'Error Fetching Gear Grid: DB error'
    )
  })
})

describe('saveGearGrid', () => {
  it('throws when survivorId is empty', async () => {
    await expect(
      saveGearGrid('', {
        top_left: null,
        top_center: null,
        top_right: null,
        mid_left: null,
        mid_center: null,
        mid_right: null,
        bottom_left: null,
        bottom_center: null,
        bottom_right: null
      })
    ).rejects.toThrow('Required: Survivor ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('upserts the grid row and returns the persisted detail', async () => {
    const persisted = {
      id: 'grid-1',
      pos_top_left: 'gear-a',
      pos_top_center: null,
      pos_top_right: null,
      pos_mid_left: null,
      pos_mid_center: 'gear-b',
      pos_mid_right: null,
      pos_bottom_left: null,
      pos_bottom_center: null,
      pos_bottom_right: null
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: persisted, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ upsert: mockUpsert })

    const result = await saveGearGrid('survivor-1', {
      top_left: 'gear-a',
      top_center: null,
      top_right: null,
      mid_left: null,
      mid_center: 'gear-b',
      mid_right: null,
      bottom_left: null,
      bottom_center: null,
      bottom_right: null
    })

    expect(mockSupabase.from).toHaveBeenCalledWith('gear_grid')
    expect(mockUpsert).toHaveBeenCalledWith(
      {
        survivor_id: 'survivor-1',
        pos_top_left: 'gear-a',
        pos_top_center: null,
        pos_top_right: null,
        pos_mid_left: null,
        pos_mid_center: 'gear-b',
        pos_mid_right: null,
        pos_bottom_left: null,
        pos_bottom_center: null,
        pos_bottom_right: null
      },
      { onConflict: 'survivor_id' }
    )
    expect(mockSelect).toHaveBeenCalledWith(
      'id, pos_top_left, pos_top_center, pos_top_right, pos_mid_left, pos_mid_center, pos_mid_right, pos_bottom_left, pos_bottom_center, pos_bottom_right, selected_armor_set_id'
    )
    expect(result).toEqual(persisted)
  })

  it('throws when the upsert fails', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Save failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ upsert: mockUpsert })

    await expect(
      saveGearGrid('survivor-1', {
        top_left: null,
        top_center: null,
        top_right: null,
        mid_left: null,
        mid_center: null,
        mid_right: null,
        bottom_left: null,
        bottom_center: null,
        bottom_right: null
      })
    ).rejects.toThrow('Error Saving Gear Grid: Save failed')
  })
})

describe('setGearGridSlot', () => {
  it('preserves the existing grid and writes only the targeted slot', async () => {
    const persisted = {
      id: 'grid-1',
      pos_top_left: 'gear-a',
      pos_top_center: 'gear-new',
      pos_top_right: null,
      pos_mid_left: null,
      pos_mid_center: 'gear-b',
      pos_mid_right: null,
      pos_bottom_left: null,
      pos_bottom_center: null,
      pos_bottom_right: null
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: persisted, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ upsert: mockUpsert })

    const current = {
      id: 'grid-1',
      pos_top_left: 'gear-a',
      pos_top_center: null,
      pos_top_right: null,
      pos_mid_left: null,
      pos_mid_center: 'gear-b',
      pos_mid_right: null,
      pos_bottom_left: null,
      pos_bottom_center: null,
      pos_bottom_right: null,
      selected_armor_set_id: null
    }

    const result = await setGearGridSlot(
      'survivor-1',
      current,
      'top_center',
      'gear-new'
    )

    expect(mockUpsert).toHaveBeenCalledWith(
      {
        survivor_id: 'survivor-1',
        pos_top_left: 'gear-a',
        pos_top_center: 'gear-new',
        pos_top_right: null,
        pos_mid_left: null,
        pos_mid_center: 'gear-b',
        pos_mid_right: null,
        pos_bottom_left: null,
        pos_bottom_center: null,
        pos_bottom_right: null
      },
      { onConflict: 'survivor_id' }
    )
    expect(result).toEqual(persisted)
  })

  it('uses an empty grid as a baseline when none has been persisted', async () => {
    const persisted = {
      id: 'grid-new',
      pos_top_left: null,
      pos_top_center: null,
      pos_top_right: null,
      pos_mid_left: null,
      pos_mid_center: 'gear-b',
      pos_mid_right: null,
      pos_bottom_left: null,
      pos_bottom_center: null,
      pos_bottom_right: null
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: persisted, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ upsert: mockUpsert })

    await setGearGridSlot('survivor-1', null, 'mid_center', 'gear-b')

    expect(mockUpsert).toHaveBeenCalledWith(
      {
        survivor_id: 'survivor-1',
        pos_top_left: null,
        pos_top_center: null,
        pos_top_right: null,
        pos_mid_left: null,
        pos_mid_center: 'gear-b',
        pos_mid_right: null,
        pos_bottom_left: null,
        pos_bottom_center: null,
        pos_bottom_right: null
      },
      { onConflict: 'survivor_id' }
    )
  })

  it('clears a slot when gearId is null', async () => {
    const persisted = {
      id: 'grid-1',
      pos_top_left: null,
      pos_top_center: null,
      pos_top_right: null,
      pos_mid_left: null,
      pos_mid_center: 'gear-b',
      pos_mid_right: null,
      pos_bottom_left: null,
      pos_bottom_center: null,
      pos_bottom_right: null
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: persisted, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ upsert: mockUpsert })

    const current = {
      id: 'grid-1',
      pos_top_left: 'gear-a',
      pos_top_center: null,
      pos_top_right: null,
      pos_mid_left: null,
      pos_mid_center: 'gear-b',
      pos_mid_right: null,
      pos_bottom_left: null,
      pos_bottom_center: null,
      pos_bottom_right: null,
      selected_armor_set_id: null
    }

    await setGearGridSlot('survivor-1', current, 'top_left', null)

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ pos_top_left: null, pos_mid_center: 'gear-b' }),
      { onConflict: 'survivor_id' }
    )
  })
})

describe('clearGearGrid', () => {
  it('upserts an all-null grid row', async () => {
    const persisted = {
      id: 'grid-1',
      pos_top_left: null,
      pos_top_center: null,
      pos_top_right: null,
      pos_mid_left: null,
      pos_mid_center: null,
      pos_mid_right: null,
      pos_bottom_left: null,
      pos_bottom_center: null,
      pos_bottom_right: null
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: persisted, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ upsert: mockUpsert })

    const result = await clearGearGrid('survivor-1')

    expect(mockUpsert).toHaveBeenCalledWith(
      {
        survivor_id: 'survivor-1',
        pos_top_left: null,
        pos_top_center: null,
        pos_top_right: null,
        pos_mid_left: null,
        pos_mid_center: null,
        pos_mid_right: null,
        pos_bottom_left: null,
        pos_bottom_center: null,
        pos_bottom_right: null
      },
      { onConflict: 'survivor_id' }
    )
    expect(result).toEqual(persisted)
  })
})

describe('applyGearGridSlot', () => {
  it('returns a new grid with the targeted slot updated', () => {
    const current = {
      id: 'grid-1',
      pos_top_left: 'gear-a',
      pos_top_center: null,
      pos_top_right: null,
      pos_mid_left: null,
      pos_mid_center: 'gear-b',
      pos_mid_right: null,
      pos_bottom_left: null,
      pos_bottom_center: null,
      pos_bottom_right: null,
      selected_armor_set_id: null
    }

    const result = applyGearGridSlot(current, 'top_center', 'gear-new')

    expect(result).toEqual({
      ...current,
      pos_top_center: 'gear-new'
    })
    // Caller should not mutate the original.
    expect(current.pos_top_center).toBeNull()
  })

  it('uses an empty grid baseline when current is null', () => {
    const result = applyGearGridSlot(null, 'mid_center', 'gear-b')

    expect(result).toEqual({
      ...emptyGearGrid(),
      pos_mid_center: 'gear-b'
    })
  })

  it('clears a slot when gearId is null', () => {
    const current = {
      id: 'grid-1',
      pos_top_left: 'gear-a',
      pos_top_center: null,
      pos_top_right: null,
      pos_mid_left: null,
      pos_mid_center: 'gear-b',
      pos_mid_right: null,
      pos_bottom_left: null,
      pos_bottom_center: null,
      pos_bottom_right: null,
      selected_armor_set_id: null
    }

    const result = applyGearGridSlot(current, 'top_left', null)

    expect(result.pos_top_left).toBeNull()
    expect(result.pos_mid_center).toBe('gear-b')
  })
})

describe('setSelectedArmorSet', () => {
  it('upserts only the selected_armor_set_id field', async () => {
    const persisted = {
      id: 'grid-1',
      pos_top_left: null,
      pos_top_center: null,
      pos_top_right: null,
      pos_mid_left: null,
      pos_mid_center: null,
      pos_mid_right: null,
      pos_bottom_left: null,
      pos_bottom_center: null,
      pos_bottom_right: null,
      selected_armor_set_id: 'armor-set-1'
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: persisted, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ upsert: mockUpsert })

    const result = await setSelectedArmorSet('survivor-1', 'armor-set-1')

    expect(mockUpsert).toHaveBeenCalledWith(
      {
        survivor_id: 'survivor-1',
        selected_armor_set_id: 'armor-set-1'
      },
      { onConflict: 'survivor_id' }
    )
    expect(result).toEqual(persisted)
  })

  it('clears the selection when armorSetId is null', async () => {
    const persisted = {
      id: 'grid-1',
      pos_top_left: null,
      pos_top_center: null,
      pos_top_right: null,
      pos_mid_left: null,
      pos_mid_center: null,
      pos_mid_right: null,
      pos_bottom_left: null,
      pos_bottom_center: null,
      pos_bottom_right: null,
      selected_armor_set_id: null
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: persisted, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ upsert: mockUpsert })

    await setSelectedArmorSet('survivor-1', null)

    expect(mockUpsert).toHaveBeenCalledWith(
      {
        survivor_id: 'survivor-1',
        selected_armor_set_id: null
      },
      { onConflict: 'survivor_id' }
    )
  })
})

describe('applySelectedArmorSet', () => {
  it('returns a copy with selected_armor_set_id updated', () => {
    const current = {
      id: 'grid-1',
      pos_top_left: 'gear-a',
      pos_top_center: null,
      pos_top_right: null,
      pos_mid_left: null,
      pos_mid_center: 'gear-b',
      pos_mid_right: null,
      pos_bottom_left: null,
      pos_bottom_center: null,
      pos_bottom_right: null,
      selected_armor_set_id: null
    }

    const result = applySelectedArmorSet(current, 'armor-set-1')

    expect(result).toEqual({
      ...current,
      selected_armor_set_id: 'armor-set-1'
    })
    // Caller should not mutate the original.
    expect(current.selected_armor_set_id).toBeNull()
  })

  it('uses an empty grid baseline when current is null', () => {
    const result = applySelectedArmorSet(null, 'armor-set-1')

    expect(result).toEqual({
      ...emptyGearGrid(),
      selected_armor_set_id: 'armor-set-1'
    })
  })

  it('clears the selection when armorSetId is null', () => {
    const current = {
      id: 'grid-1',
      pos_top_left: 'gear-a',
      pos_top_center: null,
      pos_top_right: null,
      pos_mid_left: null,
      pos_mid_center: 'gear-b',
      pos_mid_right: null,
      pos_bottom_left: null,
      pos_bottom_center: null,
      pos_bottom_right: null,
      selected_armor_set_id: 'armor-set-1'
    }

    const result = applySelectedArmorSet(current, null)

    expect(result.selected_armor_set_id).toBeNull()
    expect(result.pos_top_left).toBe('gear-a')
  })
})
