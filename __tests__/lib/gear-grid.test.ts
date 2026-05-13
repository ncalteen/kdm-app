import {
  AFFINITIES,
  armorSetQualifies,
  CLOTHED_AND_SATIATED_NAME,
  clothedAndSatiatedQualifies,
  computeAffinityCounts,
  computeEmbarkGearShortages,
  emptyAffinityCounts,
  getEffectiveArmorSetBonuses,
  getEquippedGearIds,
  getGearIdAtPosition,
  getQualifyingArmorSets,
  GRID_POSITIONS
} from '@/lib/gear-grid'
import {
  ArmorSetDetail,
  GearDetail,
  GearGridDetail,
  SettlementDetail,
  SurvivorDetail
} from '@/lib/types'
import { describe, expect, it } from 'vitest'

/**
 * Build a minimal {@link GearDetail} stub with only the affinity slots the
 * grid helpers consume.
 */
function makeGear(overrides: Partial<GearDetail> = {}): GearDetail {
  return {
    id: 'gear',
    affinity_top: null,
    affinity_left: null,
    affinity_right: null,
    affinity_bottom: null,
    ...overrides
  } as unknown as GearDetail
}

/**
 * Build an all-empty {@link GearGridDetail} stub.
 */
function emptyGrid(): GearGridDetail {
  return {
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
}

describe('AFFINITIES', () => {
  it('lists every supported color exactly once', () => {
    expect([...AFFINITIES].sort()).toEqual(['BLUE', 'GREEN', 'RED'])
  })
})

describe('GRID_POSITIONS', () => {
  it('lists nine positions in reading order', () => {
    expect(GRID_POSITIONS).toEqual([
      'top_left',
      'top_center',
      'top_right',
      'mid_left',
      'mid_center',
      'mid_right',
      'bottom_left',
      'bottom_center',
      'bottom_right'
    ])
  })
})

describe('emptyAffinityCounts', () => {
  it('returns zero for every color', () => {
    expect(emptyAffinityCounts()).toEqual({ BLUE: 0, GREEN: 0, RED: 0 })
  })
})

describe('getGearIdAtPosition', () => {
  it('returns null when grid is null', () => {
    expect(getGearIdAtPosition(null, 'top_left')).toBeNull()
  })

  it('returns null when slot is empty', () => {
    expect(getGearIdAtPosition(emptyGrid(), 'mid_center')).toBeNull()
  })

  it('returns the gear id stored at the slot', () => {
    const grid: GearGridDetail = {
      ...emptyGrid(),
      pos_top_right: 'gear-x'
    }

    expect(getGearIdAtPosition(grid, 'top_right')).toBe('gear-x')
  })
})

describe('computeAffinityCounts', () => {
  it('returns zeros for an empty grid', () => {
    expect(computeAffinityCounts(null, {})).toEqual({
      BLUE: 0,
      GREEN: 0,
      RED: 0
    })
    expect(computeAffinityCounts(emptyGrid(), {})).toEqual({
      BLUE: 0,
      GREEN: 0,
      RED: 0
    })
  })

  it('counts a single matching horizontal connection', () => {
    const grid: GearGridDetail = {
      ...emptyGrid(),
      pos_top_left: 'a',
      pos_top_center: 'b'
    }
    const gearMap = {
      a: makeGear({ affinity_right: 'BLUE' }),
      b: makeGear({ affinity_left: 'BLUE' })
    }

    expect(computeAffinityCounts(grid, gearMap)).toEqual({
      BLUE: 1,
      GREEN: 0,
      RED: 0
    })
  })

  it('counts a single matching vertical connection', () => {
    const grid: GearGridDetail = {
      ...emptyGrid(),
      pos_top_center: 'a',
      pos_mid_center: 'b'
    }
    const gearMap = {
      a: makeGear({ affinity_bottom: 'GREEN' }),
      b: makeGear({ affinity_top: 'GREEN' })
    }

    expect(computeAffinityCounts(grid, gearMap)).toEqual({
      BLUE: 0,
      GREEN: 1,
      RED: 0
    })
  })

  it('does not count when colors differ', () => {
    const grid: GearGridDetail = {
      ...emptyGrid(),
      pos_top_left: 'a',
      pos_top_center: 'b'
    }
    const gearMap = {
      a: makeGear({ affinity_right: 'BLUE' }),
      b: makeGear({ affinity_left: 'RED' })
    }

    expect(computeAffinityCounts(grid, gearMap)).toEqual({
      BLUE: 0,
      GREEN: 0,
      RED: 0
    })
  })

  it('does not count when one side has no affinity color', () => {
    const grid: GearGridDetail = {
      ...emptyGrid(),
      pos_top_left: 'a',
      pos_top_center: 'b'
    }
    const gearMap = {
      a: makeGear({ affinity_right: 'BLUE' }),
      b: makeGear({ affinity_left: null })
    }

    expect(computeAffinityCounts(grid, gearMap)).toEqual({
      BLUE: 0,
      GREEN: 0,
      RED: 0
    })
  })

  it('does not count when a piece is missing from the gear map', () => {
    const grid: GearGridDetail = {
      ...emptyGrid(),
      pos_top_left: 'a',
      pos_top_center: 'b'
    }
    // Only one of the two gears resolves.
    const gearMap = {
      a: makeGear({ affinity_right: 'BLUE' })
    }

    expect(computeAffinityCounts(grid, gearMap)).toEqual({
      BLUE: 0,
      GREEN: 0,
      RED: 0
    })
  })

  it('only counts each adjacency once even when both sides match', () => {
    const grid: GearGridDetail = {
      ...emptyGrid(),
      pos_mid_left: 'a',
      pos_mid_center: 'b'
    }
    const gearMap = {
      a: makeGear({ affinity_right: 'RED', affinity_left: 'RED' }),
      b: makeGear({ affinity_left: 'RED', affinity_right: 'RED' })
    }

    expect(computeAffinityCounts(grid, gearMap)).toEqual({
      BLUE: 0,
      GREEN: 0,
      RED: 1
    })
  })

  it('tallies multiple matches across different colors on a full grid', () => {
    // All nine slots filled. Three connections built in:
    //  - top_left ↔ top_center (BLUE, horizontal)
    //  - top_center ↔ mid_center (GREEN, vertical)
    //  - mid_center ↔ mid_right (RED, horizontal)
    // Other adjacencies are intentionally non-matching.
    const grid: GearGridDetail = {
      id: 'grid-full',
      pos_top_left: 'tl',
      pos_top_center: 'tc',
      pos_top_right: 'tr',
      pos_mid_left: 'ml',
      pos_mid_center: 'mc',
      pos_mid_right: 'mr',
      pos_bottom_left: 'bl',
      pos_bottom_center: 'bc',
      pos_bottom_right: 'br',
      selected_armor_set_id: null
    }
    const gearMap = {
      tl: makeGear({ affinity_right: 'BLUE' }),
      tc: makeGear({
        affinity_left: 'BLUE',
        affinity_right: null,
        affinity_bottom: 'GREEN'
      }),
      tr: makeGear({ affinity_left: null, affinity_bottom: null }),
      ml: makeGear({ affinity_top: null, affinity_right: null }),
      mc: makeGear({
        affinity_top: 'GREEN',
        affinity_left: null,
        affinity_right: 'RED',
        affinity_bottom: null
      }),
      mr: makeGear({
        affinity_left: 'RED',
        affinity_top: null,
        affinity_bottom: null
      }),
      bl: makeGear({ affinity_top: null, affinity_right: null }),
      bc: makeGear({ affinity_top: null, affinity_left: null }),
      br: makeGear({ affinity_top: null, affinity_left: null })
    }

    expect(computeAffinityCounts(grid, gearMap)).toEqual({
      BLUE: 1,
      GREEN: 1,
      RED: 1
    })
  })

  it('counts the same color twice when two independent connections share it', () => {
    // top_left ↔ top_center (BLUE) and mid_left ↔ mid_center (BLUE).
    const grid: GearGridDetail = {
      ...emptyGrid(),
      pos_top_left: 'tl',
      pos_top_center: 'tc',
      pos_mid_left: 'ml',
      pos_mid_center: 'mc'
    }
    const gearMap = {
      tl: makeGear({ affinity_right: 'BLUE' }),
      tc: makeGear({ affinity_left: 'BLUE', affinity_bottom: null }),
      ml: makeGear({ affinity_right: 'BLUE', affinity_top: null }),
      mc: makeGear({ affinity_left: 'BLUE', affinity_top: null })
    }

    expect(computeAffinityCounts(grid, gearMap)).toEqual({
      BLUE: 2,
      GREEN: 0,
      RED: 0
    })
  })
})

describe('computeEmbarkGearShortages', () => {
  /**
   * Build a {@link SurvivorDetail} stub that only carries the gear grid the
   * embark helper consumes.
   */
  function makeSurvivor(
    id: string,
    grid: GearGridDetail | null
  ): SurvivorDetail {
    return {
      id,
      gear_grid: grid
    } as unknown as SurvivorDetail
  }

  /**
   * Build a {@link SettlementDetail.gear} row stub.
   */
  function makeSettlementGearRow(
    gearId: string,
    gearName: string,
    quantity: number
  ): SettlementDetail['gear'][number] {
    return {
      id: `sg-${gearId}`,
      gear_id: gearId,
      gear_name: gearName,
      quantity,
      custom: false,
      author_user_id: null,
      author_username: null,
      author_avatar_url: null
    }
  }

  function gridWith(overrides: Partial<GearGridDetail>): GearGridDetail {
    return {
      id: 'grid',
      pos_top_left: null,
      pos_top_center: null,
      pos_top_right: null,
      pos_mid_left: null,
      pos_mid_center: null,
      pos_mid_right: null,
      pos_bottom_left: null,
      pos_bottom_center: null,
      pos_bottom_right: null,
      selected_armor_set_id: null,
      ...overrides
    }
  }

  it('returns no shortages when nobody is embarking', () => {
    expect(
      computeEmbarkGearShortages(
        [],
        [makeSettlementGearRow('bone-axe', 'Bone Axe', 1)]
      )
    ).toEqual([])
  })

  it('returns no shortages when supply meets demand exactly', () => {
    const survivors = [
      makeSurvivor('s1', gridWith({ pos_top_left: 'bone-axe' }))
    ]

    expect(
      computeEmbarkGearShortages(survivors, [
        makeSettlementGearRow('bone-axe', 'Bone Axe', 1)
      ])
    ).toEqual([])
  })

  it('returns no shortages when only some embarking survivors carry the gear', () => {
    const survivors = [
      makeSurvivor('s1', gridWith({ pos_top_left: 'bone-axe' })),
      makeSurvivor('s2', null),
      makeSurvivor('s3', gridWith({}))
    ]

    expect(
      computeEmbarkGearShortages(survivors, [
        makeSettlementGearRow('bone-axe', 'Bone Axe', 1)
      ])
    ).toEqual([])
  })

  it('reports a shortage when two embarking survivors equip the same single-stock gear', () => {
    const survivors = [
      makeSurvivor('s1', gridWith({ pos_top_left: 'bone-axe' })),
      makeSurvivor('s2', gridWith({ pos_top_left: 'bone-axe' }))
    ]

    expect(
      computeEmbarkGearShortages(survivors, [
        makeSettlementGearRow('bone-axe', 'Bone Axe', 1)
      ])
    ).toEqual([
      { gear_id: 'bone-axe', gear_name: 'Bone Axe', available: 1, needed: 2 }
    ])
  })

  it('counts duplicates within a single survivor grid', () => {
    const survivors = [
      makeSurvivor(
        's1',
        gridWith({ pos_top_left: 'bone-axe', pos_mid_center: 'bone-axe' })
      )
    ]

    expect(
      computeEmbarkGearShortages(survivors, [
        makeSettlementGearRow('bone-axe', 'Bone Axe', 1)
      ])
    ).toEqual([
      { gear_id: 'bone-axe', gear_name: 'Bone Axe', available: 1, needed: 2 }
    ])
  })

  it('reports gear that is missing from settlement storage entirely', () => {
    const survivors = [
      makeSurvivor('s1', gridWith({ pos_top_left: 'phantom-blade' }))
    ]

    expect(computeEmbarkGearShortages(survivors, [])).toEqual([
      {
        gear_id: 'phantom-blade',
        gear_name: 'Unknown Gear',
        available: 0,
        needed: 1
      }
    ])
  })

  it('returns shortages sorted alphabetically by gear name', () => {
    const survivors = [
      makeSurvivor(
        's1',
        gridWith({ pos_top_left: 'rawhide', pos_mid_center: 'bone-axe' })
      ),
      makeSurvivor(
        's2',
        gridWith({ pos_top_left: 'rawhide', pos_mid_center: 'bone-axe' })
      )
    ]

    const result = computeEmbarkGearShortages(survivors, [
      makeSettlementGearRow('rawhide', 'Rawhide Vest', 1),
      makeSettlementGearRow('bone-axe', 'Bone Axe', 1)
    ])

    expect(result).toEqual([
      { gear_id: 'bone-axe', gear_name: 'Bone Axe', available: 1, needed: 2 },
      {
        gear_id: 'rawhide',
        gear_name: 'Rawhide Vest',
        available: 1,
        needed: 2
      }
    ])
  })

  it('skips survivors with no gear grid', () => {
    const survivors = [makeSurvivor('s1', null), makeSurvivor('s2', null)]

    expect(
      computeEmbarkGearShortages(survivors, [
        makeSettlementGearRow('bone-axe', 'Bone Axe', 0)
      ])
    ).toEqual([])
  })
})

/**
 * Build a minimal {@link ArmorSetDetail} stub with the given slot definitions.
 */
function makeArmorSet(
  id: string,
  name: string,
  slots: { id: string; required?: boolean; gear_ids: string[] }[],
  bonuses: string | null = null
): ArmorSetDetail {
  return {
    id,
    custom: false,
    armor_set_name: name,
    bonuses,
    slots: slots.map((slot, index) => ({
      id: slot.id,
      slot_name: slot.id,
      slot_order: index,
      required: slot.required ?? true,
      gear_ids: slot.gear_ids
    }))
  }
}

describe('getEquippedGearIds', () => {
  it('returns empty set for null grid', () => {
    expect(getEquippedGearIds(null).size).toBe(0)
  })

  it('deduplicates gear ids across slots', () => {
    const grid: GearGridDetail = {
      ...emptyGrid(),
      pos_top_left: 'a',
      pos_top_center: 'a',
      pos_mid_center: 'b'
    }

    expect([...getEquippedGearIds(grid)].sort()).toEqual(['a', 'b'])
  })
})

describe('armorSetQualifies', () => {
  it('returns true when every required slot has a candidate equipped', () => {
    const set = makeArmorSet('set-1', 'Set 1', [
      { id: 'head', gear_ids: ['helm'] },
      { id: 'chest', gear_ids: ['plate', 'tunic'] }
    ])

    expect(armorSetQualifies(set, new Set(['helm', 'tunic']))).toBe(true)
  })

  it('returns false when a required slot has no matching gear', () => {
    const set = makeArmorSet('set-1', 'Set 1', [
      { id: 'head', gear_ids: ['helm'] },
      { id: 'chest', gear_ids: ['plate'] }
    ])

    expect(armorSetQualifies(set, new Set(['helm']))).toBe(false)
  })

  it('ignores optional (non-required) slots', () => {
    const set = makeArmorSet('set-1', 'Set 1', [
      { id: 'head', gear_ids: ['helm'] },
      { id: 'cape', required: false, gear_ids: ['cape'] }
    ])

    expect(armorSetQualifies(set, new Set(['helm']))).toBe(true)
  })

  it('trivially qualifies when the set has no slots', () => {
    const set = makeArmorSet('set-empty', 'Empty', [])

    expect(armorSetQualifies(set, new Set())).toBe(true)
  })
})

describe('getQualifyingArmorSets', () => {
  it('returns sets sorted alphabetically by name', () => {
    const setA = makeArmorSet('a', 'Lantern Vigil', [
      { id: 'head', gear_ids: ['helm'] }
    ])
    const setB = makeArmorSet('b', 'Bone Aegis', [
      { id: 'chest', gear_ids: ['bone-chest'] }
    ])
    const setC = makeArmorSet('c', 'Phoenix Plate', [
      { id: 'arms', gear_ids: ['phoenix-arms'] }
    ])

    const grid: GearGridDetail = {
      ...emptyGrid(),
      pos_top_left: 'helm',
      pos_top_center: 'bone-chest'
    }

    const result = getQualifyingArmorSets(grid, [setA, setB, setC])

    expect(result.map((s) => s.armor_set_name)).toEqual([
      'Bone Aegis',
      'Lantern Vigil'
    ])
  })

  it('returns empty list when grid is null', () => {
    const set = makeArmorSet('a', 'A', [{ id: 'head', gear_ids: ['helm'] }])

    expect(getQualifyingArmorSets(null, [set])).toEqual([])
  })
})

describe('clothedAndSatiatedQualifies', () => {
  it('returns false when grid has fewer than 3 distinct armor locations', () => {
    const grid: GearGridDetail = {
      ...emptyGrid(),
      pos_top_left: 'helm',
      pos_top_center: 'plate'
    }

    const gearMap = {
      helm: makeGear({ id: 'helm', armor_location: 'HEAD' }),
      plate: makeGear({ id: 'plate', armor_location: 'CHEST' })
    }

    expect(clothedAndSatiatedQualifies(grid, gearMap)).toBe(false)
  })

  it('returns true when 3 distinct armor locations are equipped', () => {
    const grid: GearGridDetail = {
      ...emptyGrid(),
      pos_top_left: 'helm',
      pos_top_center: 'plate',
      pos_top_right: 'gauntlet'
    }

    const gearMap = {
      helm: makeGear({ id: 'helm', armor_location: 'HEAD' }),
      plate: makeGear({ id: 'plate', armor_location: 'CHEST' }),
      gauntlet: makeGear({ id: 'gauntlet', armor_location: 'ARMS' })
    }

    expect(clothedAndSatiatedQualifies(grid, gearMap)).toBe(true)
  })

  it('only counts unique armor locations', () => {
    const grid: GearGridDetail = {
      ...emptyGrid(),
      pos_top_left: 'helm-a',
      pos_top_center: 'helm-b',
      pos_top_right: 'helm-c'
    }

    const gearMap = {
      'helm-a': makeGear({ id: 'helm-a', armor_location: 'HEAD' }),
      'helm-b': makeGear({ id: 'helm-b', armor_location: 'HEAD' }),
      'helm-c': makeGear({ id: 'helm-c', armor_location: 'HEAD' })
    }

    expect(clothedAndSatiatedQualifies(grid, gearMap)).toBe(false)
  })
})

describe('getEffectiveArmorSetBonuses', () => {
  it('returns qualifying catalog sets and suppresses the fallback', () => {
    const set = makeArmorSet('set', 'Lantern Vigil', [
      { id: 'head', gear_ids: ['helm'] }
    ])

    const grid: GearGridDetail = {
      ...emptyGrid(),
      pos_top_left: 'helm',
      pos_top_center: 'plate',
      pos_top_right: 'gauntlet'
    }

    const gearMap = {
      helm: makeGear({ id: 'helm', armor_location: 'HEAD' }),
      plate: makeGear({ id: 'plate', armor_location: 'CHEST' }),
      gauntlet: makeGear({ id: 'gauntlet', armor_location: 'ARMS' })
    }

    const result = getEffectiveArmorSetBonuses(grid, [set], gearMap)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Lantern Vigil')
    expect(result[0].isFallback).toBe(false)
    // Sole qualifying set is implicitly selected.
    expect(result[0].selected).toBe(true)
  })

  it('returns the Clothed & Satiated fallback when no catalog set qualifies', () => {
    const set = makeArmorSet('set', 'Lantern Vigil', [
      { id: 'head', gear_ids: ['rare-helm'] }
    ])

    const grid: GearGridDetail = {
      ...emptyGrid(),
      pos_top_left: 'helm',
      pos_top_center: 'plate',
      pos_top_right: 'gauntlet'
    }

    const gearMap = {
      helm: makeGear({ id: 'helm', armor_location: 'HEAD' }),
      plate: makeGear({ id: 'plate', armor_location: 'CHEST' }),
      gauntlet: makeGear({ id: 'gauntlet', armor_location: 'ARMS' })
    }

    const result = getEffectiveArmorSetBonuses(grid, [set], gearMap)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe(CLOTHED_AND_SATIATED_NAME)
    expect(result[0].isFallback).toBe(true)
    expect(result[0].armorSet).toBeNull()
    expect(result[0].selected).toBe(true)
  })

  it('returns nothing when neither a catalog set nor the fallback qualifies', () => {
    const set = makeArmorSet('set', 'Lantern Vigil', [
      { id: 'head', gear_ids: ['rare-helm'] }
    ])

    const grid: GearGridDetail = {
      ...emptyGrid(),
      pos_top_left: 'helm'
    }

    const gearMap = {
      helm: makeGear({ id: 'helm', armor_location: 'HEAD' })
    }

    expect(getEffectiveArmorSetBonuses(grid, [set], gearMap)).toEqual([])
  })

  it('marks the survivor-selected catalog set as active', () => {
    const setA = makeArmorSet('set-a', 'Aaa Set', [
      { id: 'head-a', gear_ids: ['helm'] }
    ])
    const setB = makeArmorSet('set-b', 'Bbb Set', [
      { id: 'head-b', gear_ids: ['helm'] }
    ])

    const grid: GearGridDetail = {
      ...emptyGrid(),
      pos_top_left: 'helm',
      selected_armor_set_id: 'set-b'
    }

    const gearMap = {
      helm: makeGear({ id: 'helm', armor_location: 'HEAD' })
    }

    const result = getEffectiveArmorSetBonuses(grid, [setA, setB], gearMap)

    expect(result).toHaveLength(2)
    const byId = Object.fromEntries(
      result.map((b) => [b.armorSet?.id ?? b.name, b.selected])
    )
    expect(byId['set-b']).toBe(true)
    expect(byId['set-a']).toBe(false)
  })

  it('falls back to the first qualifying set when the explicit selection no longer qualifies', () => {
    const setA = makeArmorSet('set-a', 'Aaa Set', [
      { id: 'head-a', gear_ids: ['helm'] }
    ])
    const setB = makeArmorSet('set-b', 'Bbb Set', [
      { id: 'head-b', gear_ids: ['helm'] }
    ])

    const grid: GearGridDetail = {
      ...emptyGrid(),
      pos_top_left: 'helm',
      // Stale id that points at a set the survivor no longer qualifies for.
      selected_armor_set_id: 'set-stale'
    }

    const gearMap = {
      helm: makeGear({ id: 'helm', armor_location: 'HEAD' })
    }

    const result = getEffectiveArmorSetBonuses(grid, [setA, setB], gearMap)

    expect(result).toHaveLength(2)
    expect(result[0].armorSet?.id).toBe('set-a')
    expect(result[0].selected).toBe(true)
    expect(result[1].selected).toBe(false)
  })
})
