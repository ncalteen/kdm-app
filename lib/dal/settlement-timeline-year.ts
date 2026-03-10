import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

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

/**
 * Remove Entry from Timeline Year
 *
 * Removes an event entry from a timeline year by updating the corresponding
 * record in the settlement_timeline_year table.
 *
 * @param settlementId Settlement ID
 * @param yearNumber Year Number
 * @param entryIndex Entry Index
 * @returns Updated List of Entries for the Year
 */
export async function removeTimelineEntry(
  settlementId: string,
  yearNumber: number,
  entryIndex: number
): Promise<string[]> {
  const supabase = createClient()

  // Fetch the current entries for the specified year
  const { data, error } = await supabase
    .from('settlement_timeline_year')
    .select('entries')
    .eq('settlement_id', settlementId)
    .eq('year_number', yearNumber)
    .single()

  if (error)
    throw new Error(
      `Error Fetching Timeline Year for Entry Removal: ${error.message}`
    )

  if (!data) throw new Error('Timeline Year Not Found for Entry Removal')

  // Remove the specified entry
  if (entryIndex < 0 || entryIndex >= data.entries.length)
    throw new Error('Entry Index Out of Bounds for Removal')

  const updatedEntries = [
    ...data.entries.slice(0, entryIndex),
    ...data.entries.slice(entryIndex + 1)
  ]

  // Update the timeline year with the new entries
  const { error: updateError } = await supabase
    .from('settlement_timeline_year')
    .update({ entries: updatedEntries })
    .eq('settlement_id', settlementId)
    .eq('year_number', yearNumber)

  if (updateError)
    throw new Error(
      `Error Updating Timeline Year for Entry Removal: ${updateError.message}`
    )

  return updatedEntries
}

/**
 * Save a Timeline Entry
 *
 * Adds or updates an event entry to a timeline year by updating the
 * corresponding record in the settlement_timeline_year table.
 *
 * @param settlementId Settlement ID
 * @param yearNumber Year Number
 * @param value Entry Value
 * @param entryIndex Entry Index
 * @returns Updated List of Entries for the Year
 */
export async function saveTimelineEntry(
  settlementId: string,
  yearNumber: number,
  value: string,
  entryIndex: number
): Promise<string[]> {
  const supabase = createClient()

  // Fetch the current entries for the specified year
  const { data, error } = await supabase
    .from('settlement_timeline_year')
    .select('entries')
    .eq('settlement_id', settlementId)
    .eq('year_number', yearNumber)
    .single()

  if (error)
    throw new Error(
      `Error Fetching Timeline Year for Entry Addition: ${error.message}`
    )

  if (!data) throw new Error('Timeline Year Not Found for Entry Addition')

  // Add the specified entry if the index is equal to or greater than the
  // current length. Otherwise, replace the entry at the specified index.
  let updatedEntries: string[]

  if (entryIndex < 0)
    throw new Error('Entry Index Cannot Be Negative for Entry Addition')

  if (entryIndex >= data.entries.length)
    updatedEntries = [...data.entries, value]
  else
    updatedEntries = data.entries.map((entry: string, i: number) =>
      i === entryIndex ? value : entry
    )

  const { error: updateError } = await supabase
    .from('settlement_timeline_year')
    .update({ entries: updatedEntries })
    .eq('settlement_id', settlementId)
    .eq('year_number', yearNumber)

  if (updateError)
    throw new Error(
      `Error Updating Timeline Year for Entry Addition: ${updateError.message}`
    )

  return updatedEntries
}

/**
 * Toggle Year Completion Status
 *
 * Toggles the completion status of a timeline year by updating the corresponding
 * record in the settlement_timeline_year table.
 *
 * @param settlementId Settlement ID
 * @param yearNumber Year Number
 * @param completed New Completion Status
 */
export async function toggleYearCompletionStatus(
  settlementId: string,
  yearNumber: number,
  completed: boolean
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_timeline_year')
    .update({ completed })
    .eq('settlement_id', settlementId)
    .eq('year_number', yearNumber)

  if (error)
    throw new Error(
      `Error Toggling Timeline Year Completion Status: ${error.message}`
    )
}

/**
 * Add Timeline Yea
 *
 * Adds a timeline year to the settlement.
 *
 * @param settlementId Settlement ID
 * @param yearNumber Year Number
 */
export async function addYear(
  settlementId: string,
  yearNumber: number
): Promise<void> {
  const supabase = createClient()

  const { data } = await supabase
    .from('settlement_timeline_year')
    .select('*')
    .eq('settlement_id', settlementId)

  console.log(data)

  const { error } = await supabase.from('settlement_timeline_year').insert({
    completed: false,
    entries: [],
    settlement_id: settlementId,
    year_number: yearNumber
  })

  if (error)
    throw new Error(
      `Error Toggling Timeline Year Completion Status: ${error.message}`
    )
}
