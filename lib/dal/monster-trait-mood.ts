import { resolveMoodNames } from '@/lib/dal/mood'
import { resolveSurvivorStatusNames } from '@/lib/dal/survivor-status'
import { resolveTraitNames } from '@/lib/dal/trait'
import { createClient } from '@/lib/supabase/client'

/**
 * Monster Junction Table Names
 *
 * The junction tables that associate monster-bearing rows with traits, moods,
 * and survivor statuses. Shared by hunts, showdowns, and the custom
 * quarry/nemesis level editor.
 */
type JunctionTable =
  | 'hunt_monster_trait'
  | 'hunt_monster_mood'
  | 'hunt_monster_survivor_status'
  | 'showdown_monster_trait'
  | 'showdown_monster_mood'
  | 'showdown_monster_survivor_status'
  | 'encounter_active_monster_trait'
  | 'encounter_active_monster_mood'
  | 'quarry_level_trait'
  | 'quarry_level_mood'
  | 'quarry_level_survivor_status'
  | 'nemesis_level_trait'
  | 'nemesis_level_mood'
  | 'nemesis_level_survivor_status'
  | 'encounter_monster_level_trait'
  | 'encounter_monster_level_mood'

/** Mapping from junction table → (parent FK column, catalog FK column). */
const COLUMNS: Record<
  JunctionTable,
  { parent: string; catalog: 'trait_id' | 'mood_id' | 'survivor_status_id' }
> = {
  hunt_monster_trait: { parent: 'hunt_monster_id', catalog: 'trait_id' },
  hunt_monster_mood: { parent: 'hunt_monster_id', catalog: 'mood_id' },
  hunt_monster_survivor_status: {
    parent: 'hunt_monster_id',
    catalog: 'survivor_status_id'
  },
  showdown_monster_trait: {
    parent: 'showdown_monster_id',
    catalog: 'trait_id'
  },
  showdown_monster_mood: { parent: 'showdown_monster_id', catalog: 'mood_id' },
  showdown_monster_survivor_status: {
    parent: 'showdown_monster_id',
    catalog: 'survivor_status_id'
  },
  encounter_active_monster_trait: {
    parent: 'encounter_active_monster_id',
    catalog: 'trait_id'
  },
  encounter_active_monster_mood: {
    parent: 'encounter_active_monster_id',
    catalog: 'mood_id'
  },
  quarry_level_trait: { parent: 'quarry_level_id', catalog: 'trait_id' },
  quarry_level_mood: { parent: 'quarry_level_id', catalog: 'mood_id' },
  quarry_level_survivor_status: {
    parent: 'quarry_level_id',
    catalog: 'survivor_status_id'
  },
  nemesis_level_trait: { parent: 'nemesis_level_id', catalog: 'trait_id' },
  nemesis_level_mood: { parent: 'nemesis_level_id', catalog: 'mood_id' },
  nemesis_level_survivor_status: {
    parent: 'nemesis_level_id',
    catalog: 'survivor_status_id'
  },
  encounter_monster_level_trait: {
    parent: 'encounter_monster_level_id',
    catalog: 'trait_id'
  },
  encounter_monster_level_mood: {
    parent: 'encounter_monster_level_id',
    catalog: 'mood_id'
  }
}

/**
 * Sync Monster Trait/Mood Junction Rows
 *
 * Reconciles the junction rows for a given parent row against an updated list
 * of catalog IDs. Missing links are inserted; stale links are removed. Order
 * of the input is not preserved (the junction is a set).
 *
 * @param table Junction Table Name
 * @param parentId Parent Row ID (hunt_monster / showdown_monster / *_level)
 * @param catalogIds Desired catalog row IDs
 */
