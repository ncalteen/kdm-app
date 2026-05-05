import { Database } from '@/lib/database.types'
import {
  ArmorSetDetail,
  GearDetail,
  GearGridDetail,
  GearGridPosition,
  SettlementDetail,
  SurvivorDetail
} from '@/lib/types'

/** Affinity Color (re-exported for convenience). */
export type Affinity = Database['public']['Enums']['affinity']

/** All Affinity Colors */
export const AFFINITIES: readonly Affinity[] = ['BLUE', 'GREEN', 'RED'] as const

/**
 * Affinity Counts
 *
 * Tally of valid affinity connections per color across the gear grid.
 */
export type AffinityCounts = { [key in Affinity]: number }

/**
 * Empty Affinity Counts
 *
 * Returns a fresh tally with every color set to zero.
 *
 * @returns Empty Affinity Counts
 */
export function emptyAffinityCounts(): AffinityCounts {
  return { BLUE: 0, GREEN: 0, RED: 0 }
}

/**
 * Grid Position Order
 *
 * Reading order for the nine slots, used when iterating over the grid in a
 * UI-friendly sequence (top-left → bottom-right).
 */
export const GRID_POSITIONS: readonly GearGridPosition[] = [
  'top_left',
  'top_center',
  'top_right',
  'mid_left',
  'mid_center',
  'mid_right',
  'bottom_left',
  'bottom_center',
  'bottom_right'
] as const

/**
 * Position Column Map
 *
 * Maps each {@link GearGridPosition} to the corresponding `gear_grid` column
 * name on {@link GearGridDetail}.
 */
const POSITION_COLUMN: { [key in GearGridPosition]: keyof GearGridDetail } = {
  top_left: 'pos_top_left',
  top_center: 'pos_top_center',
  top_right: 'pos_top_right',
  mid_left: 'pos_mid_left',
  mid_center: 'pos_mid_center',
  mid_right: 'pos_mid_right',
  bottom_left: 'pos_bottom_left',
  bottom_center: 'pos_bottom_center',
  bottom_right: 'pos_bottom_right'
}

/**
 * Get Gear Id At Position
 *
 * Returns the gear ID stored in the given slot, or null when the grid is
 * absent or the slot is empty.
 *
 * @param grid Gear Grid (or null)
 * @param position Grid Position
 * @returns Gear ID or null
 */
export function getGearIdAtPosition(
  grid: GearGridDetail | null,
  position: GearGridPosition
): string | null {
  if (!grid) return null

  const column = POSITION_COLUMN[position]
  const value = grid[column]

  return typeof value === 'string' ? value : null
}

/**
 * Adjacent Pair
 *
 * One of the twelve edges between adjacent slots in a 3x3 grid. Each pair
 * tracks the two positions involved and the affinity slot on each piece that
 * must match for the connection to count.
 */
interface AdjacentPair {
  /** First Position */
  a: GearGridPosition
  /** Second Position */
  b: GearGridPosition
  /** Affinity Slot on `a` That Faces `b` */
  aSlot: 'affinity_top' | 'affinity_left' | 'affinity_right' | 'affinity_bottom'
  /** Affinity Slot on `b` That Faces `a` */
  bSlot: 'affinity_top' | 'affinity_left' | 'affinity_right' | 'affinity_bottom'
}

/**
 * Adjacent Pairs
 *
 * The twelve unique adjacency edges in a 3x3 grid (six horizontal, six
 * vertical), with each side annotated with the affinity slot that participates
 * in the match. Pairs are listed once — order within a pair is not significant
 * for the totals.
 */
