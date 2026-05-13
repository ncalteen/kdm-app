import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { createClient } from '@/lib/supabase/client'
import { MoodDetail } from '@/lib/types'

/**
 * Get Moods
 *
 * Retrieves all monster moods visible to the authenticated user. RLS
 * surfaces:
 * - Built-in (non-custom) moods
 * - Custom moods owned by the user
 *
 * @returns Moods by ID
 */
export async function getMoods(): Promise<{ [key: string]: MoodDetail }> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('mood')
    .select('id, custom, mood_name, rules')

  if (error) throw new Error(`Error Fetching Moods: ${error.message}`)

  const map: { [key: string]: MoodDetail } = {}
  for (const m of data ?? []) map[m.id] = m

  return map
}

/**
 * Get User Custom Moods
 *
 * Retrieves only custom moods authored by the current user. Used by
 * the user-content library so collaborator-authored customs visible via the
 * transitive SELECT policy don't pollute the caller's personal catalog.
 *
 * @returns Custom Mood Data Map
 */
export async function getUserCustomMoods(): Promise<{
  [key: string]: MoodDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('mood')
    .select('id, custom, mood_name, rules')
    .eq('custom', true)
    .eq('user_id', userId)

  if (error) throw new Error(`Error Fetching Custom Moods: ${error.message}`)

  const map: { [key: string]: MoodDetail } = {}
  for (const m of data ?? []) map[m.id] = m

  return map
}

/**
 * Add Mood
 *
 * Inserts a new mood catalog row.
 *
 * @param data Mood Data
 * @returns Inserted Mood
 */
export async function addMood(data: {
  custom: boolean
  mood_name: string
  rules?: string | null
}): Promise<MoodDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (data.custom && !userId) throw new Error('Not Authenticated')

  const { data: result, error } = await supabase
    .from('mood')
    .insert({
      ...data,
      ...(data.custom ? { user_id: userId! } : {})
    })
    .select('id, custom, mood_name, rules')
    .single()

  if (error) throw new Error(`Error Adding Mood: ${error.message}`)

  return result
}

/**
 * Update Mood
 *
 * Updates a mood record.
 *
 * @param id Mood ID
 * @param data Mood Data
 */
export async function updateMood(
  id: string,
  data: { mood_name?: string; rules?: string | null }
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('mood').update(data).eq('id', id)

  if (error) throw new Error(`Error Updating Mood: ${error.message}`)
}

/**
 * Remove Mood
 *
 * Deletes a mood record.
 *
 * @param id Mood ID
 */
export async function removeMood(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('mood').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Mood: ${error.message}`)
}

/**
 * Resolve Mood Names
 *
 * Given a list of mood names, returns the corresponding mood IDs. Names that
 * already exist (non-custom catalog or owned by this user) are reused. Missing
 * names are inserted as new custom moods owned by the current user.
 *
 * Matching is case-insensitive and whitespace-trimmed. Duplicates in the input
 * are collapsed.
 *
 * @param names Mood Names
 * @returns Mood IDs in the order of the deduplicated input
 */
export async function resolveMoodNames(names: string[]): Promise<string[]> {
  const userId = await getUserId()
  const supabase = createClient()

  const seen = new Set<string>()
  const normalized: { raw: string; key: string }[] = []
  for (const n of names) {
    const trimmed = n?.trim() ?? ''
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    normalized.push({ raw: trimmed, key })
  }

  if (normalized.length === 0) return []

  const { data: existing, error } = await supabase
    .from('mood')
    .select('id, mood_name, custom, user_id')
    .or(`custom.eq.false,and(custom.eq.true,user_id.eq.${userId})`)

  if (error) throw new Error(`Error Resolving Moods: ${error.message}`)

  const byKey = new Map<string, string>()
  for (const row of existing ?? [])
    byKey.set(row.mood_name.trim().toLowerCase(), row.id)

  const results: string[] = []
  for (const entry of normalized) {
    const existingId = byKey.get(entry.key)
    if (existingId) {
      results.push(existingId)
      continue
    }
    const { data: inserted, error: insertError } = await supabase
      .from('mood')
      .insert({ custom: true, user_id: userId, mood_name: entry.raw })
      .select('id')
      .single()

    if (insertError)
      throw new Error(`Error Adding Mood: ${insertError.message}`)

    byKey.set(entry.key, inserted.id)
    results.push(inserted.id)
  }

  return results
}
