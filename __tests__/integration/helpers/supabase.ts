import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Integration-Test Supabase Helpers
 *
 * Wires a local Supabase stack (supabase start) for RLS policy tests.
 *
 * Required env (set in .env.test.local or shell):
 *   - SUPABASE_URL                  (e.g. http://127.0.0.1:54321)
 *   - SUPABASE_ANON_KEY             (local anon/publishable key)
 *   - SUPABASE_SERVICE_ROLE_KEY     (local service_role key)
 *
 * Get the local keys with: `supabase status`
 */

const URL = requireEnv('SUPABASE_URL')
const ANON_KEY = requireEnv('SUPABASE_ANON_KEY')
const SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

/**
 * Require Env
 *
 * @param name Env Var Name
 * @returns Env Var Value
 */
function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v)
    throw new Error(
      `Missing ${name}. Run \`supabase start\` and export keys from \`supabase status\`.`
    )
  return v
}

/**
 * Admin Client
 *
 * Bypasses RLS. Use ONLY for fixture setup/teardown (creating users, wiping
 * tables). Never expose in app code.
 */
export const admin: SupabaseClient = createClient(URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

/**
 * Test User Record
 */
export interface TestUser {
  /** User ID */
  id: string
  /** User Email */
  email: string
  /** User Password */
  password: string
  /** Authenticated Client (Anon key + User's JWT) */
  client: SupabaseClient
}

/**
 * Create Test User
 *
 * Creates a confirmed user and returns an anon-key client signed in as them.
 * The returned client exercises the exact same RLS codepath as the browser.
 *
 * @returns Test User
 */
export async function createTestUser(): Promise<TestUser> {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const email = `rls-${suffix}@test.local`
  const password = `password-${suffix}`

  const { data: created, error: createErr } = await admin.auth.admin.createUser(
    {
      email,
      password,
      email_confirm: true
    }
  )
  if (createErr || !created.user)
    throw new Error(`createUser failed: ${createErr?.message}`)

  const client = createClient(URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const { error: signInErr } = await client.auth.signInWithPassword({
    email,
    password
  })
  if (signInErr) throw new Error(`signIn failed: ${signInErr.message}`)

  return { id: created.user.id, email, password, client }
}

/**
 * Delete Test User
 *
 * Cascades to the user's data via the existing FK / auth triggers.
 *
 * @param userId User ID
 */
export async function deleteTestUser(userId: string): Promise<void> {
  await admin.auth.admin.deleteUser(userId)
}

/**
 * Create Settlement (as admin)
 *
 * Seeds a settlement owned by `userId`. Uses the admin client so tests don't
 * depend on the DAL's own create path.
 *
 * @param userId Owner User ID
 * @param name Settlement Name
 * @returns Settlement ID
 */
export async function seedSettlement(
  userId: string,
  name = 'RLS Test Settlement'
): Promise<string> {
  const { data, error } = await admin
    .from('settlement')
    .insert({
      user_id: userId,
      settlement_name: name,
      campaign_type: 'PEOPLE_OF_THE_LANTERN',
      survivor_type: 'CORE',
      current_year: 0,
      survival_limit: 1,
      uses_scouts: false,
      arrival_bonuses: [],
      departing_bonuses: [],
      monster_volumes: [],
      lantern_research: 0,
      notes: ''
    })
    .select('id')
    .single()

  if (error || !data) throw new Error(`seedSettlement: ${error?.message}`)
  return data.id
}

/**
 * Share Settlement
 *
 * Grants `sharedUserId` access to `settlementId` via the shared-user table.
 *
 * @param settlementId Settlement ID
 * @param sharedUserId Shared User ID
 */
export async function shareSettlement(
  settlementId: string,
  sharedUserId: string
): Promise<void> {
  const { error } = await admin
    .from('settlement_shared_user')
    .insert({ settlement_id: settlementId, shared_user_id: sharedUserId })
  if (error) throw new Error(`shareSettlement: ${error.message}`)
}