export const ADJACENT_PAIRS: readonly AdjacentPair[] = [
  // Horizontal — top row
  {
    a: 'top_left',
    b: 'top_center',
    aSlot: 'affinity_right',
    bSlot: 'affinity_left'
  },
  {
    a: 'top_center',
    b: 'top_right',
    aSlot: 'affinity_right',
    bSlot: 'affinity_left'
  },
  // Horizontal — middle row
  {
    a: 'mid_left',
    b: 'mid_center',
    aSlot: 'affinity_right',
    bSlot: 'affinity_left'
  },
  {
    a: 'mid_center',
    b: 'mid_right',
    aSlot: 'affinity_right',
    bSlot: 'affinity_left'
  },
  // Horizontal — bottom row
  {
    a: 'bottom_left',
    b: 'bottom_center',
    aSlot: 'affinity_right',
    bSlot: 'affinity_left'
  },
  {
    a: 'bottom_center',
    b: 'bottom_right',
    aSlot: 'affinity_right',
    bSlot: 'affinity_left'
  },
  // Vertical — left column
  {
    a: 'top_left',
    b: 'mid_left',
    aSlot: 'affinity_bottom',
    bSlot: 'affinity_top'
  },
  {
    a: 'mid_left',
    b: 'bottom_left',
    aSlot: 'affinity_bottom',
    bSlot: 'affinity_top'
  },
  // Vertical — middle column
  {
    a: 'top_center',
    b: 'mid_center',
    aSlot: 'affinity_bottom',
    bSlot: 'affinity_top'
  },
  {
    a: 'mid_center',
    b: 'bottom_center',
    aSlot: 'affinity_bottom',
    bSlot: 'affinity_top'
  },
  // Vertical — right column
  {
    a: 'top_right',
    b: 'mid_right',
    aSlot: 'affinity_bottom',
    bSlot: 'affinity_top'
  },
  {
    a: 'mid_right',
    b: 'bottom_right',
    aSlot: 'affinity_bottom',
    bSlot: 'affinity_top'
  }
] as const

/**
 * Compute Affinity Counts
 *
 * Tallies how many valid affinity connections of each color exist on the
 * supplied gear grid. A connection is valid when:
 *
 *   - Both adjacent slots contain gear that's resolvable in the supplied
 *     `gearMap`.
 *   - The affinity slot on each piece that faces the other is the same non-null
 *     color.
 *
 * Per the rules, only the colors on `affinity_top` / `affinity_left` /
 * `affinity_right` / `affinity_bottom` participate. Affinity bonus
 * requirements (which may carry a `puzzle` flag) are not evaluated here.
 *
 * @param grid Gear Grid (or null when the survivor has no grid yet)
 * @param gearMap Lookup of GearDetail by gear ID
 * @returns Affinity Counts Per Color
 */
export function computeAffinityCounts(
  grid: GearGridDetail | null,
  gearMap: { [key: string]: GearDetail }
): AffinityCounts {
  const counts = emptyAffinityCounts()

  if (!grid) return counts

  for (const pair of ADJACENT_PAIRS) {
    const aId = getGearIdAtPosition(grid, pair.a)
    const bId = getGearIdAtPosition(grid, pair.b)

    if (!aId || !bId) continue

    const aGear = gearMap[aId]
    const bGear = gearMap[bId]

    if (!aGear || !bGear) continue

    const aColor = aGear[pair.aSlot]
    const bColor = bGear[pair.bSlot]

    if (aColor && bColor && aColor === bColor) counts[aColor] += 1
  }

  return counts
}

/**
 * Embark Gear Shortage
 *
 * One entry of the {@link computeEmbarkGearShortages} result. Identifies a
 * gear item whose total quantity equipped across the embarking survivors
 * exceeds what the settlement currently has in storage.
 */
export interface EmbarkGearShortage {
  /** Gear ID */
  gear_id: string
  /** Gear Name (resolved from settlement storage when available) */
  gear_name: string
  /** Settlement Quantity Available */
  available: number
  /** Total Quantity Required by the Embarking Survivors */
  needed: number
}

/**
 * Count Gear In Grid
 *
 * Tallies how many times each gear ID appears across all nine slots of the
 * supplied grid.
 *
 * @param grid Gear Grid (or null)
 * @returns Map of Gear ID → Count
 */
function countGearInGrid(grid: GearGridDetail | null): {
  [gearId: string]: number
} {
  const counts: { [gearId: string]: number } = {}

  if (!grid) return counts

  for (const position of GRID_POSITIONS) {
    const gearId = getGearIdAtPosition(grid, position)
    if (!gearId) continue
    counts[gearId] = (counts[gearId] ?? 0) + 1
  }

  return counts
}

/**
 * Compute Embark Gear Shortages
 *
 * Aggregates the gear demand from the gear grids of every embarking survivor
 * and compares it to the settlement's current gear stock. Returns one
 * {@link EmbarkGearShortage} entry for each gear whose combined demand
 * exceeds the available quantity.
 *
 * The check is intentionally permissive: gear that's not present in the
 * settlement at all is still reported (with `available: 0`) so the caller can
 * surface the same "stores cannot bear this burden" error to the user. Gear
 * that the embarking survivors collectively need at-or-below the available
 * quantity is omitted from the result.
 *
 * @param embarkingSurvivors Survivors Embarking on the Hunt or Showdown
 * @param settlementGear Settlement's Current Gear Stock
 * @returns Embark Gear Shortages (empty when supply meets demand)
 */
