import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Wanderer Timeline Years
 *
 * @param wandererId Wanderer ID
 * @returns Wanderer Timeline Years
 */
export async function getWandererTimelineYears(
  wandererId: string
): Promise<
  Omit<Tables<'wanderer_timeline_year'>, 'created_at' | 'updated_at'>[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('wanderer_timeline_year')
    .select('id, wanderer_id, entries, year_number')
    .eq('wanderer_id', wandererId)

  if (error)
    throw new Error(`Error Fetching Wanderer Timeline Years: ${error.message}`)

  if (!data) throw new Error('Wanderer Timeline Year(s) Not Found')

  return data
}
