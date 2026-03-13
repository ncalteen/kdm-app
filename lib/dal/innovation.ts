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

/**
 * Get Innovation Names by Settlement ID
 *
 * Retrieves the names of innovations associated with a settlement.
 *
 * @param settlementId Settlement ID
 * @returns Innovation Names
 */
export async function getInnovationNames(
  settlementId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_innovation')
    .select('innovation(innovation_name)')
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Innovations: ${error.message}`)

  const innovationNames =
    data?.map((row) => {
      const innovation = Array.isArray(row.innovation)
        ? row.innovation[0]
        : row.innovation

      return innovation?.innovation_name
    }) ?? []

  return innovationNames
}
