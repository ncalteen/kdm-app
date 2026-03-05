import { createClient } from '@/lib/supabase/client'

/**
 * Get Nemesis IDs
 *
 * Retrieves the IDs of nemeses. This depends on if they are custom nemeses
 * (requires the user ID if so).
 *
 * @param nemesisNames Nemesis Names
 * @param custom Custom
 * @param userId User ID
 * @returns Nemesis IDs
 */
export async function getNemesisIds(
  nemesisNames: string[],
  custom: boolean,
  userId?: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis')
    .select('id')
    .in('monster_name', nemesisNames)
    .eq('custom', custom)
    .eq('user_id', custom ? userId : null)

  if (error) throw new Error(`Error Fetching Nemesis IDs: ${error.message}`)

  if (!data) throw new Error('Nemesis(es) Not Found')

  return data.map((nemesis) => nemesis.id)
}