export function computeEmbarkGearShortages(
  embarkingSurvivors: Pick<SurvivorDetail, 'gear_grid'>[],
  settlementGear: SettlementDetail['gear']
): EmbarkGearShortage[] {
  const demand: { [gearId: string]: number } = {}

  for (const survivor of embarkingSurvivors) {
    const gridCounts = countGearInGrid(survivor.gear_grid ?? null)
    for (const [gearId, count] of Object.entries(gridCounts))
      demand[gearId] = (demand[gearId] ?? 0) + count
  }

  const stockByGearId = new Map<
    string,
    { gear_name: string; quantity: number }
  >()

  for (const row of settlementGear)
    stockByGearId.set(row.gear_id, {
      gear_name: row.gear_name,
      quantity: row.quantity
    })

  const shortages: EmbarkGearShortage[] = []

  for (const [gearId, needed] of Object.entries(demand)) {
    const stock = stockByGearId.get(gearId)
    const available = stock?.quantity ?? 0

    if (needed > available)
      shortages.push({
        gear_id: gearId,
        gear_name: stock?.gear_name ?? 'Unknown Gear',
        available,
        needed
      })
  }

  // Sort alphabetically for stable user-facing output.
  shortages.sort((a, b) => a.gear_name.localeCompare(b.gear_name))

  return shortages
}

/**
 * Get Equipped Gear IDs
 *
 * Returns the set of unique gear IDs currently equipped on the supplied gear
 * grid. Empty slots are ignored. Used by armor-set qualification helpers.
 *
 * @param grid Gear Grid (or null)
 * @returns Set of Equipped Gear IDs
 */
export function getEquippedGearIds(grid: GearGridDetail | null): Set<string> {
  const ids = new Set<string>()

  if (!grid) return ids

  for (const position of GRID_POSITIONS) {
    const gearId = getGearIdAtPosition(grid, position)

    if (gearId) ids.add(gearId)
  }

  return ids
}

/**
 * Armor Set Qualifies
 *
 * Mirrors the database `armor_set_qualifies` helper introduced in the armor
 * set slot migration. Returns true when every required slot of the supplied
 * `armorSet` has at least one of its candidate gear pieces present in
 * `equippedGearIds`. Optional (non-required) slots are ignored. Sets without
 * any required slots trivially qualify.
 *
 * Keeping the rule in sync with the database lets the UI surface qualifying
 * sets without an additional round-trip per set.
 *
 * @param armorSet Armor Set Detail
 * @param equippedGearIds Currently Equipped Gear IDs
 * @returns Whether the Survivor Qualifies for the Set's Bonus
 */
export function armorSetQualifies(
  armorSet: ArmorSetDetail,
  equippedGearIds: ReadonlySet<string>
): boolean {
  for (const slot of armorSet.slots) {
    if (!slot.required) continue

    const satisfied = slot.gear_ids.some((id) => equippedGearIds.has(id))
    if (!satisfied) return false
  }

  return true
}

/**
 * Get Qualifying Armor Sets
 *
 * Returns every armor set whose required slots are satisfied by the supplied
 * gear grid. The list is sorted alphabetically by name for stable display.
 *
 * @param grid Gear Grid (or null when the survivor has no grid yet)
 * @param armorSets Armor Sets to Evaluate
 * @returns Qualifying Armor Sets
 */
export function getQualifyingArmorSets(
  grid: GearGridDetail | null,
  armorSets: ArmorSetDetail[]
): ArmorSetDetail[] {
  if (!grid || armorSets.length === 0) return []

  const equipped = getEquippedGearIds(grid)
  if (equipped.size === 0) return []

  const qualifying = armorSets.filter((set) => armorSetQualifies(set, equipped))

  qualifying.sort((a, b) => a.armor_set_name.localeCompare(b.armor_set_name))

  return qualifying
}

/** Display Name for the Fallback Armor Set Bonus */
export const CLOTHED_AND_SATIATED_NAME = 'Clothed & Satiated' as const

/**
 * Clothed & Satiated Bonus Description
 *
 * Mirrors the canonical Kingdom Death rules text so the card can render the
 * same description used for catalog armor sets.
 */
export const CLOTHED_AND_SATIATED_BONUS =
  'A survivor wearing 3 or more pieces of armor (each in a different armor ' +
  'location) qualifies for the Clothed & Satiated bonus when they do not ' +
  'qualify for any other armor set bonus.'

