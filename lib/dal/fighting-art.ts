import { TablesInsert } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { FightingArtDetail } from '@/lib/types'

/**
 * Get Fighting Arts
 *
 * Retrieves all fighting arts available to the authenticated user:
 * - Built-in (non-custom) fighting arts
 * - Custom fighting arts owned by the user
 * - Custom fighting arts shared with the user
 *
 * @returns Fighting Arts
 */
export async function getFightingArts(): Promise<{
  [key: string]: FightingArtDetail
}> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    supabase
      .from('fighting_art')
      .select('id, fighting_art_name')
      .eq('custom', false),
    supabase
      .from('fighting_art')
      .select('id, fighting_art_name')
      .eq('custom', true)
      .eq('user_id', user.id),
    supabase
      .from('fighting_art_shared_user')
      .select('fighting_art(id, fighting_art_name)')
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Fighting Arts: ${result.error.message}`)

  const fightingArtMap: { [key: string]: FightingArtDetail } = {}

  for (const f of nonCustomResult.data ?? []) fightingArtMap[f.id] = f
  for (const f of userCustomResult.data ?? []) fightingArtMap[f.id] = f
  for (const row of sharedResult.data ?? [])
    fightingArtMap[row.fighting_art[0].id] = row.fighting_art[0]

  return fightingArtMap
}

/**
 * Add Fighting Art
 *
 * Adds a new fighting art record to the database.
 *
 * @param fightingArt Fighting Art Data
 * @returns Inserted Fighting Art
 */
export async function addFightingArt(
  fightingArt: Omit<
    TablesInsert<'fighting_art'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<FightingArtDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('fighting_art')
    .insert(fightingArt)
    .select('id, fighting_art_name')
    .single()

  if (error) throw new Error(`Error Adding Fighting Art: ${error.message}`)

  return data
}
