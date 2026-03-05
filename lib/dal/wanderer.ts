import { createClient } from '@/lib/supabase/client'

/**
 * Get Wanderer IDs
 *
 * Retrieves the IDs of wanderers. This depends on if they are custom
 * wanderers (requires the user ID if so).
 *
 * @param wandererNames Wanderer Names
 * @param custom Custom
 * @param userId User ID
 * @returns Wanderer IDs
 */
export async function getWandererIds(
  wandererNames: string[],
  custom: boolean,
  userId?: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('wanderer')
    .select('id')
    .in('wanderer_name', wandererNames)
    .eq('custom', custom)
    .eq('user_id', custom ? userId : null)

  if (error) throw new Error(`Error Fetching Wanderer IDs: ${error.message}`)

  if (!data) throw new Error('Wanderer(s) Not Found')

  return data.map((wanderer) => wanderer.id)
}
