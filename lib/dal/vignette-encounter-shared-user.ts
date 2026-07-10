import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteEncounterSharedUserDetail } from '@/lib/types'

const VIGNETTE_ENCOUNTER_SHARED_USER_SELECT = `
  id,
  shared_user_id,
  vignette_encounter_id
`

/**
 * Get Vignette Encounter Shared Users
 *
 * Retrieves all vignette encounter shared user rows.
 *
 * @returns Vignette Encounter Shared Users
 */
export async function getVignetteEncounterSharedUserRows(): Promise<
  VignetteEncounterSharedUserDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_shared_user')
    .select(VIGNETTE_ENCOUNTER_SHARED_USER_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Shared Users: ${error.message}`
    )

  return (data ?? []) as VignetteEncounterSharedUserDetail[]
}

/**
 * Get Vignette Encounter Shared User
 *
 * Retrieves a single vignette encounter shared user row by ID.
 *
 * @param id Vignette Encounter Shared User ID
 * @returns Vignette Encounter Shared User or null
 */
export async function getVignetteEncounterSharedUserRow(
  id: string | null | undefined
): Promise<VignetteEncounterSharedUserDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_shared_user')
    .select(VIGNETTE_ENCOUNTER_SHARED_USER_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Shared User: ${error.message}`
    )

  return data as VignetteEncounterSharedUserDetail | null
}

/**
 * Add Vignette Encounter Shared User
 *
 * Adds a new vignette encounter shared user record to the database.
 *
 * @param vignetteEncounterSharedUserRow Vignette Encounter Shared User Data
 * @returns Inserted Vignette Encounter Shared User
 */
export async function addVignetteEncounterSharedUserRow(
  vignetteEncounterSharedUserRow: Omit<
    TablesInsert<'vignette_encounter_shared_user'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteEncounterSharedUserDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_encounter_shared_user'> = {
    ...vignetteEncounterSharedUserRow
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_encounter_shared_user')
    .insert(insertData)
    .select(VIGNETTE_ENCOUNTER_SHARED_USER_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Shared User: ${error.message}`
    )

  return data as VignetteEncounterSharedUserDetail
}

/**
 * Update Vignette Encounter Shared User
 *
 * Updates an existing vignette encounter shared user record.
 *
 * @param id Vignette Encounter Shared User ID
 * @param vignetteEncounterSharedUserRow Vignette Encounter Shared User Data
 */
export async function updateVignetteEncounterSharedUserRow(
  id: string,
  vignetteEncounterSharedUserRow: Omit<
    TablesUpdate<'vignette_encounter_shared_user'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_encounter_shared_user'> = {
    ...vignetteEncounterSharedUserRow
  }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_encounter_shared_user')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Vignette Encounter Shared User: ${error.message}`
    )
}

/**
 * Remove Vignette Encounter Shared User
 *
 * Deletes a vignette encounter shared user record from the database.
 *
 * @param id Vignette Encounter Shared User ID
 */
export async function removeVignetteEncounterSharedUserRow(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_shared_user')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter Shared User: ${error.message}`
    )
}
