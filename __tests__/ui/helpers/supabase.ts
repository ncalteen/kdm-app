import {
  createClient,
  type SupabaseClient,
  type User
} from '@supabase/supabase-js'

const SUPABASE_URL = requireEnv('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

/**
 * Supabase Admin Client
 *
 * Service-role client used only by UI tests for fixture setup, verification,
 * and teardown. Browser actions still exercise the public app client.
 */
export const admin: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false }
  }
)

/** Confirmed User Fixture */
export interface ConfirmedUserFixture {
  /** Email Address */
  email: string
  /** Password */
  password: string
  /** Username */
  username: string
}

/**
 * Require Environment Variable
 *
 * @param name Environment Variable Name
 * @returns The value of the environment variable
 */
function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name}; run tests via npm run ui-test.`)
  return value
}

/**
 * Create Confirmed User Fixture
 *
 * Creates a confirmed auth user plus the rows the application expects a fully
 * provisioned user to have.
 *
 * @param fixture User Fixture Data
 * @returns Created Auth User
 */
export async function createConfirmedUserFixture(
  fixture: ConfirmedUserFixture
): Promise<User> {
  const { data, error } = await admin.auth.admin.createUser({
    email: fixture.email,
    password: fixture.password,
    email_confirm: true
  })

  if (error || !data.user)
    throw new Error(`createUser failed: ${error?.message}`)

  const { error: settingsError } = await admin.from('user_settings').insert({
    user_id: data.user.id,
    username: fixture.username
  })

  if (settingsError)
    throw new Error(`seed user_settings failed: ${settingsError.message}`)

  const { error: subscriptionError } = await admin
    .from('user_subscription')
    .insert({ user_id: data.user.id, plan_id: 'free' })

  if (subscriptionError)
    throw new Error(
      `seed user_subscription failed: ${subscriptionError.message}`
    )

  return data.user
}

/**
 * Find Auth User By Email
 *
 * @param email Email Address
 * @returns Matching Auth User Or Null
 */
export async function findAuthUserByEmail(email: string): Promise<User | null> {
  let page = 1
  const perPage = 1000

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) throw new Error(`listUsers failed: ${error.message}`)

    const user = data.users.find((candidate) => candidate.email === email)
    if (user) return user
    if (data.users.length < perPage) return null

    page += 1
  }
}

/**
 * Wait For Auth User By Email
 *
 * @param email Email Address
 * @returns Matching Auth User
 */
export async function waitForAuthUserByEmail(email: string): Promise<User> {
  const timeoutAt = Date.now() + 10_000

  while (Date.now() < timeoutAt) {
    const user = await findAuthUserByEmail(email)
    if (user) return user
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`Timed out waiting for auth user ${email}`)
}

/**
 * Delete Users By Email
 *
 * Removes test auth users and lets database foreign keys cascade their rows.
 *
 * @param emails Email Addresses
 */
export async function deleteUsersByEmail(
  emails: Iterable<string>
): Promise<void> {
  const remainingEmails = new Set(emails)
  if (remainingEmails.size === 0) return

  const userIdsToDelete: string[] = []

  let page = 1
  const perPage = 1000

  while (remainingEmails.size > 0) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) throw new Error(`listUsers failed: ${error.message}`)

    for (const user of data.users) {
      if (!user.email || !remainingEmails.has(user.email)) continue
      userIdsToDelete.push(user.id)
      remainingEmails.delete(user.email)
    }

    if (data.users.length < perPage) break
    page += 1
  }

  for (const userId of userIdsToDelete) {
    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) throw new Error(`deleteUser failed: ${error.message}`)
  }
}
