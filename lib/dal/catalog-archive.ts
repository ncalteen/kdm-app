import { getUserId } from '@/lib/dal/user'
import { createClient } from '@/lib/supabase/client'

/** Catalog Archive Table */
export type CatalogArchiveTable =
  | 'ability_impairment'
  | 'armor_set'
  | 'character'
  | 'collective_cognition_reward'
  | 'constellation'
  | 'disorder'
  | 'fighting_art'
  | 'gear'
  | 'innovation'
  | 'knowledge'
  | 'location'
  | 'milestone'
  | 'mood'
  | 'nemesis'
  | 'neurosis'
  | 'pattern'
  | 'philosophy'
  | 'principle'
  | 'quarry'
  | 'resource'
  | 'secret_fighting_art'
  | 'seed_pattern'
  | 'strain_milestone'
  | 'survivor_status'
  | 'trait'
  | 'wanderer'
  | 'weapon_type'

/** Catalog Archive Item */
export interface CatalogArchiveItem {
  /** Archive Timestamp */
  archived_at: string
  /** Catalog Category Label */
  category: string
  /** Catalog Row ID */
  id: string
  /** Display Name */
  name: string
  /** Catalog Table */
  table: CatalogArchiveTable
}

/** Catalog Permanent Delete Blocked Error */
export class CatalogPermanentDeleteBlockedError extends Error {
  /**
   * Catalog Permanent Delete Blocked Error
   */
  constructor() {
    super('Catalog row is still referenced by a settlement')
    this.name = 'CatalogPermanentDeleteBlockedError'
  }
}

interface CatalogArchiveSpec {
  /** Catalog Category Label */
  category: string
  /** Name Column */
  nameColumn: string
  /** Catalog Table */
  table: CatalogArchiveTable
}

const CATALOG_ARCHIVE_SPECS: CatalogArchiveSpec[] = [
  {
    category: 'Ability/Impairment',
    nameColumn: 'ability_impairment_name',
    table: 'ability_impairment'
  },
  { category: 'Armor Set', nameColumn: 'armor_set_name', table: 'armor_set' },
  { category: 'Character', nameColumn: 'character_name', table: 'character' },
  {
    category: 'Collective Cognition Reward',
    nameColumn: 'reward_name',
    table: 'collective_cognition_reward'
  },
  {
    category: 'Constellation',
    nameColumn: 'constellation_name',
    table: 'constellation'
  },
  { category: 'Disorder', nameColumn: 'disorder_name', table: 'disorder' },
  {
    category: 'Fighting Art',
    nameColumn: 'fighting_art_name',
    table: 'fighting_art'
  },
  { category: 'Gear', nameColumn: 'gear_name', table: 'gear' },
  {
    category: 'Innovation',
    nameColumn: 'innovation_name',
    table: 'innovation'
  },
  { category: 'Knowledge', nameColumn: 'knowledge_name', table: 'knowledge' },
  { category: 'Location', nameColumn: 'location_name', table: 'location' },
  { category: 'Milestone', nameColumn: 'milestone_name', table: 'milestone' },
  { category: 'Mood', nameColumn: 'mood_name', table: 'mood' },
  { category: 'Nemesis', nameColumn: 'monster_name', table: 'nemesis' },
  { category: 'Neurosis', nameColumn: 'neurosis_name', table: 'neurosis' },
  { category: 'Pattern', nameColumn: 'pattern_name', table: 'pattern' },
  {
    category: 'Philosophy',
    nameColumn: 'philosophy_name',
    table: 'philosophy'
  },
  { category: 'Principle', nameColumn: 'principle_name', table: 'principle' },
  { category: 'Quarry', nameColumn: 'monster_name', table: 'quarry' },
  { category: 'Resource', nameColumn: 'resource_name', table: 'resource' },
  {
    category: 'Secret Fighting Art',
    nameColumn: 'secret_fighting_art_name',
    table: 'secret_fighting_art'
  },
  {
    category: 'Seed Pattern',
    nameColumn: 'seed_pattern_name',
    table: 'seed_pattern'
  },
  {
    category: 'Strain Milestone',
    nameColumn: 'strain_milestone_name',
    table: 'strain_milestone'
  },
  {
    category: 'Survivor Status',
    nameColumn: 'survivor_status_name',
    table: 'survivor_status'
  },
  { category: 'Trait', nameColumn: 'trait_name', table: 'trait' },
  { category: 'Wanderer', nameColumn: 'wanderer_name', table: 'wanderer' },
  {
    category: 'Weapon Type',
    nameColumn: 'weapon_type_name',
    table: 'weapon_type'
  }
]

/**
 * Remove Catalog Row
 *
 * Requests deletion for a custom catalog row. The database delete guard decides
 * whether the row can be hard-deleted or must be archived because another
 * settlement still references it.
 *
 * @param table Catalog Table
 * @param id Catalog Row ID
 * @param label Error Label
 */
export async function removeCatalogRow(
  table: CatalogArchiveTable,
  id: string,
  label: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from(table).delete().eq('id', id)

  if (error) throw new Error(`Error Removing ${label}: ${error.message}`)
}

/**
 * Restore Catalog Row
 *
 * Clears a catalog row's archive timestamp so it returns to the user's active
 * custom content library.
 *
 * @param table Catalog Table
 * @param id Catalog Row ID
 */
export async function restoreCatalogRow(
  table: CatalogArchiveTable,
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from(table)
    .update({ archived_at: null })
    .eq('id', id)

  if (error) throw new Error(`Error Restoring Catalog Row: ${error.message}`)
}

/**
 * Permanently Delete Archived Catalog Row
 *
 * Attempts to hard-delete an archived custom catalog row. The database trigger
 * is the final authority: if the row is still attached to any settlement, the
 * trigger keeps it archived and returns no deleted row.
 *
 * @param table Catalog Table
 * @param id Catalog Row ID
 */
export async function permanentlyDeleteArchivedCatalogRow(
  table: CatalogArchiveTable,
  id: string
): Promise<void> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .not('archived_at', 'is', null)
    .select('id')
    .maybeSingle()

  if (error)
    throw new Error(`Error Permanently Deleting Catalog Row: ${error.message}`)

  if (!data) throw new CatalogPermanentDeleteBlockedError()
}

/**
 * Get Archived Catalog Rows
 *
 * Retrieves archived custom catalog rows authored by the current user across
 * every catalog table that supports custom content.
 *
 * @returns Archived Catalog Rows
 */
export async function getArchivedCatalogRows(): Promise<CatalogArchiveItem[]> {
  const userId = await getUserId()
  const supabase = createClient()

  const results = await Promise.all(
    CATALOG_ARCHIVE_SPECS.map(async (spec) => {
      const { data, error } = await supabase
        .from(spec.table)
        .select(`id, ${spec.nameColumn}, archived_at`)
        .eq('custom', true)
        .eq('user_id', userId)
        .not('archived_at', 'is', null)

      if (error)
        throw new Error(
          `Error Fetching Archived ${spec.category}: ${error.message}`
        )

      return ((data ?? []) as unknown as Record<string, string | null>[]).map(
        (row) => ({
          archived_at: row.archived_at ?? '',
          category: spec.category,
          id: row.id ?? '',
          name: row[spec.nameColumn] ?? 'Unnamed',
          table: spec.table
        })
      )
    })
  )

  return results
    .flat()
    .sort(
      (a, b) =>
        a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    )
}
