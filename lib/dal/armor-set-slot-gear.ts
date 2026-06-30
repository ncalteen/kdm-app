import { GEAR_SELECT } from '@/lib/dal/gear'
import { TablesInsert } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { ArmorSetSlotGearDetail } from '@/lib/types'

const ARMOR_SET_SLOT_GEAR_SELECT = `
  armor_set_slot_id,
  gear_id,
  gear(${GEAR_SELECT})
`

/**
 * Get Armor Set Slot Gears
 *
 * Retrieves the requested armor set slot gears data.
 *
 * @returns Armor Set Slot Gears
 */
export async function getArmorSetSlotGears(): Promise<
  ArmorSetSlotGearDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('armor_set_slot_gear')
    .select(ARMOR_SET_SLOT_GEAR_SELECT)

  if (error)
    throw new Error(`Error Fetching Armor Set Slot Gears: ${error.message}`)

  return data
}

/**
 * Get Armor Set Slot Gear
 *
 * Retrieves the requested armor set slot gear data.
 *
 * @param armorSetSlotId Armor Set Slot ID
 * @param gearId Gear ID
 * @returns Armor Set Slot Gear
 */
export async function getArmorSetSlotGear(
  armorSetSlotId: string,
  gearId: string
): Promise<ArmorSetSlotGearDetail | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('armor_set_slot_gear')
    .select(ARMOR_SET_SLOT_GEAR_SELECT)
    .eq('armor_set_slot_id', armorSetSlotId)
    .eq('gear_id', gearId)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Armor Set Slot Gear: ${error.message}`)

  return data
}

/**
 * Add Armor Set Slot Gear
 *
 * Adds a new armor set slot gear record to the database.
 *
 * @param armorSetSlotGear Armor Set Slot Gear Data
 * @returns Inserted Armor Set Slot Gear
 */
export async function addArmorSetSlotGear(
  armorSetSlotGear: TablesInsert<'armor_set_slot_gear'>
): Promise<ArmorSetSlotGearDetail> {
  const supabase = createClient()
  const insertData = { ...armorSetSlotGear }

  const { data, error } = await supabase
    .from('armor_set_slot_gear')
    .insert(insertData)
    .select(ARMOR_SET_SLOT_GEAR_SELECT)
    .single()

  if (error)
    throw new Error(`Error Adding Armor Set Slot Gear: ${error.message}`)

  return data
}

/**
 * Remove Armor Set Slot Gear
 *
 * Deletes a armor set slot gear record from the database.
 *
 * @param armorSetSlotId Armor Set Slot ID
 * @param gearId Gear ID
 */
export async function removeArmorSetSlotGear(
  armorSetSlotId: string,
  gearId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('armor_set_slot_gear')
    .delete()
    .eq('armor_set_slot_id', armorSetSlotId)
    .eq('gear_id', gearId)

  if (error)
    throw new Error(`Error Removing Armor Set Slot Gear: ${error.message}`)
}
