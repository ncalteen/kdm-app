import { createClient } from '@/lib/supabase/client'
import { Tables } from '../database.types'

/**
 * Add Timeline Years to Settlement
 *
 * Insers timeline data for a settlement by adding records to the
 * settlement_timeline_year table.
 *
 * @remark Settlement ID is not required as a parameter here because it is part
 *         of the timeline year data being inserted.
 *
 * @param timelineYears Timeline Year Data
 */
export async function addTimelineYearsToSettlement(
  timelineYears: Omit<
    Tables<'settlement_timeline_year'>,
    'created_at' | 'id' | 'updated_at'
  >[]
): Promise<void> {
  if (timelineYears.length === 0) return

  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_timeline_year')
    .insert(timelineYears)

  if (error)
    throw new Error(
      `Error Adding Timeline Years to Settlement: ${error.message}`
    )
}

/**
 * Get Timeline by Settlement ID
 *
 * Retrieves timeline year data for a settlement from the
 * settlement_timeline_year table. Mutates the data into an object keyed by year
 * number for easier consumption.
 *
 * @param settlementId Settlement ID
 * @returns Timeline Year Data
 */
export async function getTimelineYears(
  settlementId: string
): Promise<{ [key: number]: { entries: string[]; completed: boolean } }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_timeline_year')
    .select('year_number, entries, completed')
    .eq('settlement_id', settlementId)
    .order('year_number', { ascending: true })

  if (error)
    throw new Error(
      `Error Fetching Timeline Years for Settlement: ${error.message}`
    )

  const timeline: { [key: number]: { entries: string[]; completed: boolean } } =
    {}

  for (const item of data ?? [])
    timeline[item.year_number] = {
      entries: item.entries,
      completed: item.completed
    }

  return timeline
}
