import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteSurvivorDisorderDetail } from '@/lib/types'

const VIGNETTE_SURVIVOR_DISORDER_SELECT = `
  id,
  vignette_survivor_id,
  disorder_id,
  disorder(*)
`

/**
 * Get Vignette Survivor Disorders
 *
 * Retrieves all vignette survivor disorder rows.
 *
 * @returns Vignette Survivor Disorders
 */
export async function getVignetteSurvivorDisorders(): Promise<
  VignetteSurvivorDisorderDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_survivor_disorder')
    .select(VIGNETTE_SURVIVOR_DISORDER_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Vignette Survivor Disorders: ${error.message}`
    )

  return (data ?? []) as VignetteSurvivorDisorderDetail[]
}

/**
 * Get Vignette Survivor Disorder
 *
 * Retrieves a single vignette survivor disorder row by ID.
 *
 * @param id Vignette Survivor Disorder ID
 * @returns Vignette Survivor Disorder or null
 */
export async function getVignetteSurvivorDisorder(
  id: string | null | undefined
): Promise<VignetteSurvivorDisorderDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_survivor_disorder')
    .select(VIGNETTE_SURVIVOR_DISORDER_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Vignette Survivor Disorder: ${error.message}`
    )

  return data as VignetteSurvivorDisorderDetail | null
}

/**
 * Add Vignette Survivor Disorder
 *
 * Adds a new vignette survivor disorder record to the database.
 *
 * @param vignetteSurvivorDisorder Vignette Survivor Disorder Data
 * @returns Inserted Vignette Survivor Disorder
 */
export async function addVignetteSurvivorDisorder(
  vignetteSurvivorDisorder: Omit<
    TablesInsert<'vignette_survivor_disorder'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteSurvivorDisorderDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_survivor_disorder'> = {
    ...vignetteSurvivorDisorder
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_survivor_disorder')
    .insert(insertData)
    .select(VIGNETTE_SURVIVOR_DISORDER_SELECT)
    .single()

  if (error)
    throw new Error(`Error Adding Vignette Survivor Disorder: ${error.message}`)

  return data as VignetteSurvivorDisorderDetail
}

/**
 * Update Vignette Survivor Disorder
 *
 * Updates an existing vignette survivor disorder record.
 *
 * @param id Vignette Survivor Disorder ID
 * @param vignetteSurvivorDisorder Vignette Survivor Disorder Data
 */
export async function updateVignetteSurvivorDisorder(
  id: string,
  vignetteSurvivorDisorder: Omit<
    TablesUpdate<'vignette_survivor_disorder'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_survivor_disorder'> = {
    ...vignetteSurvivorDisorder
  }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_survivor_disorder')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Vignette Survivor Disorder: ${error.message}`
    )
}

/**
 * Remove Vignette Survivor Disorder
 *
 * Deletes a vignette survivor disorder record from the database.
 *
 * @param id Vignette Survivor Disorder ID
 */
export async function removeVignetteSurvivorDisorder(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_survivor_disorder')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Survivor Disorder: ${error.message}`
    )
}