/**
 * Clothed & Satiated Qualifies
 *
 * Returns true when the gear grid has at least three pieces of equipped gear
 * occupying three different armor locations (HEAD/CHEST/ARMS/WAIST/FEET).
 * The fallback bonus only applies when no other armor set qualifies — that
 * exclusivity is the caller's responsibility (see
 * {@link getEffectiveArmorSetBonuses}).
 *
 * @param grid Gear Grid (or null)
 * @param gearMap Lookup of GearDetail by Gear ID
 * @returns Whether the Survivor Qualifies for the Fallback Bonus
 */
export function clothedAndSatiatedQualifies(
  grid: GearGridDetail | null,
  gearMap: { [key: string]: GearDetail }
): boolean {
  if (!grid) return false

  const locations = new Set<Database['public']['Enums']['armor_location']>()

  for (const position of GRID_POSITIONS) {
    const gearId = getGearIdAtPosition(grid, position)
    if (!gearId) continue

    const gear = gearMap[gearId]
    if (!gear?.armor_location) continue

    locations.add(gear.armor_location)
  }

  return locations.size >= 3
}

/**
 * Effective Armor Set Bonus
 *
 * One entry returned by {@link getEffectiveArmorSetBonuses}. Either points to
 * a catalog armor set (`armorSet` populated) or describes the synthetic
 * Clothed & Satiated fallback (`armorSet` null with `name` set).
 */
export interface EffectiveArmorSetBonus {
  /** Catalog Armor Set (null for the Clothed & Satiated fallback) */
  armorSet: ArmorSetDetail | null
  /** Display Name (catalog name or `CLOTHED_AND_SATIATED_NAME`) */
  name: string
  /** Bonus Description Shown to the User */
  bonuses: string | null
  /** Whether This Entry Is the Clothed & Satiated Fallback */
  isFallback: boolean
  /**
   * Whether This Entry Is the Survivor's Active Armor Set
   *
   * The active armor set is the one whose bonus rules apply when more than
   * one catalog set qualifies simultaneously. Selection is persisted on the
   * gear grid via `selected_armor_set_id`. When the survivor has not made an
   * explicit pick (or the pick no longer qualifies), the first qualifying
   * catalog set is treated as active. The Clothed & Satiated fallback is
   * always active when surfaced (it only appears when nothing else does).
   */
  selected: boolean
}

/**
 * Get Effective Armor Set Bonuses
 *
 * Returns the armor set bonuses the survivor currently qualifies for. When
 * the survivor qualifies for one or more catalog sets, those entries are
 * returned and the Clothed & Satiated fallback is suppressed. When no
 * catalog set qualifies, the fallback is included if the survivor meets the
 * three-different-armor-locations rule.
 *
 * Exactly one entry is marked `selected: true` when the result is non-empty:
 *   * The catalog set whose ID matches `grid.selected_armor_set_id` (when
 *     that set still qualifies).
 *   * Otherwise the first qualifying catalog set (alphabetical order).
 *   * Otherwise the Clothed & Satiated fallback when it is the sole entry.
 *
 * @param grid Gear Grid (or null)
 * @param armorSets Catalog Armor Sets
 * @param gearMap Lookup of GearDetail by Gear ID
 * @returns Effective Bonuses (alphabetical for catalog sets)
 */
export function getEffectiveArmorSetBonuses(
  grid: GearGridDetail | null,
  armorSets: ArmorSetDetail[],
  gearMap: { [key: string]: GearDetail }
): EffectiveArmorSetBonus[] {
  const qualifying = getQualifyingArmorSets(grid, armorSets)

  if (qualifying.length > 0) {
    const explicitId = grid?.selected_armor_set_id ?? null
    const selectedId =
      explicitId && qualifying.some((set) => set.id === explicitId)
        ? explicitId
        : qualifying[0].id

    return qualifying.map((set) => ({
      armorSet: set,
      name: set.armor_set_name,
      bonuses: set.bonuses,
      isFallback: false,
      selected: set.id === selectedId
    }))
  }

  if (clothedAndSatiatedQualifies(grid, gearMap))
    return [
      {
        armorSet: null,
        name: CLOTHED_AND_SATIATED_NAME,
        bonuses: CLOTHED_AND_SATIATED_BONUS,
        isFallback: true,
        selected: true
      }
    ]

  return []
}
