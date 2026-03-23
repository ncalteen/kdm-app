import { WandererDetail } from '@/lib/types'

/**
 * Sort Wanderers
 *
 * Sorts wanderers by name.
 *
 * @param rows Wanderer Rows
 * @returns Sorted Wanderer Rows
 */
export function sortWanderers(rows: { [key: string]: WandererDetail }): {
  [key: string]: WandererDetail
} {
  return Object.fromEntries(
    Object.entries(rows).sort(([, a], [, b]) =>
      a.wanderer_name.localeCompare(b.wanderer_name)
    )
  )
}
