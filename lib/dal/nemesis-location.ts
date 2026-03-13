import { createClient } from '@/lib/supabase/client'

/**
 * Get Nemesis Location IDs
 *
 * Fetches location IDs associated with a specific nemesis from the
 * nemesis_location table.
 *
 * @param nemesisId Nemesis ID
 * @returns Nemesis Location IDs
 */
export async function getNemesisLocationIds(
  nemesisId: string | null | undefined
): Promise<string[]> {
  if (!nemesisId) throw new Error('Required: Nemesis ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis_location')
    .select('location_id')
    .eq('nemesis_id', nemesisId)

  if (error)
    throw new Error(`Error Fetching Nemesis Location IDs: ${error.message}`)

  if (!data) throw new Error('Nemesis Location ID(s) Not Found')

  return data.map((item) => item.location_id)
}