async function syncJunction(
  table: JunctionTable,
  parentId: string,
  catalogIds: string[]
): Promise<void> {
  const supabase = createClient()
  const { parent, catalog } = COLUMNS[table]

  const { data: current, error: fetchError } = await supabase
    .from(table)
    .select(`id, ${catalog}`)
    .eq(parent, parentId)

  if (fetchError)
    throw new Error(`Error Fetching ${table} Junctions: ${fetchError.message}`)

  const desired = new Set(catalogIds)
  const currentByCatalog = new Map<string, string>()
  for (const row of current ?? [])
    currentByCatalog.set(
      (row as unknown as Record<string, string>)[catalog],
      (row as unknown as { id: string }).id
    )

  // Rows to delete — present but no longer desired.
  const toDeleteIds: string[] = []
  for (const [catId, rowId] of currentByCatalog)
    if (!desired.has(catId)) toDeleteIds.push(rowId)

  // Rows to insert — desired but not currently present.
  const toInsert: Record<string, string>[] = []
  for (const catId of desired)
    if (!currentByCatalog.has(catId))
      toInsert.push({ [parent]: parentId, [catalog]: catId })

  if (toDeleteIds.length > 0) {
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .in('id', toDeleteIds)

    if (deleteError)
      throw new Error(
        `Error Removing ${table} Junctions: ${deleteError.message}`
      )
  }

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase.from(table).insert(toInsert)
    if (insertError)
      throw new Error(`Error Adding ${table} Junctions: ${insertError.message}`)
  }
}

/**
 * Sync Monster Traits
 *
 * Resolves the given trait names (reusing existing rows where possible, else
 * creating new custom traits owned by the current user), then reconciles the
 * supplied parent row's trait-junction entries against the resolved IDs.
 *
 * @param table Trait junction table
 * @param parentId Parent row ID
 * @param traitNames Desired trait names
 */
export async function syncMonsterTraits(
  table: Extract<JunctionTable, `${string}_trait`>,
  parentId: string,
  traitNames: string[]
): Promise<void> {
  const ids = await resolveTraitNames(traitNames)
  await syncJunction(table, parentId, ids)
}

/**
 * Sync Monster Moods
 *
 * Resolves the given mood names (reusing existing rows where possible, else
 * creating new custom moods owned by the current user), then reconciles the
 * supplied parent row's mood-junction entries against the resolved IDs.
 *
 * @param table Mood junction table
 * @param parentId Parent row ID
 * @param moodNames Desired mood names
 */
export async function syncMonsterMoods(
  table: Extract<JunctionTable, `${string}_mood`>,
  parentId: string,
  moodNames: string[]
): Promise<void> {
  const ids = await resolveMoodNames(moodNames)
  await syncJunction(table, parentId, ids)
}

/**
 * Sync Monster Survivor Statuses
 *
 * Resolves the given survivor status names (reusing existing rows where
 * possible, else creating new custom statuses owned by the current user),
 * then reconciles the supplied parent row's survivor-status-junction entries
 * against the resolved IDs.
 *
 * @param table Survivor status junction table
 * @param parentId Parent row ID
 * @param statusNames Desired survivor status names
 */
export async function syncMonsterSurvivorStatuses(
  table: Extract<JunctionTable, `${string}_survivor_status`>,
  parentId: string,
  statusNames: string[]
): Promise<void> {
  const ids = await resolveSurvivorStatusNames(statusNames)
  await syncJunction(table, parentId, ids)
}

/**
 * Copy Monster Junctions
 *
 * Duplicates the trait/mood junction rows from a source parent row to a
 * destination parent row. Used when promoting a hunt monster into a showdown
 * monster (or any analogous copy), so the destination receives the same
 * catalog links without re-resolving names.
 *
 * @param source Source junction table + parent ID
 * @param destination Destination junction table + parent ID
 */
export async function copyMonsterJunctions(
  source: { table: JunctionTable; parentId: string },
  destination: { table: JunctionTable; parentId: string }
): Promise<void> {
  const supabase = createClient()
  const srcCols = COLUMNS[source.table]
  const dstCols = COLUMNS[destination.table]

  if (srcCols.catalog !== dstCols.catalog)
    throw new Error(
      `Cannot copy between ${source.table} and ${destination.table}: catalog mismatch`
    )

  const { data: rows, error } = await supabase
    .from(source.table)
    .select(srcCols.catalog)
    .eq(srcCols.parent, source.parentId)

  if (error) throw new Error(`Error Reading ${source.table}: ${error.message}`)

  const inserts = (rows ?? []).map((r) => ({
    [dstCols.parent]: destination.parentId,
    [dstCols.catalog]: (r as unknown as Record<string, string>)[srcCols.catalog]
  }))

  if (inserts.length === 0) return

  const { error: insertError } = await supabase
    .from(destination.table)
    .insert(inserts)

  if (insertError)
    throw new Error(
      `Error Writing ${destination.table}: ${insertError.message}`
    )
}
