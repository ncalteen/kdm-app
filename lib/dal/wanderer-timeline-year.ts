import { createClient } from '@/lib/supabase/client'
import { WandererTimelineYearDetail } from '@/lib/types'

/**
 * Get Wanderer Timeline Years
 *
 * @param wandererId Wanderer ID
 * @returns Wanderer Timeline Years
 */
export async function getWandererTimelineYears(
  wandererId: string | null | undefined
): Promise<{ [key: string]: WandererTimelineYearDetail }> {
  if (!wandererId) throw new Error('Required: Wanderer ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('wanderer_timeline_year')
    .select('id, wanderer_id, entries, year_number')
    .eq('wanderer_id', wandererId)

  if (error)
    throw new Error(`Error Fetching Wanderer Timeline Years: ${error.message}`)

  const timelineYearMap: { [key: string]: WandererTimelineYearDetail } = {}

  for (const t of data ?? []) timelineYearMap[t.id] = t

  return timelineYearMap
}
