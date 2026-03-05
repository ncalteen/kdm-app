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

  const { data, error } = await supabase
    .from('location')
    .select('id')
    .in('location_name', locationNames)
    .eq('custom', custom)
    .eq('user_id', custom ? userId : null)

  if (error) throw new Error(`Error Fetching Location IDs: ${error.message}`)

  if (!data) throw new Error('Location(s) Not Found')

  return data.map((location) => location.id)
}
