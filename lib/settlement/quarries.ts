/**
 * Sortable Row
 *
 * Minimal interface for rows that can be sorted by node and monster name.
 */
interface SortableRow {
  node: string
  monster_name: string
}

/**
 * Sort Quarries
 *
 * Sorts quarries by monster node (ascending) first, then alphabetically by
 * monster name within the same node.
 *
 * @param rows Settlement Quarry Rows
 * @returns Sorted Settlement Quarry Rows
 */
export function sortQuarries<T extends SortableRow>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const nodeCmp = a.node.localeCompare(b.node)
    if (nodeCmp !== 0) return nodeCmp
    return a.monster_name.localeCompare(b.monster_name)
  })
}
