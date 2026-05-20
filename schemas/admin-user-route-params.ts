import { z } from 'zod'

/**
 * Admin User Route Params Schema
 *
 * Validates the dynamic `userId` route segment used by admin user-management
 * endpoints.
 */
export const AdminUserRouteParamsSchema = z.object({
  /** User ID */
  userId: z.string().uuid('User ID must be a valid id.')
})

/**
 * Admin User Route Params
 */
export type AdminUserRouteParams = z.infer<typeof AdminUserRouteParamsSchema>
