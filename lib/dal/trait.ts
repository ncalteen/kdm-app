import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { createClient } from '@/lib/supabase/client'
import { TraitDetail } from '@/lib/types'

/**
 * Get Traits
 *
 * Retrieves all monster traits visible to the authenticated user. RLS
 * surfaces:
 * - Built-in (non-custom) traits
 * - Custom traits owned by the user
 *
 * @returns Traits by ID
 */
export async function getTraits(): Promise<{ [key: string]: TraitDetail }> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('trait')
    .select('id, custom, trait_name, rules')

  if (error) throw new Error(`Error Fetching Traits: ${error.message}`)

  const map: { [key: string]: TraitDetail } = {}
  for (const t of data ?? []) map[t.id] = t

  return map
}

/**
 * Get User Custom Traits
 *
 * Retrieves only custom traits authored by the current user. Used by
 * the user-content library so collaborator-authored customs visible via the
 * transitive SELECT policy don't pollute the caller's personal catalog.
 *
 * @returns Custom Trait Data Map
 */
export async function getUserCustomTraits(): Promise<{
  [key: string]: TraitDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('trait')
    .select('id, custom, trait_name, rules')
    .eq('custom', true)
    .eq('user_id', userId)

  if (error) throw new Error(`Error Fetching Custom Traits: ${error.message}`)

  const map: { [key: string]: TraitDetail } = {}
  for (const t of data ?? []) map[t.id] = t

  return map
}

/**
 * Add Trait
 *
 * Inserts a new trait catalog row.
 *
 * @param data Trait Data
 * @returns Inserted Trait
 */
export async function addTrait(data: {
  custom: boolean
  trait_name: string
  rules?: string | null
}): Promise<TraitDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (data.custom && !userId) throw new Error('Not Authenticated')

  const { data: result, error } = await supabase
    .from('trait')
    .insert({
      ...data,
      ...(data.custom ? { user_id: userId! } : {})
    })
    .select('id, custom, trait_name, rules')
    .single()

  if (error) throw new Error(`Error Adding Trait: ${error.message}`)

  return result
}

/**
 * Update Trait
 *
 * Updates a trait record.
 *
 * @param id Trait ID
 * @param data Trait Data
 */
export async function updateTrait(
  id: string,
  data: { trait_name?: string; rules?: string | null }
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('trait').update(data).eq('id', id)

  if (error) throw new Error(`Error Updating Trait: ${error.message}`)
}

/**
 * Remove Trait
 *
 * Deletes a trait record.
 *
 * @param id Trait ID
 */
export async function removeTrait(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('trait').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Trait: ${error.message}`)
}

/**
 * Resolve Trait Names
 *
 * Given a list of trait names, returns the corresponding trait IDs. Names that
 * already exist (non-custom catalog or owned by this user) are reused. Missing
 * names are inserted as new custom traits owned by the current user.
 *
 * Matching is case-insensitive and whitespace-trimmed. Duplicates in the input
 * are collapsed.
 *
 * @param names Trait Names
 * @returns Trait IDs in the order of the deduplicated input
 */
export async function resolveTraitNames(names: string[]): Promise<string[]> {
  const userId = await getUserId()
  const supabase = createClient()

  // Normalise input: trim, drop empties, dedupe case-insensitively while
  // preserving the first-seen spelling.
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

  // Look up existing rows visible to this user (non-custom or owned).
  const { data: existing, error } = await supabase
    .from('trait')
    .select('id, trait_name, custom, user_id')
    .or(`custom.eq.false,and(custom.eq.true,user_id.eq.${userId})`)

  if (error) throw new Error(`Error Resolving Traits: ${error.message}`)

  const byKey = new Map<string, string>()
  for (const row of existing ?? [])
    byKey.set(row.trait_name.trim().toLowerCase(), row.id)

  const results: string[] = []
  for (const entry of normalized) {
    const existingId = byKey.get(entry.key)
    if (existingId) {
      results.push(existingId)
      continue
    }
    const { data: inserted, error: insertError } = await supabase
      .from('trait')
      .insert({ custom: true, user_id: userId, trait_name: entry.raw })
      .select('id')
      .single()

    if (insertError)
      throw new Error(`Error Adding Trait: ${insertError.message}`)

    byKey.set(entry.key, inserted.id)
    results.push(inserted.id)
  }

  return results
}
