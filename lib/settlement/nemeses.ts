import { SettlementNemesisRow } from '@/lib/dal/settlement-nemesis'

/**
 * Nemesis Node Sort Order
 *
 * Defines the display order for nemesis monster nodes.
 */
const NODE_ORDER: Record<string, number> = {
  NN1: 0,
  NN2: 1,
  NN3: 2,
  CO: 3,
  FI: 4
}

/**
 * Sort Nemeses
 *
 * Sorts nemeses by monster node in the defined order (NN1, NN2, NN3, CO, FI),
 * then alphabetically by monster name within the same node.
 *
 * @param rows Settlement Nemesis Rows
 * @returns Sorted Settlement Nemesis Rows
 */
export function sortNemeses(
  rows: SettlementNemesisRow[]
): SettlementNemesisRow[] {
  return [...rows].sort((a, b) => {
    const aOrder = NODE_ORDER[a.node] ?? Number.MAX_SAFE_INTEGER
    const bOrder = NODE_ORDER[b.node] ?? Number.MAX_SAFE_INTEGER
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.monster_name.localeCompare(b.monster_name)
  })
}
