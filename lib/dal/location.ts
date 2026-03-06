import { createClient } from '@/lib/supabase/client'

/**
 * Get Location IDs
 *
 * Retrieves the IDs of locations. This depends on if they are custom locations
 * (requires the user ID if so).
 *
 * @param locationNames Location Names
 * @param custom Custom
 * @param userId User ID
 * @returns Location IDs
 */
export async function getLocationIds(
  locationNames: string[],
  custom: boolean,
  userId?: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = userId
    ? await supabase
        .from('location')
        .select('id')
        .in('location_name', locationNames)
        .eq('custom', custom)
        .eq('user_id', userId)
    : await supabase
        .from('location')
        .select('id')
        .in('location_name', locationNames)
        .eq('custom', custom)

  if (error) throw new Error(`Error Fetching Location ID(s): ${error.message}`)

  if (!data) throw new Error('Location(s) Not Found')

  return data.map((location) => location.id)
}
