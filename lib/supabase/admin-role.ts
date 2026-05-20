const SUPABASE_APP_ADMIN_ROLE = 'admin'

/** User Settings App Role Source */
interface UserSettingsAppRoleSource {
  /** Application Role */
  app_role?: string | null
}

/**
 * Get User Settings App Role
 *
 * Reads Archivist's application-level role from a `user_settings` projection.
 * This is intentionally separate from Supabase Auth's `user.role`, which is
 * the PostgREST database role claim.
 *
 * @param settings User Settings Projection
 * @returns Application Role
 */
export function getUserSettingsAppRole(
  settings: UserSettingsAppRoleSource | null | undefined
): string | null {
  const role = settings?.app_role

  return typeof role === 'string' ? role : null
}

/**
 * Is User Settings Admin
 *
 * Checks whether a `user_settings` projection has Archivist's application
 * admin role.
 *
 * @param settings User Settings Projection
 * @returns Whether the user is an application admin
 */
export function isUserSettingsAdmin(
  settings: UserSettingsAppRoleSource | null | undefined
): boolean {
  return getUserSettingsAppRole(settings) === SUPABASE_APP_ADMIN_ROLE
}
