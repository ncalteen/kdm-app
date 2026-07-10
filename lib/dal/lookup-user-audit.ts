import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { LookupUserAuditDetail } from '@/lib/types'

export const LOOKUP_USER_AUDIT_SELECT = `
  attempted_at,
  user_id
`

type LookupUserAuditKey = Pick<
  TablesInsert<'lookup_user_audit'>,
  'attempted_at' | 'user_id'
>

/**
 * Get Lookup User Audits
 *
 * Retrieves all lookup user audit rows.
 *
 * @returns Lookup User Audits
 */
export async function getLookupUserAudits(): Promise<LookupUserAuditDetail[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('lookup_user_audit')
    .select(LOOKUP_USER_AUDIT_SELECT)
    .order('attempted_at')

  if (error)
    throw new Error(`Error Fetching Lookup User Audits: ${error.message}`)

  return (data ?? []) as LookupUserAuditDetail[]
}

/**
 * Get Lookup User Audit
 *
 * Retrieves a single lookup user audit row by key.
 *
 * @param key Lookup User Audit Key
 * @returns Lookup User Audit or null
 */
export async function getLookupUserAudit(
  key: LookupUserAuditKey
): Promise<LookupUserAuditDetail | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('lookup_user_audit')
    .select(LOOKUP_USER_AUDIT_SELECT)
    .eq('attempted_at', key.attempted_at)
    .eq('user_id', key.user_id)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Lookup User Audit: ${error.message}`)

  return data as LookupUserAuditDetail | null
}

/**
 * Add Lookup User Audit
 *
 * Adds a new lookup user audit record to the database.
 *
 * @param lookupUserAudit Lookup User Audit Data
 * @returns Inserted Lookup User Audit
 */
export async function addLookupUserAudit(
  lookupUserAudit: TablesInsert<'lookup_user_audit'>
): Promise<LookupUserAuditDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'lookup_user_audit'> = { ...lookupUserAudit }

  const { data, error } = await supabase
    .from('lookup_user_audit')
    .insert(insertData)
    .select(LOOKUP_USER_AUDIT_SELECT)
    .single()

  if (error) throw new Error(`Error Adding Lookup User Audit: ${error.message}`)

  return data as LookupUserAuditDetail
}

/**
 * Update Lookup User Audit
 *
 * Updates an existing lookup user audit record.
 *
 * @param key Lookup User Audit Key
 * @param lookupUserAudit Lookup User Audit Data
 */
export async function updateLookupUserAudit(
  key: LookupUserAuditKey,
  lookupUserAudit: Omit<
    TablesUpdate<'lookup_user_audit'>,
    keyof LookupUserAuditKey
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'lookup_user_audit'> = { ...lookupUserAudit }

  delete updateData.attempted_at
  delete updateData.user_id

  const { error } = await supabase
    .from('lookup_user_audit')
    .update(updateData)
    .eq('attempted_at', key.attempted_at)
    .eq('user_id', key.user_id)

  if (error)
    throw new Error(`Error Updating Lookup User Audit: ${error.message}`)
}

/**
 * Remove Lookup User Audit
 *
 * Deletes a lookup user audit record from the database.
 *
 * @param key Lookup User Audit Key
 */
export async function removeLookupUserAudit(
  key: LookupUserAuditKey
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('lookup_user_audit')
    .delete()
    .eq('attempted_at', key.attempted_at)
    .eq('user_id', key.user_id)

  if (error)
    throw new Error(`Error Removing Lookup User Audit: ${error.message}`)
}
