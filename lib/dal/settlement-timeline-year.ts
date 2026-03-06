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
