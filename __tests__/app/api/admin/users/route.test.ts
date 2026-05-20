import { beforeEach, describe, expect, it, vi } from 'vitest'

// Stub `server-only`. Its real module body throws when loaded outside the
// React Server Component bundle, which would block Vitest from importing the
// route under test.
vi.mock('server-only', () => ({}))

const { mockGetUser, mockCreateClient } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockCreateClient: vi.fn()
}))

const {
  mockListUsers,
  mockDeleteUser,
  mockGetUserById,
  mockResetPasswordForEmail,
  mockCreateAdminClient
} = vi.hoisted(() => ({
  mockListUsers: vi.fn(),
  mockDeleteUser: vi.fn(),
  mockGetUserById: vi.fn(),
  mockResetPasswordForEmail: vi.fn(),
  mockCreateAdminClient: vi.fn()
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: mockCreateAdminClient
}))

import { NextRequest } from 'next/server'

const usersRoute = await import('@/app/api/admin/users/route')
const deleteUserRoute = await import('@/app/api/admin/users/[userId]/route')
const passwordResetRoute =
  await import('@/app/api/admin/users/[userId]/password-reset/route')

const adminUserId = '11111111-1111-4111-8111-111111111111'
const targetUserId = '22222222-2222-4222-8222-222222222222'

/**
 * Build Request
 *
 * @param path Request Path
 * @param method Request Method
 * @returns Next Request
 */
function buildRequest(path: string, method: string): NextRequest {
  return new NextRequest(`https://archivist.test${path}`, { method })
}

/**
 * Build Route Context
 *
 * @param userId User ID
 * @returns Route Context
 */
function buildContext(userId: string) {
  return { params: Promise.resolve({ userId }) }
}

/**
 * Wire the user-scoped Supabase client mock with the supplied auth state.
 */
function setupAuth(options: {
  user: { id: string; role: string } | null
  authError?: { message: string } | null
}) {
  mockGetUser.mockResolvedValue({
    data: { user: options.user },
    error: options.authError ?? null
  })

  mockCreateClient.mockResolvedValue({
    auth: { getUser: mockGetUser }
  })
}

/**
 * Wire the service-role Auth Admin mock.
 */
function setupAdminClient() {
  mockCreateAdminClient.mockReturnValue({
    auth: {
      admin: {
        listUsers: mockListUsers,
        deleteUser: mockDeleteUser,
        getUserById: mockGetUserById
      },
      resetPasswordForEmail: mockResetPasswordForEmail
    }
  })
}

describe('admin users API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.NEXT_PUBLIC_SITE_URL
    setupAdminClient()
  })

  it('blocks non-admin callers from listing users', async () => {
    setupAuth({ user: { id: targetUserId, role: 'authenticated' } })

    const response = await usersRoute.GET()
    const json = await response.json()

    expect(response.status).toBe(403)
    expect(json.error).toBe('Forbidden')
    expect(mockCreateAdminClient).not.toHaveBeenCalled()
    expect(mockListUsers).not.toHaveBeenCalled()
  })

  it('lists Auth users for admin callers', async () => {
    setupAuth({ user: { id: adminUserId, role: 'admin' } })
    mockListUsers.mockResolvedValue({
      data: {
        users: [
          {
            id: targetUserId,
            email: 'survivor@archivist.test',
            phone: null,
            role: 'authenticated',
            app_metadata: { providers: ['email'] },
            created_at: '2026-05-20T00:00:00.000Z',
            last_sign_in_at: '2026-05-20T01:00:00.000Z',
            email_confirmed_at: '2026-05-20T00:05:00.000Z',
            banned_until: null
          }
        ]
      },
      error: null
    })

    const response = await usersRoute.GET()
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.users).toEqual([
      {
        id: targetUserId,
        email: 'survivor@archivist.test',
        phone: null,
        role: 'authenticated',
        providers: ['email'],
        created_at: '2026-05-20T00:00:00.000Z',
        last_sign_in_at: '2026-05-20T01:00:00.000Z',
        email_confirmed_at: '2026-05-20T00:05:00.000Z',
        banned_until: null
      }
    ])
    expect(mockListUsers).toHaveBeenCalledWith({ page: 1, perPage: 1000 })
  })

  it('refuses to delete the current admin user', async () => {
    setupAuth({ user: { id: adminUserId, role: 'admin' } })

    const response = await deleteUserRoute.DELETE(
      buildRequest(`/api/admin/users/${adminUserId}`, 'DELETE'),
      buildContext(adminUserId)
    )
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toMatch(/cannot delete their own account/i)
    expect(mockDeleteUser).not.toHaveBeenCalled()
  })

  it('deletes another Auth user for admin callers', async () => {
    setupAuth({ user: { id: adminUserId, role: 'admin' } })
    mockDeleteUser.mockResolvedValue({ data: { user: {} }, error: null })

    const response = await deleteUserRoute.DELETE(
      buildRequest(`/api/admin/users/${targetUserId}`, 'DELETE'),
      buildContext(targetUserId)
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.ok).toBe(true)
    expect(mockDeleteUser).toHaveBeenCalledWith(targetUserId)
  })

  it('sends password reset email for another Auth user', async () => {
    setupAuth({ user: { id: adminUserId, role: 'admin' } })
    mockGetUserById.mockResolvedValue({
      data: { user: { id: targetUserId, email: 'survivor@archivist.test' } },
      error: null
    })
    mockResetPasswordForEmail.mockResolvedValue({ data: {}, error: null })

    const response = await passwordResetRoute.POST(
      buildRequest(`/api/admin/users/${targetUserId}/password-reset`, 'POST'),
      buildContext(targetUserId)
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.ok).toBe(true)
    expect(mockGetUserById).toHaveBeenCalledWith(targetUserId)
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      'survivor@archivist.test',
      { redirectTo: 'https://archivist.test/auth/update-password' }
    )
  })
})
