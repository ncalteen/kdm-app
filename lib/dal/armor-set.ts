import { getUserId } from '@/lib/dal/user'
import { createClient } from '@/lib/supabase/client'
import { ArmorSetDetail } from '@/lib/types'

const ARMOR_SET_SELECT = `
  id,
  custom,
  armor_set_name,
  bonuses, 
  slots:armor_set_slot(
    id,
    armor_set_id,
    slot_name,
    slot_order,
    required,
    slot_gear:armor_set_slot_gear(
      armor_set_slot_id,
      gear_id,
      gear(
        id,
        custom,
        gear_name,
        location_id,
        accessory,
        accuracy,
        affinity_top,
        affinity_left,
        affinity_right,
        affinity_bottom,
        affinity_bonus,
        affinity_bonus_requirements,
        armor_points,
        armor_location,
        keywords,
        rules,
        speed,
        strength,
        weapon_type_id,
        gear_gear_costs:gear_gear_cost(
          gear_id,
          cost_gear_id,
          quantity
        ),
        gear_other_costs:gear_other_cost(
          id,
          gear_id,
          cost_name,
          quantity
        ),
        gear_resource_costs:gear_resource_cost(
          gear_id,
          resource_id,
          quantity,
          resource(
            id,
            custom,
            category,
            quarry_id,
            resource_name,
            resource_types,
            pattern_id,
            rules,
            nemesis_id
          )
        ),
        gear_resource_type_costs:gear_resource_type_cost(
          gear_id,
          resource_type,
          quantity
        )
      )
    )
  )
`

/**
 * Get Armor Sets
 *
 * Retrieves every armor set visible to the authenticated user together with
 * each set's slots and the gear pieces that can satisfy them. RLS surfaces:
 *
 * - Built-in (non-custom) armor sets
 * - Custom armor sets owned by the user
 *
 * The `Clothed & Satiated` fallback set is intentionally excluded from the
 * database catalog and is evaluated client-side as a fallback when no other set
 * qualifies.
 *
 * @returns Armor Set Details
 */
export async function getArmorSets(): Promise<ArmorSetDetail[]> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('armor_set')
    .select(ARMOR_SET_SELECT)
    .order('armor_set_name')
    .order('slot_order', { referencedTable: 'armor_set_slot' })
    .order('gear_id', { referencedTable: 'armor_set_slot_gear' })

  if (error) throw new Error(`Error Fetching Armor Sets: ${error.message}`)

  // This cast is in place because `affinity_bonus_requirements` is a JSON field
  // and the TypeScript compiler cannot infer the correct type.
  return data as ArmorSetDetail[]
}
