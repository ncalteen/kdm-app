import { createClient } from '@/lib/supabase/client'

/**
 * Get Quarry IDs
 *
 * Retrieves the IDs of nemeses. This depends on if they are custom nemeses
 * (requires the user ID if so).
 *
 * @param quarryNames Quarry Names
 * @param custom Custom
 * @param userId User ID
 * @returns Quarry IDs
 */
export async function getQuarryIds(
  quarryNames: string[],
  custom: boolean,
  userId?: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry')
    .select('id')
    .in('monster_name', quarryNames)
    .eq('custom', custom)
    .eq('user_id', custom ? userId : null)

  if (error) throw new Error(`Error Fetching Quarry IDs: ${error.message}`)

  if (!data) throw new Error('Quarry(ies) Not Found')

  return data.map((quarry) => quarry.id)
}
