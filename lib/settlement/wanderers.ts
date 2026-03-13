import { Tables } from '@/lib/database.types'

/**
 * Sort Wanderers
 *
 * Sorts wanderers by name.
 *
 * @param rows Wanderer Rows
 * @returns Sorted Wanderer Rows
 */
export function sortWanderers(
  rows: Tables<'wanderer'>[]
): Tables<'wanderer'>[] {
  return [...rows].sort((a, b) =>
    a.wanderer_name.localeCompare(b.wanderer_name)
  )
}
