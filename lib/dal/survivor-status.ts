import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { createClient } from '@/lib/supabase/client'
import { SurvivorStatusDetail } from '@/lib/types'

/**
 * Get Survivor Statuses
 *
 * Retrieves all survivor statuses visible to the authenticated user. RLS
 * surfaces:
 * - Built-in (non-custom) statuses
 * - Custom statuses owned by the user
 *
 * @returns Survivor Statuses by ID
 */
export async function getSurvivorStatuses(): Promise<{
  [key: string]: SurvivorStatusDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('survivor_status')
    .select('id, custom, survivor_status_name, rules')

  if (error)
    throw new Error(`Error Fetching Survivor Statuses: ${error.message}`)

  const map: { [key: string]: SurvivorStatusDetail } = {}
  for (const s of data ?? []) map[s.id] = s

  return map
}

/**
 * Get User Custom Survivor Statuses
 *
 * Retrieves only custom survivor statuses authored by the current user.
 * Used by the user-content library so collaborator-authored customs visible
 * via the transitive SELECT policy don't pollute the caller's personal
 * catalog.
 *
 * @returns Custom Survivor Status Data Map
 */
export async function getUserCustomSurvivorStatuses(): Promise<{
  [key: string]: SurvivorStatusDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('survivor_status')
    .select('id, custom, survivor_status_name, rules')
    .eq('custom', true)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Fetching Custom Survivor Statuses: ${error.message}`)

  const map: { [key: string]: SurvivorStatusDetail } = {}
  for (const s of data ?? []) map[s.id] = s

  return map
}

/**
 * Add Survivor Status
 *
 * Inserts a new survivor status catalog row.
 *
 * @param data Survivor Status Data
 * @returns Inserted Survivor Status
 */
export async function addSurvivorStatus(data: {
  custom: boolean
  survivor_status_name: string
  rules?: string | null
}): Promise<SurvivorStatusDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (data.custom && !userId) throw new Error('Not Authenticated')

  const { data: result, error } = await supabase
    .from('survivor_status')
    .insert({
      ...data,
      ...(data.custom ? { user_id: userId! } : {})
    })
    .select('id, custom, survivor_status_name, rules')
    .single()

  if (error) throw new Error(`Error Adding Survivor Status: ${error.message}`)

  return result
}

/**
 * Update Survivor Status
 *
 * Updates a survivor status record.
 *
 * @param id Survivor Status ID
 * @param data Survivor Status Data
 */
export async function updateSurvivorStatus(
  id: string,
  data: { survivor_status_name?: string; rules?: string | null }
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('survivor_status')
    .update(data)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Survivor Status: ${error.message}`)
}

/**
 * Remove Survivor Status
 *
 * Deletes a survivor status record.
 *
 * @param id Survivor Status ID
 */
export async function removeSurvivorStatus(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('survivor_status').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Survivor Status: ${error.message}`)
}

/**
 * Resolve Survivor Status Names
 *
 * Given a list of survivor status names, returns the corresponding IDs. Names
 * that already exist (non-custom catalog or owned by this user) are reused.
 * Missing names are inserted as new custom statuses owned by the current user.
 *
 * Matching is case-insensitive and whitespace-trimmed. Duplicates in the input
 * are collapsed.
 *
 * @param names Survivor Status Names
 * @returns Survivor Status IDs in the order of the deduplicated input
 */
export async function resolveSurvivorStatusNames(
  names: string[]
): Promise<string[]> {
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
    .from('survivor_status')
    .select('id, survivor_status_name, custom, user_id')
    .or(`custom.eq.false,and(custom.eq.true,user_id.eq.${userId})`)

  if (error)
    throw new Error(`Error Resolving Survivor Statuses: ${error.message}`)

  const byKey = new Map<string, string>()
  for (const row of existing ?? [])
    byKey.set(row.survivor_status_name.trim().toLowerCase(), row.id)

  const results: string[] = []
  for (const entry of normalized) {
    const existingId = byKey.get(entry.key)
    if (existingId) {
      results.push(existingId)
      continue
    }
    const { data: inserted, error: insertError } = await supabase
      .from('survivor_status')
      .insert({
        custom: true,
        user_id: userId,
        survivor_status_name: entry.raw
      })
      .select('id')
      .single()

    if (insertError)
      throw new Error(`Error Adding Survivor Status: ${insertError.message}`)

    byKey.set(entry.key, inserted.id)
    results.push(inserted.id)
  }

  return results
}
