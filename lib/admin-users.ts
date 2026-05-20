/**
 * Admin User List Entry
 *
 * Lightweight, client-safe projection of Supabase Auth users for the admin user
 * management table. Values come from `auth.users` via the server-side Auth
 * Admin API.
 */
export interface AdminUserListEntry {
  /** User ID */
  id: string
  /** Email Address */
  email: string | null
  /** Phone Number */
  phone: string | null
  /** Auth Role */
  role: string | null
  /** Auth Providers */
  providers: string[]
  /** Created At */
  created_at: string | null
  /** Last Sign-In At */
  last_sign_in_at: string | null
  /** Email Confirmed At */
  email_confirmed_at: string | null
  /** Banned Until */
  banned_until: string | null
}

/**
 * Admin Users Response
 */
export interface AdminUsersResponse {
  /** Users */
  users: AdminUserListEntry[]
}

/**
 * Get Admin Users
 *
 * Fetches the Auth user list from the protected admin endpoint.
 *
 * @returns Admin Users
 */
export async function getAdminUsers(): Promise<AdminUserListEntry[]> {
  const response = await fetch('/api/admin/users')

  if (!response.ok) {
    const message = await extractErrorMessage(response)

    throw new Error(`Error Fetching Admin Users: ${message}`)
  }

  const body = (await response.json()) as Partial<AdminUsersResponse>

  return body.users ?? []
}

/**
 * Delete Admin User
 *
 * Deletes an Auth user through the protected admin endpoint.
 *
 * @param userId User ID
 */
export async function deleteAdminUser(userId: string): Promise<void> {
  const response = await fetch(
    `/api/admin/users/${encodeURIComponent(userId)}`,
    {
      method: 'DELETE'
    }
  )

  if (!response.ok) {
    const message = await extractErrorMessage(response)

    throw new Error(`Error Deleting Admin User: ${message}`)
  }
}

/**
 * Send Admin User Password Reset
 *
 * Triggers a password reset email for an Auth user through the protected admin
 * endpoint.
 *
 * @param userId User ID
 */
export async function sendAdminUserPasswordReset(
  userId: string
): Promise<void> {
  const response = await fetch(
    `/api/admin/users/${encodeURIComponent(userId)}/password-reset`,
    { method: 'POST' }
  )

  if (!response.ok) {
    const message = await extractErrorMessage(response)

    throw new Error(`Error Sending Password Reset: ${message}`)
  }
}

/**
 * Extract Error Message
 *
 * Pulls a human-readable message out of an error JSON body returned by admin
 * routes. Falls back to the HTTP status text when the body cannot be parsed.
 *
 * @param response Non-OK Fetch Response
 * @returns Error Message
 */
async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string }

    if (body.error) return body.error
  } catch {
    // Body was not valid JSON — fall through to statusText.
  }

  return response.statusText || `Request failed (${response.status})`
}
