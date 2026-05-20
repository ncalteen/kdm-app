import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

const useLocalMock = vi.fn()

vi.mock('@/contexts/local-context', () => ({
  useLocal: () => useLocalMock()
}))

vi.mock('@/lib/admin-users', () => ({
  deleteAdminUser: vi.fn(),
  getAdminUsers: vi.fn(),
  sendAdminUserPasswordReset: vi.fn()
}))

import { AdminUserManagementCard } from '@/components/settings/admin-user-management-card'

afterEach(() => {
  useLocalMock.mockReset()
})

describe('AdminUserManagementCard', () => {
  it('renders nothing for non-admin users', () => {
    useLocalMock.mockReturnValue({ isAdmin: false })

    const html = renderToStaticMarkup(<AdminUserManagementCard />)

    expect(html).not.toContain('User Management')
  })

  it('renders the user management surface for Supabase admin users', () => {
    useLocalMock.mockReturnValue({ isAdmin: true })

    const html = renderToStaticMarkup(<AdminUserManagementCard />)

    expect(html).toContain('User Management')
    expect(html).toContain('Refresh')
    expect(html).toContain('Reading the user ledger...')
  })
})
