import { createClient } from '@/lib/supabase/client'

/**
 * Get Innovation IDs
 *
 * Retrieves the IDs of innovations. This depends on if they are custom
 * innovations (requires the user ID if so).
 *
 * @param innovationNames Innovation Names
 * @param custom Custom
 * @param userId User ID
 * @returns Innovation IDs
 */
export async function getInnovationIds(
  innovationNames: string[],
  custom: boolean,
  userId?: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = userId
    ? await supabase
        .from('innovation')
        .select('id')
        .in('innovation_name', innovationNames)
        .eq('custom', custom)
        .eq('user_id', userId)
    : await supabase
        .from('innovation')
        .select('id')
        .in('innovation_name', innovationNames)
        .eq('custom', custom)

  if (error)
    throw new Error(`Error Fetching Innovation ID(s): ${error.message}`)

  if (!data) throw new Error('Innovation(s) Not Found')

  return data.map((innovation) => innovation.id)
}
