import { QuarryDetail } from '@/lib/types'

/**
 * Sort Quarries
 *
 * Sorts quarries by monster node (ascending) first, then alphabetically by
 * monster name within the same node.
 *
 * @param rows Settlement Quarry Rows
 * @returns Sorted Settlement Quarry Rows
 */
export function sortQuarries(rows: QuarryDetail[]): QuarryDetail[] {
  return [...rows].sort((a, b) => {
    const nodeCmp = a.node.localeCompare(b.node)
    if (nodeCmp !== 0) return nodeCmp
    return a.monster_name.localeCompare(b.monster_name)
  })
}
