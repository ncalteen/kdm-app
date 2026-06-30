import { GEAR_SELECT } from '@/lib/dal/gear'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { ArmorSetSlotDetail } from '@/lib/types'

const ARMOR_SET_SLOT_SELECT = `
  id,
  armor_set_id,
  required,
  slot_name,
  slot_order,
  slot_gear:armor_set_slot_gear(
    armor_set_slot_id,
    gear_id,
    gear(${GEAR_SELECT})
  )
`

/**
 * Get Armor Set Slots
 *
 * Retrieves the requested armor set slots data.
 *
 * @returns Armor Set Slots
 */
export async function getArmorSetSlots(): Promise<ArmorSetSlotDetail[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('armor_set_slot')
    .select(ARMOR_SET_SLOT_SELECT)
    .order('slot_order')

  if (error) throw new Error(`Error Fetching Armor Set Slots: ${error.message}`)

  return data
}

/**
 * Get Armor Set Slot
 *
 * Retrieves the requested armor set slot data.
 *
 * @param id Armor Set Slot ID
 * @returns Armor Set Slot
 */
export async function getArmorSetSlot(
  id: string | null | undefined
): Promise<ArmorSetSlotDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('armor_set_slot')
    .select(ARMOR_SET_SLOT_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching Armor Set Slot: ${error.message}`)

  return data
}

/**
 * Add Armor Set Slot
 *
 * Adds a new armor set slot record to the database.
 *
 * @param armorSetSlot Armor Set Slot Data
 * @returns Inserted Armor Set Slot
 */
export async function addArmorSetSlot(
  armorSetSlot: Omit<
    TablesInsert<'armor_set_slot'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<ArmorSetSlotDetail> {
  const supabase = createClient()
  const insertData = { ...armorSetSlot }

  const { data, error } = await supabase
    .from('armor_set_slot')
    .insert(insertData)
    .select(ARMOR_SET_SLOT_SELECT)
    .single()

  if (error) throw new Error(`Error Adding Armor Set Slot: ${error.message}`)

  return data
}

/**
 * Update Armor Set Slot
 *
 * Updates an existing armor set slot record.
 *
 * @param id Armor Set Slot ID
 * @param armorSetSlot Armor Set Slot Data
 */
export async function updateArmorSetSlot(
  id: string,
  armorSetSlot: Omit<
    TablesUpdate<'armor_set_slot'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData = { ...armorSetSlot }

  const { error } = await supabase
    .from('armor_set_slot')
    .update(updateData)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Armor Set Slot: ${error.message}`)
}

/**
 * Remove Armor Set Slot
 *
 * Deletes a armor set slot record from the database.
 *
 * @param id Armor Set Slot ID
 */
export async function removeArmorSetSlot(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('armor_set_slot').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Armor Set Slot: ${error.message}`)
}
