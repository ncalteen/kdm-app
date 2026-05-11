import { getUserId } from '@/lib/dal/user'
import { createClient } from '@/lib/supabase/client'
import { ArmorSetDetail, ArmorSetSlotDetail } from '@/lib/types'

/**
 * Raw Armor Set Slot Row
 *
 * Shape PostgREST returns for the nested `armor_set_slot` selection.
 */
interface RawArmorSetSlotRow {
  /** Slot ID */
  id: string
  /** Slot Name */
  slot_name: string
  /** Slot Display Order */
  slot_order: number
  /** Whether the Slot Is Required */
  required: boolean
  /** Junction Rows Linking the Slot to Candidate Gear */
  armor_set_slot_gear: { gear_id: string }[] | null
}

/**
 * Raw Armor Set Row
 *
 * Shape PostgREST returns for the top-level `armor_set` selection.
 */
interface RawArmorSetRow {
  /** Armor Set ID */
  id: string
  /** Custom Flag */
  custom: boolean
  /** Armor Set Name */
  armor_set_name: string
  /** Set-wide Bonus Description */
  bonuses: string | null
  /** Slots Belonging to the Set */
  armor_set_slot: RawArmorSetSlotRow[] | null
}

/**
 * Normalize Armor Set Row
 *
 * Converts the PostgREST projection into a flat {@link ArmorSetDetail} where
 * each slot lists its candidate gear ids and slots are ordered by
 * `slot_order`.
 *
 * @param row Raw Armor Set Row
 * @returns Armor Set Detail
 */
function normalizeArmorSet(row: RawArmorSetRow): ArmorSetDetail {
  const slots: ArmorSetSlotDetail[] = (row.armor_set_slot ?? []).map(
    (slot) => ({
      id: slot.id,
      slot_name: slot.slot_name,
      slot_order: slot.slot_order,
      required: slot.required,
      gear_ids: (slot.armor_set_slot_gear ?? []).map((sg) => sg.gear_id)
    })
  )

  slots.sort((a, b) => a.slot_order - b.slot_order)

  return {
    id: row.id,
    custom: row.custom,
    armor_set_name: row.armor_set_name,
    bonuses: row.bonuses,
    slots
  }
}

/**
 * Get Armor Sets
 *
 * Retrieves every armor set visible to the authenticated user together
 * with each set's slots and the gear pieces that can satisfy them. RLS
 * surfaces:
 *
 * - Built-in (non-custom) armor sets
 * - Custom armor sets owned by the user
 *
 * The `Clothed & Satiated` fallback set is intentionally excluded from the
 * database catalog and is evaluated client-side as a fallback when no other
 * set qualifies.
 *
 * @returns Armor Set Details (deduplicated by ID)
 */
export async function getArmorSets(): Promise<ArmorSetDetail[]> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('armor_set')
    .select(
      'id, custom, armor_set_name, bonuses, armor_set_slot(id, slot_name, slot_order, required, armor_set_slot_gear(gear_id))'
    )

  if (error) throw new Error(`Error Fetching Armor Sets: ${error.message}`)

  const armorSets = new Map<string, ArmorSetDetail>()
  for (const row of (data ?? []) as unknown as RawArmorSetRow[])
    armorSets.set(row.id, normalizeArmorSet(row))

  return Array.from(armorSets.values())
}
